<template>
  <div class="icon-selector">
    <div class="icon-selector-header">
      <div class="search-container">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Busca lo que necesites... (por ejemplo: casa, usuario, configuración)"
          class="icon-search"
          @input="onSearchInput"
        />
        <i class="fas fa-search search-icon"></i>
      </div>

      <div class="category-filter">
        <select v-model="selectedCategory" @change="handleCategoryChange" class="category-select">
          <option value="">Todas las categorías ({{ totalIcons }} iconos)</option>
          <option v-for="(icons, category) in availableIcons" :key="category" :value="category">
            {{ getCategoryDisplayName(category) }} ({{ icons.length }} iconos)
          </option>
        </select>
      </div>
    </div>

    <div class="icon-grid-container" ref="gridContainer">
      <div v-if="isLoading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Cargando iconos...</span>
      </div>

      <div v-else-if="filteredIcons.length === 0" class="empty-state">
        <i class="fas fa-frown"></i>
        <p>No se encontraron iconos</p>
        <small>Intenta con otros términos de búsqueda</small>
      </div>

      <div v-else class="icon-grid">
        <div
          v-for="icon in visibleIcons"
          :key="icon"
          class="icon-item"
          :class="{ selected: selectedIcon === icon }"
          @click="selectIcon(icon)"
        >
          <i :class="['fas fas', icon]" class="icon-preview"></i>
          <span class="icon-name">{{ getIconDisplayName(icon) }}</span>
        </div>
      </div>
    </div>

    <div class="icon-selector-footer">
      <div class="selected-icon-preview" v-if="selectedIcon">
        <i :class="['fas fas', selectedIcon]" class="selected-preview"></i>
        <span class="selected-name">{{ selectedIcon }}</span>
      </div>
      <div class="icon-count">
        Mostrando {{ currentlyLoaded }} de {{ filteredIcons.length }} iconos
        <span v-if="isLoadingMore" class="loading-more">
          <i class="fas fa-spinner fa-spin"></i> Cargando más...
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { availableIcons } from '../utils/fontAwesomeIcons.js'

