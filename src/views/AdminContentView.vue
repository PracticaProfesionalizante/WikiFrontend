<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <div class="d-flex align-center justify-space-between w-100 flex-wrap ga-2">
              <h1 class="text-h5 text-md-h4">Administración de Contenidos</h1>
              <v-btn 
                v-can="['ROLE_ADMIN', 'ROLE_SUPER_USER']"
                color="primary" 
                prepend-icon="mdi-plus"
                @click="openCreateDialog"
              >
                Crear Contenido
              </v-btn>
            </div>
          </v-card-title>

          <v-card-text>
            <!-- Alertas -->
            <v-alert v-if="error" type="error" variant="tonal" closable @click:close="error = null" class="mb-4">
              {{ error }}
            </v-alert>

            <v-alert v-if="success" type="success" variant="tonal" closable @click:close="success = null" class="mb-4">
              {{ success }}
            </v-alert>

            <!-- Tabla de ContentItems -->
            <v-data-table
              :headers="headers"
              :items="contentItems"
              :loading="loading"
              :items-per-page="10"
              class="elevation-1"
              loading-text="Cargando contenidos..."
              no-data-text="No hay contenidos disponibles"
            >
              <!-- Columna de Tipo -->
              <template #item.type="{ item }">
                <v-chip :color="getTypeColor(item.type)" size="small">
                  {{ item.type }}
                </v-chip>
              </template>

              <!-- Columna de Autor -->
              <template #item.author="{ item }">
                <div class="d-flex align-center">
                  <v-icon size="small" class="mr-1">mdi-account</v-icon>
                  {{ item.author || 'Sin autor' }}
                </div>
              </template>

              <!-- Columna de Fecha de Creación -->
              <template #item.createdAt="{ item }">
                {{ formatDate(item.createdAt) }}
              </template>

              <!-- Columna de Acciones -->
              <template #item.actions="{ item }">
                <div class="d-flex ga-1">
                  <v-btn
                    v-can="['ROLE_ADMIN', 'ROLE_SUPER_USER']"
                    icon="mdi-pencil"
                    size="small"
                    variant="text"
                    color="primary"
                    @click="openEditDialog(item)"
                  ></v-btn>
                  <v-btn
                    v-can="['ROLE_ADMIN', 'ROLE_SUPER_USER']"
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    color="error"
                    @click="openDeleteDialog(item)"
                  ></v-btn>
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog de Confirmación de Eliminación -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">Confirmar Eliminación</v-card-title>
        <v-card-text>
          ¿Estás seguro de que deseas eliminar el contenido "<strong>{{ selectedItem?.title }}</strong>"?
          Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" variant="flat" @click="confirmDelete" :loading="deleting">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de Crear/Editar (placeholder) -->
    <v-dialog v-model="editDialog" max-width="800">
      <v-card>
        <v-card-title class="text-h5">
          {{ isEditing ? 'Editar Contenido' : 'Crear Contenido' }}
        </v-card-title>
        <v-card-text>
          <v-alert type="info" variant="tonal">
            Formulario de creación/edición en desarrollo
          </v-alert>
          <p class="mt-4">Contenido seleccionado: {{ selectedItem?.title || 'Nuevo' }}</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="editDialog = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import contentService from '@/services/contentService'

// Estado
const contentItems = ref([])
const loading = ref(false)
const error = ref(null)
const success = ref(null)
const deleteDialog = ref(false)
const editDialog = ref(false)
const selectedItem = ref(null)
const isEditing = ref(false)
const deleting = ref(false)

// Configuración de la tabla
const headers = [
  { title: 'Título', key: 'title', sortable: true },
  { title: 'Tipo', key: 'type', sortable: true },
  { title: 'Autor', key: 'author', sortable: true },
  { title: 'Fecha de Creación', key: 'createdAt', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' },
]

// Cargar contenidos al montar el componente
onMounted(() => {
  loadContentItems()
})

// Funciones
const loadContentItems = async () => {
  loading.value = true
  error.value = null
  try {
    contentItems.value = await contentService.getAll()
  } catch (err) {
    error.value = err.message || 'Error al cargar los contenidos'
    // Datos de prueba en caso de error (para desarrollo)
    contentItems.value = [
      {
        id: 1,
        title: 'Página de Inicio',
        type: 'Página',
        author: 'Admin',
        createdAt: '2025-10-01T10:00:00Z',
      },
      {
        id: 2,
        title: 'Artículo sobre Vue 3',
        type: 'Artículo',
        author: 'Editor',
        createdAt: '2025-10-02T14:30:00Z',
      },
    ]
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  selectedItem.value = null
  isEditing.value = false
  editDialog.value = true
}

const openEditDialog = (item) => {
  selectedItem.value = { ...item }
  isEditing.value = true
  editDialog.value = true
}

const openDeleteDialog = (item) => {
  selectedItem.value = item
  deleteDialog.value = true
}

const confirmDelete = async () => {
  if (!selectedItem.value) return

  deleting.value = true
  error.value = null

  try {
    await contentService.delete(selectedItem.value.id)
    success.value = `Contenido "${selectedItem.value.title}" eliminado correctamente`
    deleteDialog.value = false
    await loadContentItems()
  } catch (err) {
    error.value = err.message || 'Error al eliminar el contenido'
  } finally {
    deleting.value = false
  }
}

const getTypeColor = (type) => {
  const colors = {
    'Página': 'blue',
    'Artículo': 'green',
    'Categoría': 'orange',
    'default': 'grey',
  }
  return colors[type] || colors.default
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<style scoped>
.v-data-table {
  border-radius: 8px;
}
</style>
