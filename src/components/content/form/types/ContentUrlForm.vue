<template>
  <ContentFormWrapper
    :visible="modelValue"
    :title="isEditing ? 'Editar enlace externo' : 'Nuevo enlace externo'"
    :loading="loading"
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
          placeholder="Ingrese el nombre del enlace"
        />
      </div>

      <!-- URL -->
      <div>
        <label class="form-label">URL</label>
        <input
          v-model="localData.content"
          type="url"
          class="form-input"
          placeholder="https://..."
        />
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
        <select
          v-model="localData.roles"
          multiple
          class="form-select"
        >
          <option v-for="role in roles" :key="role" :value="role">
            {{ role }}
          </option>
        </select>
      </div>
    </div>

    <div class="flex justify-end gap-3 pt-6">
      <button class="btn-secondary" @click="close">Cancelar</button>
      <button class="btn-primary" @click="submit" :disabled="loading">
        {{ isEditing ? 'Guardar Cambios' : 'Crear' }}
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

const isEditing = computed(() => !!props.initialData);

const localData = ref({
  name: "",
  content: "",
  description: "",
  roles: [],
  type: "TYPE_URL",
});

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      localData.value = {
        name: data.name,
        content: data.content || data.url || "",
        description: data.description || "",
        roles: data.roles || [],
        type: "TYPE_URL",
      };
    } else {
      localData.value = {
        name: "",
        content: "",
        description: "",
        roles: [],
        type: "TYPE_URL",
      };
    }
  },
  { immediate: true }
);

const close = () => emit("update:modelValue", false);

const submit = async () => {
  loading.value = true;
  emit("success", { ...localData.value });
  loading.value = false;
  close();
};
</script>
