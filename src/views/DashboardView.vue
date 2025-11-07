<template>
  <div class="flex min-h-screen bg-slate-100 dark:bg-slate-950">
    <SidebarMenu @sidebar-toggle="handleSidebarToggle" />
    <AppHeader :sidebar-expanded="sidebarExpanded" />

    <main
      class="relative flex-1 pt-20 transition-all duration-300"
      :class="[
        sidebarExpanded ? 'ml-0 md:ml-[280px]' : 'ml-0 md:ml-20',
      ]"
    >
      <div
        class="absolute inset-0 bg-cover bg-center"
        :style="{ backgroundImage: `url(${dashboardBackground})` }"
        aria-hidden="true"
      ></div>
      <div class="absolute inset-0 bg-slate-950/75"></div>

      <section class="relative flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <article class="w-full max-w-2xl rounded-3xl border border-white/20 bg-white/90 p-8 text-center shadow-2xl backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/85 sm:p-12">
          <div class="space-y-6">
            <h1 class="bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl">
              ¡Hola, {{ user?.username || 'Usuario' }}!
            </h1>
            <p class="text-base font-medium leading-relaxed text-slate-700 dark:text-slate-300 sm:text-lg">
              Para gestionar el contenido de la plataforma utiliza el menú lateral. Encontrarás todas las secciones disponibles y podrás acceder rápidamente a tus tareas habituales.
          </p>
        </div>
        </article>
      </section>
    </main>
  </div>
</template>

<script setup>
import SidebarMenu from '@/components/common/SidebarMenu.vue'
import AppHeader from '@/components/common/AppHeader.vue'
import { useAuthStore } from '@/stores/auth'
import { ref, onMounted } from 'vue'
import dashboardBackground from '@/assets/images/backgrounds/fondo_dash.webp'

const authStore = useAuthStore()
const { user } = authStore

// Estado del sidebar
const sidebarExpanded = ref(false)

// Manejar toggle del sidebar
const handleSidebarToggle = (expanded) => {
  sidebarExpanded.value = expanded
}

onMounted(async () => {
/*
    DETECCION:
    - Este if aparentemente esta de mas ya que la autenticacion y el usuario se cargan antes de navegar a esta pantalla

    RECOMENDACION:
    - Eliminar metodo si no se le da uso
    - Mantener validacion y solo hacer la carga de usuario desde esta pantalla
*/
  // Obtener información actualizada del usuario desde el backend
  if (authStore.isAuthenticated && !user?.name) {
    try {
      // Pasar false para no mostrar error al usuario, solo log interno
      await authStore.fetchCurrentUser(false)
    } catch {
      // Error silencioso - no mostrar al usuario
    }
  }
})
</script>
