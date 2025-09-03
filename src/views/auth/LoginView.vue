<template>
  <div class="login-container">
    <div class="login-form-wrapper">
      <!-- TecLab Logo -->
      <div class="logo-section">
        <img 
          src="https://ext.same-assets.com/1581574844/2857473926.png" 
          alt="TecLab Logo" 
          class="teclab-logo"
        />
      </div>

      <!-- Greeting -->
      <div class="greeting-section">
        <h1 class="greeting-title">
          ¡Hola! Qué bueno tenerte por aquí.
        </h1>
        <p class="greeting-subtitle">
          Ingresá tu email y contraseña para acceder.
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="login-form">
        <!-- Email Input -->
        <div class="input-group">
          <input 
            v-model="credentials.email"
            type="email" 
            placeholder="Email" 
            class="form-input"
            :class="{ 'error': emailError }"
            @blur="validateEmail"
          />
        </div>

        <!-- Password Input -->
        <div class="input-group">
          <div class="password-wrapper">
            <input 
              v-model="credentials.password"
              :type="showPassword ? 'text' : 'password'" 
              placeholder="Contraseña" 
              class="form-input password-input"
              :class="{ 'error': passwordError }"
              @blur="validatePassword"
            />
            <button 
              type="button" 
              @click="showPassword = !showPassword" 
              class="password-toggle"
            >
              <i v-if="showPassword" class="mdi mdi-eye-off"></i>
              <i v-else class="mdi mdi-eye"></i>
            </button>
          </div>
        </div>

        <!-- Forgot Password Link -->
        <div class="forgot-password-section">
          <button 
            type="button" 
            @click="handleForgotPassword" 
            class="forgot-password-link"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <!-- Bottom Row -->
        <div class="bottom-row">
          <!-- Advisor Checkbox -->
          <div class="advisor-section">
            <input 
              id="advisor" 
              v-model="isAdvisor"
              type="checkbox" 
              class="advisor-checkbox"
            />
            <label for="advisor" class="advisor-label">
              Soy Asesor
            </label>
          </div>

          <!-- Next Button -->
          <button 
            type="submit" 
            :disabled="!isFormValid" 
            class="next-button"
            :class="{ 'disabled': !isFormValid }"
          >
            Siguiente
          </button>
        </div>
      </form>

      <!-- Error Display -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Composables
const router = useRouter()
const authStore = useAuthStore()

// Referencias reactivas
const showPassword = ref(false)
const isAdvisor = ref(false)
const emailError = ref(false)
const passwordError = ref(false)
const error = ref('')

// Credenciales del usuario
const credentials = reactive({
  email: '',
  password: ''
})

// Computed properties
const isFormValid = computed(() => {
  return credentials.email.length > 0 && 
         credentials.password.length >= 6 &&
         !emailError.value && 
         !passwordError.value
})

// Validation methods
const validateEmail = () => {
  const email = credentials.email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  emailError.value = !email || !emailRegex.test(email)
}

const validatePassword = () => {
  const password = credentials.password
  passwordError.value = !password || password.length < 6
}

// Función para manejar el login
const handleLogin = async () => {
  try {
    validateEmail()
    validatePassword()
    
    if (!isFormValid.value) {
      error.value = 'Por favor, completa todos los campos correctamente'
      return
    }

    error.value = ''
    const result = await authStore.login({
      email: credentials.email,
      password: credentials.password
    })
    
    if (result.success) {
      // Si el login es exitoso, obtener información del usuario
      await authStore.fetchUserInfo()
      
      // Redirigir al dashboard o página principal
      router.push('/')
    }
  } catch (err) {
    error.value = 'Error al iniciar sesión. Verifica tus credenciales.'
    console.error('Error durante el login:', err)
  }
}

// Función para manejar recuperación de contraseña
const handleForgotPassword = () => {
  // Implementar lógica de recuperación de contraseña
  console.log('Recuperar contraseña')
  // Aquí podrías abrir un modal o redirigir a una página de recuperación
}

// Función para manejar login de asesor
const handleAdvisorLogin = () => {
  // Implementar lógica para login de asesor
  console.log('Login de asesor')
  // Aquí podrías redirigir a una página específica para asesores
}

// Limpiar errores cuando el componente se monta
if (authStore.authError) {
  authStore.clearAuthError()
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
  padding: 20px;
}

.login-form-wrapper {
  width: 100%;
  max-width: 28rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Logo Section */
.logo-section {
  display: flex;
  justify-content: flex-start;
}

.teclab-logo {
  height: 3rem;
  width: auto;
}

/* Greeting Section */
.greeting-section {
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.greeting-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
  line-height: 1.2;
}

.greeting-subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 1rem;
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.form-input.error {
  border-color: #ef4444;
}

.password-wrapper {
  position: relative;
}

.password-input {
  padding-right: 3rem;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-toggle:hover {
  color: #374151;
}

/* Forgot Password */
.forgot-password-section {
  display: flex;
  justify-content: flex-end;
}

.forgot-password-link {
  background: none;
  border: none;
  color: #2563eb;
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: none;
}

.forgot-password-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

/* Bottom Row */
.bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.advisor-section {
  display: flex;
  align-items: center;
}

.advisor-checkbox {
  height: 1rem;
  width: 1rem;
  color: #2563eb;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  margin-right: 0.5rem;
}

.advisor-checkbox:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.advisor-label {
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
}

.next-button {
  padding: 0.75rem 2rem;
  background-color: #d1d5db;
  color: #6b7280;
  border: none;
  border-radius: 9999px;
  font-weight: 500;
  cursor: not-allowed;
  transition: all 0.2s ease;
}

.next-button:not(.disabled) {
  background-color: #2563eb;
  color: white;
  cursor: pointer;
}

.next-button:not(.disabled):hover {
  background-color: #1d4ed8;
}

/* Error Message */
.error-message {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  margin-top: 1rem;
}

/* Responsive */
@media (max-width: 640px) {
  .login-container {
    padding: 1rem;
  }
  
  .login-form-wrapper {
    gap: 1.5rem;
  }
  
  .greeting-title {
    font-size: 1.25rem;
  }
  
  .bottom-row {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .advisor-section {
    justify-content: center;
  }
}
</style>