<template>
  <AdminContentLayout>
    <div class="w-full max-w-[1800px] mx-auto p-4 sm:p-6">
      <!-- Header Section -->
      <ContentAdminHeader :path="docStore.getPath" :view="docStore.getView" @create="openCreateDialog" />

      <!-- Header Section -->
      <!-- Alertas -->
      <ContentAlertToast type="error" :message="error" @close="error = null" />
      <ContentAlertToast type="success" :message="success" @close="success = null" />
      <!-- Alertas -->


      <!-- Content Management Section -->
      <div
        class="rounded-xl border border-slate-200 bg-slate-100 shadow dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
        <!-- Filtros y búsqueda -->

        <ContentFilters v-model:search="searchQuery" v-model:filterType="filterType" v-model:filterStatus="filterStatus"
          v-model:sortBy="sortBy" v-model:sortOrder="sortOrder" v-model:viewMode="viewMode"
          :filtered-count="filteredItems.length" @toggle-sort-order="toggleSortOrder" @search-input="onSearchInput" />

        <div>
          <!-- Filtros y búsqueda -->
          <!-- Loading -->
          <div v-if="loading" class="min-h-[300px] grid place-items-center p-8 text-slate-600 dark:text-slate-300">
            <div class="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-blue-500"></div>
          </div>
          <!-- Loading -->

          <!-- Tabla -->
          <div v-if="viewMode === 'table'" class="space-y-4 p-4 pt-0">
            <ContentTable :items="paginatedItems" :get-document-status="getDocumentStatus"
              :get-type-display="getTypeDisplay" :get-type-colors="getTypeColors" :get-type-icon="getTypeIcon"
              :get-document-author="getDocumentAuthor" :get-document-editor="getDocumentEditor"
              :format-date="formatDate" @preview="previewContent" @edit="openEditDialog" @delete="openDeleteDialog"
              @toggle-status="toggleDocumentStatus" />

            <div class="space-y-4 md:hidden">
              <ContentListCardMobile :items="paginatedItems" :get-document-status="getDocumentStatus"
                :get-type-display="getTypeDisplay" :get-type-colors="getTypeColors" :get-type-icon="getTypeIcon"
                :get-document-author="getDocumentAuthor" :get-document-editor="getDocumentEditor"
                :format-date="formatDate" @preview="previewContent" @edit="openEditDialog" @delete="openDeleteDialog"
                @toggle-status="toggleDocumentStatus" />
            </div>
          </div>
          <!-- Tabla -->


          <!-- Grid -->
          <!-- Grid -->
          <ContentGrid v-else :items="paginatedItems" :get-document-status="getDocumentStatus"
            :get-type-display="getTypeDisplay" :get-type-colors="getTypeColors" :get-type-icon="getTypeIcon"
            :get-document-author="getDocumentAuthor" :get-document-editor="getDocumentEditor" :format-date="formatDate"
            @preview="previewContent" @edit="openEditDialog" @delete="openDeleteDialog"
            @toggle-status="toggleDocumentStatus" />

          <!-- Empty State -->
          <div v-if="paginatedItems.length === 0 && filteredItems.length === 0" class="p-12 text-center text-slate-500">
            <div class="mb-4 text-5xl text-slate-400"><i class="fas fa-folder-open"></i></div>
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
      <!-- Status Confirm Modal --> <!-- Status Confirm Modal -->
      <ContentStatusConfirmModal :open="showStatusConfirmModal" :action="statusConfirmAction"
        @confirm="confirmStatusChange" @cancel="cancelStatusChange" />

      <!-- Content Form Modal -->
      <ContentForm v-model="editDialog" :document="selectedItem" :loading="editLoading" :is-editing="isEditing"
        :start-step="isEditing ? 2 : 1" @saved="handleSaveDocument" @close="closeEditDialog" />
      <!-- Content Form Modal -->
      <!-- Delete Confirm Modal -->
      <ContentDeleteModal :open="deleteDialog"
        :item-title="selectedItem?.title || selectedItem?.name || 'Documento sin título'"
        v-model:confirm-input="deleteConfirmInput" :deleting="deleting" @confirm="confirmDelete"
        @cancel="closeDeleteDialog" />
      <!-- Delete Confirm Modal -->

    </div>
  </AdminContentLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { documentsStore } from '@/stores/documentsStore'
import documentService from '@/services/documentService'
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
import { marked } from 'marked'
import VuePdfEmbed from 'vue-pdf-embed'
import { setupPdfWarningSuppression, isKnownPdfWarning } from '@/utils/pdfUtils'
import LinkButtonModal from '@/components/modals/LinkButtonModal.vue'

const docStore = documentsStore()

