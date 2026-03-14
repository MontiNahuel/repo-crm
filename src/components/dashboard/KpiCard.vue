<script setup lang="ts">
withDefaults(defineProps<{
    titulo: string;
    valor: string | number;
    descripcion: string;
    esPrincipal?: boolean;
    colorDescripcion?: string;
}>(), {
    esPrincipal: false,
    colorDescripcion: 'text-gray-400'
})
</script>
<template>
    <div :class="esPrincipal 
            ? 'bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg shadow-blue-200' 
            : 'bg-white border border-gray-100 shadow-sm'" 
         class="rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-md">
        
        <div class="flex justify-between items-start">
            <div>
                <p :class="esPrincipal ? 'text-blue-100' : 'text-gray-500'" class="text-sm font-medium mb-1">
                    {{ titulo }}
                </p>
                <h3 :class="esPrincipal ? 'text-white' : 'text-gray-800'" class="text-3xl font-bold">
                    {{ valor }}
                </h3>
            </div>
            
            <slot name="icono"></slot>
        </div>

        <p :class="esPrincipal ? 'text-blue-200' : colorDescripcion" class="text-xs font-medium mt-4">
            {{ descripcion }}
        </p>
    </div>
</template>