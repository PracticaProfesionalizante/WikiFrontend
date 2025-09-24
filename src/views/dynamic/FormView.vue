<template>
  <div class="form-view-layout">
    <SidebarMenu @sidebar-toggle="handleSidebarToggle" />
    <AppHeader :sidebar-expanded="sidebarExpanded" />
    
    <div class="main-content" :class="{ 'with-header': true }">
      <div class="form-container">
        <div class="form-header">
          <h1 class="form-title">
            <i :class="menuIcon || 'mdi mdi-form-select'"></i>
            {{ menuTitle || 'Formulario Dinámico' }}
          </h1>
          <p class="form-subtitle">
            Completa la información requerida en el formulario
          </p>
        </div>

        <div class="form-content">
          <form @submit.prevent="handleSubmit" class="dynamic-form">
            <div class="form-sections">
              <!-- Sección de información básica -->
              <div class="form-section">
                <h3 class="section-title">
                  <i class="mdi mdi-information-outline"></i>
                  Información Básica
                </h3>
                
                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label">
                      <i class="mdi mdi-format-title"></i>
                      Título
                    </label>
                    <input 
                      v-model="formData.title"
                      type="text" 
                      class="form-input"
                      placeholder="Ingresa el título"
                      required
                    >
                  </div>

                  <div class="form-group">
                    <label class="form-label">
                      <i class="mdi mdi-text"></i>
                      Descripción
                    </label>
                    <textarea 
                      v-model="formData.description"
                      class="form-textarea"
                      placeholder="Ingresa una descripción"
                      rows="4"
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- Sección de detalles -->
              <div class="form-section">
                <h3 class="section-title">
                  <i class="mdi mdi-details"></i>
                  Detalles Adicionales
                </h3>
                
                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label">
                      <i class="mdi mdi-calendar"></i>
                      Fecha
                    </label>
                    <input 
                      v-model="formData.date"
                      type="date" 
                      class="form-input"
                    >
                  </div>

                  <div class="form-group">
                    <label class="form-label">
                      <i class="mdi mdi-format-list-bulleted"></i>
                      Categoría
                    </label>
                    <select v-model="formData.category" class="form-select">
                      <option value="">Selecciona una categoría</option>
                      <option value="general">General</option>
                      <option value="importante">Importante</option>
                      <option value="urgente">Urgente</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label">
                      <i class="mdi mdi-toggle-switch"></i>
                      Estado
                    </label>
                    <div class="toggle-group">
                      <label class="toggle-option">
                        <input 
                          type="radio" 
                          v-model="formData.status" 
                          value="activo"
                          name="status"
                        >
                        <span class="radio-mark"></span>
                        Activo
                      </label>
                      <label class="toggle-option">
                        <input 
                          type="radio" 
                          v-model="formData.status" 
                          value="inactivo"
                          name="status"
                        >
                        <span class="radio-mark"></span>
                        Inactivo
                      </label>
                    </div>
                  </div>

                  <div class="form-group full-width">
                    <label class="checkbox-option">
                      <input 
                        type="checkbox" 
                        v-model="formData.notifications"
                      >
                      <span class="checkmark"></span>
                      <div class="checkbox-info">
                        <strong>Recibir notificaciones</strong>
                        <small>Te enviaremos actualizaciones sobre este elemento</small>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="resetForm">
                <i class="mdi mdi-close"></i>
                Cancelar
              </button>
              <button type="submit" class="submit-btn" :disabled="!isFormValid">
                <i class="mdi mdi-check"></i>
                Guardar
              </button>
            </div>
          </form>

          <!-- Panel de vista previa -->
          <div class="preview-panel">
            <h3 class="preview-title">
              <i class="mdi mdi-eye"></i>
              Vista Previa
            </h3>
            
            <div class="preview-content">
              <div class="preview-item" v-if="formData.title">
                <strong>Título:</strong> {{ formData.title }}
              </div>
              <div class="preview-item" v-if="formData.description">
                <strong>Descripción:</strong> {{ formData.description }}
              </div>
              <div class="preview-item" v-if="formData.date">
                <strong>Fecha:</strong> {{ formatDate(formData.date) }}
              </div>
              <div class="preview-item" v-if="formData.category">
                <strong>Categoría:</strong> 
                <span class="category-badge" :class="formData.category">
                  {{ formData.category }}
                </span>
              </div>
              <div class="preview-item" v-if="formData.status">
                <strong>Estado:</strong> 
                <span class="status-badge" :class="formData.status">
                  {{ formData.status }}
                </span>
              </div>
              <div class="preview-item" v-if="formData.notifications">
                <strong>Notificaciones:</strong> Habilitadas
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import SidebarMenu from '@/components/common/SidebarMenu.vue'
import AppHeader from '@/components/common/AppHeader.vue'

