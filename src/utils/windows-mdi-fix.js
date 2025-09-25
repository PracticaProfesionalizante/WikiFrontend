/**
 * Utilidad específica para solucionar problemas de iconos MDI en Windows 10
 * con Chrome y Edge
 */

/**
 * Detecta si el usuario está en Windows 10 con Chrome o Edge
 */
export function isWindows10ChromeEdge() {
  const userAgent = navigator.userAgent.toLowerCase()
  const platform = navigator.platform.toLowerCase()
  
  const isWindows = platform.includes('win')
  const isChrome = userAgent.includes('chrome') && !userAgent.includes('edg')
  const isEdge = userAgent.includes('edg')
  
  return isWindows && (isChrome || isEdge)
}

/**
 * Aplica fixes específicos para Windows 10 + Chrome/Edge
 */
export function applyWindows10MDIFix() {
  if (!isWindows10ChromeEdge()) {
    return
  }
  
  console.log('Aplicando fix específico para Windows 10 + Chrome/Edge')
  
  // Fix 1: Forzar recarga de CSS de MDI
  const mdiLinks = document.querySelectorAll('link[href*="materialdesignicons"]')
  mdiLinks.forEach(link => {
    const originalHref = link.href
    link.href = ''
    setTimeout(() => {
      link.href = originalHref + '?cache-bust=' + Date.now()
    }, 100)
  })
  
  // Fix 2: Agregar CSS específico para Windows
  const style = document.createElement('style')
  style.textContent = `
    /* Fix específico para Windows 10 + Chrome/Edge */
    .mdi::before {
      font-display: swap !important;
      font-weight: normal !important;
      font-style: normal !important;
      text-rendering: optimizeLegibility !important;
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
    }
    
    /* Fallback para iconos que no cargan */
    .mdi-fallback-applied {
      font-family: "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif !important;
      font-size: 16px !important;
      line-height: 1 !important;
      display: inline-block !important;
      text-align: center !important;
      vertical-align: middle !important;
    }
    
    /* Asegurar que los iconos tengan el tamaño correcto */
    .v-icon.mdi {
      width: 24px !important;
      height: 24px !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
  `
  document.head.appendChild(style)
  
  // Fix 3: Verificar y recargar fuentes después de un delay
  setTimeout(() => {
    checkAndReloadFonts()
  }, 2000)
}

/**
 * Verifica si las fuentes MDI están cargadas y las recarga si es necesario
 */
function checkAndReloadFonts() {
  // Crear elemento de prueba
  const testElement = document.createElement('i')
  testElement.className = 'mdi mdi-home'
  testElement.style.position = 'absolute'
  testElement.style.left = '-9999px'
  testElement.style.fontSize = '24px'
  
  document.body.appendChild(testElement)
  
  // Verificar si el icono se renderiza correctamente
  const computedStyle = window.getComputedStyle(testElement, '::before')
  const content = computedStyle.getPropertyValue('content')
  
  document.body.removeChild(testElement)
  
  // Si no hay contenido o es "none", las fuentes no están cargadas
  if (!content || content === 'none' || content === '""') {
    console.warn('Fuentes MDI no detectadas, forzando recarga...')
    
    // Recargar todas las fuentes MDI
    document.fonts.ready.then(() => {
      const mdiLinks = document.querySelectorAll('link[href*="materialdesignicons"]')
      mdiLinks.forEach(link => {
        const newLink = link.cloneNode()
        newLink.href = link.href.split('?')[0] + '?reload=' + Date.now()
        link.parentNode.insertBefore(newLink, link.nextSibling)
        link.remove()
      })
    })
  }
}

/**
 * Inicializa todos los fixes para Windows 10
 */
export function initWindows10MDIFix() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyWindows10MDIFix)
  } else {
    applyWindows10MDIFix()
  }
}