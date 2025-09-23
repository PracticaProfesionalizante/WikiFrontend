<template>
  <div class="menu-tree-node">
    <!-- Zona de drop superior -->
    <div 
      class="drop-zone top"
      :class="{ 'active': dropZone === 'top' }"
      @dragover.prevent="handleDragOver($event, 'top')"
      @drop="handleDrop($event, 'top')"
      @dragenter.prevent
      @dragleave="handleDragLeave"
    ></div>

    <!-- Nodo del menú -->
    <div 
      class="menu-node"
      :class="{ 
        'has-children': hasChildren, 
        'drop-inside': dropZone === 'inside',
        'drop-top': dropZone === 'top',
        'drop-bottom': dropZone === 'bottom',
        'is-dragging': isDragging
      }"
      draggable="true"
      @dragstart="handleDragStart"
      @dragover.prevent="handleDragOver($event, 'inside')"
      @drop="handleDrop($event, 'inside')"
      @dragenter.prevent
      @dragleave="handleDragLeave"
      @contextmenu.prevent="showContextMenu"
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
          class="action-button add"
          @click="emit('create-submenu', menu)"
          title="Agregar submenú"
        >
          <i class="mdi mdi-plus"></i>
        </button>
        <button 
          class="action-button edit"
          @click="emit('edit', menu)"
          title="Editar menú"
        >
          <i class="mdi mdi-pencil"></i>
        </button>
        <button 
          class="action-button delete"
          @click="emit('delete', menu)"
          title="Eliminar menú"
        >
          <i class="mdi mdi-delete"></i>
        </button>
      </div>
    </div>

    <!-- Menú contextual -->
    <div 
      v-if="showContextMenuFlag" 
      class="context-menu"
      :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }"
      @click.stop
    >
      <div class="context-menu-item" @click="handleEdit">
        <i class="fas fa-edit"></i>
        Editar menú
      </div>
      <div class="context-menu-item" @click="handleCreateSubmenu">
        <i class="fas fa-plus"></i>
        Agregar submenú
      </div>
      <div class="context-menu-separator"></div>
      <div class="context-menu-item danger" @click="handleDelete">
        <i class="fas fa-trash"></i>
        Eliminar menú
      </div>
    </div>

    <!-- Hijos del menú -->
    <div v-if="expanded && hasChildren" class="menu-children">
      <MenuTreeNode
        v-for="child in sortedChildren"
        :key="child.id"
        :menu="child"
        :level="level + 1"
        :all-menus="allMenus"
        :available-roles="availableRoles"
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
        @move="emit('move', $event)"
        @create-submenu="emit('create-submenu', $event)"
      />
    </div>

    <!-- Zona de drop inferior -->
    <div 
      class="drop-zone bottom"
      :class="{ 'active': dropZone === 'bottom' }"
      @dragover.prevent="handleDragOver($event, 'bottom')"
      @drop="handleDrop($event, 'bottom')"
      @dragenter.prevent
      @dragleave="handleDragLeave"
    ></div>
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
const emit = defineEmits(['edit', 'delete', 'move', 'create-submenu'])

// Estado local
const expanded = ref(true) // Expandir por defecto para mostrar los submenús
const dropZone = ref(null) // 'top', 'inside', 'bottom', null
const isDragging = ref(false)
const showContextMenuFlag = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)

// Computed
const hasChildren = computed(() => {
  // Si el menú tiene la propiedad children (estructura jerárquica del backend)
  if (props.menu.children && Array.isArray(props.menu.children)) {
    return props.menu.children.length > 0
  }
  
  // Fallback: buscar por parentId en allMenus (estructura plana)
  if (props.allMenus && Array.isArray(props.allMenus)) {
    return props.allMenus.some(menu => menu.parentId === props.menu.id)
  }
  
  return false
})

