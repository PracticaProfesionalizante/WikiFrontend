<template>
  <div 
    class="sidebar-container"
    :class="{ 'expanded': isExpanded, 'mobile-open': isMobileOpen }"
  >
    
    <button 
      class="mobile-toggle"
      @click="toggleMobile"
      v-show="isMobile"
    >
      <i class="mdi mdi-menu"></i>
    </button>
    
    <nav 
      class="sidebar-menu"
      @mouseenter="expandMenu"
      @mouseleave="collapseMenu"
    >
      <div class="menu-header">
        <div class="logo-container">
          <i class="menu-logo mdi mdi-school"></i>
          <span class="logo-text" v-show="!isCollapsed">Portal Wiki</span>
        </div>
      </div>
      
      <div class="menu-items">
        <template v-if="currentView === 'main'">
          <div v-for="item in menuItems" :key="item.id" class="menu-item">
            <div 
              class="item-content" 
              :class="{ 'active': activeMenuId === item.id }"
              @click="selectItem(item)"
            >
              <i :class="item.icon" class="item-icon"></i>
              <span class="item-text">{{ item.text }}</span>
              <i v-if="item.submenu" class="mdi mdi-chevron-right submenu-arrow"></i>
            </div>
            
            <div v-if="item.submenu && item.showSubmenu && item.id !== 2" class="submenu">
              <template v-for="sub in item.submenu" :key="sub.id">
                <div 
                  class="submenu-item"
                  :class="{ 'active': sub.active, 'has-submenu': sub.submenu }"
                  @click="selectSubmenu(sub, item)"
                >
                  <i :class="sub.icon || 'mdi mdi-circle-small'" class="submenu-icon"></i>
                  <span class="submenu-text">{{ sub.text }}</span>
                  <i v-if="sub.submenu" class="mdi mdi-chevron-right submenu-arrow-nested"></i>
                </div>
                
                <div v-if="sub.submenu && sub.showSubmenu" class="nested-submenu">
                  <div 
                    v-for="nestedSub in sub.submenu" 
                    :key="nestedSub.id" 
                    class="nested-submenu-item"
                    :class="{ 'active': nestedSub.active }"
                    @click="selectNestedSubmenu(nestedSub, sub, item)"
                  >
                    <span class="nested-submenu-text">{{ nestedSub.text }}</span>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>

        <template v-else-if="currentView === 'documentation'">
          <div 
            class="menu-item"
            @click="goBackToMain"
          >
            <div class="item-content">
              <i class="mdi mdi-arrow-left item-icon"></i>
              <span class="item-text">Volver</span>
            </div>
          </div>

          <div class="menu-section-title">
            <span class="title-text">Documentación</span>
          </div>

          <div v-for="item in documentationItems" :key="item.id" class="menu-item">
            <div 
              class="item-content"
              :class="{ 'active': activeDocumentationId === item.id }"
              @click="selectDocumentationItem(item)"
            >
              <i class="mdi mdi-circle-small item-icon"></i>
              <span class="item-text">{{ item.text }}</span>
            </div>
          </div>
        </template>
      </div>
      
      <!-- Sección de administración (solo para SuperAdmin) -->
       <div v-if="authStore.hasRole('ROLE_SUPER_USER')" class="menu-footer">
        <div class="menu-divider"></div>
        <div class="menu-item admin-item">
          <div 
            class="item-content"
            :class="{ 'active': route.path === '/gestion-menus' }"
            @click="navigateToMenuManager"
          >
            <i class="mdi mdi-pencil-outline item-icon"></i>
            <span class="item-text">Editar</span>
          </div>
        </div>
      </div>
    </nav>
    
    <div 
      v-if="isMobile && isMobileOpen" 
      class="mobile-overlay"
      @click="closeMobile"
    ></div>
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
  // Solo mostrar menús si están disponibles del backend
  if (!authStore.menus || authStore.menus.length === 0) {
    return []
  }
  
  // Transformar menús del backend al formato esperado por el componente
  return authStore.menus.map(menu => ({
    id: menu.id,
    icon: menu.icon || 'mdi mdi-circle-outline',
    text: menu.name,
    active: false,
    route: menu.path,
    submenu: menu.children && menu.children.length > 0 ? menu.children.map(child => ({
      id: child.id,
      text: child.name,
      route: child.path,
      icon: child.icon,
      active: false
    })) : null,
    showSubmenu: false,
    children: menu.children || []
  }))
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
    // Cerrar todos los submenús cuando se colapsa el menú
    authStore.menus.forEach(menu => {
      const menuItem = menuItems.value.find(item => item.id === menu.id)
      if (menuItem && menuItem.submenu) {
        menuItem.showSubmenu = false
      }
    })
  }
}

const toggleMobile = () => {
  isMobileOpen.value = !isMobileOpen.value
}

const closeMobile = () => {
  isMobileOpen.value = false
}

const goBackToMain = () => {
  currentView.value = 'main'
  updateActiveState(route.path) // Actualiza el estado activo al volver
}

// Estado reactivo para manejar elementos activos
const activeMenuId = ref(null)
const activeDocumentationId = ref(null)

