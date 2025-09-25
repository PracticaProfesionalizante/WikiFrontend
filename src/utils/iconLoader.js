/**
 * Utilidad para asegurar la carga correcta de iconos MDI
 * Soluciona problemas de carga inconsistente entre usuarios
 */

// Función para verificar si los iconos MDI están cargados
export function checkMDIIconsLoaded() {
  return new Promise((resolve) => {
    // Verificar si la fuente MDI está disponible
    const testElement = document.createElement('i')
    testElement.className = 'mdi mdi-home'
    testElement.style.position = 'absolute'
    testElement.style.left = '-9999px'
    testElement.style.fontSize = '16px'
    document.body.appendChild(testElement)

    // Verificar el ancho del elemento - si es 0, la fuente no está cargada
    const checkWidth = () => {
      const width = testElement.offsetWidth
      if (width > 0) {
        document.body.removeChild(testElement)
        resolve(true)
      } else {
        // Reintentar después de 100ms
        setTimeout(checkWidth, 100)
      }
    }

    // Iniciar verificación después de un pequeño delay
    setTimeout(checkWidth, 50)
  })
}

// Función para cargar iconos MDI de forma forzada
export function forceMDIIconsLoad() {
  return new Promise((resolve, reject) => {
    // Crear un link element para cargar la fuente MDI
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css'
    
    link.onload = () => {
      console.log('MDI Icons cargados desde CDN como respaldo')
      resolve(true)
    }
    
    link.onerror = () => {
      console.error('Error al cargar iconos MDI desde CDN')
      reject(false)
    }

    // Solo agregar si no existe ya
    const existingLink = document.querySelector('link[href*="materialdesignicons"]')
    if (!existingLink) {
      document.head.appendChild(link)
    } else {
      resolve(true)
    }
  })
}

// Función principal para inicializar iconos MDI
export async function initializeMDIIcons() {
  try {
    console.log('Verificando carga de iconos MDI...')
    
    // Primero verificar si ya están cargados
    const isLoaded = await Promise.race([
      checkMDIIconsLoaded(),
      new Promise(resolve => setTimeout(() => resolve(false), 3000)) // timeout de 3 segundos
    ])

    if (isLoaded) {
      console.log('Iconos MDI cargados correctamente')
      return true
    }

    console.warn('Iconos MDI no detectados, cargando desde CDN como respaldo...')
    
    // Si no están cargados, intentar cargar desde CDN
    await forceMDIIconsLoad()
    
    // Verificar nuevamente después de cargar desde CDN
    const isLoadedAfterCDN = await Promise.race([
      checkMDIIconsLoaded(),
      new Promise(resolve => setTimeout(() => resolve(false), 2000))
    ])

    if (isLoadedAfterCDN) {
      console.log('Iconos MDI cargados exitosamente desde CDN')
      return true
    } else {
      console.error('No se pudieron cargar los iconos MDI')
      return false
    }

  } catch (error) {
    console.error('Error al inicializar iconos MDI:', error)
    return false
  }
}

// Función para mostrar notificación si los iconos no cargan
export function showIconLoadingError() {
  const notification = document.createElement('div')
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: 'Roboto', sans-serif;
      font-size: 14px;
      max-width: 300px;
    ">
      <strong>⚠️ Problema con iconos</strong><br>
      Los iconos pueden no mostrarse correctamente. Intenta recargar la página.
      <button onclick="location.reload()" style="
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        margin-left: 8px;
        cursor: pointer;
      ">Recargar</button>
    </div>
  `
  
  document.body.appendChild(notification)
  
  // Auto-remover después de 10 segundos
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification)
    }
  }, 10000)
}