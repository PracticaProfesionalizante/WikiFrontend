import api from './api'
import { useAuthStore } from '@/stores/auth'

/**
 * Servicio para gestión de documentos
 * Maneja las operaciones CRUD con los endpoints /documents
 */
class DocumentService {
  /**
   * Obtener listado de documentos
   * @param {Object} params - Parámetros de consulta (page, size, sort, etc.)
   * @returns {Promise<Object>} Lista paginada de documentos
   */
  async getDocuments(params = {}) {
    try {
      console.log('📄 [DOCUMENT SERVICE] Obteniendo listado de documentos...')
      console.log('📄 [DOCUMENT SERVICE] Parámetros:', params)

      const response = await api.get('/documents', { params })

      console.log('✅ [DOCUMENT SERVICE] Documentos obtenidos exitosamente')
      console.log('📄 [DOCUMENT SERVICE] Total documentos:', response.data?.length || 0)

      return response.data
    } catch (error) {
      console.error('❌ [DOCUMENT SERVICE] Error obteniendo documentos:', error)
      console.error('❌ [DOCUMENT SERVICE] Status:', error.response?.status)
      console.error('❌ [DOCUMENT SERVICE] Response:', error.response?.data)

      // Re-lanzar el error para que sea manejado por el componente
      throw error
    }
  }

  /**
   * Obtener un documento por ID
   * @param {string|number} id - ID del documento
   * @returns {Promise<Object>} Documento encontrado
   */
  async getDocumentById(id) {
    try {
      console.log('📄 [DOCUMENT SERVICE] Obteniendo documento por ID:', id)

      const response = await api.get(`/documents/${id}`)

      console.log('✅ [DOCUMENT SERVICE] Documento obtenido exitosamente')
      console.log('📄 [DOCUMENT SERVICE] Documento:', response.data?.name || 'Sin nombre')

      return response.data
    } catch (error) {
      console.error('❌ [DOCUMENT SERVICE] Error obteniendo documento:', error)
      throw error
    }
  }

  /**
   * Crear un nuevo documento
   * @param {Object} documentData - Datos del documento a crear
   * @returns {Promise<Object>} Documento creado
   */
  async createDocument(documentData) {
    try {
      console.log('📄 [DOCUMENT SERVICE] Creando nuevo documento...')
      console.log('📄 [DOCUMENT SERVICE] Datos completos:', documentData)
      console.log('📄 [DOCUMENT SERVICE] Estructura:', {
        name: documentData.name,
        type: documentData.type,
        slug: documentData.slug,
        content: documentData.content,
        icon: documentData.icon,
        roles: documentData.roles
      })

      const response = await api.post('/documents', documentData)

      console.log('✅ [DOCUMENT SERVICE] Documento creado exitosamente')
      console.log('📄 [DOCUMENT SERVICE] ID del documento:', response.data?.id)

      return response.data
    } catch (error) {
      console.error('❌ [DOCUMENT SERVICE] Error creando documento:', error)
      console.error('❌ [DOCUMENT SERVICE] Status:', error.response?.status)
      console.error('❌ [DOCUMENT SERVICE] Response data:', error.response?.data)
      console.error('❌ [DOCUMENT SERVICE] Request data:', documentData)
      throw error
    }
  }

  /**
   * Actualizar un documento existente
   * @param {string|number} id - ID del documento
   * @param {Object} documentData - Datos actualizados del documento
   * @returns {Promise<Object>} Documento actualizado
   */
  async updateDocument(id, documentData) {
    try {
      console.log('📄 [DOCUMENT SERVICE] Actualizando documento:', id)
      console.log('📄 [DOCUMENT SERVICE] Datos actualizados:', {
        name: documentData.name,
        type: documentData.type,
        slug: documentData.slug
      })

      const response = await api.put(`/documents/${id}`, documentData)

      console.log('✅ [DOCUMENT SERVICE] Documento actualizado exitosamente')

      return response.data
    } catch (error) {
      console.error('❌ [DOCUMENT SERVICE] Error actualizando documento:', error)
      throw error
    }
  }

  /**
   * Eliminar un documento
   * @param {string|number} id - ID del documento
   * @returns {Promise<void>}
   */
  async deleteDocument(id) {
    try {
      console.log('📄 [DOCUMENT SERVICE] Eliminando documento:', id)

      await api.delete(`/documents/${id}`)

      console.log('✅ [DOCUMENT SERVICE] Documento eliminado exitosamente')
    } catch (error) {
      console.error('❌ [DOCUMENT SERVICE] Error eliminando documento:', error)
      throw error
    }
  }

  /**
   * Obtener documentos por tipo
   * @param {string} type - Tipo de documento (TEXT, URL, PDF)
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de documentos del tipo especificado
   */
  async getDocumentsByType(type, params = {}) {
    try {
      console.log('📄 [DOCUMENT SERVICE] Obteniendo documentos por tipo:', type)

      const queryParams = { ...params, type }
      const response = await api.get('/documents', { params: queryParams })

      console.log('✅ [DOCUMENT SERVICE] Documentos por tipo obtenidos exitosamente')
      console.log('📄 [DOCUMENT SERVICE] Total documentos tipo', type + ':', response.data?.length || 0)

      return response.data
    } catch (error) {
      console.error('❌ [DOCUMENT SERVICE] Error obteniendo documentos por tipo:', error)
      throw error
    }
  }

