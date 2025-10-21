<template>
  <div class="admin-content-layout">
    <SidebarMenu @sidebar-toggle="handleSidebarToggle" />
    <AppHeader :sidebar-expanded="sidebarExpanded" />

    <main class="main-content" :class="{ 'with-header': true }">
      <div class="content-container">
        <!-- Header Section -->
        <div class="page-header">
          <div class="header-content">
            <div class="header-left">
              <div class="page-icon">
                <i class="mdi mdi-file-document-multiple-outline"></i>
              </div>
              <div class="header-text">
                <h1 class="page-title">Administración de Contenidos</h1>
                <p class="page-subtitle">Gestiona y organiza todo el contenido de tu plataforma</p>
              </div>
            </div>
            <div class="header-actions">
              <v-btn
                v-can="['ROLE_ADMIN', 'ROLE_SUPER_USER']"
                color="primary"
                variant="elevated"
                prepend-icon="mdi-plus"
                size="large"
                class="create-btn"
                @click="openCreateDialog"
              >
                Crear Documento
              </v-btn>
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="stats-section">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="mdi mdi-file-document"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ documents.length }}</div>
                <div class="stat-label">Total Contenidos</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon active">
                <i class="mdi mdi-check-circle"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ activeCount }}</div>
                <div class="stat-label">Activos</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon inactive">
                <i class="mdi mdi-pause-circle"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ inactiveCount }}</div>
                <div class="stat-label">Inactivos</div>
              </div>
            </div>
          </div>
        </div>

            <!-- Alertas -->
        <div v-if="error || success" class="alerts-section">
          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            closable
            @click:close="error = null"
            class="alert-item"
          >
            <template #prepend>
              <i class="mdi mdi-alert-circle"></i>
            </template>
              {{ error }}
            </v-alert>

          <v-alert
            v-if="success"
            type="success"
            variant="tonal"
            closable
            @click:close="success = null"
            class="alert-item"
          >
            <template #prepend>
              <i class="mdi mdi-check-circle"></i>
            </template>
              {{ success }}
            </v-alert>
        </div>

        <!-- Content Management Section -->
        <div class="content-section">
          <!-- Filters and Search Bar -->
          <div class="filters-section">
            <div class="search-container">
              <div class="search-input-wrapper">
                <i class="mdi mdi-magnify search-icon"></i>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Buscar contenidos por título, autor o tipo..."
                  class="search-input"
                  @input="onSearchInput"
                />
                <button
                  v-if="searchQuery"
                  @click="clearSearch"
                  class="clear-search-btn"
                >
                  <i class="mdi mdi-close"></i>
                </button>
              </div>
            </div>

            <div class="filter-controls">
              <div class="filter-group">
                <label class="filter-label">Tipo:</label>
                <select v-model="filterType" class="filter-select">
                  <option value="">Todos los tipos</option>
                  <option value="TYPE_TEXT">TEXT</option>
                  <option value="TYPE_URL">URL</option>
                  <option value="TYPE_PDF">PDF</option>
                </select>
                </div>

              <div class="filter-group">
                <label class="filter-label">Estado:</label>
                <select v-model="filterStatus" class="filter-select">
                  <option value="">Todos los estados</option>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>

              <div class="filter-group">
                <label class="filter-label">Autor:</label>
                <select v-model="filterAuthor" class="filter-select">
                  <option value="">Todos los autores</option>
                  <option v-for="author in uniqueAuthors" :key="author" :value="author">
                    {{ author }}
                  </option>
                </select>
              </div>

              <button @click="clearAllFilters" class="clear-filters-btn">
                <i class="mdi mdi-filter-remove"></i>
                Limpiar Filtros
              </button>
            </div>
          </div>

          <!-- View Controls -->
          <div class="view-controls">
            <div class="view-toggle">
              <button
                :class="['view-btn', { active: viewMode === 'table' }]"
                @click="viewMode = 'table'"
              >
                <i class="mdi mdi-view-list"></i>
                Tabla
              </button>
              <button
                :class="['view-btn', { active: viewMode === 'grid' }]"
                @click="viewMode = 'grid'"
              >
                <i class="mdi mdi-view-grid"></i>
                Tarjetas
              </button>
            </div>

            <div class="bulk-actions" v-if="selectedItems.length > 0">
              <span class="selected-count">{{ selectedItems.length }} seleccionados</span>
              <button @click="bulkDelete" class="bulk-action-btn delete">
                <i class="mdi mdi-delete"></i>
                Eliminar
              </button>
              <button @click="bulkArchive" class="bulk-action-btn archive">
                <i class="mdi mdi-archive"></i>
                Archivar
              </button>
            </div>

            <div class="sort-controls">
              <select v-model="sortBy" class="sort-select">
                <option value="createdAt">Fecha de creación</option>
                <option value="title">Título</option>
                <option value="type">Tipo</option>
                <option value="author">Autor</option>
                <option value="status">Estado</option>
              </select>
              <button
                @click="toggleSortOrder"
                class="sort-order-btn"
                :title="sortOrder === 'asc' ? 'Ordenar descendente' : 'Ordenar ascendente'"
              >
                <i :class="sortOrder === 'asc' ? 'mdi mdi-sort-ascending' : 'mdi mdi-sort-descending'"></i>
              </button>
            </div>
          </div>

          <!-- Content Display -->
          <div class="content-display">
            <!-- Table View -->
            <div v-if="viewMode === 'table'" class="table-container">
              <div class="table-wrapper">
                <table class="content-table">
                  <thead>
                    <tr>
                      <th class="checkbox-column">
                        <input
                          type="checkbox"
                          :checked="allSelected"
                          @change="toggleSelectAll"
                          class="table-checkbox"
                        />
                      </th>
                      <th>Título</th>
                      <th>Tipo</th>
                      <th>Estado</th>
                      <th>Autor</th>
                      <th>Fecha de Creación</th>
                      <th>Última Modificación</th>
                      <th class="actions-column">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="loading" class="loading-row">
                      <td colspan="8" class="loading-cell">
                        <div class="loading-content">
                          <div class="loading-spinner"></div>
                          <span>Cargando contenidos...</span>
                        </div>
                      </td>
                    </tr>
                    <tr v-else-if="filteredItems.length === 0" class="no-data-row">
                      <td colspan="8" class="no-data-cell">
                        <div class="no-data-content">
                          <i class="mdi mdi-file-document-outline"></i>
                          <h3>No se encontraron contenidos</h3>
                          <p v-if="hasActiveFilters">
                            Prueba ajustando los filtros o términos de búsqueda
                          </p>
                          <p v-else>
                            Comienza creando tu primer contenido
                          </p>
                        </div>
                      </td>
                    </tr>
                    <tr
                      v-else
                      v-for="item in paginatedItems"
                      :key="item.id"
                      class="content-row"
                      :class="{ selected: selectedItems.includes(item.id) }"
                    >
                      <td class="checkbox-column">
                        <input
                          type="checkbox"
                          :checked="selectedItems.includes(item.id)"
                          @change="toggleItemSelection(item.id)"
                          class="table-checkbox"
                        />
                      </td>
                      <td class="title-column">
                        <div class="title-content">
                          <div
                            @click="previewContent(item)"
                            class="title-text clickable"
                            :title="`Hacer clic para ver vista previa de: ${item.name}`"
                          >
                            {{ item.name }}
                          </div>
                          <div class="title-description" v-if="item.slug">
                            📁 {{ item.slug }}
                          </div>
                        </div>
                      </td>
                      <td class="type-column">
                        <div class="type-chip" :class="`type-${(item.type || 'unknown').toLowerCase()}`">
                          <i :class="getTypeIcon(item.type)"></i>
                  {{ item.type || 'Unknown' }}
                        </div>
                      </td>
                      <td class="status-column">
                        <div
                          v-can="['ROLE_ADMIN', 'ROLE_SUPER_USER']"
                          @click="toggleDocumentStatus(item)"
                          class="status-chip clickable"
                          :class="`status-${getDocumentStatus(item).toLowerCase()}`"
                          :title="`Hacer clic para ${getDocumentStatus(item) === 'Activo' ? 'desactivar' : 'activar'}`"
                        >
                          <i :class="getStatusIcon(getDocumentStatus(item))"></i>
                          {{ getDocumentStatus(item) }}
                        </div>
                      </td>
                      <td class="author-column">
                        <div class="author-info">
                          <i class="mdi mdi-account author-icon"></i>
                  {{ item.createdBy || 'Sin autor' }}
                </div>
                      </td>
                      <td class="date-column">
                {{ formatDate(item.createdAt) }}
                      </td>
                      <td class="date-column">
                        {{ formatDate(item.updatedAt || item.createdAt) }}
                      </td>
                      <td class="actions-column">
                        <div class="action-buttons">
                          <button
                            v-can="['ROLE_ADMIN', 'ROLE_SUPER_USER']"
                            @click="openEditDialog(item)"
                            class="action-btn edit"
                            title="Editar"
                          >
                            <i class="mdi mdi-pencil"></i>
                          </button>
                          <button
                            v-can="['ROLE_ADMIN', 'ROLE_SUPER_USER']"
                            @click="openDeleteDialog(item)"
                            class="action-btn delete"
                            title="Eliminar"
                          >
                            <i class="mdi mdi-delete"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Grid View -->
            <div v-else class="grid-container">
              <div v-if="loading" class="loading-grid">
                <div v-for="i in 6" :key="i" class="skeleton-card"></div>
                </div>
              <div v-else-if="filteredItems.length === 0" class="no-data-grid">
                <div class="no-data-content">
                  <i class="mdi mdi-file-document-outline"></i>
                  <h3>No se encontraron contenidos</h3>
                  <p v-if="hasActiveFilters">
                    Prueba ajustando los filtros o términos de búsqueda
                  </p>
                  <p v-else>
                    Comienza creando tu primer contenido
                  </p>
                </div>
              </div>
              <div v-else class="content-grid">
                <div
                  v-for="item in paginatedItems"
                  :key="item.id"
                  class="content-card"
                  :class="{ selected: selectedItems.includes(item.id) }"
                >
                  <div class="card-header">
                    <div class="card-checkbox">
                      <input
                        type="checkbox"
                        :checked="selectedItems.includes(item.id)"
                        @change="toggleItemSelection(item.id)"
                        class="checkbox-input"
                      />
                    </div>
                    <div class="card-type" :class="`type-${item.type.toLowerCase()}`">
                      <i :class="getTypeIcon(item.type)"></i>
                      {{ item.type }}
                    </div>
                    <div
                    v-can="['ROLE_ADMIN', 'ROLE_SUPER_USER']"
                      @click="toggleDocumentStatus(item)"
                      class="card-status clickable"
                      :class="`status-${getDocumentStatus(item).toLowerCase()}`"
                      :title="`Hacer clic para ${getDocumentStatus(item) === 'Activo' ? 'desactivar' : 'activar'}`"
                    >
                      <i :class="getStatusIcon(getDocumentStatus(item))"></i>
                    </div>
                  </div>

                  <div class="card-content">
                    <h3
                      @click="previewContent(item)"
                      class="card-title clickable"
                      :title="`Hacer clic para ver vista previa de: ${item.name}`"
                    >
                      {{ item.name }}
                    </h3>
                    <p class="card-description" v-if="item.slug">
                      📁 {{ item.slug }}
                    </p>

                    <div class="card-meta">
                      <div class="card-author">
                        <i class="mdi mdi-account"></i>
                        {{ item.createdBy || 'Sin autor' }}
                      </div>
                      <div class="card-date">
                        <i class="mdi mdi-calendar"></i>
                {{ formatDate(item.createdAt) }}
                      </div>
                    </div>
                  </div>

                  <div class="card-actions">
                    <button
                    v-can="['ROLE_ADMIN', 'ROLE_SUPER_USER']"
                    @click="openEditDialog(item)"
                      class="card-action-btn edit"
                      title="Editar"
                    >
                      <i class="mdi mdi-pencil"></i>
                    </button>
                    <button
                    v-can="['ROLE_ADMIN', 'ROLE_SUPER_USER']"
                    @click="openDeleteDialog(item)"
                      class="card-action-btn delete"
                      title="Eliminar"
                    >
                      <i class="mdi mdi-delete"></i>
                    </button>
                </div>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="pagination-section">
              <div class="pagination-info">
                Mostrando {{ startItem }} - {{ endItem }} de {{ filteredItems.length }} contenidos
              </div>
              <div class="pagination-controls">
                <button
                  @click="currentPage = 1"
                  :disabled="currentPage === 1"
                  class="pagination-btn"
                  title="Primera página"
                >
                  <i class="mdi mdi-chevron-double-left"></i>
                </button>
                <button
                  @click="currentPage--"
                  :disabled="currentPage === 1"
                  class="pagination-btn"
                  title="Página anterior"
                >
                  <i class="mdi mdi-chevron-left"></i>
                </button>

                <div class="pagination-numbers">
                  <button
                    v-for="page in visiblePages"
                    :key="page"
                    @click="currentPage = page"
                    :class="['pagination-number', { active: currentPage === page }]"
                  >
                    {{ page }}
                  </button>
                </div>

                <button
                  @click="currentPage++"
                  :disabled="currentPage === totalPages"
                  class="pagination-btn"
                  title="Página siguiente"
                >
                  <i class="mdi mdi-chevron-right"></i>
                </button>
                <button
                  @click="currentPage = totalPages"
                  :disabled="currentPage === totalPages"
                  class="pagination-btn"
                  title="Última página"
                >
                  <i class="mdi mdi-chevron-double-right"></i>
                </button>
              </div>
              <div class="items-per-page">
                <label>Elementos por página:</label>
                <select v-model="itemsPerPage" class="items-select">
                  <option :value="10">10</option>
                  <option :value="25">25</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Content Preview Modal -->
    <div v-if="showPreviewModal" class="modal-overlay" @click="closePreviewModal">
      <div class="preview-modal" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">
            <i class="mdi mdi-eye"></i>
            Vista Previa
          </h2>
          <button @click="closePreviewModal" class="modal-close-btn">
            <i class="mdi mdi-close"></i>
          </button>
        </div>
        <div class="modal-content">
          <div class="preview-content">
            <div class="preview-header">
              <h1 class="preview-title">{{ previewItem?.name }}</h1>
              <div class="preview-meta">
                <div class="preview-type">
                  <i :class="getTypeIcon(previewItem?.type)"></i>
                  {{ previewItem?.type }}
                </div>
                <div class="preview-author">
                  <i class="mdi mdi-account"></i>
                  {{ previewItem?.author || 'Sin autor' }}
                </div>
                <div class="preview-date">
                  <i class="mdi mdi-calendar"></i>
                  {{ formatDate(previewItem?.createdAt) }}
                </div>
              </div>
            </div>
            <div class="preview-body">
              <p v-if="previewItem?.description">{{ previewItem.description }}</p>

              <!-- Indicador de carga -->
              <div v-if="previewLoading" class="preview-loading">
                <div class="loading-spinner"></div>
                <p>Cargando contenido del documento...</p>
              </div>

              <!-- Vista previa del contenido según el tipo -->
              <div v-else-if="previewItem?.content" class="content-preview">
                <!-- Contenido Markdown/TEXT -->
                <div v-if="previewItem.type === 'TYPE_TEXT'" class="markdown-preview" v-html="renderedMarkdown"></div>

                <!-- Contenido URL -->
                <div v-else-if="previewItem.type === 'TYPE_URL'" class="url-preview">
                  <div class="url-preview-card">
                    <div class="url-info">
                      <div class="url-title">{{ getUrlTitle(previewItem.content) }}</div>
                      <div class="url-domain">{{ getUrlDomain(previewItem.content) }}</div>
                    </div>
                    <a :href="normalizeUrl(previewItem.content)" target="_blank" rel="noopener noreferrer" class="preview-link">
                      <i class="mdi mdi-open-in-new"></i>
                      Abrir enlace
                    </a>
                  </div>
                </div>

                <!-- Contenido PDF -->
                <div v-else-if="previewItem.type === 'TYPE_PDF'" class="pdf-preview">
                  <div class="pdf-preview-card">
                    <div class="pdf-info">
                      <div class="pdf-title">{{ getPdfTitle(previewItem.content) }}</div>
                      <div class="pdf-url">{{ previewItem.content }}</div>
                    </div>

                    <!-- Mostrar PDF usando vue-pdf-embed -->
                    <div v-if="previewItem.id" class="pdf-viewer-container">
                      <!-- Indicador de carga -->
                      <div v-if="pdfLoading" class="pdf-loading">
                        <div class="loading-spinner"></div>
                        <p>Cargando PDF...</p>
                      </div>

                      <!-- Visor de PDF -->
                      <VuePdfEmbed
                        v-show="!pdfLoading && pdfBlobUrl"
                        :source="pdfBlobUrl"
                        :page="currentPdfPage"
                        class="pdf-viewer"
                        @loaded="onPdfLoaded"
                        @error="onPdfError"
                        @page-change="onPdfPageChange"
                      />


                      <!-- Mensaje de error si hay problema -->
                      <div v-if="pdfError" class="pdf-error-message">
                        <i class="mdi mdi-alert-circle"></i>
                        <h4>Error al cargar el PDF</h4>
                        <p>{{ pdfError.message || 'No se pudo cargar el documento PDF' }}</p>

                        <!-- Botón especial para errores de autenticación -->
                        <div v-if="pdfError.message && pdfError.message.includes('sesión')" class="auth-error-actions">
                          <button @click="redirectToLogin" class="pdf-link auth-login">
                            <i class="mdi mdi-login"></i>
                            Ir al Login
                          </button>
                        </div>

                        <!-- Mensaje especial para errores 422 -->
                        <div v-else-if="pdfError.message && (pdfError.message.includes('no existe') || pdfError.message.includes('no se encuentra'))" class="document-error-actions">
                          <p class="error-suggestion">
                            <i class="mdi mdi-information"></i>
                            Este documento puede haber sido eliminado o no tener un archivo PDF asociado.
                          </p>
                          <div class="error-actions">
                            <button @click="retryPdfLoad" class="pdf-link refresh">
                              <i class="mdi mdi-refresh"></i>
                              Reintentar
                            </button>
                            <button @click="editFromPreview" class="pdf-link edit" v-can="['ROLE_ADMIN', 'ROLE_SUPER_USER']">
                              <i class="mdi mdi-upload"></i>
                              Subir PDF
                            </button>
                          </div>
                        </div>

                        <!-- Botón de reintento para otros errores -->
                        <button v-else @click="retryPdfLoad" class="pdf-link refresh">
                          <i class="mdi mdi-refresh"></i>
                          Reintentar
                        </button>
                      </div>

                      <!-- Controles de navegación -->
                      <!-- <div v-if="!pdfLoading && !pdfError && totalPdfPages > 0" class="pdf-controls">
                        <button
                          @click="previousPage"
                          :disabled="currentPdfPage <= 1"
                          class="pdf-control-btn"
                        >
                          <i class="mdi mdi-chevron-left"></i>
                          Anterior
                        </button>

                        <span class="pdf-page-info">
                          Página {{ currentPdfPage }} de {{ totalPdfPages }}
                        </span>

                        <button
                          @click="nextPage"
                          :disabled="currentPdfPage >= totalPdfPages"
                          class="pdf-control-btn"
                        >
                          Siguiente
                          <i class="mdi mdi-chevron-right"></i>
                        </button>
                      </div> -->

                      <!-- <div class="pdf-actions">
                        <a :href="pdfBlobUrl" target="_blank" rel="noopener noreferrer" class="pdf-link">
                          <i class="mdi mdi-open-in-new"></i>
                          Abrir PDF en nueva pestaña
                        </a>
                        <a :href="pdfBlobUrl" download class="pdf-link">
                          <i class="mdi mdi-download"></i>
                          Descargar PDF
                        </a>
                        <button @click="refreshPdfViewer" class="pdf-link refresh">
                          <i class="mdi mdi-refresh"></i>
                          Actualizar vista
                        </button>
                      </div> -->
                    </div>

                    <!-- Mensaje de error si no hay ID válido -->
                    <div v-else class="pdf-error">
                      <div class="error-icon">
                        <i class="mdi mdi-alert-circle"></i>
                      </div>
                      <div class="error-message">
                        <h4>No se puede mostrar el PDF</h4>
                        <p v-if="!previewItem.id">El documento no tiene un ID válido para cargar el PDF.</p>
                        <p v-else>Error al cargar el PDF.</p>
                        <p><strong>ID del documento:</strong> {{ previewItem.id || 'No disponible' }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Tipo desconocido -->
                <div v-else class="unknown-content">
                  <i class="mdi mdi-file-question"></i>
                  <p>Tipo de contenido no soportado: {{ previewItem.type }}</p>
                  <div class="raw-content">
                    <pre>{{ previewItem.content }}</pre>
                  </div>
                </div>
              </div>

              <!-- Sin contenido -->
              <div v-else class="preview-placeholder">
                <i class="mdi mdi-file-document-outline"></i>
                <p>No hay contenido disponible para mostrar</p>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <!-- Panel de navegación PDF compacto -->
          <div v-if="!pdfLoading && pdfBlobUrl && totalPdfPages > 1 && previewItem?.type === 'TYPE_PDF'" class="pdf-nav-compact">
            <div class="nav-compact-controls">
              <button
                @click="previousPage"
                :disabled="currentPdfPage <= 1"
                class="nav-compact-btn prev-btn"
                title="Página anterior"
              >
                <i class="mdi mdi-chevron-left"></i>
              </button>

              <div class="page-compact-info">
                <span class="page-compact-counter">
                  {{ currentPdfPage }} / {{ totalPdfPages }}
                </span>
                <div class="page-compact-progress">
                  <div
                    class="progress-compact-bar"
                    :style="{ width: `${(currentPdfPage / totalPdfPages) * 100}%` }"
                  ></div>
                </div>
              </div>

              <button
                @click="nextPage"
                :disabled="currentPdfPage >= totalPdfPages"
                class="nav-compact-btn next-btn"
                title="Página siguiente"
              >
                <i class="mdi mdi-chevron-right"></i>
              </button>

              <div class="nav-compact-shortcuts">
                <button
                  @click="goToFirstPage"
                  :disabled="currentPdfPage <= 1"
                  class="shortcut-compact-btn"
                  title="Primera página"
                >
                  <i class="mdi mdi-skip-previous"></i>
                </button>

                <button
                  @click="goToLastPage"
                  :disabled="currentPdfPage >= totalPdfPages"
                  class="shortcut-compact-btn"
                  title="Última página"
                >
                  <i class="mdi mdi-skip-next"></i>
                </button>

                <div class="zoom-compact-controls">
                  <button
                    @click="zoomOut"
                    class="zoom-compact-btn"
                    title="Alejar"
                  >
                    <i class="mdi mdi-magnify-minus"></i>
                  </button>

                  <span class="zoom-compact-level">{{ Math.round(pdfZoom * 100) }}%</span>

                  <button
                    @click="zoomIn"
                    class="zoom-compact-btn"
                    title="Acercar"
                  >
                    <i class="mdi mdi-magnify-plus"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button @click="closePreviewModal" class="modal-btn secondary">
            Cerrar
          </button>
          <button
            v-can="['ROLE_ADMIN', 'ROLE_SUPER_USER']"
            @click="editFromPreview"
            class="modal-btn primary"
          >
            <i class="mdi mdi-pencil"></i>
            Editar
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="deleteDialog" class="modal-overlay" @click="closeDeleteDialog">
      <div class="delete-modal" @click.stop>
        <div class="modal-header">
          <div class="delete-icon">
            <i class="mdi mdi-alert-circle"></i>
          </div>
          <h2 class="modal-title">Confirmar Eliminación</h2>
        </div>
        <div class="modal-content">
          <p>
            ¿Estás seguro de que deseas eliminar el documento
            <strong>"{{ selectedItem?.name }}"</strong>?
          </p>
          <p class="warning-text">
            <i class="mdi mdi-alert"></i>
          Esta acción no se puede deshacer.
          </p>
        </div>
        <div class="modal-actions">
          <button @click="closeDeleteDialog" class="modal-btn secondary">
            Cancelar
          </button>
          <button @click="confirmDelete" :disabled="deleting" class="modal-btn danger">
            <i v-if="deleting" class="loading-spinner small"></i>
            <i v-else class="mdi mdi-delete"></i>
            {{ deleting ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Bulk Delete Confirmation Modal -->
    <div v-if="showBulkDeleteModal" class="modal-overlay" @click="closeBulkDeleteModal">
      <div class="delete-modal" @click.stop>
        <div class="modal-header">
          <div class="delete-icon">
            <i class="mdi mdi-alert-circle"></i>
          </div>
          <h2 class="modal-title">Confirmar Eliminación Masiva</h2>
        </div>
        <div class="modal-content">
          <p>
            ¿Estás seguro de que deseas eliminar
            <strong>{{ selectedItems.length }} contenido(s)</strong>?
          </p>
          <p class="warning-text">
            <i class="mdi mdi-alert"></i>
            Esta acción no se puede deshacer.
          </p>
        </div>
        <div class="modal-actions">
          <button @click="closeBulkDeleteModal" class="modal-btn secondary">
            Cancelar
          </button>
          <button @click="confirmBulkDelete" :disabled="bulkDeleting" class="modal-btn danger">
            <i v-if="bulkDeleting" class="loading-spinner small"></i>
            <i v-else class="mdi mdi-delete"></i>
            {{ bulkDeleting ? 'Eliminando...' : 'Eliminar Todo' }}
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
  buildPdfUrl
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
const selectedItem = ref(null)
const previewItem = ref(null)
const previewLoading = ref(false)
const editLoading = ref(false)
const isEditing = ref(false)
const deleting = ref(false)
const bulkDeleting = ref(false)

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
const activeCount = computed(() =>
  documents.value.filter(item => {
    const status = getDocumentStatus(item)
    return status === 'Activo'
  }).length
)

const inactiveCount = computed(() =>
  documents.value.filter(item => {
    const status = getDocumentStatus(item)
    return status === 'Inactivo'
  }).length
)

const textDocumentsCount = computed(() =>
  documents.value.filter(item => item.type === 'TEXT').length
)

const urlDocumentsCount = computed(() =>
  documents.value.filter(item => item.type === 'URL').length
)

const pdfDocumentsCount = computed(() =>
  documents.value.filter(item => item.type === 'PDF').length
)

// Computed para autores únicos
const uniqueAuthors = computed(() => {
  const authors = [...new Set(documents.value.map(item => item.createdBy).filter(Boolean))]
  return authors.sort()
})

// Computed para filtrado y búsqueda
const filteredItems = computed(() => {
  let items = [...documents.value]

  // Aplicar búsqueda
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    items = items.filter(item =>
      item.name?.toLowerCase().includes(query) ||
      item.slug?.toLowerCase().includes(query) ||
      item.type?.toLowerCase().includes(query) ||
      item.createdBy?.toLowerCase().includes(query)
    )
  }

  // Aplicar filtros
  if (filterType.value) {
    items = items.filter(item => item.type === filterType.value)
  }

  if (filterStatus.value) {
    items = items.filter(item => getDocumentStatus(item) === filterStatus.value)
  }

  if (filterAuthor.value) {
    items = items.filter(item => item.createdBy === filterAuthor.value)
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
      // Para strings, convertir a lowercase para ordenamiento insensible a mayúsculas
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
const hasActiveFilters = computed(() =>
  searchQuery.value.trim() || filterType.value || filterStatus.value || filterAuthor.value
)

const allSelected = computed(() =>
  paginatedItems.value.length > 0 &&
  paginatedItems.value.every(item => selectedItems.value.includes(item.id))
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
    paginatedItems.value.forEach(item => {
      const index = selectedItems.value.indexOf(item.id)
      if (index > -1) {
        selectedItems.value.splice(index, 1)
      }
    })
  } else {
    // Seleccionar todos los elementos de la página actual
    paginatedItems.value.forEach(item => {
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
      console.log('📄 PDF cargado exitosamente para documento:', item.id)
    } catch (error) {
      console.error('❌ Error cargando PDF:', error)
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
          console.log('📄 PDF cargado exitosamente para documento completo:', fullDocument.id)
        } catch (error) {
          console.error('❌ Error cargando PDF:', error)
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

    // En una aplicación real, esto se enviaría al backend
    documents.value.unshift(duplicatedItem)
    success.value = `Contenido "${item.name}" duplicado correctamente`
  } catch (err) {
    error.value = 'Error al duplicar el contenido'
  }
}

const toggleDocumentStatus = async (item) => {
  if (!item || !item.id) {
    return
  }

  try {
    const currentStatus = getDocumentStatus(item)
    const newStatus = currentStatus === 'Activo' ? false : true

    // Limpiar roles para remover prefijo ROLE_ duplicado si existe
    const cleanRoles = (item.roles || []).map(role => {
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
      roles: cleanRoles
    }

    // Actualizar el documento en el backend
    const updatedDocument = await documentService.updateDocument(item.id, updateData)

    // Actualizar en la lista local
    const index = documents.value.findIndex(doc => doc.id === item.id)
    if (index > -1) {
      documents.value[index] = updatedDocument || { ...item, status: newStatus }
    }

    const statusText = newStatus ? 'activado' : 'desactivado'
    success.value = `Documento "${item.name}" ${statusText} correctamente`

  } catch (error) {
    error.value = 'Error al cambiar el estado del documento'
  }
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
      console.log('📄 [ADMIN CONTENT VIEW] Documento ya creado por ContentForm, actualizando lista local')

      // Solo actualizar la lista local, no crear/actualizar en el servidor
      if (isEditing.value) {
        const index = documents.value.findIndex(item => item.id === documentData.id)
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
      const index = documents.value.findIndex(item => item.id === documentData.id)
      if (index > -1) {
        documents.value[index] = updatedDocument || documentData
      }
      success.value = `Documento "${documentData.name}" actualizado correctamente`
    } else {
      // Create new document (solo para documentos que no fueron creados por ContentForm)
      console.log('📄 [ADMIN CONTENT VIEW] Creando documento desde AdminContentView')
      const newDocument = await documentService.createDocument(documentData)
      documents.value.unshift(newDocument || { ...documentData, id: Date.now() })
      success.value = `Documento "${documentData.name}" creado correctamente`
    }

    closeEditDialog()
  } catch (err) {

    // Manejar error específico de slug duplicado
    if (err.response?.status === 422 && err.response?.data?.detail?.includes('slug') && err.response?.data?.detail?.includes('ya existe')) {

      // Generar slug único con timestamp más largo
      const timestamp = Date.now().toString()
      const baseSlug = documentData.name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      const newSlug = `${baseSlug}-${timestamp}`


      // Actualizar documentData con nuevo slug
      const newDocumentData = {
        ...documentData,
        slug: newSlug
      }

      try {
        // Intentar guardar nuevamente con el nuevo slug
        if (isEditing.value) {
          const updatedDocument = await documentService.updateDocument(documentData.id, newDocumentData)
          documents.value[documents.value.findIndex(item => item.id === documentData.id)] = updatedDocument
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
      const index = documents.value.findIndex(item => item.id === documentData.id)
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
      const index = documents.value.findIndex(item => item.id === selectedItem.value.id)
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
    // En una aplicación real, esto se enviaría al backend
    selectedItems.value.forEach(itemId => {
      const item = documents.value.find(i => i.id === itemId)
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
    // En una aplicación real, esto se enviaría al backend
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
    selectedItems.value.forEach(itemId => {
      const index = documents.value.findIndex(item => item.id === itemId)
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
  } else if (item.status === false || item.status === 'false' || item.status === 0) {
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
    'TYPE_TEXT': 'mdi mdi-file-document',
    'TYPE_URL': 'mdi mdi-link',
    'TYPE_PDF': 'mdi mdi-file-pdf-box',
    'TEXT': 'mdi mdi-file-document',
    'URL': 'mdi mdi-link',
    'PDF': 'mdi mdi-file-pdf-box',
  }
  return icons[type] || 'mdi mdi-file'
}

const getStatusIcon = (status) => {
  const icons = {
    'Activo': 'mdi mdi-check-circle',
    'Inactivo': 'mdi mdi-close-circle',
  }
  return icons[status] || 'mdi mdi-help-circle'
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
    // Usar marked directamente (ya está importado)
    const options = {
      breaks: true,
      gfm: true,
      smartLists: true,
      smartypants: true
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
    console.log('📄 Cargando PDF autenticado para documento:', documentId)

    // Limpiar URL anterior si existe
    if (pdfBlobUrl.value) {
      URL.revokeObjectURL(pdfBlobUrl.value)
      pdfBlobUrl.value = null
    }

    // Obtener el archivo PDF usando el servicio autenticado
    const blobUrl = await documentService.getDocumentFileUrl(documentId)
    pdfBlobUrl.value = blobUrl

    console.log('✅ PDF cargado exitosamente como blob URL')
    return blobUrl
  } catch (error) {
    console.error('❌ Error cargando PDF:', error)

    // Manejar diferentes tipos de errores
    if (error.message.includes('no autenticado') || error.message.includes('Token de acceso no disponible')) {
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
        throw new Error('El archivo PDF no se encuentra en el servidor. Puede haber sido eliminado o nunca se subió correctamente.')
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
    console.log('🔄 PDF recargado exitosamente')
  } catch (error) {
    console.error('❌ Error recargando PDF:', error)
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
    console.log('🔄 PDF cargado exitosamente en reintento')
  } catch (error) {
    console.error('❌ Error en reintento de carga de PDF:', error)
    pdfError.value = error
    pdfLoading.value = false
  }
}

// Funciones para manejar eventos del PDF
const onPdfLoaded = (pdf) => {
  totalPdfPages.value = pdf.numPages
  pdfLoading.value = false
  pdfError.value = null
  console.log(`✅ PDF cargado exitosamente: ${totalPdfPages.value} páginas`)
  console.log('📄 Objeto PDF:', pdf)
}

const onPdfError = (error) => {
  pdfError.value = error
  pdfLoading.value = false

  // Usar la utilidad para verificar si es una advertencia conocida
  if (isKnownPdfWarning(error)) {
    console.warn('⚠️ Advertencia conocida de PDF.js (no crítica):', error.message)
    // No mostrar error al usuario para advertencias conocidas
    pdfError.value = null
    pdfLoading.value = false
    return
  }

  console.error('❌ Error cargando PDF:', error)
  console.error('🔍 Detalles del error:', {
    message: error.message,
    stack: error.stack,
    url: previewItem.value?.content
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
  }
}

const zoomOut = () => {
  if (pdfZoom.value > 0.5) {
    pdfZoom.value = Math.max(pdfZoom.value - 0.25, 0.5)
  }
}

const resetZoom = () => {
  pdfZoom.value = 1.0
}

const redirectToLogin = () => {
  console.log('🔄 Redirigiendo al login por error de autenticación')
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

<style scoped>
/* Layout Principal */
.admin-content-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
}

.main-content {
  flex: 1;
  margin-left: 60px;
  transition: margin-left 0.3s ease;
  min-height: 100vh;
}

.main-content.with-header {
  padding-top: 60px;
}

.content-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header Section */
.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-primary));
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(var(--primary-color-rgb), 0.2);
}

.page-icon i {
  font-size: 28px;
  color: white;
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 400;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.create-btn {
  font-weight: 600;
  border-radius: 12px;
  padding: 12px 24px;
  box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.3);
  transition: all 0.3s ease;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(var(--primary-color-rgb), 0.4);
}

.load-sample-btn {
  font-weight: 600;
  border-radius: 12px;
  padding: 12px 24px;
  transition: all 0.3s ease;
}

.load-sample-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Stats Section */
.stats-section {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: var(--accent-primary);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-bg);
  color: var(--accent-primary);
}

.stat-icon.active {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.stat-icon.inactive {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error-color);
}

.stat-icon i {
  font-size: 24px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Alerts Section */
.alerts-section {
  margin-bottom: 2rem;
}

.alert-item {
  margin-bottom: 1rem;
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.alert-item:last-child {
  margin-bottom: 0;
}

/* Content Section */
.content-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

/* Filters Section */
.filters-section {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.search-container {
  margin-bottom: 1.5rem;
}

.search-input-wrapper {
  position: relative;
  max-width: 500px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 20px;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.1);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.clear-search-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.clear-search-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

.filter-select {
  padding: 8px 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 0.9rem;
  min-width: 120px;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.1);
}

.clear-filters-btn {
  background: var(--bg-hover);
  border: 2px solid var(--border-color);
  color: var(--text-secondary);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.clear-filters-btn:hover {
  background: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
}

/* View Controls */
.view-controls {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.view-toggle {
  display: flex;
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 4px;
  border: 1px solid var(--border-color);
}

.view-btn {
  background: none;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.view-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.view-btn.active {
  background: var(--accent-primary);
  color: white;
  box-shadow: 0 2px 4px rgba(var(--primary-color-rgb), 0.2);
}

.bulk-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 8px 16px;
  background: var(--accent-bg);
  border-radius: 8px;
  border: 1px solid var(--accent-primary);
}

.selected-count {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--accent-primary);
}

.bulk-action-btn {
  background: none;
  border: 1px solid var(--border-color);
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.bulk-action-btn.delete {
  color: var(--error-color);
  border-color: var(--error-color);
}

.bulk-action-btn.delete:hover {
  background: var(--error-color);
  color: white;
}

.bulk-action-btn.archive {
  color: var(--text-secondary);
}

.bulk-action-btn.archive:hover {
  background: var(--text-secondary);
  color: white;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-select {
  padding: 8px 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.sort-select:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.1);
}

.sort-order-btn {
  background: var(--bg-hover);
  border: 2px solid var(--border-color);
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.sort-order-btn:hover {
  background: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
}

/* Table View */
.table-container {
  padding: 0;
}

.table-wrapper {
  overflow-x: auto;
  overflow-y: visible;
  -webkit-overflow-scrolling: touch;
}

.table-wrapper::-webkit-scrollbar {
  height: 8px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: 4px;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

.content-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-card);
}

.content-table thead {
  background: var(--bg-secondary);
}

.content-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
  font-size: 0.9rem;
  white-space: nowrap;
}

.content-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--border-light);
  vertical-align: middle;
}

.content-row {
  transition: all 0.2s ease;
}

.content-row:hover {
  background: var(--bg-hover);
}

.content-row.selected {
  background: rgba(var(--primary-color-rgb), 0.05);
  border-left: 4px solid var(--accent-primary);
}

.checkbox-column {
  width: 40px;
  text-align: center;
}

.table-checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--accent-primary);
  cursor: pointer;
}

.title-column {
  min-width: 200px;
  max-width: 300px;
}

.title-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.title-text {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1rem;
}

.title-text.clickable {
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
}

.title-text.clickable:hover {
  color: #007bff;
  text-decoration: underline;
  transform: translateX(2px);
}

.title-description {
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.type-column,
.status-column {
  width: 100px;
}

.type-chip,
.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.status-chip.clickable {
  cursor: pointer;
  user-select: none;
}

.status-chip.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: rgba(0, 0, 0, 0.1);
}

.status-chip.clickable:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.type-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Tipos de documento principales */
.type-chip.type-type_text,
.type-chip.type-text {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.25));
  color: #1d4ed8;
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.type-chip.type-type_url,
.type-chip.type-url {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.25));
  color: #047857;
  border-color: rgba(16, 185, 129, 0.3);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
}

.type-chip.type-type_pdf,
.type-chip.type-pdf {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.25));
  color: #dc2626;
  border-color: rgba(239, 68, 68, 0.3);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
}

.type-chip.type-unknown {
  background: linear-gradient(135deg, rgba(107, 114, 128, 0.15), rgba(107, 114, 128, 0.25));
  color: #6b7280;
  border-color: rgba(107, 114, 128, 0.3);
}

.status-chip.status-activo {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.status-chip.status-inactivo {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.author-column {
  width: 120px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.author-icon {
  color: var(--text-muted);
}

.date-column {
  width: 120px;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.actions-column {
  width: 140px;
  text-align: center;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.action-btn {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: var(--bg-hover);
}

.action-btn.preview {
  color: var(--info-color);
}

.action-btn.preview:hover {
  background: rgba(6, 182, 212, 0.1);
}

.action-btn.edit {
  color: var(--accent-primary);
}

.action-btn.edit:hover {
  background: rgba(var(--primary-color-rgb), 0.1);
}

.action-btn.duplicate {
  color: var(--text-secondary);
}

.action-btn.duplicate:hover {
  background: var(--bg-hover);
}

.action-btn.delete {
  color: var(--error-color);
}

.action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.1);
}

.action-btn.activate {
  color: #059669;
}

.action-btn.activate:hover {
  background: rgba(16, 185, 129, 0.1);
}

.action-btn.deactivate {
  color: #dc2626;
}

.action-btn.deactivate:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* Loading and No Data States */
.loading-row,
.no-data-row {
  background: var(--bg-secondary);
}

.loading-cell,
.no-data-cell {
  padding: 3rem;
  text-align: center;
}

.loading-content,
.no-data-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--text-secondary);
}

.loading-content .loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.no-data-content i {
  font-size: 48px;
  color: var(--text-muted);
}

.no-data-content h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--text-primary);
}

.no-data-content p {
  margin: 0;
  font-size: 0.9rem;
}

/* Grid View */
.grid-container {
  padding: 1.5rem;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.skeleton-card {
  height: 200px;
  background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-hover) 50%, var(--bg-secondary) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 16px;
}

.no-data-grid {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.content-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.content-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: var(--accent-primary);
}

.content-card.selected {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
}

.card-header {
  padding: 1rem;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.card-checkbox {
  display: flex;
  align-items: center;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  accent-color: var(--accent-primary);
  cursor: pointer;
}

.card-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  flex: 1;
}

.card-status {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.card-status.clickable {
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
}

.card-status.clickable:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.card-status.clickable:active {
  transform: scale(0.95);
}

.card-content {
  padding: 1.5rem;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.card-title.clickable {
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
}

.card-title.clickable:hover {
  color: #007bff;
  text-decoration: underline;
  transform: translateX(2px);
}

.card-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0 0 1rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.card-author,
.card-date {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.card-actions {
  padding: 1rem;
  background: var(--bg-secondary);
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  border-top: 1px solid var(--border-light);
}

.card-action-btn {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-action-btn:hover {
  background: var(--bg-hover);
}

.card-action-btn.preview {
  color: var(--info-color);
}

.card-action-btn.edit {
  color: var(--accent-primary);
}

.card-action-btn.duplicate {
  color: var(--text-secondary);
}

.card-action-btn.delete {
  color: var(--error-color);
}

.card-action-btn.activate {
  color: #059669;
}

.card-action-btn.deactivate {
  color: #dc2626;
}

/* Pagination */
.pagination-section {
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-info {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  gap: 0.25rem;
}

.pagination-number {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 0.9rem;
  transition: all 0.2s ease;
  min-width: 40px;
  text-align: center;
}

.pagination-number:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.pagination-number.active {
  background: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
}

.items-per-page {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.items-select {
  padding: 6px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 0.9rem;
}

/* Modales */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.preview-modal {
  background: var(--bg-card);
  border-radius: 20px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: visible;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.delete-modal {
  background: var(--bg-card);
  border-radius: 20px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.modal-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-close-btn {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.2s ease;
}

.modal-close-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.modal-content {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: none;
}

.modal-actions {
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.modal-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
}

.modal-btn.secondary {
  background: var(--bg-hover);
  color: var(--text-secondary);
}

.modal-btn.secondary:hover {
  background: var(--text-secondary);
  color: white;
}

.modal-btn.primary {
  background: var(--accent-primary);
  color: white;
}

.modal-btn.primary:hover {
  background: var(--button-primary-hover);
}

.modal-btn.danger {
  background: var(--error-color);
  color: white;
}

.modal-btn.danger:hover {
  background: var(--error-hover);
}

/* Panel de navegación PDF compacto en modal */
.pdf-nav-compact {
  flex: 1;
  margin-right: 1rem;
  background: var(--bg-secondary);
  border-radius: 0.5rem;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-compact-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.nav-compact-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.nav-compact-btn:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.nav-compact-btn:disabled {
  background: var(--text-disabled);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  opacity: 0.6;
}

.page-compact-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  min-width: 80px;
}

.page-compact-counter {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.page-compact-progress {
  width: 60px;
  height: 3px;
  background: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
}

.progress-compact-bar {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.3s ease;
}

.nav-compact-shortcuts {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.shortcut-compact-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  background: var(--bg-hover);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.shortcut-compact-btn:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.shortcut-compact-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.zoom-compact-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: 0.5rem;
  padding-left: 0.5rem;
  border-left: 1px solid var(--border-color);
}

.zoom-compact-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  background: var(--success-color);
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.zoom-compact-btn:hover {
  background: var(--success-hover);
  transform: translateY(-1px);
}

.zoom-compact-level {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  min-width: 2.5rem;
  text-align: center;
  background: var(--bg-hover);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid var(--border-color);
}

/* Responsive para panel compacto */
@media (max-width: 768px) {
  .pdf-nav-compact {
    margin-right: 0;
    margin-bottom: 1rem;
    order: -1;
  }

  .nav-compact-controls {
    justify-content: center;
    gap: 0.5rem;
  }

  .page-compact-info {
    min-width: 60px;
  }

  .page-compact-progress {
    width: 40px;
  }

  .nav-compact-shortcuts {
    gap: 0.25rem;
  }

  .zoom-compact-controls {
    margin-left: 0;
    padding-left: 0;
    border-left: none;
    border-top: 1px solid var(--border-color);
    padding-top: 0.5rem;
    margin-top: 0.5rem;
  }
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Delete Modal Specific */
.delete-icon {
  width: 60px;
  height: 60px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: var(--error-color);
  font-size: 24px;
}

.warning-text {
  color: var(--warning-color);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 12px;
  background: var(--warning-bg);
  border-radius: 8px;
}

/* Preview Modal Specific */
.preview-content {
  max-height: 60vh;
  overflow-y: auto;
}

.preview-header {
  margin-bottom: 1.5rem;
}

.preview-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.preview-meta {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.preview-type,
.preview-author,
.preview-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.preview-body {
  color: var(--text-primary);
  line-height: 1.6;
}

.preview-placeholder {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
  background: var(--bg-secondary);
  border-radius: 12px;
  margin-top: 1rem;
}

.preview-placeholder i {
  font-size: 48px;
  margin-bottom: 1rem;
  display: block;
}

/* Loading Spinner */
.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-top: 2px solid var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner.small {
  width: 16px;
  height: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .title-column {
    min-width: 180px;
    max-width: 250px;
  }

  .type-column,
  .status-column {
    width: 90px;
  }

  .author-column {
    width: 100px;
  }

  .date-column {
    width: 100px;
  }

  .actions-column {
    width: 120px;
  }

  .type-chip,
  .status-chip {
    padding: 4px 8px;
    font-size: 0.7rem;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }

  .content-container {
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .view-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  /* Table responsive adjustments */
  .title-column {
    min-width: 150px;
    max-width: 200px;
  }

  .type-column,
  .status-column {
    width: 80px;
  }

  .author-column {
    width: 90px;
  }

  .date-column {
    width: 90px;
  }

  .actions-column {
    width: 100px;
  }

  .action-buttons {
    gap: 0.25rem;
  }

  .action-btn {
    padding: 6px;
    font-size: 0.8rem;
  }

  .type-chip,
  .status-chip {
    padding: 3px 6px;
    font-size: 0.65rem;
    gap: 0.2rem;
  }

  .content-table th,
  .content-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.85rem;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .pagination-section {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .pagination-controls {
    justify-content: center;
  }

  .modal-overlay {
    padding: 0.5rem;
  }

  .preview-modal {
    max-height: 95vh;
  }
}

@media (max-width: 480px) {
  .header-left {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .page-icon {
    width: 50px;
    height: 50px;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .stats-grid {
    gap: 1rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .action-buttons {
    flex-wrap: wrap;
  }

  .pagination-numbers {
    flex-wrap: wrap;
    justify-content: center;
  }
}

/* Estilos para vista previa de contenido */
.content-preview {
  margin-top: 1rem;
}

.markdown-preview {
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e9ecef;
  min-height: 200px;
  line-height: 1.6;
  color: #333;
}

.markdown-preview h1,
.markdown-preview h2,
.markdown-preview h3,
.markdown-preview h4,
.markdown-preview h5,
.markdown-preview h6 {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 600;
}

.markdown-preview h1 {
  font-size: 2rem;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.markdown-preview h2 {
  font-size: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 0.25rem;
}

.markdown-preview h3 {
  font-size: 1.25rem;
}

.markdown-preview p {
  margin-bottom: 1rem;
}

.markdown-preview ul,
.markdown-preview ol {
  margin-bottom: 1rem;
  padding-left: 2rem;
}

.markdown-preview li {
  margin-bottom: 0.25rem;
}

.markdown-preview blockquote {
  border-left: 4px solid #007bff;
  padding-left: 1rem;
  margin: 1rem 0;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.25rem;
}

.markdown-preview code {
  background: #f8f9fa;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.markdown-preview pre {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.markdown-preview pre code {
  background: none;
  padding: 0;
}

.markdown-preview table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.markdown-preview th,
.markdown-preview td {
  border: 1px solid #dee2e6;
  padding: 0.5rem;
  text-align: left;
}

.markdown-preview th {
  background: #f8f9fa;
  font-weight: 600;
}

.markdown-preview a {
  color: #007bff;
  text-decoration: none;
}

.markdown-preview a:hover {
  text-decoration: underline;
}

.markdown-preview img {
  max-width: 100%;
  height: auto;
  border-radius: 0.25rem;
  margin: 1rem 0;
}

/* Estilos para vista previa de URL */
.url-preview {
  margin-top: 1rem;
}

.url-preview-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.url-info {
  margin-bottom: 1rem;
}

.url-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.url-domain {
  color: #6c757d;
  font-size: 0.9rem;
}

.preview-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #007bff;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  text-decoration: none;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
}

.preview-link:hover {
  background: #0056b3;
  color: white;
}

/* Estilos para vista previa de PDF */
.pdf-preview {
  margin-top: 1rem;
}

.pdf-preview-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pdf-info {
  margin-bottom: 1rem;
}

.pdf-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.pdf-url {
  color: #6c757d;
  font-size: 0.9rem;
  word-break: break-all;
}

.pdf-iframe-container {
  margin: 1rem 0;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  overflow: hidden;
}

.pdf-iframe {
  width: 100%;
  height: 400px;
  border: none;
}

.pdf-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.pdf-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 0.375rem;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
  border: none;
  cursor: pointer;
}

.pdf-link:hover {
  background: #0056b3;
  color: white;
  text-decoration: none;
}

.pdf-link:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.pdf-link.refresh {
  background: #28a745;
}

.pdf-link.refresh:hover {
  background: #1e7e34;
}

.pdf-link i {
  font-size: 1rem;
}

/* Estilos para el visor de PDF mejorado */
.pdf-viewer-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  overflow: auto;
  background: var(--bg-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-height: 70vh;
}

.pdf-viewer {
  width: 100%;
  min-height: 400px;
  border: none;
  display: block;
  background: var(--bg-primary);
}

.pdf-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.pdf-control-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.pdf-control-btn:hover:not(:disabled) {
  background: #0056b3;
}

.pdf-control-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.pdf-page-info {
  font-size: 0.9rem;
  font-weight: 500;
  color: #495057;
  min-width: 120px;
  text-align: center;
}


/* Estilos para indicador de carga */
.pdf-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  background: #f8f9fa;
  border-radius: 0.5rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e9ecef;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.pdf-loading p {
  color: #6c757d;
  font-size: 1rem;
  margin: 0;
}

/* Estilos para mensaje de error */
.pdf-error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
}

.pdf-error-message i {
  font-size: 3rem;
  color: #856404;
  margin-bottom: 1rem;
}

.pdf-error-message h4 {
  color: #856404;
  margin-bottom: 0.5rem;
}

.pdf-error-message p {
  color: #856404;
  margin-bottom: 1rem;
}

.auth-error-actions {
  margin-top: 1rem;
}

.pdf-link.auth-login {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.pdf-link.auth-login:hover {
  background: #c82333;
}

.pdf-link.auth-login i {
  margin-right: 0.5rem;
}

.document-error-actions {
  margin-top: 1rem;
}

.error-suggestion {
  background: #e7f3ff;
  border: 1px solid #b3d9ff;
  border-radius: 0.25rem;
  padding: 0.75rem;
  margin-bottom: 1rem;
  color: #0066cc;
  font-size: 0.9rem;
}

.error-suggestion i {
  margin-right: 0.5rem;
  color: #0066cc;
}

.error-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.pdf-link.edit {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.pdf-link.edit:hover {
  background: #218838;
}

.pdf-link.edit i {
  margin-right: 0.5rem;
}

.pdf-error {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 0.375rem;
  padding: 1rem;
  margin: 1rem 0;
  text-align: center;
}

.error-icon {
  font-size: 2rem;
  color: #f39c12;
  margin-bottom: 0.5rem;
}

.error-message h4 {
  color: #856404;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.error-message p {
  color: #856404;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.error-message strong {
  color: #6c757d;
}

/* Estilos para contenido desconocido */
.unknown-content {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 1rem;
  text-align: center;
  color: #6c757d;
}

.unknown-content i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.raw-content {
  margin-top: 1rem;
  text-align: left;
}

.raw-content pre {
  background: white;
  padding: 1rem;
  border-radius: 0.25rem;
  border: 1px solid #dee2e6;
  overflow-x: auto;
  font-size: 0.875rem;
}

/* Estilos para placeholder cuando no hay contenido */
.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6c757d;
  text-align: center;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
}

.preview-placeholder i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Estilos para indicador de carga */
.preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6c757d;
  text-align: center;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e9ecef;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
