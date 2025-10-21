<template>
  <div class="login-container">
    <!-- Background Elements -->
    <div class="background-image"></div>
    <div class="student-image-overlay"></div>

    <!-- Main Content Layout -->
    <div class="content-layout">
      <!-- Welcome Section -->
      <div class="welcome-section animate-slide-in-left">
        <div class="greeting-content">
          <h1 class="greeting-title animate-slide-up">Bienvenido a nuestra Wiki</h1>
          <p class="greeting-subtitle animate-slide-up-delay">
            Tu plataforma de conocimiento y aprendizaje colaborativo
          </p>
          <div class="greeting-features animate-slide-up-delay-2">
            <div class="feature-item">
              <i class="mdi mdi-book-open-variant"></i>
              <span>Conocimiento compartido</span>
            </div>
            <div class="feature-item">
              <i class="mdi mdi-account-group"></i>
              <span>Aprendizaje colaborativo</span>
            </div>
            <div class="feature-item">
              <i class="mdi mdi-lightning-bolt"></i>
              <span>Acceso instantáneo</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Section -->
      <div class="form-section">
        <div class="login-form-wrapper animate-slide-in-right">
          <!-- Logo Header -->
          <div class="form-logo-section">
            <img
              src="@/assets/images/logos/LOGOSOCIALLEARNING.png"
              alt="Social Learning Logo"
              class="form-logo animate-fade-in"
            />
          </div>

          <!-- Form Container -->
          <div class="form-container">
            <form
              @submit.prevent="showForgotPassword ? handleSendResetEmail() : handleLogin()"
              class="login-form"
              novalidate
            >
              <!-- Form Transition -->
              <transition name="form-slide" mode="out-in">
                <!-- Login Form -->
                <div v-if="!showForgotPassword" key="login-form" class="form-content">
                  <!-- Email Field -->
                  <div class="form-field">
                    <div class="floating-input">
                      <input
                        v-model="credentials.email"
                        type="email"
                        id="email"
                        class="form-input"
                        :class="{
                          error: emailError,
                          success: !emailError && credentials.email && credentials.email.length > 0,
                          'has-value': credentials.email || emailFocused,
                        }"
                        @focus="emailFocused = true"
                        @blur="
                          () => {
                            emailFocused = false
                            validateEmail()
                          }
                        "
                        @input="validateEmailRealTime"
                        placeholder=" "
                        autocomplete="email"
                        required
                      />
                      <label for="email" class="floating-label">Email</label>
                      <div class="input-feedback">
                        <i
                          v-if="!emailError && credentials.email && credentials.email.length > 0"
                          class="mdi mdi-check-circle success-icon"
                        ></i>
                        <i
                          v-if="emailError && credentials.email"
                          class="mdi mdi-alert-circle error-icon"
                        ></i>
                      </div>
                    </div>
                    <div v-if="emailError && credentials.email" class="field-error-message">
                      Por favor ingresa un email válido
                    </div>
                  </div>

                  <!-- Password Field with Forgot Link -->
                  <div class="form-field">
                    <div class="floating-input password-wrapper">
                      <input
                        v-model="credentials.password"
                        :type="showPassword ? 'text' : 'password'"
                        id="password"
                        class="form-input password-input"
                        :class="{
                          error: passwordError,
                          success:
                            !passwordError &&
                            credentials.password &&
                            credentials.password.length >= 6,
                          'has-value': credentials.password || passwordFocused,
                        }"
                        @focus="passwordFocused = true"
                        @blur="
                          () => {
                            passwordFocused = false
                            validatePassword()
                          }
                        "
                        @input="validatePasswordRealTime"
                        placeholder=" "
                        autocomplete="current-password"
                        required
                      />
                      <label for="password" class="floating-label">Contraseña</label>
                      <div class="password-controls">
                        <button
                          type="button"
                          @click="showPassword = !showPassword"
                          class="password-toggle"
                          :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                        >
                          <i v-if="showPassword" class="mdi mdi-eye"></i>
                          <i v-else class="mdi mdi-eye-off"></i>
                        </button>
                        <div class="input-feedback">
                          <i
                            v-if="
                              !passwordError &&
                              credentials.password &&
                              credentials.password.length >= 6
                            "
                            class="mdi mdi-check-circle success-icon"
                          ></i>
                          <i
                            v-if="passwordError && credentials.password"
                            class="mdi mdi-alert-circle error-icon"
                          ></i>
                        </div>
                      </div>
                    </div>
                    <div v-if="passwordError && credentials.password" class="field-error-message">
                      La contraseña debe tener al menos 6 caracteres
                    </div>

                    <!-- Forgot Password Link - Pegado al campo de contraseña -->
                    <div class="forgot-password-section">
                      <button type="button" @click="handleForgotPassword" class="forgot-password-link">
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                  </div>

                  <!-- Form Actions -->
                  <div class="form-actions">

                    <!-- Submit Button -->
                    <div class="submit-section">
                      <button
                        type="submit"
                        :disabled="!isFormValid || isLoading"
                        class="next-button"
                        :class="{ disabled: !isFormValid || isLoading, loading: isLoading }"
                        :aria-label="isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'"
                      >
                        <span v-if="!isLoading" class="button-text">Iniciar Sesión</span>
                        <div v-else class="loading-spinner">
                          <div class="spinner"></div>
                          <span class="loading-text">{{
                            successMessage ? 'Redirigiendo...' : 'Ingresando...'
                          }}</span>
                        </div>
                      </button>
                    </div>
                  </div>
              </div>

                <!-- Forgot Password Form -->
                <div v-else key="forgot-form" class="form-content">
                  <!-- Forgot Password Content -->
                  <div v-if="!forgotPasswordSuccess">
                    <div class="forgot-password-header">
                      <p class="forgot-subtitle">Ingresa tu email para recibir instrucciones</p>
                    </div>

                    <!-- Email Field for Password Recovery -->
                    <div class="form-field">
                      <div class="floating-input">
                        <input
                          v-model="forgotPasswordEmail"
                          type="email"
                          id="forgot-email"
                          class="form-input"
                          :class="{ 'has-value': forgotPasswordEmail }"
                          placeholder=" "
                          autocomplete="email"
                          required
                        />
                        <label for="forgot-email" class="floating-label">Email para recuperación</label>
                      </div>
                    </div>

                    <!-- Recovery Form Actions -->
                    <div class="form-actions">
                      <div class="recovery-actions">
                        <button type="button" @click="handleBackToLogin" class="back-to-login-btn">
                          ← Volver al login
                        </button>

                        <button
                          type="submit"
                          :disabled="!forgotPasswordEmail || forgotPasswordLoading"
                          class="next-button"
                          :class="{
                            disabled: !forgotPasswordEmail || forgotPasswordLoading,
                            loading: forgotPasswordLoading,
                          }"
                          :aria-label="forgotPasswordLoading ? 'Enviando...' : 'Enviar instrucciones'"
                        >
                          <span v-if="!forgotPasswordLoading" class="button-text">Enviar</span>
                          <div v-else class="loading-spinner">
                            <div class="spinner"></div>
                            <span class="loading-text">Enviando...</span>
                          </div>
                        </button>
                      </div>
                    </div>
                </div>

                  <!-- Success Message -->
                  <div v-else class="forgot-success">
                    <div class="success-icon-large">
                      <i class="mdi mdi-email-check-outline"></i>
                    </div>
                    <h3 class="success-title">¡Email enviado!</h3>
                    <p class="success-text">
                      Revisa tu bandeja de entrada y sigue las instrucciones para recuperar tu
                      contraseña.
                    </p>

                    <button
                      type="button"
                      @click="handleBackToLogin"
                      class="back-to-login-btn-success"
                    >
                      Volver al login
                    </button>
                  </div>
                </div>
              </transition>
            </form>
          </div>

          <!-- Error Messages -->
          <div v-if="error || authStore.error" class="error-message animate-shake">
            <i class="mdi mdi-alert-circle"></i>
            {{ error || authStore.error }}
          </div>

          <!-- Success Messages -->
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

