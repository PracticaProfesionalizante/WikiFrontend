<template>
  <div class="menu-manager-layout">
    <SidebarMenu @sidebar-toggle="handleSidebarToggle" />
    <AppHeader :sidebar-expanded="sidebarExpanded" />
    
    <div class="main-content" :class="{ 'with-header': true }">
      <div class="menu-manager-container">
        <div class="manager-header">
          <h1 class="manager-title">
            <i class="mdi mdi-menu-open"></i>
            Gestión de Menús
          </h1>
          <p class="manager-subtitle">
            Crea y administra los menús de la aplicación de forma fácil y visual
          </p>
        </div>

        <!-- Botón para crear nuevo menú -->
        <div class="action-bar">
          <button 
            class="create-menu-btn"
            @click="openDialog"
            :disabled="isLoading"
          >
            <i class="mdi mdi-plus-circle"></i>
            Crear Nuevo Menú
          </button>
        </div>

        <!-- Indicador de carga -->
        <div v-if="isLoading" class="loading-indicator">
          <i class="mdi mdi-loading mdi-spin"></i>
          <span>Cargando menús...</span>
        </div>

        <!-- Mensaje de error -->
        <div v-if="error" class="error-message">
          <i class="mdi mdi-alert-circle"></i>
          <span>{{ error }}</span>
          <button @click="loadMenus" class="retry-btn">
            <i class="mdi mdi-refresh"></i>
            Reintentar
          </button>
        </div>

        <!-- Lista de menús existentes -->
        <div class="menu-display-options" v-if="!isLoading">
          <div class="view-toggle">
            <button 
              class="toggle-btn"
              :class="{ active: viewMode === 'grid' }"
              @click="viewMode = 'grid'"
            >
              <i class="mdi mdi-view-grid"></i>
              Vista de Tarjetas
            </button>
            <button 
              class="toggle-btn"
              :class="{ active: viewMode === 'tree' }"
              @click="viewMode = 'tree'"
            >
              <i class="mdi mdi-file-tree"></i>
              Vista de Árbol
            </button>
          </div>
        </div>

        <!-- Vista de tarjetas (original) -->
        <div class="menus-grid" v-if="!isLoading && viewMode === 'grid'">
          <div 
            v-for="menu in filteredMenus" 
            :key="menu.id"
            class="menu-card"
            :class="{ 'is-submenu': menu.parentId, 'has-children': getMenuChildren(menu.id).length > 0 }"
          >
            <div class="menu-card-header">
              <div class="menu-icon">
                <i :class="menu.icon || 'mdi mdi-circle-outline'"></i>
              </div>
              <div class="menu-info">
                <div class="menu-title-row">
                  <h3 class="menu-name">{{ menu.name }}</h3>
                  <div class="menu-badges">
                    <span v-if="menu.parentId" class="submenu-badge">
                      <i class="mdi mdi-subdirectory-arrow-right"></i>
                      Submenú
                    </span>
                    <span v-if="getMenuChildren(menu.id).length > 0" class="parent-badge">
                      <i class="mdi mdi-folder-outline"></i>
                      {{ getMenuChildren(menu.id).length }} hijos
                    </span>
                  </div>
                </div>
                <p class="menu-path">{{ menu.path }}</p>
                <div class="menu-meta">
                  <span class="menu-order">Orden: {{ menu.order }}</span>
                  <span v-if="menu.parentId" class="menu-parent">
                    <i class="mdi mdi-arrow-up"></i>
                    Padre: {{ getParentMenuName(menu.parentId) }}
                  </span>
                  <div class="menu-roles">
                    <span 
                      v-for="role in menu.roles" 
                      :key="role"
                      class="role-badge"
                    >
                      {{ getRoleLabel(role) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="menu-actions">
              <button 
                v-if="!menu.parentId"
                class="add-submenu-btn"
                @click="createSubmenu(menu)"
                title="Agregar submenú"
              >
                <i class="mdi mdi-plus"></i>
                Submenú
              </button>
              <button 
                class="edit-btn"
                @click="editMenu(menu)"
                title="Editar menú"
              >
                <i class="mdi mdi-pencil"></i>
              </button>
              <button 
                class="delete-btn"
                @click="deleteMenu(menu.id)"
                title="Eliminar menú"
              >
                <i class="mdi mdi-delete"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Vista de árbol jerárquico -->
        <div class="menu-tree-view" v-if="!isLoading && viewMode === 'tree'">
          <div class="tree-container">
            <div 
              v-for="rootMenu in hierarchicalMenus" 
              :key="rootMenu.id"
              class="tree-node root-node"
            >
              <!-- Menú raíz -->
              <div class="node-content">
                <div class="node-header">
                  <button 
                    v-if="rootMenu.children && rootMenu.children.length > 0"
                    class="expand-toggle"
                    @click="toggleExpand(rootMenu.id)"
                    :class="{ expanded: expandedNodes.includes(rootMenu.id) }"
                  >
                    <i class="mdi mdi-chevron-right"></i>
                  </button>
                  <div class="node-spacer" v-else></div>
                  
                  <div class="node-icon">
                    <i :class="rootMenu.icon || 'mdi mdi-folder-outline'"></i>
                  </div>
                  
                  <div class="node-info">
                    <h4 class="node-name">{{ rootMenu.name }}</h4>
                    <span class="node-path">{{ rootMenu.path }}</span>
                    <div class="node-meta">
                      <span class="node-order">Orden: {{ rootMenu.order }}</span>
                      <span v-if="rootMenu.children && rootMenu.children.length > 0" class="children-count">
                        {{ rootMenu.children.length }} submenú(s)
                      </span>
                    </div>
                  </div>
                </div>
                
                <div class="node-actions">
                  <button 
                    class="add-submenu-btn small"
                    @click="createSubmenu(rootMenu)"
                    title="Agregar submenú"
                  >
                    <i class="mdi mdi-plus"></i>
                  </button>
                  <button 
                    class="edit-btn small"
                    @click="editMenu(rootMenu)"
                    title="Editar menú"
                  >
                    <i class="mdi mdi-pencil"></i>
                  </button>
                  <button 
                    class="delete-btn small"
                    @click="deleteMenu(rootMenu.id)"
                    title="Eliminar menú"
                  >
                    <i class="mdi mdi-delete"></i>
                  </button>
                </div>
              </div>
              
              <!-- Submenús -->
              <div 
                v-if="rootMenu.children && rootMenu.children.length > 0 && expandedNodes.includes(rootMenu.id)"
                class="children-container"
              >
                <div 
                  v-for="child in rootMenu.children" 
                  :key="child.id"
                  class="tree-node child-node"
                >
                  <div class="node-content">
                    <div class="node-header">
                      <div class="child-connector">
                        <i class="mdi mdi-subdirectory-arrow-right"></i>
                      </div>
                      
                      <div class="node-icon">
                        <i :class="child.icon || 'mdi mdi-circle-outline'"></i>
                      </div>
                      
                      <div class="node-info">
                        <h5 class="node-name">{{ child.name }}</h5>
                        <span class="node-path">{{ child.path }}</span>
                        <div class="node-meta">
                          <span class="node-order">Orden: {{ child.order }}</span>
                          <span class="submenu-indicator">Submenú</span>
                        </div>
                      </div>
                    </div>
                    
                    <div class="node-actions">
                      <button 
                        class="edit-btn small"
                        @click="editMenu(child)"
                        title="Editar submenú"
                      >
                        <i class="mdi mdi-pencil"></i>
                      </button>
                      <button 
                        class="delete-btn small"
                        @click="deleteMenu(child.id)"
                        title="Eliminar submenú"
                      >
                        <i class="mdi mdi-delete"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal de creación/edición -->
        <div v-if="showDialog" class="dialog-overlay" @click="closeDialog">
          <div class="dialog-content" @click.stop>
            <div class="dialog-header">
              <h2>
                <i class="mdi mdi-menu-open"></i>
                {{ isEditing ? 'Editar' : 'Crear' }} Menú
              </h2>
              <button @click="closeDialog" class="close-btn">
                <i class="mdi mdi-close"></i>
              </button>
            </div>

            <div class="dialog-body">
              <form @submit.prevent="saveMenu">
                <!-- Información básica -->
                <div class="form-section">
                  <h3 class="section-title">
                    <i class="mdi mdi-information-outline"></i>
                    Información Básica
                  </h3>
                  
                  <div class="form-group">
                    <label for="menuName" class="form-label">
                      <i class="mdi mdi-format-title"></i>
                      Nombre del Menú *
                    </label>
                    <input
                      id="menuName"
                      v-model="menuForm.name"
                      type="text"
                      class="form-input"
                      :class="{ 'error': validationErrors.name }"
                      placeholder="Ej: Gestión de Usuarios"
                      @input="generatePath"
                      maxlength="50"
                    />
                    <div v-if="validationErrors.name" class="error-message">
                      <i class="mdi mdi-alert-circle"></i>
                      {{ validationErrors.name }}
                    </div>
                    <div class="help-text">
                      <i class="mdi mdi-information"></i>
                      Este será el nombre que aparecerá en el menú lateral
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="menuPath" class="form-label">
                      <i class="mdi mdi-link-variant"></i>
                      Ruta de Acceso *
                    </label>
                    <input
                      id="menuPath"
                      v-model="menuForm.path"
                      type="text"
                      class="form-input"
                      :class="{ 'error': validationErrors.path }"
                      placeholder="Ej: /gestion-usuarios"
                      @input="validateForm"
                    />
                    <div v-if="validationErrors.path" class="error-message">
                      <i class="mdi mdi-alert-circle"></i>
                      {{ validationErrors.path }}
                    </div>
                    <div class="help-text">
                      <i class="mdi mdi-information"></i>
                      URL que se usará para acceder a esta vista (se genera automáticamente)
                    </div>
                  </div>
                </div>

                <!-- Selector de iconos -->
                <div class="form-section">
                  <h3 class="section-title">
                    <i class="mdi mdi-emoticon-outline"></i>
                    Seleccionar Icono *
                  </h3>
                  <div v-if="validationErrors.icon" class="error-message">
                    <i class="mdi mdi-alert-circle"></i>
                    {{ validationErrors.icon }}
                  </div>
                  
                  <div class="icon-selector">
                    <!-- Icono seleccionado -->
                    <div v-if="menuForm.icon" class="selected-icon">
                      <i :class="menuForm.icon"></i>
                      <span>{{ menuForm.icon }}</span>
                      <button type="button" @click="menuForm.icon = ''" class="clear-icon">
                        <i class="mdi mdi-close"></i>
                      </button>
                    </div>

                    <!-- Búsqueda de iconos -->
                    <div class="icon-search">
                      <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Buscar iconos..."
                        class="search-input"
                      />
                      <i class="mdi mdi-magnify search-icon"></i>
                    </div>

                    <!-- Categorías -->
                    <div class="icon-categories">
                      <button
                        v-for="category in iconCategories"
                        :key="category.id"
                        type="button"
                        class="category-btn"
                        :class="{ active: selectedCategory === category.id }"
                        @click="selectedCategory = category.id"
                      >
                        {{ category.name }}
                      </button>
                    </div>

                    <!-- Grid de iconos -->
                    <div class="icon-grid">
                      <div
                        v-for="icon in displayedIcons"
                        :key="icon"
                        class="icon-item"
                        :class="{ selected: menuForm.icon === icon }"
                        @click="menuForm.icon = icon; validateForm()"
                      >
                        <i :class="icon"></i>
                      </div>
                    </div>

                    <div v-if="displayedIcons.length === 0" class="no-icons-found">
                      <i class="mdi mdi-emoticon-sad-outline"></i>
                      <p>No se encontraron iconos</p>
                    </div>
                  </div>
                </div>

                <!-- Selector de plantillas -->
                <div class="form-section">
                  <h3 class="section-title">
                    <i class="mdi mdi-view-dashboard-outline"></i>
                    Tipo de Vista *
                  </h3>
                  <div v-if="validationErrors.template" class="error-message">
                    <i class="mdi mdi-alert-circle"></i>
                    {{ validationErrors.template }}
                  </div>
                  <div class="help-text">
                    <i class="mdi mdi-information"></i>
                    Selecciona el tipo de vista que mejor se adapte a tu contenido
                  </div>
                  
                  <div class="template-selector">
                    <div 
                      v-for="template in viewTemplates" 
                      :key="template.value"
                      class="template-option"
                      :class="{ selected: menuForm.template === template.value }"
                      @click="menuForm.template = template.value; validateForm()"
                    >
                      <div class="template-preview">
                        <i :class="template.icon"></i>
                        <div class="template-mockup">
                          <!-- Mockup para Vista Básica -->
                          <div v-if="template.value === 'basic'" class="mockup-basic">
                            <div class="mockup-header"></div>
                            <div class="mockup-content">
                              <div class="mockup-line"></div>
                              <div class="mockup-line short"></div>
                              <div class="mockup-line"></div>
                            </div>
                          </div>
                          
                          <!-- Mockup para Vista de Formulario -->
                          <div v-else-if="template.value === 'form'" class="mockup-form">
                            <div class="mockup-field"></div>
                            <div class="mockup-field"></div>
                            <div class="mockup-field"></div>
                            <div class="mockup-button"></div>
                          </div>
                          
                          <!-- Mockup para Vista de Tabla -->
                          <div v-else-if="template.value === 'table'" class="mockup-table">
                            <div class="mockup-table-header"></div>
                            <div class="mockup-table-row"></div>
                            <div class="mockup-table-row"></div>
                            <div class="mockup-table-row"></div>
                          </div>
                          
                          <!-- Mockup para Vista de Dashboard -->
                          <div v-else-if="template.value === 'dashboard'" class="mockup-dashboard">
                            <div class="mockup-cards">
                              <div class="mockup-card"></div>
                              <div class="mockup-card"></div>
                              <div class="mockup-card"></div>
                            </div>
                            <div class="mockup-chart"></div>
                          </div>
                        </div>
                      </div>
                      
                      <div class="template-info">
                        <h4 class="template-name">{{ template.name }}</h4>
                        <p class="template-description">{{ template.description }}</p>
                        <div class="template-features">
                          <span 
                            v-for="feature in template.features" 
                            :key="feature"
                            class="feature-tag"
                          >
                            {{ feature }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Configuración adicional -->
                <div class="form-section">
                  <h3 class="section-title">
                    <i class="mdi mdi-cog-outline"></i>
                    Configuración Adicional
                  </h3>
                  
                  <!-- Selector de tipo de menú -->
                  <div class="form-group">
                    <label class="form-label">
                      <i class="mdi mdi-format-list-bulleted-type"></i>
                      Tipo de Menú
                    </label>
                    <div class="menu-type-selector">
                      <div 
                        class="menu-type-option"
                        :class="{ 'active': menuForm.parentId === null }"
                        @click="setMenuType('root')"
                      >
                        <i class="mdi mdi-home-outline"></i>
                        <div class="option-content">
                          <span class="option-title">Menú Principal</span>
                          <span class="option-description">Aparece en el nivel raíz del menú lateral</span>
                        </div>
                      </div>
                      <div 
                        class="menu-type-option"
                        :class="{ 'active': menuForm.parentId !== null }"
                        @click="setMenuType('submenu')"
                      >
                        <i class="mdi mdi-subdirectory-arrow-right"></i>
                        <div class="option-content">
                          <span class="option-title">Submenú</span>
                          <span class="option-description">Aparece dentro de otro menú como elemento hijo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Selector de menú padre (solo si es submenú) -->
                  <div v-if="menuForm.parentId !== null" class="form-group">
                    <label for="menuParent" class="form-label">
                      <i class="mdi mdi-file-tree"></i>
                      Menú Padre *
                    </label>
                    <select
                      id="menuParent"
                      v-model="menuForm.parentId"
                      class="form-input"
                      :class="{ 'error': validationErrors.parentId }"
                    >
                      <option value="">Selecciona un menú padre</option>
                      <option 
                        v-for="menu in availableParentMenus" 
                        :key="menu.id" 
                        :value="menu.id"
                      >
                        {{ menu.name }}
                        <span v-if="getMenuChildren(menu.id).length > 0">
                          ({{ getMenuChildren(menu.id).length }} submenús)
                        </span>
                      </option>
                    </select>
                    <div v-if="validationErrors.parentId" class="error-message">
                      <i class="mdi mdi-alert-circle"></i>
                      {{ validationErrors.parentId }}
                    </div>
                    <div class="help-text">
                      <i class="mdi mdi-information"></i>
                      Este submenú aparecerá dentro del menú seleccionado
                    </div>
                  </div>

                  <!-- Vista previa de jerarquía -->
                  <div v-if="menuForm.parentId" class="form-group">
                    <label class="form-label">
                      <i class="mdi mdi-file-tree-outline"></i>
                      Vista Previa de Jerarquía
                    </label>
                    <div class="hierarchy-preview">
                      <div class="hierarchy-item parent">
                        <i class="mdi mdi-folder-outline"></i>
                        <span>{{ getParentMenuName(menuForm.parentId) }}</span>
                      </div>
                      <div class="hierarchy-connector">
                        <i class="mdi mdi-subdirectory-arrow-right"></i>
                      </div>
                      <div class="hierarchy-item child">
                        <i :class="menuForm.icon || 'mdi mdi-circle-outline'"></i>
                        <span>{{ menuForm.name || 'Nuevo submenú' }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label class="form-label">
                      <i class="mdi mdi-sort-numeric-ascending"></i>
                      Orden en el menú
                    </label>
                    <input
                      v-model.number="menuForm.order"
                      type="number"
                      class="form-input"
                      min="0"
                      placeholder="0"
                    />
                    <div class="help-text">
                      <i class="mdi mdi-information"></i>
                      {{ menuForm.parentId ? 'Orden dentro del submenú' : 'Orden en el menú principal' }}
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">
                      <i class="mdi mdi-account-key"></i>
                      Roles de Acceso *
                    </label>
                    <div class="roles-selector">
                      <div 
                        v-for="role in availableRoles" 
                        :key="role.value"
                        class="role-option"
                      >
                        <label class="checkbox-label">
                          <input
                            v-model="menuForm.roles"
                            :value="role.value"
                            type="checkbox"
                            class="form-checkbox"
                          />
                          <span class="checkbox-text">
                            <i :class="role.icon"></i>
                            {{ role.label }}
                          </span>
                        </label>
                        <div class="role-description">{{ role.description }}</div>
                      </div>
                    </div>
                    <div v-if="validationErrors.roles" class="error-message">
                      <i class="mdi mdi-alert-circle"></i>
                      {{ validationErrors.roles }}
                    </div>
                    <div class="help-text">
                      <i class="mdi mdi-information"></i>
                      Selecciona los roles que tendrán acceso a este menú
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="checkbox-label">
                      <input
                        v-model="menuForm.isActive"
                        type="checkbox"
                        class="form-checkbox"
                      />
                      <span class="checkbox-text">
                        <i class="mdi mdi-check-circle"></i>
                        Menú activo
                      </span>
                    </label>
                  </div>
                </div>

                <div class="dialog-footer">
                  <button 
                    type="button" 
                    @click="openPreview"
                    class="btn btn-secondary"
                    :disabled="!validateForm()"
                  >
                    <i class="mdi mdi-eye"></i>
                    Vista Previa
                  </button>
                  <button 
                    type="button" 
                    @click="closeDialog" 
                    class="btn btn-secondary"
                  >
                    <i class="mdi mdi-close"></i>
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    class="btn btn-primary"
                    :disabled="!validateForm()"
                  >
                    <i class="mdi mdi-content-save"></i>
                    {{ isEditing ? 'Actualizar' : 'Crear' }} Menú
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Modal de Vista Previa -->
        <div v-if="showPreview" class="modal-overlay" @click="closePreview">
          <div class="preview-modal" @click.stop>
            <div class="preview-header">
              <h3>
                <i class="mdi mdi-eye"></i>
                Vista Previa del Menú
              </h3>
              <button @click="closePreview" class="close-btn">
                <i class="mdi mdi-close"></i>
              </button>
            </div>
            
            <div class="preview-content">
              <!-- Simulación del menú en el sidebar -->
              <div class="sidebar-preview">
                <h4>Cómo se verá en el menú lateral:</h4>
                <div class="menu-item-preview">
                  <i :class="previewMenu?.icon"></i>
                  <span>{{ previewMenu?.name }}</span>
                </div>
              </div>
              
              <!-- Información del menú -->
              <div class="menu-details">
                <h4>Detalles del menú:</h4>
                <div class="detail-item">
                  <strong>Nombre:</strong> {{ previewMenu?.name }}
                </div>
                <div class="detail-item">
                  <strong>Ruta:</strong> {{ previewMenu?.path }}
                </div>
                <div class="detail-item">
                  <strong>Icono:</strong> 
                  <i :class="previewMenu?.icon"></i>
                  {{ previewMenu?.icon }}
                </div>
                <div class="detail-item">
                  <strong>Plantilla:</strong> 
                  {{ viewTemplates.find(t => t.value === previewMenu?.template)?.name }}
                </div>
                <div class="detail-item">
                  <strong>Orden:</strong> {{ previewMenu?.order }}
                </div>
                <div class="detail-item">
                  <strong>Estado:</strong> 
                  <span :class="previewMenu?.isActive ? 'status-active' : 'status-inactive'">
                    {{ previewMenu?.isActive ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="preview-actions">
              <button @click="closePreview" class="btn btn-secondary">
                <i class="mdi mdi-close"></i>
                Cerrar
              </button>
              <button @click="saveMenu(); closePreview()" class="btn btn-primary">
                <i class="mdi mdi-check"></i>
                Confirmar y Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import SidebarMenu from '@/components/common/SidebarMenu.vue'
import AppHeader from '@/components/common/AppHeader.vue'
import MenuTreeNode from '@/components/MenuTreeNode.vue'
import menuService from '@/services/menuService'
import authService from '@/services/auth'

const authStore = useAuthStore()
const router = useRouter()

// Estado del sidebar
const sidebarExpanded = ref(true)
const handleSidebarToggle = (expanded) => {
  sidebarExpanded.value = expanded
}

// Estado del formulario
const showDialog = ref(false)
const isEditing = ref(false)
const menuForm = ref({
  name: '',
  path: '',
  icon: '',
  template: 'basic',
  order: 0,
  parentId: null,
  roles: [],
  isActive: true
})

// Estado de validaciones
const validationErrors = ref({})

// Estado de vista previa
const showPreview = ref(false)
const previewMenu = ref(null)

// Estado de carga y errores
const isLoading = ref(false)
const error = ref(null)

// Estado de iconos
const searchQuery = ref('')
const selectedCategory = ref('all')

// Estado de vista
const viewMode = ref('grid') // 'grid' o 'tree'

// Estado para vista de árbol
const expandedNodes = ref([])

// Menús existentes (cargados desde el backend)
const menus = ref([])

// Función para expandir/contraer nodos en vista de árbol
const toggleExpand = (nodeId) => {
  const index = expandedNodes.value.indexOf(nodeId)
  if (index > -1) {
    expandedNodes.value.splice(index, 1)
  } else {
    expandedNodes.value.push(nodeId)
  }
}

// Función para cargar menús desde el backend
// Función para verificar y renovar token si es necesario
const verifyAndRefreshToken = async () => {
  if (!authStore.accessToken) {
    console.log('❌ No hay token de acceso - redirigiendo al login')
    router.push('/login')
    return false
  }
  
  try {
    // Verificar si el token es válido
    await authService.verifyToken()
    console.log('✅ Token válido')
    return true
  } catch (error) {
    console.log('⚠️ Token inválido, intentando renovar...')
    try {
      await authStore.refreshAccessToken()
      console.log('✅ Token renovado exitosamente')
      return true
    } catch (refreshError) {
      console.log('❌ No se pudo renovar el token - redirigiendo al login')
      authStore.logout()
      router.push('/login')
      return false
    }
  }
}

const loadMenus = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    console.log('🔄 Cargando menús usando la misma estrategia que el sidebar...')
    
    // Usar la misma función que usa el sidebar (authService.fetchMenus)
    // que apunta a /menu en lugar de /menus
    const menuData = await authService.fetchMenus()
    console.log('✅ Menús cargados desde authService:', menuData)
    console.log('📊 Cantidad de menús recibidos:', menuData?.length || 0)
    
    // Inspeccionar estructura de cada menú
    if (Array.isArray(menuData) && menuData.length > 0) {
      console.log('🔍 Estructura del primer menú:', menuData[0])
      menuData.forEach((menu, index) => {
        console.log(`🔍 Menú ${index + 1}:`, {
          id: menu.id,
          name: menu.name,
          parentId: menu.parentId,
          hasChildren: menu.children && menu.children.length > 0,
          childrenCount: menu.children ? menu.children.length : 0
        })
      })
      
      menus.value = menuData
      console.log('✅ Menús asignados correctamente')
      
      // También actualizar el store para mantener consistencia
      authStore.setMenus(menuData)
    } else {
      console.warn('⚠️ Backend devolvió datos vacíos o inválidos')
      menus.value = []
    }
  } catch (err) {
    console.error('❌ Error al cargar menús:', err)
    
    // Si hay error, intentar usar los menús ya cargados en el store
    if (authStore.menus && authStore.menus.length > 0) {
      console.log('🔄 Usando menús del store como fallback')
      menus.value = authStore.menus
    } else {
      console.log('❌ No hay menús disponibles en el store')
      error.value = `Error al cargar menús: ${err.message}`
      menus.value = []
    }
  } finally {
    isLoading.value = false
  }
}

// Categorías de iconos
const iconCategories = [
  { id: 'all', name: 'Todos' },
  { id: 'navigation', name: 'Navegación' },
  { id: 'actions', name: 'Acciones' },
  { id: 'data', name: 'Datos' },
  { id: 'ui', name: 'Interfaz' }
]

// Iconos disponibles por categoría
const availableIcons = {
  navigation: [
    'mdi mdi-home', 'mdi mdi-view-dashboard', 'mdi mdi-menu',
    'mdi mdi-arrow-left', 'mdi mdi-arrow-right', 'mdi mdi-chevron-up',
    'mdi mdi-chevron-down', 'mdi mdi-navigation'
  ],
  actions: [
    'mdi mdi-plus', 'mdi mdi-pencil', 'mdi mdi-delete',
    'mdi mdi-content-save', 'mdi mdi-refresh', 'mdi mdi-download',
    'mdi mdi-upload', 'mdi mdi-share'
  ],
  data: [
    'mdi mdi-account-group', 'mdi mdi-table', 'mdi mdi-chart-line',
    'mdi mdi-database', 'mdi mdi-file-document', 'mdi mdi-folder',
    'mdi mdi-calendar', 'mdi mdi-clock'
  ],
  ui: [
    'mdi mdi-cog', 'mdi mdi-palette', 'mdi mdi-eye',
    'mdi mdi-heart', 'mdi mdi-star', 'mdi mdi-bell',
    'mdi mdi-message', 'mdi mdi-help-circle'
  ]
}

// Plantillas de vista
const viewTemplates = [
  {
    value: 'basic',
    name: 'Vista Básica',
    description: 'Página simple con contenido estático',
    icon: 'mdi mdi-file-document-outline',
    features: ['Contenido Simple', 'Texto e Imágenes', 'Fácil de Usar']
  },
  {
    value: 'form',
    name: 'Vista de Formulario',
    description: 'Formulario para captura de datos',
    icon: 'mdi mdi-form-select',
    features: ['Campos de Entrada', 'Validaciones', 'Envío de Datos']
  },
  {
    value: 'table',
    name: 'Vista de Tabla',
    description: 'Listado de datos con funciones CRUD',
    icon: 'mdi mdi-table',
    features: ['Listado de Datos', 'Búsqueda', 'Paginación', 'CRUD']
  },
  {
    value: 'dashboard',
    name: 'Vista de Dashboard',
    description: 'Panel con métricas y gráficos',
    icon: 'mdi mdi-view-dashboard',
    features: ['Métricas', 'Gráficos', 'Widgets', 'Tiempo Real']
  }
]

// Roles disponibles
const availableRoles = [
  {
    value: 'ROLE_SUPER_USER',
    label: 'Super Usuario',
    icon: 'mdi mdi-account-star',
    description: 'Acceso completo al sistema'
  },
  {
    value: 'ROLE_ADMIN',
    label: 'Administrador',
    icon: 'mdi mdi-account-key',
    description: 'Gestión de usuarios y configuración'
  },
  {
    value: 'ROLE_COLLABORATOR',
    label: 'Colaborador',
    icon: 'mdi mdi-account-group',
    description: 'Acceso a funciones básicas'
  },
  {
    value: 'ROLE_USER',
    label: 'Usuario',
    icon: 'mdi mdi-account',
    description: 'Acceso limitado de solo lectura'
  }
]

// Computed
const filteredMenus = computed(() => {
  return menus.value
})

const availableParentMenus = computed(() => {
  // Filtrar menús que no sean el actual (para evitar referencias circulares)
  return menus.value.filter(menu => 
    !isEditing.value || menu.id !== menuForm.value.id
  )
})

const rootMenus = computed(() => {
  return menus.value
    .filter(menu => !menu.parentId)
    .sort((a, b) => a.order - b.order)
})

const displayedIcons = computed(() => {
  let icons = []
  
  if (selectedCategory.value === 'all') {
    icons = Object.values(availableIcons).flat()
  } else {
    icons = availableIcons[selectedCategory.value] || []
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    icons = icons.filter(icon => icon.toLowerCase().includes(query))
  }
  
  return icons
})

// Métodos
const openDialog = () => {
  resetForm()
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  resetForm()
}

const editMenu = (menu) => {
  menuForm.value = { ...menu }
  isEditing.value = true
  showDialog.value = true
}

const deleteMenu = async (menu) => {
  // Verificar si el menú tiene submenús
  const children = getMenuChildren(menu.id)
  let confirmMessage = `¿Estás seguro de que quieres eliminar el menú "${menu.name}"?`
  
  if (children.length > 0) {
    confirmMessage = `El menú "${menu.name}" tiene ${children.length} submenú(s). Al eliminarlo, también se eliminarán todos sus submenús. ¿Estás seguro de continuar?`
  }
  
  if (confirm(confirmMessage)) {
    isLoading.value = true
    error.value = null
    
    try {
      console.log('🗑️ Eliminando menú:', menu.name)
      
      // Si tiene hijos, eliminarlos primero
      if (children.length > 0) {
        console.log(`🗑️ Eliminando ${children.length} submenús...`)
        for (const child of children) {
          await menuService.deleteMenu(child.id)
          console.log(`✅ Submenú "${child.name}" eliminado`)
        }
      }
      
      // Eliminar el menú principal
      await menuService.deleteMenu(menu.id)
      console.log('✅ Menú eliminado exitosamente')
      
      // Recargar la lista de menús
      await loadMenus()
    } catch (err) {
      console.error('❌ Error al eliminar menú:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }
}

const saveMenu = async () => {
  console.log('🔍 Iniciando saveMenu...')
  console.log('📋 Datos del formulario:', JSON.stringify(menuForm.value, null, 2))
  
  if (!validateForm()) {
    console.log('❌ Validación del formulario falló')
    console.log('🚫 Errores de validación:', validationErrors.value)
    return
  }
  
  console.log('✅ Validación del formulario exitosa')
  
  isLoading.value = true
  error.value = null
  
  try {
    if (isEditing.value) {
      console.log('✏️ Actualizando menú:', menuForm.value.name)
      console.log('🆔 ID del menú a actualizar:', menuForm.value.id)
      console.log('📤 Datos a enviar:', JSON.stringify(menuForm.value, null, 2))
      
      const result = await menuService.updateMenu(menuForm.value.id, menuForm.value)
      console.log('✅ Menú actualizado exitosamente')
      console.log('📥 Respuesta del servidor:', result)
    } else {
      console.log('➕ Creando nuevo menú:', menuForm.value.name)
      console.log('📤 Datos a enviar:', JSON.stringify(menuForm.value, null, 2))
      
      const result = await menuService.createMenu(menuForm.value)
      console.log('✅ Menú creado exitosamente')
      console.log('📥 Respuesta del servidor:', result)
    }
    
    // Recargar la lista de menús
    console.log('🔄 Recargando lista de menús...')
    await loadMenus()
    
    // Cerrar el diálogo
    console.log('🚪 Cerrando diálogo...')
    closeDialog()
  } catch (err) {
    console.error('❌ Error al guardar menú:', err)
    console.error('🔍 Detalles del error:')
    console.error('  - Mensaje:', err.message)
    console.error('  - Código de estado:', err.response?.status)
    console.error('  - Datos de respuesta:', err.response?.data)
    console.error('  - Headers:', err.response?.headers)
    console.error('  - Stack trace:', err.stack)
    
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  menuForm.value = {
    name: '',
    path: '',
    icon: '',
    template: 'basic',
    order: 0,
    parentId: null,
    roles: [],
    isActive: true
  }
  isEditing.value = false
  validationErrors.value = {}
}

const generatePath = () => {
  if (menuForm.value.name && !isEditing.value) {
    const path = '/' + menuForm.value.name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    
    menuForm.value.path = path
  }
  validateForm()
}

const validateForm = () => {
  const errors = {}
  
  // Validar nombre
  if (!menuForm.value.name.trim()) {
    errors.name = 'El nombre del menú es obligatorio'
  } else if (menuForm.value.name.length < 3) {
    errors.name = 'El nombre debe tener al menos 3 caracteres'
  } else if (menuForm.value.name.length > 50) {
    errors.name = 'El nombre no puede exceder 50 caracteres'
  }

  // Validar ruta
  if (!menuForm.value.path.trim()) {
    errors.path = 'La ruta es obligatoria'
  } else if (!menuForm.value.path.startsWith('/')) {
    errors.path = 'La ruta debe comenzar con /'
  } else if (!/^\/[a-z0-9\-\/]*$/.test(menuForm.value.path)) {
    errors.path = 'La ruta solo puede contener letras minúsculas, números, guiones y barras'
  }

  // Validar icono
  if (!menuForm.value.icon) {
    errors.icon = 'Debe seleccionar un icono'
  }

  // Validar plantilla
  if (!menuForm.value.template) {
    errors.template = 'Debe seleccionar una plantilla de vista'
  }

  // Validar menú padre si es submenú
  if (menuForm.value.parentId !== null && !menuForm.value.parentId) {
    errors.parentId = 'Debe seleccionar un menú padre'
  }

  // Validar roles
  if (!menuForm.value.roles || menuForm.value.roles.length === 0) {
    errors.roles = 'Debe seleccionar al menos un rol de acceso'
  }

  // Validar orden
  if (menuForm.value.order < 0) {
    errors.order = 'El orden no puede ser negativo'
  }

  // Solo actualizar si hay cambios para evitar recursión
  const currentErrorsString = JSON.stringify(validationErrors.value)
  const newErrorsString = JSON.stringify(errors)
  
  if (currentErrorsString !== newErrorsString) {
    validationErrors.value = errors
  }
  
  return Object.keys(errors).length === 0
}

const openPreview = () => {
  if (!validateForm()) return
  
  previewMenu.value = {
    ...menuForm.value,
    id: Date.now(),
    createdAt: new Date().toISOString()
  }
  showPreview.value = true
}

const closePreview = () => {
  showPreview.value = false
  previewMenu.value = null
}

// Funciones auxiliares
const getParentMenuName = (parentId) => {
  const parent = menus.value.find(menu => menu.id === parentId)
  return parent ? parent.name : 'Desconocido'
}

const getRoleLabel = (roleValue) => {
  const role = availableRoles.find(r => r.value === roleValue)
  return role ? role.label : roleValue
}

// Funciones para manejo de submenús
const setMenuType = (type) => {
  if (type === 'root') {
    menuForm.value.parentId = null
  } else if (type === 'submenu') {
    menuForm.value.parentId = ''
  }
  validateForm()
}

const getMenuChildren = (menuId) => {
  return menus.value.filter(menu => menu.parentId === menuId)
}

// Función para construir jerarquía de menús (adaptada para datos ya jerárquicos del backend)
const buildMenuHierarchy = () => {
  console.log('🔍 buildMenuHierarchy - Datos de entrada:', menus.value)
  console.log('🔍 buildMenuHierarchy - Cantidad total de menús:', menus.value.length)
  
  // El backend ya devuelve los menús con estructura jerárquica
  // Solo necesitamos asegurar que la estructura esté completa
  const processMenu = (menu) => {
    const processedMenu = {
      ...menu,
      children: menu.children ? menu.children.map(child => processMenu(child)) : []
    }
    console.log(`🔍 processMenu - Procesando menú "${menu.name}":`, {
      id: menu.id,
      name: menu.name,
      hasChildren: menu.children && menu.children.length > 0,
      childrenCount: menu.children ? menu.children.length : 0
    })
    return processedMenu
  }
  
  // Procesar todos los menús (que ya son menús raíz del backend)
  const hierarchy = menus.value.map(menu => processMenu(menu))
  
  console.log('🔍 buildMenuHierarchy - Jerarquía final:', hierarchy)
  return hierarchy
}

// Computed para obtener menús con jerarquía
const hierarchicalMenus = computed(() => {
  console.log('🔍 hierarchicalMenus computed - Ejecutándose...')
  const result = buildMenuHierarchy()
  console.log('🔍 hierarchicalMenus computed - Resultado:', result)
  return result
})

const createSubmenu = (parentMenu) => {
  // Resetear el formulario
  resetForm()
  
  // Configurar como submenú del menú seleccionado
  menuForm.value.parentId = parentMenu.id
  
  // Generar orden automático para el submenú
  const siblings = getMenuChildren(parentMenu.id)
  menuForm.value.order = siblings.length + 1
  
  // Abrir el modal
  showDialog.value = true
  isEditing.value = false
  
  // Enfocar el campo de nombre después de que el modal se abra
  nextTick(() => {
    const nameInput = document.querySelector('#menuName')
    if (nameInput) {
      nameInput.focus()
    }
  })
}

const moveMenu = async (menuId, newParentId, newOrder) => {
  try {
    isLoading.value = true
    await menuService.updateMenuOrder({
      menuId,
      parentId: newParentId,
      order: newOrder
    })
    await loadMenus() // Recargar la lista
  } catch (err) {
    console.error('Error al mover menú:', err)
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}

// Verificar permisos de SuperAdmin
const checkSuperAdminAccess = () => {
  console.log('🔍 MenuManagerView - Verificando acceso SuperAdmin')
  console.log('🔍 Usuario completo:', authStore.user)
  console.log('🔍 Roles del usuario:', authStore.userRoles)
  console.log('🔍 ¿Tiene ROLE_SUPER_USER?', authStore.hasRole('ROLE_SUPER_USER'))
  
  // Usar la misma lógica de roles que el resto de la aplicación
  if (!authStore.hasRole('ROLE_SUPER_USER')) {
    console.log('❌ Acceso denegado en MenuManagerView - Redirigiendo al dashboard')
    router.push('/dashboard')
    return false
  }
  
  console.log('✅ Acceso permitido en MenuManagerView')
  return true
}

// Watchers
watch(() => menuForm.value.name, validateForm)
watch(() => menuForm.value.path, validateForm)
watch(() => menuForm.value.icon, validateForm)
watch(() => menuForm.value.template, validateForm)

onMounted(() => {
  // Verificar permisos de SuperAdmin
  if (!checkSuperAdminAccess()) {
    return
  }
  
  // Cargar menús desde el backend
  loadMenus()
})
</script>

<style scoped>
/* Variables CSS */
:root {
  --primary-color: #2563eb;
  --accent-color: #2563eb;
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-hover: #f1f5f9;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
  --shadow-color: rgba(0, 0, 0, 0.1);
  --success-color: #059669;
  --error-color: #dc2626;
  --warning-color: #d97706;
}

/* Layout principal */
.menu-manager-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-secondary);
}

.main-content {
  flex: 1;
  margin-left: 280px;
  padding-top: 80px;
  transition: margin-left 0.3s ease;
}

.main-content.with-header {
  padding-top: 80px;
}

.menu-manager-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.manager-header {
  text-align: center;
  margin-bottom: 3rem;
}

.manager-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.manager-title i {
  color: var(--accent-color);
}

.manager-subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin: 0;
  max-width: 600px;
  margin: 0 auto;
}

/* Barra de acciones */
.action-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.create-menu-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, var(--accent-color), #1d4ed8);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.create-menu-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
}

/* Grid de menús */
.menus-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.menu-card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.menu-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px var(--shadow-color);
  border-color: var(--accent-color);
}

.menu-card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.menu-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--accent-color), #1d4ed8);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.menu-info h3 {
  margin: 0 0 0.25rem 0;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
}

.menu-info p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.menu-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.edit-btn, .delete-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn {
  background: rgba(37, 99, 235, 0.1);
  color: var(--accent-color);
}

.edit-btn:hover {
  background: rgba(37, 99, 235, 0.2);
}

.delete-btn {
  background: rgba(220, 38, 38, 0.1);
  color: var(--error-color);
}

.delete-btn:hover {
  background: rgba(220, 38, 38, 0.2);
}

/* Modal */
.dialog-overlay, .modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.dialog-content {
  background: var(--bg-primary);
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, var(--accent-color), #1d4ed8);
  color: white;
}

.dialog-header h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dialog-body {
  padding: 2rem;
  max-height: 70vh;
  overflow-y: auto;
}

/* Secciones del formulario */
.form-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1.5rem 0;
}

.section-title i {
  color: var(--accent-color);
}

/* Campos del formulario */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-label i {
  color: var(--accent-color);
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: var(--bg-primary);
}

.form-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-input.error {
  border-color: var(--error-color);
  background: rgba(220, 38, 38, 0.05);
}

.form-input.error:focus {
  border-color: var(--error-color);
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

/* Mensajes de error y ayuda */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--error-color);
  font-size: 0.875rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: 6px;
}

