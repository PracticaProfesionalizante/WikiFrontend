import { useAuthStore } from '@/stores/auth'

/**
 * Directiva v-can para control de permisos basado en roles
 * 
 * Uso:
 * v-can="'ROLE_ADMIN'" - Verifica un solo rol
 * v-can="['ROLE_ADMIN', 'ROLE_SUPER_USER']" - Verifica múltiples roles (OR)
 * 
 * El elemento se oculta si el usuario no tiene el rol requerido
 */
export default {
  mounted(el, binding) {
    const authStore = useAuthStore()
    const requiredRoles = Array.isArray(binding.value) ? binding.value : [binding.value]
    
    // Verificar si el usuario tiene al menos uno de los roles requeridos
    const hasPermission = requiredRoles.some(role => authStore.hasRole(role))
    
    if (!hasPermission) {
      // Ocultar el elemento si no tiene permisos
      el.style.display = 'none'
    }
  },
  
  updated(el, binding) {
    const authStore = useAuthStore()
    const requiredRoles = Array.isArray(binding.value) ? binding.value : [binding.value]
    
    const hasPermission = requiredRoles.some(role => authStore.hasRole(role))
    
    if (!hasPermission) {
      el.style.display = 'none'
    } else {
      el.style.display = ''
    }
  }
}
