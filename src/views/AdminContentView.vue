<template>
  <AdminContentLayout>
    <div class="w-full max-w-[1800px] mx-auto p-4 sm:p-6">
      <!-- Header Section -->
      <ContentAdminHeader
        :path="docStore.getPath"
        :view="docStore.getType"
        @create="openCreateDialog"
      />

      <!-- Alertas -->
      <ContentAlertToast type="error" :message="error" @close="error = null" />
      <ContentAlertToast type="success" :message="success" @close="success = null" />
      <!-- Alertas -->

      <!-- Content Management Section -->
      <div
        class="rounded-xl border border-slate-200 bg-slate-100 shadow dark:border-slate-700 dark:bg-slate-800 overflow-hidden"
      >
        <!-- Filtros y búsqueda -->
        <ContentFilters
          v-model:search="searchQuery"
          v-model:filterType="filterType"
          v-model:filterStatus="filterStatus"
          v-model:sortBy="sortBy"
          v-model:sortOrder="sortOrder"
          v-model:viewMode="viewMode"
          :filtered-count="filteredItems.length"
          @toggle-sort-order="toggleSortOrder"
          @search-input="onSearchInput"
        />

        <div>
          <!-- Loading -->
          <div
            v-if="loading"
            class="min-h-[300px] grid place-items-center p-8 text-slate-600 dark:text-slate-300"
          >
            <div class="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-blue-500"></div>
          </div>
          <!-- Loading -->

          <!-- Tabla -->
          <div v-if="viewMode === 'table'" class="space-y-4 p-4 pt-0">
            <ContentTable
              :items="paginatedItems"
              :get-document-status="getDocumentStatus"
              :get-type-display="getTypeDisplay"
              :get-type-colors="getTypeColors"
              :get-type-icon="getTypeIcon"
              :get-document-author="getDocumentAuthor"
              :get-document-editor="getDocumentEditor"
              :format-date="formatDate"
              @preview="previewContent"
              @edit="openEditDialog"
              @delete="openDeleteDialog"
              @toggle-status="toggleDocumentStatus"
            />

            <div class="space-y-4 md:hidden">
              <ContentListCardMobile
                :items="paginatedItems"
                :get-document-status="getDocumentStatus"
                :get-type-display="getTypeDisplay"
                :get-type-colors="getTypeColors"
                :get-type-icon="getTypeIcon"
                :get-document-author="getDocumentAuthor"
                :get-document-editor="getDocumentEditor"
                :format-date="formatDate"
                @preview="previewContent"
                @edit="openEditDialog"
                @delete="openDeleteDialog"
                @toggle-status="toggleDocumentStatus"
              />
            </div>
          </div>
          <!-- Tabla -->

          <!-- Grid -->
          <ContentGrid
            v-else
            :items="paginatedItems"
            :get-document-status="getDocumentStatus"
            :get-type-display="getTypeDisplay"
            :get-type-colors="getTypeColors"
            :get-type-icon="getTypeIcon"
            :get-document-author="getDocumentAuthor"
            :get-document-editor="getDocumentEditor"
            :format-date="formatDate"
            @preview="previewContent"
            @edit="openEditDialog"
            @delete="openDeleteDialog"
            @toggle-status="toggleDocumentStatus"
          />

          <!-- Empty State -->
          <div
            v-if="paginatedItems.length === 0 && filteredItems.length === 0 && !loading"
            class="p-12 text-center text-slate-500"
          >
            <div class="mb-4 text-5xl text-slate-400">
              <i class="fas fa-folder-open"></i>
            </div>
            <h3 class="m-0 text-xl font-semibold text-slate-900 dark:text-slate-100">
              No hay contenidos
            </h3>
            <p>Comienza creando un nuevo documento.</p>
          </div>
        </div>
      </div>

      <!-- Preview Modal -->
      <ContentPreviewModal
        :open="showPreviewModal"
        :item="previewItem"
        :loading="previewLoading"
        :rendered-markdown="renderedMarkdown"
        :pdf-error="pdfError"
        :pdf-loading="pdfLoading"
        :pdf-blob-url="pdfBlobUrl"
        :current-pdf-page="currentPdfPage"
        :total-pdf-pages="totalPdfPages"
        :pdf-zoom="pdfZoom"
        :is-dragging="isDragging"
        :pdf-pan-x="pdfPanX"
        :pdf-pan-y="pdfPanY"
        :normalize-url="normalizeUrl"
        :get-url-title="getUrlTitle"
        :retry-pdf-load="retryPdfLoad"
        :go-to-first-page="goToFirstPage"
        :previous-page="previousPage"
        :next-page="nextPage"
        :go-to-last-page="goToLastPage"
        :zoom-in="zoomIn"
        :zoom-out="zoomOut"
        :reset-zoom="resetZoom"
        :refresh-pdf-viewer="refreshPdfViewer"
        :open-pdf-in-new-tab="openPdfInNewTab"
        :download-pdf="downloadPdf"
        :handle-right-click="handleRightClick"
        :handle-mouse-down="handleMouseDown"
        :handle-mouse-move="handleMouseMove"
        :handle-mouse-up="handleMouseUp"
        :on-pdf-loaded="onPdfLoaded"
        :on-pdf-error="onPdfError"
        @close="closePreviewModal"
        @edit="editFromPreview"
      />
      <!-- Preview Modal -->

      <!-- Status Confirm Modal -->
      <ContentStatusConfirmModal
        :open="showStatusConfirmModal"
        :action="statusConfirmAction"
        @confirm="confirmStatusChange"
        @cancel="cancelStatusChange"
      />

      <!-- Content Form Modal -->
      <ContentForm
        v-model="editDialog"
        :document="selectedItem"
        :loading="editLoading"
        :is-editing="isEditing"
        :start-step="isEditing ? 2 : 1"
        @saved="handleSaveDocument"
        @close="closeEditDialog"
      />
      <!-- Content Form Modal -->

      <!-- Delete Confirm Modal -->
      <ContentDeleteModal
        :open="deleteDialog"
        :item-title="selectedItem?.title || selectedItem?.name || 'Documento sin título'"
        v-model:confirm-input="deleteConfirmInput"
        :deleting="deleting"
        @confirm="confirmDelete"
        @cancel="closeDeleteDialog"
      />
      <!-- Delete Confirm Modal -->
    </div>
    <TestLayout/>
  </AdminContentLayout>

