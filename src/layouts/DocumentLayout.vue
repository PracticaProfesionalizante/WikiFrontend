<template>
  <div class="min-h-screen bg-white dark:bg-slate-900">
    <DocumentHeader
      :folder-name="docStore.getFolderName"
      :title="titleByType[type] || 'Documentos'"
      :can-create="canCreate"
      :create-label="addDocumentByType[type] || 'Crear Nuevo Documento'"
      @create="openCreateDialog"
    />

    <DocumentFilters
      v-model:search="search"
      v-model:status="status"
      :count="filteredItems.length"
    />

    <DocumentBreadcrumbs :breadcrumbs="breadcrumbs" @navigate="navigateToBreadcrumb" />

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

      <!-- LISTAS POR TIPO -->
      <template v-else>
        <DocumentTypeLists
          :type="type"
          :items="paginatedItems"
          :get-document-status="getDocumentStatus"
          :get-type-display="getTypeDisplay"
          :get-type-icon="getTypeIcon"
          :get-type-colors="getTypeColors"
          :format-date="formatDate"
          @open="handleOpen"
          @edit="openEditDialog"
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

    <!-- FORMULARIOS -->

    <!-- TEXT -->
    <ContentTextForm
      v-if="editDialog && currentFormType === 'TYPE_TEXT'"
      :model-value="editDialog"
      :initial-data="selectedItem"
      :roles="roles"
      @update:modelValue="editDialog = $event"
      @success="handleSaveDocument"
      @close="closeEditDialog"
    />

    <!-- URL -->
    <ContentUrlForm
      v-if="editDialog && currentFormType === 'TYPE_URL'"
      :model-value="editDialog"
      :initial-data="selectedItem"
      :roles="roles"
      @update:modelValue="editDialog = $event"
      @success="handleSaveDocument"
      @close="closeEditDialog"
    />

    <!-- PDF -->
    <ContentPdfForm
      v-if="editDialog && currentFormType === 'TYPE_PDF'"
      :model-value="editDialog"
      :initial-data="selectedItem"
      :roles="roles"
      @update:modelValue="editDialog = $event"
      @success="handleSaveDocumentWithFile"
      @close="closeEditDialog"
    />

    <FeedbackModal
      v-model="feedbackOpen"
      :type="feedbackType"
      :title="feedbackTitle"
      :message="feedbackMessage"
      :details="feedbackDetails"
    />
  </div>
</template>

<script setup>
// import { watchDebounced } from '@vueuse/core'
import { computed, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { documentsStore } from '@/stores/documentsStore'
import { useMenuStore } from '@/stores/menuStore'

import { useDocumentList } from '@/composables/useDocumentList'
import ContentTable from '@/components/content/ContentTable.vue'
import DocumentHeader from '@/components/document/DocumentHeader.vue'
import DocumentFilters from '@/components/document/DocumentFilters.vue'
import DocumentBreadcrumbs from '@/components/document/DocumentBreadcrumbs.vue'
import DocumentTypeLists from '@/components/document/DocumentTypeLists.vue'
import FeedbackModal from '@/components/common/FeedbackModal.vue'
import documentService from '@/services/documentService'
import ContentTextForm from '@/components/content/form/types/ContentTextForm.vue'
import ContentUrlForm from '@/components/content/form/types/ContentUrlForm.vue'
import ContentPdfForm from '@/components/content/form/types/ContentPdfForm.vue'

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
  emits: ['open', 'edit'],
  template: `
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="item in items"
        :key="item.id"
        class="rounded-xl border p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
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

        <div class="mt-3 text-xs text-slate-500 dark:text-slate-400">
          {{ formatDate(item.updatedAt || item.createdAt) }}
        </div>

        <div class="flex gap-2 mt-4">
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
      </article>
    </div>
  `,
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
  emits: ['open', 'edit'],
  template: `
    <div class="space-y-3">
      <article v-for="item in items" :key="item.id" class="rounded-xl border p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
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
  `,
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
  emits: ['open', 'edit'],
  template: `
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
  `,
}

const titleByType = {
  TYPE_PDF: 'Documentos PDF',
  TYPE_TEXT: 'Documentos de Texto',
  TYPE_URL: 'Enlaces Externos',
}

const addDocumentByType = {
  TYPE_PDF: 'Subir PDF',
  TYPE_TEXT: 'Crear Texto',
  TYPE_URL: 'Crear Botón',
}

const route = useRoute()
const router = useRouter()

const authStore = useAuthStore()
const docStore = documentsStore()
const menuStore = useMenuStore()

const {
  search,
  status,
  loading,
  error,
  filteredItems,
  paginatedItems,
  loadDocuments,
  getDocumentStatus,
  getTypeDisplay,
  getTypeIcon,
  getTypeColors,
  formatDate,
  getDocumentAuthor,
  getDocumentEditor,
  previewContent,
  openDeleteDialog,
  toggleDocumentStatus,
} = useDocumentList()

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

const findMenuByPath = (menus, path) => {
  for (const menu of menus) {
    if (menu.path === path) {
      return menu
    }
    if (menu.children && menu.children.length > 0) {
      const found = findMenuByPath(menu.children, path)
      if (found) {
        return found
      }
    }
  }
  return null
}

