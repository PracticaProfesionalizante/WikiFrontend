<template>
  <div class="settings-layout">
    <SidebarMenu @sidebar-toggle="handleSidebarToggle" />
    <AppHeader :sidebar-expanded="sidebarExpanded" />
    <main class="main-content" :class="{ 'with-sidebar': true, 'with-header': true }">
      <div class="settings-container">
        <div class="settings-content">
          <div class="settings-header">
            <h1 class="settings-title">
              <i class="mdi mdi-cog"></i>
              Configuración de Perfil
            </h1>
            <p class="settings-subtitle">
              Gestiona tu información personal y preferencias de cuenta
            </p>
          </div>

          <div class="settings-sections">
            <!-- Información Personal -->
            <div class="settings-section">
              <div class="section-header">
                <h2 class="section-title">
                  <i class="mdi mdi-account-circle"></i>
                  Información Personal
                </h2>
              </div>
              <div class="section-content">
                <form @submit.prevent="updateProfile" class="profile-form">
                  <div class="form-row">
                    <div class="input-group">
                      <label class="input-label">Nombre de Usuario</label>
                      <input 
                        v-model="profileData.username"
                        type="text" 
                        class="form-input"
                        :class="{ 'error': errors.username }"
                        placeholder="Ingresa tu nombre de usuario"
                      >
                      <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
                    </div>
                    <div class="input-group">
                      <label class="input-label">Correo Electrónico</label>
                      <input 
                        v-model="profileData.email"
                        type="email" 
                        class="form-input"
                        :class="{ 'error': errors.email }"
                        placeholder="tu@email.com"
                      >
                      <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="input-group">
                      <label class="input-label">Nombre Completo</label>
                      <input 
                        v-model="profileData.fullName"
                        type="text" 
                        class="form-input"
                        placeholder="Tu nombre completo"
                      >
                    </div>
                    <div class="input-group">
                      <label class="input-label">Teléfono</label>
                      <input 
                        v-model="profileData.phone"
                        type="tel" 
                        class="form-input"
                        placeholder="+54 9 11 1234-5678"
                      >
                    </div>
                  </div>
                  <div class="form-actions">
                    <button 
                      type="submit" 
                      class="btn btn-primary"
                      :disabled="isUpdatingProfile"
                    >
                      <i v-if="isUpdatingProfile" class="mdi mdi-loading mdi-spin"></i>
                      <i v-else class="mdi mdi-content-save"></i>
                      {{ isUpdatingProfile ? 'Guardando...' : 'Guardar Cambios' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Cambio de Contraseña -->
            <div class="settings-section">
              <div class="section-header">
                <h2 class="section-title">
                  <i class="mdi mdi-lock"></i>
                  Seguridad
                </h2>
              </div>
              <div class="section-content">
                <form @submit.prevent="changePassword" class="password-form">
                  <div class="input-group">
                    <label class="input-label">Contraseña Actual</label>
                    <div class="password-input-wrapper">
                      <input 
                        v-model="passwordData.currentPassword"
                        :type="showCurrentPassword ? 'text' : 'password'"
                        class="form-input"
                        :class="{ 'error': errors.currentPassword }"
                        placeholder="Ingresa tu contraseña actual"
                      >
                      <button 
                        type="button" 
                        class="password-toggle"
                        @click="showCurrentPassword = !showCurrentPassword"
                      >
                        <i :class="showCurrentPassword ? 'mdi mdi-eye-off' : 'mdi mdi-eye'"></i>
                      </button>
                    </div>
                    <span v-if="errors.currentPassword" class="error-message">{{ errors.currentPassword }}</span>
                  </div>
                  <div class="form-row">
                    <div class="input-group">
                      <label class="input-label">Nueva Contraseña</label>
                      <div class="password-input-wrapper">
                        <input 
                          v-model="passwordData.newPassword"
                          :type="showNewPassword ? 'text' : 'password'"
                          class="form-input"
                          :class="{ 'error': errors.newPassword }"
                          placeholder="Mínimo 6 caracteres"
                        >
                        <button 
                          type="button" 
                          class="password-toggle"
                          @click="showNewPassword = !showNewPassword"
                        >
                          <i :class="showNewPassword ? 'mdi mdi-eye-off' : 'mdi mdi-eye'"></i>
                        </button>
                      </div>
                      <span v-if="errors.newPassword" class="error-message">{{ errors.newPassword }}</span>
                    </div>
                    <div class="input-group">
                      <label class="input-label">Confirmar Nueva Contraseña</label>
                      <div class="password-input-wrapper">
                        <input 
                          v-model="passwordData.confirmPassword"
                          :type="showConfirmPassword ? 'text' : 'password'"
                          class="form-input"
                          :class="{ 'error': errors.confirmPassword }"
                          placeholder="Repite la nueva contraseña"
                        >
                        <button 
                          type="button" 
                          class="password-toggle"
                          @click="showConfirmPassword = !showConfirmPassword"
                        >
                          <i :class="showConfirmPassword ? 'mdi mdi-eye-off' : 'mdi mdi-eye'"></i>
                        </button>
                      </div>
                      <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
                    </div>
                  </div>
                  <div class="form-actions">
                    <button 
                      type="submit" 
                      class="btn btn-primary"
                      :disabled="isChangingPassword"
                    >
                      <i v-if="isChangingPassword" class="mdi mdi-loading mdi-spin"></i>
                      <i v-else class="mdi mdi-shield-check"></i>
                      {{ isChangingPassword ? 'Cambiando...' : 'Cambiar Contraseña' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Preferencias -->
            <div class="settings-section">
              <div class="section-header">
                <h2 class="section-title">
                  <i class="mdi mdi-tune"></i>
                  Preferencias
                </h2>
              </div>
              <div class="section-content">
                <div class="preferences-grid">
                  <div class="preference-item">
                    <div class="preference-info">
                      <h3 class="preference-title">Notificaciones por Email</h3>
                      <p class="preference-description">Recibe notificaciones importantes en tu correo</p>
                    </div>
                    <label class="toggle-switch">
                      <input 
                        v-model="preferences.emailNotifications" 
                        type="checkbox"
                        @change="updatePreferences"
                      >
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                  <div class="preference-item">
                    <div class="preference-info">
                      <h3 class="preference-title">Modo Oscuro</h3>
                      <p class="preference-description">Cambia la apariencia de la interfaz</p>
                    </div>
                    <label class="toggle-switch">
                      <input 
                        v-model="preferences.darkMode" 
                        type="checkbox"
                        @change="updatePreferences"
                      >
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                  <div class="preference-item">
                    <div class="preference-info">
                      <h3 class="preference-title">Sonidos del Sistema</h3>
                      <p class="preference-description">Reproducir sonidos para acciones importantes</p>
                    </div>
                    <label class="toggle-switch">
                      <input 
                        v-model="preferences.systemSounds" 
                        type="checkbox"
                        @change="updatePreferences"
                      >
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Success/Error Messages -->
    <div v-if="successMessage" class="notification success">
      <i class="mdi mdi-check-circle"></i>
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="notification error">
      <i class="mdi mdi-alert-circle"></i>
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import SidebarMenu from '@/components/common/SidebarMenu.vue'
import AppHeader from '@/components/common/AppHeader.vue'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'
import { ref, reactive, onMounted, watch } from 'vue'

// Composables
const authStore = useAuthStore()
const { user } = authStore
const { isDarkMode, setTheme } = useTheme()

// Estado del sidebar
const sidebarExpanded = ref(false)

// Estados de formularios
const isUpdatingProfile = ref(false)
const isChangingPassword = ref(false)

// Estados de visibilidad de contraseñas
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Mensajes
const successMessage = ref('')
const errorMessage = ref('')

// Datos del perfil
const profileData = reactive({
  username: '',
  email: '',
  fullName: '',
  phone: ''
})

// Datos de contraseña
const passwordData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Preferencias
const preferences = reactive({
  emailNotifications: true,
  darkMode: false,
  systemSounds: true
})

// Errores de validación
const errors = reactive({
  username: '',
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Métodos
const handleSidebarToggle = (expanded) => {
  sidebarExpanded.value = expanded
}

const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
}

const clearMessages = () => {
  successMessage.value = ''
  errorMessage.value = ''
}

const showMessage = (message, type = 'success') => {
  clearMessages()
  if (type === 'success') {
    successMessage.value = message
  } else {
    errorMessage.value = message
  }
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    clearMessages()
  }, 5000)
}

const validateProfile = () => {
  clearErrors()
  let isValid = true

  if (!profileData.username.trim()) {
    errors.username = 'El nombre de usuario es requerido'
    isValid = false
  }

  if (!profileData.email.trim()) {
    errors.email = 'El correo electrónico es requerido'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
    errors.email = 'Ingresa un correo electrónico válido'
    isValid = false
  }

  return isValid
}

const validatePassword = () => {
  clearErrors()
  let isValid = true

  if (!passwordData.currentPassword) {
    errors.currentPassword = 'La contraseña actual es requerida'
    isValid = false
  }

  if (!passwordData.newPassword) {
    errors.newPassword = 'La nueva contraseña es requerida'
    isValid = false
  } else if (passwordData.newPassword.length < 6) {
    errors.newPassword = 'La contraseña debe tener al menos 6 caracteres'
    isValid = false
  }

  if (passwordData.newPassword !== passwordData.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden'
    isValid = false
  }

  return isValid
}

const updateProfile = async () => {
  if (!validateProfile()) return

  isUpdatingProfile.value = true
  clearMessages()

  try {
    // Simular API call - aquí integrarías con tu backend
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Actualizar datos en el store si es necesario
    // await authStore.updateProfile(profileData)
    
    showMessage('Perfil actualizado correctamente', 'success')
  } catch (error) {
    console.error('Error al actualizar perfil:', error)
    showMessage('Error al actualizar el perfil. Inténtalo de nuevo.', 'error')
  } finally {
    isUpdatingProfile.value = false
  }
}

const changePassword = async () => {
  if (!validatePassword()) return

  isChangingPassword.value = true
  clearMessages()

  try {
    // Simular API call - aquí integrarías con tu backend
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Limpiar campos de contraseña
    passwordData.currentPassword = ''
    passwordData.newPassword = ''
    passwordData.confirmPassword = ''
    
    showMessage('Contraseña cambiada correctamente', 'success')
  } catch (error) {
    console.error('Error al cambiar contraseña:', error)
    showMessage('Error al cambiar la contraseña. Verifica tu contraseña actual.', 'error')
  } finally {
    isChangingPassword.value = false
  }
}

const updatePreferences = async () => {
  try {
    // Actualizar el tema cuando cambie la preferencia
    setTheme(preferences.darkMode)
    
    // Simular API call - aquí integrarías con tu backend
    await new Promise(resolve => setTimeout(resolve, 500))
    
    showMessage('Preferencias actualizadas', 'success')
  } catch (error) {
    console.error('Error al actualizar preferencias:', error)
    showMessage('Error al actualizar las preferencias', 'error')
  }
}

// Inicializar datos
onMounted(() => {
  if (user) {
    profileData.username = user.username || ''
    profileData.email = user.email || ''
    profileData.fullName = user.name || ''
    profileData.phone = user.phone || ''
  }
  
  // Sincronizar el estado inicial del tema
  preferences.darkMode = isDarkMode.value
})

// Watcher para sincronizar cambios del tema global
watch(isDarkMode, (newValue) => {
  preferences.darkMode = newValue
})
</script>

<style scoped>
.settings-layout {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

.main-content {
  flex: 1;
  margin-left: 60px;
  transition: margin-left 0.3s ease;
  min-height: 100vh;
  background-image: url('/src/assets/images/backgrounds/ajustes-usuario.webp');
  background-size: contain;
  background-position: center center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  position: relative;
}

.main-content.with-header {
  padding-top: 70px;
}

.main-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 20, 40, 0.7);
  z-index: 1;
}

.settings-container {
  position: relative;
  z-index: 2;
  padding: 2rem;
  min-height: calc(100vh - 70px);
}

.settings-content {
  max-width: 1200px;
  margin: 0 auto;
}

.settings-header {
  text-align: center;
  margin-bottom: 3rem;
  background: var(--bg-primary);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 60px var(--shadow-color);
  border: 1px solid var(--border-color);
}

.settings-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: linear-gradient(135deg, var(--accent-color), #1d4ed8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.settings-title i {
  font-size: 2.5rem;
  color: var(--accent-color);
  -webkit-text-fill-color: var(--accent-color);
}

.settings-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
}

.settings-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.settings-section {
  background: var(--bg-primary);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 20px 60px var(--shadow-color);
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: all 0.3s ease;
}

.settings-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 25px 70px var(--shadow-color);
}

