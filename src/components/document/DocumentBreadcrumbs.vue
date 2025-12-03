<template>
  <nav
    v-if="breadcrumbs.length"
    class="border-b bg-slate-50/80 px-4 py-3 text-sm text-slate-600 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300"
  >
    <div class="mx-auto flex max-w-6xl items-center gap-2">
      <button class="font-semibold text-blue-600 hover:underline" @click="$emit('navigate', 0)">
        Raíz
      </button>
      <template v-for="(crumb, index) in breadcrumbs" :key="crumb.path">
        <span class="text-slate-400">/</span>
        <button
          class="truncate text-blue-600 hover:underline"
          @click="$emit('navigate', index + 1)"
        >
          {{ crumb.label }}
        </button>
      </template>
    </div>
  </nav>
</template>

<script setup>
defineProps({
  breadcrumbs: {
    type: Array,
    default: () => [],
  },
})

defineEmits(["navigate"])
</script>
