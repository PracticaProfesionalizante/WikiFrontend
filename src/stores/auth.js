import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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

  const clearAuth = () => {
    setTokens(null, null)
    setUser(null)
    setError(null)
  }

  const login = async (credentials) => {
    setLoading(true)
    setError(null)
    
    try {
      // Aquí haremos la llamada a la API (próximo paso)
      console.log('Login attempt with:', credentials)
      // TODO: Implementar llamada a API
    } catch (err) {
      setError(err.message || 'Error en el login')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    clearAuth()
    // TODO: Redirigir al login (próximo paso)
  }

  const refreshAccessToken = async () => {
    if (!refreshToken.value) {
      throw new Error('No refresh token available')
    }
    
    try {
      // TODO: Implementar refresh de token (próximo paso)
      console.log('Refreshing token...')
    } catch (err) {
      clearAuth()
      throw err
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
    clearAuth,
    login,
    logout,
    refreshAccessToken
  }
})