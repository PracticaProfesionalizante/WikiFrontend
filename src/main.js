import { createApp } from 'vue'
import App from './App.vue'
import router from './core/router'
import vuetify from './core/plugins/vuetify'  
import './core/plugins/webfontloader'        

const app = createApp(App)
app.use(router)
app.use(vuetify)
app.mount('#app')