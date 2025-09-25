<template>
  <div v-if="show && menu" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <div class="modal-icon">
          <i class="mdi mdi-delete-alert"></i>
        </div>
        <h2>Eliminar Menú</h2>
        <button class="close-btn" @click="$emit('close')">
          <i class="mdi mdi-close"></i>
        </button>
      </div>

      <div class="modal-body">
        <!-- Información del menú a eliminar -->
        <div class="menu-info">
          <div class="menu-item">
            <i :class="['mdi', menu?.icon] || 'mdi mdi-menu'" class="menu-icon"></i>
            <div class="menu-details">
              <h3>{{ menu?.name || 'Sin nombre' }}</h3>
              <p class="menu-path">{{ menu?.path || 'Sin ruta' }}</p>
            </div>
          </div>
        </div>

        <!-- Mostrar submenús si existen -->
        <div v-if="hasChildren" class="submenu-section">
          <div class="warning-message">
            <i class="mdi mdi-alert-circle"></i>
            <p>Este menú tiene <strong>{{ children.length }}</strong> submenú{{ children.length > 1 ? 's' : '' }}:</p>
          </div>

          <div class="submenu-list">
            <div 
              v-for="child in children" 
              :key="child.id"
              class="submenu-item"
              :class="{ 'selected-for-deletion': selectedChildren.includes(child.id) }"
            >
              <div class="submenu-checkbox">
                <input 
                  type="checkbox" 
                  :id="`child-${child.id}`"
                  :value="child.id"
                  v-model="selectedChildren"
                  :disabled="deletionMode === 'delete-all'"
                />
              </div>
              <div class="submenu-info">
                <i :class="['mdi', child.icon] || 'mdi mdi-menu'" class="submenu-icon"></i>
                <div class="submenu-details">
                  <span class="submenu-name">{{ child.name }}</span>
                  <span class="submenu-path">{{ child.path }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Opciones de eliminación -->
          <div class="deletion-options">
            <h4>¿Qué deseas hacer?</h4>
            
            <div class="option-group">
              <label class="option-item">
                <input 
                  type="radio" 
                  value="delete-all" 
                  v-model="deletionMode"
                  @change="handleModeChange"
                />
                <div class="option-content">
                  <div class="option-header">
                    <i class="mdi mdi-delete-sweep"></i>
                    <span class="option-title">Eliminar todo</span>
                  </div>
                  <p class="option-description">
                    Eliminar el menú principal y todos sus {{ children.length }} submenús
                  </p>
                </div>
              </label>

              <label class="option-item">
                <input 
                  type="radio" 
                  value="selective" 
                  v-model="deletionMode"
                  @change="handleModeChange"
                />
                <div class="option-content">
                  <div class="option-header">
                    <i class="mdi mdi-delete-variant"></i>
                    <span class="option-title">Eliminación selectiva</span>
                  </div>
                  <p class="option-description">
                    Elegir qué submenús eliminar. El menú principal se mantiene, solo se eliminan los submenús seleccionados
                  </p>
                </div>
              </label>

              <label class="option-item">
                <input 
                  type="radio" 
                  value="keep-children" 
                  v-model="deletionMode"
                  @change="handleModeChange"
                />
                <div class="option-content">
                  <div class="option-header">
                    <i class="mdi mdi-delete-outline"></i>
                    <span class="option-title">Solo eliminar menú principal</span>
                  </div>
                  <p class="option-description">
                    Eliminar solo el menú principal. Los submenús se moverán al nivel raíz
                  </p>
                </div>
              </label>
            </div>
          </div>

          <!-- Información adicional según el modo -->
          <div class="mode-info">
            <div v-if="deletionMode === 'selective'" class="selective-info">
              <p>
                <i class="mdi mdi-information"></i>
                Selecciona los submenús que deseas eliminar. El menú principal se mantendrá intacto.
                Los submenús no seleccionados permanecerán como submenús del menú principal.
              </p>
            </div>
            <div v-else-if="deletionMode === 'keep-children'" class="keep-info">
              <p>
                <i class="mdi mdi-information"></i>
                Todos los submenús se convertirán en menús principales y conservarán su estructura interna.
              </p>
            </div>
          </div>
        </div>

        <!-- Mensaje simple si no hay submenús -->
        <div v-else class="no-children-message">
          <p>¿Estás seguro de que deseas eliminar el menú "<strong>{{ menu?.name || 'Sin nombre' }}</strong>"?</p>
          <p class="warning-text">Esta acción no se puede deshacer.</p>
        </div>
      </div>

      <div class="modal-footer">
        <button class="cancel-btn" @click="$emit('close')">
          Cancelar
        </button>
        <button 
          class="delete-btn" 
          @click="handleConfirm"
          :disabled="deletionMode === 'selective' && selectedChildren.length === 0"
        >
          <i class="mdi mdi-delete"></i>
          {{ getConfirmButtonText() }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  menu: {
    type: Object,
    default: null
  },
  children: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['close', 'confirm'])

// Estado reactivo
const deletionMode = ref('delete-all')
const selectedChildren = ref([])

// Computed
const hasChildren = computed(() => props.children && props.children.length > 0)

// Watchers
watch(() => props.show, (newValue) => {
  if (newValue) {
    // Resetear estado cuando se abre el modal
    deletionMode.value = hasChildren.value ? 'delete-all' : 'delete-all'
    selectedChildren.value = []
  }
})

// Métodos
const handleOverlayClick = () => {
  emit('close')
}

const handleModeChange = () => {
  if (deletionMode.value === 'delete-all') {
    selectedChildren.value = props.children.map(child => child.id)
  } else if (deletionMode.value === 'keep-children') {
    selectedChildren.value = []
  }
  // Para 'selective' no cambiamos la selección
}

const getConfirmButtonText = () => {
  if (!hasChildren.value) {
    return 'Eliminar Menú'
  }
  
  switch (deletionMode.value) {
    case 'delete-all':
      return `Eliminar Todo (${props.children.length + 1})`
    case 'selective': {
      const selectedCount = selectedChildren.value.length
      return selectedCount > 0 ? `Eliminar Submenús (${selectedCount})` : 'Selecciona submenús'
    }
    case 'keep-children':
      return 'Eliminar Solo Menú Principal'
    default:
      return 'Eliminar'
  }
}

const handleConfirm = () => {
  if (!props.menu) return // Salir si no hay menú
  
  if (deletionMode.value === 'selective' && selectedChildren.value.length === 0) {
    return // No hacer nada si no hay selección en modo selectivo
  }

  const confirmData = {
    menuId: props.menu.id,
    mode: deletionMode.value,
    selectedChildren: selectedChildren.value,
    allChildren: props.children.map(child => child.id)
  }

  emit('confirm', confirmData)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
  position: relative;
}

.modal-icon {
  width: 48px;
  height: 48px;
  background: #fee2e2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.modal-icon i {
  font-size: 24px;
  color: #dc2626;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  flex: 1;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 24px;
}

.menu-info {
  margin-bottom: 24px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
}

.menu-icon {
  font-size: 24px;
  color: #3b82f6;
  margin-right: 12px;
}

.menu-details h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.menu-path {
  font-size: 14px;
  color: #64748b;
  font-family: 'Courier New', monospace;
}

.submenu-section {
  margin-top: 24px;
}

.warning-message {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  margin-bottom: 16px;
}

.warning-message i {
  font-size: 20px;
  color: #d97706;
  margin-right: 8px;
}

.warning-message p {
  margin: 0;
  color: #92400e;
  font-weight: 500;
}

.submenu-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 20px;
}

