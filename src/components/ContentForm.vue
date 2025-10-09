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

      <!-- Contenido del formulario -->
      <div class="modal-body">
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
                  <option value="TEXT">📄 Texto/Markdown</option>
                  <option value="URL">🔗 Enlace/URL</option>
                  <option value="PDF">📋 Documento PDF</option>
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
                </label>
                <input
                  id="documentSlug"
                  v-model="form.slug"
                  type="text"
                  class="form-input"
                  :class="{ error: validationErrors.slug }"
                  placeholder="Ej: reglamentos, manuales, guias"
                  @input="validateField('slug')"
                  :disabled="isSaving"
                />
                <div class="form-help">
                  Organiza tus documentos en slugs para facilitar la navegación
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
                    {{ form.type === 'TEXT' ? 'Escribe el contenido en formato Markdown' :
                       form.type === 'URL' ? 'Ingresa la URL del contenido' :
                       form.type === 'PDF' ? 'Ingresa la URL del documento PDF' :
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

              <!-- Contenido TEXT/Markdown -->
              <div v-else-if="form.type === 'TEXT'" class="content-editor">
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
                    <div class="preview-content" v-html="renderedMarkdown"></div>
                    <div v-if="!form.content" class="preview-empty">
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
                      <div class="preview-content split-preview-content" v-html="renderedMarkdown"></div>
                      <div v-if="!form.content" class="preview-empty">
                        <i class="mdi mdi-eye-outline"></i>
                        <p>Escribe algo en el editor para ver la vista previa</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Contenido URL -->
              <div v-else-if="form.type === 'URL'" class="url-input">
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
                <div class="url-preview" v-if="form.content && isValidUrl(form.content)">
                  <div class="preview-header">
                    <i class="mdi mdi-eye-outline"></i>
                    Vista previa del enlace
                  </div>
                  <div class="preview-content">
                    <a :href="form.content" target="_blank" rel="noopener noreferrer" class="preview-link">
                      {{ form.content }}
                      <i class="mdi mdi-open-in-new"></i>
                    </a>
                  </div>
                </div>
              </div>

              <!-- Contenido PDF -->
              <div v-else-if="form.type === 'PDF'" class="pdf-input">
                <div class="input-container">
                  <div class="input-icon">
                    <i class="mdi mdi-file-pdf-box"></i>
                  </div>
                  <input
                    v-model="form.content"
                    type="url"
                    class="form-input"
                    :class="{ error: validationErrors.content }"
                    placeholder="https://ejemplo.com/documento.pdf"
                    @input="validateField('content')"
                    required
                    :disabled="isSaving"
                  />
                </div>
                <div class="pdf-preview" v-if="form.content && isValidUrl(form.content)">
                  <div class="preview-header">
                    <i class="mdi mdi-file-pdf-box"></i>
                    Vista previa del PDF
                  </div>
                  <div class="preview-content">
                    <iframe
                      :src="form.content"
                      class="pdf-viewer"
                      frameborder="0"
                      sandbox="allow-same-origin allow-scripts"
                    ></iframe>
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

            <div class="form-group">
              <label for="documentRoles" class="form-label">
                <i class="mdi mdi-account-group-outline"></i>
                Roles con Acceso
              </label>
              <div class="roles-selector">
                <div class="role-options">
                  <label v-for="role in roleOptions" :key="role.value" class="role-option">
                    <input
                      type="checkbox"
                      :value="role.value"
                      v-model="form.roles"
                      :id="`role-${role.value}`"
                      class="role-checkbox"
                    />
                    <span class="role-label">
                      <i :class="role.icon"></i>
                      {{ role.title }}
                    </span>
                  </label>
                </div>
              </div>
              <div class="form-help">
                Selecciona los roles que pueden acceder a este documento
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

// Editor de Markdown
const activeTab = ref('edit')
const isFullscreen = ref(false)

// Document types and roles
const roleOptions = [
  { title: 'Administrador', value: 'ROLE_ADMIN', icon: 'mdi-shield-crown' },
  { title: 'Super Usuario', value: 'ROLE_SUPER_USER', icon: 'mdi-shield-star' },
  { title: 'Usuario', value: 'ROLE_USER', icon: 'mdi-account' },
  { title: 'Estudiante', value: 'ROLE_STUDENT', icon: 'mdi-school' },
  { title: 'Profesor', value: 'ROLE_TEACHER', icon: 'mdi-teach' }
]

// Computed
const isEditing = computed(() => !!props.document)

// Renderizar Markdown
const renderedMarkdown = computed(() => {
  if (!form.value.content) return ''
  
  try {
    // Configurar marked para renderizado seguro
    marked.setOptions({
      breaks: true,
      gfm: true,
      sanitize: false,
      smartLists: true,
      smartypants: true
    })
    
    return marked(form.value.content)
  } catch (error) {
    console.error('Error renderizando Markdown:', error)
    return '<p>Error al renderizar el Markdown</p>'
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
      if (value && value.length > 50) {
        validationErrors.value.slug = 'El slug no puede exceder 50 caracteres'
      } else {
        delete validationErrors.value.slug
      }
      break

    case 'content':
      if (!value || value.trim().length === 0) {
        validationErrors.value.content = 'El contenido es obligatorio'
      } else if ((form.value.type === 'URL' || form.value.type === 'PDF') && !isValidUrl(value)) {
        validationErrors.value.content = 'Debe ser una URL válida'
      } else if (value.length > 10000) {
        validationErrors.value.content = 'El contenido no puede exceder 10,000 caracteres'
      } else {
        delete validationErrors.value.content
      }
      break
  }
}

const validateForm = () => {
  validateField('name')
  validateField('type')
  validateField('slug')
  validateField('content')
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
    form.value = {
      name: props.document.name || '',
      type: props.document.type || '',
      slug: props.document.slug || '',
      content: props.document.content || '',
      icon: props.document.icon || '',
      roles: props.document.roles || []
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

  try {
    const documentData = {
      name: form.value.name,
      type: form.value.type,
      slug: form.value.slug,
      content: form.value.content,
      icon: form.value.icon || (form.value.type === 'TEXT' ? 'mdi-file-document' :
                                form.value.type === 'URL' ? 'mdi-link' :
                                form.value.type === 'PDF' ? 'mdi-file-pdf-box' : 'mdi-file'),
      roles: form.value.roles.length > 0 ? form.value.roles : ['ROLE_ADMIN']
    }

    console.log('📄 [CONTENT FORM] Datos del documento:', documentData)

    if (isEditing.value) {
      console.log('📄 [CONTENT FORM] Actualizando documento existente...')
      await documentService.updateDocument(props.document.id, documentData)
      console.log('✅ [CONTENT FORM] Documento actualizado exitosamente')
    } else {
      console.log('📄 [CONTENT FORM] Creando nuevo documento...')
      await documentService.createDocument(documentData)
      console.log('✅ [CONTENT FORM] Documento creado exitosamente')
    }

    emit('saved')
    handleClose()

  } catch (error) {
    console.error('❌ [CONTENT FORM] Error guardando documento:', error)
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
</script>

<style scoped>
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

/* URL Input */
.url-input {
  animation: fadeInUp 0.3s ease-out;
}

/* PDF Input */
.pdf-input {
  animation: fadeInUp 0.3s ease-out;
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
</style>
