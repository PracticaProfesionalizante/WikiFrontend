/**
 * Utilidad para manejar fallbacks de iconos Material Design
 * Ayuda a resolver problemas de compatibilidad entre navegadores
 */

/**
 * Verifica si los iconos MDI están cargados correctamente
 * Incluye verificaciones específicas para Windows 10 y Chrome/Edge
 * @returns {Promise<boolean>} true si los iconos están disponibles
 */
export async function checkMDIAvailability() {
  return new Promise((resolve) => {
    // Verificar si la fuente está en el documento
    const fontLinks = document.querySelectorAll('link[href*="materialdesignicons"]')
    if (fontLinks.length === 0) {
      console.warn('MDI: No se encontró el enlace a la fuente Material Design Icons')
      resolve(false)
      return
    }

    // Crear un elemento temporal para probar si la fuente está cargada
    const testElement = document.createElement('i')
    testElement.className = 'mdi mdi-home'
    testElement.style.position = 'absolute'
    testElement.style.left = '-9999px'
    testElement.style.fontSize = '16px'
    testElement.style.visibility = 'hidden'
    
    document.body.appendChild(testElement)
    
    // Usar requestAnimationFrame para asegurar que el elemento esté renderizado
    requestAnimationFrame(() => {
      // Verificaciones múltiples para Windows 10 + Chrome/Edge
      const computedStyle = window.getComputedStyle(testElement)
      const fontFamily = computedStyle.fontFamily
      
      // Verificar si la fuente MDI está aplicada
      const hasMDIFont = fontFamily && (
        fontFamily.includes('Material Design Icons') ||
        fontFamily.includes('materialdesignicons') ||
        fontFamily.includes('mdi')
      )
      
      // Verificar dimensiones del icono
      const hasValidDimensions = testElement.offsetWidth > 0 && testElement.offsetHeight > 0
      
      // Verificar contenido del pseudo-elemento ::before (donde están los iconos MDI)
      const beforeContent = computedStyle.getPropertyValue('content')
      const hasIconContent = beforeContent && beforeContent !== 'none' && beforeContent !== '""'
      
      document.body.removeChild(testElement)
      
      const isAvailable = hasMDIFont && (hasValidDimensions || hasIconContent)
      
      if (!isAvailable) {
        console.warn('MDI: Iconos no disponibles - Font:', hasMDIFont, 'Dimensions:', hasValidDimensions, 'Content:', hasIconContent)
      }
      
      resolve(isAvailable)
    })
  })
}

/**
 * Obtiene un icono de fallback si MDI no está disponible
 * @param {string} iconName - Nombre del icono MDI (ej: 'mdi-home')
 * @returns {Promise<string>} Icono de fallback o el original
 */
export async function getIconFallback(iconName) {
  if (!iconName) return 'mdi-help-circle'
  
  // Si MDI está disponible, devolver el icono original
  const isAvailable = await checkMDIAvailability()
  if (isAvailable) {
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
 * Versión mejorada para Windows 10 + Chrome/Edge
 */
export async function applyIconFallbacks() {
  const isAvailable = await checkMDIAvailability()
  if (isAvailable) {
    return // Los iconos MDI funcionan correctamente
  }
  
  console.warn('Material Design Icons no están disponibles, aplicando fallbacks...')
  
  // Buscar todos los elementos con clases MDI
  const mdiElements = document.querySelectorAll('[class*="mdi-"]')
  
  for (const element of mdiElements) {
    const classes = Array.from(element.classList)
    const mdiClass = classes.find(cls => cls.startsWith('mdi-'))
    
    if (mdiClass) {
      const fallback = await getIconFallback(mdiClass)
      
      // Si es un emoji/carácter Unicode, reemplazar el contenido
      if (fallback.length <= 2) {
        element.textContent = fallback
        element.style.fontFamily = 'inherit'
        element.style.fontSize = element.style.fontSize || '16px'
        element.style.lineHeight = '1'
        element.style.display = 'inline-block'
        element.style.textAlign = 'center'
        
        // Agregar clase para identificar elementos con fallback
        element.classList.add('mdi-fallback-applied')
      }
    }
  }
}

/**
 * Fuerza la recarga de fuentes MDI (útil para problemas de caché en Windows)
 */
export function forceReloadMDIFonts() {
  const fontLinks = document.querySelectorAll('link[href*="materialdesignicons"]')
  
  fontLinks.forEach(link => {
    const href = link.href
    link.href = ''
    
    // Pequeño delay antes de restaurar el href
    setTimeout(() => {
      link.href = href + '?v=' + Date.now()
    }, 100)
  })
}

/**
 * Inicializa el sistema de fallback de iconos
 * Versión mejorada para Windows 10
 */
export async function initIconFallback() {
  console.log('Inicializando sistema de fallback de iconos MDI...')
  
  // Función para aplicar fallbacks con retry
  const applyWithRetry = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        await applyIconFallbacks()
        break
      } catch (error) {
        console.warn(`Intento ${i + 1} de aplicar fallbacks falló:`, error)
        if (i === retries - 1) {
          console.error('No se pudieron aplicar los fallbacks después de', retries, 'intentos')
        }
        // Esperar un poco antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
  }
  
  // Aplicar fallbacks cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyWithRetry)
  } else {
    await applyWithRetry()
  }
  
  // Intentar recargar fuentes si hay problemas (específico para Windows)
  const isWindows = navigator.platform.toLowerCase().includes('win')
  if (isWindows) {
    setTimeout(() => {
      checkMDIAvailability().then(isAvailable => {
        if (!isAvailable) {
          console.log('Intentando recargar fuentes MDI para Windows...')
          forceReloadMDIFonts()
          setTimeout(applyWithRetry, 1000)
        }
      })
    }, 2000)
  }
  
  // También aplicar fallbacks cuando se agreguen nuevos elementos
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(async (node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const mdiElements = node.querySelectorAll ? 
              node.querySelectorAll('[class*="mdi-"]') : []
            
            const isAvailable = await checkMDIAvailability()
            
            for (const element of mdiElements) {
              const classes = Array.from(element.classList)
              const mdiClass = classes.find(cls => cls.startsWith('mdi-'))
              
              if (mdiClass && !isAvailable && !element.classList.contains('mdi-fallback-applied')) {
                const fallback = await getIconFallback(mdiClass)
                if (fallback.length <= 2) {
                  element.textContent = fallback
                  element.style.fontFamily = 'inherit'
                  element.style.fontSize = element.style.fontSize || '16px'
                  element.style.lineHeight = '1'
                  element.style.display = 'inline-block'
                  element.style.textAlign = 'center'
                  element.classList.add('mdi-fallback-applied')
                }
              }
            }
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