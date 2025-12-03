<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMenuStore } from '@/stores/menuStore'
import { documentsStore } from '@/stores/documentsStore'

const router = useRouter()
const menuStore = useMenuStore()
const documentStore = documentsStore()
const folder = computed(() => menuStore.getFolder)

const navigateTo = (childSelected) => {
  let baseEndpoint = "/"
  if(String(childSelected.view).includes('TYPE')){
    documentStore.setPathAndType(childSelected.name, childSelected.path, childSelected.view)
    baseEndpoint = "/docs/"
  } else {
    menuStore.setFolder(childSelected);
  }
  router.push(`${baseEndpoint}${childSelected.view}`);
}
</script>

<template>
  <div class="p-6 sm:p-8">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
        {{ folder?.name || 'Selecciona una carpeta' }}
      </h1>
      <p class="m-0 text-slate-600 dark:text-slate-400">Selecciona una carpeta para navegar.</p>
    </div>

    <!-- Estado vacío -->
    <div
      v-if="folder?.children == null || folder?.children.length === 0"
      class="text-center py-16 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40"
    >
      <div class="text-5xl mb-4">📁</div>
      <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Esta sección no contiene subcarpetas</h2>
      <p class="text-slate-600 dark:text-slate-400">Intenta volver atrás o elige otra sección del menú.</p>
    </div>

    <!-- Grid de carpetas -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="item in folder?.children || []"
        :key="item?.id"
        class="group rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm hover:shadow-lg cursor-pointer transition"
        @click="navigateTo(item)"
        :title="item?.path || ''"
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
              {{ item?.name || 'Sin nombre' }}
            </h3>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
