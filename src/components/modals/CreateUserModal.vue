<template>
  <div v-if="show" class="fixed inset-0 z-[1000] grid place-items-center bg-black/60 p-4 sm:p-6">
    <div class="w-full max-w-full sm:max-w-[800px] max-h-[90vh] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" @click.stop>
      <!-- Modal Header -->
      <div class="relative rounded-t-2xl bg-gradient-to-tr from-blue-600 to-blue-500 px-5 py-5 text-white sm:px-8 sm:py-6">
        <div class="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="flex items-center gap-4">
            <div class="grid h-12 w-12 place-items-center rounded-full bg-white/20 text-xl text-white ring-1 ring-white/30 backdrop-blur">
              <i class="fas fa-user-plus"></i>
            </div>
            <div class="flex flex-col gap-1">
              <h2 class="m-0 text-xl font-bold leading-tight">Crear Nuevo Usuario</h2>
              <p class="m-0 text-sm/6 text-white/90">Agrega un nuevo usuario al sistema</p>
            </div>
          </div>
          <button @click="handleClose" class="grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white ring-1 ring-white/30 backdrop-blur transition hover:scale-105 disabled:opacity-50 self-end sm:self-auto" :disabled="isSaving">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="max-h-[65vh] overflow-y-auto px-5 py-6 sm:px-8">
        <form @submit.prevent="handleSubmit" class="flex flex-col gap-6">
          <!-- User Info Section -->
          <div class="flex flex-col gap-4">
            <h3 class="m-0 flex items-center gap-2 border-b-2 border-slate-200 pb-2 text-base font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100">
              <i class="fas fa-info-circle text-blue-500"></i>
              Información Básica
            </h3>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="flex flex-col gap-2">
                <label for="username" class="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  <i class="fas fa-user text-blue-500"></i>
                  Nombre de Usuario
                  <span class="font-bold text-red-500">*</span>
                </label>
                <input
                  id="username"
                  v-model="formData.username"
                  type="text"
                  class="rounded-lg border bg-slate-50 px-3 py-2 text-sm outline-none transition placeholder:text-slate-500 dark:bg-slate-800"
                  :class="validationErrors.username ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'"
                  placeholder="Ingresa el nombre de usuario"
                  required
                  :disabled="isSaving"
                />
                <div v-if="validationErrors.username" class="mt-0.5 flex items-center gap-2 text-xs font-medium text-red-600 dark:text-red-300">
                  <i class="fas fa-exclamation-circle text-[0.8rem]"></i>
                  {{ validationErrors.username }}
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <label for="email" class="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  <i class="fas fa-envelope text-blue-500"></i>
                  Email
                  <span class="font-bold text-red-500">*</span>
                </label>
                <input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  class="rounded-lg border bg-slate-50 px-3 py-2 text-sm outline-none transition placeholder:text-slate-500 dark:bg-slate-800"
                  :class="validationErrors.email ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'"
                  placeholder="Ingresa el email del usuario"
                  required
                  :disabled="isSaving"
                />
                <div v-if="validationErrors.email" class="mt-0.5 flex items-center gap-2 text-xs font-medium text-red-600 dark:text-red-300">
                  <i class="fas fa-exclamation-circle text-[0.8rem]"></i>
                  {{ validationErrors.email }}
                </div>
              </div>
            </div>
          </div>

          <!-- Password Section -->
          <div class="flex flex-col gap-4">
            <h3 class="m-0 flex items-center gap-2 border-b-2 border-slate-200 pb-2 text-base font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100">
              <i class="fas fa-lock text-blue-500"></i>
              Contraseña
            </h3>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="flex flex-col gap-2">
                <label for="password" class="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  <i class="fas fa-key text-blue-500"></i>
                  Contraseña
                  <span class="font-bold text-red-500">*</span>
                </label>
                <div class="relative flex items-center">
                  <input
                    id="password"
                    v-model="formData.password"
                    :type="showPassword ? 'text' : 'password'"
                    class="w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm outline-none transition placeholder:text-slate-500 dark:bg-slate-800"
                    :class="validationErrors.password ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'"
                    placeholder="Mínimo 6 caracteres"
                    required
                    :disabled="isSaving"
                  />
                  <button
                    type="button"
                    @click="togglePasswordVisibility"
                    class="absolute right-2 rounded p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-700"
                    :disabled="isSaving"
                  >
                    <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </div>
                <div v-if="validationErrors.password" class="mt-0.5 flex items-center gap-2 text-xs font-medium text-red-600 dark:text-red-300">
                  <i class="fas fa-exclamation-circle text-[0.8rem]"></i>
                  {{ validationErrors.password }}
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <label for="confirmPassword" class="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  <i class="fas fa-lock text-blue-500"></i>
                  Confirmar Contraseña
                  <span class="font-bold text-red-500">*</span>
                </label>
                <div class="relative flex items-center">
                  <input
                    id="confirmPassword"
                    v-model="formData.confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    class="w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm outline-none transition placeholder:text-slate-500 dark:bg-slate-800"
                    :class="validationErrors.confirmPassword ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'"
                    placeholder="Repite la contraseña"
                    required
                    :disabled="isSaving"
                  />
                  <button
                    type="button"
                    @click="toggleConfirmPasswordVisibility"
                    class="absolute right-2 rounded p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-700"
                    :disabled="isSaving"
                  >
                    <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </div>
                <div v-if="validationErrors.confirmPassword" class="mt-0.5 flex items-center gap-2 text-xs font-medium text-red-600 dark:text-red-300">
                  <i class="fas fa-exclamation-circle text-[0.8rem]"></i>
                  {{ validationErrors.confirmPassword }}
                </div>
              </div>
            </div>
          </div>

          <!-- Status Section -->
          <div class="flex flex-col gap-4">
            <h3 class="m-0 flex items-center gap-2 border-b-2 border-slate-200 pb-2 text-base font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100">
              <i class="fas fa-toggle-on text-blue-500"></i>
              Estado del Usuario
            </h3>

            <label class="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-100 p-4 transition hover:border-blue-500 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800">
              <input v-model="formData.enabled" type="checkbox" class="mt-1.5 h-4 w-4 accent-blue-600" :disabled="isSaving" />
              <div class="flex-1">
                <div class="text-sm font-semibold text-slate-900 dark:text-slate-100">Usuario Activo</div>
                <div class="text-xs text-slate-500">Los usuarios inactivos no pueden iniciar sesión</div>
              </div>
            </label>
          </div>

          <!-- Roles Section -->
          <div class="flex flex-col gap-4">
            <h3 class="m-0 flex items-center gap-2 border-b-2 border-slate-200 pb-2 text-base font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100">
              <i class="fas fa-users text-blue-500"></i>
              Roles y Permisos
            </h3>

            <div class="flex flex-col gap-2">
              <label class="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                <i class="fas fa-shield-alt text-blue-500"></i>
                Roles del Usuario <span class="font-bold text-red-500">*</span>
              </label>

              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div
                  v-for="role in availableRoles"
                  :key="role.value"
                  class="rounded-lg border bg-slate-100 transition hover:border-blue-500 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800"
                  :class="formData.roles.includes(role.value) ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-400/10' : 'border-slate-200'"
                >
                  <label class="flex w-full cursor-pointer items-center gap-3 p-4">
                    <input
                      v-model="formData.roles"
                      :value="role.value"
                      type="checkbox"
                      class="h-4 w-4 accent-blue-600"
                      :disabled="isSaving"
                    />
                    <span class="flex items-center gap-3">
                      <i :class="role.icon" class="text-blue-500"></i>
                      <span class="flex flex-col">
                        <strong class="text-sm text-slate-900 dark:text-slate-100">{{ role.label }}</strong>
                        <small class="text-xs text-slate-500">{{ role.description }}</small>
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              <div v-if="validationErrors.roles" class="mt-0.5 flex items-center gap-2 text-xs font-medium text-red-600 dark:text-red-300">
                <i class="fas fa-exclamation-circle text-[0.8rem]"></i>
                {{ validationErrors.roles }}
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Modal Footer -->
      <div class="border-t border-slate-200 bg-slate-100 px-8 py-4 dark:border-slate-700 dark:bg-slate-800">
        <div class="flex justify-end gap-3">
          <button @click="handleClose" class="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-slate-200 px-4 py-2 text-sm font-medium text-slate-900 transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-100" :disabled="isSaving">
            <i class="fas fa-times"></i>
            Cancelar
          </button>
          <button @click="handleSubmit" type="button" class="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50" :disabled="!isFormValid || isSaving">
            <i class="fas fa-plus" :class="{ 'fa-spin': isSaving }"></i>
            {{ isSaving ? 'Creando...' : 'Crear Usuario' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Security Verification Modal -->
    <div v-if="showSecurityModal" class="fixed inset-0 z-[1001] grid place-items-center bg-black/60 p-4" @click.stop>
      <div class="w-full max-w-[500px] max-h-[90vh] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" @click.stop>
        <!-- Security Modal Header -->
        <div class="relative rounded-t-2xl bg-gradient-to-tr from-emerald-600 to-emerald-600 px-8 py-6 text-white">
          <div class="relative z-10 flex items-start justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="grid h-12 w-12 place-items-center rounded-full bg-white/20 text-xl text-white ring-1 ring-white/30 backdrop-blur">
                <i class="fas fa-shield-alt"></i>
              </div>
              <div class="flex flex-col gap-1">
                <h2 class="m-0 text-xl font-bold leading-tight">Verificación de Seguridad</h2>
                <p class="m-0 text-sm/6 text-white/90">Confirma tu identidad para crear el usuario</p>
              </div>
            </div>
            <button @click="closeSecurityModal" class="grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white ring-1 ring-white/30 backdrop-blur transition hover:scale-105 disabled:opacity-50" :disabled="isVerifying">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Security Modal Body -->
        <div class="max-h-[60vh] overflow-y-auto px-8 py-6">
          <div class="mb-6 text-center">
            <div class="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-600 text-xl text-white shadow ring-1 ring-emerald-300">
              <i class="fas fa-lock"></i>
            </div>
            <p class="m-0 text-sm text-slate-500">Para crear un nuevo usuario, necesitas confirmar tu contraseña de administrador.</p>
          </div>

          <div class="flex flex-col gap-2">
            <label for="adminPassword" class="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <i class="fas fa-key text-blue-500"></i>
              Tu Contraseña de Administrador
              <span class="font-bold text-red-500">*</span>
            </label>
            <div class="relative flex items-center">
              <input
                id="adminPassword"
                v-model="adminPassword"
                :type="showAdminPassword ? 'text' : 'password'"
                class="w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm outline-none transition placeholder:text-slate-500 dark:bg-slate-800"
                :class="securityError ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'"
                placeholder="Ingresa tu contraseña"
                @keyup.enter="verifyPassword"
                required
                :disabled="isVerifying"
                autofocus
              />
              <button
                type="button"
                @click="toggleAdminPasswordVisibility"
                class="absolute right-2 rounded p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-700"
                :disabled="isVerifying"
              >
                <i :class="showAdminPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div v-if="securityError" class="mt-0.5 flex items-center gap-2 text-xs font-medium text-red-600 dark:text-red-300">
              <i class="fas fa-exclamation-circle text-[0.8rem]"></i>
              {{ securityError }}
            </div>
          </div>
        </div>

        <!-- Security Modal Footer -->
        <div class="border-t border-slate-200 bg-slate-100 px-8 py-4 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex justify-end gap-3">
            <button @click="closeSecurityModal" class="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-slate-200 px-4 py-2 text-sm font-medium text-slate-900 transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-100" :disabled="isVerifying">
              <i class="fas fa-times"></i>
              Cancelar
            </button>
            <button @click="verifyPassword" class="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50" :disabled="!adminPassword || isVerifying">
              <i class="fas fa-check" :class="{ 'fa-spin': isVerifying }"></i>
              {{ isVerifying ? 'Verificando...' : 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import userService from '@/services/userService'
import authService from '@/services/auth'
import { useAuthStore } from '@/stores/auth'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'created'])

// Reactive data
const isSaving = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const showAdminPassword = ref(false)
const validationErrors = ref({})

const formData = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  enabled: true,
  roles: []
})

