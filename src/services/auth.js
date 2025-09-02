import api from './api'

// Funciones de autenticación que interactúan con el backend
export const authService = {
  
  // Login del usuario
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', {
        username: credentials.username,
        password: credentials.password
      })
      
      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        user: response.data.user
      }
    } catch (error) {
      // Manejar errores específicos del backend
      if (error.response?.status === 401) {
        throw new Error('Credenciales inválidas')
      } else if (error.response?.status === 403) {
        throw new Error('Usuario deshabilitado')
      } else if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail)
      } else {
        throw new Error('Error de conexión con el servidor')
      }
    }
  },

  // Refresh del access token
  async refreshToken(refreshToken) {
    try {
      const response = await api.post('/auth/refresh', {
        refresh_token: refreshToken
      })
      
      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token || refreshToken
      }
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Refresh token inválido o expirado')
      } else {
        throw new Error('Error al renovar el token')
      }
    }
  },

  // Obtener información del usuario logueado
  async getCurrentUser() {
    try {
      const response = await api.get('/users/me')
      return response.data
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Token inválido')
      } else {
        throw new Error('Error al obtener información del usuario')
      }
    }
  },

  // Logout (opcional: invalidar token en el backend)
  async logout(refreshToken) {
    try {
      await api.post('/auth/logout', {
        refresh_token: refreshToken
      })
    } catch (error) {
      // No es crítico si falla el logout en el backend
      console.warn('Error al hacer logout en el backend:', error.message)
    }
  },

  // Verificar si el token es válido
  async verifyToken() {
    try {
      const response = await api.get('/auth/verify')
      return response.data.valid
    } catch (error) {
      return false
    }
  }
}

export default authService