<script setup lang="ts">
defineProps<{
    valor: number | string;
    etiqueta: string;
    colorFondo: string;
    colorTexto: string;
}>()
</script>

<template>
    <div class="flex flex-col items-center">
        <div :class="[colorFondo, colorTexto]" 
             class="w-full text-center py-2 rounded-lg font-bold text-lg mb-2 transition-all hover:brightness-95">
            {{ valor }}
        </div>
        <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {{ etiqueta }}
        </span>
    </div>
</template>