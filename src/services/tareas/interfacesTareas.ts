export interface ITareaCreate {
    id?: number; // Solo para edición, no se envía al crear
    titulo: string
    tipo: 'personal' | 'cliente';
    cliente_id?: number | null;
    fecha_limite?: string | null;
}

export interface Tarea {
    id: number
    titulo: string
    tipo: 'personal' | 'cliente'
    esta_completada: boolean
    cliente_id?: number
    fecha_limite?: string | null
}