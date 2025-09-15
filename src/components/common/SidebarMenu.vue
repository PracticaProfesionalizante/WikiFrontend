<template>
  <div 
    class="sidebar-container"
    :class="{ 'expanded': isExpanded, 'mobile-open': isMobileOpen }"
  >
    
    <!-- Botón hamburguesa para móvil -->
    <button 
      class="mobile-toggle"
      @click="toggleMobile"
      v-show="isMobile"
    >
      <i class="mdi mdi-menu"></i>
    </button>
    
    <!-- Menú lateral -->
    <nav 
      class="sidebar-menu"
      @mouseenter="expandMenu"
      @mouseleave="collapseMenu"
    >
      <div class="menu-header">
        <div class="logo-container">
          <i class="mdi mdi-school menu-logo"></i>
          <span class="logo-text">Wiki Portal</span>
        </div>
      </div>
      
      <div class="menu-items">
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
          
          <!-- Submenú -->
          <div v-if="item.submenu && item.showSubmenu" class="submenu">
            <template v-for="sub in item.submenu" :key="sub.id">
              <div 
                class="submenu-item"
                :class="{ 'active': sub.active, 'has-submenu': sub.submenu }"
                @click="selectSubmenu(sub, item)"
              >
                <span class="submenu-text">{{ sub.text }}</span>
                <i v-if="sub.submenu" class="mdi mdi-chevron-right submenu-arrow-nested"></i>
              </div>
              
              <!-- Submenú anidado (segundo nivel) -->
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
      </div>
    </nav>
    
    <!-- Overlay para móvil -->
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

// Composables
const router = useRouter()
const route = useRoute()

// Emits
const emit = defineEmits(['sidebar-toggle'])

const isExpanded = ref(false)
const isMobile = ref(false)
const isMobileOpen = ref(false)

const menuItems = ref([
  {
    id: 1,
    icon: 'mdi mdi-view-dashboard',
    text: 'Dashboard',
    active: true,
    route: '/dashboard'
  },
  {
    id: 2,
    icon: 'mdi mdi-note-multiple-outline',
    text: 'Documentación',
    active: false,
    showSubmenu: false,
    submenu: [
      { id: 21, text: 'TECLAB', active: false, route: '/teclab' },
      { id: 22, text: 'OMEX', active: false, route: '/omex' },
      { id: 23, text: 'IPP', active: false, route: '/ipp' },
      { id: 24, text: 'Reglas de Negocio', active: false, route: '/reglas-negocio', showSubmenu: false,
        submenu: [
          { id: 241, text: 'Reglas', active: false, route: '/reglas-negocio/reglas' },
          { id: 242, text: 'Obsidián', active: false, route: '/reglas-negocio/obsidian' },
          { id: 243, text: 'Diagrama de flujo', active: false, route: '/reglas-negocio/diagrama-flujo' },
          { id: 244, text: 'Mapeo de procesos', active: false, route: '/reglas-negocio/mapeo-procesos' }
        ]
       },
      { id: 25, text: 'Status Page', active: false, route: '/status-page' }
    ]
  },
  {
    id: 3,
    icon: 'mdi mdi-note-plus',
    text: 'Nuevas implementaciónes',
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
    icon: 'mdi mdi-help-box',
    text: 'Ayuda',
    active: false,
    route: '/ayuda'
  },
  {
    id: 6,
    icon: 'mdi mdi-lead-pencil',
    text: 'ABM de Usuarios',
    active: false,
    route: '/abm-usuarios'
  },
  {
    id: 7,
    icon: 'mdi mdi-cog',
    text: 'Configuración',
    active: false,
    route: '/configuracion'
  }
])

const expandMenu = () => {
  if (!isMobile.value) {
    isExpanded.value = true
    emit('sidebar-toggle', true)
    // Solo expandir submenús que contienen elementos activos
    menuItems.value.forEach(item => {
      if (item.submenu) {
        // Verificar si el item principal está activo
        if (item.active) {
          item.showSubmenu = true
        }
        // Verificar si algún subitem está activo
        const hasActiveSubmenu = item.submenu.some(sub => {
          if (sub.active) return true
          // Verificar submenús anidados
          if (sub.submenu) {
            return sub.submenu.some(nested => nested.active)
          }
          return false
        })
        
        if (hasActiveSubmenu) {
          item.showSubmenu = true
          // Expandir submenús anidados que contienen elementos activos
          item.submenu.forEach(sub => {
            if (sub.submenu && (sub.active || sub.submenu.some(nested => nested.active))) {
              sub.showSubmenu = true
            }
          })
        }
      }
    })
  }
}

