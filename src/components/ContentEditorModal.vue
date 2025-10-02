<template>
  <div v-if="modelValue" class="modal-overlay" @click="closeModal">
    <div class="editor-modal" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">
          <i :class="isEditing ? 'mdi mdi-pencil' : 'mdi mdi-plus'"></i>
          {{ isEditing ? 'Editar Contenido' : 'Crear Contenido' }}
        </h2>
        <button @click="closeModal" class="modal-close-btn">
          <i class="mdi mdi-close"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit" class="editor-form">
          <!-- Step Indicator -->
          <div class="step-indicator">
            <div
              v-for="(step, index) in steps"
              :key="index"
              :class="['step-item', {
                active: currentStep === index + 1,
                completed: currentStep > index + 1
              }]"
            >
              <div class="step-number">
                <i v-if="currentStep > index + 1" class="mdi mdi-check"></i>
                <span v-else>{{ index + 1 }}</span>
              </div>
              <span class="step-label">{{ step.label }}</span>
            </div>
          </div>

          <!-- Step 1: Basic Information -->
          <div v-show="currentStep === 1" class="form-step">
            <h3 class="step-title">
              <i class="mdi mdi-information-outline"></i>
              Información Básica
            </h3>

            <div class="form-grid">
              <div class="form-group full-width">
                <label class="form-label required">Título del Contenido</label>
                <input
                  v-model="formData.title"
                  type="text"
                  class="form-input"
                  placeholder="Ingresa el título del contenido..."
                  required
                  @input="validateField('title')"
                />
                <div v-if="errors.title" class="field-error">
                  <i class="mdi mdi-alert-circle"></i>
                  {{ errors.title }}
                </div>
              </div>

              <div class="form-group">
                <label class="form-label required">Tipo de Contenido</label>
                <select
                  v-model="formData.type"
                  class="form-select"
                  required
                  @change="validateField('type')"
                >
                  <option value="">Selecciona un tipo</option>
                  <option value="Página">Página</option>
                  <option value="Artículo">Artículo</option>
                  <option value="Categoría">Categoría</option>
                  <option value="Noticia">Noticia</option>
                </select>
                <div v-if="errors.type" class="field-error">
                  <i class="mdi mdi-alert-circle"></i>
                  {{ errors.type }}
                </div>
              </div>

              <div class="form-group">
                <label class="form-label required">Estado</label>
                <select
                  v-model="formData.status"
                  class="form-select"
                  required
                >
                  <option value="Borrador">Borrador</option>
                  <option value="Publicado">Publicado</option>
                  <option value="Archivado">Archivado</option>
                </select>
              </div>

              <div class="form-group full-width">
                <label class="form-label">Descripción Corta</label>
                <textarea
                  v-model="formData.description"
                  class="form-textarea"
                  rows="3"
                  placeholder="Breve descripción del contenido (opcional)..."
                  maxlength="300"
                ></textarea>
                <div class="character-count">
                  {{ formData.description?.length || 0 }}/300
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Autor</label>
                <input
                  v-model="formData.author"
                  type="text"
                  class="form-input"
                  placeholder="Nombre del autor..."
                />
              </div>

              <div class="form-group">
                <label class="form-label">Fecha de Publicación</label>
                <input
                  v-model="formData.publishDate"
                  type="datetime-local"
                  class="form-input"
                />
              </div>
            </div>
          </div>

          <!-- Step 2: Content Editor -->
          <div v-show="currentStep === 2" class="form-step">
            <h3 class="step-title">
              <i class="mdi mdi-file-document-edit"></i>
              Editor de Contenido
            </h3>

            <div class="content-editor">
              <div class="editor-toolbar">
                <div class="toolbar-group">
                  <button
                    type="button"
                    @click="formatText('bold')"
                    :class="['toolbar-btn', { active: isFormatActive('bold') }]"
                    title="Negrita"
                  >
                    <i class="mdi mdi-format-bold"></i>
                  </button>
                  <button
                    type="button"
                    @click="formatText('italic')"
                    :class="['toolbar-btn', { active: isFormatActive('italic') }]"
                    title="Cursiva"
                  >
                    <i class="mdi mdi-format-italic"></i>
                  </button>
                  <button
                    type="button"
                    @click="formatText('underline')"
                    :class="['toolbar-btn', { active: isFormatActive('underline') }]"
                    title="Subrayado"
                  >
                    <i class="mdi mdi-format-underline"></i>
                  </button>
                </div>

                <div class="toolbar-separator"></div>

                <div class="toolbar-group">
                  <button
                    type="button"
                    @click="formatText('justifyLeft')"
                    class="toolbar-btn"
                    title="Alinear izquierda"
                  >
                    <i class="mdi mdi-format-align-left"></i>
                  </button>
                  <button
                    type="button"
                    @click="formatText('justifyCenter')"
                    class="toolbar-btn"
                    title="Centrar"
                  >
                    <i class="mdi mdi-format-align-center"></i>
                  </button>
                  <button
                    type="button"
                    @click="formatText('justifyRight')"
                    class="toolbar-btn"
                    title="Alinear derecha"
                  >
                    <i class="mdi mdi-format-align-right"></i>
                  </button>
                </div>

                <div class="toolbar-separator"></div>

                <div class="toolbar-group">
                  <button
                    type="button"
                    @click="formatText('insertUnorderedList')"
                    class="toolbar-btn"
                    title="Lista con viñetas"
                  >
                    <i class="mdi mdi-format-list-bulleted"></i>
                  </button>
                  <button
                    type="button"
                    @click="formatText('insertOrderedList')"
                    class="toolbar-btn"
                    title="Lista numerada"
                  >
                    <i class="mdi mdi-format-list-numbered"></i>
                  </button>
                </div>

                <div class="toolbar-separator"></div>

                <div class="toolbar-group">
                  <button
                    type="button"
                    @click="insertLink"
                    class="toolbar-btn"
                    title="Insertar enlace"
                  >
                    <i class="mdi mdi-link"></i>
                  </button>
                  <button
                    type="button"
                    @click="insertImage"
                    class="toolbar-btn"
                    title="Insertar imagen"
                  >
                    <i class="mdi mdi-image"></i>
                  </button>
                </div>
              </div>

              <div
                ref="contentEditor"
                class="rich-editor"
                contenteditable="true"
                @input="updateContent"
                @paste="handlePaste"
                placeholder="Escribe el contenido aquí..."
                v-html="formData.content"
              ></div>

              <div class="editor-stats">
                <span>Palabras: {{ wordCount }}</span>
                <span>Caracteres: {{ characterCount }}</span>
              </div>
            </div>
          </div>

          <!-- Step 3: SEO and Metadata -->
          <div v-show="currentStep === 3" class="form-step">
            <h3 class="step-title">
              <i class="mdi mdi-search-web"></i>
              SEO y Metadatos
            </h3>

            <div class="form-grid">
              <div class="form-group full-width">
                <label class="form-label">URL Slug</label>
                <input
                  v-model="formData.slug"
                  type="text"
                  class="form-input"
                  placeholder="url-del-contenido"
                  @input="validateSlug"
                />
                <div class="field-help">
                  <i class="mdi mdi-information-outline"></i>
                  La URL será: /contenido/{{ formData.slug || 'url-del-contenido' }}
                </div>
              </div>

              <div class="form-group full-width">
                <label class="form-label">Meta Título</label>
                <input
                  v-model="formData.metaTitle"
                  type="text"
                  class="form-input"
                  placeholder="Título para motores de búsqueda..."
                  maxlength="60"
                />
                <div class="character-count">
                  {{ formData.metaTitle?.length || 0 }}/60
                </div>
              </div>

              <div class="form-group full-width">
                <label class="form-label">Meta Descripción</label>
                <textarea
                  v-model="formData.metaDescription"
                  class="form-textarea"
                  rows="3"
                  placeholder="Descripción para motores de búsqueda..."
                  maxlength="160"
                ></textarea>
                <div class="character-count">
                  {{ formData.metaDescription?.length || 0 }}/160
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Palabras Clave</label>
                <input
                  v-model="formData.keywords"
                  type="text"
                  class="form-input"
                  placeholder="palabra1, palabra2, palabra3..."
                />
                <div class="field-help">
                  <i class="mdi mdi-information-outline"></i>
                  Separa las palabras clave con comas
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Categorías</label>
                <select
                  v-model="formData.categories"
                  class="form-select"
                  multiple
                >
                  <option value="tecnologia">Tecnología</option>
                  <option value="educacion">Educación</option>
                  <option value="noticias">Noticias</option>
                  <option value="tutoriales">Tutoriales</option>
                </select>
                <div class="field-help">
                  <i class="mdi mdi-information-outline"></i>
                  Mantén presionado Ctrl para seleccionar múltiples categorías
                </div>
              </div>
            </div>
          </div>

          <!-- Step 4: Preview -->
          <div v-show="currentStep === 4" class="form-step">
            <h3 class="step-title">
              <i class="mdi mdi-eye"></i>
              Vista Previa
            </h3>

            <div class="preview-container">
              <div class="preview-header">
                <h1 class="preview-title">{{ formData.title || 'Título del contenido' }}</h1>
                <div class="preview-meta">
                  <div class="preview-type">
                    <i :class="getTypeIcon(formData.type)"></i>
                    {{ formData.type || 'Tipo' }}
                  </div>
                  <div class="preview-author">
                    <i class="mdi mdi-account"></i>
                    {{ formData.author || 'Autor' }}
                  </div>
                  <div class="preview-status">
                    <i :class="getStatusIcon(formData.status)"></i>
                    {{ formData.status || 'Estado' }}
                  </div>
                </div>
                <p v-if="formData.description" class="preview-description">
                  {{ formData.description }}
                </p>
              </div>

              <div class="preview-content" v-html="formData.content || '<p>El contenido aparecerá aquí...</p>'"></div>

              <div class="preview-seo">
                <h4>Vista previa en buscadores:</h4>
                <div class="seo-preview">
                  <div class="seo-title">{{ formData.metaTitle || formData.title || 'Título del contenido' }}</div>
                  <div class="seo-url">https://tusitio.com/contenido/{{ formData.slug || 'url-del-contenido' }}</div>
                  <div class="seo-description">{{ formData.metaDescription || formData.description || 'Descripción del contenido...' }}</div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <div class="footer-left">
          <button
            v-if="currentStep > 1"
            type="button"
            @click="previousStep"
            class="modal-btn secondary"
          >
            <i class="mdi mdi-chevron-left"></i>
            Anterior
          </button>
        </div>

        <div class="footer-right">
          <button
            type="button"
            @click="closeModal"
            class="modal-btn secondary"
          >
            Cancelar
          </button>

          <button
            v-if="currentStep < steps.length"
            type="button"
            @click="nextStep"
            :disabled="!canProceedToNextStep"
            class="modal-btn primary"
          >
            Siguiente
            <i class="mdi mdi-chevron-right"></i>
          </button>

          <button
            v-else
            type="button"
            @click="handleSubmit"
            :disabled="saving || !isFormValid"
            class="modal-btn primary"
          >
            <i v-if="saving" class="loading-spinner small"></i>
            <i v-else :class="isEditing ? 'mdi mdi-content-save' : 'mdi mdi-plus'"></i>
            {{ saving ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Contenido') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  contentItem: Object,
  isEditing: Boolean
})

