/**
 * plugins/webfontloader.js
 *
 * webfontloader documentation: https://github.com/typekit/webfontloader
 */

export async function loadFonts() {
  const module = await import('webfontloader')
  const webFontLoader = module?.default || module

  if (!webFontLoader || typeof webFontLoader.load !== 'function') {
    console.warn('[webfontloader] No se pudo inicializar')
    return
  }

  webFontLoader.load({
    google: {
      families: ['Roboto:100,300,400,500,700,900&display=swap'],
    },
  })
}
