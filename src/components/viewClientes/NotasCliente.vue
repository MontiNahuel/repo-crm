<script setup lang="ts">

// --- Vue ---
import { ref, onMounted } from 'vue';

// --- Dependencias ---
import { formatearFechaHora } from '@/core/dependencias';

// --- Interfaces ---
import type { INoteClient } from '@/interfaces/INote';

// --- Composables ---
import { useNotas } from '@/composables/useNotas';


const props = defineProps<{
    clienteId: number;
}>();

const notas = ref<INoteClient[]>([]);
const nuevaNota = ref('');
const cargando = ref(true);
const enviando = ref(false);

const { obtenerNotas, createNote } = useNotas();

const cargarNotas = async () => {
    cargando.value = true;
    // El composable se encarga de los try/catch y de avisar si falla
    notas.value = await obtenerNotas(Number(props.clienteId));
    cargando.value = false;
};

const guardarNota = async () => {
    notas.value = await createNote({cliente_id: props.clienteId, contenido: nuevaNota.value});
    nuevaNota.value = "";
    cargarNotas()
}

onMounted(() => {
    cargarNotas();
});

</script>
<template>
    <div class="flex flex-col h-full bg-sidebar p-6">
        
        <h3 class="text-xl font-bold text-text-main mb-4 flex items-center gap-2">
            <span>📝</span> Notas del Cliente
        </h3>

        <div class="mb-6 relative">
            <textarea 
                v-model="nuevaNota"
                placeholder="Escribí una nota sobre este cliente..."
                class="w-full bg-bg-main border border-border-main text-text-main rounded-xl p-3 pr-4 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[40px]"
                @keydown.ctrl.enter="guardarNota"
            ></textarea>
            
            <div class="flex justify-between items-center mt-2">
                <span class="text-xs text-text-muted">Presioná Ctrl + Enter para guardar rápido</span>
                <button 
                    @click="guardarNota" 
                    :disabled="!nuevaNota.trim() || enviando"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors"
                >
                    <span v-if="enviando">Guardando...</span>
                    <span v-else>Guardar Nota</span>
                </button>
            </div>
        </div>

        <hr class="border-border-main mb-6" />

        <div v-if="cargando" class="flex justify-center py-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        
        <div v-else-if="notas.length === 0" class="text-center text-text-muted py-8">
            Aún no hay notas para este cliente. ¡Rompe el hielo!
        </div>

        <div v-else class="flex-1 overflow-y-auto max-h-[230px] space-y-4 pr-2 scrollbar-delgada">
            <div v-for="nota in notas" :key="nota.id" class="p-4 bg-bg-hover rounded-xl border border-border-main">
                <div class="flex justify-between items-start mb-2">
                    <span class="text-sm font-bold text-text-main flex items-center gap-1">
                        👤 {{ nota.autor.nombre }}
                    </span>
                    <span class="text-xs text-text-muted">
                        {{ formatearFechaHora(nota.fecha_creacion) }}
                    </span>
                </div>
                <p class="text-sm text-text-main whitespace-pre-wrap break-words">{{ nota.contenido }}</p>
            </div>
        </div>

    </div>
</template>
<style scoped>
/* Estilizamos la barra de scroll solo para este componente */
.scrollbar-delgada::-webkit-scrollbar {
    width: 6px;
}

.scrollbar-delgada::-webkit-scrollbar-track {
    background: transparent;
}

.scrollbar-delgada::-webkit-scrollbar-thumb {
    background-color: #cbd5e1; /* Color gris claro, ajustalo al modo oscuro si querés */
    border-radius: 10px;
}

.dark .scrollbar-delgada::-webkit-scrollbar-thumb {
    background-color: #475569; /* Gris más oscuro para el dark mode */
}
</style>