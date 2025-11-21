<template>
  <div>
    <div
      v-for="doc in items"
      :key="`table-card-${doc.id}`"
      class="rounded-xl border border-slate-200 bg-white p-4 shadow dark:border-slate-700 dark:bg-slate-900"
    >
      <div class="flex flex-col gap-3">
        <!-- Header card -->
        <div class="flex items-start justify-between gap-3">
          <div class="flex flex-1 items-start gap-3">
            <div
              class="grid h-10 w-10 place-items-center rounded-full text-white"
              :class="getDocumentStatus(doc) === 'Activo' ? 'bg-emerald-500' : 'bg-red-500'"
            >
              <i class="fas fa-file-alt"></i>
            </div>
            <div class="flex flex-col">
              <button
                type="button"
                @click="$emit('preview', doc)"
                class="text-left text-base font-semibold text-slate-900 underline-offset-2 hover:text-blue-600 hover:underline focus:underline focus:outline-none dark:text-slate-100"
              >
                {{ doc.title || doc.name || 'Sin título' }}
              </button>
              <span class="text-xs text-slate-500">
                {{ getTypeDisplay(doc.type || doc.category) }}
              </span>
            </div>
          </div>

          <button
            type="button"
            @click="$emit('toggle-status', doc)"
            class="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wide transition shadow-sm hover:scale-105"
            :class="
              getDocumentStatus(doc) === 'Activo'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/40 dark:bg-emerald-900/30 dark:text-emerald-200'
                : 'border-red-200 bg-red-50 text-red-600 dark:border-red-900/40 dark:bg-red-900/30 dark:text-red-200'
            "
          >
            <i
              :class="
                getDocumentStatus(doc) === 'Activo'
                  ? 'fas fa-check-circle'
                  : 'fas fa-times-circle'
              "
            ></i>
            {{ getDocumentStatus(doc) === 'Activo' ? 'Activo' : 'Inactivo' }}
          </button>
        </div>

        <!-- Body card -->
        <div class="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <!-- Tipo -->
          <div class="flex items-center gap-2">
            <strong>Tipo:</strong>
            <span
              :class="[
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
                getTypeColors(doc.type).bg,
                getTypeColors(doc.type).text,
                getTypeColors(doc.type).border,
              ]"
            >
              <i :class="[getTypeIcon(doc.type), getTypeColors(doc.type).icon]"></i>
              {{ getTypeDisplay(doc.type || doc.category) }}
            </span>
          </div>

          <!-- Autor -->
          <div class="flex flex-col">
            <span
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Autor
            </span>
            <span>{{ getDocumentAuthor(doc) }}</span>
            <span
              v-if="doc.createdAt || doc.created_at"
              class="text-xs text-slate-500 dark:text-slate-400"
            >
              {{ formatDate(doc.createdAt || doc.created_at) }}
            </span>
          </div>

          <!-- Última edición -->
          <div class="flex flex-col">
            <span
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Última edición
            </span>
            <span>{{ getDocumentEditor(doc) }}</span>
            <span
              v-if="doc.updatedAt || doc.updated_at"
              class="text-xs text-slate-500 dark:text-slate-400"
            >
              {{ formatDate(doc.updatedAt || doc.updated_at) }}
            </span>
          </div>
        </div>

        <!-- Acciones -->
        <div class="flex flex-wrap gap-2">
          <button
            @click="$emit('preview', doc)"
            class="inline-flex items-center gap-2 rounded bg-slate-300 px-3 py-1.5 text-sm font-medium text-slate-800 transition hover:-translate-y-0.5 dark:bg-slate-700 dark:text-slate-100"
          >
            <i class="fas fa-eye"></i>
            Ver
          </button>
          <button
            @click="$emit('edit', doc)"
            class="inline-flex items-center gap-2 rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:-translate-y-0.5"
          >
            <i class="fas fa-edit"></i>
            Editar
          </button>
          <button
            @click="$emit('delete', doc)"
            class="inline-flex items-center gap-2 rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:-translate-y-0.5"
          >
            <i class="fas fa-trash"></i>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const {
  items,
  getDocumentStatus,
  getTypeDisplay,
  getTypeColors,
  getTypeIcon,
  getDocumentAuthor,
  getDocumentEditor,
  formatDate,
} = defineProps({
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
    required: true,
  },
  getTypeColors: {
    type: Function,
    required: true,
  },
  getTypeIcon: {
    type: Function,
    required: true,
  },
  getDocumentAuthor: {
    type: Function,
    required: true,
  },
  getDocumentEditor: {
    type: Function,
    required: true,
  },
  formatDate: {
    type: Function,
    required: true,
  },
})

defineEmits(['preview', 'edit', 'delete', 'toggle-status'])
</script>
