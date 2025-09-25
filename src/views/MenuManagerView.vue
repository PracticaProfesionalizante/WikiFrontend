<template>
  <div class="menu-manager-layout">
    <SidebarMenu @sidebar-toggle="handleSidebarToggle" />
    <AppHeader :sidebar-expanded="sidebarExpanded" />

    <div class="main-content" :class="{ 'with-header': true, 'sidebar-expanded': sidebarExpanded }">
      <div class="menu-manager-container">
        <div class="manager-header">
          <h1 class="manager-title">
            <i class="mdi mdi-menu-open"></i>
            Gestión de Menús
          </h1>
          <p class="manager-subtitle">
            Crea y administra los menús de la aplicación de forma fácil y visual
          </p>
        </div>

        <!-- Botón para crear nuevo menú -->
        <div class="action-bar">
          <button
            class="create-menu-btn"
            @click="openDialog"
            :disabled="isLoading"
            title="Crear un nuevo menú principal o submenú"
          >
            <i class="mdi mdi-plus-circle"></i>
            Crear Nuevo Menú
          </button>
        </div>

        <!-- Indicador de carga -->
        <div v-if="isLoading" class="loading-indicator">
          <i class="mdi mdi-loading mdi-spin"></i>
          <span>Cargando menús...</span>
        </div>

        <!-- Mensaje de error -->
        <div v-if="error" class="error-message">
          <i class="mdi mdi-alert-circle"></i>
          <span>{{ error }}</span>
          <button @click="loadMenus" class="retry-btn" title="Volver a cargar la lista de menús">
            <i class="mdi mdi-refresh"></i>
            Reintentar
          </button>
        </div>

        <!-- Lista de menús existentes -->
        <div class="menu-display-options" v-if="!isLoading">
          <div class="view-toggle">
            <button
              class="toggle-btn"
              :class="{ active: viewMode === 'grid' }"
              @click="viewMode = 'grid'"
              title="Cambiar a vista de tarjetas - Muestra los menús en formato de tarjetas con información detallada"
            >
              <i class="mdi mdi-view-grid"></i>
              Vista de Tarjetas
            </button>
            <button
              class="toggle-btn"
              :class="{ active: viewMode === 'tree' }"
              @click="viewMode = 'tree'"
              title="Cambiar a vista de árbol - Muestra los menús en estructura jerárquica con relaciones padre-hijo"
            >
              <i class="mdi mdi-file-tree"></i>
              Vista de Árbol
            </button>
          </div>
        </div>

        <!-- Vista de tarjetas (original) -->
        <div class="menus-grid" v-if="!isLoading && viewMode === 'grid'">
          <div
            v-for="menu in filteredMenus"
            :key="menu.id"
            class="menu-card"
            :class="{ 'is-submenu': menu.parentId, 'has-children': getMenuChildren(menu.id).length > 0 }"
          >
            <div class="menu-card-header">
              <div class="menu-icon">
                <i :class="['mdi', menu.icon] || 'mdi mdi-circle-outline'"></i>
              </div>
              <div class="menu-info">
                <div class="menu-title-row">
                  <h3 class="menu-name">{{ menu.name }}</h3>
                  <div class="menu-badges">
                    <span v-if="menu.parentId" class="submenu-badge">
                      <i class="mdi mdi-subdirectory-arrow-right"></i>
                      Submenú
                    </span>
                    <span v-if="getMenuChildren(menu.id).length > 0" class="parent-badge">
                      <i class="mdi mdi-folder-outline"></i>
                      {{ getMenuChildren(menu.id).length }} hijos
                    </span>
                  </div>
                </div>
                <p class="menu-path">{{ menu.path }}</p>
                <div class="menu-meta">
                  <span class="menu-order">Orden: {{ menu.order }}</span>
                  <span v-if="menu.parentId" class="menu-parent">
                    <i class="mdi mdi-arrow-up"></i>
                    Padre: {{ getParentMenuName(menu.parentId) }}
                  </span>
                  <div class="menu-roles">
                    <span
                      v-for="role in menu.roles"
                      :key="role"
                      class="role-badge"
                    >
                      {{ getRoleLabel(role) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="menu-actions">
              <button
                v-if="!menu.parentId"
                class="add-submenu-btn"
                @click="createSubmenu(menu)"
                title="Agregar submenú"
              >
                <i class="mdi mdi-plus"></i>
                Submenú
              </button>
              <button
                class="edit-btn"
                @click="editMenu(menu)"
                title="Editar menú"
              >
                <i class="mdi mdi-pencil"></i>
              </button>
              <button
                class="delete-btn"
                @click="deleteMenu(menu.id)"
                title="Eliminar menú"
              >
                <i class="mdi mdi-delete"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Vista de árbol jerárquico -->
        <div class="menu-tree-view" v-if="!isLoading && viewMode === 'tree'">
          <!-- Sección de ayuda y buscador -->
          <div class="tree-header">
            <!-- Sección de ayuda -->
            <div class="help-section" :class="{ 'expanded': showHelp }">
              <button class="help-toggle" @click="showHelp = !showHelp" title="Mostrar/ocultar guía de ayuda para nuevos usuarios">
                <i class="mdi mdi-help-circle"></i>
                <span>{{ showHelp ? 'Ocultar' : 'Mostrar' }} Guía de Uso</span>
                <i class="mdi" :class="showHelp ? 'mdi-chevron-up' : 'mdi-chevron-down'"></i>
              </button>

              <div class="help-content" v-if="showHelp">
                <!-- Título y descripción principal -->
                <div class="help-header">
                  <h3 class="help-title">
                    <i class="mdi mdi-book-open-variant"></i>
                    Guía de Gestión de Menús
                  </h3>
                  <p class="help-description">
                    Aprende a usar todas las funcionalidades disponibles para gestionar la estructura de menús de tu aplicación de manera eficiente.
                  </p>
                </div>

                <!-- Funcionalidades organizadas por categorías -->
                <div class="help-categories">

                  <!-- Navegación y Visualización -->
                  <div class="help-category">
                    <h4 class="category-title">
                      <i class="mdi mdi-eye"></i>
                      Navegación y Visualización
                    </h4>

                    <div class="help-items">
                      <div class="help-item">
                        <div class="help-icon">
                          <i class="mdi mdi-file-tree"></i>
                        </div>
                        <div class="help-text">
                          <h5>Vista de Árbol</h5>
                          <p>Visualiza la estructura jerárquica completa de tus menús con organización clara de niveles.</p>
                        </div>
                      </div>

                      <div class="help-item">
                        <div class="help-icon">
                          <i class="mdi mdi-chevron-right"></i>
                        </div>
                        <div class="help-text">
                          <h5>Acordeón Inteligente</h5>
                          <p>Los menús padre se contraen automáticamente para una vista más limpia. Haz clic en las flechas para expandir y ver los submenús.</p>
                        </div>
                      </div>

                      <div class="help-item">
                        <div class="help-icon">
                          <i class="mdi mdi-magnify"></i>
                        </div>
                        <div class="help-text">
                          <h5>Búsqueda Avanzada</h5>
                          <p>Encuentra menús específicos por nombre o ruta. La búsqueda resalta los términos encontrados y filtra resultados en tiempo real.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Gestión de Contenido -->
                  <div class="help-category">
                    <h4 class="category-title">
                      <i class="mdi mdi-cog"></i>
                      Gestión de Contenido
                    </h4>

                    <div class="help-items">
                      <div class="help-item">
                        <div class="help-icon">
                          <i class="mdi mdi-plus-circle"></i>
                        </div>
                        <div class="help-text">
                          <h5>Crear Menús y Submenús</h5>
                          <p>Usa el botón "Crear Nuevo Menú" o el "+" junto a cualquier menú para agregar nuevos elementos a la estructura.</p>
                        </div>
                      </div>

                      <div class="help-item">
                        <div class="help-icon">
                          <i class="mdi mdi-pencil"></i>
                        </div>
                        <div class="help-text">
                          <h5>Editar Propiedades</h5>
                          <p>Modifica nombre, ruta, icono, orden y permisos de cualquier menú usando el botón de edición.</p>
                        </div>
                      </div>

                      <div class="help-item">
                        <div class="help-icon">
                          <i class="mdi mdi-drag"></i>
                        </div>
                        <div class="help-text">
                          <h5>Reorganizar con Arrastrar y Soltar</h5>
                          <p>Arrastra menús para cambiar su posición o convertirlos en submenús. Las zonas de destino se resaltan automáticamente.</p>
                        </div>
                      </div>

                      <div class="help-item">
                        <div class="help-icon">
                          <i class="mdi mdi-delete"></i>
                        </div>
                        <div class="help-text">
                          <h5>Eliminación Inteligente</h5>
                          <p>Al eliminar menús con submenús, elige qué hacer: eliminar todo, mantener submenús como principales, o seleccionar cuáles conservar.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <!-- Buscador -->
            <div class="search-section">
              <div class="search-container">
                <div class="search-input-wrapper">
                  <i class="mdi mdi-magnify search-icon"></i>
                  <input
                    type="text"
                    v-model="searchQuery"
                    placeholder="Buscar menús por nombre o ruta..."
                    class="search-input"
                    @input="handleSearch"
                  />
                  <button
                    v-if="searchQuery"
                    @click="clearSearch"
                    class="clear-search-btn"
                    title="Limpiar búsqueda"
                  >
                    <i class="mdi mdi-close"></i>
                  </button>
                </div>
                <div class="search-stats" v-if="searchQuery">
                  <span class="results-count">
                    {{ filteredHierarchicalMenus.length }} resultado{{ filteredHierarchicalMenus.length !== 1 ? 's' : '' }} encontrado{{ filteredHierarchicalMenus.length !== 1 ? 's' : '' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Contenedor del árbol -->
          <div class="tree-container">
            <div v-if="filteredHierarchicalMenus.length === 0 && searchQuery" class="no-results">
              <i class="mdi mdi-magnify-close"></i>
              <h3>No se encontraron menús</h3>
              <p>No hay menús que coincidan con "{{ searchQuery }}"</p>
              <button @click="clearSearch" class="clear-search-btn-large">
                <i class="mdi mdi-refresh"></i>
                Mostrar todos los menús
              </button>
            </div>

            <MenuTreeNode
              v-for="rootMenu in filteredHierarchicalMenus"
              :key="rootMenu.id"
              :menu="rootMenu"
              :level="0"
              :all-menus="menus"
              :available-roles="availableRoles"
              :search-query="searchQuery"
              @edit="editMenu"
              @delete="deleteMenu"
              @move="moveMenu"
              @create-submenu="createSubmenu"
            />
          </div>
        </div>

        <!-- Modal de eliminación avanzada -->
        <DeleteMenuModal
          :show="showDeleteModal"
          :menu="menuToDelete"
          :children="menuToDeleteChildren"
          @close="closeDeleteModal"
          @confirm="handleDeleteConfirm"
        />

        <!-- Modal de creación/edición -->
        <div
          v-if="showDialog"
          class="dialog-overlay"
          @click="closeDialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <div
            class="dialog-content"
            @click.stop
            tabindex="-1"
            ref="modalContent"
          >
            <div class="dialog-header">
              <h2 id="modal-title">
                <i class="mdi mdi-menu-open" aria-hidden="true"></i>
                {{ isEditing ? 'Editar' : 'Crear' }} Menú
              </h2>
              <button
                @click="closeDialog"
                class="close-btn"
                aria-label="Cerrar modal"
                type="button"
              >
                <i class="mdi mdi-close" aria-hidden="true"></i>
              </button>
            </div>

            <div class="dialog-body">
              <p id="modal-description" class="sr-only">
                Formulario para {{ isEditing ? 'editar' : 'crear' }} un elemento del menú. Complete los campos requeridos y presione guardar.
              </p>
              <form @submit.prevent="saveMenu" role="form" id="menu-form">
                <!-- Información básica -->
                <div class="form-section">
                  <h3 class="section-title">
                    <i class="mdi mdi-information-outline" aria-hidden="true"></i>
                    Información Básica
                  </h3>

                  <div class="form-group">
                    <label for="menuName" class="form-label">
                      <i class="mdi mdi-format-title" aria-hidden="true"></i>
                      Nombre del Menú *
                    </label>
                    <input
                      id="menuName"
                      v-model="menuForm.name"
                      type="text"
                      class="form-input"
                      :class="{ 'error': validationErrors.name }"
                      placeholder="Ej: Gestión de Usuarios"
                      @input="generatePath"
                      maxlength="50"
                      required
                      aria-describedby="menuName-help menuName-error"
                      ref="firstInput"
                    />
                    <div v-if="validationErrors.name" class="error-message" id="menuName-error" role="alert">
                      <i class="mdi mdi-alert-circle" aria-hidden="true"></i>
                      {{ validationErrors.name }}
                    </div>
                    <div class="help-text" id="menuName-help">
                      <i class="mdi mdi-information" aria-hidden="true"></i>
                      Este será el nombre que aparecerá en el menú lateral
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="menuPath" class="form-label">
                      <i class="mdi mdi-link-variant" aria-hidden="true"></i>
                      Ruta de Acceso *
                    </label>
                    <input
                      id="menuPath"
                      v-model="menuForm.path"
                      type="text"
                      class="form-input"
                      :class="{ 'error': validationErrors.path }"
                      placeholder="Ej: /gestion-usuarios"
                      @input="validateForm"
                      required
                      aria-describedby="menuPath-help menuPath-error"
                    />
                    <div v-if="validationErrors.path" class="error-message" id="menuPath-error" role="alert">
                      <i class="mdi mdi-alert-circle" aria-hidden="true"></i>
                      {{ validationErrors.path }}
                    </div>
                    <div class="help-text" id="menuPath-help">
                      <i class="mdi mdi-information" aria-hidden="true"></i>
                      URL que se usará para acceder a esta vista (se genera automáticamente)
                    </div>
                  </div>
                </div>

                <!-- Selector de iconos -->
                <div class="form-section">
                  <h3 class="section-title">
                    <i class="mdi mdi-emoticon-outline" aria-hidden="true"></i>
                    Seleccionar Icono *
                  </h3>
                  <div v-if="validationErrors.icon" class="error-message" role="alert" aria-live="polite">
                    <i class="mdi mdi-alert-circle" aria-hidden="true"></i>
                    {{ validationErrors.icon }}
                  </div>

                  <IconSelector
                    v-model="menuForm.icon"
                    @update:modelValue="validateForm"
                    aria-label="Seleccionar icono para el menú"
                  />
                </div>

                <!-- Selector de plantillas -->
                <div class="form-section">
                  <h3 class="section-title">
                    <i class="mdi mdi-view-dashboard-outline" aria-hidden="true"></i>
                    Tipo de Vista *
                  </h3>
                  <div v-if="validationErrors.template" class="error-message" role="alert" aria-live="polite">
                    <i class="mdi mdi-alert-circle" aria-hidden="true"></i>
                    {{ validationErrors.template }}
                  </div>
                  <div class="help-text">
                    <i class="mdi mdi-information" aria-hidden="true"></i>
                    Selecciona el tipo de vista que mejor se adapte a tu contenido
                  </div>

                  <div class="template-selector" role="radiogroup" aria-labelledby="template-section-title">
                    <div
                      v-for="template in viewTemplates"
                      :key="template.value"
                      class="template-option"
                      :class="{ selected: menuForm.template === template.value }"
                      @click="menuForm.template = template.value; validateForm()"
                      @keydown.enter="menuForm.template = template.value; validateForm()"
                      @keydown.space.prevent="menuForm.template = template.value; validateForm()"
                      role="radio"
                      :aria-checked="menuForm.template === template.value"
                      :aria-labelledby="`template-${template.value}-label`"
                      tabindex="0"
                    >
                      <div class="template-preview">
                        <i :class="['mdi', template.icon]" aria-hidden="true"></i>
                        <div class="template-mockup" aria-hidden="true">
                          <!-- Mockup para Vista Básica -->
                          <div v-if="template.value === 'basic'" class="mockup-basic">
                            <div class="mockup-header"></div>
                            <div class="mockup-content">
                              <div class="mockup-line"></div>
                              <div class="mockup-line short"></div>
                              <div class="mockup-line"></div>
                            </div>
                          </div>

                          <!-- Mockup para Vista de Formulario -->
                          <div v-else-if="template.value === 'form'" class="mockup-form">
                            <div class="mockup-field"></div>
                            <div class="mockup-field"></div>
                            <div class="mockup-field"></div>
                            <div class="mockup-button"></div>
                          </div>

                          <!-- Mockup para Vista de Tabla -->
                          <div v-else-if="template.value === 'table'" class="mockup-table">
                            <div class="mockup-table-header"></div>
                            <div class="mockup-table-row"></div>
                            <div class="mockup-table-row"></div>
                            <div class="mockup-table-row"></div>
                          </div>

                          <!-- Mockup para Vista de Dashboard -->
                          <div v-else-if="template.value === 'dashboard'" class="mockup-dashboard">
                            <div class="mockup-cards">
                              <div class="mockup-card"></div>
                              <div class="mockup-card"></div>
                              <div class="mockup-card"></div>
                            </div>
                            <div class="mockup-chart"></div>
                          </div>
                        </div>
                      </div>

                      <div class="template-info">
                        <h4 class="template-name" :id="`template-${template.value}-label`">{{ template.name }}</h4>
                        <p class="template-description">{{ template.description }}</p>
                        <div class="template-features">
                          <span
                            v-for="feature in template.features"
                            :key="feature"
                            class="feature-tag"
                          >
                            {{ feature }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Configuración adicional -->
                <div class="form-section">
                  <h3 class="section-title" id="additional-config-title">
                    <i class="mdi mdi-cog-outline" aria-hidden="true"></i>
                    Configuración Adicional
                  </h3>

                  <!-- Selector de tipo de menú -->
                  <div class="form-group">
                    <label class="form-label">
                      <i class="mdi mdi-format-list-bulleted-type" aria-hidden="true"></i>
                      Tipo de Menú
                    </label>
                    <div class="menu-type-selector" role="radiogroup" aria-labelledby="additional-config-title">
                      <div
                        class="menu-type-option"
                        :class="{ 'active': menuForm.parentId === null }"
                        @click="setMenuType('root')"
                        @keydown.enter="setMenuType('root')"
                        @keydown.space.prevent="setMenuType('root')"
                        role="radio"
                        :aria-checked="menuForm.parentId === null"
                        aria-labelledby="root-menu-label"
                        tabindex="0"
                      >
                        <i class="mdi mdi-home-outline" aria-hidden="true"></i>
                        <div class="option-content">
                          <span class="option-title" id="root-menu-label">Menú Principal</span>
                          <span class="option-description">Aparece en el nivel raíz del menú lateral</span>
                        </div>
                      </div>
                      <div
                        class="menu-type-option"
                        :class="{ 'active': menuForm.parentId !== null }"
                        @click="setMenuType('submenu')"
                        @keydown.enter="setMenuType('submenu')"
                        @keydown.space.prevent="setMenuType('submenu')"
                        role="radio"
                        :aria-checked="menuForm.parentId !== null"
                        aria-labelledby="submenu-label"
                        tabindex="0"
                      >
                        <i class="mdi mdi-subdirectory-arrow-right" aria-hidden="true"></i>
                        <div class="option-content">
                          <span class="option-title" id="submenu-label">Submenú</span>
                          <span class="option-description">Aparece dentro de otro menú como elemento hijo</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Selector de menú padre (solo si es submenú) -->
                  <div v-if="menuForm.parentId !== null" class="form-group">
                    <label class="form-label">
                      <i class="mdi mdi-file-tree" aria-hidden="true"></i>
                      Menú Padre *
                    </label>

                    <!-- Selector de árbol jerárquico -->
                    <MenuTreeSelector
                      :menus="menus"
                      :selected-id="menuForm.parentId"
                      :excluded-id="isEditing ? menuForm.id : null"
                      @select="handleParentSelect"
                      aria-label="Seleccionar menú padre"
                    />

                    <div v-if="validationErrors.parentId" class="error-message" role="alert">
                      <i class="mdi mdi-alert-circle" aria-hidden="true"></i>
                      {{ validationErrors.parentId }}
                    </div>
                    <div class="help-text">
                      <i class="mdi mdi-information" aria-hidden="true"></i>
                      Selecciona el menú padre donde aparecerá este submenú. Puedes expandir los nodos para ver la estructura completa.
                    </div>
                  </div>

                  <!-- Vista previa de jerarquía -->
                  <div v-if="menuForm.parentId" class="form-group">
                    <label class="form-label">
                      <i class="mdi mdi-file-tree-outline" aria-hidden="true"></i>
                      Vista Previa de Jerarquía
                    </label>
                    <div class="hierarchy-preview" aria-label="Vista previa de la jerarquía del menú">
                      <div class="hierarchy-item parent">
                        <i class="mdi mdi-folder-outline" aria-hidden="true"></i>
                        <span>{{ getParentMenuName(menuForm.parentId) }}</span>
                      </div>
                      <div class="hierarchy-connector">
                        <i class="mdi mdi-subdirectory-arrow-right" aria-hidden="true"></i>
                      </div>
                      <div class="hierarchy-item child">
                        <i :class="['mdi', menuForm.icon] || 'mdi mdi-circle-outline'" aria-hidden="true"></i>
                        <span>{{ menuForm.name || 'Nuevo submenú' }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="menuOrder" class="form-label">
                      <i class="mdi mdi-sort-numeric-ascending" aria-hidden="true"></i>
                      Posición en el menú
                    </label>
                    <select
                      id="menuOrder"
                      v-model.number="menuForm.order"
                      class="form-input"
                      aria-describedby="menuOrder-help"
                    >
                      <option
                        v-for="position in availablePositions"
                        :key="position.value"
                        :value="position.value"
                      >
                        {{ position.label }}
                      </option>
                    </select>
                    <div class="help-text" id="menuOrder-help">
                      <i class="mdi mdi-information" aria-hidden="true"></i>
                      {{ menuForm.parentId ? 'Selecciona dónde colocar este elemento dentro del submenú. El orden determina cómo aparecerán los elementos en la navegación.' : 'Selecciona dónde colocar este elemento en el menú principal. Los elementos se mostrarán en el orden que elijas.' }}
                    </div>
                    <div class="help-text" style="margin-top: 8px; color: #6b7280;">
                      <i class="mdi mdi-lightbulb-outline" aria-hidden="true"></i>
                      💡 <strong>Consejo:</strong> Puedes reorganizar los menús más tarde editándolos y cambiando su posición.
                    </div>
                  </div>

                  <!-- Checkbox para crear submenús (solo para menús principales) -->
                  <div v-if="menuForm.parentId === null && !isEditing" class="form-group">
                    <label class="checkbox-label">
                      <input
                        id="createSubmenus"
                        v-model="menuForm.createSubmenus"
                        type="checkbox"
                        class="form-checkbox"
                        aria-describedby="createSubmenus-help"
                      />
                      <span class="checkbox-text">
                        <i class="mdi mdi-plus-box-multiple" aria-hidden="true"></i>
                        Crear submenús junto con este menú
                      </span>
                    </label>
                    <div class="help-text" id="createSubmenus-help">
                      <i class="mdi mdi-information" aria-hidden="true"></i>
                      Activa esta opción para crear submenús al mismo tiempo que el menú principal
                    </div>
                  </div>

                  <!-- Sección de submenús (solo si está activada) -->
                  <div v-if="menuForm.createSubmenus && menuForm.parentId === null && !isEditing" class="form-section submenu-section">
                    <h4 class="section-title">
                      <i class="mdi mdi-file-tree" aria-hidden="true"></i>
                      Submenús a Crear
                    </h4>

                    <!-- Lista de submenús -->
                    <div class="submenus-list">
                      <div
                        v-for="(submenu, index) in menuForm.submenus"
                        :key="index"
                        class="submenu-item"
                      >
                        <div class="submenu-header">
                          <h5 class="submenu-title">
                            <i class="mdi mdi-subdirectory-arrow-right" aria-hidden="true"></i>
                            Submenú {{ index + 1 }}
                          </h5>
                          <button
                            type="button"
                            @click="removeSubmenu(index)"
                            class="remove-submenu-btn"
                            :aria-label="`Eliminar submenú ${index + 1}`"
                          >
                            <i class="mdi mdi-close" aria-hidden="true"></i>
                          </button>
                        </div>

                        <div class="submenu-fields">
                          <div class="form-group">
                            <label :for="`submenu-name-${index}`" class="form-label">
                              <i class="mdi mdi-format-title" aria-hidden="true"></i>
                              Nombre del Submenú *
                            </label>
                            <input
                              :id="`submenu-name-${index}`"
                              v-model="submenu.name"
                              type="text"
                              class="form-input"
                              placeholder="Ej: Configuración"
                              @input="generateSubmenuPath(index)"
                              required
                            />
                          </div>

                          <div class="form-group">
                            <label :for="`submenu-path-${index}`" class="form-label">
                              <i class="mdi mdi-link" aria-hidden="true"></i>
                              Ruta del Submenú *
                            </label>
                            <input
                              :id="`submenu-path-${index}`"
                              v-model="submenu.path"
                              type="text"
                              class="form-input"
                              placeholder="Ej: /configuracion"
                              required
                            />
                          </div>

                          <div class="form-group">
                            <label :for="`submenu-icon-${index}`" class="form-label">
                              <i class="mdi mdi-emoticon-outline" aria-hidden="true"></i>
                              Icono del Submenú
                            </label>
                            <IconSelector
                              :id="`submenu-icon-${index}`"
                              v-model="submenu.icon"
                              :placeholder="'Seleccionar icono para el submenú'"
                            />
                          </div>
                        </div>
                      </div>

                      <!-- Botón para agregar nuevo submenú -->
                      <button
                        type="button"
                        @click="addSubmenu"
                        class="add-submenu-btn"
                        aria-label="Agregar nuevo submenú"
                      >
                        <i class="mdi mdi-plus" aria-hidden="true"></i>
                        Agregar Submenú
                      </button>
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">
                      <i class="mdi mdi-account-key" aria-hidden="true"></i>
                      Roles de Acceso *
                    </label>
                    <fieldset class="roles-selector" aria-describedby="roles-help">
                      <legend class="sr-only">Seleccionar roles que pueden acceder a este menú</legend>
                      <div
                        v-for="role in availableRoles"
                        :key="role.value"
                        class="role-option"
                      >
                        <label class="checkbox-label">
                          <input
                            v-model="menuForm.roles"
                            :value="role.value"
                            type="checkbox"
                            class="form-checkbox"
                            :id="`role-${role.value}`"
                            :aria-describedby="`role-${role.value}-desc`"
                          />
                          <span class="checkbox-text">
                            <i :class="['mdi', role.icon]" aria-hidden="true"></i>
                            {{ role.label }}
                          </span>
                        </label>
                        <div class="role-description" :id="`role-${role.value}-desc`">{{ role.description }}</div>
                      </div>
                    </fieldset>
                    <div v-if="validationErrors.roles" class="error-message" role="alert">
                      <i class="mdi mdi-alert-circle" aria-hidden="true"></i>
                      {{ validationErrors.roles }}
                    </div>
                    <div class="help-text" id="roles-help">
                      <i class="mdi mdi-information" aria-hidden="true"></i>
                      Selecciona los roles que tendrán acceso a este menú
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="checkbox-label">
                      <input
                        id="menuActive"
                        v-model="menuForm.isActive"
                        type="checkbox"
                        class="form-checkbox"
                        aria-describedby="menuActive-help"
                      />
                      <span class="checkbox-text">
                        <i class="mdi mdi-check-circle" aria-hidden="true"></i>
                        Menú activo
                      </span>
                    </label>
                    <div class="help-text" id="menuActive-help">
                      <i class="mdi mdi-information" aria-hidden="true"></i>
                      Los menús inactivos no aparecerán en la navegación
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div class="dialog-footer">
              <button
                type="button"
                @click="openPreview"
                class="btn btn-secondary"
                :disabled="!validateForm()"
                aria-label="Vista previa del menú"
              >
                <i class="mdi mdi-eye" aria-hidden="true"></i>
                Vista Previa
              </button>
              <button
                type="button"
                @click="closeDialog"
                class="btn btn-secondary"
                aria-label="Cancelar y cerrar modal"
              >
                <i class="mdi mdi-close" aria-hidden="true"></i>
                Cancelar
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="!validateForm()"
                :aria-label="isEditing ? 'Actualizar menú existente' : 'Crear nuevo menú'"
                form="menu-form"
              >
                <i class="mdi mdi-content-save" aria-hidden="true"></i>
                {{ isEditing ? 'Actualizar' : 'Crear' }} Menú
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
                <i class="mdi mdi-eye"></i>
                Vista Previa del Menú
              </h3>
              <button @click="closePreview" class="close-btn">
                <i class="mdi mdi-close"></i>
              </button>
            </div>

            <div class="preview-content">
              <!-- Simulación del menú en el sidebar -->
              <div class="sidebar-preview">
                <h4>Cómo se verá en el menú lateral:</h4>
                <div class="menu-item-preview">
                  <i :class="['mdi', previewMenu?.icon]"></i>
                  <span>{{ previewMenu?.name }}</span>
                </div>
              </div>

              <!-- Información del menú -->
              <div class="menu-details">
                <h4>Detalles del menú:</h4>
                <div class="detail-item">
                  <strong>Nombre:</strong> {{ previewMenu?.name }}
                </div>
                <div class="detail-item">
                  <strong>Ruta:</strong> {{ previewMenu?.path }}
                </div>
                <div class="detail-item">
                  <strong>Icono:</strong>
                  <i :class="['mdi', previewMenu?.icon]"></i>
                  {{ previewMenu?.icon }}
                </div>
                <div class="detail-item">
                  <strong>Plantilla:</strong>
                  {{ viewTemplates.find(t => t.value === previewMenu?.template)?.name }}
                </div>
                <div class="detail-item">
                  <strong>Orden:</strong> {{ previewMenu?.order }}
                </div>
                <div class="detail-item">
                  <strong>Estado:</strong>
                  <span :class="previewMenu?.isActive ? 'status-active' : 'status-inactive'">
                    {{ previewMenu?.isActive ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="preview-actions">
              <button @click="closePreview" class="btn btn-secondary" title="Cerrar vista previa sin guardar cambios">
                <i class="mdi mdi-close"></i>
                Cerrar
              </button>
              <button @click="saveMenu(); closePreview()" class="btn btn-primary" title="Guardar el menú con la configuración actual">
                <i class="mdi mdi-check"></i>
                Confirmar y Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import SidebarMenu from '@/components/common/SidebarMenu.vue'
import AppHeader from '@/components/common/AppHeader.vue'
import MenuTreeNode from '@/components/MenuTreeNode.vue'
import MenuTreeSelector from '@/components/MenuTreeSelector.vue'
import DeleteMenuModal from '@/components/DeleteMenuModal.vue'
import IconSelector from '@/components/IconSelector.vue'
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
const menuForm = ref({
  name: '',
  path: '',
  icon: '',
  template: 'basic',
  order: 1,
  parentId: null,
  roles: [],
  isActive: true,
  createSubmenus: false,
  submenus: []
})

// Watcher para actualizar el orden cuando cambie el parentId
watch(() => menuForm.value.parentId, () => {
  if (!isEditing.value) {
    nextTick(() => {
      if (availablePositions.value.length > 0) {
        menuForm.value.order = availablePositions.value[0].value
      }
    })
  }
})

// Estado de validaciones
const validationErrors = ref({})

// Estado de vista previa
const showPreview = ref(false)
const previewMenu = ref(null)

// Estado de carga y errores
const isLoading = ref(false)
const error = ref(null)

// Estado del modal de eliminación
const showDeleteModal = ref(false)
const menuToDelete = ref(null)
const menuToDeleteChildren = ref([])

// Estado de iconos - Eliminado, ahora se maneja en IconSelector
// const searchQuery = ref('')
// const selectedCategory = ref('all')

// Estado de vista
const viewMode = ref('grid') // 'grid' o 'tree'

// Estado para vista de árbol
const expandedNodes = ref([])

// Estado para búsqueda y ayuda
const searchQuery = ref('')
const showHelp = ref(false)

// Menús existentes (cargados desde el backend)
const menus = ref([])

// Función para expandir/contraer nodos en vista de árbol
const toggleExpand = (nodeId) => {
  const index = expandedNodes.value.indexOf(nodeId)
  if (index > -1) {
    expandedNodes.value.splice(index, 1)
  } else {
    expandedNodes.value.push(nodeId)
  }
}

// Función para cargar menús desde el backend
// Función para verificar y renovar token si es necesario
const verifyAndRefreshToken = async () => {
  if (!authStore.accessToken) {
    router.push('/login')
    return false
  }

  try {
    // Verificar si el token es válido
    await authService.verifyToken()
    return true
  } catch (error) {
    try {
      await authStore.refreshAccessToken()
      return true
    } catch (refreshError) {
      authStore.logout()
      router.push('/login')
      return false
    }
  }
}

const loadMenus = async () => {
  isLoading.value = true
  error.value = null

  try {
    // Usar la misma función que usa el sidebar (authService.fetchMenus)
    // que apunta a /menu en lugar de /menus
    const menuData = await authService.fetchMenus()

    // Inspeccionar estructura de cada menú
    if (Array.isArray(menuData) && menuData.length > 0) {
      menus.value = menuData

      // También actualizar el store para mantener consistencia
      authStore.setMenus(menuData)
    } else {
      menus.value = []
    }
  } catch (err) {
    // Si hay error, intentar usar los menús ya cargados en el store
    if (authStore.menus && authStore.menus.length > 0) {
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
    value: 'basic',
    name: 'Vista Básica',
    description: 'Página simple con contenido estático',
    icon: 'mdi mdi-file-document-outline',
    features: ['Contenido Simple', 'Texto e Imágenes', 'Fácil de Usar']
  },
  {
    value: 'form',
    name: 'Vista de Formulario',
    description: 'Formulario para captura de datos',
    icon: 'mdi mdi-form-select',
    features: ['Campos de Entrada', 'Validaciones', 'Envío de Datos']
  },
  {
    value: 'table',
    name: 'Vista de Tabla',
    description: 'Listado de datos con funciones CRUD',
    icon: 'mdi mdi-table',
    features: ['Listado de Datos', 'Búsqueda', 'Paginación', 'CRUD']
  },
  {
    value: 'dashboard',
    name: 'Vista de Dashboard',
    description: 'Panel con métricas y gráficos',
    icon: 'mdi mdi-view-dashboard',
    features: ['Métricas', 'Gráficos', 'Widgets', 'Tiempo Real']
  }
]

// Roles disponibles
const availableRoles = [
  {
    value: 'ROLE_SUPER_USER',
    label: 'Super Usuario',
    icon: 'mdi mdi-account-star',
    description: 'Acceso completo al sistema'
  },
  {
    value: 'ROLE_ADMIN',
    label: 'Administrador',
    icon: 'mdi mdi-account-key',
    description: 'Gestión de usuarios y configuración'
  },
  {
    value: 'ROLE_COLLABORATOR',
    label: 'Colaborador',
    icon: 'mdi mdi-account-group',
    description: 'Acceso a funciones básicas'
  }
]

// Computed
const filteredMenus = computed(() => {
  return menus.value
})

const availableParentMenus = computed(() => {
  // Función recursiva para obtener todos los menús y submenús disponibles
  const getAllMenusRecursive = (menuList, level = 0) => {
    let result = []

    for (const menu of menuList) {
      // Evitar referencias circulares - no incluir el menú actual si estamos editando
      if (isEditing.value && menu.id === menuForm.value.id) {
        continue
      }

      // Agregar el menú actual con indicador de nivel
      const menuWithLevel = {
        ...menu,
        displayName: '  '.repeat(level) + (level > 0 ? '└─ ' : '') + menu.name,
        level: level
      }
      result.push(menuWithLevel)

      // Si tiene hijos, agregarlos recursivamente
      const children = getMenuChildren(menu.id)
      if (children.length > 0) {
        result = [...result, ...getAllMenusRecursive(children, level + 1)]
      }
    }

    return result
  }

  // Obtener todos los menús raíz y sus descendientes
  const rootMenus = menus.value.filter(menu => !menu.parentId)
  return getAllMenusRecursive(rootMenus)
})

const rootMenus = computed(() => {
  return menus.value
    .filter(menu => !menu.parentId)
    .sort((a, b) => a.order - b.order)
})

const availablePositions = computed(() => {
  let siblingMenus = []

  if (menuForm.parentId) {
    // Si es un submenú, obtener los hermanos del mismo padre
    siblingMenus = menus.value
      .filter(menu => menu.parentId === menuForm.parentId && menu.id !== editingMenuId.value)
      .sort((a, b) => a.order - b.order)
  } else {
    // Si es un menú raíz, obtener todos los menús raíz
    siblingMenus = menus.value
      .filter(menu => !menu.parentId && menu.id !== editingMenuId.value)
      .sort((a, b) => a.order - b.order)
  }

  const positions = []

  // Opción para colocar al principio
  positions.push({
    value: 1,
    label: '🔝 Al principio'
  })

  // Opciones para colocar después de cada menú existente
  siblingMenus.forEach((menu, index) => {
    positions.push({
      value: index + 2,
      label: `📍 Después de "${menu.name}"`
    })
  })

  // Si no hay menús hermanos, la primera posición ya está agregada arriba
  
  return positions
})

// displayedIcons ahora se maneja en IconSelector.vue

// Métodos
const openDialog = () => {
  resetForm()
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  if (!isEditing.value) {
    resetForm()
  } else {
    // Solo resetear el estado de edición, mantener los datos del formulario
    isEditing.value = false
    validationErrors.value = {}
  }
}

const editMenu = (menu) => {
  // Crear una copia del menú y asegurar que roles sea un array
  const menuCopy = { ...menu }

  // Procesar roles para asegurar que sea un array
  if (typeof menu.roles === 'string') {
    // Si roles es un string, convertir a array
    if (menu.roles.includes(',')) {
      menuCopy.roles = menu.roles.split(',').map(role => role.trim())
    } else {
      menuCopy.roles = [menu.roles]
    }
  } else if (!Array.isArray(menu.roles)) {
    // Si no es array ni string, inicializar como array vacío
    menuCopy.roles = []
  }

  menuForm.value = menuCopy
  editingMenuId.value = menu.id
  isEditing.value = true
  showDialog.value = true
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

const handleDeleteConfirm = async (confirmData) => {
  try {
    isLoading.value = true
    error.value = null

    const { menuId, mode, selectedChildren, allChildren } = confirmData

    switch (mode) {
      case 'delete-all':
        // Eliminar todos los submenús primero, luego el menú principal
        for (const childId of allChildren) {
          await menuService.deleteMenu(childId)
        }
        await menuService.deleteMenu(menuId)
        break

      case 'selective':
        // Eliminar solo los submenús seleccionados, mantener el menú principal
        for (const childId of selectedChildren) {
          await menuService.deleteMenu(childId)
        }

        // Mover los submenús no seleccionados al nivel raíz
        const childrenToKeep = allChildren.filter(id => !selectedChildren.includes(id))
        for (const childId of childrenToKeep) {
          const childMenu = findMenuById(childId)
          if (childMenu) {
            await menuService.updateMenu(childId, { ...childMenu, parentId: null })
          }
        }

        // NO eliminar el menú principal en modo selectivo
        break

      case 'keep-children':
        // Solo eliminar el menú principal, mover todos los hijos al nivel raíz
        for (const childId of allChildren) {
          const childMenu = findMenuById(childId)
          if (childMenu) {
            await menuService.updateMenu(childId, { ...childMenu, parentId: null })
          }
        }
        await menuService.deleteMenu(menuId)
        break

      default:
        throw new Error(`Modo de eliminación no válido: ${mode}`)
    }

    // Recargar la lista de menús
    await loadMenus()

    // Cerrar el modal
    closeDeleteModal()

  } catch (error) {
    error.value = error.message
  } finally {
    isLoading.value = false
  }
}

const saveMenu = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true
  error.value = null

  try {
    let parentMenuResult = null

    if (isEditing.value) {
      parentMenuResult = await menuService.updateMenu(menuForm.value.id, menuForm.value)
    } else {
      // Crear el menú principal con orden temporal alto para evitar conflictos
      const tempMenuData = {
        ...menuForm.value,
        order: 9999 // Orden temporal muy alto
      }
      parentMenuResult = await menuService.createMenu(tempMenuData)

      // Ahora mover el menú a la posición correcta usando la misma lógica del arrastre
      if (menuForm.value.order !== 9999) {
        await menuService.moveMenu({
          menuId: parentMenuResult.id,
          parentId: menuForm.value.parentId,
          order: menuForm.value.order
        })
      }

      // Si se activó la creación de submenús y hay submenús definidos
      if (menuForm.value.createSubmenus && menuForm.value.submenus.length > 0) {
        console.log('Iniciando creación de submenús:', menuForm.value.submenus)
        const parentMenuId = parentMenuResult.id

        // Recargar menús antes de crear submenús para tener el estado actualizado
        await loadMenus()

        // Crear cada submenú con un pequeño delay para evitar conflictos
        for (let i = 0; i < menuForm.value.submenus.length; i++) {
          const submenu = menuForm.value.submenus[i]
          console.log(`Procesando submenú ${i + 1}:`, submenu)
          
          if (submenu.name && submenu.path) {
            const submenuData = {
              name: submenu.name,
              path: submenu.path,
              icon: submenu.icon || '',
              template: submenu.template || 'basic',
              order: 9999, // Usar orden temporal alto para evitar conflictos
              parentId: parentMenuId,
              roles: submenu.roles && submenu.roles.length > 0 ? submenu.roles : menuForm.value.roles || [],
              isActive: submenu.isActive !== undefined ? submenu.isActive : true
            }

            console.log(`Datos del submenú a crear:`, submenuData)

            try {
              const submenuResult = await menuService.createMenu(submenuData)
              console.log(`Submenú creado exitosamente:`, submenuResult)
              
              // Pequeño delay entre creaciones para evitar conflictos de concurrencia
              if (i < menuForm.value.submenus.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100))
              }
              
              // Mover el submenú a la posición correcta si es necesario
              const targetOrder = submenu.order || (i + 1)
              if (targetOrder !== 9999) {
                console.log(`Moviendo submenú a posición ${targetOrder}`)
                await menuService.moveMenu({
                  menuId: submenuResult.id,
                  parentId: parentMenuId,
                  order: targetOrder
                })
              }
            } catch (submenuError) {
              console.error(`Error creando submenú "${submenu.name}":`, submenuError)
              // Mostrar el error al usuario también
              error.value = `Error creando submenú "${submenu.name}": ${submenuError.message}`
            }
          } else {
            console.warn(`Submenú ${i + 1} omitido - falta nombre o ruta:`, submenu)
          }
        }
        console.log('Finalizada creación de submenús')
      } else {
        console.log('No se crearán submenús:', {
          createSubmenus: menuForm.value.createSubmenus,
          submenusLength: menuForm.value.submenus.length,
          submenus: menuForm.value.submenus
        })
      }
    }

    // Recargar la lista de menús
    await loadMenus()

    // Cerrar el diálogo
    closeDialog()
  } catch (err) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  menuForm.value = {
    name: '',
    path: '',
    icon: '',
    template: 'basic',
    order: 1,
    parentId: null,
    roles: [],
    isActive: true,
    createSubmenus: false,
    submenus: []
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
    const path = '/' + menuForm.value.name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    menuForm.value.path = path
  }
  validateForm()
}

const validateForm = () => {
  const errors = {}

  // Validar nombre
  if (!menuForm.value.name.trim()) {
    errors.name = 'El nombre del menú es obligatorio'
  } else if (menuForm.value.name.length < 3) {
    errors.name = 'El nombre debe tener al menos 3 caracteres'
  } else if (menuForm.value.name.length > 50) {
    errors.name = 'El nombre no puede exceder 50 caracteres'
  }

  // Validar ruta
  if (!menuForm.value.path.trim()) {
    errors.path = 'La ruta es obligatoria'
  } else if (!menuForm.value.path.startsWith('/')) {
    errors.path = 'La ruta debe comenzar con /'
  } else if (!/^\/[a-z0-9\-\/]*$/.test(menuForm.value.path)) {
    errors.path = 'La ruta solo puede contener letras minúsculas, números, guiones y barras'
  }

  // Validar icono
  if (!menuForm.value.icon) {
    errors.icon = 'Debe seleccionar un icono'
  }

  // Validar plantilla
  if (!menuForm.value.template) {
    errors.template = 'Debe seleccionar una plantilla de vista'
  }

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
        } else if (!submenu.path.startsWith('/')) {
          submenuErrors.path = `La ruta del submenú ${index + 1} debe comenzar con /`
        } else if (!/^\/[a-z0-9\-\/]*$/.test(submenu.path)) {
          submenuErrors.path = `La ruta del submenú ${index + 1} solo puede contener letras minúsculas, números, guiones y barras`
        }

        // Verificar rutas duplicadas entre submenús
        const duplicatePath = menuForm.value.submenus.find((otherSubmenu, otherIndex) =>
          otherIndex !== index && otherSubmenu.path === submenu.path && submenu.path.trim()
        )
        if (duplicatePath) {
          submenuErrors.path = `La ruta del submenú ${index + 1} está duplicada`
        }

        // Verificar nombres duplicados entre submenús
        const duplicateName = menuForm.value.submenus.find((otherSubmenu, otherIndex) =>
          otherIndex !== index && otherSubmenu.name.toLowerCase() === submenu.name.toLowerCase() && submenu.name.trim()
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

  return Object.keys(errors).length === 0
}

const openPreview = () => {
  if (!validateForm()) return

  previewMenu.value = {
    ...menuForm.value,
    id: Date.now(),
    createdAt: new Date().toISOString()
  }
  showPreview.value = true
}

const closePreview = () => {
  showPreview.value = false
  previewMenu.value = null
}

// Funciones auxiliares
const getParentMenuName = (parentId) => {
  const parent = menus.value.find(menu => menu.id === parentId)
  return parent ? parent.name : 'Desconocido'
}

const getRoleLabel = (roleValue) => {
  const role = availableRoles.find(r => r.value === roleValue)
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
  const flatChildren = menus.value.filter(menu => menu.parentId === menuId)

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
  const uniqueChildren = allChildren.filter((child, index, self) =>
    index === self.findIndex(c => c.id === child.id)
  )

  return uniqueChildren
}

// Función auxiliar para buscar un menú por ID en cualquier estructura
const findMenuById = (menuId) => {
  // Buscar en la estructura plana
  let menu = menus.value.find(m => m.id === menuId)
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
      children: menu.children ? menu.children.map(child => processMenu(child)) : []
    }
    return processedMenu
  }

  // Procesar todos los menús (que ya son menús raíz del backend)
  const hierarchy = menus.value.map(menu => processMenu(menu))

  return hierarchy
}

// Computed para obtener menús con jerarquía
const hierarchicalMenus = computed(() => {
  const result = buildMenuHierarchy()
  return result
})

// Computed para filtrar menús jerárquicos basado en la búsqueda
const filteredHierarchicalMenus = computed(() => {
  if (!searchQuery.value.trim()) {
    return hierarchicalMenus.value
  }

  const query = searchQuery.value.toLowerCase().trim()

  // Función recursiva para filtrar menús y sus hijos
  const filterMenusRecursive = (menuList) => {
    return menuList.filter(menu => {
      // Verificar si el menú actual coincide con la búsqueda
      const matchesSearch =
        menu.name.toLowerCase().includes(query) ||
        (menu.path && menu.path.toLowerCase().includes(query))

      // Filtrar los hijos recursivamente
      const filteredChildren = menu.children ? filterMenusRecursive(menu.children) : []

      // Incluir el menú si:
      // 1. El menú actual coincide con la búsqueda, O
      // 2. Alguno de sus hijos coincide con la búsqueda
      if (matchesSearch || filteredChildren.length > 0) {
        return {
          ...menu,
          children: filteredChildren
        }
      }

      return false
    }).filter(Boolean)
  }

  return filterMenusRecursive(hierarchicalMenus.value)
})

const createSubmenu = (parentMenu) => {
  // Resetear el formulario
  resetForm()

  // Configurar como submenú del menú seleccionado
  menuForm.value.parentId = parentMenu.id

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

    // Usar el nuevo método específico para mover menús
    await menuService.moveMenu({
      menuId: moveData.menuId,
      parentId: moveData.newParentId,
      order: moveData.newOrder
    })

    await loadMenus() // Recargar la lista
  } catch (err) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}

// Métodos para búsqueda
const handleSearch = () => {
  // La búsqueda se maneja automáticamente a través de la propiedad computada
  // Este método se puede usar para lógica adicional si es necesario
}

const clearSearch = () => {
  searchQuery.value = ''
}

// Funciones para manejo de submenús
const addSubmenu = () => {
  menuForm.value.submenus.push({
    name: '',
    path: '',
    icon: '',
    template: 'basic',
    order: menuForm.value.submenus.length + 1,
    roles: [...(menuForm.value.roles || [])], // Heredar roles del menú padre
    isActive: menuForm.value.isActive !== undefined ? menuForm.value.isActive : true
  })
}

const removeSubmenu = (index) => {
  menuForm.value.submenus.splice(index, 1)
  // Reordenar los submenús restantes
  menuForm.value.submenus.forEach((submenu, idx) => {
    submenu.order = idx + 1
  })
}

const generateSubmenuPath = (index) => {
  const submenu = menuForm.value.submenus[index]
  if (submenu.name && !isEditing.value) {
    const path = '/' + submenu.name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    submenu.path = path
  }
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

// Watchers
watch(() => menuForm.value.name, validateForm)
watch(() => menuForm.value.path, validateForm)
watch(() => menuForm.value.icon, validateForm)
watch(() => menuForm.value.template, validateForm)

onMounted(() => {
  // Verificar permisos de SuperAdmin
  if (!checkSuperAdminAccess()) {
    return
  }

  // Cargar menús desde el backend
  loadMenus()
})
</script>

<style scoped>
/* Variables CSS - Usando variables globales de tema */
.menu-manager-layout {
  /* Las variables CSS se toman del archivo themes.css global */
  /* No necesitamos redefinir las variables aquí */
}

/* Layout principal */
.menu-manager-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-secondary);
}

.main-content {
  flex: 1;
  margin-left: 80px;
  padding-top: 80px;
  transition: margin-left 0.3s ease;
}

.main-content.sidebar-expanded {
  margin-left: 280px;
}

.main-content.with-header {
  padding-top: 80px;
}

.menu-manager-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.manager-header {
  text-align: center;
  margin-bottom: 3rem;
}

.manager-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.manager-title i {
  color: var(--accent-primary);
}

.manager-subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin: 0;
  max-width: 600px;
  margin: 0 auto;
}

/* Barra de acciones */
.action-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

/* Opciones de visualización */
.menu-display-options {
  margin-bottom: 2rem;
}

.view-toggle {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  background: var(--bg-primary);
  padding: 0.5rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 8px var(--shadow-color);
  max-width: 400px;
  margin: 0 auto;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  justify-content: center;
  min-width: 0;
}

.toggle-btn i {
  font-size: 1.1rem;
  color: inherit;
}

.toggle-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  transform: translateY(-1px);
}

.toggle-btn.active {
  background: linear-gradient(135deg, var(--accent-color), #1d4ed8);
  color: white;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

.toggle-btn.active:hover {
  background: linear-gradient(135deg, #1d4ed8, var(--accent-color));
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

.create-menu-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, var(--accent-primary), var(--button-primary-hover));
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(var(--primary-color-rgb), 0.3);
}

.create-menu-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(var(--primary-color-rgb), 0.4);
}

/* Grid de menús */
.menus-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.menu-card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border-primary);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px var(--shadow-primary);
}

