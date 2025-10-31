<template>
  <div class="relative min-h-screen bg-white dark:bg-slate-900">
    <SidebarMenu @sidebar-toggle="handleSidebarToggle" />
    <AppHeader :sidebar-expanded="sidebarExpanded" />

    <main :class="['pt-20 transition-all duration-300 min-h-screen', sidebarExpanded ? 'ml-0 md:ml-[280px]' : 'ml-0 md:ml-20']">
      <!-- Fondo superpuesto opcional -->
      <div class="relative z-[1] px-6 py-8">
        <div class="mx-auto max-w-[1200px]">
          <!-- Header -->
          <div class="mb-10 rounded-2xl border bg-white/80 p-8 text-center shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
            <h1 class="m-0 mb-3 flex items-center justify-center gap-3 bg-clip-text text-4xl font-extrabold text-transparent" style="background-image:linear-gradient(135deg,#60a5fa,#1d4ed8)">
              <i class="fas fa-cog text-4xl text-blue-500"></i>
              Configuración de Perfil
            </h1>
            <p class="m-0 text-[1.05rem] text-slate-600 dark:text-slate-300">Gestiona tu información personal y preferencias de cuenta</p>
          </div>

          <!-- Sections -->
          <div class="flex flex-col gap-6">
            <!-- Información Personal -->
            <div class="overflow-hidden rounded-2xl border bg-white/80 shadow backdrop-blur transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900/80">
              <div class="flex items-center justify-between border-b px-6 py-4 dark:border-slate-700" @click="toggleSection('personal')">
                <h2 class="m-0 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                  <i class="fas fa-user-circle text-blue-500"></i>
                  Información Personal
                </h2>
                <button class="grid h-9 w-9 place-items-center rounded-lg border bg-slate-100 text-slate-700 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" :class="{ 'rotate-180': expandedSections.personal }">
                  <i class="fas" :class="expandedSections.personal ? 'fa-minus' : 'fa-plus'"></i>
                </button>
              </div>
              <div v-show="expandedSections.personal" class="px-6 py-6">
                <form @submit.prevent="updateProfile" class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-semibold text-slate-900 dark:text-slate-100">Nombre de Usuario</label>
                    <input v-model="profileData.username" type="text" placeholder="Ingresa tu nombre de usuario"
                      class="rounded-lg border bg-slate-50 px-3 py-2 text-sm outline-none transition placeholder:text-slate-500 dark:bg-slate-800"
                      :class="errors.username ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'" />
                    <span v-if="errors.username" class="text-xs font-medium text-red-600">{{ errors.username }}</span>
                    </div>
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-semibold text-slate-900 dark:text-slate-100">Correo Electrónico</label>
                    <input v-model="profileData.email" type="email" placeholder="tu@email.com"
                      class="rounded-lg border bg-slate-50 px-3 py-2 text-sm outline-none transition placeholder:text-slate-500 dark:bg-slate-800"
                      :class="errors.email ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'" />
                    <span v-if="errors.email" class="text-xs font-medium text-red-600">{{ errors.email }}</span>
                    </div>
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-semibold text-slate-900 dark:text-slate-100">Nombre Completo</label>
                    <input v-model="profileData.fullName" type="text" placeholder="Tu nombre completo"
                      class="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800" />
                  </div>
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-semibold text-slate-900 dark:text-slate-100">Teléfono</label>
                    <input v-model="profileData.phone" type="text" placeholder="Tu teléfono"
                      class="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800" />
                  </div>
                  <div class="col-span-full flex justify-end gap-3 pt-2">
                    <button type="button" @click="resetProfile" class="rounded-lg border border-slate-300 bg-slate-200 px-4 py-2 text-sm font-medium text-slate-900 transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-100">Cancelar</button>
                    <button type="submit" :disabled="isUpdatingProfile" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 disabled:opacity-50">{{ isUpdatingProfile ? 'Guardando...' : 'Guardar cambios' }}</button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Cambiar Contraseña -->
            <div class="overflow-hidden rounded-2xl border bg-white/80 shadow backdrop-blur transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900/80">
              <div class="flex items-center justify-between border-b px-6 py-4 dark:border-slate-700" @click="toggleSection('password')">
                <h2 class="m-0 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                  <i class="fas fa-lock text-blue-500"></i>
                  Cambiar Contraseña
                </h2>
                <button class="grid h-9 w-9 place-items-center rounded-lg border bg-slate-100 text-slate-700 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" :class="{ 'rotate-180': expandedSections.password }">
                  <i class="fas" :class="expandedSections.password ? 'fa-minus' : 'fa-plus'"></i>
                </button>
              </div>
              <div v-show="expandedSections.password" class="px-6 py-6">
                <form @submit.prevent="changePassword" class="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-semibold text-slate-900 dark:text-slate-100">Contraseña Actual</label>
                    <div class="relative">
                      <input v-model="passwordData.currentPassword" :type="showCurrentPassword ? 'text' : 'password'" placeholder="••••••"
                        class="w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm outline-none transition placeholder:text-slate-500 dark:bg-slate-800"
                        :class="errors.currentPassword ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'" />
                      <button type="button" @click="showCurrentPassword = !showCurrentPassword" class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"><i :class="showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i></button>
                    </div>
                    <span v-if="errors.currentPassword" class="text-xs font-medium text-red-600">{{ errors.currentPassword }}</span>
                  </div>
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-semibold text-slate-900 dark:text-slate-100">Nueva Contraseña</label>
                    <div class="relative">
                      <input v-model="passwordData.newPassword" :type="showNewPassword ? 'text' : 'password'" placeholder="Mínimo 6 caracteres"
                        class="w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm outline-none transition placeholder:text-slate-500 dark:bg-slate-800"
                        :class="errors.newPassword ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'" />
                      <button type="button" @click="showNewPassword = !showNewPassword" class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"><i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i></button>
                    </div>
                    <span v-if="errors.newPassword" class="text-xs font-medium text-red-600">{{ errors.newPassword }}</span>
                      </div>
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-semibold text-slate-900 dark:text-slate-100">Confirmar Contraseña</label>
                    <div class="relative">
                      <input v-model="passwordData.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" placeholder="Repite la contraseña"
                        class="w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm outline-none transition placeholder:text-slate-500 dark:bg-slate-800"
                        :class="errors.confirmPassword ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'" />
                      <button type="button" @click="showConfirmPassword = !showConfirmPassword" class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"><i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i></button>
                    </div>
                    <span v-if="errors.confirmPassword" class="text-xs font-medium text-red-600">{{ errors.confirmPassword }}</span>
                  </div>
                  <div class="col-span-full flex justify-end gap-3 pt-2">
                    <button type="button" @click="resetPassword" class="rounded-lg border border-slate-300 bg-slate-200 px-4 py-2 text-sm font-medium text-slate-900 transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-100">Cancelar</button>
                    <button type="submit" :disabled="isChangingPassword" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 disabled:opacity-50">{{ isChangingPassword ? 'Actualizando...' : 'Actualizar contraseña' }}</button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Preferencias -->
            <div class="overflow-hidden rounded-2xl border bg-white/80 shadow backdrop-blur transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900/80">
              <div class="flex items-center justify-between border-b px-6 py-4 dark:border-slate-700" @click="toggleSection('preferences')">
                <h2 class="m-0 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                  <i class="fas fa-sliders-h text-blue-500"></i>
                  Preferencias
                </h2>
                <button class="grid h-9 w-9 place-items-center rounded-lg border bg-slate-100 text-slate-700 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" :class="{ 'rotate-180': expandedSections.preferences }">
                  <i class="fas" :class="expandedSections.preferences ? 'fa-minus' : 'fa-plus'"></i>
                </button>
              </div>
              <div v-show="expandedSections.preferences" class="px-6 py-6">
                <div class="flex flex-col gap-4">
                  <div class="flex items-center justify-between rounded-xl border bg-slate-100 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
                    <div>
                      <h3 class="m-0 text-sm font-semibold text-slate-900 dark:text-slate-100">Notificaciones por Email</h3>
                      <p class="m-0 text-xs text-slate-500">Recibe actualizaciones importantes en tu correo</p>
                    </div>
                    <label class="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" v-model="preferences.emailNotifications" @change="updatePreferences" class="peer sr-only" />
                      <div class="peer h-6 w-11 rounded-full bg-slate-300 after:absolute after:left-0.5 after:top-1/2 after:h-5 after:w-5 after:-translate-y-1/2 after:rounded-full after:bg-white after:transition peer-checked:bg-blue-600 peer-checked:after:translate-x-5"></div>
                    </label>
                  </div>

                  <div class="flex items-center justify-between rounded-xl border bg-slate-100 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
                    <div>
                      <h3 class="m-0 text-sm font-semibold text-slate-900 dark:text-slate-100">Modo Oscuro</h3>
                      <p class="m-0 text-xs text-slate-500">Activa el modo oscuro para todo el sistema</p>
                    </div>
                    <label class="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" v-model="preferences.darkMode" @change="applyDarkMode" class="peer sr-only" />
                      <div class="peer h-6 w-11 rounded-full bg-slate-300 after:absolute after:left-0.5 after:top-1/2 after:h-5 after:w-5 after:-translate-y-1/2 after:rounded-full after:bg-white after:transition peer-checked:bg-blue-600 peer-checked:after:translate-x-5"></div>
                    </label>
                  </div>

                  <div class="flex items-center justify-between rounded-xl border bg-slate-100 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
                    <div>
                      <h3 class="m-0 text-sm font-semibold text-slate-900 dark:text-slate-100">Sonidos del Sistema</h3>
                      <p class="m-0 text-xs text-slate-500">Reproducir sonidos para acciones importantes</p>
                    </div>
                    <label class="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" v-model="preferences.systemSounds" @change="updatePreferences" class="peer sr-only" />
                      <div class="peer h-6 w-11 rounded-full bg-slate-300 after:absolute after:left-0.5 after:top-1/2 after:h-5 after:w-5 after:-translate-y-1/2 after:rounded-full after:bg-white after:transition peer-checked:bg-blue-600 peer-checked:after:translate-x-5"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    <!-- Success/Error Messages -->
      <div v-if="successMessage" class="fixed bottom-6 right-6 z-[1001] inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow dark:border-emerald-900/40 dark:bg-emerald-900/30 dark:text-emerald-200">
      <i class="fas fa-check-circle"></i>
      {{ successMessage }}
    </div>
      <div v-if="errorMessage" class="fixed bottom-6 right-6 z-[1001] inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow dark:border-red-900/40 dark:bg-red-900/30 dark:text-red-200">
      <i class="fas fa-exclamation-circle"></i>
      {{ errorMessage }}
    </div>
    </main>
  </div>
