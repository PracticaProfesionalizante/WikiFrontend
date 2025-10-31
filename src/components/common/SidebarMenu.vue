<template>
  <div class="fixed inset-y-0 left-0 z-[1000] transition-all duration-300" :class="{ 'mobile-open': isMobileOpen }">
    <nav
      class="flex h-screen flex-col overflow-hidden border-r bg-white/90 backdrop-blur shadow-xl dark:border-slate-700 dark:bg-slate-900/90 transform"
      :class="[
        isMobile
          ? (isMobileOpen ? 'pointer-events-auto translate-x-0 fixed left-0 w-[280px] z-[1001]' : 'pointer-events-none -translate-x-full w-0')
          : (isExpanded ? 'w-[280px]' : 'w-20'),
        'transition-all duration-300'
      ]"
      @mouseenter="expandMenu"
      @mouseleave="collapseMenu"
    >
      <div class="flex h-16 items-center border-b bg-white/80 px-4 dark:border-slate-700 dark:bg-slate-900/80">
        <div class="flex items-center gap-3">
          <i class="menu-logo fas fa-school text-2xl text-blue-600 min-w-12 grid place-items-center"></i>
          <span class="font-bold text-slate-900 dark:text-slate-100 transition-all" v-show="isExpanded">Portal Wiki</span>
        </div>
      </div>

      <!-- Breadcrumb de navegación -->
      <div v-if="currentView !== 'main' && isExpanded" class="border-b bg-blue-50/30 px-4 py-3 dark:border-slate-700 dark:bg-blue-900/10">
        <div class="flex items-center gap-2 text-[0.85rem]">
          <span class="flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-slate-600 hover:bg-blue-100/50 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-blue-900/20" @click="goBackToMain">
            <i class="fas fa-arrow-left"></i>
            <span>Volver</span>
          </span>
          <i class="fas fa-chevron-right text-[0.75rem] text-slate-400"></i>
          <span class="flex items-center gap-1 rounded px-2 py-1 font-semibold text-blue-600 dark:text-blue-400">
            <i :class="['fas fas', currentParentMenu?.icon]"></i>
            <span>{{ currentParentMenu?.text }}</span>
          </span>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto py-2">
        <!-- Vista principal del menú -->
        <template v-if="currentView === 'main'">
          <div v-for="item in menuItems" :key="item.id" class="px-0">
            <div
              class="relative my-1 flex h-12 cursor-pointer items-center rounded-lg px-4 text-slate-500 transition hover:-translate-y-0.5 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800"
              :class="{
                'bg-gradient-to-tr from-blue-600 to-blue-700 text-white shadow': activeMenuId === item.id && !item.submenu,
              }"
              @click="selectItem(item)"
            >
              <div class="grid min-w-12 place-items-center text-[1.25rem]">
                <i :class="['fas fas', item.icon]"></i>
              </div>
              <span
              :class="['flex-1 truncate font-medium transition', isExpanded ? 'ml-2' : 'ml-0']"
              v-show="isExpanded"
            >{{ item.text }}</span>
              <div class="flex items-center gap-1 transition" v-show="isExpanded">
                <i v-if="item.submenu && item.submenu.length > 0" class="fas fa-chevron-right text-sm"></i>
                <i v-else-if="item.children && item.children.length > 0" class="fas fa-chevron-right text-sm"></i>
              </div>
            </div>
          </div>
        </template>

        <!-- Vista de submenús -->
        <template v-else-if="currentView === 'submenu'">
          <div v-for="submenu in currentSubmenus" :key="submenu.id" class="px-0">
            <div
              class="relative my-1 flex h-12 cursor-pointer items-center rounded-lg px-4 text-slate-500 transition hover:-translate-y-0.5 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800"
              :class="{ 'bg-gradient-to-tr from-blue-600 to-blue-700 text-white shadow': activeSubmenuId === submenu.id && !submenu.submenu }"
              @click="selectSubmenu(submenu)"
            >
              <div class="grid min-w-12 place-items-center text-[1.25rem]">
                <i :class="['fas fas', submenu.icon || 'fas fa-circle']"></i>
              </div>
              <span :class="['flex-1 truncate font-medium', isExpanded ? 'ml-2' : 'ml-0']" v-show="isExpanded">{{ submenu.text }}</span>
              <div class="flex items-center gap-1" v-show="isExpanded">
                <i v-if="submenu.submenu && submenu.submenu.length > 0" class="fas fa-chevron-right text-sm"></i>
                <i v-else-if="submenu.children && submenu.children.length > 0" class="fas fa-chevron-right text-sm"></i>
              </div>
            </div>
          </div>
        </template>

        <!-- Vista de documentación (mantener existente) -->
        <template v-else-if="currentView === 'documentation'">
          <div class="px-0">
            <div class="my-1 flex h-12 cursor-pointer items-center rounded-lg px-4 text-slate-500 transition hover:-translate-y-0.5 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800" @click="goBackToMain">
              <div class="grid min-w-12 place-items-center text-[1.25rem]">
                <i class="fas fa-arrow-left"></i>
              </div>
              <span :class="['flex-1 truncate font-medium', isExpanded ? 'ml-2' : 'ml-0']" v-show="isExpanded">Volver</span>
            </div>
          </div>

          <div class="px-0 py-2" v-show="isExpanded">
            <span class="px-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Documentación</span>
          </div>

          <div v-for="item in documentationItems" :key="item.id" class="px-0">
            <div
              class="relative my-1 flex h-10 cursor-pointer items-center rounded-lg px-4 text-slate-500 transition hover:-translate-y-0.5 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800"
              :class="{ 'bg-gradient-to-tr from-blue-600 to-blue-700 text-white shadow': activeDocumentationId === item.id }"
              @click="selectDocumentationItem(item)"
            >
              <div class="grid min-w-12 place-items-center text-[1rem]">
                <i class="fas fa-circle"></i>
              </div>
              <span :class="['flex-1 truncate font-medium', isExpanded ? 'ml-2' : 'ml-0']" v-show="isExpanded">{{ item.text }}</span>
            </div>
          </div>
        </template>
      </div>

      <!-- Sección de administración (solo para SuperAdmin) -->
      <div v-if="authStore.hasRole('ROLE_SUPER_USER')" class="mt-auto py-2">
        <div class="mx-4 my-2 h-px scale-x-100 opacity-100 bg-slate-200 dark:bg-slate-700" v-show="isExpanded"></div>
        <div class="px-0">
          <div
            class="relative my-1 flex h-10 cursor-pointer items-center rounded-lg border border-blue-200/60 bg-blue-50/50 px-4 text-slate-600 transition hover:border-blue-300 hover:bg-blue-100/60 dark:border-blue-900/30 dark:bg-blue-900/10 dark:text-slate-300"
            :class="{ 'bg-gradient-to-tr from-blue-600 to-blue-700 text-white shadow border-blue-600': route.path === '/gestion-menus' }"
            @click="navigateToMenuManager"
          >
            <div class="grid min-w-12 place-items-center text-[1rem]">
              <i class="fas fa-edit"></i>
            </div>
            <span :class="['flex-1 truncate font-medium', isExpanded ? 'ml-2' : 'ml-0']" v-show="isExpanded">Editar</span>
          </div>
        </div>
      </div>
    </nav>

    <div v-if="isMobile && isMobileOpen" class="fixed inset-0 z-[999] bg-black/50 md:hidden" @click="closeMobile"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const emit = defineEmits(['sidebar-toggle'])

