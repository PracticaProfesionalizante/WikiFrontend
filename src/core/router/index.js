import { createRouter, createWebHistory } from 'vue-router'
import { requireAuth, requireGuest } from '@/middleware/auth'
import { useAuthStore } from '@/stores/auth'

// Importar vistas estáticas
import LoginView from '@/views/auth/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import SettingsView from '@/views/SettingsView.vue'
import UrlContentCardLayout from '@/layouts/UrlContentCardLayout.vue'

// Importar vistas dinámicas
import FoldersView from '@/views/FoldersView.vue'
import ContentView from '@/views/ContentView.vue'

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
      roles: ['ROLE_SUPER_USER'], // Por el momento solo SuperUser, en el caso que quiera mas roles como por ejemplo Admin, lo añado aquí -> roles: ['ROLE_SUPER_USER', 'ROLE_ADMIN']
    },
  },
  {
    path: '/admin/content',
    name: 'AdminContent',
    component: () => import('@/views/AdminContentView.vue'), // Lazy loading
    beforeEnter: requireAuth,
    meta: {
      title: 'Administración de Contenidos',
      requiresAuth: true,
      roles: ['ROLE_SUPER_USER'],
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
    path: '/gestion-usuarios',
    name: 'UserManagement',
    component: () => import('@/views/UserManagementView.vue'), // Lazy loading
    beforeEnter: requireAuth,
    meta: {
      title: 'Gestión de Usuarios',
      requiresAuth: true,
      roles: ['ROLE_SUPER_USER'], // Solo usuarios con rol ROLE_SUPER_USER
    },
  },
  // {
  //   path: '/document/:id',
  //   name: 'ContentView',
  //   component: () => import('@/views/ContentView.vue'), // Lazy loading
  //   beforeEnter: requireAuth,
  //   meta: {
  //     title: 'Ver Documento',
  //     requiresAuth: true,
  //   },
  // },
  {
    path: '/folders/:pathMatch(.*)*',
    name: 'Folders',
    component: () => import('@/views/FoldersView.vue'), // Lazy loading
    beforeEnter: requireAuth,
    meta: {
      title: 'Navegación',
      requiresAuth: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/login',
  },
  {
    path: '/botonera-view',
    name: 'BotoneraView',
    component: UrlContentCardLayout, // Lazy loading
    beforeEnter: requireAuth,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Función para mapear el valor 'view' del menú al componente Vue
const mapComponent = (viewType) => {
  if (viewType === 'showFolders') {
    return FoldersView // Vista para mostrar las tarjetas de submenús
  }
  // Asumimos que cualquier otra configuración de vista existente (showMarkdown, showURL, showPDF, etc.) usa ContentView
  if (viewType) {
    return ContentView
  }
  // Valor por defecto si no hay vista o tipo conocido
  return ContentView
}

/**
 * Función recursiva para agregar rutas dinámicas al router a partir de la estructura de menús.
 * @param {Array} menuItems
 */
export function addDynamicRoutes(menuItems) {
  if (!menuItems || menuItems.length === 0) return

  menuItems.forEach((menuItem) => {
    // Solo agrega la ruta si tiene una ruta definida
    if (menuItem.path) {
      const componentToUse = mapComponent(menuItem.view)

      const newRoute = {
        path: menuItem.path,
        // Genera un nombre de ruta único basado en el path
        name: menuItem.path.substring(1).replace(/\//g, '-'),
        component: componentToUse,
        meta: {
          requiresAuth: true,
          name: menuItem.name, // Usado para el título dinámico en FoldersView y ContentView
          // roles: menuItem.roles,
          viewType: menuItem.view,
          contentId: menuItem.contentId || null, // Asegura que el ID del contenido se guarde en la meta
        },
      }

      // Aseguramos que la ruta no haya sido agregada antes para evitar errores en HMR (desarrollo)
      // Esto es importante si el menú se actualiza sin recargar la página
      if (!router.hasRoute(newRoute.name)) {
        router.addRoute(newRoute)
      }
    }

    // Procesar hijos recursivamente
    if (menuItem.children && menuItem.children.length > 0) {
      addDynamicRoutes(menuItem.children)
    }
  })
}

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