  /**
   * Obtener documentos por slug
   * @param {string} slug - Nombre del slug
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de documentos en el slug especificado
   */
  async getDocumentsBySlug(slug, params = {}) {
    try {
      console.log('📄 [DOCUMENT SERVICE] Obteniendo documentos por slug:', slug)

      const queryParams = { ...params, slug }
      const response = await api.get('/documents', { params: queryParams })

      console.log('✅ [DOCUMENT SERVICE] Documentos por slug obtenidos exitosamente')
      console.log('📄 [DOCUMENT SERVICE] Total documentos en slug', slug + ':', response.data?.length || 0)

      return response.data
    } catch (error) {
      console.error('❌ [DOCUMENT SERVICE] Error obteniendo documentos por slug:', error)
      throw error
    }
  }

  /**
   * Buscar documentos por nombre o contenido
   * @param {string} searchTerm - Término de búsqueda
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de documentos que coinciden con la búsqueda
   */
  async searchDocuments(searchTerm, params = {}) {
    try {
      console.log('📄 [DOCUMENT SERVICE] Buscando documentos con término:', searchTerm)

      const queryParams = { ...params, search: searchTerm }
      const response = await api.get('/documents', { params: queryParams })

      console.log('✅ [DOCUMENT SERVICE] Búsqueda completada exitosamente')
      console.log('📄 [DOCUMENT SERVICE] Resultados encontrados:', response.data?.length || 0)

      return response.data
    } catch (error) {
      console.error('❌ [DOCUMENT SERVICE] Error en búsqueda de documentos:', error)
      throw error
    }
  }

  /**
   * Debug del estado de autenticación
   */
  debugAuthState() {
    const authStore = useAuthStore()
    console.log('🔍 [DOCUMENT SERVICE] Estado de autenticación:')
    console.log('🔍 [DOCUMENT SERVICE] - Access Token:', authStore.accessToken ? 'Presente' : 'Ausente')
    console.log('🔍 [DOCUMENT SERVICE] - Refresh Token:', authStore.refreshToken ? 'Presente' : 'Ausente')
    console.log('🔍 [DOCUMENT SERVICE] - Usuario:', authStore.user ? 'Presente' : 'Ausente')
    console.log('🔍 [DOCUMENT SERVICE] - Autenticado:', authStore.isAuthenticated)

    // Verificar localStorage también
    console.log('🔍 [DOCUMENT SERVICE] localStorage:')
    console.log('🔍 [DOCUMENT SERVICE] - access_token:', localStorage.getItem('access_token') ? 'Presente' : 'Ausente')
    console.log('🔍 [DOCUMENT SERVICE] - refresh_token:', localStorage.getItem('refresh_token') ? 'Presente' : 'Ausente')
    console.log('🔍 [DOCUMENT SERVICE] - user:', localStorage.getItem('user') ? 'Presente' : 'Ausente')
  }

