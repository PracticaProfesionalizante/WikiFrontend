<template>
  <div class="space-y-3">
    <article
      v-for="item in items"
      :key="item.id"
      class="rounded-xl border p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <div class="flex items-start gap-3">
        <div class="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
          <i :class="getTypeIcon(item.type)"></i>
        </div>

        <div class="flex-1">
          <div class="flex items-start justify-between">
            <h3 class="m-0 text-base font-semibold text-slate-900 dark:text-slate-50">
              {{ item.name }}
            </h3>
            <span class="text-xs text-slate-500 dark:text-slate-400">
              {{ formatDate(item.updatedAt || item.createdAt) }}
            </span>
          </div>

          <p class="m-0 mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
            {{ item.description }}
          </p>

          <div class="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {{ getDocumentStatus(item) }}
          </div>

          <div class="flex gap-2 mt-3">
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
        </div>
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
