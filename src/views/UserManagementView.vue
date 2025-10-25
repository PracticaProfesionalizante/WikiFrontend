<template>
  <div class="user-management-layout">
    <SidebarMenu @sidebar-toggle="handleSidebarToggle" />
    <AppHeader :sidebar-expanded="sidebarExpanded" />

    <div class="main-content" :class="{ 'with-header': true, 'sidebar-expanded': sidebarExpanded }">
      <div class="user-management-container">
        <!-- Header -->
        <div class="page-header">
          <div class="header-content">
            <div class="header-title">
              <div class="title-section">
                <div class="title-icon">
                  <i class="fas fa-users"></i>
                </div>
                <div class="title-text">
                  <h1 class="page-title">Gestión de Usuarios</h1>
                  <p class="page-subtitle">Administra y controla el acceso de usuarios al sistema</p>
                </div>
              </div>
            </div>
            <div class="header-actions">
              <button
                @click="openCreateModal"
                class="action-btn create-btn"
                title="Crear nuevo usuario"
              >
                <i class="fas fa-user-plus"></i>
                <span>Crear Usuario</span>
              </button>
              <button
                @click="loadUsers"
                class="action-btn refresh-btn"
                :disabled="isLoading"
                title="Actualizar lista de usuarios"
              >
                <i class="fas fa-refresh" :class="{ 'fa-spin': isLoading }"></i>
                <span>Actualizar</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Alertas -->
        <div v-if="error || success" class="alerts-section">
          <div
            v-if="error"
            class="alert alert-error"
          >
            <i class="fas fa-exclamation-circle"></i>
            {{ error }}
            <button @click="error = null" class="alert-close">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div
            v-if="success"
            class="alert alert-success"
          >
            <i class="fas fa-check-circle"></i>
            {{ success }}
            <button @click="success = null" class="alert-close">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Cargando usuarios...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-container">
          <div class="error-content">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Error al cargar usuarios</h3>
            <p>{{ error }}</p>
            <button @click="loadUsers" class="retry-btn">
              <i class="fas fa-redo"></i>
              Reintentar
            </button>
          </div>
        </div>

        <!-- Users List -->
        <div v-else class="users-content">
          <!-- Stats Cards -->
          <div class="stats-grid">
            <div class="stat-card total-users">
              <div class="stat-header">
                <div class="stat-icon">
                  <i class="fas fa-users"></i>
                </div>
                <div class="stat-trend">
                  <i class="fas fa-chart-line"></i>
                  <span>+{{ Math.round((users.length / 100) * 10) || 0 }}%</span>
                </div>
              </div>
              <div class="stat-content">
                <h3 class="stat-number">{{ users.length }}</h3>
                <p class="stat-label">Total Usuarios</p>
                <div class="stat-description">
                  <i class="fas fa-info-circle"></i>
                  <span>Usuarios registrados en el sistema</span>
                </div>
              </div>
            </div>

            <div class="stat-card active-users">
              <div class="stat-header">
                <div class="stat-icon">
                  <i class="fas fa-user-check"></i>
                </div>
                <div class="stat-trend positive">
                  <i class="fas fa-arrow-up"></i>
                  <span>{{ Math.round((activeUsersCount / users.length) * 100) || 0 }}%</span>
                </div>
              </div>
              <div class="stat-content">
                <h3 class="stat-number">{{ activeUsersCount }}</h3>
                <p class="stat-label">Usuarios Activos</p>
                <div class="stat-description">
                  <i class="fas fa-check-circle"></i>
                  <span>Usuarios con acceso activo</span>
                </div>
              </div>
            </div>

            <div class="stat-card inactive-users">
              <div class="stat-header">
                <div class="stat-icon">
                  <i class="fas fa-user-times"></i>
                </div>
                <div class="stat-trend negative">
                  <i class="fas fa-arrow-down"></i>
                  <span>{{ Math.round((inactiveUsersCount / users.length) * 100) || 0 }}%</span>
                </div>
              </div>
              <div class="stat-content">
                <h3 class="stat-number">{{ inactiveUsersCount }}</h3>
                <p class="stat-label">Usuarios Inactivos</p>
                <div class="stat-description">
                  <i class="fas fa-ban"></i>
                  <span>Usuarios sin acceso</span>
                </div>
              </div>
            </div>

            <div class="stat-card admin-users">
              <div class="stat-header">
                <div class="stat-icon">
                  <i class="fas fa-user-shield"></i>
                </div>
                <div class="stat-trend">
                  <i class="fas fa-crown"></i>
                  <span>Privilegiados</span>
                </div>
              </div>
              <div class="stat-content">
                <h3 class="stat-number">{{ adminUsersCount }}</h3>
                <p class="stat-label">Administradores</p>
                <div class="stat-description">
                  <i class="fas fa-key"></i>
                  <span>Usuarios con privilegios</span>
                </div>
              </div>
            </div>

            <div class="stat-card super-user-users">
              <div class="stat-header">
                <div class="stat-icon">
                  <i class="fas fa-crown"></i>
                </div>
                <div class="stat-trend">
                  <i class="fas fa-star"></i>
                  <span>Máximo nivel</span>
                </div>
              </div>
              <div class="stat-content">
                <h3 class="stat-number">{{ superUserCount }}</h3>
                <p class="stat-label">Super Usuarios</p>
                <div class="stat-description">
                  <i class="fas fa-gem"></i>
                  <span>Acceso completo al sistema</span>
                </div>
              </div>
            </div>

            <div class="stat-card collaborator-users">
              <div class="stat-header">
                <div class="stat-icon">
                  <i class="fas fa-user-friends"></i>
                </div>
                <div class="stat-trend">
                  <i class="fas fa-handshake"></i>
                  <span>Colaboradores</span>
                </div>
              </div>
              <div class="stat-content">
                <h3 class="stat-number">{{ collaboratorUsersCount }}</h3>
                <p class="stat-label">Colaboradores</p>
                <div class="stat-description">
                  <i class="fas fa-users"></i>
                  <span>Usuarios con permisos limitados</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Users Table -->
          <div class="users-table-container">
            <div class="table-header">
              <h2 class="table-title">
                <i class="fas fa-list"></i>
                Lista de Usuarios
              </h2>
              <div class="table-actions">
                <div class="search-section">
                  <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input
                      v-model="searchQuery"
                      type="text"
                      placeholder="Buscar por nombre, email o rol..."
                      class="search-input"
                    />
                    <button
                      v-if="searchQuery"
                      @click="clearSearch"
                      class="clear-search-btn"
                      title="Limpiar búsqueda"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  <div class="search-stats" v-if="searchQuery">
                    <span>{{ filteredUsers.length }} resultado{{ filteredUsers.length !== 1 ? 's' : '' }} encontrado{{ filteredUsers.length !== 1 ? 's' : '' }}</span>
                  </div>
                </div>

                <div class="filter-section">
                  <div class="filter-dropdown">
                    <label class="filter-label">
                      <i class="fas fa-filter"></i>
                      Filtrar por rol:
                    </label>
                    <select
                      v-model="currentFilter"
                      @change="setFilter(currentFilter)"
                      class="filter-select"
                    >
                      <option value="all">
                        Todos ({{ users.length }})
                      </option>
                      <option value="active">
                        Activos ({{ activeUsersCount }})
                      </option>
                      <option value="inactive">
                        Inactivos ({{ inactiveUsersCount }})
                      </option>
                      <option value="admin">
                        Administradores ({{ adminUsersCount }})
                      </option>
                      <option value="super_user">
                        Super Usuarios ({{ superUserCount }})
                      </option>
                      <option value="collaborator">
                        Colaboradores ({{ collaboratorUsersCount }})
                      </option>
                    </select>
                  </div>

                  <div class="sort-section">
                    <select v-model="sortField" class="sort-select">
                      <option value="username">Nombre de usuario</option>
                      <option value="email">Email</option>
                      <option value="enabled">Estado</option>
                      <option value="createdAt">Fecha de creación</option>
                    </select>
                    <button
                      @click="toggleSortOrder"
                      class="sort-order-btn"
                      :title="sortOrder === 'asc' ? 'Orden ascendente' : 'Orden descendente'"
                    >
                      <i class="fas" :class="sortOrder === 'asc' ? 'fa-sort-amount-up' : 'fa-sort-amount-down'"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="table-wrapper">
              <table class="users-table">
                <thead>
                  <tr>
                    <th class="sortable" @click="sortBy('username')">
                      Usuario
                      <i class="fas fa-sort" :class="{ 'fa-sort-up': sortField === 'username' && sortOrder === 'asc', 'fa-sort-down': sortField === 'username' && sortOrder === 'desc' }"></i>
                    </th>
                    <th class="sortable" @click="sortBy('email')">
                      Email
                      <i class="fas fa-sort" :class="{ 'fa-sort-up': sortField === 'email' && sortOrder === 'asc', 'fa-sort-down': sortField === 'email' && sortOrder === 'desc' }"></i>
                    </th>
                    <th>Roles</th>
                    <th class="sortable" @click="sortBy('enabled')">
                      Estado
                      <i class="fas fa-sort" :class="{ 'fa-sort-up': sortField === 'enabled' && sortOrder === 'asc', 'fa-sort-down': sortField === 'enabled' && sortOrder === 'desc' }"></i>
                    </th>
                    <th class="sortable" @click="sortBy('createdAt')">
                      Fecha Creación
                      <i class="fas fa-sort" :class="{ 'fa-sort-up': sortField === 'createdAt' && sortOrder === 'asc', 'fa-sort-down': sortField === 'createdAt' && sortOrder === 'desc' }"></i>
                    </th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in filteredUsers" :key="user.id" class="user-row">
                    <td class="user-info">
                      <div class="user-avatar" :class="getUserAvatarClass(user)">
                        <i class="fas fa-user"></i>
                      </div>
                      <div class="user-details">
                        <span class="username">{{ user.username }}</span>
                        <span class="user-id">ID: {{ user.id }}</span>
                        <div class="user-meta">
                          <span class="user-created">
                            <i class="fas fa-clock"></i>
                            {{ formatRelativeDate(user.createdAt) }}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td class="user-email">
                      <div class="email-content">
                        <i class="fas fa-envelope"></i>
                        <span class="email-text">{{ user.email }}</span>
                        <button
                          @click="copyEmail(user.email)"
                          class="copy-btn"
                          title="Copiar email"
                        >
                          <i class="fas fa-copy"></i>
                        </button>
                      </div>
                    </td>
                    <td class="user-roles">
                      <div class="roles-container">
                        <span
                          v-for="role in user.roles"
                          :key="role"
                          class="role-badge"
                          :class="getRoleClass(role)"
                        >
                          <i :class="getRoleIcon(role)"></i>
                          {{ getRoleLabel(role) }}
                        </span>
                      </div>
                    </td>
                <td class="user-status">
                  <span
                    @click="toggleUserStatus(user)"
                    class="status-badge clickable"
                    :class="{ 'active': user.enabled, 'inactive': !user.enabled }"
                    :title="`Hacer clic para ${user.enabled ? 'desactivar' : 'activar'}`"
                  >
                    <i :class="user.enabled ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                    {{ user.enabled ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                    <td class="user-date">
                      <div class="date-content">
                        <i class="fas fa-calendar"></i>
                        <div class="date-info">
                          <span class="date-text">{{ formatDate(user.createdAt) }}</span>
                          <span class="time-text">{{ formatTime(user.createdAt) }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="user-actions">
                      <div class="action-buttons">
                        <button
                          @click="editUser(user)"
                          class="action-btn edit-btn"
                          title="Editar usuario"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                        <button
                          @click="deleteUser(user)"
                          class="action-btn delete-btn"
                          title="Eliminar usuario"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Empty State -->
            <div v-if="filteredUsers.length === 0" class="empty-state">
              <div class="empty-icon">
                <i class="fas fa-users"></i>
              </div>
              <h3>No se encontraron usuarios</h3>
              <p v-if="searchQuery">No hay usuarios que coincidan con "{{ searchQuery }}"</p>
              <p v-else-if="currentFilter !== 'all'">No hay usuarios con el filtro seleccionado</p>
              <p v-else>No hay usuarios registrados en el sistema</p>
            </div>
          </div>
        </div>

        <!-- Edit User Modal -->
        <EditUserModal
          v-if="showEditModal"
          :user="selectedUser"
          :show="showEditModal"
          @close="closeEditModal"
          @saved="handleUserUpdated"
        />

        <!-- Delete User Modal -->
        <DeleteUserModal
          v-if="showDeleteModal"
          :user="selectedUser"
          :show="showDeleteModal"
          @close="closeDeleteModal"
          @confirmed="handleUserDeleted"
        />

        <!-- Status Change Modal -->
        <StatusChangeModal
          v-if="showStatusModal"
          :user="selectedUser"
          :show="showStatusModal"
          @close="closeStatusModal"
          @confirmed="handleStatusChanged"
        />

        <!-- Create User Modal -->
        <CreateUserModal
          v-if="showCreateModal"
          :show="showCreateModal"
          @close="closeCreateModal"
          @created="handleUserCreated"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import userService from '@/services/userService'
import EditUserModal from '@/components/EditUserModal.vue'
import DeleteUserModal from '@/components/DeleteUserModal.vue'
import StatusChangeModal from '@/components/StatusChangeModal.vue'
import CreateUserModal from '@/components/CreateUserModal.vue'
import SidebarMenu from '@/components/common/SidebarMenu.vue'
import AppHeader from '@/components/common/AppHeader.vue'

// Reactive data
const users = ref([])
const isLoading = ref(false)
const error = ref(null)
const searchQuery = ref('')
const currentFilter = ref('all')
const sortField = ref('username')
const sortOrder = ref('asc')
const sidebarExpanded = ref(false)

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showStatusModal = ref(false)
const selectedUser = ref(null)
const statusConfirmAction = ref('') // 'activate' o 'deactivate'

// Alert states
const success = ref(null)

// Computed properties
const activeUsersCount = computed(() => users.value.filter(user => user.enabled).length)
const inactiveUsersCount = computed(() => users.value.filter(user => !user.enabled).length)
const adminUsersCount = computed(() => users.value.filter(user => user.roles.includes('ROLE_ADMIN')).length)
const superUserCount = computed(() => users.value.filter(user => user.roles.includes('ROLE_SUPER_USER')).length)
const collaboratorUsersCount = computed(() => users.value.filter(user => user.roles.includes('ROLE_COLLABORATOR')).length)

const filteredUsers = computed(() => {
  let filtered = users.value

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.roles.some(role => role.toLowerCase().includes(query))
    )
  }

  // Apply status filter
  if (currentFilter.value === 'active') {
    filtered = filtered.filter(user => user.enabled)
  } else if (currentFilter.value === 'inactive') {
    filtered = filtered.filter(user => !user.enabled)
  } else if (currentFilter.value === 'admin') {
    filtered = filtered.filter(user => user.roles.includes('ROLE_ADMIN'))
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue = a[sortField.value]
    let bValue = b[sortField.value]

    if (sortField.value === 'createdAt') {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    }

    if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })

  return filtered
})

