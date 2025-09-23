import api from './api'

/**
 * Servicio para gestión de menús
 * Proporciona todas las operaciones CRUD para menús
 */
const menuService = {
  
  /**
   * Obtener todos los menús
   * @returns {Promise} Lista de menús
   */
  async getAllMenus() {
    try {
      const response = await api.get('/menu')
      return response.data
    } catch (error) {
      console.error('Error al obtener menús:', error)
      throw new Error('Error al cargar la lista de menús')
    }
  },

  /**
   * Obtener un menú por ID
   * @param {number} id - ID del menú
   * @returns {Promise} Datos del menú
   */
  async getMenuById(id) {
    try {
      const response = await api.get(`/menu/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener menú:', error)
      throw new Error('Error al cargar el menú')
    }
  },

  /**
   * Crear un nuevo menú
   * @param {Object} menuData - Datos del menú a crear
   * @returns {Promise} Menú creado
   */
  async createMenu(menuData) {
    try {
      // Mapear datos del frontend al formato esperado por el backend
      const backendData = {
        name: menuData.name,
        path: menuData.path,
        icon: menuData.icon,
        order: menuData.order || 0,
        parentId: menuData.parentId,
        children: null,
        roles: menuData.roles?.map(role => role.replace('ROLE_', '')) || []
      }
      
      console.log('🔄 Datos mapeados para backend:', JSON.stringify(backendData, null, 2))
      
      const response = await api.post('/menu', backendData)
      return response.data
    } catch (error) {
      console.error('Error al crear menú:', error)
      console.error('🔍 Detalles completos del error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      })
      
      if (error.response?.status === 400) {
        throw new Error(`Datos del menú inválidos: ${error.response?.data?.message || 'Error de validación'}`)
      } else if (error.response?.status === 409) {
        throw new Error(`Ya existe un menú con esa ruta: ${error.response?.data?.message || 'Conflicto'}`)
      } else if (error.response?.status === 500) {
        throw new Error(`Error interno del servidor: ${error.response?.data?.message || 'Error del backend'}`)
      }
      
      // Preservar el error original para debugging
      const originalError = new Error(`Error al crear el menú: ${error.message}`)
      originalError.originalError = error
      throw originalError
    }
  },

  /**
   * Actualizar un menú existente
   * @param {number} id - ID del menú
   * @param {Object} menuData - Datos actualizados del menú
   * @returns {Promise} Menú actualizado
   */
  async updateMenu(id, menuData) {
    try {
      // Mapear datos del frontend al formato esperado por el backend
      const backendData = {
        name: menuData.name,
        path: menuData.path,
        icon: menuData.icon,
        order: menuData.order || 0,
        parentId: menuData.parentId,
        children: null,
        roles: menuData.roles?.map(role => role.replace('ROLE_', '')) || []
      }
      
      console.log('🔄 Datos mapeados para actualización:', JSON.stringify(backendData, null, 2))
      
      const response = await api.put(`/menu/${id}`, backendData)
      return response.data
    } catch (error) {
      console.error('Error al actualizar menú:', error)
      console.error('🔍 Detalles completos del error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      })
      
      if (error.response?.status === 404) {
        throw new Error(`Menú no encontrado: ${error.response?.data?.message || 'No existe'}`)
      } else if (error.response?.status === 400) {
        throw new Error(`Datos del menú inválidos: ${error.response?.data?.message || 'Error de validación'}`)
      } else if (error.response?.status === 409) {
        throw new Error(`Ya existe un menú con esa ruta: ${error.response?.data?.message || 'Conflicto'}`)
      } else if (error.response?.status === 500) {
        throw new Error(`Error interno del servidor: ${error.response?.data?.message || 'Error del backend'}`)
      }
      
      // Preservar el error original para debugging
      const originalError = new Error(`Error al actualizar el menú: ${error.message}`)
      originalError.originalError = error
      throw originalError
    }
  },

  /**
   * Eliminar un menú
   * @param {number} id - ID del menú a eliminar
   * @returns {Promise} Confirmación de eliminación
   */
  async deleteMenu(id) {
    try {
      const response = await api.delete(`/menu/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al eliminar menú:', error)
      if (error.response?.status === 404) {
        throw new Error('Menú no encontrado')
      } else if (error.response?.status === 409) {
        throw new Error('No se puede eliminar el menú porque tiene dependencias')
      }
      throw new Error('Error al eliminar el menú')
    }
  },

  /**
   * Actualizar el orden de los menús
   * @param {Array} menuOrder - Array con IDs de menús en el nuevo orden
   * @returns {Promise} Confirmación de actualización
   */
  async updateMenuOrder(menuOrder) {
    try {
      const response = await api.put('/menu/order', { order: menuOrder })
      return response.data
    } catch (error) {
      console.error('Error al actualizar orden de menús:', error)
      throw new Error('Error al actualizar el orden de los menús')
    }
  },

  /**
   * Obtener menús por rol de usuario
   * @param {string} role - Rol del usuario
   * @returns {Promise} Lista de menús filtrados por rol
   */
  async getMenusByRole(role) {
    try {
      const response = await api.get(`/menu/role/${role}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener menús por rol:', error)
      throw new Error('Error al cargar menús del usuario')
    }
  },

  /**
   * Activar/Desactivar un menú
   * @param {number} id - ID del menú
   * @param {boolean} isActive - Estado activo/inactivo
   * @returns {Promise} Menú actualizado
   */
  async toggleMenuStatus(id, isActive) {
    try {
      const response = await api.patch(`/menu/${id}/status`, { isActive })
      return response.data
    } catch (error) {
      console.error('Error al cambiar estado del menú:', error)
      if (error.response?.status === 404) {
        throw new Error('Menú no encontrado')
      }
      throw new Error('Error al cambiar el estado del menú')
    }
  },

  /**
   * Obtener estructura jerárquica de menús
   * @returns {Promise} Estructura de menús con jerarquía
   */
  async getMenuHierarchy() {
    try {
      const response = await api.get('/menu/hierarchy')
      return response.data
    } catch (error) {
      console.error('Error al obtener jerarquía de menús:', error)
      throw new Error('Error al cargar la estructura de menús')
    }
  },

  /**
   * Validar ruta de menú
   * @param {string} path - Ruta a validar
   * @param {number} excludeId - ID del menú a excluir de la validación (para edición)
   * @returns {Promise} Resultado de validación
   */
  async validateMenuPath(path, excludeId = null) {
    try {
      const params = { path }
      if (excludeId) {
        params.excludeId = excludeId
      }
      const response = await api.get('/menu/validate-path', { params })
      return response.data
    } catch (error) {
      console.error('Error al validar ruta:', error)
      throw new Error('Error al validar la ruta del menú')
    }
  }
}

export default menuService