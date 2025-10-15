import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/services/auth'
import router from '@/core/router'

export const useAuthStore = defineStore('auth', () => {
  // Estado reactivo
  const accessToken = ref(localStorage.getItem('access_token') || null)
  const refreshToken = ref(localStorage.getItem('refresh_token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const menus = ref(JSON.parse(localStorage.getItem('menus') || '[]'))
  const isLoading = ref(false)
  const error = ref(null)

  // Computed properties
  const isAuthenticated = computed(() => {
    return !!accessToken.value && !!user.value
  })

  const userRoles = computed(() => {
    return user.value?.roles || []
  })

  const hasRole = computed(() => {
    return (role) => userRoles.value.includes(role)
  })

  // Actions
  const setTokens = (access, refresh) => {
    accessToken.value = access
    refreshToken.value = refresh

    // Guardar en localStorage
    if (access) {
      localStorage.setItem('access_token', access)
    } else {
      localStorage.removeItem('access_token')
    }

    if (refresh) {
      localStorage.setItem('refresh_token', refresh)
    } else {
      localStorage.removeItem('refresh_token')
    }
  }

  const setUser = (userData) => {
    user.value = userData
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
    } else {
      localStorage.removeItem('user')
    }
  }

  const setMenus = (menuData) => {
    menus.value = menuData
    if (menuData && menuData.length > 0) {
      localStorage.setItem('menus', JSON.stringify(menuData))
    } else {
      localStorage.removeItem('menus')
    }
  }

  const setLoading = (loading) => {
    isLoading.value = loading
  }

  const setError = (errorMessage) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = null
  }

  const clearAuth = () => {
    clearRefreshTokenTimer()
    setTokens(null, null)
    setUser(null)
    setMenus([])
    setError(null)
  }

  // LOGIN ACTUALIZADO - Conectado con authService
  const login = async (credentials) => {
    console.log('🔐 [AUTH STORE] Iniciando proceso de login...')
    setLoading(true)
    setError(null)

    try {
      const response = await authService.login(credentials)
      console.log('✅ [AUTH STORE] Login exitoso!')
      console.log('✅ [AUTH STORE] Access token recibido:', response.access_token ? 'Presente' : 'Ausente')
      console.log('✅ [AUTH STORE] Refresh token recibido:', response.refresh_token ? 'Presente' : 'Ausente')
      console.log('✅ [AUTH STORE] Usuario recibido:', response.user ? 'Presente' : 'Ausente')

      // Guardar tokens
      setTokens(response.access_token, response.refresh_token)

      // Si no recibimos usuario en el login, obtenerlo por separado
      if (response.user) {
        setUser(response.user)
        console.log('✅ [AUTH STORE] Usuario recibido del login')
      } else {
        console.log('🔄 [AUTH STORE] Usuario no recibido en login, obteniendo por separado...')
        try {
          const userData = await authService.getCurrentUser()
          setUser(userData)
          console.log('✅ [AUTH STORE] Usuario obtenido por separado:', userData)
        } catch (userError) {
          console.warn('⚠️ [AUTH STORE] Error obteniendo usuario:', userError.message)
        }
      }

      console.log('✅ [AUTH STORE] Tokens y usuario guardados en localStorage')

      // Programar renovación de ambos tokens antes de que expire el access token
      if (response.refresh_token) {
        console.log('🔄 [AUTH STORE] Programando renovación de tokens en 28 minutos...')
        scheduleRefreshTokenRenewal()
      }

      // Cargar menús dinámicos después del login exitoso
      try {
        console.log('🔄 [AUTH STORE] Cargando menús dinámicos...')
        const menuData = await authService.fetchMenus()
        setMenus(menuData)
        console.log('✅ [AUTH STORE] Menús cargados:', menuData.length, 'elementos')
      } catch (menuError) {
        console.warn('⚠️ [AUTH STORE] Error cargando menús:', menuError.message)
        // Error silencioso - si fallan los menús, continuar con menús vacíos
        setMenus([])
      }

      // Pequeño delay para asegurar que el estado se actualice
      await new Promise((resolve) => setTimeout(resolve, 100))

      console.log('🔄 [AUTH STORE] Redirigiendo al dashboard en 1 segundo...')
      // Esperar 1 segundo antes de redirigir al dashboard
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)

      return response
    } catch (err) {
      console.error('❌ [AUTH STORE] Error en login:', err.message)
      // Establecer el error en el store para que el componente pueda accederlo
      setError(err.message || 'Error al iniciar sesión')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // LOGOUT ACTUALIZADO - Conectado con authService
  const logout = async () => {
    try {
      // Intentar logout en el backend
      if (refreshToken.value) {
        await authService.logout(refreshToken.value)
      }
    } catch (err) {
      // Error silencioso - solo log para debugging, no mostrar al usuario
    } finally {
      // Limpiar estado local siempre
      clearAuth()
      router.push('/login')
    }
  }

  // REFRESH TOKEN ACTUALIZADO - Ahora funciona con el nuevo endpoint /auth/access
  const refreshAccessToken = async () => {
    console.log('🔄 [AUTH STORE] Iniciando refreshAccessToken...')
    console.log('🔄 [AUTH STORE] Refresh token disponible:', refreshToken.value ? 'Sí' : 'No')

    if (!refreshToken.value) {
      console.error('❌ [AUTH STORE] No refresh token available')
      throw new Error('No refresh token available')
    }

    // Verificar si el refresh token está próximo a expirar
    try {
      const tokenPayload = JSON.parse(atob(refreshToken.value.split('.')[1]))
      const expDate = new Date(tokenPayload.exp * 1000)
      const now = new Date()
      const timeLeft = expDate - now
      const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60))

      console.log('🔄 [AUTH STORE] Refresh token expira en:', expDate.toLocaleString())
      console.log('🔄 [AUTH STORE] Tiempo restante:', hoursLeft, 'horas')

      if (timeLeft < 0) {
        console.error('❌ [AUTH STORE] Refresh token ya expiró')
        clearAuth()
        router.push('/login')
        throw new Error('Refresh token expirado')
      }

      if (hoursLeft < 1) {
        console.warn('⚠️ [AUTH STORE] Refresh token expira en menos de 1 hora')
      }
    } catch (tokenError) {
      console.error('❌ [AUTH STORE] Error verificando refresh token:', tokenError)
      console.error('❌ [AUTH STORE] Token puede estar corrupto, limpiando autenticación')
      clearAuth()
      router.push('/login')
      throw new Error('Refresh token inválido')
    }

    try {
      console.log('🔄 [AUTH STORE] Llamando a authService.refreshToken (flujo completo)...')
      const response = await authService.refreshToken(refreshToken.value)

      console.log('✅ [AUTH STORE] Refresh completo exitoso!')
      console.log('✅ [AUTH STORE] Nuevo access token:', response.access_token ? 'Presente' : 'Ausente')
      console.log('✅ [AUTH STORE] Nuevo refresh token:', response.refresh_token ? 'Presente' : 'Ausente')

      // Actualizar ambos tokens
      setTokens(response.access_token, response.refresh_token)

      console.log('✅ [AUTH STORE] Tokens actualizados en localStorage')
      return response.access_token
    } catch (err) {
      console.error('❌ [AUTH STORE] Error en refreshAccessToken:', err.message)
      console.error('❌ [AUTH STORE] Limpiando autenticación y redirigiendo...')

      // Error silencioso - solo log para debugging, no mostrar al usuario
      clearAuth()
      router.push('/login')
      throw err
    }
  }

  // NUEVA FUNCIÓN - Obtener datos del usuario actual
  const fetchCurrentUser = async (showErrorToUser = false) => {
    try {
      const userData = await authService.getCurrentUser()
      setUser(userData)
      return userData
    } catch (err) {
      // Solo mostrar error al usuario si se especifica explícitamente
      if (showErrorToUser) {
        setError('Error al obtener datos del usuario')
      }
      throw err
    }
  }

  // NUEVA FUNCIÓN - Inicializar autenticación al cargar la app
  const initializeAuth = async () => {
    if (accessToken.value && !user.value) {
      try {
        // Verificar si los tokens están próximos a expirar antes de usarlos
        if (refreshToken.value) {
          try {
            const tokenPayload = JSON.parse(atob(refreshToken.value.split('.')[1]))
            const expDate = new Date(tokenPayload.exp * 1000)
            const now = new Date()
            const timeLeft = expDate - now

            console.log('🔄 [AUTH STORE] Verificando tokens al inicializar...')
            console.log('🔄 [AUTH STORE] Refresh token expira en:', expDate.toLocaleString())

            if (timeLeft < 0) {
              console.warn('⚠️ [AUTH STORE] Refresh token expirado al inicializar, limpiando autenticación')
              clearAuth()
              return
            }
          } catch (tokenError) {
            console.error('❌ [AUTH STORE] Error verificando refresh token al inicializar:', tokenError)
            clearAuth()
            return
          }
        }

        // No mostrar error al usuario durante la inicialización silenciosa
        await fetchCurrentUser(false)

        // Cargar menús si no están disponibles
        if (menus.value.length === 0) {
          try {
            const menuData = await authService.fetchMenus()
            setMenus(menuData)
          } catch (menuError) {
            // Error silencioso - continuar sin menús
          }
        }
      } catch (err) {
        // Si falla, limpiar tokens inválidos
        console.error('❌ [AUTH STORE] Error en inicialización, limpiando autenticación:', err.message)
        clearAuth()
      }
    }
  }

  // NUEVA FUNCIÓN - Limpiar tokens expirados del localStorage
  const clearExpiredTokens = () => {
    try {
      const storedAccessToken = localStorage.getItem('accessToken')
      const storedRefreshToken = localStorage.getItem('refreshToken')

      let shouldClear = false

      // Verificar access token
      if (storedAccessToken) {
        try {
          const payload = JSON.parse(atob(storedAccessToken.split('.')[1]))
          const expDate = new Date(payload.exp * 1000)
          const now = new Date()

          if (expDate < now) {
            console.log('🧹 [AUTH STORE] Access token expirado encontrado en localStorage')
            shouldClear = true
          }
        } catch (error) {
          console.log('🧹 [AUTH STORE] Access token corrupto encontrado en localStorage')
          shouldClear = true
        }
      }

      // Verificar refresh token
      if (storedRefreshToken) {
        try {
          const payload = JSON.parse(atob(storedRefreshToken.split('.')[1]))
          const expDate = new Date(payload.exp * 1000)
          const now = new Date()

          if (expDate < now) {
            console.log('🧹 [AUTH STORE] Refresh token expirado encontrado en localStorage')
            shouldClear = true
          }
        } catch (error) {
          console.log('🧹 [AUTH STORE] Refresh token corrupto encontrado en localStorage')
          shouldClear = true
        }
      }

      if (shouldClear) {
        console.log('🧹 [AUTH STORE] Limpiando tokens expirados del localStorage')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        localStorage.removeItem('menus')

        // Resetear estado
        accessToken.value = null
        refreshToken.value = null
        user.value = null
        menus.value = []
      }

    } catch (error) {
      console.error('❌ [AUTH STORE] Error limpiando tokens expirados:', error)
    }
  }

  // NUEVA FUNCIÓN - Recargar menús manualmente
  const refreshMenus = async () => {
    try {
      const menuData = await authService.fetchMenus()
      setMenus(menuData)
      return menuData
    } catch (err) {
      throw err
    }
  }

  // NUEVA FUNCIÓN - Programar renovación del refresh token
  let refreshTokenTimer = null

  const scheduleRefreshTokenRenewal = () => {
    // Limpiar timer anterior si existe
    if (refreshTokenTimer) {
      clearTimeout(refreshTokenTimer)
    }

    // Programar renovación en 28 minutos (2 minutos antes de que expire el access token de 30 min)
    const refreshInterval = 28 * 60 * 1000 // 28 minutos en milisegundos

    refreshTokenTimer = setTimeout(async () => {
      console.log('🔄 [AUTH STORE] Ejecutando renovación programada de tokens...')

      try {
        await refreshAccessToken()
        console.log('✅ [AUTH STORE] Tokens renovados exitosamente')

        // Programar la siguiente renovación
        scheduleRefreshTokenRenewal()
      } catch (error) {
        console.error('❌ [AUTH STORE] Error en renovación programada:', error.message)
        // Si falla, limpiar autenticación
        clearAuth()
        router.push('/login')
      }
    }, refreshInterval)

    console.log('⏰ [AUTH STORE] Timer de renovación programado para', new Date(Date.now() + refreshInterval))
    console.log('⏰ [AUTH STORE] Renovación cada 28 min (access token expira en 30 min)')
  }

  const clearRefreshTokenTimer = () => {
    if (refreshTokenTimer) {
      clearTimeout(refreshTokenTimer)
      refreshTokenTimer = null
      console.log('🧹 [AUTH STORE] Timer de renovación cancelado')
    }
  }

  return {
    // State
    accessToken,
    refreshToken,
    user,
    menus,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    userRoles,
    hasRole,

    // Actions
    setTokens,
    setUser,
    setMenus,
    setLoading,
    setError,
    clearError,
    clearAuth,
    login,
    logout,
    refreshAccessToken,
    fetchCurrentUser,
    initializeAuth,
    refreshMenus,
    scheduleRefreshTokenRenewal,
    clearRefreshTokenTimer,
    clearExpiredTokens,
  }
})
