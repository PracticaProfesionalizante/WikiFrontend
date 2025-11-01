<template>
  <div v-if="dialog" class="fixed inset-0 z-[1000] grid place-items-center bg-black/60 p-4 sm:p-6">
    <div class="w-full max-w-full sm:max-w-[900px] max-h-[90vh] flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" @click.stop>
      <!-- Wizard Header -->
      <div class="border-b border-slate-200 bg-blue-600 text-white dark:border-slate-700 px-4 py-4 sm:px-6">
        <div class="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-4">
            <div class="grid h-12 w-12 place-items-center rounded-xl bg-white/20 text-2xl text-white">
              <i :class="isEditing ? 'fas fa-edit' : 'fas fa-plus'"></i>
            </div>
            <div>
              <h2 class="m-0 text-xl font-semibold">
                {{ isEditing ? 'Editar Documento' : 'Crear Nuevo Documento' }}
              </h2>
              <p class="m-0 text-sm text-white/80">
                {{ isEditing ? 'Modifica la información del documento' : 'Completa los datos para crear un nuevo documento' }}
              </p>
            </div>
          </div>
          <button @click="handleClose" class="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-white ring-1 ring-white/30 backdrop-blur hover:bg-white/30 disabled:opacity-50 self-end sm:self-auto" :disabled="isSaving">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Indicador de carga -->
      <div v-if="loading" class="flex flex-col items-center justify-center gap-4 border-t border-slate-200 bg-slate-50 p-12 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-500"></div>
        <p class="text-sm font-medium">Cargando datos del documento...</p>
      </div>

      <!-- Wizard Steps Indicator -->
      <div v-else class="border-b border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-700 dark:bg-slate-800 sm:px-6">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div
            v-for="(step, index) in wizardSteps"
            :key="step.id"
            :class="[
              'flex items-center gap-3 rounded-lg px-2 py-1 transition',
              (
                isEditing ||
                index + 1 <= currentWizardStep ||
                (index === currentWizardStep && canProceedToNextStep)
              )
                ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/60'
                : 'cursor-default',
              {
              'opacity-100': currentWizardStep === index + 1 || currentWizardStep > index + 1,
              'opacity-50': currentWizardStep < index + 1
              }
            ]"
            :aria-current="currentWizardStep === index + 1 ? 'step' : undefined"
            role="button"
            tabindex="0"
            @click="goToStep(index + 1)"
            @keydown.enter.prevent="goToStep(index + 1)"
            @keydown.space.prevent="goToStep(index + 1)"
          >
            <div
              class="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold transition-all"
              :class="{
                'bg-blue-600 text-white': currentWizardStep === index + 1,
                'bg-emerald-600 text-white': currentWizardStep > index + 1,
                'bg-slate-300 text-slate-600 dark:bg-slate-700 dark:text-slate-400': currentWizardStep < index + 1,
              }"
            >
              <i v-if="currentWizardStep > index + 1" class="fas fa-check"></i>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="min-w-0 hidden md:block">
              <h4 class="m-0 truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{{ step.title }}</h4>
              <p class="m-0 truncate text-xs text-slate-600 dark:text-slate-300">{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Wizard Body -->
      <div v-if="!loading" class="flex-1 overflow-y-auto p-6">
        <form @submit.prevent="handleSubmit">
          <!-- Paso 1: Información Básica -->
          <div v-show="currentWizardStep === 1" class="space-y-6">
            <div class="mb-6">
              <h3 class="m-0 mb-2 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                <i class="fas fa-info-circle text-blue-500"></i>
                Información Básica
              </h3>
              <p class="m-0 text-sm text-slate-600 dark:text-slate-300">Datos principales del documento</p>
            </div>

            <div class="space-y-4">
              <div>
                <label for="documentName" class="mb-2 flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                  <i class="fas fa-tag text-blue-500"></i>
                  Nombre del Documento
                  <span class="text-red-600">*</span>
                </label>
                <input
                  id="documentName"
                  v-model="form.name"
                  type="text"
                  class="w-full rounded-lg border-2 px-4 py-2 text-sm outline-none transition focus:border-blue-500 dark:bg-slate-900 dark:text-slate-100"
                  :class="validationErrors.name ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'"
                  placeholder="Ej: Reglamento de Estudiantes"
                  @input="validateField('name')"
                  required
                  :disabled="isSaving"
                />
                <div v-if="validationErrors.name" class="mt-2 flex items-center gap-2 text-xs font-medium text-red-600">
                  <i class="fas fa-exclamation-circle"></i>
                  {{ validationErrors.name }}
                </div>
              </div>

              <div>
                <label for="documentType" class="mb-2 flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                  <i class="fas fa-list text-blue-500"></i>
                  Tipo de Documento
                  <span class="text-red-600">*</span>
                </label>
                <select
                  id="documentType"
                  v-model="form.type"
                  class="w-full rounded-lg border-2 px-4 py-2 text-sm outline-none transition focus:border-blue-500 dark:bg-slate-900 dark:text-slate-100"
                  :class="validationErrors.type ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'"
                  @change="handleTypeChange"
                  required
                  :disabled="isSaving"
                >
                  <option value="">Selecciona un tipo</option>
                  <option value="TYPE_URL">🔗 Enlace/URL</option>
                  <option value="TYPE_TEXT">📄 Documento de Texto</option>
                  <option value="TYPE_PDF">📋 Documento PDF</option>
                </select>
                <div v-if="validationErrors.type" class="mt-2 flex items-center gap-2 text-xs font-medium text-red-600">
                  <i class="fas fa-exclamation-circle"></i>
                  {{ validationErrors.type }}
                </div>
              </div>

              <div>
                <label for="documentIcon" class="mb-2 flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                  <i class="fas fa-palette text-blue-500"></i>
                  Icono
                </label>
                <IconSelector
                  id="documentIcon"
                  v-model="form.icon"
                  placeholder="Selecciona un icono para el documento"
                />
                <div class="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Elige un icono que represente el contenido del documento
                </div>
              </div>
            </div>
          </div>

          <!-- Paso 2: Contenido del Documento -->
          <div v-show="currentWizardStep === 2" class="space-y-6">
            <div class="mb-6">
              <h3 class="m-0 mb-2 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                <i class="fas fa-file-text text-blue-500"></i>
                Contenido del Documento
              </h3>
              <p class="m-0 text-sm text-slate-600 dark:text-slate-300">
                {{ form.type === 'TYPE_TEXT' ? 'Escribe el contenido en formato Markdown' :
                   form.type === 'TYPE_URL' ? 'Ingresa la URL del contenido' :
                   form.type === 'TYPE_PDF' ? 'Sube el archivo PDF del documento' :
                   'Selecciona el tipo de documento primero' }}
              </p>
            </div>

            <div class="space-y-4">
              <!-- Mensaje cuando no hay tipo seleccionado -->
              <div v-if="!form.type" class="flex items-center gap-4 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-800">
                <div class="grid h-14 w-14 place-items-center rounded-full bg-slate-400 text-2xl text-white">
                  <i class="fas fa-question-circle"></i>
                </div>
                <div>
                  <h4 class="m-0 mb-1 text-base font-semibold text-slate-900 dark:text-slate-100">Selecciona un tipo de documento</h4>
                  <p class="m-0 text-sm text-slate-600 dark:text-slate-300">Primero debes seleccionar el tipo de documento en el paso anterior para continuar.</p>
                </div>
              </div>

              <!-- Contenido TYPE_TEXT/Markdown -->
              <div v-else-if="form.type === 'TYPE_TEXT'" class="space-y-4">
                <div class="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800">
                  <div class="flex flex-wrap items-center gap-1">
                    <button
                      type="button"
                      class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition"
                      :class="previewMode === 'edit' ? 'bg-blue-600 text-white shadow' : 'text-slate-700 hover:bg-slate-200 dark:text-slate-100 dark:hover:bg-slate-700'"
                      @click="setPreviewMode('edit')"
                      :aria-pressed="previewMode === 'edit'"
                    >
                      <i class="fas fa-pen-nib"></i>
                      Editor
                    </button>
                    <button
                      type="button"
                      class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition"
                      :class="previewMode === 'split' ? 'bg-blue-600 text-white shadow' : 'text-slate-700 hover:bg-slate-200 dark:text-slate-100 dark:hover:bg-slate-700'"
                      @click="setPreviewMode('split')"
                      :aria-pressed="previewMode === 'split'"
                    >
                      <i class="fas fa-columns"></i>
                      Dividir
                    </button>
                    <button
                      type="button"
                      class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition"
                      :class="previewMode === 'preview' ? 'bg-blue-600 text-white shadow' : 'text-slate-700 hover:bg-slate-200 dark:text-slate-100 dark:hover:bg-slate-700'"
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
                        :class="editViewMode === 'visual' ? 'bg-emerald-600 text-white shadow' : 'text-slate-700 hover:bg-slate-200 dark:text-slate-100 dark:hover:bg-slate-700'"
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
                        :class="editViewMode === 'markdown' ? 'bg-slate-900 text-white shadow dark:bg-slate-200 dark:text-slate-900' : 'text-slate-700 hover:bg-slate-200 dark:text-slate-100 dark:hover:bg-slate-700'"
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
                      :class="scrollSyncEnabled ? 'border-emerald-500 text-emerald-600 dark:border-emerald-500 dark:text-emerald-300' : ''"
                      @click="toggleScrollSync"
                      :title="scrollSyncEnabled ? 'Desactivar sincronización de desplazamiento' : 'Activar sincronización de desplazamiento'"
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

                <transition name="markdown-help">
                  <div
                    v-if="showMarkdownHelp && editViewMode === 'markdown'"
                    class="rounded-xl border border-slate-200 bg-white/95 p-4 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200"
                  >
                    <div class="mb-3 flex items-center justify-between">
                      <h4 class="m-0 text-sm font-semibold text-slate-800 dark:text-slate-100">
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
                        <h5 class="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                          {{ section.title }}
                        </h5>
                        <ul class="space-y-1.5">
                          <li v-for="item in section.items" :key="item.syntax" class="flex flex-col gap-1">
                            <code class="rounded bg-slate-900/90 px-2 py-1 font-mono text-[11px] text-sky-200 dark:bg-slate-950/80">
                              {{ item.syntax }}
                            </code>
                            <span class="text-[11px] text-slate-600 dark:text-slate-300">{{ item.description }}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </transition>

                <div v-if="previewMode !== 'preview'" class="space-y-2">
                  <div
                    v-if="editViewMode === 'visual'"
                    class="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white/90 p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900/80"
                  >
                  <div class="flex items-center gap-1">
                      <button type="button" @click="applyFormat('bold')" :disabled="isSaving" class="markdown-toolbar-btn" title="Negrita"><i class="fas fa-bold"></i></button>
                      <button type="button" @click="applyFormat('italic')" :disabled="isSaving" class="markdown-toolbar-btn" title="Cursiva"><i class="fas fa-italic"></i></button>
                      <button type="button" @click="applyFormat('strikethrough')" :disabled="isSaving" class="markdown-toolbar-btn" title="Tachado"><i class="fas fa-strikethrough"></i></button>
                  </div>
                    <div class="markdown-toolbar-separator"></div>
                  <div class="flex items-center gap-1">
                      <button type="button" @click="applyFormat('h1')" :disabled="isSaving" class="markdown-toolbar-btn" title="Encabezado H1"><span class="font-semibold">H1</span></button>
                      <button type="button" @click="applyFormat('h2')" :disabled="isSaving" class="markdown-toolbar-btn" title="Encabezado H2"><span class="font-semibold">H2</span></button>
                      <button type="button" @click="applyFormat('h3')" :disabled="isSaving" class="markdown-toolbar-btn" title="Encabezado H3"><span class="font-semibold">H3</span></button>
                  </div>
                    <div class="markdown-toolbar-separator"></div>
                  <div class="flex items-center gap-1">
                      <button type="button" @click="applyFormat('list')" :disabled="isSaving" class="markdown-toolbar-btn" title="Lista con viñetas"><i class="fas fa-list-ul"></i></button>
                      <button type="button" @click="applyFormat('orderedList')" :disabled="isSaving" class="markdown-toolbar-btn" title="Lista numerada"><i class="fas fa-list-ol"></i></button>
                      <button type="button" @click="applyFormat('quote')" :disabled="isSaving" class="markdown-toolbar-btn" title="Cita"><i class="fas fa-quote-right"></i></button>
                  </div>
                    <div class="markdown-toolbar-separator"></div>
                  <div class="flex items-center gap-1">
                      <button type="button" @click="applyFormat('link')" :disabled="isSaving" class="markdown-toolbar-btn" title="Insertar enlace"><i class="fas fa-link"></i></button>
                      <button type="button" @click="applyFormat('image')" :disabled="isSaving" class="markdown-toolbar-btn" title="Insertar imagen"><i class="fas fa-image"></i></button>
                      <button type="button" @click="applyFormat('code')" :disabled="isSaving" class="markdown-toolbar-btn" title="Código en línea"><i class="fas fa-terminal"></i></button>
                  </div>
                    <div class="markdown-toolbar-separator"></div>
                    <div class="relative flex items-center gap-1">
                      <button
                        type="button"
                        class="markdown-toolbar-btn"
                        :disabled="isSaving"
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
                            <button type="button" class="close-btn" @click="toggleColorPalette" title="Cerrar paleta">
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
                              <span :class="['swatch-preview', color.className]"></span>
                              <span class="swatch-label">{{ color.label }}</span>
                            </button>
                          </div>
                        </div>
                      </transition>
                    </div>
                    <div class="markdown-toolbar-separator"></div>
                  <div class="flex items-center gap-1">
                      <button type="button" @click="applyFormat('codeBlock')" :disabled="isSaving" class="markdown-toolbar-btn" title="Bloque de código"><i class="fas fa-code"></i></button>
                      <button type="button" @click="applyFormat('removeFormat')" :disabled="isSaving" class="markdown-toolbar-btn" title="Limpiar formato"><i class="fas fa-eraser"></i></button>
                  </div>
                </div>

                  <div
                    v-else
                    class="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white/85 p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
                  >
                    <div class="flex items-center gap-1">
                      <button type="button" @click="insertMarkdown('bold')" :disabled="previewMode === 'preview' || isSaving" class="markdown-toolbar-btn" title="Negrita (Ctrl + B)"><i class="fas fa-bold"></i></button>
                      <button type="button" @click="insertMarkdown('italic')" :disabled="previewMode === 'preview' || isSaving" class="markdown-toolbar-btn" title="Cursiva (Ctrl + I)"><i class="fas fa-italic"></i></button>
                      <button type="button" @click="insertMarkdown('strikethrough')" :disabled="previewMode === 'preview' || isSaving" class="markdown-toolbar-btn" title="Tachado"><i class="fas fa-strikethrough"></i></button>
                      <button type="button" @click="insertMarkdown('code')" :disabled="previewMode === 'preview' || isSaving" class="markdown-toolbar-btn" title="Código en línea"><i class="fas fa-terminal"></i></button>
                    </div>
                    <div class="markdown-toolbar-separator"></div>
                    <div class="flex items-center gap-1">
                      <button type="button" @click="insertMarkdown('h1')" :disabled="previewMode === 'preview' || isSaving" class="markdown-toolbar-btn" title="Encabezado H1"><span class="font-semibold">H1</span></button>
                      <button type="button" @click="insertMarkdown('h2')" :disabled="previewMode === 'preview' || isSaving" class="markdown-toolbar-btn" title="Encabezado H2"><span class="font-semibold">H2</span></button>
                      <button type="button" @click="insertMarkdown('h3')" :disabled="previewMode === 'preview' || isSaving" class="markdown-toolbar-btn" title="Encabezado H3"><span class="font-semibold">H3</span></button>
                    </div>
                    <div class="markdown-toolbar-separator"></div>
                    <div class="flex items-center gap-1">
                      <button type="button" @click="insertMarkdown('list')" :disabled="previewMode === 'preview' || isSaving" class="markdown-toolbar-btn" title="Lista desordenada (Ctrl + Shift + L)"><i class="fas fa-list-ul"></i></button>
                      <button type="button" @click="insertMarkdown('orderedList')" :disabled="previewMode === 'preview' || isSaving" class="markdown-toolbar-btn" title="Lista numerada (Ctrl + Shift + O)"><i class="fas fa-list-ol"></i></button>
                      <button type="button" @click="insertMarkdown('checkbox')" :disabled="previewMode === 'preview' || isSaving" class="markdown-toolbar-btn" title="Lista de tareas"><i class="fas fa-square-check"></i></button>
                    </div>
                    <div class="markdown-toolbar-separator"></div>
                    <div class="flex items-center gap-1">
                      <button type="button" @click="insertMarkdown('link')" :disabled="previewMode === 'preview' || isSaving" class="markdown-toolbar-btn" title="Insertar enlace (Ctrl + K)"><i class="fas fa-link"></i></button>
                      <button type="button" @click="insertMarkdown('image')" :disabled="previewMode === 'preview' || isSaving" class="markdown-toolbar-btn" title="Insertar imagen"><i class="fas fa-image"></i></button>
                      <button type="button" @click="insertMarkdown('callout')" :disabled="previewMode === 'preview' || isSaving" class="markdown-toolbar-btn" title="Insertar callout"><i class="fas fa-lightbulb"></i></button>
                    </div>
                    <div class="markdown-toolbar-separator"></div>
                    <div class="relative flex items-center gap-1">
                      <button
                        type="button"
                        class="markdown-toolbar-btn"
                        :disabled="previewMode === 'preview' || isSaving"
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
                            <button type="button" class="close-btn" @click="toggleColorPalette" title="Cerrar paleta">
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
                              <span :class="['swatch-preview', color.className]"></span>
                              <span class="swatch-label">{{ color.label }}</span>
                            </button>
                          </div>
                        </div>
                      </transition>
                    </div>
                    <div class="markdown-toolbar-separator"></div>
                    <div class="flex items-center gap-1">
                      <button type="button" @click="insertMarkdown('quote')" :disabled="previewMode === 'preview' || isSaving" class="markdown-toolbar-btn" title="Cita"><i class="fas fa-quote-right"></i></button>
                      <button type="button" @click="insertMarkdown('codeBlock')" :disabled="previewMode === 'preview' || isSaving" class="markdown-toolbar-btn" title="Bloque de código (Ctrl + Shift + C)"><i class="fas fa-code"></i></button>
                      <button type="button" @click="insertMarkdown('table')" :disabled="previewMode === 'preview' || isSaving" class="markdown-toolbar-btn" title="Tabla básica"><i class="fas fa-table"></i></button>
                      <button type="button" @click="insertMarkdown('horizontalRule')" :disabled="previewMode === 'preview' || isSaving" class="markdown-toolbar-btn" title="Separador"><i class="fas fa-minus"></i></button>
                    </div>
                  </div>
                </div>

                <div
                  class="markdown-editor-container overflow-hidden rounded-lg border-2 border-slate-300 dark:border-slate-700"
                  :class="{ 'fixed inset-4 z-[9999] bg-slate-950/90 p-4 md:p-6': isFullscreen }"
                >
                  <div
                    class="flex h-full flex-col md:flex-row"
                    :class="previewMode === 'split' ? 'md:divide-x md:divide-slate-200 dark:md:divide-slate-700' : ''"
                  >
                    <div
                      v-show="previewMode !== 'preview'"
                      class="markdown-editor-pane flex-1"
                    >
                      <div
                        v-if="editViewMode === 'visual'"
                        ref="visualEditorRef"
                        :class="['wysiwyg-editor', validationErrors.content ? 'wysiwyg-editor-error' : '']"
                        contenteditable="true"
                        role="textbox"
                        dir="ltr"
                        :aria-multiline="true"
                        :aria-invalid="validationErrors.content ? 'true' : 'false'"
                        :data-placeholder="'Escribe tu contenido en formato enriquecido...'"
                        @input="handleVisualInput"
                        @scroll="syncScroll('editor')"
                        @paste="handleVisualPaste"
                      ></div>
                  <textarea
                        v-else
                    id="documentContent"
                        ref="markdownTextarea"
                    v-model="form.content"
                        class="markdown-textarea min-h-[280px] w-full resize-none border-0 px-4 py-4 text-sm font-mono outline-none disabled:opacity-50 dark:bg-slate-900 dark:text-slate-100"
                    :class="validationErrors.content ? 'text-red-600' : 'text-slate-900'"
                    placeholder="Escribe tu contenido en formato Markdown..."
                    @input="validateField('content')"
                        @scroll="syncScroll('editor')"
                        @keydown="handleMarkdownShortcut"
                    :disabled="isSaving"
                        :spellcheck="true"
                    required
                  ></textarea>
                    </div>

                    <div
                      v-show="previewMode !== 'edit'"
                      ref="markdownPreview"
                      class="markdown-preview-pane flex-1 overflow-auto bg-slate-50/80 px-4 py-4 dark:bg-slate-900/60"
                      @scroll="syncScroll('preview')"
                    >
                      <pre v-if="previewMode === 'split'" class="whitespace-pre-wrap font-mono text-xs text-slate-800 dark:text-slate-200">{{ form.content || 'Escribe tu contenido en formato Markdown...' }}</pre>
                      <article v-else class="markdown-preview prose prose-slate max-w-none dark:prose-invert">
                        <div v-html="renderedMarkdown"></div>
                      </article>
                    </div>
                  </div>

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
                        {{ markdownStats.readingTime > 0 ? `${markdownStats.readingTime} min lectura` : 'Lectura inmediata' }}
                      </span>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                      <span v-if="copyStatus" class="text-emerald-600 dark:text-emerald-400">
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

                <div v-if="validationErrors.content" class="flex items-center gap-2 text-xs font-medium text-red-600">
                  <i class="fas fa-exclamation-circle"></i>
                  {{ validationErrors.content }}
                </div>
              </div>

              <!-- Contenido TYPE_URL -->
              <div v-else-if="form.type === 'TYPE_URL'" class="space-y-4">
                <div>
                  <label for="documentUrl" class="mb-2 flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                    <i class="fas fa-link text-blue-500"></i>
                    URL del Contenido
                    <span class="text-red-600">*</span>
                  </label>
                  <input
                    id="documentUrl"
                    v-model="form.content"
                    type="url"
                    class="w-full rounded-lg border-2 px-4 py-2 text-sm outline-none transition focus:border-blue-500 dark:bg-slate-900 dark:text-slate-100"
                    :class="validationErrors.content ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'"
                    placeholder="https://ejemplo.com/documento"
                    @input="validateField('content')"
                    :disabled="isSaving"
                    required
                  />
                  <div class="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    <i class="fas fa-info-circle"></i>
                    Ingresa la URL completa del contenido que quieres enlazar
                  </div>
                  <div v-if="validationErrors.content" class="mt-2 flex items-center gap-2 text-xs font-medium text-red-600">
                    <i class="fas fa-exclamation-circle"></i>
                    {{ validationErrors.content }}
                  </div>
                </div>
              </div>

              <!-- Contenido TYPE_PDF -->
              <div v-else-if="form.type === 'TYPE_PDF'" class="space-y-4">
                <div v-if="hasOriginalPdf" class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-200">
                  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div class="flex items-center gap-3">
                      <i class="fas fa-file-pdf text-2xl"></i>
                <div>
                        <p class="m-0 text-base font-semibold">{{ currentPdfName || 'No especificado' }}</p>
                        <p class="m-0 text-xs opacity-80">Archivo PDF actualmente asociado al documento</p>
                      </div>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <button
                        type="button"
                        class="inline-flex items-center gap-2 rounded-lg border border-emerald-400 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:-translate-y-0.5 hover:bg-emerald-100 disabled:opacity-60 dark:bg-emerald-800 dark:text-emerald-100"
                        @click="openOriginalPdf"
                        :disabled="pdfPreviewLoading || isSaving"
                      >
                        <i v-if="!pdfPreviewLoading" class="fas fa-eye"></i>
                        <i v-else class="fas fa-spinner fa-spin"></i>
                        Ver PDF
                      </button>
                      <button
                        type="button"
                        class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow transition hover:-translate-y-0.5 disabled:opacity-60"
                        @click="startPdfReplacement"
                        :disabled="isSaving"
                      >
                        <i class="fas fa-sync"></i>
                        Reemplazar PDF
                      </button>
                    </div>
                    <div v-if="pdfPreviewError" class="mt-2 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 dark:bg-red-900/20 dark:text-red-300">
                      <i class="fas fa-exclamation-circle"></i>
                      {{ pdfPreviewError }}
                    </div>
                  </div>
                </div>

                <div v-if="!hasOriginalPdf || isReplacingPdf">
                  <label for="pdfFile" class="mb-2 flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                    <i class="fas fa-file-pdf text-blue-500"></i>
                    Selecciona un nuevo archivo PDF
                    <span class="text-red-600">*</span>
                  </label>
                  <div
                    class="relative rounded-lg border-2 border-dashed transition"
                    :class="pdfFile ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-300 dark:border-slate-700'"
                  >
                    <input
                      id="pdfFile"
                      ref="pdfFileInput"
                      type="file"
                      accept=".pdf"
                      @change="handleFileSelect"
                      :disabled="isSaving"
                      class="absolute inset-0 cursor-pointer opacity-0"
                    />
                    <div class="p-6 text-center">
                      <div v-if="!pdfFile" class="space-y-2">
                        <i class="fas fa-cloud-upload-alt text-4xl text-slate-400"></i>
                        <p class="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Arrastra tu archivo PDF aquí o haz clic para seleccionar
                        </p>
                        <span class="block text-xs text-slate-500 dark:text-slate-400">Solo archivos PDF (máximo 10MB)</span>
                        <span v-if="isReplacingPdf" class="block text-xs text-amber-600 dark:text-amber-400">
                          Este archivo reemplazará al PDF actual
                        </span>
                      </div>
                      <div
                        v-else
                        class="flex items-center justify-between gap-4 rounded-lg border-2 border-emerald-500 bg-emerald-50 p-4 dark:bg-emerald-900/20"
                      >
                        <div class="flex items-center gap-3">
                          <i class="fas fa-file-pdf text-2xl text-emerald-600 dark:text-emerald-400"></i>
                          <div>
                            <p class="m-0 text-sm font-medium text-slate-900 dark:text-slate-100">{{ pdfFile.name }}</p>
                            <p class="m-0 text-xs text-slate-600 dark:text-slate-300">{{ formatFileSize(pdfFile.size) }}</p>
                          </div>
                        </div>
                        <div class="flex gap-2">
                        <button
                          type="button"
                          class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-700 disabled:opacity-50"
                          @click="removeFile"
                          :disabled="isSaving"
                        >
                          <i class="fas fa-times"></i>
                        </button>
                        </div>
                      </div>
                      </div>
                    </div>
                  </div>
                  <div v-if="validationErrors.pdfFile" class="mt-2 flex items-center gap-2 text-xs font-medium text-red-600">
                    <i class="fas fa-exclamation-circle"></i>
                    {{ validationErrors.pdfFile }}
                </div>
              </div>
            </div>
          </div>

          <!-- Paso 3: Configuración y Permisos -->
          <div v-show="currentWizardStep === 3" class="space-y-6">
            <div class="mb-6">
              <h3 class="m-0 mb-2 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                <i class="fas fa-cog text-blue-500"></i>
                Configuración y Permisos
              </h3>
              <p class="m-0 text-sm text-slate-600 dark:text-slate-300">Define quién puede acceder a este documento</p>
            </div>

            <div class="space-y-4">
              <div>
                <label class="mb-2 flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                  <i class="fas fa-users text-blue-500"></i>
                  Roles con Acceso
                  <span class="text-red-600">*</span>
                </label>
                <fieldset class="rounded-lg border-2 border-slate-300 p-4 dark:border-slate-700">
                  <legend class="px-2 text-sm font-medium text-slate-900 dark:text-slate-100">Selecciona los roles que pueden acceder a este documento</legend>
                  <div class="grid grid-cols-1 gap-3">
                    <div
                      v-for="role in availableRoles"
                      :key="role.value"
                      class="flex items-start rounded-lg border-2 border-slate-300 bg-white p-3 transition hover:border-blue-500 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <input
                        :id="`role-${role.value}`"
                        v-model="form.roles"
                        :value="role.value"
                        type="checkbox"
                        class="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        :disabled="isSaving"
                      />
                      <label :for="`role-${role.value}`" class="ml-2 flex flex-1 cursor-pointer items-start gap-3">
                        <i :class="['fas', role.icon]"></i>
                        <div class="flex-1">
                          <div class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ role.label }}</div>
                          <div class="text-xs text-slate-600 dark:text-slate-300">{{ role.description }}</div>
                        </div>
                      </label>
                    </div>
                  </div>
                </fieldset>
                <div class="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Selecciona los roles que pueden acceder a este documento
                </div>
                <div v-if="validationErrors.roles" class="mt-2 flex items-center gap-2 text-xs font-medium text-red-600">
                  <i class="fas fa-exclamation-circle"></i>
                  {{ validationErrors.roles }}
                </div>
              </div>
            </div>
          </div>

          <!-- Paso 4: Resumen -->
          <div v-show="currentWizardStep === 4" class="space-y-6">
            <div class="mb-6">
              <h3 class="m-0 mb-2 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                <i class="fas fa-eye text-blue-500"></i>
                Resumen del Documento
              </h3>
              <p class="m-0 text-sm text-slate-600 dark:text-slate-300">Revisa la información antes de crear el documento</p>
            </div>

            <div class="grid grid-cols-1 gap-6">
              <div class="rounded-lg border-2 border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                <h4 class="m-0 mb-4 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
                  <i class="fas fa-info-circle text-blue-500"></i>
                  Información Básica
                </h4>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Nombre:</span>
                    <span class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ form.name || 'No especificado' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Tipo:</span>
                    <span class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ getTypeLabel(form.type) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Slug:</span>
                    <span class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ generateSlug(form.name) || 'Se generará automáticamente' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Icono:</span>
                    <span class="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      <i v-if="form.icon" :class="['fas', form.icon]"></i>
                      <span v-else>No especificado</span>
                    </span>
                  </div>
                </div>
              </div>

              <div class="rounded-lg border-2 border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                <h4 class="m-0 mb-4 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
                  <i class="fas fa-save text-blue-500"></i>
                  Contenido
                </h4>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de contenido:</span>
                    <span class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ getTypeLabel(form.type) }}</span>
                  </div>
                  <div v-if="form.type === 'TYPE_TEXT'" class="flex justify-between">
                    <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Contenido:</span>
                    <span class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ form.content ? 'Contenido en Markdown' : 'No especificado' }}</span>
                  </div>
                  <div v-else-if="form.type === 'TYPE_URL'" class="flex justify-between">
                    <span class="text-sm font-medium text-slate-700 dark:text-slate-300">URL:</span>
                    <span class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ form.content || 'No especificado' }}</span>
                  </div>
                  <div v-else-if="form.type === 'TYPE_PDF'" class="flex justify-between">
                    <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Archivo PDF:</span>
                    <span class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ currentPdfName || 'No especificado' }}</span>
                  </div>
                </div>
              </div>

              <div class="rounded-lg border-2 border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                <h4 class="m-0 mb-4 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
                  <i class="fas fa-users text-blue-500"></i>
                  Permisos
                </h4>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Roles con acceso:</span>
                    <span class="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      <span v-if="form.roles && form.roles.length > 0">
                        {{ getRolesText() }}
                      </span>
                      <span v-else>No especificado</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Wizard Footer -->
      <div v-if="!loading" class="border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800">
        <div class="mb-4">
          <div class="mb-2 flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
            <span>Paso {{ currentWizardStep }} de {{ wizardSteps.length }}</span>
          </div>
          <div class="h-2 rounded-full bg-slate-300 dark:bg-slate-700">
            <div
              class="h-2 rounded-full bg-blue-600 transition-all"
              :style="{ width: `${(currentWizardStep / wizardSteps.length) * 100}%` }"
            ></div>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3">
          <!-- Indicador de roles activos al editar -->
          <div v-if="isEditing && form.roles && form.roles.length > 0" class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-medium text-slate-600 dark:text-slate-300">Roles activos:</span>
            <div class="flex flex-wrap items-center gap-2">
              <div
                v-for="role in getSelectedRolesInfo()"
                :key="role.value"
                class="inline-flex items-center gap-1 rounded-full border-2 border-blue-500 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              >
                <i :class="['fas', role.icon]"></i>
                <span>{{ role.label }}</span>
                <span v-if="role.value === 'ROLE_SUPER_USER'" class="inline-flex items-center gap-1 text-xs">
                  <i class="fas fa-crown"></i>
                  Máximo
                </span>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button
              v-if="currentWizardStep > 1"
              type="button"
              @click="previousStep"
              class="inline-flex items-center gap-2 rounded-lg border-2 border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <i class="fas fa-chevron-left"></i>
              Anterior
            </button>

            <button
              v-if="currentWizardStep < wizardSteps.length"
              type="button"
              @click="nextStep"
              class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 disabled:opacity-50"
              :disabled="!canProceedToNextStep"
            >
              Siguiente
              <i class="fas fa-chevron-right"></i>
            </button>

            <button
              v-if="currentWizardStep === wizardSteps.length"
              type="button"
              @click="handleSubmit"
              class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 disabled:opacity-50"
              :disabled="!isFormValid || isSaving"
            >
              <i v-if="isSaving" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-check"></i>
              {{ isSaving ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear') }} Documento
            </button>

            <button
              type="button"
              @click="handleClose"
              class="inline-flex items-center gap-2 rounded-lg border-2 border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:-translate-y-0.5 dark:border-red-700 dark:bg-slate-900 dark:text-red-400"
            >
              <i class="fas fa-times"></i>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import DOMPurify from 'dompurify'
import 'highlight.js/styles/github.min.css'
import TurndownService from 'turndown'

const markedOptions = Object.freeze({
  breaks: true,
  gfm: true,
  headerIds: true,
  mangle: false,
  smartLists: true,
  smartypants: true
})

import documentService from '@/services/documentService'
import IconSelector from '@/components/common/IconSelector.vue'

const renderer = new marked.Renderer()

renderer.link = (href, title, text) => {
  const isHash = href?.startsWith('#')
  const isMail = href?.startsWith('mailto:')
  const isTel = href?.startsWith('tel:')
  const isRelative = href && (href.startsWith('/') || href.startsWith('./') || href.startsWith('../'))
  const isExternal = href && !isHash && !isMail && !isTel && !isRelative
  const target = isExternal ? '_blank' : '_self'
  const rel = isExternal ? 'noopener noreferrer' : ''
  const titleAttr = title ? ` title="${title}"` : ''
  const relAttr = rel ? ` rel="${rel}"` : ''
  const targetAttr = ` target="${target}"`
  return `<a href="${href}"${titleAttr}${targetAttr}${relAttr}>${text}</a>`
}

renderer.image = (href, title, text) => {
  const titleAttr = title ? ` title="${title}"` : ''
  const altText = text || 'Imagen'
  return `<img src="${href}" alt="${altText}" loading="lazy"${titleAttr} />`
}

renderer.table = (header, body) => {
  return `<table class="markdown-table"><thead>${header}</thead><tbody>${body}</tbody></table>`
}

marked.use(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value
      }
      return hljs.highlightAuto(code).value
    }
  })
)

