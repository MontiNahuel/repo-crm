<script setup lang="ts">
defineProps<{
    mensaje: string;
    tipo: 'exito' | 'error' | 'info';
}>()

defineEmits(['cerrar'])
</script>

<template>
    <div class="px-5 py-3.5 rounded-xl shadow-lg flex items-center gap-3 border transition-colors w-full max-w-sm"
         :class="{
            'bg-gray-800 text-white border-gray-700': tipo === 'exito',
            'bg-red-50 text-red-800 border-red-200': tipo === 'error',
            'bg-blue-50 text-blue-800 border-blue-200': tipo === 'info'
         }">
        
        <div class="rounded-full p-1 shrink-0"
             :class="{'bg-green-500/20 text-green-400': tipo === 'exito', 'bg-red-200 text-red-600': tipo === 'error', 'bg-blue-200 text-blue-600': tipo === 'info'}">
            <svg v-if="tipo === 'exito'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <svg v-else-if="tipo === 'error'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        
        <p class="font-medium text-sm tracking-wide flex-1">{{ mensaje }}</p>
        
        <button @click="$emit('cerrar')" class="ml-2 opacity-70 hover:opacity-100 transition shrink-0">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
    </div>
</template>