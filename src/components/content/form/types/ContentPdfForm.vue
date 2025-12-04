<template>
  <ContentFormWrapper
    :model-value="modelValue"
    :title="isEditing ? 'Editar documento PDF' : 'Crear Nuevo Documento'"
    :loading="loading"
    :submit-label="submitLabel"
    @update:modelValue="emit('update:modelValue', $event)"
    @submit="handleSubmit"
    @close="close"
  >
    <div class="space-y-6">
      <!-- Paso a paso -->
      <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
        <div class="flex flex-wrap items-center gap-2">
          <template v-for="step in steps" :key="step.id">
            <div class="flex items-center gap-2" :class="stepClass(step.id)">
              <div class="grid h-8 w-8 place-items-center rounded-full text-xs font-bold" :class="stepCircleClass(step.id)">
                <i v-if="currentStep > step.id" class="fas fa-check"></i>
                <span v-else>{{ step.id }}</span>
              </div>
              <div class="leading-tight hidden sm:block">
                <div class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ step.title }}</div>
                <div class="text-xs text-slate-500 dark:text-slate-400">{{ step.desc }}</div>
              </div>
            </div>
            <div v-if="step.id < steps.length" class="h-px w-6 flex-shrink-0 bg-slate-300 dark:bg-slate-600"></div>
          </template>
        </div>
      </div>

      <!-- Paso 1 -->
      <section v-if="currentStep === 1" class="space-y-4">
        <div>
          <h3 class="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
            <i class="fas fa-info-circle text-blue-500"></i>
            Información Básica
          </h3>
          <p class="m-0 text-sm text-slate-600 dark:text-slate-400">Datos principales del documento</p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="form-label">Nombre del Documento <span class="text-red-500">*</span></label>
            <input v-model="localForm.name" class="form-input" placeholder="Manual de Usuario" />
            <p v-if="errors.name" class="mt-1 flex items-center gap-1 text-xs text-red-500">
              <i class="fas fa-exclamation-circle"></i> {{ errors.name }}
            </p>
          </div>

          <div>
            <label class="form-label">Tipo</label>
            <div class="form-input flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <i class="fas fa-file-pdf text-red-400"></i>
              Documento PDF
            </div>
          </div>
        </div>
      </section>

      <!-- Paso 2 -->
      <section v-else-if="currentStep === 2" class="space-y-4">
        <div>
          <h3 class="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
            <i class="fas fa-file-alt text-blue-500"></i>
            Contenido del Documento
          </h3>
          <p class="m-0 text-sm text-slate-600 dark:text-slate-400">Sube el archivo PDF</p>
        </div>

        <div>
          <label class="form-label">Archivo PDF <span class="text-red-500">*</span></label>

          <div
            v-if="!file"
            class="dropzone"
            :class="{ 'dropzone--active': isDragOver }"
            @click="selectFile"
            @dragover.prevent="dragOver"
            @dragleave="dragLeave"
            @drop.prevent="onDrop"
          >
            <i class="fas fa-cloud-upload-alt text-4xl text-slate-500"></i>
            <p class="mt-2 text-slate-600 dark:text-slate-300">Arrastra tu archivo PDF aquí o haz clic para seleccionar</p>
            <p class="text-xs text-slate-500 dark:text-slate-500">Solo archivos PDF (máx 10MB)</p>
          </div>

          <div
            v-else
            class="mt-4 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-500/40 dark:bg-green-900/30"
          >
            <div class="flex items-center gap-3">
              <div class="grid h-12 w-12 place-items-center rounded-lg bg-green-100 text-green-600 dark:bg-green-700/40 dark:text-green-300">
                <i class="fas fa-file-pdf text-2xl"></i>
              </div>

              <div>
                <p class="font-semibold text-slate-800 dark:text-slate-100">{{ fileName }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">{{ fileSizeFormatted }}</p>
              </div>
            </div>

            <button
              @click="removeFile" class="grid h-10 w-10 place-items-center rounded-full bg-red-100 text-red-600 transition hover:bg-red-200 dark:bg-red-600 dark:text-white dark:hover:bg-red-700">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <input
            ref="fileInput"
            type="file"
            class="hidden"
            accept="application/pdf"
            @change="onFileChange"
          />
          <p v-if="errors.file" class="mt-1 flex items-center gap-1 text-xs text-red-500">
            <i class="fas fa-exclamation-circle"></i> {{ errors.file }}
          </p>
        </div>
      </section>

      <!-- Paso 3 -->
      <section v-else-if="currentStep === 3" class="space-y-4">
        <div>
          <h3 class="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
            <i class="fas fa-users-cog text-blue-500"></i>
            Configuración y Permisos
          </h3>
          <p class="m-0 text-sm text-slate-600 dark:text-slate-400">Define quién puede acceder a este documento</p>
        </div>

        <div class="space-y-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Roles con acceso <span class="text-red-500">*</span>
          </p>
          <p class="m-0 text-sm text-slate-600 dark:text-slate-400">
            Selecciona los roles que pueden acceder a este documento
          </p>

          <div class="space-y-2">
            <label
              v-for="role in roles"
              :key="role"
              class="flex items-start gap-3 rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm shadow-sm transition dark:border-slate-700 dark:bg-slate-800"
            >
              <input type="checkbox" :value="role" v-model="localForm.roles" class="mt-1 h-4 w-4" />
              <div>
                <div class="font-semibold text-slate-900 dark:text-slate-100">{{ role }}</div>
                <div class="text-xs text-slate-500 dark:text-slate-400">
                  {{ roleDescriptions[role] || 'Acceso a funciones básicas' }}
                </div>
              </div>
            </label>
          </div>

          <p v-if="errors.roles" class="mt-1 flex items-center gap-1 text-xs text-red-500">
            <i class="fas fa-exclamation-circle"></i> {{ errors.roles }}
          </p>
        </div>
      </section>

      <!-- Paso 4 -->
      <section v-else-if="currentStep === 4" class="space-y-4">
        <div>
          <h3 class="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
            <i class="fas fa-clipboard-check text-blue-500"></i>
            Resumen
          </h3>
          <p class="m-0 text-sm text-slate-600 dark:text-slate-400">Revisa la información antes de crear</p>
        </div>

        <div class="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <p class="text-sm text-slate-800 dark:text-slate-100"><strong class="font-semibold text-slate-600 dark:text-slate-300">Nombre:</strong> {{ localForm.name || "—" }}</p>
          <p class="text-sm text-slate-800 dark:text-slate-100"><strong class="font-semibold text-slate-600 dark:text-slate-300">Tipo:</strong> Documento PDF</p>
          <p class="text-sm text-slate-800 dark:text-slate-100"><strong class="font-semibold text-slate-600 dark:text-slate-300">Carpeta:</strong> {{ localForm.slug || "Raíz" }}</p>
          <p class="text-sm text-slate-800 dark:text-slate-100"><strong class="font-semibold text-slate-600 dark:text-slate-300">Icono:</strong> {{ localForm.icon || "Sin icono" }}</p>

          <div v-if="file" class="mt-3 space-y-1">
            <p class="text-sm text-slate-800 dark:text-slate-100"><strong class="font-semibold text-slate-600 dark:text-slate-300">Archivo PDF:</strong></p>
            <p class="text-sm text-slate-800 dark:text-slate-100">{{ fileName }} ({{ fileSizeFormatted }})</p>
          </div>

          <div>
            <p class="text-sm text-slate-800 dark:text-slate-100"><strong class="font-semibold text-slate-600 dark:text-slate-300">Roles:</strong></p>
            <p class="text-sm text-slate-800 dark:text-slate-100">{{ localForm.roles.join(", ") || "Sin restricciones" }}</p>
          </div>
        </div>
      </section>
    </div>
  </ContentFormWrapper>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue"
import ContentFormWrapper from "../../../forms/ContentFormWrapper.vue"

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  initialData: { type: Object, default: () => ({}) },
  roles: { type: Array, default: () => [] },
})

