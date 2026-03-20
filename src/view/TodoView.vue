<script setup lang="ts">

// --- Vue ---
import { onMounted, ref } from 'vue';

// --- Interfaces/tipos de datos ---
import { type Tarea } from '@/services/tareas/interfacesTareas';

// --- Servicios ---
import { tareaService } from '@/services/tareas/tareaService';

// --- Componentes ---
import PanelContenedor from '@/components/ui/PanelContenedor.vue';
import ListaTareas from '@/components/tasks/ListaTareas.vue';
import PaginadorComponent from '@/components/ui/PaginadorComponent.vue';

// --- Modales ---
import ModalConfirmacion from '@/components/modals/ModalConfirmacion.vue';
import CrearTareaModal from '@/components/modals/CrearTareaModal.vue'

// --- Composables ---
import { useTasks } from '@/composables/useTasks';
import { useTaskModals } from '@/composables/useTasksModal';


const tareas = ref<Tarea[]>([])
const cargando = ref(true)
const paginaActual = ref(1)
const limit = 7
const masTareas = ref(true)
const { toggleCompletada } = useTasks()


const cargarTareas = async () => {
    try {
        const skip = (paginaActual.value - 1) * limit
        tareas.value = await tareaService.getMisTareas(skip, limit, false)
        cargando.value = false
        masTareas.value = tareas.value.length === limit
    } catch (error) {
        console.error("Error al cargar tareas:", error)
        cargando.value = false
    }
}

const toggleTarea = async (tarea: Tarea) => {
    await toggleCompletada(tarea);
    if (tarea.esta_completada) {
        setTimeout(async () => {
            await cargarTareas()
        }, 400);
    }
}

const modales = useTaskModals(async () => {
    // Si borramos el último ítem de la página, retrocedemos
    if (tareas.value.length === 1 && paginaActual.value > 1) {
        paginaActual.value--;
    }
    await cargarTareas();
});


// Botones de Navegacion
const paginaAnterior = async () => {
    if (paginaActual.value === 1) return
    paginaActual.value--
    await cargarTareas()
}

const paginaSiguiente = async () => {
    if (!masTareas.value) return
    paginaActual.value++
    await cargarTareas()
}


onMounted(async () => {
    cargarTareas()
})

</script>
<template>
    <div class="p-6 max-w-4xl mx-auto animate-fade-in">
        
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-2xl font-bold text-text-main transition-colors">Mi To-Do List</h1>
                <p class="text-sm text-text-muted mt-1 transition-colors">Gestioná tus pendientes y organizá tu día.</p>
            </div>
            <button @click="modales.abrirModalCrear()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm dark:shadow-none">
                + Nueva Tarea
            </button>
        </div>

        <PanelContenedor>
            
            <ListaTareas 
                :tareas="tareas" 
                :cargando="cargando" 
                @toggle="toggleTarea"
                @eliminar="modales.intentarEliminar"
                @editar="modales.abrirModalEditar"
            />
            
            <PaginadorComponent
                :pagina-actual="paginaActual"
                :cargando="cargando"
                :deshabilitar-anterior="paginaActual === 1"
                :deshabilitar-siguiente="!masTareas"
                @anterior="paginaAnterior"
                @siguiente="paginaSiguiente"
            />
        </PanelContenedor>

        <Teleport to="body">
            <ModalConfirmacion 
                v-if="modales.mostrarModalEliminar.value" 
                titulo="Eliminar tarea" 
                mensaje="¿Estás seguro de que querés eliminar esta tarea del To-Do?" 
                textoConfirmar="Sí, eliminar" 
                :cargando="modales.eliminando.value" 
                @confirmar="modales.confirmarEliminacion" 
                @cancelar="modales.cancelarEliminacion" 
            />
            
            <CrearTareaModal 
                v-if="modales.mostrarModalCrearEditar.value" 
                :tareaAEditar="modales.tareaSeleccionada.value" 
                @close="modales.cerrarModalCrearEditar(false)" 
                @tarea-creada="modales.cerrarModalCrearEditar(true)" 
            />
        </Teleport>
    </div>
</template>