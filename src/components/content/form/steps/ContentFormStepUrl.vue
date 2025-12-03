<template>
  <div class="url-step">

    <!-- Error específico -->
    <div v-if="errors?.content" class="error-box">
      <i class="fas fa-exclamation-circle"></i>
      <span>{{ errors.content }}</span>
    </div>

    <label>Enlace URL *</label>

    <input
      type="text"
      class="input"
      v-model="form.content"
      :disabled="disabled"
      placeholder="https://ejemplo.com/recurso"
      @blur="normalizeUrl"
    />

    <div class="actions">
      <button class="btn-refresh" type="button" @click="refreshPreview">
        <i class="fas fa-refresh"></i> Actualizar preview
      </button>

      <a
        v-if="normalizedUrl"
        class="btn-open"
        :href="normalizedUrl"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i class="fas fa-external-link-alt"></i> Abrir en nueva pestaña
      </a>
    </div>

    <!-- Preview -->
    <div class="preview-frame">
      <div v-if="iframeError" class="iframe-error">
        <i class="fas fa-triangle-exclamation"></i>
        <p>No se pudo cargar el recurso.</p>
      </div>

      <iframe
        v-else
        :key="previewKey"
        :src="normalizedUrl"
        class="iframe"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        @error="onIframeError"
        @load="onIframeLoad"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  form: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) },
  disabled: { type: Boolean, default: false },
})

const iframeError = ref(false)
const previewKey = ref(Date.now())

// Normalización de URL
const normalizedUrl = computed(() => {
  const url = props.form.content?.trim()
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `https://${url}`
})

const normalizeUrl = () => {
  if (!props.form.content) return
  props.form.content = normalizedUrl.value
}

// Preview refresh
const refreshPreview = () => {
  iframeError.value = false
  previewKey.value = Date.now()
}

const onIframeError = () => {
  iframeError.value = true
}

const onIframeLoad = () => {
  iframeError.value = false
}
</script>

<style scoped>
.url-step {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input {
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-refresh,
.btn-open {
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.btn-open {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.preview-frame {
  width: 100%;
  height: 350px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  background: var(--bg-secondary);
  position: relative;
}

.iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.iframe-error {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--error-color);
  gap: 0.5rem;
}

.error-box {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #b91c1c;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
</style>