const route = useRoute()
const authStore = useAuthStore()
const sidebarExpanded = ref(false)

// Props dinámicos basados en el menú
const menuTitle = ref('')
const menuIcon = ref('')

// Datos del formulario
const formData = ref({
  title: '',
  description: '',
  date: '',
  category: '',
  status: 'activo',
  notifications: false
})

// Computed
const isFormValid = computed(() => {
  return formData.value.title.trim().length > 0
})

// Métodos
const handleSidebarToggle = (expanded) => {
  sidebarExpanded.value = expanded
}

const handleSubmit = async () => {
  try {
    // Aquí iría la lógica para enviar los datos al backend
    
    // Simular envío exitoso
    alert('Formulario enviado correctamente')
    resetForm()
  } catch (error) {
    alert('Error al enviar el formulario')
  }
}

const resetForm = () => {
  formData.value = {
    title: '',
    description: '',
    date: '',
    category: '',
    status: 'activo',
    notifications: false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  // Buscar información del menú actual
  const currentPath = route.path
  const currentMenu = authStore.menus?.find(menu => menu.path === currentPath)
  
  if (currentMenu) {
    menuTitle.value = currentMenu.name
    menuIcon.value = currentMenu.icon
  }
})
</script>

<style scoped>
.form-view-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
}

.main-content {
  flex: 1;
  margin-left: 60px;
  transition: margin-left 0.3s ease;
  min-height: 100vh;
}

.main-content.with-header {
  padding-top: 60px;
}

.form-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.form-header {
  text-align: center;
  margin-bottom: 3rem;
  background: var(--bg-primary);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 60px var(--shadow-color);
  border: 1px solid var(--border-color);
}

.form-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: linear-gradient(135deg, var(--accent-color), #1d4ed8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
}

.form-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.dynamic-form {
  background: var(--bg-secondary);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 15px var(--shadow-color);
  overflow: hidden;
}

.form-sections {
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--border-color);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-input, .form-textarea, .form-select {
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input:focus, .form-textarea:focus, .form-select:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.toggle-group {
  display: flex;
  gap: 1rem;
}

.toggle-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--text-primary);
}

.toggle-option input[type="radio"] {
  display: none;
}

.radio-mark {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-radius: 50%;
  position: relative;
  transition: all 0.2s ease;
}

.toggle-option input[type="radio"]:checked + .radio-mark {
  border-color: var(--accent-color);
  background: var(--accent-color);
}

.toggle-option input[type="radio"]:checked + .radio-mark::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.checkbox-option:hover {
  border-color: var(--accent-color);
  background: var(--bg-hover);
}

.checkbox-option input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  position: relative;
  transition: all 0.2s ease;
}

.checkbox-option input[type="checkbox"]:checked + .checkmark {
  background: var(--accent-color);
  border-color: var(--accent-color);
}

.checkbox-option input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
}

.checkbox-info strong {
  display: block;
  color: var(--text-primary);
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.checkbox-info small {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--border-color);
  background: var(--bg-primary);
}

.cancel-btn, .submit-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.cancel-btn:hover {
  background: var(--bg-hover);
}

.submit-btn {
  background: linear-gradient(135deg, var(--accent-color), #1d4ed8);
  color: white;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Panel de vista previa */
.preview-panel {
  background: var(--bg-secondary);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 15px var(--shadow-color);
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.preview-title {
  background: linear-gradient(135deg, var(--accent-color), #1d4ed8);
  color: white;
  padding: 1.5rem;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.preview-content {
  padding: 1.5rem;
}

.preview-item {
  margin-bottom: 1rem;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.preview-item:last-child {
  margin-bottom: 0;
}

.preview-item strong {
  color: var(--text-secondary);
  display: block;
  margin-bottom: 0.25rem;
}

.category-badge, .status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}

.category-badge.general {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.category-badge.importante {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.category-badge.urgente {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.status-badge.activo {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-badge.inactivo {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

/* Responsive */
@media (max-width: 1024px) {
  .form-content {
    grid-template-columns: 1fr;
  }
  
  .preview-panel {
    position: static;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .form-container {
    padding: 1rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .toggle-group {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>