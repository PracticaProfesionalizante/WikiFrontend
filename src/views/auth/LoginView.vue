<template>
  <div class="login-container">
    <div class="background-image"></div>
    
    <div class="student-image-overlay"></div>

    <div class="content-layout">
      <div class="welcome-section animate-slide-in-left">
        <div class="logo-social-learning-section">
          <img
            src="@/components/assets/ui_images/LOGOSOCIALLEARNING.png"
            alt="Social Learning Logo"
            class="social-learning-logo animate-fade-in"
          />
        </div>

        <div class="greeting-content">
          <h1 class="greeting-title animate-slide-up">
            Bienvenido, accede a la Wiki para continuar.
          </h1>
          <p class="greeting-subtitle animate-slide-up-delay">
            Ingresá tu email y contraseña para acceder.
          </p>
        </div>
      </div>

      <div class="form-section">
        <div class="login-form-wrapper animate-slide-in-right">
          <h2 class="form-title animate-fade-in-delay">Entrá a la Wiki</h2>
          
          <form @submit.prevent="handleLogin" class="login-form">
            <div class="input-group">
              <div class="floating-input">
                <input 
                  v-model="credentials.email"
                  type="email" 
                  id="email"
                  class="form-input"
                  :class="{ 
                    'error': emailError, 
                    'success': !emailError && credentials.email && credentials.email.length > 0,
                    'has-value': credentials.email || emailFocused 
                  }"
                  @focus="emailFocused = true"
                  @blur="emailFocused = false; validateEmail()"
                  @input="validateEmailRealTime"
                />
                <label for="email" class="floating-label">Email</label>
                <div class="input-feedback">
                  <i v-if="!emailError && credentials.email && credentials.email.length > 0" class="mdi mdi-check-circle success-icon"></i>
                  <i v-if="emailError && credentials.email" class="mdi mdi-alert-circle error-icon"></i>
                </div>
              </div>
              <div v-if="emailError && credentials.email" class="field-error-message">
                Por favor ingresa un email válido
              </div>
            </div>

            <div class="input-group">
              <div class="floating-input password-wrapper">
                <input 
                  v-model="credentials.password"
                  :type="showPassword ? 'text' : 'password'" 
                  id="password"
                  class="form-input password-input"
                  :class="{ 
                    'error': passwordError, 
                    'success': !passwordError && credentials.password && credentials.password.length >= 6,
                    'has-value': credentials.password || passwordFocused 
                  }"
                  @focus="passwordFocused = true"
                  @blur="passwordFocused = false; validatePassword()"
                  @input="validatePasswordRealTime"
                />
                <label for="password" class="floating-label">Contraseña</label>
                <div class="password-controls">
                  <div class="input-feedback">
                    <i v-if="!passwordError && credentials.password && credentials.password.length >= 6" class="mdi mdi-check-circle success-icon"></i>
                    <i v-if="passwordError && credentials.password" class="mdi mdi-alert-circle error-icon"></i>
                  </div>
                  <button 
                    type="button" 
                    @click="showPassword = !showPassword" 
                    class="password-toggle"
                  >
                    <i v-if="showPassword" class="mdi mdi-eye"></i>
                    <i v-else class="mdi mdi-eye-off"></i>
                  </button>
                </div>
              </div>
              <div v-if="passwordError && credentials.password" class="field-error-message">
                La contraseña debe tener al menos 6 caracteres
              </div>
            </div>

            <div class="forgot-password-section">
              <button 
                type="button" 
                @click="handleForgotPassword" 
                class="forgot-password-link"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <div class="bottom-row">
              <button 
                type="submit" 
                :disabled="!isFormValid || isLoading" 
                class="next-button"
                :class="{ 'disabled': !isFormValid || isLoading, 'loading': isLoading }"
              >
                <span v-if="!isLoading" class="button-text">Siguiente</span>
                <div v-else class="loading-spinner">
                  <div class="spinner"></div>
                  <span class="loading-text">Ingresando...</span>
                </div>
              </button>
            </div>
          </form>

          <div v-if="error" class="error-message animate-shake">
            <i class="mdi mdi-alert-circle"></i>
            {{ error }}
          </div>
          
          <div v-if="successMessage" class="success-message animate-fade-in">
            <i class="mdi mdi-check-circle"></i>
            {{ successMessage }}
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
const successMessage = ref('')
const isLoading = ref(false)

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

const validateEmailRealTime = () => {
  if (credentials.email.length > 0) {
    validateEmail()
  } else {
    emailError.value = false
  }
}

const validatePassword = () => {
  const password = credentials.password
  passwordError.value = !password || password.length < 6
}

const validatePasswordRealTime = () => {
  if (credentials.password.length > 0) {
    validatePassword()
  } else {
    passwordError.value = false
  }
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

    isLoading.value = true
    error.value = ''
    
    const result = await authStore.login({
      email: credentials.email,
      password: credentials.password
    })
    
    if (result.success) {
      successMessage.value = '¡Bienvenido! Redirigiendo...'
      
      // Pequeña pausa para mostrar el mensaje de éxito
      setTimeout(async () => {
        // Si el login es exitoso, obtener información del usuario
        await authStore.fetchUserInfo()
        
        // Redirigir al dashboard o página principal
        router.push('/')
      }, 1000)
    }
  } catch (err) {
    error.value = 'Error al iniciar sesión. Verifica tus credenciales.'
    console.error('Error durante el login:', err)
  } finally {
    isLoading.value = false
  }
}