watch(
  () => docStore.getPath,
  () => {
    loadDocuments()
  },
)

// Estado básico
const documents = ref([])
const loading = ref(false)
const error = ref(null)
const success = ref(null)
// const sidebarExpanded = ref(false)

// Estados de modales
const deleteDialog = ref(false)
const editDialog = ref(false)
const showPreviewModal = ref(false)
const showBulkDeleteModal = ref(false)
const showStatusConfirmModal = ref(false)
const selectedItem = ref(null)
const deleteConfirmInput = ref('')
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
const pdfPanX = ref(0) // Posición X del pan/arrastre
const pdfPanY = ref(0) // Posición Y del pan/arrastre
const isDragging = ref(false) // Si se está arrastrando el PDF
const dragStartX = ref(0) // Posición inicial X del mouse al empezar a arrastrar
const dragStartY = ref(0) // Posición inicial Y del mouse al empezar a arrastrar
const dragStartPanX = ref(0) // Posición inicial X del pan al empezar a arrastrar
const dragStartPanY = ref(0) // Posición inicial Y del pan al empezar a arrastrar

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
const hasManualViewSelection = ref(false)

const normalizeText = (text) =>
  (text ?? '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const setViewMode = (mode) => {
  viewMode.value = mode
  hasManualViewSelection.value = true
}

const handleResponsiveViewMode = () => {
  if (typeof window === 'undefined') {
    return
  }

  if (window.innerWidth < 768) {
    if (!hasManualViewSelection.value) {
      viewMode.value = 'grid'
    }
  } else if (!hasManualViewSelection.value) {
    viewMode.value = 'table'
  }
}

// Estados de selección y paginación
const selectedItems = ref([])
const currentPage = ref(1)
const itemsPerPage = ref(25)

