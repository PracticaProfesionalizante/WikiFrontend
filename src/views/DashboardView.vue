<!-- Vista principal después del login -->
<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <h1>Dashboard</h1>
          </v-card-title>
          <v-card-text>
            <!-- Saludo personalizado con el nombre del usuario -->
            <p>¡Bienvenido, {{ authStore.user?.name || 'Usuario' }}!</p>
            <!-- Muestra el rol del usuario -->
            <p>Rol: {{ authStore.user?.role || 'Sin rol' }}</p>
            
            <v-divider class="my-4"></v-divider>
            
            <!-- Botón de admin solo visible para roles Admin y SuperUser -->
            <v-btn 
              color="primary" 
              @click="goToAdmin" 
              v-if="authStore.hasRole('Admin') || authStore.hasRole('SuperUser')"
              class="mr-2"
            >
              Ir a Administración
            </v-btn>
            
            <!-- Botón para cerrar sesión -->
            <v-btn 
              color="error" 
              @click="logout"
            >
              Cerrar Sesión
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
// Importa el store de autenticación y el router
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

// Instancias del store y router
const authStore = useAuthStore()
const router = useRouter()

// Función para navegar a la página de administración
const goToAdmin = () => {
  router.push('/admin')
}

// Función para cerrar sesión (llama al método del store)
const logout = async () => {
  await authStore.logout()
}
</script>