marked.use({ renderer })
marked.setOptions(markedOptions)

const turndownService = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced'
})

turndownService.keep(['span', 'code'])

turndownService.addRule('colorSpan', {
  filter: (node) => {
    if (node.nodeName === 'SPAN') {
      const className = node.getAttribute('class') || ''
      const style = node.getAttribute('style') || ''
      return className.includes('md-color-') || /color:/i.test(style)
    }
    if (node.nodeName === 'FONT') {
      return !!node.getAttribute('color')
    }
    return false
  },
  replacement: (content, node) => {
    const className = node.getAttribute('class')
    const style = node.getAttribute('style')
    if (className && className.includes('md-color-')) {
      return `<span class="${className}">${content}</span>`
    }
    if (style && /color:/i.test(style)) {
      return `<span style="${style}">${content}</span>`
    }
    const color = node.getAttribute('color')
    if (color) {
      return `<span style="color:${color}">${content}</span>`
    }
    return content
  }
})

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  document: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  startStep: {
    type: Number,
    default: 1
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'saved', 'close'])

// Reactive data
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const form = ref({
  name: '',
  type: '',
  slug: '',
  content: '',
  icon: '',
  roles: []
})

const validationErrors = ref({})
const isSaving = ref(false)
const slugAlternatives = ref([])

