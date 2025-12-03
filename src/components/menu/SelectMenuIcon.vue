<template>
  <div>
    <label
      for="icon-type-selector"
      class="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100"
    >
      <i class="fas fa-palette text-blue-600"></i>
      Icono del Menú
    </label>
    <div>
      <!-- Selector de tipo de icono -->
      <div id="icon-type-selector" class="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div
          v-for="option in iconTypeOptions"
          :key="option.type"
          class="cursor-pointer rounded-xl border-2 p-4 text-center transition"
          :class="{
            'border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20':
              iconType === option.type,
            'border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500':
              iconType !== option.type,
          }"
          @click="selectIconType(option.type)"
        >
          <i :class="option.iconClass" class="mb-2 text-2xl"></i>
          <h5 class="font-semibold text-slate-900 dark:text-slate-100">{{ option.title }}</h5>
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ option.description }}</p>
        </div>
      </div>

      <!-- Contenido condicional basado en la selección -->
      <div v-if="iconType === 'icon'">
        <IconSelector :modelValue="props.modelValue" @update:modelValue="handleIconUpdate" />
      </div>
      <div v-if="iconType === 'image'">
        <ImageSelector :modelValue="props.modelValue" @update:modelValue="handleIconUpdate" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineEmits, defineProps } from 'vue'
import { ref } from 'vue'
import IconSelector from '@/components/common/IconSelector.vue'
import ImageSelector from '@/components/menu/ImageSelector.vue'

const props = defineProps({
  // Use modelValue to be compatible with v-model
  modelValue: {
    type: String,
    default: null,
    required: true,
  },
})

// Emit 'update:modelValue' to support v-model
const emit = defineEmits(['update:modelValue'])

const iconType = ref('default')

const iconTypeOptions = [
  {
    type: 'default',
    iconClass: 'fas fa-upload',
    title: 'Selección Automática',
    description: 'Icono genérico o sube uno nuevo.',
  },
  {
    type: 'icon',
    iconClass: 'fas fa-icons',
    title: 'Seleccionar Icono',
    description: 'Elige de una lista predefinida.',
  },
  { type: 'image', iconClass: 'fas fa-image', title: 'Seleccionar Imagen', description: 'Usa una imagen de la galería.' },
]

const selectIconType = (type) => {
  iconType.value = type
  if (type === 'default') {
    handleIconUpdate('fa-file')
    return
  }
}

const handleIconUpdate = (newIcon) => {
  emit('update:modelValue', newIcon)
}
</script>

<style scoped></style>
