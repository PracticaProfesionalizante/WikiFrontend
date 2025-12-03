import { ref, computed } from 'vue'
import documentService from '@/services/documentService'
import { useAdminContent } from './useAdminContent'

// Pequeño wrapper liviano para listar documentos con filtros básicos.
// Reusa utilidades de presentación de useAdminContent.
export function useDocumentList() {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  const search = ref('')
  const status = ref('')

  const pagination = {
    currentPage: ref(1),
    perPage: ref(25),
  }

  // Reutilizamos helpers de admin content para no duplicar lógica de estado/tipo.
  const {
    getDocumentStatus,
    getTypeDisplay,
    getTypeIcon,
    getTypeColors,
    formatDate,
    getDocumentEditor,
    getDocumentAuthor,
    previewContent,
    openEditDialog,
    openDeleteDialog,
    toggleDocumentStatus,
  } = useAdminContent()

  const filteredItems = computed(() => {
    let data = [...items.value]

    if (search.value.trim()) {
      const query = search.value.toLowerCase()
      data = data.filter((item) =>
        [item.name, item.title, item.description, item.slug]
          .filter(Boolean)
          .some((field) => field.toString().toLowerCase().includes(query)),
      )
    }

    if (status.value) {
      data = data.filter((item) => getDocumentStatus(item) === status.value)
    }

    return data
  })

  const paginatedItems = computed(() => {
    const start = (pagination.currentPage.value - 1) * pagination.perPage.value
    const end = start + pagination.perPage.value
    return filteredItems.value.slice(start, end)
  })

  const loadDocuments = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await documentService.getDocuments(params)
      items.value = Array.isArray(response) ? response : []
      pagination.currentPage.value = 1
    } catch (err) {
      error.value = err.message || 'Error al cargar documentos'
      items.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    items,
    loading,
    error,
    search,
    status,
    pagination,
    filteredItems,
    paginatedItems,
    loadDocuments,
    getDocumentStatus,
    getTypeDisplay,
    getTypeIcon,
    getTypeColors,
    formatDate,
    getDocumentEditor,
    getDocumentAuthor,
    previewContent,
    openEditDialog,
    openDeleteDialog,
    toggleDocumentStatus,
  }
}
