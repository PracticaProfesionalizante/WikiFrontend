<template>
  <div class="min-h-screen bg-white dark:bg-slate-900">
    <!-- Header contextual -->
    <header
      class="border-b bg-white/80 px-4 py-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"
    >
      <div
        class="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p
            class="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Documentos - {{ docStore.getFolderName }}
          </p>
          <h1 class="m-0 text-2xl font-bold text-slate-900 dark:text-slate-50">
            {{ titleByType[type] || 'Documentos' }}
          </h1>
          <p class="m-0 text-sm text-slate-600 dark:text-slate-400">
            Explora y gestiona los documentos según su tipo y carpeta.
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <button
            v-if="canCreate"
            class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5"
            @click="$emit('create')"
          >
            <i class="fas fa-plus"></i>
            {{ addDocumentByType[type] || 'Crear Nuevo Documento'}}
          </button>
        </div>
      </div>
    </header>

    <!-- Filtros -->
    <section class="border-b bg-white/60 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <div
        class="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex flex-1 flex-wrap gap-3">
          <input
            v-model="search"
            type="search"
            placeholder="Buscar documentos..."
            class="w-full min-w-[240px] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50 dark:focus:border-blue-400"
          />
          <select
            v-model="status"
            class="min-w-[160px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50 dark:focus:border-blue-400"
          >
            <option value="">Estado: Todos</option>
            <option value="Activo">Activos</option>
            <option value="Inactivo">Inactivos</option>
          </select>
        </div>
        <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span class="font-semibold text-slate-700 dark:text-slate-200">{{
            filteredItems.length
          }}</span>
          encontrados
        </div>
      </div>
    </section>

    <!-- Breadcrumbs simples basados en store -->
    <nav
      v-if="breadcrumbs.length"
      class="border-b bg-slate-50/80 px-4 py-3 text-sm text-slate-600 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300"
    >
      <div class="mx-auto flex max-w-6xl items-center gap-2">
        <button
          class="font-semibold text-blue-600 hover:underline"
          @click="navigateToBreadcrumb(0)"
        >
          Raíz
        </button>
        <template v-for="(crumb, index) in breadcrumbs" :key="crumb.path">
          <span class="text-slate-400">/</span>
          <button
            class="truncate text-blue-600 hover:underline"
            @click="navigateToBreadcrumb(index + 1)"
          >
            {{ crumb.label }}
          </button>
        </template>
      </div>
    </nav>

    <!-- Contenido principal -->
    <main class="mx-auto max-w-6xl px-4 py-6">
      <div v-if="loading" class="grid min-h-[200px] place-items-center text-slate-500">
        <div
          class="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500"
        ></div>
        <p class="mt-3 text-sm">Cargando documentos...</p>
      </div>

      <div
        v-else-if="error"
        class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-200"
      >
        {{ error }}
      </div>

      <template v-else>
        <component
          :is="componentByType[type] || 'div'"
          :items="paginatedItems"
          :get-document-status="getDocumentStatus"
          :get-type-display="getTypeDisplay"
          :get-type-icon="getTypeIcon"
          :get-type-colors="getTypeColors"
          :format-date="formatDate"
          @open="handleOpen"
        />
        <div
          v-if="paginatedItems.length === 0"
          class="grid min-h-[200px] place-items-center rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400"
        >
          <div class="text-4xl text-slate-400"><i class="fas fa-folder-open"></i></div>
          <p class="mt-2 text-sm">No hay documentos para mostrar.</p>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { documentsStore } from '@/stores/documentsStore'
import { useDocumentList } from '@/composables/useDocumentList'

// Componentes por tipo (puedes reemplazar con implementaciones finales)
const PdfList = {
  props: [
    'items',
    'getDocumentStatus',
    'getTypeDisplay',
    'getTypeIcon',
    'getTypeColors',
    'formatDate',
  ],
  template: `<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <article v-for="item in items" :key="item.id" class="rounded-xl border p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div class="mb-3 flex items-center gap-3">
        <div class="grid h-10 w-10 place-items-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300">
          <i :class="getTypeIcon(item.type)"></i>
        </div>
        <div>
          <h3 class="m-0 text-base font-semibold text-slate-900 dark:text-slate-50">{{ item.name || item.title }}</h3>
          <p class="m-0 text-xs text-slate-500 dark:text-slate-400">{{ getDocumentStatus(item) }}</p>
        </div>
      </div>
      <p class="text-sm text-slate-600 line-clamp-2 dark:text-slate-300">{{ item.description || 'Documento PDF' }}</p>
      <div class="mt-3 text-xs text-slate-500 dark:text-slate-400">{{ formatDate(item.updatedAt || item.createdAt) }}</div>
      <button class="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white dark:bg-blue-600" @click="$emit('open', item)">
        <i class="fas fa-eye"></i> Abrir
      </button>
    </article>
  </div>`,
}

