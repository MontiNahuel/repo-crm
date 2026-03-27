<script setup lang="ts">
import { ref } from 'vue';

// Qué datos espera recibir el botón
const props = defineProps({
  textoNormal: { type: String, default: 'Ejecutar IA' },
  textoCargando: { type: String, default: 'Procesando...' },
  // ¡La magia está acá! Recibe una función asíncrona genérica
  accion: { type: Function, required: true } 
});

const isLoading = ref(false);

// La lógica interna del botón es puramente visual
const ejecutar = async () => {
  isLoading.value = true;
  try {
    // Ejecuta la función que le pasaron desde el padre y espera a que termine
    await props.accion(); 
  } catch (error) {
    console.error("El botón capturó un error de la acción:", error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <button 
    @click="ejecutar" 
    :disabled="isLoading"
    class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-all bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed active:scale-95"
  >
    <svg v-if="isLoading" class="w-4 h-4 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    
    <span v-else>
      <slot name="icono">✨</slot>
    </span>
    
    {{ isLoading ? textoCargando : textoNormal }}
  </button>
</template>