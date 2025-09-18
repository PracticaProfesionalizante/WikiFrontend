import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/services/auth'
import router from '@/core/router'

export const useAuthStore = defineStore('auth', () => {
  // Estado reactivo
  const accessToken = ref(localStorage.getItem('access_token') || null)
  const refreshToken = ref(localStorage.getItem('refresh_token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
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
    setTokens(null, null)
    setUser(null)
    setError(null)
  }

  // LOGIN ACTUALIZADO - Conectado con authService
  const login = async (credentials) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await authService.login(credentials)
      
      // Guardar tokens y usuario
      setTokens(response.access_token, response.refresh_token)
      setUser(response.user)
      
      // Pequeño delay para asegurar que el estado se actualice
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Esperar 1 segundo antes de redirigir al dashboard
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
      
      return response
    } catch (err) {
      // No establecer error aquí, dejar que el componente lo maneje
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
      console.warn('Error en logout del backend (silencioso):', err.message)
    } finally {
      // Limpiar estado local siempre
      clearAuth()
      router.push('/login')
    }
  }

  // REFRESH TOKEN ACTUALIZADO - Conectado con authService
  const refreshAccessToken = async () => {
    if (!refreshToken.value) {
      throw new Error('No refresh token available')
    }
    
    try {
      const response = await authService.refreshToken(refreshToken.value)
      setTokens(response.access_token, response.refresh_token)
      return response.access_token
    } catch (err) {
      // Error silencioso - solo log para debugging, no mostrar al usuario
      console.error('Error al renovar token (silencioso):', err.message)
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
        // No mostrar error al usuario durante la inicialización silenciosa
        await fetchCurrentUser(false)
      } catch (err) {
        // Si falla, limpiar tokens inválidos
        clearAuth()
      }
    }
  }

  return {
    // State
    accessToken,
    refreshToken,
    user,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    userRoles,
    hasRole,
    
    // Actions
    setTokens,
    setUser,
    setLoading,
    setError,
    clearError,
    clearAuth,
    login,
    logout,
    refreshAccessToken,
    fetchCurrentUser,
    initializeAuth
  }
})