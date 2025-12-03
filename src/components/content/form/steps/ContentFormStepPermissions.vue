<template>
  <div class="permissions-step">

    <!-- Error general del paso -->
    <div v-if="errors?.permissions" class="error-box">
      <i class="fas fa-exclamation-circle"></i>
      <span>{{ errors.permissions }}</span>
    </div>

    <h3 class="section-title">Permisos del Documento</h3>
    <p class="section-subtitle">
      Selecciona qué roles pueden acceder o modificar este documento.
    </p>

    <div class="roles-list">
      <label
        v-for="role in roles"
        :key="role"
        class="role-item"
      >
        <input
          type="checkbox"
          :value="role"
          v-model="form.roles"
          :disabled="disabled"
        />
        <span>{{ formatRole(role) }}</span>
      </label>
    </div>

  </div>
</template>

<script setup>
const props = defineProps({
  form: { type: Object, required: true },
  roles: { type: Array, required: true }, // Lista de roles disponibles
  errors: { type: Object, default: () => ({}) },
  disabled: { type: Boolean, default: false },
})

// Convertir ROLE_ADMIN → Administrador
const formatRole = (role) => {
  return role
    .replace('ROLE_', '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
</script>

<style scoped>
.permissions-step {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-title {
  margin: 0;
  font-size: 1.2rem;
  color: var(--text-primary);
  font-weight: 600;
}

.section-subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.roles-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.role-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: var(--bg-secondary);
  padding: 0.7rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  cursor: pointer;
}

.role-item input {
  transform: scale(1.2);
}

.error-box {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #b91c1c;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
</style>
