<template>
  <div class="space-y-4">
    <!-- Buscador de imágenes -->
    <div class="relative">
      <i
        class="fas fa-search pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
      ></i>
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Buscar por nombre de imagen..."
        class="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pl-12 pr-12 text-slate-900 placeholder-slate-400 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
      />
      <button
        v-if="searchQuery"
        @click="searchQuery = ''"
        class="absolute right-4 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-600 dark:hover:text-slate-200"
        title="Limpiar búsqueda"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Contenedor de la galería de imágenes -->
    <div
      class="grid max-h-72 grid-cols-3 gap-4 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8"
    >
      <div
        v-for="image in filteredImages"
        :key="image.path"
        class="relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 bg-white transition-all duration-200 dark:bg-slate-800"
        :class="{
          'border-blue-500 ring-2 ring-blue-500/50': props.modelValue === image.path,
          'border-transparent hover:border-blue-400': props.modelValue !== image.path,
        }"
        @click="selectImage(image.path)"
        :title="image.name"
      >
        <img
          :src="image.url"
          :alt="image.name"
          class="h-full w-full object-contain p-1"
          loading="lazy"
        />
        <div
          v-if="props.modelValue === image.path"
          class="absolute inset-0 grid place-items-center bg-blue-500/50"
        >
          <i class="fas fa-check-circle text-2xl text-white"></i>
        </div>
      </div>

      <!-- Mensaje si no hay resultados -->
      <div v-if="filteredImages.length === 0" class="col-span-full py-8 text-center">
        <p class="text-slate-500 dark:text-slate-400">
          No se encontraron imágenes con el nombre "{{ searchQuery }}".
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])

const searchQuery = ref('')

// Usamos import.meta.glob para obtener dinámicamente todas las imágenes de la carpeta.
// Esto es una característica de Vite que funciona muy bien para estos casos.
const imageModules = import.meta.glob('@/assets/images/menu/logos/*')

const images = Object.entries(imageModules).map(([path, loader]) => {
  const name = path.split('/').pop()
  return {
    path: path, // Guardamos el path para usarlo como valor
    name: name,
    url: new URL(path, import.meta.url).href,
  }
})

const filteredImages = computed(() => {
  if (!searchQuery.value) {
    return images
  }
  const query = searchQuery.value.toLowerCase()
  return images.filter((image) => image.name.toLowerCase().includes(query))
})

const selectImage = (imagePath) => {
  // Emitimos la acción con el path de la imagen seleccionada.
  emit('update:modelValue', imagePath)
}
</script>

<style scoped>
/* Estilos adicionales si fueran necesarios */
</style>