// Methods
const loadUsers = async () => {
  try {
    isLoading.value = true
    error.value = null
    console.log('👥 [USER MANAGEMENT] Cargando usuarios...')

    const usersData = await userService.getAllUsers()
    users.value = usersData

    console.log('✅ [USER MANAGEMENT] Usuarios cargados exitosamente:', usersData.length)
  } catch (err) {
    console.error('❌ [USER MANAGEMENT] Error cargando usuarios:', err)
    error.value = err.response?.data?.detail || 'Error al cargar usuarios'
  } finally {
    isLoading.value = false
  }
}

const setFilter = (filter) => {
  currentFilter.value = filter
}

const sortBy = (field) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'asc'
  }
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

const clearSearch = () => {
  searchQuery.value = ''
}

const exportUsers = () => {
  console.log('📊 [USER MANAGEMENT] Exportando usuarios...')
  // Implementar funcionalidad de exportación
  // Por ahora solo mostramos un mensaje
  alert('Funcionalidad de exportación en desarrollo')
}

const editUser = (user) => {
  selectedUser.value = user
  showEditModal.value = true
}

const deleteUser = (user) => {
  selectedUser.value = user
  showDeleteModal.value = true
}

const openCreateModal = () => {
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
}

const handleUserCreated = () => {
  console.log('✅ [USER MANAGEMENT] Usuario creado, recargando lista...')
  loadUsers()
  success.value = 'Usuario creado exitosamente'
  closeCreateModal()
}

