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
      <div v-if="showBreadcrumbNativation && isExpanded" class="border-b bg-blue-50/30 px-4 py-3 dark:border-slate-700 dark:bg-blue-900/10">
        <div class="flex items-center gap-2 text-[0.85rem]">
          <span @click="goBack" class="flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-slate-600 hover:bg-blue-100/50 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-blue-900/20" >
            <i class="fas fa-arrow-left"></i>
            <span>Volver</span>
          </span>
          <i class="fas fa-chevron-right text-[0.75rem] text-slate-400"></i>
          <span class="flex items-center gap-1 rounded px-2 py-1 font-semibold text-blue-600 dark:text-blue-400">
            <i :class="['fas fas', currentMenu.itemSelected?.icon]"></i>
            <span>{{ currentMenu.itemSelected?.name }}</span>
          </span>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto py-2">
        <!-- Vista de submenús -->
          <div v-for="child in currentMenu.itemsToShow" :key="child.id" class="px-0">
            <div
              class="relative my-1 flex h-12 cursor-pointer items-center rounded-lg px-4 text-slate-500 transition hover:-translate-y-0.5 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800"
              :class="{ 'bg-gradient-to-tr from-blue-600 to-blue-700 text-white shadow': currentMenu.itemSelected?.id === child.id && !child.children }"
              @click="selectSubmenu(child)"
            >
              <div class="grid min-w-12 place-items-center text-[1.25rem]">
                <i :class="['fas fas', child.icon || 'fas fa-circle']"></i>
              </div>
              <span :class="['flex-1 truncate font-medium', isExpanded ? 'ml-2' : 'ml-0']" v-show="isExpanded">{{ child.name }}</span>
              <div class="flex items-center gap-1" v-show="isExpanded">
                <i v-if="child.children && child.children.length > 0" class="fas fa-chevron-right text-sm"></i>
              </div>
            </div>
          </div>

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
import { ref, onMounted, onUnmounted, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { documentsStore } from '@/stores/documentsStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const documentStore = documentsStore()

const emit = defineEmits(['sidebar-toggle'])

const isExpanded = ref(false)
const isMobile = ref(false)
const isMobileOpen = ref(false)

// Usar menús dinámicos del store en lugar de hardcodeados
const menus = computed(() => authStore.menus)

const currentMenu = reactive({ itemSelected: null, itemsToShow: []})

const showBreadcrumbNativation = computed(() => {
  return currentMenu.itemSelected != null && (
    currentMenu.itemSelected?.children != null && currentMenu.itemSelected?.parentId == null ||
    currentMenu.itemSelected?.children == null && currentMenu.itemSelected?.parentId != null ||
    currentMenu.itemSelected?.children != null && currentMenu.itemSelected?.parentId != null
  )
})

const updateActiveState = ( itemSelected, children ) => {
  currentMenu.itemSelected = itemSelected;
  if (children && children.length > 0) {
    currentMenu.itemsToShow = children;
  }
};

const findItemParent = (childId, menuList = menus.value) => {
  for (const menu of menuList) {
    if (menu.children && menu.children.some(child => child.id === childId)) {
      return menu;
    }

    if (menu.children && menu.children.length > 0) {
      const foundParent = findItemParent(childId, menu.children);

      if (foundParent) {
        return foundParent;
      }
    }
  }
  return null;
}

const goBack = () => {
  const item = findItemParent(currentMenu.itemSelected.id, menus.value);
  if (item) updateActiveState(item, item.children)
  else updateActiveState(null, menus.value)
}


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

const navigateToMenuManager = () => {
  router.push('/gestion-menus')
  if (isMobile.value) closeMobile()
}

const selectSubmenu = (childSelected) => {

  updateActiveState(childSelected, childSelected.children)

  if (childSelected.children.length > 0) {
    router.push(childSelected.path);
  } else {
    documentStore.setPathAndType(childSelected.name, childSelected.path, childSelected.view)
    router.push('/admin/content');
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
  updateActiveState(null, menus.value)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('sidebar:toggle', handleExternalToggle)
  window.removeEventListener('sidebar:close', handleExternalClose)
})
</script>

<style scoped>
</style>
