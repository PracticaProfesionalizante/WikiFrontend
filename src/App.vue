<template>
  <!-- Aplicación principal de Vuetify -->
  <v-app>
    <!-- Barra de navegación superior removida para evitar duplicación con el sidebar -->
    
    <!-- Contenido principal -->
    <v-main>
      <!-- Loading global -->
      <v-overlay 
        v-if="authStore.loading && !authStore.isAuthenticated" 
        class="align-center justify-center"
      >
        <v-progress-circular 
          indeterminate 
          size="64" 
          color="primary"
        ></v-progress-circular>
        <div class="mt-4 text-center">
          <p>Verificando autenticación...</p>
        </div>
      </v-overlay>
      
      <!-- Router view para las páginas -->
      <router-view />
    </v-main>
    
    <!-- Snackbar para notificaciones globales -->
    <v-snackbar
      v-model="showError"
      color="error"
      timeout="5000"
      top
    >
      {{ authStore.error }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="clearError"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

// Store de autenticación
const authStore = useAuthStore()

// Computed para mostrar errores
const showError = computed({
  get: () => !!authStore.error,
  set: () => authStore.clearError()
})

// Función para logout
const logout = async () => {
  await authStore.logout()
}

// Función para limpiar errores
const clearError = () => {
  authStore.clearError()
}

// Inicializar autenticación al montar el componente
onMounted(async () => {
  // Solo inicializar si hay tokens pero no hay usuario
  if (authStore.accessToken && !authStore.user) {
    try {
      await authStore.initializeAuth()
    } catch (error) {
      // Error silencioso - solo log para debugging, no mostrar al usuario
      console.warn('Error al inicializar autenticación (silencioso):', error)
    }
  }
})
</script>

<style>
/* Estilos globales */
body {
  margin: 0;
  font-family: 'Roboto', sans-serif;
}

/* Tema oscuro por defecto */
.v-application {
  background: #121212 !important;
}

/* Estilos para el overlay de loading */
.v-overlay .v-progress-circular {
  margin-bottom: 16px;
}
</style>