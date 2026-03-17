<script setup lang="ts">
import SidebarComponent from '@/components/navegacion/SidebarComponent.vue'
</script>

<template>
  <div class="flex min-h-screen bg-[var(--bg-main)] transition-colors duration-300">
    
    <SidebarComponent />

    <main class="flex-1 flex flex-col h-screen overflow-hidden">
      
      <header class="h-16 bg-sidebar border-b border-border-main flex items-center justify-between px-8 transition-colors duration-300 shadow-sm">
        
        <h2 class="text-xl font-bold text-text-main capitalize">
          {{ $route.name || 'Dashboard' }}
        </h2>

        <div class="flex items-center gap-4">
            <button class="p-2 text-text-muted hover:bg-bg-hover rounded-full transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            </button>
        </div>

      </header>

      <section class="flex-1 overflow-y-auto p-8 text-text-main">
        <router-view />
      </section>

    </main>
  </div>
</template>