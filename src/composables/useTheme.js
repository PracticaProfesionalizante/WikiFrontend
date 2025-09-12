import { ref, watch } from 'vue'

// Estado global del tema
const isDarkMode = ref(false)

// Función para alternar el tema
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  applyTheme()
  saveThemePreference()
}

// Función para establecer el tema
const setTheme = (darkMode) => {
  isDarkMode.value = darkMode
  applyTheme()
  saveThemePreference()
}

// Aplicar el tema al DOM
const applyTheme = () => {
  const root = document.documentElement
  if (isDarkMode.value) {
    root.classList.add('dark-theme')
    root.classList.remove('light-theme')
  } else {
    root.classList.add('light-theme')
    root.classList.remove('dark-theme')
  }
}

// Guardar preferencia en localStorage
const saveThemePreference = () => {
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
}

// Cargar preferencia desde localStorage
const loadThemePreference = () => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark'
  } else {
    // Detectar preferencia del sistema
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyTheme()
}

// Inicializar el tema
const initTheme = () => {
  loadThemePreference()
  
  // Escuchar cambios en la preferencia del sistema
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      isDarkMode.value = e.matches
      applyTheme()
    }
  })
}

// Composable principal
export const useTheme = () => {
  return {
    isDarkMode,
    toggleTheme,
    setTheme,
    initTheme
  }
}