// Security modal data
const showSecurityModal = ref(false)
const isVerifying = ref(false)
const adminPassword = ref('')
const securityError = ref('')

// Available roles
const availableRoles = [
  { value: 'ROLE_SUPER_USER', label: 'Super Usuario', icon: 'fas fa-crown', description: 'Acceso completo al sistema' },
  { value: 'ROLE_ADMIN', label: 'Administrador', icon: 'fas fa-user-shield', description: 'Gestión de usuarios y configuración' },
  { value: 'ROLE_COLLABORATOR', label: 'Colaborador', icon: 'fas fa-user-group', description: 'Acceso a funciones básicas' },
  { value: 'ROLE_USER', label: 'Usuario', icon: 'fas fa-user', description: 'Acceso básico al sistema' },
]

// Computed
const isFormValid = computed(() => {
  return (
    formData.value.username &&
    formData.value.email &&
    formData.value.password &&
    formData.value.confirmPassword &&
    formData.value.password === formData.value.confirmPassword &&
    formData.value.roles &&
    formData.value.roles.length > 0 &&
    Object.keys(validationErrors.value).length === 0
  )
})

// Methods
const resetForm = () => {
  formData.value = { username: '', email: '', password: '', confirmPassword: '', enabled: true, roles: [] }
  validationErrors.value = {}
  showPassword.value = false
  showConfirmPassword.value = false
  showAdminPassword.value = false
  adminPassword.value = ''
  securityError.value = ''
}

