import { useAuthStore } from '@/stores/auth'

// Guard para rutas que requieren autenticación
export const requireAuth = (to, from, next) => {
  const authStore = useAuthStore()
  
  if (!authStore.isAuthenticated) {
    // Redirigir al login si no está autenticado
    next({
      name: 'Login',
      query: { redirect: to.fullPath } // Guardar la ruta original
    })
  } else {
    next() // Permitir acceso
  }
}

// Guard para rutas que requieren roles específicos
export const requireRole = (roles) => {
  return (to, from, next) => {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      })
      return
    }
    
    // Verificar si el usuario tiene alguno de los roles requeridos
    const hasRequiredRole = roles.some(role => authStore.hasRole(role))
    
    if (!hasRequiredRole) {
      // Redirigir a página de acceso denegado o dashboard
      next({ name: 'Dashboard' })
    } else {
      next()
    }
  }
}

// Guard para rutas que solo pueden acceder usuarios NO autenticados (login, register)
export const requireGuest = (to, from, next) => {
  const authStore = useAuthStore()
  
  if (authStore.isAuthenticated) {
    // Si ya está logueado, redirigir al dashboard
    next({ name: 'Dashboard' })
  } else {
    next()
  }
}

// Guard para verificar permisos específicos
export const requirePermission = (permission) => {
  return (to, from, next) => {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      })
      return
    }
    
    // Verificar si el usuario tiene el permiso específico
    const userPermissions = authStore.user?.permissions || []
    
    if (!userPermissions.includes(permission)) {
      next({ name: 'Dashboard' })
    } else {
      next()
    }
  }
}

export default {
  requireAuth,
  requireRole,
  requireGuest,
  requirePermission
}