// Función para manejar recuperación de contraseña
const handleForgotPassword = () => {
  // Implementar lógica de recuperación de contraseña
  console.log('Recuperar contraseña')
}

// Función para manejar login de asesor
const handleAdvisorLogin = () => {
  // Implementar lógica para login de asesor
  console.log('Login de asesor')
}

// Limpiar errores cuando el componente se monta
if (authStore.authError) {
  authStore.clearAuthError()
}
</script>

<style scoped>
/* Animaciones y Keyframes */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px);
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Clases de animación */
.animate-slide-in-left {
  animation: slideInLeft 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.animate-slide-in-right {
  animation: slideInRight 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards;
  opacity: 0;
}

.animate-slide-up {
  animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.3s forwards;
  opacity: 0;
}

.animate-slide-up-delay {
  animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.5s forwards;
  opacity: 0;
}

.animate-fade-in {
  animation: fadeIn 1s ease-out 0.1s forwards;
  opacity: 0;
}

.animate-fade-in-delay {
  animation: fadeIn 0.8s ease-out 0.4s forwards;
  opacity: 0;
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}

.animate-bounce-in {
  animation: bounceIn 0.6s ease-out;
}

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
  background-image: url('/src/components/assets/teclab_fondo_login.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
}

.student-image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 54%; 
  height: 100%;
  background-image: url('@/components/assets/ui_images/user_studying.webp');
  background-size: cover;
  background-position: left center;
  background-repeat: no-repeat;
  
  filter: brightness(0.4) saturate(1.5) hue-rotate(180deg) blur(2px);
  
  z-index: 1; 
  pointer-events: none; 
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

/* 📌 Inicio: Nuevos estilos para el logo de Social Learning */
.logo-social-learning-section {
  display: flex;
  justify-content: flex-start;
  margin-bottom: -1rem; /* Ajusta el espacio entre logos y el texto */
}

.social-learning-logo {
  height: 5rem;
  width: auto;
  /* 📌 Nuevos filtros para la paleta de colores celeste y azul oscuro */
  filter: sepia(100%) hue-rotate(180deg) saturate(300%) brightness(1.2);
  transition: all 0.3s ease;
}

.social-learning-logo:hover {
  transform: scale(1.05);
  filter: sepia(100%) hue-rotate(180deg) saturate(400%) brightness(1.3);
}
/*Fin: Nuevos estilos para el logo de Social Learning*/

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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
  background: transparent;
}

.form-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(73, 233, 237, 0.1);
  transform: translateY(-2px);
}

.form-input:hover:not(:focus) {
  border-color: #9ca3af;
  transform: translateY(-1px);
}

.form-input.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
}

.form-input.success {
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
}

.floating-label {
  position: absolute;
  left: 1rem;
  top: 0.75rem;
  font-size: 1rem;
  color: #6b7280;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: left top;
  background: #F2F3F4;
  padding: 0 0.25rem;
}

.form-input:focus + .floating-label,
.form-input.has-value + .floating-label {
  top: -0.75rem;
  left: 0.75rem;
  font-size: 0.75rem;
  color: #2563eb;
  transform: scale(1);
}

.form-input.error + .floating-label {
  color: #ef4444;
}

.form-input.success + .floating-label {
  color: #10b981;
}

.password-wrapper {
  position: relative;
}

.input-feedback {
  position: absolute;
  right: 3rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  z-index: 10;
}

.success-icon {
  color: #10b981;
  font-size: 1.2rem;
  animation: bounceIn 0.6s ease-out;
}

.error-icon {
  color: #ef4444;
  font-size: 1.2rem;
  animation: shake 0.5s ease-in-out;
}

.password-controls {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.password-controls .input-feedback {
  position: static;
  transform: none;
}

.field-error-message {
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 0.25rem;
  margin-left: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  animation: slideUp 0.3s ease-out;
}

.password-input {
  padding-right: 3rem;
}

.password-toggle {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
}

.password-toggle:hover {
  color: #2563eb;
  background-color: rgba(73, 233, 237, 0.1);
  transform: scale(1.1);
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
  transition: all 0.2s ease;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.forgot-password-link:hover {
  color: #2563eb;
  text-decoration: underline;
  background-color: rgba(73, 233, 237, 0.1);
  transform: translateY(-1px);
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  min-width: 120px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.next-button:not(.disabled):not(.loading) {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.next-button:not(.disabled):not(.loading):hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
}

.next-button:not(.disabled):not(.loading):active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(37, 99, 235, 0.3);
}

.next-button.loading {
  background: linear-gradient(135deg, #49E9ED, #2563eb);
  color: white;
  cursor: not-allowed;
}

.button-text {
  transition: opacity 0.2s ease;
}

.loading-spinner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 0.875rem;
  font-weight: 500;
}

/* Error and Success Messages */
.error-message {
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
}

.success-message {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border: 1px solid #bbf7d0;
  color: #059669;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

.error-message i,
.success-message i {
  font-size: 1rem;
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

  .student-image-overlay {
    display: none;
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