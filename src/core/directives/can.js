import { useAuthStore } from '@/stores/auth'

/**
 * Directiva v-can para control de permisos basado en roles
 *
 * Uso:
 * v-can="'ROLE_ADMIN'" - Verifica un solo rol
 * v-can="['ROLE_ADMIN', 'ROLE_SUPER_USER']" - Verifica múltiples roles (OR)
 * v-can:admin - Verifica rol ROLE_ADMIN (modo abreviado)
 * v-can:super-user - Verifica rol ROLE_SUPER_USER (modo abreviado)
 *
 * El elemento se oculta si el usuario no tiene el rol requerido
 */
export default {
  mounted(el, binding) {
    checkPermission(el, binding)
  },

  updated(el, binding) {
    checkPermission(el, binding)
  }
}

function checkPermission(el, binding) {
  const authStore = useAuthStore()

  // Determinar los roles requeridos
  let requiredRoles = []

  if (binding.arg) {
    // Modo abreviado: v-can:admin, v-can:super-user
    const roleMap = {
      'admin': 'ROLE_ADMIN',
      'super-user': 'ROLE_SUPER_USER',
      'superuser': 'ROLE_SUPER_USER',
      'collaborator': 'ROLE_COLLABORATOR',
      'user': 'ROLE_USER'
    }

    const role = roleMap[binding.arg.toLowerCase()]
    if (role) {
      requiredRoles = [role]
    } else {
      // Si no está en el mapa, usar el argumento como rol directo
      requiredRoles = [binding.arg.toUpperCase()]
    }
  } else if (binding.value) {
    // Modo normal: v-can="'ROLE_ADMIN'" o v-can="['ROLE_ADMIN', 'ROLE_SUPER_USER']"
    requiredRoles = Array.isArray(binding.value) ? binding.value : [binding.value]
  }

  // Verificar si el usuario tiene al menos uno de los roles requeridos
  const hasPermission = requiredRoles.some(role => authStore.hasRole(role))

  if (!hasPermission) {
    // Ocultar el elemento si no tiene permisos
    el.style.display = 'none'
    el.setAttribute('data-v-can-hidden', 'true')
  } else {
    // Mostrar el elemento si tiene permisos
    el.style.display = ''
    el.removeAttribute('data-v-can-hidden')
  }
}
