import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

// Configuración base de Axios
const api = axios.create({
  baseURL: 'http://practicas.teclab.edu.ar', // URL del backend
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Variable para evitar múltiples refresh simultáneos
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
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
  }
)

// Interceptor de RESPONSE - Manejar refresh automático
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    const authStore = useAuthStore()

    // Si el error es 401 y no es un retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Si ya estamos refrescando, agregar a la cola
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Intentar refresh del token
        await authStore.refreshAccessToken()
        processQueue(null, authStore.accessToken)
        
        // Reintentar la petición original
        originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`
        return api(originalRequest)
        
      } catch (refreshError) {
        processQueue(refreshError, null)
        authStore.logout()
        
        // Redirigir al login
        window.location.href = '/login'
        
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api