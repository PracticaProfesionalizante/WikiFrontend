<template>
  <ContentFormWrapper
    :model-value="modelValue"
    :title="isEditing ? 'Editar Documento de Texto' : 'Crear Nuevo Documento'"
    :loading="loading"
    :submit-label="submitLabel"
    @update:modelValue="emit('update:modelValue', $event)"
    @submit="handleSubmit"
    @close="close"
  >
    <div class="space-y-6">
      <!-- Paso a paso -->
      <div
        class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
      >
        <div class="flex flex-wrap items-center gap-2">
          <template v-for="step in steps" :key="step.id">
            <div class="flex items-center gap-2" :class="stepClass(step.id)">
              <div
                class="grid h-8 w-8 place-items-center rounded-full text-xs font-bold"
                :class="stepCircleClass(step.id)"
              >
                <i v-if="currentStep > step.id" class="fas fa-check"></i>
                <span v-else>{{ step.id }}</span>
              </div>
              <div class="hidden leading-tight sm:block">
                <div
                  class="text-sm font-semibold text-slate-900 dark:text-slate-100"
                >
                  {{ step.title }}
                </div>
                <div
                  class="text-xs text-slate-500 dark:text-slate-400"
                >
                  {{ step.desc }}
                </div>
              </div>
            </div>
            <div
              v-if="step.id < steps.length"
              class="h-px w-6 flex-shrink-0 bg-slate-300 dark:bg-slate-600"
            ></div>
          </template>
        </div>
      </div>

      <!-- Paso 1: Información Básica -->
      <section v-if="currentStep === 1" class="space-y-4">
        <div>
          <h3
            class="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100"
          >
            <i class="fas fa-info-circle text-blue-500"></i>
            Información Básica
          </h3>
          <p class="m-0 text-sm text-slate-600 dark:text-slate-400">
            Datos principales del documento
          </p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="form-label">
              Nombre del Documento
              <span class="text-red-500">*</span>
            </label>
            <input
              v-model="localData.name"
              type="text"
              class="form-input"
              placeholder="Ej: Reglamento de Estudiantes"
              @blur="validateField('name')"
            />
            <p
              v-if="errors.name"
              class="mt-1 flex items-center gap-1 text-xs text-red-500"
            >
              <i class="fas fa-exclamation-circle"></i>
              {{ errors.name }}
            </p>
          </div>

          <div>
            <label class="form-label">Tipo de Documento</label>
            <div
              class="form-input flex items-center gap-2 text-slate-600 dark:text-slate-300"
            >
              <i class="fas fa-file-alt text-slate-500"></i>
              Documento de Texto
            </div>
          </div>
        </div>
      </section>

      <!-- Paso 2: Contenido (editor avanzado) -->
      <section v-else-if="currentStep === 2" class="space-y-4">
        <div>
          <h3
            class="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100"
          >
            <i class="fas fa-file-alt text-blue-500"></i>
            Contenido del Documento
          </h3>
          <p class="m-0 text-sm text-slate-600 dark:text-slate-400">
            Escribe el contenido en formato Markdown
          </p>
        </div>

        <div v-if="localData.type === 'TYPE_TEXT'" class="space-y-4">
          <!-- Barra superior de modos -->
          <div
            class="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800"
          >
            <div class="flex flex-wrap items-center gap-1">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition"
                :class="
                  previewMode === 'edit'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-700 hover:bg-slate-200 dark:text-slate-100 dark:hover:bg-slate-700'
                "
                @click="setPreviewMode('edit')"
                :aria-pressed="previewMode === 'edit'"
              >
                <i class="fas fa-pen-nib"></i>
                Editor
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition"
                :class="
                  previewMode === 'split'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-700 hover:bg-slate-200 dark:text-slate-100 dark:hover:bg-slate-700'
                "
                @click="setPreviewMode('split')"
                :aria-pressed="previewMode === 'split'"
              >
                <i class="fas fa-columns"></i>
                Dividir
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition"
                :class="
                  previewMode === 'preview'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-700 hover:bg-slate-200 dark:text-slate-100 dark:hover:bg-slate-700'
                "
                @click="setPreviewMode('preview')"
                :aria-pressed="previewMode === 'preview'"
              >
                <i class="fas fa-eye"></i>
                Vista previa
              </button>

              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition"
                  :class="
                    editViewMode === 'visual'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-700 hover:bg-slate-200 dark:text-slate-100 dark:hover:bg-slate-700'
                  "
                  @click="setEditViewMode('visual')"
                  :disabled="previewMode === 'preview'"
                  :aria-pressed="editViewMode === 'visual'"
                >
                  <i class="fas fa-magic"></i>
                  Visual
                </button>
                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition"
                  :class="
                    editViewMode === 'markdown'
                      ? 'bg-slate-900 text-white shadow dark:bg-slate-200 dark:text-slate-900'
                      : 'text-slate-700 hover:bg-slate-200 dark:text-slate-100 dark:hover:bg-slate-700'
                  "
                  @click="setEditViewMode('markdown')"
                  :disabled="previewMode === 'preview'"
                  :aria-pressed="editViewMode === 'markdown'"
                >
                  <i class="fas fa-code"></i>
                  Markdown
                </button>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                @click="toggleMarkdownHelp"
                :aria-expanded="showMarkdownHelp"
                :disabled="editViewMode === 'visual'"
              >
                <i class="fas fa-graduation-cap"></i>
                Guía rápida
              </button>

              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                :class="
                  scrollSyncEnabled
                    ? 'border-emerald-500 text-emerald-600 dark:border-emerald-500 dark:text-emerald-300'
                    : ''
                "
                @click="toggleScrollSync"
                :title="
                  scrollSyncEnabled
                    ? 'Desactivar sincronización de desplazamiento'
                    : 'Activar sincronización de desplazamiento'
                "
              >
                <i :class="scrollSyncEnabled ? 'fas fa-link' : 'fas fa-unlink'"></i>
                Sync
              </button>

              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                @click="toggleFullscreen"
                :title="isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'"
              >
                <i :class="isFullscreen ? 'fas fa-compress' : 'fas fa-expand'"></i>
              </button>
            </div>
          </div>

          <!-- Guía rápida Markdown -->
          <transition name="markdown-help">
            <div
              v-if="showMarkdownHelp && editViewMode === 'markdown'"
              class="rounded-xl border border-slate-200 bg-white/95 p-4 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200"
            >
              <div class="mb-3 flex items-center justify-between">
                <h4
                  class="m-0 text-sm font-semibold text-slate-800 dark:text-slate-100"
                >
                  Guía rápida de Markdown
                </h4>
                <button
                  type="button"
                  class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                  @click="toggleMarkdownHelp"
                  title="Cerrar guía"
                >
                  <i class="fas fa-times text-sm"></i>
                </button>
              </div>

              <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div
                  v-for="section in markdownCheatSheet"
                  :key="section.title"
                  class="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-800/80"
                >
                  <h5
                    class="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300"
                  >
                    {{ section.title }}
                  </h5>
                  <ul class="space-y-1.5">
                    <li
                      v-for="item in section.items"
                      :key="item.syntax"
                      class="flex flex-col gap-1"
                    >
                      <code
                        class="rounded bg-slate-900/90 px-2 py-1 font-mono text-[11px] text-sky-200 dark:bg-slate-950/80"
                      >
                        {{ item.syntax }}
                      </code>
                      <span
                        class="text-[11px] text-slate-600 dark:text-slate-300"
                      >
                        {{ item.description }}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </transition>

          <!-- Toolbars -->
          <div v-if="previewMode !== 'preview'" class="space-y-2">
            <!-- Toolbar Visual -->
            <div
              v-if="editViewMode === 'visual'"
              class="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white/90 p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900/80"
            >
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="markdown-toolbar-btn"
                  :disabled="loading"
                  @click="applyFormat('bold')"
                  title="Negrita"
                >
                  <i class="fas fa-bold"></i>
                </button>
                <button
                  type="button"
                  class="markdown-toolbar-btn"
                  :disabled="loading"
                  @click="applyFormat('italic')"
                  title="Cursiva"
                >
                  <i class="fas fa-italic"></i>
                </button>
                <button
                  type="button"
                  class="markdown-toolbar-btn"
                  :disabled="loading"
                  @click="applyFormat('strikethrough')"
                  title="Tachado"
                >
                  <i class="fas fa-strikethrough"></i>
                </button>
              </div>

              <div class="markdown-toolbar-separator"></div>

              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="markdown-toolbar-btn"
                  :disabled="loading"
                  @click="applyFormat('h1')"
                  title="Encabezado H1"
                >
                  <span class="font-semibold">H1</span>
                </button>
                <button
                  type="button"
                  class="markdown-toolbar-btn"
                  :disabled="loading"
                  @click="applyFormat('h2')"
                  title="Encabezado H2"
                >
                  <span class="font-semibold">H2</span>
                </button>
                <button
                  type="button"
                  class="markdown-toolbar-btn"
                  :disabled="loading"
                  @click="applyFormat('h3')"
                  title="Encabezado H3"
                >
                  <span class="font-semibold">H3</span>
                </button>
              </div>

              <div class="markdown-toolbar-separator"></div>

              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="markdown-toolbar-btn"
                  :disabled="loading"
                  @click="applyFormat('list')"
                  title="Lista con viñetas"
                >
                  <i class="fas fa-list-ul"></i>
                </button>
                <button
                  type="button"
                  class="markdown-toolbar-btn"
                  :disabled="loading"
                  @click="applyFormat('orderedList')"
                  title="Lista numerada"
                >
                  <i class="fas fa-list-ol"></i>
                </button>
                <button
                  type="button"
                  class="markdown-toolbar-btn"
                  :disabled="loading"
                  @click="applyFormat('quote')"
                  title="Cita"
                >
                  <i class="fas fa-quote-right"></i>
                </button>
              </div>

              <div class="markdown-toolbar-separator"></div>

              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="markdown-toolbar-btn"
                  :disabled="loading"
                  @click="applyFormat('link')"
                  title="Insertar enlace"
                >
                  <i class="fas fa-link"></i>
                </button>
                <button
                  type="button"
                  class="markdown-toolbar-btn"
                  :disabled="loading"
                  @click="applyFormat('image')"
                  title="Insertar imagen"
                >
                  <i class="fas fa-image"></i>
                </button>
                <button
                  type="button"
                  class="markdown-toolbar-btn"
                  :disabled="loading"
                  @click="applyFormat('code')"
                  title="Código en línea"
                >
                  <i class="fas fa-terminal"></i>
                </button>
              </div>

              <div class="markdown-toolbar-separator"></div>

              <div class="relative flex items-center gap-1">
                <button
                  type="button"
                  class="markdown-toolbar-btn"
                  :disabled="loading"
                  title="Aplicar color al texto"
                  @click="toggleColorPalette"
                >
                  <i class="fas fa-palette"></i>
                </button>

                <transition name="markdown-help">
                  <div
                    v-if="showColorPalette"
                    class="color-palette-popover"
                    @mousedown.stop
                  >
                    <header class="color-palette-header">
                      <span>Colores rápidos</span>
                      <button
                        type="button"
                        class="close-btn"
                        @click="toggleColorPalette"
                        title="Cerrar paleta"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </header>
                    <div class="color-palette-grid">
                      <button
                        v-for="color in colorPalette"
                        :key="color.className"
                        type="button"
                        class="color-swatch"
                        @click="handleColorSelection(color)"
                      >
                        <span
                          :class="['swatch-preview', color.className]"
                        ></span>
                        <span class="swatch-label">{{ color.label }}</span>
                      </button>
                    </div>
                  </div>
                </transition>
              </div>

              <div class="markdown-toolbar-separator"></div>

              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="markdown-toolbar-btn"
                  :disabled="loading"
                  @click="applyFormat('codeBlock')"
                  title="Bloque de código"
                >
                  <i class="fas fa-code"></i>
                </button>
                <button
                  type="button"
                  class="markdown-toolbar-btn"
                  :disabled="loading"
                  @click="applyFormat('removeFormat')"
                  title="Limpiar formato"
                >
                  <i class="fas fa-eraser"></i>
                </button>
              </div>
            </div>

            <!-- Toolbar Markdown -->
            <div
              v-else
              class="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white/85 p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
            >
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="markdown-toolbar-btn"
                  :disabled="loading || previewMode === 'preview'"
                  @click="insertMarkdown('bold')"
                  title="Negrita (Ctrl + B)"
                >
                  <i class="fas fa-bold"></i>
                </button>
                <button
                  type="button"
                  class="markdown-toolbar-btn"
                  :disabled="loading || previewMode === 'preview'"
                  @click="insertMarkdown('italic')"
                  title="Cursiva (Ctrl + I)"
                >
                  <i class="fas fa-italic"></i>
                </button>
                <button
                  type="button"
                  class="markdown-toolbar-btn"
                  :disabled="loading || previewMode === 'preview'"
                  @click="insertMarkdown('strikethrough')"
                  title="Tachado"
                >
                  <i class="fas fa-strikethrough"></i>
                </button>
                <button
                  type="button"
                  class="markdown-toolbar-btn"
                  :disabled="loading || previewMode === 'preview'"
                  @click="insertMarkdown('code')"
                  title="Código en línea"
                >
                  <i class="fas fa-terminal"></i>
                </button>
              </div>

              <div class="markdown-toolbar-separator"></div>

              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="markdown-toolbar-btn"
                  :disabled="loading || previewMode === 'preview'"
                  @click="insertMarkdown('h1')"
                  title="Encabezado H1"
                >
                  <span class="font-semibold">H1</span>
                </button>
                <button
                  type="button"
                  class="markdown-toolbar-btn"
                  :disabled="loading || previewMode === 'preview'"
                  @click="insertMarkdown('h2')"
                  title="Encabezado H2"
                >
                  <span class="font-semibold">H2</span>
                </button>
                <button
                  type="button"
                  class="markdown-toolbar-btn"
                  :disabled="loading || previewMode === 'preview'"
                  @click="insertMarkdown('h3')"
                  title="Encabezado H3"
                >
                  <span class="font-semibold">H3</span>
                </button>
              </div>

              <div class="markdown-toolbar-separator"></div>

              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="markdown-toolbar-btn"
                  :disabled="loading || previewMode === 'preview'"
                  @click="insertMarkdown('list')"
                  title="Lista con viñetas"
                >
                  <i class="fas fa-list-ul"></i>
                </button>
                <button
                  type="button"
                  class="markdown-toolbar-btn"
                  :disabled="loading || previewMode === 'preview'"
                  @click="insertMarkdown('orderedList')"
                  title="Lista numerada"
                >
                  <i class="fas fa-list-ol"></i>
                </button>
                <button
                  type="button"
                  class="markdown-toolbar-btn"
                  :disabled="loading || previewMode === 'preview'"
                  @click="insertMarkdown('checkbox')"
                  title="Lista de tareas"
                >
                  <i class="fas fa-square-check"></i>
                </button>
              </div>

              <div class="markdown-toolbar-separator"></div>

              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="markdown-toolbar-btn"
                  :disabled="loading || previewMode === 'preview'"
                  @click="insertMarkdown('link')"
                  title="Insertar enlace"
                >
                  <i class="fas fa-link"></i>
                </button>
                <button
                  type="button"
                  class="markdown-toolbar-btn"
                  :disabled="loading || previewMode === 'preview'"
                  @click="insertMarkdown('image')"
                  title="Insertar imagen"
                >
                  <i class="fas fa-image"></i>
                </button>
                <button
                  type="button"
                  class="markdown-toolbar-btn"
                  :disabled="loading || previewMode === 'preview'"
                  @click="insertMarkdown('callout')"
                  title="Insertar callout"
                >
                  <i class="fas fa-lightbulb"></i>
                </button>
              </div>

              <div class="markdown-toolbar-separator"></div>

              <div class="relative flex items-center gap-1">
                <button
                  type="button"
                  class="markdown-toolbar-btn"
                  :disabled="loading || previewMode === 'preview'"
                  title="Aplicar color al texto"
                  @click="toggleColorPalette"
                >
                  <i class="fas fa-palette"></i>
                </button>

                <transition name="markdown-help">
                  <div
                    v-if="showColorPalette"
                    class="color-palette-popover"
                    @mousedown.stop
                  >
                    <header class="color-palette-header">
                      <span>Colores rápidos</span>
                      <button
                        type="button"
                        class="close-btn"
                        @click="toggleColorPalette"
                        title="Cerrar paleta"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </header>
                    <div class="color-palette-grid">
                      <button
                        v-for="color in colorPalette"
                        :key="color.className"
                        type="button"
                        class="color-swatch"
                        @click="handleColorSelection(color)"
                      >
                        <span
                          :class="['swatch-preview', color.className]"
                        ></span>
                        <span class="swatch-label">{{ color.label }}</span>
                      </button>
                    </div>
                  </div>
                </transition>
              </div>

              <div class="markdown-toolbar-separator"></div>

              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="markdown-toolbar-btn"
                  :disabled="loading || previewMode === 'preview'"
                  @click="insertMarkdown('quote')"
                  title="Cita"
                >
                  <i class="fas fa-quote-right"></i>
                </button>
                <button
                  type="button"
                  class="markdown-toolbar-btn"
                  :disabled="loading || previewMode === 'preview'"
                  @click="insertMarkdown('codeBlock')"
                  title="Bloque de código"
                >
                  <i class="fas fa-code"></i>
                </button>
                <button
                  type="button"
                  class="markdown-toolbar-btn"
                  :disabled="loading || previewMode === 'preview'"
                  @click="insertMarkdown('table')"
                  title="Tabla básica"
                >
                  <i class="fas fa-table"></i>
                </button>
                <button
                  type="button"
                  class="markdown-toolbar-btn"
                  :disabled="loading || previewMode === 'preview'"
                  @click="insertMarkdown('horizontalRule')"
                  title="Separador"
                >
                  <i class="fas fa-minus"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Editor + Preview -->
          <div
            class="markdown-editor-container overflow-hidden rounded-lg border-2 border-slate-300 dark:border-slate-700"
            :class="{
              'fixed inset-4 z-[9999] bg-slate-950/90 p-4 md:p-6': isFullscreen,
            }"
          >
            <div
              class="flex h-full flex-col md:flex-row"
              :class="
                previewMode === 'split'
                  ? 'md:divide-x md:divide-slate-200 dark:md:divide-slate-700'
                  : ''
              "
            >
              <!-- Editor -->
              <div
                v-show="previewMode !== 'preview'"
                class="markdown-editor-pane flex-1"
              >
                <!-- Visual -->
                <div
                  v-if="editViewMode === 'visual'"
                  ref="visualEditorRef"
                  :class="[
                    'wysiwyg-editor',
                    errors.content ? 'wysiwyg-editor-error' : '',
                  ]"
                  contenteditable="true"
                  role="textbox"
                  dir="ltr"
                  :aria-multiline="true"
                  :aria-invalid="errors.content ? 'true' : 'false'"
                  data-placeholder="Escribe tu contenido en formato enriquecido..."
                  @input="handleVisualInput"
                  @scroll="syncScroll('editor')"
                  @paste="handleVisualPaste"
                ></div>

                <!-- Markdown -->
                <textarea
                  v-else
                  id="documentContent"
                  ref="markdownTextarea"
                  v-model="localData.content"
                  class="markdown-textarea min-h-[280px] w-full resize-none border-0 px-4 py-4 text-sm font-mono outline-none disabled:opacity-50 dark:bg-slate-900 dark:text-slate-100"
                  :class="errors.content ? 'text-red-600' : 'text-slate-900'"
                  placeholder="Escribe tu contenido en formato Markdown..."
                  @input="validateField('content')"
                  @scroll="syncScroll('editor')"
                  @keydown="handleMarkdownShortcut"
                  :disabled="loading"
                  spellcheck="true"
                  required
                ></textarea>
              </div>

              <!-- Preview -->
              <div
                v-show="previewMode !== 'edit'"
                ref="markdownPreview"
                class="markdown-preview-pane flex-1 overflow-auto bg-slate-50/80 px-4 py-4 dark:bg-slate-900/60"
                @scroll="syncScroll('preview')"
              >
                <pre
                  v-if="previewMode === 'split'"
                  class="whitespace-pre-wrap font-mono text-xs text-slate-800 dark:text-slate-200"
                >
{{ localData.content || 'Escribe tu contenido en formato Markdown...' }}</pre
                >
                <article
                  v-else
                  class="markdown-preview prose prose-slate max-w-none dark:prose-invert"
                >
                  <div v-html="renderedMarkdown"></div>
                </article>
              </div>
            </div>

            <!-- Footer stats -->
            <div
              class="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <div class="flex flex-wrap items-center gap-3">
                <span class="inline-flex items-center gap-1">
                  <i class="fas fa-font text-slate-500"></i>
                  {{ markdownStats.words }} palabras
                </span>
                <span class="inline-flex items-center gap-1">
                  <i class="fas fa-align-left text-slate-500"></i>
                  {{ markdownStats.lines }} líneas
                </span>
                <span class="inline-flex items-center gap-1">
                  <i class="fas fa-heading text-slate-500"></i>
                  {{ markdownStats.headings }} encabezados
                </span>
                <span class="inline-flex items-center gap-1">
                  <i class="fas fa-code text-slate-500"></i>
                  {{ markdownStats.codeBlocks }} bloques de código
                </span>
                <span class="inline-flex items-center gap-1">
                  <i class="fas fa-square-check text-slate-500"></i>
                  {{ markdownStats.tasks }} tareas
                </span>
                <span class="inline-flex items-center gap-1">
                  <i class="fas fa-clock text-slate-500"></i>
                  {{
                    markdownStats.readingTime > 0
                      ? `${markdownStats.readingTime} min lectura`
                      : 'Lectura inmediata'
                  }}
                </span>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <span
                  v-if="copyStatus"
                  class="text-emerald-600 dark:text-emerald-400"
                >
                  {{ copyStatus }}
                </span>
                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-lg border border-blue-500 bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:-translate-y-0.5 hover:bg-blue-50 dark:border-blue-400 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-slate-800"
                  @click="copyMarkdownToClipboard"
                >
                  <i class="fas fa-copy"></i>
                  Copiar Markdown
                </button>
              </div>
            </div>
          </div>

          <div
            v-if="errors.content"
            class="mt-1 flex items-center gap-2 text-xs font-medium text-red-600"
          >
            <i class="fas fa-exclamation-circle"></i>
            {{ errors.content }}
          </div>
        </div>
      </section>

      <!-- Paso 3: Permisos -->
      <section v-else-if="currentStep === 3" class="space-y-4">
        <div>
          <h3
            class="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100"
          >
            <i class="fas fa-users-cog text-blue-500"></i>
            Configuración y Permisos
          </h3>
          <p class="m-0 text-sm text-slate-600 dark:text-slate-400">
            Define quién puede acceder a este documento
          </p>
        </div>

        <div class="space-y-2">
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Roles con acceso
            <span class="text-red-500">*</span>
          </p>
          <div class="space-y-2">
            <label
              v-for="role in roles"
              :key="role"
              class="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <input
                v-model="localData.roles"
                type="checkbox"
                :value="role"
                class="h-4 w-4"
              />
              <div>
                <div
                  class="font-semibold text-slate-900 dark:text-slate-100"
                >
                  {{ role }}
                </div>
              </div>
            </label>
          </div>
          <p
            v-if="errors.roles"
            class="mt-1 flex items-center gap-1 text-xs text-red-500"
          >
            <i class="fas fa-exclamation-circle"></i>
            {{ errors.roles }}
          </p>
        </div>
      </section>

      <!-- Paso 4: Resumen -->
      <section v-else-if="currentStep === 4" class="space-y-4">
        <div>
          <h3
            class="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100"
          >
            <i class="fas fa-clipboard-check text-blue-500"></i>
            Resumen del Documento
          </h3>
          <p class="m-0 text-sm text-slate-600 dark:text-slate-400">
            Revisa la información antes de crear el documento
          </p>
        </div>

        <div class="space-y-3">
          <div
            class="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <div
              class="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100"
            >
              <i class="fas fa-info-circle text-blue-500"></i>
              Información Básica
            </div>
            <ul
              class="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300"
            >
              <li>
                <strong>Nombre:</strong>
                {{ localData.name || '—' }}
              </li>
              <li>
                <strong>Tipo:</strong>
                Documento de Texto
              </li>
              <li>
                <strong>Icono:</strong>
                <span class="inline-flex items-center gap-1">
                  <i
                    :class="localData.icon || 'fas fa-file-alt'"
                    class="text-slate-500"
                  ></i>
                  <span>Icono predeterminado</span>
                </span>
              </li>
            </ul>
          </div>

          <div
            class="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <div
              class="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100"
            >
              <i class="fas fa-file-alt text-blue-500"></i>
              Contenido
            </div>
            <p
              class="mt-2 whitespace-pre-line text-sm text-slate-600 dark:text-slate-300"
            >
              {{ localData.content || 'Sin contenido' }}
            </p>
          </div>

          <div
            class="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <div
              class="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100"
            >
              <i class="fas fa-users-cog text-blue-500"></i>
              Permisos
            </div>
            <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Roles con acceso:
              {{
                localData.roles.length
                  ? localData.roles.join(', ')
                  : 'Ninguno'
              }}
            </p>
          </div>
        </div>
      </section>
    </div>
  </ContentFormWrapper>
