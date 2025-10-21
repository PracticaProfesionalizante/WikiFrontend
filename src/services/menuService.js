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
      if (error.response) {
        const status = error.response.status
        const message =
          error.response.data?.message || error.response.data?.detail || 'Error desconocido'

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
        order: menuData.order || 1,
        parentId: menuData.parentId,
        children: null,
        roles: menuData.roles?.map((role) => role.replace('ROLE_', '')) || [],
      }

      const response = await api.post('/menu', backendData)
      return response.data
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error(
          `Datos del menú inválidos: ${error.response?.data?.message || 'Error de validación'}`,
        )
      } else if (error.response?.status === 409) {
        throw new Error(
          `Ya existe un menú con esa ruta: ${error.response?.data?.message || 'Conflicto'}`,
        )
      } else if (error.response?.status === 422) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.detail ||
          error.response?.data?.title ||
          'Datos no válidos'
        throw new Error(`Error de validación: ${errorMessage}`)
      } else if (error.response?.status === 500) {
        throw new Error(
          `Error interno del servidor: ${error.response?.data?.message || 'Error del backend'}`,
        )
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
      console.log('🔄 [MENU SERVICE] Actualizando menú:', id)
      console.log('🔄 [MENU SERVICE] Datos recibidos:', menuData)

      // Detectar si es una operación de movimiento (solo parentId y order)
      const isMoveOperation =
        Object.keys(menuData).length <= 2 && ('parentId' in menuData || 'order' in menuData)

      let backendData

      if (isMoveOperation) {
        console.log('🔄 [MENU SERVICE] Operación de movimiento detectada')
        // Para operaciones de movimiento, enviar solo los campos necesarios
        backendData = {}

        if ('parentId' in menuData) {
          backendData.parentId = menuData.parentId
        }

        if ('order' in menuData) {
          backendData.order = menuData.order
        }
      } else {
        console.log('🔄 [MENU SERVICE] Actualización completa detectada')
        // Para actualizaciones completas, procesar todos los campos
        // Asegurar que roles sea un array
        let rolesArray = []
        if (Array.isArray(menuData.roles)) {
          rolesArray = menuData.roles
        } else if (typeof menuData.roles === 'string') {
          // Si es un string, convertir a array (puede ser un string separado por comas)
          rolesArray = menuData.roles
            .split(',')
            .map((role) => role.trim())
            .filter((role) => role)
        } else if (menuData.roles) {
          // Si existe pero no es array ni string, intentar convertir
          rolesArray = [String(menuData.roles)]
        }

        // Mapear datos del frontend al formato esperado por el backend
        backendData = {
          name: menuData.name,
          path: menuData.path,
          icon: menuData.icon,
          order: menuData.order || 0,
          parentId: menuData.parentId,
          children: null,
          roles: rolesArray.map((role) => role.replace('ROLE_', '')) || [],
        }
      }

      console.log('🔄 [MENU SERVICE] Datos a enviar al backend:', backendData)
      console.log('🔄 [MENU SERVICE] URL de la petición:', `/menu/${id}`)

      // Validar que no haya conflictos antes de enviar
      if (!isMoveOperation) {
        await this.validateMenuData(backendData, id)
      }

      const response = await api.put(`/menu/${id}`, backendData)
      console.log('✅ [MENU SERVICE] Menú actualizado exitosamente:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ [MENU SERVICE] Error actualizando menú:', error)
      console.error('❌ [MENU SERVICE] Status:', error.response?.status)
      console.error('❌ [MENU SERVICE] Response data:', error.response?.data)
      console.error('❌ [MENU SERVICE] Request data:', backendData)

      if (error.response?.status === 422) {
        const responseData = error.response?.data
        let errorMessage = 'Datos inválidos'

        // Manejar diferentes tipos de errores 422
        if (responseData?.detail?.includes('duplicate key')) {
          if (responseData.detail.includes('constraint')) {
            errorMessage = 'Ya existe un menú con estos datos. Verifica que la ruta y el orden no estén duplicados.'
          } else {
            errorMessage = 'Conflicto de datos: Ya existe un menú con la misma información.'
          }
        } else if (responseData?.detail) {
          errorMessage = responseData.detail
        } else if (responseData?.errors) {
          errorMessage = JSON.stringify(responseData.errors)
        }

        console.error('❌ [MENU SERVICE] Errores de validación:', errorMessage)
        throw new Error(`Error de validación: ${errorMessage}`)
      } else if (error.response?.status === 404) {
        throw new Error(`Menú no encontrado: ${error.response?.data?.message || 'No existe'}`)
      } else if (error.response?.status === 400) {
        throw new Error(
          `Datos del menú inválidos: ${error.response?.data?.message || 'Error de validación'}`,
        )
      } else if (error.response?.status === 409) {
        throw new Error(
          `Ya existe un menú con esa ruta: ${error.response?.data?.message || 'Conflicto'}`,
        )
      } else if (error.response?.status === 500) {
        throw new Error(
          `Error interno del servidor: ${error.response?.data?.message || 'Error del backend'}`,
        )
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
   * @returns {Promise} Respuesta de la eliminación
   */
  async deleteMenu(id) {
    try {
      const url = `/menu/${id}`
      const response = await api.delete(url)
      return response.data
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error(`Menú no encontrado: ${error.response?.data?.message || 'No existe'}`)
      } else if (error.response?.status === 409) {
        throw new Error(
          `No se puede eliminar el menú porque tiene menús hijos: ${error.response?.data?.message || 'Conflicto'}`,
        )
      } else if (error.response?.status === 403) {
        throw new Error(
          `No tienes permisos para eliminar este menú: ${error.response?.data?.message || 'Sin permisos'}`,
        )
      } else if (error.response?.status === 500) {
        throw new Error(
          `Error interno del servidor: ${error.response?.data?.message || 'Error del backend'}`,
        )
      }

      // Preservar el error original para debugging
      const originalError = new Error(`Error al eliminar el menú: ${error.message}`)
      originalError.originalError = error
      throw originalError
    }
  },

  /**
   * Actualizar orden de menús
   * @param {Array} menuOrder - Array con el nuevo orden de menús
   * @returns {Promise} Confirmación de actualización
   */
  async updateMenuOrder(menuOrder) {
    try {
      const response = await api.put('/menu/order', { order: menuOrder })
      return response.data
    } catch (error) {
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
        order: moveData.order,
      }

      // Usar el método updateMenu existente
      const response = await this.updateMenu(moveData.menuId, updatedMenuData)

      return response
    } catch (error) {
      if (error.message.includes('no existe') || error.message.includes('eliminado')) {
        throw new Error(`Menú no encontrado: ${error.message}`)
      } else if (error.message.includes('no encontrado') || error.message.includes('no válido')) {
        throw new Error('Menú no encontrado o no válido')
      } else if (error.message.includes('validación') || error.message.includes('requerido')) {
        throw new Error(`Error de validación al mover el menú: ${error.message}`)
      } else if (
        error.message.includes('servidor') ||
        (error.response && error.response.status >= 500)
      ) {
        const serverMessage =
          error.response?.data?.message || error.response?.data?.detail || error.message
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
      throw new Error('Error al cargar la estructura de menús')
    }
  },

  /**
   * Validar datos del menú antes de actualizar
   * @param {Object} menuData - Datos del menú a validar
   * @param {number} excludeId - ID del menú a excluir de la validación
   * @returns {Promise} Resultado de validación
   */
  async validateMenuData(menuData, excludeId = null) {
    try {
      console.log('🔍 [MENU SERVICE] Validando datos del menú:', menuData)

      // Obtener todos los menús para verificar conflictos
      const allMenus = await this.getAllMenus()

      // Validar path si existe
      if (menuData.path) {
        const existingMenu = allMenus.find(menu =>
          menu.path === menuData.path && menu.id !== excludeId
        )

        if (existingMenu) {
          throw new Error(`La ruta "${menuData.path}" ya está en uso por el menú "${existingMenu.name}" (ID: ${existingMenu.id})`)
        }
      }

      // Validar orden si existe
      if (menuData.order !== undefined && menuData.parentId !== undefined) {
        const existingOrder = allMenus.find(menu =>
          menu.order === menuData.order &&
          menu.parentId === menuData.parentId &&
          menu.id !== excludeId
        )

        if (existingOrder) {
          throw new Error(`Ya existe un menú con el orden ${menuData.order} en el mismo nivel`)
        }
      }

      // Validar que el parentId existe si se especifica
      if (menuData.parentId) {
        const parentExists = allMenus.find(menu => menu.id === menuData.parentId)
        if (!parentExists) {
          throw new Error(`El menú padre con ID ${menuData.parentId} no existe`)
        }
      }

      console.log('✅ [MENU SERVICE] Validación exitosa')
      return { valid: true }
    } catch (error) {
      console.error('❌ [MENU SERVICE] Error en validación:', error.message)
      throw error
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
      throw new Error('Error al validar la ruta del menú')
    }
  },
}

export default menuService
