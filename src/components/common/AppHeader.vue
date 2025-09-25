<template>
  <header 
    class="app-header"
    :class="{ 'sidebar-expanded': sidebarExpanded }"
  >
    <!-- Logo izquierdo -->
    <div class="header-left">
      <img
        src="@/assets/images/logos/LOGOSOCIALLEARNING.png"
        alt="Social Learning Logo"
        class="header-logo"
      />
    </div>

    <!-- Menú de perfil derecho -->
    <div class="header-right">
      <div class="profile-menu" ref="profileMenu">
        <button 
          class="profile-button"
          @click="toggleProfileDropdown"
          :class="{ 'active': showDropdown }"
        >
          <div class="profile-avatar">
            <i class="mdi mdi-account"></i>
          </div>
          <span class="profile-name">{{ user?.username || 'Usuario' }}</span>
          <i class="mdi mdi-chevron-down dropdown-arrow" :class="{ 'rotated': showDropdown }"></i>
        </button>

        <!-- Menú desplegable -->
        <transition name="dropdown">
          <div v-if="showDropdown" class="dropdown-menu">
            <div class="dropdown-item" @click="goToSettings">
              <i class="mdi mdi-cog"></i>
              <span>Ajustes</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item logout" @click="handleLogout">
              <i class="mdi mdi-logout"></i>
              <span>Cerrar sesión</span>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

// Props
defineProps({
  sidebarExpanded: {
    type: Boolean,
    default: false
  }
})

// Composables
const authStore = useAuthStore()
const router = useRouter()
const { user } = authStore

// Estado reactivo
const showDropdown = ref(false)
const profileMenu = ref(null)

// Métodos
const toggleProfileDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const closeDropdown = () => {
  showDropdown.value = false
}

const goToSettings = () => {
  closeDropdown()
  router.push('/configuracion')
}

const handleLogout = async () => {
  closeDropdown()
  try {
    await authStore.logout()
    router.push('/login')
  } catch {
    // El logout local siempre funciona
  }
}

// Cerrar dropdown al hacer clic fuera
const handleClickOutside = (event) => {
  if (profileMenu.value && !profileMenu.value.contains(event.target)) {
    closeDropdown()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 80px;
  right: 0;
  height: 60px;
  background: var(--bg-primary);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 4px 20px var(--shadow-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  z-index: 999;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.app-header.sidebar-expanded {
  left: 280px;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-logo {
  height: 45px;
  width: auto;
  filter: drop-shadow(0 2px 8px rgba(73, 233, 237, 0.2));
  transition: all 0.3s ease;
}

.header-logo:hover {
  transform: translateY(-1px) scale(1.02);
  filter: drop-shadow(0 4px 12px rgba(73, 233, 237, 0.3));
}

.header-right {
  display: flex;
  align-items: center;
}

.profile-menu {
  position: relative;
}

.profile-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-primary);
  font-weight: 500;
}

.profile-button:hover {
  background: var(--bg-hover);
  border-color: var(--accent-color);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

.profile-button.active {
  background: var(--bg-active);
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.profile-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
}

.profile-name {
  font-size: 0.9rem;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  font-size: 1rem;
  transition: transform 0.3s ease;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 180px;
  background: var(--bg-primary);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 8px 32px var(--shadow-color);
  overflow: hidden;
  z-index: 1000;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  font-weight: 500;
}

.dropdown-item:hover {
  background: var(--bg-hover);
  color: var(--accent-color);
}

.dropdown-item.logout {
  color: #dc2626;
}

.dropdown-item.logout:hover {
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
}

.dropdown-item i {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.dropdown-divider {
  height: 1px;
  background: var(--border-color);
  margin: 0.25rem 0;
}

/* Animaciones del dropdown */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* Responsive */
@media (max-width: 768px) {
  .app-header {
    left: 0;
    padding: 0 1rem;
  }
  
  .app-header.sidebar-expanded {
    left: 0;
  }
  
  .header-logo {
    height: 35px;
  }
  
  .profile-name {
    display: none;
  }
  
  .profile-button {
    padding: 0.5rem;
  }
  
  .dropdown-menu {
    right: -1rem;
    min-width: 160px;
  }
}

@media (max-width: 480px) {
  .app-header {
    padding: 0 0.75rem;
  }
  
  .header-logo {
    height: 30px;
  }
}
</style>