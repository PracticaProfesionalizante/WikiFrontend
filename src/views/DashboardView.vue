<template>
  <div class="dashboard-layout">
    <SidebarMenu />
    <main class="main-content" :class="{ 'with-sidebar': true }">
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
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'

const authStore = useAuthStore()
const { user } = authStore

onMounted(async () => {
  // Obtener información actualizada del usuario desde el backend
  if (authStore.isAuthenticated && !user?.name) {
    try {
      await authStore.fetchCurrentUser()
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error)
    }
  }
})
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

.main-content {
  flex: 1;
  margin-left: 60px;
  transition: margin-left 0.3s ease;
  min-height: 100vh;
  background-image: url('/src/components/assets/fondo_dash.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
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
  min-height: 100vh;
  padding: 2rem;
}

.welcome-content {
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 3rem 2.5rem;
  box-shadow: 0 20px 60px rgba(37, 99, 235, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  max-width: 600px;
  width: 100%;
  animation: fadeInUp 0.8s ease-out;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 1.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-message {
  font-size: 1.2rem;
  color: #4a5568;
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
  }
  
  .welcome-container {
    padding: 1rem;
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