<template>
  <div v-if="dialog" class="fixed inset-0 z-[1000] grid place-items-center bg-black/60 p-4 sm:p-6" @click="handleClose">
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
            class="flex items-center gap-3"
            :class="{
              'opacity-100': currentWizardStep === index + 1 || currentWizardStep > index + 1,
              'opacity-50': currentWizardStep < index + 1
            }"
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
                <div class="flex items-center justify-between gap-4 border-b-2 border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800">
                  <div class="flex items-center gap-1">
                    <button
                      type="button"
                      class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition"
                      :class="activeTab === 'edit' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-200 dark:text-slate-100 dark:hover:bg-slate-700'"
                      @click="activeTab = 'edit'"
                    >
                      <i class="fas fa-pencil"></i>
                      Editar
                    </button>
                    <button
                      type="button"
                      class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition"
                      :class="activeTab === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-200 dark:text-slate-100 dark:hover:bg-slate-700'"
                      @click="activeTab = 'preview'"
                    >
                      <i class="fas fa-eye"></i>
                      Vista Previa
                    </button>
                  </div>
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                    @click="toggleFullscreen"
                    :title="isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'"
                  >
                    <i :class="isFullscreen ? 'fas fa-compress' : 'fas fa-fullscreen'"></i>
                  </button>
                </div>

                <!-- Toolbar de Markdown -->
                <div v-if="activeTab === 'edit'" class="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800">
                  <div class="flex items-center gap-1">
                    <button type="button" @click="insertMarkdown('bold')" class="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" title="Negrita"><i class="fas fa-bold"></i></button>
                    <button type="button" @click="insertMarkdown('italic')" class="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" title="Cursiva"><i class="fas fa-italic"></i></button>
                    <button type="button" @click="insertMarkdown('strikethrough')" class="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" title="Tachado"><i class="fas fa-strikethrough"></i></button>
                  </div>
                  <div class="h-6 w-px bg-slate-300 dark:bg-slate-600"></div>
                  <div class="flex items-center gap-1">
                    <button type="button" @click="insertMarkdown('h1')" class="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" title="Título 1"><i class="fas fa-heading"></i></button>
                    <button type="button" @click="insertMarkdown('h2')" class="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" title="Título 2"><i class="fas fa-heading"></i></button>
                    <button type="button" @click="insertMarkdown('h3')" class="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" title="Título 3"><i class="fas fa-heading"></i></button>
                  </div>
                  <div class="h-6 w-px bg-slate-300 dark:bg-slate-600"></div>
                  <div class="flex items-center gap-1">
                    <button type="button" @click="insertMarkdown('link')" class="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" title="Enlace"><i class="fas fa-link"></i></button>
                    <button type="button" @click="insertMarkdown('image')" class="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" title="Imagen"><i class="fas fa-image"></i></button>
                    <button type="button" @click="insertMarkdown('code')" class="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" title="Código"><i class="fas fa-code"></i></button>
                  </div>
                  <div class="h-6 w-px bg-slate-300 dark:bg-slate-600"></div>
                  <div class="flex items-center gap-1">
                    <button type="button" @click="insertMarkdown('list')" class="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" title="Lista"><i class="fas fa-list-ul"></i></button>
                    <button type="button" @click="insertMarkdown('orderedList')" class="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" title="Lista numerada"><i class="fas fa-list-ol"></i></button>
                    <button type="button" @click="insertMarkdown('quote')" class="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" title="Cita"><i class="fas fa-quote-right"></i></button>
                  </div>
                  <div class="h-6 w-px bg-slate-300 dark:bg-slate-600"></div>
                  <div class="flex items-center gap-1">
                    <button type="button" @click="insertMarkdown('table')" class="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" title="Tabla"><i class="fas fa-table"></i></button>
                    <button type="button" @click="insertMarkdown('horizontalRule')" class="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" title="Línea horizontal"><i class="fas fa-minus"></i></button>
                  </div>
                </div>

                <div class="overflow-hidden rounded-lg border-2 border-slate-300 dark:border-slate-700" :class="{ 'fixed inset-4 z-[9999]': isFullscreen }">
                  <textarea
                    v-if="activeTab === 'edit'"
                    id="documentContent"
                    v-model="form.content"
                    class="min-h-[300px] w-full resize-none border-0 px-4 py-3 text-sm font-mono outline-none disabled:opacity-50 dark:bg-slate-900 dark:text-slate-100"
                    :class="validationErrors.content ? 'text-red-600' : 'text-slate-900'"
                    placeholder="Escribe tu contenido en formato Markdown..."
                    @input="validateField('content')"
                    :disabled="isSaving"
                    required
                  ></textarea>
                  <div
                    v-else
                    class="min-h-[300px] overflow-auto px-4 py-3 text-sm text-slate-900 prose prose-slate max-w-none dark:prose-invert dark:text-slate-100 prose-headings:text-slate-900 dark:prose-headings:text-slate-100"
                    v-html="renderedMarkdown"
                  ></div>
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
                <div>
                  <label for="pdfFile" class="mb-2 flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                    <i class="fas fa-file-pdf text-blue-500"></i>
                    Archivo PDF
                    <span class="text-red-600">*</span>
                  </label>
                  <div class="relative rounded-lg border-2 border-dashed transition" :class="pdfFile ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-300 dark:border-slate-700'">
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
                        <p class="text-sm font-medium text-slate-700 dark:text-slate-300">Arrastra tu archivo PDF aquí o haz clic para seleccionar</p>
                        <span class="text-xs text-slate-500 dark:text-slate-400">Solo archivos PDF (máximo 10MB)</span>
                      </div>
                      <div v-else class="flex items-center justify-between gap-4 rounded-lg border-2 border-emerald-500 bg-emerald-50 p-4 dark:bg-emerald-900/20">
                        <div class="flex items-center gap-3">
                          <i class="fas fa-file-pdf text-2xl text-emerald-600 dark:text-emerald-400"></i>
                          <div>
                            <p class="m-0 text-sm font-medium text-slate-900 dark:text-slate-100">{{ pdfFile.name }}</p>
                            <p class="m-0 text-xs text-slate-600 dark:text-slate-300">{{ formatFileSize(pdfFile.size) }}</p>
                          </div>
                        </div>
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
                  <div v-if="validationErrors.pdfFile" class="mt-2 flex items-center gap-2 text-xs font-medium text-red-600">
                    <i class="fas fa-exclamation-circle"></i>
                    {{ validationErrors.pdfFile }}
                  </div>
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
                    <span class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ pdfFile ? pdfFile.name : 'No especificado' }}</span>
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
import { ref, computed, watch, nextTick } from 'vue'
import { marked } from 'marked'
import documentService from '@/services/documentService'
import IconSelector from '@/components/common/IconSelector.vue'

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

