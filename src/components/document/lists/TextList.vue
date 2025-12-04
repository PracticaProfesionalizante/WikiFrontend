<template>
  <div class="space-y-3">
    <article
      v-for="item in items"
      :key="item.id"
      class="group cursor-pointer rounded-xl border p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
      @click="$emit('open', item)"
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

          <div class="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {{ getDocumentStatus(item) }}
          </div>

          <button
          class="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-200 dark:bg-amber-600 dark:text-white dark:hover:bg-amber-700"
          @click.stop="$emit('edit', item)"
          v-if="authStore.hasRole('ROLE_ADMIN') || authStore.hasRole('ROLE_SUPER_USER')"
          title="Editar documento"
        >
          <i class="fas fa-edit"></i> Editar
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

defineEmits(["open", "edit"])
</script>
