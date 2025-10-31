<template>
  <div class="flex min-h-screen bg-white dark:bg-slate-900">
    <SidebarMenu @sidebar-toggle="handleSidebarToggle" />
    <AppHeader :sidebar-expanded="sidebarExpanded" />

    <main
      :class="[
        'pt-20 flex-1 transition-all duration-300',
        sidebarExpanded ? 'ml-[280px]' : 'ml-20',
      ]"
    >
      <div class="p-6">
        <!-- Header Section -->
        <div class="mb-6">
          <div
            class="flex items-center justify-between gap-6 rounded-2xl border bg-slate-100 p-6 shadow dark:border-slate-700 dark:bg-slate-800"
          >
            <div class="flex items-center gap-4">
              <div
                class="grid h-14 w-14 place-items-center rounded-xl text-white text-xl shadow"
                style="background: linear-gradient(135deg, #2563eb, #60a5fa)"
              >
                <i class="fas fa-cogs"></i>
              </div>
              <div>
                <h1 class="m-0 text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Administración de Contenidos
                </h1>
                <p class="m-0 text-sm text-slate-500 dark:text-slate-300">
                  Gestiona y organiza todo el contenido de tu plataforma
                </p>
              </div>
            </div>
            <div>
              <button
                v-can="['ROLE_ADMIN', 'ROLE_SUPER_USER']"
                @click="openCreateDialog"
                class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 disabled:opacity-50"
                title="Crear Documento"
              >
                <i class="fas fa-plus"></i>
                Crear Documento
              </button>
            </div>
          </div>
        </div>

        <!-- Alertas -->
        <div class="mb-4">
          <div
            v-if="error"
            class="mb-3 flex items-center gap-2 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/40 dark:bg-red-900/30 dark:text-red-200"
          >
            <i class="fas fa-exclamation-circle"></i>
            {{ error }}
          </div>

          <div
            v-if="success"
            class="mb-3 flex items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/30 dark:text-emerald-200"
          >
            <i class="fas fa-check-circle"></i>
            {{ success }}
          </div>
        </div>

        <!-- Content Management Section -->
        <div
          class="rounded-xl border border-slate-200 bg-slate-100 shadow dark:border-slate-700 dark:bg-slate-800 overflow-hidden"
        >
          <!-- Filtros y búsqueda -->
          <div class="flex flex-col gap-4 border-b border-slate-200 p-4 dark:border-slate-700">
            <div class="flex flex-col gap-2">
              <div
                class="relative flex items-center rounded-xl border-2 border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900"
              >
                <i class="fas fa-search mx-3 text-slate-500"></i>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Buscar contenidos por título, autor o tipo..."
                  class="flex-1 bg-transparent outline-none text-[0.95rem] text-slate-900 dark:text-slate-100 placeholder:text-slate-500"
                  @input="onSearchInput"
                />
                <button
                  v-if="searchQuery"
                  @click="clearSearch"
                  class="ml-2 grid h-8 w-8 place-items-center rounded bg-red-600 text-white hover:bg-red-700"
                  title="Limpiar"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <div
                v-if="searchQuery"
                class="inline-block rounded border border-slate-200 bg-slate-200/60 px-3 py-2 text-sm font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-700/60 dark:text-slate-300"
              >
                {{ documents?.length || 0 }} resultado(s) encontrados
              </div>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <!-- Vista -->
                <div
                  class="inline-flex rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900"
                >
                  <button
                    @click="viewMode = 'table'"
                    :class="[
                      'px-3 py-2 rounded-md text-sm font-medium',
                      viewMode === 'table'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 dark:text-slate-100',
                    ]"
                  >
                    <i class="fas fa-table"></i>
                  </button>
                  <button
                    @click="viewMode = 'grid'"
                    :class="[
                      'px-3 py-2 rounded-md text-sm font-medium',
                      viewMode === 'grid'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 dark:text-slate-100',
                    ]"
                  >
                    <i class="fas fa-th-large"></i>
                  </button>
                </div>
                <!-- Filtro por estado -->
                <select
                  v-model="filterStatus"
                  class="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="">Todos</option>
                  <option value="Activo">Activos</option>
                  <option value="Inactivo">Inactivos</option>
                </select>
              </div>
              <div class="flex items-center gap-2">
                <select
                  v-model="sortBy"
                  class="rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="createdAt">Fecha de creación</option>
                  <option value="name">Título</option>
                  <option value="type">Tipo</option>
                  <option value="createdBy">Autor</option>
                  <option value="status">Estado</option>
                </select>
                <button
                  @click="toggleSortOrder"
                  class="grid h-10 w-10 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-900 transition hover:scale-105 hover:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  :title="sortOrder === 'asc' ? 'Ordenar descendente' : 'Ordenar ascendente'"
                >
                  <i
                    :class="
                      sortOrder === 'asc' ? 'fas fa-sort-amount-up' : 'fas fa-sort-amount-down'
                    "
                  ></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Listado -->
          <div>
            <!-- Loading -->
            <div
              v-if="loading"
              class="min-h-[300px] grid place-items-center p-8 text-slate-600 dark:text-slate-300"
            >
              <div
                class="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-blue-500"
              ></div>
            </div>

            <!-- Tabla -->
            <div v-else>
              <div v-if="viewMode === 'table'" class="overflow-x-auto">
                <table class="w-full min-w-[1100px] border-collapse">
                  <thead>
                    <tr>
                      <th
                        class="sticky top-0 z-10 bg-slate-200/60 p-3 text-left text-sm font-semibold text-slate-700 dark:bg-slate-700/60 dark:text-slate-100"
                      >
                        Título
                      </th>
                      <th
                        class="sticky top-0 z-10 bg-slate-200/60 p-3 text-left text-sm font-semibold text-slate-700 dark:bg-slate-700/60 dark:text-slate-100"
                      >
                        Tipo
                      </th>
                      <th
                        class="sticky top-0 z-10 bg-slate-200/60 p-3 text-left text-sm font-semibold text-slate-700 dark:bg-slate-700/60 dark:text-slate-100"
                      >
                        Autor
                      </th>
                      <th
                        class="sticky top-0 z-10 bg-slate-200/60 p-3 text-left text-sm font-semibold text-slate-700 dark:bg-slate-700/60 dark:text-slate-100"
                      >
                        Estado
                      </th>
                      <th
                        class="sticky top-0 z-10 bg-slate-200/60 p-3 text-left text-sm font-semibold text-slate-700 dark:bg-slate-700/60 dark:text-slate-100"
                      >
                        Creado
                      </th>
                      <th
                        class="sticky top-0 z-10 bg-slate-200/60 p-3 text-left text-sm font-semibold text-slate-700 dark:bg-slate-700/60 dark:text-slate-100"
                      >
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="doc in documents"
                      :key="doc.id"
                      class="hover:bg-slate-200/60 dark:hover:bg-slate-700/40"
                      @dblclick="previewContent(doc)"
                    >
                      <td class="p-3 align-middle">
                        <div class="flex items-center gap-3">
                          <i class="fas fa-file-alt text-blue-500"></i>
                          <button
                            type="button"
                            class="inline-flex items-center gap-2 text-left font-medium text-slate-900 hover:text-blue-600 underline-offset-2 hover:underline focus:underline focus:outline-none dark:text-slate-100"
                            @click="previewContent(doc)"
                            @keyup.enter="previewContent(doc)"
                            title="Ver contenido"
                          >
                            {{ doc.title || doc.name || 'Sin título' }}
                          </button>
                        </div>
                      </td>
                      <td class="p-3 align-middle text-slate-700 dark:text-slate-200">
                        {{ doc.type || doc.category || '�' }}
                      </td>
                      <td class="p-3 align-middle text-slate-700 dark:text-slate-200">
                        {{ doc.author || doc.createdBy || '�' }}
                      </td>
                      <td class="p-3 align-middle">
                        <button
                          type="button"
                          @click="toggleDocumentStatus(doc)"
                          :class="[
                            'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.8rem] font-semibold uppercase tracking-wide transition shadow-sm hover:scale-105 hover:shadow-md',
                            doc.enabled !== false
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/40 dark:bg-emerald-900/30 dark:text-emerald-200'
                              : 'border-red-200 bg-red-50 text-red-600 dark:border-red-900/40 dark:bg-red-900/30 dark:text-red-200',
                          ]"
                        >
                          <i
                            :class="
                              doc.enabled !== false ? 'fas fa-check-circle' : 'fas fa-times-circle'
                            "
                          ></i>
                          {{ doc.enabled !== false ? 'Activo' : 'Inactivo' }}
                        </button>
                      </td>
                      <td class="p-3 align-middle text-slate-700 dark:text-slate-200">
                        {{ new Date(doc.createdAt || doc.created_at).toLocaleDateString('es-ES') }}
                      </td>
                      <td class="p-3 align-middle">
                        <div class="flex items-center gap-2">
                          <button
                            @click="previewContent(doc)"
                            class="grid h-8 w-8 place-items-center rounded bg-slate-300 text-slate-800 hover:-translate-y-0.5 dark:bg-slate-700 dark:text-slate-100"
                            title="Ver"
                          >
                            <i class="fas fa-eye"></i>
                          </button>
                          <button
                            @click="openEditDialog(doc)"
                            class="grid h-8 w-8 place-items-center rounded bg-blue-600 text-white hover:-translate-y-0.5"
                            title="Editar"
                          >
                            <i class="fas fa-edit"></i>
                          </button>
                          <button
                            @click="openDeleteDialog(doc)"
                            class="grid h-8 w-8 place-items-center rounded bg-red-600 text-white hover:-translate-y-0.5"
                            title="Eliminar"
                          >
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Grid -->
              <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 p-4">
                <div
                  v-for="doc in documents"
                  :key="doc.id"
                  class="rounded-xl border bg-white p-4 shadow dark:border-slate-700 dark:bg-slate-900"
                >
                  <div class="mb-2 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <i class="fas fa-file-alt text-blue-500"></i>
                      <h3
                        class="m-0 text-base font-semibold text-slate-900 dark:text-slate-100 truncate"
                        :title="doc.title || doc.name || 'Sin título'"
                      >
                        {{ doc.title || doc.name || 'Sin título' }}
                      </h3>
                    </div>
                    <button
                      type="button"
                      @click="toggleDocumentStatus(doc)"
                      :class="[
                        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide transition shadow-sm hover:scale-105',
                        doc.enabled !== false
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/40 dark:bg-emerald-900/30 dark:text-emerald-200'
                          : 'border-red-200 bg-red-50 text-red-600 dark:border-red-900/40 dark:bg-red-900/30 dark:text-red-200',
                      ]"
                    >
                      <i
                        :class="
                          doc.enabled !== false ? 'fas fa-check-circle' : 'fas fa-times-circle'
                        "
                      ></i>
                      {{ doc.enabled !== false ? 'Activo' : 'Inactivo' }}
                    </button>
                  </div>
                  <div class="mb-3 text-sm text-slate-600 dark:text-slate-300">
                    <div><strong>Tipo:</strong> {{ doc.type || doc.category || '�' }}</div>
                    <div><strong>Autor:</strong> {{ doc.author || doc.createdBy || '�' }}</div>
                    <div>
                      <strong>Creado:</strong>
                      {{ new Date(doc.createdAt || doc.created_at).toLocaleDateString('es-ES') }}
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      @click="previewContent(doc)"
                      class="inline-flex items-center gap-2 rounded bg-slate-300 px-3 py-1.5 text-sm font-medium text-slate-800 hover:-translate-y-0.5 dark:bg-slate-700 dark:text-slate-100"
                    >
                      <i class="fas fa-eye"></i> Ver
                    </button>
                    <button
                      @click="openEditDialog(doc)"
                      class="inline-flex items-center gap-2 rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:-translate-y-0.5"
                    >
                      <i class="fas fa-edit"></i> Editar
                    </button>
                    <button
                      @click="openDeleteDialog(doc)"
                      class="inline-flex items-center gap-2 rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:-translate-y-0.5"
                    >
                      <i class="fas fa-trash"></i> Eliminar
                    </button>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div
                v-if="documents && documents.length === 0"
                class="p-12 text-center text-slate-500"
              >
                <div class="mb-4 text-5xl text-slate-400"><i class="fas fa-folder-open"></i></div>
                <h3 class="m-0 text-xl font-semibold text-slate-900 dark:text-slate-100">
                  No hay contenidos
                </h3>
                <p>Comienza creando un nuevo documento.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Preview Modal -->
        <div
          v-if="showPreviewModal"
          class="fixed inset-0 z-[1000] grid place-items-center bg-black/60 p-4"
        >
          <div
            class="w-full max-w-[1200px] flex max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            <!-- Header -->
            <div
              class="flex items-center justify-between border-b border-slate-200 bg-blue-600 px-6 py-4 text-white dark:border-slate-700"
            >
              <h3 class="m-0 text-lg font-semibold">
                <i class="fas fa-eye mr-2"></i>
                {{ previewItem?.name || 'Vista Previa' }}
              </h3>
              <button
                @click="closePreviewModal"
                class="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-white ring-1 ring-white/30 backdrop-blur hover:bg-white/30"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>

            <!-- Body -->
            <div class="flex-1 overflow-y-auto p-6">
              <!-- Loading State -->
              <div v-if="previewLoading" class="grid min-h-[300px] place-items-center">
                <div
                  class="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-blue-500"
                ></div>
              </div>

              <!-- PDF Content -->
              <div
                v-else-if="previewItem?.type === 'TYPE_PDF' || previewItem?.type === 'PDF'"
                class="space-y-4"
              >
                <!-- PDF Error -->
                <div
                  v-if="pdfError"
                  class="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/30 dark:text-red-200"
                >
                  <i class="fas fa-exclamation-circle mb-2 text-2xl"></i>
                  <p class="font-semibold">Error al cargar el PDF</p>
                  <p class="text-xs">
                    {{ pdfError?.message || 'No se pudo cargar el documento PDF' }}
                  </p>
                  <button
                    @click="retryPdfLoad"
                    class="mt-3 inline-flex items-center gap-2 rounded bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
                  >
                    <i class="fas fa-redo"></i>
                    Reintentar
                  </button>
                </div>

                <!-- PDF Loading -->
                <div v-else-if="pdfLoading" class="grid min-h-[400px] place-items-center">
                  <div class="text-center">
                    <div
                      class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-blue-500"
                    ></div>
                    <p class="text-sm text-slate-600 dark:text-slate-300">Cargando PDF...</p>
                  </div>
                </div>

                <!-- PDF Viewer -->
                <div v-else-if="pdfBlobUrl" class="space-y-4">
                  <!-- PDF Controls -->
                  <div
                    class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div class="flex items-center gap-2">
                      <button
                        @click="goToFirstPage"
                        :disabled="currentPdfPage === 1"
                        class="grid h-8 w-8 place-items-center rounded bg-blue-600 text-white transition disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
                        title="Primera página"
                      >
                        <i class="fas fa-angle-double-left text-xs"></i>
                      </button>
                      <button
                        @click="previousPage"
                        :disabled="currentPdfPage === 1"
                        class="grid h-8 w-8 place-items-center rounded bg-blue-600 text-white transition disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
                        title="Página anterior"
                      >
                        <i class="fas fa-angle-left text-xs"></i>
                      </button>
                      <span class="px-3 text-sm font-medium text-slate-700 dark:text-slate-200"
                        >Página {{ currentPdfPage }} de {{ totalPdfPages }}</span
                      >
                      <button
                        @click="nextPage"
                        :disabled="currentPdfPage >= totalPdfPages"
                        class="grid h-8 w-8 place-items-center rounded bg-blue-600 text-white transition disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
                        title="Página siguiente"
                      >
                        <i class="fas fa-angle-right text-xs"></i>
                      </button>
                      <button
                        @click="goToLastPage"
                        :disabled="currentPdfPage >= totalPdfPages"
                        class="grid h-8 w-8 place-items-center rounded bg-blue-600 text-white transition disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
                        title="Última página"
                      >
                        <i class="fas fa-angle-double-right text-xs"></i>
                      </button>
                    </div>
                    <div class="flex items-center gap-2">
                      <button
                        @click="zoomOut"
                        class="grid h-8 w-8 place-items-center rounded bg-slate-300 text-slate-800 transition hover:-translate-y-0.5 dark:bg-slate-700 dark:text-slate-100"
                        title="Alejar"
                      >
                        <i class="fas fa-search-minus text-xs"></i>
                      </button>
                      <span class="text-sm font-medium text-slate-700 dark:text-slate-200"
                        >{{ Math.round(pdfZoom * 100) }}%</span
                      >
                      <button
                        @click="zoomIn"
                        class="grid h-8 w-8 place-items-center rounded bg-slate-300 text-slate-800 transition hover:-translate-y-0.5 dark:bg-slate-700 dark:text-slate-100"
                        title="Acercar"
                      >
                        <i class="fas fa-search-plus text-xs"></i>
                      </button>
                      <button
                        @click="resetZoom"
                        class="grid h-8 w-8 place-items-center rounded bg-slate-300 text-slate-800 transition hover:-translate-y-0.5 dark:bg-slate-700 dark:text-slate-100"
                        title="Resetear zoom"
                      >
                        <i class="fas fa-expand text-xs"></i>
                      </button>
                      <button
                        @click="refreshPdfViewer"
                        class="grid h-8 w-8 place-items-center rounded bg-green-600 text-white transition hover:-translate-y-0.5"
                        title="Recargar PDF"
                      >
                        <i class="fas fa-redo text-xs"></i>
                      </button>
                    </div>
                  </div>

                  <!-- PDF Embed -->
                  <div
                    class="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <VuePdfEmbed
                      :source="pdfBlobUrl"
                      :page="currentPdfPage"
                      :scale="pdfZoom"
                      @loaded="onPdfLoaded"
                      @loading-failed="onPdfError"
                      class="min-h-[500px] w-full"
                    />
                  </div>
                </div>

                <!-- No PDF -->
                <div
                  v-else
                  class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/30 dark:text-amber-200"
                >
                  <i class="fas fa-info-circle mb-2 text-2xl"></i>
                  <p class="font-semibold">No hay PDF disponible</p>
                </div>
              </div>

              <!-- TEXT Content -->
              <div v-else-if="previewItem?.type === 'TYPE_TEXT' || previewItem?.type === 'TEXT'">
                <div
                  class="prose max-w-none rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800 dark:prose-invert"
                  v-html="renderedMarkdown"
                ></div>
              </div>

              <!-- URL Content -->
              <div v-else-if="previewItem?.type === 'TYPE_URL' || previewItem?.type === 'URL'">
                <div
                  class="rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800"
                >
                  <div class="mb-4 flex items-center gap-3">
                    <i class="fas fa-link text-2xl text-blue-500"></i>
                    <div>
                      <h4 class="m-0 text-lg font-semibold text-slate-900 dark:text-slate-100">
                        Enlace Externo
                      </h4>
                      <p class="m-0 text-sm text-slate-600 dark:text-slate-300">
                        Este documento redirige a un enlace externo
                      </p>
                    </div>
                  </div>
                  <div
                    class="rounded-lg border border-blue-200 bg-white p-4 dark:border-blue-900/40 dark:bg-slate-900"
                  >
                    <a
                      :href="normalizeUrl(previewItem?.content)"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-2 text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
                    >
                      <i class="fas fa-external-link-alt"></i>
                      {{ getUrlTitle(previewItem?.content) }}
                    </a>
                    <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {{ previewItem?.content }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Unknown Content -->
              <div
                v-else
                class="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800"
              >
                <i class="fas fa-file-question mb-4 text-5xl text-slate-400"></i>
                <h3 class="m-0 text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Tipo de contenido no soportado
                </h3>
                <p class="text-slate-600 dark:text-slate-300">
                  Este tipo de documento no puede ser previsualizado
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div
              v-if="!previewLoading"
              class="flex justify-end gap-3 border-t border-slate-200 bg-slate-100 px-6 py-4 dark:border-slate-700 dark:bg-slate-800"
            >
              <button
                @click="editFromPreview"
                class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5"
              >
                <i class="fas fa-edit"></i>
                Editar
              </button>
              <button
                @click="closePreviewModal"
                class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-100"
              >
                <i class="fas fa-times"></i>
                Cerrar
              </button>
            </div>
          </div>
        </div>

        <!-- Status Confirm Modal -->
        <div
          v-if="showStatusConfirmModal"
          class="fixed inset-0 z-[1000] grid place-items-center bg-black/60 p-4"
        >
          <div
            class="w-full max-w-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <div class="flex items-center justify-between bg-amber-500 px-6 py-4 text-white">
              <h3 class="m-0 text-base font-semibold">
                <i :class="statusConfirmAction === 'activate' ? 'fas fa-check' : 'fas fa-ban'"></i>
                Confirmar {{ statusConfirmAction === 'activate' ? 'Activación' : 'Desactivación' }}
              </h3>
              <button
                @click="cancelStatusChange"
                class="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-white ring-1 ring-white/30 backdrop-blur"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="px-6 py-5 text-sm">
              ¿Estás seguro de que deseas
              {{ statusConfirmAction === 'activate' ? 'activar' : 'desactivar' }} este contenido?
            </div>
            <div
              class="flex justify-end gap-3 border-t border-slate-200 bg-slate-100 px-6 py-4 dark:border-slate-700 dark:bg-slate-800"
            >
              <button
                @click="cancelStatusChange"
                class="inline-flex min-w-[110px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-slate-200 px-4 py-2 text-sm font-medium text-slate-900 transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-100"
              >
                <i class="fas fa-times"></i> Cancelar
              </button>
              <button
                @click="confirmStatusChange"
                class="inline-flex min-w-[110px] items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5"
              >
                <i :class="statusConfirmAction === 'activate' ? 'fas fa-check' : 'fas fa-ban'"></i>
                {{ statusConfirmAction === 'activate' ? 'Activar' : 'Desactivar' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Content Form Modal -->
        <ContentForm
          v-model="editDialog"
          :document="selectedItem"
          :loading="editLoading"
          @saved="handleSaveDocument"
          @close="closeEditDialog"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import documentService from '@/services/documentService'
import SidebarMenu from '@/components/common/SidebarMenu.vue'
import AppHeader from '@/components/common/AppHeader.vue'
import ContentForm from '@/components/ContentForm.vue'
import { marked } from 'marked'
import VuePdfEmbed from 'vue-pdf-embed'
import {
  setupPdfWarningSuppression,
  handleProblematicPdf,
  isValidPdfUrl,
  isKnownPdfWarning,
  buildPdfUrl,
} from '@/utils/pdfUtils'

const authStore = useAuthStore()

// Estado básico
const documents = ref([])
const loading = ref(false)
const error = ref(null)
const success = ref(null)
const sidebarExpanded = ref(false)

// Estados de modales
const deleteDialog = ref(false)
const editDialog = ref(false)
const showPreviewModal = ref(false)
const showBulkDeleteModal = ref(false)
const showStatusConfirmModal = ref(false)
const selectedItem = ref(null)
const previewItem = ref(null)
const statusConfirmItem = ref(null)
const previewLoading = ref(false)
const editLoading = ref(false)
const isEditing = ref(false)
const deleting = ref(false)
const bulkDeleting = ref(false)
const statusConfirmAction = ref('') // 'activate' o 'deactivate'

// Estado para PDF
const currentPdfPage = ref(1)
const totalPdfPages = ref(0)
const pdfLoading = ref(false)
const pdfError = ref(null)
const pdfBlobUrl = ref(null) // URL del blob del PDF
const pdfZoom = ref(1.0) // Nivel de zoom del PDF

// Inicializar supresión de advertencias de PDF.js
setupPdfWarningSuppression()

// Función para manejar navegación con teclado
const handleKeydown = (event) => {
  // Solo procesar si el modal de preview está abierto y es un PDF
  if (!showPreviewModal.value || previewItem.value?.type !== 'TYPE_PDF') {
    return
  }

  // Evitar conflictos con inputs y otros elementos
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
    return
  }

  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault()
      previousPage()
      break
    case 'ArrowRight':
      event.preventDefault()
      nextPage()
      break
    case 'Home':
      event.preventDefault()
      goToFirstPage()
      break
    case 'End':
      event.preventDefault()
      goToLastPage()
      break
    case '+':
    case '=':
      event.preventDefault()
      zoomIn()
      break
    case '-':
      event.preventDefault()
      zoomOut()
      break
    case '0':
      event.preventDefault()
      resetZoom()
      break
  }
}

// Estados de filtros y búsqueda
const searchQuery = ref('')
const filterType = ref('')
const filterStatus = ref('')
const filterAuthor = ref('')
const sortBy = ref('createdAt')
const sortOrder = ref('desc')
const viewMode = ref('table')

// Estados de selección y paginación
const selectedItems = ref([])
const currentPage = ref(1)
const itemsPerPage = ref(25)

// URL base de la API
const apiBaseUrl = 'http://practicas.teclab.edu.ar:8080'

// Computed properties para estadísticas
const activeCount = computed(
  () =>
    documents.value.filter((item) => {
      const status = getDocumentStatus(item)
      return status === 'Activo'
    }).length,
)

const inactiveCount = computed(
  () =>
    documents.value.filter((item) => {
      const status = getDocumentStatus(item)
      return status === 'Inactivo'
    }).length,
)

const textDocumentsCount = computed(
  () => documents.value.filter((item) => item.type === 'TEXT').length,
)

const urlDocumentsCount = computed(
  () => documents.value.filter((item) => item.type === 'URL').length,
)

const pdfDocumentsCount = computed(
  () => documents.value.filter((item) => item.type === 'PDF').length,
)

// Computed para autores únicos
const uniqueAuthors = computed(() => {
  const authors = [...new Set(documents.value.map((item) => item.createdBy).filter(Boolean))]
  return authors.sort()
})

// Computed para filtrado y búsqueda
const filteredItems = computed(() => {
  let items = [...documents.value]

  // Aplicar búsqueda
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    items = items.filter(
      (item) =>
        item.name?.toLowerCase().includes(query) ||
        item.slug?.toLowerCase().includes(query) ||
        item.type?.toLowerCase().includes(query) ||
        item.createdBy?.toLowerCase().includes(query),
    )
  }

  // Aplicar filtros
  if (filterType.value) {
    items = items.filter((item) => item.type === filterType.value)
  }

  if (filterStatus.value) {
    items = items.filter((item) => getDocumentStatus(item) === filterStatus.value)
  }

  if (filterAuthor.value) {
    items = items.filter((item) => item.createdBy === filterAuthor.value)
  }

  // Aplicar ordenamiento
  items.sort((a, b) => {
    let aValue = a[sortBy.value]
    let bValue = b[sortBy.value]

    // Manejo especial para fechas
    if (sortBy.value === 'createdAt' || sortBy.value === 'updatedAt') {
      aValue = new Date(aValue || 0)
      bValue = new Date(bValue || 0)
    } else {
      // Para strings, convertir a lowercase para ordenamiento insensible a mayósculas
      if (typeof aValue === 'string') aValue = aValue.toLowerCase()
      if (typeof bValue === 'string') bValue = bValue.toLowerCase()
    }

    if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })

  return items
})