.menu-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px var(--shadow-primary);
  border-color: var(--accent-primary);
}

.menu-card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.menu-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--accent-primary), var(--button-primary-hover));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.menu-icon i {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  line-height: 1;
}

.menu-info h3 {
  margin: 0 0 0.25rem 0;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
}

.menu-info p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* Estilos para metadatos del menú */
.menu-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.menu-order,
.menu-parent {
  font-size: 0.8rem;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.menu-path {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-family: 'Courier New', monospace;
  background: var(--bg-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin: 0.5rem 0;
}

.menu-roles {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.role-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  background: var(--accent-primary);
  color: white;
  font-weight: 500;
}

.menu-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.edit-btn, .delete-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn {
  background: rgba(var(--accent-rgb), 0.1);
  color: var(--accent-primary);
}

.edit-btn:hover {
  background: rgba(var(--accent-rgb), 0.2);
}

.delete-btn {
  background: rgba(220, 38, 38, 0.1);
  color: var(--error-color);
}

.delete-btn:hover {
  background: rgba(220, 38, 38, 0.2);
}

/* Clase para elementos ocultos visualmente pero accesibles para lectores de pantalla */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Modal */
.dialog-overlay, .modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dialog-content {
  background: var(--bg-primary);
  border-radius: 20px;
  width: 100%;
  max-width: 950px;
  max-height: 95vh;
  overflow: hidden;
  box-shadow:
    0 25px 80px rgba(0, 0, 0, 0.25),
    0 0 0 1px var(--border-color);
  animation: slideIn 0.3s ease-out;
  border: 1px solid var(--border-primary);
  display: flex;
  flex-direction: column;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2.5rem;
  background: var(--primary-color);
  color: white;
  position: relative;
  overflow: hidden;
}

.dialog-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.1));
  pointer-events: none;
}

