import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './core/router'
import vuetify from './core/plugins/vuetify'  
import './core/plugins/webfontloader'

// Importar el store de autenticación
import { useAuthStore } from './stores/auth'

// Crear instancia de Pinia
const pinia = createPinia()

// Crear la aplicación
const app = createApp(App)

// Registrar plugins en orden correcto
app.use(pinia)    // Pinia PRIMERO (para que los stores estén disponibles)
app.use(router)   // Router SEGUNDO
app.use(vuetify)  // Vuetify TERCERO

// Función para inicializar la autenticación
const initializeAuth = async () => {
  const authStore = useAuthStore()
  
  // Solo intentar inicializar si hay un token guardado
  if (authStore.accessToken) {
    try {
      console.log('🔐 Inicializando autenticación...')
      await authStore.initializeAuth()
      console.log('✅ Autenticación inicializada correctamente')
    } catch (error) {
      console.warn('⚠️ Error al inicializar autenticación:', error)
      // Si falla la inicialización, limpiar tokens inválidos
      authStore.logout()
    }
  } else {
    console.log('ℹ️ No hay tokens guardados, usuario no autenticado')
  }
}

// Inicializar la aplicación
const startApp = async () => {
  try {
    // Primero montar la aplicación
    app.mount('#app')
    console.log('🚀 Aplicación montada correctamente')
    
    // Luego inicializar autenticación
    await initializeAuth()
    
  } catch (error) {
    console.error('❌ Error al inicializar la aplicación:', error)
  }
}

// Iniciar la aplicación
startApp()