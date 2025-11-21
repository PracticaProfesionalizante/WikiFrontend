<template>
  <div
    v-if="open"
    class="fixed inset-0 z-[1000] grid place-items-center bg-black/60 p-4"
  >
    <div
      class="w-full max-w-[1200px] flex max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between border-b border-slate-200 bg-blue-600 px-6 py-4 text-white dark:border-slate-700"
      >
        <h3 class="m-0 text-lg font-semibold">
          <i class="fas fa-eye mr-2"></i>
          {{ item?.name || item?.title || 'Vista Previa' }}
        </h3>
        <button
          @click="emit('close')"
          class="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-white ring-1 ring-white/30 backdrop-blur hover:bg-white/30"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- Loading State -->
        <div v-if="loading" class="grid min-h-[300px] place-items-center">
          <div
            class="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-blue-500"
          ></div>
        </div>

        <!-- PDF Content -->
        <div
          v-else-if="item?.type === 'TYPE_PDF' || item?.type === 'PDF'"
          class="space-y-4"
        >
          <!-- PDF Error -->
          <div
            v-if="pdfError"
            class="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/30 dark:text-red-200"
          >
            <i class="fas fa-exclamation-circle mb-2 text-2xl"></i>
            <p class="font-semibold">Error al cargar el PDF</p>
            <p class="text-xs">
              {{ pdfError?.message || 'No se pudo cargar el documento PDF' }}
            </p>
            <button
              @click="retryPdfLoad && retryPdfLoad()"
              class="mt-3 inline-flex items-center gap-2 rounded bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
            >
              <i class="fas fa-redo"></i>
              Reintentar
            </button>
          </div>

          <!-- PDF Loading -->
          <div v-else-if="pdfLoading" class="grid min-h-[400px] place-items-center">
            <div class="text-center">
              <div
                class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-blue-500"
              ></div>
              <p class="text-sm text-slate-600 dark:text-slate-300">
                Cargando PDF...
              </p>
            </div>
          </div>

          <!-- PDF Viewer -->
          <div v-else-if="pdfBlobUrl" class="space-y-4">
            <!-- PDF Controls -->
            <div
              class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800"
            >
              <div class="flex items-center gap-2">
                <button
                  @click="goToFirstPage && goToFirstPage()"
                  :disabled="currentPdfPage === 1"
                  class="grid h-8 w-8 place-items-center rounded bg-blue-600 text-white transition disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
                  title="Primera página"
                >
                  <i class="fas fa-angle-double-left text-xs"></i>
                </button>
                <button
                  @click="previousPage && previousPage()"
                  :disabled="currentPdfPage === 1"
                  class="grid h-8 w-8 place-items-center rounded bg-blue-600 text-white transition disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
                  title="Página anterior"
                >
                  <i class="fas fa-angle-left text-xs"></i>
                </button>
                <span
                  class="px-3 text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Página {{ currentPdfPage }} de {{ totalPdfPages }}
                </span>
                <button
                  @click="nextPage && nextPage()"
                  :disabled="currentPdfPage >= totalPdfPages"
                  class="grid h-8 w-8 place-items-center rounded bg-blue-600 text-white transition disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
                  title="Página siguiente"
                >
                  <i class="fas fa-angle-right text-xs"></i>
                </button>
                <button
                  @click="goToLastPage && goToLastPage()"
                  :disabled="currentPdfPage >= totalPdfPages"
                  class="grid h-8 w-8 place-items-center rounded bg-blue-600 text-white transition disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
                  title="Última página"
                >
                  <i class="fas fa-angle-double-right text-xs"></i>
                </button>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="zoomOut && zoomOut()"
                  class="grid h-8 w-8 place-items-center rounded bg-slate-300 text-slate-800 transition hover:-translate-y-0.5 dark:bg-slate-700 dark:text-slate-100"
                  title="Alejar"
                >
                  <i class="fas fa-search-minus text-xs"></i>
                </button>
                <span
                  class="text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  {{ Math.round(pdfZoom * 100) }}%
                </span>
                <button
                  @click="zoomIn && zoomIn()"
                  class="grid h-8 w-8 place-items-center rounded bg-slate-300 text-slate-800 transition hover:-translate-y-0.5 dark:bg-slate-700 dark:text-slate-100"
                  title="Acercar"
                >
                  <i class="fas fa-search-plus text-xs"></i>
                </button>
                <button
                  @click="resetZoom && resetZoom()"
                  class="grid h-8 w-8 place-items-center rounded bg-slate-300 text-slate-800 transition hover:-translate-y-0.5 dark:bg-slate-700 dark:text-slate-100"
                  title="Resetear zoom"
                >
                  <i class="fas fa-expand text-xs"></i>
                </button>
                <button
                  @click="refreshPdfViewer && refreshPdfViewer()"
                  class="grid h-8 w-8 place-items-center rounded bg-green-600 text-white transition hover:-translate-y-0.5"
                  title="Recargar PDF"
                >
                  <i class="fas fa-redo text-xs"></i>
                </button>
                <button
                  @click="openPdfInNewTab && openPdfInNewTab()"
                  class="grid h-8 w-8 place-items-center rounded bg-blue-600 text-white transition hover:-translate-y-0.5"
                  title="Abrir PDF en nueva pestaña"
                >
                  <i class="fas fa-external-link-alt text-xs"></i>
                </button>
                <button
                  @click="downloadPdf && downloadPdf()"
                  class="grid h-8 w-8 place-items-center rounded bg-purple-600 text-white transition hover:-translate-y-0.5"
                  title="Descargar PDF"
                >
                  <i class="fas fa-download text-xs"></i>
                </button>
              </div>
            </div>

            <!-- PDF Embed -->
            <div
              class="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 relative"
              style="max-height: 70vh"
              @contextmenu.prevent="handleRightClick && handleRightClick($event)"
              @mousedown="handleMouseDown && handleMouseDown($event)"
              @mousemove="handleMouseMove && handleMouseMove($event)"
              @mouseup="handleMouseUp && handleMouseUp()"
              @mouseleave="handleMouseUp && handleMouseUp()"
              :style="{ cursor: isDragging ? 'grabbing' : pdfZoom > 1 ? 'grab' : 'default' }"
            >
              <div class="overflow-auto" style="height: 100%; max-height: 70vh">
                <div
                  :style="{
                    transform: `scale(${pdfZoom}) translate(${pdfPanX}px, ${pdfPanY}px)`,
                    transformOrigin: 'top left',
                    width: `${100 / pdfZoom}%`,
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                  }"
                  class="min-h-[500px]"
                >
                  <VuePdfEmbed
                    :key="`pdf-${item?.id}-${currentPdfPage}`"
                    :source="pdfBlobUrl"
                    :page="currentPdfPage"
                    @loaded="onPdfLoaded && onPdfLoaded($event)"
                    @loading-failed="onPdfError && onPdfError($event)"
                    class="w-full rounded-lg border border-slate-200 shadow dark:border-slate-700"
                    style="user-select: text"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- No PDF -->
          <div
            v-else
            class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/30 dark:text-amber-200"
          >
            <i class="fas fa-info-circle mb-2 text-2xl"></i>
            <p class="font-semibold">No hay PDF disponible</p>
          </div>
        </div>

        <!-- TEXT Content -->
        <div v-else-if="item?.type === 'TYPE_TEXT' || item?.type === 'TEXT'">
          <div
            class="prose max-w-none rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800 dark:prose-invert"
            v-html="renderedMarkdown"
          ></div>
        </div>

        <!-- URL Content -->
        <div v-else-if="item?.type === 'TYPE_URL' || item?.type === 'URL'">
          <div
            class="rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800"
          >
            <div class="mb-4 flex items-center gap-3">
              <i class="fas fa-link text-2xl text-blue-500"></i>
              <div>
                <h4 class="m-0 text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Enlace Externo
                </h4>
                <p class="m-0 text-sm text-slate-600 dark:text-slate-300">
                  Este documento redirige a un enlace externo
                </p>
              </div>
            </div>
            <LinkButtonModal
              :url="normalizeUrl(item?.content)"
              :title="'Abrir en una nueva pestaña'"
              :logoUrl="'https://mmedia.notitarde.com.ve/19502/agencia-26108.jpg'"
            />
          </div>
        </div>

        <!-- Unknown Content -->
        <div
          v-else
          class="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800"
        >
          <i class="fas fa-file-question mb-4 text-5xl text-slate-400"></i>
          <h3 class="m-0 text-xl font-semibold text-slate-900 dark:text-slate-100">
            Tipo de contenido no soportado
          </h3>
          <p class="text-slate-600 dark:text-slate-300">
            Este tipo de documento no puede ser previsualizado
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div
        v-if="!loading"
        class="flex justify-end gap-3 border-t border-slate-200 bg-slate-100 px-6 py-4 dark:border-slate-700 dark:bg-slate-800"
      >
        <button
          @click="emit('edit')"
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5"
        >
          <i class="fas fa-edit"></i>
          Editar
        </button>
        <button
          @click="emit('close')"
          class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-100"
        >
          <i class="fas fa-times"></i>
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import VuePdfEmbed from 'vue-pdf-embed'
import LinkButtonModal from '@/components/modals/LinkButtonModal.vue'


defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  item: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  renderedMarkdown: {
    type: String,
    default: '',
  },
  // PDF state
  pdfError: {
    type: [Object, String, null],
    default: null,
  },
  pdfLoading: {
    type: Boolean,
    default: false,
  },
  pdfBlobUrl: {
    type: String,
    default: null,
  },
  currentPdfPage: {
    type: Number,
    default: 1,
  },
  totalPdfPages: {
    type: Number,
    default: 0,
  },
  pdfZoom: {
    type: Number,
    default: 1,
  },
  isDragging: {
    type: Boolean,
    default: false,
  },
  pdfPanX: {
    type: Number,
    default: 0,
  },
  pdfPanY: {
    type: Number,
    default: 0,
  },
  // helpers
  normalizeUrl: {
    type: Function,
    required: true,
  },
  getUrlTitle: {
    type: Function,
    required: true,
  },
  // actions
  retryPdfLoad: Function,
  goToFirstPage: Function,
  previousPage: Function,
  nextPage: Function,
  goToLastPage: Function,
  zoomIn: Function,
  zoomOut: Function,
  resetZoom: Function,
  refreshPdfViewer: Function,
  openPdfInNewTab: Function,
  downloadPdf: Function,
  handleRightClick: Function,
  handleMouseDown: Function,
  handleMouseMove: Function,
  handleMouseUp: Function,
  onPdfLoaded: Function,
  onPdfError: Function,
})

const emit = defineEmits(['close', 'edit'])
</script>
