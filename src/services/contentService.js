import api from './api'

/**
 * Servicio para gestionar ContentItems
 */
const contentService = {
  /**
   * Obtener todos los ContentItems
   * @returns {Promise} Lista de ContentItems
   */
  async getAll() {
    try {
      const response = await api.get('/api/content-items')
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * Obtener un ContentItem por ID
   * @param {number} id - ID del ContentItem
   * @returns {Promise} ContentItem
   */
  async getById(id) {
    try {
      const response = await api.get(`/api/content-items/${id}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * Crear un nuevo ContentItem
   * @param {Object} contentData - Datos del ContentItem
   * @returns {Promise} ContentItem creado
   */
  async create(contentData) {
    try {
      const response = await api.post('/api/content-items', contentData)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * Actualizar un ContentItem existente
   * @param {number} id - ID del ContentItem
   * @param {Object} contentData - Datos actualizados
   * @returns {Promise} ContentItem actualizado
   */
  async update(id, contentData) {
    try {
      const response = await api.put(`/api/content-items/${id}`, contentData)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * Eliminar un ContentItem
   * @param {number} id - ID del ContentItem
   * @returns {Promise}
   */
  async delete(id) {
    try {
      const response = await api.delete(`/api/content-items/${id}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  /**
   * Manejo centralizado de errores
   * @param {Error} error - Error de axios
   * @returns {Error} Error formateado
   */
  handleError(error) {
    if (error.response) {
      // El servidor respondió con un código de error
      const message = error.response.data?.message || error.response.data?.error || 'Error en el servidor'
      return new Error(message)
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      return new Error('No se pudo conectar con el servidor')
    } else {
      // Error al configurar la petición
      return new Error(error.message || 'Error desconocido')
    }
  },
}

export default contentService
