<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
  >
    <div class="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
      <header
        class="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700"
      >
        <div class="flex items-center gap-3">
          <div
            class="grid h-10 w-10 place-items-center rounded-xl text-white"
            :class="iconWrapperClass"
          >
            <i :class="iconClass"></i>
          </div>
          <div>
            <p class="m-0 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {{ badgeLabel }}
            </p>
            <h3 class="m-0 text-lg font-semibold text-slate-900 dark:text-slate-100">{{ title }}</h3>
          </div>
        </div>
        <button
          class="grid h-10 w-10 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          @click="close"
          aria-label="Cerrar"
        >
          <i class="fas fa-times"></i>
        </button>
      </header>

      <section class="space-y-3 px-5 py-4 text-sm text-slate-700 dark:text-slate-200">
        <p class="m-0 whitespace-pre-line">{{ message }}</p>
        <p v-if="details" class="m-0 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {{ details }}
        </p>
        <slot />
      </section>

      <footer class="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-700">
        <slot name="actions">
          <button
            type="button"
            class="px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 rounded-lg"
            @click="close"
          >
            Cerrar
          </button>
        </slot>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue"

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  type: { type: String, default: "info" }, // success | error | warning | info
  title: { type: String, default: "" },
  message: { type: String, default: "" },
  details: { type: String, default: "" },
})

const emit = defineEmits(["update:modelValue", "close"])

const iconClass = computed(() => {
  if (props.type === "success") return "fas fa-check"
  if (props.type === "error") return "fas fa-times"
  if (props.type === "warning") return "fas fa-exclamation"
  return "fas fa-info"
})

const iconWrapperClass = computed(() => {
  if (props.type === "success") return "bg-emerald-500"
  if (props.type === "error") return "bg-red-500"
  if (props.type === "warning") return "bg-amber-500"
  return "bg-blue-500"
})

const badgeLabel = computed(() => {
  if (props.type === "success") return "Éxito"
  if (props.type === "error") return "Error"
  if (props.type === "warning") return "Advertencia"
  return "Información"
})

const close = () => {
  emit("update:modelValue", false)
  emit("close")
}
</script>
