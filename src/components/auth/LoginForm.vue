<!-- Formulario de login con validación -->
<template>
  <!-- Formulario que previene el envío por defecto y llama a handleLogin -->
  <v-form @submit.prevent="handleLogin">
    <!-- Campo de email con validación -->
    <v-text-field
      v-model="form.email"
      label="Email"
      type="email"
      required
      :error-messages="errors.email"
      prepend-inner-icon="mdi-email"
    ></v-text-field>
    
    <!-- Campo de contraseña con toggle de visibilidad -->
    <v-text-field
      v-model="form.password"
      label="Contraseña"
      :type="showPassword ? 'text' : 'password'"
      required
      :error-messages="errors.password"
      prepend-inner-icon="mdi-lock"
      :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
      @click:append-inner="showPassword = !showPassword"
    ></v-text-field>
    
    <!-- Alerta de error si hay problemas de autenticación -->
    <v-alert
      v-if="authStore.error"
      type="error"
      class="mb-4"
    >
      {{ authStore.error }}
    </v-alert>
    
    <!-- Botón de envío con estado de carga -->
    <v-btn
      type="submit"
      color="primary"
      block
      :loading="authStore.loading"
      :disabled="!isFormValid"
    >
      Iniciar Sesión
    </v-btn>
  </v-form>
</template>

<script setup>
// Importa funciones reactivas de Vue y el store
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Estado reactivo del formulario
const form = ref({
  email: '',
  password: ''
})

// Estado de errores de validación
const errors = ref({
  email: [],
  password: []
})

// Control de visibilidad de la contraseña
const showPassword = ref(false)

// Computed que verifica si el formulario es válido
const isFormValid = computed(() => {
  return form.value.email && form.value.password
})

// Función de validación del formulario
const validateForm = () => {
  // Resetea errores
  errors.value = { email: [], password: [] }
  
  // Validación del email
  if (!form.value.email) {
    errors.value.email.push('El email es requerido')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email.push('El email no es válido')
  }
  
  // Validación de la contraseña
  if (!form.value.password) {
    errors.value.password.push('La contraseña es requerida')
  } else if (form.value.password.length < 6) {
    errors.value.password.push('La contraseña debe tener al menos 6 caracteres')
  }
  
  // Retorna true si no hay errores
  return errors.value.email.length === 0 && errors.value.password.length === 0
}

// Función que maneja el envío del formulario
const handleLogin = async () => {
  // Valida antes de enviar
  if (!validateForm()) return
  
  // Llama al método login del store
  await authStore.login(form.value.email, form.value.password)
}
</script>