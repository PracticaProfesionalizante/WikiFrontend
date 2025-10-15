<template>
  <div class="modal-overlay" v-if="dialog" @click="handleClose">
    <div class="modal-container" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <div class="header-content">
          <div class="header-left">
            <div class="header-icon">
              <i :class="isEditing ? 'mdi mdi-pencil' : 'mdi mdi-plus'"></i>
            </div>
            <div class="header-text">
              <h2 class="modal-title">
                {{ isEditing ? 'Editar Documento' : 'Crear Nuevo Documento' }}
              </h2>
              <p class="modal-subtitle">
                {{ isEditing ? 'Modifica la información del documento' : 'Completa los datos para crear un nuevo documento' }}
              </p>
            </div>
          </div>
          <button @click="handleClose" class="close-btn" :disabled="isSaving">
            <i class="mdi mdi-close"></i>
          </button>
        </div>
      </div>

      <!-- Indicador de carga -->
      <div v-if="loading" class="form-loading">
        <div class="loading-spinner"></div>
        <p>Cargando datos del documento...</p>
      </div>

      <!-- Contenido del formulario -->
      <div v-else class="modal-body">
        <form @submit.prevent="handleSubmit" class="document-form">
          <!-- Información básica -->
          <div class="form-section">
            <div class="section-header">
              <div class="section-icon">
                <i class="mdi mdi-information-outline"></i>
              </div>
              <div class="section-title-content">
                <h3 class="section-title">Información Básica</h3>
                <p class="section-description">Datos principales del documento</p>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="documentName" class="form-label">
                  <i class="mdi mdi-file-document-outline"></i>
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
                  <i class="mdi mdi-alert-circle"></i>
                  {{ validationErrors.name }}
                </div>
              </div>

              <div class="form-group">
                <label for="documentType" class="form-label">
                  <i class="mdi mdi-format-list-bulleted-type"></i>
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
                  <i class="mdi mdi-alert-circle"></i>
                  {{ validationErrors.type }}
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="documentSlug" class="form-label">
                  <i class="mdi mdi-folder-outline"></i>
                  Slug
                  <span class="required">*</span>
                </label>
                <input
                  id="documentSlug"
                  v-model="form.slug"
                  type="text"
                  class="form-input"
                  :class="{ error: validationErrors.slug }"
                  placeholder="ejemplo-de-slug"
                  @input="validateField('slug')"
                  :disabled="isSaving"
                  required
                />
                <div class="form-help">
                  <i class="mdi mdi-information"></i>
                  Organiza tus documentos en slugs para facilitar la navegación. Solo letras minúsculas, números y guiones.
                  <button
                    type="button"
                    class="slug-regenerate-btn"
                    @click="regenerateSlug"
                    :disabled="isSaving || !form.name"
                    title="Regenerar slug único basado en el nombre"
                  >
                    <i class="mdi mdi-refresh"></i>
                    Generar Único
                  </button>
                </div>

                <!-- Opciones de slug alternativas -->
                <div v-if="slugAlternatives.length > 0" class="slug-alternatives">
                  <div class="slug-alternatives-header">
                    <i class="mdi mdi-lightbulb"></i>
                    <span>Slugs alternativos disponibles:</span>
                  </div>
                  <div class="slug-alternatives-list">
                    <button
                      v-for="(alternative, index) in slugAlternatives"
                      :key="index"
                      type="button"
                      class="slug-alternative-btn"
                      @click="selectSlugAlternative(alternative)"
                      :disabled="isSaving"
                    >
                      <i class="mdi mdi-check"></i>
                      {{ alternative }}
                    </button>
                  </div>
                </div>
                <div v-if="validationErrors.slug" class="error-message">
                  <i class="mdi mdi-alert-circle"></i>
                  {{ validationErrors.slug }}
                </div>
              </div>

              <div class="form-group">
                <label for="documentIcon" class="form-label">
                  <i class="mdi mdi-palette"></i>
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

            <!-- Contenido del documento -->
            <div class="form-section">
              <div class="section-header">
                <div class="section-icon">
                  <i class="mdi mdi-content-save-outline"></i>
                </div>
                <div class="section-title-content">
                  <h3 class="section-title">Contenido del Documento</h3>
                  <p class="section-description">
                    {{ form.type === 'TYPE_TEXT' ? 'Escribe el contenido en formato Markdown' :
                       form.type === 'TYPE_URL' ? 'Ingresa la URL del contenido' :
                       form.type === 'TYPE_PDF' ? 'Sube el archivo PDF del documento' :
                       'Selecciona el tipo de documento primero' }}
                  </p>
                </div>
              </div>

              <!-- Mensaje cuando no hay tipo seleccionado -->
              <div v-if="!form.type" class="no-type-selected">
                <div class="no-type-icon">
                  <i class="mdi mdi-help-circle-outline"></i>
                </div>
                <div class="no-type-text">
                  <h4>Selecciona un tipo de documento</h4>
                  <p>Elige entre Texto/Markdown, URL o PDF para continuar</p>
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
                      <i class="mdi mdi-pencil"></i>
                      Editar
                    </button>
                    <button
                      type="button"
                      class="tab-btn"
                      :class="{ active: activeTab === 'preview' }"
                      @click="activeTab = 'preview'"
                    >
                      <i class="mdi mdi-eye"></i>
                      Vista Previa
                    </button>
                    <button
                      type="button"
                      class="tab-btn"
                      :class="{ active: activeTab === 'split' }"
                      @click="activeTab = 'split'"
                    >
                      <i class="mdi mdi-view-split-horizontal"></i>
                      Dividir
                    </button>
                  </div>
                  <div class="editor-actions">
                    <button
                      type="button"
                      class="action-btn"
                      @click="toggleFullscreen"
                      title="Pantalla completa"
                    >
                      <i class="mdi mdi-fullscreen"></i>
                    </button>
                  </div>
                </div>

                <div class="editor-content" :class="{ 'fullscreen': isFullscreen }">
                  <!-- Modo Editar -->
                  <div v-if="activeTab === 'edit'" class="editor-panel">
                    <div class="editor-toolbar">
                      <div class="toolbar-group">
                        <button type="button" class="toolbar-btn" @click="insertMarkdown('**', '**')" title="Negrita">
                          <i class="mdi mdi-format-bold"></i>
                        </button>
                        <button type="button" class="toolbar-btn" @click="insertMarkdown('*', '*')" title="Cursiva">
                          <i class="mdi mdi-format-italic"></i>
                        </button>
                        <button type="button" class="toolbar-btn" @click="insertMarkdown('# ', '')" title="Título">
                          <i class="mdi mdi-format-header-1"></i>
                        </button>
                        <button type="button" class="toolbar-btn" @click="insertMarkdown('## ', '')" title="Subtítulo">
                          <i class="mdi mdi-format-header-2"></i>
                        </button>
                      </div>
                      <div class="toolbar-group">
                        <button type="button" class="toolbar-btn" @click="insertMarkdown('- ', '')" title="Lista">
                          <i class="mdi mdi-format-list-bulleted"></i>
                        </button>
                        <button type="button" class="toolbar-btn" @click="insertMarkdown('1. ', '')" title="Lista numerada">
                          <i class="mdi mdi-format-list-numbered"></i>
                        </button>
                        <button type="button" class="toolbar-btn" @click="insertMarkdown('> ', '')" title="Cita">
                          <i class="mdi mdi-format-quote-close"></i>
                        </button>
                      </div>
                      <div class="toolbar-group">
                        <button type="button" class="toolbar-btn" @click="insertMarkdown('`', '`')" title="Código">
                          <i class="mdi mdi-code-tags"></i>
                        </button>
                        <button type="button" class="toolbar-btn" @click="insertMarkdown('[', '](url)')" title="Enlace">
                          <i class="mdi mdi-link"></i>
                        </button>
                        <button type="button" class="toolbar-btn" @click="insertMarkdown('```\n', '\n```')" title="Bloque de código">
                          <i class="mdi mdi-code-braces"></i>
                        </button>
                      </div>
                    </div>
                    <textarea
                      v-model="form.content"
                      class="markdown-editor"
                      :class="{ error: validationErrors.content }"
                      placeholder="Escribe tu contenido en Markdown aquí..."
                      @input="validateField('content')"
                      required
                      :disabled="isSaving"
                      rows="15"
                    ></textarea>
                    <div class="editor-footer">
                      <span class="char-count">{{ form.content?.length || 0 }} caracteres</span>
                      <span class="markdown-help">
                        <i class="mdi mdi-help-circle-outline"></i>
                        Usa Markdown para formatear tu contenido
                      </span>
                    </div>
                  </div>

                  <!-- Modo Vista Previa -->
                  <div v-else-if="activeTab === 'preview'" class="preview-panel">
                    <div v-if="form.content" class="preview-content" v-html="renderedMarkdown"></div>
                    <div v-else class="preview-empty">
                      <i class="mdi mdi-eye-outline"></i>
                      <p>Escribe algo en el editor para ver la vista previa</p>
                    </div>
                  </div>

                  <!-- Modo Dividir -->
                  <div v-else-if="activeTab === 'split'" class="split-panel">
                    <div class="split-editor">
                      <div class="split-header">
                        <i class="mdi mdi-pencil"></i>
                        <span>Editor</span>
                      </div>
                      <textarea
                        v-model="form.content"
                        class="markdown-editor split-textarea"
                        :class="{ error: validationErrors.content }"
                        placeholder="Escribe tu contenido en Markdown aquí..."
                        @input="validateField('content')"
                        required
                        :disabled="isSaving"
                      ></textarea>
                    </div>
                    <div class="split-divider"></div>
                    <div class="split-preview">
                      <div class="split-header">
                        <i class="mdi mdi-eye"></i>
                        <span>Vista Previa</span>
                      </div>
                      <div class="preview-content split-preview-content" v-if="form.content" v-html="renderedMarkdown"></div>
                      <div v-else class="preview-empty">
                        <i class="mdi mdi-eye-outline"></i>
                        <p>Escribe algo en el editor para ver la vista previa</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Contenido URL -->
              <div v-else-if="form.type === 'TYPE_URL'" class="url-editor">
                <div class="editor-header">
                  <div class="editor-tabs">
                    <button
                      type="button"
                      class="tab-btn"
                      :class="{ active: activeTab === 'edit' }"
                      @click="activeTab = 'edit'"
                    >
                      <i class="mdi mdi-pencil"></i>
                      Editar URL
                    </button>
                    <button
                      type="button"
                      class="tab-btn"
                      :class="{ active: activeTab === 'preview' }"
                      @click="activeTab = 'preview'"
                    >
                      <i class="mdi mdi-eye"></i>
                      Vista Previa
                    </button>
                  </div>
                </div>

                <div class="editor-content">
                  <!-- Modo Editar URL -->
                  <div v-if="activeTab === 'edit'" class="editor-panel">
                    <div class="input-container">
                      <div class="input-icon">
                        <i class="mdi mdi-link-variant"></i>
                      </div>
                      <input
                        v-model="form.content"
                        type="url"
                        class="form-input"
                        :class="{ error: validationErrors.content }"
                        placeholder="https://ejemplo.com/documento"
                        @input="validateField('content')"
                        required
                        :disabled="isSaving"
                      />
                    </div>
                    <div class="editor-footer">
                      <span class="char-count">{{ form.content?.length || 0 }} caracteres</span>
                      <span class="url-help">
                        <i class="mdi mdi-help-circle-outline"></i>
                        Ingresa una URL válida para el contenido
                      </span>
                    </div>
                  </div>

                  <!-- Modo Vista Previa URL -->
                  <div v-else-if="activeTab === 'preview'" class="preview-panel">
                    <div v-if="form.content && isValidUrl(form.content)" class="preview-content">
                      <div class="url-preview-card">
                        <div class="preview-header">
                          <i class="mdi mdi-link-variant"></i>
                          <span>Vista previa del enlace</span>
                        </div>
                        <div class="preview-body">
                          <div class="url-info">
                            <div class="url-title">{{ getUrlTitle(form.content) }}</div>
                            <div class="url-domain">{{ getUrlDomain(form.content) }}</div>
                          </div>
                          <a :href="form.content" target="_blank" rel="noopener noreferrer" class="preview-link">
                            <i class="mdi mdi-open-in-new"></i>
                            Abrir enlace
                          </a>
                        </div>
                      </div>
                    </div>
                    <div v-else class="preview-empty">
                      <i class="mdi mdi-link-variant"></i>
                      <p>Ingresa una URL válida para ver la vista previa</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Contenido PDF -->
              <div v-else-if="form.type === 'TYPE_PDF'" class="pdf-editor">
                <div class="file-upload-container">
                  <div class="file-upload-area" :class="{ 'has-file': pdfFile, 'error': validationErrors.content }">
                    <input
                      ref="fileInput"
                      type="file"
                      accept=".pdf"
                      @change="handleFileSelect"
                      class="file-input"
                      :disabled="isSaving"
                    />

                    <div v-if="!pdfFile" class="upload-placeholder">
                      <div class="upload-icon">
                        <i class="mdi mdi-cloud-upload"></i>
                      </div>
                      <div class="upload-text">
                        <h4>Subir archivo PDF</h4>
                        <p>Arrastra y suelta tu archivo PDF aquí o haz clic para seleccionar</p>
                        <p class="upload-hint">Formatos aceptados: .pdf (máximo 10MB)</p>
                      </div>
                    </div>

                    <div v-else class="file-selected">
                      <div class="file-icon">
                        <i class="mdi mdi-file-pdf-box"></i>
                      </div>
                      <div class="file-info">
                        <div class="file-name">{{ pdfFile.name }}</div>
                        <div class="file-size">{{ formatFileSize(pdfFile.size) }}</div>
                      </div>
                      <button
                        type="button"
                        @click="removeFile"
                        class="remove-file-btn"
                        :disabled="isSaving"
                      >
                        <i class="mdi mdi-close"></i>
                      </button>
                    </div>
                  </div>

                  <div v-if="pdfFile" class="file-actions">
                    <button
                      type="button"
                      @click="previewPdf"
                      class="action-btn preview-btn"
                      :disabled="isSaving"
                    >
                      <i class="mdi mdi-eye"></i>
                      Vista Previa
                    </button>
                    <button
                      type="button"
                      @click="openFileDialog"
                      class="action-btn change-btn"
                      :disabled="isSaving"
                    >
                      <i class="mdi mdi-file-replace"></i>
                      Cambiar Archivo
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="validationErrors.content" class="error-message">
                <i class="mdi mdi-alert-circle"></i>
                {{ validationErrors.content }}
              </div>
            </div>

          <!-- Configuración de acceso -->
          <div class="form-section">
            <div class="section-header">
              <div class="section-icon">
                <i class="mdi mdi-shield-account"></i>
              </div>
              <div class="section-title-content">
                <h3 class="section-title">Configuración de Acceso</h3>
                <p class="section-description">Define quién puede acceder a este documento</p>
              </div>
            </div>

            <!-- Roles de Acceso -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <i class="mdi mdi-account-key"></i>
                  Roles de Acceso
                  <span class="required">*</span>
                </label>
                <fieldset class="roles-selector">
                  <legend class="sr-only">
                    Seleccionar roles que pueden acceder a este documento
                  </legend>
                  <div v-for="role in availableRolesList" :key="role.value" class="role-option">
                    <label class="checkbox-label">
                      <input
                        v-model="form.roles"
                        :value="role.value"
                        type="checkbox"
                        class="form-checkbox"
                        :id="`role-${role.value}`"
                        :aria-describedby="`role-${role.value}-desc`"
                        :disabled="isSaving"
                      />
                      <span class="checkbox-text">
                        <i :class="['mdi', role.icon]"></i>
                        {{ role.label }}
                      </span>
                    </label>
                    <div class="role-description" :id="`role-${role.value}-desc`">
                      {{ role.description }}
                    </div>
                  </div>
                </fieldset>
                <div class="form-help">
                  Selecciona los roles que pueden acceder a este documento
                </div>
                <div v-if="validationErrors.roles" class="error-message">
                  <i class="mdi mdi-alert-circle"></i>
                  {{ validationErrors.roles }}
                </div>
              </div>
            </div>
          </div>

          <!-- Acciones del formulario -->
          <div class="form-actions">
            <button
              type="button"
              class="btn btn-secondary"
              @click="handleClose"
              :disabled="isSaving"
            >
              <i class="mdi mdi-close"></i>
              Cancelar
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="!isFormValid || isSaving"
            >
              <i v-if="isSaving" class="mdi mdi-loading mdi-spin"></i>
              <i v-else :class="isEditing ? 'mdi mdi-content-save' : 'mdi mdi-plus'"></i>
              {{ isSaving ? 'Guardando...' : (isEditing ? 'Actualizar Documento' : 'Crear Documento') }}
            </button>
          </div>
        </form>
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
    default: false
  },
  document: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'saved', 'close'])