// Editor de Markdown avanzado
const isFullscreen = ref(false)
const markdownTextarea = ref(null)
const markdownPreview = ref(null)

const getDefaultPreviewMode = () => {
  if (typeof window === 'undefined') {
    return 'edit'
  }
  return window.innerWidth < 768 ? 'edit' : 'split'
}

const previewMode = ref(getDefaultPreviewMode())
const scrollSyncEnabled = ref(true)
const showMarkdownHelp = ref(false)
const showColorPalette = ref(false)
const copyStatus = ref('')
let copyStatusTimeout = null
const editViewMode = ref('visual')
const visualEditorRef = ref(null)
const visualContent = ref('')
let isSyncingFromVisual = false
let isSyncingFromMarkdown = false

// Wizard variables
const currentWizardStep = ref(1)
const wizardSteps = ref([
  {
    id: 'basic',
    title: 'Información Básica',
    description: 'Datos principales del documento'
  },
  {
    id: 'content',
    title: 'Contenido',
    description: 'Contenido del documento'
  },
  {
    id: 'permissions',
    title: 'Permisos',
    description: 'Configuración de acceso'
  },
  {
    id: 'summary',
    title: 'Resumen',
    description: 'Revisar información'
  }
])

const desiredStartStep = computed(() => {
  const step = Number.isFinite(props.startStep) ? props.startStep : 1
  return Math.min(Math.max(step, 1), wizardSteps.value.length)
})