.dialog-header h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  position: relative;
  z-index: 1;
}

.dialog-header h2 i {
  font-size: 1.75rem;
  opacity: 0.9;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 12px;
  transition: all 0.2s ease;
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dialog-body {
  padding: 2.5rem;
  max-height: calc(95vh - 200px);
  overflow-y: auto;
  background: var(--bg-primary);
  flex: 1;
}

/* Scrollbar personalizado para el modal */
.dialog-body::-webkit-scrollbar {
  width: 8px;
}

.dialog-body::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: 4px;
}

.dialog-body::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.dialog-body::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

/* Secciones del formulario */
.form-section {
  margin-bottom: 2.5rem;
  padding: 2rem;
  background: var(--bg-secondary);
  border-radius: 16px;
  border: 1px solid var(--border-primary);
  transition: all 0.2s ease;
}

.form-section:hover {
  border-color: var(--accent-primary);
  box-shadow: 0 4px 20px rgba(var(--accent-rgb), 0.1);
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1.75rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--accent-primary);
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 40px;
  height: 2px;
  background: var(--accent-secondary);
  border-radius: 1px;
}

.section-title i {
  color: var(--accent-primary);
  font-size: 1.5rem;
}

/* Campos del formulario */
.form-group {
  margin-bottom: 2rem;
  position: relative;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  font-size: 1rem;
  letter-spacing: 0.025em;
}