const toggleUserStatus = (user) => {
  if (!user || !user.id) {
    return
  }

  const currentStatus = user.enabled ? 'Activo' : 'Inactivo'
  const action = currentStatus === 'Activo' ? 'deactivate' : 'activate'

  // Configurar datos para el modal de confirmación
  selectedUser.value = user
  statusConfirmAction.value = action
  showStatusModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  selectedUser.value = null
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  selectedUser.value = null
}

const closeStatusModal = () => {
  showStatusModal.value = false
  selectedUser.value = null
  statusConfirmAction.value = ''
}

const handleUserUpdated = () => {
  console.log('✅ [USER MANAGEMENT] Usuario actualizado, recargando lista...')
  loadUsers()
  closeEditModal()
}

const handleUserDeleted = () => {
  console.log('✅ [USER MANAGEMENT] Usuario eliminado, recargando lista...')
  loadUsers()
  closeDeleteModal()
}

const handleStatusChanged = async () => {
  if (!selectedUser.value || !selectedUser.value.id) {
    return
  }

  try {
    const user = selectedUser.value
    const newStatus = statusConfirmAction.value === 'activate'

    // Preparar datos para actualización
    const updateData = {
      username: user.username,
      email: user.email,
      enabled: newStatus,
      roles: user.roles
    }

    // Actualizar el usuario en el backend
    const updatedUser = await userService.updateUser(user.id, updateData)

    // Actualizar en la lista local
    const index = users.value.findIndex((u) => u.id === user.id)
    if (index > -1) {
      users.value[index] = updatedUser || { ...user, enabled: newStatus }
    }

    const statusText = newStatus ? 'activado' : 'desactivado'
    success.value = `Usuario "${user.username}" ${statusText} correctamente`
    console.log(`✅ [USER MANAGEMENT] Usuario "${user.username}" ${statusText} correctamente`)

    // Cerrar modal
    closeStatusModal()
  } catch (err) {
    console.error('❌ [USER MANAGEMENT] Error al cambiar el estado del usuario:', err)
    error.value = 'Error al cambiar el estado del usuario'
    // Recargar la lista para obtener el estado actual
    loadUsers()
    closeStatusModal()
  }
}

