import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './core/router'
import vuetify from './core/plugins/vuetify'  
import './core/plugins/webfontloader'

// Crear instancia de Pinia
const pinia = createPinia()

const app = createApp(App)
app.use(pinia)    // Agregue Pinia ANTES del router
app.use(router)
app.use(vuetify)
app.mount('#app')