// Computed para filtrado y búsqueda
const filteredItems = computed(() => {
  let items = [...documents.value]

  // Aplicar búsqueda
  if (searchQuery.value.trim()) {
    const normalizedQuery = normalizeText(searchQuery.value)
    items = items.filter((item) => {
      const searchableContent = [
        item.title,
        item.name,
        item.slug,
        item.type,
        item.category,
        item.createdBy,
        item.author,
        item.description,
        Array.isArray(item.tags) ? item.tags.join(' ') : '',
      ]

      return searchableContent.some((field) => normalizeText(field).includes(normalizedQuery))
    })
  }

  // Aplicar filtros
  if (filterType.value) {
    const normalizedType = filterType.value.toUpperCase()
    items = items.filter((item) => {
      const rawType = (item.type || item.category || '').toString().toUpperCase()
      if (!rawType) {
        return false
      }

      if (rawType === normalizedType) {
        return true
      }

      if (rawType.startsWith('TYPE_') && rawType.replace('TYPE_', '') === normalizedType) {
        return true
      }

      return normalizeText(rawType) === normalizeText(normalizedType)
    })
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
// const handleSidebarToggle = (expanded) => {
//   sidebarExpanded.value = expanded
// }

const loadDocuments = async () => {
  loading.value = true
  error.value = null
  const params = {
    slug: docStore.getPath,
  }
  try {
    const response = await documentService.getDocuments(params)

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
  pdfZoom.value = 1.0
  resetPan()
}

const editFromPreview = () => {
  const itemToEdit = previewItem.value
  closePreviewModal()
  nextTick(() => {
    openEditDialog(itemToEdit)
  })
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

// Función para refrescar datos (se usa directamente loadDocuments cuando se necesita)

// Funciones de diálogos
const openCreateDialog = () => {
  console.log('🔔 [ADMIN CONTENT] Abriendo diálogo de creación')
  selectedItem.value = null
  isEditing.value = false
  editLoading.value = false
  editDialog.value = true
  console.log('✅ [ADMIN CONTENT] Estado de editDialog:', editDialog.value)
  console.log('✅ [ADMIN CONTENT] Estado de selectedItem:', selectedItem.value)
  console.log('✅ [ADMIN CONTENT] Estado de isEditing:', isEditing.value)
  console.log('✅ [ADMIN CONTENT] Estado de editLoading:', editLoading.value)
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
  deleteConfirmInput.value = ''
}

const closeDeleteDialog = () => {
  deleteDialog.value = false
  selectedItem.value = null
  deleteConfirmInput.value = ''
}

const confirmDelete = async () => {
  if (!selectedItem.value) return

  deleting.value = true
  error.value = null

  try {
    await documentService.deleteDocument(selectedItem.value.id)

    const index = documents.value.findIndex((doc) => doc.id === selectedItem.value.id)
    if (index > -1) {
      documents.value.splice(index, 1)
    }

    success.value = `Documento "${selectedItem.value.name || selectedItem.value.title || 'sin título'}" eliminado correctamente`

    // Remover de seleccionados si estaba seleccionado
    const selectedIndex = selectedItems.value.indexOf(selectedItem.value.id)
    if (selectedIndex > -1) {
      selectedItems.value.splice(selectedIndex, 1)
    }

    closeDeleteDialog()
  } catch (err) {
    error.value = err.message || 'Error al eliminar el documento'
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

const getTypeDisplay = (type) => {
  const displayNames = {
    TYPE_TEXT: 'TEXTO',
    TYPE_URL: 'URL',
    TYPE_PDF: 'PDF',
    TEXT: 'TEXTO',
    URL: 'URL',
    PDF: 'PDF',
  }
  return displayNames[type] || type || 'Desconocido'
}

const getTypeIcon = (type) => {
  const icons = {
    TYPE_TEXT: 'fas fa-file-alt',
    TYPE_URL: 'fas fa-link',
    TYPE_PDF: 'fas fa-file-pdf',
    TEXT: 'fas fa-file-alt',
    URL: 'fas fa-link',
    PDF: 'fas fa-file-pdf',
  }
  return icons[type] || 'fas fa-file'
}

const getTypeColors = (type) => {
  const colors = {
    TYPE_TEXT: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
    },
    TYPE_URL: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-200 dark:border-purple-800',
      icon: 'text-purple-600 dark:text-purple-400',
    },
    TYPE_PDF: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-300',
      border: 'border-red-200 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400',
    },
    TEXT: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
    },
    URL: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-200 dark:border-purple-800',
      icon: 'text-purple-600 dark:text-purple-400',
    },
    PDF: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-300',
      border: 'border-red-200 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400',
    },
  }
  return (
    colors[type] || {
      bg: 'bg-slate-100 dark:bg-slate-900/30',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-200 dark:border-slate-800',
      icon: 'text-slate-600 dark:text-slate-400',
    }
  )
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

    if (pdfBlobUrl.value) {
      URL.revokeObjectURL(pdfBlobUrl.value)
      pdfBlobUrl.value = null
    }

    const blobUrl = await documentService.getDocumentFileUrl(documentId)
    pdfBlobUrl.value = blobUrl
    pdfLoading.value = false

    console.log('? PDF cargado exitosamente como blob URL:', blobUrl)
    console.log(
      '? Estado después de cargar - pdfLoading:',
      pdfLoading.value,
      'pdfBlobUrl:',
      !!pdfBlobUrl.value,
    )
    return blobUrl
  } catch (error) {
    console.error('? Error cargando PDF:', error)

    if (error.status === 401 || /autenticad/.test(error.message)) {
      pdfError.value = new Error('Tu sesión expiró. Inicia sesión nuevamente para ver el PDF.')
    } else if (error.status === 422 || /no existe/.test(error.message)) {
      pdfError.value = new Error(
        'El archivo PDF no está disponible. Puede haber sido eliminado o nunca se subió correctamente.',
      )
    } else {
      pdfError.value = new Error(error.message || 'No se pudo cargar el documento PDF.')
    }

    if (pdfBlobUrl.value) {
      URL.revokeObjectURL(pdfBlobUrl.value)
      pdfBlobUrl.value = null
    }

    pdfLoading.value = false

    throw error
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
    resetPan()
  }
}

const nextPage = () => {
  if (currentPdfPage.value < totalPdfPages.value) {
    currentPdfPage.value++
    resetPan()
  }
}

const goToFirstPage = () => {
  currentPdfPage.value = 1
  resetPan()
}

const goToLastPage = () => {
  currentPdfPage.value = totalPdfPages.value
  resetPan()
}

const resetPan = () => {
  pdfPanX.value = 0
  pdfPanY.value = 0
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
    // Si el zoom vuelve a 1.0 o menos, resetear el pan
    if (pdfZoom.value <= 1.0) {
      resetPan()
    }
  }
}

const resetZoom = () => {
  pdfZoom.value = 1.0
  resetPan()
  console.log(`?? Zoom reseteado a: 100%`)
}

// Funciones para arrastrar el PDF con zoom
const handleRightClick = (event) => {
  // Solo permitir arrastre con clic derecho si hay zoom
  if (pdfZoom.value > 1.0) {
    event.preventDefault()
    startDrag(event)
  }
}

const handleMouseDown = (event) => {
  // Arrastrar con clic derecho (button 2) o con clic izquierdo si hay zoom
  if (
    (event.button === 2 && pdfZoom.value > 1.0) ||
    (event.button === 0 && pdfZoom.value > 1.0 && event.ctrlKey)
  ) {
    event.preventDefault()
    startDrag(event)
  }
}