const isExpanded = ref(false)
const isMobile = ref(false)
const isMobileOpen = ref(false)
const currentView = ref('main')

// Usar menús dinámicos del store en lugar de hardcodeados
const menuItems = computed(() => {
  if (!authStore.menus || authStore.menus.length === 0) {
    return []
  }
  const transformMenu = (menu) => ({
    id: menu.id,
    icon: menu.icon || 'fas fa-circle',
    text: menu.name,
    active: false,
    route: menu.path,
    submenu: menu.children && menu.children.length > 0 ? menu.children.map((child) => transformMenu(child)) : null,
    showSubmenu: false,
    children: menu.children || [],
  })
  return authStore.menus.map((menu) => transformMenu(menu))
})

const documentationItems = ref([
  { id: 21, text: 'Institutos', route: '/institutos', active: false },
  { id: 22, text: 'Status Page', route: '/status-page', active: false },
  { id: 23, text: 'Reglas de Negocio', route: '/reglas-negocio', active: false },
  { id: 24, text: 'Gestión de Incidencias', route: '/gestion-de-incidencias', active: false },
  { id: 25, text: 'Stack Tecnologico', route: '/stack-tecnologico', active: false },
])

const expandMenu = () => {
  if (!isMobile.value) {
    isExpanded.value = true
    emit('sidebar-toggle', true)
  }
}

const collapseMenu = () => {
  if (!isMobile.value) {
    isExpanded.value = false
    emit('sidebar-toggle', false)
  }
}

