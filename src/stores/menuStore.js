import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMenuStore = defineStore('menu', () => {

  const folder = ref(localStorage.getItem('menuFolder') || {})
  const getFolder = computed(() => folder.value)

  const setFolder = (newFolder) => {
    folder.value = newFolder
    localStorage.setItem('menuFolder', newFolder)
  }

  return {
    getFolder,
    setFolder,
  }
})
