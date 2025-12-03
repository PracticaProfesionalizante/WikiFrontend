<template>
  <ContentFormWrapper
    :model-value="modelValue"
    :title="isEditing ? 'Editar documento PDF' : 'Subir documento PDF'"
    :loading="loading"
    @update:modelValue="emit('update:modelValue', $event)"
    @submit="submit"
    @close="close"
  >
    <div class="space-y-5">
      <!-- Nombre -->
      <div>
        <label class="form-label">Título</label>
        <input
          v-model="localData.name"
          type="text"
          class="form-input"
          placeholder="Ingrese el nombre del documento PDF"
        />
      </div>

      <!-- Archivo PDF -->
      <div>
        <label class="form-label">Archivo PDF</label>
        <input
          type="file"
          accept="application/pdf"
          class="form-input"
          @change="handleFileChange"
        />
        <p v-if="fileName" class="mt-1 text-xs text-slate-500">
          Archivo seleccionado: {{ fileName }}
        </p>
      </div>

      <!-- Descripción -->
      <div>
        <label class="form-label">Descripción</label>
        <textarea
          v-model="localData.description"
          class="form-textarea"
        ></textarea>
      </div>

      <!-- Roles -->
      <div>
        <label class="form-label">Roles permitidos</label>
        <select v-model="localData.roles" multiple class="form-select">
          <option v-for="role in roles" :key="role" :value="role">
            {{ role }}
          </option>
        </select>
      </div>
    </div>

    <div class="flex justify-end gap-3 pt-6">
      <button class="btn-secondary" @click="close">Cancelar</button>
      <button class="btn-primary" @click="submit" :disabled="loading">
        {{ isEditing ? 'Guardar Cambios' : 'Subir PDF' }}
      </button>
    </div>
  </ContentFormWrapper>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import ContentFormWrapper from "../../../forms/ContentFormWrapper.vue";

const props = defineProps({
  modelValue: Boolean,
  roles: Array,
  initialData: Object,
});
const emit = defineEmits(["update:modelValue", "success", "close"]);

const loading = ref(false);
const fileBlob = ref(null);
const fileName = ref(null);

const isEditing = computed(() => !!props.initialData);

const localData = ref({
  id: null,
  name: "",
  description: "",
  roles: [],
  type: "TYPE_PDF",
  file: null,
});

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      localData.value = {
        id: data.id ?? null,
        name: data.name,
        description: data.description || "",
        roles: data.roles || [],
        type: "TYPE_PDF",
        file: null,
      };
    } else {
      localData.value = {
        id: null,
        name: "",
        description: "",
        roles: [],
        type: "TYPE_PDF",
        file: null,
      };
    }
  },
  { immediate: true }
);

const handleFileChange = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  fileBlob.value = file;
  fileName.value = file.name;
  localData.value.file = file;
};

const close = () => emit("update:modelValue", false);

const submit = async () => {
  loading.value = true
  emit("success", { ...localData.value })
  loading.value = false
  close()
}
</script>