const emit = defineEmits(["update:modelValue", "close", "success"])

const loading = ref(false)
const currentStep = ref(1)
const steps = [
  { id: 1, title: "Información Básica", desc: "Datos principales" },
  { id: 2, title: "Contenido", desc: "Sube el PDF" },
  { id: 3, title: "Permisos", desc: "Configuración de acceso" },
  { id: 4, title: "Resumen", desc: "Revisar información" },
]

const isEditing = computed(() => !!(props.initialData && Object.keys(props.initialData).length))

const localForm = reactive({
  id: null,
  name: "",
  type: "TYPE_PDF",
  description: "",
  slug: "",
  icon: null,
  status: true,
  roles: [],
})

const file = ref(null)
const fileName = ref("")
const fileSize = ref(0)
const isDragOver = ref(false)
const fileInput = ref(null)

const availableIcons = [
  "file-pdf",
  "book",
  "folder",
  "file-alt",
  "save",
  "archive",
  "download",
  "cloud-download-alt",
  "file-download",
  "paperclip",
  "clipboard-list",
  "file-contract",
]

const errors = ref({ name: "", roles: "", file: "" })
const roleDescriptions = {
  "ROLE_SUPER_USER": "Acceso completo al sistema",
  "ROLE_ADMIN": "Gestión de usuarios y configuración",
  "ROLE_USER": "Acceso a funciones básicas",
}

