<script setup lang="ts">
withDefaults(defineProps<{
    titulo: string;
    valor: string | number;
    descripcion: string;
    esPrincipal?: boolean;
    colorDescripcion?: string;
}>(), {
    esPrincipal: false,
    // 1. Cambiamos el valor por defecto para que herede nuestro gris dinámico
    colorDescripcion: 'text-text-muted'
})
</script>

<template>
    <div :class="esPrincipal 
            ? 'bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg shadow-blue-200/50 dark:shadow-none' 
            : 'bg-sidebar border border-border-main shadow-sm'" 
         class="rounded-2xl p-5 flex flex-col justify-between transition-colors duration-300">
        
        <div class="flex justify-between items-start">
            <div>
                <p :class="esPrincipal ? 'text-blue-100' : 'text-text-muted'" class="text-sm font-medium mb-1 transition-colors">
                    {{ titulo }}
                </p>
                <h3 :class="esPrincipal ? 'text-white' : 'text-text-main'" class="text-3xl font-bold transition-colors">
                    {{ valor }}
                </h3>
            </div>
            
            <slot name="icono"></slot>
        </div>

        <p :class="esPrincipal ? 'text-blue-200' : colorDescripcion" class="text-xs font-medium mt-4 transition-colors">
            {{ descripcion }}
        </p>
    </div>
</template>