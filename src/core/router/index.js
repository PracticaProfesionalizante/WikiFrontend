import { createRouter, createWebHistory } from 'vue-router'
import { requireAuth, requireGuest } from '@/middleware/auth'
import { useAuthStore } from '@/stores/auth'
// Vistas de documentación
import InstitutosView from '@/views/InstitutosView.vue'
import StatusPageView from '@/views/StatusPageView.vue'

// Vistas de reglas de negocio
import ReglasView from '@/views/ReglasView.vue'
import ObsidianView from '@/views/ObsidianView.vue'
import DiagramaFlujoView from '@/views/DiagramaFlujoView.vue'
import MapeoProcesosView from '@/views/MapeoProcesosView.vue'

// Vistas adicionales
import NuevasImplementacionesView from '@/views/NuevasImplementacionesView.vue'
import CalendarioAcademicoView from '@/views/CalendarioAcademicoView.vue'
import AbmUsuariosView from '@/views/AbmUsuariosView.vue'
import AyudaView from '@/views/AyudaView.vue'

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
    }
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
    path: '/configuracion',
    name: 'Settings',
    component: SettingsView,
    beforeEnter: requireAuth,
    meta: {
      title: 'Configuración',
      requiresAuth: true
    }
  },
  // Rutas de documentación
  {
    path: '/institutos',
    name: 'Institutos',
    component: InstitutosView,
    beforeEnter: requireAuth,
    meta: {
      title: 'INSTITUTOS',
      requiresAuth: true
    }
  },
  {
    path: '/status-page',
    name: 'StatusPage',
    component: StatusPageView,
    beforeEnter: requireAuth,
    meta: {
      title: 'Status Page',
      requiresAuth: true
    }
  },
  // Rutas de reglas de negocio
  {
    path: '/reglas',
    name: 'Reglas',
    component: ReglasView,
    beforeEnter: requireAuth,
    meta: {
      title: 'Reglas de Negocio',
      requiresAuth: true
    }
  },
  {
    path: '/obsidian',
    name: 'Obsidian',
    component: ObsidianView,
    beforeEnter: requireAuth,
    meta: {
      title: 'Obsidian',
      requiresAuth: true
    }
  },
  {
    path: '/diagrama-flujo',
    name: 'DiagramaFlujo',
    component: DiagramaFlujoView,
    beforeEnter: requireAuth,
    meta: {
      title: 'Diagrama de Flujo',
      requiresAuth: true
    }
  },
  {
    path: '/mapeo-procesos',
    name: 'MapeoProcesos',
    component: MapeoProcesosView,
    beforeEnter: requireAuth,
    meta: {
      title: 'Mapeo de Procesos',
      requiresAuth: true
    }
  },
  // Rutas adicionales
  {
    path: '/nuevas-implementaciones',
    name: 'NuevasImplementaciones',
    component: NuevasImplementacionesView,
    beforeEnter: requireAuth,
    meta: {
      title: 'Nuevas Implementaciones',
      requiresAuth: true
    }
  },
  {
    path: '/calendario-academico',
    name: 'CalendarioAcademico',
    component: CalendarioAcademicoView,
    beforeEnter: requireAuth,
    meta: {
      title: 'Calendario Académico',
      requiresAuth: true
    }
  },
  {
    path: '/abm-usuarios',
    name: 'AbmUsuarios',
    component: AbmUsuariosView,
    beforeEnter: requireAuth,
    meta: {
      title: 'ABM de Usuarios',
      requiresAuth: true,
      roles: ['SuperUser'] // Solo SuperUser puede acceder
    }
  },
  {
    path: '/ayuda',
    name: 'Ayuda',
    component: AyudaView,
    beforeEnter: requireAuth,
    meta: {
      title: 'Ayuda',
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
    redirect: '/login'
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
      // Si falla la inicialización, limpiar tokens
      authStore.clearAuth()
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