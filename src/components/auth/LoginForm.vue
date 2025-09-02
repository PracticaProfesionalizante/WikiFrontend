<template>
  <v-card
    class="mx-auto pa-12 pb-8"
    elevation="8"
    max-width="448"
    rounded="lg"
  >
    <div class="text-subtitle-1 text-medium-emphasis">Cuenta</div>

    <v-text-field
      v-model="email"
      density="compact"
      placeholder="Correo electrónico"
      prepend-inner-icon="mdi-email-outline"
      variant="outlined"
      :error-messages="emailErrors"
      :disabled="loading"
      @blur="validateEmail"
      @keyup.enter="handleLogin"
    ></v-text-field>

    <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
      Contraseña
      <a
        class="text-caption text-decoration-none text-blue"
        href="#"
        rel="noopener noreferrer"
        target="_blank"
      >
        ¿Olvidaste tu contraseña?
      </a>
    </div>

    <v-text-field
      v-model="password"
      :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
      :type="visible ? 'text' : 'password'"
      density="compact"
      placeholder="Ingresa tu contraseña"
      prepend-inner-icon="mdi-lock-outline"
      variant="outlined"
      :error-messages="passwordErrors"
      :disabled="loading"
      @click:append-inner="visible = !visible"
      @blur="validatePassword"
      @keyup.enter="handleLogin"
    ></v-text-field>

    <!-- Mostrar errores de autenticación -->
    <v-alert
      v-if="authError"
      type="error"
      variant="tonal"
      class="mb-4"
      closable
      @click:close="authError = ''"
    >
      {{ authError }}
    </v-alert>

    <!-- Checkbox recordar sesión -->
    <v-checkbox
      v-model="rememberMe"
      label="Recordar sesión"
      color="primary"
      :disabled="loading"
    ></v-checkbox>

    <v-btn
      class="mb-8"
      color="blue"
      size="large"
      variant="tonal"
      block
      :loading="loading"
      :disabled="!isFormValid || loading"
      @click="handleLogin"
    >
      Iniciar Sesión
    </v-btn>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

// Composables
const authStore = useAuthStore()
const router = useRouter()

// Estado reactivo
const email = ref('')
const password = ref('')
const visible = ref(false)
const rememberMe = ref(false)
const loading = ref(false)
const authError = ref('')

// Errores de validación
const emailErrors = ref([])
const passwordErrors = ref([])

// Validaciones
const validateEmail = () => {
  emailErrors.value = []
  if (!email.value) {
    emailErrors.value.push('El correo electrónico es requerido')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailErrors.value.push('Ingresa un correo electrónico válido')
  }
}

const validatePassword = () => {
  passwordErrors.value = []
  if (!password.value) {
    passwordErrors.value.push('La contraseña es requerida')
  } else if (password.value.length < 6) {
    passwordErrors.value.push('La contraseña debe tener al menos 6 caracteres')
  }
}

// Computed
const isFormValid = computed(() => {
  return email.value && 
         password.value && 
         emailErrors.value.length === 0 && 
         passwordErrors.value.length === 0
})

// Métodos
const handleLogin = async () => {
  // Validar formulario antes de enviar
  validateEmail()
  validatePassword()
  
  if (!isFormValid.value) {
    return
  }

  loading.value = true
  authError.value = ''

  try {
    console.log('🔐 Intentando iniciar sesión...', { email: email.value })
    
    await authStore.login({
      email: email.value,
      password: password.value,
      remember: rememberMe.value
    })

    console.log('✅ Login exitoso, redirigiendo...')
    
    // Redireccionar después del login exitoso
    const redirectTo = router.currentRoute.value.query.redirect || '/dashboard'
    await router.push(redirectTo)
    
  } catch (error) {
    console.error('❌ Error en login:', error)
    
    // Manejar diferentes tipos de errores
    if (error.response?.status === 401) {
      authError.value = 'Credenciales incorrectas. Verifica tu correo y contraseña.'
    } else if (error.response?.status === 422) {
      authError.value = 'Datos inválidos. Verifica la información ingresada.'
    } else if (error.response?.status >= 500) {
      authError.value = 'Error del servidor. Intenta nuevamente más tarde.'
    } else if (error.code === 'NETWORK_ERROR') {
      authError.value = 'Error de conexión. Verifica tu conexión a internet.'
    } else {
      authError.value = error.message || 'Error inesperado. Intenta nuevamente.'
    }
  } finally {
    loading.value = false
  }
}

// Limpiar errores cuando el usuario empiece a escribir
const clearErrors = () => {
  authError.value = ''
  emailErrors.value = []
  passwordErrors.value = []
}

// Watchers para limpiar errores
import { watch } from 'vue'
watch([email, password], clearErrors)
</script>

<style scoped>
.v-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.v-theme--dark .v-card {
  background: rgba(30, 30, 30, 0.9);
}

.text-blue {
  color: rgb(var(--v-theme-primary)) !important;
}

.v-btn {
  text-transform: none;
  font-weight: 500;
}

.v-text-field {
  margin-bottom: 8px;
}

.v-alert {
  font-size: 0.875rem;
}
</style>