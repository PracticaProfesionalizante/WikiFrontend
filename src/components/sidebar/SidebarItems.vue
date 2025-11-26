<template>
  <div class="flex-1 overflow-y-auto py-2">
    <!-- Vista de submenús -->
      <div v-for="item in props.itemList" :key="item.id" class="px-0">
        <div
          class="relative my-1 flex h-12 cursor-pointer items-center rounded-lg px-4 text-slate-500 transition hover:-translate-y-0.5 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800"
          :class="{ 'bg-gradient-to-tr from-blue-600 to-blue-700 text-white shadow': props.itemSelected?.id === item.id && !item.children }"
          @click="selectSubmenu(item)"
        >
          <div class="grid min-w-12 place-items-center text-[1.25rem]">
            <i :class="['fas fas', item.icon || 'fas fa-circle']"></i>
          </div>
          <span :class="['flex-1 truncate font-medium', isExpanded ? 'ml-2' : 'ml-0']" v-show="isExpanded">{{ item.name }}</span>
          <div class="flex items-center gap-1" v-show="isExpanded">
            <i v-if="item.children && item.children.length > 0" class="fas fa-chevron-right text-sm"></i>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup>

const props = defineProps({
  itemList: {
    type: Array,
    default: () => [],
    required: true,
  },
  itemSelected: {
    type: Object,
    default: null,
  },
  isExpanded: {
    type: Boolean,
    default: false,
  }
})

const emit = defineEmits(['select-item'])


const selectSubmenu = (childSelected) => {
  emit('select-item', childSelected)
}
</script>

<style scoped>
</style>