</template>

<script setup>
import {
  ref,
  watch,
  computed,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from 'vue'
import MarkdownIt from 'markdown-it'
import ContentFormWrapper from '../../../forms/ContentFormWrapper.vue'

const props = defineProps({
  modelValue: Boolean,
  roles: {
    type: Array,
    default: () => [],
  },
  initialData: Object,
})

const emit = defineEmits(['update:modelValue', 'success', 'close'])

const loading = ref(false)
const currentStep = ref(1)

const steps = [
  { id: 1, title: 'Información Básica', desc: 'Datos principales' },
  { id: 2, title: 'Contenido', desc: 'Contenido del documento' },
  { id: 3, title: 'Permisos', desc: 'Configuración de acceso' },
  { id: 4, title: 'Resumen', desc: 'Revisar información' },
]

const isEditing = computed(() => !!props.initialData)

const localData = ref({
  id: null,
  name: '',
  description: '',
  content: '',
  roles: [],
  icon: 'fas fa-file-alt', // icono por defecto para texto
  status: true,
  type: 'TYPE_TEXT',
})

const errors = ref({
  name: '',
  content: '',
  roles: '',
})

// --------- Markdown editor state ---------
const previewMode = ref('split') // edit | split | preview
const editViewMode = ref('visual') // visual | markdown
const showMarkdownHelp = ref(false)
const scrollSyncEnabled = ref(true)
const isFullscreen = ref(false)
const showColorPalette = ref(false)

const visualEditorRef = ref(null)
const markdownTextarea = ref(null)
const markdownPreview = ref(null)

const copyStatus = ref('')

const colorPalette = ref([
  { className: 'text-sky-500', label: 'Azul' },
  { className: 'text-emerald-500', label: 'Verde' },
  { className: 'text-amber-500', label: 'Amarillo' },
  { className: 'text-rose-500', label: 'Rojo' },
])

const markdownCheatSheet = [
  {
    title: 'Encabezados',
    items: [
      { syntax: '# Título 1', description: 'Encabezado principal' },
      { syntax: '## Título 2', description: 'Subtítulo' },
      { syntax: '### Título 3', description: 'Sección' },
    ],
  },
  {
    title: 'Énfasis',
    items: [
      { syntax: '**negrita**', description: 'Texto en negrita' },
      { syntax: '_cursiva_', description: 'Texto en cursiva' },
      { syntax: '~~tachado~~', description: 'Texto tachado' },
    ],
  },
  {
    title: 'Listas y enlaces',
    items: [
      { syntax: '- ítem', description: 'Lista con viñetas' },
      { syntax: '1. ítem', description: 'Lista numerada' },
      {
        syntax: '[texto](https://ejemplo.com)',
        description: 'Enlace',
      },
    ],
  },
]

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
})