.section-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-title i {
  color: var(--accent-color);
  font-size: 1.5rem;
}

.section-content {
  padding: 2rem;
}

.profile-form,
.password-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: var(--bg-primary);
  color: var(--text-primary);
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 4px var(--focus-shadow);
  transform: translateY(-1px);
}

.form-input:hover:not(:focus) {
  border-color: var(--text-muted);
}

.form-input.error {
  border-color: #dc2626;
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.15);
}

.password-input-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.password-toggle:hover {
  color: var(--accent-color);
  background: var(--bg-hover);
}

.error-message {
  font-size: 0.8rem;
  color: #dc2626;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-color), #1d4ed8);
  color: white;
  box-shadow: 0 4px 15px var(--shadow-color);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px var(--shadow-color);
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.preferences-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.preference-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.preference-item:hover {
  background: var(--bg-hover);
  transform: translateX(4px);
}

.preference-info {
  flex: 1;
}

.preference-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.preference-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--text-muted);
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input:checked + .toggle-slider {
  background: linear-gradient(135deg, var(--accent-color), #1d4ed8);
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.notification {
  position: fixed;
  top: 90px;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  color: white;
  font-weight: 500;
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: slideInRight 0.3s ease;
}

.notification.success {
  background: linear-gradient(135deg, #10b981, #059669);
}

.notification.error {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .settings-container {
    padding: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .settings-title {
    font-size: 2rem;
  }
  
  .notification {
    right: 1rem;
    left: 1rem;
  }
}

@media (max-width: 480px) {
  .settings-header {
    padding: 1.5rem;
  }
  
  .section-content {
    padding: 1.5rem;
  }
  
  .settings-title {
    font-size: 1.75rem;
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>