.form-label i {
  color: var(--accent-primary);
  font-size: 1.25rem;
}

.form-input, .form-select {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 2px solid var(--input-border);
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--input-bg);
  color: var(--text-primary);
  box-shadow:
    inset 0 1px 3px rgba(0, 0, 0, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.05);
  position: relative;
}

.form-input::placeholder, .form-select option {
  color: var(--text-muted);
  opacity: 0.7;
  font-weight: 400;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow:
    0 0 0 4px rgba(var(--accent-rgb), 0.15),
    inset 0 1px 3px rgba(0, 0, 0, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.1);
  background: var(--bg-primary);
  transform: translateY(-1px);
}

.form-input:hover:not(:focus), .form-select:hover:not(:focus) {
  border-color: var(--accent-primary);
  box-shadow:
    inset 0 1px 3px rgba(0, 0, 0, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.08);
}

.form-input.error, .form-select.error {
  border-color: var(--accent-danger);
  background: rgba(239, 68, 68, 0.05);
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.form-input.error:focus, .form-select.error:focus {
  border-color: var(--accent-danger);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}

/* Mensajes de error y ayuda */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #dc2626 !important;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(220, 38, 38, 0.1) !important;
  border: 1px solid rgba(220, 38, 38, 0.2) !important;
  border-radius: 6px;
}

