<template>
  <div class="min-h-screen bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100">
      <!-- Loading global -->
    <div
        v-if="authStore.loading && !authStore.isAuthenticated"
      class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40"
      >
      <div class="h-16 w-16 animate-spin rounded-full border-4 border-slate-300 border-t-blue-500"></div>
        <div class="mt-4 text-center">
          <p>Verificando autenticación...</p>
        </div>
    </div>

      <!-- Router view para las páginas -->
      <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'

// Store de autenticación
const authStore = useAuthStore()

// Composable de tema (Tailwind)
const { initTheme } = useTheme()

// Inicializar autenticación al montar el componente
onMounted(async () => {
  // Inicializar el tema
  initTheme()

  // Solo inicializar si hay tokens pero no hay usuario
  if (authStore.accessToken && !authStore.user) {
    try {
      await authStore.initializeAuth()
    } catch {
      // Error silencioso - no mostrar al usuario
    }
  }
})
</script>

<style scoped>
/* Sin estilos globales: se usan utilidades Tailwind */
</style>
