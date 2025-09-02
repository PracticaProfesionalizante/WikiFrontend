<template>
  <!-- Aplicación principal de Vuetify -->
  <v-app>
    <!-- Barra de navegación superior -->
    <v-app-bar 
      v-if="authStore.isAuthenticated" 
      app 
      color="primary" 
      dark
    >
      <v-app-bar-title>WikiFrontend</v-app-bar-title>
      
      <v-spacer></v-spacer>
      
      <!-- Información del usuario -->
      <v-chip 
        v-if="authStore.user" 
        class="mr-4"
        color="secondary"
      >
        <v-icon left>mdi-account</v-icon>
        {{ authStore.user.name || authStore.user.email }}
      </v-chip>
      
      <!-- Botón de logout -->
      <v-btn 
        icon 
        @click="logout"
        title="Cerrar Sesión"
      >
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>
    
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
      console.warn('Error al inicializar autenticación:', error)
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