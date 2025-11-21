<template>
  <div class="hidden overflow-x-auto md:block">
    <table class="w-full min-w-[1220px] border-collapse">
      <thead>
        <tr>
          <th
            class="sticky top-0 z-10 bg-slate-200/60 p-3 text-left text-sm font-semibold text-slate-700 dark:bg-slate-700/60 dark:text-slate-100"
          >
            Título
          </th>
          <th
            class="sticky top-0 z-10 bg-slate-200/60 p-3 text-left text-sm font-semibold text-slate-700 dark:bg-slate-700/60 dark:text-slate-100"
          >
            Tipo
          </th>
          <th
            class="sticky top-0 z-10 bg-slate-200/60 p-3 text-left text-sm font-semibold text-slate-700 dark:bg-slate-700/60 dark:text-slate-100"
          >
            Autor
          </th>
          <th
            class="sticky top-0 z-10 bg-slate-200/60 p-3 text-left text-sm font-semibold text-slate-700 dark:bg-slate-700/60 dark:text-slate-100"
          >
            Estado
          </th>
          <th
            class="sticky top-0 z-10 bg-slate-200/60 p-3 text-left text-sm font-semibold text-slate-700 dark:bg-slate-700/60 dark:text-slate-100"
          >
            Última edición
          </th>
          <th
            class="sticky top-0 z-10 bg-slate-200/60 p-3 text-left text-sm font-semibold text-slate-700 dark:bg-slate-700/60 dark:text-slate-100"
          >
            Acciones
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="doc in items"
          :key="doc.id"
          class="hover:bg-slate-200/60 dark:hover:bg-slate-700/40"
          @dblclick="$emit('preview', doc)"
        >
          <!-- Título -->
          <td class="p-3 align-middle">
            <div class="flex flex-wrap items-center gap-3">
              <i class="fas fa-file-alt text-blue-500"></i>
              <button
                type="button"
                class="inline-flex items-center gap-2 text-left font-medium text-slate-900 underline-offset-2 hover:text-blue-600 hover:underline focus:underline focus:outline-none dark:text-slate-100"
                @click="$emit('preview', doc)"
                @keyup.enter="$emit('preview', doc)"
                title="Ver contenido"
              >
                {{ doc.title || doc.name || 'Sin título' }}
              </button>
            </div>
          </td>

          <!-- Tipo -->
          <td class="p-3 align-middle">
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
          </td>

          <!-- Autor -->
          <td class="p-3 align-middle text-slate-700 dark:text-slate-200">
            <div class="flex flex-col">
              <span>{{ getDocumentAuthor(doc) }}</span>
              <span
                v-if="doc.createdAt || doc.created_at"
                class="text-xs text-slate-500 dark:text-slate-400"
              >
                {{ formatDate(doc.createdAt || doc.created_at) }}
              </span>
            </div>
          </td>

          <!-- Estado -->
          <td class="p-3 align-middle">
            <button
              type="button"
              @click="$emit('toggle-status', doc)"
              :class="[
                'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.8rem] font-semibold uppercase tracking-wide transition shadow-sm hover:scale-105 hover:shadow-md',
                getDocumentStatus(doc) === 'Activo'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/40 dark:bg-emerald-900/30 dark:text-emerald-200'
                  : 'border-red-200 bg-red-50 text-red-600 dark:border-red-900/40 dark:bg-red-900/30 dark:text-red-200',
              ]"
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
          </td>

          <!-- Última edición -->
          <td class="p-3 align-middle text-slate-700 dark:text-slate-200">
            <div class="flex flex-col">
              <span>{{ getDocumentEditor(doc) }}</span>
              <span
                v-if="doc.updatedAt || doc.updated_at"
                class="text-xs text-slate-500 dark:text-slate-400"
              >
                {{ formatDate(doc.updatedAt || doc.updated_at) }}
              </span>
            </div>
          </td>

          <!-- Acciones -->
          <td class="p-3 align-middle">
            <div class="flex items-center gap-2">
              <button
                @click="$emit('preview', doc)"
                class="grid h-8 w-8 place-items-center rounded bg-slate-300 text-slate-800 transition hover:-translate-y-0.5 dark:bg-slate-700 dark:text-slate-100"
                title="Ver"
              >
                <i class="fas fa-eye"></i>
              </button>
              <button
                @click="$emit('edit', doc)"
                class="grid h-8 w-8 place-items-center rounded bg-blue-600 text-white transition hover:-translate-y-0.5"
                title="Editar"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button
                @click="$emit('delete', doc)"
                class="grid h-8 w-8 place-items-center rounded bg-red-600 text-white transition hover:-translate-y-0.5"
                title="Eliminar"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
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
