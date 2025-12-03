import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMenuStore = defineStore('menu', () => {

  const folder = ref(localStorage.getItem('menuFolder') || {})
  const getFolder = computed(() => folder.value)

  const setFolder = (newFolder) => {
    console.log('New folder:', newFolder)
    folder.value = newFolder
    console.log('folder.value:', folder.value)

    localStorage.setItem('menuFolder', newFolder)
  }

  return {
    getFolder,
    setFolder,
  }
})