export default {
  name: 'IconSelector',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      availableIcons,
      searchQuery: '',
      selectedCategory: '',
      selectedIcon: this.modelValue,
      isLoading: false,

      // Scroll infinito
      itemHeight: 80,
      itemsPerRow: 6,
      containerHeight: 400,
      scrollTop: 0,

      // Progressive loading con scroll infinito
      initialLoadSize: 90, // Cargar 90 iconos inicialmente
      loadMoreSize: 60, // Cargar 60 iconos más cada vez
      currentlyLoaded: 90, // Cantidad actualmente cargada
      isLoadingMore: false,

      // Debounce para búsqueda y scroll
      searchTimeout: null,
      renderTimeout: null,
      scrollTimeout: null,
    }
  },
  computed: {
    totalIcons() {
      return Object.values(this.availableIcons).reduce((total, icons) => total + icons.length, 0)
    },

    filteredIcons() {
      let icons = []

      // Filtrar por categoría
      if (this.selectedCategory) {
        icons = [...this.availableIcons[this.selectedCategory]]
      } else {
        icons = Object.values(this.availableIcons).flat()
      }

      // Filtrar por búsqueda con debounce mejorado
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim()
        icons = icons.filter((icon) => {
          const iconName = icon.replace('fas fa-', '').replace(/-/g, ' ')
          const keywords = this.getIconKeywords(icon)

          // Búsqueda exacta tiene prioridad
          if (iconName.includes(query) || icon.includes(query)) {
            return true
          }

          // Búsqueda por palabras clave y sinónimos
          return keywords.some(
            (keyword) =>
              keyword.toLowerCase().includes(query) || query.includes(keyword.toLowerCase()),
          )
        })

        // Ordenar resultados por relevancia
        icons.sort((a, b) => {
          const aName = a.replace('fas fa-', '').replace(/-/g, ' ')
          const bName = b.replace('fas fa-', '').replace(/-/g, ' ')

          // Priorizar coincidencias exactas al inicio
          if (aName.startsWith(query) && !bName.startsWith(query)) return -1
          if (!aName.startsWith(query) && bName.startsWith(query)) return 1

          // Luego por longitud (más corto = más relevante)
          return aName.length - bName.length
        })
      }

      return icons
    },

    gridHeight() {
      const rows = Math.ceil(this.filteredIcons.length / this.itemsPerRow)
      return rows * this.itemHeight
    },

    visibleIconsCount() {
      // Aumentar significativamente el buffer para mostrar más iconos
      const visibleRows = Math.ceil(this.containerHeight / this.itemHeight) + 10 // Buffer más grande
      return Math.min(this.filteredIcons.length, visibleRows * this.itemsPerRow)
    },

    visibleIcons() {
      // Scroll infinito: mostrar solo los iconos cargados hasta ahora
      return this.filteredIcons.slice(0, this.currentlyLoaded)
    },
  },
  watch: {
    modelValue(newValue) {
      this.selectedIcon = newValue
    },
    selectedIcon(newValue) {
      this.$emit('update:modelValue', newValue)
    },
    // Resetear carga cuando cambian los filtros
    filteredIcons() {
      this.currentlyLoaded = Math.min(this.initialLoadSize, this.filteredIcons.length)
    },
  },
  mounted() {
    this.setupVirtualScrolling()
  },
  methods: {
    handleSearch() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        // La búsqueda se ejecuta automáticamente por el computed filteredIcons
        this.scrollTop = 0
        if (this.$refs.gridContainer) {
          this.$refs.gridContainer.scrollTop = 0
        }
      }, 300)
    },

    handleCategoryChange() {
      this.searchQuery = ''
      this.scrollTop = 0
      if (this.$refs.gridContainer) {
        this.$refs.gridContainer.scrollTop = 0
      }
    },

    selectIcon(icon) {
      this.selectedIcon = icon
    },

    getCategoryDisplayName(category) {
      const names = {
        actions: 'Acciones',
        business: 'Negocios',
        communication: 'Comunicación',
        data: 'Datos',
        devices: 'Dispositivos',
        education: 'Educación',
        food: 'Comida',
        gaming: 'Juegos',
        health: 'Salud',
        media: 'Multimedia',
        misc: 'Varios',
        nature: 'Naturaleza',
        navigation: 'Navegación',
        science: 'Ciencia',
        security: 'Seguridad',
        social: 'Social',
        tools: 'Herramientas',
        transport: 'Transporte',
        ui: 'Interfaz',
        weather: 'Clima',
      }
      return names[category] || category
    },

    getIconDisplayName(icon) {
      return icon.replace('fas fa-', '').replace(/-/g, ' ')
    },

    getIconKeywords(icon) {
      // Generar palabras clave basadas en el nombre del icono
      const name = icon.replace('fas fa-', '')
      const parts = name.split('-')

      // Agregar sinónimos y palabras relacionadas
      const synonyms = {
        home: ['casa', 'inicio', 'principal'],
        user: ['usuario', 'persona', 'account'],
        account: ['usuario', 'perfil', 'user'],
        settings: ['configuración', 'ajustes', 'config'],
        cog: ['configuración', 'ajustes', 'settings'],
        menu: ['menú', 'hamburger', 'navigation'],
        search: ['buscar', 'magnify', 'find'],
        magnify: ['buscar', 'search', 'lupa'],
        plus: ['agregar', 'añadir', 'add'],
        minus: ['quitar', 'eliminar', 'remove'],
        delete: ['eliminar', 'borrar', 'remove'],
        edit: ['editar', 'modificar', 'pencil'],
        pencil: ['editar', 'escribir', 'edit'],
        save: ['guardar', 'content-save'],
        download: ['descargar', 'bajar'],
        upload: ['subir', 'cargar'],
        email: ['correo', 'mail', 'mensaje'],
        phone: ['teléfono', 'llamar'],
        heart: ['corazón', 'fas favorito', 'like'],
        star: ['estrella', 'fas favorito'],
        bell: ['campana', 'notificación'],
        lock: ['bloquear', 'seguridad'],
        key: ['llave', 'password', 'seguridad'],
        eye: ['ver', 'mostrar', 'visibility'],
        calendar: ['fecha', 'día', 'mes'],
        clock: ['tiempo', 'hora', 'reloj'],
        folder: ['carpeta', 'directorio'],
        file: ['archivo', 'documento'],
        image: ['imagen', 'foto', 'picture'],
        video: ['vídeo', 'película'],
        music: ['música', 'audio', 'sonido'],
        play: ['reproducir', 'iniciar'],
        pause: ['pausar', 'detener'],
        stop: ['parar', 'detener'],
        volume: ['volumen', 'sonido', 'audio'],
        wifi: ['internet', 'conexión', 'red'],
        bluetooth: ['conexión', 'inalámbrico'],
        battery: ['batería', 'energía'],
        power: ['energía', 'encender', 'apagar'],
      }

      let keywords = [...parts, name]

      // Agregar sinónimos
      parts.forEach((part) => {
        if (synonyms[part]) {
          keywords = keywords.concat(synonyms[part])
        }
      })

      return keywords
    },

    getIconPosition(index) {
      const startIndex = Math.max(
        0,
        Math.floor(this.scrollTop / this.itemHeight) * this.itemsPerRow - this.itemsPerRow,
      )
      const actualIndex = startIndex + index
      const row = Math.floor(actualIndex / this.itemsPerRow)
      const col = actualIndex % this.itemsPerRow
      return {
        position: 'absolute',
        top: row * this.itemHeight + 'px',
        left: col * (100 / this.itemsPerRow) + '%',
        width: 100 / this.itemsPerRow + '%',
        height: this.itemHeight + 'px',
      }
    },

    setupVirtualScrolling() {
      const container = this.$refs.gridContainer
      if (container) {
        container.addEventListener('scroll', this.handleScroll, { passive: true })
      }
    },

    handleScroll(event) {
      // Simplificar completamente el manejo del scroll
      const container = event.target
      const scrollHeight = container.scrollHeight
      const scrollTop = container.scrollTop
      const clientHeight = container.clientHeight

      // Detectar si está cerca del final para cargar más iconos
      if (scrollHeight - scrollTop - clientHeight < 300 && !this.isLoadingMore) {
        this.loadMoreIcons()
      }
    },

    loadMoreIcons() {
      // Solo cargar más si hay más iconos disponibles
      if (this.currentlyLoaded >= this.filteredIcons.length) {
        return
      }

      this.isLoadingMore = true

      // Cargar inmediatamente sin delay
      setTimeout(() => {
        const newLoadSize = Math.min(
          this.loadMoreSize,
          this.filteredIcons.length - this.currentlyLoaded,
        )

        this.currentlyLoaded += newLoadSize
        this.isLoadingMore = false
      }, 50) // Delay mínimo
    },

    onSearchInput() {
      this.handleSearch()
    },
  },

  beforeUnmount() {
    const container = this.$refs.gridContainer
    if (container) {
      container.removeEventListener('scroll', this.handleScroll)
    }
    clearTimeout(this.searchTimeout)
  },
}
</script>