// PDF File Upload
const pdfFile = ref(null)
const fileInput = ref(null)
const pdfPreviewUrl = ref(null)
const originalPdfUrl = ref('')
const originalPdfName = ref('')
const isReplacingPdf = ref(false)
const hasOriginalPdf = computed(() => !!originalPdfUrl.value && !isReplacingPdf.value)
const currentPdfName = computed(() => {
  if (pdfFile.value) {
    return pdfFile.value.name
  }
  if (!isReplacingPdf.value && originalPdfName.value) {
    return originalPdfName.value
  }
  return ''
})
const pdfPreviewLoading = ref(false)
const pdfPreviewError = ref('')

// Roles disponibles (mismos que en MenuManagerView)
const availableRolesList = [
  {
    value: 'SUPER_USER',
    label: 'Super Usuario',
    icon: 'fa-star',
    description: 'Acceso completo al sistema'
  },
  {
    value: 'ADMIN',
    label: 'Administrador',
    icon: 'fa-shield-alt',
    description: 'Gestión de usuarios y configuración'
  },
  {
    value: 'COLLABORATOR',
    label: 'Colaborador',
    icon: 'fa-user-friends',
    description: 'Acceso a funciones básicas'
  }
]

const markdownCheatSheet = Object.freeze([
  {
    title: 'Encabezados',
    items: [
      { syntax: '# Título principal', description: 'Encabezado nivel 1' },
      { syntax: '## Sección', description: 'Encabezado nivel 2' },
      { syntax: '### Subsección', description: 'Encabezado nivel 3' }
    ]
  },
  {
    title: 'Texto',
    items: [
      { syntax: '**negrita**', description: 'Texto en negrita' },
      { syntax: '*cursiva*', description: 'Texto en cursiva' },
      { syntax: '~~tachado~~', description: 'Texto tachado' },
      { syntax: '`código`', description: 'Código en línea' }
    ]
  },
  {
    title: 'Listas',
    items: [
      { syntax: '- elemento', description: 'Lista desordenada' },
      { syntax: '1. elemento', description: 'Lista numerada' },
      { syntax: '- [ ] tarea pendiente', description: 'Lista de tareas' }
    ]
  },
  {
    title: 'Enlaces e imágenes',
    items: [
      { syntax: '[Texto](https://ejemplo.com)', description: 'Enlace con texto' },
      { syntax: '![Alt](https://ejemplo.com/imagen.png)', description: 'Imagen con texto alternativo' }
    ]
  },
  {
    title: 'Citas y bloques',
    items: [
      { syntax: '> Cita', description: 'Bloque de cita' },
      { syntax: '> [!TIP] Consejo', description: 'Callout informativo' },
      { syntax: '---', description: 'Separador horizontal' }
    ]
  },
  {
    title: 'Código y tablas',
    items: [
      { syntax: '```js\nconsole.log("Hola")\n```', description: 'Bloque de código con lenguaje' },
      { syntax: '| Col 1 | Col 2 |\n| --- | --- |\n| Dato | Dato |', description: 'Tabla básica' }
    ]
  }
])

const colorPalette = Object.freeze([
  { label: 'Azul cielo', className: 'md-color-sky', color: '#0ea5e9' },
  { label: 'Azul profundo', className: 'md-color-blue', color: '#2563eb' },
  { label: 'Verde esmeralda', className: 'md-color-emerald', color: '#059669' },
  { label: 'Verde lima', className: 'md-color-lime', color: '#65a30d' },
  { label: 'Amarillo dorado', className: 'md-color-amber', color: '#d97706' },
  { label: 'Naranja', className: 'md-color-orange', color: '#ea580c' },
  { label: 'Rojo', className: 'md-color-rose', color: '#e11d48' },
  { label: 'Fucsia', className: 'md-color-pink', color: '#db2777' },
  { label: 'Morado', className: 'md-color-purple', color: '#7c3aed' },
  { label: 'Gris', className: 'md-color-slate', color: '#475569' }
])

// Computed
const isEditing = computed(() => props.isEditing || !!props.document)

// Roles disponibles para el template
const availableRoles = computed(() => availableRolesList)