const validateForm = () => {
  const errors = {}
  if (!formData.value.username.trim()) errors.username = 'El nombre de usuario es requerido'
  if (!formData.value.email.trim()) errors.email = 'El email es requerido'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) errors.email = 'El email no tiene un formato válido'
  if (!formData.value.password) errors.password = 'La contraseña es requerida'
  else if (formData.value.password.length < 6) errors.password = 'La contraseña debe tener al menos 6 caracteres'
  if (!formData.value.confirmPassword) errors.confirmPassword = 'La confirmación de contraseña es requerida'
  else if (formData.value.password !== formData.value.confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden'
  if (!formData.value.roles || formData.value.roles.length === 0) errors.roles = 'Debe seleccionar al menos un rol'
  validationErrors.value = errors
  return Object.keys(errors).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return
  showSecurityModal.value = true
  adminPassword.value = ''
  securityError.value = ''
}

const createUser = async () => {
  try {
    isSaving.value = true
    const rolesArray = formData.value.roles.map((role) => role.startsWith('ROLE_') ? role.replace('ROLE_', '') : role)
    const createData = { username: formData.value.username, email: formData.value.email, password: formData.value.password, roles: rolesArray }
    await userService.createUser(createData)
    showSecurityModal.value = false
    resetForm()
    emit('created')
  } catch (error) {
    if (error.response?.status === 400) securityError.value = error.response?.data?.message || error.response?.data?.detail || 'Error en los datos del formulario'
    else if (error.response?.status === 401) securityError.value = error.response?.data?.message || error.response?.data?.detail || 'Contraseña incorrecta'
    else if (error.response?.status === 500) securityError.value = error.response?.data?.detail || 'Ocurrió un error inesperado. Intenta más tarde.'
    else securityError.value = 'Error al crear el usuario. Por favor intenta de nuevo.'
  } finally {
    isSaving.value = false
    isVerifying.value = false
  }
}

