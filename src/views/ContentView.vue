<template>
  <div class="content-view-container">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner">
        <i class="mdi mdi-loading mdi-spin"></i>
      </div>
      <div class="loading-text">
        <h3>Cargando documento...</h3>
        <p>Por favor espera mientras obtenemos el contenido</p>
      </div>
    </div>

    <!-- Error State - Access Denied -->
    <div v-else-if="error && error.status === 403" class="error-container access-denied">
      <div class="error-icon">
        <i class="mdi mdi-shield-alert"></i>
      </div>
      <div class="error-content">
        <h2>Acceso Denegado</h2>
        <p>No tienes permisos para ver este documento.</p>
        <div class="error-actions">
          <button class="btn btn-primary" @click="goBack">
            <i class="mdi mdi-arrow-left"></i>
            Volver
          </button>
          <button class="btn btn-secondary" @click="goHome">
            <i class="mdi mdi-home"></i>
            Ir al Inicio
          </button>
        </div>
      </div>
    </div>

    <!-- Error State - General Error -->
    <div v-else-if="error" class="error-container general-error">
      <div class="error-icon">
        <i class="mdi mdi-alert-circle"></i>
      </div>
      <div class="error-content">
        <h2>Error al Cargar</h2>
        <p>{{ error.message || 'Ocurrió un error inesperado al cargar el documento.' }}</p>
        <div class="error-actions">
          <button class="btn btn-primary" @click="retryLoad">
            <i class="mdi mdi-refresh"></i>
            Reintentar
          </button>
          <button class="btn btn-secondary" @click="goBack">
            <i class="mdi mdi-arrow-left"></i>
            Volver
          </button>
        </div>
      </div>
    </div>

    <!-- Document Content -->
    <div v-else-if="document" class="document-container">
      <!-- Document Header -->
      <div class="document-header">
        <div class="document-info">
          <div class="document-type">
            <i :class="getTypeIcon(document.type)"></i>
            <span>{{ getTypeLabel(document.type) }}</span>
          </div>
          <h1 class="document-title">{{ document.name }}</h1>
          <div class="document-meta">
            <div class="meta-item" v-if="document.folder">
              <i class="mdi mdi-folder-outline"></i>
              <span>{{ document.folder }}</span>
            </div>
            <div class="meta-item" v-if="document.createdAt">
              <i class="mdi mdi-calendar"></i>
              <span>{{ formatDate(document.createdAt) }}</span>
            </div>
            <div class="meta-item" v-if="document.updatedAt">
              <i class="mdi mdi-update"></i>
              <span>Actualizado {{ formatDate(document.updatedAt) }}</span>
            </div>
          </div>
        </div>
        <div class="document-actions">
          <button class="action-btn" @click="refreshDocument" :disabled="isLoading">
            <i class="mdi mdi-refresh"></i>
            Actualizar
          </button>
          <button class="action-btn" @click="goBack">
            <i class="mdi mdi-arrow-left"></i>
            Volver
          </button>
        </div>
      </div>

      <!-- Document Content -->
      <div class="document-content">
        <!-- Text/Markdown Content -->
        <div v-if="document.type === 'TEXT'" class="text-content">
          <div class="markdown-content" v-html="renderedMarkdown"></div>
        </div>

        <!-- URL Content -->
        <div v-else-if="document.type === 'URL'" class="url-content">
          <div class="url-container">
            <div class="url-header">
              <h3>Enlace Externo</h3>
              <p>Este documento contiene un enlace a un recurso externo.</p>
            </div>
            <div class="url-preview">
              <div class="preview-frame">
                <iframe
                  :src="document.content"
                  class="url-iframe"
                  frameborder="0"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                  @load="onIframeLoad"
                  @error="onIframeError"
                ></iframe>
              </div>
              <div class="url-actions">
                <a
                  :href="document.content"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-primary"
                >
                  <i class="mdi mdi-open-in-new"></i>
                  Abrir en Nueva Pestaña
                </a>
                <button class="btn btn-secondary" @click="copyUrl">
                  <i class="mdi mdi-content-copy"></i>
                  Copiar Enlace
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- PDF Content -->
        <div v-else-if="document.type === 'PDF'" class="pdf-content">
          <div class="pdf-container">
            <div class="pdf-header">
              <h3>Documento PDF</h3>
              <p>Visualizador de documento PDF integrado.</p>
            </div>
            <div class="pdf-viewer">
              <iframe
                :src="document.content"
                class="pdf-iframe"
                frameborder="0"
                sandbox="allow-same-origin allow-scripts"
                @load="onIframeLoad"
                @error="onIframeError"
              ></iframe>
            </div>
            <div class="pdf-actions">
              <a
                :href="document.content"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-primary"
              >
                <i class="mdi mdi-download"></i>
                Descargar PDF
              </a>
              <button class="btn btn-secondary" @click="copyUrl">
                <i class="mdi mdi-content-copy"></i>
                Copiar Enlace
              </button>
            </div>
          </div>
        </div>

        <!-- Unknown Type -->
        <div v-else class="unknown-content">
          <div class="unknown-icon">
            <i class="mdi mdi-file-question"></i>
          </div>
          <h3>Tipo de Contenido No Soportado</h3>
          <p>Este tipo de documento no puede ser visualizado en este momento.</p>
          <div class="unknown-actions">
            <a
              :href="document.content"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-primary"
            >
              <i class="mdi mdi-open-in-new"></i>
              Abrir Enlace
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-container">
      <div class="empty-icon">
        <i class="mdi mdi-file-document-outline"></i>
      </div>
      <h3>Documento No Encontrado</h3>
      <p>El documento solicitado no existe o ha sido eliminado.</p>
      <div class="empty-actions">
        <button class="btn btn-primary" @click="goHome">
          <i class="mdi mdi-home"></i>
          Ir al Inicio
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import documentService from '@/services/documentService'
import MarkdownIt from 'markdown-it'