.error-message i {
  font-size: 1rem;
}

.help-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: var(--bg-hover);
  border: 1px solid var(--input-border);
  border-radius: 6px;
}

.help-text i {
  color: var(--accent-primary);
  font-size: 1rem;
}

/* Selector de iconos */
.icon-selector {
  border: 1px solid var(--input-border);
  border-radius: 12px;
  padding: 1.5rem;
  background: var(--bg-secondary);
}

.selected-icon {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-primary);
  border: 2px solid var(--accent-primary);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.selected-icon i {
  font-size: 1.5rem;
  color: var(--accent-primary);
}

.clear-icon {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
}

.clear-icon:hover {
  background: var(--bg-hover);
}

.icon-search {
  position: relative;
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid var(--input-border);
  border-radius: 8px;
  font-size: 0.9rem;
  background: var(--input-bg);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.search-input::placeholder {
  color: var(--text-muted);
  opacity: 0.8;
}

.search-input:focus {
  outline: none;
  border-color: var(--input-focus);
  box-shadow: 0 0 0 3px var(--focus-shadow);
  background: var(--bg-primary);
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

.icon-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.category-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--input-border);
  background: var(--bg-primary);
  color: var(--text-secondary);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.category-btn:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.category-btn.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.icon-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.25rem;
  color: var(--text-secondary);
}

