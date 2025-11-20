<template>
  <a :href="url" target="_blank" rel="noopener noreferrer" class="link-button-custom">
    <img v-if="logoUrl" :src="logoUrl" alt="Logo de Enlace Externo" class="link-button-logo" />

    <span class="link-button-title">
      {{ props.title || 'Abrir Recurso' }}
    </span>

    <i class="fas fa-external-link-alt link-button-icon"></i>
  </a>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  // URL de destino a la que apunta el botón
  url: {
    type: String,
    required: true,
  },
  // URL de la imagen/logo que se mostrará en el botón (¡Nuevo campo!)
  logoUrl: {
    type: String,
    default: '',
  },
  // Título descriptivo que aparecerá en el botón
  title: {
    type: String,
    default: 'Ver Documento',
  },
})
</script>

<style scoped>
/* Estilos básicos para hacerlo parecer un botón con logo (adaptar a Vuetify/Tailwind) */
.link-button-custom {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  border-radius: 8px;
  background-color: #1e88e5; /* Color primario de Vuetify */
  color: white;
  text-decoration: none;
  font-weight: 600;
  transition:
    background-color 0.3s ease,
    transform 0.1s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: fit-content;
}
.link-button-custom:hover {
  background-color: #1565c0;
  transform: translateY(-1px);
}
.link-button-logo {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
.link-button-icon {
  font-size: 14px;
}
</style>
