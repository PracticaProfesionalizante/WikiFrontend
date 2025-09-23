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
      console.log(`🔍 getMenuById - Obteniendo menú con ID: ${id}`)
      const response = await api.get(`/menu/${id}`)
      console.log(`✅ getMenuById - Menú obtenido exitosamente:`, response.data)
      return response.data
    } catch (error) {
      console.error(`❌ getMenuById - Error al obtener menú ${id}:`, error)
      
      if (error.response) {
        const status = error.response.status
        const message = error.response.data?.message || error.response.data?.detail || 'Error desconocido'
        
        if (status === 404) {
          throw new Error(`Menú con ID ${id} no encontrado`)
        } else if (status === 403) {
          throw new Error('No tienes permisos para acceder a este menú')
        } else if (status === 401) {
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente')
        } else {
          throw new Error(`Error del servidor (${status}): ${message}`)
        }
      } else if (error.request) {
        throw new Error('Error de conexión. Verifica tu conexión a internet')
      } else {
        throw new Error(`Error al cargar el menú: ${error.message}`)
      }
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
      console.log('🔍 Datos recibidos para actualización:', JSON.stringify(menuData, null, 2))
      
      // Detectar si es una operación de movimiento (solo parentId y order)
      const isMoveOperation = Object.keys(menuData).length <= 2 && 
                             ('parentId' in menuData || 'order' in menuData)
      
      let backendData
      
      if (isMoveOperation) {
        // Para operaciones de movimiento, enviar solo los campos necesarios
        console.log('🔄 Operación de movimiento detectada')
        backendData = {}
        
        if ('parentId' in menuData) {
          backendData.parentId = menuData.parentId
        }
        
        if ('order' in menuData) {
          backendData.order = menuData.order
        }
      } else {
        // Para actualizaciones completas, procesar todos los campos
        console.log('🔄 Actualización completa detectada')
        console.log('🔍 Tipo de roles:', typeof menuData.roles, 'Valor:', menuData.roles)
        
        // Asegurar que roles sea un array
        let rolesArray = []
        if (Array.isArray(menuData.roles)) {
          rolesArray = menuData.roles
        } else if (typeof menuData.roles === 'string') {
          // Si es un string, convertir a array (puede ser un string separado por comas)
          rolesArray = menuData.roles.split(',').map(role => role.trim()).filter(role => role)
        } else if (menuData.roles) {
          // Si existe pero no es array ni string, intentar convertir
          rolesArray = [String(menuData.roles)]
        }
        
        console.log('🔍 Roles procesados:', rolesArray)
        
        // Mapear datos del frontend al formato esperado por el backend
        backendData = {
          name: menuData.name,
          path: menuData.path,
          icon: menuData.icon,
          order: menuData.order || 0,
          parentId: menuData.parentId,
          children: null,
          roles: rolesArray.map(role => role.replace('ROLE_', '')) || []
        }
      }
      
      console.log('🔄 Datos mapeados para actualización:', JSON.stringify(backendData, null, 2))
      
      const response = await api.put(`/menu/${id}`, backendData)
      return response.data
    } catch (error) {
      console.error('❌ Error al actualizar menú:', error)
      console.error('🔍 Detalles completos del error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      })
      
      if (error.response?.status === 422) {
        console.error('🚨 Error de validación 422:', error.response?.data)
        const validationErrors = error.response?.data?.errors || error.response?.data?.message || 'Datos inválidos'
        throw new Error(`Error de validación: ${JSON.stringify(validationErrors)}`)
      } else if (error.response?.status === 404) {
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
      console.log('🗑️ menuService.deleteMenu - Eliminando menú con ID:', id)
      console.log('🗑️ menuService.deleteMenu - URL de la petición:', `/menu/${id}`)
      
      const response = await api.delete(`/menu/${id}`)
      
      console.log('✅ menuService.deleteMenu - Respuesta exitosa:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ menuService.deleteMenu - Error completo:', error)
      console.error('❌ menuService.deleteMenu - Status:', error.response?.status)
      console.error('❌ menuService.deleteMenu - Data:', error.response?.data)
      console.error('❌ menuService.deleteMenu - Headers:', error.response?.headers)
      
      if (error.response?.status === 404) {
        throw new Error('Menú no encontrado')
      } else if (error.response?.status === 409) {
        throw new Error('No se puede eliminar el menú porque tiene dependencias')
      } else if (error.response?.status === 422) {
        // Error específico del backend: menú con submenús
        const detail = error.response?.data?.detail || 'No se puede eliminar un menú que tiene submenús asociados'
        throw new Error(detail)
      } else if (error.response?.status === 403) {
        throw new Error('No tienes permisos para eliminar este menú')
      } else if (error.response?.status === 500) {
        throw new Error(`Error interno del servidor: ${error.response?.data?.message || 'Error del backend'}`)
      }
      
      // Preservar el error original para debugging
      const originalError = new Error(`Error al eliminar el menú: ${error.message}`)
      originalError.originalError = error
      throw originalError
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
   * Mover un menú específico (cambiar padre y/o orden)
   * @param {Object} moveData - Datos del movimiento {menuId, parentId, order}
   * @returns {Promise} Confirmación de actualización
   */
  async moveMenu(moveData) {
    try {
      console.log('🔄 menuService.moveMenu - Datos recibidos:', moveData)
      
      // Validar datos de entrada
      if (!moveData.menuId) {
        throw new Error('ID del menú es requerido')
      }
      
      if (moveData.order < 0) {
        throw new Error('El orden debe ser un número positivo')
      }
      
      // Preparar solo los datos necesarios para mover (parentId y order)
      const updatedMenuData = {
        parentId: moveData.parentId === null ? null : moveData.parentId,
        order: moveData.order
      }
      
      console.log('📤 menuService.moveMenu - Datos a actualizar:', updatedMenuData)
      
      // Usar el método updateMenu existente
      const response = await this.updateMenu(moveData.menuId, updatedMenuData)
      
      console.log('✅ menuService.moveMenu - Respuesta exitosa:', response)
      return response
    } catch (error) {
      console.error('❌ menuService.moveMenu - Error completo:', error)
      console.error('❌ menuService.moveMenu - Error response:', error.response)
      
      if (error.message.includes('no existe') || error.message.includes('eliminado')) {
        throw new Error(`Menú no encontrado: ${error.message}`)
      } else if (error.message.includes('no encontrado') || error.message.includes('no válido')) {
        throw new Error('Menú no encontrado o no válido')
      } else if (error.message.includes('validación') || error.message.includes('requerido')) {
        throw new Error(`Error de validación al mover el menú: ${error.message}`)
      } else if (error.message.includes('servidor') || (error.response && error.response.status >= 500)) {
        const serverMessage = error.response?.data?.message || error.response?.data?.detail || error.message
        throw new Error(`Error interno del servidor: ${serverMessage}`)
      }
      
      throw new Error(`Error al mover el menú: ${error.message}`)
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