.icon-item:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
  transform: scale(1.05);
}

.icon-item.selected {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.no-icons-found {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.no-icons-found i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

/* Selector de plantillas mejorado */
.template-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.template-option {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.template-option:hover {
  border-color: var(--accent-primary);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px var(--shadow-color);
}

.template-option.selected {
  border-color: var(--accent-primary);
  background: rgba(var(--accent-rgb), 0.05);
  box-shadow: 0 8px 25px rgba(var(--accent-rgb), 0.2);
}

.template-option.selected::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
}

.template-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.template-preview i {
  font-size: 2rem;
  color: var(--accent-primary);
  flex-shrink: 0;
}

.template-mockup {
  flex: 1;
  height: 80px;
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
}

/* Mockups específicos */
.mockup-basic {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mockup-header {
  height: 20px;
  background: var(--accent-color);
  border-radius: 4px;
  opacity: 0.7;
}

.mockup-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mockup-line {
  height: 8px;
  background: var(--text-secondary);
  border-radius: 2px;
  opacity: 0.3;
}

.mockup-line.short {
  width: 60%;
}

.mockup-form {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mockup-field {
  height: 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.mockup-button {
  height: 16px;
  width: 50%;
  background: var(--accent-color);
  border-radius: 4px;
  opacity: 0.7;
  margin-top: auto;
}

.mockup-table {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mockup-table-header {
  height: 12px;
  background: var(--accent-color);
  border-radius: 2px;
  opacity: 0.7;
}

.mockup-table-row {
  height: 10px;
  background: var(--text-secondary);
  border-radius: 2px;
  opacity: 0.2;
}

.mockup-dashboard {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mockup-cards {
  display: flex;
  gap: 0.5rem;
  height: 30px;
}

.mockup-card {
  flex: 1;
  background: var(--accent-color);
  border-radius: 4px;
  opacity: 0.6;
}

.mockup-chart {
  flex: 1;
  background: linear-gradient(45deg, var(--accent-color) 0%, transparent 50%, var(--accent-color) 100%);
  border-radius: 4px;
  opacity: 0.3;
}

.template-info {
  text-align: left;
}

.template-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.template-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

.template-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.feature-tag {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: rgba(var(--accent-rgb), 0.1);
  color: var(--accent-primary);
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid rgba(var(--accent-rgb), 0.2);
}

.template-option.selected .feature-tag {
  background: rgba(var(--accent-rgb), 0.15);
  border-color: rgba(var(--accent-rgb), 0.3);
}

/* Checkbox */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.form-checkbox {
  width: 1.25rem;
  height: 1.25rem;
}

.checkbox-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

/* Footer del diálogo */
.dialog-footer {
  display: flex !important;
  justify-content: flex-end;
  gap: 1.25rem;
  padding: 2rem 2.5rem;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-primary);
  backdrop-filter: blur(10px);
  position: relative;
  visibility: visible !important;
  opacity: 1 !important;
  z-index: 1000;
  flex-shrink: 0;
  min-height: 80px;
}

.dialog-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent-primary), transparent);
  opacity: 0.3;
}

/* Botones */
.btn {
  display: flex !important;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  position: relative;
  overflow: hidden;
  letter-spacing: 0.025em;
  visibility: visible !important;
  opacity: 1 !important;
  z-index: 1001;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.btn:hover::before {
  left: 100%;
}

.btn:disabled {
  opacity: 0.75 !important;
  cursor: not-allowed;
  border: 2px solid var(--border-primary);
  background: var(--bg-secondary) !important;
  color: var(--text-secondary) !important;
  box-shadow: none !important;
  position: relative;
  display: flex !important;
  visibility: visible !important;
}

.btn:disabled::before {
  display: none;
}

.btn:disabled::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 2px,
    rgba(var(--text-rgb, 0, 0, 0), 0.1) 2px,
    rgba(var(--text-rgb, 0, 0, 0), 0.1) 4px
  );
  border-radius: inherit;
  pointer-events: none;
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  box-shadow: 0 4px 15px rgba(var(--accent-rgb), 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(var(--accent-rgb), 0.4);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(var(--accent-rgb), 0.3);
}

.btn-secondary {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 2px solid var(--border-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-hover);
  border-color: var(--accent-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.btn-secondary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
}

/* Modal de Vista Previa */
.preview-modal {
  background: var(--bg-primary);
  border-radius: 16px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, var(--accent-color), #1d4ed8);
  color: white;
}

.preview-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1.25rem;
}

.preview-content {
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  max-height: 60vh;
  overflow-y: auto;
}

.sidebar-preview {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
}

.sidebar-preview h4 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1rem;
}

.menu-item-preview {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-weight: 500;
}

.menu-item-preview i {
  font-size: 1.25rem;
  color: var(--accent-color);
}

.menu-details h4 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}

.detail-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.detail-item strong {
  min-width: 80px;
  color: var(--text-primary);
}

.detail-item i {
  color: var(--accent-color);
  margin-right: 0.25rem;
}

.status-active {
  color: var(--success-color);
  font-weight: 600;
}

.status-inactive {
  color: var(--error-color);
  font-weight: 600;
}

.preview-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
}

