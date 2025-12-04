<template>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr">
    <article
      v-for="item in items"
      :key="item.id"
      class="group flex h-full max-w-[400px] flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
    >
      <div class="mb-3 flex items-center gap-3">
        <div class="grid h-11 w-11 place-items-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
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

      <div class="mt-auto">
        <div class="flex items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span class="truncate" :title="getDocumentStatus(item)">{{ getDocumentStatus(item) }}</span>
          <a
            :href="normalizeUrl(item.url || item.content)"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-white shadow hover:bg-blue-700"
          >
            <i class="fas fa-external-link-alt"></i> Abrir
          </a>
        </div>

        <div
          v-if="authStore.hasRole('ROLE_ADMIN') || authStore.hasRole('ROLE_SUPER_USER')"
          class="mt-3 flex items-center gap-2"
        >
          <button
            class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-amber-700"
            @click.prevent.stop="$emit('edit', item)"
            title="Editar documento"
          >
            <i class="fas fa-edit"></i>
            Editar
          </button>
          <button
            class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-red-700"
            @click.prevent.stop="handleDelete(item)"
            title="Eliminar documento"
          >
            <i class="fas fa-trash-alt"></i>
            Eliminar
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

const emit = defineEmits(['edit', 'delete'])

const handleDelete = (item) => {
  if (!item) return
  emit('delete', item)
}

const normalizeUrl = (url) => {
  if (!url) return "#"
  const trimmed = url.toString().trim()
  if (/^(https?:)?\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed.replace(/^\/+/, "")}`
}
</script>
