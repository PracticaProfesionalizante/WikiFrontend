<template>
  <header :class="['fixed top-0 right-0 z-[999] h-16 flex items-center justify-between transition-all duration-300 px-6 border-b shadow bg-white/80 backdrop-blur dark:bg-slate-900/80 dark:border-slate-700', sidebarExpanded ? 'left-[280px]' : 'left-20']">
    <!-- Logo izquierdo -->
    <div class="flex items-center">
      <img
        src="@/assets/images/logos/LOGOSOCIALLEARNING.png"
        alt="Social Learning Logo"
        class="h-11 w-auto transition hover:-translate-y-0.5 hover:scale-[1.02]"
      />
    </div>

    <!-- Menú de perfil derecho -->
    <div class="flex items-center gap-3">
      <!-- Botón de cambio de tema -->
      <button
        @click="toggleTheme"
        class="grid h-10 w-10 place-items-center rounded-full border bg-slate-100 text-slate-700 shadow hover:-translate-y-0.5 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        :title="isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
      >
        <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'" class="text-[1.1rem]"></i>
      </button>

      <div class="relative" ref="profileMenu">
        <button
          class="flex items-center gap-3 rounded-xl border px-4 py-2 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 dark:border-slate-700 dark:text-slate-100"
          @click="toggleProfileDropdown"
          :class="{ 'bg-slate-100 dark:bg-slate-800': showDropdown }"
        >
          <div class="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-tr from-blue-600 to-blue-700 text-white text-[1.05rem]">
            <i class="fas fa-user"></i>
          </div>
          <span class="max-w-[120px] truncate">{{ user?.username || 'Usuario' }}</span>
          <i class="fas fa-chevron-down transition" :class="{ 'rotate-180': showDropdown }"></i>
        </button>

        <!-- Menú desplegable -->
        <transition name="dropdown">
          <div v-if="showDropdown" class="absolute right-0 top-[calc(100%+8px)] min-w-[180px] overflow-hidden rounded-xl border bg-white/90 backdrop-blur shadow-xl dark:border-slate-700 dark:bg-slate-900/90">
            <div class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800 cursor-pointer" @click="goToSettings">
              <i class="fas fa-cog w-5 text-center"></i>
              <span>Ajustes</span>
            </div>
            <div class="h-px bg-slate-200 dark:bg-slate-700"></div>
            <div class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 cursor-pointer" @click="handleLogout">
              <i class="fas fa-sign-out-alt w-5 text-center"></i>
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
import { useTheme } from '@/composables/useTheme'

// Props
defineProps({
  sidebarExpanded: {
    type: Boolean,
    default: false,
  },
})

// Composables
const authStore = useAuthStore()
const router = useRouter()
const { user } = authStore
const { isDarkMode, toggleTheme } = useTheme()

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
</style>
