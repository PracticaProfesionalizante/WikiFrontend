<template>
  <header
    class="border-b bg-white/80 px-4 py-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"
  >
    <div class="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p
          class="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Documentos - {{ folderName }}
        </p>
        <h1 class="m-0 text-2xl font-bold text-slate-900 dark:text-slate-50">
          {{ title }}
        </h1>
        <p class="m-0 text-sm text-slate-600 dark:text-slate-400">
          Explora y gestiona los documentos según su tipo y carpeta.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <button
          v-if="canCreate"
          class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5"
          @click="$emit('create')"
        >
          <i class="fas fa-plus"></i>
          {{ createLabel }}
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  folderName: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    default: "Documentos",
  },
  canCreate: {
    type: Boolean,
    default: false,
  },
  createLabel: {
    type: String,
    default: "Crear Nuevo Documento",
  },
})

defineEmits(["create"])
</script>
