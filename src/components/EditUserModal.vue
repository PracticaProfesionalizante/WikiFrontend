<template>
  <div v-if="show" class="modal-overlay" @click="handleClose">
    <div class="modal-container" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-content">
          <div class="header-title">
            <div class="header-icon">
              <i class="fas fa-user-edit"></i>
            </div>
            <div class="header-text">
              <h2 class="modal-title">Editar Usuario</h2>
              <p class="modal-subtitle">Modifica los datos del usuario</p>
            </div>
          </div>
          <button @click="handleClose" class="close-btn" :disabled="isSaving">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <form @submit.prevent="handleSubmit" class="edit-form">
          <!-- User Info Section -->
          <div class="form-section">
            <h3 class="section-title">
              <i class="fas fa-info-circle"></i>
              Información Básica
            </h3>

            <div class="form-grid">
              <div class="form-group">
                <label for="username" class="form-label">
                  <i class="fas fa-user"></i>
                  Nombre de Usuario
                  <span class="required">*</span>
                </label>
                <input
                  id="username"
                  v-model="formData.username"
                  type="text"
                  class="form-input"
                  :class="{ 'error': validationErrors.username }"
                  placeholder="Ingresa el nombre de usuario"
                  required
                  :disabled="isSaving"
                />
                <div v-if="validationErrors.username" class="error-message">
                  <i class="fas fa-exclamation-circle"></i>
                  {{ validationErrors.username }}
                </div>
              </div>

              <div class="form-group">
                <label for="email" class="form-label">
                  <i class="fas fa-envelope"></i>
                  Email
                  <span class="required">*</span>
                </label>
                <input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  class="form-input"
                  :class="{ 'error': validationErrors.email }"
                  placeholder="Ingresa el email del usuario"
                  required
                  :disabled="isSaving"
                />
                <div v-if="validationErrors.email" class="error-message">
                  <i class="fas fa-exclamation-circle"></i>
                  {{ validationErrors.email }}
                </div>
              </div>
            </div>
          </div>

          <!-- Password Section -->
          <div class="form-section">
            <h3 class="section-title">
              <i class="fas fa-lock"></i>
              Contraseña
            </h3>

            <div class="form-group">
              <label for="password" class="form-label">
                <i class="fas fa-key"></i>
                Nueva Contraseña
                <span class="optional">(Opcional)</span>
              </label>
              <div class="password-input-container">
                <input
                  id="password"
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-input"
                  :class="{ 'error': validationErrors.password }"
                  placeholder="Deja vacío para mantener la contraseña actual"
                  :disabled="isSaving"
                />
                <button
                  type="button"
                  @click="togglePasswordVisibility"
                  class="password-toggle"
                  :disabled="isSaving"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <div v-if="validationErrors.password" class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                {{ validationErrors.password }}
              </div>
              <div class="help-text">
                <i class="fas fa-info-circle"></i>
                Si no ingresas una nueva contraseña, se mantendrá la actual
              </div>
            </div>
          </div>

          <!-- Status Section -->
          <div class="form-section">
            <h3 class="section-title">
              <i class="fas fa-toggle-on"></i>
              Estado del Usuario
            </h3>

            <div class="form-group">
              <label class="checkbox-label">
                <input
                  v-model="formData.enabled"
                  type="checkbox"
                  class="checkbox-input"
                  :disabled="isSaving"
                />
                <span class="checkbox-custom"></span>
                <div class="checkbox-content">
                  <span class="checkbox-title">Usuario Activo</span>
                  <span class="checkbox-description">
                    Los usuarios inactivos no pueden iniciar sesión
                  </span>
                </div>
              </label>
            </div>
          </div>

          <!-- Roles Section -->
          <div class="form-section">
            <h3 class="section-title">
              <i class="fas fa-users"></i>
              Roles y Permisos
            </h3>

            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-shield-alt"></i>
                Roles del Usuario
                <span class="required">*</span>
              </label>

              <!-- Super User Role (Always Present) -->
              <div class="super-user-always-present">
                <div class="role-option super-user-option">
                  <label class="checkbox-label disabled">
                    <input
                      type="checkbox"
                      class="role-checkbox"
                      checked
                      disabled
                    />
                    <span class="role-label">
                      <i class="fas fa-crown"></i>
                      <span class="role-name">
                        <strong>Super Usuario</strong>
                        <small>Acceso completo al sistema (siempre incluido)</small>
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              <!-- Available Roles -->
              <div class="roles-grid">
                <div
                  v-for="role in availableRoles"
                  :key="role.value"
                  class="role-option"
                  :class="{ 'selected': formData.roles.includes(role.value) }"
                >
                  <label class="checkbox-label">
                    <input
                      v-model="formData.roles"
                      :value="role.value"
                      type="checkbox"
                      class="role-checkbox"
                      :disabled="isSaving"
                    />
                    <span class="role-label">
                      <i :class="role.icon"></i>
                      <span class="role-name">
                        <strong>{{ role.label }}</strong>
                        <small>{{ role.description }}</small>
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              <div v-if="validationErrors.roles" class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                {{ validationErrors.roles }}
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <div class="footer-actions">
          <button
            @click="handleClose"
            class="action-btn cancel-btn"
            :disabled="isSaving"
          >
            <i class="fas fa-times"></i>
            Cancelar
          </button>
          <button
            @click="handleSubmit"
            class="action-btn save-btn"
            :disabled="!isFormValid || isSaving"
            type="button"
          >
            <i class="fas fa-save" :class="{ 'fa-spin': isSaving }"></i>
            {{ isSaving ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
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
const emit = defineEmits(['close', 'saved'])

// Reactive data
const isSaving = ref(false)
const showPassword = ref(false)
const validationErrors = ref({})

const formData = ref({
  username: '',
  email: '',
  password: '',
  enabled: true,
  roles: ['ROLE_SUPER_USER']
})

// Available roles (excluding SUPER_USER as it's always present)
const availableRoles = [
  {
    value: 'ROLE_ADMIN',
    label: 'Administrador',
    icon: 'fas fa-user-shield',
    description: 'Gestión de usuarios y configuración'
  },
  {
    value: 'ROLE_COLLABORATOR',
    label: 'Colaborador',
    icon: 'fas fa-user-group',
    description: 'Acceso a funciones básicas'
  },
  {
    value: 'ROLE_USER',
    label: 'Usuario',
    icon: 'fas fa-user',
    description: 'Acceso básico al sistema'
  }
]

// Computed
const isFormValid = computed(() => {
  return (
    formData.value.username &&
    formData.value.email &&
    formData.value.roles &&
    formData.value.roles.length > 0 &&
    Object.keys(validationErrors.value).length === 0
  )
})

// Methods
const initializeForm = () => {
  if (props.user) {
    formData.value = {
      username: props.user.username || '',
      email: props.user.email || '',
      password: '',
      enabled: props.user.enabled !== undefined ? props.user.enabled : true,
      roles: props.user.roles ? [...props.user.roles] : ['ROLE_SUPER_USER']
    }
  }

  // Ensure SUPER_USER is always present
  if (!formData.value.roles.includes('ROLE_SUPER_USER')) {
    formData.value.roles.unshift('ROLE_SUPER_USER')
  }

  validationErrors.value = {}
}

const validateForm = () => {
  const errors = {}

  if (!formData.value.username.trim()) {
    errors.username = 'El nombre de usuario es requerido'
  }

  if (!formData.value.email.trim()) {
    errors.email = 'El email es requerido'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    errors.email = 'El email no tiene un formato válido'
  }

  if (formData.value.password && formData.value.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres'
  }

  if (!formData.value.roles || formData.value.roles.length === 0) {
    errors.roles = 'Debe seleccionar al menos un rol'
  }

  validationErrors.value = errors
  return Object.keys(errors).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    console.log('❌ [EDIT USER MODAL] Formulario inválido')
    return
  }

  try {
    isSaving.value = true
    console.log('💾 [EDIT USER MODAL] Guardando usuario:', props.user.id)

    // Prepare data for API
    const updateData = {
      username: formData.value.username,
      email: formData.value.email,
      enabled: formData.value.enabled,
      roles: formData.value.roles
    }

    // Only include password if provided
    if (formData.value.password.trim()) {
      updateData.password = formData.value.password
    }

    await userService.updateUser(props.user.id, updateData)

    console.log('✅ [EDIT USER MODAL] Usuario actualizado exitosamente')
    emit('saved')
  } catch (error) {
    console.error('❌ [EDIT USER MODAL] Error actualizando usuario:', error)

    // Handle validation errors from server
    if (error.response?.status === 400) {
      const serverErrors = error.response.data
      if (serverErrors.errors) {
        validationErrors.value = serverErrors.errors
      }
    }
  } finally {
    isSaving.value = false
  }
}

const handleClose = () => {
  if (!isSaving.value) {
    emit('close')
  }
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// Watchers
watch(() => props.user, initializeForm, { immediate: true })
watch(() => props.show, (newValue) => {
  if (newValue) {
    initializeForm()
  }
})

// Lifecycle
onMounted(() => {
  initializeForm()
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
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Modal Header */
.modal-header {
  background: var(--primary-color);
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

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--border-color);
}

.section-title i {
  color: var(--primary-color);
  font-size: 1.1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.form-label i {
  color: var(--primary-color);
  font-size: 1rem;
}

.required {
  color: var(--error-color);
  font-weight: 700;
}

.optional {
  color: var(--text-secondary);
  font-weight: 400;
  font-size: 0.8rem;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error {
  border-color: var(--error-color);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.password-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.password-toggle:hover:not(:disabled) {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.password-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  transition: all 0.2s ease;
}

.checkbox-label:hover {
  background: var(--bg-hover);
  border-color: var(--primary-color);
}

.checkbox-label.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.checkbox-input:checked + .checkbox-custom {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
}

.checkbox-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.checkbox-title {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.checkbox-description {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.3;
}

/* Roles Section */
.super-user-always-present {
  margin-bottom: 1rem;
}

.super-user-option {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05));
  border: 2px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
  padding: 1rem;
  position: relative;
}

.super-user-option::before {
  content: '✓';
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: var(--success-color);
  color: white;
  border-radius: 50%;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.role-option {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  transition: all 0.2s ease;
}

.role-option:hover {
  border-color: var(--primary-color);
  background: var(--bg-hover);
}

.role-option.selected {
  border-color: var(--primary-color);
  background: var(--bg-active);
}

.role-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  width: 100%;
}

.role-label i {
  color: var(--primary-color);
  font-size: 1.1rem;
}

.role-name {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.role-name strong {
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 600;
}

.role-name small {
  color: var(--text-secondary);
  font-size: 0.8rem;
  line-height: 1.3;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--error-color);
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.error-message i {
  font-size: 0.75rem;
}

.help-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.help-text i {
  font-size: 0.75rem;
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

.save-btn {
  background: var(--primary-color);
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.save-btn:disabled {
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

  .form-grid {
    grid-template-columns: 1fr;
  }

  .roles-grid {
    grid-template-columns: 1fr;
  }

  .footer-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}
</style>
