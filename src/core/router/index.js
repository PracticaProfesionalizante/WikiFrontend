import { createRouter, createWebHistory } from 'vue-router'
import { requireAuth, requireGuest } from '@/middleware/auth'
import { useAuthStore } from '@/stores/auth'

// Importar vistas (las crearemos después)
import LoginView from '@/views/auth/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import SettingsView from '@/views/SettingsView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    beforeEnter: (to, from, next) => {
      const authStore = useAuthStore()
      if (authStore.isAuthenticated) {
        next({ name: 'Dashboard' })
      } else {
        next({ name: 'Login' })
      }
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    beforeEnter: requireGuest, // Solo usuarios NO logueados
    meta: {
      title: 'Iniciar Sesión',
      requiresAuth: false,
    },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    beforeEnter: requireAuth, // Solo usuarios autenticados
    meta: {
      title: 'Dashboard',
      requiresAuth: true,
    },
  },
  {
    path: '/configuracion',
    name: 'Settings',
    component: SettingsView,
    beforeEnter: requireAuth,
    meta: {
      title: 'Configuración',
      requiresAuth: true,
    },
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/AdminView.vue'), // Lazy loading
    beforeEnter: requireAuth,
    meta: {
      title: 'Administración',
      requiresAuth: true,
      roles: ['SuperUser'], // Por el momento solo SuperUser, en el caso que quiera mas roles como por ejemplo Admin, lo añado aquí -> roles: ['SuperUser', 'Admin']
    },
  },
  {
    path: '/gestion-menus',
    name: 'MenuManager',
    component: () => import('@/views/MenuManagerView.vue'), // Lazy loading
    beforeEnter: requireAuth,
    meta: {
      title: 'Gestión de Menús',
      requiresAuth: true,
      roles: ['ROLE_SUPER_USER'], // Solo usuarios con rol ROLE_SUPER_USER
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/login',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Guard global para inicializar autenticación
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Inicializar autenticación si hay tokens pero no hay usuario
  if (authStore.accessToken && !authStore.user) {
    try {
      await authStore.initializeAuth()
    } catch (error) {
      // Si falla la inicialización, limpiar tokens
      authStore.clearAuth()
    }
  }

  // Verificar roles específicos si la ruta los requiere
  if (to.meta.roles && authStore.isAuthenticated) {
    const hasRequiredRole = to.meta.roles.some((role) => {
      const hasRole = authStore.hasRole(role)
      return hasRole
    })

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