// Computed para paginación
const totalPages = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage.value))

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredItems.value.slice(start, end)
})

const startItem = computed(() => {
  if (filteredItems.value.length === 0) return 0
  return (currentPage.value - 1) * itemsPerPage.value + 1
})

const endItem = computed(() => {
  const end = currentPage.value * itemsPerPage.value
  return Math.min(end, filteredItems.value.length)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// Computed para estados
const hasActiveFilters = computed(
  () => searchQuery.value.trim() || filterType.value || filterStatus.value || filterAuthor.value,
)

const allSelected = computed(
  () =>
    paginatedItems.value.length > 0 &&
    paginatedItems.value.every((item) => selectedItems.value.includes(item.id)),
)

// Watchers
watch(itemsPerPage, () => {
  currentPage.value = 1
})

watch([filterType, filterStatus, filterAuthor], () => {
  currentPage.value = 1
})

// Funciones principales
const handleSidebarToggle = (expanded) => {
  sidebarExpanded.value = expanded
}

const loadDocuments = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await documentService.getDocuments()

    // Verificar si la respuesta es válida
    if (Array.isArray(response)) {
      documents.value = response
    } else {
      documents.value = []
    }
  } catch (err) {
    error.value = err.message || 'Error al cargar los documentos'
    documents.value = []
  } finally {
    loading.value = false
  }
}

