<template>
  <div class="dashboard-layout">
    <SidebarMenu @sidebar-toggle="handleSidebarToggle" />
    <AppHeader :sidebar-expanded="sidebarExpanded" />
    <main class="main-content" :class="{ 'with-sidebar': true, 'with-header': true }">
      <div class="welcome-container">
        <div class="welcome-content">
          <h1 class="welcome-title">
            ¡Hola, {{ user?.username || 'Usuario' }}!
          </h1>
          <p class="welcome-message">
            Para realizar alguna gestión dirígete al menú lateral. Ahí encontrarás todas las opciones disponibles.
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import SidebarMenu from '@/components/common/SidebarMenu.vue'
import AppHeader from '@/components/common/AppHeader.vue'
import { useAuthStore } from '@/stores/auth'
import { ref, onMounted } from 'vue'

const authStore = useAuthStore()
const { user } = authStore

// Estado del sidebar
const sidebarExpanded = ref(false)

// Manejar toggle del sidebar
const handleSidebarToggle = (expanded) => {
  sidebarExpanded.value = expanded
}

onMounted(async () => {
  // Obtener información actualizada del usuario desde el backend
  if (authStore.isAuthenticated && !user?.name) {
    try {
      // Pasar false para no mostrar error al usuario, solo log interno
      await authStore.fetchCurrentUser(false)
    } catch (error) {
      // Error silencioso - no mostrar al usuario
    }
  }
})
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
}

.main-content {
  flex: 1;
  margin-left: 60px;
  transition: margin-left 0.3s ease;
  height: 100vh;
  overflow: hidden;
  background-image: url('/src/assets/images/backgrounds/fondo_dash.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.main-content.with-header {
  padding-top: 60px;
}

.main-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 20, 40, 0.7);
  z-index: 1;
}

.welcome-container {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 70px);
  padding: 2rem;
}

.welcome-content {
  text-align: center;
  background: var(--bg-primary);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 3rem 2.5rem;
  box-shadow: 0 20px 60px var(--shadow-color);
  border: 1px solid var(--border-color);
  max-width: 600px;
  width: 100%;
  animation: fadeInUp 0.8s ease-out;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  text-shadow: 0 2px 4px var(--shadow-color);
  background: linear-gradient(135deg, var(--accent-color), #1d4ed8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-message {
  font-size: 1.2rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
  font-weight: 500;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    height: 100vh;
  }
  
  .main-content.with-header {
    padding-top: 60px;
  }
  
  .welcome-container {
    padding: 1rem;
    height: calc(100vh - 60px);
  }
  
  .welcome-content {
    padding: 2rem 1.5rem;
  }
  
  .welcome-title {
    font-size: 2rem;
  }
  
  .welcome-message {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .welcome-container {
    padding: 0.5rem;
    height: calc(100vh - 70px);
  }
  
  .welcome-content {
    padding: 1.5rem 1rem;
  }
  
  .welcome-title {
    font-size: 1.8rem;
  }
  
  .welcome-message {
    font-size: 1rem;
  }
}
</style>