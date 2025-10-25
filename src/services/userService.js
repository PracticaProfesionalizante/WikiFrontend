import api from './api'

/**
 * Servicio para gestión de usuarios
 */
const userService = {
  /**
   * Obtener todos los usuarios
   * @returns {Promise<Array>} Lista de usuarios
   */
  async getAllUsers() {
    try {
      console.log('👥 [USER SERVICE] Obteniendo lista de usuarios...')
      const response = await api.get('/users')
      console.log('✅ [USER SERVICE] Usuarios obtenidos exitosamente:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [USER SERVICE] Error obteniendo usuarios:', error)
      throw error
    }
  },

  /**
   * Obtener mi usuario actual
   * @returns {Promise<Object>} Datos del usuario actual
   */
  async getMyUser() {
    try {
      console.log('👤 [USER SERVICE] Obteniendo datos del usuario actual...')
      const response = await api.get('/users/me')
      console.log('✅ [USER SERVICE] Usuario actual obtenido:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [USER SERVICE] Error obteniendo usuario actual:', error)
      throw error
    }
  },

  /**
   * Actualizar un usuario
   * @param {number} userId - ID del usuario
   * @param {Object} userData - Datos del usuario a actualizar
   * @returns {Promise<Object>} Usuario actualizado
   */
  async updateUser(userId, userData) {
    try {
      console.log('✏️ [USER SERVICE] Actualizando usuario:', userId, userData)
      const response = await api.put(`/users/${userId}`, userData)
      console.log('✅ [USER SERVICE] Usuario actualizado exitosamente:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [USER SERVICE] Error actualizando usuario:', error)
      throw error
    }
  },

  /**
   * Crear un nuevo usuario
   * @param {Object} userData - Datos del nuevo usuario
   * @returns {Promise<Object>} Usuario creado
   */
  async createUser(userData) {
    try {
      console.log('➕ [USER SERVICE] Creando nuevo usuario:', userData)
      // Usar el endpoint correcto según la documentación del backend
      const response = await api.post('/auth/register', userData)
      console.log('✅ [USER SERVICE] Usuario creado exitosamente:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [USER SERVICE] Error creando usuario:', error)
      console.error('❌ [USER SERVICE] Error response:', error.response?.data)
      console.error('❌ [USER SERVICE] Error status:', error.response?.status)
      throw error
    }
  },

  /**
   * Eliminar un usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<void>}
   */
  async deleteUser(userId) {
    try {
      console.log('🗑️ [USER SERVICE] Eliminando usuario:', userId)
      await api.delete(`/users/${userId}`)
      console.log('✅ [USER SERVICE] Usuario eliminado exitosamente')
    } catch (error) {
      console.error('❌ [USER SERVICE] Error eliminando usuario:', error)
      throw error
    }
  }
}

export default userService
