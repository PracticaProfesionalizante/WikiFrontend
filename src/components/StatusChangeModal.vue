<template>
  <div v-if="show" class="modal-overlay" @click="handleClose">
    <div class="modal-container" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-content">
          <div class="header-title">
            <div class="header-icon">
              <i :class="user.enabled ? 'fas fa-user-times' : 'fas fa-user-check'"></i>
            </div>
            <div class="header-text">
              <h2 class="modal-title">
                {{ user.enabled ? 'Desactivar Usuario' : 'Activar Usuario' }}
              </h2>
              <p class="modal-subtitle">
                {{ user.enabled ? 'El usuario no podrá iniciar sesión' : 'El usuario podrá iniciar sesión' }}
              </p>
            </div>
          </div>
          <button @click="handleClose" class="close-btn" :disabled="isChanging">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <div class="status-content">
          <!-- User Info -->
          <div class="user-info">
            <div class="user-avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="user-details">
              <h3 class="user-name">{{ user.username }}</h3>
              <div class="user-meta">
                <span class="user-email">
                  <i class="fas fa-envelope"></i>
                  {{ user.email }}
                </span>
                <span class="user-roles">
                  <i class="fas fa-user-shield"></i>
                  {{ user.roles.join(', ') }}
                </span>
              </div>
            </div>
          </div>

          <!-- Status Change Details -->
          <div class="status-change-details">
            <div class="status-comparison">
              <div class="status-item current">
                <div class="status-icon-small">
                  <i :class="getStatusIcon(user.enabled)"></i>
                </div>
                <div class="status-text">
                  <span class="status-label">Estado actual</span>
                  <span class="status-value">{{ user.enabled ? 'Activo' : 'Inactivo' }}</span>
                </div>
              </div>

              <div class="status-arrow">
                <i class="fas fa-arrow-right"></i>
              </div>

              <div class="status-item new" :class="{ 'deactivate': user.enabled }">
                <div class="status-icon-small">
                  <i :class="user.enabled ? 'fas fa-times-circle' : 'fas fa-check-circle'"></i>
                </div>
                <div class="status-text">
                  <span class="status-label">Nuevo estado</span>
                  <span class="status-value">{{ user.enabled ? 'Inactivo' : 'Activo' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Impact Information -->
          <div class="impact-info">
            <div class="impact-icon">
              <i class="fas fa-info-circle"></i>
            </div>
            <div class="impact-content">
              <h5>{{ user.enabled ? 'Al desactivar este usuario:' : 'Al activar este usuario:' }}</h5>
              <ul v-if="user.enabled">
                <li>No podrá iniciar sesión en el sistema</li>
                <li>Sus sesiones activas serán terminadas</li>
                <li>Mantendrá acceso a los datos que ya tiene</li>
                <li>Puede ser reactivado en cualquier momento</li>
              </ul>
              <ul v-else>
                <li>Podrá iniciar sesión normalmente</li>
                <li>Tendrá acceso según sus roles asignados</li>
                <li>Sus datos se mantienen intactos</li>
                <li>Puede ser desactivado nuevamente si es necesario</li>
              </ul>
            </div>
          </div>

          <!-- Confirmation Message -->
          <div class="confirmation-message">
            <div class="confirmation-icon">
              <i class="fas fa-question-circle"></i>
            </div>
            <div class="confirmation-text">
              <h4>¿Estás seguro de que deseas {{ user.enabled ? 'desactivar' : 'activar' }} este usuario?</h4>
              <p>
                Esta acción {{ user.enabled ? 'desactivará' : 'activará' }} el usuario
                <strong>{{ user.username }}</strong> y {{ user.enabled ? 'le impedirá' : 'le permitirá' }}
                iniciar sesión en el sistema.
              </p>
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
            :disabled="isChanging"
          >
            <i class="fas fa-times"></i>
            Cancelar
          </button>
          <button
            @click="handleStatusChange"
            class="action-btn confirm-btn"
            :class="{ 'activate': !user.enabled, 'deactivate': user.enabled }"
            :disabled="isChanging"
          >
            <i :class="[user.enabled ? 'fas fa-ban' : 'fas fa-check', { 'fa-spin': isChanging }]"></i>
            {{ isChanging ? 'Procesando...' : (user.enabled ? 'Desactivar' : 'Activar') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
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
const isChanging = ref(false)

// Methods
const handleClose = () => {
  if (!isChanging.value) {
    emit('close')
  }
}

const handleStatusChange = async () => {
  try {
    isChanging.value = true
    console.log('🔄 [STATUS CHANGE MODAL] Cambiando estado del usuario:', props.user.id, 'a', !props.user.enabled)

    const updateData = {
      username: props.user.username,
      email: props.user.email,
      enabled: !props.user.enabled,
      roles: props.user.roles
    }

    await userService.updateUser(props.user.id, updateData)

    console.log('✅ [STATUS CHANGE MODAL] Estado del usuario cambiado exitosamente')
    emit('confirmed')
  } catch (error) {
    console.error('❌ [STATUS CHANGE MODAL] Error cambiando estado del usuario:', error)
    // Handle error - could show a toast or error message
  } finally {
    isChanging.value = false
  }
}

const getStatusIcon = (enabled) => {
  return enabled ? 'fas fa-check-circle' : 'fas fa-times-circle'
}
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
  background: var(--warning-color);
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

.status-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* User Info */
.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
}

.user-avatar {
  width: 3rem;
  height: 3rem;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-email,
.user-roles {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.user-email i,
.user-roles i {
  color: var(--primary-color);
  width: 1rem;
  text-align: center;
}

/* Status Change Details */
.status-change-details {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
}

.status-comparison {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  min-width: 150px;
}

.status-item.current {
  background: var(--bg-hover);
  border-color: var(--primary-color);
}

.status-item.new {
  background: var(--success-bg);
  border-color: var(--success-color);
}

.status-item.new.deactivate {
  background: var(--error-bg);
  border-color: var(--error-color);
}

.status-icon-small {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.status-item.current .status-icon-small {
  background: var(--primary-color);
  color: white;
}

.status-item.new .status-icon-small {
  background: var(--success-color);
  color: white;
}

.status-item.new.deactivate .status-icon-small {
  background: var(--error-color);
  color: white;
}

.status-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.status-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.status-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.status-arrow {
  color: var(--text-secondary);
  font-size: 1.5rem;
}

/* Impact Information */
.impact-info {
  display: flex;
  gap: 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
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

/* Confirmation Message */
.confirmation-message {
  display: flex;
  gap: 1rem;
  background: var(--warning-bg);
  border: 1px solid var(--warning-light);
  border-radius: 8px;
  padding: 1.5rem;
}

.confirmation-icon {
  color: var(--warning-color);
  font-size: 1.5rem;
  margin-top: 0.25rem;
}

.confirmation-text h4 {
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
}

.confirmation-text p {
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
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

.confirm-btn {
  color: white;
}

.confirm-btn.activate {
  background: var(--success-color);
}

.confirm-btn.activate:hover:not(:disabled) {
  background: var(--success-hover);
  transform: translateY(-1px);
}

.confirm-btn.deactivate {
  background: var(--error-color);
}

.confirm-btn.deactivate:hover:not(:disabled) {
  background: var(--error-hover);
  transform: translateY(-1px);
}

.confirm-btn:disabled {
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

  .status-comparison {
    flex-direction: column;
    gap: 1rem;
  }

  .status-arrow {
    transform: rotate(90deg);
  }

  .footer-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }

  .impact-info,
  .confirmation-message {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