.error-message i {
  font-size: 1rem;
}

.help-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(37, 99, 235, 0.05);
  border: 1px solid rgba(37, 99, 235, 0.1);
  border-radius: 6px;
}

.help-text i {
  color: var(--accent-color);
  font-size: 1rem;
}

/* Selector de iconos */
.icon-selector {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  background: var(--bg-secondary);
}

.selected-icon {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-primary);
  border: 2px solid var(--accent-color);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.selected-icon i {
  font-size: 1.5rem;
  color: var(--accent-color);
}

.clear-icon {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
}

.clear-icon:hover {
  background: var(--bg-hover);
}

.icon-search {
  position: relative;
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.9rem;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

.icon-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.category-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-secondary);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.category-btn:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.category-btn.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.icon-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.25rem;
  color: var(--text-secondary);
}

.icon-item:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
  transform: scale(1.05);
}

.icon-item.selected {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.no-icons-found {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.no-icons-found i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

/* Selector de plantillas mejorado */
.template-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.template-option {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.template-option:hover {
  border-color: var(--accent-color);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px var(--shadow-color);
}

.template-option.selected {
  border-color: var(--accent-color);
  background: rgba(37, 99, 235, 0.05);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.2);
}

.template-option.selected::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(135deg, var(--accent-color), #1d4ed8);
}

.template-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.template-preview i {
  font-size: 2rem;
  color: var(--accent-color);
  flex-shrink: 0;
}

.template-mockup {
  flex: 1;
  height: 80px;
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
}

/* Mockups específicos */
.mockup-basic {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mockup-header {
  height: 20px;
  background: var(--accent-color);
  border-radius: 4px;
  opacity: 0.7;
}

.mockup-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mockup-line {
  height: 8px;
  background: var(--text-secondary);
  border-radius: 2px;
  opacity: 0.3;
}

.mockup-line.short {
  width: 60%;
}

.mockup-form {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mockup-field {
  height: 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.mockup-button {
  height: 16px;
  width: 50%;
  background: var(--accent-color);
  border-radius: 4px;
  opacity: 0.7;
  margin-top: auto;
}

.mockup-table {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mockup-table-header {
  height: 12px;
  background: var(--accent-color);
  border-radius: 2px;
  opacity: 0.7;
}

.mockup-table-row {
  height: 10px;
  background: var(--text-secondary);
  border-radius: 2px;
  opacity: 0.2;
}

.mockup-dashboard {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mockup-cards {
  display: flex;
  gap: 0.5rem;
  height: 30px;
}

.mockup-card {
  flex: 1;
  background: var(--accent-color);
  border-radius: 4px;
  opacity: 0.6;
}

.mockup-chart {
  flex: 1;
  background: linear-gradient(45deg, var(--accent-color) 0%, transparent 50%, var(--accent-color) 100%);
  border-radius: 4px;
  opacity: 0.3;
}

.template-info {
  text-align: left;
}

.template-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.template-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

.template-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.feature-tag {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: rgba(37, 99, 235, 0.1);
  color: var(--accent-color);
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid rgba(37, 99, 235, 0.2);
}

.template-option.selected .feature-tag {
  background: rgba(37, 99, 235, 0.15);
  border-color: rgba(37, 99, 235, 0.3);
}

/* Checkbox */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.form-checkbox {
  width: 1.25rem;
  height: 1.25rem;
}

.checkbox-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

/* Footer del diálogo */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
}

/* Botones */
.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--accent-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-hover);
}

/* Modal de Vista Previa */
.preview-modal {
  background: var(--bg-primary);
  border-radius: 16px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, var(--accent-color), #1d4ed8);
  color: white;
}

.preview-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1.25rem;
}

.preview-content {
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  max-height: 60vh;
  overflow-y: auto;
}

.sidebar-preview {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
}

.sidebar-preview h4 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1rem;
}

.menu-item-preview {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-weight: 500;
}

.menu-item-preview i {
  font-size: 1.25rem;
  color: var(--accent-color);
}

.menu-details h4 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}

.detail-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.detail-item strong {
  min-width: 80px;
  color: var(--text-primary);
}

.detail-item i {
  color: var(--accent-color);
  margin-right: 0.25rem;
}

.status-active {
  color: var(--success-color);
  font-weight: 600;
}

.status-inactive {
  color: var(--error-color);
  font-weight: 600;
}

.preview-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
}