const selectItem = (item) => {
  // Limpiar estados activos
  activeMenuId.value = null
  activeDocumentationId.value = null

  // Manejar submenús especiales (como documentación)
  if (item.submenu && item.id === 2) {
    activeMenuId.value = item.id
    currentView.value = 'documentation'
    return
  }
  
  // Si el item tiene submenús, alternar su visibilidad
  if (item.submenu) {
    item.showSubmenu = !item.showSubmenu
    activeMenuId.value = item.id
    return
  }
  
  activeMenuId.value = item.id
  
  if (item.route) {
    router.push(item.route)
    if (isMobile.value) {
      isMobileOpen.value = false
    }
  }
}

const selectDocumentationItem = (item) => {
  activeDocumentationId.value = item.id
  router.push(item.route)
  if (isMobile.value) {
    closeMobile()
  }
}

const navigateToMenuManager = () => {
  router.push('/gestion-menus')
  if (isMobile.value) {
    closeMobile()
  }
}

const selectSubmenu = (submenu, parentItem) => {
  // Lógica para submenús que se despliegan (si los hay)
  if (submenu.submenu) {
    submenu.showSubmenu = !submenu.showSubmenu
    return
  }
  
  activeMenuId.value = parentItem.id
  
  if (isMobile.value) {
    isMobileOpen.value = false;
  }
  
  if (submenu.route) {
    router.push(submenu.route);
  }
}

const selectNestedSubmenu = (nestedSubmenu, parentSubmenu, grandParentItem) => {
  // Lógica para submenús anidados
  menuItems.value.forEach(menuItem => {
    menuItem.active = false;
    if (menuItem.submenu) {
      menuItem.submenu.forEach(sub => {
        sub.active = false;
        if (sub.submenu) {
          sub.submenu.forEach(nested => nested.active = false);
        }
      });
    }
  });
  nestedSubmenu.active = true;
  parentSubmenu.active = true;
  grandParentItem.active = true;
  
  if (isMobile.value) {
    isMobileOpen.value = false;
  }
  
  if (nestedSubmenu.route) {
    router.push(nestedSubmenu.route);
  }
}

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
  if (!isMobile.value) {
    isMobileOpen.value = false;
  }
}

const updateActiveState = (currentRoute) => {
  // Limpiar estados activos
  activeMenuId.value = null
  activeDocumentationId.value = null

  // Buscar en menús principales
  let found = false
  menuItems.value.forEach(item => {
    if (item.route === currentRoute) {
      activeMenuId.value = item.id
      found = true
      currentView.value = 'main'
    }
  })

  // Si no se encuentra, buscar en documentación
  if (!found) {
    documentationItems.value.forEach(item => {
      if (item.route === currentRoute) {
        activeDocumentationId.value = item.id
        activeMenuId.value = 2 // Activar también el menú principal de documentación
        found = true
        currentView.value = 'documentation'
      }
    })
  }

  // Si no se encuentra en ningún lado, activar dashboard por defecto
  if (!found && currentRoute === '/dashboard') {
    activeMenuId.value = 1
    currentView.value = 'main'
  }
}

watch(() => route.path, (newPath) => {
  updateActiveState(newPath);
}, { immediate: true });

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  updateActiveState(route.path);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>