// Composables
const authStore = useAuthStore()

// Referencias reactivas
const showPassword = ref(false)
const emailError = ref(false)
const passwordError = ref(false)
const emailFocused = ref(false)
const passwordFocused = ref(false)
const error = ref('')
const successMessage = ref('')
const isLoading = ref(false)

// Estados para recuperación de contraseña
const showForgotPassword = ref(false)
const forgotPasswordEmail = ref('')
const forgotPasswordLoading = ref(false)
const forgotPasswordSuccess = ref(false)

// Credenciales del usuario
const credentials = reactive({
  email: '',
  password: '',
})

// Computed properties
const isFormValid = computed(() => {
  return (
    credentials.email.length > 0 &&
    credentials.password.length >= 6 &&
    !emailError.value &&
    !passwordError.value
  )
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
    authStore.clearError() // Limpiar errores previos del store

    await authStore.login({
      email: credentials.email,
      password: credentials.password,
    })

    successMessage.value = '¡Bienvenido! Redirigiendo...'
    // No resetear isLoading aquí para mantener el botón deshabilitado durante la redirección
  } catch (error) {
    // Manejar diferentes tipos de errores con mensajes específicos
    if (
      error.message?.includes('Credenciales inválidas') ||
      error.message?.includes('401') ||
      error.message?.includes('unauthorized')
    ) {
      error.value = 'Error al iniciar sesión. Verifica tus credenciales.'
    } else if (error.message?.includes('Usuario deshabilitado') || error.message?.includes('403')) {
      error.value = 'Tu cuenta está deshabilitada. Contacta al administrador.'
    } else if (
      error.message?.includes('conexión') ||
      error.message?.includes('network') ||
      error.message?.includes('fetch')
    ) {
      error.value = 'Error de conexión. Verifica tu internet e intenta nuevamente.'
    } else {
      // Mostrar el mensaje de error original del backend
      error.value = error.message || 'Error al iniciar sesión. Verifica tus credenciales.'
    }
    // Solo resetear isLoading en caso de error
    isLoading.value = false
  }
}