/* Estilos para carga y errores */
.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  margin-bottom: 2rem;
  color: var(--text-secondary);
}

.loading-indicator i {
  font-size: 1.5rem;
  color: var(--accent-color);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: var(--error-bg, #fee);
  border: 1px solid var(--error-color);
  border-radius: 8px;
  margin-bottom: 2rem;
  color: var(--error-color);
}

.error-message i {
  font-size: 1.25rem;
}

.retry-btn {
  margin-left: auto;
  padding: 0.5rem 1rem;
  background: var(--error-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: var(--error-hover, #c53030);
  transform: translateY(-1px);
}

.retry-btn:active {
  transform: translateY(0);
}

/* Botones deshabilitados */
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

/* Estilos para selector de roles */
.roles-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
}

.role-option {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s ease;
}

.role-option:hover {
  border-color: var(--accent-color);
  background: var(--bg-hover);
}

.role-option .checkbox-label {
  margin-bottom: 0.5rem;
}

.role-option .checkbox-text {
  font-weight: 500;
  color: var(--text-primary);
}

.role-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
  line-height: 1.4;
}

/* Estilos para vista de árbol */
.menu-tree {
  margin-top: 2rem;
}

.tree-container {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
}

.tree-container:empty::before {
  content: "No hay menús para mostrar";
  display: block;
  text-align: center;
  color: var(--text-secondary);
  font-style: italic;
  padding: 2rem;
}

/* Estilos para selector de tipo de menú */
.menu-type-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 0.5rem;
}

