<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SidebarComponent from '@/components/navegacion/SidebarComponent.vue'


const route = useRoute()
const router = useRouter()

const tituloRuta = computed(() => {
    return route.meta.title || route.name || 'Dashboard'
})

// 2. Control del botón Atrás: Solo se muestra si la ruta actual dice que lo necesita en su 'meta'
const mostrarBotonAtras = computed(() => {
    return !!route.meta.showBack
})

const irAtras = () => {
    router.back()
}
</script>

<template>
  <div class="flex min-h-screen bg-[var(--bg-main)] transition-colors duration-300">
    
    <SidebarComponent />

    <main class="flex-1 flex flex-col h-screen overflow-hidden">
      
      <header class="h-16 bg-sidebar border-b border-border-main flex items-center justify-between px-8 transition-colors duration-300 shadow-sm">

        <div class="flex items-center gap-4">
            
            <button 
                v-if="mostrarBotonAtras"
                @click="irAtras"
                class="p-2 text-text-muted hover:bg-bg-hover hover:text-text-main rounded-full transition-colors"
                title="Volver"
            >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
            </button>

            <h2 class="text-xl font-bold text-text-main capitalize">
                {{ tituloRuta }}
            </h2>
            
        </div>

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