// Editor de Markdown
const activeTab = ref('edit')
const isFullscreen = ref(false)

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

// PDF File Upload
const pdfFile = ref(null)
const fileInput = ref(null)
const pdfPreviewUrl = ref(null)

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

// Computed
const isEditing = computed(() => !!props.document)

// Roles disponibles para el template
const availableRoles = computed(() => availableRolesList)

// Renderizar Markdown
const renderedMarkdown = computed(() => {
  console.log('📝 [MARKDOWN] Computed ejecutado, contenido:', form.value.content ? 'Sí' : 'No')

  if (!form.value.content || form.value.content.trim() === '') {
    console.log('📝 [MARKDOWN] No hay contenido para renderizar')
    return '<div class="markdown-empty"><p>No hay contenido para mostrar</p></div>'
  }

  try {
    console.log('📝 [MARKDOWN] Renderizando contenido:', form.value.content.substring(0, 100) + '...')

    // Configurar marked para renderizado seguro
    const options = {
      breaks: true,
      gfm: true,
      smartLists: true,
      smartypants: true,
      sanitize: false,
      silent: false
    }

    // Usar la API correcta de marked v16
    const result = marked(form.value.content, options)
    console.log('📝 [MARKDOWN] Resultado renderizado:', result.substring(0, 100) + '...')
    console.log('📝 [MARKDOWN] Longitud del resultado:', result.length)

    return result
  } catch (error) {
    console.error('❌ [MARKDOWN] Error renderizando Markdown:', error)
    console.error('❌ [MARKDOWN] Contenido que causó el error:', form.value.content)
    return '<div class="markdown-error"><p>❌ Error al renderizar el Markdown</p><pre>' + error.message + '</pre></div>'
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
        const step2Valid = !!pdfFile.value && !validationErrors.value.pdfFile
        console.log('📄 [CONTENT FORM] Validación paso 2 PDF:', step2Valid, 'pdfFile:', !!pdfFile.value)
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
}

// Funciones del editor de Markdown
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

// Funciones del toolbar de Markdown
const insertMarkdown = (type) => {
  const textarea = document.querySelector('.markdown-textarea')
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = textarea.value.substring(start, end)
  const beforeText = textarea.value.substring(0, start)
  const afterText = textarea.value.substring(end)

  let before = ''
  let after = ''
  let placeholder = ''

  switch (type) {
    case 'bold':
      before = '**'
      after = '**'
      placeholder = 'texto en negrita'
      break
    case 'italic':
      before = '*'
      after = '*'
      placeholder = 'texto en cursiva'
      break
    case 'strikethrough':
      before = '~~'
      after = '~~'
      placeholder = 'texto tachado'
      break
    case 'h1':
      before = '# '
      after = ''
      placeholder = 'Título 1'
      break
    case 'h2':
      before = '## '
      after = ''
      placeholder = 'Título 2'
      break
    case 'h3':
      before = '### '
      after = ''
      placeholder = 'Título 3'
      break
    case 'link':
      const url = prompt('Ingresa la URL del enlace:')
      if (url) {
        before = '['
        after = `](${url})`
        placeholder = 'texto del enlace'
      } else {
        return
      }
      break
    case 'image':
      const imageUrl = prompt('Ingresa la URL de la imagen:')
      if (imageUrl) {
        before = '!['
        after = `](${imageUrl})`
        placeholder = 'texto alternativo'
      } else {
        return
      }
      break
    case 'code':
      before = '`'
      after = '`'
      placeholder = 'código'
      break
    case 'list':
      before = '- '
      after = ''
      placeholder = 'elemento de lista'
      break
    case 'orderedList':
      before = '1. '
      after = ''
      placeholder = 'elemento de lista numerada'
      break
    case 'quote':
      before = '> '
      after = ''
      placeholder = 'texto de cita'
      break
    case 'table':
      const tableMarkdown = `| Columna 1 | Columna 2 | Columna 3 |
|-----------|-----------|-----------|
| Fila 1    | Fila 1    | Fila 1    |
| Fila 2    | Fila 2    | Fila 2    |`
      before = tableMarkdown + '\n\n'
      after = ''
      placeholder = ''
      break
    case 'horizontalRule':
      before = '---\n'
      after = ''
      placeholder = ''
      break
    default:
      return
  }

  // Si no hay texto seleccionado, usar placeholder
  const textToInsert = selectedText || placeholder

  const newText = beforeText + before + textToInsert + after + afterText
  textarea.value = newText

  // Restaurar la selección
  const newStart = start + before.length
  const newEnd = newStart + textToInsert.length
  textarea.setSelectionRange(newStart, newEnd)
  textarea.focus()

  // Actualizar el modelo
  form.value.content = textarea.value
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
  if (file) {
    validatePdfFile(file)
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
  form.value.content = file.name // Usar el nombre del archivo como contenido

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
  form.value.content = ''
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
  activeTab.value = 'edit'
  console.log('✅ [CONTENT FORM] Formulario reseteado')
}

const loadDocumentData = () => {
  console.log('📄 [CONTENT FORM] loadDocumentData ejecutado, props.document:', props.document)
  if (props.document) {
    console.log('📄 [CONTENT FORM] Documento cargado para edición:', props.document?.name || 'Sin nombre')
    console.log('📄 [CONTENT FORM] Roles del documento:', props.document.roles)

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
      content: props.document.content || '',
      icon: props.document.icon || '',
      roles: cleanRoles
    }

    // Resetear el paso del wizard a 1
    currentWizardStep.value = 1
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
      console.log('🔍 [CONTENT FORM] Validación PDF - pdfFile.name:', pdfFile.value?.name)
      console.log('🔍 [CONTENT FORM] Validación PDF - pdfFile.size:', pdfFile.value?.size)

      if (!pdfFile.value) {
        throw new Error('No se ha seleccionado ningún archivo PDF')
      }

      if (!pdfFile.value.name) {
        throw new Error('El archivo PDF seleccionado no es válido')
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
</script>
