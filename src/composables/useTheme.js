import { ref, watch } from 'vue'
import { useTheme as useVuetifyTheme } from 'vuetify'

// Estado global del tema
const isDarkMode = ref(false)
let vuetifyTheme = null

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

// Aplicar el tema al DOM y Vuetify
const applyTheme = () => {
  const root = document.documentElement

  // Aplicar clases CSS personalizadas
  if (isDarkMode.value) {
    root.classList.add('dark-theme')
    root.classList.remove('light-theme')
  } else {
    root.classList.add('light-theme')
    root.classList.remove('dark-theme')
  }

  // Sincronizar con Vuetify si está disponible
  if (vuetifyTheme) {
    try {
      const themeName = isDarkMode.value ? 'dark' : 'light'

      // Verificar si el tema ya está aplicado para evitar warnings innecesarios
      if (
        vuetifyTheme.global &&
        vuetifyTheme.global.name &&
        vuetifyTheme.global.name.value !== themeName
      ) {
        // Usar el método correcto para Vuetify 3.x: asignar directamente al nombre
        // En versiones más recientes de Vuetify 3, se debe usar theme.global.name directamente
        vuetifyTheme.global.name = themeName
      }
    } catch (error) {
    }
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

// Función para inicializar Vuetify theme (debe llamarse desde un componente)
const initVuetifyTheme = () => {
  if (!vuetifyTheme) {
    try {
      vuetifyTheme = useVuetifyTheme()
    } catch (error) {
    }
  }
}

// Composable principal
export const useTheme = () => {
  return {
    isDarkMode,
    toggleTheme,
    setTheme,
    initTheme,
    initVuetifyTheme,
  }
}