  /**
   * Leer contenido de un Blob como texto
   * @param {Blob} blob - Blob a leer
   * @returns {Promise<string>} Contenido del blob como texto
   */
  async readBlobAsText(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsText(blob)
    })
  }

  /**
   * Obtener archivo PDF de un documento
   * @param {string|number} id - ID del documento
   * @returns {Promise<Blob>} Archivo PDF como Blob
   */
  async getDocumentFile(id) {
    try {
      console.log('📄 [DOCUMENT SERVICE] Obteniendo archivo PDF del documento:', id)

      // Debug del estado de autenticación
      this.debugAuthState()

      const response = await api.get(`/documents/file/${id}`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf, */*'
        }
      })

      console.log('✅ [DOCUMENT SERVICE] Archivo PDF obtenido exitosamente')
      console.log('📄 [DOCUMENT SERVICE] Tamaño del archivo:', response.data.size, 'bytes')

      return response.data
    } catch (error) {
      console.error('❌ [DOCUMENT SERVICE] Error obteniendo archivo PDF:', error)
      console.error('❌ [DOCUMENT SERVICE] Status:', error.response?.status)
      console.error('❌ [DOCUMENT SERVICE] Response:', error.response?.data)

      // Si es error 401, debug adicional
      if (error.response?.status === 401) {
        console.error('🔍 [DOCUMENT SERVICE] Error 401 - Debug adicional:')
        this.debugAuthState()
      }

      // Si es error 422 y la respuesta es un Blob con JSON, leer el contenido
      if (error.response?.status === 422 && error.response?.data instanceof Blob) {
        try {
          const errorContent = await this.readBlobAsText(error.response.data)
          console.error('🔍 [DOCUMENT SERVICE] Contenido del error 422:', errorContent)

          // Intentar parsear como JSON
          try {
            const errorJson = JSON.parse(errorContent)
            console.error('🔍 [DOCUMENT SERVICE] Error JSON parseado:', errorJson)

            // Crear un error más descriptivo basado en el tipo de error
            let errorMessage = errorJson.detail || errorJson.message || 'Error 422: Documento no encontrado o no válido'

            // Detectar errores específicos del Mock Storage
            if (errorJson.detail && errorJson.detail.includes('Mock Storage')) {
              errorMessage = 'El archivo PDF no se encuentra en el servidor. Puede haber sido eliminado o nunca se subió correctamente.'
            } else if (errorJson.detail && errorJson.detail.includes('no fue encontrado')) {
              errorMessage = 'El archivo PDF no existe en el servidor.'
            }

            const enhancedError = new Error(errorMessage)
            enhancedError.status = 422
            enhancedError.details = errorJson
            enhancedError.isFileNotFound = errorJson.detail && errorJson.detail.includes('no fue encontrado')
            throw enhancedError
          } catch (parseError) {
            console.error('🔍 [DOCUMENT SERVICE] No se pudo parsear el error como JSON:', parseError)
            const enhancedError = new Error(`Error 422: ${errorContent}`)
            enhancedError.status = 422
            enhancedError.rawContent = errorContent
            throw enhancedError
          }
        } catch (readError) {
          console.error('🔍 [DOCUMENT SERVICE] Error leyendo el Blob de error:', readError)
        }
      }

      throw error
    }
  }

  /**
   * Validar que el usuario esté autenticado
   */
  validateAuthentication() {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
      console.error('❌ [DOCUMENT SERVICE] Usuario no autenticado')
      throw new Error('Usuario no autenticado. Por favor, inicie sesión.')
    }

    if (!authStore.accessToken) {
      console.error('❌ [DOCUMENT SERVICE] No hay access token disponible')
      throw new Error('Token de acceso no disponible. Por favor, inicie sesión nuevamente.')
    }

    console.log('✅ [DOCUMENT SERVICE] Usuario autenticado correctamente')
  }

  /**
   * Obtener URL autenticada para un archivo PDF
   * @param {string|number} id - ID del documento
   * @returns {Promise<string>} URL del PDF con autenticación
   */
  async getDocumentFileUrl(id) {
    try {
      console.log('📄 [DOCUMENT SERVICE] Generando URL autenticada para PDF:', id)

      // Validar autenticación antes de hacer la petición
      this.validateAuthentication()

      // Obtener el archivo como blob
      const blob = await this.getDocumentFile(id)

      // Crear URL del blob
      const url = URL.createObjectURL(blob)

      console.log('✅ [DOCUMENT SERVICE] URL de PDF generada exitosamente')
      return url
    } catch (error) {
      console.error('❌ [DOCUMENT SERVICE] Error generando URL de PDF:', error)
      throw error
    }
  }

  /**
   * Crear documento con archivo PDF usando el endpoint específico
   * @param {Object} documentData - Datos del documento
   * @param {File} file - Archivo PDF
   * @returns {Promise<Object>} Documento creado
   */
  async createDocumentWithFile(documentData, file) {
    try {
      console.log('📄 [DOCUMENT SERVICE] Creando documento PDF con archivo:', file.name)

      // Validar autenticación antes de hacer la petición
      this.validateAuthentication()

      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', documentData.name)
      formData.append('type', documentData.type)
      formData.append('slug', documentData.slug)
      formData.append('status', documentData.status.toString())
      formData.append('icon', documentData.icon)

      // Enviar roles como array individual, no como JSON string
      documentData.roles.forEach(role => {
        formData.append('roles', role)
      })

      const response = await api.post('/documents/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('✅ [DOCUMENT SERVICE] Documento PDF creado exitosamente')
      console.log('📄 [DOCUMENT SERVICE] Documento creado:', response.data)

      return response.data
    } catch (error) {
      console.error('❌ [DOCUMENT SERVICE] Error creando documento PDF:', error)
      console.error('❌ [DOCUMENT SERVICE] Status:', error.response?.status)
      console.error('❌ [DOCUMENT SERVICE] Response:', error.response?.data)
      throw error
    }
  }

  /**
   * Subir archivo PDF para un documento
   * @param {string|number} id - ID del documento
   * @param {FormData} formData - Datos del formulario con el archivo
   * @returns {Promise<Object>} Documento actualizado
   */
  async uploadDocumentFile(id, formData) {
    try {
      console.log('📄 [DOCUMENT SERVICE] Subiendo archivo PDF para documento:', id)

      // Validar autenticación antes de hacer la petición
      this.validateAuthentication()

      const response = await api.put(`/documents/file/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('✅ [DOCUMENT SERVICE] Archivo PDF subido exitosamente')
      console.log('📄 [DOCUMENT SERVICE] Documento actualizado:', response.data)

      return response.data
    } catch (error) {
      console.error('❌ [DOCUMENT SERVICE] Error subiendo archivo PDF:', error)
      console.error('❌ [DOCUMENT SERVICE] Status:', error.response?.status)
      console.error('❌ [DOCUMENT SERVICE] Response:', error.response?.data)
      throw error
    }
  }
}

// Crear instancia única del servicio
const documentService = new DocumentService()

export default documentService
