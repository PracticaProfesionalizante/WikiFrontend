<template>
  <ContentFormWrapper
    :model-value="modelValue"
    :title="isEditing ? 'Editar documento de texto' : 'Nuevo documento de texto'"
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
          placeholder="Ingrese el título del documento"
        />
      </div>

      <!-- Descripción -->
      <div>
        <label class="form-label">Descripción</label>
        <textarea
          v-model="localData.description"
          class="form-textarea"
          placeholder="Descripción del documento"
        ></textarea>
      </div>

      <!-- Contenido Markdown -->
      <div>
        <label class="form-label">Contenido (Markdown)</label>
        <textarea
          v-model="localData.content"
          class="form-textarea min-h-[200px]"
          placeholder="Escribe contenido en formato Markdown..."
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
  id: null,
  name: "",
  description: "",
  content: "",
  roles: [],
  type: "TYPE_TEXT",
});

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      localData.value = {
        id: data.id ?? null,
        name: data.name,
        description: data.description || "",
        content: data.content || "",
        roles: data.roles || [],
        type: "TYPE_TEXT",
      };
    } else {
      localData.value = {
        id: null,
        name: "",
        description: "",
        content: "",
        roles: [],
        type: "TYPE_TEXT",
      };
    }
  },
  { immediate: true }
);

const close = () => emit("update:modelValue", false);

const submit = async () => {
  loading.value = true
  emit("success", { ...localData.value })
  loading.value = false
  close()
}
</script>
