import api from './api'

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
}

// Crear instancia única del servicio
const documentService = new DocumentService()

export default documentService
