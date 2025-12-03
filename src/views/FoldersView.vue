<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMenuStore } from '@/stores/menuStore'
import { documentsStore } from '@/stores/documentsStore'

const router = useRouter()
const menuStore = useMenuStore()
const documentStore = documentsStore()

const folder = computed(() => menuStore.getFolder)

const isIcon = (icon) => typeof icon === 'string' && icon.startsWith('fa-')
// const isIcon = (icon) => typeof icon === 'string' && icon.length > 0

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
    <div class="mb-6">
      <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
        {{ folder?.name || 'Selecciona una carpeta' }}
      </h1>
      <p class="m-0 text-slate-600 dark:text-slate-400">Selecciona una carpeta para navegar.</p>
    </div>

    <div
      v-if="folder?.children == null || folder?.children.length === 0"
      class="text-center py-16 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40"
    >
      <div class="text-5xl mb-4">📁</div>
      <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Esta sección no contiene subcarpetas</h2>
      <p class="text-slate-600 dark:text-slate-400">Intenta volver atrás o elige otra sección del menú.</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="item in folder?.children || []"
        :key="item?.id"
        class="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 hover:-translate-y-1"
        @click="navigateTo(item)"
        :title="item?.path || ''"
      >
        <div v-if="isIcon(item?.icon)" class="flex h-32 items-center justify-center bg-blue-600 p-4 transition-colors group-hover:bg-blue-700">
           <i :class="['fas', item.icon, 'text-6xl', 'text-black']"></i>
        </div>
        <div v-else class="flex h-32 items-center justify-center bg-blue-600 p-4 transition-colors group-hover:bg-blue-700">
          <img
            :src="item.icon"
            :alt="item.name"
            class="h-full w-full object-contain p-1"
            loading="lazy"
          />
        </div>


        <div class="flex flex-1 flex-col justify-center p-4">
          <h3 class="m-0 text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {{ item?.name || 'Sin nombre' }}
          </h3>
          </div>
      </div>
    </div>
  </div>
</template>
