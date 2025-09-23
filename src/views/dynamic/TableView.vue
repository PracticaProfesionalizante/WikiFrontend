<template>
  <div class="table-view-layout">
    <SidebarMenu @sidebar-toggle="handleSidebarToggle" />
    <AppHeader :sidebar-expanded="sidebarExpanded" />
    
    <div class="main-content" :class="{ 'with-header': true }">
      <div class="table-container">
        <div class="table-header">
          <h1 class="table-title">
            <i :class="menuIcon || 'mdi mdi-table'"></i>
            {{ menuTitle || 'Tabla de Datos' }}
          </h1>
          <p class="table-subtitle">
            Gestiona y visualiza los datos en formato de tabla
          </p>
        </div>

        <div class="table-controls">
          <div class="controls-left">
            <div class="search-box">
              <i class="mdi mdi-magnify"></i>
              <input 
                v-model="searchQuery"
                type="text"
                placeholder="Buscar en la tabla..."
                class="search-input"
              >
            </div>
            
            <div class="filter-dropdown">
              <select v-model="statusFilter" class="filter-select">
                <option value="">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </div>
          </div>

          <div class="controls-right">
            <button class="export-btn" @click="exportData">
              <i class="mdi mdi-download"></i>
              Exportar
            </button>
            <button class="add-btn" @click="openAddDialog">
              <i class="mdi mdi-plus"></i>
              Agregar Nuevo
            </button>
          </div>
        </div>

        <div class="table-wrapper">
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="sortable" @click="sortBy('id')">
                    ID
                    <i class="mdi" :class="getSortIcon('id')"></i>
                  </th>
                  <th class="sortable" @click="sortBy('name')">
                    Nombre
                    <i class="mdi" :class="getSortIcon('name')"></i>
                  </th>
                  <th class="sortable" @click="sortBy('email')">
                    Email
                    <i class="mdi" :class="getSortIcon('email')"></i>
                  </th>
                  <th class="sortable" @click="sortBy('status')">
                    Estado
                    <i class="mdi" :class="getSortIcon('status')"></i>
                  </th>
                  <th class="sortable" @click="sortBy('createdAt')">
                    Fecha Creación
                    <i class="mdi" :class="getSortIcon('createdAt')"></i>
                  </th>
                  <th class="actions-header">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in paginatedData" :key="item.id" class="table-row">
                  <td class="id-cell">{{ item.id }}</td>
                  <td class="name-cell">
                    <div class="user-info">
                      <div class="user-avatar">
                        {{ item.name.charAt(0).toUpperCase() }}
                      </div>
                      <span>{{ item.name }}</span>
                    </div>
                  </td>
                  <td class="email-cell">{{ item.email }}</td>
                  <td class="status-cell">
                    <span class="status-badge" :class="item.status">
                      {{ item.status }}
                    </span>
                  </td>
                  <td class="date-cell">{{ formatDate(item.createdAt) }}</td>
                  <td class="actions-cell">
                    <div class="action-buttons">
                      <button 
                        class="action-btn view-btn"
                        @click="viewItem(item)"
                        title="Ver detalles"
                      >
                        <i class="mdi mdi-eye"></i>
                      </button>
                      <button 
                        class="action-btn edit-btn"
                        @click="editItem(item)"
                        title="Editar"
                      >
                        <i class="mdi mdi-pencil"></i>
                      </button>
                      <button 
                        class="action-btn delete-btn"
                        @click="confirmDelete(item)"
                        title="Eliminar"
                      >
                        <i class="mdi mdi-delete"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mensaje cuando no hay datos -->
          <div v-if="filteredData.length === 0" class="empty-state">
            <i class="mdi mdi-database-off"></i>
            <h3>No hay datos disponibles</h3>
            <p>{{ searchQuery ? 'No se encontraron resultados para tu búsqueda' : 'Aún no hay elementos para mostrar' }}</p>
            <button class="add-first-btn" @click="openAddDialog">
              <i class="mdi mdi-plus"></i>
              Agregar Primer Elemento
            </button>
          </div>
        </div>

        <!-- Paginación -->
        <div v-if="filteredData.length > 0" class="pagination">
          <div class="pagination-info">
            Mostrando {{ startIndex + 1 }} - {{ endIndex }} de {{ filteredData.length }} elementos
          </div>
          
          <div class="pagination-controls">
            <button 
              class="page-btn"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
            >
              <i class="mdi mdi-chevron-left"></i>
            </button>
            
            <span class="page-numbers">
              <button 
                v-for="page in visiblePages" 
                :key="page"
                class="page-number"
                :class="{ 'active': page === currentPage }"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
            </span>
            
            <button 
              class="page-btn"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
            >
              <i class="mdi mdi-chevron-right"></i>
            </button>
          </div>

          <div class="items-per-page">
            <select v-model="itemsPerPage" class="per-page-select">
              <option value="10">10 por página</option>
              <option value="25">25 por página</option>
              <option value="50">50 por página</option>
              <option value="100">100 por página</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para agregar/editar -->
    <div v-if="showDialog" class="dialog-overlay" @click="closeDialog">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h2 class="dialog-title">
            <i class="mdi mdi-account-plus"></i>
            {{ isEditing ? 'Editar Elemento' : 'Agregar Nuevo Elemento' }}
          </h2>
          <button class="close-btn" @click="closeDialog">
            <i class="mdi mdi-close"></i>
          </button>
        </div>

        <div class="dialog-body">
          <form @submit.prevent="saveItem" class="item-form">
            <div class="form-group">
              <label class="form-label">Nombre</label>
              <input 
                v-model="itemForm.name"
                type="text" 
                class="form-input"
                placeholder="Ingresa el nombre"
                required
              >
            </div>

            <div class="form-group">
              <label class="form-label">Email</label>
              <input 
                v-model="itemForm.email"
                type="email" 
                class="form-input"
                placeholder="Ingresa el email"
                required
              >
            </div>

            <div class="form-group">
              <label class="form-label">Estado</label>
              <select v-model="itemForm.status" class="form-select" required>
                <option value="">Selecciona un estado</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </div>

            <div class="dialog-footer">
              <button type="button" class="cancel-btn" @click="closeDialog">
                Cancelar
              </button>
              <button type="submit" class="save-btn">
                {{ isEditing ? 'Guardar Cambios' : 'Agregar Elemento' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación para eliminar -->
    <div v-if="showDeleteDialog" class="dialog-overlay" @click="closeDeleteDialog">
      <div class="delete-dialog" @click.stop>
        <div class="delete-icon">
          <i class="mdi mdi-alert-circle"></i>
        </div>
        <h3>¿Eliminar elemento?</h3>
        <p>
          Se eliminará el elemento "<strong>{{ itemToDelete?.name }}</strong>".
          <br>Esta acción no se puede deshacer.
        </p>
        <div class="delete-actions">
          <button class="cancel-btn" @click="closeDeleteDialog">
            Cancelar
          </button>
          <button class="confirm-delete-btn" @click="deleteItem">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import SidebarMenu from '@/components/common/SidebarMenu.vue'
import AppHeader from '@/components/common/AppHeader.vue'

const route = useRoute()
const authStore = useAuthStore()
const sidebarExpanded = ref(false)

// Props dinámicos basados en el menú
const menuTitle = ref('')
const menuIcon = ref('')

// Estados de la tabla
const searchQuery = ref('')
const statusFilter = ref('')
const sortField = ref('id')
const sortDirection = ref('asc')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Estados de modales
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const isEditing = ref(false)
const itemToDelete = ref(null)

// Formulario de elemento
const itemForm = ref({
  id: null,
  name: '',
  email: '',
  status: ''
})

// Datos de ejemplo (en una aplicación real vendrían del backend)
const tableData = ref([
  {
    id: 1,
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    status: 'activo',
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    name: 'María García',
    email: 'maria.garcia@email.com',
    status: 'inactivo',
    createdAt: '2024-01-20'
  },
  {
    id: 3,
    name: 'Carlos López',
    email: 'carlos.lopez@email.com',
    status: 'pendiente',
    createdAt: '2024-01-25'
  },
  {
    id: 4,
    name: 'Ana Martínez',
    email: 'ana.martinez@email.com',
    status: 'activo',
    createdAt: '2024-02-01'
  },
  {
    id: 5,
    name: 'Pedro Rodríguez',
    email: 'pedro.rodriguez@email.com',
    status: 'activo',
    createdAt: '2024-02-05'
  }
])

// Computed properties
const filteredData = computed(() => {
  let data = tableData.value

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    data = data.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.email.toLowerCase().includes(query)
    )
  }

  // Filtrar por estado
  if (statusFilter.value) {
    data = data.filter(item => item.status === statusFilter.value)
  }

  // Ordenar
  data.sort((a, b) => {
    const aVal = a[sortField.value]
    const bVal = b[sortField.value]
    
    if (sortDirection.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  return data
})

const totalPages = computed(() => {
  return Math.ceil(filteredData.value.length / itemsPerPage.value)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage.value
})

const endIndex = computed(() => {
  return Math.min(startIndex.value + itemsPerPage.value, filteredData.value.length)
})

const paginatedData = computed(() => {
  return filteredData.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Métodos
const handleSidebarToggle = (expanded) => {
  sidebarExpanded.value = expanded
}

const sortBy = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

const getSortIcon = (field) => {
  if (sortField.value !== field) return 'mdi-sort'
  return sortDirection.value === 'asc' ? 'mdi-sort-ascending' : 'mdi-sort-descending'
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const openAddDialog = () => {
  resetForm()
  isEditing.value = false
  showDialog.value = true
}

const editItem = (item) => {
  itemForm.value = { ...item }
  isEditing.value = true
  showDialog.value = true
}

const viewItem = (item) => {
  alert(`Ver detalles de: ${item.name}\nEmail: ${item.email}\nEstado: ${item.status}`)
}

const closeDialog = () => {
  showDialog.value = false
  resetForm()
}

const resetForm = () => {
  itemForm.value = {
    id: null,
    name: '',
    email: '',
    status: ''
  }
}

const saveItem = () => {
  if (isEditing.value) {
    // Actualizar elemento existente
    const index = tableData.value.findIndex(item => item.id === itemForm.value.id)
    if (index !== -1) {
      tableData.value[index] = { ...itemForm.value }
    }
  } else {
    // Agregar nuevo elemento
    const newItem = {
      ...itemForm.value,
      id: Math.max(...tableData.value.map(item => item.id)) + 1,
      createdAt: new Date().toISOString().split('T')[0]
    }
    tableData.value.push(newItem)
  }
  
  closeDialog()
}

const confirmDelete = (item) => {
  itemToDelete.value = item
  showDeleteDialog.value = true
}

const closeDeleteDialog = () => {
  showDeleteDialog.value = false
  itemToDelete.value = null
}

const deleteItem = () => {
  const index = tableData.value.findIndex(item => item.id === itemToDelete.value.id)
  if (index !== -1) {
    tableData.value.splice(index, 1)
  }
  closeDeleteDialog()
}

const exportData = () => {
  // Simular exportación
  const csvContent = [
    ['ID', 'Nombre', 'Email', 'Estado', 'Fecha Creación'],
    ...filteredData.value.map(item => [
      item.id,
      item.name,
      item.email,
      item.status,
      item.createdAt
    ])
  ].map(row => row.join(',')).join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'datos.csv'
  a.click()
  window.URL.revokeObjectURL(url)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  // Buscar información del menú actual
  const currentPath = route.path
  const currentMenu = authStore.menus?.find(menu => menu.path === currentPath)
  
  if (currentMenu) {
    menuTitle.value = currentMenu.name
    menuIcon.value = currentMenu.icon
  }
})
</script>

<style scoped>
.table-view-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
}

.main-content {
  flex: 1;
  margin-left: 60px;
  transition: margin-left 0.3s ease;
  min-height: 100vh;
}

.main-content.with-header {
  padding-top: 70px;
}

.table-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.table-header {
  text-align: center;
  margin-bottom: 3rem;
  background: var(--bg-primary);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 60px var(--shadow-color);
  border: 1px solid var(--border-color);
}

.table-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: linear-gradient(135deg, var(--accent-color), #1d4ed8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.table-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
}

.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.controls-left {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.filter-select, .per-page-select {
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;
}

.controls-right {
  display: flex;
  gap: 1rem;
}

.export-btn, .add-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.export-btn {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.export-btn:hover {
  background: var(--bg-hover);
}

.add-btn {
  background: linear-gradient(135deg, var(--accent-color), #1d4ed8);
  color: white;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
}

.table-wrapper {
  background: var(--bg-secondary);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 15px var(--shadow-color);
  overflow: hidden;
  margin-bottom: 2rem;
}

.table-scroll {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-weight: 600;
  padding: 1rem;
  text-align: left;
  border-bottom: 2px solid var(--border-color);
  white-space: nowrap;
}

.data-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.data-table th.sortable:hover {
  background: var(--bg-hover);
}

.data-table th.sortable i {
  margin-left: 0.5rem;
  opacity: 0.5;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
}

.table-row:hover {
  background: var(--bg-hover);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--accent-color), #1d4ed8);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.activo {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-badge.inactivo {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.status-badge.pendiente {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.view-btn {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.view-btn:hover {
  background: rgba(59, 130, 246, 0.2);
}

.edit-btn {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.edit-btn:hover {
  background: rgba(245, 158, 11, 0.2);
}

.delete-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.add-first-btn {
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--accent-color), #1d4ed8);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.add-first-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.pagination-info {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: var(--bg-hover);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-number {
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.page-number:hover {
  background: var(--bg-hover);
}

.page-number.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

/* Estilos de modales */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 2rem;
}

.dialog-content {
  background: var(--bg-primary);
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.dialog-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

.dialog-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-input, .form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn, .save-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.cancel-btn:hover {
  background: var(--bg-hover);
}

.save-btn {
  background: linear-gradient(135deg, var(--accent-color), #1d4ed8);
  color: white;
}

.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.delete-dialog {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  max-width: 400px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
}

.delete-icon {
  width: 80px;
  height: 80px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: #ef4444;
  font-size: 2rem;
}

.delete-dialog h3 {
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
}

.delete-dialog p {
  color: var(--text-secondary);
  margin: 0 0 2rem 0;
  line-height: 1.5;
}

.delete-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.confirm-delete-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-delete-btn:hover {
  background: #dc2626;
}

/* Responsive */
@media (max-width: 1024px) {
  .table-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .controls-left {
    flex-direction: column;
  }
  
  .pagination {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .table-container {
    padding: 1rem;
  }
  
  .table-scroll {
    font-size: 0.9rem;
  }
  
  .data-table th,
  .data-table td {
    padding: 0.75rem 0.5rem;
  }
  
  .user-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .user-avatar {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>