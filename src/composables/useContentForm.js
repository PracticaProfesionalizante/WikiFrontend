import { ref } from 'vue'
import documentService from '@/services/documentService'

export function useContentForm({ type }) {
  // Estado del formulario
  const form = ref({
    id: null,
    name: '',
    slug: '',
    description: '',
    type,
    roles: [],

    // TEXT:
    content: type === 'PDF' ? null : '',

    // URL:
    // content se usa como string

    // PDF:
    file: null,
    existingPdfUrl: null,
  })

  const errors = ref({})
  const loading = ref(false)
  const isEditing = ref(false)

  // -----------------------------
  // INIT FORM (para abrir modal)
  // -----------------------------
  const initForm = (item = null) => {
    errors.value = {}
    loading.value = false
    isEditing.value = !!item

    if (!item) {
      // Nuevo documento
      form.value = {
        id: null,
        name: '',
        slug: '',
        description: '',
        type,
        roles: [],
        content: type === 'PDF' ? null : '',
        file: null,
        existingPdfUrl: null,
      }
      return
    }

    // Modo edición
    form.value = {
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description || '',
      type: item.type,
      roles: item.roles || [],

      // TEXT / URL
      content: item.content || '',

      // PDF
      file: null,
      existingPdfUrl: item.type === 'PDF' ? item.content : null,
    }
  }

  // -----------------------------
  // VALIDACIONES
  // -----------------------------

  const validateBasic = () => {
    errors.value = {}
    if (!form.value.name.trim()) {
      errors.value.name = 'El título es obligatorio.'
      return false
    }
    return true
  }

  // TEXT
  const validateText = () => {
    errors.value = {}
    if (!form.value.content.trim()) {
      errors.value.content = 'El contenido no puede estar vacío.'
      return false
    }
    return true
  }

  // URL
  const validateUrl = () => {
    errors.value = {}

    const url = form.value.content?.trim()
    if (!url) {
      errors.value.content = 'Debes ingresar una URL.'
      return false
    }

    try {
      new URL(url)
      return true
    } catch {
      errors.value.content = 'La URL no es válida.'
      return false
    }
  }

  // PDF
  const validatePdf = () => {
    errors.value = {}

    // Caso edición → puede no subir archivo
    if (isEditing.value && form.value.existingPdfUrl) {
      return true
    }

    if (!form.value.file) {
      errors.value.content = 'Debes subir un archivo PDF.'
      return false
    }

    if (form.value.file.type !== 'application/pdf') {
      errors.value.content = 'El archivo debe ser un PDF válido.'
      return false
    }

    const MAX_SIZE = 10 * 1024 * 1024
    if (form.value.file.size > MAX_SIZE) {
      errors.value.content = 'El PDF no puede superar los 10 MB.'
      return false
    }

    return true
  }

  // PERMISOS
  const validatePermissions = () => {
    if (!form.value.roles.length) {
      errors.value.permissions = 'Debes asignar al menos un rol.'
      return false
    }
    return true
  }

  // -----------------------------
  // SUBMIT (CREAR / EDITAR)
  // -----------------------------
  const submitForm = async () => {
    try {
      loading.value = true

      let payload

      if (type === 'PDF') {
        // PDF usa FormData
        payload = new FormData()
        payload.append('name', form.value.name)
        payload.append('slug', form.value.slug || '')
        payload.append('description', form.value.description || '')
        payload.append('type', 'PDF')
        payload.append('roles', JSON.stringify(form.value.roles))

        if (form.value.file) {
          payload.append('file', form.value.file)
        }
      } else {
        // TEXT / URL
        payload = {
          name: form.value.name,
          slug: form.value.slug || '',
          description: form.value.description,
          type,
          roles: form.value.roles,
          content: form.value.content,
        }
      }

      let saved

      if (isEditing.value) {
        saved = await documentService.updateDocument(form.value.id, payload)
      } else {
        saved = await documentService.createDocument(payload)
      }

      loading.value = false
      return saved
    } catch (err) {
      loading.value = false
      errors.value.submit = err.message || 'Error al guardar'
      return null
    }
  }

  return {
    form,
    errors,
    loading,
    isEditing,
    initForm,

    validateBasic,
    validateText,
    validateUrl,
    validatePdf,
    validatePermissions,

    submitForm,
  }
}
