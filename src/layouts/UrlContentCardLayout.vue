<!-- <template>
  <div
    class="url-layout-container"
    :class="{ 'sidebar-open': isSidebarOpen }"
    :style="{ '--sidebar-width': isSidebarOpen ? sidebarOpenWidth : sidebarClosedWidth }"
  >
    <AppHeader title="Recursos Externos" />
    <SidebarMenu
      :is-open="isSidebarOpen"
      @update:isOpen="isSidebarOpen = $event"
      @update:is-open="isSidebarOpen = $event"
      @toggle="isSidebarOpen = $event"
      @open="isSidebarOpen = true"
      @close="isSidebarOpen = false"
    />
    <main class="content-main-area">
      <div class="content-cards-grid">
        <ContentListCardMobile
          horizontal
          :items="mockContentCards"
          :get-document-status="getDocumentStatus"
          :get-type-display="getTypeDisplay"
          :get-type-colors="getTypeColors"
          :get-type-icon="getTypeIcon"
          :get-document-author="getDocumentAuthor"
          :get-document-editor="getDocumentEditor"
          :format-date="formatDate"
          @preview="handleCardClick"
          @edit="openEditDialog"
          @delete="openDeleteDialog"
          @toggle-status="toggleDocumentStatus"
        />
        <ContentGrid
          :items="paginatedItems"
          :get-document-status="getDocumentStatus"
          :get-type-display="getTypeDisplay"
          :get-type-colors="getTypeColors"
          :get-type-icon="getTypeIcon"
          :get-document-author="getDocumentAuthor"
          :get-document-editor="getDocumentEditor"
          :format-date="formatDate"
          @preview="previewContent"
          @edit="openEditDialog"
          @delete="openDeleteDialog"
          @toggle-status="toggleDocumentStatus"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import ContentListCardMobile from '@/components/content/ContentListCardMobile.vue'
import SidebarMenu from '@/components/common/SidebarMenu.vue'
import AppHeader from '@/components/common/AppHeader.vue'
import ContentGrid from '@/components/content/ContentGrid.vue'
import { useAdminContent } from '@/composables/useAdminContent'

const mockContentCards = [
  {
    id: 0,
    title: 'Example URL Content 0',
    url: 'https://example.com/content0',
    description: 'Esto es una super descripción 0.',
  },
  {
    id: 1,
    title: 'Example URL Content 1',
    url: 'https://example.com/content1',
    description: 'Esto es una super descripción 1.',
  },
  {
    id: 2,
    title: 'Example URL Content 2',
    url: 'https://example.com/content2',
    description: 'Esto es una super descripción 2.',
  },
  {
    id: 3,
    title: 'Example URL Content 3',
    url: 'https://example.com/content3',
    description: 'Esto es una super descripción 3.',
  },
  {
    id: 4,
    title: 'Example URL Content 4',
    url: 'https://example.com/content3',
    description: 'Esto es una super descripción 3.',
  },
  {
    id: 5,
    title: 'Example URL Content 5',
    url: 'https://example.com/content3',
    description: 'Esto es una super descripción 3.',
  },
  {
    id: 6,
    title: 'Example URL Content 6',
    url: 'https://example.com/content3',
    description: 'Esto es una super descripción 3.',
  },
]

const {
  paginatedItems,
  getDocumentStatus,
  getTypeDisplay,
  getTypeColors,
  getTypeIcon,
  getDocumentAuthor,
  getDocumentEditor,
  formatDate,

  previewContent,
  openEditDialog,
  openDeleteDialog,
  toggleDocumentStatus,
} = useAdminContent()

// Función para manejar el clic en la tarjeta ( re-direccionar)
function handleCardClick(card) {
  // Aquí se ejecuta la navegación o apertura de la URL
  console.log(`Abriendo URL: ${card.url}`)
  window.open(card.url, '_blank')
}
</script>

<style scoped>
.url-layout-container {
  display: flex;
  height: 100vh;
}
.content-main-area {
  flex-grow: 1;
  overflow-y: auto;
  margin-left: 80px;
  padding-top: 60px;
  z-index: 10;
  /* Esconde barra de navegacion */
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
.content-main-area::-webkit-scrollbar {
  display: none; /* Chrome, Safari */
  width: 0;
  height: 0;
}

.content-cards-grid {
  display: flex;
  gap: 10px;
  padding: 20px;

  overflow-x: auto;
  overflow-y: hidden;
  -ms-overflow-style: none;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.content-cards-grid::-webkit-scrollbar {
  display: none;
}

.content-cards-grid > * {
  min-width: 5px;
  flex-shrink: 0;
}
</style> -->
