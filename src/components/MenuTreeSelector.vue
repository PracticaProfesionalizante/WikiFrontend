<template>
  <div class="menu-tree-selector">
    <div class="selector-header">
      <div class="search-box">
        <i class="mdi mdi-magnify search-icon"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar menú..."
          class="search-input"
        />
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="clear-button"
        >
          <i class="mdi mdi-close"></i>
        </button>
      </div>
      <div class="tree-actions">
        <button
          @click="expandAll"
          class="tree-action-btn"
          title="Expandir todo"
        >
          <i class="mdi mdi-unfold-more-horizontal"></i>
        </button>
        <button
          @click="collapseAll"
          class="tree-action-btn"
          title="Contraer todo"
        >
          <i class="mdi mdi-unfold-less-horizontal"></i>
        </button>
      </div>
    </div>

    <div class="tree-container">
      <div v-if="filteredMenus.length === 0" class="empty-state">
        <i class="mdi mdi-file-tree-outline"></i>
        <p>{{ searchQuery ? 'No se encontraron menús' : 'No hay menús disponibles' }}</p>
      </div>
      
      <MenuTreeSelectorNode
        v-for="menu in filteredMenus"
        :key="menu.id"
        :menu="menu"
        :level="0"
        :selected-id="selectedId"
        :excluded-id="excludedId"
        :expanded-nodes="expandedNodes"
        :search-query="searchQuery"
        @select="handleSelect"
        @toggle="handleToggle"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import MenuTreeSelectorNode from './MenuTreeSelectorNode.vue'

// Props
const props = defineProps({
  menus: {
    type: Array,
    required: true
  },
  selectedId: {
    type: [String, Number],
    default: null
  },
  excludedId: {
    type: [String, Number],
    default: null
  },
  placeholder: {
    type: String,
    default: 'Selecciona un menú padre'
  }
})

// Emits
const emit = defineEmits(['select'])

// Estado reactivo
const searchQuery = ref('')
const expandedNodes = ref(new Set())

// Computed
const hierarchicalMenus = computed(() => {
  // Si los menús ya vienen con estructura jerárquica (con children), usarlos directamente
  if (props.menus.length > 0 && props.menus[0].children !== undefined) {
    console.log('🔍 MenuTreeSelector - Usando estructura jerárquica del backend')
    return props.menus.sort((a, b) => a.order - b.order)
  }
  
  // Fallback: construir jerarquía desde estructura plana
  console.log('🔍 MenuTreeSelector - Construyendo jerarquía desde estructura plana')
  const buildHierarchy = (menuList, parentId = null) => {
    return menuList
      .filter(menu => menu.parentId === parentId)
      .map(menu => ({
        ...menu,
        children: buildHierarchy(menuList, menu.id)
      }))
      .sort((a, b) => a.order - b.order)
  }
  
  return buildHierarchy(props.menus)
})

const filteredMenus = computed(() => {
  if (!searchQuery.value) {
    return hierarchicalMenus.value
  }
  
  const query = searchQuery.value.toLowerCase()
  
  const filterMenus = (menuList) => {
    return menuList.reduce((filtered, menu) => {
      const matchesSearch = menu.name.toLowerCase().includes(query)
      const filteredChildren = filterMenus(menu.children || [])
      
      if (matchesSearch || filteredChildren.length > 0) {
        filtered.push({
          ...menu,
          children: filteredChildren
        })
        
        // Auto-expandir nodos que coinciden con la búsqueda
        if (matchesSearch || filteredChildren.length > 0) {
          expandedNodes.value.add(menu.id)
        }
      }
      
      return filtered
    }, [])
  }
  
  return filterMenus(hierarchicalMenus.value)
})

// Métodos
const handleSelect = (menuId) => {
  emit('select', menuId)
}

const handleToggle = (menuId) => {
  if (expandedNodes.value.has(menuId)) {
    expandedNodes.value.delete(menuId)
  } else {
    expandedNodes.value.add(menuId)
  }
}

const expandAll = () => {
  const getAllMenuIds = (menuList) => {
    let ids = []
    for (const menu of menuList) {
      ids.push(menu.id)
      if (menu.children && menu.children.length > 0) {
        ids = [...ids, ...getAllMenuIds(menu.children)]
      }
    }
    return ids
  }
  
  const allIds = getAllMenuIds(hierarchicalMenus.value)
  expandedNodes.value = new Set(allIds)
}

const collapseAll = () => {
  expandedNodes.value.clear()
}

const clearSearch = () => {
  searchQuery.value = ''
}

// Watchers
watch(() => props.menus, () => {
  // Limpiar nodos expandidos cuando cambian los menús
  expandedNodes.value.clear()
}, { deep: true })

watch(searchQuery, (newQuery) => {
  if (!newQuery) {
    // Limpiar expansiones automáticas cuando se limpia la búsqueda
    expandedNodes.value.clear()
  }
})
</script>

<style scoped>
.menu-tree-selector {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--background-primary);
  max-height: 400px;
  display: flex;
  flex-direction: column;
}

.selector-header {
  padding: 12px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  gap: 8px;
  align-items: center;
}

.search-box {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--text-secondary);
  font-size: 16px;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--background-secondary);
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
}

.clear-button {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.clear-button:hover {
  background: var(--background-tertiary);
  color: var(--text-primary);
}

.tree-actions {
  display: flex;
  gap: 4px;
}

.tree-action-btn {
  background: none;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 16px;
}

.tree-action-btn:hover {
  background: var(--background-secondary);
  color: var(--text-primary);
  border-color: var(--primary-color);
}

.tree-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--text-secondary);
  text-align: center;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

/* Scrollbar personalizado */
.tree-container::-webkit-scrollbar {
  width: 6px;
}

.tree-container::-webkit-scrollbar-track {
  background: var(--background-secondary);
  border-radius: 3px;
}

.tree-container::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.tree-container::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}
</style>