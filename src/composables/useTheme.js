import { ref } from 'vue'

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

// Aplicar el tema al DOM (Tailwind)
const applyTheme = () => {
  const root = document.documentElement
  if (isDarkMode.value) {
    root.classList.add('dark')
    root.setAttribute('data-theme', 'dark')
  } else {
    root.classList.remove('dark')
    root.setAttribute('data-theme', 'light')
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
  const mql = window.matchMedia('(prefers-color-scheme: dark)')
  const handler = (e) => {
    if (!localStorage.getItem('theme')) {
      isDarkMode.value = e.matches
      applyTheme()
    }
  }
  mql.addEventListener('change', handler)
}

// Composable principal
export const useTheme = () => {
  return {
    isDarkMode,
    toggleTheme,
    setTheme,
    initTheme,
  }
}
