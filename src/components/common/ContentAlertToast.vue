<template>
  <transition name="slide-fade">
    <div
      v-if="visible && message"
      class="fixed right-4 top-4 z-[1100] max-w-sm"
      role="alert"
    >
      <div
        :class="[
          'mb-3 flex items-center gap-2 rounded border px-4 py-3 text-sm font-medium shadow-lg',
          type === 'error'
            ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-900/30 dark:text-red-200'
            : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/30 dark:text-emerald-200',
        ]"
      >
        <i
          :class="[
            'shrink-0',
            type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle',
          ]"
        ></i>

        <span class="flex-1">
          {{ message }}
        </span>

        <button
          type="button"
          class="ml-2 grid h-7 w-7 place-items-center rounded-full bg-white/30 text-xs"
          @click="close"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'success', // 'success' | 'error'
  },
  message: {
    type: String,
    default: '',
  },
  duration: {
    type: Number,
    default: 4000, // ms
  },
})

const emit = defineEmits(['close'])

const visible = ref(false)
let timeoutId

const clearTimer = () => {
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
}

const startTimer = () => {
  clearTimer()
  if (!props.message || props.duration <= 0) return

  timeoutId = setTimeout(() => {
    close()
  }, props.duration)
}

const close = () => {
  visible.value = false
  clearTimer()
  emit('close')
}

watch(
  () => props.message,
  (newVal) => {
    if (newVal) {
      visible.value = true
      startTimer()
    } else {
      visible.value = false
      clearTimer()
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  clearTimer()
})
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.2s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
