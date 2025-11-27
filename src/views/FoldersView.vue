<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMenuStore } from '@/stores/menuStore'

const route = useRoute()
const router = useRouter()
const menuStore = useMenuStore()

// Submenús para la ruta actual
const submenus = computed(() => menuStore.getSubmenusByPath(route.path))

// Título dinámico de la vista
const title = computed(() => {
  if (route.meta?.title) return route.meta.title
  const segments = route.path.split('/').filter(Boolean)
  const last = segments[segments.length - 1]
  return last ? decodeURIComponent(last).replace(/[-_]/g, ' ') : 'Carpetas'
})

// Navegación al hacer clic en una carpeta
const mapsTo = (path) => {
  const target = typeof path === 'string' ? path.trim() : ''
  if (target) {
    router.push(target)
  }
}
</script>

<template>
  <div class="p-6 sm:p-8">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
        {{ title }}
      </h1>
      <p class="m-0 text-slate-600 dark:text-slate-400">Selecciona una carpeta para navegar.</p>
    </div>

    <!-- Estado vacío -->
    <div
      v-if="submenus.length === 0"
      class="text-center py-16 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40"
    >
      <div class="text-5xl mb-4">📁</div>
      <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Esta sección no contiene subcarpetas</h2>
      <p class="text-slate-600 dark:text-slate-400">Intenta volver atrás o elige otra sección del menú.</p>
    </div>

    <!-- Grid de carpetas -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="item in submenus"
        :key="item.id || item.path || item.url || item.name"
        class="group rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm hover:shadow-lg cursor-pointer transition"
        @click="mapsTo(item.path || item.url)"
        :title="item.path || item.url || ''"
      >
        <div class="flex items-center gap-4">
          <div class="grid h-12 w-12 place-items-center rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
            <!-- Usa emoji temporal de carpeta -->
            <span class="text-2xl">📁</span>
          </div>
          <div class="flex-1">
            <h3
              class="m-0 font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400"
            >
              {{ item.name || 'Sin nombre' }}
            </h3>
            <p v-if="item.path || item.url" class="m-0 text-xs text-slate-500 dark:text-slate-400 truncate">
              {{ item.path || item.url }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