</template>

<script setup>
import SidebarMenu from '@/components/common/SidebarMenu.vue'
import AppHeader from '@/components/common/AppHeader.vue'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'
import { ref, reactive } from 'vue'

// Composables
const authStore = useAuthStore()
const { user } = authStore
const { setTheme } = useTheme()

// Estado del sidebar
const sidebarExpanded = ref(false)

// Estados de formularios
const isUpdatingProfile = ref(false)
const isChangingPassword = ref(false)

// Estados de visibilidad de contraseñas
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Estados del acordeón
const expandedSections = reactive({ personal: true, password: false, preferences: false })

// Mensajes
const successMessage = ref('')
const errorMessage = ref('')

// Datos del perfil
const profileData = reactive({ username: '', email: '', fullName: '', phone: '' })

// Datos de contraseña
const passwordData = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })

// Preferencias
const preferences = reactive({ emailNotifications: true, darkMode: false, systemSounds: true })

// Errores de validación
const errors = reactive({ username: '', email: '', currentPassword: '', newPassword: '', confirmPassword: '' })

// Métodos
const handleSidebarToggle = (expanded) => { sidebarExpanded.value = expanded }
const toggleSection = (section) => { expandedSections[section] = !expandedSections[section] }
const clearErrors = () => { Object.keys(errors).forEach((k) => (errors[k] = '')) }
const clearMessages = () => { successMessage.value = ''; errorMessage.value = '' }
const showMessage = (message, type = 'success') => {
  clearMessages();
  if (type === 'success') successMessage.value = message; else errorMessage.value = message;
  setTimeout(() => clearMessages(), 5000)
}

