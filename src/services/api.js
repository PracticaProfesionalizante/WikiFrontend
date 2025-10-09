import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

// Configuración base de Axios
const api = axios.create({
  baseURL: 'http://practicas.teclab.edu.ar:8080', // URL del backend
  timeout: 30000, // Timeout aumentado para operaciones complejas como crear menús con submenús
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor de request
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Variable para evitar múltiples refresh simultáneos
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

// Interceptor de REQUEST - Agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()

    if (authStore.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor de RESPONSE - Manejar refresh automático
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    const authStore = useAuthStore()

    console.log('🔍 [API INTERCEPTOR] Error interceptado:', {
      status: error.response?.status,
      url: originalRequest.url,
      isRetry: originalRequest._retry,
      isRefreshing: isRefreshing
    })

    // Si el error es 401 y no es un retry, y no es una petición de login o refresh
    if (error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url?.includes('/auth/login') &&
        !originalRequest.url?.includes('/auth/access') &&
        !originalRequest.url?.includes('/auth/refresh')) {

      console.log('🔄 [API INTERCEPTOR] Error 401 detectado, iniciando refresh automático...')
      console.log('🔄 [API INTERCEPTOR] URL de la petición:', originalRequest.url)

      // Si ya estamos refrescando, agregar a la cola
      if (isRefreshing) {
        console.log('⏳ [API INTERCEPTOR] Ya hay un refresh en progreso, agregando a la cola...')
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            console.log('✅ [API INTERCEPTOR] Procesando petición de la cola con nuevo token')
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => {
            console.error('❌ [API INTERCEPTOR] Error procesando petición de la cola:', err)
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        console.log('🔄 [API INTERCEPTOR] Llamando a refreshAccessToken...')

        // Verificar si hay refresh token antes de intentar refresh
        if (!authStore.refreshToken) {
          console.error('❌ [API INTERCEPTOR] No hay refresh token disponible')
          throw new Error('No refresh token available')
        }

        // Intentar refresh del token
        await authStore.refreshAccessToken()
        processQueue(null, authStore.accessToken)

        console.log('✅ [API INTERCEPTOR] Refresh exitoso, reintentando petición original...')
        // Reintentar la petición original
        originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        console.error('❌ [API INTERCEPTOR] Error en refresh automático:', refreshError)
        console.error('❌ [API INTERCEPTOR] Limpiando autenticación y redirigiendo...')

        processQueue(refreshError, null)

        // Limpiar autenticación y redirigir
        authStore.logout()

        console.log('🔄 [API INTERCEPTOR] Redirigiendo al login...')
        // Redirigir al login
        window.location.href = '/login'

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
        console.log('🏁 [API INTERCEPTOR] Refresh process finalizado')
      }
    }

    console.log('❌ [API INTERCEPTOR] Error no manejado por interceptor:', error.response?.status)
    return Promise.reject(error)
  },
)

export default api