// Funciones de búsqueda y filtros
const onSearchInput = () => {
  currentPage.value = 1
}

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
}

const clearAllFilters = () => {
  searchQuery.value = ''
  filterType.value = ''
  filterStatus.value = ''
  filterAuthor.value = ''
  currentPage.value = 1
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

// Funciones de selección
const toggleItemSelection = (itemId) => {
  const index = selectedItems.value.indexOf(itemId)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(itemId)
  }
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    // Deseleccionar todos los elementos de la página actual
    paginatedItems.value.forEach((item) => {
      const index = selectedItems.value.indexOf(item.id)
      if (index > -1) {
        selectedItems.value.splice(index, 1)
      }
    })
  } else {
    // Seleccionar todos los elementos de la página actual
    paginatedItems.value.forEach((item) => {
      if (!selectedItems.value.includes(item.id)) {
        selectedItems.value.push(item.id)
      }
    })
  }
}

// Funciones de contenido
const previewContent = async (item) => {
  // Abrir el modal inmediatamente
  showPreviewModal.value = true
  previewItem.value = item

  // Inicializar estado del PDF
  if (item.type === 'TYPE_PDF') {
    pdfLoading.value = true
    pdfError.value = null
    currentPdfPage.value = 1
    totalPdfPages.value = 0

    // Cargar el PDF usando el servicio autenticado
    try {
      await loadPdfFile(item.id)
      console.log('?? PDF cargado exitosamente para documento:', item.id)
    } catch (error) {
      console.error('? Error cargando PDF:', error)
      pdfError.value = error
      pdfLoading.value = false
    }
  }

  // Si no tiene contenido, intentar obtenerlo del backend
  if (!item.content && item.id) {
    previewLoading.value = true

    try {
      const fullDocument = await documentService.getDocumentById(item.id)

      // Usar el documento completo con contenido
      previewItem.value = fullDocument

      // Reinicializar estado del PDF si es necesario
      if (fullDocument.type === 'TYPE_PDF') {
        pdfLoading.value = true
        pdfError.value = null
        currentPdfPage.value = 1
        totalPdfPages.value = 0

        // Cargar el PDF usando el servicio autenticado
        try {
          await loadPdfFile(fullDocument.id)
          console.log('?? PDF cargado exitosamente para documento completo:', fullDocument.id)
        } catch (error) {
          console.error('? Error cargando PDF:', error)
          pdfError.value = error
          pdfLoading.value = false
        }
      }
    } catch (error) {
      // Mantener el documento original sin contenido
    } finally {
      previewLoading.value = false
    }
  }
}