// Función para manejar recuperación de contraseña
const handleForgotPassword = () => {
  showForgotPassword.value = true
  forgotPasswordEmail.value = credentials.email // Pre-llenar con email actual
  error.value = ''
  successMessage.value = ''
}

const handleBackToLogin = () => {
  showForgotPassword.value = false
  forgotPasswordSuccess.value = false
  forgotPasswordEmail.value = ''
  error.value = ''
  successMessage.value = ''
}

const handleSendResetEmail = async () => {
  if (!forgotPasswordEmail.value) {
    error.value = 'Por favor ingresa tu email'
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(forgotPasswordEmail.value)) {
    error.value = 'Por favor ingresa un email válido'
    return
  }

  forgotPasswordLoading.value = true
  error.value = ''

  try {
    // Simular llamada al backend (aquí harías la llamada real)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    forgotPasswordSuccess.value = true
    successMessage.value = 'Se ha enviado un email con instrucciones para recuperar tu contraseña'
  } catch (error) {
    error.value = 'Error al enviar email de recuperación. Intenta nuevamente.'
  } finally {
    forgotPasswordLoading.value = false
  }
}

// Limpiar errores cuando el componente se monta
if (authStore.error) {
  authStore.clearError()
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
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-5px);
  }
  20%,
  40%,
  60%,
  80% {
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

@keyframes logoGlow {
  0% {
    opacity: 0.4;
    transform: scale(0.95);
  }
  100% {
    opacity: 0.8;
    transform: scale(1.05);
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

.animate-slide-up-delay-2 {
  animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.7s forwards;
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

/* Mejora global: Optimización de renderizado de imágenes */
* {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

img {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
}

.login-container {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  /* Forzar modo claro siempre */
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-sidebar: #ffffff;
  --border-primary: #d1d5db;
  --border-color: #e5e7eb;
  --accent-color: #40DEFF;
  --primary-color: #2563eb;
  --accent-secondary: #10b981;
  --accent-danger: #ef4444;
  --button-primary-hover: #1d4ed8;
}


.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* Optimización: Lazy loading y fallback */
  background-image: url('/src/assets/images/backgrounds/teclab_fondo_login.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;

  /* Mejora: Loading placeholder mientras carga la imagen */
  background-color: var(--bg-sidebar);

  /* Optimización: Compresión y renderizado eficiente */
  image-rendering: optimizeSpeed;
  transform: translateZ(0);
  will-change: auto;

  /* Transición suave cuando carga */
  opacity: 0;
  animation: fadeInBackground 1s ease-out 0.3s forwards;
}

@keyframes fadeInBackground {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInStudentImage {
  from {
    opacity: 0;
  }
  to {
    opacity: 0.95;
  }
}

.student-image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 52%;
  height: 100%;
  background-image: url('@/assets/images/illustrations/user_studying.webp');
  background-size: cover;
  background-position: -350px center;
  background-repeat: no-repeat;
  z-index: 1;
  pointer-events: none;

  /* Mejora: Loading placeholder mientras carga la imagen */
  background-color: var(--bg-sidebar);

  /* Optimización: Compresión y renderizado eficiente */
  image-rendering: optimizeSpeed;
  transform: translateZ(0);
  will-change: auto;

  /* Transición suave cuando carga */
  opacity: 0;
  animation: fadeInStudentImage 1s ease-out 0.5s forwards;

  /* Mejora: Filtros optimizados para mejor calidad */
  filter: brightness(0.8) saturate(1.05) contrast(1.05);
}

.content-layout {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  display: flex;
  align-items: stretch;
  padding: 0;
  gap: 0;
  max-width: none;
  margin: 0;
}

/* Welcome Section - Left Side */
.welcome-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  color: white;
  padding: 4rem 3rem;
  /* Mejora: Fondo semi-transparente para mejor contraste del texto */
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.4) 0%,
    rgba(0, 0, 0, 0.2) 50%,
    rgba(0, 0, 0, 0.3) 100%
  );
  backdrop-filter: blur(4px);
  /* Mejora: Centrado vertical para mejor distribución */
  justify-content: center;
  align-items: flex-start;
}

.greeting-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-top: 0;
  width: 100%;
}

.greeting-title {
  font-size: 5rem;
  font-weight: 900;
  color: #40DEFF;
  margin: 0;
  line-height: 1.1;
  letter-spacing: -0.02em;
  /* Mejora: Sombras más intensas para mejor visibilidad */
  text-shadow:
    0 8px 16px rgba(0, 0, 0, 0.8),
    0 4px 8px rgba(64, 222, 255, 0.6),
    0 2px 4px rgba(0, 0, 0, 0.9);
  transition: all 0.3s ease;
  /* Mejora: Contorno sutil para mayor definición */
  -webkit-text-stroke: 0.5px rgba(0, 0, 0, 0.3);
}

.greeting-title:hover {
  transform: translateY(-2px);
  text-shadow:
    0 10px 20px rgba(0, 0, 0, 0.9),
    0 5px 10px rgba(64, 222, 255, 0.7),
    0 3px 6px rgba(0, 0, 0, 0.9);
}

.greeting-subtitle {
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
  line-height: 1.4;
  /* Mejora: Sombras más intensas para mejor legibilidad */
  text-shadow:
    0 4px 8px rgba(0, 0, 0, 0.8),
    0 2px 4px rgba(0, 0, 0, 0.6),
    0 1px 2px rgba(0, 0, 0, 0.9);
  /* Mejora: Contorno sutil para mayor definición */
  -webkit-text-stroke: 0.3px rgba(0, 0, 0, 0.4);
}

/* Características de la plataforma */
.greeting-features {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(8px);
  border-color: rgba(73, 233, 237, 0.4);
}

.feature-item i {
  font-size: 1.5rem;
  color: var(--accent-color);
  min-width: 24px;
}

.feature-item span {
  font-size: 1.1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
}

/* Form Section - Right Side */
.form-section {
  flex: 0 0 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  padding: 4rem 3rem;
}

.login-form-wrapper {
  width: 100%;
  max-width: 450px;
  background: transparent;
  padding: 0;
}

/* Logo del formulario */
.form-logo-section {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2.5rem;
  padding: 1.5rem 0;
  background: linear-gradient(
    135deg,
    rgba(64, 222, 255, 0.05) 0%,
    rgba(64, 222, 255, 0.02) 50%,
    transparent 100%
  );
  border-radius: 16px;
  border: 1px solid rgba(64, 222, 255, 0.1);
  position: relative;
  overflow: hidden;
}

/* Form Container */
.form-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

/* Form Content */
.form-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Form Field */
.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Form Actions */
.form-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

/* Submit Section */
.submit-section {
  display: flex;
  justify-content: center;
}

/* Recovery Actions */
.recovery-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.form-logo-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    ellipse at center,
    rgba(64, 222, 255, 0.08) 0%,
    rgba(64, 222, 255, 0.03) 40%,
    transparent 70%
  );
  z-index: -1;
  opacity: 0.6;
  animation: logoGlow 3s ease-in-out infinite alternate;
}