const collapseMenu = () => {
  if (!isMobile.value) {
    isExpanded.value = false
    emit('sidebar-toggle', false)
    // Colapsar submenús
    menuItems.value.forEach(item => {
      if (item.submenu) {
        item.showSubmenu = false
        // También colapsar submenús anidados
        item.submenu.forEach(sub => {
          if (sub.submenu) {
            sub.showSubmenu = false
          }
        })
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

const selectItem = (item) => {
  // Desactivar todos los items
  menuItems.value.forEach(menuItem => {
    menuItem.active = false
    if (menuItem.submenu) {
      menuItem.submenu.forEach(sub => sub.active = false)
    }
  })
  
  // Activar el item seleccionado
  item.active = true
  
  // Toggle submenu si existe
  if (item.submenu) {
    item.showSubmenu = !item.showSubmenu
  } else {
    // Solo cerrar el menú móvil si no tiene submenu
    if (isMobile.value) {
      isMobileOpen.value = false
    }
  }
  
  // Navegar si tiene ruta
  if (item.route) {
    router.push(item.route)
  }
}

const selectSubmenu = (submenu, parentItem) => {
  // Si tiene submenú anidado, toggle su visibilidad
  if (submenu.submenu) {
    submenu.showSubmenu = !submenu.showSubmenu
    return
  }
  
  // Desactivar todos
  menuItems.value.forEach(menuItem => {
    menuItem.active = false
    if (menuItem.submenu) {
      menuItem.submenu.forEach(sub => {
        sub.active = false
        if (sub.submenu) {
          sub.submenu.forEach(nested => nested.active = false)
        }
      })
    }
  })
  
  // Activar submenu y parent
  submenu.active = true
  parentItem.active = true
  
  // Cerrar menú móvil al seleccionar elemento final
  if (isMobile.value) {
    isMobileOpen.value = false
  }
  
  // Navegar
  if (submenu.route) {
    router.push(submenu.route)
  }
}

const selectNestedSubmenu = (nestedSubmenu, parentSubmenu, grandParentItem) => {
  // Desactivar todos
  menuItems.value.forEach(menuItem => {
    menuItem.active = false
    if (menuItem.submenu) {
      menuItem.submenu.forEach(sub => {
        sub.active = false
        if (sub.submenu) {
          sub.submenu.forEach(nested => nested.active = false)
        }
      })
    }
  })
  
  // Activar nested submenu, parent submenu y grandparent
  nestedSubmenu.active = true
  parentSubmenu.active = true
  grandParentItem.active = true
  
  // Cerrar menú móvil al seleccionar elemento anidado
  if (isMobile.value) {
    isMobileOpen.value = false
  }
  
  // Navegar
  if (nestedSubmenu.route) {
    router.push(nestedSubmenu.route)
  }
}

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    isMobileOpen.value = false
  }
}

// Función para actualizar el estado activo basado en la ruta actual
const updateActiveState = (currentRoute) => {
  // Desactivar todos los elementos
  menuItems.value.forEach(item => {
    item.active = false
    if (item.submenu) {
      item.submenu.forEach(sub => {
        sub.active = false
        if (sub.submenu) {
          sub.submenu.forEach(nested => nested.active = false)
        }
      })
    }
  })

  // Buscar y activar el elemento correspondiente a la ruta actual
  menuItems.value.forEach(item => {
    // Verificar item principal
    if (item.route === currentRoute) {
      item.active = true
      return
    }

    // Verificar submenús
    if (item.submenu) {
      item.submenu.forEach(sub => {
        if (sub.route === currentRoute) {
          sub.active = true
          item.active = true
          item.showSubmenu = true
          return
        }

        // Verificar submenús anidados
        if (sub.submenu) {
          sub.submenu.forEach(nested => {
            if (nested.route === currentRoute) {
              nested.active = true
              sub.active = true
              item.active = true
              item.showSubmenu = true
              sub.showSubmenu = true
            }
          })
        }
      })
    }
  })
}

// Watcher para detectar cambios de ruta
watch(() => route.path, (newPath) => {
  updateActiveState(newPath)
}, { immediate: true })

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  // Inicializar estado activo basado en la ruta actual
  updateActiveState(route.path)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
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