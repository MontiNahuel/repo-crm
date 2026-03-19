import api from "@/api/axios";
import { type ITareaCreate } from "./interfacesTareas";

export const tareaService = {
    // Le pasamos limit = 5 por defecto porque es para el dashboard
    async getMisTareas(skip: number = 0, limit: number = 3, pendientes_solo: boolean = true) {
        try {
            const { data } = await api.get('/tareas/mis-tareas', {
                params: { skip, limit, pendientes_solo }
            })
            return data
        } catch (error) {
            console.error('Error al cargar tareas:', error)
            throw error
        }
    },

    async toggleCompletada(tareaId: number) {
        try {
            const { data } = await api.put(`/tareas/${tareaId}/completar`)
            return data
        } catch (error) {
            console.error('Error al actualizar tarea:', error)
            throw error
        }
    },

    async crearTarea(tarea: ITareaCreate) {
        try {
            if (tarea.tipo === 'personal' && tarea.cliente_id) {
                throw new Error("Si el tipo es 'personal', cliente_id no debe estar presente")
            }
            if (tarea.tipo === 'cliente' && !tarea.cliente_id) {
                throw new Error("Si el tipo es 'cliente', cliente_id es obligatorio")
            }

            if (tarea.tipo === 'cliente' && tarea.cliente_id) {
                const { data } = await api.post('/tareas/cliente', {
                    titulo: tarea.titulo,
                    tipo: tarea.tipo,
                    cliente_id: tarea.cliente_id,
                    fecha_limite: tarea.fecha_limite || null
                })
                return data
            } else {
                const { data } = await api.post('/tareas/personal', {
                    titulo: tarea.titulo,
                    tipo: tarea.tipo,
                    fecha_limite: tarea.fecha_limite || null
                })
                return data
            }
        } catch (error) {
            console.error('Error al crear tarea:', error)
            throw error
        }
    },

    async eliminarTarea(tareaId: number) {
        try {
            await api.delete(`/tareas/${tareaId}`)
        } catch (error) {
            console.error('Error al eliminar la tarea:', error)
            throw error
        }
    },

    async actualizarTarea(tareaId: number, datos: Partial<ITareaCreate>) {
        try {
            // Usamos PATCH para actualizaciones parciales
            const { data } = await api.patch(`/tareas/${tareaId}`, datos)
            return data
        } catch (error) {
            console.error('Error al actualizar la tarea:', error)
            throw error
        }
    },

    async getTareasByCliente(clienteId: number, skip: number = 0, limit: number = 10, pendientes_solo: boolean = false) {
        try {
            const { data } = await api.get(`/tareas/cliente/${clienteId}`, {
                params: { skip, limit, pendientes_solo }
            })
            return data
        } catch (error) {
            console.error('Error al cargar tareas del cliente:', error)
            throw error
        }
    }
}