// Reactive data
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const form = ref({
  name: '',
  type: '',
  slug: '',
  content: '',
  icon: '',
  roles: []
})

const validationErrors = ref({})
const isSaving = ref(false)
const slugAlternatives = ref([])

// Editor de Markdown
const activeTab = ref('edit')
const isFullscreen = ref(false)

// PDF File Upload
const pdfFile = ref(null)
const fileInput = ref(null)
const pdfPreviewUrl = ref(null)

// Computed
const isEditing = computed(() => !!props.document)

// Renderizar Markdown
const renderedMarkdown = computed(() => {
  console.log('📝 [MARKDOWN] Computed ejecutado, contenido:', form.value.content ? 'Sí' : 'No')

  if (!form.value.content || form.value.content.trim() === '') {
    console.log('📝 [MARKDOWN] No hay contenido para renderizar')
    return ''
  }

  try {
    console.log('📝 [MARKDOWN] Renderizando contenido:', form.value.content.substring(0, 100) + '...')

    // Configurar marked para renderizado seguro
    const options = {
      breaks: true,
      gfm: true,
      smartLists: true,
      smartypants: true
    }

    // Usar la API correcta de marked v16
    const result = marked(form.value.content, options)
    console.log('📝 [MARKDOWN] Resultado renderizado:', result.substring(0, 100) + '...')
    console.log('📝 [MARKDOWN] Longitud del resultado:', result.length)

    return result
  } catch (error) {
    console.error('❌ [MARKDOWN] Error renderizando Markdown:', error)
    console.error('❌ [MARKDOWN] Contenido que causó el error:', form.value.content)
    return '<div class="markdown-error"><p>❌ Error al renderizar el Markdown</p><pre>' + error.message + '</pre></div>'
  }
})

