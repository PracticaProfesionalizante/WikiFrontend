<template>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <article
      v-for="item in items"
      :key="item.id"
      class="group cursor-pointer rounded-xl border p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
      @click="$emit('open', item)"
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
      <div class="flex items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span class="truncate" :title="getDocumentStatus(item)">{{ getDocumentStatus(item) }}</span>

        <div v-if="authStore.hasRole('ROLE_ADMIN') || authStore.hasRole('ROLE_SUPER_USER')" class="flex shrink-0 items-center gap-2">
          <button
            class="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-200 dark:bg-amber-600 dark:text-white dark:hover:bg-amber-700"
            @click.prevent.stop="$emit('edit', item)"
            title="Editar documento"
          >
            <i class="fas fa-edit"></i>
            <span class="hidden sm:inline">Editar</span>
          </button>
          <button
            class="inline-flex items-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-200 dark:bg-red-600 dark:text-white dark:hover:bg-red-700"
            @click.prevent.stop="handleDelete(item)"
            title="Eliminar documento"
          >
            <i class="fas fa-trash-alt"></i>
            <span class="hidden sm:inline">Eliminar</span>
          </button>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

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

const emit = defineEmits(["open", "edit", 'delete'])

const handleDelete = (item) => {
  if (!item) return
  emit('delete', item)
}
</script>
