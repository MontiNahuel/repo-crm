<script setup lang="ts">
import { type Tarea } from '@/interfaces/interfacesTareas';

defineProps<{ tareas: Tarea[]; cargando: boolean; }>()

defineEmits<{
    (e: 'toggle', tarea: Tarea): void;
    (e: 'ver-detalle', tarea: Tarea): void; // <-- NUEVO EVENTO
    (e: 'eliminar', tarea_id: number): void;
}>()
</script>

<template>
    <div v-if="cargando" class="p-12 text-center text-text-muted flex flex-col items-center">
        <svg class="animate-spin h-8 w-8 mb-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        Cargando tareas...
    </div>

    <div v-else-if="tareas.length === 0" class="p-12 text-center">
        <div class="text-5xl mb-4">🎉</div>
        <h3 class="text-text-main font-bold text-lg">¡Todo al día!</h3>
        <p class="text-text-muted text-sm mt-1">No hay tareas pendientes por el momento.</p>
    </div>

    <ul v-else class="divide-y divide-border-main transition-colors">
        <li v-for="tarea in tareas" :key="tarea.id">
            <div class="p-4 flex items-center gap-4 hover:bg-bg-hover transition-colors group cursor-pointer"
                 @click="$emit('ver-detalle', tarea)"> <button @click.stop="$emit('toggle', tarea)" 
                        :class="['w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0',
                                tarea.esta_completada ? 'bg-green-500 border-green-500 text-white' : 'border-border-main hover:border-blue-500 bg-transparent']">
                    <svg v-if="tarea.esta_completada" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                </button>

                <div class="flex-1 min-w-0 cursor-pointer">
                    <p :class="['text-sm font-medium truncate transition-all duration-200', 
                                tarea.esta_completada ? 'text-text-muted line-through' : 'text-text-main']">
                        {{ tarea.titulo }}
                    </p>
                    
                    <div class="flex items-center gap-3 mt-1.5 text-xs text-text-muted">
                        <span v-if="tarea.tipo === 'cliente'" class="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-md font-semibold transition-colors">
                            Cliente
                        </span>
                        <span v-else class="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-0.5 rounded-md font-semibold transition-colors">
                            Personal
                        </span>
                        
                        <span v-if="tarea.fecha_limite" class="flex items-center gap-1">
                            📅 {{ new Date(tarea.fecha_limite).toLocaleDateString() }}
                        </span>
                    </div>
                </div>

                <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click.stop="$emit('eliminar', tarea.id)" class="p-2 text-text-muted hover:text-red-500 hover:bg-bg-main rounded-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 transition-all z-10 text-text-icon-default hover:text-text-icon-delete-hover hover:bg-bg-icon-delete-hover">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            </div>
        </li>
    </ul>
</template>

<style scoped>
.expand-enter-active, .expand-leave-active {
    transition: all 0.3s ease;
}

.expand-enter-from {
    opacity: 0;
    max-height: 0;
}

.expand-to {
    opacity: 1;
    max-height: 300px;
}

.expand-leave-to {
    opacity: 0;
    max-height: 0;
}
</style>