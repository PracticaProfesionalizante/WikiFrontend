<template>
  <div v-if="show" class="fixed inset-0 z-[1000] grid place-items-center bg-black/60 p-4 sm:p-6" @click="handleClose">
    <div class="w-full max-w-full sm:max-w-[600px] max-h-[90vh] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" @click.stop>
      <!-- Modal Header -->
      <div class="relative rounded-t-2xl bg-gradient-to-tr from-red-600 to-red-500 px-5 py-5 text-white sm:px-8 sm:py-6">
        <div class="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="flex items-center gap-4">
            <div class="grid h-12 w-12 place-items-center rounded-full bg-white/20 text-xl text-white ring-1 ring-white/30 backdrop-blur">
              <i class="fas fa-user-times"></i>
            </div>
            <div class="flex flex-col gap-1">
              <h2 class="m-0 text-xl font-bold leading-tight">Eliminar Usuario</h2>
              <p class="m-0 text-sm/6 text-white/90">Esta acción no se puede deshacer</p>
            </div>
          </div>
          <button @click="handleClose" class="grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white ring-1 ring-white/30 backdrop-blur transition hover:scale-105 disabled:opacity-50 self-end sm:self-auto" :disabled="isDeleting">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="max-h-[65vh] overflow-y-auto px-5 py-6 sm:px-8">
        <div class="flex flex-col gap-6 text-center">
          <!-- Warning Icon -->
          <div class="text-5xl text-red-500">
            <i class="fas fa-exclamation-triangle"></i>
          </div>

          <!-- User Info -->
          <div class="rounded-xl border border-slate-200 bg-slate-100 p-6 text-left shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h3 class="m-0 mb-4 text-xl font-bold text-slate-900 dark:text-slate-100">{{ user.username }}</h3>
            <div class="flex flex-col gap-3 text-sm">
              <div class="flex items-center gap-2 text-slate-600">
                <i class="fas fa-envelope text-blue-500 w-4 text-center"></i>
                <span>{{ user.email }}</span>
              </div>
              <div class="flex items-center gap-2 text-slate-600">
                <i class="fas fa-user-shield text-blue-500 w-4 text-center"></i>
                <span>{{ user.roles.join(', ') }}</span>
              </div>
              <div class="flex items-center gap-2 text-slate-600">
                <i class="fas fa-calendar text-blue-500 w-4 text-center"></i>
                <span>Registrado: {{ formatDate(user.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Warning Message -->
          <div class="rounded-lg border border-red-200 bg-red-50 p-6 text-left dark:border-red-900/40 dark:bg-red-900/30">
            <h4 class="m-0 mb-2 text-base font-semibold text-red-600 dark:text-red-300">¿Estás seguro de que deseas eliminar este usuario?</h4>
            <p class="m-0 text-sm text-slate-700 dark:text-slate-300">
              Esta acción eliminará permanentemente el usuario <strong>{{ user.username }}</strong>
              y todos sus datos asociados. Esta acción no se puede deshacer.
            </p>
          </div>

          <!-- Confirmation Section -->
          <div class="rounded-lg border border-slate-200 bg-slate-100 p-6 text-left dark:border-slate-700 dark:bg-slate-800">
            <div class="mb-3 flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
              <i class="fas fa-exclamation-triangle text-amber-500"></i>
              <span>Para confirmar la eliminación, escribe <strong>"Eliminar"</strong> en el campo de abajo:</span>
            </div>
            <div class="flex flex-col gap-2">
              <input
                v-model="confirmationText"
                type="text"
                placeholder="Escribe 'Eliminar' para confirmar"
                class="rounded-lg border-2 bg-white px-3 py-2 text-center text-base outline-none transition dark:bg-slate-900"
                :class="isConfirmationValid ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : (confirmationText ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100')"
                :disabled="isDeleting"
              />
              <div v-if="confirmationText && !isConfirmationValid" class="flex items-center gap-2 text-xs font-medium text-red-600 dark:text-red-300">
                <i class="fas fa-times-circle text-[0.8rem]"></i>
                <span>Debes escribir exactamente "Eliminar"</span>
              </div>
              <div v-if="isConfirmationValid" class="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-300">
                <i class="fas fa-check-circle text-[0.8rem]"></i>
                <span>Confirmación válida</span>
              </div>
            </div>
          </div>

          <!-- Impact Warning -->
          <div class="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-100 p-6 text-left dark:border-slate-700 dark:bg-slate-800">
            <div class="flex items-start gap-3">
              <div class="text-blue-500">
                <i class="fas fa-info-circle text-xl"></i>
              </div>
              <div>
                <h5 class="m-0 mb-2 text-base font-semibold text-slate-900 dark:text-slate-100">Impacto de la eliminación:</h5>
                <ul class="m-0 list-disc pl-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  <li>El usuario no podrá iniciar sesión</li>
                  <li>Se perderán todos los datos asociados</li>
                  <li>Los menús y documentos creados por este usuario se mantendrán</li>
                  <li>Esta acción no se puede deshacer</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="border-t border-slate-200 bg-slate-100 px-8 py-4 dark:border-slate-700 dark:bg-slate-800">
        <div class="flex justify-end gap-3">
          <button @click="handleClose" class="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-slate-200 px-4 py-2 text-sm font-medium text-slate-900 transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-100" :disabled="isDeleting">
            <i class="fas fa-times"></i>
            Cancelar
          </button>
          <button @click="handleDelete" class="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50" :disabled="!isConfirmationValid || isDeleting">
            <i class="fas fa-trash" :class="{ 'fa-spin': isDeleting }"></i>
            {{ isDeleting ? 'Eliminando...' : 'Eliminar Usuario' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import userService from '@/services/userService'

// Props
const props = defineProps({
  user: { type: Object, required: true },
  show: { type: Boolean, default: false },
})

// Emits
const emit = defineEmits(['close', 'confirmed'])

// Reactive data
const isDeleting = ref(false)
const confirmationText = ref('')

// Computed
const isConfirmationValid = computed(() => confirmationText.value === 'Eliminar')

// Methods
const handleClose = () => {
  if (!isDeleting.value) {
    confirmationText.value = ''
    emit('close')
  }
}

const handleDelete = async () => {
  if (!isConfirmationValid.value) return
  try {
    isDeleting.value = true
    await userService.deleteUser(props.user.id)
    emit('confirmed')
  } catch (error) {
  } finally {
    isDeleting.value = false
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>
