<script setup lang="ts">
import { ref } from 'vue';
import { formatearFechaHora } from '@/core/dependencias';
import type { INoteClient } from '@/interfaces/INote';
import ButtonAsyncIA from '@/components/ui/ButtonAsyncIA.vue';
import { useNotas } from '@/composables/useNotas';

const props = defineProps<{
    nota: INoteClient;
}>();

const { analizeNote } = useNotas();

// Avisamos al padre si se crearon tareas para que actualice la vista general
const emit = defineEmits(['tareas-extraidas', 'intentar-eliminar']);

const mensajeIA = ref('');

// La lógica exclusiva de esta nota
const extraerTareasConIA = async () => {
    mensajeIA.value = '';

    const tareas = await analizeNote(props.nota.id);
    
    if (tareas.length > 0) {
        mensajeIA.value = `¡Se crearon ${tareas.length} tareas! ✨`;
        emit('tareas-extraidas', tareas);
        // Borramos el mensajito de éxito después de 4 segundos
        setTimeout(() => mensajeIA.value = '', 4000);
    } else {
        mensajeIA.value = 'No se detectaron tareas pendientes.';
        setTimeout(() => mensajeIA.value = '', 3000);
    }
    
};
</script>

<template>
    <div class="p-4 bg-bg-hover rounded-xl border border-border-main relative group transition-colors hover:border-blue-500/30">
        <div class="flex justify-between items-start mb-2">
            <span class="text-sm font-bold text-text-main flex items-center gap-1">
                👤 {{ nota.autor.nombre }}
            </span>
            <span class="text-xs text-text-muted">
                {{ formatearFechaHora(nota.fecha_creacion) }}
            </span>
        </div>
        
        <p class="text-sm text-text-main whitespace-pre-wrap break-words mb-3">
            {{ nota.contenido }}
        </p>

        <div class="flex items-center justify-between mt-2 pt-2 border-t border-border-main/50 h-8">
            <span class="text-xs font-bold text-emerald-500">{{ mensajeIA }}</span>
            
            <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-4">
                <ButtonAsyncIA 
                    textoNormal="Extraer Tareas" 
                    textoCargando="Analizando..."
                    :accion="extraerTareasConIA"
                    class="!py-1 !px-3 !text-xs" 
                />

                <button type="button" @click.stop="emit('intentar-eliminar', nota.id)" 
                        class="text-text-muted hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
                        title="Eliminar nota">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>