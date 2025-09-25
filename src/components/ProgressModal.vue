<template>
  <div v-if="isVisible" class="progress-modal-overlay" @click.self="closeModal">
    <div class="progress-modal">
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="mdi mdi-cog-sync-outline spinning-icon"></i>
          {{ title }}
        </h3>
      </div>
      
      <div class="modal-body">
        <div class="progress-container">
          <!-- Barra de progreso circular -->
          <div class="circular-progress">
            <svg class="progress-ring" width="120" height="120">
              <circle
                class="progress-ring-background"
                stroke="#e0e0e0"
                stroke-width="8"
                fill="transparent"
                r="52"
                cx="60"
                cy="60"
              />
              <circle
                class="progress-ring-progress"
                stroke="#4CAF50"
                stroke-width="8"
                fill="transparent"
                r="52"
                cx="60"
                cy="60"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="strokeDashoffset"
                stroke-linecap="round"
              />
            </svg>
            <div class="progress-text">
              <span class="percentage">{{ Math.round(percentage) }}%</span>
              <span class="current-total">{{ current }}/{{ total }}</span>
            </div>
          </div>
          
          <!-- Información del progreso -->
          <div class="progress-info">
            <p class="current-action">{{ currentAction }}</p>
            <div v-if="errors.length > 0" class="error-summary">
              <p class="error-count">
                <i class="mdi mdi-alert-circle"></i>
                {{ errors.length }} error(es) encontrado(s)
              </p>
            </div>
          </div>
        </div>
        
        <!-- Lista de errores (expandible) -->
        <div v-if="errors.length > 0" class="error-section">
          <button 
            @click="showErrors = !showErrors" 
            class="toggle-errors-btn"
          >
            <i :class="showErrors ? 'mdi mdi-chevron-up' : 'mdi mdi-chevron-down'"></i>
            {{ showErrors ? 'Ocultar errores' : 'Ver errores' }}
          </button>
          
          <div v-if="showErrors" class="error-list">
            <div v-for="(error, index) in errors" :key="index" class="error-item">
              <i class="mdi mdi-alert-circle error-icon"></i>
              <span class="error-text">{{ error }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button 
          v-if="isCompleted" 
          @click="closeModal" 
          class="btn btn-primary"
        >
          <i class="mdi mdi-check"></i>
          Cerrar
        </button>
        <button 
          v-else-if="allowCancel" 
          @click="cancelOperation" 
          class="btn btn-secondary"
        >
          <i class="mdi mdi-close"></i>
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Procesando...'
  },
  current: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 1
  },
  currentAction: {
    type: String,
    default: 'Iniciando proceso...'
  },
  errors: {
    type: Array,
    default: () => []
  },
  allowCancel: {
    type: Boolean,
    default: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'cancel'])

const showErrors = ref(false)

// Cálculos para el progreso circular
const circumference = 2 * Math.PI * 52 // radio = 52
const percentage = computed(() => {
  if (props.total === 0) return 0
  return (props.current / props.total) * 100
})

const strokeDashoffset = computed(() => {
  const progress = percentage.value / 100
  return circumference - (progress * circumference)
})

// Watchers
watch(() => props.errors.length, (newLength, oldLength) => {
  if (newLength > oldLength) {
    showErrors.value = true
  }
})

// Métodos
const closeModal = () => {
  emit('close')
}

const cancelOperation = () => {
  emit('cancel')
}
</script>

<style scoped>
.progress-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.progress-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
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
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 12px;
}

.spinning-icon {
  animation: spin 2s linear infinite;
  color: #4CAF50;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.modal-body {
  padding: 24px;
}

.progress-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.circular-progress {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-progress {
  transition: stroke-dashoffset 0.5s ease-in-out;
}

.progress-text {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.percentage {
  font-size: 1.5rem;
  font-weight: 700;
  color: #4CAF50;
  line-height: 1;
}

.current-total {
  font-size: 0.875rem;
  color: #666;
  margin-top: 4px;
}

.progress-info {
  text-align: center;
  width: 100%;
}

.current-action {
  font-size: 1rem;
  color: #333;
  margin: 0 0 12px 0;
  font-weight: 500;
}

.error-summary {
  background: #fff3e0;
  border: 1px solid #ffb74d;
  border-radius: 8px;
  padding: 12px;
}

.error-count {
  margin: 0;
  color: #f57c00;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.error-section {
  margin-top: 20px;
  border-top: 1px solid #e0e0e0;
  padding-top: 20px;
}

.toggle-errors-btn {
  width: 100%;
  padding: 12px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
  color: #666;
  transition: all 0.2s ease;
}

.toggle-errors-btn:hover {
  background: #eeeeee;
  border-color: #ccc;
}

.error-list {
  margin-top: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.error-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 12px;
  background: #ffebee;
  border: 1px solid #ffcdd2;
  border-radius: 6px;
  margin-bottom: 8px;
}

.error-icon {
  color: #f44336;
  margin-top: 2px;
  flex-shrink: 0;
}

.error-text {
  color: #d32f2f;
  font-size: 0.875rem;
  line-height: 1.4;
}

.modal-footer {
  padding: 16px 24px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background: #45a049;
}

.btn-secondary {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background: #eeeeee;
}

/* Responsive */
@media (max-width: 600px) {
  .progress-modal {
    width: 95%;
    margin: 20px;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 16px;
    padding-right: 16px;
  }
  
  .circular-progress svg {
    width: 100px;
    height: 100px;
  }
  
  .percentage {
    font-size: 1.25rem;
  }
}
</style>