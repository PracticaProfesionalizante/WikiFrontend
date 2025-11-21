<template>
  <div
    v-if="open"
    class="fixed inset-0 z-[1000] grid place-items-center bg-black/60 p-4"
  >
    <div
      class="w-full max-w-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
    >
      <!-- Header -->
      <div class="flex items-center justify-between bg-red-600 px-6 py-4 text-white">
        <h3 class="m-0 text-base font-semibold">
          <i class="fas fa-trash-alt mr-2"></i>
          Confirmar eliminación
        </h3>
        <button
          @click="$emit('cancel')"
          class="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-white ring-1 ring-white/30 backdrop-blur"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="px-6 py-5 text-sm leading-relaxed">
        <p class="mb-2">¿Estás seguro de que deseas eliminar este documento?</p>
        <p class="font-semibold text-slate-800 dark:text-slate-200">
          {{ itemTitle }}
        </p>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Esta acción no se puede deshacer.
        </p>

        <div class="mt-4 space-y-2">
          <label
            class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Escribe <span class="text-red-600">{{ confirmText }}</span> para confirmar
          </label>
          <input
            :value="confirmInput"
            type="text"
            :placeholder="confirmText"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            @input="$emit('update:confirmInput', $event.target.value)"
          />
        </div>
      </div>

      <!-- Footer -->
      <div
        class="flex justify-end gap-3 border-t border-slate-200 bg-slate-100 px-6 py-4 dark:border-slate-700 dark:bg-slate-800"
      >
        <button
          @click="$emit('cancel')"
          class="inline-flex min-w-[110px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-slate-200 px-4 py-2 text-sm font-medium text-slate-900 transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-100"
          :disabled="deleting"
        >
          <i class="fas fa-times"></i>
          Cancelar
        </button>
        <button
          @click="$emit('confirm')"
          class="inline-flex min-w-[110px] items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 disabled:opacity-60"
          :disabled="deleting || confirmInputTrimmed.toUpperCase() !== confirmText"
        >
          <i v-if="!deleting" class="fas fa-trash-alt"></i>
          <i v-else class="fas fa-spinner fa-spin"></i>
          Eliminar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  itemTitle: {
    type: String,
    default: 'Documento sin título',
  },
  confirmInput: {
    type: String,
    default: '',
  },
  confirmText: {
    type: String,
    default: 'ELIMINAR',
  },
  deleting: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['confirm', 'cancel', 'update:confirmInput'])

const confirmInputTrimmed = computed(() => props.confirmInput.trim())
</script>