.form-logo {
  height: 6rem;
  width: auto;
  filter: drop-shadow(0 6px 20px rgba(64, 222, 255, 0.4)) brightness(1.1) contrast(1.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

.form-logo:hover {
  transform: translateY(-3px) scale(1.05);
  filter: drop-shadow(0 8px 24px rgba(64, 222, 255, 0.5)) brightness(1.15) contrast(1.2);
}



/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.input-group {
  position: relative;
  margin-bottom: 1.5rem;
}

.floating-input {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 1rem 1rem 0.5rem 1rem;
  border: 1px solid #d1d5db;
  /* Mejora: Bordes más redondeados y modernos */
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 400;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
  background: #ffffff;
  /* Forzar modo claro siempre */
  color: #1f2937 !important;
}


/* Estilos específicos para autocompletado del navegador */
.form-input:-webkit-autofill,
.form-input:-webkit-autofill:hover,
.form-input:-webkit-autofill:focus,
.form-input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px #ffffff inset !important;
  -webkit-text-fill-color: #1f2937 !important;
  color: #1f2937 !important;
  background-color: #ffffff !important;
}


.form-input:focus {
  outline: none;
  border-color: #245FE7;
  /* Mejora: Glow effect más elegante */
  box-shadow:
    0 0 0 4px rgba(36, 95, 231, 0.15),
    0 4px 12px rgba(36, 95, 231, 0.1);
  transform: translateY(-2px);
}

.form-input:hover:not(:focus) {
  border-color: #9ca3af;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
  font-weight: 500;
  color: #6b7280 !important;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: left top;
  background: transparent;
  padding: 0;
  z-index: 2;
}

.form-input:focus + .floating-label,
.form-input.has-value + .floating-label {
  top: -0.6rem;
  left: 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #40DEFF !important;
  transform: scale(1);
  background: #ffffff;
  padding: 0 0.5rem;
  border-radius: 6px;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}


.form-input.error + .floating-label {
  color: #ef4444 !important;
  background: #ffffff;
  padding: 0 0.5rem;
  border-radius: 6px;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.1);
}

