<template>
  <div
    v-if="open"
    class="fixed inset-0 z-[1000] grid place-items-center bg-black/60 p-4"
  >
    <div
      class="w-full max-w-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
    >
      <!-- Header -->
      <div class="flex items-center justify-between bg-amber-500 px-6 py-4 text-white">
        <h3 class="m-0 text-base font-semibold">
          <i :class="action === 'activate' ? 'fas fa-check' : 'fas fa-ban'"></i>
          Confirmar {{ action === 'activate' ? 'Activación' : 'Desactivación' }}
        </h3>
        <button
          @click="$emit('cancel')"
          class="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-white ring-1 ring-white/30 backdrop-blur"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="px-6 py-5 text-sm">
        ¿Estás seguro de que deseas
        {{ action === 'activate' ? 'activar' : 'desactivar' }} este contenido?
      </div>

      <!-- Footer -->
      <div
        class="flex justify-end gap-3 border-t border-slate-200 bg-slate-100 px-6 py-4 dark:border-slate-700 dark:bg-slate-800"
      >
        <button
          @click="$emit('cancel')"
          class="inline-flex min-w-[110px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-slate-200 px-4 py-2 text-sm font-medium text-slate-900 transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-100"
        >
          <i class="fas fa-times"></i> Cancelar
        </button>
        <button
          @click="$emit('confirm')"
          class="inline-flex min-w-[110px] items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5"
        >
          <i :class="action === 'activate' ? 'fas fa-check' : 'fas fa-ban'"></i>
          {{ action === 'activate' ? 'Activar' : 'Desactivar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  // 'activate' | 'deactivate'
  action: {
    type: String,
    default: 'activate',
  },
})

defineEmits(['confirm', 'cancel'])
</script>
