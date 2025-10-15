import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './core/router'
import vuetify from './core/plugins/vuetify'
import './core/plugins/webfontloader'
import './styles/themes.css'
import '@mdi/font/css/materialdesignicons.css'

// Importar el store de autenticación
import { useAuthStore } from './stores/auth'

// Importar directiva v-can
import vCan from './core/directives/can'

// Crear instancia de Pinia
const pinia = createPinia()

// Crear la aplicación
const app = createApp(App)

// Registrar plugins en orden correcto
app.use(pinia) // Pinia PRIMERO (para que los stores estén disponibles)
app.use(router) // Router SEGUNDO
app.use(vuetify) // Vuetify TERCERO

// Registrar directivas globales
app.directive('can', vCan)

// Función para inicializar la autenticación
const initializeAuth = async () => {
  const authStore = useAuthStore()

  // Primero limpiar tokens expirados del localStorage
  authStore.clearExpiredTokens()

  // Solo intentar inicializar si hay un token guardado
  if (authStore.accessToken) {
    try {
      await authStore.initializeAuth()
    } catch (error) {
      // Si falla la inicialización, limpiar tokens inválidos
      authStore.logout()
    }
  }
}

// Inicializar la aplicación
const startApp = async () => {
  try {
    // Primero montar la aplicación
    app.mount('#app')

    // Luego inicializar autenticación
    await initializeAuth()
  } catch (error) {
    // Error al inicializar la aplicación
  }
}

// Iniciar la aplicación
startApp()
