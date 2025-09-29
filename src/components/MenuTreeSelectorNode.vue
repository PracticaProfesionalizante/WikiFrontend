<template>
  <div class="tree-node" :class="{ excluded: isExcluded }">
    <div
      class="node-content"
      :class="{
        selected: isSelected,
        disabled: isExcluded,
        'has-children': hasChildren,
        highlighted: isHighlighted,
      }"
      :style="{ paddingLeft: level * 20 + 12 + 'px' }"
      @click="handleSelect"
    >
      <!-- Botón de expansión -->
      <button v-if="hasChildren" class="expand-button" @click.stop="handleToggle">
        <i class="mdi" :class="isExpanded ? 'mdi-chevron-down' : 'mdi-chevron-right'"></i>
      </button>
      <div v-else class="expand-spacer"></div>

      <!-- Icono del menú -->
      <div class="menu-icon">
        <i :class="['mdi', menu.icon] || 'mdi mdi-circle-outline'"></i>
      </div>

      <!-- Información del menú -->
      <div class="menu-info">
        <span class="menu-name">{{ menu.name }}</span>
        <div class="menu-details">
          <span v-if="menu.path" class="menu-path">{{ menu.path }}</span>
          <span class="menu-order">Orden: {{ menu.order }}</span>
          <span v-if="hasChildren" class="children-count">
            {{ childrenCount }} {{ childrenCount === 1 ? 'submenú' : 'submenús' }}
          </span>
        </div>
      </div>

      <!-- Indicadores -->
      <div class="node-indicators">
        <span v-if="isSelected" class="selected-indicator">
          <i class="mdi mdi-check-circle"></i>
        </span>
        <span v-if="isExcluded" class="excluded-indicator">
          <i class="mdi mdi-block-helper"></i>
        </span>
      </div>
    </div>

    <!-- Nodos hijos -->
    <div v-if="isExpanded && hasChildren" class="children-container">
      <MenuTreeSelectorNode
        v-for="child in menu.children"
        :key="child.id"
        :menu="child"
        :level="level + 1"
        :selected-id="selectedId"
        :excluded-id="excludedId"
        :expanded-nodes="expandedNodes"
        :search-query="searchQuery"
        @select="$emit('select', $event)"
        @toggle="$emit('toggle', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  menu: {
    type: Object,
    required: true,
  },
  level: {
    type: Number,
    default: 0,
  },
  selectedId: {
    type: [String, Number],
    default: null,
  },
  excludedId: {
    type: [String, Number],
    default: null,
  },
  expandedNodes: {
    type: Set,
    required: true,
  },
  searchQuery: {
    type: String,
    default: '',
  },
})

// Emits
const emit = defineEmits(['select', 'toggle'])

// Computed
const hasChildren = computed(() => {
  return props.menu.children && props.menu.children.length > 0
})

const childrenCount = computed(() => {
  return props.menu.children ? props.menu.children.length : 0
})

const isExpanded = computed(() => {
  return props.expandedNodes.has(props.menu.id)
})

const isSelected = computed(() => {
  return props.selectedId === props.menu.id
})

const isExcluded = computed(() => {
  return props.excludedId === props.menu.id || isDescendantOfExcluded()
})

const isHighlighted = computed(() => {
  if (!props.searchQuery) return false
  return props.menu.name.toLowerCase().includes(props.searchQuery.toLowerCase())
})

// Métodos
const handleSelect = () => {
  if (!isExcluded.value) {
    emit('select', props.menu.id)
  }
}

const handleToggle = () => {
  emit('toggle', props.menu.id)
}

const isDescendantOfExcluded = () => {
  // Verificar si este menú es descendiente del menú excluido
  if (!props.excludedId) return false

  const checkParentChain = (menuId, parentId) => {
    if (parentId === props.excludedId) return true
    // Aquí podrías implementar lógica adicional para verificar la cadena de padres
    return false
  }

  return checkParentChain(props.menu.id, props.menu.parentId)
}
</script>

<style scoped>
.tree-node {
  margin-bottom: 2px;
}

.node-content {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  min-height: 40px;
}

.node-content:hover:not(.disabled) {
  background: var(--background-secondary);
}

.node-content.selected {
  background: rgba(var(--primary-rgb), 0.1);
  border: 1px solid var(--primary-color);
}

.node-content.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--background-tertiary);
}

.node-content.highlighted {
  background: rgba(var(--warning-rgb), 0.1);
}

.node-content.highlighted .menu-name {
  font-weight: 600;
  color: var(--warning-color);
}

.expand-button {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  transition: all 0.2s ease;
  width: 24px;
  height: 24px;
}

.expand-button:hover {
  background: var(--background-tertiary);
  color: var(--text-primary);
}

.expand-spacer {
  width: 24px;
  height: 24px;
  margin-right: 8px;
}

.menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: 12px;
  color: var(--text-secondary);
  font-size: 16px;
}

.menu-info {
  flex: 1;
  min-width: 0;
}

.menu-name {
  display: block;
  font-weight: 500;
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 2px;
}

.menu-details {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.menu-path {
  font-size: 12px;
  color: var(--text-secondary);
  font-family: 'Courier New', monospace;
  background: var(--background-tertiary);
  padding: 2px 6px;
  border-radius: 3px;
}

.menu-order {
  font-size: 11px;
  color: var(--text-tertiary);
}

.children-count {
  font-size: 11px;
  color: var(--primary-color);
  background: rgba(var(--primary-rgb), 0.1);
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
}

.node-indicators {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
}

.selected-indicator {
  color: var(--success-color);
  font-size: 16px;
}

.excluded-indicator {
  color: var(--error-color);
  font-size: 16px;
}

.children-container {
  margin-left: 0;
}

/* Líneas de conexión para mejor visualización de jerarquía */
.tree-node::before {
  content: '';
  position: absolute;
  left: calc(var(--level) * 20px + 24px);
  top: 0;
  bottom: 50%;
  width: 1px;
  background: var(--border-color);
  opacity: 0.3;
}

.tree-node:last-child::before {
  display: none;
}

/* Responsive */
@media (max-width: 768px) {
  .node-content {
    padding: 6px 8px;
    min-height: 36px;
  }

  .menu-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .menu-path {
    font-size: 10px;
  }

  .menu-order,
  .children-count {
    font-size: 10px;
  }
}
</style>