const markdownStats = computed(() => {
  const raw = form.value.content || ''
  const trimmed = raw.trim()
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0
  const characters = raw.length
  const charactersNoSpaces = raw.replace(/\s/g, '').length
  const lines = raw ? raw.split(/\r?\n/).length : 0
  const headings = (raw.match(/^#{1,6}\s+/gm) || []).length
  const unorderedLists = (raw.match(/^\s*[-*+]\s+/gm) || []).length
  const orderedLists = (raw.match(/^\s*\d+\.\s+/gm) || []).length
  const tasks = (raw.match(/^\s*[-*+]\s+\[[ xX]\]\s+/gm) || []).length
  const codeBlocks = Math.max(0, Math.round(((raw.match(/```/g) || []).length) / 2))
  const blockquotes = (raw.match(/^\s*>\s+/gm) || []).length
  const tables = (raw.match(/^\s*\|.*\|\s*$/gm) || []).length
  const readingTime = words === 0 ? 0 : Math.max(1, Math.ceil(words / 180))

  return {
    words,
    characters,
    charactersNoSpaces,
    lines,
    headings,
    unorderedLists,
    orderedLists,
    tasks,
    codeBlocks,
    blockquotes,
    tables,
    readingTime
  }
})

// Renderizar Markdown
const renderedMarkdown = computed(() => {
  const content = form.value.content || ''

  if (content.trim() === '') {
    return '<div class="markdown-empty-state"><p>Empieza a escribir para ver la vista previa en vivo.</p><p class="hint">Usa la barra de herramientas o atajos como <strong>Ctrl + B</strong>, <strong>Ctrl + I</strong>, <strong>Ctrl + K</strong> y <strong>Ctrl + Shift + C</strong>.</p></div>'
  }

  try {
    const html = marked.parse(content)
    return DOMPurify.sanitize(html, {
      ADD_ATTR: ['target', 'rel'],
      USE_PROFILES: { html: true }
    })
  } catch (error) {
    console.error('❌ [MARKDOWN] Error renderizando Markdown:', error)
    return '<div class="markdown-error-state"><p>❌ Error al renderizar el Markdown.</p><p class="hint">Revisa la sintaxis del contenido.</p></div>'
  }
})

const isFormValid = computed(() => {
  const valid = form.value.name &&
         form.value.type &&
         form.value.content &&
         Object.keys(validationErrors.value).length === 0
  console.log('📄 [CONTENT FORM] isFormValid:', valid, 'name:', form.value.name, 'type:', form.value.type, 'content:', form.value.content, 'errors:', Object.keys(validationErrors.value).length)
  return valid
})

// Wizard Computed Properties
const canProceedToNextStep = computed(() => {
  switch (currentWizardStep.value) {
    case 1:
      // Paso 1: Información Básica (sin slug, se genera automáticamente)
      const step1Valid = form.value.name &&
             form.value.type &&
             !validationErrors.value.name &&
             !validationErrors.value.type
      console.log('📄 [CONTENT FORM] Validación paso 1:', step1Valid, 'name:', form.value.name, 'type:', form.value.type)
      return step1Valid
    case 2:
      // Paso 2: Contenido del Documento
      if (!form.value.type) return false
      if (form.value.type === 'TYPE_PDF') {
        const step2Valid = (pdfFile.value || (!isReplacingPdf.value && originalPdfUrl.value)) && !validationErrors.value.pdfFile
        console.log('📄 [CONTENT FORM] Validación paso 2 PDF:', step2Valid, 'pdfFile:', !!pdfFile.value, 'originalPdfUrl:', !!originalPdfUrl.value, 'isReplacingPdf:', isReplacingPdf.value)
        return step2Valid
      }
      const step2ContentValid = form.value.content && !validationErrors.value.content
      console.log('📄 [CONTENT FORM] Validación paso 2 contenido:', step2ContentValid)
      return step2ContentValid
    case 3:
      // Paso 3: Permisos
      const step3Valid = form.value.roles && form.value.roles.length > 0 && !validationErrors.value.roles
      console.log('📄 [CONTENT FORM] Validación paso 3:', step3Valid, 'roles:', form.value.roles)
      return step3Valid
    case 4:
      // Paso 4: Resumen (siempre puede proceder)
      return true
    default:
      return false
  }
})

// Wizard Methods
const nextStep = () => {
  console.log('📄 [CONTENT FORM] Intentando avanzar al siguiente paso')
  console.log('📄 [CONTENT FORM] Paso actual:', currentWizardStep.value)
  console.log('📄 [CONTENT FORM] Total de pasos:', wizardSteps.value.length)
  console.log('📄 [CONTENT FORM] Puede proceder:', canProceedToNextStep.value)
  if (currentWizardStep.value < wizardSteps.value.length && canProceedToNextStep.value) {
    currentWizardStep.value++
    console.log('✅ [CONTENT FORM] Avanzando al paso:', currentWizardStep.value)
  } else {
    console.log('❌ [CONTENT FORM] No puede avanzar')
  }
}

const previousStep = () => {
  if (currentWizardStep.value > 1) {
    currentWizardStep.value--
  }
}

const getTypeLabel = (type) => {
  const types = {
    'TYPE_TEXT': '📄 Documento de Texto',
    'TYPE_URL': '🔗 Enlace/URL',
    'TYPE_PDF': '📋 Documento PDF'
  }
  return types[type] || 'No especificado'
}

const getRolesText = () => {
  if (!form.value.roles || form.value.roles.length === 0) {
    return 'Ninguno'
  }

  const roleLabels = form.value.roles.map(roleValue => {
    const role = availableRolesList.find(r => r.value === roleValue)
    return role ? role.label : roleValue
  })

  return roleLabels.join(', ')
}

const getSelectedRolesInfo = () => {
  return form.value.roles.map(roleValue => {
    return availableRolesList.find(role => role.value === roleValue)
  }).filter(Boolean)
}

// Methods
const validateField = (field) => {
  const value = form.value[field]

  switch (field) {
    case 'name':
      if (!value || value.trim().length < 3) {
        validationErrors.value.name = 'El nombre debe tener al menos 3 caracteres'
      } else if (value.length > 100) {
        validationErrors.value.name = 'El nombre no puede exceder 100 caracteres'
      } else {
        delete validationErrors.value.name
      }
      break

    case 'type':
      if (!value) {
        validationErrors.value.type = 'Debes seleccionar un tipo de documento'
      } else {
        delete validationErrors.value.type
      }
      break

    case 'slug':
      if (!value || value.trim() === '') {
        validationErrors.value.slug = 'El slug es obligatorio'
      } else if (value.length > 100) {
        validationErrors.value.slug = 'El slug no puede exceder 100 caracteres'
      } else if (!/^[a-z0-9-]+$/.test(value)) {
        validationErrors.value.slug = 'El slug solo puede contener letras minúsculas, números y guiones'
      } else if (value.startsWith('-') || value.endsWith('-')) {
        validationErrors.value.slug = 'El slug no puede empezar o terminar con guión'
      } else {
        delete validationErrors.value.slug
      }
      break

    case 'content':
      if (!value || value.trim().length === 0) {
        validationErrors.value.content = 'El contenido es obligatorio'
      } else if (form.value.type === 'TYPE_URL' && !isValidUrl(value)) {
        validationErrors.value.content = 'Debe ser una URL válida'
      } else if (form.value.type === 'TYPE_PDF' && !pdfFile.value) {
        validationErrors.value.content = 'Debe seleccionar un archivo PDF'
      } else if (value.length > 10000) {
        validationErrors.value.content = 'El contenido no puede exceder 10,000 caracteres'
      } else {
        delete validationErrors.value.content
      }
      break

    case 'roles':
      if (!value || value.length === 0) {
        validationErrors.value.roles = 'Debe seleccionar al menos un rol'
      } else if (value.length > 3) {
        validationErrors.value.roles = 'No puede seleccionar más de 3 roles'
      } else {
        delete validationErrors.value.roles
      }
      break

    default:
      break
  }
}

const validateForm = () => {
  validateField('name')
  validateField('type')
  // No validar slug en modo edición ya que se genera automáticamente
  if (!isEditing.value) {
    validateField('slug')
  }
  validateField('content')
  validateField('roles')
}

// Función para generar slug automáticamente
const generateSlug = (name, makeUnique = false) => {
  if (!name) return ''

  let slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
    .replace(/^-|-$/g, '') // Remover guiones al inicio y final

  // Si se solicita hacer único, agregar identificador único más robusto
  if (makeUnique) {
    // Usar timestamp completo + número aleatorio para mayor unicidad
    const timestamp = Date.now().toString()
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    slug = `${slug}-${timestamp}-${random}`
  }

  return slug
}

const isValidUrl = (string) => {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

const handleTypeChange = () => {
  // Limpiar contenido cuando cambia el tipo
  form.value.content = ''
  validateField('content')
  showMarkdownHelp.value = false
  showColorPalette.value = false
  previewMode.value = getDefaultPreviewMode()

  if (form.value.type !== 'TYPE_PDF') {
    pdfFile.value = null
    pdfPreviewUrl.value = null
    originalPdfUrl.value = ''
    originalPdfName.value = ''
    isReplacingPdf.value = false
    pdfPreviewError.value = ''
  }

  if (form.value.type === 'TYPE_TEXT') {
    setEditViewMode('visual')
    syncVisualFromMarkdown()
  } else {
    editViewMode.value = 'visual'
  }
}

// Funciones del editor de Markdown
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

const focusEditor = () => {
  nextTick(() => {
    if (editViewMode.value === 'visual') {
      visualEditorRef.value?.focus()
    } else {
      markdownTextarea.value?.focus()
    }
  })
}

const setPreviewMode = (mode) => {
  if (!['edit', 'split', 'preview'].includes(mode)) {
    return
  }
  previewMode.value = mode
  if (mode !== 'preview') {
    focusEditor()
    if (mode === 'split' && scrollSyncEnabled.value) {
      nextTick(() => syncScroll('editor'))
    }
  } else {
    showColorPalette.value = false
    showMarkdownHelp.value = false
  }
}

const syncScroll = (source) => {
  if (!scrollSyncEnabled.value || previewMode.value !== 'split') {
    return
  }

  const editor = editViewMode.value === 'visual' ? visualEditorRef.value : markdownTextarea.value
  const preview = markdownPreview.value
  if (!editor || !preview) {
    return
  }

  if (source === 'editor') {
    const ratio = editor.scrollTop / Math.max(editor.scrollHeight - editor.clientHeight, 1)
    preview.scrollTop = ratio * Math.max(preview.scrollHeight - preview.clientHeight, 1)
  } else if (source === 'preview') {
    const ratio = preview.scrollTop / Math.max(preview.scrollHeight - preview.clientHeight, 1)
    editor.scrollTop = ratio * Math.max(editor.scrollHeight - editor.clientHeight, 1)
  }
}

const toggleMarkdownHelp = () => {
  showMarkdownHelp.value = !showMarkdownHelp.value
  if (showMarkdownHelp.value) {
    showColorPalette.value = false
  }
}

const toggleScrollSync = () => {
  scrollSyncEnabled.value = !scrollSyncEnabled.value
  if (scrollSyncEnabled.value) {
    nextTick(() => syncScroll('editor'))
  }
}

const focusVisualEditor = () => {
  nextTick(() => {
    visualEditorRef.value?.focus()
  })
}

const convertMarkdownToHtml = (markdown) => {
  const rawHtml = marked.parse(markdown || '')
  return DOMPurify.sanitize(rawHtml, {
    ADD_ATTR: ['target', 'rel', 'class', 'style']
  })
}

const convertHtmlToMarkdown = (html) => {
  if (!html) return ''
  return turndownService.turndown(html)
}

const syncVisualFromMarkdown = () => {
  if (isSyncingFromVisual) return
  isSyncingFromMarkdown = true
  const html = convertMarkdownToHtml(form.value.content || '')
  visualContent.value = html
  nextTick(() => {
    if (visualEditorRef.value) {
      visualEditorRef.value.innerHTML = html
    }
    isSyncingFromMarkdown = false
  })
}

const syncMarkdownFromVisual = () => {
  if (isSyncingFromMarkdown) return
  const editor = visualEditorRef.value
  if (!editor) return
  isSyncingFromVisual = true
  visualContent.value = editor.innerHTML
  const markdown = convertHtmlToMarkdown(visualContent.value)
  form.value.content = markdown
  validateField('content')
  isSyncingFromVisual = false
}

const handleVisualInput = () => {
  syncMarkdownFromVisual()
}

const handleVisualPaste = (event) => {
  event.preventDefault()
  const text = event.clipboardData?.getData('text/plain') || ''
  document.execCommand('insertText', false, text)
  syncMarkdownFromVisual()
}

const findAncestorColorSpan = (node, colorClass) => {
  while (node && node !== visualEditorRef.value) {
    if (node.nodeType === Node.ELEMENT_NODE && node.classList?.contains(colorClass)) {
      return node
    }
    node = node.parentElement
  }
  return null
}

const removeColorClasses = (node) => {
  if (node.nodeType === Node.ELEMENT_NODE && node.classList) {
    colorPalette.forEach(({ className }) => {
      if (node.classList.contains(className)) {
        node.classList.remove(className)
      }
    })
    if (node.style && node.style.color) {
      node.style.removeProperty('color')
    }
  }
  const children = node.childNodes ? Array.from(node.childNodes) : []
  children.forEach((child) => removeColorClasses(child))
}

const unwrapElement = (element) => {
  if (!element || !element.parentNode) return
  while (element.firstChild) {
    element.parentNode.insertBefore(element.firstChild, element)
  }
  element.parentNode.removeChild(element)
}

const applyVisualColor = (color) => {
  const editor = visualEditorRef.value
  if (!editor) return
  editor.focus()

  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return
  const range = selection.getRangeAt(0)

  const focusNode = selection.focusNode instanceof Element ? selection.focusNode : selection.focusNode?.parentElement
  const existingSpan = focusNode ? findAncestorColorSpan(focusNode, color.className) : null

  if (existingSpan) {
    unwrapElement(existingSpan)
    syncMarkdownFromVisual()
    showColorPalette.value = false
    return
  }

  let fragment
  if (range.collapsed) {
    const placeholder = document.createTextNode('Texto coloreado')
    range.insertNode(placeholder)
    selection.removeAllRanges()
    const tempRange = document.createRange()
    tempRange.setStartBefore(placeholder)
    tempRange.setEndAfter(placeholder)
    selection.addRange(tempRange)
    fragment = tempRange.extractContents()
  } else {
    fragment = range.extractContents()
  }

  removeColorClasses(fragment)

  const span = document.createElement('span')
  span.className = color.className
  span.style.color = color.color
  span.appendChild(fragment)
  range.insertNode(span)

  selection.removeAllRanges()
  const newRange = document.createRange()
  newRange.selectNodeContents(span)
  selection.addRange(newRange)

  syncMarkdownFromVisual()
  showColorPalette.value = false
}

const insertHtmlAtSelection = (html) => {
  const editor = visualEditorRef.value
  if (!editor) return
  editor.focus()
  document.execCommand('insertHTML', false, html)
  syncMarkdownFromVisual()
}

const executeVisualCommand = (command, value = null) => {
  const editor = visualEditorRef.value
  if (!editor) return
  editor.focus()
  document.execCommand(command, false, value)
  syncMarkdownFromVisual()
}

const applyVisualHeading = (tag) => {
  const editor = visualEditorRef.value
  if (!editor) return
  editor.focus()

  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return
  const focusNode = selection.focusNode instanceof Element ? selection.focusNode : selection.focusNode?.parentElement
  const currentHeading = focusNode?.closest?.('h1, h2, h3')

  if (currentHeading && currentHeading.tagName.toLowerCase() === tag) {
    document.execCommand('formatBlock', false, 'p')
  } else {
    document.execCommand('formatBlock', false, tag.toUpperCase())
  }
  syncMarkdownFromVisual()
}

const applyVisualBlock = (tag) => {
  document.execCommand('formatBlock', false, tag.toUpperCase())
  syncMarkdownFromVisual()
}

const insertVisualInlineCode = () => {
  const editor = visualEditorRef.value
  if (!editor) return
  editor.focus()
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return
  const range = selection.getRangeAt(0)
  const selected = range.toString() || 'código'
  const codeElement = document.createElement('code')
  codeElement.textContent = selected
  range.deleteContents()
  range.insertNode(codeElement)
  selection.removeAllRanges()
  const newRange = document.createRange()
  newRange.selectNodeContents(codeElement)
  selection.addRange(newRange)
  syncMarkdownFromVisual()
}

const applyFormat = (action) => {
  if (editViewMode.value === 'visual') {
    focusVisualEditor()
    switch (action) {
    case 'bold':
        executeVisualCommand('bold')
      break
    case 'italic':
        executeVisualCommand('italic')
      break
    case 'strikethrough':
        executeVisualCommand('strikeThrough')
      break
    case 'h1':
        applyVisualHeading('h1')
      break
    case 'h2':
        applyVisualHeading('h2')
      break
    case 'h3':
        applyVisualHeading('h3')
      break
      case 'list':
        executeVisualCommand('insertUnorderedList')
        break
      case 'orderedList':
        executeVisualCommand('insertOrderedList')
        break
      case 'quote':
        applyVisualBlock('blockquote')
        break
      case 'code':
        insertVisualInlineCode()
        break
      case 'codeBlock':
        applyVisualBlock('pre')
        break
      case 'link': {
      const url = prompt('Ingresa la URL del enlace:')
      if (url) {
          executeVisualCommand('createLink', url)
      }
      break
      }
      case 'image': {
        const src = prompt('Ingresa la URL de la imagen:')
        if (src) {
          insertHtmlAtSelection(`<img src="${src}" alt="Imagen" />`)
        }
        break
      }
      case 'removeFormat': {
        const editor = visualEditorRef.value
        if (!editor) return
        editor.focus()
        document.execCommand('removeFormat')
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          const container = range.commonAncestorContainer?.nodeType === Node.ELEMENT_NODE
            ? range.commonAncestorContainer
            : range.commonAncestorContainer?.parentElement
          if (container) {
            removeColorClasses(container)
          }
        }
        syncMarkdownFromVisual()
        break
      }
      default:
        insertMarkdown(action)
        break
    }
      } else {
    insertMarkdown(action)
  }
}

const handleColorSelection = (color) => {
  if (editViewMode.value === 'visual') {
    applyVisualColor(color)
  } else {
    applyMarkdownColor(color.className)
  }
}

const setEditViewMode = (mode) => {
  if (!['visual', 'markdown'].includes(mode) || editViewMode.value === mode) return
  editViewMode.value = mode
  showColorPalette.value = false
  if (mode === 'visual') {
    showMarkdownHelp.value = false
    syncVisualFromMarkdown()
    focusVisualEditor()
  } else {
    syncMarkdownFromVisual()
    nextTick(() => {
      markdownTextarea.value?.focus()
    })
  }
}

const toggleColorPalette = () => {
  if (previewMode.value === 'preview' || isSaving.value) return
  showColorPalette.value = !showColorPalette.value
  if (showColorPalette.value) {
    showMarkdownHelp.value = false
    if (editViewMode.value === 'visual') {
      focusVisualEditor()
    } else {
      markdownTextarea.value?.focus()
    }
  }
}

const applyMarkdownColor = (colorClass) => {
  const textarea = markdownTextarea.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = textarea.value.slice(start, end) || 'Texto coloreado'
  const beforeText = textarea.value.slice(0, start)
  const afterText = textarea.value.slice(end)
  const openTag = `<span class="${colorClass}">`
  const closeTag = '</span>'
  const snippet = `${openTag}${selectedText}${closeTag}`
  const newValue = beforeText + snippet + afterText

  textarea.value = newValue
  form.value.content = newValue
  validateField('content')

  nextTick(() => {
    const area = markdownTextarea.value
    if (!area) return
    const selectionStart = beforeText.length + openTag.length
    const selectionEnd = selectionStart + selectedText.length
    area.setSelectionRange(selectionStart, selectionEnd)
    area.focus()
    if (scrollSyncEnabled.value && previewMode.value !== 'edit') {
      syncScroll('editor')
    }
  })

  showColorPalette.value = false
  if (previewMode.value === 'preview') {
    setPreviewMode('split')
  }
}

const copyMarkdownToClipboard = async () => {
  if (!form.value.content) {
    copyStatus.value = 'No hay contenido para copiar'
        return
      }

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(form.value.content)
    } else {
      const helper = document.createElement('textarea')
      helper.value = form.value.content
      helper.setAttribute('readonly', '')
      helper.style.position = 'absolute'
      helper.style.left = '-9999px'
      document.body.appendChild(helper)
      helper.select()
      document.execCommand('copy')
      document.body.removeChild(helper)
    }
    copyStatus.value = 'Markdown copiado'
  } catch (error) {
    console.error('❌ [MARKDOWN] Error al copiar contenido:', error)
    copyStatus.value = 'No se pudo copiar'
  }

  if (copyStatusTimeout) {
    clearTimeout(copyStatusTimeout)
  }
  copyStatusTimeout = setTimeout(() => {
    copyStatus.value = ''
  }, 2500)
}

// Funciones del toolbar de Markdown
const insertMarkdown = (type) => {
  const textarea = markdownTextarea.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = textarea.value.slice(start, end)
  const beforeText = textarea.value.slice(0, start)
  const afterText = textarea.value.slice(end)

  const ensureNewLineBefore = () => {
    if (beforeText === '' || beforeText.endsWith('\n') || beforeText.endsWith('\n\n')) {
      return ''
    }
    return '\n'
  }

  const applyInsertion = (snippet, placeholder = '', caretOffset) => {
    const newValue = beforeText + snippet + afterText
    textarea.value = newValue
    form.value.content = newValue
    validateField('content')

    nextTick(() => {
      const area = markdownTextarea.value
      if (!area) return

      let selectionStart = beforeText.length + snippet.length
      let selectionEnd = selectionStart
      const hasPlaceholder = placeholder && placeholder.length > 0

      if (hasPlaceholder) {
        const searchStart = beforeText.length
        const index = newValue.indexOf(placeholder, searchStart)
        if (index !== -1) {
          selectionStart = index
          selectionEnd = index + placeholder.length
        }
      }

      if (!hasPlaceholder && typeof caretOffset === 'number') {
        selectionStart = beforeText.length + caretOffset
        selectionEnd = selectionStart
      }

      area.setSelectionRange(selectionStart, selectionEnd)
      area.focus()

      if (scrollSyncEnabled.value && previewMode.value !== 'edit') {
        syncScroll('editor')
      }
    })
  }

  const wrapInline = (prefix, suffix, placeholderText) => {
    const placeholder = selectedText || placeholderText
    const snippet = `${prefix}${placeholder}${suffix}`
    applyInsertion(snippet, placeholder)
  }

  switch (type) {
    case 'bold':
      wrapInline('**', '**', 'texto en negrita')
      break
    case 'italic':
      wrapInline('*', '*', 'texto en cursiva')
      break
    case 'strikethrough':
      wrapInline('~~', '~~', 'texto tachado')
      break
    case 'code':
      wrapInline('`', '`', 'código')
      break
    case 'h1': {
      const placeholder = selectedText || 'Título principal'
      const snippet = `${ensureNewLineBefore()}# ${placeholder}\n\n`
      applyInsertion(snippet, placeholder)
      break
    }
    case 'h2': {
      const placeholder = selectedText || 'Título de sección'
      const snippet = `${ensureNewLineBefore()}## ${placeholder}\n\n`
      applyInsertion(snippet, placeholder)
      break
    }
    case 'h3': {
      const placeholder = selectedText || 'Subtítulo'
      const snippet = `${ensureNewLineBefore()}### ${placeholder}\n\n`
      applyInsertion(snippet, placeholder)
      break
    }
    case 'list': {
      const placeholder = selectedText || 'Elemento de lista'
      const snippet = `${ensureNewLineBefore()}- ${placeholder}\n`
      applyInsertion(snippet, placeholder)
      break
    }
    case 'orderedList': {
      const placeholder = selectedText || 'Elemento numerado'
      const snippet = `${ensureNewLineBefore()}1. ${placeholder}\n`
      applyInsertion(snippet, placeholder)
      break
    }
    case 'checkbox': {
      const placeholder = selectedText || 'Elemento pendiente'
      const snippet = `${ensureNewLineBefore()}- [ ] ${placeholder}\n`
      applyInsertion(snippet, placeholder)
      break
    }
    case 'quote': {
      const placeholder = selectedText || 'Texto de la cita'
      const snippet = `${ensureNewLineBefore()}> ${placeholder}\n`
      applyInsertion(snippet, placeholder)
      break
    }
    case 'link': {
      const url = prompt('Ingresa la URL del enlace:')
      if (!url) return
      const placeholder = selectedText || 'Texto del enlace'
      const snippet = `[${placeholder}](${url})`
      applyInsertion(snippet, placeholder)
      break
    }
    case 'image': {
      const imageUrl = prompt('Ingresa la URL de la imagen:')
      if (!imageUrl) return
      const altText = selectedText || 'Texto alternativo'
      const snippet = `![${altText}](${imageUrl})`
      applyInsertion(snippet, altText)
      break
    }
    case 'codeBlock': {
      const language = (prompt('Lenguaje del bloque de código (opcional):', 'javascript') || '').trim()
      const placeholder = selectedText || '// Escribe tu código aquí'
      const openingFence = '```' + language
      const closingFence = '```'
      const snippet = `${ensureNewLineBefore()}${openingFence}\n${placeholder}\n${closingFence}\n\n`
      applyInsertion(snippet, placeholder)
      break
    }
    case 'table': {
      const lines = [
        '| Columna 1 | Columna 2 | Columna 3 |',
        '|-----------|-----------|-----------|',
        '| Dato 1    | Dato 1    | Dato 1    |',
        '| Dato 2    | Dato 2    | Dato 2    |',
        ''
      ]
      const snippet = `${ensureNewLineBefore()}${lines.join('\n')}\n`
      applyInsertion(snippet, '')
      break
    }
    case 'horizontalRule': {
      const snippet = `${ensureNewLineBefore()}---\n\n`
      applyInsertion(snippet, '', snippet.length)
      break
    }
    case 'callout': {
      const typeInput = (prompt('Tipo de callout (TIP, INFO, WARNING, NOTE, IMPORTANT):', 'TIP') || 'TIP').toUpperCase()
      const allowedTypes = ['TIP', 'INFO', 'WARNING', 'NOTE', 'IMPORTANT', 'CAUTION']
      const calloutType = allowedTypes.includes(typeInput) ? typeInput : 'TIP'
      const titlePlaceholder = selectedText || 'Título del callout'
      const bodyPlaceholder = 'Añade más detalles aquí.'
      const snippet = `${ensureNewLineBefore()}> [!${calloutType}] ${titlePlaceholder}\n> ${bodyPlaceholder}\n\n`
      applyInsertion(snippet, titlePlaceholder)
      break
    }
    default:
      return
  }

  if (previewMode.value === 'preview') {
    setPreviewMode('split')
  }
}

const handleMarkdownShortcut = (event) => {
  const isCtrlCmd = event.ctrlKey || event.metaKey

  if (event.key === 'Tab' && !event.altKey) {
    event.preventDefault()
    const area = markdownTextarea.value
    if (!area) return
    const value = area.value
    const startPos = area.selectionStart
    const endPos = area.selectionEnd
    const indent = '  '
    area.value = value.slice(0, startPos) + indent + value.slice(endPos)
    area.selectionStart = area.selectionEnd = startPos + indent.length
    form.value.content = area.value
    validateField('content')
    nextTick(() => {
      if (scrollSyncEnabled.value && previewMode.value !== 'edit') {
        syncScroll('editor')
      }
    })
    return
  }

  if (!isCtrlCmd) {
    return
  }

  const key = event.key.toLowerCase()

  if (!event.shiftKey && !event.altKey) {
    switch (key) {
      case 'b':
        event.preventDefault()
        insertMarkdown('bold')
        break
      case 'i':
        event.preventDefault()
        insertMarkdown('italic')
        break
      case 'k':
        event.preventDefault()
        insertMarkdown('link')
        break
      default:
        break
    }
    return
  }

  if (event.shiftKey) {
    switch (key) {
      case 'c':
        event.preventDefault()
        insertMarkdown('codeBlock')
        break
      case 'l':
        event.preventDefault()
        insertMarkdown('list')
        break
      case 'o':
        event.preventDefault()
        insertMarkdown('orderedList')
        break
      case 'x':
        event.preventDefault()
        insertMarkdown('strikethrough')
        break
      case 'm':
        event.preventDefault()
        insertMarkdown('callout')
        break
      default:
        break
    }
  }
}

// Funciones auxiliares para URL y PDF
const getUrlTitle = (url) => {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return 'Enlace'
  }
}

const getUrlDomain = (url) => {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return url
  }
}

const getPdfTitle = (url) => {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const filename = pathname.split('/').pop()
    return filename || 'Documento PDF'
  } catch {
    return 'Documento PDF'
  }
}

const handlePdfError = () => {
  console.warn('⚠️ [PDF] Error cargando PDF:', form.value.content)
}

// PDF File Upload Functions
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file && validatePdfFile(file)) {
    isReplacingPdf.value = true
    pdfPreviewError.value = ''
    if (pdfPreviewUrl.value) {
      URL.revokeObjectURL(pdfPreviewUrl.value)
    }
    pdfPreviewUrl.value = URL.createObjectURL(file)
  }
}

const validatePdfFile = (file) => {
  // Limpiar errores previos
  validationErrors.value.content = null

  // Validar tipo de archivo
  if (file.type !== 'application/pdf') {
    validationErrors.value.content = 'Solo se permiten archivos PDF'
    return false
  }

  // Validar tamaño (10MB máximo)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    validationErrors.value.content = 'El archivo PDF no puede ser mayor a 10MB'
    return false
  }

  // Archivo válido
  pdfFile.value = file
  form.value.content = file.name // Usar el nombre del archivo como referencia temporal

  // Validar el campo content después de asignar el archivo
  validateField('content')

  console.log('✅ [PDF UPLOAD] Archivo PDF válido:', file.name, formatFileSize(file.size))
  return true
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const removeFile = () => {
  pdfFile.value = null
  pdfPreviewError.value = ''
  if (pdfPreviewUrl.value) {
    URL.revokeObjectURL(pdfPreviewUrl.value)
    pdfPreviewUrl.value = null
  }
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const openFileDialog = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const previewPdf = () => {
  if (pdfFile.value) {
    if (pdfPreviewUrl.value) {
      URL.revokeObjectURL(pdfPreviewUrl.value)
    }
    pdfPreviewUrl.value = URL.createObjectURL(pdfFile.value)

    // Abrir en nueva ventana
    window.open(pdfPreviewUrl.value, '_blank')
  }
}

const uploadPdfFile = async (documentId, file) => {
  try {
    console.log('📄 [PDF UPLOAD] Subiendo archivo PDF:', file.name, 'para documento:', documentId)

    const formData = new FormData()
    formData.append('file', file)

    // Agregar metadatos del documento
    formData.append('name', form.value.name)
    formData.append('type', 'TYPE_PDF')
    formData.append('slug', form.value.slug)
    formData.append('status', 'true')
    formData.append('icon', form.value.icon || 'mdi-file-pdf-box')

    // Enviar roles como array individual, no como JSON string
    form.value.roles.forEach(role => {
      formData.append('roles', role)
    })

    await documentService.uploadDocumentFile(documentId, formData)
    console.log('✅ [PDF UPLOAD] Archivo PDF subido exitosamente')
  } catch (error) {
    console.error('❌ [PDF UPLOAD] Error subiendo archivo PDF:', error)
    throw error
  }
}

const resetForm = () => {
  console.log('📄 [CONTENT FORM] Reseteando formulario...')
  form.value = {
    name: '',
    type: '',
    slug: '',
    content: '',
    icon: '',
    roles: []
  }
  validationErrors.value = {}
  currentWizardStep.value = 1
  pdfFile.value = null
  pdfPreviewUrl.value = null
  originalPdfUrl.value = ''
  originalPdfName.value = ''
  isReplacingPdf.value = false
  showMarkdownHelp.value = false
  showColorPalette.value = false
  scrollSyncEnabled.value = true
  editViewMode.value = 'visual'
  visualContent.value = ''
  nextTick(() => {
    if (visualEditorRef.value) {
      visualEditorRef.value.innerHTML = ''
    }
  })
  previewMode.value = getDefaultPreviewMode()
  copyStatus.value = ''
  isFullscreen.value = false
  if (copyStatusTimeout) {
    clearTimeout(copyStatusTimeout)
    copyStatusTimeout = null
  }
  console.log('✅ [CONTENT FORM] Formulario reseteado')
}

const loadDocumentData = () => {
  console.log('📄 [CONTENT FORM] loadDocumentData ejecutado, props.document:', props.document)
  if (props.document) {
    console.log('📄 [CONTENT FORM] Documento cargado para edición:', props.document?.name || 'Sin nombre')
    console.log('📄 [CONTENT FORM] Roles del documento:', props.document.roles)

    const currentContent = props.document.content || ''

    if (props.document.type === 'TYPE_PDF') {
      originalPdfUrl.value = currentContent
      originalPdfName.value =
        props.document.originalFileName ||
        props.document.fileName ||
        getPdfTitle(currentContent) ||
        'Documento PDF'
      isReplacingPdf.value = false
      pdfFile.value = null
    } else {
      originalPdfUrl.value = ''
      originalPdfName.value = ''
      isReplacingPdf.value = false
      pdfFile.value = null
    }

    // Procesar roles para asegurar que sea un array y manejar diferentes formatos
    let cleanRoles = []

    if (props.document.roles) {
      if (typeof props.document.roles === 'string') {
        // Si roles es un string, convertir a array
        if (props.document.roles.includes(',')) {
          cleanRoles = props.document.roles.split(',').map(role => role.trim())
        } else {
          cleanRoles = [props.document.roles]
        }
      } else if (Array.isArray(props.document.roles)) {
        cleanRoles = [...props.document.roles]
      }

      // Limpiar prefijos ROLE_ si existen
      cleanRoles = cleanRoles.map(role => {
        if (typeof role === 'string' && role.startsWith('ROLE_')) {
          return role.substring(5) // Remover 'ROLE_' (5 caracteres)
        }
        return role
      })
    }

    console.log('📄 [CONTENT FORM] Roles procesados:', cleanRoles)

    form.value = {
      name: props.document.name || '',
      type: props.document.type || '',
      slug: '', // Se genera automáticamente en edición
      content: currentContent,
      icon: props.document.icon || '',
      roles: cleanRoles
    }

    showMarkdownHelp.value = false
    scrollSyncEnabled.value = true
    copyStatus.value = ''
    const defaultMode = getDefaultPreviewMode()
    previewMode.value = props.document.type === 'TYPE_TEXT' && defaultMode !== 'edit'
      ? 'split'
      : defaultMode
    showColorPalette.value = false
    setEditViewMode('visual')

    pdfPreviewUrl.value = null

    // Resetear el paso del wizard
    currentWizardStep.value = isEditing.value ? desiredStartStep.value : 1
  } else {
    resetForm()
  }
}

const handleSubmit = async () => {
  console.log('📄 [CONTENT FORM] Enviando formulario...')

  validateForm()

  if (Object.keys(validationErrors.value).length > 0) {
    console.log('❌ [CONTENT FORM] Errores de validación:', validationErrors.value)
    return
  }

  isSaving.value = true

  let documentData = null

  try {
    documentData = {
      name: form.value.name.trim(),
      type: form.value.type,
      slug: generateSlug(form.value.name, true) || '',
      status: true, // Campo requerido por el backend
      content: form.value.content.trim(),
      icon: form.value.icon || (form.value.type === 'TYPE_TEXT' ? 'mdi-file-document' :
                                form.value.type === 'TYPE_URL' ? 'mdi-link' :
                                form.value.type === 'TYPE_PDF' ? 'mdi-file-pdf-box' : 'mdi-file'),
      roles: form.value.roles.length > 0 ? form.value.roles : []
    }

    // Validaciones adicionales antes de enviar
    if (!documentData.name) {
      throw new Error('El nombre del documento es obligatorio')
    }

    if (!documentData.type) {
      throw new Error('El tipo de documento es obligatorio')
    }

    if (!documentData.content) {
      throw new Error('El contenido del documento es obligatorio')
    }

    if (!documentData.roles || documentData.roles.length === 0) {
      throw new Error('Debe seleccionar al menos un rol de acceso')
    }

    // Validar URL si es tipo URL (PDF ahora maneja archivos)
    if (documentData.type === 'TYPE_URL' && !isValidUrl(documentData.content)) {
      throw new Error('La URL proporcionada no es válida')
    }

    // Validar archivo PDF si es tipo PDF
    if (documentData.type === 'TYPE_PDF' && !pdfFile.value) {
      throw new Error('Debe seleccionar un archivo PDF')
    }

    // Validación adicional para PDFs
    if (documentData.type === 'TYPE_PDF') {
      console.log('🔍 [CONTENT FORM] Validación PDF - pdfFile.value:', pdfFile.value)
      console.log('🔍 [CONTENT FORM] Validación PDF - originalPdfUrl:', originalPdfUrl.value)

      if (pdfFile.value) {
      console.log('🔍 [CONTENT FORM] Validación PDF - pdfFile.name:', pdfFile.value?.name)
      console.log('🔍 [CONTENT FORM] Validación PDF - pdfFile.size:', pdfFile.value?.size)

      if (!pdfFile.value.name) {
        throw new Error('El archivo PDF seleccionado no es válido')
        }
      } else if (!hasOriginalPdf.value) {
        throw new Error('Debe seleccionar un archivo PDF válido')
      } else {
        documentData.content = originalPdfUrl.value
      }
    }

    console.log('📄 [CONTENT FORM] Datos del documento:', documentData)
    console.log('📄 [CONTENT FORM] Roles específicos:', documentData.roles)
    console.log('📄 [CONTENT FORM] Tipo de roles:', typeof documentData.roles)
    console.log('📄 [CONTENT FORM] Es array:', Array.isArray(documentData.roles))
    console.log('📄 [CONTENT FORM] Longitud:', documentData.roles?.length)
    console.log('📄 [CONTENT FORM] Roles del formulario:', form.value.roles)
    console.log('📄 [CONTENT FORM] Roles disponibles:', availableRolesList.map(r => r.value))

    // Verificar que no hay prefijos ROLE_ duplicados
    const hasDuplicatePrefix = documentData.roles.some(role =>
      typeof role === 'string' && role.startsWith('ROLE_ROLE_')
    )
    console.log('📄 [CONTENT FORM] ¿Tiene prefijos duplicados?', hasDuplicatePrefix)

    if (hasDuplicatePrefix) {
      console.warn('⚠️ [CONTENT FORM] Detectados roles con prefijo ROLE_ duplicado:', documentData.roles)
    }

    // Agregar el ID al documentData para el emit
    const documentDataWithId = {
      ...documentData,
      id: isEditing.value ? props.document.id : undefined
    }

    let createdDocumentId = null

    if (isEditing.value) {
      console.log('📄 [CONTENT FORM] Actualizando documento existente...')
      await documentService.updateDocument(props.document.id, documentData)
      console.log('✅ [CONTENT FORM] Documento actualizado exitosamente')
    } else {
      // Para documentos PDF, usar el endpoint específico de creación con archivo
      console.log('🔍 [CONTENT FORM] Debug - Tipo:', documentData.type)
      console.log('🔍 [CONTENT FORM] Debug - pdfFile.value:', pdfFile.value)
      console.log('🔍 [CONTENT FORM] Debug - Condición PDF:', documentData.type === 'TYPE_PDF' && pdfFile.value)

      if (documentData.type === 'TYPE_PDF' && pdfFile.value) {
        console.log('📄 [CONTENT FORM] Creando documento PDF con archivo...')
        const createdDocument = await documentService.createDocumentWithFile(documentData, pdfFile.value)
        console.log('✅ [CONTENT FORM] Documento PDF creado exitosamente')
        createdDocumentId = createdDocument.id
        documentDataWithId.id = createdDocumentId
      } else {
        console.log('📄 [CONTENT FORM] Creando nuevo documento...')
        const createdDocument = await documentService.createDocument(documentData)
        console.log('✅ [CONTENT FORM] Documento creado exitosamente')
        createdDocumentId = createdDocument.id
        documentDataWithId.id = createdDocumentId
      }
    }

    // Si es un PDF con archivo y estamos editando, subir el archivo
    if (isEditing.value && documentData.type === 'TYPE_PDF' && pdfFile.value) {
      console.log('📄 [CONTENT FORM] Subiendo archivo PDF...')
      const documentId = props.document.id
      await uploadPdfFile(documentId, pdfFile.value)
      console.log('✅ [CONTENT FORM] Archivo PDF subido exitosamente')
    }

    console.log('📄 [CONTENT FORM] Emitiendo evento saved con ID:', documentDataWithId.id)
    console.log('📄 [CONTENT FORM] Documento completo:', documentDataWithId)

    emit('saved', documentDataWithId)
    handleClose()

  } catch (error) {
    console.error('❌ [CONTENT FORM] Error guardando documento:', error)
    console.error('❌ [CONTENT FORM] Status:', error.response?.status)
    console.error('❌ [CONTENT FORM] Response data:', error.response?.data)

    if (documentData) {
      console.error('❌ [CONTENT FORM] Request data:', documentData)
    } else {
      console.error('❌ [CONTENT FORM] Request data: No disponible (error en validación)')
    }

    // Manejar error específico de slug duplicado
    if (error.response?.status === 422 && error.response?.data?.detail?.includes('slug') && error.response?.data?.detail?.includes('ya existe')) {
      console.log('🔄 [CONTENT FORM] Slug duplicado detectado, regenerando automáticamente...')

      // Regenerar slug único
      const newSlug = generateSlug(form.value.name, true)
      form.value.slug = newSlug
      validateField('slug')

      console.log('📝 [CONTENT FORM] Nuevo slug generado:', newSlug)

      // Mostrar mensaje al usuario
      console.log('ℹ️ [CONTENT FORM] Slug regenerado automáticamente para evitar duplicados')

      // Intentar guardar nuevamente con el nuevo slug
      try {
        const newDocumentData = {
          ...documentData,
          slug: newSlug
        }

        let createdDocumentId = null

        if (isEditing.value) {
          await documentService.updateDocument(props.document.id, newDocumentData)
        } else {
          // Para documentos PDF, usar el endpoint específico de creación con archivo
          if (newDocumentData.type === 'TYPE_PDF' && pdfFile.value) {
            console.log('📄 [CONTENT FORM] Reintentando creación de documento PDF con archivo...')
            const createdDocument = await documentService.createDocumentWithFile(newDocumentData, pdfFile.value)
            createdDocumentId = createdDocument.id
          } else {
            const createdDocument = await documentService.createDocument(newDocumentData)
            createdDocumentId = createdDocument.id
          }
        }

        console.log('✅ [CONTENT FORM] Documento guardado exitosamente con slug único')

        // Agregar el ID al newDocumentData para el emit
        const newDocumentDataWithId = {
          ...newDocumentData,
          id: isEditing.value ? props.document.id : createdDocumentId
        }

        console.log('📄 [CONTENT FORM] Emitiendo evento saved con ID (slug único):', newDocumentDataWithId.id)
        console.log('📄 [CONTENT FORM] Documento completo (slug único):', newDocumentDataWithId)

        emit('saved', newDocumentDataWithId)
        handleClose()
        return

      } catch (retryError) {
        console.error('❌ [CONTENT FORM] Error en reintento:', retryError)
        // Continuar con el manejo de errores normal
      }
    }

    // Mostrar error específico según el código de estado
    if (error.response?.status === 422) {
      console.error('❌ [CONTENT FORM] Error 422: Datos no válidos')
      console.error('❌ [CONTENT FORM] Detalles del error:', error.response?.data)

      // Si hay errores de validación específicos, mostrarlos
      if (error.response?.data?.errors) {
        console.error('❌ [CONTENT FORM] Errores de validación:', error.response.data.errors)
      }

      // Mostrar mensaje más específico
      if (error.response?.data?.message) {
        console.error('❌ [CONTENT FORM] Mensaje del servidor:', error.response.data.message)
      }

      // Mostrar campos específicos que fallaron
      if (error.response?.data?.validation) {
        console.error('❌ [CONTENT FORM] Validación fallida:', error.response.data.validation)
      }

    } else if (error.response?.status === 400) {
      console.error('❌ [CONTENT FORM] Error 400: Solicitud incorrecta')
    } else if (error.response?.status === 401) {
      console.error('❌ [CONTENT FORM] Error 401: No autorizado')
    } else if (error.response?.status === 500) {
      console.error('❌ [CONTENT FORM] Error 500: Error interno del servidor')
    } else if (error.message) {
      console.error('❌ [CONTENT FORM] Error de validación:', error.message)
    }

    // Aquí podrías mostrar un mensaje de error al usuario
  } finally {
    isSaving.value = false
  }
}

const handleClose = () => {
  console.log('📄 [CONTENT FORM] Cerrando formulario...')
  console.log('📄 [CONTENT FORM] Estado de edición:', isEditing.value)

  resetForm()
  emit('close')

  console.log('📄 [CONTENT FORM] Formulario cerrado')
}

// Watchers
watch(() => props.document, loadDocumentData, { immediate: true })
watch(() => props.modelValue, (newValue) => {
  console.log('📄 [CONTENT FORM] props.modelValue cambió a:', newValue)
  if (newValue) {
    console.log('📄 [CONTENT FORM] Cargando datos del documento...')
    loadDocumentData()
    currentWizardStep.value = isEditing.value ? desiredStartStep.value : 1
    nextTick(() => {
      if (previewMode.value !== 'preview') {
        focusEditor()
      }
    })
  } else {
    resetForm()
  }
})

watch(isFullscreen, (value) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = value ? 'hidden' : ''
})

watch(() => form.value.content, () => {
  if (scrollSyncEnabled.value && previewMode.value === 'split') {
    nextTick(() => syncScroll('editor'))
  }
})

onMounted(() => {
  previewMode.value = getDefaultPreviewMode()
  if (editViewMode.value === 'visual') {
    syncVisualFromMarkdown()
  }
})

onBeforeUnmount(() => {
  if (copyStatusTimeout) {
    clearTimeout(copyStatusTimeout)
  }
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})

// Watcher para generar slug automáticamente cuando cambie el nombre
watch(() => form.value.name, (newName) => {
  if (newName && !form.value.slug) {
    form.value.slug = generateSlug(newName)
    validateField('slug')
  }
})

// Función para regenerar slug manualmente
const regenerateSlug = () => {
  if (form.value.name) {
    form.value.slug = generateSlug(form.value.name, true) // Hacer único por defecto
    validateField('slug')
    generateSlugAlternatives()
  }
}

// Función para generar opciones de slug alternativas
const generateSlugAlternatives = () => {
  if (!form.value.name) return

  const baseSlug = form.value.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  const alternatives = []

  // Generar diferentes variaciones
  alternatives.push(`${baseSlug}-${Date.now()}`)
  alternatives.push(`${baseSlug}-${Math.floor(Math.random() * 10000)}`)
  alternatives.push(`${baseSlug}-v2`)
  alternatives.push(`${baseSlug}-nuevo`)
  alternatives.push(`${baseSlug}-${new Date().getFullYear()}`)

  slugAlternatives.value = alternatives.slice(0, 3) // Mostrar solo 3 opciones
}

// Función para seleccionar una opción de slug alternativa
const selectSlugAlternative = (alternative) => {
  form.value.slug = alternative
  validateField('slug')
  slugAlternatives.value = [] // Limpiar opciones después de seleccionar
}

const goToStep = (step) => {
  if (step < 1 || step > wizardSteps.value.length) {
    return
  }

  if (isEditing.value) {
    currentWizardStep.value = step
    return
  }

  if (step <= currentWizardStep.value) {
    currentWizardStep.value = step
    return
  }

  if (step === currentWizardStep.value + 1 && canProceedToNextStep.value) {
    currentWizardStep.value = step
  }
}

const startPdfReplacement = () => {
  isReplacingPdf.value = true
  pdfPreviewError.value = ''
  pdfFile.value = null
  if (pdfPreviewUrl.value) {
    URL.revokeObjectURL(pdfPreviewUrl.value)
    pdfPreviewUrl.value = null
  }
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  form.value.content = ''
}

const ensureAbsoluteUrl = (url) => {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith('/')) {
    return `${window.location.origin}${url}`
  }
  return `${window.location.origin}/${url}`
}