const emit = defineEmits(['update:modelValue', 'save', 'close'])

// Form data
const formData = ref({
  title: '',
  description: '',
  type: '',
  status: 'Borrador',
  author: '',
  publishDate: '',
  content: '',
  slug: '',
  metaTitle: '',
  metaDescription: '',
  keywords: '',
  categories: []
})

// Form state
const currentStep = ref(1)
const saving = ref(false)
const errors = ref({})
const contentEditor = ref(null)

// Steps configuration
const steps = [
  { label: 'Información', key: 'basic' },
  { label: 'Contenido', key: 'content' },
  { label: 'SEO', key: 'seo' },
  { label: 'Vista Previa', key: 'preview' }
]

// Computed properties
const wordCount = computed(() => {
  if (!formData.value.content) return 0
  const text = formData.value.content.replace(/<[^>]*>/g, ' ')
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
})

const characterCount = computed(() => {
  if (!formData.value.content) return 0
  return formData.value.content.replace(/<[^>]*>/g, '').length
})

const canProceedToNextStep = computed(() => {
  switch (currentStep.value) {
    case 1:
      return formData.value.title && formData.value.type
    case 2:
      return true // Content is optional
    case 3:
      return true // SEO fields are optional
    default:
      return true
  }
})

const isFormValid = computed(() => {
  return formData.value.title &&
         formData.value.type &&
         Object.keys(errors.value).length === 0
})

