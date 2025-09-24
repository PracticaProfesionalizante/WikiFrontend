<template>
  <div class="icon-selector">
    <div class="icon-selector-header">
      <div class="search-container">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar entre {{ totalIcons }} iconos... (ej: casa, usuario, configuración)"
          class="icon-search"
          @input="onSearchInput"
        />
        <i class="mdi mdi-magnify search-icon"></i>
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
        <i class="mdi mdi-loading mdi-spin"></i>
        <span>Cargando iconos...</span>
      </div>
      
      <div v-else-if="filteredIcons.length === 0" class="empty-state">
        <i class="mdi mdi-emoticon-sad-outline"></i>
        <p>No se encontraron iconos</p>
        <small>Intenta con otros términos de búsqueda</small>
      </div>
      
      <div v-else class="icon-grid" :style="{ height: gridHeight + 'px' }">
        <div
          v-for="(icon, index) in filteredIcons"
          :key="icon"
          class="icon-item"
          :class="{ selected: selectedIcon === icon }"
          @click="selectIcon(icon)"
          :style="getIconPosition(index)"
        >
          <i :class="['mdi', icon]" class="icon-preview"></i>
          <span class="icon-name">{{ getIconDisplayName(icon) }}</span>
        </div>
      </div>
    </div>

    <div class="icon-selector-footer">
      <div class="selected-icon-preview" v-if="selectedIcon">
        <i :class="['mdi', selectedIcon]" class="selected-preview"></i>
        <span class="selected-name">{{ selectedIcon }}</span>
      </div>
      <div class="icon-count">
        Mostrando {{ filteredIcons.length }} de {{ filteredIcons.length }} iconos
      </div>
    </div>
  </div>
</template>

<script>
import { availableIcons } from '../../mdi-icons-generated.js'

