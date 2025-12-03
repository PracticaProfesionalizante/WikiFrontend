// src/composables/useAdminContent.js
import { ref, computed, watch } from 'vue'
import { marked } from 'marked'
import documentService from '@/services/documentService'
import { setupPdfWarningSuppression, isKnownPdfWarning } from '@/utils/pdfUtils'

export function useAdminContent() {
  // Suprimir warnings conocidos de PDF.js
  setupPdfWarningSuppression()

  // ----- ESTADO BÁSICO -----
  const documents = ref([])
  const loading = ref(false)
  const error = ref(null)
  const success = ref(null)

  // ----- ESTADO DE MODALES -----
  const deleteDialog = ref(false)
  const editDialog = ref(false)
  const showPreviewModal = ref(false)
  const showStatusConfirmModal = ref(false)

  const selectedItem = ref(null)
  const deleteConfirmInput = ref('')
  const previewItem = ref(null)
  const statusConfirmItem = ref(null)

  const previewLoading = ref(false)
  const editLoading = ref(false)
  const isEditing = ref(false)
  const deleting = ref(false)
  const statusConfirmAction = ref('') // 'activate' | 'deactivate'

  // ----- ESTADO PDF / PREVIEW -----
  const currentPdfPage = ref(1)
  const totalPdfPages = ref(0)
  const pdfLoading = ref(false)
  const pdfError = ref(null)
  const pdfBlobUrl = ref(null)
  const pdfZoom = ref(1.0)
  const pdfPanX = ref(0)
  const pdfPanY = ref(0)
  const isDragging = ref(false)
  const dragStartX = ref(0)
  const dragStartY = ref(0)
  const dragStartPanX = ref(0)
  const dragStartPanY = ref(0)

  // ----- FILTROS / BÚSQUEDA / VISTA -----
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

  const handleResponsiveViewMode = () => {
    if (typeof window === 'undefined') return

    if (!hasManualViewSelection.value) {
      viewMode.value = window.innerWidth < 768 ? 'grid' : 'table'
    }
  }

  // ----- SELECCIÓN Y PAGINACIÓN -----
  const selectedItems = ref([])
  const currentPage = ref(1)
  const itemsPerPage = ref(25)

  const filteredItems = computed(() => {
    let items = [...documents.value]

    // Búsqueda
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

        return searchableContent.some((field) =>
          normalizeText(field).includes(normalizedQuery),
        )
      })
    }

    // Filtro por tipo
    if (filterType.value) {
      const normalizedType = filterType.value.toUpperCase()
      items = items.filter((item) => {
        const rawType = (item.type || item.category || '').toString().toUpperCase()
        if (!rawType) return false

        if (rawType === normalizedType) return true

        if (rawType.startsWith('TYPE_') && rawType.replace('TYPE_', '') === normalizedType) {
          return true
        }

        return normalizeText(rawType) === normalizeText(normalizedType)
      })
    }

    // Filtro por estado
    if (filterStatus.value) {
      items = items.filter((item) => getDocumentStatus(item) === filterStatus.value)
    }

    // Filtro por autor
    if (filterAuthor.value) {
      items = items.filter((item) => item.createdBy === filterAuthor.value)
    }

    // Orden
    items.sort((a, b) => {
      let aValue = a[sortBy.value]
      let bValue = b[sortBy.value]

      if (sortBy.value === 'createdAt' || sortBy.value === 'updatedAt') {
        aValue = new Date(aValue || 0)
        bValue = new Date(bValue || 0)
      } else {
        if (typeof aValue === 'string') aValue = aValue.toLowerCase()
        if (typeof bValue === 'string') bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })

    return items
  })

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return filteredItems.value.slice(start, end)
  })

  // Watchers internos de paginación / filtros
  watch(itemsPerPage, () => {
    currentPage.value = 1
  })

  watch([filterType, filterStatus, filterAuthor], () => {
    currentPage.value = 1
  })

  // ----- CARGA DE DOCUMENTOS -----
  const loadDocuments = async (params = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await documentService.getDocuments(params)

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

  // ----- BÚSQUEDA / ORDEN -----
  const onSearchInput = () => {
    currentPage.value = 1
  }

  const toggleSortOrder = () => {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  }

  // ----- PREVIEW / PDF -----
  const previewContent = async (item) => {
    showPreviewModal.value = true
    previewItem.value = item

    // PDF básico
    if (item.type === 'TYPE_PDF') {
      pdfLoading.value = true
      pdfError.value = null
      currentPdfPage.value = 1
      totalPdfPages.value = 0

      try {
        await loadPdfFile(item.id)
        console.log('📄 PDF cargado exitosamente para documento:', item.id)
      } catch (err) {
        console.error('❌ Error cargando PDF:', err)
        pdfError.value = err
        pdfLoading.value = false
      }
    }

    // Completar contenido si falta
    if (!item.content && item.id) {
      previewLoading.value = true

      try {
        const fullDocument = await documentService.getDocumentById(item.id)
        previewItem.value = fullDocument

        if (fullDocument.type === 'TYPE_PDF') {
          pdfLoading.value = true
          pdfError.value = null
          currentPdfPage.value = 1
          totalPdfPages.value = 0

          try {
            await loadPdfFile(fullDocument.id)
            console.log('📄 PDF cargado exitosamente (documento completo):', fullDocument.id)
          } catch (err) {
            console.error('❌ Error cargando PDF (full):', err)
            pdfError.value = err
            pdfLoading.value = false
          }
        }
      } catch (err) {
        // mantenemos el item original
      } finally {
        previewLoading.value = false
      }
    }
  }

  const resetPan = () => {
    pdfPanX.value = 0
    pdfPanY.value = 0
  }

  const closePreviewModal = () => {
    showPreviewModal.value = false
    previewItem.value = null

    if (pdfBlobUrl.value) {
      URL.revokeObjectURL(pdfBlobUrl.value)
      pdfBlobUrl.value = null
    }

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
    // openEditDialog se define más abajo, así que lo referenciamos luego
    nextTickOpenEdit(itemToEdit)
  }

  // truco para poder llamar openEditDialog desde editFromPreview
  let nextTickOpenEdit = () => {}

  // ----- STATUS -----
  const toggleDocumentStatus = (item) => {
    if (!item || !item.id) return

    const currentStatus = getDocumentStatus(item)
    const action = currentStatus === 'Activo' ? 'deactivate' : 'activate'

    statusConfirmItem.value = item
    statusConfirmAction.value = action
    showStatusConfirmModal.value = true
  }

  const confirmStatusChange = async () => {
    if (!statusConfirmItem.value || !statusConfirmItem.value.id) return

    try {
      const item = statusConfirmItem.value
      const newStatus = statusConfirmAction.value === 'activate'

      const cleanRoles = (item.roles || []).map((role) => {
        if (typeof role === 'string' && role.startsWith('ROLE_ROLE_')) {
          return role.substring(10)
        } else if (typeof role === 'string' && role.startsWith('ROLE_')) {
          return role.substring(5)
        }
        return role
      })

      const updateData = {
        name: item.name,
        type: item.type,
        slug: item.slug,
        status: newStatus,
        content: item.content,
        icon: item.icon,
        roles: cleanRoles,
      }

      const updatedDocument = await documentService.updateDocument(item.id, updateData)

      const index = documents.value.findIndex((doc) => doc.id === item.id)
      if (index > -1) {
        documents.value[index] = updatedDocument || { ...item, status: newStatus }
      }

      const statusText = newStatus ? 'activado' : 'desactivado'
      success.value = `Documento "${item.name}" ${statusText} correctamente`

      showStatusConfirmModal.value = false
      statusConfirmItem.value = null
      statusConfirmAction.value = ''
    } catch (err) {
      error.value = 'Error al cambiar el estado del documento'
    }
  }

  const cancelStatusChange = () => {
    showStatusConfirmModal.value = false
    statusConfirmItem.value = null
    statusConfirmAction.value = ''
  }

  // ----- DIÁLOGOS / CRUD -----
  const openCreateDialog = () => {
    selectedItem.value = null
    isEditing.value = false
    editLoading.value = false
    editDialog.value = true
  }

 const openEditDialog = async (item) => {
  // Seleccionar el documento actual
  selectedItem.value = { ...item }
  isEditing.value = true

  // Definir tipo de formulario según el documento
  currentFormType.value = item.type // TYPE_TEXT / TYPE_URL / TYPE_PDF

  // Mostrar el modal
  editDialog.value = true

  // Cargar contenido completo si es necesario
  if (!item.content && item.id) {
    try {
      const full = await documentService.getDocumentById(item.id)
      selectedItem.value = { ...full }
    } catch (e) {
      console.error("Error cargando documento completo", e)
    }
  }
}
  // ahora sí definimos la referencia que usa editFromPreview
  nextTickOpenEdit = (item) => {
    if (!item) return
    // se llama desde la vista con nextTick, pero aquí solo abrimos
    openEditDialog(item)
  }

  const closeEditDialog = () => {
    editDialog.value = false
    selectedItem.value = null
    isEditing.value = false
  }

  const handleSaveDocument = async (documentData) => {
    if (!documentData) return

    try {
      // Si ya viene con ID, el ContentForm ya lo guardó en el back
      if (documentData.id) {
        if (isEditing.value) {
          const index = documents.value.findIndex((item) => item.id === documentData.id)
          if (index > -1) {
            documents.value[index] = documentData
          }
          success.value = `Documento "${documentData.name}" actualizado correctamente`
        } else {
          documents.value.unshift(documentData)
          success.value = `Documento "${documentData.name}" creado correctamente`
        }

        closeEditDialog()
        return
      }

      if (isEditing.value) {
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
        console.log('📝 [ADMIN CONTENT] Creando documento desde AdminContentView (composable)')
        const newDocument = await documentService.createDocument(documentData)
        documents.value.unshift(newDocument || { ...documentData, id: Date.now() })
        success.value = `Documento "${documentData.name}" creado correctamente`
      }

      closeEditDialog()
    } catch (err) {
      // Manejo especial slug duplicado
      if (
        err.response?.status === 422 &&
        err.response?.data?.detail?.includes('slug') &&
        err.response?.data?.detail?.includes('ya existe')
      ) {
        const timestamp = Date.now().toString()
        const baseSlug = documentData.name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
        const newSlug = `${baseSlug}-${timestamp}`

        const newDocumentData = {
          ...documentData,
          slug: newSlug,
        }

        try {
          if (isEditing.value) {
            const updatedDocument = await documentService.updateDocument(
              documentData.id,
              newDocumentData,
            )
            documents.value[
              documents.value.findIndex((item) => item.id === documentData.id)
            ] = updatedDocument
            success.value = `Documento "${documentData.name}" actualizado correctamente`
          } else {
            const newDocument = await documentService.createDocument(newDocumentData)
            documents.value.unshift(newDocument || { ...newDocumentData, id: Date.now() })
            success.value = `Documento "${documentData.name}" creado correctamente`
          }

          closeEditDialog()
          return
        } catch (retryError) {
          // sigue el manejo normal
        }
      }

      error.value =
        err.message || `Error al ${isEditing.value ? 'actualizar' : 'crear'} el documento`

      // fallback dev
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

      success.value = `Documento "${
        selectedItem.value.name || selectedItem.value.title || 'sin título'
      }" eliminado correctamente`

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

  // ----- UTILIDADES (estado, tipo, fechas) -----
  const getDocumentStatus = (item) => {
    if (item.status === true || item.status === 'true' || item.status === 1) {
      return 'Activo'
    } else if (item.status === false || item.status === 'fas false' || item.status === 0) {
      return 'Inactivo'
    }

    if (item.archived) return 'Inactivo'

    if (item.roles && item.roles.includes('ROLE_ADMIN')) return 'Activo'

    if (item.type === 'URL') return 'Activo'

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

  // ----- MARKDOWN -----
  const renderedMarkdown = computed(() => {
    if (!previewItem.value?.content || previewItem.value.type !== 'TYPE_TEXT') {
      return ''
    }

    try {
      const options = {
        breaks: true,
        gfm: true,
        smartLists: true,
        smartypants: true,
      }

      return marked(previewItem.value.content, options)
    } catch (err) {
      return '<p>Error al renderizar el Markdown</p>'
    }
  })

  // ----- URLS -----
  const normalizeUrl = (url) => {
    if (!url) return ''

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }

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

  // ----- PDF SERVICE -----
  const loadPdfFile = async (documentId) => {
    if (!documentId) {
      throw new Error('ID del documento no proporcionado')
    }

    try {
      console.log('📄 Cargando PDF autenticado para documento:', documentId)

      if (pdfBlobUrl.value) {
        URL.revokeObjectURL(pdfBlobUrl.value)
        pdfBlobUrl.value = null
      }

      const blobUrl = await documentService.getDocumentFileUrl(documentId)
      pdfBlobUrl.value = blobUrl
      pdfLoading.value = false

      console.log('✅ PDF cargado como blob URL:', blobUrl)
      return blobUrl
    } catch (err) {
      console.error('❌ Error cargando PDF:', err)

      if (err.status === 401 || /autenticad/.test(err.message)) {
        pdfError.value = new Error('Tu sesión expiró. Inicia sesión nuevamente para ver el PDF.')
      } else if (err.status === 422 || /no existe/.test(err.message)) {
        pdfError.value = new Error(
          'El archivo PDF no está disponible. Puede haber sido eliminado o nunca se subió correctamente.',
        )
      } else {
        pdfError.value = new Error(err.message || 'No se pudo cargar el documento PDF.')
      }

      if (pdfBlobUrl.value) {
        URL.revokeObjectURL(pdfBlobUrl.value)
        pdfBlobUrl.value = null
      }

      pdfLoading.value = false
      throw err
    }
  }

  const refreshPdfViewer = async () => {
    currentPdfPage.value = 1
    totalPdfPages.value = 0
    pdfError.value = null
    pdfLoading.value = true

    try {
      await loadPdfFile(previewItem.value?.id)
      console.log('🔄 PDF recargado exitosamente')
    } catch (err) {
      console.error('❌ Error recargando PDF:', err)
      pdfError.value = err
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
      console.log('✅ PDF cargado exitosamente en reintento')
    } catch (err) {
      console.error('❌ Error en reintento de carga de PDF:', err)
      pdfError.value = err
      pdfLoading.value = false
    }
  }

  const onPdfLoaded = (pdf) => {
    totalPdfPages.value = pdf.numPages
    pdfLoading.value = false
    pdfError.value = null
    console.log(`📄 PDF cargado: ${totalPdfPages.value} páginas`)
  }

  const onPdfError = (err) => {
    pdfError.value = err
    pdfLoading.value = false

    if (isKnownPdfWarning(err)) {
      console.warn('⚠️ Advertencia conocida de PDF.js (no crítica):', err.message)
      pdfError.value = null
      pdfLoading.value = false
      return
    }

    console.error('❌ Error cargando PDF:', err)
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

  const zoomIn = () => {
    if (pdfZoom.value < 3.0) {
      pdfZoom.value = Math.min(pdfZoom.value + 0.25, 3.0)
    }
  }

  const zoomOut = () => {
    if (pdfZoom.value > 0.5) {
      pdfZoom.value = Math.max(pdfZoom.value - 0.25, 0.5)
      if (pdfZoom.value <= 1.0) resetPan()
    }
  }

  const resetZoom = () => {
    pdfZoom.value = 1.0
    resetPan()
  }

  const handleRightClick = (event) => {
    if (pdfZoom.value > 1.0) {
      event.preventDefault()
      startDrag(event)
    }
  }

  const handleMouseDown = (event) => {
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

    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'grabbing'
  }

  const handleMouseMove = (event) => {
    if (!isDragging.value || pdfZoom.value <= 1.0) return

    const deltaX = event.clientX - dragStartX.value
    const deltaY = event.clientY - dragStartY.value

    pdfPanX.value = dragStartPanX.value + deltaX
    pdfPanY.value = dragStartPanY.value + deltaY

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
      console.log('📄 PDF abierto en nueva pestaña')
    } else {
      console.warn('⚠️ No hay URL de PDF disponible para abrir')
    }
  }

  const downloadPdf = async () => {
    if (!pdfBlobUrl.value || !previewItem.value) {
      console.warn('⚠️ No hay PDF disponible para descargar')
      return
    }

    try {
      const fileName = previewItem.value.name
        ? `${previewItem.value.name.replace(/[^a-z0-9]/gi, '_')}.pdf`
        : `documento_${previewItem.value.id || 'pdf'}.pdf`

      const link = document.createElement('a')
      link.href = pdfBlobUrl.value
      link.download = fileName
      link.target = '_blank'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      console.log('✅ PDF descargado:', fileName)
    } catch (err) {
      console.error('❌ Error descargando PDF:', err)
      pdfError.value = new Error('Error al descargar el PDF')
    }
  }

  // ----- KEYBOARD HANDLER -----
  const handleKeydown = (event) => {
    if (!showPreviewModal.value || previewItem.value?.type !== 'TYPE_PDF') return

    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return

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

  // ----- AUTOR / EDITOR -----
  const extractUserName = (user) => {
    if (!user) return ''

    if (typeof user === 'string') return user

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
    if (!doc) return 'Sin cambios'

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
      if (name) return name
    }

    if (doc.updatedAt || doc.updated_at) {
      return 'Actualizado (usuario no disponible)'
    }

    return 'Sin cambios'
  }

  const getDocumentAuthor = (doc) => {
    if (!doc) return 'Sin autor'

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
      if (name) return name
    }

    return 'Sin autor'
  }

  return {
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
    statusConfirmItem,
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
    filterAuthor,
    sortBy,
    sortOrder,
    viewMode,
    hasManualViewSelection,
    selectedItems,
    currentPage,
    itemsPerPage,
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

    // diálogos / crud
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
  }
}