<style scoped>
.icon-selector {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 600px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  box-shadow: 0 4px 12px var(--shadow-color);
}

/* Mejoras para modo oscuro */
.dark-theme .icon-selector {
  border: 1px solid var(--border-primary);
  background: var(--bg-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.icon-selector-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

/* Mejoras para modo oscuro */
.dark-theme .icon-selector-header {
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-secondary);
}

.search-container {
  position: relative;
  margin-bottom: 12px;
}

.icon-search {
  width: 100%;
  padding: 10px 40px 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.icon-search:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px var(--focus-shadow);
}

/* Mejoras para modo oscuro */
.dark-theme .icon-search {
  border: 1px solid var(--border-primary);
  background: var(--bg-primary);
  color: var(--text-primary);
}

.dark-theme .icon-search:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
  transition: color 0.2s ease;
}

/* Mejoras para modo oscuro */
.dark-theme .search-icon {
  color: var(--text-muted);
}

.category-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  background: var(--bg-primary);
  color: var(--text-primary);
  outline: none;
  transition: all 0.2s ease;
}

.category-select:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px var(--focus-shadow);
}

/* Mejoras para modo oscuro */
.dark-theme .category-select {
  border: 1px solid var(--border-primary);
  background: var(--bg-primary);
  color: var(--text-primary);
}

.dark-theme .category-select:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
}

.icon-grid-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  width: 100%;
  background: var(--bg-primary);
}

/* Scrollbar personalizado para modo oscuro */
.dark-theme .icon-grid-container::-webkit-scrollbar {
  width: 8px;
}

.dark-theme .icon-grid-container::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: 4px;
}

.dark-theme .icon-grid-container::-webkit-scrollbar-thumb {
  background: var(--border-primary);
  border-radius: 4px;
}

.dark-theme .icon-grid-container::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-muted);
}

.loading-state i {
  font-size: 24px;
  margin-bottom: 8px;
  color: var(--accent-color);
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  color: var(--text-muted);
}

/* Mejoras para modo oscuro */
.dark-theme .loading-state,
.dark-theme .empty-state {
  color: var(--text-muted);
}

.dark-theme .loading-state i {
  color: var(--accent-color);
}

.dark-theme .empty-state i {
  color: var(--text-muted);
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 8px;
  padding: 16px;
  max-width: 100%;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--bg-primary);
  min-height: 72px;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

