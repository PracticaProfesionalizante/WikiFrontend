<template>
  <div class="modal-overlay" v-if="dialog" @click="handleClose">
    <div class="modal-container" @click.stop>
      <!-- Header del Wizard -->
      <div class="wizard-header">
        <div class="wizard-header-content">
          <div class="wizard-title-section">
            <div class="wizard-icon">
              <i :class="isEditing ? 'fas fas fa-edit' : 'fas fas fa-plus'"></i>
            </div>
            <div class="wizard-text">
              <h2 class="wizard-title">
                {{ isEditing ? 'Editar Documento' : 'Crear Nuevo Documento' }}
              </h2>
              <p class="wizard-subtitle">
                {{
                  isEditing
                    ? 'Modifica la configuración del documento existente'
                    : 'Completa los datos para crear un nuevo documento'
                }}
              </p>
            </div>
          </div>
          <button @click="handleClose" class="wizard-close-btn" :disabled="isSaving">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Indicador de carga -->
      <div v-if="loading" class="form-loading">
        <div class="loading-spinner"></div>
        <p>Cargando datos del documento...</p>
      </div>

      <!-- Wizard Steps Indicator -->
      <div v-else class="wizard-steps">
        <div
          v-for="(step, index) in wizardSteps"
          :key="step.id"
          class="wizard-step"
          :class="{
            active: currentWizardStep === index + 1,
            completed: currentWizardStep > index + 1,
            disabled: currentWizardStep < index + 1,
          }"
        >
          <div class="step-indicator">
            <i v-if="currentWizardStep > index + 1" class="fas fa-check"></i>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <div class="step-content">
            <h4 class="step-title">{{ step.title }}</h4>
            <p class="step-description">{{ step.description }}</p>
          </div>
        </div>
      </div>

      <!-- Wizard Body -->
      <div v-if="!loading" class="wizard-body">
        <form @submit.prevent="handleSubmit" class="wizard-form">
          <!-- Paso 1: Información Básica -->
          <div v-show="currentWizardStep === 1" class="wizard-step-content">
            <div class="step-header">
              <h3 class="step-title">
                <i class="fas fa-info-circle"></i>
                Información Básica
              </h3>
              <p class="step-description">Define el nombre, tipo y contenido del documento</p>
            </div>

            <div class="form-fields">
              <div class="form-field">
                <label for="documentName" class="form-label">
                  <i class="fas fa-tag"></i>
                  Nombre del Documento
                  <span class="required">*</span>
                </label>
                <input
                  id="documentName"
                  v-model="form.name"
                  type="text"
                  class="form-input"
                  :class="{ error: validationErrors.name }"
                  placeholder="Ej: Reglamento de Estudiantes"
                  @input="validateField('name')"
                  required
                  :disabled="isSaving"
                />
                <div v-if="validationErrors.name" class="error-message">
                  <i class="fas fa-exclamation-circle"></i>
                  {{ validationErrors.name }}
                </div>
              </div>

              <div class="form-field">
                <label for="documentType" class="form-label">
                  <i class="fas fa-list"></i>
                  Tipo de Documento
                  <span class="required">*</span>
                </label>
                <select
                  id="documentType"
                  v-model="form.type"
                  class="form-select"
                  :class="{ error: validationErrors.type }"
                  @change="handleTypeChange"
                  required
                  :disabled="isSaving"
                >
                  <option value="">Selecciona un tipo</option>
                  <option value="TYPE_URL">🔗 Enlace/URL</option>
                  <option value="TYPE_TEXT">📄 Documento de Texto</option>
                  <option value="TYPE_PDF">📋 Documento PDF</option>
                </select>
                <div v-if="validationErrors.type" class="error-message">
                  <i class="fas fa-exclamation-circle"></i>
                  {{ validationErrors.type }}
                </div>
              </div>

              <div class="form-field">
                <label for="documentIcon" class="form-label">
                  <i class="fas fa-palette"></i>
                  Icono
                </label>
                <IconSelector
                  id="documentIcon"
                  v-model="form.icon"
                  placeholder="Selecciona un icono para el documento"
                />
                <div class="form-help">
                  Elige un icono que represente el contenido del documento
                </div>
              </div>
            </div>
          </div>

          <!-- Paso 2: Contenido del Documento -->
          <div v-show="currentWizardStep === 2" class="wizard-step-content">
            <div class="step-header">
              <h3 class="step-title">
                <i class="fas fa-file-text"></i>
                Contenido del Documento
              </h3>
              <p class="step-description">
                {{
                  form.type === 'TYPE_TEXT'
                    ? 'Escribe el contenido en formato Markdown'
                    : form.type === 'TYPE_URL'
                      ? 'Ingresa la URL del contenido'
                      : form.type === 'TYPE_PDF'
                        ? 'Sube el archivo PDF del documento'
                        : 'Selecciona el tipo de documento primero'
                }}
              </p>
            </div>

            <div class="form-fields">
              <!-- Mensaje cuando no hay tipo seleccionado -->
              <div v-if="!form.type" class="no-type-selected">
                <div class="no-type-icon">
                  <i class="fas fa-question-circle"></i>
                </div>
                <div class="no-type-text">
                  <h4>Selecciona un tipo de documento</h4>
                  <p>
                    Primero debes seleccionar el tipo de documento en el paso anterior para
                    continuar.
                  </p>
                </div>
              </div>

              <!-- Contenido TYPE_TEXT/Markdown -->
              <div v-else-if="form.type === 'TYPE_TEXT'" class="content-editor">
                <div class="editor-header">
                  <div class="editor-tabs">
                    <button
                      type="button"
                      class="tab-btn"
                      :class="{ active: activeTab === 'edit' }"
                      @click="activeTab = 'edit'"
                    >
                      <i class="fas fa-pencil"></i>
                      Editar
                    </button>
                    <button
                      type="button"
                      class="tab-btn"
                      :class="{ active: activeTab === 'preview' }"
                      @click="activeTab = 'preview'"
                    >
                      <i class="fas fa-eye"></i>
                      Vista Previa
                    </button>
                  </div>
                  <button
                    type="button"
                    class="fullscreen-btn"
                    @click="toggleFullscreen"
                    :title="isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'"
                  >
                    <i :class="isFullscreen ? 'fas fas fa-compress' : 'fas fas fa-expand'"></i>
                  </button>
                </div>

                <!-- Toolbar de Markdown -->
                <div v-if="activeTab === 'edit'" class="markdown-toolbar">
                  <div class="toolbar-group">
                    <button
                      type="button"
                      @click="insertMarkdown('bold')"
                      class="toolbar-btn"
                      title="Negrita"
                    >
                      <i class="fas fa-bold"></i>
                    </button>
                    <button
                      type="button"
                      @click="insertMarkdown('italic')"
                      class="toolbar-btn"
                      title="Cursiva"
                    >
                      <i class="fas fa-italic"></i>
                    </button>
                    <button
                      type="button"
                      @click="insertMarkdown('strikethrough')"
                      class="toolbar-btn"
                      title="Tachado"
                    >
                      <i class="fas fa-strikethrough"></i>
                    </button>
                  </div>

                  <div class="toolbar-separator"></div>

                  <div class="toolbar-group">
                    <button
                      type="button"
                      @click="insertMarkdown('h1')"
                      class="toolbar-btn"
                      title="Título 1"
                    >
                      <i class="fas fa-heading"></i>
                    </button>
                    <button
                      type="button"
                      @click="insertMarkdown('h2')"
                      class="toolbar-btn"
                      title="Título 2"
                    >
                      <i class="fas fa-heading"></i>
                    </button>
                    <button
                      type="button"
                      @click="insertMarkdown('h3')"
                      class="toolbar-btn"
                      title="Título 3"
                    >
                      <i class="fas fa-heading"></i>
                    </button>
                  </div>

                  <div class="toolbar-separator"></div>

                  <div class="toolbar-group">
                    <button
                      type="button"
                      @click="insertMarkdown('link')"
                      class="toolbar-btn"
                      title="Enlace"
                    >
                      <i class="fas fa-link"></i>
                    </button>
                    <button
                      type="button"
                      @click="insertMarkdown('image')"
                      class="toolbar-btn"
                      title="Imagen"
                    >
                      <i class="fas fa-image"></i>
                    </button>
                    <button
                      type="button"
                      @click="insertMarkdown('code')"
                      class="toolbar-btn"
                      title="Código"
                    >
                      <i class="fas fa-code"></i>
                    </button>
                  </div>

                  <div class="toolbar-separator"></div>

                  <div class="toolbar-group">
                    <button
                      type="button"
                      @click="insertMarkdown('list')"
                      class="toolbar-btn"
                      title="Lista"
                    >
                      <i class="fas fa-list-ul"></i>
                    </button>
                    <button
                      type="button"
                      @click="insertMarkdown('orderedList')"
                      class="toolbar-btn"
                      title="Lista numerada"
                    >
                      <i class="fas fa-list-ol"></i>
                    </button>
                    <button
                      type="button"
                      @click="insertMarkdown('quote')"
                      class="toolbar-btn"
                      title="Cita"
                    >
                      <i class="fas fa-quote-right"></i>
                    </button>
                  </div>

                  <div class="toolbar-separator"></div>

                  <div class="toolbar-group">
                    <button
                      type="button"
                      @click="insertMarkdown('table')"
                      class="toolbar-btn"
                      title="Tabla"
                    >
                      <i class="fas fa-table"></i>
                    </button>
                    <button
                      type="button"
                      @click="insertMarkdown('horizontalRule')"
                      class="toolbar-btn"
                      title="Línea horizontal"
                    >
                      <i class="fas fa-minus"></i>
                    </button>
                  </div>
                </div>

                <div class="editor-content" :class="{ fullscreen: isFullscreen }">
                  <textarea
                    v-if="activeTab === 'edit'"
                    id="documentContent"
                    v-model="form.content"
                    class="markdown-textarea"
                    :class="{ error: validationErrors.content }"
                    placeholder="Escribe tu contenido en formato Markdown..."
                    @input="validateField('content')"
                    :disabled="isSaving"
                    required
                  ></textarea>
                  <div v-else class="markdown-preview" v-html="renderedMarkdown"></div>
                </div>

                <div v-if="validationErrors.content" class="error-message">
                  <i class="fas fa-exclamation-circle"></i>
                  {{ validationErrors.content }}
                </div>
              </div>

              <!-- Contenido TYPE_URL -->
              <div v-else-if="form.type === 'TYPE_URL'" class="content-url">
                <div class="form-field">
                  <label for="documentUrl" class="form-label">
                    <i class="fas fa-link"></i>
                    URL del Contenido
                    <span class="required">*</span>
                  </label>
                  <input
                    id="documentUrl"
                    v-model="form.content"
                    type="url"
                    class="form-input"
                    :class="{ error: validationErrors.content }"
                    placeholder="https://ejemplo.com/documento"
                    @input="validateField('content')"
                    :disabled="isSaving"
                    required
                  />
                  <div class="form-help">
                    <i class="fas fa-info-circle"></i>
                    Ingresa la URL completa del contenido que quieres enlazar
                  </div>
                  <div v-if="validationErrors.content" class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    {{ validationErrors.content }}
                  </div>
                </div>
              </div>

              <!-- Contenido TYPE_PDF -->
              <div v-else-if="form.type === 'TYPE_PDF'" class="content-pdf">
                <div class="form-field">
                  <label for="pdfFile" class="form-label">
                    <i class="fas fa-file-pdf"></i>
                    Archivo PDF
                    <span class="required">*</span>
                  </label>
                  <div class="file-upload-area" :class="{ 'has-file': pdfFile }">
                    <input
                      id="pdfFile"
                      ref="pdfFileInput"
                      type="file"
                      accept=".pdf"
                      @change="handlePdfFileChange"
                      :disabled="isSaving"
                      class="file-input"
                    />
                    <div class="upload-content">
                      <div v-if="!pdfFile" class="upload-placeholder">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Arrastra tu archivo PDF aquí o haz clic para seleccionar</p>
                        <span class="upload-hint">Solo archivos PDF (máximo 10MB)</span>
                      </div>
                      <div v-else class="upload-success">
                        <i class="fas fa-file-pdf"></i>
                        <div class="file-info">
                          <p class="file-name">{{ pdfFile.name }}</p>
                          <p class="file-size">{{ formatFileSize(pdfFile.size) }}</p>
                        </div>
                        <button
                          type="button"
                          class="remove-file-btn"
                          @click="removePdfFile"
                          :disabled="isSaving"
                        >
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div v-if="validationErrors.pdfFile" class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    {{ validationErrors.pdfFile }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Paso 3: Configuración y Permisos -->
          <div v-show="currentWizardStep === 3" class="wizard-step-content">
            <div class="step-header">
              <h3 class="step-title">
                <i class="fas fa-cog"></i>
                Configuración y Permisos
              </h3>
              <p class="step-description">Define quién puede acceder a este documento</p>
            </div>

            <div class="form-fields">
              <div class="form-field">
                <label class="form-label">
                  <i class="fas fa-users"></i>
                  Roles con Acceso
                  <span class="required">*</span>
                </label>
                <fieldset class="roles-fieldset">
                  <legend class="roles-legend">
                    Selecciona los roles que pueden acceder a este documento
                  </legend>

                  <!-- Rol Super Usuario siempre presente -->
                  <div class="super-user-always-present">
                    <div class="role-option super-user-option">
                      <label class="checkbox-label disabled">
                        <input
                          type="checkbox"
                          class="role-checkbox"
                          checked
                          disabled
                        />
                        <span class="role-label">
                          <i class="fas fa-user-crown"></i>
                          <span class="role-name">
                            <strong>Super Usuario</strong>
                            <small>Acceso completo al sistema (siempre incluido)</small>
                          </span>
                        </span>
                      </label>
                    </div>
                  </div>

                  <div class="roles-grid">
                    <div v-for="role in availableRolesList" :key="role.value" class="role-option">
                      <input
                        :id="`role-${role.value}`"
                        v-model="form.roles"
                        :value="role.value"
                        type="checkbox"
                        class="role-checkbox"
                        :disabled="isSaving"
                      />
                      <label :for="`role-${role.value}`" class="role-label">
                        <i :class="['fas fas', role.icon]"></i>
                        <span class="role-name">{{ role.label }}</span>
                        <span class="role-description">{{ role.description }}</span>
                      </label>
                    </div>
                  </div>
                </fieldset>
                <div class="form-help">
                  Selecciona los roles que pueden acceder a este documento
                </div>
                <div v-if="validationErrors.roles" class="error-message">
                  <i class="fas fa-exclamation-circle"></i>
                  {{ validationErrors.roles }}
                </div>
              </div>
            </div>
          </div>

          <!-- Paso 4: Resumen -->
          <div v-show="currentWizardStep === 4" class="wizard-step-content">
            <div class="step-header">
              <h3 class="step-title">
                <i class="fas fa-eye"></i>
                Resumen del Documento
              </h3>
              <p class="step-description">Revisa la información antes de crear el documento</p>
            </div>

            <div class="summary-content">
              <div class="summary-section">
                <h4 class="summary-title">
                  <i class="fas fa-info-circle-outline"></i>
                  Información Básica
                </h4>
                <div class="summary-item">
                  <span class="summary-label">Nombre:</span>
                  <span class="summary-value">{{ form.name || 'No especificado' }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Tipo:</span>
                  <span class="summary-value">{{ getTypeLabel(form.type) }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Slug:</span>
                  <span class="summary-value">{{
                    generateSlug(form.name) || 'Se generará automáticamente'
                  }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Icono:</span>
                  <span class="summary-value">
                    <i v-if="form.icon" :class="['fas fas', form.icon]"></i>
                    <span v-else>No especificado</span>
                  </span>
                </div>
              </div>

              <div class="summary-section">
                <h4 class="summary-title">
                  <i class="fas fa-save"></i>
                  Contenido
                </h4>
                <div class="summary-item">
                  <span class="summary-label">Tipo de contenido:</span>
                  <span class="summary-value">{{ getTypeLabel(form.type) }}</span>
                </div>
                <div v-if="form.type === 'TYPE_TEXT'" class="summary-item">
                  <span class="summary-label">Contenido:</span>
                  <span class="summary-value">{{
                    form.content ? 'Contenido en Markdown' : 'No especificado'
                  }}</span>
                </div>
                <div v-else-if="form.type === 'TYPE_URL'" class="summary-item">
                  <span class="summary-label">URL:</span>
                  <span class="summary-value">{{ form.content || 'No especificado' }}</span>
                </div>
                <div v-else-if="form.type === 'TYPE_PDF'" class="summary-item">
                  <span class="summary-label">Archivo PDF:</span>
                  <span class="summary-value">{{
                    pdfFile ? pdfFile.name : 'No especificado'
                  }}</span>
                </div>
              </div>

              <div class="summary-section">
                <h4 class="summary-title">
                  <i class="fas fa-users"></i>
                  Permisos
                </h4>
                <div class="summary-item">
                  <span class="summary-label">Roles con acceso:</span>
                  <span class="summary-value">
                    <span v-if="form.roles && form.roles.length > 0">
                      {{ getRolesText() }}
                    </span>
                    <span v-else>No especificado</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Wizard Footer -->
      <div v-if="!loading" class="wizard-footer">
        <div class="wizard-progress">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: `${(currentWizardStep / wizardSteps.length) * 100}%` }"
            ></div>
          </div>
          <span class="progress-text">
            Paso {{ currentWizardStep }} de {{ wizardSteps.length }}
          </span>
        </div>

        <div class="wizard-actions">
          <!-- Indicador de roles activos al editar -->
          <div
            v-if="isEditing && form.roles && form.roles.length > 0"
            class="active-roles-indicator"
          >
            <span class="indicator-label">Roles activos:</span>
            <div class="active-roles-list">
              <div
                v-for="role in getSelectedRolesInfo()"
                :key="role.value"
                class="active-role-item"
                :class="role.value"
              >
                <i :class="['fas fas', role.icon]"></i>
                <span>{{ role.label }}</span>
                <span v-if="role.value === 'ROLE_SUPER_USER'" class="role-badge">
                  <i class="fas fa-crown"></i>
                  Máximo
                </span>
              </div>
            </div>
          </div>

          <button
            v-if="currentWizardStep > 1"
            type="button"
            @click="previousStep"
            class="wizard-btn wizard-btn-secondary"
          >
            <i class="fas fa-chevron-left"></i>
            Anterior
          </button>

          <button
            v-if="currentWizardStep < wizardSteps.length"
            type="button"
            @click="nextStep"
            class="wizard-btn wizard-btn-primary"
            :disabled="!canProceedToNextStep"
          >
            Siguiente
            <i class="fas fa-chevron-right"></i>
          </button>

          <button
            v-if="currentWizardStep === wizardSteps.length"
            type="button"
            class="wizard-btn wizard-btn-success"
            :disabled="!isFormValid || isSaving"
            @click="handleButtonClick"
          >
            <i v-if="isSaving" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-check"></i>
            {{ isSaving ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear' }} Documento
          </button>

          <button type="button" @click="handleClose" class="wizard-btn wizard-btn-cancel">
            <i class="fas fa-times"></i>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { marked } from 'marked'
import documentService from '@/services/documentService'
import IconSelector from '@/components/IconSelector.vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  document: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

// Emits
const emit = defineEmits(['update:modelValue', 'saved', 'close'])

// Reactive data
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const form = ref({
  name: '',
  type: '',
  slug: '',
  content: '',
  icon: '',
  roles: [],
})

const validationErrors = ref({})
const isSaving = ref(false)
const slugAlternatives = ref([])

// Editor de Markdown
const activeTab = ref('edit')
const isFullscreen = ref(false)

// Wizard variables
const currentWizardStep = ref(1)
const wizardSteps = ref([
  {
    id: 'basic',
    title: 'Información Básica',
    description: 'Datos principales del documento',
  },
  {
    id: 'content',
    title: 'Contenido',
    description: 'Contenido del documento',
  },
  {
    id: 'permissions',
    title: 'Permisos',
    description: 'Configuración de acceso',
  },
  {
    id: 'summary',
    title: 'Resumen',
    description: 'Revisar información',
  },
])

// PDF File Upload
const pdfFile = ref(null)
const fileInput = ref(null)
const pdfFileInput = ref(null)
const pdfPreviewUrl = ref(null)

// Computed
const isEditing = computed(() => !!props.document)

// Renderizar Markdown
const renderedMarkdown = computed(() => {
  console.log('📝 [MARKDOWN] Computed ejecutado, contenido:', form.value.content ? 'Sí' : 'No')

  if (!form.value.content || form.value.content.trim() === '') {
    console.log('📝 [MARKDOWN] No hay contenido para renderizar')
    return '<div class="markdown-empty"><p>No hay contenido para mostrar</p></div>'
  }

  try {
    console.log(
      '📝 [MARKDOWN] Renderizando contenido:',
      form.value.content.substring(0, 100) + '...',
    )

    // Configurar marked para renderizado seguro
    const options = {
      breaks: true,
      gfm: true,
      smartLists: true,
      smartypants: true,
      sanitize: false,
      silent: false,
    }

    // Usar la API correcta de marked v16
    const result = marked(form.value.content, options)
    console.log('📝 [MARKDOWN] Resultado renderizado:', result.substring(0, 100) + '...')
    console.log('📝 [MARKDOWN] Longitud del resultado:', result.length)

    return result
  } catch (error) {
    console.error('❌ [MARKDOWN] Error renderizando Markdown:', error)
    console.error('❌ [MARKDOWN] Contenido que causó el error:', form.value.content)
    return (
      '<div class="markdown-error"><p>❌ Error al renderizar el Markdown</p><pre>' +
      error.message +
      '</pre></div>'
    )
  }
})

const isFormValid = computed(() => {
  const isValid = (
    form.value.name &&
    form.value.type &&
    form.value.content &&
    form.value.roles &&
    form.value.roles.length > 0 &&
    Object.keys(validationErrors.value).length === 0
  )

  console.log('📄 [CONTENT FORM] isFormValid:', {
    name: !!form.value.name,
    type: !!form.value.type,
    content: !!form.value.content,
    roles: form.value.roles?.length > 0,
    validationErrors: Object.keys(validationErrors.value).length === 0,
    isValid
  })

  return isValid
})

// Wizard Computed Properties
const canProceedToNextStep = computed(() => {
  switch (currentWizardStep.value) {
    case 1:
      // Paso 1: Información Básica (sin slug, se genera automáticamente)
      return (
        form.value.name &&
        form.value.type &&
        !validationErrors.value.name &&
        !validationErrors.value.type
      )
    case 2:
      // Paso 2: Contenido del Documento
      if (!form.value.type) return false
      if (form.value.type === 'TYPE_PDF') {
        return !!pdfFile.value && !validationErrors.value.pdfFile
      }
      return form.value.content && !validationErrors.value.content
    case 3:
      // Paso 3: Permisos
      return form.value.roles && form.value.roles.length > 0 && !validationErrors.value.roles
    case 4:
      // Paso 4: Resumen (siempre puede proceder)
      return true
    default:
      return false
  }
})

// Wizard Methods
const nextStep = () => {
  if (currentWizardStep.value < wizardSteps.value.length && canProceedToNextStep.value) {
    currentWizardStep.value++
  }
}

const previousStep = () => {
  if (currentWizardStep.value > 1) {
    currentWizardStep.value--
  }
}

const getTypeLabel = (type) => {
  const types = {
    TYPE_TEXT: '📄 Documento de Texto',
    TYPE_URL: '🔗 Enlace/URL',
    TYPE_PDF: '📋 Documento PDF',
  }
  return types[type] || 'No especificado'
}

const getRolesText = () => {
  if (!form.value.roles || form.value.roles.length === 0) {
    return 'Ninguno'
  }

  const roleLabels = form.value.roles.map((roleValue) => {
    const role = availableRolesList.find((r) => r.value === roleValue)
    return role ? role.label : roleValue
  })

  return roleLabels.join(', ')
}

const getSelectedRolesInfo = () => {
  const rolesInfo = []

  // Agregar SUPER_USER siempre si está presente
  if (form.value.roles.includes('SUPER_USER')) {
    rolesInfo.push({
      value: 'SUPER_USER',
      label: 'Super Usuario',
      icon: 'fas fa-user-crown',
      description: 'Acceso completo al sistema',
    })
  }

  // Agregar otros roles de la lista disponible
  const otherRoles = form.value.roles
    .filter(role => role !== 'SUPER_USER')
    .map((roleValue) => {
      return availableRolesList.find((role) => role.value === roleValue)
    })
    .filter(Boolean)

  return [...rolesInfo, ...otherRoles]
}

// Methods
const validateField = (field) => {
  const value = form.value[field]

  switch (field) {
    case 'name':
      if (!value || value.trim().length < 3) {
        validationErrors.value.name = 'El nombre debe tener al menos 3 caracteres'
      } else if (value.length > 100) {
        validationErrors.value.name = 'El nombre no puede exceder 100 caracteres'
      } else {
        delete validationErrors.value.name
      }
      break

    case 'type':
      if (!value) {
        validationErrors.value.type = 'Debes seleccionar un tipo de documento'
      } else {
        delete validationErrors.value.type
      }
      break

    case 'slug':
      if (!value || value.trim() === '') {
        validationErrors.value.slug = 'El slug es obligatorio'
      } else if (value.length > 100) {
        validationErrors.value.slug = 'El slug no puede exceder 100 caracteres'
      } else if (!/^[a-z0-9-]+$/.test(value)) {
        validationErrors.value.slug =
          'El slug solo puede contener letras minúsculas, números y guiones'
      } else if (value.startsWith('-') || value.endsWith('-')) {
        validationErrors.value.slug = 'El slug no puede empezar o terminar con guión'
      } else {
        delete validationErrors.value.slug
      }
      break

    case 'content':
      if (!value || value.trim().length === 0) {
        validationErrors.value.content = 'El contenido es obligatorio'
      } else if (form.value.type === 'TYPE_URL' && !isValidUrl(value)) {
        validationErrors.value.content = 'Debe ser una URL válida'
      } else if (form.value.type === 'TYPE_PDF' && !pdfFile.value) {
        validationErrors.value.content = 'Debe seleccionar un archivo PDF'
      } else if (value.length > 10000) {
        validationErrors.value.content = 'El contenido no puede exceder 10,000 caracteres'
      } else {
        delete validationErrors.value.content
      }
      break

    case 'roles':
      if (!value || value.length === 0) {
        validationErrors.value.roles = 'Debe seleccionar al menos un rol'
      } else if (value.length > 3) {
        validationErrors.value.roles = 'No puede seleccionar más de 3 roles'
      } else {
        delete validationErrors.value.roles
      }
      break

    default:
      break
  }
}

const validateForm = () => {
  validateField('name')
  validateField('type')
  // No validar slug en modo edición ya que se genera automáticamente
  if (!isEditing.value) {
    validateField('slug')
  }
  validateField('content')
  validateField('roles')
}

// Función para generar slug automáticamente
const generateSlug = (name, makeUnique = false) => {
  if (!name) return ''

  let slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
    .replace(/^-|-$/g, '') // Remover guiones al inicio y final

  // Si se solicita hacer único, agregar identificador único más robusto
  if (makeUnique) {
    // Usar timestamp completo + número aleatorio para mayor unicidad
    const timestamp = Date.now().toString()
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')
    slug = `${slug}-${timestamp}-${random}`
  }

  return slug
}

const isValidUrl = (string) => {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

const handleTypeChange = () => {
  // Limpiar contenido cuando cambia el tipo
  form.value.content = ''
  validateField('content')
}

// Funciones del editor de Markdown
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

// Funciones del toolbar de Markdown
const insertMarkdown = (type) => {
  const textarea = document.querySelector('.markdown-textarea')
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = textarea.value.substring(start, end)
  const beforeText = textarea.value.substring(0, start)
  const afterText = textarea.value.substring(end)

  let before = ''
  let after = ''
  let placeholder = ''

  switch (type) {
    case 'bold':
      before = '**'
      after = '**'
      placeholder = 'texto en negrita'
      break
    case 'italic':
      before = '*'
      after = '*'
      placeholder = 'texto en cursiva'
      break
    case 'strikethrough':
      before = '~~'
      after = '~~'
      placeholder = 'texto tachado'
      break
    case 'h1':
      before = '# '
      after = ''
      placeholder = 'Título 1'
      break
    case 'h2':
      before = '## '
      after = ''
      placeholder = 'Título 2'
      break
    case 'h3':
      before = '### '
      after = ''
      placeholder = 'Título 3'
      break
    case 'link':
      const url = prompt('Ingresa la URL del enlace:')
      if (url) {
        before = '['
        after = `](${url})`
        placeholder = 'texto del enlace'
      } else {
        return
      }
      break
    case 'image':
      const imageUrl = prompt('Ingresa la URL de la imagen:')
      if (imageUrl) {
        before = '!['
        after = `](${imageUrl})`
        placeholder = 'texto alternativo'
      } else {
        return
      }
      break
    case 'code':
      before = '`'
      after = '`'
      placeholder = 'código'
      break
    case 'list':
      before = '- '
      after = ''
      placeholder = 'elemento de lista'
      break
    case 'orderedList':
      before = '1. '
      after = ''
      placeholder = 'elemento de lista numerada'
      break
    case 'quote':
      before = '> '
      after = ''
      placeholder = 'texto de cita'
      break
    case 'table':
      const tableMarkdown = `| Columna 1 | Columna 2 | Columna 3 |
|-----------|-----------|-----------|
| Fila 1    | Fila 1    | Fila 1    |
| Fila 2    | Fila 2    | Fila 2    |`
      before = tableMarkdown + '\n\n'
      after = ''
      placeholder = ''
      break
    case 'horizontalRule':
      before = '---\n'
      after = ''
      placeholder = ''
      break
    default:
      return
  }

  // Si no hay texto seleccionado, usar placeholder
  const textToInsert = selectedText || placeholder

  const newText = beforeText + before + textToInsert + after + afterText
  textarea.value = newText

  // Restaurar la selección
  const newStart = start + before.length
  const newEnd = newStart + textToInsert.length
  textarea.setSelectionRange(newStart, newEnd)
  textarea.focus()

  // Actualizar el modelo
  form.value.content = textarea.value
}

// Funciones auxiliares para URL y PDF
const getUrlTitle = (url) => {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return 'Enlace'
  }
}

const getUrlDomain = (url) => {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return url
  }
}

const getPdfTitle = (url) => {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const filename = pathname.split('/').pop()
    return filename || 'Documento PDF'
  } catch {
    return 'Documento PDF'
  }
}

const handlePdfError = () => {
  console.warn('⚠️ [PDF] Error cargando PDF:', form.value.content)
}

// PDF File Upload Functions
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    validatePdfFile(file)
  }
}

const validatePdfFile = (file) => {
  console.log('📄 [PDF UPLOAD] validatePdfFile llamado con archivo:', file)

  // Limpiar errores previos
  validationErrors.value.content = null

  // Validar que el archivo existe
  if (!file) {
    console.log('❌ [PDF UPLOAD] No se proporcionó archivo')
    validationErrors.value.content = 'No se seleccionó ningún archivo'
    return false
  }

  console.log('📄 [PDF UPLOAD] Archivo info:', {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified
  })

  // Validar tipo de archivo
  if (file.type !== 'application/pdf') {
    console.log('❌ [PDF UPLOAD] Tipo de archivo inválido:', file.type)
    validationErrors.value.content = 'Solo se permiten archivos PDF'
    return false
  }

  // Validar tamaño (10MB máximo)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    console.log('❌ [PDF UPLOAD] Archivo muy grande:', formatFileSize(file.size))
    validationErrors.value.content = 'El archivo PDF no puede ser mayor a 10MB'
    return false
  }

  // Archivo válido
  pdfFile.value = file
  form.value.content = file.name // Usar el nombre del archivo como contenido

  console.log('📄 [PDF UPLOAD] Archivo asignado - pdfFile.value:', pdfFile.value)
  console.log('📄 [PDF UPLOAD] Contenido del formulario:', form.value.content)

  // Validar el campo content después de asignar el archivo
  validateField('content')

  console.log('✅ [PDF UPLOAD] Archivo PDF válido:', file.name, formatFileSize(file.size))
  return true
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const removeFile = () => {
  pdfFile.value = null
  form.value.content = ''
  if (pdfPreviewUrl.value) {
    URL.revokeObjectURL(pdfPreviewUrl.value)
    pdfPreviewUrl.value = null
  }
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Funciones específicas para PDF
const handlePdfFileChange = (event) => {
  console.log('📄 [PDF UPLOAD] handlePdfFileChange llamado')
  const file = event.target.files[0]
  console.log('📄 [PDF UPLOAD] Archivo seleccionado:', file)
  if (file) {
    validatePdfFile(file)
  } else {
    console.log('📄 [PDF UPLOAD] No se seleccionó ningún archivo')
  }
}

const removePdfFile = () => {
  console.log('📄 [PDF UPLOAD] removePdfFile llamado')
  pdfFile.value = null
  form.value.content = ''
  if (pdfPreviewUrl.value) {
    URL.revokeObjectURL(pdfPreviewUrl.value)
    pdfPreviewUrl.value = null
  }
  if (pdfFileInput.value) {
    pdfFileInput.value.value = ''
  }
  // Limpiar errores de validación
  validationErrors.value.content = null
  console.log('📄 [PDF UPLOAD] Archivo PDF removido exitosamente')
}

const openFileDialog = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const previewPdf = () => {
  if (pdfFile.value) {
    if (pdfPreviewUrl.value) {
      URL.revokeObjectURL(pdfPreviewUrl.value)
    }
    pdfPreviewUrl.value = URL.createObjectURL(pdfFile.value)

    // Abrir en nueva ventana
    window.open(pdfPreviewUrl.value, '_blank')
  }
}

const uploadPdfFile = async (documentId, file) => {
  try {
    console.log('📄 [PDF UPLOAD] Subiendo archivo PDF:', file.name, 'para documento:', documentId)

    const formData = new FormData()
    formData.append('file', file)

    // Agregar metadatos del documento
    formData.append('name', form.value.name)
    formData.append('type', 'TYPE_PDF')
    formData.append('slug', form.value.slug)
    formData.append('status', 'true')
    formData.append('icon', form.value.icon || 'fas fa-file-pdf')

    // Enviar roles como array individual, no como JSON string
    form.value.roles.forEach((role) => {
      formData.append('roles', role)
    })

    await documentService.uploadDocumentFile(documentId, formData)
    console.log('✅ [PDF UPLOAD] Archivo PDF subido exitosamente')
  } catch (error) {
    console.error('❌ [PDF UPLOAD] Error subiendo archivo PDF:', error)
    throw error
  }
}

// Roles disponibles (mismos que en MenuManagerView)
// Roles disponibles (mismos que en MenuManagerView)
// SUPER_USER se asigna automáticamente a todos los documentos, no es seleccionable
const availableRolesList = [
  {
    value: 'ADMIN',
    label: 'Administrador',
    icon: 'fas fa-user-shield',
    description: 'Gestión de usuarios y configuración',
  },
  {
    value: 'COLLABORATOR',
    label: 'Colaborador',
    icon: 'fas fa-users',
    description: 'Acceso a funciones básicas',
  },
]

const resetForm = () => {
  form.value = {
    name: '',
    type: '',
    slug: '',
    content: '',
    icon: '',
    roles: ['SUPER_USER'], // SUPER_USER se asigna automáticamente a todos los documentos
  }
  validationErrors.value = {}
  currentWizardStep.value = 1
  pdfFile.value = null
  activeTab.value = 'edit'
}

const loadDocumentData = () => {
  if (props.document) {
    console.log(
      '📄 [CONTENT FORM] Documento cargado para edición:',
      props.document?.name || 'Sin nombre',
    )
    console.log('📄 [CONTENT FORM] Roles del documento:', props.document.roles)

    // Procesar roles para asegurar que sea un array y manejar diferentes formatos
    let cleanRoles = []

    if (props.document.roles) {
      if (typeof props.document.roles === 'string') {
        // Si roles es un string, convertir a array
        if (props.document.roles.includes(',')) {
          cleanRoles = props.document.roles.split(',').map((role) => role.trim())
        } else {
          cleanRoles = [props.document.roles]
        }
      } else if (Array.isArray(props.document.roles)) {
        cleanRoles = [...props.document.roles]
      }

      // Limpiar prefijos ROLE_ si existen
      cleanRoles = cleanRoles.map((role) => {
        if (typeof role === 'string' && role.startsWith('ROLE_')) {
          return role.substring(5) // Remover 'ROLE_' (5 caracteres)
        }
        return role
      })
    }

    console.log('📄 [CONTENT FORM] Roles procesados:', cleanRoles)

    form.value = {
      name: props.document.name || '',
      type: props.document.type || '',
      slug: '', // Se genera automáticamente en edición
      content: props.document.content || '',
      icon: props.document.icon || '',
      roles: cleanRoles,
    }

    // Resetear el paso del wizard a 1
    currentWizardStep.value = 1
  } else {
    resetForm()
  }
}

const handleButtonClick = () => {
  console.log('📄 [CONTENT FORM] Botón clickeado')
  console.log('📄 [CONTENT FORM] isFormValid:', isFormValid.value)
  console.log('📄 [CONTENT FORM] isSaving:', isSaving.value)
  console.log('📄 [CONTENT FORM] currentWizardStep:', currentWizardStep.value)
  console.log('📄 [CONTENT FORM] wizardSteps.length:', wizardSteps.value.length)

  // Si el formulario es válido y no se está guardando, proceder con el envío
  if (isFormValid.value && !isSaving.value) {
    console.log('📄 [CONTENT FORM] Ejecutando handleSubmit directamente')
    handleSubmit()
  } else {
    console.log('📄 [CONTENT FORM] No se puede proceder - Formulario inválido o guardando')
  }
}

const handleSubmit = async () => {
  console.log('📄 [CONTENT FORM] handleSubmit llamado')
  console.log('📄 [CONTENT FORM] Estado del formulario:', {
    name: form.value.name,
    type: form.value.type,
    content: form.value.content,
    roles: form.value.roles,
    isFormValid: isFormValid.value
  })

  validateForm()

  if (Object.keys(validationErrors.value).length > 0) {
    console.log('❌ [CONTENT FORM] Errores de validación:', validationErrors.value)
    return
  }

  isSaving.value = true

  let documentData = null

  try {
    documentData = {
      name: form.value.name.trim(),
      type: form.value.type,
      slug: generateSlug(form.value.name, true) || '',
      status: true, // Campo requerido por el backend
      content: form.value.content.trim(),
      icon:
        form.value.icon ||
        (form.value.type === 'TYPE_TEXT'
          ? 'fas fa-file-alt'
          : form.value.type === 'TYPE_URL'
            ? 'fas fa-link'
            : form.value.type === 'TYPE_PDF'
              ? 'fas fa-file-pdf'
              : 'fas fa-file'),
      roles: form.value.roles.length > 0 ? form.value.roles : [],
    }

    // Validaciones adicionales antes de enviar
    if (!documentData.name) {
      throw new Error('El nombre del documento es obligatorio')
    }

    if (!documentData.type) {
      throw new Error('El tipo de documento es obligatorio')
    }

    if (!documentData.content) {
      throw new Error('El contenido del documento es obligatorio')
    }

    if (!documentData.roles || documentData.roles.length === 0) {
      throw new Error('Debe seleccionar al menos un rol de acceso')
    }

    // Validar URL si es tipo URL (PDF ahora maneja archivos)
    if (documentData.type === 'TYPE_URL' && !isValidUrl(documentData.content)) {
      throw new Error('La URL proporcionada no es válida')
    }

    // Validar archivo PDF si es tipo PDF
    if (documentData.type === 'TYPE_PDF' && !pdfFile.value) {
      throw new Error('Debe seleccionar un archivo PDF')
    }

    // Validación adicional para PDFs
    if (documentData.type === 'TYPE_PDF') {
      console.log('🔍 [CONTENT FORM] Validación PDF - pdfFile.value:', pdfFile.value)
      console.log('🔍 [CONTENT FORM] Validación PDF - pdfFile.name:', pdfFile.value?.name)
      console.log('🔍 [CONTENT FORM] Validación PDF - pdfFile.size:', pdfFile.value?.size)

      if (!pdfFile.value) {
        throw new Error('No se ha seleccionado ningún archivo PDF')
      }

      if (!pdfFile.value.name) {
        throw new Error('El archivo PDF seleccionado no es válido')
      }
    }

    console.log('📄 [CONTENT FORM] Datos del documento:', documentData)
    console.log('📄 [CONTENT FORM] Roles específicos:', documentData.roles)
    console.log('📄 [CONTENT FORM] Tipo de roles:', typeof documentData.roles)
    console.log('📄 [CONTENT FORM] Es array:', Array.isArray(documentData.roles))
    console.log('📄 [CONTENT FORM] Longitud:', documentData.roles?.length)
    console.log('📄 [CONTENT FORM] Roles del formulario:', form.value.roles)
    console.log(
      '📄 [CONTENT FORM] Roles disponibles:',
      availableRolesList.map((r) => r.value),
    )

    // Verificar que no hay prefijos ROLE_ duplicados
    const hasDuplicatePrefix = documentData.roles.some(
      (role) => typeof role === 'string' && role.startsWith('ROLE_ROLE_'),
    )
    console.log('📄 [CONTENT FORM] ¿Tiene prefijos duplicados?', hasDuplicatePrefix)

    if (hasDuplicatePrefix) {
      console.warn(
        '⚠️ [CONTENT FORM] Detectados roles con prefijo ROLE_ duplicado:',
        documentData.roles,
      )
    }

    // Agregar el ID al documentData para el emit
    const documentDataWithId = {
      ...documentData,
      id: isEditing.value ? props.document.id : undefined,
    }

    let createdDocumentId = null

    if (isEditing.value) {
      console.log('📄 [CONTENT FORM] Actualizando documento existente...')
      await documentService.updateDocument(props.document.id, documentData)
      console.log('✅ [CONTENT FORM] Documento actualizado exitosamente')
    } else {
      // Para documentos PDF, usar el endpoint específico de creación con archivo
      console.log('🔍 [CONTENT FORM] Debug - Tipo:', documentData.type)
      console.log('🔍 [CONTENT FORM] Debug - pdfFile.value:', pdfFile.value)
      console.log(
        '🔍 [CONTENT FORM] Debug - Condición PDF:',
        documentData.type === 'TYPE_PDF' && pdfFile.value,
      )

      if (documentData.type === 'TYPE_PDF' && pdfFile.value) {
        console.log('📄 [CONTENT FORM] Creando documento PDF con archivo...')
        const createdDocument = await documentService.createDocumentWithFile(
          documentData,
          pdfFile.value,
        )
        console.log('✅ [CONTENT FORM] Documento PDF creado exitosamente')
        createdDocumentId = createdDocument.id
        documentDataWithId.id = createdDocumentId
      } else {
        console.log('📄 [CONTENT FORM] Creando nuevo documento...')
        const createdDocument = await documentService.createDocument(documentData)
        console.log('✅ [CONTENT FORM] Documento creado exitosamente')
        createdDocumentId = createdDocument.id
        documentDataWithId.id = createdDocumentId
      }
    }

    // Si es un PDF con archivo y estamos editando, subir el archivo
    if (isEditing.value && documentData.type === 'TYPE_PDF' && pdfFile.value) {
      console.log('📄 [CONTENT FORM] Subiendo archivo PDF...')
      const documentId = props.document.id
      await uploadPdfFile(documentId, pdfFile.value)
      console.log('✅ [CONTENT FORM] Archivo PDF subido exitosamente')
    }

    console.log('📄 [CONTENT FORM] Emitiendo evento saved con ID:', documentDataWithId.id)
    console.log('📄 [CONTENT FORM] Documento completo:', documentDataWithId)

    emit('saved', documentDataWithId)
    handleClose()
  } catch (error) {
    console.error('❌ [CONTENT FORM] Error guardando documento:', error)
    console.error('❌ [CONTENT FORM] Status:', error.response?.status)
    console.error('❌ [CONTENT FORM] Response data:', error.response?.data)

    if (documentData) {
      console.error('❌ [CONTENT FORM] Request data:', documentData)
    } else {
      console.error('❌ [CONTENT FORM] Request data: No disponible (error en validación)')
    }

    // Manejar error específico de slug duplicado
    if (
      error.response?.status === 422 &&
      error.response?.data?.detail?.includes('slug') &&
      error.response?.data?.detail?.includes('ya existe')
    ) {
      console.log('🔄 [CONTENT FORM] Slug duplicado detectado, regenerando automáticamente...')

      // Regenerar slug único
      const newSlug = generateSlug(form.value.name, true)
      form.value.slug = newSlug
      validateField('slug')

      console.log('📝 [CONTENT FORM] Nuevo slug generado:', newSlug)

      // Mostrar mensaje al usuario
      console.log('ℹ️ [CONTENT FORM] Slug regenerado automáticamente para evitar duplicados')

      // Intentar guardar nuevamente con el nuevo slug
      try {
        const newDocumentData = {
          ...documentData,
          slug: newSlug,
        }

        let createdDocumentId = null

        if (isEditing.value) {
          await documentService.updateDocument(props.document.id, newDocumentData)
        } else {
          // Para documentos PDF, usar el endpoint específico de creación con archivo
          if (newDocumentData.type === 'TYPE_PDF' && pdfFile.value) {
            console.log('📄 [CONTENT FORM] Reintentando creación de documento PDF con archivo...')
            const createdDocument = await documentService.createDocumentWithFile(
              newDocumentData,
              pdfFile.value,
            )
            createdDocumentId = createdDocument.id
          } else {
            const createdDocument = await documentService.createDocument(newDocumentData)
            createdDocumentId = createdDocument.id
          }
        }

        console.log('✅ [CONTENT FORM] Documento guardado exitosamente con slug único')

        // Agregar el ID al newDocumentData para el emit
        const newDocumentDataWithId = {
          ...newDocumentData,
          id: isEditing.value ? props.document.id : createdDocumentId,
        }

        console.log(
          '📄 [CONTENT FORM] Emitiendo evento saved con ID (slug único):',
          newDocumentDataWithId.id,
        )
        console.log('📄 [CONTENT FORM] Documento completo (slug único):', newDocumentDataWithId)

        emit('saved', newDocumentDataWithId)
        handleClose()
        return
      } catch (retryError) {
        console.error('❌ [CONTENT FORM] Error en reintento:', retryError)
        // Continuar con el manejo de errores normal
      }
    }

    // Mostrar error específico según el código de estado
    if (error.response?.status === 422) {
      console.error('❌ [CONTENT FORM] Error 422: Datos no válidos')
      console.error('❌ [CONTENT FORM] Detalles del error:', error.response?.data)

      // Si hay errores de validación específicos, mostrarlos
      if (error.response?.data?.errors) {
        console.error('❌ [CONTENT FORM] Errores de validación:', error.response.data.errors)
      }

      // Mostrar mensaje más específico
      if (error.response?.data?.message) {
        console.error('❌ [CONTENT FORM] Mensaje del servidor:', error.response.data.message)
      }

      // Mostrar campos específicos que fallaron
      if (error.response?.data?.validation) {
        console.error('❌ [CONTENT FORM] Validación fallida:', error.response.data.validation)
      }
    } else if (error.response?.status === 400) {
      console.error('❌ [CONTENT FORM] Error 400: Solicitud incorrecta')
    } else if (error.response?.status === 401) {
      console.error('❌ [CONTENT FORM] Error 401: No autorizado')
    } else if (error.response?.status === 500) {
      console.error('❌ [CONTENT FORM] Error 500: Error interno del servidor')
    } else if (error.message) {
      console.error('❌ [CONTENT FORM] Error de validación:', error.message)
    }

    // Aquí podrías mostrar un mensaje de error al usuario
  } finally {
    isSaving.value = false
  }
}

const handleClose = () => {
  console.log('📄 [CONTENT FORM] Cerrando formulario...')
  console.log('📄 [CONTENT FORM] Estado de edición:', isEditing.value)

  resetForm()
  emit('close')

  console.log('📄 [CONTENT FORM] Formulario cerrado')
}

// Watchers
watch(() => props.document, loadDocumentData, { immediate: true })
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      loadDocumentData()
    }
  },
)

