<template>
  <div v-if="props.showBreadcrumb" class="border-b bg-blue-50/30 px-4 py-3 dark:border-slate-700 dark:bg-blue-900/10">
    <div class="flex items-center gap-2 text-[0.85rem]">
      <span @click="goBack" class="flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-slate-600 hover:bg-blue-100/50 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-blue-900/20" >
        <i class="fas fa-arrow-left"></i>
        <span>Volver</span>
      </span>
      <i class="fas fa-chevron-right text-[0.75rem] text-slate-400"></i>
      <span class="flex items-center gap-1 rounded px-2 py-1 font-semibold text-blue-600 dark:text-blue-400">
        <i :class="['fas fas', props.icon || '']"></i>
        <span>{{ props.name || ''}}</span>
      </span>
    </div>
  </div>
</template>

<script setup>

const props = defineProps({
  showBreadcrumb: {
    type: Boolean,
    default: false,
    required: true,
  },
  icon: {
    type: String,
    default: null,
  },
  name: {
    type: String,
    default: '',
    required: true,
  },
})

const emit = defineEmits(['go-back'])

const goBack = () => {
  emit('go-back');
}

</script>

<style scoped>
</style>