/* Estilos para carga y errores */
.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  margin-bottom: 2rem;
  color: var(--text-secondary);
}

.loading-indicator i {
  font-size: 1.5rem;
  color: var(--accent-color);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: rgba(220, 38, 38, 0.1) !important;
  border: 1px solid rgba(220, 38, 38, 0.2) !important;
  border-radius: 8px;
  margin-bottom: 2rem;
  color: #dc2626 !important;
}

.error-message i {
  font-size: 1.25rem;
}

.retry-btn {
  margin-left: auto;
  padding: 0.5rem 1rem;
  background: #dc2626 !important;
  color: white !important;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: var(--error-hover, #c53030);
  transform: translateY(-1px);
}

.retry-btn:active {
  transform: translateY(0);
}

/* Botones deshabilitados */
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

/* Estilos para selector de roles */
.roles-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
}

.role-option {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s ease;
}

.role-option:hover {
  border-color: var(--accent-color);
  background: var(--bg-hover);
}

.role-option .checkbox-label {
  margin-bottom: 0.5rem;
}

.role-option .checkbox-text {
  font-weight: 500;
  color: var(--text-primary);
}

.role-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
  line-height: 1.4;
}

/* Estilos para vista de árbol */
.menu-tree {
  margin-top: 2rem;
}

