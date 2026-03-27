<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { INoteClient } from '@/interfaces/INote';
import { useNotas } from '@/composables/useNotas';
import NotaItem from './NotaItem.vue'; // Importamos el nuevo sub-componente
import type { Tarea } from '@/services/tareas/interfacesTareas';
import { useConfirmacion } from '@/composables/useModalConfirmacionGenerico';
import ModalConfirmacion from '@/components/modals/ModalConfirmacion.vue';

const emit = defineEmits(['tareas-extraidas']);

const props = defineProps<{
    clienteId: number;
}>();

const notas = ref<INoteClient[]>([]);
const nuevaNota = ref('');
const cargando = ref(true);
const enviando = ref(false);

const confirmacion = useConfirmacion();

const { obtenerNotas, createNote, deleteNote } = useNotas();

const cargarNotas = async (esPrimeraVez = false) => {
    // Solo mostramos el spinner si es la carga inicial
    if (esPrimeraVez) cargando.value = true;
    
    try {
        const data = await obtenerNotas(Number(props.clienteId));
        notas.value = data;
    } finally {
        if (esPrimeraVez) cargando.value = false;
    }
};

const guardarNota = async () => {
    enviando.value = true;
    await createNote({cliente_id: props.clienteId, contenido: nuevaNota.value});
    nuevaNota.value = "";
    await cargarNotas();
    enviando.value = false;
}

// Función opcional por si querés hacer algo cuando la IA termina
const onTareasExtraidas = (nuevasTareas: Tarea[]) => {
    emit('tareas-extraidas', nuevasTareas);
}

const borrarNota = (idNota: number) => {
    // Le pasamos los textos y LA FUNCIÓN específica de notas
    confirmacion.pedirConfirmacion(
        "Borrar Nota",
        "¿Querés volar esta nota para siempre?",
        "Eliminar Nota",
        async () => {
            // Todo lo que pongas acá adentro se ejecuta cuando el usuario toque "Confirmar"
            await deleteNote(idNota);
            await cargarNotas();
            console.log("Nota borrada y lista recargada!");
        }
    );
};

onMounted(() => {
    cargarNotas(true);
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
                    type="button" 
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

        <div v-else class="flex-1 overflow-y-auto min-h-[230px] max-h-[230px] space-y-4 pr-2 scrollbar-delgada">
            <NotaItem 
                v-for="nota in notas" 
                :key="nota.id" 
                :nota="nota"
                @tareas-extraidas="onTareasExtraidas"
                @intentar-eliminar="borrarNota"
            />
        </div>
    </div>

    <Teleport to="body">
        <ModalConfirmacion 
            v-if="confirmacion.mostrarModal.value"
            :titulo="confirmacion.tituloModal.value"
            :mensaje="confirmacion.mensajeModal.value"
            :textoConfirmar="confirmacion.textoBoton.value"
            :cargando="confirmacion.cargando.value"
            @confirmar="confirmacion.confirmar"
            @cancelar="confirmacion.cancelar"
        />
    </Teleport>

</template>

<style scoped>
/* Tu CSS del scrollbar queda intacto acá */
.scrollbar-delgada::-webkit-scrollbar { width: 6px; }
.scrollbar-delgada::-webkit-scrollbar-track { background: transparent; }
.scrollbar-delgada::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
.dark .scrollbar-delgada::-webkit-scrollbar-thumb { background-color: #475569; }
</style>