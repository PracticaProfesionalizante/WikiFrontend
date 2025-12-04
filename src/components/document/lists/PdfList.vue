<template>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <article
      v-for="item in items"
      :key="item.id"
      class="group relative cursor-pointer rounded-xl border p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
      @click="openPdf(item)"
    >
      <!-- Overlay de carga -->
      <div
        v-if="loadingPdfId === item.id"
        class="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-slate-900/60 text-white backdrop-blur-sm"
      >
        <i class="fas fa-spinner fa-spin text-2xl"></i>
        <span class="mt-2 text-sm font-medium">Abriendo PDF...</span>
      </div>
      <div class="mb-3 flex items-center gap-3">
        <div class="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300">
          <i :class="getTypeIcon(item.type)"></i>
        </div>
        <div>
          <h3 class="m-0 text-base font-semibold text-slate-900 dark:text-slate-50">
            {{ item.name }}
          </h3>
          <p class="m-0 text-xs text-slate-500 dark:text-slate-400">
            {{ formatDate(item.updatedAt || item.createdAt) }}
          </p>
        </div>
      </div>

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
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import documentService from '@/services/documentService'

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

// --- Lógica para abrir PDF ---
const loadingPdfId = ref(null)

const openPdf = async (item) => {
  if (loadingPdfId.value) return // Evitar múltiples clics

  loadingPdfId.value = item.id
  try {
    const blobUrl = await documentService.getDocumentFileUrl(item.id)
    window.open(blobUrl, '_blank', 'noopener,noreferrer')
  } catch (error) {
    console.error('Error al abrir el PDF:', error)
    let errorMessage = 'No se pudo abrir el archivo PDF. '
    if (error.isFileNotFound) {
      errorMessage += 'El archivo no fue encontrado en el servidor.'
    } else {
      errorMessage += 'Por favor, inténtalo de nuevo.'
    }
    alert(errorMessage)
  } finally {
    loadingPdfId.value = null
  }
}
const handleDelete = (item) => {
  if (!item) return
  emit('delete', item)
}
</script>