// Watcher para generar slug automáticamente cuando cambie el nombre
watch(
  () => form.value.name,
  (newName) => {
    if (newName && !form.value.slug) {
      form.value.slug = generateSlug(newName)
      validateField('slug')
    }
  },
)

// Función para regenerar slug manualmente
const regenerateSlug = () => {
  if (form.value.name) {
    form.value.slug = generateSlug(form.value.name, true) // Hacer único por defecto
    validateField('slug')
    generateSlugAlternatives()
  }
}

// Función para generar opciones de slug alternativas
const generateSlugAlternatives = () => {
  if (!form.value.name) return

  const baseSlug = form.value.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  const alternatives = []

  // Generar diferentes variaciones
  alternatives.push(`${baseSlug}-${Date.now()}`)
  alternatives.push(`${baseSlug}-${Math.floor(Math.random() * 10000)}`)
  alternatives.push(`${baseSlug}-v2`)
  alternatives.push(`${baseSlug}-nuevo`)
  alternatives.push(`${baseSlug}-${new Date().getFullYear()}`)

  slugAlternatives.value = alternatives.slice(0, 3) // Mostrar solo 3 opciones
}

// Función para seleccionar una opción de slug alternativa
const selectSlugAlternative = (alternative) => {
  form.value.slug = alternative
  validateField('slug')
  slugAlternatives.value = [] // Limpiar opciones después de seleccionar
}
</script>