const verifyPassword = async () => {
  if (!adminPassword.value) {
    securityError.value = 'Por favor ingresa tu contraseña'
    return
  }
  securityError.value = ''
  isVerifying.value = true
  try {
    const authStore = useAuthStore()
    const currentUser = authStore.user
    if (!currentUser?.email) {
      securityError.value = 'No se pudo obtener la información del usuario actual'
      isVerifying.value = false
      return
    }
    await authService.login({ email: currentUser.email, password: adminPassword.value })
    showSecurityModal.value = false
    await createUser()
  } catch (error) {
    securityError.value = 'Contraseña incorrecta. Por favor intenta de nuevo.'
  } finally {
    isVerifying.value = false
  }
}

const closeSecurityModal = () => {
  if (!isVerifying.value) {
    showSecurityModal.value = false
    adminPassword.value = ''
    securityError.value = ''
  }
}

const handleClose = () => {
  if (!isSaving.value) {
    resetForm()
    emit('close')
  }
}

const togglePasswordVisibility = () => { showPassword.value = !showPassword.value }
const toggleConfirmPasswordVisibility = () => { showConfirmPassword.value = !showConfirmPassword.value }
const toggleAdminPasswordVisibility = () => { showAdminPassword.value = !showAdminPassword.value }

// Watchers
watch(() => props.show, (newValue) => { if (newValue) resetForm() })
</script>