// Utility functions
const getRoleClass = (role) => {
  const roleMap = {
    'ROLE_SUPER_USER': 'super-user',
    'ROLE_ADMIN': 'admin',
    'ROLE_COLLABORATOR': 'collaborator',
    'ROLE_USER': 'user'
  }
  return roleMap[role] || 'user'
}

const getRoleIcon = (role) => {
  const iconMap = {
    'ROLE_SUPER_USER': 'fas fa-crown',
    'ROLE_ADMIN': 'fas fa-user-shield',
    'ROLE_COLLABORATOR': 'fas fa-user-group',
    'ROLE_USER': 'fas fa-user'
  }
  return iconMap[role] || 'fas fa-user'
}

const getRoleLabel = (role) => {
  const labelMap = {
    'ROLE_SUPER_USER': 'Super Usuario',
    'ROLE_ADMIN': 'Administrador',
    'ROLE_COLLABORATOR': 'Colaborador',
    'ROLE_USER': 'Usuario'
  }
  return labelMap[role] || role
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatRelativeDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) {
    return 'Hace un momento'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `Hace ${hours} hora${hours > 1 ? 's' : ''}`
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return `Hace ${days} día${days > 1 ? 's' : ''}`
  } else {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
}

const getUserAvatarClass = (user) => {
  if (user.roles.includes('ROLE_SUPER_USER')) return 'super-user'
  if (user.roles.includes('ROLE_ADMIN')) return 'admin'
  if (user.roles.includes('ROLE_COLLABORATOR')) return 'collaborator'
  return 'user'
}

