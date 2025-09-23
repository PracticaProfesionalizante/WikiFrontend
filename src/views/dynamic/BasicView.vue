<template>
  <div class="dynamic-view-layout">
    <SidebarMenu @sidebar-toggle="handleSidebarToggle" />
    <AppHeader :sidebar-expanded="sidebarExpanded" />
    
    <div class="main-content" :class="{ 'with-header': true }">
      <div class="dynamic-container">
        <div class="view-header">
          <h1 class="view-title">
            <i :class="menuIcon || 'mdi mdi-circle-outline'"></i>
            {{ menuTitle || 'Vista Dinámica' }}
          </h1>
          <p class="view-subtitle">
            Esta es una vista generada automáticamente
          </p>
        </div>

        <div class="content-section">
          <div class="info-card">
            <div class="card-header">
              <i class="mdi mdi-information-outline"></i>
              <h3>Información</h3>
            </div>
            <div class="card-content">
              <p>
                Esta vista ha sido creada automáticamente por el sistema de gestión de menús.
                Puedes personalizar este contenido según tus necesidades.
              </p>
              
              <div class="feature-list">
                <div class="feature-item">
                  <i class="mdi mdi-check-circle"></i>
                  <span>Vista completamente funcional</span>
                </div>
                <div class="feature-item">
                  <i class="mdi mdi-check-circle"></i>
                  <span>Diseño responsive</span>
                </div>
                <div class="feature-item">
                  <i class="mdi mdi-check-circle"></i>
                  <span>Integración con el sistema de navegación</span>
                </div>
              </div>
            </div>
          </div>

          <div class="action-card">
            <div class="card-header">
              <i class="mdi mdi-cog"></i>
              <h3>Acciones Disponibles</h3>
            </div>
            <div class="card-content">
              <div class="action-buttons">
                <button class="action-btn primary">
                  <i class="mdi mdi-plus"></i>
                  Agregar Elemento
                </button>
                <button class="action-btn secondary">
                  <i class="mdi mdi-pencil"></i>
                  Editar Contenido
                </button>
                <button class="action-btn tertiary">
                  <i class="mdi mdi-cog"></i>
                  Configurar Vista
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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

const handleSidebarToggle = (expanded) => {
  sidebarExpanded.value = expanded
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
.dynamic-view-layout {
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
  padding-top: 70px;
}

.dynamic-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.view-header {
  text-align: center;
  margin-bottom: 3rem;
  background: var(--bg-primary);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 60px var(--shadow-color);
  border: 1px solid var(--border-color);
}

.view-title {
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

.view-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
}

.content-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.info-card, .action-card {
  background: var(--bg-secondary);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 15px var(--shadow-color);
  overflow: hidden;
  transition: all 0.3s ease;
}

.info-card:hover, .action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px var(--shadow-color);
}

.card-header {
  background: linear-gradient(135deg, var(--accent-color), #1d4ed8);
  color: white;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.card-header i {
  font-size: 1.5rem;
}

.card-content {
  padding: 2rem;
}

.card-content p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-primary);
}

.feature-item i {
  color: #10b981;
  font-size: 1.2rem;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.action-btn.primary {
  background: linear-gradient(135deg, var(--accent-color), #1d4ed8);
  color: white;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
}

.action-btn.secondary {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.action-btn.secondary:hover {
  background: rgba(59, 130, 246, 0.2);
}

.action-btn.tertiary {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.action-btn.tertiary:hover {
  background: var(--bg-hover);
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .dynamic-container {
    padding: 1rem;
  }
  
  .content-section {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    gap: 0.75rem;
  }
  
  .action-btn {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
}
</style>