const sortedChildren = computed(() => {
  // Si el menú tiene la propiedad children (estructura jerárquica del backend)
  if (props.menu.children && Array.isArray(props.menu.children)) {
    return props.menu.children.sort((a, b) => a.order - b.order)
  }
  
  // Fallback: buscar por parentId en allMenus (estructura plana)
  if (props.allMenus && Array.isArray(props.allMenus)) {
    return props.allMenus
      .filter(menu => menu.parentId === props.menu.id)
      .sort((a, b) => a.order - b.order)
  }
  
  return []
})

// Métodos
const toggleExpanded = () => {
  expanded.value = !expanded.value
}

const getRoleLabel = (roleValue) => {
  if (!props.availableRoles || !Array.isArray(props.availableRoles)) {
    return roleValue
  }
  const role = props.availableRoles.find(r => r.value === roleValue)
  return role ? role.label : roleValue
}

// Drag & Drop
const handleDragStart = (event) => {
  isDragging.value = true
  event.dataTransfer.setData('text/plain', JSON.stringify({
    id: props.menu.id,
    name: props.menu.name,
    parentId: props.menu.parentId,
    order: props.menu.order
  }))
  event.dataTransfer.effectAllowed = 'move'
  
  // Limpiar el estado cuando termine el drag
  setTimeout(() => {
    isDragging.value = false
  }, 100)
}

const handleDragOver = (event, zone) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
  
  // Si se especifica una zona explícitamente, usarla
  if (zone) {
    dropZone.value = zone
    return
  }
  
  // Si no hay zona especificada, determinar basándose en la posición del mouse
  const rect = event.currentTarget.getBoundingClientRect()
  const y = event.clientY - rect.top
  const height = rect.height
  
  if (y < height * 0.25) {
    dropZone.value = 'top'
  } else if (y > height * 0.75) {
    dropZone.value = 'bottom'
  } else {
    dropZone.value = 'inside'
  }
}

const handleDragLeave = (event) => {
  // Solo remover el estado si realmente salimos del elemento
  if (!event.currentTarget.contains(event.relatedTarget)) {
    dropZone.value = null
  }
}

const handleDrop = (event, zone) => {
  event.preventDefault()
  dropZone.value = null
  
  try {
    const draggedData = JSON.parse(event.dataTransfer.getData('text/plain'))
    
    // No permitir soltar sobre sí mismo
    if (draggedData.id === props.menu.id) {
      return
    }
    
    // No permitir crear referencias circulares para la zona 'inside'
    if (zone === 'inside' && isDescendant(draggedData.id, props.menu.id)) {
      console.warn('No se puede mover un menú a uno de sus descendientes')
      return
    }
    
    // Calcular la nueva posición basada en la zona
    let moveData
    
    if (zone === 'top') {
      // Insertar antes del menú actual (mismo padre, orden del menú actual)
      // Los demás menús se reordenarán automáticamente en el backend
      moveData = {
        menuId: draggedData.id,
        newParentId: props.menu.parentId,
        newOrder: Math.max(1, props.menu.order)
      }
    } else if (zone === 'bottom') {
      // Insertar después del menú actual (mismo padre, orden siguiente)
      // Calcular el siguiente orden disponible
      const siblings = props.allMenus.filter(menu => 
        menu.parentId === props.menu.parentId && menu.id !== draggedData.id
      )
      const maxOrder = Math.max(...siblings.map(menu => menu.order), 0)
      
      moveData = {
        menuId: draggedData.id,
        newParentId: props.menu.parentId,
        newOrder: Math.max(props.menu.order + 1, maxOrder + 1)
      }
    } else { // zone === 'inside'
      // Insertar como hijo del menú actual
      const children = props.allMenus.filter(menu => 
        menu.parentId === props.menu.id && menu.id !== draggedData.id
      )
      
      moveData = {
        menuId: draggedData.id,
        newParentId: props.menu.id,
        newOrder: children.length + 1
      }
    }
    
    console.log('🎯 Drop en zona:', zone, 'Datos de movimiento:', moveData)
    emit('move', moveData)
  } catch (error) {
    console.error('Error al procesar drop:', error)
  }
}