const fileSizeFormatted = computed(() => {
  if (!fileSize.value) return ""
  const mb = fileSize.value / (1024 * 1024)
  return mb > 1 ? `${mb.toFixed(2)} MB` : `${(fileSize.value / 1024).toFixed(1)} KB`
})

const resetForm = () => {
  localForm.id = null
  localForm.name = ""
  localForm.type = "TYPE_PDF"
  localForm.description = ""
  localForm.slug = ""
  localForm.icon = null
  localForm.status = true
  localForm.roles = []
  file.value = null
  fileName.value = ""
  fileSize.value = 0
  currentStep.value = 1
  errors.value = { name: "", roles: "", file: "" }
}

const filteredIcons = computed(() => availableIcons)

watch(
  () => props.initialData,
  (data) => {
    if (data && Object.keys(data).length) {
      localForm.id = data.id || null
      localForm.name = data.name || ""
      localForm.description = data.description || ""
      localForm.slug = data.slug || ""
      localForm.icon = data.icon || null
      localForm.status = data.status || true
      localForm.roles = data.roles ? [...data.roles] : []
      localForm.type = "TYPE_PDF"
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

// file handling
const selectFile = () => fileInput.value?.click()
const onFileChange = (e) => {
  const f = e.target.files[0]
  processSelectedFile(f)
}

const onDrop = (event) => {
  isDragOver.value = false
  const droppedFile = event.dataTransfer.files[0]
  if (droppedFile) processSelectedFile(droppedFile)
}

const dragOver = () => {
  isDragOver.value = true
}
const dragLeave = () => {
  isDragOver.value = false
}

const processSelectedFile = (f) => {
  if (!f) return
  if (f.type !== "application/pdf") {
    errors.value.file = "Solo se admiten archivos PDF"
    return
  }
  file.value = f
  fileName.value = f.name
  fileSize.value = f.size
  errors.value.file = ""
}

const removeFile = () => {
  file.value = null
  fileName.value = ""
  fileSize.value = 0
  if (fileInput.value) fileInput.value.value = ""
}

const validateStep = (step) => {
  errors.value = { name: "", roles: "", file: "" }
  if (step === 1 && !localForm.name.trim()) {
    errors.value.name = "El nombre es obligatorio"
    return false
  }
  if (step === 2 && !file.value) {
    errors.value.file = "Debes adjuntar un PDF"
    return false
  }
  if (step === 3 && !localForm.roles.length) {
    errors.value.roles = "Selecciona al menos un rol"
    return false
  }
  return true
}

const handleSubmit = () => {
  console.log("antes del if", localForm)
  if (!validateStep(currentStep.value)) return
  if (currentStep.value < steps.length) {
    currentStep.value += 1
    return
  }

  console.log("Aca llegue muchachos", localForm)
  const dataResponse = {
    ...localForm,
    file: file.value,
    icon: "fa-file-pdf"
  }

  emit("success", dataResponse)
  close()
}

const goPrev = () => {
  if (currentStep.value > 1) currentStep.value -= 1
}

const submitLabel = computed(() => {
  if (currentStep.value < steps.length) return "Siguiente"
  return isEditing.value ? "Guardar Cambios" : "Crear Documento"
})

const stepClass = (id) => {
  if (currentStep.value === id) return "text-blue-600"
  if (currentStep.value > id) return "text-emerald-600"
  return "text-slate-500 dark:text-slate-400"
}

const stepCircleClass = (id) => {
  if (currentStep.value === id) return "bg-blue-600 text-white"
  if (currentStep.value > id) return "bg-emerald-600 text-white"
  return "bg-slate-300 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
}

const close = () => {
  emit("update:modelValue", false)
  emit("close")
}
</script>

<style scoped>
.form-label {
  @apply mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300;
}
.form-input {
  @apply w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100;
}
.dropzone {
  @apply rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center cursor-pointer transition dark:border-slate-600 dark:bg-slate-800;
}
.dropzone--active {
  @apply border-blue-500 bg-blue-100 dark:bg-blue-900/20;
}
.icon-card {
  @apply flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer bg-slate-800 border border-slate-700 hover:border-blue-500 transition;
}
.icon-card.active {
  @apply border-blue-500 bg-blue-900/40;
}
.icon-label {
  @apply text-xs text-slate-300 mt-1 truncate;
}
</style>