/* Estilos para la vista de árbol */
.menu-tree-view {
  background: var(--bg-primary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.tree-header {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  padding: 1.5rem;
}

/* Estilos para la sección de ayuda */
.help-section {
  margin-bottom: 1.5rem;
}

.help-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.help-toggle:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.help-toggle i:first-child {
  font-size: 1.25rem;
}

.help-toggle i:last-child {
  margin-left: auto;
  transition: transform 0.3s ease;
}

.help-section.expanded .help-toggle i:last-child {
  transform: rotate(180deg);
}

.help-content {
  margin-top: 1rem;
  padding: 1.5rem;
  background: var(--bg-primary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* Estilos para el header de la guía */
.help-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--border-color);
}

.help-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 700;
}

.help-title i {
  color: var(--accent-primary);
  font-size: 1.75rem;
}

.help-description {
  margin: 0;
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

/* Estilos para las categorías */
.help-categories {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.help-category {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
}

.category-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 1.5rem 0;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.category-title i {
  color: var(--accent-primary);
  font-size: 1.25rem;
}

/* Estilos para los items de ayuda mejorados */
.help-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.25rem;
  align-items: stretch;
}

.help-item {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-primary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  height: 100%;
  align-items: flex-start;
}

.help-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: var(--accent-primary);
}

.help-icon {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  border-radius: 12px;
  color: white;
  box-shadow: 0 3px 12px rgba(37, 99, 235, 0.3);
}

.help-icon i {
  font-size: 1.5rem;
}

.help-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.help-text h5 {
  margin: 0 0 0.75rem 0;
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.3;
}

.help-text p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  flex: 1;
}

/* Responsive design mejorado para espacios angostos */
@media (max-width: 768px) {
  .help-content {
    padding: 1rem;
  }

  .help-header {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
  }

  .help-title {
    font-size: 1.25rem;
    flex-direction: column;
    gap: 0.5rem;
  }

  .help-description {
    font-size: 0.9rem;
  }

  .help-categories {
    gap: 1.5rem;
  }

  .help-category {
    padding: 1rem;
  }

  .category-title {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }

  .help-items {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .help-item {
    padding: 1.25rem;
  }

  .help-icon {
    width: 48px;
    height: 48px;
  }

  .help-icon i {
    font-size: 1.375rem;
  }
}

@media (max-width: 480px) {
  .help-content {
    padding: 0.75rem;
  }

  .help-item {
    flex-direction: column;
    text-align: center;
    padding: 1rem;
    align-items: center;
  }

  .help-icon {
    width: 44px;
    height: 44px;
    margin-bottom: 0.75rem;
  }

  .help-icon i {
    font-size: 1.25rem;
  }

  .help-text {
    text-align: center;
  }

  .help-text h5 {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  .help-text p {
    font-size: 0.875rem;
  }
}

/* Estilos para la sección de búsqueda */
.search-section {
  margin-bottom: 0;
}

.search-container {
  max-width: 600px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: var(--text-secondary);
  font-size: 1.25rem;
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.clear-search-btn {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.clear-search-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.search-stats {
  margin-top: 0.5rem;
  padding: 0 0.5rem;
}

.results-count {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* Estilos para el estado sin resultados */
.no-results {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-secondary);
}

.no-results i {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-results h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
  font-size: 1.5rem;
}

.no-results p {
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
}

.clear-search-btn-large {
  padding: 0.75rem 1.5rem;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.clear-search-btn-large:hover {
  background: var(--accent-secondary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tree-container {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
}

.tree-container:empty::before {
  content: "No hay menús para mostrar";
  display: block;
  text-align: center;
  color: var(--text-secondary);
  font-style: italic;
  padding: 2rem;
}

/* Estilos para selector de tipo de menú */
.menu-type-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 0.5rem;
}

.menu-type-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--bg-primary);
}

.menu-type-option:hover {
  border-color: var(--accent-primary);
  background: var(--bg-hover);
}

.menu-type-option.active {
  border-color: var(--accent-primary);
  background: rgba(var(--accent-rgb), 0.05);
}

.menu-type-option i {
  font-size: 1.5rem;
  color: var(--accent-primary);
}

.option-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.option-title {
  font-weight: 600;
  color: var(--text-primary);
}

.option-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.3;
}

/* Estilos para vista previa de jerarquía */
.hierarchy-preview {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  margin-top: 0.5rem;
}

.hierarchy-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg-primary);
  border-radius: 6px;
  border: 1px solid var(--border-color);
}

.hierarchy-item.parent {
  background: rgba(37, 99, 235, 0.1);
  border-color: var(--primary-color);
}

.hierarchy-item.child {
  background: rgba(34, 197, 94, 0.1);
  border-color: #22c55e;
}

.hierarchy-item i {
  color: var(--primary-color);
}

.hierarchy-item.child i {
  color: #22c55e;
}

.hierarchy-connector {
  color: var(--text-secondary);
  font-size: 1.25rem;
}

/* Estilos para visualización mejorada de submenús */
.menu-card.is-submenu {
  border-left: 4px solid #22c55e;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, transparent 100%);
}

.menu-card.has-children {
  border-left: 4px solid var(--primary-color);
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, transparent 100%);
}

.menu-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.menu-badges {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: flex-end;
}

.submenu-badge,
.parent-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.submenu-badge {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.parent-badge {
  background: rgba(37, 99, 235, 0.1);
  color: var(--primary-color);
  border: 1px solid rgba(37, 99, 235, 0.2);
}

.menu-parent i {
  margin-right: 0.25rem;
  color: var(--text-secondary);
}

.add-submenu-btn {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-submenu-btn:hover {
  background: rgba(34, 197, 94, 0.2);
  transform: translateY(-1px);
}

.add-submenu-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Estilos para vista de árbol jerárquico */
.menu-tree-view {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px var(--shadow-color);
}

.tree-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tree-node {
  border-radius: 8px;
  transition: all 0.2s ease;
}

.root-node {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  margin-bottom: 1rem;
}

.root-node:hover {
  border-color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
}

.child-node {
  background: rgba(34, 197, 94, 0.05);
  border: 1px solid rgba(34, 197, 94, 0.1);
  margin-left: 2rem;
  margin-bottom: 0.5rem;
}

.child-node:hover {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

.node-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
}

.node-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.expand-toggle {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: 4px;
  transition: all 0.2s ease;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.expand-toggle:hover {
  background: var(--bg-hover);
  color: var(--primary-color);
}

.expand-toggle.expanded i {
  transform: rotate(90deg);
}

.node-spacer {
  width: 24px;
  height: 24px;
}

.child-connector {
  color: #22c55e;
  font-size: 1.25rem;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.node-icon {
  color: var(--primary-color);
  font-size: 1.5rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(37, 99, 235, 0.1);
  border-radius: 6px;
}

.child-node .node-icon {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

.node-info {
  flex: 1;
  min-width: 0;
}

.node-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.child-node .node-name {
  font-size: 1rem;
  font-weight: 500;
}

.node-path {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-family: 'Courier New', monospace;
  background: var(--bg-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 0.5rem;
}

.node-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.node-order,
.children-count,
.submenu-indicator {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
}

.node-order {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.children-count {
  background: rgba(37, 99, 235, 0.1);
  color: var(--primary-color);
}

.submenu-indicator {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.node-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.node-actions .small {
  padding: 0.5rem;
  font-size: 0.9rem;
  min-width: auto;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.children-container {
    padding-left: 1rem;
    border-left: 2px solid rgba(37, 99, 235, 0.1);
    margin-left: 1rem;
  }

  /* Estilos para la sección de submenús */
  .submenu-section {
    background: var(--bg-hover);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1.5rem;
    margin-top: 1rem;
  }

  .submenu-section .section-title {
    color: var(--accent-primary);
    margin-bottom: 1rem;
  }

  .submenus-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .submenu-item {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem;
    position: relative;
  }

  .submenu-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-light);
  }

  .submenu-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .remove-submenu-btn {
    background: rgba(239, 68, 68, 0.1);
    color: var(--accent-danger);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 6px;
    padding: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
  }

  .remove-submenu-btn:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: var(--accent-danger);
  }

  .submenu-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .submenu-fields .form-group:last-child {
    grid-column: 1 / -1;
  }

  .add-submenu-btn {
    background: var(--accent-secondary);
    color: var(--text-inverse);
    border: none;
    border-radius: 8px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-weight: 500;
    border: 2px dashed transparent;
  }

  .add-submenu-btn:hover {
    background: #059669;
    transform: translateY(-1px);
  }

  .add-submenu-btn:focus {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-shadow);
  }

  /* Responsive */
@media (max-width: 768px) {
    .main-content {
      margin-left: 0;
      padding-top: 60px;
    }

    .menu-manager-container {
      padding: 1rem;
    }

    .manager-title {
      font-size: 2rem;
    }

    .menus-grid {
      grid-template-columns: 1fr;
    }

    .template-selector {
      grid-template-columns: 1fr;
    }

    .preview-content {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .dialog-content {
      margin: 1rem;
      max-width: calc(100vw - 2rem);
    }

    /* Responsive para submenús */
    .submenu-fields {
      grid-template-columns: 1fr;
    }

    .submenu-section {
      padding: 1rem;
    }
  }
</style>