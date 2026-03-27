import { ref } from 'vue';
import { type Tarea, type ITareaCreate } from '@/services/tareas/interfacesTareas';
import { useTasks } from '@/composables/useTasks';

// Recibe la función que querés ejecutar cuando termine una acción exitosa (ej: cargarTareas)
export function useTaskModals(onSuccessCallback: () => Promise<void> | void) {

    const { eliminarTarea } = useTasks();
    const valoresPorDefecto = ref<Partial<ITareaCreate>>({});

    // Estados
    const mostrarModalCrearEditar = ref(false);
    const mostrarModalEliminar = ref(false);
    const tareaSeleccionada = ref<Tarea | null>(null);
    const tareaAEliminar = ref<number | null>(null);
    const eliminando = ref(false);
    const mostrarModalIA = ref(false);
    const tareasRecientesIA = ref<Tarea[]>([]);

    // --- LÓGICA DE CREAR / EDITAR ---
    const abrirModalCrear = (valoresIniciales: Partial<ITareaCreate> = {}) => {
        tareaSeleccionada.value = null;
        valoresPorDefecto.value = valoresIniciales;
        mostrarModalCrearEditar.value = true;
    };

    const abrirModalEditar = (tarea: Tarea) => {
        tareaSeleccionada.value = tarea;
        mostrarModalCrearEditar.value = true;
    };

    const cerrarModalCrearEditar = (recargar: boolean = false) => {
        mostrarModalCrearEditar.value = false;
        tareaSeleccionada.value = null;
        valoresPorDefecto.value = {};
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

    // --- LÓGICA DE IA ---
    const abrirModalTareasPorIA = (tareas: Tarea[]) => {
        tareasRecientesIA.value = tareas;
        mostrarModalIA.value = true;
    };

    // AGREGADO: Opción para recargar la lista general al cerrar el modal
    const cerrarModalTareasPorIA = (recargar: boolean = false) => {
        mostrarModalIA.value = false;
        tareasRecientesIA.value = [];
        if (recargar) {
            setTimeout(async () => {
                await onSuccessCallback();
            }, 300);
        }
    };

    // NUEVO: Lógica para descartar una tarea específica desde el modal de IA
    const descartarTareaIA = async (id: number) => {
        // Le pegamos a la base de datos para borrarla de verdad
        const exito = await eliminarTarea(id);

        if (exito) {
            // La sacamos visualmente del array del modal
            tareasRecientesIA.value = tareasRecientesIA.value.filter(t => t.id !== id);

            // Si el usuario borró todas las sugerencias, cerramos el modal automáticamente
            if (tareasRecientesIA.value.length === 0) {
                cerrarModalTareasPorIA(true);
            }
        } else {
            console.error("No se pudo descartar la tarea de la IA");
        }
    };

    return {
        // Exponemos las variables
        mostrarModalCrearEditar,
        mostrarModalEliminar,
        tareaSeleccionada,
        eliminando,
        valoresPorDefecto,
        mostrarModalIA,
        tareasRecientesIA,
        // Exponemos las acciones
        abrirModalCrear,
        abrirModalEditar,
        cerrarModalCrearEditar,
        intentarEliminar,
        cancelarEliminacion,
        confirmarEliminacion,
        abrirModalTareasPorIA,
        cerrarModalTareasPorIA,
        descartarTareaIA
    };
}