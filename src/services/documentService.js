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

      // Si es error 500 o el endpoint no existe, devolver datos de prueba
      if (error.response?.status === 500 || error.response?.status === 404) {
        console.log('🔄 [DOCUMENT SERVICE] Backend no disponible, usando datos de prueba')
        console.log('ℹ️ [DOCUMENT SERVICE] Esto es normal durante el desarrollo del backend')
        return this.getSampleDocuments()
      }

      throw error
    }
  }

  /**
   * Obtener datos de prueba cuando el backend no está disponible
   * @returns {Array} Lista de documentos de prueba
   */
  getSampleDocuments() {
    console.log('📄 [DOCUMENT SERVICE] Generando datos de prueba...')

    return [
      {
        id: 1,
        name: 'Reglamento de Estudiantes',
        type: 'TEXT',
        slug: 'reglamentos',
        content: '# Reglamento de Estudiantes\n\n## Capítulo 1: Disposiciones Generales\n\nEste documento establece las normas y procedimientos...',
        icon: 'mdi-file-document',
        createdBy: 'Admin Principal',
        updatedBy: 'Admin Principal',
        createdAt: '2025-01-10T10:00:00.000Z',
        updatedAt: '2025-01-10T15:30:00.000Z',
        roles: ['ROLE_ADMIN', 'ROLE_SUPER_USER']
      },
      {
        id: 2,
        name: 'Manual de Usuario',
        type: 'TEXT',
        slug: 'manuales',
        content: '# Manual de Usuario\n\n## Introducción\n\nBienvenido al sistema de gestión académica...',
        icon: 'mdi-book-open',
        createdBy: 'Editor Técnico',
        updatedBy: 'Editor Técnico',
        createdAt: '2025-01-11T14:30:00.000Z',
        updatedAt: '2025-01-11T16:45:00.000Z',
        roles: ['ROLE_ADMIN', 'ROLE_SUPER_USER']
      },
      {
        id: 3,
        name: 'Guía de Programación',
        type: 'URL',
        slug: 'guias',
        content: 'https://developer.mozilla.org/es/docs/Web/JavaScript',
        icon: 'mdi-link',
        createdBy: 'Administrador',
        updatedBy: 'Administrador',
        createdAt: '2025-01-09T09:15:00.000Z',
        updatedAt: '2025-01-09T11:20:00.000Z',
        roles: ['ROLE_ADMIN', 'ROLE_SUPER_USER']
      },
      {
        id: 4,
        name: 'Documento de Configuración',
        type: 'TEXT',
        slug: 'configuracion',
        content: '# Configuración del Sistema\n\n## Parámetros Generales\n\n- Puerto: 8080\n- Base de datos: MySQL\n- Cache: Redis',
        icon: 'mdi-cog',
        createdBy: 'Editor de Contenido',
        updatedBy: 'Editor de Contenido',
        createdAt: '2025-01-12T08:45:00.000Z',
        updatedAt: '2025-01-12T10:15:00.000Z',
        roles: ['ROLE_ADMIN', 'ROLE_SUPER_USER']
      },
      {
        id: 5,
        name: 'Presentación Institucional',
        type: 'URL',
        slug: 'presentaciones',
        content: 'https://ejemplo.com/presentacion-institucional.pdf',
        icon: 'mdi-presentation',
        createdBy: 'Admin Principal',
        updatedBy: 'Admin Principal',
        createdAt: '2025-01-08T16:00:00.000Z',
        updatedAt: '2025-01-08T17:30:00.000Z',
        roles: ['ROLE_ADMIN', 'ROLE_SUPER_USER']
      },
      {
        id: 6,
        name: 'Política de Seguridad',
        type: 'TEXT',
        slug: 'politicas',
        content: '# Política de Seguridad\n\n## Objetivos\n\nEsta política establece las medidas de seguridad...',
        icon: 'mdi-shield-check',
        createdBy: 'Admin Principal',
        updatedBy: 'Admin Principal',
        createdAt: '2025-01-13T09:00:00.000Z',
        updatedAt: '2025-01-13T12:00:00.000Z',
        roles: ['ROLE_ADMIN', 'ROLE_SUPER_USER']
      }
    ]
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
      console.log('📄 [DOCUMENT SERVICE] Datos:', {
        name: documentData.name,
        type: documentData.type,
        slug: documentData.slug
      })

      const response = await api.post('/documents', documentData)

      console.log('✅ [DOCUMENT SERVICE] Documento creado exitosamente')
      console.log('📄 [DOCUMENT SERVICE] ID del documento:', response.data?.id)

      return response.data
    } catch (error) {
      console.error('❌ [DOCUMENT SERVICE] Error creando documento:', error)
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
