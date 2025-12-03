<template>
  <div class="pdf-step">

    <!-- Error específico -->
    <div v-if="errors?.content" class="error-box">
      <i class="fas fa-exclamation-circle"></i>
      <span>{{ errors.content }}</span>
    </div>

    <label>Archivo PDF *</label>

    <input
      type="file"
      accept="application/pdf"
      class="file-input"
      :disabled="disabled"
      @change="onFileSelected"
    />

    <!-- Estado: archivo seleccionado -->
    <div v-if="form.file" class="file-info">
      <i class="fas fa-file-pdf"></i>
      <span>{{ form.file.name }}</span>
      <button class="remove-btn" @click="removeFile" type="button" :disabled="disabled">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Estado: ya existía un PDF previo en edición -->
    <div v-else-if="isEditing && form.existingPdfUrl" class="file-info">
      <i class="fas fa-file-pdf"></i>
      <span>PDF actual adjunto</span>
      <button class="remove-btn" @click="replaceExisting" type="button" :disabled="disabled">
        <i class="fas fa-sync-alt"></i> Reemplazar archivo
      </button>
    </div>

    <!-- Preview -->
    <div v-if="previewUrl" class="preview-frame">
      <iframe
        :src="previewUrl"
        class="iframe"
        frameborder="0"
      ></iframe>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  form: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) },
  disabled: { type: Boolean, default: false },
  isEditing: { type: Boolean, default: false },
})

const previewUrl = ref(null)

const MAX_SIZE_MB = 10
const MAX_SIZE = MAX_SIZE_MB * 1024 * 1024

const onFileSelected = (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (file.type !== 'application/pdf') {
    props.errors.content = 'El archivo debe ser un PDF válido.'
    return
  }

  if (file.size > MAX_SIZE) {
    props.errors.content = `El archivo es demasiado grande (${MAX_SIZE_MB}MB máx).`
    return
  }

  props.form.file = file
  props.errors.content = null

  generatePreview(file)
}

const generatePreview = (file) => {
  const reader = new FileReader()
  reader.onload = () => {
    previewUrl.value = reader.result
  }
  reader.readAsDataURL(file)
}

const removeFile = () => {
  props.form.file = null
  previewUrl.value = null
}

const replaceExisting = () => {
  props.form.existingPdfUrl = null
}
</script>

<style scoped>
.pdf-step {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.file-input {
  padding: 0.5rem;
  cursor: pointer;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.7rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.remove-btn {
  margin-left: auto;
  background: transparent;
  border: none;
  color: var(--error-color);
  cursor: pointer;
}

.preview-frame {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.iframe {
  width: 100%;
  height: 100%;
}

/* Error */
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
