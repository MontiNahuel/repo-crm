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