const copyEmail = async (email) => {
  try {
    await navigator.clipboard.writeText(email)
    console.log('✅ [USER MANAGEMENT] Email copiado:', email)
    // Aquí podrías agregar una notificación toast
  } catch (error) {
    console.error('❌ [USER MANAGEMENT] Error copiando email:', error)
  }
}

const handleSidebarToggle = (expanded) => {
  sidebarExpanded.value = expanded
}

// Lifecycle
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
/* Layout principal */
.user-management-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-secondary);
  position: relative;
}

.main-content {
  flex: 1;
  margin-left: 80px;
  padding-top: 80px;
  transition: margin-left 0.3s ease;
}

.main-content.sidebar-expanded {
  margin-left: 280px;
}

.main-content.with-header {
  padding-top: 80px;
}

.user-management-container {
  padding: 2rem;
  max-width: 1800px;
  margin: 0 auto;
  background: var(--bg-primary);
  width: 100%;
  box-sizing: border-box;
}

/* Header */
.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 20px var(--shadow-color);
}

.header-title {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.title-icon {
  width: 4rem;
  height: 4rem;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  box-shadow: 0 8px 25px var(--primary-shadow);
}

.title-text {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 500;
}

.header-stats {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  background: var(--bg-hover);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.stat-item:hover {
  background: var(--bg-active);
  transform: translateY(-2px);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

/* Loading and Error States */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.error-content i {
  font-size: 3rem;
  color: var(--error-color);
}

.retry-btn {
  background: var(--error-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: var(--error-hover);
  transform: translateY(-2px);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  max-width: 100%;
}

.stat-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-height: 100px;
  box-shadow: 0 4px 20px var(--shadow-color);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary-color);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px var(--shadow-hover);
}

.stat-card:hover::before {
  transform: scaleX(1);
}

.stat-card.total-users::before {
  background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
}

.stat-card.active-users::before {
  background: linear-gradient(90deg, var(--success-color), var(--success-hover));
}

.stat-card.inactive-users::before {
  background: linear-gradient(90deg, var(--error-color), var(--error-hover));
}

.stat-card.admin-users::before {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: var(--primary-color);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px var(--primary-shadow);
}

.stat-card:hover .stat-icon {
  transform: scale(1.1) rotate(5deg);
}

.stat-card.total-users .stat-icon {
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  box-shadow: 0 8px 25px var(--primary-shadow);
}

.stat-card.active-users .stat-icon {
  background: linear-gradient(135deg, var(--success-color), var(--success-hover));
  box-shadow: 0 8px 25px var(--success-shadow);
}

.stat-card.inactive-users .stat-icon {
  background: linear-gradient(135deg, var(--error-color), var(--error-hover));
  box-shadow: 0 8px 25px var(--error-shadow);
}

.stat-card.admin-users .stat-icon {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3);
}

.stat-card.super-user-users::before {
  background: linear-gradient(90deg, #8b5cf6, #7c3aed);
}

.stat-card.super-user-users .stat-icon {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
}

.stat-card.collaborator-users::before {
  background: linear-gradient(90deg, #06b6d4, #0891b2);
}

.stat-card.collaborator-users .stat-icon {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  box-shadow: 0 8px 25px rgba(6, 182, 212, 0.3);
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
  padding: 0.5rem 1rem;
  background: var(--bg-hover);
  border-radius: 20px;
  font-weight: 600;
}

.stat-trend.positive {
  color: var(--success-color);
  background: var(--success-bg);
}

.stat-trend.negative {
  color: var(--error-color);
  background: var(--error-bg);
}

.stat-trend i {
  font-size: 0.75rem;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
  line-height: 1;
  background: linear-gradient(135deg, var(--text-primary), var(--primary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-description {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  padding: 0.5rem 0.75rem;
  background: var(--bg-hover);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.stat-description i {
  color: var(--primary-color);
  font-size: 0.8rem;
}

/* Users Table */
.users-table-container {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  min-width: 1400px;
}

.table-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.table-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.table-title i {
  color: var(--primary-color);
}

.table-actions {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.search-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 0.5rem;
  transition: all 0.2s ease;
}

.search-box:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-shadow);
}

.search-box i {
  color: var(--text-secondary);
  margin: 0 0.75rem;
  font-size: 1rem;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 0.95rem;
  padding: 0.5rem 0;
  outline: none;
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.clear-search-btn {
  background: var(--error-color);
  color: white;
  border: none;
  border-radius: 8px;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 0.5rem;
}

.clear-search-btn:hover {
  background: var(--error-hover);
  transform: scale(1.1);
}

.search-stats {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
  padding: 0.5rem 1rem;
  background: var(--bg-hover);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-dropdown {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.filter-label i {
  color: var(--primary-color);
  font-size: 0.85rem;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 200px;
}

.filter-select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}

.filter-select option {
  padding: 0.5rem;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  font-weight: 500;
  position: relative;
  overflow: hidden;
}

.filter-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.filter-btn:hover::before {
  left: 100%;
}

.filter-btn:hover {
  background: var(--bg-hover);
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

.filter-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px var(--primary-shadow);
}

.filter-btn i {
  font-size: 0.85rem;
}

.filter-count {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 1.5rem;
  text-align: center;
}

.filter-btn.active .filter-count {
  background: var(--shine-color);
  color: white;
}

.sort-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-select {
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 12px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.sort-select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-shadow);
}

.sort-order-btn {
  width: 2.5rem;
  height: 2.5rem;
  border: 2px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.sort-order-btn:hover {
  background: var(--bg-hover);
  border-color: var(--primary-color);
  transform: scale(1.05);
}

.table-wrapper {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  min-width: 1400px;
  border-collapse: collapse;
}

.users-table th {
  background: var(--bg-hover);
  color: var(--text-primary);
  font-weight: 600;
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 10;
}

.users-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.users-table th.sortable:hover {
  background: var(--bg-active);
}

.users-table th i {
  margin-left: 0.5rem;
  color: var(--text-secondary);
}

.users-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.user-row:hover {
  background: var(--bg-hover);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 3rem;
  height: 3rem;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
  transition: all 0.2s ease;
  position: relative;
}

.user-avatar.super-user {
  background: var(--error-color);
  box-shadow: 0 0 0 3px var(--error-shadow);
}

.user-avatar.admin {
  background: var(--warning-color);
  box-shadow: 0 0 0 3px var(--warning-shadow);
}

.user-avatar.collaborator {
  background: var(--success-color);
  box-shadow: 0 0 0 3px var(--success-shadow);
}

.user-avatar.user {
  background: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-shadow);
}

.user-row:hover .user-avatar {
  transform: scale(1.05);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.username {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1rem;
}

.user-id {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.user-meta {
  margin-top: 0.25rem;
}

.user-created {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.user-created i {
  font-size: 0.7rem;
}

.user-email {
  color: var(--text-primary);
}

.email-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: var(--bg-hover);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.email-content:hover {
  background: var(--bg-active);
}

.email-content i:first-child {
  color: var(--primary-color);
  font-size: 0.9rem;
}

.email-text {
  flex: 1;
  font-size: 0.9rem;
  font-weight: 500;
}

.copy-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  opacity: 0;
}

.email-content:hover .copy-btn {
  opacity: 1;
}

.copy-btn:hover {
  background: var(--primary-color);
  color: white;
  transform: scale(1.1);
}

.roles-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.role-badge.super-user {
  background: var(--error-bg);
  color: var(--error-color);
  border: 1px solid var(--error-light);
}

.role-badge.admin {
  background: var(--warning-bg, #fff3e0);
  color: var(--warning-color);
  border: 1px solid var(--warning-light, #ffcc80);
}

.role-badge.collaborator {
  background: var(--success-bg);
  color: var(--success-color);
  border: 1px solid var(--success-light);
}

.role-badge.user {
  background: var(--bg-hover);
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
}

.status-badge.clickable {
  cursor: pointer;
  user-select: none;
}

.status-badge.clickable:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-hover);
}

.status-badge.active {
  background: var(--success-bg);
  color: var(--success-color);
  border: 1px solid var(--success-light);
}

.status-badge.inactive {
  background: var(--error-bg);
  color: var(--error-color);
  border: 1px solid var(--error-light);
}

.user-date {
  color: var(--text-primary);
}

.date-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: var(--bg-hover);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.date-content:hover {
  background: var(--bg-active);
}

.date-content i {
  color: var(--primary-color);
  font-size: 0.9rem;
}

.date-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.date-text {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}

.time-text {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 0.8rem;
}

.edit-btn {
  background: var(--primary-color);
  color: white;
}

.edit-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.status-btn.activate {
  background: var(--success-color);
  color: white;
}

.status-btn.deactivate {
  background: var(--warning-color);
  color: white;
}

.status-btn:hover {
  transform: translateY(-1px);
}

.delete-btn {
  background: var(--error-color);
  color: white;
}

.delete-btn:hover {
  background: var(--error-hover);
  transform: translateY(-1px);
}

.refresh-btn {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  padding: 1.125rem 2.5rem;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.1rem;
  font-weight: 700;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-height: 56px;
  min-width: 160px;
  white-space: nowrap;
}


.refresh-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(59, 130, 246, 0.4);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.create-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 1.125rem 2.5rem;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.1rem;
  font-weight: 700;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-height: 56px;
  min-width: 180px;
  white-space: nowrap;
}

.create-btn:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(16, 185, 129, 0.4);
}

.export-btn {
  background: linear-gradient(135deg, var(--success-color), var(--success-hover));
  color: white;
  padding: 1.125rem 2.5rem;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.1rem;
  font-weight: 700;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  cursor: pointer;
  box-shadow: 0 8px 25px var(--success-shadow);
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-height: 56px;
  min-width: 160px;
  white-space: nowrap;
}

.export-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, var(--shine-color), transparent);
  transition: left 0.5s ease;
}

.export-btn:hover::before {
  left: 100%;
}

.export-btn:hover {
  background: linear-gradient(135deg, var(--success-hover), var(--success-dark));
  transform: translateY(-4px);
  box-shadow: 0 12px 30px var(--success-shadow);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 3rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  margin: 0;
}

/* Alertas */
.alerts-section {
  margin-bottom: 1.5rem;
}

.alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
  position: relative;
  animation: slideIn 0.3s ease-out;
}

.alert-error {
  background: var(--error-bg);
  color: var(--error-color);
  border: 1px solid var(--error-light);
}

.alert-success {
  background: var(--success-bg);
  color: var(--success-color);
  border: 1px solid var(--success-light);
}

.alert i {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.alert-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  opacity: 0.7;
}

.alert-close:hover {
  background: var(--hover-overlay);
  opacity: 1;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 1400px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding-top: 60px;
  }

  .user-management-container {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
    padding: 1.5rem;
  }

  .header-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    width: 100%;
  }

  .title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .title-icon {
    width: 3rem;
    height: 3rem;
    font-size: 1.25rem;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .page-subtitle {
    font-size: 0.9rem;
  }

  .header-stats {
    flex-direction: row;
    gap: 1rem;
    flex-wrap: wrap;
    width: 100%;
  }

  .stat-item {
    flex: 1;
    min-width: 80px;
    padding: 0.5rem 0.75rem;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .stat-label {
    font-size: 0.7rem;
  }

  .header-actions {
    flex-direction: column;
    width: 100%;
    gap: 0.75rem;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .stat-card {
    padding: 1rem;
    min-height: 90px;
  }

  .stat-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .stat-trend {
    align-self: flex-end;
  }

  .stat-number {
    font-size: 2.5rem;
  }

  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
    padding: 1rem;
  }

  .table-actions {
    width: 100%;
  }

  .search-section {
    width: 100%;
  }

  .search-box {
    width: 100%;
  }

  .filter-section {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .filter-buttons {
    justify-content: center;
    flex-wrap: wrap;
  }

  .filter-btn {
    flex: 1;
    min-width: 120px;
    justify-content: center;
  }

  .sort-section {
    justify-content: center;
  }

  .sort-select {
    flex: 1;
  }

  .users-table {
    font-size: 0.9rem;
  }

  .users-table th,
  .users-table td {
    padding: 0.75rem 0.5rem;
  }

  .user-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .user-avatar {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1rem;
  }

  .username {
    font-size: 0.9rem;
  }

  .user-id {
    font-size: 0.75rem;
  }

  .roles-container {
    flex-direction: column;
    gap: 0.25rem;
  }

  .role-badge {
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.25rem;
  }

  .action-btn {
    width: 2rem;
    height: 2rem;
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .user-management-container {
    padding: 0.75rem;
  }

  .header-content {
    padding: 1rem;
  }

  .title-icon {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .header-stats {
    gap: 0.5rem;
  }

  .stat-item {
    padding: 0.4rem 0.6rem;
  }

  .stat-value {
    font-size: 1rem;
  }

  .stat-label {
    font-size: 0.65rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-number {
    font-size: 2rem;
  }

  .filter-btn {
    min-width: 100px;
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }

  .users-table {
    font-size: 0.8rem;
  }

  .users-table th,
  .users-table td {
    padding: 0.5rem 0.25rem;
  }
}
</style>
