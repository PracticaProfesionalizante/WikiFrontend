<template>
  <Transition name="modal-fade">
    <div
      v-if="show"
      class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      @click.self="$emit('close')"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="modalTitleId"
      :aria-describedby="modalMessageId"
    >
      <div class="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
        <!-- Header -->
        <div class="flex items-start justify-between border-b border-slate-200 p-5 dark:border-slate-700">
          <div class="flex items-center gap-3">
            <div class="grid h-10 w-10 place-items-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div>
              <h3 :id="modalTitleId" class="m-0 text-lg font-semibold text-slate-900 dark:text-slate-100">
                {{ title }}
              </h3>
            </div>
          </div>
          <button
            @click="$emit('close')"
            class="grid h-8 w-8 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            title="Cerrar"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="p-5">
          <p :id="modalMessageId" class="text-sm text-slate-600 dark:text-slate-300">
            {{ message }}
          </p>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <button
            @click="$emit('close')"
            class="inline-flex min-w-[100px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            <i class="fas fa-times"></i>
            Cancelar
          </button>
          <button
            @click="$emit('confirm')"
            class="inline-flex min-w-[100px] items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
          >
            <i class="fas fa-trash-alt"></i>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>

defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Confirmar Acción',
  },
  message: {
    type: String,
    default: '¿Estás seguro de que quieres realizar esta acción?',
  },
})

defineEmits(['close', 'confirm'])

const modalId = `modal-${Math.random().toString(36).substring(2, 9)}`
const modalTitleId = `${modalId}-title`
const modalMessageId = `${modalId}-message`
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