.form-input.success + .floating-label {
  color: #10b981 !important;
  background: #ffffff;
  padding: 0 0.5rem;
  border-radius: 6px;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1);
}

.password-wrapper {
  position: relative;
  margin-top: 0.5rem;
}

.input-feedback {
  position: absolute;
  right: 0.75rem;
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
  color: var(--accent-danger);
  margin-top: 0.5rem;
  margin-left: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  animation: slideUp 0.3s ease-out;
}

.password-input {
  padding-right: 4.5rem;
}

.password-toggle {
  background: none;
  border: none;
  color: #6b7280 !important;
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
  color: #40DEFF !important;
  background-color: rgba(64, 222, 255, 0.1);
  transform: scale(1.1);
}

/* Forgot Password */
.forgot-password-section {
  display: flex;
  justify-content: flex-end;
  margin: 0.25rem 0 0 0;
}

.forgot-password-link {
  background: none;
  border: none;
  color: #1f2937;
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.forgot-password-link:hover {
  color: #374151;
  text-decoration: underline;
  background-color: rgba(31, 41, 55, 0.1);
  transform: translateY(-1px);
}

/* Bottom Row */
.bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1.5rem;
}

.advisor-section {
  display: flex;
  align-items: center;
}

.advisor-checkbox {
  height: 1rem;
  width: 1rem;
  color: var(--accent-color);
  border: 1px solid var(--border-primary);
  border-radius: 0.25rem;
  margin-right: 0.5rem;
}

