<template>
  <!-- Modal Overlay -->
  <div
    v-if="modelValue"
    class="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
  >
    <!-- Modal Card -->
    <div
      class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-4xl overflow-hidden animate-fadeInUp"
    >
      <!-- HEADER -->
      <header
        class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center"
      >
        <h2 class="text-xl font-semibold text-slate-800 dark:text-slate-100">
          {{ title }}
        </h2>

        <button
          class="text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white transition"
          @click="close"
        >
          <i class="fas fa-times text-xl"></i>
        </button>
      </header>

      <!-- LOADING -->
      <div v-if="loading" class="py-14 flex flex-col items-center justify-center space-y-3">
        <div class="h-10 w-10 animate-spin border-4 border-slate-300 border-t-blue-500 rounded-full"></div>
        <p class="text-slate-600 dark:text-slate-300">Cargando…</p>
      </div>

      <!-- FORM CONTENT -->
      <form v-else @submit.prevent="submit">
        <div class="px-6 py-6 max-h-[70vh] overflow-y-auto custom-scroll">
          <!-- Aquí se inyecta el formulario específico (TEXT, URL, PDF) -->
          <slot />
        </div>

        <!-- FOOTER -->
        <footer
          class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900"
        >
          <button
            type="button"
            class="px-4 py-2 rounded-lg font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition"
            @click="close"
          >
            Cancelar
          </button>

          <button
            type="submit"
            class="px-5 py-2 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-60"
            :disabled="loading"
          >
            {{ submitLabel }}
          </button>
        </footer>
      </form>
    </div>
  </div>
</template>

<script setup>
/**
 * PROPS
 */
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, required: true },
  loading: { type: Boolean, default: false },
  submitLabel: { type: String, default: "Guardar" },
})

/**
 * EMITS
 */
const emit = defineEmits(["update:modelValue", "submit", "close"])

/**
 * MÉTODOS
 */
const close = () => {
  emit("update:modelValue", false)
  emit("close")
}

const submit = () => {
  emit("submit")
}
</script>

<style scoped>
/* Scroll del modal */
.custom-scroll::-webkit-scrollbar {
  width: 8px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(100, 100, 120, 0.4);
  border-radius: 4px;
}
.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 100, 120, 0.6);
}

/* Animación sexy */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(25px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeInUp {
  animation: fadeInUp 0.2s ease-out;
}
</style>