.submenu-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  transition: all 0.2s;
}

.submenu-item:last-child {
  border-bottom: none;
}

.submenu-item:hover {
  background: #f8fafc;
}

.submenu-item.selected-for-deletion {
  background: #fef2f2;
  border-color: #fecaca;
}

.submenu-checkbox {
  margin-right: 12px;
  position: relative;
}

.submenu-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin: 0;
  cursor: pointer;
}

.submenu-checkbox input[type="checkbox"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submenu-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.submenu-icon {
  font-size: 18px;
  color: #6b7280;
  margin-right: 8px;
}

.submenu-details {
  display: flex;
  flex-direction: column;
}

.submenu-name {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.submenu-path {
  font-size: 12px;
  color: #9ca3af;
  font-family: 'Courier New', monospace;
}

.deletion-options {
  margin: 20px 0;
}

.deletion-options h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.option-item:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.option-item:has(input:checked) {
  border-color: #3b82f6;
  background: #eff6ff;
}

.option-item input[type="radio"] {
  margin: 4px 12px 0 0;
  cursor: pointer;
}

.option-content {
  flex: 1;
}

.option-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.option-header i {
  font-size: 18px;
  margin-right: 8px;
  color: #6b7280;
}

.option-title {
  font-weight: 600;
  color: #374151;
  font-size: 15px;
}

.option-description {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}

.mode-info {
  margin-top: 16px;
}

.selective-info,
.keep-info {
  padding: 12px 16px;
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 6px;
}

.selective-info p,
.keep-info p {
  margin: 0;
  font-size: 13px;
  color: #0c4a6e;
  display: flex;
  align-items: flex-start;
}

.selective-info i,
.keep-info i {
  margin-right: 6px;
  margin-top: 1px;
  font-size: 14px;
}

.no-children-message {
  text-align: center;
  padding: 20px;
}

.no-children-message p {
  margin: 0 0 8px 0;
  color: #374151;
}

.warning-text {
  font-size: 14px;
  color: #dc2626;
  font-weight: 500;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 24px;
  border-top: 1px solid #e5e7eb;
}

.cancel-btn,
.delete-btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.cancel-btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #374151;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.delete-btn {
  background: #dc2626;
  border: 1px solid #dc2626;
  color: white;
}

.delete-btn:hover:not(:disabled) {
  background: #b91c1c;
  border-color: #b91c1c;
}

.delete-btn:disabled {
  background: #d1d5db;
  border-color: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
}
</style>