<style scoped>
/* Estilos para indicador de carga del formulario */
.form-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  color: #6c757d;
  text-align: center;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  border-bottom: 1px solid #e9ecef;
}

.form-loading .loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e9ecef;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.form-loading p {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(8px);
}

/* Mejoras para modo oscuro */
.dark-theme .modal-overlay {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(12px);
}

.modal-container {
  background: var(--bg-card);
  border-radius: 16px;
  box-shadow: 0 20px 60px var(--shadow-color);
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
}

/* Mejoras para modo oscuro */
.dark-theme .modal-container {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  border: 1px solid var(--border-primary);
}

/* Header */
.modal-header {
  background: linear-gradient(135deg, #1976d2, #1565c0);
  color: white;
  padding: 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.header-text {
  flex: 1;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.modal-subtitle {
  font-size: 0.9rem;
  opacity: 0.9;
  margin: 0;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

.close-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Body */
.modal-body {
  padding: 2rem;
  flex: 1;
  overflow-y: auto;
}

.document-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Form Sections */
.form-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.section-icon {
  width: 40px;
  height: 40px;
  background: #1976d2;
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-title-content {
  flex: 1;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: #333;
}

.section-description {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

/* Form Layout */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.required {
  color: #e74c3c;
}

.form-input,
.form-select {
  padding: 0.875rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: white;
  color: #333;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.form-input.error,
.form-select.error {
  border-color: #e74c3c;
}

.form-input:disabled,
.form-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-help {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.25rem;
}

.form-help {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.25rem;
}

/* Roles Selector */
.roles-selector {
  border: none;
  padding: 0;
  margin: 0;
}

.role-option {
  margin-bottom: 1rem;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.3s ease;
}

.role-option:hover {
  background: #f0f0f0;
  border-color: #1976d2;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  margin: 0;
}

.form-checkbox {
  margin: 0;
  width: 18px;
  height: 18px;
  accent-color: #1976d2;
  cursor: pointer;
}

.checkbox-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #333;
  flex: 1;
}

.checkbox-text i {
  font-size: 1.1rem;
  color: #1976d2;
}

.role-description {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.5rem;
  margin-left: 2rem;
  line-height: 1.4;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.error-message {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Content Editor */
.content-editor {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  animation: fadeInUp 0.3s ease-out;
}

/* Editor Header */
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #dee2e6;
}

/* Markdown Toolbar */
.markdown-toolbar {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  gap: 0.5rem;
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.toolbar-separator {
  width: 1px;
  height: 24px;
  background: var(--border-color);
  margin: 0 0.5rem;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;
}

.toolbar-btn:hover {
  background: var(--bg-hover);
  border-color: var(--accent-color);
  color: var(--accent-color);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px var(--shadow-color);
}

.toolbar-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 4px var(--shadow-color);
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.toolbar-btn:disabled:hover {
  background: var(--bg-primary);
  border-color: var(--border-color);
  color: var(--text-secondary);
  transform: none;
  box-shadow: none;
}

/* Dark mode para toolbar */
.dark-theme .markdown-toolbar {
  background: var(--bg-tertiary);
  border-bottom-color: var(--border-primary);
}

.dark-theme .toolbar-separator {
  background: var(--border-primary);
}

.dark-theme .toolbar-btn {
  background: var(--bg-primary);
  border-color: var(--border-primary);
  color: var(--text-secondary);
}

.dark-theme .toolbar-btn:hover {
  background: var(--bg-hover);
  border-color: var(--accent-color);
  color: var(--accent-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.dark-theme .toolbar-btn:active {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.editor-tabs {
  display: flex;
  gap: 0.5rem;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  color: #6c757d;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.tab-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.tab-btn i {
  font-size: 1rem;
}

.editor-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #e9ecef;
  color: #495057;
}

/* Editor Content */
.editor-content {
  position: relative;
  min-height: 400px;
}

.editor-content.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: white;
  border-radius: 0;
}

/* Markdown Textarea */
.markdown-textarea {
  width: 100%;
  min-height: 400px;
  padding: 1.5rem;
  border: none;
  outline: none;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  background: var(--bg-primary);
  color: var(--text-primary);
  resize: vertical;
  border-radius: 0;
}

.markdown-textarea:focus {
  outline: none;
  box-shadow: inset 0 0 0 2px var(--accent-color);
}

.markdown-textarea::placeholder {
  color: var(--text-muted);
  font-style: italic;
}

.markdown-textarea.error {
  border-left: 4px solid var(--error-color);
  background: rgba(239, 68, 68, 0.05);
}

/* Dark mode para textarea */
.dark-theme .markdown-textarea {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.dark-theme .markdown-textarea:focus {
  box-shadow: inset 0 0 0 2px var(--accent-color);
}

.dark-theme .markdown-textarea::placeholder {
  color: var(--text-muted);
}

.dark-theme .markdown-textarea.error {
  background: rgba(239, 68, 68, 0.1);
}

/* Markdown Preview */
.markdown-preview {
  width: 100%;
  min-height: 400px;
  padding: 1.5rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  border: none;
  outline: none;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  line-height: 1.7;
  overflow-y: auto;
}

.markdown-preview h1,
.markdown-preview h2,
.markdown-preview h3,
.markdown-preview h4,
.markdown-preview h5,
.markdown-preview h6 {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
  line-height: 1.3;
  color: var(--text-primary);
}

.markdown-preview h1 {
  font-size: 2rem;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.markdown-preview h2 {
  font-size: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.25rem;
}

.markdown-preview h3 {
  font-size: 1.25rem;
}

.markdown-preview p {
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.markdown-preview strong {
  font-weight: 600;
  color: var(--text-primary);
}

.markdown-preview em {
  font-style: italic;
  color: var(--text-primary);
}

.markdown-preview code {
  background: var(--bg-tertiary);
  color: var(--accent-color);
  padding: 0.125rem 0.25rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875em;
}

.markdown-preview pre {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.markdown-preview pre code {
  background: none;
  padding: 0;
  color: var(--text-primary);
}

.markdown-preview blockquote {
  border-left: 4px solid var(--accent-color);
  background: var(--bg-secondary);
  margin: 1rem 0;
  padding: 1rem 1.5rem;
  border-radius: 0 8px 8px 0;
  color: var(--text-secondary);
}

.markdown-preview ul,
.markdown-preview ol {
  margin: 1rem 0;
  padding-left: 2rem;
}

.markdown-preview li {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.markdown-preview a {
  color: var(--accent-color);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: all 0.2s ease;
}

.markdown-preview a:hover {
  border-bottom-color: var(--accent-color);
}

.markdown-preview img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--shadow-color);
  margin: 1rem 0;
}

.markdown-preview table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  background: var(--bg-primary);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.markdown-preview th,
.markdown-preview td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.markdown-preview th {
  background: var(--bg-secondary);
  font-weight: 600;
  color: var(--text-primary);
}

.markdown-preview td {
  color: var(--text-primary);
}

.markdown-preview hr {
  border: none;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--border-color), transparent);
  margin: 2rem 0;
}

/* Dark mode para preview */
.dark-theme .markdown-preview {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.dark-theme .markdown-preview h1,
.dark-theme .markdown-preview h2,
.dark-theme .markdown-preview h3,
.dark-theme .markdown-preview h4,
.dark-theme .markdown-preview h5,
.dark-theme .markdown-preview h6 {
  color: var(--text-primary);
}

.dark-theme .markdown-preview h1 {
  border-bottom-color: var(--border-primary);
}

.dark-theme .markdown-preview h2 {
  border-bottom-color: var(--border-primary);
}

.dark-theme .markdown-preview code {
  background: var(--bg-tertiary);
  color: var(--accent-color);
}

.dark-theme .markdown-preview pre {
  background: var(--bg-tertiary);
  border-color: var(--border-primary);
}

.dark-theme .markdown-preview blockquote {
  background: var(--bg-secondary);
  border-left-color: var(--accent-color);
  color: var(--text-secondary);
}

.dark-theme .markdown-preview table {
  background: var(--bg-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.dark-theme .markdown-preview th {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.dark-theme .markdown-preview th,
.dark-theme .markdown-preview td {
  border-bottom-color: var(--border-primary);
}

.dark-theme .markdown-preview img {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.dark-theme .markdown-preview hr {
  background: linear-gradient(90deg, transparent, var(--border-primary), transparent);
}

/* Estados especiales del preview */
.markdown-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-muted);
  font-style: italic;
  background: var(--bg-secondary);
  border-radius: 8px;
  margin: 1rem;
}

.markdown-error {
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--error-color);
  border-radius: 8px;
  color: var(--error-color);
  margin: 1rem;
}

.markdown-error pre {
  background: rgba(239, 68, 68, 0.05);
  padding: 0.5rem;
  border-radius: 4px;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  overflow-x: auto;
}

/* Dark mode para estados especiales */
.dark-theme .markdown-empty {
  background: var(--bg-secondary);
  color: var(--text-muted);
}

.dark-theme .markdown-error {
  background: rgba(239, 68, 68, 0.15);
  border-color: var(--error-color);
  color: var(--error-color);
}

.dark-theme .markdown-error pre {
  background: rgba(239, 68, 68, 0.1);
}

/* Editor Panel */
.editor-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.toolbar-group {
  display: flex;
  gap: 0.25rem;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toolbar-btn:hover {
  background: #e9ecef;
  color: #495057;
  border-color: #adb5bd;
}

.toolbar-btn:active {
  background: #dee2e6;
  transform: translateY(1px);
}

.markdown-editor {
  flex: 1;
  padding: 1rem;
  border: none;
  outline: none;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  min-height: 300px;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
  font-size: 0.85rem;
  color: #6c757d;
}

.char-count {
  font-weight: 500;
}

.markdown-help {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Preview Panel */
.preview-panel {
  height: 100%;
  overflow-y: auto;
}

.preview-content {
  padding: 1rem;
  min-height: 400px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
}

.preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #6c757d;
  text-align: center;
}

.preview-empty i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Split Panel */
.split-panel {
  display: flex;
  height: 100%;
  min-height: 400px;
}

.split-editor,
.split-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.split-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  font-size: 0.9rem;
  font-weight: 500;
  color: #495057;
}

.split-divider {
  width: 1px;
  background: #dee2e6;
}

.split-textarea {
  flex: 1;
  border: none;
  outline: none;
  padding: 1rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
}

.split-preview-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
}

/* Markdown Styles */
.preview-content h1,
.preview-content h2,
.preview-content h3,
.preview-content h4,
.preview-content h5,
.preview-content h6 {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  line-height: 1.25;
}

.preview-content h1 {
  font-size: 2rem;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.preview-content h2 {
  font-size: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 0.25rem;
}

.preview-content h3 {
  font-size: 1.25rem;
}

.preview-content p {
  margin-bottom: 1rem;
}

.preview-content ul,
.preview-content ol {
  margin-bottom: 1rem;
  padding-left: 2rem;
}

.preview-content li {
  margin-bottom: 0.25rem;
}

.preview-content blockquote {
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border-left: 4px solid #007bff;
  color: #6c757d;
}

.preview-content code {
  background: #f8f9fa;
  padding: 0.125rem 0.25rem;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
}

.preview-content pre {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.preview-content pre code {
  background: none;
  padding: 0;
}

.preview-content a {
  color: #007bff;
  text-decoration: none;
}

.preview-content a:hover {
  text-decoration: underline;
}

.preview-content table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.preview-content th,
.preview-content td {
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  text-align: left;
}

.preview-content th {
  background: #f8f9fa;
  font-weight: 600;
}

.preview-content img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

/* Responsive */
@media (max-width: 768px) {
  .split-panel {
    flex-direction: column;
  }

  .split-divider {
    width: 100%;
    height: 1px;
  }

  .editor-tabs {
    flex-wrap: wrap;
  }

  .tab-btn {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }
}

/* URL Editor */
.url-editor {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  animation: fadeInUp 0.3s ease-out;
}

/* PDF Editor */
.pdf-editor {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  animation: fadeInUp 0.3s ease-out;
}

/* URL Preview Card */
.url-preview-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  margin: 1rem;
}

.url-preview-card .preview-header {
  background: #f8f9fa;
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.url-preview-card .preview-body {
  padding: 1rem;
}

.url-info {
  margin-bottom: 1rem;
}

.url-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #212529;
  margin-bottom: 0.25rem;
}

.url-domain {
  font-size: 0.9rem;
  color: #6c757d;
}

.preview-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
}

.preview-link:hover {
  background: #0056b3;
  color: white;
}

/* PDF Preview Card */
.pdf-preview-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  margin: 1rem;
}

.pdf-preview-card .preview-header {
  background: #f8f9fa;
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.pdf-preview-card .preview-body {
  padding: 1rem;
}

.pdf-info {
  margin-bottom: 1rem;
}

.pdf-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #212529;
  margin-bottom: 0.25rem;
}

.pdf-url {
  font-size: 0.9rem;
  color: #6c757d;
  word-break: break-all;
}

.pdf-viewer-container {
  margin: 1rem 0;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.pdf-viewer {
  width: 100%;
  height: 400px;
  border: none;
}

.pdf-actions {
  text-align: center;
}

.pdf-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
}

.pdf-link:hover {
  background: #c82333;
  color: white;
}

/* Help text styles */
.url-help,
.pdf-help {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: #6c757d;
}

.editor-toolbar {
  background: #f5f5f5;
  padding: 0.75rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  gap: 0.25rem;
}

.toolbar-btn {
  background: white;
  border: 1px solid #e0e0e0;
  color: #666;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toolbar-btn:hover {
  background: #1976d2;
  color: white;
  border-color: #1976d2;
}

.markdown-editor {
  width: 100%;
  min-height: 300px;
  padding: 1rem;
  border: none;
  outline: none;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  background: white;
  color: #333;
  resize: vertical;
}

.editor-footer {
  background: #f5f5f5;
  padding: 0.75rem 1rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #666;
}

.char-count {
  font-weight: 500;
}

.markdown-help {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Mensaje cuando no hay tipo seleccionado */
.no-type-selected {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 2px dashed #dee2e6;
  border-radius: 12px;
  text-align: center;
}

.no-type-icon {
  width: 60px;
  height: 60px;
  background: #6c757d;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.no-type-text h4 {
  margin: 0 0 0.5rem 0;
  color: #495057;
  font-size: 1.1rem;
}

.no-type-text p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

/* Input containers con iconos */
.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: #6c757d;
  z-index: 1;
  font-size: 1.1rem;
}

.input-container .form-input {
  padding-left: 3rem;
}

/* URL Preview */
.url-preview,
.pdf-preview {
  margin-top: 1rem;
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.preview-content {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  background: white;
}

.preview-link {
  color: #1976d2;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  word-break: break-all;
}

.preview-link:hover {
  text-decoration: underline;
}

.pdf-viewer {
  width: 100%;
  height: 300px;
  border-radius: 4px;
}

/* Roles Selector */
.roles-selector {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
}

.role-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.role-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.role-option:hover {
  background: #f8f9fa;
}

.role-checkbox {
  margin: 0;
}

.role-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #333;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.btn {
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background: #1976d2;
  color: white;
}

/* Estilos para el botón de regenerar slug */
.slug-regenerate-btn {
  background: #e3f2fd;
  color: #1976d2;
  border: 1px solid #e3f2fd;
  border-radius: 0.375rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: auto;
}

.slug-regenerate-btn:hover:not(:disabled) {
  background: #1976d2;
  color: white;
  border-color: #1976d2;
}

.slug-regenerate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Estilos para opciones de slug alternativas */
.slug-alternatives {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  animation: fadeInUp 0.3s ease;
}

.slug-alternatives-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-weight: 500;
  color: #495057;
}

.slug-alternatives-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.slug-alternative-btn {
  background: white;
  color: #495057;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-align: left;
}

.slug-alternative-btn:hover:not(:disabled) {
  background: #e3f2fd;
  color: #1976d2;
  border-color: #1976d2;
  transform: translateY(-1px);
}

.slug-alternative-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Estilos para vista previa de Markdown */
.preview-content {
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e9ecef;
  min-height: 200px;
  line-height: 1.6;
  color: #333;
}

.preview-content h1,
.preview-content h2,
.preview-content h3,
.preview-content h4,
.preview-content h5,
.preview-content h6 {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 600;
}

.preview-content h1 {
  font-size: 2rem;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.preview-content h2 {
  font-size: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 0.25rem;
}

.preview-content h3 {
  font-size: 1.25rem;
}

.preview-content p {
  margin-bottom: 1rem;
}

.preview-content ul,
.preview-content ol {
  margin-bottom: 1rem;
  padding-left: 2rem;
}

.preview-content li {
  margin-bottom: 0.25rem;
}

.preview-content blockquote {
  border-left: 4px solid #007bff;
  padding-left: 1rem;
  margin: 1rem 0;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.25rem;
}

.preview-content code {
  background: #f8f9fa;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.preview-content pre {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.preview-content pre code {
  background: none;
  padding: 0;
}

.preview-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.preview-content th,
.preview-content td {
  border: 1px solid #dee2e6;
  padding: 0.5rem;
  text-align: left;
}

.preview-content th {
  background: #f8f9fa;
  font-weight: 600;
}

.preview-content a {
  color: #007bff;
  text-decoration: none;
}

.preview-content a:hover {
  text-decoration: underline;
}

.preview-content img {
  max-width: 100%;
  height: auto;
  border-radius: 0.25rem;
  margin: 1rem 0;
}

.preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6c757d;
  text-align: center;
}

.preview-empty i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.markdown-error {
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #f5c6cb;
}

.markdown-error pre {
  background: #f1b0b7;
  padding: 0.5rem;
  border-radius: 0.25rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.btn-primary:hover:not(:disabled) {
  background: #1565c0;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #f8f9fa;
  color: #333;
  border: 2px solid #e0e0e0;
}

.btn-secondary:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #1976d2;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .editor-toolbar {
    flex-direction: column;
    gap: 0.5rem;
  }

  .toolbar-group {
    justify-content: center;
  }

  .role-options {
    grid-template-columns: 1fr;
  }
}

/* PDF File Upload Styles */
.file-upload-container {
  margin-top: 1rem;
}

.file-upload-area {
  border: 2px dashed #e0e0e0;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  background: #fafafa;
}

.file-upload-area:hover {
  border-color: #1976d2;
  background: #f5f5f5;
}

.file-upload-area.has-file {
  border-color: #4caf50;
  background: #f1f8e9;
}

.file-upload-area.error {
  border-color: #f44336;
  background: #ffebee;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  font-size: 3rem;
  color: #1976d2;
}

.upload-text h4 {
  margin: 0;
  color: #333;
  font-size: 1.25rem;
}

.upload-text p {
  margin: 0.5rem 0;
  color: #666;
}

.upload-hint {
  font-size: 0.875rem;
  color: #999;
}

.file-selected {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e0e0e0;
}

.file-icon {
  font-size: 2rem;
  color: #f44336;
}

.file-info {
  flex: 1;
  text-align: left;
}

.file-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.file-size {
  font-size: 0.875rem;
  color: #666;
}

.remove-file-btn {
  background: #f44336;
  color: white;
  border: none;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.remove-file-btn:hover {
  background: #d32f2f;
}

.file-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  justify-content: center;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.preview-btn {
  background: #1976d2;
  color: white;
}

.preview-btn:hover {
  background: #1565c0;
}

.change-btn {
  background: #ff9800;
  color: white;
}

.change-btn:hover {
  background: #f57c00;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ================================
   WIZARD STYLES
   ================================ */

/* Wizard Header */
.wizard-header {
  background: #245fe7;
  color: white;
  padding: 2rem;
  border-radius: 12px 12px 0 0;
  position: relative;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

/* Mejoras para modo oscuro */
.dark-theme .modal-overlay {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(12px);
}

.dark-theme .modal-container {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.dark-theme .wizard-header {
  background: #245fe7;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.dark-theme .wizard-header::before {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
}

.dark-theme .wizard-steps {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
}

.dark-theme .wizard-step.active {
  background: var(--bg-hover);
}

.dark-theme .wizard-step.active .step-indicator {
  background: linear-gradient(135deg, var(--accent-color), #1d4ed8);
  color: var(--text-inverse);
  box-shadow: 0 4px 12px var(--focus-shadow);
}

.dark-theme .wizard-step.active .step-title {
  color: var(--accent-color);
}

.dark-theme .wizard-body {
  background: var(--bg-primary);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) transparent;
}

.dark-theme .wizard-body::-webkit-scrollbar {
  width: 6px;
}

.dark-theme .wizard-body::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

.dark-theme .wizard-body::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.dark-theme .wizard-body::-webkit-scrollbar-thumb:hover {
  background: var(--border-hover);
}

.dark-theme .wizard-footer {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-primary);
}

.dark-theme .wizard-btn-secondary {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.dark-theme .wizard-btn-secondary:hover:not(:disabled) {
  background: var(--bg-secondary);
  border-color: var(--border-hover);
}

.dark-theme .no-type-selected {
  background: var(--bg-tertiary);
  border: 2px dashed var(--border-color);
  color: var(--text-muted);
}

.dark-theme .wizard-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
}

.dark-theme .wizard-step.active .step-indicator {
  background: linear-gradient(135deg, var(--accent-color), #1d4ed8);
  color: var(--text-inverse);
  box-shadow: 0 4px 12px var(--focus-shadow);
}

.dark-theme .wizard-btn-primary {
  background: linear-gradient(135deg, var(--accent-color), #1d4ed8);
  color: var(--text-inverse);
  box-shadow: 0 4px 12px var(--focus-shadow);
}

.dark-theme .wizard-btn-primary:hover:not(:disabled) {
  box-shadow: 0 6px 20px var(--focus-shadow);
}

.dark-theme .progress-fill {
  background: linear-gradient(90deg, var(--accent-color), #1d4ed8);
}

.dark-theme .form-input {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.dark-theme .form-input:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px var(--focus-shadow);
}

.dark-theme .form-select {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.dark-theme .form-textarea {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.dark-theme .form-label {
  color: var(--text-primary);
}

.dark-theme .form-help {
  color: var(--text-secondary);
}

.dark-theme .error-message {
  color: var(--error-color);
}

.dark-theme .summary-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
}

.dark-theme .summary-title {
  color: var(--text-primary);
}

.dark-theme .summary-title i {
  color: var(--accent-color);
}

.dark-theme .summary-item {
  border-bottom: 1px solid var(--border-color);
}

.dark-theme .summary-label {
  color: var(--text-secondary);
}

.dark-theme .summary-value {
  color: var(--text-primary);
}

.wizard-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  pointer-events: none;
  z-index: 0;
}

.dark-theme .wizard-header::before {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
}

.wizard-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: 0;
}

.wizard-title-section {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex: 1;
  min-width: 0;
}

.wizard-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.wizard-text {
  flex: 1;
  min-width: 0;
}

.wizard-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-inverse);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  line-height: 1.2;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.wizard-subtitle {
  margin: 0;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.wizard-close-btn {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: var(--text-inverse);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
  margin-top: 0.5rem;
}

.wizard-close-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.wizard-close-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Wizard Steps */
.wizard-steps {
  display: flex;
  justify-content: space-between;
  padding: 1.5rem 2rem 1rem 2rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  gap: 1rem;
}

/* Mejoras para modo oscuro */
.dark-theme .wizard-steps {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
}

.wizard-step {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  position: relative;
  padding: 0.75rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.wizard-step:not(:last-child)::after {
  content: '';
  position: absolute;
  right: -0.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 2px;
  background: var(--border-primary);
  transition: all 0.3s ease;
}

.wizard-step.completed::after {
  background: var(--success-color);
}

.wizard-step.active {
  background: var(--bg-hover);
}

.step-indicator {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.wizard-step.active .step-indicator {
  background: linear-gradient(135deg, var(--accent-color), #1d4ed8);
  color: var(--text-inverse);
  box-shadow: 0 4px 12px var(--focus-shadow);
}

.wizard-step.completed .step-indicator {
  background: var(--success-color);
  color: var(--text-inverse);
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  flex: 1;
}

.step-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-primary);
  margin: 0;
}

.wizard-step.active .step-title {
  color: var(--accent-color);
}

.wizard-step.completed .step-title {
  color: var(--success-color);
}

.step-description {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.wizard-step.disabled .step-title,
.wizard-step.disabled .step-description {
  opacity: 0.5;
}

/* Wizard Body */
.wizard-body {
  padding: 2rem;
  max-height: 60vh;
  overflow-y: auto;
  background: var(--bg-primary);
}

/* Mejoras para modo oscuro */
.dark-theme .wizard-body {
  background: var(--bg-primary);
}

.dark-theme .wizard-body::-webkit-scrollbar {
  width: 8px;
}

.dark-theme .wizard-body::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: 4px;
}

.dark-theme .wizard-body::-webkit-scrollbar-thumb {
  background: var(--border-primary);
  border-radius: 4px;
}

.dark-theme .wizard-body::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

.wizard-form {
  width: 100%;
}

.wizard-step-content {
  animation: fadeIn 0.3s ease;
}

.step-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--border-color);
}

.step-header .step-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.step-header .step-description {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Summary Content */
.summary-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.summary-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
}

.summary-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--border-color);
}

.summary-title i {
  color: var(--accent-color);
  font-size: 1.25rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
}

.summary-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.summary-label {
  font-weight: 600;
  color: var(--text-primary);
  min-width: 150px;
}

.summary-value {
  color: var(--text-secondary);
  text-align: right;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* Wizard Footer */
.wizard-footer {
  background: var(--bg-secondary);
  padding: 1rem 2rem;
  border-radius: 0 0 12px 12px;
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Mejoras para modo oscuro */
.dark-theme .wizard-footer {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-primary);
}

.wizard-progress {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.progress-bar {
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-color), #1d4ed8);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-text {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-align: center;
  font-weight: 500;
}

.wizard-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.wizard-btn {
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
}

.wizard-btn-primary {
  background: linear-gradient(135deg, var(--accent-color), #1d4ed8);
  color: var(--text-inverse);
  box-shadow: 0 4px 12px var(--focus-shadow);
}

.wizard-btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--focus-shadow);
}

.wizard-btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.wizard-btn-success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.wizard-btn-success:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.wizard-btn-success:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.wizard-btn-secondary {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.wizard-btn-secondary:hover:not(:disabled) {
  background: var(--bg-secondary);
  border-color: var(--border-hover);
}

/* Mejoras para modo oscuro */
.dark-theme .wizard-btn-secondary {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.dark-theme .wizard-btn-secondary:hover:not(:disabled) {
  background: var(--bg-tertiary);
  border-color: var(--border-hover);
}

.wizard-btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.wizard-btn-cancel {
  background: transparent;
  color: var(--text-secondary);
  border: none;
}

.wizard-btn-cancel:hover:not(:disabled) {
  color: var(--error-color);
  background: var(--error-bg);
}

.wizard-btn-cancel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* No Type Selected Message */
.no-type-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  background: var(--bg-secondary);
  border: 2px dashed var(--border-primary);
  border-radius: 8px;
}

/* Mejoras para modo oscuro */
.dark-theme .no-type-selected {
  background: var(--bg-secondary);
  border: 2px dashed var(--border-primary);
}

.no-type-icon {
  font-size: 3rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.no-type-text h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.no-type-text p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mejoras adicionales para modo oscuro */
.dark-theme .wizard-header {
  position: relative;
}

.dark-theme .wizard-header::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at center, rgba(96, 165, 250, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.dark-theme .wizard-step.active {
  background: rgba(96, 165, 250, 0.1);
  border: 1px solid rgba(96, 165, 250, 0.2);
}

.dark-theme .wizard-step.active .step-indicator {
  box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
}

.dark-theme .wizard-btn-primary {
  box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
}

.dark-theme .wizard-btn-primary:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(96, 165, 250, 0.4);
}

.dark-theme .progress-fill {
  box-shadow: 0 2px 8px rgba(96, 165, 250, 0.3);
}

/* Mejoras para elementos de formulario en modo oscuro */
.dark-theme .form-input,
.dark-theme .form-select,
.dark-theme .form-textarea {
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  color: var(--text-primary);
}

.dark-theme .form-input:focus,
.dark-theme .form-select:focus,
.dark-theme .form-textarea:focus {
  border-color: var(--input-focus);
  box-shadow: 0 0 0 3px var(--focus-shadow);
}

.dark-theme .form-label {
  color: var(--text-primary);
}

.dark-theme .form-help {
  color: var(--text-secondary);
}

.dark-theme .error-message {
  background: var(--error-bg);
  color: var(--error-text);
  border: 1px solid var(--error-light);
}

/* Mejoras para el resumen en modo oscuro */
.dark-theme .summary-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
}

.dark-theme .summary-title {
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-primary);
}

.dark-theme .summary-item {
  border-bottom: 1px solid var(--border-primary);
}

.dark-theme .summary-label {
  color: var(--text-primary);
}

.dark-theme .summary-value {
  color: var(--text-secondary);
}

/* Indicador de roles activos en el footer */
.active-roles-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg-tertiary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  flex-shrink: 0;
}

.indicator-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
}

.active-roles-list {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.active-role-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  white-space: nowrap;
  flex-shrink: 0;
}

.active-role-item.ROLE_SUPER_USER {
  background: var(--warning-bg, linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2)));
  border-color: var(--warning-color);
  color: var(--warning-color);
}

.active-role-item.ROLE_ADMIN {
  background: var(--bg-hover);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.active-role-item.ROLE_COLLABORATOR {
  background: var(--success-bg);
  border-color: var(--success-color);
  color: var(--success-color);
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  color: var(--warning-color);
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .wizard-header {
    padding: 1.5rem;
    min-height: 100px;
  }

  .wizard-title {
    font-size: 1.5rem;
  }

  .wizard-subtitle {
    font-size: 0.9rem;
  }

  .wizard-header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .wizard-title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    width: 100%;
  }

  .wizard-close-btn {
    align-self: flex-end;
    margin-top: 0;
  }

  .active-roles-indicator {
    margin-top: 0.75rem;
    padding: 0.5rem;
  }

  .active-roles-list {
    gap: 0.25rem;
  }

  .active-role-item {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }

  .wizard-icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }

  .wizard-title {
    line-height: 1.3;
  }

  .wizard-subtitle {
    line-height: 1.3;
  }

  .wizard-close-btn {
    width: 2rem;
    height: 2rem;
    font-size: 1rem;
  }

  .active-role-item {
    white-space: normal;
    word-wrap: break-word;
  }

  .wizard-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .active-roles-indicator {
    order: -1;
    justify-content: center;
    padding: 0.5rem;
  }

  .active-roles-list {
    justify-content: center;
  }

  .wizard-steps {
    flex-direction: column;
    padding: 1.5rem;
  }

  .wizard-step:not(:last-child)::after {
    display: none;
  }

  .wizard-body {
    padding: 1.5rem;
    max-height: 50vh;
  }

  .wizard-footer {
    padding: 1rem 1.5rem;
  }

  .wizard-actions {
    flex-direction: column-reverse;
  }

  .wizard-btn {
    width: 100%;
    justify-content: center;
  }

  .summary-item {
    flex-direction: column;
    gap: 0.5rem;
  }

  .summary-label {
    min-width: unset;
  }

  .summary-value {
    text-align: left;
    justify-content: flex-start;
  }
}

/* Estilos para SUPER_USER siempre presente */
.super-user-always-present {
  margin-bottom: 16px;
}

.super-user-option {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05));
  border: 2px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
  padding: 12px;
  position: relative;
}

.super-user-option::before {
  content: '✓';
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--success-color);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.super-user-option .role-label {
  color: var(--text-primary);
  font-weight: 500;
}

.super-user-option .role-name strong {
  color: var(--success-color);
}

.super-user-option .role-name small {
  color: var(--text-secondary);
  font-size: 11px;
  display: block;
  margin-top: 2px;
}

/* Mejoras para modo oscuro */
.dark-theme .super-user-option {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.08));
  border: 2px solid rgba(34, 197, 94, 0.4);
}

/* Estilos del Wizard - Idénticos a MenuManagerView.vue */
.wizard-header {
  background: var(--primary-color);
  color: white;
  padding: 2rem;
  border-radius: 12px 12px 0 0;
  position: relative;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Mejoras para modo oscuro */
.dark-theme .wizard-header {
  background: var(--primary-color);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.wizard-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  pointer-events: none;
  z-index: 0;
}

.dark-theme .wizard-header::before {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
}

.wizard-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  position: relative;
  z-index: 1;
  width: 100%;
}

.wizard-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.wizard-icon {
  width: 3rem;
  height: 3rem;
  background: var(--bg-overlay-medium, rgba(255, 255, 255, 0.2));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--text-inverse);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.wizard-text {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.wizard-text h2,
.wizard-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-inverse);
  line-height: 1.2;
}

