import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const documentsStore = defineStore('document', () => {

  const path = ref(localStorage.getItem('currentPath') || '')
  const type = ref(localStorage.getItem('currentType') || '')

  const getPath = computed(() => path.value)
  const getType = computed(() => type.value)

  const setPathAndType = (newPath, newType) => {
    path.value = newPath
    type.value = newType

    localStorage.setItem('currentPath', newPath || '')
    localStorage.setItem('currentType', newType || '')
  }

  const clearStore = () => {
    path.value = ''
    type.value = ''
    localStorage.removeItem('currentPath')
    localStorage.removeItem('currentType')
  }

  return {
    // Getters
    getPath,
    getType,

    // Actions
    setPathAndType,
    clearStore,
  }
})
