import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const documentsStore = defineStore('document', () => {

  const folderName = ref(localStorage.getItem('currentFolder') || '')
  const path = ref(localStorage.getItem('currentPath') || '')
  const type = ref(localStorage.getItem('currentType') || null)


  const getFolderName = computed(() => folderName.value)
  const getPath = computed(() => path.value)
  const getType = computed(() => type.value)

  const setPathAndType = (newFolder, newPath, newType) => {
    folderName.value = newFolder
    path.value = newPath
    type.value = newType

    localStorage.setItem('currentFolder', newFolder || '')
    localStorage.setItem('currentPath', newPath || '')
    localStorage.setItem('currentType', newType || null)
  }

  const clearStore = () => {
    folderName.value = ''
    path.value = ''
    type.value = null
    localStorage.removeItem('currentFolder')
    localStorage.removeItem('currentPath')
    localStorage.removeItem('currentType')
  }

  return {
    // Getters
    getFolderName,
    getPath,
    getType,

    // Actions
    setPathAndType,
    clearStore,
  }
})
