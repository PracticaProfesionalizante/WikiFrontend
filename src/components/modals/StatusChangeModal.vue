<template>
  <div v-if="show && user" class="fixed inset-0 z-[1000] grid place-items-center bg-black/60 p-4 sm:p-6" @click="handleClose">
    <div class="w-full max-w-full sm:max-w-[600px] max-h-[90vh] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" @click.stop>
      <!-- Modal Header -->
      <div :class="['relative rounded-t-2xl px-5 py-5 text-white sm:px-8 sm:py-6', user.enabled ? 'bg-amber-500' : 'bg-emerald-600']">
        <div class="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="flex items-center gap-4">
            <div class="grid h-12 w-12 place-items-center rounded-full bg-white/20 text-xl text-white ring-1 ring-white/30 backdrop-blur">
              <i :class="user.enabled ? 'fas fa-user-times' : 'fas fa-user-check'"></i>
            </div>
            <div class="flex flex-col gap-1">
              <h2 class="m-0 text-xl font-bold leading-tight">{{ user.enabled ? 'Desactivar Usuario' : 'Activar Usuario' }}</h2>
              <p class="m-0 text-sm/6 text-white/90">{{ user.enabled ? 'El usuario no podrá iniciar sesión' : 'El usuario podrá iniciar sesión' }}</p>
            </div>
          </div>
          <button @click="handleClose" class="grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white ring-1 ring-white/30 backdrop-blur transition hover:scale-105 disabled:opacity-50 self-end sm:self-auto" :disabled="isChanging">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="max-h-[65vh] overflow-y-auto px-5 py-6 sm:px-8">
        <div class="flex flex-col gap-6">
          <!-- User Info -->
          <div class="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-100 p-6 dark:border-slate-700 dark:bg-slate-800">
            <div class="grid h-12 w-12 place-items-center rounded-full bg-blue-600 text-white text-lg">
              <i class="fas fa-user"></i>
            </div>
            <div class="flex-1">
              <h3 class="m-0 mb-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{{ user.username }}</h3>
              <div class="flex flex-col gap-1 text-sm text-slate-600">
                <span class="flex items-center gap-2"><i class="fas fa-envelope text-blue-500 w-4 text-center"></i>{{ user.email }}</span>
                <span class="flex items-center gap-2"><i class="fas fa-user-shield text-blue-500 w-4 text-center"></i>{{ user.roles.join(', ') }}</span>
              </div>
            </div>
          </div>

          <!-- Status Change Details -->
          <div class="rounded-xl border border-slate-200 bg-slate-100 p-6 dark:border-slate-700 dark:bg-slate-800">
            <div class="flex items-center justify-center gap-6">
              <div class="flex min-w-[150px] items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                <div class="grid h-8 w-8 place-items-center rounded-full bg-blue-600 text-white"><i :class="getStatusIcon(user.enabled)"></i></div>
                <div class="flex flex-col"><span class="text-xs font-medium text-slate-500">Estado actual</span><span class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ user.enabled ? 'Activo' : 'Inactivo' }}</span></div>
              </div>
              <div class="text-slate-500"><i class="fas fa-arrow-right text-xl"></i></div>
              <div :class="['flex min-w-[150px] items-center gap-3 rounded-lg border p-3', user.enabled ? 'border-red-300 bg-red-50 dark:border-red-900/40 dark:bg-red-900/20' : 'border-emerald-300 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-900/20']">
                <div :class="['grid h-8 w-8 place-items-center rounded-full text-white', user.enabled ? 'bg-red-600' : 'bg-emerald-600']"><i :class="user.enabled ? 'fas fa-times-circle' : 'fas fa-check-circle'"></i></div>
                <div class="flex flex-col"><span class="text-xs font-medium text-slate-500">Nuevo estado</span><span class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ user.enabled ? 'Inactivo' : 'Activo' }}</span></div>
              </div>
            </div>
          </div>

          <!-- Impact Information -->
          <div class="flex gap-3 rounded-lg border border-slate-200 bg-slate-100 p-6 dark:border-slate-700 dark:bg-slate-800">
            <div class="text-blue-500"><i class="fas fa-info-circle text-xl"></i></div>
            <div>
              <h5 class="m-0 mb-2 text-base font-semibold text-slate-900 dark:text-slate-100">{{ user.enabled ? 'Al desactivar este usuario:' : 'Al activar este usuario:' }}</h5>
              <ul class="m-0 list-disc pl-5 text-sm leading-6 text-slate-600 dark:text-slate-300" v-if="user.enabled">
                <li>No podrá iniciar sesión en el sistema</li>
                <li>Sus sesiones activas serán terminadas</li>
                <li>Mantendrá acceso a los datos que ya tiene</li>
                <li>Puede ser reactivado en cualquier momento</li>
              </ul>
              <ul class="m-0 list-disc pl-5 text-sm leading-6 text-slate-600 dark:text-slate-300" v-else>
                <li>Podrá iniciar sesión normalmente</li>
                <li>Tendrá acceso según sus roles asignados</li>
                <li>Sus datos se mantienen intactos</li>
                <li>Puede ser desactivado nuevamente si es necesario</li>
              </ul>
            </div>
          </div>

          <!-- Confirmation Message -->
          <div class="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/40 dark:bg-amber-900/20">
            <div class="text-amber-500"><i class="fas fa-question-circle text-xl"></i></div>
            <div>
              <h4 class="m-0 mb-2 text-base font-semibold text-slate-900 dark:text-slate-100">¿Estás seguro de que deseas {{ user.enabled ? 'desactivar' : 'activar' }} este usuario?</h4>
              <p class="m-0 text-sm text-slate-600 dark:text-slate-300">
                Esta acción {{ user.enabled ? 'desactivará' : 'activará' }} el usuario
                <strong>{{ user.username }}</strong> y {{ user.enabled ? 'le impedirá' : 'le permitirá' }}
                iniciar sesión en el sistema.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="border-t border-slate-200 bg-slate-100 px-8 py-4 dark:border-slate-700 dark:bg-slate-800">
        <div class="flex justify-end gap-3">
          <button @click="handleClose" class="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-slate-200 px-4 py-2 text-sm font-medium text-slate-900 transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-100" :disabled="isChanging">
            <i class="fas fa-times"></i>
            Cancelar
          </button>
          <button @click="handleStatusChange" :class="['inline-flex min-w-[120px] items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50', user.enabled ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700']" :disabled="isChanging">
            <i :class="[user.enabled ? 'fas fa-ban' : 'fas fa-check', { 'fa-spin': isChanging }]"></i>
            {{ isChanging ? 'Procesando...' : (user.enabled ? 'Desactivar' : 'Activar') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Props
const props = defineProps({
  user: { type: Object, required: true },
  show: { type: Boolean, default: false },
})

// Emits
const emit = defineEmits(['close', 'confirmed'])

// Reactive data
const isChanging = ref(false)

// Methods
const handleClose = () => { if (!isChanging.value) emit('close') }

const handleStatusChange = async () => {
  try {
    isChanging.value = true
    emit('confirmed')
  } catch (error) {
  } finally {
    isChanging.value = false
  }
}

const getStatusIcon = (enabled) => enabled ? 'fas fa-check-circle' : 'fas fa-times-circle'
</script>

