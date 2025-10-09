import api from './api'

// Función para decodificar JWT y mostrar información de expiración
const decodeJWT = (token) => {
  if (!token) return null

  try {
    // Decodificar el payload del JWT (sin verificar firma)
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))

    const payload = JSON.parse(jsonPayload)
    return payload
  } catch (error) {
    console.error('❌ [AUTH SERVICE] Error decodificando JWT:', error)
    return null
  }
}

// Función para mostrar información detallada de los tokens
const logTokenInfo = (tokenType, token) => {
  if (!token) {
    console.log(`🔍 [AUTH SERVICE] ${tokenType}: Ausente`)
    return
  }

  const payload = decodeJWT(token)
  if (payload) {
    const expDate = new Date(payload.exp * 1000)
    const now = new Date()
    const timeLeft = expDate - now
    const minutesLeft = Math.floor(timeLeft / (1000 * 60))
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60))
    const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24))

    console.log(`🔍 [AUTH SERVICE] ${tokenType}:`)
    console.log(`   📅 Expira: ${expDate.toLocaleString()}`)
    console.log(`   ⏰ Tiempo restante: ${daysLeft}d ${hoursLeft % 24}h ${minutesLeft % 60}m`)
    console.log(`   🎯 Minutos restantes: ${minutesLeft}`)
    console.log(`   📊 Payload:`, payload)
  } else {
    console.log(`🔍 [AUTH SERVICE] ${tokenType}: Presente pero no decodificable`)
  }
}

