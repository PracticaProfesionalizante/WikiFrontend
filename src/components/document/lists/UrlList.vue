<template>
  <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <article
      v-for="item in items"
      :key="item.id"
      class="rounded-xl border p-4 shadow-sm transition dark:border-slate-700 dark:bg-slate-800"
    >
      <div class="mb-3 flex items-center gap-3">
        <div class="grid h-10 w-10 place-items-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
          <i :class="getTypeIcon(item.type)"></i>
        </div>

        <div class="flex-1">
          <h3 class="m-0 text-base font-semibold text-slate-900 dark:text-slate-50">
            {{ item.name }}
          </h3>
          <p class="m-0 text-xs text-slate-500 dark:text-slate-400">
            {{ formatDate(item.updatedAt || item.createdAt) }}
          </p>
        </div>
      </div>

      <p class="m-0 mb-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
        {{ item.description }}
      </p>

      <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{{ getDocumentStatus(item) }}</span>

        <a
          :href="item.url || item.content"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-white shadow hover:-translate-y-0.5"
        >
          <i class="fas fa-external-link-alt"></i> Abrir
        </a>
      </div>

      <button
        class="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white"
        @click="$emit('edit', item)"
      >
        <i class="fas fa-edit"></i> Editar
      </button>
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