.menu-type-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--bg-primary);
}

.menu-type-option:hover {
  border-color: var(--primary-color);
  background: var(--bg-hover);
}

.menu-type-option.active {
  border-color: var(--primary-color);
  background: rgba(37, 99, 235, 0.05);
}

.menu-type-option i {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.option-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.option-title {
  font-weight: 600;
  color: var(--text-primary);
}

.option-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.3;
}

/* Estilos para vista previa de jerarquía */
.hierarchy-preview {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  margin-top: 0.5rem;
}

.hierarchy-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg-primary);
  border-radius: 6px;
  border: 1px solid var(--border-color);
}

.hierarchy-item.parent {
  background: rgba(37, 99, 235, 0.1);
  border-color: var(--primary-color);
}

.hierarchy-item.child {
  background: rgba(34, 197, 94, 0.1);
  border-color: #22c55e;
}

.hierarchy-item i {
  color: var(--primary-color);
}

.hierarchy-item.child i {
  color: #22c55e;
}

.hierarchy-connector {
  color: var(--text-secondary);
  font-size: 1.25rem;
}

/* Estilos para visualización mejorada de submenús */
.menu-card.is-submenu {
  border-left: 4px solid #22c55e;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, transparent 100%);
}

.menu-card.has-children {
  border-left: 4px solid var(--primary-color);
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, transparent 100%);
}

