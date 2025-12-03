<template>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <article
      v-for="item in items"
      :key="item.id"
      class="rounded-xl border p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <div class="mb-3 flex items-center gap-3">
        <div class="grid h-10 w-10 place-items-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300">
          <i :class="getTypeIcon(item.type)"></i>
        </div>
        <div>
          <h3 class="m-0 text-base font-semibold text-slate-900 dark:text-slate-50">
            {{ item.name }}
          </h3>
          <p class="m-0 text-xs text-slate-500 dark:text-slate-400">
            {{ getDocumentStatus(item) }}
          </p>
        </div>
      </div>

      <p class="text-sm text-slate-600 line-clamp-2 dark:text-slate-300">
        {{ item.description }}
      </p>

      <div class="mt-3 text-xs text-slate-500 dark:text-slate-400">
        {{ formatDate(item.updatedAt || item.createdAt) }}
      </div>

      <div class="flex gap-2 mt-4">
        <button
          class="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white dark:bg-blue-600"
          @click="$emit('open', item)"
        >
          <i class="fas fa-eye"></i> Abrir
        </button>

        <button
          class="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white"
          @click="$emit('edit', item)"
        >
          <i class="fas fa-edit"></i> Editar
        </button>
      </div>
    </article>
  </div>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  getDocumentStatus: {
    type: Function,
    required: true,
  },
  getTypeDisplay: {
    type: Function,
    default: undefined,
  },
  getTypeIcon: {
    type: Function,
    required: true,
  },
  getTypeColors: {
    type: Function,
    default: undefined,
  },
  formatDate: {
    type: Function,
    required: true,
  },
})

defineEmits(["open", "edit"])
</script>
