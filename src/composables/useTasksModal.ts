import { ref } from 'vue';
import { type Tarea } from '@/services/tareas/interfacesTareas';
import { useTasks } from '@/composables/useTasks';

// Recibe la función que querés ejecutar cuando termine una acción exitosa (ej: cargarTareas)
export function useTaskModals(onSuccessCallback: () => Promise<void> | void) {

    const { eliminarTarea } = useTasks();

    // Estados
    const mostrarModalCrearEditar = ref(false);
    const mostrarModalEliminar = ref(false);
    const tareaSeleccionada = ref<Tarea | null>(null);
    const tareaAEliminar = ref<number | null>(null);
    const eliminando = ref(false);

    // --- LÓGICA DE CREAR / EDITAR ---
    const abrirModalCrear = () => {
        tareaSeleccionada.value = null;
        mostrarModalCrearEditar.value = true;
    };

    const abrirModalEditar = (tarea: Tarea) => {
        tareaSeleccionada.value = tarea;
        mostrarModalCrearEditar.value = true;
    };

    const cerrarModalCrearEditar = (recargar: boolean = false) => {
        mostrarModalCrearEditar.value = false;
        tareaSeleccionada.value = null;
        if (recargar) {
            setTimeout(async () => {
                await onSuccessCallback();
            }, 300);
        }
    };

    // --- LÓGICA DE ELIMINAR ---
    const intentarEliminar = (id: number) => {
        tareaAEliminar.value = id;
        mostrarModalEliminar.value = true;
    };

    const cancelarEliminacion = () => {
        mostrarModalEliminar.value = false;
        tareaAEliminar.value = null;
    };

    const confirmarEliminacion = async () => {
        if (!tareaAEliminar.value) return;

        eliminando.value = true;
        const exito = await eliminarTarea(tareaAEliminar.value);

        if (exito) {
            mostrarModalEliminar.value = false;
            tareaAEliminar.value = null;
            setTimeout(async () => {
                await onSuccessCallback();
            }, 300);
        }
        eliminando.value = false;
    };

    return {
        // Exponemos las variables
        mostrarModalCrearEditar,
        mostrarModalEliminar,
        tareaSeleccionada,
        eliminando,
        // Exponemos las acciones
        abrirModalCrear,
        abrirModalEditar,
        cerrarModalCrearEditar,
        intentarEliminar,
        cancelarEliminacion,
        confirmarEliminacion
    };
}