const navigateToBreadcrumb = (index) => {
  if (index === 0) {
    menuStore.setFolder(null)
    docStore.clearStore()
    router.push('/dashboard')
  } else {
    const target = breadcrumbs.value[index - 1]
    const menuSelected = findMenuByPath(authStore.menus, target.path)
    menuStore.setFolder(menuSelected)
    router.push('/folders')
    docStore.clearStore()
  }
}

const handleOpen = (item) => {
  if (!item?.id) return
  router.push({ name: 'ContentView', params: { id: item.id } })
}

// -------- FORMULARIOS --------
const editDialog = ref(false)
const currentFormType = ref(null)
const selectedItem = ref(null)
const isEditing = ref(false)
const roles = ['ROLE_ADMIN', 'ROLE_SUPER_USER', 'ROLE_COLLABORATOR']

// Feedback modal
const feedbackOpen = ref(false)
const feedbackType = ref('info')
const feedbackTitle = ref('')
const feedbackMessage = ref('')
const feedbackDetails = ref('')

// Crear nuevo documento
const openCreateDialog = () => {
  selectedItem.value = null
  isEditing.value = false
  currentFormType.value = docStore.getType
  editDialog.value = true
}

// Editar documento
const openEditDialog = (item) => {
  selectedItem.value = { ...item }
  isEditing.value = true
  currentFormType.value = item.type
  editDialog.value = true
}

// Guardado
const handleSaveDocument = async (data) => {
  console.log('handleSaveDocument', data)
  if (!data) return
  console.log('handleSaveDocument', data)

  const payload = {
    ...data,
    roles: getRolesSimplificado(data.roles),
    slug: getNewSlug(data.name),
  }

  try {
    if (payload.id) {
      await documentService.updateDocument(payload.id, payload)
    } else {
      await documentService.createDocument(payload)
    }

    await loadDocuments({ type: docStore.getType, slug: docStore.getPath })
    feedbackType.value = 'success'
    feedbackTitle.value = 'Documento guardado'
    feedbackMessage.value = 'El documento se guardó correctamente.'
    feedbackDetails.value = ''
    feedbackOpen.value = true
    closeEditDialog()
  } catch (err) {
    console.error('Error guardando documento', err)
    feedbackType.value = 'error'
    feedbackTitle.value = 'No se pudo guardar el documento'
    feedbackMessage.value = 'Ocurrió un error al guardar. Por favor intenta de nuevo.'
    feedbackDetails.value = ''
    feedbackOpen.value = true
  }
}

const handleSaveDocumentWithFile = async (data) => {
  if (!data) return

  console.log('antes de generar el paylod - data:', data)

  const payload = {
    ...data,
    slug: getNewSlug(data.name),
    roles: getRolesSimplificado(data.roles),
  }
  console.log('antes de generar el formData - payload:', payload)

  const formData = new FormData()
  formData.append('name', payload.name)
  formData.append('type', payload.type)
  formData.append('slug', payload.slug)
  formData.append('file', payload.file)
  formData.append('icon', payload.icon)
  formData.append('status', payload.status)
  formData.append('roles', payload.roles)

  console.log('despues de generar el formData', formData)

  try {
    if (data.id) {
      await documentService.uploadDocumentFile(data.id, formData)
    } else {
      await documentService.createDocumentWithFile(formData)
    }


    await loadDocuments({ type: docStore.getType, slug: docStore.getPath })
    feedbackType.value = 'success'
    feedbackTitle.value = 'Documento guardado'
    feedbackMessage.value = 'El documento se guardó correctamente.'
    feedbackDetails.value = ''
    feedbackOpen.value = true
    closeEditDialog()
  } catch (err) {
    console.error('Error guardando documento', err)
    feedbackType.value = 'error'
    feedbackTitle.value = 'No se pudo guardar el documento'
    feedbackMessage.value = 'Ocurrió un error al guardar. Por favor intenta de nuevo.'
    feedbackDetails.value = ''
    feedbackOpen.value = true
  }
}

const getNewSlug = (docName) => {
  if (!docName) return ''
  const name = docName
    .toLowerCase() // Pasar a minúscula
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/[^\w-]+/g, '') // Eliminar caracteres especiales
    .replace(/--+/g, '-') // Reemplazar múltiples guiones con uno solo
    .replace(/^-+|-+$/g, '') // Eliminar guiones al inicio y al final
  const slugContent = `${docStore.getPath}/${name}`
  return slugContent
}

const getRolesSimplificado = (roles) => {
  return (roles || []).map((role) => {
    if (role.startsWith('ROLE_ROLE_')) return role.replace(/^ROLE_ROLE_/, 'ROLE_')
    if (role.startsWith('ROLE_')) return role.replace(/^ROLE_/, '')
    return role
  })
}

// Cerrar modal
const closeEditDialog = () => {
  editDialog.value = false
  selectedItem.value = null
  currentFormType.value = null
  isEditing.value = false
}

watch(
  () => [docStore.getPath, docStore.getType],
  () => {
    loadDocuments({ slug: docStore.getPath, type: docStore.getType })
  },
  { immediate: true },
)
</script>

<FeedbackModal
  v-model="feedbackOpen"
  :type="feedbackType"
  :title="feedbackTitle"
  :message="feedbackMessage"
  :details="feedbackDetails"
/>
