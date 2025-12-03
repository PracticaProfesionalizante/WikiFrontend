<template>
  <div v-if="modelValue" class="modal-overlay">
    <div class="modal-container">

      <!-- HEADER -->
      <header class="modal-header">
        <div class="header-left">
          <i :class="icon" class="header-icon"></i>
          <div>
            <h2 class="modal-title">{{ title }}</h2>
            <p class="modal-subtitle">{{ subtitle }}</p>
          </div>
        </div>

        <button class="close-btn" @click="closeForm">
          <i class="fas fa-times"></i>
        </button>
      </header>

      <!-- STEPPER -->
      <div class="stepper">
        <div
          v-for="n in totalSteps"
          :key="n"
          class="step"
          :class="{ active: currentStep === n, completed: currentStep > n }"
        >
          <span>{{ n }}</span>
        </div>
      </div>

      <!-- BODY -->
      <section class="modal-body">

        <!-- Dynamic step slot -->
        <slot :name="`step-${currentStep}`"></slot>

      </section>

      <!-- FOOTER -->
      <footer class="modal-footer">

        <!-- Back button -->
        <button
          v-if="currentStep > 1"
          class="btn btn-secondary"
          @click="$emit('prev')"
        >
          <i class="fas fa-arrow-left"></i>
          Anterior
        </button>

        <!-- Next button -->
        <button
          v-if="currentStep < totalSteps"
          class="btn btn-primary"
          @click="$emit('next')"
        >
          Siguiente
          <i class="fas fa-arrow-right"></i>
        </button>

        <!-- Submit button -->
        <button
          v-else
          class="btn btn-primary"
          :disabled="loading"
          @click="$emit('submit')"
        >
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          <span v-else>Guardar</span>
        </button>

      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  currentStep: { type: Number, required: true },
  totalSteps: { type: Number, default: 3 },
  isEditing: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  title: { type: String, default: 'Formulario' },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: 'fas fa-file' },
})

const emit = defineEmits(['update:modelValue', 'close', 'next', 'prev', 'submit'])

const closeForm = () => {
  emit('update:modelValue', false)
  emit('close')
}
</script>

<style scoped>
/* MODAL OVERLAY */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.6);
  display: grid;
  place-items: center;
  z-index: 1000;
}

/* MODAL CONTAINER */
.modal-container {
  background: var(--bg-card);
  width: 95%;
  max-width: 900px;
  border-radius: 16px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* HEADER */
.modal-header {
  display: flex;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  font-size: 2rem;
  color: var(--accent-primary);
}

.modal-title {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.4rem;
  font-weight: 700;
}

.modal-subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* STEPPER */
.stepper {
  padding: 1rem;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.step {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  display: grid;
  place-items: center;
  font-weight: 600;
  background: var(--bg-primary);
  color: var(--text-secondary);
}

.step.active {
  border-color: var(--accent-primary);
  background: var(--accent-primary);
  color: white;
}

.step.completed {
  border-color: var(--accent-primary);
  background: var(--accent-secondary);
  color: white;
}

/* BODY */
.modal-body {
  padding: 2rem;
  background: var(--bg-primary);
  max-height: 65vh;
  overflow-y: auto;
}

/* FOOTER */
.modal-footer {
  padding: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.btn {
  border-radius: 8px;
  padding: 0.75rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-primary {
  background: var(--accent-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--accent-secondary);
}

.btn-secondary {
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  color: var(--text-primary);
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  color: var(--text-secondary);
}
</style>
