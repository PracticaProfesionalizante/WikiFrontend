/**
 * Utilidad para manejar fallbacks de iconos Material Design
 * Ayuda a resolver problemas de compatibilidad entre navegadores
 */

/**
 * Verifica si los iconos MDI están cargados correctamente
 * @returns {boolean} true si los iconos están disponibles
 */
export function checkMDIAvailability() {
  // Crear un elemento temporal para probar si la fuente está cargada
  const testElement = document.createElement('i')
  testElement.className = 'mdi mdi-home'
  testElement.style.position = 'absolute'
  testElement.style.left = '-9999px'
  testElement.style.fontSize = '16px'
  
  document.body.appendChild(testElement)
  
  // Verificar si el elemento tiene el ancho esperado de un icono MDI
  const hasIcon = testElement.offsetWidth > 0
  
  document.body.removeChild(testElement)
  
  return hasIcon
}

/**
 * Obtiene un icono de fallback si MDI no está disponible
 * @param {string} iconName - Nombre del icono MDI (ej: 'mdi-home')
 * @returns {string} Icono de fallback o el original
 */
export function getIconFallback(iconName) {
  if (!iconName) return 'mdi-help-circle'
  
  // Si MDI está disponible, devolver el icono original
  if (checkMDIAvailability()) {
    return iconName
  }
  
  // Mapeo de iconos MDI a caracteres Unicode como fallback
  const fallbackMap = {
    'mdi-home': '🏠',
    'mdi-menu': '☰',
    'mdi-settings': '⚙️',
    'mdi-user': '👤',
    'mdi-users': '👥',
    'mdi-file': '📄',
    'mdi-folder': '📁',
    'mdi-edit': '✏️',
    'mdi-delete': '🗑️',
    'mdi-plus': '➕',
    'mdi-minus': '➖',
    'mdi-check': '✓',
    'mdi-close': '✕',
    'mdi-arrow-left': '←',
    'mdi-arrow-right': '→',
    'mdi-arrow-up': '↑',
    'mdi-arrow-down': '↓',
    'mdi-search': '🔍',
    'mdi-filter': '🔽',
    'mdi-sort': '↕️',
    'mdi-refresh': '🔄',
    'mdi-download': '⬇️',
    'mdi-upload': '⬆️',
    'mdi-save': '💾',
    'mdi-print': '🖨️',
    'mdi-email': '✉️',
    'mdi-phone': '📞',
    'mdi-calendar': '📅',
    'mdi-clock': '🕐',
    'mdi-star': '⭐',
    'mdi-heart': '❤️',
    'mdi-warning': '⚠️',
    'mdi-error': '❌',
    'mdi-info': 'ℹ️',
    'mdi-help': '❓',
    'mdi-lock': '🔒',
    'mdi-unlock': '🔓',
    'mdi-eye': '👁️',
    'mdi-eye-off': '🙈'
  }
  
  return fallbackMap[iconName] || '❓'
}

/**
 * Aplica fallbacks de iconos a todos los elementos MDI en la página
 */
export function applyIconFallbacks() {
  if (checkMDIAvailability()) {
    return // Los iconos MDI funcionan correctamente
  }
  
  console.warn('Material Design Icons no están disponibles, aplicando fallbacks...')
  
  // Buscar todos los elementos con clases MDI
  const mdiElements = document.querySelectorAll('[class*="mdi-"]')
  
  mdiElements.forEach(element => {
    const classes = Array.from(element.classList)
    const mdiClass = classes.find(cls => cls.startsWith('mdi-'))
    
    if (mdiClass) {
      const fallback = getIconFallback(mdiClass)
      
      // Si es un emoji/carácter Unicode, reemplazar el contenido
      if (fallback.length <= 2) {
        element.textContent = fallback
        element.style.fontFamily = 'inherit'
        element.style.fontSize = element.style.fontSize || '16px'
      }
    }
  })
}

/**
 * Inicializa el sistema de fallback de iconos
 */
export function initIconFallback() {
  // Aplicar fallbacks cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyIconFallbacks)
  } else {
    applyIconFallbacks()
  }
  
  // También aplicar fallbacks cuando se agreguen nuevos elementos
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const mdiElements = node.querySelectorAll ? 
              node.querySelectorAll('[class*="mdi-"]') : []
            
            mdiElements.forEach(element => {
              const classes = Array.from(element.classList)
              const mdiClass = classes.find(cls => cls.startsWith('mdi-'))
              
              if (mdiClass && !checkMDIAvailability()) {
                const fallback = getIconFallback(mdiClass)
                if (fallback.length <= 2) {
                  element.textContent = fallback
                  element.style.fontFamily = 'inherit'
                }
              }
            })
          }
        })
      }
    })
  })
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
}