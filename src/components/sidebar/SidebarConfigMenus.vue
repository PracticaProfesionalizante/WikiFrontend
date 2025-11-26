<template>
  <div v-if="props.show" class="mt-auto py-2">
    <div class="mx-4 my-2 h-px scale-x-100 opacity-100 bg-slate-200 dark:bg-slate-700" v-show="props.isExpanded"></div>
    <div class="px-0">
      <div
        class="relative my-1 flex h-10 cursor-pointer items-center rounded-lg border border-blue-200/60 bg-blue-50/50 px-4 text-slate-600 transition hover:border-blue-300 hover:bg-blue-100/60 dark:border-blue-900/30 dark:bg-blue-900/10 dark:text-slate-300"
        :class="{ 'bg-gradient-to-tr from-blue-600 to-blue-700 text-white shadow border-blue-600': props.isSelected }"
        @click="navigateToMenuManager"
      >
        <div class="grid min-w-12 place-items-center text-[1rem]">
          <i class="fas fa-edit"></i>
        </div>
        <span :class="['flex-1 truncate font-medium', props.isExpanded ? 'ml-2' : 'ml-0']" v-show="props.isExpanded">Editar</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
    required: true,
  },
  isExpanded: {
    type: Boolean,
    default: true,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
    required: true,
  }
})
const emit = defineEmits(['navigate-to-menu-manager'])


const navigateToMenuManager = () => {
  emit('navigate-to-menu-manager')
}
</script>

<style scoped>
</style>
