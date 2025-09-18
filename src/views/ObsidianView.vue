<template>
  <div class="obsidian-layout">
    <SidebarMenu @sidebar-toggle="handleSidebarToggle" />
    <AppHeader :sidebar-expanded="sidebarExpanded" />
    <main class="main-content" :class="{ 'with-sidebar': true, 'with-header': true }">
      <div class="page-container">
        <div class="page-header">
          <h1 class="page-title">
            <i class="mdi mdi-lead-pencil"></i>
            obsidian
          </h1>
          <p class="page-subtitle">
            Gestión de notas y conocimientos en formato markdown.
          </p>
        </div>
        
        <div class="page-content">
          <!-- Contenido pendiente de implementar -->
          <div class="empty-state">
            <i class="mdi mdi-account-multiple-outline"></i>
            <h3>Contenido en desarrollo</h3>
            <p>Esta sección estará disponible próximamente.</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import SidebarMenu from '@/components/common/SidebarMenu.vue'
import AppHeader from '@/components/common/AppHeader.vue'
import { ref } from 'vue'

// Estado del sidebar
const sidebarExpanded = ref(false)

// Manejar toggle del sidebar
const handleSidebarToggle = (expanded) => {
  sidebarExpanded.value = expanded
}
</script>

<style scoped>
.abm-usuarios-layout {
  min-height: 100vh;
  background: var(--bg-secondary);
}

.main-content {
  padding: 90px 30px 30px 110px;
  transition: all 0.3s ease;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.page-content {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .main-content {
    padding: 90px 20px 20px 20px;
  }
}
</style>