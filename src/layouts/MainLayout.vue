<script setup lang="ts">
import SidebarComponent from '@/components/navegacion/SidebarComponent.vue'
</script>

<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    <SidebarComponent />
    <main class="flex-1 overflow-y-auto p-8">
      <header class="h-16 bg-sidebar border-b border-border-main flex items-center px-8 transition-colors">
        <h2 class="text-lg font-bold text-text-main">
          {{ $route.name }}
        </h2>
      </header>

      <section class="flex-1 overflow-y-auto p-8">
        <router-view />
      </section>
    </main>
  </div>
</template>