.wizard-subtitle {
  font-size: 1rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
  font-weight: 400;
}

.wizard-close-btn {
  background: var(--bg-overlay-medium, rgba(255, 255, 255, 0.2));
  border: none;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-inverse);
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.wizard-close-btn:hover:not(:disabled) {
  background: var(--bg-overlay-light, rgba(255, 255, 255, 0.3));
  transform: scale(1.05);
}

.wizard-close-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.step-header {
  text-align: center;
  margin-bottom: 2rem;
}

.step-header .step-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.step-header .step-description {
  color: var(--text-secondary);
  font-size: 1rem;
}

/* Estilos específicos para iconos - Idénticos a MenuManagerView.vue */
.step-header .step-title i {
  color: var(--accent-primary);
  font-size: 1.25rem;
  margin-right: 0.5rem;
}

.form-label i {
  color: var(--accent-primary);
  font-size: 1.25rem;
  margin-right: 0.5rem;
}

/* Responsive para el wizard */
@media (max-width: 768px) {
  .wizard-header {
    padding: 1rem 1.5rem;
  }

  .wizard-header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .wizard-title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    width: 100%;
  }

  .wizard-close-btn {
    align-self: flex-end;
    margin-top: 0;
    width: 2rem;
    height: 2rem;
    font-size: 1rem;
  }

  .wizard-icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }

  .wizard-title {
    font-size: 1.5rem;
    line-height: 1.3;
  }

  .wizard-subtitle {
    font-size: 0.9rem;
    line-height: 1.3;
  }
}

/* Mejoras adicionales para modo oscuro */
.dark-theme .wizard-header {
  position: relative;
}

.dark-theme .wizard-header::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at center, rgba(96, 165, 250, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.dark-theme .super-user-option .role-label {
  color: var(--text-primary);
}

.dark-theme .super-user-option .role-name strong {
  color: var(--success-color);
}

.dark-theme .super-user-option .role-name small {
  color: var(--text-secondary);
}
</style>