.advisor-checkbox:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.advisor-label {
  font-size: 0.875rem;
  color: var(--text-primary);
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
  background: #245FE7;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(36, 95, 231, 0.3);
}


.next-button:not(.disabled):not(.loading):hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(36, 95, 231, 0.4);
  background: #1E4ED8;
}

.next-button:not(.disabled):not(.loading):active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(36, 95, 231, 0.3);
}

.next-button.loading {
  background: #245FE7;
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

/* Animaciones de transición para formularios */
.form-slide-enter-active,
.form-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.form-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Estilos para recuperación de contraseña */
.forgot-password-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.forgot-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.forgot-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.forgot-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 1.25rem;
}

.back-to-login-btn {
  background: none;
  border: none;
  color: #1f2937;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.back-to-login-btn:hover {
  color: #374151;
  background-color: rgba(31, 41, 55, 0.1);
}

/* Estilos para mensaje de éxito */
.forgot-success {
  text-align: center;
  padding: 1.5rem 0;
}

.success-icon-large {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  animation: successPulse 0.6s ease-out;
}

.success-icon-large i {
  font-size: 2.5rem;
  color: white;
}

.success-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.75rem;
}

.success-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.5;
}

.back-to-login-btn-success {
  background: #245FE7;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 9999px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(36, 95, 231, 0.3);
}

.back-to-login-btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(36, 95, 231, 0.4);
  background: #1E4ED8;
}

@keyframes successPulse {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Responsive para móviles */
@media (max-width: 640px) {
  .forgot-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .back-to-login-btn {
    text-align: center;
    justify-content: center;
  }

  .forgot-password-header {
    margin-bottom: 1.5rem;
  }

  .forgot-title {
    font-size: 1.25rem;
  }

  .success-icon-large {
    width: 60px;
    height: 60px;
  }

  .success-icon-large i {
    font-size: 2rem;
  }
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
  }

  .welcome-section {
    flex: none;
    padding: 3rem 2rem;
    text-align: center;
    align-items: center;
  }

  .form-section {
    flex: none;
    padding: 3rem 2rem;
  }

  .greeting-title {
    font-size: 3.5rem;
  }

  .greeting-subtitle {
    font-size: 1.4rem;
  }

  .greeting-features {
    gap: 0.75rem;
  }

  .feature-item {
    padding: 0.5rem 0.75rem;
  }

  .feature-item i {
    font-size: 1.2rem;
  }

  .feature-item span {
    font-size: 1rem;
  }
}

@media (max-width: 768px) {
  .welcome-section {
    padding: 2rem 1.5rem;
  }

  .form-section {
    padding: 2rem 1.5rem;
  }

  .login-form-wrapper {
    padding: 0;
  }

  .greeting-title {
    font-size: 2.8rem;
  }

  .greeting-subtitle {
    font-size: 1.2rem;
  }

  .greeting-features {
    gap: 0.5rem;
  }

  .feature-item {
    padding: 0.5rem 0.75rem;
  }

  .feature-item i {
    font-size: 1.1rem;
  }

  .feature-item span {
    font-size: 0.9rem;
  }

  .form-logo {
    height: 5rem;
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
  .welcome-section {
    padding: 1.5rem 1rem;
  }

  .form-section {
    padding: 1.5rem 1rem;
  }

  .login-form-wrapper {
    padding: 0;
  }

  .greeting-title {
    font-size: 2.2rem;
  }

  .greeting-subtitle {
    font-size: 1rem;
  }

  .greeting-features {
    gap: 0.5rem;
  }

  .feature-item {
    padding: 0.5rem 0.75rem;
  }

  .feature-item i {
    font-size: 1rem;
  }

  .feature-item span {
    font-size: 0.85rem;
  }

  .form-logo {
    height: 4rem;
  }
}
</style>
