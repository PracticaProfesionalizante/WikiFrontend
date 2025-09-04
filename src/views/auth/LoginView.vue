<template>
  <div class="login-container">
    <!-- Background Image -->
    <div class="background-image"></div>
    
    <!-- Content Layout -->
    <div class="content-layout">
      <!-- Left Section - Welcome Info -->
      <div class="welcome-section">
        <!-- TecLab Logo -->
        <div class="logo-section">
          <img 
            src="https://ext.same-assets.com/1581574844/2857473926.png" 
            alt="TecLab Logo" 
            class="teclab-logo"
          />
        </div>

        <!-- Greeting -->
        <div class="greeting-content">
          <h1 class="greeting-title">
            ¡Hola! Qué bueno tenerte por aquí.
          </h1>
          <p class="greeting-subtitle">
            Ingresá tu email y contraseña para acceder.
          </p>
        </div>
      </div>

      <!-- Right Section - Login Form -->
      <div class="form-section">
        <div class="login-form-wrapper">
          <!-- Form Title -->
          <h2 class="form-title">Acceso a Social Learning Wiki</h2>
          
          <!-- Form -->
          <form @submit.prevent="handleLogin" class="login-form">
            <!-- Email Input -->
            <div class="input-group">
              <div class="floating-input">
                <input 
                  v-model="credentials.email"
                  type="email" 
                  id="email"
                  class="form-input"
                  :class="{ 'error': emailError, 'has-value': credentials.email || emailFocused }"
                  @focus="emailFocused = true"
                  @blur="emailFocused = false; validateEmail()"
                />
                <label for="email" class="floating-label">Email</label>
              </div>
            </div>

            <!-- Password Input -->
            <div class="input-group">
              <div class="floating-input password-wrapper">
                <input 
                  v-model="credentials.password"
                  :type="showPassword ? 'text' : 'password'" 
                  id="password"
                  class="form-input password-input"
                  :class="{ 'error': passwordError, 'has-value': credentials.password || passwordFocused }"
                  @focus="passwordFocused = true"
                  @blur="passwordFocused = false; validatePassword()"
                />
                <label for="password" class="floating-label">Contraseña</label>
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
                  Soy SuperUser
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
const emailFocused = ref(false)
const passwordFocused = ref(false)
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
  position: relative;
  overflow: hidden;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/src/components/assets/teclab_fondo_login.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
}

.content-layout {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 3rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Welcome Section - Left Side */
.welcome-section {
  flex: 1;
  max-width: 450px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  color: white;
  padding-right: 1rem;
}

.logo-section {
  display: flex;
  justify-content: flex-start;
}

.teclab-logo {
  height: 4rem;
  width: auto;
  filter: brightness(0) invert(1);
}

.greeting-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.greeting-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #49E9ED;
  margin: 0;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.greeting-subtitle {
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-size: 1.2rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* Form Section - Right Side */
.form-section {
  flex: 0 0 380px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding-left: 1rem;
}

.login-form-wrapper {
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
  margin-bottom: 2rem;
  margin-top: 0;
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

.floating-input {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 1rem 1rem 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
  background: transparent;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.form-input.error {
  border-color: #ef4444;
}

.floating-label {
  position: absolute;
  left: 1rem;
  top: 0.75rem;
  font-size: 1rem;
  color: #6b7280;
  pointer-events: none;
  transition: all 0.2s ease;
  transform-origin: left top;
  background: #f9fafb;
  padding: 0 0.25rem;
}

.form-input:focus + .floating-label,
.form-input.has-value + .floating-label {
  top: -0.5rem;
  left: 0.75rem;
  font-size: 0.75rem;
  color: #3b82f6;
  transform: scale(1);
}

.form-input.error + .floating-label {
  color: #ef4444;
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
@media (max-width: 1024px) {
  .content-layout {
    flex-direction: column;
    padding: 2rem;
    gap: 2rem;
  }
  
  .welcome-section {
    max-width: 100%;
    text-align: center;
  }
  
  .form-section {
    flex: none;
    width: 100%;
    max-width: 400px;
  }
  
  .greeting-title {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .content-layout {
    padding: 1rem;
  }
  
  .login-form-wrapper {
    padding: 2rem 1.5rem;
  }
  
  .greeting-title {
    font-size: 1.75rem;
  }
  
  .greeting-subtitle {
    font-size: 1rem;
  }
  
  .bottom-row {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .advisor-section {
    justify-content: center;
  }
  
  .next-button {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .content-layout {
    padding: 1rem;
  }
  
  .login-form-wrapper {
    padding: 1.5rem;
  }
  
  .greeting-title {
    font-size: 1.5rem;
  }
}
</style>