// Router
const route = useRoute()
const router = useRouter()

// Reactive data
const document = ref(null)
const isLoading = ref(false)
const error = ref(null)
const iframeError = ref(false)

// Markdown renderer
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
})

// Computed
const renderedMarkdown = computed(() => {
  if (!document.value?.content) return ''

  try {
    return md.render(document.value.content)
  } catch (err) {
    console.error('❌ [CONTENT VIEW] Error renderizando Markdown:', err)
    return '<p>Error al renderizar el contenido Markdown.</p>'
  }
})

// Methods
const loadDocument = async () => {
  const documentId = route.params.id

  if (!documentId) {
    error.value = { message: 'ID de documento no proporcionado' }
    return
  }

  isLoading.value = true
  error.value = null
  iframeError.value = false

  try {
    console.log('📄 [CONTENT VIEW] Cargando documento:', documentId)

    const result = await documentService.getDocumentById(documentId)
    document.value = result

    console.log('✅ [CONTENT VIEW] Documento cargado exitosamente:', result.name)

    // Actualizar título de la página
    document.title = `${result.name} - WikiFrontend`

  } catch (err) {
    console.error('❌ [CONTENT VIEW] Error cargando documento:', err)

    error.value = {
      status: err.response?.status,
      message: err.response?.data?.message || err.message
    }

    document.value = null
  } finally {
    isLoading.value = false
  }
}

const refreshDocument = () => {
  loadDocument()
}

const retryLoad = () => {
  loadDocument()
}

const goBack = () => {
  router.go(-1)
}

const goHome = () => {
  router.push('/dashboard')
}

const copyUrl = async () => {
  if (!document.value?.content) return

  try {
    await navigator.clipboard.writeText(document.value.content)
    console.log('✅ [CONTENT VIEW] URL copiada al portapapeles')

    // Mostrar notificación de éxito (opcional)
    // Puedes implementar un sistema de notificaciones aquí

  } catch (err) {
    console.error('❌ [CONTENT VIEW] Error copiando URL:', err)
  }
}

const getTypeIcon = (type) => {
  const icons = {
    'TEXT': 'mdi mdi-file-document-outline',
    'URL': 'mdi mdi-link',
    'PDF': 'mdi mdi-file-pdf-box'
  }
  return icons[type] || 'mdi mdi-file-question'
}

const getTypeLabel = (type) => {
  const labels = {
    'TEXT': 'Documento de Texto',
    'URL': 'Enlace Externo',
    'PDF': 'Documento PDF'
  }
  return labels[type] || 'Tipo Desconocido'
}

const formatDate = (dateString) => {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (err) {
    return dateString
  }
}

const onIframeLoad = () => {
  console.log('✅ [CONTENT VIEW] Iframe cargado exitosamente')
  iframeError.value = false
}