const closePreviewModal = () => {
  showPreviewModal.value = false
  previewItem.value = null

  // Limpiar blob URL del PDF para liberar memoria
  if (pdfBlobUrl.value) {
    URL.revokeObjectURL(pdfBlobUrl.value)
    pdfBlobUrl.value = null
  }

  // Resetear estado del PDF
  pdfLoading.value = false
  pdfError.value = null
  currentPdfPage.value = 1
  totalPdfPages.value = 0
}

const editFromPreview = () => {
  closePreviewModal()
  openEditDialog(previewItem.value)
}

const duplicateContent = async (item) => {
  try {
    const duplicatedItem = {
      ...item,
      id: Date.now(), // ID temporal
      name: `${item.name} (Copia)`,
      status: 'Borrador',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // En una aplicación real, esto se enviara al backend
    documents.value.unshift(duplicatedItem)
    success.value = `Contenido "${item.name}" duplicado correctamente`
  } catch (err) {
    error.value = 'Error al duplicar el contenido'
  }
}

const toggleDocumentStatus = (item) => {
  if (!item || !item.id) {
    return
  }

  const currentStatus = getDocumentStatus(item)
  const action = currentStatus === 'Activo' ? 'deactivate' : 'activate'

  // Configurar datos para el modal de confirmación
  statusConfirmItem.value = item
  statusConfirmAction.value = action
  showStatusConfirmModal.value = true
}

const confirmStatusChange = async () => {
  if (!statusConfirmItem.value || !statusConfirmItem.value.id) {
    return
  }

  try {
    const item = statusConfirmItem.value
    const newStatus = statusConfirmAction.value === 'activate'

    // Limpiar roles para remover prefijo ROLE_ duplicado si existe
    const cleanRoles = (item.roles || []).map((role) => {
      if (typeof role === 'string' && role.startsWith('ROLE_ROLE_')) {
        return role.substring(10) // Remover 'ROLE_ROLE_' (10 caracteres)
      } else if (typeof role === 'string' && role.startsWith('ROLE_')) {
        return role.substring(5) // Remover 'ROLE_' (5 caracteres)
      }
      return role
    })

    // Preparar datos para actualización (solo campos necesarios)
    const updateData = {
      name: item.name,
      type: item.type,
      slug: item.slug,
      status: newStatus,
      content: item.content,
      icon: item.icon,
      roles: cleanRoles,
    }

    // Actualizar el documento en el backend
    const updatedDocument = await documentService.updateDocument(item.id, updateData)

    // Actualizar en la lista local
    const index = documents.value.findIndex((doc) => doc.id === item.id)
    if (index > -1) {
      documents.value[index] = updatedDocument || { ...item, status: newStatus }
    }

    const statusText = newStatus ? 'activado' : 'desactivado'
    success.value = `Documento "${item.name}" ${statusText} correctamente`

    // Cerrar modal
    showStatusConfirmModal.value = false
    statusConfirmItem.value = null
    statusConfirmAction.value = ''
  } catch (error) {
    error.value = 'Error al cambiar el estado del documento'
  }
}

const cancelStatusChange = () => {
  showStatusConfirmModal.value = false
  statusConfirmItem.value = null
  statusConfirmAction.value = ''
}

// Función para refrescar datos
const refreshData = () => {
  loadDocuments()
}

// Funciones de diálogos
const openCreateDialog = () => {
  selectedItem.value = null
  isEditing.value = false
  editDialog.value = true
}

const openEditDialog = async (item) => {
  // Abrir el modal inmediatamente
  editDialog.value = true
  isEditing.value = true

  // Si no tiene contenido completo, obtenerlo del backend
  if (!item.content && item.id) {
    editLoading.value = true

    try {
      const fullDocument = await documentService.getDocumentById(item.id)

      // Usar el documento completo con todos los datos
      selectedItem.value = { ...fullDocument }
    } catch (error) {
      // Usar el documento original sin contenido completo
      selectedItem.value = { ...item }
    } finally {
      editLoading.value = false
    }
  } else {
    // Usar el documento original
    selectedItem.value = { ...item }
  }
}

const closeEditDialog = () => {
  editDialog.value = false
  selectedItem.value = null
  isEditing.value = false
}

const handleSaveDocument = async (documentData) => {
  if (!documentData) {
    return
  }

  try {
    // Si el documento ya tiene un ID, significa que fue creado exitosamente por ContentForm
    if (documentData.id) {
      console.log(
        '?? [ADMIN CONTENT VIEW] Documento ya creado por ContentForm, actualizando lista local',
      )

      // Solo actualizar la lista local, no crear/actualizar en el servidor
      if (isEditing.value) {
        const index = documents.value.findIndex((item) => item.id === documentData.id)
        if (index > -1) {
          documents.value[index] = documentData
        }
        success.value = `Documento "${documentData.name}" actualizado correctamente`
      } else {
        // Agregar a la lista local
        documents.value.unshift(documentData)
        success.value = `Documento "${documentData.name}" creado correctamente`
      }

      closeEditDialog()
      return
    }

    if (isEditing.value) {
      // Update existing document
      if (!documentData.id) {
        throw new Error('ID del documento no disponible para actualización')
      }

      const updatedDocument = await documentService.updateDocument(documentData.id, documentData)
      const index = documents.value.findIndex((item) => item.id === documentData.id)
      if (index > -1) {
        documents.value[index] = updatedDocument || documentData
      }
      success.value = `Documento "${documentData.name}" actualizado correctamente`
    } else {
      // Create new document (solo para documentos que no fueron creados por ContentForm)
      console.log('?? [ADMIN CONTENT VIEW] Creando documento desde AdminContentView')
      const newDocument = await documentService.createDocument(documentData)
      documents.value.unshift(newDocument || { ...documentData, id: Date.now() })
      success.value = `Documento "${documentData.name}" creado correctamente`
    }

    closeEditDialog()
  } catch (err) {
    // Manejar error específico de slug duplicado
    if (
      err.response?.status === 422 &&
      err.response?.data?.detail?.includes('slug') &&
      err.response?.data?.detail?.includes('ya existe')
    ) {
      // Generar slug único con timestamp más largo
      const timestamp = Date.now().toString()
      const baseSlug = documentData.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      const newSlug = `${baseSlug}-${timestamp}`

      // Actualizar documentData con nuevo slug
      const newDocumentData = {
        ...documentData,
        slug: newSlug,
      }

      try {
        // Intentar guardar nuevamente con el nuevo slug
        if (isEditing.value) {
          const updatedDocument = await documentService.updateDocument(
            documentData.id,
            newDocumentData,
          )
          documents.value[documents.value.findIndex((item) => item.id === documentData.id)] =
            updatedDocument
          success.value = `Documento "${documentData.name}" actualizado correctamente`
        } else {
          const newDocument = await documentService.createDocument(newDocumentData)
          documents.value.unshift(newDocument || { ...newDocumentData, id: Date.now() })
          success.value = `Documento "${documentData.name}" creado correctamente`
        }

        closeEditDialog()
        return
      } catch (retryError) {
        // Continuar con el manejo de errores normal
      }
    }

    error.value = err.message || `Error al ${isEditing.value ? 'actualizar' : 'crear'} el documento`

    // Para desarrollo, simular guardado exitoso
    if (isEditing.value) {
      const index = documents.value.findIndex((item) => item.id === documentData.id)
      if (index > -1) {
        documents.value[index] = documentData
      }
      success.value = `Documento "${documentData.name}" actualizado correctamente`
    } else {
      documents.value.unshift({ ...documentData, id: Date.now() })
      success.value = `Documento "${documentData.name}" creado correctamente`
    }
    closeEditDialog()
  }
}

const openDeleteDialog = (item) => {
  selectedItem.value = item
  deleteDialog.value = true
}

const closeDeleteDialog = () => {
  deleteDialog.value = false
  selectedItem.value = null
}

const confirmDelete = async () => {
  if (!selectedItem.value) return

  deleting.value = true
  error.value = null

  try {
    await documentService.deleteDocument(selectedItem.value.id)
    success.value = `Documento "${selectedItem.value.name}" eliminado correctamente`
    closeDeleteDialog()
    await loadDocuments()

    // Remover de seleccionados si estaba seleccionado
    const index = selectedItems.value.indexOf(selectedItem.value.id)
    if (index > -1) {
      selectedItems.value.splice(index, 1)
    }
  } catch (err) {
    error.value = err.message || 'Error al eliminar el documento'
    // Para desarrollo, simular eliminación exitosa
    if (selectedItem.value) {
      const index = documents.value.findIndex((item) => item.id === selectedItem.value.id)
      if (index > -1) {
        documents.value.splice(index, 1)
        success.value = `Documento "${selectedItem.value.name}" eliminado correctamente`
        closeDeleteDialog()
      }
    }
  } finally {
    deleting.value = false
  }
}

// Funciones de operaciones masivas
const bulkDelete = () => {
  if (selectedItems.value.length === 0) return
  showBulkDeleteModal.value = true
}

const bulkArchive = async () => {
  if (selectedItems.value.length === 0) return

  try {
    // En una aplicación real, esto se enviara al backend
    selectedItems.value.forEach((itemId) => {
      const item = documents.value.find((i) => i.id === itemId)
      if (item) {
        // Marcar como archivado agregando un campo temporal o usando roles
        item.archived = true
        item.updatedAt = new Date().toISOString()
      }
    })

    success.value = `${selectedItems.value.length} contenido(s) archivado(s) correctamente`
    selectedItems.value = []
  } catch (err) {
    error.value = 'Error al archivar los contenidos'
  }
}

const closeBulkDeleteModal = () => {
  showBulkDeleteModal.value = false
}

const confirmBulkDelete = async () => {
  if (selectedItems.value.length === 0) return

  bulkDeleting.value = true
  error.value = null

  try {
    // En una aplicación real, esto se enviar a al backend
    for (const itemId of selectedItems.value) {
      await documentService.deleteDocument(itemId)
    }

    success.value = `${selectedItems.value.length} documento(s) eliminado(s) correctamente`
    closeBulkDeleteModal()
    selectedItems.value = []
    await loadDocuments()
  } catch (err) {
    error.value = err.message || 'Error al eliminar los contenidos'
    // Para desarrollo, simular eliminación exitosa
    selectedItems.value.forEach((itemId) => {
      const index = documents.value.findIndex((item) => item.id === itemId)
      if (index > -1) {
        documents.value.splice(index, 1)
      }
    })

    success.value = `${selectedItems.value.length} contenido(s) eliminado(s) correctamente`
    closeBulkDeleteModal()
    selectedItems.value = []
  } finally {
    bulkDeleting.value = false
  }
}

// Funciones de utilidad
const getDocumentStatus = (item) => {
  // Usar directamente el campo status del documento
  if (item.status === true || item.status === 'true' || item.status === 1) {
    return 'Activo'
  } else if (item.status === false || item.status === 'fas false' || item.status === 0) {
    return 'Inactivo'
  }

  // Fallback: si no hay campo status, usar lógica anterior
  if (item.archived) {
    return 'Inactivo'
  }

  // Si tiene roles de admin, considerarlo activo
  if (item.roles && item.roles.includes('ROLE_ADMIN')) {
    return 'Activo'
  }

  // Si es tipo URL, considerarlo activo por defecto
  if (item.type === 'URL') {
    return 'Activo'
  }

  // Por defecto, inactivo
  return 'Inactivo'
}

const getTypeIcon = (type) => {
  const icons = {
    TYPE_TEXT: 'fas fas fa-file-alt',
    TYPE_URL: 'fas fas fa-link',
    TYPE_PDF: 'fas fas fa-file-pdf',
    TEXT: 'fas fas fa-file-alt',
    URL: 'fas fas fa-link',
    PDF: 'fas fas fa-file-pdf',
  }
  return icons[type] || 'fas fas fa-file'
}

const getStatusIcon = (status) => {
  const icons = {
    Activo: 'fas fas fa-check-circle',
    Inactivo: 'fas fas fa-times-circle',
  }
  return icons[status] || 'fas fas fa-question-circle'
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Función para renderizar Markdown
const renderedMarkdown = computed(() => {
  if (!previewItem.value?.content || previewItem.value.type !== 'TYPE_TEXT') {
    return ''
  }

  try {
    // Usar marked directamente (ya esta importado)
    const options = {
      breaks: true,
      gfm: true,
      smartLists: true,
      smartypants: true,
    }

    const result = marked(previewItem.value.content, options)

    return result
  } catch (error) {
    return '<p>Error al renderizar el Markdown</p>'
  }
})

// Funciones para manejar URLs
const normalizeUrl = (url) => {
  if (!url) return ''

  // Si ya tiene protocolo, devolverlo tal como está
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  // Si no tiene protocolo, agregar https://
  return `https://${url}`
}

const getUrlTitle = (url) => {
  if (!url) return 'Enlace'
  try {
    const normalizedUrl = normalizeUrl(url)
    const urlObj = new URL(normalizedUrl)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return 'Enlace'
  }
}

const getUrlDomain = (url) => {
  if (!url) return ''
  try {
    const normalizedUrl = normalizeUrl(url)
    const urlObj = new URL(normalizedUrl)
    return urlObj.hostname
  } catch {
    return url
  }
}

// Función para cargar PDF usando el servicio autenticado
const loadPdfFile = async (documentId) => {
  if (!documentId) {
    throw new Error('ID del documento no proporcionado')
  }

  try {
    console.log('?? Cargando PDF autenticado para documento:', documentId)

    // Limpiar URL anterior si existe
    if (pdfBlobUrl.value) {
      URL.revokeObjectURL(pdfBlobUrl.value)
      pdfBlobUrl.value = null
    }

    // Obtener el archivo PDF usando el servicio autenticado
    const blobUrl = await documentService.getDocumentFileUrl(documentId)
    pdfBlobUrl.value = blobUrl

    console.log('? PDF cargado exitosamente como blob URL')
    return blobUrl
  } catch (error) {
    console.error('? Error cargando PDF:', error)

    // Manejar diferentes tipos de errores
    if (
      error.message.includes('no autenticado') ||
      error.message.includes('Token de acceso no disponible')
    ) {
      throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.')
    } else if (error.response?.status === 401) {
      throw new Error('No tiene permisos para acceder a este documento.')
    } else if (error.response?.status === 404) {
      throw new Error('El documento PDF no fue encontrado.')
    } else if (error.response?.status === 403) {
      throw new Error('Acceso denegado a este documento.')
    } else if (error.response?.status === 422 || error.status === 422) {
      // Error 422: Documento no encontrado o no válido
      if (error.isFileNotFound) {
        throw new Error(
          'El archivo PDF no se encuentra en el servidor. Puede haber sido eliminado o nunca se subió correctamente.',
        )
      } else if (error.details) {
        throw new Error(error.details.detail || 'El documento PDF no existe o no es válido.')
      } else if (error.rawContent) {
        throw new Error(`Error del servidor: ${error.rawContent}`)
      } else {
        throw new Error('El documento PDF no existe o no es válido.')
      }
    } else {
      throw new Error(`Error cargando PDF: ${error.message}`)
    }
  }
}

const getPdfViewerUrl = (url) => {
  if (!url) return ''

  try {
    const normalizedUrl = normalizeUrl(url)
    const urlObj = new URL(normalizedUrl)

    // Si es un PDF directo, usar Google Docs Viewer como fallback
    if (urlObj.pathname.toLowerCase().endsWith('.pdf')) {
      return `https://docs.google.com/gview?url=${encodeURIComponent(normalizedUrl)}&embedded=true`
    }

    // Si no es un PDF directo, intentar con la URL original
    return normalizedUrl
  } catch {
    return url
  }
}

const handlePdfLoad = (event) => {
  // Verificar si el iframe cargó correctamente
  const iframe = event.target
  try {
    // Intentar acceder al contenido del iframe
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
    if (iframeDoc && iframeDoc.body) {
      // Si el contenido parece ser una página web en lugar de PDF
      if (iframeDoc.body.innerHTML.includes('<html') && !iframeDoc.body.innerHTML.includes('pdf')) {
        console.warn('El iframe cargó una página web en lugar de un PDF')
      }
    }
  } catch (error) {
    // Error de CORS, pero el PDF puede estar cargando correctamente
    console.log('No se puede acceder al contenido del iframe (CORS), pero puede estar funcionando')
  }
}

const refreshPdfViewer = async () => {
  // Forzar recarga del PDF
  currentPdfPage.value = 1
  totalPdfPages.value = 0
  pdfError.value = null
  pdfLoading.value = true

  try {
    await loadPdfFile(previewItem.value?.id)
    console.log('?? PDF recargado exitosamente')
  } catch (error) {
    console.error('? Error recargando PDF:', error)
    pdfError.value = error
    pdfLoading.value = false
  }
}

const retryPdfLoad = async () => {
  pdfError.value = null
  pdfLoading.value = true
  currentPdfPage.value = 1
  totalPdfPages.value = 0

  try {
    await loadPdfFile(previewItem.value?.id)
    console.log('?? PDF cargado exitosamente en reintento')
  } catch (error) {
    console.error('? Error en reintento de carga de PDF:', error)
    pdfError.value = error
    pdfLoading.value = false
  }
}

// Funciones para manejar eventos del PDF
const onPdfLoaded = (pdf) => {
  totalPdfPages.value = pdf.numPages
  pdfLoading.value = false
  pdfError.value = null
  console.log(`? PDF cargado exitosamente: ${totalPdfPages.value} páginas`)
  console.log('?? Objeto PDF:', pdf)
}

const onPdfError = (error) => {
  pdfError.value = error
  pdfLoading.value = false

  // Usar la utilidad para verificar si es una advertencia conocida
  if (isKnownPdfWarning(error)) {
    console.warn('?? Advertencia conocida de PDF.js (no crítica):', error.message)
    // No mostrar error al usuario para advertencias conocidas
    pdfError.value = null
    pdfLoading.value = false
    return
  }

  console.error('? Error cargando PDF:', error)
  console.error('?? Detalles del error:', {
    message: error.message,
    stack: error.stack,
    url: previewItem.value?.content,
  })
}

const onPdfPageChange = (page) => {
  currentPdfPage.value = page
}

const previousPage = () => {
  if (currentPdfPage.value > 1) {
    currentPdfPage.value--
  }
}

const nextPage = () => {
  if (currentPdfPage.value < totalPdfPages.value) {
    currentPdfPage.value++
  }
}

const goToFirstPage = () => {
  currentPdfPage.value = 1
}

const goToLastPage = () => {
  currentPdfPage.value = totalPdfPages.value
}

const zoomIn = () => {
  if (pdfZoom.value < 3.0) {
    pdfZoom.value = Math.min(pdfZoom.value + 0.25, 3.0)
    console.log(`?? Zoom aumentado a: ${Math.round(pdfZoom.value * 100)}%`)
  }
}

const zoomOut = () => {
  if (pdfZoom.value > 0.5) {
    pdfZoom.value = Math.max(pdfZoom.value - 0.25, 0.5)
    console.log(`?? Zoom reducido a: ${Math.round(pdfZoom.value * 100)}%`)
  }
}

const resetZoom = () => {
  pdfZoom.value = 1.0
  console.log(`?? Zoom reseteado a: 100%`)
}

const redirectToLogin = () => {
  console.log('?? Redirigiendo al login por error de autenticación')
  window.location.href = '/login'
}

const getPdfTitle = (content) => {
  if (!content) return 'Documento PDF'

  try {
    // Si es una URL válida
    if (content.startsWith('http://') || content.startsWith('https://')) {
      const urlObj = new URL(content)
      const pathname = urlObj.pathname
      const filename = pathname.split('/').pop()
      return filename || 'Documento PDF'
    }

    // Si parece ser un nombre de archivo PDF
    if (content.includes('.pdf')) {
      return content
    }

    // Si es otro tipo de contenido (probablemente metadatos del archivo)
    return content.length > 50 ? content.substring(0, 50) + '...' : content
  } catch (error) {
    return 'Documento PDF'
  }
}

const handlePdfError = (event) => {
  // Error cargando PDF
}

// Cargar contenidos al montar el componente
onMounted(() => {
  loadDocuments()
  // Agregar listener para navegación con teclado
  document.addEventListener('keydown', handleKeydown)
})

// Limpiar listeners al desmontar
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  // Limpiar URL del blob si existe
  if (pdfBlobUrl.value) {
    URL.revokeObjectURL(pdfBlobUrl.value)
  }
})
</script>
