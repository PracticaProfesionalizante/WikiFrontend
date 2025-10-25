<template>
  <div v-if="show" class="modal-overlay" @click="handleClose">
    <div class="modal-container" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-content">
          <div class="header-title">
            <div class="header-icon">
              <i class="fas fa-user-times"></i>
            </div>
            <div class="header-text">
              <h2 class="modal-title">Eliminar Usuario</h2>
              <p class="modal-subtitle">Esta acción no se puede deshacer</p>
            </div>
          </div>
          <button @click="handleClose" class="close-btn" :disabled="isDeleting">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <div class="delete-content">
          <!-- Warning Icon -->
          <div class="warning-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>

          <!-- User Info -->
          <div class="user-info">
            <h3 class="user-name">{{ user.username }}</h3>
            <div class="user-details">
              <div class="detail-item">
                <i class="fas fa-envelope"></i>
                <span>{{ user.email }}</span>
              </div>
              <div class="detail-item">
                <i class="fas fa-user-shield"></i>
                <span>{{ user.roles.join(', ') }}</span>
              </div>
              <div class="detail-item">
                <i class="fas fa-calendar"></i>
                <span>Registrado: {{ formatDate(user.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Warning Message -->
          <div class="warning-message">
            <h4>¿Estás seguro de que deseas eliminar este usuario?</h4>
            <p>
              Esta acción eliminará permanentemente el usuario <strong>{{ user.username }}</strong>
              y todos sus datos asociados. Esta acción no se puede deshacer.
            </p>
          </div>

          <!-- Confirmation Section -->
          <div class="confirmation-section">
            <div class="confirmation-info">
              <i class="fas fa-exclamation-triangle"></i>
              <span>Para confirmar la eliminación, escribe <strong>"Eliminar"</strong> en el campo de abajo:</span>
            </div>
            <div class="confirmation-input">
              <input
                v-model="confirmationText"
                type="text"
                placeholder="Escribe 'Eliminar' para confirmar"
                class="confirmation-field"
                :class="{ 'valid': isConfirmationValid, 'invalid': confirmationText && !isConfirmationValid }"
                :disabled="isDeleting"
              />
              <div v-if="confirmationText && !isConfirmationValid" class="confirmation-error">
                <i class="fas fa-times-circle"></i>
                <span>Debes escribir exactamente "Eliminar"</span>
              </div>
              <div v-if="isConfirmationValid" class="confirmation-success">
                <i class="fas fa-check-circle"></i>
                <span>Confirmación válida</span>
              </div>
            </div>
          </div>

          <!-- Impact Warning -->
          <div class="impact-warning">
            <div class="impact-icon">
              <i class="fas fa-info-circle"></i>
            </div>
            <div class="impact-content">
              <h5>Impacto de la eliminación:</h5>
              <ul>
                <li>El usuario no podrá iniciar sesión</li>
                <li>Se perderán todos los datos asociados</li>
                <li>Los menús y documentos creados por este usuario se mantendrán</li>
                <li>Esta acción no se puede deshacer</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <div class="footer-actions">
          <button
            @click="handleClose"
            class="action-btn cancel-btn"
            :disabled="isDeleting"
          >
            <i class="fas fa-times"></i>
            Cancelar
          </button>
          <button
            @click="handleDelete"
            class="action-btn delete-btn"
            :disabled="!isConfirmationValid || isDeleting"
          >
            <i class="fas fa-trash" :class="{ 'fa-spin': isDeleting }"></i>
            {{ isDeleting ? 'Eliminando...' : 'Eliminar Usuario' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import userService from '@/services/userService'

// Props
const props = defineProps({
  user: {
    type: Object,
    required: true
  },
  show: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'confirmed'])

// Reactive data
const isDeleting = ref(false)
const confirmationText = ref('')

// Computed
const isConfirmationValid = computed(() => confirmationText.value === 'Eliminar')

// Methods
const handleClose = () => {
  if (!isDeleting.value) {
    confirmationText.value = ''
    emit('close')
  }
}

const handleDelete = async () => {
  if (!isConfirmationValid.value) return

  try {
    isDeleting.value = true
    console.log('🗑️ [DELETE USER MODAL] Eliminando usuario:', props.user.id)

    await userService.deleteUser(props.user.id)

    console.log('✅ [DELETE USER MODAL] Usuario eliminado exitosamente')
    emit('confirmed')
  } catch (error) {
    console.error('❌ [DELETE USER MODAL] Error eliminando usuario:', error)
    // Handle error - could show a toast or error message
  } finally {
    isDeleting.value = false
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Watchers
watch(() => props.show, (newValue) => {
  if (newValue) {
    confirmationText.value = ''
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-overlay, rgba(0, 0, 0, 0.6));
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: var(--bg-primary);
  border-radius: 16px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Modal Header */
.modal-header {
  background: var(--error-color);
  color: white;
  padding: 2rem;
  border-radius: 16px 16px 0 0;
  position: relative;
}

.modal-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  pointer-events: none;
  z-index: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 3rem;
  height: 3rem;
  background: var(--bg-overlay-medium, rgba(255, 255, 255, 0.2));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--text-inverse);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.modal-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-inverse);
  line-height: 1.2;
}

.modal-subtitle {
  font-size: 1rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
  font-weight: 400;
}

.close-btn {
  background: var(--bg-overlay-medium, rgba(255, 255, 255, 0.2));
  border: none;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-inverse);
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.close-btn:hover:not(:disabled) {
  background: var(--bg-overlay-light, rgba(255, 255, 255, 0.3));
  transform: scale(1.05);
}

.close-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal Body */
.modal-body {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.delete-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  text-align: center;
}

.warning-icon {
  font-size: 4rem;
  color: var(--error-color);
  margin-bottom: 1rem;
}

.user-info {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
}

.user-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.detail-item i {
  color: var(--primary-color);
  width: 1rem;
  text-align: center;
}

.warning-message {
  background: var(--error-bg);
  border: 1px solid var(--error-light);
  border-radius: 8px;
  padding: 1.5rem;
}

.warning-message h4 {
  color: var(--error-color);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
}

.warning-message p {
  color: var(--text-primary);
  margin: 0;
  line-height: 1.5;
}

/* Confirmation Section */
.confirmation-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
}

.confirmation-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
  font-weight: 500;
}

.confirmation-info i {
  color: var(--warning-color);
  font-size: 1.1rem;
}

.confirmation-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.confirmation-field {
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s ease;
  text-align: center;
}

.confirmation-field:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.confirmation-field.valid {
  border-color: var(--success-color);
  background: var(--success-bg);
}

.confirmation-field.invalid {
  border-color: var(--error-color);
  background: var(--error-bg);
}

.confirmation-field:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.confirmation-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--error-color);
  font-size: 0.8rem;
}

.confirmation-error i {
  font-size: 0.75rem;
}

.confirmation-success {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--success-color);
  font-size: 0.8rem;
}

.confirmation-success i {
  font-size: 0.75rem;
}

/* Impact Warning */
.impact-warning {
  display: flex;
  gap: 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: left;
}

.impact-icon {
  color: var(--primary-color);
  font-size: 1.5rem;
  margin-top: 0.25rem;
}

.impact-content h5 {
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
}

.impact-content ul {
  margin: 0;
  padding-left: 1.25rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
}

.impact-content li {
  margin-bottom: 0.5rem;
}

/* Modal Footer */
.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  min-width: 120px;
  justify-content: center;
}

.cancel-btn {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.cancel-btn:hover:not(:disabled) {
  background: var(--bg-hover);
  transform: translateY(-1px);
}

.delete-btn {
  background: var(--error-color);
  color: white;
}

.delete-btn:hover:not(:disabled) {
  background: var(--error-hover);
  transform: translateY(-1px);
}

.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    margin: 0.5rem;
    max-height: 95vh;
  }

  .modal-header {
    padding: 1.5rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .modal-footer {
    padding: 1rem 1.5rem;
  }

  .footer-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }

  .impact-warning {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