// Funciones de autenticación que interactúan con el backend
export const authService = {
  // Login del usuario
  async login(credentials) {
    console.log('🔐 [AUTH SERVICE] Iniciando login...')
    console.log('🔐 [AUTH SERVICE] Credenciales:', { email: credentials.email })

    try {
      const response = await api.post('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      })

      console.log('✅ [AUTH SERVICE] Respuesta completa del backend:', response.data)
      console.log('✅ [AUTH SERVICE] Estructura de la respuesta:', {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        user: response.data.user,
        keys: Object.keys(response.data)
      })

      // El backend solo devuelve accessToken en el login
      const accessToken = response.data.accessToken

      // Mostrar información detallada del access token recibido
      logTokenInfo('ACCESS TOKEN (del login)', accessToken)

      // Inmediatamente después del login, obtener el refreshToken
      console.log('🔄 [AUTH SERVICE] Obteniendo refreshToken inmediatamente después del login...')
      let refreshToken = null

      try {
        refreshToken = await this.getRefreshToken(accessToken)
        console.log('✅ [AUTH SERVICE] RefreshToken obtenido exitosamente')

        // Mostrar información detallada del refresh token obtenido
        logTokenInfo('REFRESH TOKEN (obtenido)', refreshToken)
      } catch (refreshError) {
        console.error('❌ [AUTH SERVICE] Error obteniendo refreshToken:', refreshError)
        // Continuar sin refreshToken - el usuario tendrá que hacer login nuevamente cuando expire
      }

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: response.data.user,
      }
    } catch (error) {
      console.error('❌ [AUTH SERVICE] Error en login:', error)
      console.error('❌ [AUTH SERVICE] Response error:', error.response?.data)

      // Manejar errores específicos del backend
      if (error.response?.status === 401) {
        throw new Error('Credenciales inválidas')
      } else if (error.response?.status === 403) {
        throw new Error('Usuario deshabilitado')
      } else if (error.response?.status === 500 && error.response?.data?.detail?.includes('Ocurrió un error inesperado')) {
        // El backend devuelve 500 para credenciales incorrectas, pero el mensaje indica que es un error de autenticación
        throw new Error('Credenciales inválidas')
      } else if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail)
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      } else {
        throw new Error('Error de conexión con el servidor')
      }
    }
  },

  // Obtener refreshToken usando accessToken válido
  async getRefreshToken(accessToken) {
    console.log('🔄 [AUTH SERVICE] Obteniendo refreshToken con accessToken...')

    try {
      const response = await api.post('/auth/refresh', {}, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      console.log('✅ [AUTH SERVICE] RefreshToken obtenido:', response.data)

      // Mostrar información detallada del refresh token obtenido
      logTokenInfo('REFRESH TOKEN (nuevo)', response.data.refreshToken)

      return response.data.refreshToken
    } catch (error) {
      console.error('❌ [AUTH SERVICE] Error obteniendo refreshToken:', error)
      console.error('❌ [AUTH SERVICE] Status:', error.response?.status)
      console.error('❌ [AUTH SERVICE] Response:', error.response?.data)

      if (error.response?.status === 401) {
        throw new Error('Access token inválido o expirado para obtener refresh token')
      } else {
        throw new Error('Error al obtener refresh token')
      }
    }
  },

  // Intercambiar refreshToken por nuevo accessToken
  async getAccessToken(refreshToken) {
    console.log('🔄 [AUTH SERVICE] Intercambiando refreshToken por nuevo accessToken...')
    console.log('🔄 [AUTH SERVICE] Refresh token recibido:', refreshToken ? 'Presente' : 'Ausente')

    // Verificar que el refreshToken no esté vacío
    if (!refreshToken || refreshToken.trim() === '') {
      console.error('❌ [AUTH SERVICE] Refresh token vacío o inválido')
      throw new Error('Refresh token vacío o inválido')
    }

    // Mostrar información del refresh token antes de usarlo
    logTokenInfo('REFRESH TOKEN (a usar)', refreshToken)

    try {
      console.log('🔄 [AUTH SERVICE] Enviando request a /auth/access...')
      console.log('🔄 [AUTH SERVICE] Header Authorization:', `Bearer ${refreshToken.substring(0, 20)}...`)

      const response = await api.post('/auth/access', {}, {
        headers: {
          'Authorization': `Bearer ${refreshToken}`
        }
      })

      console.log('✅ [AUTH SERVICE] Nuevo accessToken obtenido:', response.data)

      // Mostrar información detallada del nuevo access token
      logTokenInfo('ACCESS TOKEN (nuevo)', response.data.accessToken)

      return response.data.accessToken
    } catch (error) {
      console.error('❌ [AUTH SERVICE] Error obteniendo nuevo accessToken:')
      console.error('❌ [AUTH SERVICE] Status:', error.response?.status)
      console.error('❌ [AUTH SERVICE] Response:', error.response?.data)
      console.error('❌ [AUTH SERVICE] Error completo:', error)

      // Información adicional para debugging
      if (error.response?.status === 401) {
        console.error('❌ [AUTH SERVICE] El refresh token es inválido o ha expirado')
        console.error('❌ [AUTH SERVICE] Posibles causas:')
        console.error('   - El refresh token ha expirado (7 días)')
        console.error('   - El refresh token fue revocado en el servidor')
        console.error('   - El formato del token es incorrecto')
        console.error('   - El servidor no reconoce el token')
        throw new Error('Refresh token inválido o expirado')
      } else {
        throw new Error('Error al obtener nuevo access token')
      }
    }
  },

  // Refresh del access token - ahora funciona con el nuevo endpoint
  async refreshToken(refreshToken) {
    console.log('🔄 [AUTH SERVICE] Iniciando refresh completo del token...')
    console.log('🔄 [AUTH SERVICE] Refresh token recibido:', refreshToken ? 'Presente' : 'Ausente')

    try {
      // Paso 1: Intercambiar refreshToken por nuevo accessToken
      console.log('🔄 [AUTH SERVICE] Paso 1: Obteniendo nuevo accessToken...')
      const newAccessToken = await this.getAccessToken(refreshToken)

      // Paso 2: Usar el nuevo accessToken para obtener nuevo refreshToken
      console.log('🔄 [AUTH SERVICE] Paso 2: Obteniendo nuevo refreshToken...')
      const newRefreshToken = await this.getRefreshToken(newAccessToken)

      console.log('✅ [AUTH SERVICE] Refresh completo exitoso!')
      console.log('✅ [AUTH SERVICE] Nuevo access token:', newAccessToken ? 'Presente' : 'Ausente')
      console.log('✅ [AUTH SERVICE] Nuevo refresh token:', newRefreshToken ? 'Presente' : 'Ausente')

      // Mostrar información detallada de ambos tokens renovados
      console.log('🎯 [AUTH SERVICE] === RESUMEN DE TOKENS RENOVADOS ===')
      logTokenInfo('ACCESS TOKEN (renovado)', newAccessToken)
      logTokenInfo('REFRESH TOKEN (renovado)', newRefreshToken)
      console.log('🎯 [AUTH SERVICE] === FIN RESUMEN ===')

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      }
    } catch (error) {
      console.error('❌ [AUTH SERVICE] Error en refresh completo:', error.message)
      throw error
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

  // Logout - ahora con endpoint /auth/logout implementado
  async logout(refreshToken) {
    console.log('🔄 [AUTH SERVICE] Iniciando logout...')
    console.log('🔄 [AUTH SERVICE] Refresh token disponible:', refreshToken ? 'Sí' : 'No')

    if (!refreshToken) {
      console.log('ℹ️ [AUTH SERVICE] No hay refresh token - logout solo frontend')
      return Promise.resolve()
    }

    try {
      console.log('🔄 [AUTH SERVICE] Llamando al endpoint /auth/logout...')
      console.log('🔄 [AUTH SERVICE] Refresh token a enviar:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'Ausente')
      console.log('🔄 [AUTH SERVICE] Header Authorization:', `Bearer ${refreshToken ? refreshToken.substring(0, 20) + '...' : 'Ausente'}`)

      const response = await api.post('/auth/logout', {}, {
        headers: {
          'Authorization': `Bearer ${refreshToken}`
        }
      })

      console.log('✅ [AUTH SERVICE] Logout exitoso en backend:', response.data)
      console.log('✅ [AUTH SERVICE] Mensaje del servidor:', response.data.message)
      console.log('✅ [AUTH SERVICE] Status HTTP:', response.status)
      console.log('✅ [AUTH SERVICE] Headers de respuesta:', response.headers)

    } catch (error) {
      console.warn('⚠️ [AUTH SERVICE] Error en logout del backend:', error.message)
      console.warn('⚠️ [AUTH SERVICE] Status:', error.response?.status)
      console.warn('⚠️ [AUTH SERVICE] Response:', error.response?.data)

      if (error.response?.status === 500) {
        console.log('ℹ️ [AUTH SERVICE] Error 500 - Problema interno del servidor')
        console.log('ℹ️ [AUTH SERVICE] El backend fue endurecido pero aún hay problemas:')
        console.log('   - Posible problema con proxy/headers')
        console.log('   - Error en filtros o handlers del servidor')
        console.log('   - Necesario revisar stacktrace del servidor')
        console.log('ℹ️ [AUTH SERVICE] Continuando con logout frontend (no crítico)')
      } else if (error.response?.status === 401) {
        console.log('ℹ️ [AUTH SERVICE] Error 401 - Refresh token inválido o expirado')
        console.log('ℹ️ [AUTH SERVICE] Continuando con logout frontend (no crítico)')
      } else {
        console.log('ℹ️ [AUTH SERVICE] Error desconocido - Continuando con logout frontend (no crítico)')
      }

      // No es crítico si falla - el logout frontend sigue funcionando
    }

    console.log('✅ [AUTH SERVICE] Logout completado')
    return Promise.resolve()
  },

  // Verificar si el token es válido
  async verifyToken() {
    try {
      const response = await api.get('/auth/verify')
      return response.data.valid
    } catch (error) {
      return false
    }
  },

  // Obtener menús dinámicos basados en permisos del usuario
  async fetchMenus() {
    try {
      const response = await api.get('/menu')
      return response.data
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Token inválido para obtener menús')
      } else {
        throw new Error('Error al obtener menús del servidor')
      }
    }
  },
}

export default authService
