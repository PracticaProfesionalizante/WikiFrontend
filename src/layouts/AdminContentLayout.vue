<template>
  <div class="flex min-h-screen bg-white dark:bg-slate-900">
    <SidebarMenu @sidebar-toggle="handleSidebarToggle" />

    <AppHeader :sidebar-expanded="sidebarExpanded" />

    <main
      :class="[
        'pt-20 flex-1 transition-all duration-300',
        sidebarExpanded ? 'ml-0 md:ml-[280px]' : 'ml-0 md:ml-20',
      ]"
    >
      <div class="w-full max-w-[1800px] mx-auto p-4 sm:p-6">
        <!-- Aquí va el contenido específico de cada vista -->
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SidebarMenu from '@/components/common/SidebarMenu.vue'
import AppHeader from '@/components/common/AppHeader.vue'

const sidebarExpanded = ref(false)

const handleSidebarToggle = (expanded) => {
  sidebarExpanded.value = expanded
}
</script>