const validateProfile = () => {
  clearErrors(); let isValid = true
  if (!profileData.username.trim()) { errors.username = 'El nombre de usuario es requerido'; isValid = false }
  if (!profileData.email.trim()) { errors.email = 'El correo electrónico es requerido'; isValid = false }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) { errors.email = 'Ingresa un correo electrónico válido'; isValid = false }
  return isValid
}

const validatePassword = () => {
  clearErrors(); let isValid = true
  if (!passwordData.currentPassword) { errors.currentPassword = 'La contraseña actual es requerida'; isValid = false }
  if (!passwordData.newPassword || passwordData.newPassword.length < 6) { errors.newPassword = 'La nueva contraseña debe tener al menos 6 caracteres'; isValid = false }
  if (passwordData.newPassword !== passwordData.confirmPassword) { errors.confirmPassword = 'Las contraseñas no coinciden'; isValid = false }
  return isValid
}

const updateProfile = async () => {
  if (!validateProfile()) return
  isUpdatingProfile.value = true
  try {
    // Simular petición
    await new Promise((r) => setTimeout(r, 800))
    showMessage('Perfil actualizado correctamente', 'success')
  } catch (e) {
    showMessage('No se pudo actualizar el perfil', 'error')
  } finally {
    isUpdatingProfile.value = false
  }
}

const resetProfile = () => {
  profileData.username = ''
  profileData.email = ''
  profileData.fullName = ''
  profileData.phone = ''
  clearErrors()
}

const changePassword = async () => {
  if (!validatePassword()) return
  isChangingPassword.value = true
  try {
    await new Promise((r) => setTimeout(r, 800))
    showMessage('Contraseña actualizada correctamente', 'success')
    resetPassword()
  } catch (e) {
    showMessage('No se pudo actualizar la contraseña', 'error')
  } finally {
    isChangingPassword.value = false
  }
}

const resetPassword = () => {
  passwordData.currentPassword = ''
  passwordData.newPassword = ''
  passwordData.confirmPassword = ''
  clearErrors()
}

const applyDarkMode = () => { setTheme(!!preferences.darkMode) }
</script>

<style scoped>
</style>
