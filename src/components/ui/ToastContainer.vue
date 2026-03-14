<script setup lang="ts">
import ToastNotification from './ToastNotification.vue'
import { useToast } from '@/composables/useToast'

// El contenedor se encarga de escuchar el estado global
const { toasts, removerToast } = useToast()
</script>

<template>
  <div class="fixed bottom-8 right-8 z-50 flex flex-col gap-3 pointer-events-none w-full max-w-sm">
    
    <TransitionGroup name="lista-toast">
      <div v-for="t in toasts" :key="t.id" class="pointer-events-auto w-full">
        <ToastNotification 
            :mensaje="t.mensaje" 
            :tipo="t.tipo"
            @cerrar="removerToast(t.id)" 
        />
      </div>
    </TransitionGroup>

  </div>
</template>

<style scoped>
/* 1. Definimos la velocidad y suavidad para entrar, salir y MOVERSE */
.lista-toast-enter-active,
.lista-toast-leave-active,
.lista-toast-move {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

/* 2. Estado inicial y final: Transparente y desplazado 30px hacia ABAJO (eje Y) */
.lista-toast-enter-from,
.lista-toast-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* 3. El truco para que no "salte": 
   Al salir, lo sacamos del flujo normal para que los demás puedan ocupar su lugar suavemente */
.lista-toast-leave-active {
  position: absolute;
  width: 100%;
}
</style>