<script setup lang="ts">
import ToastContainer from './components/ui/ToastContainer.vue';
import { onMounted } from 'vue';
import { useThemeStore } from '@/stores/themeStore';

const themeStore = useThemeStore();

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
