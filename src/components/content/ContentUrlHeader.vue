<template>
  <div
    class="flex flex-col gap-5 rounded-2xl border bg-slate-100 p-6 shadow dark:border-slate-700 dark:bg-slate-800 lg:flex-row lg:items-center lg:justify-between"
  >
    <div class="flex items-start gap-4 md:items-center">
      <div
        class="grid h-12 w-12 place-items-center rounded-xl text-lg text-white shadow md:h-14 md:w-14 md:text-xl"
        style="background: linear-gradient(135deg, #2563eb, #60a5fa)"
      >
        <i class="fas fa-link"></i>
      </div>
      <div>
        <h1 class="m-0 text-xl font-bold text-slate-900 dark:text-slate-100 md:text-2xl">
          Sección de Botonera (Url) - {{ path }} - ${{ view }}
        </h1>
        <p class="m-0 text-sm text-slate-500 dark:text-slate-300">
          Navega y gestiona los enlaces del portal
        </p>
      </div>
    </div>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <button
        v-can="['ROLE_ADMIN', 'ROLE_SUPER_USER']"
        @click="$emit('create')"
        class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 disabled:opacity-50 sm:w-auto"
        title="Crear Documento"
      >
        <i class="fas fa-plus"></i>
        Crear Enlace
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  path: String,
  view: String,
})

defineEmits(['create'])
</script>