<style scoped>
/* Las clases de estilo se mantienen igual */
.sidebar-container {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-toggle {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 100000;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 1.25rem;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
  transition: all 0.2s ease;
  display: none;
}

.mobile-toggle:hover {
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
}

.sidebar-menu {
  width: 80px;
  height: 100%;
  background: var(--bg-primary);
  backdrop-filter: blur(20px);
  border-right: 1px solid var(--border-color);
  box-shadow: 0 8px 32px var(--shadow-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-top-right-radius: 0;
  border-bottom-right-radius: 12px;
}

.sidebar-container.expanded .sidebar-menu {
  width: 280px;
}

.menu-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  height: 60px;
  display: flex;
  align-items: center;
  background: var(--sidebar-bg);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.menu-logo {
  font-size: 2rem;
  color: #2563eb;
  min-width: 48px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.sidebar-container.expanded .logo-text {
  opacity: 1;
  transform: translateX(0);
}

.menu-items {
  flex: 1;
  padding: 0.75rem 0;
  overflow-y: auto;
}

.menu-item {
  margin-bottom: 4px;
}

.item-content {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  margin: 0 8px;
  border-radius: 10px;
  height: 48px;
  box-sizing: border-box;
}

.item-content:hover {
  background: var(--bg-hover);
  color: var(--accent-color);
  transform: translateX(2px);
}

.item-content.active {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
  position: relative;
}

.item-icon {
  font-size: 1.5rem;
  min-width: 28px;
  text-align: center;
  transition: all 0.3s ease;
}

.sidebar-container:not(.expanded) .item-content:hover .item-icon {
  transform: scale(1.1);
  color: var(--accent-color);
}

.sidebar-container:not(.expanded) .item-content.active .item-icon {
  transform: scale(1.05);
  filter: drop-shadow(0 2px 4px rgba(255, 255, 255, 0.3));
}

.item-text {
  margin-left: 1rem;
  font-weight: 500;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
  flex: 1;
}

.sidebar-container.expanded .item-text {
  opacity: 1;
  transform: translateX(0);
}

.submenu-arrow {
  font-size: 1rem;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.sidebar-container.expanded .submenu-arrow {
  opacity: 1;
  transform: translateX(0);
}

.submenu {
  margin-left: 1rem;
  margin-right: 0.5rem;
  opacity: 0;
  max-height: 0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.sidebar-container.expanded .submenu {
  opacity: 1;
  max-height: 500px;
}

.submenu-item {
  padding: 10px 16px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 6px;
  margin: 4px 8px 4px 32px;
  position: relative;
  height: 40px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.submenu-icon {
  font-size: 1rem;
  min-width: 20px;
  text-align: center;
  transition: all 0.2s ease;
  position: absolute;
  left: -1rem;
}

.submenu-item:hover .submenu-icon {
  color: var(--accent-color);
}

.submenu-item.active .submenu-icon {
  color: white;
}

.submenu-item::before {
  display: none;
}

.submenu-item:hover {
  background: var(--bg-hover);
  color: var(--accent-color);
  transform: translateX(2px);
}

.submenu-item.active {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
  position: relative;
}

.submenu-item.active::before {
  display: none;
}

.submenu-text {
  font-size: 0.9rem;
  flex: 1;
  line-height: 1.4;
}

.submenu-item.has-submenu {
  justify-content: space-between;
}

.submenu-arrow-nested {
  font-size: 0.8rem;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.sidebar-container.expanded .submenu-arrow-nested {
  opacity: 1;
  transform: translateX(0);
}

.nested-submenu {
  margin-left: 2rem;
  opacity: 0;
  max-height: 0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.sidebar-container.expanded .nested-submenu {
  opacity: 1;
  max-height: 400px;
}

.nested-submenu-item {
  padding: 8px 16px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 4px;
  margin: 4px 8px 4px 48px;
  position: relative;
  font-size: 0.85rem;
  height: 36px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.nested-submenu-item::before {
  content: '';
  position: absolute;
  left: -0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 3px;
  background: var(--text-muted);
  border-radius: 50%;
}

.nested-submenu-item:hover {
  background: var(--bg-hover);
  color: var(--accent-color);
  transform: translateX(2px);
}

.nested-submenu-item.active {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
  position: relative;
}

.nested-submenu-item.active::before {
  background: #2563eb;
}

.nested-submenu-text {
  font-size: 0.85rem;
  flex: 1;
  line-height: 1.4;
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99998;
}

/* NUEVO ESTILO PARA EL TÍTULO DE LA SECCIÓN */
.menu-section-title {
  padding: 1rem 1rem 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
  white-space: nowrap;
}

.sidebar-container.expanded .menu-section-title {
  opacity: 1;
  transform: translateX(0);
}

/* Responsive */
@media (max-width: 768px) {
  .mobile-toggle {
    display: block;
  }
  
  .hover-trigger {
    display: none;
  }
  
  .sidebar-menu {
    width: 0;
    transform: translateX(-100%);
    pointer-events: none;
  }
  
  .sidebar-container.mobile-open .sidebar-menu {
    width: 280px;
    transform: translateX(0);
    pointer-events: auto;
    z-index: 99999;
    position: fixed;
  }
  
  .sidebar-container.mobile-open .logo-text,
  .sidebar-container.mobile-open .item-text,
  .sidebar-container.mobile-open .submenu-arrow {
    opacity: 1;
    transform: translateX(0);
  }
  
  .sidebar-container.mobile-open .submenu {
    opacity: 1;
    max-height: 500px;
  }
  
  .sidebar-container.mobile-open .submenu-arrow-nested {
    opacity: 1;
    transform: translateX(0);
  }
  
  .sidebar-container.mobile-open .nested-submenu {
    opacity: 1;
    max-height: 400px;
  }

  .sidebar-container.mobile-open .menu-section-title {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Scrollbar personalizado */
.menu-items::-webkit-scrollbar {
  width: 4px;
}

.menu-items::-webkit-scrollbar-track {
  background: transparent;
}

.menu-items::-webkit-scrollbar-thumb {
  background: rgba(37, 99, 235, 0.2);
  border-radius: 2px;
}

.menu-items::-webkit-scrollbar-thumb:hover {
  background: rgba(37, 99, 235, 0.4);
}

/* Estilos para la sección de administración */
.menu-footer {
  margin-top: auto;
  padding: 0.5rem 0;
}

.menu-divider {
  height: 1px;
  background: var(--border-color);
  margin: 0.5rem 1rem;
  opacity: 0;
  transform: scaleX(0);
  transition: all 0.3s ease;
}

.sidebar-container.expanded .menu-divider {
  opacity: 1;
  transform: scaleX(1);
}

.admin-item .item-content {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(29, 78, 216, 0.1));
  border: 1px solid rgba(37, 99, 235, 0.2);
}

.admin-item .item-content:hover {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(29, 78, 216, 0.2));
  border-color: rgba(37, 99, 235, 0.4);
}

.admin-item .item-content.active {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  border-color: #2563eb;
}
</style>