.menu-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.menu-badges {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: flex-end;
}

.submenu-badge,
.parent-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.submenu-badge {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.parent-badge {
  background: rgba(37, 99, 235, 0.1);
  color: var(--primary-color);
  border: 1px solid rgba(37, 99, 235, 0.2);
}

.menu-parent i {
  margin-right: 0.25rem;
  color: var(--text-secondary);
}

.add-submenu-btn {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-submenu-btn:hover {
  background: rgba(34, 197, 94, 0.2);
  transform: translateY(-1px);
}

.add-submenu-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Estilos para vista de árbol jerárquico */
.menu-tree-view {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px var(--shadow-color);
}

.tree-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tree-node {
  border-radius: 8px;
  transition: all 0.2s ease;
}

.root-node {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  margin-bottom: 1rem;
}

.root-node:hover {
  border-color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
}

.child-node {
  background: rgba(34, 197, 94, 0.05);
  border: 1px solid rgba(34, 197, 94, 0.1);
  margin-left: 2rem;
  margin-bottom: 0.5rem;
}

.child-node:hover {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

.node-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
}

.node-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.expand-toggle {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: 4px;
  transition: all 0.2s ease;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.expand-toggle:hover {
  background: var(--bg-hover);
  color: var(--primary-color);
}

.expand-toggle.expanded i {
  transform: rotate(90deg);
}

.node-spacer {
  width: 24px;
  height: 24px;
}

.child-connector {
  color: #22c55e;
  font-size: 1.25rem;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.node-icon {
  color: var(--primary-color);
  font-size: 1.5rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(37, 99, 235, 0.1);
  border-radius: 6px;
}

.child-node .node-icon {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

.node-info {
  flex: 1;
  min-width: 0;
}

.node-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.child-node .node-name {
  font-size: 1rem;
  font-weight: 500;
}

.node-path {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-family: 'Courier New', monospace;
  background: var(--bg-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 0.5rem;
}

.node-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.node-order,
.children-count,
.submenu-indicator {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
}

.node-order {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.children-count {
  background: rgba(37, 99, 235, 0.1);
  color: var(--primary-color);
}

.submenu-indicator {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.node-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.node-actions .small {
  padding: 0.5rem;
  font-size: 0.9rem;
  min-width: auto;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.children-container {
  padding-left: 1rem;
  border-left: 2px solid rgba(37, 99, 235, 0.1);
  margin-left: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding-top: 60px;
  }
  
  .menu-manager-container {
    padding: 1rem;
  }
  
  .manager-title {
    font-size: 2rem;
  }
  
  .menus-grid {
    grid-template-columns: 1fr;
  }
  
  .template-selector {
    grid-template-columns: 1fr;
  }
  
  .preview-content {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .dialog-content {
    margin: 1rem;
    max-width: calc(100vw - 2rem);
  }
}
</style>