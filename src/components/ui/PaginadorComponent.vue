<script setup lang="ts">
// Definimos qué datos necesita recibir este componente desde el padre
defineProps<{
    paginaActual: number;
    totalPaginas?: number; // Opcional (a veces no sabemos el total exacto)
    totalItems?: number;   // Opcional
    itemLabel?: string;    // Ej: "clientes", "tareas", "usuarios"
    cargando: boolean;
    deshabilitarAnterior: boolean;
    deshabilitarSiguiente: boolean;
}>();

// Definimos los eventos que este componente va a "gritar" hacia arriba
defineEmits(['anterior', 'siguiente']);
</script>

<template>
    <div class="p-4 border-t border-border-main text-sm text-text-muted flex justify-between items-center bg-bg-main transition-colors">
        
        <span>
            Mostrando página <span class="font-bold text-text-main">{{ paginaActual }}</span> 
            
            <template v-if="totalPaginas">
                de <span class="font-bold text-text-main">{{ totalPaginas }}</span> 
            </template>
            
            <template v-if="totalItems">
                (Total: {{ totalItems }} {{ itemLabel || 'ítems' }})
            </template>
        </span>
        
        <div class="flex gap-2">
            <button @click="$emit('anterior')" 
                    :disabled="deshabilitarAnterior || cargando"
                    class="px-3 py-1.5 rounded-md border border-border-main hover:bg-bg-hover disabled:opacity-50 disabled:cursor-not-allowed transition bg-sidebar text-text-main font-medium">
                Anterior
            </button>
            <button @click="$emit('siguiente')" 
                    :disabled="deshabilitarSiguiente || cargando"
                    class="px-3 py-1.5 rounded-md border border-border-main hover:bg-bg-hover disabled:opacity-50 disabled:cursor-not-allowed transition bg-sidebar text-text-main font-medium">
                Siguiente
            </button>
        </div>
    </div>
</template>