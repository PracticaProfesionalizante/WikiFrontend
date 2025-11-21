<template>
  <div class="flex min-h-screen bg-white dark:bg-slate-900">
    <SidebarMenu @sidebar-toggle="handleSidebarToggle" />
    <AppHeader :sidebar-expanded="sidebarExpanded" />

    <main :class="['pt-20 flex-1 transition-all duration-300', sidebarExpanded ? 'ml-0 md:ml-[280px]' : 'ml-0 md:ml-20']">
      <div class="p-8 max-w-[1400px] mx-auto">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="flex items-center justify-center gap-3 text-4xl font-bold m-0 mb-4 text-slate-900 dark:text-slate-100">
            <i class="fas fa-bars text-blue-600"></i>
            Gestión de Menús
          </h1>
          <p class="m-0 text-slate-600 dark:text-slate-400">
            Crea y administra los menús de la aplicación de forma fácil y visual
          </p>
        </div>

        <!-- Barra de acciones centrada y mejorada -->
        <div class="flex justify-center mb-6">
          <div class="flex items-center gap-3">
            <button
              class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-blue-700 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="openDialog"
              :disabled="isLoading"
              title="Crear un nuevo menú principal o submenú"
            >
              <i class="fas fa-plus-circle"></i>
              Crear Nuevo Menú
            </button>
            <button
              class="inline-flex items-center gap-2 rounded-xl bg-slate-200 px-6 py-3 text-sm font-semibold text-slate-800 shadow transition hover:bg-slate-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
              @click="loadMenus"
              :disabled="isLoading"
              title="Actualizar lista de menús"
            >
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
              Actualizar
            </button>
          </div>
        </div>

        <!-- Indicador de carga -->
        <div v-if="isLoading" class="flex items-center justify-center gap-3 mb-6">
          <i class="fas fa-spinner fa-spin text-blue-600 text-xl"></i>
          <span v-if="!isCreatingSubmenus" class="text-slate-600 dark:text-slate-400">Cargando menús...</span>
          <span v-else class="text-slate-600 dark:text-slate-400">
            Creando submenús... ({{ submenuProgress.current }}/{{ submenuProgress.total }})
          </span>
        </div>

        <!-- Mensaje de error -->
        <div v-if="error" class="flex items-center gap-3 mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/40 dark:bg-red-900/30 dark:text-red-200">
          <i class="fas fa-exclamation-circle"></i>
          <span class="flex-1">{{ error }}</span>
          <button @click="loadMenus" class="rounded bg-red-600 px-3 py-1.5 text-white text-xs font-medium hover:bg-red-700" title="Volver a cargar la lista de menús">
            <i class="fas fa-sync-alt"></i>
            Reintentar
          </button>
        </div>

        <!-- Controles de vista -->
        <div v-if="!isLoading" class="flex justify-center mb-6">
          <div class="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              class="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition"
              :class="viewMode === 'grid' ? 'bg-white text-blue-600 shadow dark:bg-slate-700 dark:text-blue-400' : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'"
              @click="viewMode = 'grid'"
              title="Cambiar a vista de tarjetas - Muestra los menús en formato de tarjetas con información detallada"
            >
              <i class="fas fa-th"></i>
              Vista de Tarjetas
            </button>
            <button
              class="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition"
              :class="viewMode === 'tree' ? 'bg-white text-blue-600 shadow dark:bg-slate-700 dark:text-blue-400' : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'"
              @click="viewMode = 'tree'"
              title="Cambiar a vista de árbol - Muestra los menús en estructura jerárquica con relaciones padre-hijo"
            >
              <i class="fas fa-sitemap"></i>
              Vista de Árbol
            </button>
          </div>
        </div>

        <!-- Vista de tarjetas (original) -->
        <transition name="fade-slide" mode="out-in">
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" v-if="!isLoading && viewMode === 'grid'" key="grid">
            <div
              v-for="menu in filteredMenus"
              :key="menu.id"
              class="rounded-xl border bg-white p-6 shadow transition hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
              :class="{
                'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20': menu.parentId,
              }"
            >
              <div class="mb-4">
                <div class="mb-4 flex items-start gap-4">
                  <div class="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <i :class="['fas', menu.icon || 'fa-circle']"></i>
                </div>
                  <div class="flex-1">
                    <div class="mb-2 flex items-start justify-between">
                      <h3 class="m-0 text-lg font-bold text-slate-900 dark:text-slate-100">{{ menu.name }}</h3>
                      <div class="ml-2 flex gap-1">
                        <span v-if="menu.parentId" class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                        <i class="fas fa-arrow-right"></i>
                        Submenú
                      </span>
                        <span v-if="getMenuChildren(menu.id).length > 0" class="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
                        <i class="fas fa-folder"></i>
                        {{ getMenuChildren(menu.id).length }} hijos
                      </span>
                    </div>
                  </div>
                    <p class="m-0 text-sm text-slate-600 dark:text-slate-400">{{ menu.path }}</p>
                    <div class="mt-2 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>Orden: {{ menu.order }}</span>
                      <span v-if="menu.parentId" class="inline-flex items-center gap-1">
                      <i class="fas fa-arrow-up"></i>
                      Padre: {{ getParentMenuName(menu.parentId) }}
                    </span>
                    </div>
                    <div class="mt-2 flex flex-wrap gap-1">
                      <span
                        v-for="role in menu.roles"
                        :key="role"
                        class="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                      >
                        {{ getRoleLabel(role) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
                <button
                  v-if="!menu.parentId"
                  class="flex-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 transition hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30"
                  @click="createSubmenu(menu)"
                  title="Agregar submenú"
                >
                  <i class="fas fa-plus"></i>
                  Submenú
                </button>
                <button class="rounded-lg bg-green-50 px-3 py-2 text-green-700 transition hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30" @click="editMenu(menu)" title="Editar menú">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="rounded-lg bg-red-50 px-3 py-2 text-red-700 transition hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30" @click="deleteMenu(menu.id)" title="Eliminar menú">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          </div>
        </transition>

        <!-- Vista de árbol jerárquico -->
        <transition name="fade-slide" mode="out-in">
          <div
            class="rounded-xl border bg-white p-4 sm:p-6 shadow dark:border-slate-700 dark:bg-slate-800 space-y-6"
            v-if="!isLoading && viewMode === 'tree'"
            key="tree"
          >
            <!-- Sección de ayuda y buscador -->
            <div class="space-y-6">
              <!-- Sección de ayuda -->
              <div class="space-y-4">
                <button
                  class="flex w-full items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-left text-slate-900 transition hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/20 dark:text-slate-100 dark:hover:bg-blue-900/30"
                  @click="showHelp = !showHelp"
                  title="Mostrar/ocultar guía de ayuda para nuevos usuarios"
                >
                  <div class="flex items-center gap-2">
                    <i class="fas fa-question-circle text-blue-600"></i>
                    <span class="font-semibold">{{ showHelp ? 'Ocultar' : 'Mostrar' }} Guía de Uso</span>
                  </div>
                  <i :class="showHelp ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                </button>

                <div v-if="showHelp" class="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900/50">
                  <!-- Título y descripción principal -->
                  <div class="mb-6 text-center">
                    <h3 class="mb-2 flex items-center justify-center gap-2 text-xl font-bold text-slate-900 dark:text-slate-100">
                      <i class="fas fa-book-open text-blue-600"></i>
                      Guía de Gestión de Menús
                    </h3>
                    <p class="m-0 text-slate-600 dark:text-slate-400">
                      Aprende a usar todas las funcionalidades disponibles para gestionar la
                      estructura de menús de tu aplicación de manera eficiente.
                    </p>
                  </div>

                  <!-- Funcionalidades organizadas por categorías -->
                  <div class="grid gap-6 sm:grid-cols-2">
                    <!-- Navegación y Visualización -->
                    <div>
                      <h4 class="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                        <i class="fas fa-eye text-blue-600"></i>
                        Navegación y Visualización
                      </h4>

                      <div class="space-y-4">
                        <div class="flex gap-3">
                          <div class="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                            <i class="fas fa-sitemap"></i>
                          </div>
                          <div class="flex-1">
                            <h5 class="m-0 mb-1 font-semibold text-slate-900 dark:text-slate-100">Vista de Árbol</h5>
                            <p class="m-0 text-sm text-slate-600 dark:text-slate-400">
                              Visualiza la estructura jerárquica completa de tus menús con
                              organización clara de niveles.
                            </p>
                          </div>
                        </div>

                        <div class="flex gap-3">
                          <div class="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                            <i class="fas fa-chevron-right"></i>
                          </div>
                          <div class="flex-1">
                            <h5 class="m-0 mb-1 font-semibold text-slate-900 dark:text-slate-100">Acordeón Inteligente</h5>
                            <p class="m-0 text-sm text-slate-600 dark:text-slate-400">
                              Los menús padre se contraen automáticamente para una vista más limpia.
                              Haz clic en las flechas para expandir y ver los submenús.
                            </p>
                          </div>
                        </div>

                        <div class="flex gap-3">
                          <div class="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                            <i class="fas fa-search"></i>
                          </div>
                          <div class="flex-1">
                            <h5 class="m-0 mb-1 font-semibold text-slate-900 dark:text-slate-100">Búsqueda Avanzada</h5>
                            <p class="m-0 text-sm text-slate-600 dark:text-slate-400">
                              Encuentra menús específicos por nombre o ruta. La búsqueda resalta los
                              términos encontrados y filtra resultados en tiempo real.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Gestión de Contenido -->
                    <div>
                      <h4 class="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                        <i class="fas fa-cog text-blue-600"></i>
                        Gestión de Contenido
                      </h4>

                      <div class="space-y-4">
                        <div class="flex gap-3">
                          <div class="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300">
                            <i class="fas fa-plus-circle"></i>
                          </div>
                          <div class="flex-1">
                            <h5 class="m-0 mb-1 font-semibold text-slate-900 dark:text-slate-100">Crear Menús y Submenús</h5>
                            <p class="m-0 text-sm text-slate-600 dark:text-slate-400">
                              Usa el botón "Crear Nuevo Menú" o el "+" junto a cualquier menú para
                              agregar nuevos elementos a la estructura.
                            </p>
                          </div>
                        </div>

                        <div class="flex gap-3">
                          <div class="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                            <i class="fas fa-edit"></i>
                          </div>
                          <div class="flex-1">
                            <h5 class="m-0 mb-1 font-semibold text-slate-900 dark:text-slate-100">Editar Propiedades</h5>
                            <p class="m-0 text-sm text-slate-600 dark:text-slate-400">
                              Modifica nombre, ruta, icono, orden y permisos de cualquier menú
                              usando el botón de edición.
                            </p>
                          </div>
                        </div>

                        <div class="flex gap-3">
                          <div class="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
                            <i class="fas fa-grip-vertical"></i>
                          </div>
                          <div class="flex-1">
                            <h5 class="m-0 mb-1 font-semibold text-slate-900 dark:text-slate-100">Reorganizar con Arrastrar y Soltar</h5>
                            <p class="m-0 text-sm text-slate-600 dark:text-slate-400">
                              Arrastra menús para cambiar su posición o convertirlos en submenús.
                              Las zonas de destino se resaltan automáticamente.
                            </p>
                          </div>
                        </div>

                        <div class="flex gap-3">
                          <div class="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300">
                            <i class="fas fa-trash-alt"></i>
                          </div>
                          <div class="flex-1">
                            <h5 class="m-0 mb-1 font-semibold text-slate-900 dark:text-slate-100">Eliminación Inteligente</h5>
                            <p class="m-0 text-sm text-slate-600 dark:text-slate-400">
                              Al eliminar menús con submenús, elige qué hacer: eliminar todo,
                              mantener submenús como principales, o seleccionar cuáles conservar.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Buscador -->
              <div class="space-y-2">
                <div class="relative">
                  <div class="relative">
                    <i class="fas fa-search pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input
                      type="text"
                      v-model="searchQuery"
                      placeholder="Buscar menús, submenús, rutas o roles..."
                      class="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pl-12 pr-12 text-slate-900 placeholder-slate-400 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                      @input="handleSearch"
                    />
                    <button
                      v-if="searchQuery"
                      @click="clearSearch"
                      class="absolute right-4 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-600 dark:hover:text-slate-200"
                      title="Limpiar búsqueda"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  <div v-if="searchQuery" class="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    <span class="font-medium">
                      {{ filteredHierarchicalMenus.length }} resultado{{
                        filteredHierarchicalMenus.length !== 1 ? 's' : ''
                      }}
                      encontrado{{ filteredHierarchicalMenus.length !== 1 ? 's' : '' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Contenedor del árbol -->
            <div class="rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50 overflow-x-auto">
              <div class="min-w-[320px] space-y-3 p-4 sm:p-6">
                <div v-if="filteredHierarchicalMenus.length === 0 && searchQuery" class="flex flex-col items-center justify-center py-12 text-center">
                  <i class="fas fa-search mb-4 text-4xl text-slate-400"></i>
                  <h3 class="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">No se encontraron menús</h3>
                  <p class="mb-4 text-slate-600 dark:text-slate-400">No hay menús que coincidan con "{{ searchQuery }}"</p>
                  <button @click="clearSearch" class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
                  <i class="fas fa-sync-alt"></i>
                  Mostrar todos los menús
                </button>
              </div>

                <template v-else>
              <MenuTreeNode
                v-for="rootMenu in filteredHierarchicalMenus"
                :key="rootMenu.id"
                :menu="rootMenu"
                :level="0"
                :all-menus="menus"
                :available-roles="availableRolesList"
                :search-query="searchQuery"
                @edit="editMenu"
                @delete="deleteMenu"
                @move="moveMenu"
                @create-submenu="createSubmenu"
              />
                </template>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </main>

        <!-- Modal de eliminación avanzada -->
        <DeleteMenuModal
          :show="showDeleteModal"
          :menu="menuToDelete"
          :children="menuToDeleteChildren"
          @close="closeDeleteModal"
          @confirm="handleDeleteConfirm"
        />

        <!-- Modal de creación/edición mejorado -->
        <div
          v-if="showDialog"
          class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
        <div class="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-xl flex flex-col" @click.stop tabindex="-1" ref="modalContent">
            <!-- Header del Wizard -->
          <div class="rounded-t-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
            <div class="flex items-start justify-between">
              <div class="flex items-start gap-4">
                <div class="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <i :class="isEditing ? 'fas fa-edit' : 'fas fa-plus'"></i>
                  </div>
                <div>
                  <h2 class="m-0 mb-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {{ isEditing ? 'Editar Menú' : 'Crear Nuevo Menú' }}
                    </h2>
                  <p class="m-0 text-sm text-slate-600 dark:text-slate-400">
                      {{
                        isEditing
                          ? 'Modifica la configuración del menú existente'
                          : 'Completa los datos para crear un nuevo menú'
                      }}
                    </p>
                  </div>
                </div>
              <button @click="closeDialog" class="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-slate-700 dark:hover:text-slate-100" :disabled="isSaving">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>

            <!-- Indicador de Pasos -->
          <div class="flex border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            <div
                v-for="(step, index) in wizardSteps"
                :key="step.id"
              class="flex-1 border-l border-slate-200 first:border-l-0 bg-white p-4 transition dark:border-slate-700 dark:bg-slate-800"
                :class="{
                'bg-blue-50 border-blue-500 dark:bg-blue-900/30 dark:border-blue-400': currentWizardStep === index + 1,
                'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400': currentWizardStep > index + 1,
                'text-slate-400 dark:text-slate-500': currentWizardStep < index + 1,
              }"
            >
              <div class="flex items-center gap-3">
                <div class="grid h-8 w-8 place-items-center rounded-full text-sm font-semibold transition"
                  :class="{
                    'bg-blue-600 text-white dark:bg-blue-500': currentWizardStep === index + 1,
                    'bg-green-600 text-white dark:bg-green-500': currentWizardStep > index + 1,
                    'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500': currentWizardStep < index + 1,
                  }"
                >
                  <i v-if="currentWizardStep > index + 1" class="fas fa-check"></i>
                  <span v-else>{{ index + 1 }}</span>
                </div>
                <div class="flex-1">
                  <h4 class="font-semibold">{{ step.title }}</h4>
                  <p class="text-sm opacity-75">{{ step.description }}</p>
                </div>
                </div>
              </div>
            </div>

            <!-- Contenido del Wizard -->
          <div class="flex-1 overflow-y-auto border border-t-0 border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
              <p id="modal-description" class="sr-only">
                Formulario para {{ isEditing ? 'editar' : 'crear' }} un elemento del menú. Complete
                los campos requeridos y presione guardar.
              </p>

            <form @submit.prevent="saveMenu" role="form" id="menu-form" class="space-y-6">
                <!-- Paso 1: Información Básica -->
                <div v-show="currentWizardStep === 1">
                  <div class="mb-6 text-center">
                    <h3 class="mb-2 flex items-center justify-center gap-2 text-xl font-bold text-slate-900 dark:text-slate-100">
                      <i class="fas fa-info-circle text-blue-600"></i>
                      Información Básica
                    </h3>
                    <p class="text-slate-600 dark:text-slate-400">Define el nombre, ruta y tipo de menú</p>
                  </div>

                  <div class="space-y-4">
                    <div>
                      <label for="menuName" class="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        <i class="fas fa-tag text-blue-600"></i>
                        Nombre del Menú *
                      </label>
                      <input
                        id="menuName"
                        v-model="menuForm.name"
                        type="text"
                        class="w-full rounded-lg border px-4 py-3 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                        :class="{
                          'border-red-500 focus:border-red-500 focus:ring-red-500/20': validationErrors.name,
                          'border-green-500': !validationErrors.name && menuForm.name.trim().length >= 3,
                        }"
                        placeholder="Ej: Gestión de Usuarios"
                        @input="generatePath"
                        maxlength="50"
                        required
                        ref="firstInput"
                      />
                      <div v-if="validationErrors.name" class="mt-1 flex items-center gap-2 text-sm text-red-600 dark:text-red-400" role="alert">
                        <i class="fas fa-exclamation-circle"></i>
                        {{ validationErrors.name }}
                      </div>
                      <div class="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <i class="fas fa-info-circle"></i>
                        Este será el nombre que aparecerá en el menú lateral
                      </div>
                    </div>

                    <div>
                      <label for="menuPath" class="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        <i class="fas fa-link text-blue-600"></i>
                        Ruta de Acceso *
                      </label>

                      <div v-if="menuForm.parentId" class="flex overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600">
                        <span class="bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          {{ menuForm.parentPath}}
                        </span>
                        <input
                          v-model="menuForm.path"
                          type="text"
                          class="w-full border-0 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition focus:bg-slate-50 dark:bg-slate-800 dark:text-slate-100"
                          placeholder="segmento-hijo"
                          @input="handlePathInput"
                          :class="{
                            'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300': validationErrors.path,
                            'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-200': !validationErrors.path && menuForm.path,
                          }"
                        />
                      </div>
                      <input
                        v-else
                        v-model="menuForm.path"
                        type="text"
                        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-blue-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                        placeholder="/ruta-del-menu"
                        @input="handlePathInput"
                        :class="{
                          'border-red-500 bg-red-50 text-red-600 dark:border-red-500 dark:bg-red-900/20 dark:text-red-300': validationErrors.path,
                          'border-emerald-500 bg-emerald-50 text-emerald-600 dark:border-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-200': !validationErrors.path && menuForm.path,
                        }"
                      />

                      <div v-if="validationErrors.path" class="mt-1 flex items-center gap-2 text-sm text-red-600 dark:text-red-400" role="alert">
                        <i class="fas fa-exclamation-circle"></i>
                        {{ validationErrors.path }}
                      </div>
                      <div class="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <i class="fas fa-info-circle"></i>
                        <span v-if="menuForm.parentId">
                          La parte del menú padre es fija, solo puedes editar la parte específica
                          del menú
                        </span>
                        <span v-else>
                          URL que se usará para acceder a esta vista (se genera automáticamente)
                        </span>
                      </div>
                    </div>

                    <div>
                      <label class="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        <i class="fas fa-list text-blue-600"></i>
                        Tipo de Menú
                      </label>
                      <div class="grid gap-4 sm:grid-cols-2">
                        <div
                          class="cursor-pointer rounded-xl border-2 p-4 transition"
                          :class="{ 'border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20': menuForm.parentId === null, 'border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500': menuForm.parentId !== null }"
                          @click="setMenuType('root')"
                          role="radio"
                          :aria-checked="menuForm.parentId === null"
                          tabindex="0"
                        >
                          <div class="flex items-start gap-3">
                            <div class="grid h-10 w-10 place-items-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                              <i class="fas fa-home"></i>
                            </div>
                            <div>
                              <div class="mb-1 font-semibold text-slate-900 dark:text-slate-100">Menú Principal</div>
                              <div class="text-xs text-slate-600 dark:text-slate-400">Aparece en el nivel raíz del menú lateral</div>
                            </div>
                          </div>
                        </div>
                        <div
                          class="cursor-pointer rounded-xl border-2 p-4 transition"
                          :class="{ 'border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20': menuForm.parentId !== null, 'border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500': menuForm.parentId === null }"
                          @click="setMenuType('submenu')"
                          role="radio"
                          :aria-checked="menuForm.parentId !== null"
                          tabindex="0"
                        >
                          <div class="flex items-start gap-3">
                            <div class="grid h-10 w-10 place-items-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                              <i class="fas fa-folder"></i>
                            </div>
                            <div>
                              <div class="mb-1 font-semibold text-slate-900 dark:text-slate-100">Submenú</div>
                              <div class="text-xs text-slate-600 dark:text-slate-400">Aparece dentro de otro menú como elemento hijo</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Selector de menú padre (solo si es submenú) -->
                    <div v-if="menuForm.parentId !== null">
                      <label class="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        <i class="fas fa-sitemap text-blue-600"></i>
                        Menú Padre *
                      </label>
                      <MenuTreeSelector
                        :menus="menus"
                        :selected-id="menuForm.parentId"
                        :excluded-id="isEditing ? menuForm.id : null"
                        @select="handleParentSelect"
                      />
                      <div v-if="validationErrors.parentId" class="mt-1 flex items-center gap-2 text-sm text-red-600 dark:text-red-400" role="alert">
                        <i class="fas fa-exclamation-circle"></i>
                        {{ validationErrors.parentId }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Paso 2: Apariencia -->
                <div v-show="currentWizardStep === 2">
                  <div class="mb-6 text-center">
                    <h3 class="mb-2 flex items-center justify-center gap-2 text-xl font-bold text-slate-900 dark:text-slate-100">
                      <i class="fas fa-palette text-blue-600"></i>
                      Apariencia
                    </h3>
                    <p class="text-slate-600 dark:text-slate-400">Selecciona el icono y tipo de vista para tu menú</p>
                  </div>

                  <div class="space-y-4">
                    <div>
                      <label class="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        <i class="fas fa-palette text-blue-600"></i>
                        Icono del Menú
                      </label>
                      <div>
                        <IconSelector v-model="menuForm.icon" @update:modelValue="validateForm" />
                      </div>
                      <div v-if="validationErrors.icon" class="mt-1 flex items-center gap-2 text-sm text-red-600 dark:text-red-400" role="alert">
                        <i class="fas fa-exclamation-circle"></i>
                        {{ validationErrors.icon }}
                      </div>
                    </div>

                    <div>
                      <label class="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        <i class="fas fa-desktop text-blue-600"></i>
                        Tipo de Contenido *
                      </label>
                      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div
                          v-for="template in viewTemplates"
                          :key="template.value"
                          class="cursor-pointer rounded-xl border-2 p-4 transition"
                          :class="{ 'border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20': menuForm.view === template.value, 'border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500': menuForm.view !== template.value }"
                          @click="selectTemplate(template.value)"
                          role="radio"
                          :aria-checked="menuForm.view === template.value"
                          tabindex="0"
                        >
                          <div class="mb-3 text-center">
                            <i :class="['fas', template.icon, 'mb-2 text-3xl', menuForm.view === template.value ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500']"></i>
                                </div>
                          <div>
                            <h4 class="mb-1 text-center font-semibold text-slate-900 dark:text-slate-100">{{ template.name }}</h4>
                            <p class="mb-2 text-center text-xs text-slate-600 dark:text-slate-400">{{ template.description }}</p>
                            <div class="flex flex-wrap gap-1 justify-center">
                              <span
                                v-for="feature in template.features"
                                :key="feature"
                                class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                              >
                                {{ feature }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div v-if="validationErrors.template" class="mt-1 flex items-center gap-2 text-sm text-red-600 dark:text-red-400" role="alert">
                        <i class="fas fa-exclamation-circle"></i>
                        {{ validationErrors.template }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Paso 3: Configuración -->
                <div v-show="currentWizardStep === 3">
                  <div class="mb-6 text-center">
                    <h3 class="mb-2 flex items-center justify-center gap-2 text-xl font-bold text-slate-900 dark:text-slate-100">
                      <i class="fas fa-cog text-blue-600"></i>
                      Configuración
                    </h3>
                    <p class="text-slate-600 dark:text-slate-400">Define permisos, posición y estado del menú</p>
                  </div>

                  <div class="space-y-4">
                    <div>
                      <label for="menuOrder" class="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        <i class="fas fa-sort-numeric-up text-blue-600"></i>
                        Posición en el menú
                      </label>
                      <select id="menuOrder" v-model.number="menuForm.order" class="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100">
                        <option
                          v-for="position in availablePositions"
                          :key="position.value"
                          :value="position.value"
                        >
                          {{ position.label }}
                        </option>
                      </select>
                      <div class="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <i class="fas fa-info-circle"></i>
                        {{
                          menuForm.parentId
                            ? 'Selecciona dónde colocar este elemento dentro del submenú'
                            : 'Selecciona dónde colocar este elemento en el menú principal'
                        }}
                      </div>
                    </div>

                    <div>
                      <label class="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        <i class="fas fa-users text-blue-600"></i>
                        Roles de Acceso *
                      </label>

                      <!-- Información sobre jerarquía de roles -->
                      <div class="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-200">
                        <i class="fas fa-info-circle"></i>
                        <span>Los roles siguen una jerarquía: Super Usuario > Administrador > Colaborador</span>
                      </div>

                      <!-- Rol Super Usuario siempre presente -->
                      <div class="mb-4">
                        <div class="rounded-xl border-2 border-green-400 bg-gradient-to-br from-green-50 to-green-100/50 p-4 dark:border-green-600 dark:from-green-900/20 dark:to-green-800/10">
                          <label class="flex cursor-not-allowed items-start gap-3">
                            <input
                              type="checkbox"
                              class="mt-1 h-5 w-5 cursor-not-allowed rounded border-slate-300 text-blue-600"
                              checked
                              disabled
                            />
                            <div class="flex-1">
                              <div class="flex items-center gap-2">
                                <i class="fas fa-user-star text-green-600"></i>
                                <span class="font-bold text-slate-900 dark:text-slate-100">Super Usuario</span>
                                <span class="rounded-full bg-green-600 px-2 py-0.5 text-xs font-semibold text-white">Siempre</span>
                              </div>
                              <p class="mt-1 text-xs text-slate-600 dark:text-slate-400">Acceso completo al sistema (siempre incluido)</p>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div class="space-y-2">
                        <div
                          v-for="role in availableRolesList"
                          :key="role.value"
                          class="rounded-lg border border-slate-200 p-3 transition dark:border-slate-700"
                          :class="{ 'bg-slate-50 dark:bg-slate-700/50': menuForm.roles.includes(role.value) }"
                        >
                          <label
                            class="flex cursor-pointer items-start gap-3"
                            :class="{ 'cursor-not-allowed opacity-60': isRoleDisabled(role.value) }"
                          >
                            <input
                              v-model="menuForm.roles"
                              :value="role.value"
                              type="checkbox"
                              class="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                              :id="`role-${role.value}`"
                              :disabled="isRoleDisabled(role.value)"
                              @change="handleRoleChange()"
                            />
                            <div class="flex-1">
                              <div class="flex items-center gap-2">
                                <i :class="['fas', role.icon]"></i>
                                <span class="font-semibold text-slate-900 dark:text-slate-100">{{ role.label }}</span>
                              <span
                                v-if="role.value === 'ROLE_SUPER_USER'"
                                  class="rounded-full bg-green-600 px-2 py-0.5 text-xs font-semibold text-white"
                              >
                                Máximo Privilegio
                              </span>
                              </div>
                              <p class="mt-1 text-xs text-slate-600 dark:text-slate-400">{{ role.description }}</p>
                            <div
                              v-if="
                                role.value === 'ROLE_SUPER_USER' &&
                                menuForm.roles.includes('ROLE_SUPER_USER')
                              "
                                class="mt-2 flex items-center gap-2 rounded border border-amber-300 bg-amber-50 px-2 py-1 text-xs text-amber-800 dark:border-amber-600 dark:bg-amber-900/20 dark:text-amber-200"
                            >
                                <i class="fas fa-shield-halved"></i>
                              Super Usuario tiene acceso completo, otros roles son redundantes
                            </div>
                          </div>
                          </label>
                        </div>
                      </div>

                      <div v-if="validationErrors.roles" class="mt-2 flex items-center gap-2 text-sm text-red-600 dark:text-red-400" role="alert">
                        <i class="fas fa-exclamation-circle"></i>
                        {{ validationErrors.roles }}
                      </div>

                      <!-- Resumen de roles seleccionados -->
                      <div v-if="menuForm.roles.length > 0" class="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <h5 class="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                          <i class="fas fa-check-circle text-green-600"></i>
                          Roles Seleccionados
                        </h5>
                        <div class="flex flex-wrap gap-2">
                          <div
                            v-for="role in getSelectedRolesInfo()"
                            :key="role.value"
                            class="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
                          >
                            <i :class="['fas', role.icon]"></i>
                            <span>{{ role.label }}</span>
                            <span v-if="role.value === 'ROLE_SUPER_USER'" class="ml-1 inline-flex items-center gap-1 rounded-full bg-green-600 px-2 py-0.5 text-white">
                              <i class="fas fa-crown"></i>
                              Máximo
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label class="flex cursor-pointer items-start gap-3">
                        <input
                          id="menuActive"
                          v-model="menuForm.isActive"
                          type="checkbox"
                          class="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <div>
                          <div class="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                          <i class="fas fa-check-circle"></i>
                          Menú activo
                          </div>
                          <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <i class="fas fa-info-circle"></i>
                        Los menús inactivos no aparecerán en la navegación
                          </p>
                      </div>
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Paso 4: Resumen -->
                <div v-show="currentWizardStep === 4">
                  <div class="mb-6 text-center">
                    <h3 class="mb-2 flex items-center justify-center gap-2 text-xl font-bold text-slate-900 dark:text-slate-100">
                      <i class="fas fa-eye text-blue-600"></i>
                      Resumen
                    </h3>
                    <p class="text-slate-600 dark:text-slate-400">Revisa la configuración antes de crear el menú</p>
                  </div>

                  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                      <h4 class="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        <i class="fas fa-info-circle text-blue-600"></i>
                        Información Básica
                      </h4>
                      <div class="space-y-2 text-sm">
                        <div class="flex justify-between border-b border-slate-200 pb-2 dark:border-slate-700">
                          <span class="font-medium text-slate-700 dark:text-slate-300">Nombre:</span>
                          <span class="text-slate-900 dark:text-slate-100">{{ menuForm.name || 'No especificado' }}</span>
                      </div>
                        <div class="flex justify-between border-b border-slate-200 pb-2 dark:border-slate-700">
                          <span class="font-medium text-slate-700 dark:text-slate-300">Ruta:</span>
                          <span class="text-slate-900 dark:text-slate-100">{{ currentFullMenuPath || 'No especificada' }}</span>
                      </div>
                        <div class="flex justify-between">
                          <span class="font-medium text-slate-700 dark:text-slate-300">Tipo:</span>
                          <span class="text-slate-900 dark:text-slate-100">{{
                          menuForm.parentId ? 'Submenú' : 'Menú Principal'
                        }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                      <h4 class="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        <i class="fas fa-palette text-blue-600"></i>
                        Apariencia
                      </h4>
                      <div class="space-y-2 text-sm">
                        <div class="flex justify-between border-b border-slate-200 pb-2 dark:border-slate-700">
                          <span class="font-medium text-slate-700 dark:text-slate-300">Icono:</span>
                          <span class="text-slate-900 dark:text-slate-100">
                            <i v-if="menuForm.icon" :class="['fas', menuForm.icon]"></i>
                          {{ menuForm.icon || 'No seleccionado' }}
                        </span>
                      </div>
                        <div class="flex justify-between">
                          <span class="font-medium text-slate-700 dark:text-slate-300">Vista:</span>
                          <span class="text-slate-900 dark:text-slate-100">{{ getTemplateName(menuForm.view) }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                      <h4 class="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        <i class="fas fa-cog text-blue-600"></i>
                        Configuración
                      </h4>
                      <div class="space-y-2 text-sm">
                        <div class="flex justify-between border-b border-slate-200 pb-2 dark:border-slate-700">
                          <span class="font-medium text-slate-700 dark:text-slate-300">Posición:</span>
                          <span class="text-slate-900 dark:text-slate-100">{{ getPositionLabel(menuForm.order) }}</span>
                      </div>
                        <div class="flex flex-col gap-2 border-b border-slate-200 pb-2 dark:border-slate-700">
                          <span class="font-medium text-slate-700 dark:text-slate-300">Roles:</span>
                          <div class="flex flex-wrap gap-1">
                            <span
                            v-for="role in getSelectedRolesInfo()"
                            :key="role.value"
                              class="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
                            >
                              <i :class="['fas', role.icon]"></i>
                              {{ role.label }}
                            </span>
                          </div>
                        </div>
                        <div class="flex justify-between">
                          <span class="font-medium text-slate-700 dark:text-slate-300">Estado:</span>
                          <span :class="menuForm.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">{{
                          menuForm.isActive ? 'Activo' : 'Inactivo'
                        }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <!-- Footer del Wizard -->
          <div class="rounded-b-xl border border-t-0 border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800">
              <!-- Indicador de progreso -->
            <div class="mb-4">
              <div class="mb-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                  class="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-300"
                    :style="{ width: `${(currentWizardStep / wizardSteps.length) * 100}%` }"
                  ></div>
                </div>
              <div class="text-center text-sm font-medium text-slate-600 dark:text-slate-400">
                Paso {{ currentWizardStep }} de {{ wizardSteps.length }}
              </div>
              </div>

              <!-- Botones de navegación -->
            <div class="flex flex-wrap items-center justify-between gap-3">
                <!-- Indicador de roles activos al editar -->
                <div
                  v-if="isEditing && menuForm.roles && menuForm.roles.length > 0"
                class="order-first w-full sm:order-none sm:w-auto"
                >
                <span class="text-xs font-medium text-slate-600 dark:text-slate-400">Roles activos:</span>
                <div class="mt-1 flex flex-wrap gap-1">
                    <div
                      v-for="role in getSelectedRolesInfo()"
                      :key="role.value"
                    class="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
                    >
                    <i :class="['fas', role.icon]"></i>
                      <span>{{ role.label }}</span>
                    </div>
                  </div>
                </div>

              <div class="flex items-center gap-2">
                <button
                  v-if="currentWizardStep > 1"
                  type="button"
                  @click="previousStep"
                  class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                >
                  <i class="fas fa-chevron-left"></i>
                  Anterior
                </button>

                <button
                  v-if="currentWizardStep < wizardSteps.length"
                  type="button"
                  @click="nextStep"
                  class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="!canProceedToNextStep"
                >
                  Siguiente
                  <i class="fas fa-chevron-right"></i>
                </button>

                <button
                  v-if="currentWizardStep === wizardSteps.length"
                  type="submit"
                  class="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="!validateForm()"
                  form="menu-form"
                >
                  <i class="fas fa-check"></i>
                  {{ isEditing ? 'Actualizar' : 'Crear' }} Menú
                </button>

                <button type="button" @click="closeDialog" class="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-700 dark:bg-slate-700 dark:text-red-400 dark:hover:bg-red-900/20">
                  <i class="fas fa-times"></i>
                  Cancelar
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Vista Previa -->
    <div v-if="showPreview" class="modal-overlay" @click="closePreview">
      <div class="preview-modal" @click.stop>
        <div class="preview-header">
          <h3>
            <i class="fas fa-eye"></i>
            Vista Previa del Menú
          </h3>
          <button @click="closePreview" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="preview-content">
          <!-- Simulación del menú en el sidebar -->
          <div class="sidebar-preview">
            <h4>Cómo se verá en el menú lateral:</h4>
            <div class="menu-item-preview">
              <i :class="['fas fas', previewMenu?.icon]"></i>
              <span>{{ previewMenu?.name }}</span>
            </div>
          </div>

          <!-- Información del menú -->
          <div class="menu-details">
            <h4>Detalles del menú:</h4>
            <div class="detail-item"><strong>Nombre:</strong> {{ previewMenu?.name }}</div>
            <div class="detail-item"><strong>Ruta:</strong> {{ previewMenu?.path }}</div>
            <div class="detail-item">
              <strong>Icono:</strong>
              <i :class="['fas fas', previewMenu?.icon]"></i>
              {{ previewMenu?.icon }}
            </div>
            <div class="detail-item">
              <strong>Plantilla:</strong>
              {{ viewTemplates.find((t) => t.value === previewMenu?.template)?.name }}
            </div>
            <div class="detail-item"><strong>Orden:</strong> {{ previewMenu?.order }}</div>
            <div class="detail-item">
              <strong>Estado:</strong>
              <span :class="previewMenu?.isActive ? 'status-active' : 'status-inactive'">
                {{ previewMenu?.isActive ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
          </div>
        </div>

        <div class="preview-actions">
          <button
            @click="closePreview"
            class="btn btn-secondary"
            title="Cerrar vista previa sin guardar cambios"
          >
            <i class="fas fa-times"></i>
            Cerrar
          </button>
          <button
            @click="saveAndClosePreview"
            class="btn btn-primary"
            title="Guardar el menú con la configuración actual"
          >
            <i class="fas fa-check"></i>
            Confirmar y Guardar
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de Progreso -->
  <ProgressModal
    :is-visible="showProgressModal"
    :title="progressModalTitle"
    :current="submenuProgress.current"
    :total="submenuProgress.total"
    :current-action="progressModalAction"
    :errors="progressErrors"
    :is-completed="!isCreatingSubmenus && submenuProgress.current >= submenuProgress.total"
    :allow-cancel="false"
    @close="closeProgressModal"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import SidebarMenu from '@/components/common/SidebarMenu.vue'
import AppHeader from '@/components/common/AppHeader.vue'
import MenuTreeNode from '@/components/menu/MenuTreeNode.vue'
import MenuTreeSelector from '@/components/menu/MenuTreeSelector.vue'
import DeleteMenuModal from '@/components/modals/DeleteMenuModal.vue'
import IconSelector from '@/components/common/IconSelector.vue'
import ProgressModal from '@/components/modals/ProgressModal.vue'
import menuService from '@/services/menuService'
import authService from '@/services/auth'

const authStore = useAuthStore()
const router = useRouter()

// Estado del sidebar
const sidebarExpanded = ref(false)
const handleSidebarToggle = (expanded) => {
  sidebarExpanded.value = expanded
}

// Estado del formulario
const showDialog = ref(false)
const isEditing = ref(false)
const editingMenuId = ref(null)
const currentStep = ref(1)
const currentWizardStep = ref(1)

// Configuración del wizard
const wizardSteps = ref([
  {
    id: 'basic',
    title: 'Información Básica',
    description: 'Nombre, ruta y tipo',
  },
  {
    id: 'appearance',
    title: 'Apariencia',
    description: 'Icono y vista',
  },
  {
    id: 'configuration',
    title: 'Configuración',
    description: 'Permisos y posición',
  },
  {
    id: 'summary',
    title: 'Resumen',
    description: 'Revisar y confirmar',
  },
])
const menuForm = ref({
  name: '',
  parentPath: '',
  path: '',
  icon: '',
  view: 'basic',
  order: 1,
  parentId: null,
  roles: [],
  isActive: true,
  createSubmenus: false,
  submenus: [],
})

const currentFullMenuPath = computed(() => {
  if (menuForm.value.parentId) {
    // const parentPath = getParentPath(menuForm.value.parentId)
    return  menuForm.value.parentPath + normalizePath(menuForm.value.path)
  }

  return menuForm.value.path || '/'
})

// Watcher para actualizar el orden cuando cambie el parentId
watch(
  () => menuForm.value.parentId,
  () => {
    if (!isEditing.value) {
      nextTick(() => {
        if (availablePositions.value.length > 0) {
          menuForm.value.order = availablePositions.value[0].value
        }
      })
    }
  },
)

// Estado de validaciones mejorado
const validationErrors = ref({})
const isValidating = ref(false)
let validationTimeout = null

// Estado de vista previa
const showPreview = ref(false)
const previewMenu = ref(null)

// Estado de carga y errores
const isLoading = ref(false)
const isSaving = ref(false)
const isCreatingSubmenus = ref(false)
const submenuProgress = ref({ current: 0, total: 0 })
const error = ref(null)

// Estado del modal de progreso
const showProgressModal = ref(false)
const progressModalTitle = ref('Creando menú...')
const progressModalAction = ref('Iniciando proceso...')
const progressErrors = ref([])

// Estado del modal de eliminación
const showDeleteModal = ref(false)
const menuToDelete = ref(null)
const menuToDeleteChildren = ref([])

// Estado de iconos - Eliminado, ahora se maneja en IconSelector
// const searchQuery = ref('')
// const selectedCategory = ref('all')

// Estado de vista
const viewMode = ref('grid') // 'grid' o 'tree'

// Estado para búsqueda y ayuda
const searchQuery = ref('')
const showHelp = ref(false)

let searchTimeout = null

// Menús existentes (cargados desde el backend)
const menus = ref([])

// Función para cargar menús desde el backend

const loadMenus = async () => {
  isLoading.value = true
  error.value = null

  try {
    // Usar la misma función que usa el sidebar (authService.fetchMenus)
    // que apunta a /menu en lugar de /menus
    const menuData = await authService.fetchMenus()

    // Verificar si los datos están anidados en alguna propiedad
    let actualMenus = menuData
    if (menuData && typeof menuData === 'object' && !Array.isArray(menuData)) {
      // Buscar arrays en las propiedades
      for (const key of Object.keys(menuData)) {
        if (Array.isArray(menuData[key])) {
          actualMenus = menuData[key]
          break
        }
      }
    }

    if (Array.isArray(actualMenus) && actualMenus.length > 0) {
      menus.value = actualMenus

      // También actualizar el store para mantener consistencia
      authStore.setMenus(actualMenus)
    } else {
      menus.value = []
    }
  } catch (err) {
    console.log('❌ Error al cargar menús:', err)
    // Si hay error, intentar usar los menús ya cargados en el store
    if (authStore.menus && authStore.menus.length > 0) {
      console.log('🔄 Usando menús del store como fallback')
      menus.value = authStore.menus
    } else {
      error.value = `Error al cargar menús: ${err.message}`
      menus.value = []
    }
  } finally {
    isLoading.value = false
  }
}

// Iconos ahora se manejan en IconSelector.vue

// Plantillas de vista
const viewTemplates = [
  {
    value: null,
    name: 'Completo',
    description: 'En la seccion se podran almacenar todo tipo de archivo',
    icon: 'fa-chart-pie',
    features: [],
  },
  {
    value: 'TYPE_PDF',
    name: 'PDF',
    description: 'Seccion especifica para PDF',
    icon: 'fa-file-pdf',
    features: ['Manuales', 'Instructivos'],
  },
  {
    value: 'TYPE_TEXT',
    name: 'TEXTO',
    description: 'Seccion especifica para Textos planos',
    icon: 'fa-file-alt',
    features: ['Investigaciones', 'Informes', 'Reglas'],
  },
  {
    value: 'TYPE_URL',
    name: 'BOTONERA',
    description: 'Seccion especifica para links externos',
    icon: 'fa-external-link-alt',
    features: ['Patrocinadores', 'Redes Sociales', 'Documentacion Externa'],
  },
]

// Roles disponibles (definidos como array de objetos para mejor UX)
// SUPER_USER se asigna automáticamente a todos los menús, no es seleccionable
const availableRolesList = [
  {
    value: 'ROLE_ADMIN',
    label: 'Administrador',
    icon: 'fas fas fa-user-key',
    description: 'Gestión de usuarios y configuración',
  },
  {
    value: 'ROLE_COLLABORATOR',
    label: 'Colaborador',
    icon: 'fas fas fa-user-group',
    description: 'Acceso a funciones básicas',
  },
]

// Computed para vista de tarjetas (sin búsqueda)
const filteredMenus = computed(() => {
  // La vista de tarjetas muestra todos los menús sin filtros de búsqueda
  // Los filtros de búsqueda solo se aplican en la vista de árbol
  return [...menus.value]
})

const clearSearch = () => {
  searchQuery.value = ''
  clearTimeout(searchTimeout)
}


const availablePositions = computed(() => {
  let siblingMenus = []

  if (menuForm.value.parentId) {
    // Si es un submenú, obtener los hermanos del mismo padre
    siblingMenus = menus.value
      .filter(
        (menu) => menu.parentId === menuForm.value.parentId && menu.id !== editingMenuId.value,
      )
      .sort((a, b) => a.order - b.order)
  } else {
    // Si es un menú raíz, obtener todos los menús raíz
    siblingMenus = menus.value
      .filter((menu) => !menu.parentId && menu.id !== editingMenuId.value)
      .sort((a, b) => a.order - b.order)
  }

  const positions = []

  // Opción para colocar al principio
  positions.push({
    value: 1,
    label: '🔝 Al principio',
  })

  // Opciones para colocar después de cada menú existente
  siblingMenus.forEach((menu, index) => {
    positions.push({
      value: index + 2,
      label: `📍 Después de "${menu.name}"`,
    })
  })

  // Si no hay menús hermanos, la primera posición ya está agregada arriba

  return positions
})

// Computed para validar si se puede proceder al siguiente paso
const canProceedToNextStep = computed(() => {
  switch (currentWizardStep.value) {
    case 1: // Información básica
      return (
        menuForm.value.name &&
        menuForm.value.path &&
        !validationErrors.value.name &&
        !validationErrors.value.path
      )
    case 2: // Apariencia
      return menuForm.value.view && !validationErrors.value.template && !validationErrors.value.icon
    case 3: // Configuración
      return (
        menuForm.value.roles && menuForm.value.roles.length > 0 && !validationErrors.value.roles
      )
    case 4: // Resumen
      return validateForm()
    default:
      return false
  }
})

// displayedIcons ahora se maneja en IconSelector.vue

// Función para actualizar el paso actual
const updateCurrentStep = () => {
  if (menuForm.value.name && menuForm.value.path) {
    if (menuForm.value.icon && menuForm.value.icon.startsWith('fas fas fa-')) {
      currentStep.value = 3
    } else {
      currentStep.value = 2
    }
  } else {
    currentStep.value = 1
  }
}

// Métodos
const openDialog = () => {
  resetForm()
  // Asegurar que SUPER_USER siempre esté incluido
  if (!menuForm.value.roles.includes('ROLE_SUPER_USER')) {
    menuForm.value.roles.push('ROLE_SUPER_USER')
  }
  currentStep.value = 1
  currentWizardStep.value = 1
  showDialog.value = true
}

// Métodos del wizard
const nextStep = () => {
  if (currentWizardStep.value < wizardSteps.value.length && canProceedToNextStep.value) {
    currentWizardStep.value++
  }
}

const previousStep = () => {
  if (currentWizardStep.value > 1) {
    currentWizardStep.value--
  }
}

// Funciones auxiliares para el resumen
const getTemplateName = (template) => {
  const templateMap = {
    basic: 'Vista Básica',
    form: 'Vista de Formulario',
    table: 'Vista de Tabla',
    dashboard: 'Vista de Dashboard',
  }
  return templateMap[template] || 'No especificado'
}

const getPositionLabel = (order) => {
  const position = availablePositions.value.find((p) => p.value === order)
  return position ? position.label : 'No especificado'
}

// Funciones para manejo inteligente de roles
const isRoleDisabled = (roleValue) => {
  // SUPER_USER no es seleccionable (se asigna automáticamente)
  if (roleValue === 'ROLE_SUPER_USER') {
    return true
  }
  return false
}

const handleRoleChange = () => {
  if (!menuForm.value.roles.includes('ROLE_SUPER_USER')) {
    menuForm.value.roles.push('ROLE_SUPER_USER')
  }
}

const getSelectedRolesInfo = () => {
  const rolesInfo = []

  // Agregar SUPER_USER siempre si está presente
  if (menuForm.value.roles.includes('ROLE_SUPER_USER')) {
    rolesInfo.push({
      value: 'ROLE_SUPER_USER',
      label: 'Super Usuario',
      icon: 'fas fa-user-star',
      description: 'Acceso completo al sistema',
    })
  }

  // Agregar otros roles de la lista disponible
  const otherRoles = menuForm.value.roles
    .filter(role => role !== 'ROLE_SUPER_USER')
    .map((roleValue) => {
      return availableRolesList.find((role) => role.value === roleValue)
    })
    .filter(Boolean)

  return [...rolesInfo, ...otherRoles]
}


const closeDialog = () => {
  console.log('📝 [MENU MANAGER] Cerrando diálogo...')
  console.log('📝 [MENU MANAGER] Estado de edición:', isEditing.value)

  showDialog.value = false
  currentWizardStep.value = 1
  // Cerrar también el modal de progreso
  showProgressModal.value = false

  if (!isEditing.value) {
    // Si no está editando, resetear completamente el formulario
    resetForm()
  } else {
    // Si está editando, solo resetear el estado de edición
    isEditing.value = false
    editingMenuId.value = null
    validationErrors.value = {}
    // No resetear el formulario para mantener los datos
  }

  console.log('📝 [MENU MANAGER] Diálogo cerrado')
}

const editMenu = (menu) => {
  console.log('📝 [MENU MANAGER] Editando menú:', menu.name)
  console.log('📝 [MENU MANAGER] Datos originales:', menu)

  // Crear una copia del menú y asegurar que roles sea un array
  const menuCopy = { ...menu }
  // Procesar roles para asegurar que sea un array y manejar diferentes formatos
  let processedRoles = []

  if (menu.roles) {
    if (typeof menu.roles === 'string') {
      // Si roles es un string, convertir a array
      if (menu.roles.includes(',')) {
        processedRoles = menu.roles.split(',').map((role) => role.trim())
      } else {
        processedRoles = [menu.roles]
      }
    } else if (Array.isArray(menu.roles)) {
      processedRoles = [...menu.roles]
    }

    // Asegurar que todos los roles tengan el prefijo ROLE_ si no lo tienen
    processedRoles = processedRoles.map((role) => {
      if (typeof role === 'string' && !role.startsWith('ROLE_')) {
        return `ROLE_${role}`
      }
      return role
    })
  }

  // Asegurar que SUPER_USER siempre esté presente
  if (!processedRoles.includes('ROLE_SUPER_USER')) {
    processedRoles.push('ROLE_SUPER_USER')
  }

  console.log('📝 [MENU MANAGER] Roles procesados:', processedRoles)

  // Procesar el path para mostrar solo la parte editable
  let parentPath = '';
  let editablePath = menu.path
  if (menu.parentId) {
    const parentMenu = findMenuById(menu.parentId)
    parentPath = parentMenu.path
    if (parentMenu) {
      editablePath = menu.path.split('/').pop();
    }
  }

  console.log('📝 [MENU MANAGER] Path editable:', editablePath)

  menuForm.value = {
    ...menuCopy,
    roles: processedRoles,
    path: editablePath,
    parentPath: parentPath,
  }

  editingMenuId.value = menu.id
  isEditing.value = true
  currentWizardStep.value = 1 // Resetear al primer paso
  showDialog.value = true

  console.log('📝 [MENU MANAGER] Formulario cargado:', menuForm.value)
}

const deleteMenu = async (menuData) => {
  // Extraer el ID del menú, ya sea que venga como objeto o como ID directo
  const menuId = typeof menuData === 'object' ? menuData.id : menuData

  try {
    // Buscar el menú usando la nueva función auxiliar
    const menu = findMenuById(menuId)

    if (!menu) {
      alert(`Menú no encontrado: ${menuId}`)
      return
    }

    // Obtener hijos del menú
    const children = getMenuChildren(menuId)

    // Configurar el modal de eliminación
    menuToDelete.value = menu
    menuToDeleteChildren.value = children
    showDeleteModal.value = true
  } catch (error) {
    error.value = error.message
  }
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  menuToDelete.value = null
  menuToDeleteChildren.value = []
}

const closeProgressModal = () => {
  showProgressModal.value = false
  progressErrors.value = []
  progressModalAction.value = 'Iniciando proceso...'
}

const handleDeleteConfirm = async (confirmData) => {
  try {
    isLoading.value = true
    error.value = null

    // Mostrar modal de progreso para eliminación
    showProgressModal.value = true
    progressErrors.value = []
    progressModalTitle.value = 'Eliminando Menú'
    progressModalAction.value = 'Iniciando proceso de eliminación...'

    const { menuId, mode, selectedChildren, allChildren } = confirmData
    let totalSteps = 0
    let currentStep = 0

    // Calcular total de pasos según el modo
    switch (mode) {
      case 'delete-all':
        totalSteps = allChildren.length + 1 // submenús + menú principal
        break
      case 'selective':
        totalSteps = selectedChildren.length + (allChildren.length - selectedChildren.length) // eliminar + mover
        break
      case 'keep-children':
        totalSteps = allChildren.length + 1 // mover hijos + eliminar principal
        break
    }

    submenuProgress.value = { current: 0, total: totalSteps }

    switch (mode) {
      case 'delete-all':
        progressModalAction.value = 'Eliminando submenús...'
        // Eliminar todos los submenús primero, luego el menú principal
        for (const childId of allChildren) {
          await menuService.deleteMenu(childId)
          submenuProgress.value.current = ++currentStep
        }
        progressModalAction.value = 'Eliminando menú principal...'
        await menuService.deleteMenu(menuId)
        submenuProgress.value.current = ++currentStep
        break

      case 'selective': {
        progressModalAction.value = 'Eliminando submenús seleccionados...'
        // Eliminar solo los submenús seleccionados, mantener el menú principal
        for (const childId of selectedChildren) {
          await menuService.deleteMenu(childId)
          submenuProgress.value.current = ++currentStep
        }

        progressModalAction.value = 'Reorganizando submenús restantes...'
        // Mover los submenús no seleccionados al nivel raíz
        const childrenToKeep = allChildren.filter((id) => !selectedChildren.includes(id))
        for (const childId of childrenToKeep) {
          const childMenu = findMenuById(childId)
          if (childMenu) {
            await menuService.updateMenu(childId, { ...childMenu, parentId: null })
          }
          submenuProgress.value.current = ++currentStep
        }

        // NO eliminar el menú principal en modo selectivo
        break
      }

      case 'keep-children':
        progressModalAction.value = 'Moviendo submenús al nivel raíz...'
        // Solo eliminar el menú principal, mover todos los hijos al nivel raíz
        for (const childId of allChildren) {
          const childMenu = findMenuById(childId)
          if (childMenu) {
            await menuService.updateMenu(childId, { ...childMenu, parentId: null })
          }
          submenuProgress.value.current = ++currentStep
        }
        progressModalAction.value = 'Eliminando menú principal...'
        await menuService.deleteMenu(menuId)
        submenuProgress.value.current = ++currentStep
        break

      default:
        throw new Error(`Modo de eliminación no válido: ${mode}`)
    }

    // Recargar la lista de menús
    progressModalAction.value = 'Actualizando lista de menús...'
    await loadMenus()

    // Finalizar con éxito
    progressModalAction.value = 'Menú eliminado exitosamente'

    // Cerrar modal después de un breve delay
    setTimeout(() => {
      showProgressModal.value = false
    }, 1500)

    // Cerrar el modal
    closeDeleteModal()
  } catch (error) {
    error.value = error.message
    progressErrors.value.push(`Error en eliminación: ${error.message}`)
    progressModalAction.value = 'Error en el proceso de eliminación'
  } finally {
    isLoading.value = false
  }
}

const saveMenu = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true
  isSaving.value = true
  error.value = null

  // Mostrar modal de progreso para todas las operaciones
  showProgressModal.value = true
  progressErrors.value = []

  try {
    let parentMenuResult = null

    if (isEditing.value) {
      // Configurar modal para edición
      progressModalTitle.value = 'Editando Menú'
      progressModalAction.value = 'Actualizando información del menú...'

      // Obtener el menú original para comparar paths
      const originalMenu = findMenuById(menuForm.value.id)
      const originalPath = originalMenu ? originalMenu.path : ''

      // Calcular el nuevo path completo
      let newPath = menuForm.value.path
      if (menuForm.value.parentId) {
        const parentPath = getParentPath(menuForm.value.parentId)
        newPath = buildCompletePath(parentPath, menuForm.value.path)
      }

      // Actualizar el menú principal
      const menuDataToUpdate = {
        ...menuForm.value,
        path: currentFullMenuPath.value,
      }
      parentMenuResult = await menuService.updateMenu(menuForm.value.id, menuDataToUpdate)

      // Si el path cambió y tiene submenús, actualizar todos los submenús
      if (originalPath !== newPath && originalPath) {
        const submenus = getAllSubmenus(menuForm.value.id)

        if (submenus.length > 0) {
          progressModalTitle.value = 'Editando Menú y Actualizando Submenús'
          progressModalAction.value = `Actualizando ${submenus.length} submenús...`
          submenuProgress.value = { current: 0, total: submenus.length + 1 }

          try {
            await updateSubmenusPaths(menuForm.value.id, originalPath, newPath)
            progressModalAction.value = 'Todos los submenús actualizados exitosamente'
          } catch (error) {
            console.error('❌ [MENU MANAGER] Error actualizando submenús:', error)
            progressModalAction.value =
              'Menú actualizado, pero algunos submenús no se pudieron actualizar'
          }
        }
      }

      // Actualizar progreso
      submenuProgress.value.current = 1
      progressModalAction.value = 'Menú actualizado exitosamente'
    } else {
      // Configurar modal para creación
      const hasSubmenus = menuForm.value.createSubmenus && menuForm.value.submenus.length > 0
      const totalSteps = hasSubmenus ? 2 + menuForm.value.submenus.length : 2

      progressModalTitle.value = hasSubmenus ? 'Creando Menú con Submenús' : 'Creando Nuevo Menú'
      progressModalAction.value = 'Creando menú principal...'
      submenuProgress.value = { current: 0, total: totalSteps }

      // Crear el menú principal con orden temporal alto para evitar conflictos
      const tempMenuData = {
        ...menuForm.value,
        path: currentFullMenuPath.value,
        order: 9999 // Orden temporal muy alto
      }
      menuService.createMenu(tempMenuData)

      // Actualizar progreso
      submenuProgress.value.current = 1
      progressModalAction.value = 'Organizando posición del menú...'

      submenuProgress.value.current = 2
    }

    // Recargar la lista de menús
    progressModalAction.value = 'Actualizando lista de menús...'
    await loadMenus()

    // Finalizar con éxito
    progressModalAction.value = isEditing.value
      ? 'Menú editado exitosamente'
      : 'Menú creado exitosamente'

    // Cerrar el diálogo después de un breve delay para mostrar el mensaje de éxito
    setTimeout(() => {
      closeDialog()
    }, 1500)
  } catch (err) {
    error.value = err.message
    progressErrors.value.push(`Error general: ${err.message}`)
    progressModalAction.value = 'Error en el proceso'
  } finally {
    isLoading.value = false
    isSaving.value = false
    // El modal se cerrará automáticamente cuando se cierre el diálogo
  }
}

// Método para seleccionar template
const selectTemplate = (templateValue) => {
  menuForm.value.view = templateValue
  validateForm()
}

// Método para guardar y cerrar preview
const saveAndClosePreview = () => {
  saveMenu()
  closePreview()
}

const resetForm = () => {
  menuForm.value = {
    name: '',
    parentPath: '',
    path: '',
    icon: '',
    view: 'basic',
    order: 1,
    parentId: null,
    roles: ['ROLE_SUPER_USER'], // SUPER_USER se asigna automáticamente a todos los menús
    isActive: true,
    createSubmenus: false,
    submenus: [],
  }
  isEditing.value = false
  editingMenuId.value = null
  validationErrors.value = {}

  // Establecer el orden por defecto a la primera posición disponible
  nextTick(() => {
    if (availablePositions.value.length > 0) {
      menuForm.value.order = availablePositions.value[0].value
    }
  })
}

const generatePath = () => {
  if (menuForm.value.name && !isEditing.value) {
    // Generar el path base del menú
    const menuPathSegment = menuForm.value.name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    // Si tiene un menú padre, solo guardar la parte editable
    if (menuForm.value.parentId) {
      menuForm.value.path = menuPathSegment
    } else {
      // Si es un menú raíz, usar el path completo con /
      menuForm.value.path = '/' + menuPathSegment
    }
  }
  validateForm()
}

// Validación con debounce para mejor rendimiento
const validateFormDebounced = () => {
  if (validationTimeout) {
    clearTimeout(validationTimeout)
  }

  validationTimeout = setTimeout(() => {
    isValidating.value = true
    const isValid = validateForm()
    isValidating.value = false
    return isValid
  }, 300) // Debounce de 300ms
}

// Validaciones mejoradas en tiempo real
const validateForm = () => {
  const errors = {}

  // Debug: Log del estado del formulario
  console.log('🔍 [DEBUG] Validando formulario:', {
    name: menuForm.value.name,
    path: menuForm.value.path,
    icon: menuForm.value.icon,
    template: menuForm.value.view,
    roles: menuForm.value.roles,
    parentId: menuForm.value.parentId,
  })

  // Validar nombre con reglas más estrictas
  if (!menuForm.value.name.trim()) {
    errors.name = 'El nombre del menú es obligatorio'
  } else if (menuForm.value.name.length < 3) {
    errors.name = 'El nombre debe tener al menos 3 caracteres'
  } else if (menuForm.value.name.length > 50) {
    errors.name = 'El nombre no puede exceder 50 caracteres'
  } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s0-9\-_]+$/.test(menuForm.value.name)) {
    errors.name = 'El nombre solo puede contener letras, números, espacios, guiones y guiones bajos'
  } else if (menuForm.value.name.trim() !== menuForm.value.name) {
    errors.name = 'El nombre no puede comenzar o terminar con espacios'
  }

  // Validar ruta con reglas más estrictas
  const trimmedPath = menuForm.value.path.trim()
  if (!trimmedPath) {
    errors.path = 'La ruta es obligatoria'
  } else if (menuForm.value.parentId) {
    if (trimmedPath.startsWith('/')) {
      errors.path = 'No agregues "/" al inicio. Se agrega automáticamente la ruta del menú padre.'
    } else if (trimmedPath.endsWith('/')) {
      errors.path = 'El segmento final no puede terminar con /'
    } else if (!/^[a-z0-9][a-z0-9-]*(?:\/[a-z0-9][a-z0-9-]*)*$/.test(trimmedPath)) {
      errors.path = 'Usa solo letras minúsculas, números, guiones y / para separar subsegmentos'
    } else {
      const parentPath = getParentPath(menuForm.value.parentId)
      const fullPath = buildCompletePath(parentPath, trimmedPath)
      const existingMenu = menus.value.find(
        (menu) => menu.path === fullPath && menu.id !== editingMenuId.value,
      )
      if (existingMenu) {
        errors.path = `Ya existe un menú con la ruta "${fullPath}"`
      }
    }
  } else {
    const normalizedRootPath = trimmedPath.startsWith('/') ? trimmedPath : `/${trimmedPath}`

    if (!/^\/[a-z0-9\-/]*$/.test(normalizedRootPath)) {
    errors.path = 'La ruta solo puede contener letras minúsculas, números, guiones y barras'
    } else if (normalizedRootPath.endsWith('/') && normalizedRootPath !== '/') {
    errors.path = 'La ruta no puede terminar con / (excepto la raíz)'
    } else if (normalizedRootPath.includes('//')) {
    errors.path = 'La ruta no puede contener barras consecutivas'
    } else if (normalizedRootPath.length > 100) {
    errors.path = 'La ruta no puede exceder 100 caracteres'
  } else {
    const existingMenu = menus.value.find(
        (menu) => menu.path === normalizedRootPath && menu.id !== editingMenuId.value,
    )
    if (existingMenu) {
        errors.path = `Ya existe un menú con la ruta "${normalizedRootPath}"`
      }
    }
  }

  // Validar icono con más detalles
  if (menuForm.value.icon && !menuForm.value.icon.startsWith('fa-')) {
    errors.icon = 'El icono debe ser válido (formato FontAwesome)'
  }

  // Validar plantilla
  // if (!menuForm.value.view) {
  //   errors.template = 'Debe seleccionar un tipo de vista'
  // } else if (!['basic', 'form', 'table'].includes(menuForm.value.view)) {
  //   errors.template = 'Tipo de vista no válido'
  // }

  // Validar roles
  if (!menuForm.value.roles || menuForm.value.roles.length === 0) {
    errors.roles = 'Debe seleccionar al menos un rol'
  } else if (menuForm.value.roles.length > 5) {
    errors.roles = 'No puede seleccionar más de 5 roles'
  }

  // Validar orden
  if (menuForm.value.order < 1) {
    errors.order = 'El orden debe ser mayor a 0'
  } else if (menuForm.value.order > 999) {
    errors.order = 'El orden no puede ser mayor a 999'
  }

  // Validar jerarquía (evitar referencias circulares)
  if (menuForm.value.parentId) {
    if (menuForm.value.parentId === editingMenuId.value) {
      errors.parentId = 'Un menú no puede ser padre de sí mismo'
    }
  }

  // Validar plantilla
  // if (!menuForm.value.view) {
  //   errors.template = 'Debe seleccionar una plantilla de vista'
  // }

  // Validar menú padre si es submenú
  if (menuForm.value.parentId !== null && !menuForm.value.parentId) {
    errors.parentId = 'Debe seleccionar un menú padre'
  }

  // Validar roles
  if (!menuForm.value.roles || menuForm.value.roles.length === 0) {
    errors.roles = 'Debe seleccionar al menos un rol de acceso'
  }

  // Validar orden
  if (menuForm.value.order < 0) {
    errors.order = 'El orden no puede ser negativo'
  }

  // Validar submenús si está activada la opción
  if (menuForm.value.createSubmenus && menuForm.value.parentId === null) {
    if (menuForm.value.submenus.length === 0) {
      errors.submenus = 'Debe agregar al menos un submenú si activa esta opción'
    } else {
      // Validar cada submenú
      menuForm.value.submenus.forEach((submenu, index) => {
        const submenuErrors = {}

        // Validar nombre del submenú
        if (!submenu.name.trim()) {
          submenuErrors.name = `El nombre del submenú ${index + 1} es obligatorio`
        } else if (submenu.name.length < 3) {
          submenuErrors.name = `El nombre del submenú ${index + 1} debe tener al menos 3 caracteres`
        }

        // Validar ruta del submenú
        if (!submenu.path.trim()) {
          submenuErrors.path = `La ruta del submenú ${index + 1} es obligatoria`
        } else if (submenu.path.startsWith('/')) {
          submenuErrors.path = `La ruta del submenú ${index + 1} no debe comenzar con / (se agrega automáticamente)`
        } else if (!/^[a-z0-9-]+$/.test(submenu.path)) {
          submenuErrors.path = `La ruta del submenú ${index + 1} solo puede contener letras minúsculas, números y guiones`
        }

        // Verificar rutas duplicadas entre submenús
        const duplicatePath = menuForm.value.submenus.find(
          (otherSubmenu, otherIndex) =>
            otherIndex !== index && otherSubmenu.path === submenu.path && submenu.path.trim(),
        )
        if (duplicatePath) {
          submenuErrors.path = `La ruta del submenú ${index + 1} está duplicada`
        }

        // Verificar nombres duplicados entre submenús
        const duplicateName = menuForm.value.submenus.find(
          (otherSubmenu, otherIndex) =>
            otherIndex !== index &&
            otherSubmenu.name.toLowerCase() === submenu.name.toLowerCase() &&
            submenu.name.trim(),
        )
        if (duplicateName) {
          submenuErrors.name = `El nombre del submenú ${index + 1} está duplicado`
        }

        // Si hay errores en este submenú, agregarlos al objeto de errores principal
        if (Object.keys(submenuErrors).length > 0) {
          errors[`submenu_${index}`] = submenuErrors
        }
      })
    }
  }

  // Solo actualizar si hay cambios para evitar recursión
  const currentErrorsString = JSON.stringify(validationErrors.value)
  const newErrorsString = JSON.stringify(errors)

  if (currentErrorsString !== newErrorsString) {
    validationErrors.value = errors
  }

  // Debug: Log de errores encontrados
  if (Object.keys(errors).length > 0) {
    console.log('❌ [DEBUG] Errores de validación encontrados:')
    Object.keys(errors).forEach((key) => {
      console.log(`  - ${key}: ${errors[key]}`)
    })
    console.log('📋 [DEBUG] Estado del formulario:', {
      name: menuForm.value.name,
      path: menuForm.value.path,
      icon: menuForm.value.icon,
      template: menuForm.value.view,
      roles: menuForm.value.roles,
      parentId: menuForm.value.parentId,
    })
  } else {
    console.log('✅ [DEBUG] Formulario válido')
  }

  return Object.keys(errors).length === 0
}

const closePreview = () => {
  showPreview.value = false
  previewMenu.value = null
}

// Funciones auxiliares
const getParentMenuName = (parentId) => {
  const parent = menus.value.find((menu) => menu.id === parentId)
  return parent ? parent.name : 'Desconocido'
}

const getRoleLabel = (roleValue) => {
  const role = availableRolesList.find((r) => r.value === roleValue)
  return role ? role.label : roleValue
}

// Funciones para manejo de submenús
const setMenuType = (type) => {
  if (type === 'root') {
    menuForm.value.parentId = null
  } else if (type === 'submenu') {
    menuForm.value.parentId = ''
  }
  validateForm()
}

const handleParentSelect = (parentId) => {
  menuForm.value.parentId = parentId
  validateForm()
}

const getMenuChildren = (menuId) => {
  // Buscar en la estructura plana de menus.value
  const flatChildren = menus.value.filter((menu) => menu.parentId === menuId)

  // También buscar en la estructura jerárquica si existe
  const findChildrenInHierarchy = (menuList) => {
    let children = []
    for (const menu of menuList) {
      if (menu.id === menuId && menu.children) {
        children = [...children, ...menu.children]
      }
      if (menu.children && menu.children.length > 0) {
        children = [...children, ...findChildrenInHierarchy(menu.children)]
      }
    }
    return children
  }

  const hierarchyChildren = findChildrenInHierarchy(hierarchicalMenus.value || [])

  // Combinar y deduplicar por ID
  const allChildren = [...flatChildren, ...hierarchyChildren]
  const uniqueChildren = allChildren.filter(
    (child, index, self) => index === self.findIndex((c) => c.id === child.id),
  )

  return uniqueChildren
}

// Función auxiliar para buscar un menú por ID en cualquier estructura
const findMenuById = (menuId) => {
  // Buscar en la estructura plana
  let menu = menus.value.find((m) => m.id === menuId)
  if (menu) {
    return menu
  }
  // Buscar en la estructura jerárquica
  const findInHierarchy = (menuList) => {
    for (const m of menuList) {
      if (m.id === menuId) {
        return m
      }
      if (m.children && m.children.length > 0) {
        const found = findInHierarchy(m.children)
        if (found) return found
      }
    }
    return null
  }

  menu = findInHierarchy(hierarchicalMenus.value || [])
  if (menu) {
    return menu
  }

  return null
}

// Función para construir jerarquía de menús (adaptada para datos ya jerárquicos del backend)
const buildMenuHierarchy = () => {
  // El backend ya devuelve los menús con estructura jerárquica
  // Solo necesitamos asegurar que la estructura esté completa
  const processMenu = (menu) => {
    const processedMenu = {
      ...menu,
      children: menu.children ? menu.children.map((child) => processMenu(child)) : [],
    }
    return processedMenu
  }

  // Procesar todos los menús (que ya son menús raíz del backend)
  const hierarchy = menus.value.map((menu) => processMenu(menu))

  return hierarchy
}

// Computed para obtener menús con jerarquía
const hierarchicalMenus = computed(() => {
  const result = buildMenuHierarchy()
  return result
})

// Computed para filtrar menús jerárquicos basado en la búsqueda
const filteredHierarchicalMenus = computed(() => {
  // Si no hay búsqueda, devolver todos los menús
  if (!searchQuery.value || !searchQuery.value.trim()) {
    return hierarchicalMenus.value || []
  }

  const query = searchQuery.value.toLowerCase().trim()

  // Función recursiva para filtrar menús y sus hijos
  const filterMenusRecursive = (menuList) => {
    if (!Array.isArray(menuList) || menuList.length === 0) {
      return []
    }

    const results = []

    for (const menu of menuList) {
      if (!menu || typeof menu !== 'object' || !menu.id) {
        continue
      }

      // Verificar si el menú actual coincide con la búsqueda
      const nameMatch =
        menu.name && typeof menu.name === 'string' && menu.name.toLowerCase().includes(query)

      const pathMatch =
        menu.path && typeof menu.path === 'string' && menu.path.toLowerCase().includes(query)

      // Adaptar búsqueda de roles según la estructura del backend
      let roleMatch = false
      if (menu.roles && Array.isArray(menu.roles)) {
        roleMatch = menu.roles.some(
          (role) => typeof role === 'string' && role.toLowerCase().includes(query),
        )
      } else if (menu.role && typeof menu.role === 'string') {
        // Si roles viene como string único
        roleMatch = menu.role.toLowerCase().includes(query)
      } else if (menu.permissions && Array.isArray(menu.permissions)) {
        // Si usa permissions en lugar de roles
        roleMatch = menu.permissions.some(
          (permission) =>
            typeof permission === 'string' && permission.toLowerCase().includes(query),
        )
      }

      const currentMenuMatches = nameMatch || pathMatch || roleMatch

      // Coincidencia encontrada

      // Filtrar los hijos recursivamente
      const filteredChildren =
        menu.children && Array.isArray(menu.children) ? filterMenusRecursive(menu.children) : []

      // Incluir el menú si:
      // 1. El menú actual coincide con la búsqueda, O
      // 2. Tiene hijos que coinciden con la búsqueda
      if (currentMenuMatches || filteredChildren.length > 0) {
        results.push({
          ...menu,
          children: filteredChildren,
          // Marcar si es una coincidencia directa para resaltado
          isSearchMatch: currentMenuMatches,
          // Marcar el tipo de coincidencia
          matchType: nameMatch ? 'name' : pathMatch ? 'path' : roleMatch ? 'role' : 'child',
        })
      }
    }

    return results
  }

  try {
    return filterMenusRecursive(hierarchicalMenus.value || [])
  } catch (error) {
    console.error('Error en filtrado de menús:', error)
    return hierarchicalMenus.value || []
  }
})

const createSubmenu = (parentMenu) => {
  // Resetear el formulario
  resetForm()

  // Configurar como submenú del menú seleccionado
  menuForm.value.parentId = parentMenu.id
  menuForm.value.parentPath = parentMenu.path

  // Generar orden automático para el submenú
  const siblings = getMenuChildren(parentMenu.id)
  menuForm.value.order = siblings.length + 1

  // Abrir el modal
  showDialog.value = true
  isEditing.value = false

  // Enfocar el campo de nombre después de que el modal se abra
  nextTick(() => {
    const nameInput = document.querySelector('#menuName')
    if (nameInput) {
      nameInput.focus()
    }
  })
}

const moveMenu = async (moveData) => {
  try {
    isLoading.value = true
    error.value = null

    // Usar el nuevo método específico para mover menús
    await menuService.moveMenu({
      menuId: moveData.menuId,
      parentId: moveData.newParentId,
      order: moveData.newOrder,
      view: moveData.newView,
    })

    // Recargar la lista de menús
    await loadMenus()
  } catch (err) {
    error.value = err.message
    console.error('Error al mover menú:', err)
  } finally {
    isLoading.value = false
  }
}

// Métodos para búsqueda
const handleSearch = () => {
  // La búsqueda se maneja automáticamente a través de la propiedad computada
  // Este método se puede usar para lógica adicional si es necesario
}

// Funciones para manejo de submenús

// Función para normalizar paths y evitar dobles slashes
const normalizePath = (path) => {
  if (!path) return ''

  // Remover slashes múltiples y normalizar
  return path
    .replace(/\/+/g, '/') // Reemplazar múltiples slashes con uno solo
    .replace(/\/$/, '') // Remover slash final
    .replace(/^\/?/, '/') // Asegurar que empiece con un slash
}

// Función para construir path completo de manera segura
const buildCompletePath = (parentPath, childPath) => {
  const normalizedParent = normalizePath(parentPath)
  const normalizedChild = childPath ? childPath.replace(/^\/+/, '') : '' // Remover slashes del inicio del hijo

  if (!normalizedParent || normalizedParent === '/') {
    return '/' + normalizedChild
  }

  if (!normalizedChild) {
    return normalizedParent
  }

  return normalizedParent + '/' + normalizedChild
}

// Función para obtener el path completo de un menú padre
const getParentPath = (parentId) => {
  if (!parentId) return ''

  const parentMenu = findMenuById(parentId)
  if (!parentMenu) return ''

  // Si el menú padre tiene su propio padre, construir el path completo recursivamente
  if (parentMenu.parentId) {
    return buildCompletePath(getParentPath(parentMenu.parentId), parentMenu.path)
  }

  return normalizePath(parentMenu.path)
}

// Función para encontrar todos los submenús de un menú padre
const getAllSubmenus = (parentId) => {
  const submenus = []

  const findSubmenusRecursive = (menuId) => {
    const directChildren = menus.value.filter((menu) => menu.parentId === menuId)

    for (const child of directChildren) {
      submenus.push(child)
      // Buscar submenús de este hijo recursivamente
      findSubmenusRecursive(child.id)
    }
  }

  findSubmenusRecursive(parentId)
  return submenus
}

// Función para actualizar paths de todos los submenús cuando cambia el padre
const updateSubmenusPaths = async (parentId, oldParentPath, newParentPath) => {
  console.log('🔄 [MENU MANAGER] Actualizando paths de submenús...')
  console.log('🔄 [MENU MANAGER] Menú padre ID:', parentId)
  console.log('🔄 [MENU MANAGER] Path anterior:', oldParentPath)
  console.log('🔄 [MENU MANAGER] Path nuevo:', newParentPath)

  const submenus = getAllSubmenus(parentId)
  console.log('🔄 [MENU MANAGER] Submenús encontrados:', submenus.length)

  if (submenus.length === 0) {
    console.log('ℹ️ [MENU MANAGER] No hay submenús para actualizar')
    return
  }

  const updatePromises = submenus.map(async (submenu) => {
    try {
      // Calcular el nuevo path del submenú
      const newSubmenuPath = submenu.path.replace(oldParentPath, newParentPath)

      console.log(`🔄 [MENU MANAGER] Actualizando submenú "${submenu.name}":`)
      console.log(`   Path anterior: ${submenu.path}`)
      console.log(`   Path nuevo: ${newSubmenuPath}`)

      // Actualizar el submenú en el backend
      console.log("[BEFORE UPDATE] - submenu: ", submenu.view)
      const response =await menuService.updateMenu(submenu.id, {
        ...submenu,
        path: newSubmenuPath,
      })
      console.log('[AFTER UPDATE] - response: ', response.view)

      console.log(`✅ [MENU MANAGER] Submenú "${submenu.name}" actualizado exitosamente`)

      return { success: true, submenu: submenu.name, newPath: newSubmenuPath }
    } catch (error) {
      console.error(`❌ [MENU MANAGER] Error actualizando submenú "${submenu.name}":`, error)
      return { success: false, submenu: submenu.name, error: error.message }
    }
  })

  // Ejecutar todas las actualizaciones
  const results = await Promise.all(updatePromises)

  // Mostrar resumen de resultados
  const successful = results.filter((r) => r.success)
  const failed = results.filter((r) => !r.success)

  console.log(`✅ [MENU MANAGER] Actualización completada:`)
  console.log(`   ✅ Exitosos: ${successful.length}`)
  console.log(`   ❌ Fallidos: ${failed.length}`)

  if (failed.length > 0) {
    console.warn('⚠️ [MENU MANAGER] Algunos submenús no se pudieron actualizar:')
    failed.forEach((f) => console.warn(`   - ${f.submenu}: ${f.error}`))
  }

  return results
}

// Función para extraer solo la parte editable del path de un submenú
const extractEditablePath = (fullPath, parentPath) => {
  if (!fullPath || !parentPath) return fullPath

  // Si el path completo contiene el path del padre, extraer solo la parte editable
  if (fullPath.startsWith(parentPath + '/')) {
    return fullPath.substring(parentPath.length + 1) // +1 para quitar la barra
  }

  return fullPath
}

// Verificar permisos de SuperAdmin
const checkSuperAdminAccess = () => {
  // Usar la misma lógica de roles que el resto de la aplicación
  if (!authStore.hasRole('ROLE_SUPER_USER')) {
    router.push('/dashboard')
    return false
  }

  return true
}

// Watchers con validación debounced
watch(
  () => menuForm.value.name,
  () => {
    validateFormDebounced()
    updateCurrentStep()
    // Regenerar el path cuando cambie el nombre
    if (menuForm.value.name && !isEditing.value) {
      generatePath()
    }
  },
)
watch(
  () => menuForm.value.path,
  () => {
    validateFormDebounced()
    updateCurrentStep()
  },
)
watch(
  () => menuForm.value.icon,
  () => {
    validateFormDebounced()
    updateCurrentStep()
  },
)
watch(() => menuForm.value.view, validateFormDebounced)
watch(() => menuForm.value.roles, validateFormDebounced)
watch(
  () => menuForm.value.parentId,
  () => {
    validateFormDebounced()
    // Regenerar el path cuando cambie el menú padre
    if (menuForm.value.name && !isEditing.value) {
      generatePath()
    }
  },
)

onMounted(() => {
  // Verificar permisos de SuperAdmin
  if (!checkSuperAdminAccess()) {
    return
  }

  // Cargar menús desde el backend
  loadMenus()
})

const handlePathInput = () => {
  if (!menuForm.value.path) {
    validateFormDebounced()
    return
  }

  let rawPath = menuForm.value.path.toLowerCase().trim()
  rawPath = rawPath
    .replace(/[^a-z0-9/-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/\/+$/g, '')
    .replace(/^-+/g, '')

  if (menuForm.value.parentId) {
    rawPath = rawPath.replace(/^\/+/, '')
    rawPath = rawPath || 'nuevo-submenu'
    menuForm.value.path = rawPath
  } else {
    rawPath = '/' + rawPath.replace(/^\/+/, '')
    if (rawPath === '/') {
      rawPath = '/' + (menuForm.value.name || 'nuevo-menu').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    }
    menuForm.value.path = rawPath
  }

  validateFormDebounced()
}


</script>

<style scoped>
/* Styles have been migrated to Tailwind CSS */
</style>

