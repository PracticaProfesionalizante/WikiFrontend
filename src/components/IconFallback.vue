<template>
  <span 
    :class="iconClass"
    :style="iconStyle"
    @error="handleIconError"
    :title="iconName"
  >
    <!-- Mostrar icono MDI si está disponible -->
    <i v-if="!showFallback" :class="fullIconClass"></i>
    
    <!-- Mostrar fallback si el icono no carga -->
    <span v-else class="icon-fallback">
      {{ fallbackText }}
    </span>
  </span>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  size: {
    type: [String, Number],
    default: '24px'
  },
  color: {
    type: String,
    default: 'currentColor'
  }
})

const showFallback = ref(false)

// Computed para la clase completa del icono
const fullIconClass = computed(() => {
  if (props.icon.startsWith('mdi-')) {
    return `mdi ${props.icon}`
  } else if (props.icon.startsWith('mdi ')) {
    return props.icon
  } else {
    return `mdi mdi-${props.icon}`
  }
})

// Computed para el nombre del icono sin prefijos
const iconName = computed(() => {
  return props.icon.replace(/^(mdi-|mdi\s)/, '')
})

// Texto de fallback basado en el nombre del icono
const fallbackText = computed(() => {
  const name = iconName.value
  
  // Mapeo de iconos comunes a símbolos Unicode
  const iconMap = {
    'home': '🏠',
    'user': '👤',
    'settings': '⚙️',
    'menu': '☰',
    'search': '🔍',
    'edit': '✏️',
    'delete': '🗑️',
    'add': '➕',
    'remove': '➖',
    'save': '💾',
    'close': '✖️',
    'check': '✓',
    'arrow-left': '←',
    'arrow-right': '→',
    'arrow-up': '↑',
    'arrow-down': '↓',
    'eye': '👁️',
    'eye-off': '🙈',
    'lock': '🔒',
    'unlock': '🔓',
    'heart': '❤️',
    'star': '⭐',
    'bell': '🔔',
    'mail': '✉️',
    'phone': '📞',
    'calendar': '📅',
    'clock': '🕐',
    'folder': '📁',
    'file': '📄',
    'image': '🖼️',
    'video': '🎥',
    'music': '🎵',
    'download': '⬇️',
    'upload': '⬆️',
    'share': '📤',
    'print': '🖨️',
    'refresh': '🔄',
    'loading': '⏳',
    'warning': '⚠️',
    'error': '❌',
    'info': 'ℹ️',
    'success': '✅'
  }
  
  return iconMap[name] || '◯'
})

// Clases CSS para el contenedor
const iconClass = computed(() => {
  return [
    'icon-wrapper',
    { 'icon-fallback-mode': showFallback.value }
  ]
})

// Estilos dinámicos
const iconStyle = computed(() => {
  return {
    fontSize: typeof props.size === 'number' ? `${props.size}px` : props.size,
    color: props.color,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

// Función para manejar errores de carga de iconos
const handleIconError = () => {
  showFallback.value = true
}

// Verificar si el icono MDI está disponible
const checkIconAvailability = () => {
  // Crear elemento temporal para verificar si el icono se renderiza correctamente
  const testElement = document.createElement('i')
  testElement.className = fullIconClass.value
  testElement.style.position = 'absolute'
  testElement.style.left = '-9999px'
  testElement.style.fontSize = '16px'
  
  document.body.appendChild(testElement)
  
  setTimeout(() => {
    const width = testElement.offsetWidth
    if (width === 0) {
      showFallback.value = true
    }
    document.body.removeChild(testElement)
  }, 100)
}

// Verificar disponibilidad al montar el componente
onMounted(() => {
  checkIconAvailability()
})

// Verificar nuevamente si cambia el icono
watch(() => props.icon, () => {
  showFallback.value = false
  checkIconAvailability()
})
</script>

<style scoped>
.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.icon-fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;
  font-size: 0.9em;
  opacity: 0.8;
}

.icon-fallback-mode {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  padding: 2px;
}

/* Animación para iconos que fallan en cargar */
.icon-wrapper.icon-fallback-mode {
  animation: fallbackPulse 0.3s ease-in-out;
}

@keyframes fallbackPulse {
  0% { opacity: 0.5; transform: scale(0.9); }
  50% { opacity: 0.8; transform: scale(1.05); }
  100% { opacity: 1; transform: scale(1); }
}
</style>