const isDescendant = (ancestorId, descendantId) => {
  if (!props.allMenus || !Array.isArray(props.allMenus)) {
    return false
  }
  
  const checkDescendant = (menuId) => {
    const children = props.allMenus.filter(menu => menu.parentId === menuId)
    return children.some(child => 
      child.id === ancestorId || checkDescendant(child.id)
    )
  }
  
  return checkDescendant(descendantId)
}

// Menú contextual
const showContextMenu = (event) => {
  contextMenuX.value = event.clientX
  contextMenuY.value = event.clientY
  showContextMenuFlag.value = true
  
  // Cerrar el menú contextual al hacer clic fuera
  document.addEventListener('click', hideContextMenu, { once: true })
}

const hideContextMenu = () => {
  showContextMenuFlag.value = false
}

const handleEdit = () => {
  hideContextMenu()
  emit('edit', props.menu)
}

const handleDelete = () => {
  hideContextMenu()
  emit('delete', props.menu)
}

const handleCreateSubmenu = () => {
  hideContextMenu()
  emit('create-submenu', props.menu)
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
  gap: 6px;
  margin-left: 12px;
  align-items: center;
}

.action-button {
  opacity: 0.7;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  min-height: 32px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  padding: 6px;
  color: #666;
  font-size: 14px;
  transition: all 0.2s ease;
}

.action-button.add {
  background: #e8f5e8;
  border-color: #4caf50;
  color: #4caf50;
}

.action-button.edit {
  background: #e3f2fd;
  border-color: #2196f3;
  color: #2196f3;
}

.action-button.delete {
  background: #ffebee;
  border-color: #f44336;
  color: #f44336;
}

.menu-node:hover .action-button {
  opacity: 1;
}

.action-button:hover {
  opacity: 1;
  transform: scale(1.05);
}

.action-button.add:hover {
  background: #4caf50;
  color: white;
}

.action-button.edit:hover {
  background: #2196f3;
  color: white;
}

.action-button.delete:hover {
  background: #f44336;
  color: white;
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

/* Drop zones */
.drop-zone {
  height: 8px;
  margin: 4px 0;
  border-radius: 4px;
  transition: all 0.2s ease;
  opacity: 0;
  background: transparent;
  border: 2px dashed transparent;
}

.drop-zone.active {
  opacity: 1;
  background: rgba(76, 175, 80, 0.2);
  border-color: #4caf50;
  box-shadow: 0 0 12px rgba(76, 175, 80, 0.6);
}

.drop-zone.top {
  margin-bottom: 8px;
  margin-top: 2px;
}

.drop-zone.bottom {
  margin-top: 8px;
  margin-bottom: 2px;
}

/* Estados de drag & drop mejorados */
.menu-node.drop-inside {
  border-color: #4caf50;
  background: linear-gradient(135deg, #f1f8e9 0%, #e8f5e8 100%);
  box-shadow: inset 0 0 0 2px rgba(76, 175, 80, 0.3);
}

.menu-node.drop-top {
  border-top: 3px solid #4caf50;
  box-shadow: 0 -2px 8px rgba(76, 175, 80, 0.3);
}

.menu-node.drop-bottom {
  border-bottom: 3px solid #4caf50;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.menu-node.is-dragging {
  opacity: 0.5;
  transform: scale(0.95);
  cursor: grabbing;
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

/* Context Menu */
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 180px;
  padding: 4px 0;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 14px;
}

.context-menu-item:hover {
  background: #f5f5f5;
}

.context-menu-item.danger {
  color: #f44336;
}

.context-menu-item.danger:hover {
  background: #ffebee;
}

.context-menu-separator {
  height: 1px;
  background: #e0e0e0;
  margin: 4px 0;
}
</style>