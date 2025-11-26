<template>
  <div class="fixed inset-y-0 left-0 z-[1000] transition-all duration-300" :class="{ 'mobile-open': isMobileOpen }">
    <!-- SidebarBreadcrumb se importa y usa aquí -->
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
      <SidebarBreadcrumb
        :show-breadcrumb="showBreadcrumbNativation && isExpanded"
        :icon="currentMenu.itemSelected?.icon"
        :name="currentMenu.itemSelected?.name"
        @go-back="goBack"
      />

      <SidebarItems
        :item-list="currentMenu.itemsToShow"
        :item-selected="currentMenu.itemSelected"
        :is-expanded="isExpanded"
        @select-item="selectSubmenu"
      />

      <SidebarConfigMenus
        :show="authStore.hasRole('ROLE_SUPER_USER')"
        :is-expanded="isExpanded"
        :is-selected="route.path === '/gestion-menus'"
        @navigate-to-menu-manager="navigateToMenuManager"
      />

    </nav>

    <div v-if="isMobile && isMobileOpen" class="fixed inset-0 z-[999] bg-black/50 md:hidden" @click="closeMobile"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { documentsStore } from '@/stores/documentsStore'
import SidebarBreadcrumb from '@/components/sidebar/SidebarBreadcrumb.vue'
import SidebarItems from '@/components/sidebar/SidebarItems.vue'
import SidebarConfigMenus from '@/components/sidebar/SidebarConfigMenus.vue'

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
  selectSubmenu(item)
}

const selectSubmenu = (childSelected) => {

  if(!childSelected) {
    updateActiveState(null, menus.value)
    return
  }

  updateActiveState(childSelected, childSelected.children)

  if(childSelected.path.includes('/documentacion')) {
    documentStore.setPathAndType(childSelected.name, childSelected.path, childSelected.view)
    router.push('/admin/content');
  } else {
    router.push(childSelected.path);
  }

  if (!childSelected.children && isMobile.value) closeMobile()
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
