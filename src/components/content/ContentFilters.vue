<template>
  <div class="flex flex-col gap-4 border-b border-slate-200 p-4 dark:border-slate-700">
    <!-- Buscador -->
    <div class="flex flex-col gap-2">
      <div
        class="relative flex items-center rounded-xl border-2 border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900 w-full"
      >
        <i class="fas fa-search mx-3 text-slate-500"></i>
        <input
          :value="search"
          type="text"
          placeholder="Buscar contenidos por título, autor o tipo..."
          class="flex-1 bg-transparent outline-none text-[0.95rem] text-slate-900 dark:text-slate-100 placeholder:text-slate-500"
          @input="onInputSearch"
        />
        <button
          v-if="search"
          @click="clearSearch"
          class="ml-2 grid h-8 w-8 place-items-center rounded bg-red-600 text-white hover:bg-red-700"
          title="Limpiar"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div
        v-if="search"
        class="inline-flex items-center gap-2 rounded border border-slate-200 bg-slate-200/60 px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-700/60 dark:text-slate-300"
      >
        <i class="fas fa-filter"></i>
        {{ filteredCount }} resultado(s) encontrados
      </div>
    </div>

    <div
      class="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
    >
      <!-- Vista + filtros de estado/tipo -->
      <div class="flex flex-wrap items-center gap-3">
        <span
          class="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100"
        >
          <i class="fas fa-eye text-blue-500 text-xs"></i>
          Vista:
        </span>
        <div
          class="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <button
            @click="setView('table')"
            :class="[
              'px-3 py-2 rounded-md text-xs font-semibold uppercase tracking-wide transition',
              viewMode === 'table'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800',
            ]"
          >
            <i class="fas fa-table mr-1"></i>
            Tabla
          </button>
          <button
            @click="setView('grid')"
            :class="[
              'px-3 py-2 rounded-md text-xs font-semibold uppercase tracking-wide transition',
              viewMode === 'grid'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800',
            ]"
          >
            <i class="fas fa-th-large mr-1"></i>
            Tarjetas
          </button>
        </div>

        <!-- Filtro estado -->
        <div class="flex items-center gap-2">
          <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Estado:
          </label>
          <select
            :value="filterStatus"
            @change="updateFilterStatus($event.target.value)"
            class="w-full min-w-[160px] rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 sm:w-auto"
          >
            <option value="">Todos</option>
            <option value="Activo">Activos</option>
            <option value="Inactivo">Inactivos</option>
          </select>
        </div>

        <!-- Filtro tipo doc -->
        <div class="flex items-center gap-2">
          <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Documento:
          </label>
          <select
            :value="filterType"
            @change="updateFilterType($event.target.value)"
            class="w-full min-w-[160px] rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 sm:w-auto"
          >
            <option value="">Todos</option>
            <option value="PDF">PDF</option>
            <option value="TEXT">Texto</option>
            <option value="URL">URL</option>
          </select>
        </div>
      </div>

      <!-- Orden y botón de orden -->
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2">
          <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Ordenar por:
          </label>
          <select
            :value="sortBy"
            @change="updateSortBy($event.target.value)"
            class="w-full min-w-[180px] rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 sm:w-auto"
          >
            <option value="createdAt">Fecha de creación</option>
            <option value="name">Título</option>
            <option value="type">Tipo</option>
            <option value="createdBy">Autor</option>
            <option value="status">Estado</option>
          </select>
        </div>
        <button
          @click="$emit('toggle-sort-order')"
          class="grid h-10 w-10 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-900 transition hover:scale-105 hover:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          :title="sortOrder === 'asc' ? 'Ordenar descendente' : 'Ordenar ascendente'"
        >
          <i
            :class="sortOrder === 'asc' ? 'fas fa-sort-amount-up' : 'fas fa-sort-amount-down'"
          ></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  search: {
    type: String,
    default: '',
  },
  filterType: {
    type: String,
    default: '',
  },
  filterStatus: {
    type: String,
    default: '',
  },
  sortBy: {
    type: String,
    default: 'createdAt',
  },
  sortOrder: {
    type: String,
    default: 'desc',
  },
  viewMode: {
    type: String,
    default: 'table',
  },
  filteredCount: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits([
  'update:search',
  'update:filterType',
  'update:filterStatus',
  'update:sortBy',
  'update:sortOrder',
  'update:viewMode',
  'toggle-sort-order',
  'search-input',
])

const onInputSearch = (event) => {
  emit('update:search', event.target.value)
  emit('search-input')
}

const clearSearch = () => {
  emit('update:search', '')
  emit('search-input')
}

const updateFilterType = (value) => {
  emit('update:filterType', value)
}

const updateFilterStatus = (value) => {
  emit('update:filterStatus', value)
}

const updateSortBy = (value) => {
  emit('update:sortBy', value)
}

const setView = (mode) => {
  emit('update:viewMode', mode)
}
</script>
