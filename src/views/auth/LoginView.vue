<template>
  <div class="min-h-screen flex flex-col bg-slate-900 lg:flex-row">
    <!-- Visual / Welcome Section -->
    <div class="relative flex w-full min-h-[40vh] overflow-hidden lg:w-1/2 lg:min-h-screen">
      <div
        class="absolute inset-0 bg-cover bg-center"
        :style="{ backgroundImage: `url(${userStudyingImage})` }"
      ></div>
      <div class="absolute inset-0 bg-slate-900/60"></div>
      <div class="relative z-10 flex min-h-full w-full flex-col items-center justify-center gap-6 px-8 py-16 text-center text-white lg:items-start lg:px-16 lg:text-left">
        <div class="max-w-3xl">
          <h1
            class="text-4xl font-black tracking-tight sm:text-5xl lg:text-[4.5rem] text-[#40DEFF] leading-tight transition-transform duration-300 hover:-translate-y-1"
            style="text-shadow: 0 8px 16px rgba(0, 0, 0, 0.8), 0 4px 8px rgba(64, 222, 255, 0.6), 0 2px 4px rgba(0, 0, 0, 0.9); -webkit-text-stroke: 0.5px rgba(0, 0, 0, 0.3);"
          >
            Bienvenido a nuestra Wiki
          </h1>
          <p
            class="mt-6 text-lg font-medium text-white/95 sm:text-xl lg:text-2xl"
            style="text-shadow: 0 4px 8px rgba(0, 0, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.6), 0 1px 2px rgba(0, 0, 0, 0.9); -webkit-text-stroke: 0.3px rgba(0, 0, 0, 0.4);"
          >
            Tu plataforma de conocimiento y aprendizaje colaborativo
          </p>
        </div>
      </div>
    </div>

    <!-- Form Section -->
    <div class="flex w-full items-center justify-center bg-white px-6 py-12 shadow-2xl lg:w-1/2 lg:min-h-screen lg:px-12">
      <div class="w-full max-w-[420px] opacity-0 animate-slideInRight">
          <!-- Logo Header -->
          <div class="flex justify-center items-center mb-10 py-6 rounded-2xl border border-[#40DEFF]/10 relative overflow-hidden"
               style="background: linear-gradient(135deg, rgba(64, 222, 255, 0.05) 0%, rgba(64, 222, 255, 0.02) 50%, transparent 100%);">
            <div class="absolute inset-0 z-[-1] opacity-60 animate-logoGlow"
                 style="background: radial-gradient(ellipse at center, rgba(64, 222, 255, 0.08) 0%, rgba(64, 222, 255, 0.03) 40%, transparent 70%);"></div>
            <img
              src="@/assets/images/logos/LOGOSOCIALLEARNING.png"
              alt="Social Learning Logo"
              class="h-24 w-auto transition-all duration-300 hover:-translate-y-1 hover:scale-105"
              style="filter: drop-shadow(0 6px 20px rgba(64, 222, 255, 0.4)) brightness(1.1) contrast(1.15);"
            />
          </div>

          <!-- Form Container -->
          <div class="w-full max-w-[400px] mx-auto">
            <form
              @submit.prevent="showForgotPassword ? handleSendResetEmail() : handleLogin()"
              class="flex flex-col gap-5"
              novalidate
            >
              <!-- Form Transition -->
              <transition name="form-slide" mode="out-in">
                <!-- Login Form -->
                <div v-if="!showForgotPassword" key="login-form" class="flex flex-col gap-6">
                  <!-- Email Field -->
                  <div class="flex flex-col gap-2">
                    <div class="relative">
                      <input
                        v-model="credentials.email"
                        type="email"
                        id="email"
                        class="w-full px-4 pt-4 pb-2 border rounded-xl text-base font-normal transition-all duration-300 box-border bg-white text-gray-800 focus:outline-none focus:border-[#245FE7] focus:shadow-[0_0_0_4px_rgba(36,95,231,0.15),0_4px_12px_rgba(36,95,231,0.1)] focus:-translate-y-0.5 hover:border-gray-400 hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)] pr-12"
                        :class="{
                          'border-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.1)]': emailError,
                          'border-green-500 shadow-[0_0_0_2px_rgba(16,185,129,0.1)]': !emailError && credentials.email && credentials.email.length > 0,
                          'border-gray-300': !emailError && (!credentials.email || credentials.email.length === 0),
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
                      <label
                        for="email"
                        class="absolute left-4 font-medium text-gray-500 pointer-events-none transition-all duration-300 origin-left bg-transparent p-0 z-[2]"
                        :class="{
                          'top-[-0.6rem] left-3 text-xs font-semibold text-[#40DEFF] bg-white px-2 rounded-md backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.1)]': credentials.email || emailFocused,
                          'top-3': !credentials.email && !emailFocused,
                        }"
                      >
                        Email
                      </label>
                      <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center z-10">
                        <i
                          v-if="!emailError && credentials.email && credentials.email.length > 0"
                          class="fas fa-check-circle text-green-500 text-xl animate-bounceIn"
                        ></i>
                        <i
                          v-if="emailError && credentials.email"
                          class="fas fa-alert-circle text-red-500 text-xl animate-shake"
                        ></i>
                      </div>
                    </div>
                    <div v-if="emailError && credentials.email" class="text-xs text-red-500 mt-2 ml-3 flex items-center gap-1 animate-slideUp">
                      Por favor ingresa un email válido
                    </div>
                  </div>

                  <!-- Password Field with Forgot Link -->
                  <div class="flex flex-col gap-2">
                    <div class="relative mt-2">
                      <input
                        v-model="credentials.password"
                        :type="showPassword ? 'text' : 'password'"
                        id="password"
                        class="w-full px-4 pt-4 pb-2 pr-20 border rounded-xl text-base font-normal transition-all duration-300 box-border bg-white text-gray-800 focus:outline-none focus:border-[#245FE7] focus:shadow-[0_0_0_4px_rgba(36,95,231,0.15),0_4px_12px_rgba(36,95,231,0.1)] focus:-translate-y-0.5 hover:border-gray-400 hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
                        :class="{
                          'border-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.1)]': passwordError,
                          'border-green-500 shadow-[0_0_0_2px_rgba(16,185,129,0.1)]': !passwordError && credentials.password && credentials.password.length >= 6,
                          'border-gray-300': !passwordError && (!credentials.password || credentials.password.length < 6),
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
                      <label
                        for="password"
                        class="absolute left-4 font-medium text-gray-500 pointer-events-none transition-all duration-300 origin-left bg-transparent p-0 z-[2]"
                        :class="{
                          'top-[-0.6rem] left-3 text-xs font-semibold text-[#40DEFF] bg-white px-2 rounded-md backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.1)]': credentials.password || passwordFocused,
                          'top-3': !credentials.password && !passwordFocused,
                        }"
                      >
                        Contraseña
                      </label>
                      <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
                        <button
                          type="button"
                          @click="showPassword = !showPassword"
                          class="bg-transparent border-none text-gray-500 cursor-pointer p-0 flex items-center justify-center transition-all duration-200 rounded-full w-8 h-8 hover:text-[#40DEFF] hover:bg-[#40DEFF]/10 hover:scale-110"
                          :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                        >
                          <i v-if="showPassword" class="fas fa-eye"></i>
                          <i v-else class="fas fa-eye-off"></i>
                        </button>
                        <div class="flex items-center">
                          <i
                            v-if="
                              !passwordError &&
                              credentials.password &&
                              credentials.password.length >= 6
                            "
                            class="fas fa-check-circle text-green-500 text-xl animate-bounceIn"
                          ></i>
                          <i
                            v-if="passwordError && credentials.password"
                            class="fas fa-alert-circle text-red-500 text-xl animate-shake"
                          ></i>
                        </div>
                      </div>
                    </div>
                    <div v-if="passwordError && credentials.password" class="text-xs text-red-500 mt-2 ml-3 flex items-center gap-1 animate-slideUp">
                      La contraseña debe tener al menos 6 caracteres
                    </div>

                    <!-- Forgot Password Link -->
                    <div class="flex justify-end mt-1">
                      <button
                        type="button"
                        @click="handleForgotPassword"
                        class="bg-transparent border-none text-gray-800 text-sm cursor-pointer no-underline transition-all duration-200 py-1 px-2 rounded hover:text-gray-600 hover:underline hover:bg-gray-100 hover:-translate-y-0.5"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                  </div>

                  <!-- Form Actions -->
                  <div class="flex flex-col gap-3 mt-4">
                    <!-- Submit Button -->
                    <div class="flex justify-center">
                      <button
                        type="submit"
                        :disabled="!isFormValid || isLoading"
                        class="px-8 py-3 rounded-full font-medium transition-all duration-300 relative overflow-hidden min-w-[120px] min-h-[44px] flex items-center justify-center"
                        :class="{
                          'bg-gray-300 text-gray-500 cursor-not-allowed': !isFormValid || isLoading,
                          'bg-[#245FE7] text-white cursor-pointer shadow-[0_4px_15px_rgba(36,95,231,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(36,95,231,0.4)] hover:bg-[#1E4ED8] active:translate-y-0 active:shadow-[0_2px_10px_rgba(36,95,231,0.3)]': isFormValid && !isLoading,
                        }"
                        :aria-label="isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'"
                      >
                        <span v-if="!isLoading" class="transition-opacity duration-200">Iniciar Sesión</span>
                        <div v-else class="flex items-center gap-2">
                          <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span class="text-sm font-medium">{{
                            successMessage ? 'Redirigiendo...' : 'Ingresando...'
                          }}</span>
                        </div>
                      </button>
                    </div>
                  </div>
              </div>

                <!-- Forgot Password Form -->
                <div v-else key="forgot-form" class="flex flex-col gap-6">
                  <!-- Forgot Password Content -->
                  <div v-if="!forgotPasswordSuccess">
                    <div class="text-center mb-6">
                      <p class="text-sm text-gray-600 m-0">Ingresa tu email para recibir instrucciones</p>
                    </div>

                    <!-- Email Field for Password Recovery -->
                    <div class="flex flex-col gap-2">
                      <div class="relative">
                        <input
                          v-model="forgotPasswordEmail"
                          type="email"
                          id="forgot-email"
                          class="w-full px-4 pt-4 pb-2 border border-gray-300 rounded-xl text-base font-normal transition-all duration-300 box-border bg-white text-gray-800 focus:outline-none focus:border-[#245FE7] focus:shadow-[0_0_0_4px_rgba(36,95,231,0.15),0_4px_12px_rgba(36,95,231,0.1)] focus:-translate-y-0.5 hover:border-gray-400 hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
                          placeholder=" "
                          autocomplete="email"
                          required
                        />
                        <label
                          for="forgot-email"
                          class="absolute left-4 font-medium text-gray-500 pointer-events-none transition-all duration-300 origin-left bg-transparent p-0 z-[2]"
                          :class="{
                            'top-[-0.6rem] left-3 text-xs font-semibold text-[#40DEFF] bg-white px-2 rounded-md backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.1)]': forgotPasswordEmail,
                            'top-3': !forgotPasswordEmail,
                          }"
                        >
                          Email para recuperación
                        </label>
                      </div>
                    </div>

                    <!-- Recovery Form Actions -->
                    <div class="flex flex-col gap-3 mt-4">
                      <div class="flex justify-between items-center gap-4">
                        <button
                          type="button"
                          @click="handleBackToLogin"
                          class="bg-transparent border-none text-gray-800 text-sm cursor-pointer py-2 px-2 rounded-lg transition-all duration-200 flex items-center gap-1 hover:text-gray-600 hover:bg-gray-100"
                        >
                          ← Volver al login
                        </button>

                        <button
                          type="submit"
                          :disabled="!forgotPasswordEmail || forgotPasswordLoading"
                          class="px-8 py-3 rounded-full font-medium transition-all duration-300 relative overflow-hidden min-w-[120px] min-h-[44px] flex items-center justify-center"
                          :class="{
                            'bg-gray-300 text-gray-500 cursor-not-allowed': !forgotPasswordEmail || forgotPasswordLoading,
                            'bg-[#245FE7] text-white cursor-pointer shadow-[0_4px_15px_rgba(36,95,231,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(36,95,231,0.4)] hover:bg-[#1E4ED8] active:translate-y-0 active:shadow-[0_2px_10px_rgba(36,95,231,0.3)]': forgotPasswordEmail && !forgotPasswordLoading,
                          }"
                          :aria-label="forgotPasswordLoading ? 'Enviando...' : 'Enviar instrucciones'"
                        >
                          <span v-if="!forgotPasswordLoading" class="transition-opacity duration-200">Enviar</span>
                          <div v-else class="flex items-center gap-2">
                            <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span class="text-sm font-medium">Enviando...</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Success Message -->
                  <div v-else class="text-center py-6">
                    <div class="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-successPulse">
                      <i class="fas fa-check text-4xl text-white"></i>
                    </div>
                    <h3 class="text-2xl font-semibold text-gray-800 mb-3">¡Email enviado!</h3>
                    <p class="text-sm text-gray-600 mb-8 leading-relaxed">
                      Revisa tu bandeja de entrada y sigue las instrucciones para recuperar tu
                      contraseña.
                    </p>

                    <button
                      type="button"
                      @click="handleBackToLogin"
                      class="bg-[#245FE7] text-white border-none px-8 py-3 rounded-full font-medium cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(36,95,231,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(36,95,231,0.4)] hover:bg-[#1E4ED8]"
                    >
                      Volver al login
                    </button>
                  </div>
                </div>
              </transition>
            </form>
          </div>

          <!-- Error Messages -->
          <div v-if="error || authStore.error" class="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 text-red-600 py-3 px-4 rounded-xl text-sm mt-4 flex items-center gap-2 shadow-[0_4px_12px_rgba(239,68,68,0.15)] animate-shake">
            <i class="fas fa-alert-circle text-base"></i>
            {{ error || authStore.error }}
          </div>

          <!-- Success Messages -->
          <div v-if="successMessage" class="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 text-green-700 py-3 px-4 rounded-xl text-sm mt-4 flex items-center gap-2 shadow-[0_4px_12px_rgba(16,185,129,0.15)] opacity-0 animate-fadeIn">
            <i class="fas fa-check-circle text-base"></i>
            {{ successMessage }}
          </div>
        </div>
      </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import userStudyingImage from '@/assets/images/illustrations/user_studying.webp'

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
/* Animaciones personalizadas para Tailwind */
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
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

@keyframes fadeInStudentImage {
  from {
    opacity: 0;
  }
  to {
    opacity: 0.95;
  }
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

/* Estilos específicos para autocompletado del navegador */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px #ffffff inset !important;
  -webkit-text-fill-color: #1f2937 !important;
  color: #1f2937 !important;
  background-color: #ffffff !important;
}
</style>
