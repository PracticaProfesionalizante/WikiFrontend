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
          <i class="mdi mdi-school menu-logo"></i>
          <span class="logo-text">Portal Wiki</span>
        </div>
      </div>
      
      <div class="menu-items">
        <template v-if="currentView === 'main'">
          <div v-for="item in menuItems" :key="item.id" class="menu-item">
            <div 
              class="item-content" 
              :class="{ 'active': item.active }"
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
              :class="{ 'active': item.active }"
              @click="selectDocumentationItem(item)"
            >
              <i class="mdi mdi-circle-small item-icon"></i>
              <span class="item-text">{{ item.text }}</span>
            </div>
          </div>
        </template>
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
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const emit = defineEmits(['sidebar-toggle'])

const isExpanded = ref(false)
const isMobile = ref(false)
const isMobileOpen = ref(false)
const currentView = ref('main')

const menuItems = ref([
  {
    id: 1,
    icon: 'mdi mdi-view-dashboard',
    text: 'Inicio',
    active: true,
    route: '/dashboard'
  },
  {
    id: 2,
    icon: 'mdi mdi-note-multiple-outline',
    text: 'Documentación',
    active: false,
    submenu: true // Se cambió a 'true' para que se renderice el ícono de flecha
  },
  {
    id: 3,
    icon: 'mdi mdi-note-plus',
    text: 'Nuevas implementaciones',
    active: false,
    route: '/nuevas-implementaciones'
  },
  {
    id: 4,
    icon: 'mdi mdi-calendar-month',
    text: 'Calendario Académico',
    active: false,
    route: '/calendario-academico'
  },
  {
    id: 5,
    icon: 'mdi mdi-lead-pencil',
    text: 'ABM de Usuarios',
    active: false,
    route: '/abm-usuarios'
  },
  {
    id: 6,
    icon: 'mdi mdi-cog',
    text: 'Configuración',
    active: false,
    route: '/configuracion'
  },
  {
    id: 7,
    icon: 'mdi mdi-help-circle',
    text: 'Ayuda',
    active: false,
    route: '/ayuda'
  }
])

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
    menuItems.value.forEach(item => {
      if (item.submenu) {
        item.showSubmenu = false
      }
    });
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

const selectItem = (item) => {
  // Desactiva todos los elementos principales y los submenús
  menuItems.value.forEach(menuItem => {
    menuItem.active = false;
    if (menuItem.submenu) {
      menuItem.showSubmenu = false;
    }
  });
  documentationItems.value.forEach(docItem => docItem.active = false);

  if (item.id === 2) {
    item.active = true;
    currentView.value = 'documentation';
    return;
  }
  
  item.active = true;
  
  if (item.route) {
    router.push(item.route);
    if (isMobile.value) {
      isMobileOpen.value = false;
    }
  }
}

const selectDocumentationItem = (item) => {
  documentationItems.value.forEach(docItem => docItem.active = false);
  item.active = true;
  if (isMobile.value) {
    isMobileOpen.value = false;
  }
  router.push(item.route);
}

const selectSubmenu = (submenu, parentItem) => {
  // Lógica para submenús que se despliegan (si los hay)
  if (submenu.submenu) {
    submenu.showSubmenu = !submenu.showSubmenu;
    return;
  }
  
  menuItems.value.forEach(menuItem => {
    menuItem.active = false;
    if (menuItem.submenu) {
      menuItem.submenu.forEach(sub => sub.active = false);
    }
  });
  submenu.active = true;
  parentItem.active = true;
  
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
  // Primero, desactivar todos los estados activos
  menuItems.value.forEach(item => {
    item.active = false;
    if (item.submenu) {
      if (Array.isArray(item.submenu)) {
        item.submenu.forEach(sub => {
          sub.active = false;
          if (sub.submenu) {
            sub.submenu.forEach(nested => nested.active = false);
          }
        });
      }
    }
  });
  documentationItems.value.forEach(docItem => docItem.active = false);

  // Luego, activar el estado correcto
  let found = false;
  menuItems.value.forEach(item => {
    if (item.route === currentRoute) {
      item.active = true;
      found = true;
      // Asegurarse de que el menú principal está visible
      currentView.value = 'main';
    }
  });

  if (!found) {
    documentationItems.value.forEach(item => {
      if (item.route === currentRoute) {
        item.active = true;
        found = true;
        // Si se encuentra una ruta de documentación, mostrar el menú de documentación
        currentView.value = 'documentation';
        // Activar el ítem principal de documentación
        const docMainItem = menuItems.value.find(item => item.id === 2);
        if (docMainItem) {
          docMainItem.active = true;
        }
      }
    });
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
  padding: 0 1rem;
  border-bottom: 1px solid var(--border-color);
  height: 70px;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(29, 78, 216, 0.05));
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

.submenu-item::before {
  content: '';
  position: absolute;
  left: -1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  background: var(--text-muted);
  border-radius: 50%;
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
  background: var(--accent-color);
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
</style>