export default {
  name: 'IconSelector',
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      availableIcons,
      searchQuery: '',
      selectedCategory: '',
      selectedIcon: this.modelValue,
      isLoading: false,
      
      // Virtualización
      itemHeight: 80,
      itemsPerRow: 6,
      containerHeight: 400,
      scrollTop: 0,
      
      // Debounce para búsqueda
      searchTimeout: null
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
        icons = icons.filter(icon => {
          const iconName = icon.replace('mdi-', '').replace(/-/g, ' ')
          const keywords = this.getIconKeywords(icon)
          
          // Búsqueda exacta tiene prioridad
          if (iconName.includes(query) || icon.includes(query)) {
            return true
          }
          
          // Búsqueda por palabras clave y sinónimos
          return keywords.some(keyword => 
            keyword.toLowerCase().includes(query) ||
            query.includes(keyword.toLowerCase())
          )
        })
        
        // Ordenar resultados por relevancia
        icons.sort((a, b) => {
          const aName = a.replace('mdi-', '').replace(/-/g, ' ')
          const bName = b.replace('mdi-', '').replace(/-/g, ' ')
          
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
      const visibleRows = Math.ceil(this.containerHeight / this.itemHeight) + 2
      return visibleRows * this.itemsPerRow
    },
    
    visibleIcons() {
      const startIndex = Math.max(0, Math.floor(this.scrollTop / this.itemHeight) * this.itemsPerRow - this.itemsPerRow)
      const endIndex = Math.min(this.filteredIcons.length, startIndex + this.visibleIconsCount)
      return this.filteredIcons.slice(startIndex, endIndex)
    }
  },
  watch: {
    modelValue(newValue) {
      this.selectedIcon = newValue
    },
    selectedIcon(newValue) {
      this.$emit('update:modelValue', newValue)
    }
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
        weather: 'Clima'
      }
      return names[category] || category
    },
    
    getIconDisplayName(icon) {
      return icon.replace('mdi-', '').replace(/-/g, ' ')
    },
    
    getIconKeywords(icon) {
      // Generar palabras clave basadas en el nombre del icono
      const name = icon.replace('mdi-', '')
      const parts = name.split('-')
      
      // Agregar sinónimos y palabras relacionadas
      const synonyms = {
        'home': ['casa', 'inicio', 'principal'],
        'user': ['usuario', 'persona', 'account'],
        'account': ['usuario', 'perfil', 'user'],
        'settings': ['configuración', 'ajustes', 'config'],
        'cog': ['configuración', 'ajustes', 'settings'],
        'menu': ['menú', 'hamburger', 'navigation'],
        'search': ['buscar', 'magnify', 'find'],
        'magnify': ['buscar', 'search', 'lupa'],
        'plus': ['agregar', 'añadir', 'add'],
        'minus': ['quitar', 'eliminar', 'remove'],
        'delete': ['eliminar', 'borrar', 'remove'],
        'edit': ['editar', 'modificar', 'pencil'],
        'pencil': ['editar', 'escribir', 'edit'],
        'save': ['guardar', 'content-save'],
        'download': ['descargar', 'bajar'],
        'upload': ['subir', 'cargar'],
        'email': ['correo', 'mail', 'mensaje'],
        'phone': ['teléfono', 'llamar'],
        'heart': ['corazón', 'favorito', 'like'],
        'star': ['estrella', 'favorito'],
        'bell': ['campana', 'notificación'],
        'lock': ['bloquear', 'seguridad'],
        'key': ['llave', 'password', 'seguridad'],
        'eye': ['ver', 'mostrar', 'visibility'],
        'calendar': ['fecha', 'día', 'mes'],
        'clock': ['tiempo', 'hora', 'reloj'],
        'folder': ['carpeta', 'directorio'],
        'file': ['archivo', 'documento'],
        'image': ['imagen', 'foto', 'picture'],
        'video': ['vídeo', 'película'],
        'music': ['música', 'audio', 'sonido'],
        'play': ['reproducir', 'iniciar'],
        'pause': ['pausar', 'detener'],
        'stop': ['parar', 'detener'],
        'volume': ['volumen', 'sonido', 'audio'],
        'wifi': ['internet', 'conexión', 'red'],
        'bluetooth': ['conexión', 'inalámbrico'],
        'battery': ['batería', 'energía'],
        'power': ['energía', 'encender', 'apagar']
      }
      
      let keywords = [...parts, name]
      
      // Agregar sinónimos
      parts.forEach(part => {
        if (synonyms[part]) {
          keywords = keywords.concat(synonyms[part])
        }
      })
      
      return keywords
    },
    
    getIconPosition(index) {
      const row = Math.floor(index / this.itemsPerRow)
      const col = index % this.itemsPerRow
      return {
        position: 'absolute',
        top: (row * this.itemHeight) + 'px',
        left: (col * (100 / this.itemsPerRow)) + '%',
        width: (100 / this.itemsPerRow) + '%',
        height: this.itemHeight + 'px'
      }
    },
    
    setupVirtualScrolling() {
      const container = this.$refs.gridContainer
      if (container) {
        container.addEventListener('scroll', this.handleScroll)
      }
    },
    
    handleScroll(event) {
      this.scrollTop = event.target.scrollTop
    }
  },
  
  beforeUnmount() {
    const container = this.$refs.gridContainer
    if (container) {
      container.removeEventListener('scroll', this.handleScroll)
    }
    clearTimeout(this.searchTimeout)
  }
}
</script>

<style scoped>
.icon-selector {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 600px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
}

.icon-selector-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.search-container {
  position: relative;
  margin-bottom: 12px;
}

.icon-search {
  width: 100%;
  padding: 10px 40px 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.icon-search:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  pointer-events: none;
}

.category-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  outline: none;
}

.icon-grid-container {
  flex: 1;
  overflow-y: auto;
  position: relative;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
}

.loading-state i {
  font-size: 24px;
  margin-bottom: 8px;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #ccc;
}

.icon-grid {
  position: relative;
  padding: 16px;
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
  transition: all 0.2s;
  background: white;
}

.icon-item:hover {
  background: #f8f9fa;
  border-color: #e0e0e0;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.icon-item.selected {
  background: #e3f2fd;
  border-color: #2196f3;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
}

.icon-preview {
  font-size: 24px;
  margin-bottom: 4px;
  color: #333;
}

.icon-name {
  font-size: 10px;
  text-align: center;
  color: #666;
  line-height: 1.2;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.icon-selector-footer {
  padding: 12px 16px;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-icon-preview {
  display: flex;
  align-items: center;
  gap: 8px;
}

.selected-preview {
  font-size: 20px;
  color: #2196f3;
}

.selected-name {
  font-size: 12px;
  color: #666;
  font-family: monospace;
}

.icon-count {
  font-size: 12px;
  color: #666;
}

/* Responsive */
@media (max-width: 768px) {
  .icon-grid {
    padding: 8px;
  }
  
  .icon-item {
    padding: 6px;
  }
  
  .icon-preview {
    font-size: 20px;
  }
  
  .icon-name {
    font-size: 9px;
  }
}
</style>