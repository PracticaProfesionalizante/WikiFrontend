<template>
  <div class="menu-tree-node">
    <!-- Nodo del menú -->
    <div 
      class="menu-node"
      :class="{ 'has-children': hasChildren, 'drag-over': draggedOver }"
      draggable="true"
      @dragstart="handleDragStart"
      @dragover="handleDragOver"
      @drop="handleDrop"
      @dragenter.prevent
      @dragleave="handleDragLeave"
    >
      <!-- Botón de expansión -->
      <button 
        v-if="hasChildren"
        class="expand-button"
        @click="toggleExpanded"
        :aria-label="expanded ? 'Contraer' : 'Expandir'"
      >
        <i :class="expanded ? 'fas fa-chevron-down' : 'fas fa-chevron-right'"></i>
      </button>
      <div v-else class="expand-spacer"></div>

      <!-- Información del menú -->
      <div class="menu-info">
        <div class="menu-header">
          <i :class="menu.icon || 'fas fa-link'" class="menu-icon"></i>
          <span class="menu-name">{{ menu.name }}</span>
          <span class="menu-order">#{{ menu.order }}</span>
        </div>
        
        <div class="menu-details">
          <span class="menu-path">{{ menu.path }}</span>
          <div class="menu-roles">
            <span 
              v-for="role in menu.roles" 
              :key="role"
              class="role-badge"
              :class="`role-${role.toLowerCase().replace('role_', '')}`"
            >
              {{ getRoleLabel(role) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Acciones -->
      <div class="menu-actions">
        <button 
          class="action-button edit"
          @click="emit('edit', menu)"
          title="Editar menú"
        >
          <i class="fas fa-edit"></i>
        </button>
        <button 
          class="action-button delete"
          @click="emit('delete', menu)"
          title="Eliminar menú"
        >
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>

    <!-- Hijos del menú -->
    <div v-if="expanded && hasChildren" class="menu-children">
      <MenuTreeNode
        v-for="child in sortedChildren"
        :key="child.id"
        :menu="child"
        :all-menus="allMenus"
        :available-roles="availableRoles"
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
        @move="emit('move', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  menu: {
    type: Object,
    required: true
  },
  allMenus: {
    type: Array,
    required: true
  },
  availableRoles: {
    type: Array,
    required: true
  }
})

// Emits
const emit = defineEmits(['edit', 'delete', 'move'])

// Estado local
const expanded = ref(false)
const draggedOver = ref(false)

// Computed
const hasChildren = computed(() => {
  return props.allMenus.some(menu => menu.parentId === props.menu.id)
})

const sortedChildren = computed(() => {
  return props.allMenus
    .filter(menu => menu.parentId === props.menu.id)
    .sort((a, b) => a.order - b.order)
})

// Métodos
const toggleExpanded = () => {
  expanded.value = !expanded.value
}

const getRoleLabel = (roleValue) => {
  const role = props.availableRoles.find(r => r.value === roleValue)
  return role ? role.label : roleValue
}

// Drag & Drop
const handleDragStart = (event) => {
  event.dataTransfer.setData('text/plain', JSON.stringify({
    id: props.menu.id,
    name: props.menu.name,
    parentId: props.menu.parentId,
    order: props.menu.order
  }))
  event.dataTransfer.effectAllowed = 'move'
}

const handleDragOver = (event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
  draggedOver.value = true
}

const handleDragLeave = (event) => {
  // Solo remover el estado si realmente salimos del elemento
  if (!event.currentTarget.contains(event.relatedTarget)) {
    draggedOver.value = false
  }
}

const handleDrop = (event) => {
  event.preventDefault()
  draggedOver.value = false
  
  try {
    const draggedData = JSON.parse(event.dataTransfer.getData('text/plain'))
    
    // No permitir soltar sobre sí mismo
    if (draggedData.id === props.menu.id) {
      return
    }
    
    // No permitir crear referencias circulares
    if (isDescendant(draggedData.id, props.menu.id)) {
      console.warn('No se puede mover un menú a uno de sus descendientes')
      return
    }
    
    // Emitir evento de movimiento
    const moveData = {
      menuId: draggedData.id,
      newParentId: props.menu.id,
      newOrder: sortedChildren.value.length + 1
    }
    
    emit('move', moveData)
  } catch (error) {
    console.error('Error al procesar drop:', error)
  }
}

const isDescendant = (ancestorId, descendantId) => {
  const checkDescendant = (menuId) => {
    const children = props.allMenus.filter(menu => menu.parentId === menuId)
    return children.some(child => 
      child.id === ancestorId || checkDescendant(child.id)
    )
  }
  
  return checkDescendant(descendantId)
}
</script>

<style scoped>
.menu-tree-node {
  margin-bottom: 4px;
}

.menu-node {
  display: flex;
  align-items: center;
  padding: 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: move;
}

.menu-node:hover {
  border-color: #2196F3;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.1);
}

.menu-node.has-children {
  border-left: 4px solid #2196F3;
}

.expand-button {
  background: none;
  border: none;
  padding: 4px;
  margin-right: 8px;
  cursor: pointer;
  color: #666;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.expand-button:hover {
  background: #f5f5f5;
  color: #2196F3;
}

.expand-spacer {
  width: 24px;
  margin-right: 8px;
}

.menu-info {
  flex: 1;
  min-width: 0;
}

.menu-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.menu-icon {
  color: #2196F3;
  width: 16px;
  text-align: center;
}

.menu-name {
  font-weight: 600;
  color: #333;
}

.menu-order {
  background: #e3f2fd;
  color: #1976d2;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.menu-details {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.menu-path {
  color: #666;
  font-size: 14px;
  font-family: 'Courier New', monospace;
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
}

.menu-roles {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.role-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
}

.role-super_user {
  background: #ffebee;
  color: #c62828;
}

.role-admin {
  background: #fff3e0;
  color: #ef6c00;
}

.role-collaborator {
  background: #e8f5e8;
  color: #2e7d32;
}

.role-user {
  background: #e3f2fd;
  color: #1976d2;
}

.menu-actions {
  display: flex;
  gap: 4px;
  margin-left: 12px;
}

.action-button {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #666;
}

.action-button:hover {
  background: #f5f5f5;
}

.action-button.edit:hover {
  color: #2196F3;
  background: #e3f2fd;
}

.action-button.delete:hover {
  color: #f44336;
  background: #ffebee;
}

.menu-children {
  margin-left: 32px;
  margin-top: 8px;
  padding-left: 16px;
  border-left: 2px dashed #e0e0e0;
}

/* Drag & Drop states */
.menu-node[draggable="true"]:hover {
  cursor: move;
}

.menu-node.drag-over {
  border-color: #4caf50;
  background: #f1f8e9;
}

/* Responsive */
@media (max-width: 768px) {
  .menu-node {
    padding: 8px;
  }
  
  .menu-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .menu-children {
    margin-left: 16px;
  }
}
</style>