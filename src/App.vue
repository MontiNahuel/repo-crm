<script setup lang="ts">
import ToastContainer from './components/ui/ToastContainer.vue';
/*
<template>
  <div class="flex h-screen bg-gray-50 font-sans overflow-hidden">

    <main class="flex-1 overflow-y-auto p-8">
      <router-view />
    </main>
    
  </div>
  <ToastContainer />
</template>
*/
import { onMounted } from 'vue';
import { useThemeStore } from '@/stores/themeStore';

const themeStore = useThemeStore();

// Apenas arranca la app, leemos la memoria y aplicamos el tema
onMounted(() => {
  themeStore.loadTheme();
});
</script>

<template>
  <router-view />
  
  <ToastContainer />
</template>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}
</style>