.icon-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.1), rgba(96, 165, 250, 0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.icon-item:hover {
  background: var(--bg-secondary);
  border-color: var(--border-hover);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 4px 12px var(--shadow-color);
}

.icon-item:hover::before {
  opacity: 1;
}

.icon-item.selected {
  background: var(--accent-bg);
  border-color: var(--accent-color);
  box-shadow: 0 4px 12px var(--focus-shadow);
  transform: translateY(-1px);
}

.icon-item.selected::before {
  opacity: 1;
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(96, 165, 250, 0.1));
}

/* Mejoras para modo oscuro */
.dark-theme .icon-item {
  background: var(--bg-primary);
  border: 2px solid transparent;
}

.dark-theme .icon-item:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-hover);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.dark-theme .icon-item.selected {
  background: rgba(96, 165, 250, 0.15);
  border-color: var(--accent-color);
  box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
}

.icon-preview {
  font-size: 24px;
  margin-bottom: 4px;
  color: var(--text-primary);
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.icon-item:hover .icon-preview {
  color: var(--accent-color);
  transform: scale(1.1);
}

.icon-item.selected .icon-preview {
  color: var(--accent-color);
}

/* Mejoras para modo oscuro */
.dark-theme .icon-preview {
  color: var(--text-primary);
}

.dark-theme .icon-item:hover .icon-preview {
  color: var(--accent-color);
}

.dark-theme .icon-item.selected .icon-preview {
  color: var(--accent-color);
}

.icon-name {
  font-size: 10px;
  text-align: center;
  color: var(--text-secondary);
  line-height: 1.2;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.3s ease;
  position: relative;
  z-index: 1;
}

.icon-item:hover .icon-name {
  color: var(--text-primary);
}

.icon-item.selected .icon-name {
  color: var(--text-primary);
  font-weight: 500;
}

/* Mejoras para modo oscuro */
.dark-theme .icon-name {
  color: var(--text-secondary);
}

.dark-theme .icon-item:hover .icon-name {
  color: var(--text-primary);
}

.dark-theme .icon-item.selected .icon-name {
  color: var(--text-primary);
}

.icon-selector-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Mejoras para modo oscuro */
.dark-theme .icon-selector-footer {
  border-top: 1px solid var(--border-primary);
  background: var(--bg-secondary);
}

.selected-icon-preview {
  display: flex;
  align-items: center;
  gap: 8px;
}

.selected-preview {
  font-size: 20px;
  color: var(--accent-color);
  transition: all 0.3s ease;
}

.selected-name {
  font-size: 12px;
  color: var(--text-secondary);
  font-family: monospace;
  transition: color 0.3s ease;
}

.icon-count {
  font-size: 12px;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.loading-more {
  margin-left: 8px;
  font-size: 11px;
  color: var(--accent-color);
  transition: color 0.3s ease;
}

.loading-more i {
  font-size: 12px;
  margin-right: 4px;
}

/* Mejoras para modo oscuro */
.dark-theme .selected-preview {
  color: var(--accent-color);
}

.dark-theme .selected-name {
  color: var(--text-secondary);
}

.dark-theme .icon-count {
  color: var(--text-secondary);
}

.dark-theme .loading-more {
  color: var(--accent-color);
}
/* Efectos especiales para modo oscuro */
.dark-theme .icon-selector {
  position: relative;
}

.dark-theme .icon-selector::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at center, rgba(96, 165, 250, 0.05) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.dark-theme .icon-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.1), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  border-radius: 8px;
}

.dark-theme .icon-item:hover::after {
  opacity: 1;
}

.dark-theme .icon-item.selected::after {
  opacity: 1;
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(96, 165, 250, 0.1));
}

/* Animaciones mejoradas */
@keyframes iconGlow {
  0% {
    box-shadow: 0 0 0 0 rgba(96, 165, 250, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(96, 165, 250, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(96, 165, 250, 0);
  }
}

.dark-theme .icon-item.selected {
  animation: iconGlow 2s infinite;
}

/* Responsive */
@media (max-width: 768px) {
  .icon-grid {
    grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
    padding: 8px;
  }

  .icon-item {
    padding: 6px;
    min-height: 60px;
  }

  .icon-preview {
    font-size: 20px;
  }

  .icon-name {
    font-size: 9px;
  }
}

@media (max-width: 480px) {
  .icon-grid {
    grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
    gap: 6px;
  }

  .icon-item {
    min-height: 50px;
    padding: 4px;
  }

  .icon-preview {
    font-size: 18px;
  }
}
</style>