// Watchers
watch(() => props.contentItem, (newItem) => {
  if (newItem && props.isEditing) {
    Object.assign(formData.value, {
      title: newItem.title || '',
      description: newItem.description || '',
      type: newItem.type || '',
      status: newItem.status || 'Borrador',
      author: newItem.author || '',
      publishDate: newItem.publishDate || '',
      content: newItem.content || '',
      slug: newItem.slug || generateSlug(newItem.title || ''),
      metaTitle: newItem.metaTitle || '',
      metaDescription: newItem.metaDescription || '',
      keywords: newItem.keywords || '',
      categories: newItem.categories || []
    })
  }
}, { immediate: true })

watch(() => formData.value.title, (newTitle) => {
  if (!props.isEditing && newTitle) {
    formData.value.slug = generateSlug(newTitle)
  }
})

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    currentStep.value = 1
    errors.value = {}
    if (!props.isEditing) {
      resetForm()
    }
  }
})

// Methods
const closeModal = () => {
  emit('update:modelValue', false)
  emit('close')
}

const resetForm = () => {
  Object.assign(formData.value, {
    title: '',
    description: '',
    type: '',
    status: 'Borrador',
    author: '',
    publishDate: '',
    content: '',
    slug: '',
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    categories: []
  })
}

const nextStep = () => {
  if (currentStep.value < steps.length) {
    currentStep.value++
    if (currentStep.value === 2) {
      nextTick(() => {
        if (contentEditor.value) {
          contentEditor.value.focus()
        }
      })
    }
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const validateField = (field) => {
  switch (field) {
    case 'title':
      if (!formData.value.title) {
        errors.value.title = 'El título es obligatorio'
      } else if (formData.value.title.length < 3) {
        errors.value.title = 'El título debe tener al menos 3 caracteres'
      } else {
        delete errors.value.title
      }
      break
    case 'type':
      if (!formData.value.type) {
        errors.value.type = 'El tipo de contenido es obligatorio'
      } else {
        delete errors.value.type
      }
      break
  }
}

const validateSlug = () => {
  if (formData.value.slug) {
    formData.value.slug = formData.value.slug
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')
  }
}

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')
}

const handleSubmit = async () => {
  // Validate required fields
  validateField('title')
  validateField('type')

  if (!isFormValid.value) {
    currentStep.value = 1 // Go back to first step to show errors
    return
  }

  saving.value = true

  try {
    const contentData = {
      ...formData.value,
      id: props.contentItem?.id,
      createdAt: props.contentItem?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    emit('save', contentData)
    closeModal()
  } catch (error) {
    console.error('Error saving content:', error)
  } finally {
    saving.value = false
  }
}

// Rich text editor methods
const formatText = (command, value = null) => {
  document.execCommand(command, false, value)
  contentEditor.value?.focus()
}

const isFormatActive = (command) => {
  return document.queryCommandState(command)
}

const updateContent = () => {
  formData.value.content = contentEditor.value?.innerHTML || ''
}

const handlePaste = (event) => {
  event.preventDefault()
  const text = event.clipboardData.getData('text/plain')
  document.execCommand('insertText', false, text)
}

const insertLink = () => {
  const url = prompt('Ingresa la URL del enlace:')
  if (url) {
    formatText('createLink', url)
  }
}

const insertImage = () => {
  const url = prompt('Ingresa la URL de la imagen:')
  if (url) {
    formatText('insertImage', url)
  }
}

const getTypeIcon = (type) => {
  const icons = {
    'Página': 'mdi mdi-file-document',
    'Artículo': 'mdi mdi-newspaper',
    'Categoría': 'mdi mdi-folder',
    'Noticia': 'mdi mdi-bullhorn',
  }
  return icons[type] || 'mdi mdi-file'
}

const getStatusIcon = (status) => {
  const icons = {
    'Publicado': 'mdi mdi-check-circle',
    'Borrador': 'mdi mdi-file-edit',
    'Archivado': 'mdi mdi-archive',
  }
  return icons[status] || 'mdi mdi-help-circle'
}

onMounted(() => {
  // Initialize editor content if editing
  if (props.isEditing && props.contentItem?.content) {
    nextTick(() => {
      if (contentEditor.value) {
        contentEditor.value.innerHTML = props.contentItem.content
      }
    })
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.editor-modal {
  background: var(--bg-card);
  border-radius: 20px;
  max-width: 1000px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-secondary);
}

.modal-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-close-btn {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.2s ease;
}

.modal-close-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.step-indicator {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.step-item.active,
.step-item.completed {
  opacity: 1;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--text-secondary);
  transition: all 0.3s ease;
}

.step-item.active .step-number {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: white;
}

.step-item.completed .step-number {
  background: var(--success-color);
  border-color: var(--success-color);
  color: white;
}

.step-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.step-item.active .step-label {
  color: var(--accent-primary);
}

.form-step {
  max-width: 800px;
  margin: 0 auto;
}

.step-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.form-label.required::after {
  content: ' *';
  color: var(--error-color);
}

.form-input,
.form-select,
.form-textarea {
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.field-error {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--error-color);
  font-size: 0.85rem;
  font-weight: 500;
}

.field-help {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.character-count {
  text-align: right;
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* Content Editor */
.content-editor {
  border: 2px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  background: var(--bg-card);
}

.editor-toolbar {
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  gap: 0.25rem;
}

.toolbar-separator {
  width: 1px;
  height: 24px;
  background: var(--border-color);
  margin: 0 0.5rem;
}

.toolbar-btn {
  background: none;
  border: none;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.toolbar-btn.active {
  background: var(--accent-primary);
  color: white;
}

.rich-editor {
  min-height: 300px;
  padding: 1rem;
  outline: none;
  line-height: 1.6;
  color: var(--text-primary);
}

.rich-editor:empty::before {
  content: attr(placeholder);
  color: var(--text-muted);
  pointer-events: none;
}

.editor-stats {
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* Preview */
.preview-container {
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  background: var(--bg-secondary);
}

.preview-header {
  margin-bottom: 1.5rem;
}

.preview-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.preview-meta {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.preview-type,
.preview-author,
.preview-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.preview-description {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
}

.preview-content {
  color: var(--text-primary);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.preview-seo {
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
}

.preview-seo h4 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1rem;
}

.seo-preview {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
}

.seo-title {
  color: #1a0dab;
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
  cursor: pointer;
}

.seo-url {
  color: #006621;
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}

.seo-description {
  color: #545454;
  font-size: 0.9rem;
  line-height: 1.4;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-secondary);
}

.footer-left,
.footer-right {
  display: flex;
  gap: 1rem;
}

.modal-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  font-size: 0.9rem;
}

.modal-btn.secondary {
  background: var(--bg-hover);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.modal-btn.secondary:hover {
  background: var(--text-secondary);
  color: white;
}

.modal-btn.primary {
  background: var(--accent-primary);
  color: white;
}

.modal-btn.primary:hover:not(:disabled) {
  background: var(--button-primary-hover);
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner.small {
  width: 14px;
  height: 14px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }

  .editor-modal {
    max-height: 95vh;
  }

  .modal-body {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .step-indicator {
    gap: 0.5rem;
  }

  .step-number {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }

  .step-label {
    font-size: 0.75rem;
  }

  .toolbar-group {
    gap: 0.125rem;
  }

  .toolbar-btn {
    padding: 4px 6px;
  }

  .modal-footer {
    flex-direction: column;
    gap: 1rem;
  }

  .footer-left,
  .footer-right {
    width: 100%;
    justify-content: center;
  }
}
</style>
