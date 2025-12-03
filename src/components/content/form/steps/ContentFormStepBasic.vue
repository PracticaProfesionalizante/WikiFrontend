<template>
  <div class="step-basic">

    <!-- Error general del paso -->
    <div v-if="errors?.basic" class="error-box">
      <i class="fas fa-exclamation-circle"></i>
      <span>{{ errors.basic }}</span>
    </div>

    <!-- Nombre -->
    <div class="form-group">
      <label>Nombre del Documento *</label>
      <input
        type="text"
        class="input"
        v-model="form.name"
        :disabled="disabled"
        placeholder="Ej: Manual del Usuario"
      />
    </div>

    <!-- Slug -->
    <div class="form-group">
      <label>Slug *</label>
      <input
        type="text"
        class="input"
        v-model="form.slug"
        :disabled="disabled"
        placeholder="manual-del-usuario"
      />
    </div>

    <!-- Carpeta -->
    <div class="form-group">
      <label>Carpeta *</label>
      <input
        type="text"
        class="input"
        v-model="form.folder"
        :disabled="disabled"
        placeholder="Ej: Documentación / Guias"
      />
    </div>

    <!-- Descripción -->
    <div class="form-group">
      <label>Descripción</label>
      <textarea
        class="textarea"
        v-model="form.description"
        :disabled="disabled"
        placeholder="Descripción breve del documento..."
      ></textarea>
    </div>

    <!-- Tags -->
    <div class="form-group">
      <label>Tags</label>
      <input
        type="text"
        class="input"
        v-model="form.tags"
        placeholder="Ej: guía, soporte"
      />
      <small class="help-text">Separa los tags con comas.</small>
    </div>

  </div>
</template>

<script setup>
const props = defineProps({
  form: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) },
  disabled: { type: Boolean, default: false },
})
</script>

<style scoped>
.step-basic {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 600;
  color: var(--text-primary);
}

.input,
.textarea {
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.textarea {
  min-height: 120px;
  resize: vertical;
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

.help-text {
  font-size: 0.8rem;
  color: var(--text-secondary);
}
</style>
