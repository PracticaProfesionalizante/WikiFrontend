import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export const useMenuStore = defineStore('menu', () => {
  const authStore = useAuthStore()
  const menuItems = computed(() => {
    const menus = authStore?.menus
    return Array.isArray(menus) ? menus : []
  })

  const getSubmenusByPath = computed(() => {
    const normalizePath = (raw) => {
      if (typeof raw !== 'string') return '/'
      let p = raw.trim()

      // Quitar query/hash si existen
      const qIdx = p.indexOf('?')
      if (qIdx !== -1) p = p.slice(0, qIdx)
      const hIdx = p.indexOf('#')
      if (hIdx !== -1) p = p.slice(0, hIdx)

      // Eliminar prefijo /folders para navegación jerárquica
      if (p.startsWith('/folders')) {
        p = p.replace(/^\/folders(?=\/|$)/, '')
      }

      // Asegurar slash inicial
      if (p === '') p = '/'
      if (!p.startsWith('/')) p = `/${p}`

      // Quitar barras finales, manteniendo raíz
      p = p.replace(/\/+$/, '')
      if (p === '') p = '/'

      return p
    }

    const normalizeItemPath = (node) => {
      if (!node) return null
      const candidate =
        typeof node.path === 'string' && node.path.trim() !== ''
          ? node.path
          : typeof node.url === 'string'
            ? node.url
            : null
      if (!candidate) return null
      return normalizePath(candidate)
    }

    const isPrefix = (parent, child) => {
      if (!parent || !child) return false
      if (parent === '/') return true
      if (child === parent) return true
      if (!child.startsWith(parent)) return false
      const next = child[parent.length]
      return next === '/' || next === undefined
    }

    const findExact = (nodes, target) => {
      if (!Array.isArray(nodes) || !target) return null
      for (const node of nodes) {
        if (!node) continue
        const nodePath = normalizeItemPath(node)
        if (nodePath === target) return node

        const children = node.children
        if (children && children.length) {
          const found = findExact(children, target)
          if (found) return found
        }
      }
      return null
    }

    // Fallback: encontrar el mejor ancestro cuyo path sea prefijo del objetivo
    const findBestAncestor = (nodes, target) => {
      if (!Array.isArray(nodes) || !target) return null
      let best = null
      for (const node of nodes) {
        if (!node) continue
        const nodePath = normalizeItemPath(node)
        if (nodePath && isPrefix(nodePath, target)) {
          best = node
          const children = node.children
          if (children && children.length) {
            const deeper = findBestAncestor(children, target)
            if (deeper) best = deeper
          }
        } else {
          const children = node.children
          if (children && children.length) {
            const deeper = findBestAncestor(children, target)
            if (deeper) best = deeper
          }
        }
      }
      return best
    }

    return (currentPath) => {
      const cleanPath = normalizePath(currentPath)

      // Mostrar raíz: menús de primer nivel
      if (cleanPath === '/') {
        return Array.isArray(menuItems.value) ? menuItems.value : []
      }

      // Buscar coincidencia exacta primero
      const exactNode = findExact(menuItems.value, cleanPath)
      if (exactNode) {
        return Array.isArray(exactNode.children) ? exactNode.children : []
      }

      // Fallback: buscar ancestro más cercano
      const ancestor = findBestAncestor(menuItems.value, cleanPath)
      const children = ancestor?.children
      return Array.isArray(children) ? children : []
    }
  })

  return {
    // State
    menuItems,

    // Getters
    getSubmenusByPath,
  }
})