const TextList = {
  props: [
    'items',
    'getDocumentStatus',
    'getTypeDisplay',
    'getTypeIcon',
    'getTypeColors',
    'formatDate',
  ],
  template: `<div class="space-y-3">
    <article v-for="item in items" :key="item.id" class="rounded-xl border p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div class="flex items-start gap-3">
        <div class="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
          <i :class="getTypeIcon(item.type)"></i>
        </div>
        <div class="flex-1">
          <div class="flex items-start justify-between">
            <h3 class="m-0 text-base font-semibold text-slate-900 dark:text-slate-50">{{ item.name || item.title }}</h3>
            <span class="text-xs text-slate-500 dark:text-slate-400">{{ formatDate(item.updatedAt || item.createdAt) }}</span>
          </div>
          <p class="m-0 mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{{ item.description || item.excerpt || 'Documento de texto' }}</p>
          <div class="mt-2 text-xs text-slate-500 dark:text-slate-400">{{ getDocumentStatus(item) }}</div>
          <button class="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white dark:bg-blue-600" @click="$emit('open', item)">
            <i class="fas fa-eye"></i> Abrir
          </button>
        </div>
      </div>
    </article>
  </div>`,
}

const UrlList = {
  props: [
    'items',
    'getDocumentStatus',
    'getTypeDisplay',
    'getTypeIcon',
    'getTypeColors',
    'formatDate',
  ],
  template: `<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <article v-for="item in items" :key="item.id" class="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm transition hover:-translate-y-1 dark:border-slate-700 dark:from-slate-900 dark:to-slate-800">
      <div class="mb-3 flex items-center gap-3">
        <div class="grid h-10 w-10 place-items-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
          <i :class="getTypeIcon(item.type)"></i>
        </div>
        <div class="flex-1">
          <h3 class="m-0 text-base font-semibold text-slate-900 dark:text-slate-50">{{ item.name || item.title }}</h3>
          <p class="m-0 text-xs text-slate-500 dark:text-slate-400">{{ formatDate(item.updatedAt || item.createdAt) }}</p>
        </div>
      </div>
      <p class="m-0 mb-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{{ item.description || item.url }}</p>
      <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{{ getDocumentStatus(item) }}</span>
        <a :href="item.url || item.content" target="_blank" rel="noopener" class="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-white shadow hover:-translate-y-0.5">
          <i class="fas fa-external-link-alt"></i> Abrir
        </a>
      </div>
    </article>
  </div>`,
}

const componentByType = {
  pdf: PdfList,
  text: TextList,
  url: UrlList,
}

const titleByType = {
  TYPE_PDF: 'Documentos PDF',
  TYPE_TEXT: 'Documentos de Texto',
  TYPE_URL: 'Enlaces Externos',
}
const addDocumentByType = {
  TYPE_PDF: 'Subir PDF',
  TYPE_TEXT: 'Crear Texto',
  TYPE_URL: 'Crear Boton',
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const docStore = documentsStore()

const { search, status, items, loading, error, filteredItems, paginatedItems, loadDocuments, getDocumentStatus, getTypeDisplay, getTypeIcon, getTypeColors, formatDate } =
  useDocumentList()

const type = computed(() => (route.params.type || '').toString())

const canCreate = computed(
  () => authStore.hasRole('ROLE_ADMIN') || authStore.hasRole('ROLE_SUPER_USER'),
)

const breadcrumbs = computed(() => {
  const path = docStore.getPath || ''
  if (!path) return []
  const segments = path.split('/').filter(Boolean)
  const acc = []
  let current = ''
  for (const seg of segments) {
    current += `/${seg}`
    acc.push({ label: seg, path: current })
  }
  return acc
})

const navigateToBreadcrumb = (index) => {
  if (index === 0) {
    docStore.setPathAndType('', '', type.value)
  } else {
    const target = breadcrumbs.value[index - 1]
    docStore.setPathAndType(target.label, target.path, type.value)
  }
}

const handleOpen = (item) => {
  if (!item?.id) return
  router.push({ name: 'ContentView', params: { id: item.id } })
}

watch(
  () => docStore.getPath,
  (newPath) => {
    loadDocuments({ type: type.value, path: newPath })
  },
)
</script>
