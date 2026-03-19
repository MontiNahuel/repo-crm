import { tareaService } from "@/services/tareas/tareaService";
import { useToast } from "./useToast";
import { type Tarea, type ITareaCreate } from "@/services/tareas/interfacesTareas";

export function useTasks() {

    const toast = useToast();

    // Funcion 1: Toggle con UI optimista
    const toggleCompletada = async (tarea: Tarea) => {
        tarea.esta_completada = !tarea.esta_completada; // Cambio optimista
        try {
            await tareaService.toggleCompletada(tarea.id);
            toast.exito('¡Tarea actualizada correctamente!');
        } catch (error) {
            tarea.esta_completada = !tarea.esta_completada; // Revertir cambio si falla
            console.error('Error al actualizar tarea:', error);
            toast.error('Error al actualizar tarea. Inténtalo de nuevo.');
        }
    };

    // Funcion 2: Eliminar
    const eliminarTarea = async (tareaId: number): Promise<boolean> => {
        try {
            await tareaService.eliminarTarea(tareaId);
            toast.exito('¡Tarea eliminada correctamente!');
            return true; // Indica que la tarea fue eliminada exitosamente
        } catch (error) {
            console.error('Error al eliminar tarea:', error);
            toast.error('Error al eliminar tarea. Inténtalo de nuevo.');
            return false; // Indica que hubo un error al eliminar la tarea
        }
    };


    // Funcion 3: Crear o actualizar tarea
    const submitTask = async (tarea: ITareaCreate, edit_id: number | null): Promise<Tarea | null> => {
        try {
            if (edit_id !== null) {
                const updatedTarea = await tareaService.actualizarTarea(edit_id, tarea);
                toast.exito('¡Tarea actualizada correctamente!');
                return updatedTarea;
            } else {
                const newTarea = await tareaService.crearTarea(tarea);
                toast.exito('¡Tarea creada correctamente!');
                return newTarea;
            }
        } catch (error) {
            console.error('Error al enviar tarea:', error);
            toast.error('Error al enviar tarea. Inténtalo de nuevo.');
            return null;
        }
    };

    // Funcion 4: Cargar tareas
    const loadTasks = async (skip: number = 0, limit: number = 3, pendientes_solo: boolean = false): Promise<Tarea[]> => {
        try {
            const tareas = await tareaService.getMisTareas(skip, limit, pendientes_solo);
            return tareas;
        } catch (error) {
            console.error('Error al cargar tareas:', error);
            toast.error('Error al cargar tareas. Inténtalo de nuevo.');
            return [];
        }
    };

    // Funcion 5: Cargar tareas para un cliente específico
    const loadTasksByClient = async (clienteId: number, skip: number = 0, limit: number = 3, pendientes_solo: boolean = true): Promise<Tarea[]> => {
        try {
            const tareas = await tareaService.getTareasByCliente(clienteId, skip, limit, pendientes_solo);
            return tareas;
        } catch (error) {
            console.error('Error al cargar tareas por cliente:', error);
            toast.error('Error al cargar tareas del cliente. Inténtalo de nuevo.');
            return [];
        }
    };

    return {
        toggleCompletada,
        eliminarTarea,
        submitTask,
        loadTasks,
        loadTasksByClient
    };
}