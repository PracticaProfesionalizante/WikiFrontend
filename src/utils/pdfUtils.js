/**
 * Utilidades para manejo de PDFs y supresión de advertencias conocidas
 */

/**
 * Lista de advertencias conocidas de PDF.js que no son críticas
 */
export const KNOWN_PDF_WARNINGS = [
  'getHexString - ignoring invalid character',
  'getHexString - ignoring additional invalid characters',
  'Indexing all PDF objects',
  'Warning: getHexString',
  'ignoring invalid character',
  'ignoring additional invalid characters'
]

/**
 * Configura la supresión de advertencias conocidas de PDF.js
 */
export const setupPdfWarningSuppression = () => {
  const originalWarn = console.warn
  const originalError = console.error

  console.warn = (...args) => {
    const message = args.join(' ')
    const isKnownWarning = KNOWN_PDF_WARNINGS.some(warning =>
      message.includes(warning)
    )

    if (!isKnownWarning) {
      originalWarn.apply(console, args)
    } else {
      // Solo loggear en modo debug
      if (process.env.NODE_ENV === 'development') {
        console.debug('🔇 Advertencia de PDF.js suprimida:', message)
      }
    }
  }

  console.error = (...args) => {
    const message = args.join(' ')
    const isKnownError = KNOWN_PDF_WARNINGS.some(warning =>
      message.includes(warning)
    )

    if (!isKnownError) {
      originalError.apply(console, args)
    } else {
      // Solo loggear en modo debug
      if (process.env.NODE_ENV === 'development') {
        console.debug('🔇 Error de PDF.js suprimido:', message)
      }
    }
  }
}

/**
 * Sanitiza una URL de PDF removiendo parámetros problemáticos
 */
export const sanitizePdfUrl = (url) => {
  if (!url) return url

  try {
    const urlObj = new URL(url)

    // Limpiar parámetros que pueden causar problemas
    const cleanParams = new URLSearchParams()
    urlObj.searchParams.forEach((value, key) => {
      // Mantener solo parámetros seguros
      if (['format', 'pdf', 'view', 'download', 'page'].includes(key.toLowerCase())) {
        cleanParams.set(key, value)
      }
    })

    // Reconstruir URL limpia
    const cleanUrl = `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`
    return cleanParams.toString() ? `${cleanUrl}?${cleanParams.toString()}` : cleanUrl
  } catch {
    return url
  }
}

/**
 * Valida si una URL es válida para PDF
 */
export const isValidPdfUrl = (url) => {
  if (!url) return false

  try {
    const urlObj = new URL(url)

    // Verificar que sea una URL válida
    if (!urlObj.protocol || !urlObj.hostname) {
      return false
    }

    // Verificar que termine en .pdf o sea un PDF válido
    const pathname = urlObj.pathname.toLowerCase()
    return pathname.endsWith('.pdf') ||
           urlObj.hostname.includes('pdf') ||
           urlObj.searchParams.has('pdf') ||
           (urlObj.searchParams.has('format') && urlObj.searchParams.get('format') === 'pdf')
  } catch {
    return false
  }
}

/**
 * Construye la URL correcta para un PDF basado en el ID del documento
 */
export const buildPdfUrl = (documentId, baseUrl = 'http://practicas.teclab.edu.ar:8080') => {
  if (!documentId) return null

  // Construir URL del endpoint de archivo PDF
  const url = `${baseUrl}/documents/file/${documentId}`

  // Agregar token de autenticación como parámetro de consulta si está disponible
  const token = getAuthToken()
  if (token) {
    return `${url}?token=${encodeURIComponent(token)}`
  }

  return url
}

/**
 * Obtiene el token de autenticación del localStorage
 */
export const getAuthToken = () => {
  try {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
  } catch {
    return null
  }
}

/**
 * Construye headers de autenticación para peticiones de PDF
 */
export const getPdfHeaders = () => {
  const token = getAuthToken()
  const headers = {
    'Accept': 'application/pdf, */*',
    'Content-Type': 'application/pdf'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

/**
 * Maneja PDFs problemáticos aplicando estrategias de fallback
 */
export const handleProblematicPdf = (url, documentId = null) => {
  // Si tenemos un documentId, usar el endpoint correcto
  if (documentId) {
    const correctUrl = buildPdfUrl(documentId)
    console.log('🔧 Usando endpoint correcto para PDF:', { documentId, url: correctUrl })
    return correctUrl
  }

  const sanitizedUrl = sanitizePdfUrl(url)

  // Si la URL fue modificada, loggear el cambio
  if (sanitizedUrl !== url) {
    console.warn('🔧 URL de PDF sanitizada:', { original: url, sanitized: sanitizedUrl })
  }

  return sanitizedUrl
}

/**
 * Verifica si un error es una advertencia conocida de PDF.js
 */
export const isKnownPdfWarning = (error) => {
  if (!error || !error.message) return false

  return KNOWN_PDF_WARNINGS.some(warning =>
    error.message.includes(warning)
  )
}