const openOriginalPdf = async () => {
  if (!originalPdfUrl.value) {
    return
  }

  pdfPreviewError.value = ''
  pdfPreviewLoading.value = true

  try {
    let blobUrl = originalPdfUrl.value

    if (props.document?.id) {
      blobUrl = await documentService.getDocumentFileUrl(props.document.id)
    } else {
      blobUrl = ensureAbsoluteUrl(originalPdfUrl.value)
    }

    const newWindow = window.open(blobUrl, '_blank', 'noopener,noreferrer')

    if (!newWindow) {
      console.warn('El navegador bloqueó la ventana emergente para el PDF. Debe habilitarla manualmente si desea abrirlo en una nueva pestaña.')
      pdfPreviewError.value = ''
      return
    }

    newWindow.opener = null
    pdfPreviewError.value = ''

    if (blobUrl.startsWith('blob:')) {
      setTimeout(() => {
        try {
          URL.revokeObjectURL(blobUrl)
        } catch {
          /* noop */
        }
      }, 60000)
    }
  } catch (error) {
    pdfPreviewError.value = error.message || 'No se pudo abrir el PDF.'
  } finally {
    pdfPreviewLoading.value = false
  }
}


</script>

<style scoped>
.markdown-toolbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  width: 32px;
  border-radius: 0.5rem;
  border: 1px solid rgba(148, 163, 184, 0.6);
  background-color: rgba(255, 255, 255, 0.95);
  color: #1e293b;
  font-size: 0.75rem;
  transition: all 0.2s ease;
}