const onIframeError = () => {
  console.error('❌ [CONTENT VIEW] Error cargando iframe')
  iframeError.value = true
}

// Watchers
watch(() => route.params.id, () => {
  loadDocument()
})

// Lifecycle
onMounted(() => {
  loadDocument()
})
</script>

<style scoped>
.content-view-container {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 2rem;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 2rem;
}

.loading-spinner {
  font-size: 3rem;
  color: var(--accent-primary);
}

.loading-text {
  text-align: center;
}

.loading-text h3 {
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.loading-text p {
  color: var(--text-secondary);
  margin: 0;
}

/* Error States */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 2rem;
  text-align: center;
}

.error-icon {
  font-size: 4rem;
  color: var(--error-color);
}

.access-denied .error-icon {
  color: #f59e0b;
}

.error-content h2 {
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.error-content p {
  color: var(--text-secondary);
  margin: 0 0 2rem 0;
  max-width: 500px;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

/* Document Container */
.document-container {
  max-width: 1200px;
  margin: 0 auto;
}

.document-header {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px var(--shadow-color);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.document-info {
  flex: 1;
}

.document-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--accent-primary);
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.document-title {
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  line-height: 1.2;
}

.document-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.document-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  color: var(--text-primary);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover:not(:disabled) {
  background: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Document Content */
.document-content {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px var(--shadow-color);
}

/* Text Content */
.text-content {
  max-width: none;
}

.markdown-content {
  color: var(--text-primary);
  line-height: 1.7;
  font-size: 1rem;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  color: var(--text-primary);
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.markdown-content :deep(h1) {
  font-size: 2rem;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.markdown-content :deep(h2) {
  font-size: 1.5rem;
}

.markdown-content :deep(h3) {
  font-size: 1.25rem;
}

.markdown-content :deep(p) {
  margin-bottom: 1rem;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 2rem;
}

.markdown-content :deep(li) {
  margin-bottom: 0.5rem;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid var(--accent-primary);
  padding-left: 1rem;
  margin: 1rem 0;
  color: var(--text-secondary);
  font-style: italic;
}

.markdown-content :deep(code) {
  background: var(--bg-secondary);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
}

.markdown-content :deep(pre) {
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1rem 0;
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
}

.markdown-content :deep(a) {
  color: var(--accent-primary);
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid var(--border-color);
  padding: 0.75rem;
  text-align: left;
}

.markdown-content :deep(th) {
  background: var(--bg-secondary);
  font-weight: 600;
}

/* URL Content */
.url-content,
.pdf-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.url-header,
.pdf-header {
  text-align: center;
}

.url-header h3,
.pdf-header h3 {
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.url-header p,
.pdf-header p {
  color: var(--text-secondary);
  margin: 0;
}

.url-preview,
.pdf-viewer {
  border: 2px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  background: var(--bg-secondary);
}

.preview-frame {
  position: relative;
  width: 100%;
  height: 500px;
}

.url-iframe,
.pdf-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.url-actions,
.pdf-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding: 1rem;
  background: var(--bg-secondary);
}

/* Unknown Content */
.unknown-content {
  text-align: center;
  padding: 3rem;
}

.unknown-icon {
  font-size: 4rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.unknown-content h3 {
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.unknown-content p {
  color: var(--text-secondary);
  margin: 0 0 2rem 0;
}

.unknown-actions {
  display: flex;
  justify-content: center;
}

/* Empty State */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  color: var(--text-secondary);
}

.empty-container h3 {
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.empty-container p {
  color: var(--text-secondary);
  margin: 0 0 2rem 0;
}

.empty-actions {
  display: flex;
  justify-content: center;
}

/* Buttons */
.btn {
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  text-decoration: none;
}

.btn-primary {
  background: var(--accent-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--accent-secondary);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-primary);
  border-color: var(--accent-primary);
}

/* Responsive */
@media (max-width: 768px) {
  .content-view-container {
    padding: 1rem;
  }

  .document-header {
    flex-direction: column;
    gap: 1rem;
  }

  .document-title {
    font-size: 1.5rem;
  }

  .document-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .document-actions {
    width: 100%;
    justify-content: center;
  }

  .error-actions,
  .url-actions,
  .pdf-actions {
    flex-direction: column;
  }

  .preview-frame {
    height: 300px;
  }
}
</style>
