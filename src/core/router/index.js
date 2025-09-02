import { createRouter, createWebHistory } from 'vue-router'
import { requireAuth, requireGuest } from '@/middleware/auth'
import { useAuthStore } from '@/stores/auth'

// Importar vistas (las crearemos después)
import LoginView from '@/views/auth/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard' // Redirigir al dashboard por defecto
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    beforeEnter: requireGuest, // Solo usuarios NO logueados
    meta: {
      title: 'Iniciar Sesión',
      requiresAuth: false
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    beforeEnter: requireAuth, // Solo usuarios autenticados
    meta: {
      title: 'Dashboard',
      requiresAuth: true
    }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/AdminView.vue'), // Lazy loading
    beforeEnter: requireAuth,
    meta: {
      title: 'Administración',
      requiresAuth: true,
      roles: ['SuperUser'] // Por el momento solo SuperUser, en el caso que quiera mas roles como por ejemplo Admin, lo añado aquí -> roles: ['SuperUser', 'Admin']
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Guard global para inicializar autenticación
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Inicializar autenticación si hay tokens pero no hay usuario
  if (authStore.accessToken && !authStore.user) {
    try {
      await authStore.initializeAuth()
    } catch (error) {
      console.warn('Error al inicializar autenticación:', error)
    }
  }
  
  // Verificar roles específicos si la ruta los requiere
  if (to.meta.roles && authStore.isAuthenticated) {
    const hasRequiredRole = to.meta.roles.some(role => authStore.hasRole(role))
    if (!hasRequiredRole) {
      next({ name: 'Dashboard' })
      return
    }
  }
  
  // Actualizar título de la página
  if (to.meta.title) {
    document.title = `${to.meta.title} - WikiFrontend`
  }
  
  next()
})

export default router