.markdown-toolbar-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  background-color: rgba(59, 130, 246, 0.08);
  color: #1d4ed8;
}

.markdown-toolbar-btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.markdown-toolbar-btn i,
.markdown-toolbar-btn span {
  pointer-events: none;
}

.markdown-toolbar-separator {
  width: 1px;
  height: 24px;
  background-color: rgba(148, 163, 184, 0.4);
  margin: 0 4px;
}

.color-palette-popover {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  z-index: 30;
  min-width: 220px;
  border-radius: 0.75rem;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background-color: rgba(255, 255, 255, 0.98);
  box-shadow: 0 18px 36px -18px rgba(15, 23, 42, 0.45);
  padding: 0.75rem;
}

.color-palette-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background-color: rgba(255, 255, 255, 0.95);
  color: #475569;
  font-size: 0.65rem;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: rgba(59, 130, 246, 0.12);
  color: #1d4ed8;
}

.color-palette-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.35rem;
}

.color-swatch {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.5rem;
  border-radius: 0.65rem;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background-color: rgba(248, 250, 252, 0.95);
  font-size: 0.7rem;
  font-weight: 600;
  color: #334155;
  transition: all 0.2s ease;
}

.color-swatch:hover {
  transform: translateY(-1px);
  border-color: rgba(59, 130, 246, 0.35);
  box-shadow: 0 8px 18px -12px rgba(30, 64, 175, 0.4);
}