</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { documentsStore } from '@/stores/documentsStore'

import AdminContentLayout from '@/layouts/AdminContentLayout.vue'
import ContentAdminHeader from '@/components/content/ContentAdminHeader.vue'
import ContentAlertToast from '@/components/common/ContentAlertToast.vue'
import ContentForm from '@/components/forms/ContentForm.vue'
import ContentFilters from '@/components/content/ContentFilters.vue'
import ContentTable from '@/components/content/ContentTable.vue'
import ContentGrid from '@/components/content/ContentGrid.vue'
import ContentStatusConfirmModal from '@/components/content/ContentStatusConfirmModal.vue'
import ContentDeleteModal from '@/components/content/ContentDeleteModal.vue'
import ContentPreviewModal from '@/components/content/ContentPreviewModal.vue'
import ContentListCardMobile from '@/components/content/ContentListCardMobile.vue'

import { useAdminContent } from '@/composables/useAdminContent'
import TestLayout from '@/layouts/TestLayout.vue'

const docStore = documentsStore()

const {
  // estado principal
  documents,
  loading,
  error,
  success,

  // modales / selección
  deleteDialog,
  editDialog,
  showPreviewModal,
  showStatusConfirmModal,
  selectedItem,
  deleteConfirmInput,
  previewItem,
  previewLoading,
  editLoading,
  isEditing,
  deleting,
  statusConfirmAction,

  // pdf / preview
  currentPdfPage,
  totalPdfPages,
  pdfLoading,
  pdfError,
  pdfBlobUrl,
  pdfZoom,
  pdfPanX,
  pdfPanY,
  isDragging,

  // filtros / vista / paginación
  searchQuery,
  filterType,
  filterStatus,
  sortBy,
  sortOrder,
  viewMode,
  filteredItems,
  paginatedItems,

  // computed
  renderedMarkdown,

  // funciones generales
  handleResponsiveViewMode,
  onSearchInput,
  toggleSortOrder,
  loadDocuments,

  // preview / pdf
  previewContent,
  closePreviewModal,
  editFromPreview,
  refreshPdfViewer,
  retryPdfLoad,
  onPdfLoaded,
  onPdfError,
  previousPage,
  nextPage,
  goToFirstPage,
  goToLastPage,
  zoomIn,
  zoomOut,
  resetZoom,
  handleRightClick,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  openPdfInNewTab,
  downloadPdf,
  handleKeydown,

  // status
  toggleDocumentStatus,
  confirmStatusChange,
  cancelStatusChange,

  // diálogos / CRUD
  openCreateDialog,
  openEditDialog,
  closeEditDialog,
  handleSaveDocument,
  openDeleteDialog,
  closeDeleteDialog,
  confirmDelete,

  // utilidades
  getDocumentStatus,
  getTypeDisplay,
  getTypeIcon,
  getTypeColors,
  formatDate,
  normalizeUrl,
  getUrlTitle,
  getDocumentEditor,
  getDocumentAuthor,
} = useAdminContent()

// Reaccionar a cambios en path / type del store para recargar docs
watch(
  () => [docStore.getPath, docStore.getType],
  ([path, type]) => {
    const params = {}
    if (path != null) params.slug = path
    if (type != null) params.type = type
    loadDocuments(params)
  },
  { immediate: true },
)

onMounted(() => {
  handleResponsiveViewMode()

  document.addEventListener('keydown', handleKeydown)
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResponsiveViewMode)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResponsiveViewMode)
  }
})
</script>