const startDrag = (event) => {
  if (pdfZoom.value <= 1.0) return

  isDragging.value = true
  dragStartX.value = event.clientX
  dragStartY.value = event.clientY
  dragStartPanX.value = pdfPanX.value
  dragStartPanY.value = pdfPanY.value

  // Prevenir selección de texto mientras se arrastra
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'grabbing'
}

const handleMouseMove = (event) => {
  if (!isDragging.value || pdfZoom.value <= 1.0) return

  const deltaX = event.clientX - dragStartX.value
  const deltaY = event.clientY - dragStartY.value

  // Actualizar posición del pan
  pdfPanX.value = dragStartPanX.value + deltaX
  pdfPanY.value = dragStartPanY.value + deltaY

  // Limitar el pan para que no se vaya demasiado lejos (opcional)
  const maxPan = 500
  pdfPanX.value = Math.max(-maxPan, Math.min(maxPan, pdfPanX.value))
  pdfPanY.value = Math.max(-maxPan, Math.min(maxPan, pdfPanY.value))
}

const handleMouseUp = () => {
  if (isDragging.value) {
    isDragging.value = false
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
  }
}

const openPdfInNewTab = () => {
  if (pdfBlobUrl.value) {
    window.open(pdfBlobUrl.value, '_blank')
    console.log('📄 [PDF VIEWER] PDF abierto en nueva pestaña')
  } else {
    console.warn('⚠️ [PDF VIEWER] No hay URL de PDF disponible para abrir')
  }
}

const downloadPdf = async () => {
  if (!pdfBlobUrl.value || !previewItem.value) {
    console.warn('⚠️ [PDF VIEWER] No hay PDF disponible para descargar')
    return
  }

  try {
    console.log('📥 [PDF VIEWER] Iniciando descarga de PDF...')

    // Obtener el nombre del documento o usar un nombre por defecto
    const fileName = previewItem.value.name
      ? `${previewItem.value.name.replace(/[^a-z0-9]/gi, '_')}.pdf`
      : `documento_${previewItem.value.id || 'pdf'}.pdf`

    // Crear un enlace temporal para descargar
    const link = document.createElement('a')
    link.href = pdfBlobUrl.value
    link.download = fileName
    link.target = '_blank'

    // Agregar al DOM, hacer clic y remover
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    console.log('✅ [PDF VIEWER] PDF descargado exitosamente:', fileName)
  } catch (err) {
    console.error('❌ [PDF VIEWER] Error descargando PDF:', err)
    pdfError.value = new Error('Error al descargar el PDF')
  }
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

// Cargar contenidos al montar el componente
onMounted(() => {
  handleResponsiveViewMode()
  // Agregar listeners
  loadDocuments()
  document.addEventListener('keydown', handleKeydown)
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResponsiveViewMode)
  }
})

// Limpiar listeners al desmontar
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResponsiveViewMode)
  }
  // Limpiar URL del blob si existe
  if (pdfBlobUrl.value) {
    URL.revokeObjectURL(pdfBlobUrl.value)
  }
})

const extractUserName = (user) => {
  if (!user) {
    return ''
  }

  if (typeof user === 'string') {
    return user
  }

  if (typeof user === 'object') {
    return (
      user.fullName ||
      user.name ||
      [user.firstName, user.lastName].filter(Boolean).join(' ') ||
      user.username ||
      user.email ||
      ''
    )
  }

  return ''
}

const getDocumentEditor = (doc) => {
  if (!doc) {
    return 'Sin cambios'
  }

  const candidates = [
    doc.updatedBy,
    doc.updated_by,
    doc.lastModifiedBy,
    doc.last_modified_by,
    doc.modifiedBy,
    doc.modified_by,
    doc.editedBy,
    doc.edited_by,
    doc.lastEditor,
    doc.last_editor,
    doc.updatedByUser,
    doc.updated_by_user,
    doc.lastModifiedUser,
    doc.last_modified_user,
  ]

  for (const candidate of candidates) {
    const name = extractUserName(candidate)
    if (name) {
      return name
    }
  }

  if (doc.updatedAt || doc.updated_at) {
    return 'Actualizado (usuario no disponible)'
  }

  return 'Sin cambios'
}

const getDocumentAuthor = (doc) => {
  if (!doc) {
    return 'Sin autor'
  }

  const candidates = [
    doc.author,
    doc.authorUser,
    doc.author_user,
    doc.createdBy,
    doc.created_by,
    doc.owner,
    doc.ownerUser,
    doc.owner_user,
    doc.createdByUser,
    doc.created_by_user,
  ]

  for (const candidate of candidates) {
    const name = extractUserName(candidate)
    if (name) {
      return name
    }
  }

  return 'Sin autor'
}
</script>
