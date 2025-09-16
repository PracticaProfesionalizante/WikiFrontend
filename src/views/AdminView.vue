<!-- Vista de administración solo para usuarios con rol SuperUser -->
<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <h1>Panel de Administración</h1>
          </v-card-title>
          <v-card-text>
            <!-- Información específica para administradores -->
            <p>Esta es una página solo para administradores.</p>
            <!-- Muestra datos del usuario actual -->
            <p>Usuario: {{ authStore.user?.name }}</p>
            <p>Rol: {{ authStore.user?.role }}</p>
            
            <v-divider class="my-4"></v-divider>
            
            <!-- Botón para volver al dashboard -->
            <v-btn 
              color="primary" 
              @click="goToDashboard"
              class="mr-2"
            >
              Volver al inicio
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
// Importa dependencias necesarias
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

// Instancias del store y router
const authStore = useAuthStore()
const router = useRouter()

// Función para navegar de vuelta al dashboard
const goToDashboard = () => {
  router.push('/dashboard')
}

// Función para cerrar sesión
const logout = async () => {
  await authStore.logout()
}
</script>