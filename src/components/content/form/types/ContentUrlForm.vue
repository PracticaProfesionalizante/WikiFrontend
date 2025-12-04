<template>
  <ContentFormWrapper
    :model-value="modelValue"
    :title="isEditing ? 'Editar enlace externo' : 'Crear Nuevo Documento'"
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
            <input
              v-model="localData.name"
              type="text"
              class="form-input"
              placeholder="Ej: Reglamento de Estudiantes"
            />
            <p v-if="errors.name" class="mt-1 flex items-center gap-1 text-xs text-red-500">
              <i class="fas fa-exclamation-circle"></i> {{ errors.name }}
            </p>
          </div>

          <div>
            <label class="form-label">Tipo de Documento</label>
            <div class="form-input flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <i class="fas fa-link text-blue-500"></i>
              Enlace / URL
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
          <p class="m-0 text-sm text-slate-600 dark:text-slate-400">Ingresa la URL del contenido</p>
        </div>

        <div class="space-y-2">
          <label class="form-label">URL del Contenido <span class="text-red-500">*</span></label>
          <div class="relative">
            <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <i class="fas fa-link"></i>
            </span>
            <input
              v-model="localData.content"
              type="url"
              class="form-input pl-9"
              placeholder="https://www.ejemplo.com/recurso"
            />
          </div>
          <p v-if="errors.url" class="mt-1 flex items-center gap-1 text-xs text-red-500">
            <i class="fas fa-exclamation-circle"></i> {{ errors.url }}
          </p>
          <p class="mt-1 flex items-center gap-2 text-xs text-slate-400">
            <i class="fas fa-info-circle text-slate-500"></i>
            Ingresa la URL completa del contenido que quieres enlazar.
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
              <input type="checkbox" :value="role" v-model="localData.roles" class="mt-1 h-4 w-4" />
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

        <div class="space-y-3">
          <div class="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div class="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
              <i class="fas fa-info-circle text-blue-500"></i>
              Información Básica
            </div>
            <ul class="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
              <li><strong>Nombre:</strong> {{ localData.name || '—' }}</li>
              <li><strong>Tipo:</strong> Enlace / URL</li>
              <li><strong>Icono:</strong> {{ localData.icon || 'Sin icono' }}</li>
            </ul>
          </div>

          <div class="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div class="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
              <i class="fas fa-link text-blue-500"></i>
              Contenido
            </div>
            <p class="mt-2 break-all text-sm text-slate-600 dark:text-slate-300">
              {{ localData.content || 'Sin URL' }}
            </p>
          </div>

          <div class="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div class="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
              <i class="fas fa-users-cog text-blue-500"></i>
              Permisos
            </div>
            <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Roles con acceso: {{ localData.roles.length ? localData.roles.join(', ') : 'Ninguno' }}
            </p>
          </div>
        </div>
      </section>

      <!-- Controles inferiores -->
      <!-- <div class="flex items-center justify-between pt-2">
        <div class="text-xs text-slate-500 dark:text-slate-400">Paso {{ currentStep }} de {{ steps.length }}</div>
        <div class="flex gap-2">
          <button
            type="button"
            class="btn-secondary"
            :disabled="currentStep === 1"
            @click="goPrev"
          >
            Anterior
          </button>
          <button
            type="button"
            class="btn-primary"
            @click="handleSubmit"
          >
            {{ submitLabel }}
          </button>
        </div>
      </div> -->
    </div>
  </ContentFormWrapper>
</template>

<script setup>
import { ref, watch, computed } from "vue"
import ContentFormWrapper from "../../../forms/ContentFormWrapper.vue"

const props = defineProps({
  modelValue: Boolean,
  roles: {
    type: Array,
    default: () => [],
  },
  initialData: Object,
})
const emit = defineEmits(["update:modelValue", "success", "close"])

const loading = ref(false)
const currentStep = ref(1)

const steps = [
  { id: 1, title: "Información Básica", desc: "Datos principales" },
  { id: 2, title: "Contenido", desc: "Contenido del documento" },
  { id: 3, title: "Permisos", desc: "Configuración de acceso" },
  { id: 4, title: "Resumen", desc: "Revisar información" },
]

const isEditing = computed(() => !!props.initialData)

const localData = ref({
  id: null,
  name: "",
  content: "",
  description: "",
  roles: [],
  icon: "",
  type: "TYPE_URL",
})

const errors = ref({
  name: "",
  url: "",
  roles: "",
})

const roleDescriptions = {
  "ROLE_SUPER_USER": "Acceso completo al sistema",
  "ROLE_ADMIN": "Gestión de usuarios y configuración",
  "ROLE_USER": "Acceso a funciones básicas",
}

const resetForm = () => {
  localData.value = {
    id: null,
    name: "",
    content: "",
    description: "",
    roles: [],
    icon: "",
    type: "TYPE_URL",
  }
  currentStep.value = 1
  errors.value = { name: "", url: "", roles: "" }
}

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      localData.value = {
        id: data.id ?? null,
        name: data.name || "",
        content: data.content || data.url || "",
        description: data.description || "",
        roles: data.roles || [],
        icon: data.icon || "",
        type: "TYPE_URL",
      }
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

const submitLabel = computed(() => {
  if (currentStep.value < steps.length) return "Siguiente"
  return isEditing.value ? "Guardar Cambios" : "Crear Documento"
})

const validateStep = (step) => {
  errors.value = { name: "", url: "", roles: "" }
  if (step === 1 && !localData.value.name.trim()) {
    errors.value.name = "El nombre es obligatorio"
    return false
  }
  if (step === 2 && !localData.value.content.trim()) {
    errors.value.url = "La URL es obligatoria"
    return false
  }
  if (step === 3 && !localData.value.roles.length) {
    errors.value.roles = "Selecciona al menos un rol"
    return false
  }
  return true
}

const handleSubmit = () => {
  if (!validateStep(currentStep.value)) return
  if (currentStep.value < steps.length) {
    currentStep.value += 1
    return
  }
  loading.value = true
  emit("success", { ...localData.value })
  loading.value = false
  close()
}

const goPrev = () => {
  if (currentStep.value > 1) currentStep.value -= 1
}

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

const close = () => emit("update:modelValue", false)
</script>
