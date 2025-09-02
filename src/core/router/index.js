import { createRouter, createWebHistory } from 'vue-router'
import InicioProyecto from '@modules/home/views/HomeProject.vue'

const routes = [
  {
    path: '/',
    name: 'HomeProject',
    component: InicioProyecto
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router