const syncBodyScroll = () => {
  if (typeof document !== 'undefined') {
    document.body.classList.toggle('overflow-hidden', isMobileOpen.value)
  }
}

const emitSidebarState = () => {
  window.dispatchEvent(new CustomEvent('sidebar:state-change', { detail: { open: isMobileOpen.value } }))
}

const toggleMobile = () => {
  isMobileOpen.value = !isMobileOpen.value
  if (isMobile.value) {
    isExpanded.value = true
    emit('sidebar-toggle', false)
  } else {
    emit('sidebar-toggle', isExpanded.value)
  }
  syncBodyScroll()
  emitSidebarState()
}

const closeMobile = () => {
  if (!isMobileOpen.value) return
  isMobileOpen.value = false
  if (isMobile.value) {
    // Mantener expandido para mostrar etiquetas al volver a abrir
    isExpanded.value = true
    emit('sidebar-toggle', false)
  }
  syncBodyScroll()
  emitSidebarState()
}

const goBackToMain = () => {
  currentView.value = 'main'
  currentParentMenu.value = null
  currentSubmenus.value = []
  activeSubmenuId.value = null
}

// Estado reactivo para manejar elementos activos
const activeMenuId = ref(null)
const activeDocumentationId = ref(null)
const activeSubmenuId = ref(null)

// Estado para la vista de submenús
const currentParentMenu = ref(null)
const currentSubmenus = ref([])

const selectItem = (item) => {
  activeMenuId.value = null
  activeDocumentationId.value = null
  activeSubmenuId.value = null

  if (item.submenu && item.submenu.length > 0) {
    currentView.value = 'submenu'
    currentParentMenu.value = item
    currentSubmenus.value = item.submenu
    activeMenuId.value = item.id
    return
  }

  activeMenuId.value = item.id
  if (item.route) {
    router.push(item.route)
    if (isMobile.value) closeMobile()
  }
}

const selectDocumentationItem = (item) => {
  activeDocumentationId.value = item.id
  router.push(item.route)
  if (isMobile.value) closeMobile()
}

const navigateToMenuManager = () => {
  router.push('/gestion-menus')
  if (isMobile.value) closeMobile()
}

const selectSubmenu = (submenu) => {
  if (submenu.submenu && submenu.submenu.length > 0) {
    currentParentMenu.value = submenu
    currentSubmenus.value = submenu.submenu
    activeSubmenuId.value = null
    return
  }
  activeSubmenuId.value = submenu.id
  if (submenu.route) {
    router.push(submenu.route)
  }
  if (isMobile.value) closeMobile()
}

const checkMobile = () => {
  const mobile = window.innerWidth < 1024
  if (mobile !== isMobile.value) {
    isMobile.value = mobile
    if (isMobile.value) {
      isExpanded.value = true
      emit('sidebar-toggle', false)
    } else {
      isExpanded.value = false
      emit('sidebar-toggle', isExpanded.value)
    }
  }

  if (!isMobile.value && isMobileOpen.value) {
    isMobileOpen.value = false
    syncBodyScroll()
    emitSidebarState()
  }
}

const updateActiveState = (currentRoute) => {
  activeMenuId.value = null
  activeDocumentationId.value = null
  activeSubmenuId.value = null

  let found = false
  menuItems.value.forEach((item) => {
    if (item.route === currentRoute) {
      activeMenuId.value = item.id
      found = true
      currentView.value = 'main'
      return
    }
    if (item.submenu) {
      item.submenu.forEach((submenu) => {
        if (submenu.route === currentRoute) {
          activeSubmenuId.value = submenu.id
          currentParentMenu.value = item
          currentSubmenus.value = item.submenu
          currentView.value = 'submenu'
          found = true
        }
      })
    }
  })

  if (!found) {
    documentationItems.value.forEach((item) => {
      if (item.route === currentRoute) {
        activeDocumentationId.value = item.id
        activeMenuId.value = 2
        found = true
        currentView.value = 'documentation'
      }
    })
  }
}

watch(() => route.path, (newPath) => { updateActiveState(newPath) }, { immediate: true })

const handleExternalToggle = () => {
  if (isMobile.value) {
    toggleMobile()
  }
}

const handleExternalClose = () => {
  if (isMobile.value) {
    closeMobile()
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  window.addEventListener('sidebar:toggle', handleExternalToggle)
  window.addEventListener('sidebar:close', handleExternalClose)
  updateActiveState(route.path)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('sidebar:toggle', handleExternalToggle)
  window.removeEventListener('sidebar:close', handleExternalClose)
})
</script>

<style scoped>
</style>
