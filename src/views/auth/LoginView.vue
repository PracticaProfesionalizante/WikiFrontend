<!-- Vista principal de login que actúa como contenedor -->
<template>
  <!-- Contenedor de Vuetify que ocupa toda la altura de la pantalla -->
  <v-container fluid class="fill-height">
    <!-- Fila centrada vertical y horizontalmente -->
    <v-row justify="center" align="center">
      <!-- Columna responsiva: 12 cols en móvil, 8 en tablet, 4 en desktop -->
      <v-col cols="12" sm="8" md="4">
        <!-- Tarjeta con sombra elevada para el formulario -->
        <v-card class="elevation-12">
          <v-card-title class="text-center">
            <h2>Iniciar Sesión</h2>
          </v-card-title>
          <v-card-text>
            <!-- Componente del formulario de login -->
            <LoginForm />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
// Importa el componente del formulario de login
import LoginForm from '@/components/auth/LoginForm.vue'
</script>