.swatch-preview {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 2px solid rgba(15, 23, 42, 0.12);
  flex-shrink: 0;
  background-color: currentColor;
}

.swatch-label {
  flex: 1;
  text-align: left;
}

.wysiwyg-editor {
  min-height: 280px;
  width: 100%;
  padding: 1rem;
  border: 0;
  border-radius: 0.75rem;
  background-color: rgba(255, 255, 255, 0.96);
  color: #0f172a;
  font-size: 0.95rem;
  line-height: 1.6;
  outline: none;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
  transition: box-shadow 0.2s ease;
  direction: ltr;
  text-align: left;
}

.wysiwyg-editor:focus {
  box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.45);
}

.wysiwyg-editor-error {
  box-shadow: inset 0 0 0 2px rgba(248, 113, 113, 0.45);
}

.wysiwyg-editor:empty:before {
  content: attr(data-placeholder);
  color: #94a3b8;
  font-style: italic;
}

:global(.dark) .markdown-toolbar-btn {
  background-color: rgba(15, 23, 42, 0.9);
  border-color: rgba(71, 85, 105, 0.75);
  color: rgba(226, 232, 240, 0.9);
}

:global(.dark) .markdown-toolbar-btn:hover:not(:disabled) {
  background-color: rgba(30, 64, 175, 0.3);
  color: #38bdf8;
}

:global(.dark) .markdown-toolbar-separator {
  background-color: rgba(71, 85, 105, 0.65);
}

:global(.dark) .color-palette-popover {
  border-color: rgba(71, 85, 105, 0.6);
  background-color: rgba(15, 23, 42, 0.94);
  box-shadow: 0 18px 42px -22px rgba(15, 118, 110, 0.6);
}

:global(.dark) .color-palette-header {
  color: rgba(226, 232, 240, 0.95);
}

:global(.dark) .close-btn {
  border-color: rgba(71, 85, 105, 0.65);
  background-color: rgba(15, 23, 42, 0.85);
  color: rgba(226, 232, 240, 0.8);
}

:global(.dark) .close-btn:hover {
  background-color: rgba(30, 64, 175, 0.35);
  color: #bae6fd;
}

:global(.dark) .color-swatch {
  border-color: rgba(71, 85, 105, 0.55);
  background-color: rgba(30, 41, 59, 0.92);
  color: rgba(226, 232, 240, 0.85);
}

:global(.dark) .color-swatch:hover {
  border-color: rgba(56, 189, 248, 0.45);
}

:global(.dark) .wysiwyg-editor {
  background-color: rgba(15, 23, 42, 0.94);
  color: #e2e8f0;
}

:global(.dark) .wysiwyg-editor:focus {
  box-shadow: inset 0 0 0 2px rgba(56, 189, 248, 0.35);
}

:global(.dark) .wysiwyg-editor-error {
  box-shadow: inset 0 0 0 2px rgba(248, 113, 113, 0.55);
}

:global(.dark) .wysiwyg-editor:empty:before {
  color: rgba(148, 163, 184, 0.7);
}

.markdown-editor-container {
  background: linear-gradient(135deg, rgba(241, 245, 249, 0.85), rgba(255, 255, 255, 0.92));
  backdrop-filter: blur(8px);
}

:global(.dark) .markdown-editor-container {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.88));
}

.markdown-editor-pane {
  background-color: rgba(255, 255, 255, 0.95);
}

:global(.dark) .markdown-editor-pane {
  background-color: rgba(15, 23, 42, 0.95);
}

.markdown-preview-pane {
  border-top: 1px solid rgba(148, 163, 184, 0.25);
}

@media (min-width: 768px) {
  .markdown-preview-pane {
    border-top: none;
  }
}

:deep(.markdown-preview pre) {
  background-color: #0f172a;
  color: #e2e8f0;
  border-radius: 0.875rem;
  padding: 1.1rem 1.2rem;
  border: 1px solid rgba(148, 163, 184, 0.25);
  overflow-x: auto;
  font-size: 0.9rem;
}

:global(.dark) :deep(.markdown-preview pre) {
  background-color: rgba(15, 23, 42, 0.9);
  border-color: rgba(59, 130, 246, 0.35);
}

:deep(.markdown-preview code:not(pre code)) {
  background-color: rgba(59, 130, 246, 0.12);
  color: #0f172a;
  padding: 0.15rem 0.45rem;
  border-radius: 0.5rem;
  font-size: 0.85em;
  border: 1px solid rgba(59, 130, 246, 0.18);
}

:global(.dark) :deep(.markdown-preview code:not(pre code)) {
  background-color: rgba(59, 130, 246, 0.22);
  color: #e0f2fe;
  border-color: rgba(59, 130, 246, 0.3);
}

:deep(.markdown-preview a) {
  color: #1d4ed8;
  font-weight: 600;
  text-decoration: none;
  border-bottom: 1px solid rgba(29, 78, 216, 0.35);
}

:deep(.markdown-preview a:hover) {
  color: #2563eb;
  border-bottom-color: rgba(37, 99, 235, 0.7);
}

:global(.dark) :deep(.markdown-preview a) {
  color: #38bdf8;
  border-bottom-color: rgba(56, 189, 248, 0.45);
}

:deep(.markdown-preview blockquote) {
  border-left: 4px solid rgba(59, 130, 246, 0.6);
  background-color: rgba(59, 130, 246, 0.1);
  padding: 0.75rem 1.2rem;
  border-radius: 0.75rem;
  margin: 1.2rem 0;
  color: #1e293b;
  font-style: italic;
}

:global(.dark) :deep(.markdown-preview blockquote) {
  border-left-color: rgba(56, 189, 248, 0.65);
  background-color: rgba(56, 189, 248, 0.12);
  color: #cbd5f5;
}

:deep(.markdown-preview table) {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.25rem;
  font-size: 0.95rem;
}

:deep(.markdown-preview th),
:deep(.markdown-preview td) {
  border: 1px solid rgba(148, 163, 184, 0.35);
  padding: 0.6rem 0.8rem;
  text-align: left;
}

:deep(.markdown-preview thead) {
  background-color: rgba(59, 130, 246, 0.08);
  font-weight: 700;
}

:global(.dark) :deep(.markdown-preview thead) {
  background-color: rgba(30, 64, 175, 0.35);
}

:deep(.markdown-empty-state) {
  display: grid;
  place-items: center;
  text-align: center;
  gap: 0.75rem;
  padding: 3rem 1.5rem;
  color: #334155;
  background: radial-gradient(circle at top, rgba(59, 130, 246, 0.12), rgba(59, 130, 246, 0));
  border-radius: 0.75rem;
  border: 1px dashed rgba(148, 163, 184, 0.4);
}

:global(.dark) :deep(.markdown-empty-state) {
  color: #cbd5f5;
  border-color: rgba(148, 163, 184, 0.3);
  background: radial-gradient(circle at top, rgba(59, 130, 246, 0.18), rgba(15, 23, 42, 0.05));
}

:deep(.markdown-empty-state .hint) {
  font-size: 0.85rem;
  color: #64748b;
}

:global(.dark) :deep(.markdown-empty-state .hint) {
  color: rgba(148, 163, 184, 0.8);
}

:deep(.markdown-error-state) {
  border-radius: 0.75rem;
  padding: 1.5rem;
  background-color: rgba(248, 113, 113, 0.12);
  border: 1px solid rgba(248, 113, 113, 0.35);
  color: #b91c1c;
}

:global(.dark) :deep(.markdown-error-state) {
  background-color: rgba(248, 113, 113, 0.2);
  border-color: rgba(248, 113, 113, 0.35);
  color: #fca5a5;
}

:deep(.md-color-sky) {
  color: #0ea5e9;
}

:deep(.md-color-blue) {
  color: #2563eb;
}

:deep(.md-color-emerald) {
  color: #059669;
}

:deep(.md-color-lime) {
  color: #65a30d;
}

:deep(.md-color-amber) {
  color: #d97706;
}

:deep(.md-color-orange) {
  color: #ea580c;
}

:deep(.md-color-rose) {
  color: #e11d48;
}

:deep(.md-color-pink) {
  color: #db2777;
}

:deep(.md-color-purple) {
  color: #7c3aed;
}

:deep(.md-color-slate) {
  color: #475569;
}

.markdown-help-enter-active,
.markdown-help-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.markdown-help-enter-from,
.markdown-help-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