const renderedMarkdown = computed(() =>
  localData.value.content
    ? md.render(localData.value.content)
    : md.render('')
)

const markdownStats = computed(() => {
  const text = localData.value.content || ''
  const words = text.trim()
    ? text.trim().split(/\s+/).length
    : 0
  const lines = text.split(/\n/).length
  const headings = (text.match(/^#{1,6}\s/mg) || []).length
  const codeBlocks = (text.match(/```/g) || []).length / 2
  const tasks = (text.match(/- $begin:math:display$\[ xX\]$end:math:display$/g) || []).length
  const readingTime = Math.max(0, Math.round(words / 200))
  return { words, lines, headings, codeBlocks, tasks, readingTime }
})

// --------- Form reset / watch ---------
const resetForm = () => {
  localData.value = {
    id: null,
    name: '',
    description: '',
    content: '',
    roles: [],
    icon: 'fas fa-file-alt',
    status: true,
    type: 'TYPE_TEXT',
  }
  currentStep.value = 1
  errors.value = { name: '', content: '', roles: '' }
  previewMode.value = 'split'
  editViewMode.value = 'visual'
  showMarkdownHelp.value = false
}

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      localData.value = {
        id: data.id ?? null,
        name: data.name || '',
        description: data.description || '',
        content: data.content || '',
        roles: data.roles || [],
        icon: data.icon || 'fas fa-file-alt',
        status:
          typeof data.status === 'boolean' ? data.status : true,
        type: 'TYPE_TEXT',
      }
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

// --------- Validaciones / submit ---------
const submitLabel = computed(() => {
  if (currentStep.value < steps.length) return 'Siguiente'
  return isEditing.value ? 'Guardar Cambios' : 'Crear Documento'
})

const validateField = (field) => {
  if (field === 'name') {
    errors.value.name = localData.value.name.trim()
      ? ''
      : 'El nombre es obligatorio'
  }
  if (field === 'content') {
    errors.value.content = localData.value.content.trim()
      ? ''
      : 'El contenido es obligatorio'
  }
  if (field === 'roles') {
    errors.value.roles = localData.value.roles.length
      ? ''
      : 'Selecciona al menos un rol'
  }
}

const validateStep = (step) => {
  errors.value = { name: '', content: '', roles: '' }
  if (step === 1) validateField('name')
  if (step === 2) validateField('content')
  if (step === 3) validateField('roles')

  return (
    !errors.value.name &&
    !errors.value.content &&
    !errors.value.roles
  )
}

const handleSubmit = async () => {
  if (!validateStep(currentStep.value)) return

  if (currentStep.value < steps.length) {
    currentStep.value += 1
    return
  }

  loading.value = true
  emit('success', { ...localData.value })
  loading.value = false
  close()
}

const stepClass = (id) => {
  if (currentStep.value === id) return 'text-blue-600'
  if (currentStep.value > id) return 'text-emerald-600'
  return 'text-slate-500 dark:text-slate-400'
}

const stepCircleClass = (id) => {
  if (currentStep.value === id) return 'bg-blue-600 text-white'
  if (currentStep.value > id) return 'bg-emerald-600 text-white'
  return 'bg-slate-300 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
}

// --------- Markdown editor helpers ---------
const setPreviewMode = (mode) => {
  previewMode.value = mode
}

const setEditViewMode = (mode) => {
  editViewMode.value = mode
  if (mode === 'markdown' && visualEditorRef.value) {
    // sincronizar texto desde visual editor al markdown
    localData.value.content =
      visualEditorRef.value.innerText || ''
  }
  if (mode === 'visual') {
    nextTick(() => {
      if (visualEditorRef.value) {
        visualEditorRef.value.innerText =
          localData.value.content || ''
      }
    })
  }
}

const toggleMarkdownHelp = () => {
  showMarkdownHelp.value = !showMarkdownHelp.value
}

const toggleScrollSync = () => {
  scrollSyncEnabled.value = !scrollSyncEnabled.value
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const toggleColorPalette = () => {
  showColorPalette.value = !showColorPalette.value
}

const handleColorSelection = (color) => {
  // Para simplificar, sólo cerramos la paleta.
  showColorPalette.value = false
}

const syncScroll = (source) => {
  if (!scrollSyncEnabled.value) return

  const editorEl =
    editViewMode.value === 'visual'
      ? visualEditorRef.value
      : markdownTextarea.value
  const previewEl = markdownPreview.value
  if (!editorEl || !previewEl) return

  if (source === 'editor') {
    const ratio =
      editorEl.scrollTop /
      ((editorEl.scrollHeight - editorEl.clientHeight) || 1)
    previewEl.scrollTop =
      ratio * (previewEl.scrollHeight - previewEl.clientHeight)
  } else {
    const ratio =
      previewEl.scrollTop /
      ((previewEl.scrollHeight - previewEl.clientHeight) || 1)
    editorEl.scrollTop =
      ratio * (editorEl.scrollHeight - editorEl.clientHeight)
  }
}

const handleVisualInput = () => {
  if (!visualEditorRef.value) return
  localData.value.content =
    visualEditorRef.value.innerText || ''
  validateField('content')
}

const handleVisualPaste = (event) => {
  event.preventDefault()
  const text =
    event.clipboardData.getData('text/plain') || ''
  document.execCommand('insertText', false, text)
}

const handleMarkdownShortcut = (event) => {
  if (!event.ctrlKey && !event.metaKey) return
  if (event.key.toLowerCase() === 'b') {
    event.preventDefault()
    insertMarkdown('bold')
  }
}

const applyFormat = (action) => {
  const el = visualEditorRef.value
  if (!el) return
  el.focus()

  switch (action) {
    case 'bold':
      document.execCommand('bold')
      break
    case 'italic':
      document.execCommand('italic')
      break
    case 'strikethrough':
      document.execCommand('strikeThrough')
      break
    case 'list':
      document.execCommand('insertUnorderedList')
      break
    case 'orderedList':
      document.execCommand('insertOrderedList')
      break
    case 'quote':
      document.execCommand('formatBlock', false, 'blockquote')
      break
    case 'h1':
      document.execCommand('formatBlock', false, 'h1')
      break
    case 'h2':
      document.execCommand('formatBlock', false, 'h2')
      break
    case 'h3':
      document.execCommand('formatBlock', false, 'h3')
      break
    case 'link':
      // simple: sólo inserta texto markdown
      document.execCommand(
        'insertText',
        false,
        '[texto](https://example.com)'
      )
      break
    case 'image':
      document.execCommand(
        'insertText',
        false,
        '![alt](https://example.com/imagen.png)'
      )
      break
    case 'code':
      document.execCommand('insertText', false, '`código`')
      break
    case 'codeBlock':
      document.execCommand(
        'insertText',
        false,
        '\n```js\nconsole.log(\"hola\")\n```\n'
      )
      break
    case 'removeFormat':
      document.execCommand('removeFormat')
      break
  }
  handleVisualInput()
}

const insertMarkdown = (action) => {
  const textarea = markdownTextarea.value
  if (!textarea) return

  const start = textarea.selectionStart || 0
  const end = textarea.selectionEnd || 0
  const value = textarea.value
  const selected = value.slice(start, end) || ''
  let replacement = ''
  let newStart = start
  let newEnd = end

  const surround = (before, after, placeholder) => {
    const text = selected || placeholder
    replacement = `${before}${text}${after}`
    newStart = start + before.length
    newEnd = newStart + text.length
  }

  switch (action) {
    case 'bold':
      surround('**', '**', 'texto')
      break
    case 'italic':
      surround('_', '_', 'texto')
      break
    case 'strikethrough':
      surround('~~', '~~', 'texto')
      break
    case 'code':
      surround('`', '`', 'codigo')
      break
    case 'h1':
      replacement = `# ${selected || 'Título 1'}`
      newStart = start + 2
      newEnd = newStart + (selected || 'Título 1').length
      break
    case 'h2':
      replacement = `## ${selected || 'Título 2'}`
      newStart = start + 3
      newEnd = newStart + (selected || 'Título 2').length
      break
    case 'h3':
      replacement = `### ${selected || 'Título 3'}`
      newStart = start + 4
      newEnd = newStart + (selected || 'Título 3').length
      break
    case 'list':
      replacement = selected
        ? selected
            .split('\n')
            .map((line) => (line ? `- ${line}` : '- '))
            .join('\n')
        : '- elemento'
      newStart = start
      newEnd = start + replacement.length
      break
    case 'orderedList':
      replacement = selected
        ? selected
            .split('\n')
            .map((line, idx) =>
              line ? `${idx + 1}. ${line}` : `${idx + 1}. `
            )
            .join('\n')
        : '1. elemento'
      newStart = start
      newEnd = start + replacement.length
      break
    case 'checkbox':
      replacement = selected
        ? selected
            .split('\n')
            .map((line) => `- [ ] ${line}`)
            .join('\n')
        : '- [ ] tarea'
      newStart = start
      newEnd = start + replacement.length
      break
    case 'link':
      surround('[', '](https://example.com)', 'texto')
      break
    case 'image':
      replacement =
        selected || '![alt](https://example.com/imagen.png)'
      newStart = start
      newEnd = start + replacement.length
      break
    case 'callout':
      replacement =
        selected || '> 💡 Consejo: escribe aquí tu nota'
      newStart = start
      newEnd = start + replacement.length
      break
    case 'quote':
      replacement = selected
        ? selected
            .split('\n')
            .map((line) => `> ${line}`)
            .join('\n')
        : '> Cita'
      newStart = start
      newEnd = start + replacement.length
      break
    case 'codeBlock':
      replacement =
        selected ||
        '```js\nconsole.log("Hola mundo");\n```'
      newStart = start
      newEnd = start + replacement.length
      break
    case 'table':
      replacement =
        selected ||
        '| Columna 1 | Columna 2 |\n|-----------|-----------|\n| Dato 1    | Dato 2    |'
      newStart = start
      newEnd = start + replacement.length
      break
    case 'horizontalRule':
      replacement = '---'
      newStart = start
      newEnd = start + replacement.length
      break
    default:
      replacement = selected
  }

  const newValue =
    value.slice(0, start) + replacement + value.slice(end)
  textarea.value = newValue
  localData.value.content = newValue
  validateField('content')

  nextTick(() => {
    textarea.focus()
    textarea.selectionStart = newStart
    textarea.selectionEnd = newEnd
  })
}

const copyMarkdownToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(
      localData.value.content || ''
    )
    copyStatus.value = 'Markdown copiado'
    setTimeout(() => {
      copyStatus.value = ''
    }, 2000)
  } catch (e) {
    console.error('Error copiando markdown', e)
  }
}

// escapar fullscreen al cerrar modal
onMounted(() => {
  if (visualEditorRef.value) {
    visualEditorRef.value.innerText =
      localData.value.content || ''
  }
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})

const close = () => emit('update:modelValue', false)
</script>

<style scoped>
.form-label {
  @apply block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1;
}
.form-input {
  @apply w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400
    focus:border-blue-500 focus:ring-2 focus:ring-blue-100
    dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/40;
}
.form-textarea {
  @apply w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400
    focus:border-blue-500 focus:ring-2 focus:ring-blue-100
    dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/40;
}
</style>
