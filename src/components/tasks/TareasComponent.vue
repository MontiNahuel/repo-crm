<script setup lang="ts">
import { ref, onMounted } from 'vue';
import PanelTareaDetalle from '@/components/tasks/PanelTareaDetalle.vue';
import ListaTareas from '@/components/tasks/ListaTareas.vue';
import type { Tarea } from '@/interfaces/interfacesTareas';
import { useTasks } from '@/composables/useTasks';
import PaginadorComponent from '../ui/PaginadorComponent.vue';
import { useTaskModals } from '@/composables/useTasksModal';
import PanelContenedor from '../ui/PanelContenedor.vue';
import ModalConfirmacion from '../modals/ModalConfirmacion.vue';
import CrearTareaModal from '../modals/CrearTareaModal.vue';
// ... tus imports de Tarea, etc.

defineProps<{
    compact: boolean;
}>();

const { toggleCompletada, loadTasks } = useTasks();


const tareas = ref<Tarea[]>([]);
const cargando = ref(true);
const paginaActual = ref(1)
const limit = 7
const masTareas = ref(true)

const tareaSeleccionada = ref<Tarea | null>(null);
const panelAbierto = ref(false);

const abrirDetalles = (tarea: Tarea) => {
    tareaSeleccionada.value = tarea;
    panelAbierto.value = true;
};

const cerrarPanel = () => {
    panelAbierto.value = false;
    // Opcional: limpiar la tarea después de que termine la animación
    setTimeout(() => { tareaSeleccionada.value = null; }, 300); 
};

const cargarTareas = async () => {
    try {
        const skip = (paginaActual.value - 1) * limit
        tareas.value = await loadTasks(skip, limit, false);
        cargando.value = false;
        masTareas.value = tareas.value.length === limit
    } catch (error) {
        console.error("Error al cargar tareas:", error);
        cargando.value = false;
    }
};

const toggleTarea = async (tarea: Tarea) => {
    await toggleCompletada(tarea);
    if (tarea.esta_completada) {
        setTimeout(async () => {
            await cargarTareas();
        }, 400);
    }
};

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
    await cargarTareas();
});


</script>

<template>
    <div>
        <div v-if="!compact">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-text-main transition-colors">Mi To-Do List</h1>
                    <p class="text-sm text-text-muted mt-1 transition-colors">Gestioná tus pendientes y organizá tu día.</p>
                </div>
                <button @click="modales.abrirModalCrear()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm dark:shadow-none">
                    + Nueva Tarea
                </button>
            </div>
        </div>
        <PanelContenedor>
            <div v-if="compact">
                <div class="p-6 border-b border-border-main flex justify-between items-center transition-colors">
                    <h3 class="text-lg font-bold text-text-main">Tareas Pendientes</h3>
                    <button @click="modales.abrirModalCrear()" class="text-sm text-blue-500 font-semibold hover:text-blue-400 transition-colors">
                        + Nueva Tarea
                    </button>
                </div>
            </div>
            <ListaTareas 
                :tareas="tareas" 
                :cargando="cargando"
                @toggle="toggleTarea"
                @eliminar="modales.intentarEliminar"
                @ver-detalle="abrirDetalles" 
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

        <PanelTareaDetalle 
            :tarea="tareaSeleccionada"
            :is-open="panelAbierto"
            @cerrar="cerrarPanel"
        />
    </div>
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
</template>