const isFormValid = computed(() => {
  return form.value.name &&
         form.value.type &&
         form.value.content &&
         Object.keys(validationErrors.value).length === 0
})

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
        validationErrors.value.slug = 'El slug solo puede contener letras minúsculas, números y guiones'
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
  validateField('slug')
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
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
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

const insertMarkdown = (before, after = '') => {
  const textarea = document.querySelector('.markdown-editor')
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = form.value.content.substring(start, end)

  const newText = before + selectedText + after
  const newContent = form.value.content.substring(0, start) + newText + form.value.content.substring(end)

  form.value.content = newContent

  // Restaurar posición del cursor
  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
  })
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
  // Limpiar errores previos
  validationErrors.value.content = null

  // Validar tipo de archivo
  if (file.type !== 'application/pdf') {
    validationErrors.value.content = 'Solo se permiten archivos PDF'
    return false
  }

  // Validar tamaño (10MB máximo)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    validationErrors.value.content = 'El archivo PDF no puede ser mayor a 10MB'
    return false
  }

  // Archivo válido
  pdfFile.value = file
  form.value.content = file.name // Usar el nombre del archivo como contenido

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
    formData.append('icon', form.value.icon || 'mdi-file-pdf-box')

    // Enviar roles como array individual, no como JSON string
    form.value.roles.forEach(role => {
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
const availableRolesList = [
  {
    value: 'SUPER_USER',
    label: 'Super Usuario',
    icon: 'mdi-account-star',
    description: 'Acceso completo al sistema',
  },
  {
    value: 'ADMIN',
    label: 'Administrador',
    icon: 'mdi-account-key',
    description: 'Gestión de usuarios y configuración',
  },
  {
    value: 'COLLABORATOR',
    label: 'Colaborador',
    icon: 'mdi-account-group',
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
    roles: []
  }
  validationErrors.value = {}
}

const loadDocumentData = () => {
  if (props.document) {
    console.log('📄 [CONTENT FORM] Documento cargado para edición:', props.document?.name || 'Sin nombre')
    console.log('📄 [CONTENT FORM] Roles del documento:', props.document.roles)

    // Limpiar roles para remover prefijo ROLE_ si existe
    const cleanRoles = (props.document.roles || []).map(role => {
      if (typeof role === 'string' && role.startsWith('ROLE_')) {
        return role.substring(5) // Remover 'ROLE_' (5 caracteres)
      }
      return role
    })

    console.log('📄 [CONTENT FORM] Roles limpios:', cleanRoles)

    form.value = {
      name: props.document.name || '',
      type: props.document.type || '',
      slug: props.document.slug || '',
      content: props.document.content || '',
      icon: props.document.icon || '',
      roles: cleanRoles
    }
  } else {
    resetForm()
  }
}

const handleSubmit = async () => {
  console.log('📄 [CONTENT FORM] Enviando formulario...')

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
      slug: form.value.slug?.trim() || '',
      status: true, // Campo requerido por el backend
      content: form.value.content.trim(),
      icon: form.value.icon || (form.value.type === 'TYPE_TEXT' ? 'mdi-file-document' :
                                form.value.type === 'TYPE_URL' ? 'mdi-link' :
                                form.value.type === 'TYPE_PDF' ? 'mdi-file-pdf-box' : 'mdi-file'),
      roles: form.value.roles.length > 0 ? form.value.roles : []
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
    console.log('📄 [CONTENT FORM] Roles disponibles:', availableRolesList.map(r => r.value))

    // Verificar que no hay prefijos ROLE_ duplicados
    const hasDuplicatePrefix = documentData.roles.some(role =>
      typeof role === 'string' && role.startsWith('ROLE_ROLE_')
    )
    console.log('📄 [CONTENT FORM] ¿Tiene prefijos duplicados?', hasDuplicatePrefix)

    if (hasDuplicatePrefix) {
      console.warn('⚠️ [CONTENT FORM] Detectados roles con prefijo ROLE_ duplicado:', documentData.roles)
    }

    // Agregar el ID al documentData para el emit
    const documentDataWithId = {
      ...documentData,
      id: isEditing.value ? props.document.id : undefined
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
      console.log('🔍 [CONTENT FORM] Debug - Condición PDF:', documentData.type === 'TYPE_PDF' && pdfFile.value)

      if (documentData.type === 'TYPE_PDF' && pdfFile.value) {
        console.log('📄 [CONTENT FORM] Creando documento PDF con archivo...')
        const createdDocument = await documentService.createDocumentWithFile(documentData, pdfFile.value)
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
    if (error.response?.status === 422 && error.response?.data?.detail?.includes('slug') && error.response?.data?.detail?.includes('ya existe')) {
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
          slug: newSlug
        }

        let createdDocumentId = null

        if (isEditing.value) {
          await documentService.updateDocument(props.document.id, newDocumentData)
        } else {
          // Para documentos PDF, usar el endpoint específico de creación con archivo
          if (newDocumentData.type === 'TYPE_PDF' && pdfFile.value) {
            console.log('📄 [CONTENT FORM] Reintentando creación de documento PDF con archivo...')
            const createdDocument = await documentService.createDocumentWithFile(newDocumentData, pdfFile.value)
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
          id: isEditing.value ? props.document.id : createdDocumentId
        }

        console.log('📄 [CONTENT FORM] Emitiendo evento saved con ID (slug único):', newDocumentDataWithId.id)
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
  resetForm()
  emit('close')
}

// Watchers
watch(() => props.document, loadDocumentData, { immediate: true })
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    loadDocumentData()
  }
})

// Watcher para generar slug automáticamente cuando cambie el nombre
watch(() => form.value.name, (newName) => {
  if (newName && !form.value.slug) {
    form.value.slug = generateSlug(newName)
    validateField('slug')
  }
})

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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
}

.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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
</style>
