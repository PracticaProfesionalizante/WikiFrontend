<template>
  <section class="border-b bg-white/60 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
    <div class="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-1 flex-wrap gap-3">
        <input
          :value="search"
          type="search"
          placeholder="Buscar documentos..."
          class="w-full min-w-[240px] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50 dark:focus:border-blue-400"
          @input="$emit('update:search', $event.target.value)"
        />
        <select
          :value="status"
          class="min-w-[160px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50 dark:focus:border-blue-400"
          @change="$emit('update:status', $event.target.value)"
        >
          <option value="">Estado: Todos</option>
          <option value="Activo">Activos</option>
          <option value="Inactivo">Inactivos</option>
        </select>
      </div>
      <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span class="font-semibold text-slate-700 dark:text-slate-200">
          {{ count }}
        </span>
        encontrados
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  search: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    default: "",
  },
  count: {
    type: Number,
    default: 0,
  },
})

defineEmits(["update:search", "update:status"])
</script>
