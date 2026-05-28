import api from '@/api/axios';

export interface IParticipante {
    user_id: number;
    nombre: string;
    apellido?: string;
    rol: string;
}

export interface IUltimoMensaje {
    sender_id: number;
    sender_name: string;
    content: string;
    timestamp: string;
    type: string;
}

export interface IConversacion {
    id: string;
    name?: string;
    is_group: boolean;
    type?: 'direct' | 'group';
    created_at: string;
    participants: IParticipante[];
    last_message: IUltimoMensaje | null;
    last_read: Record<string, string>;
}

export interface IMensaje {
    sender_id: number;
    sender_name: string;
    content: string;
    timestamp: string;
    type: string;
    conversation_id?: string;
}

export interface IColaborador {
    id: number;
    email: string;
    rol: string;
    es_activo: boolean;
    nombre: string;
    apellido: string;
}

export const chatService = {
    /**
     * Obtiene la lista de conversaciones activas del colaborador logueado.
     */
    async getConversaciones(): Promise<IConversacion[]> {
        const { data } = await api.get<IConversacion[]>('/chat/conversations');
        return data;
    },

    /**
     * Busca o crea un chat directo (1-a-1) con otro colaborador.
     */
    async obtenerOCrearChatDirecto(otherUserId: number): Promise<IConversacion> {
        const { data } = await api.post<IConversacion>('/chat/direct', null, {
            params: { other_user_id: otherUserId }
        });
        return data;
    },

    /**
     * Crea un chat grupal con múltiples colaboradores.
     */
    async crearGrupo(name: string, participantIds: number[]): Promise<IConversacion> {
        const { data } = await api.post<IConversacion>('/chat/group', {
            name,
            participant_ids: participantIds
        });
        return data;
    },

    /**
     * Obtiene el historial de mensajes de una conversación (Paginado - Bucket Pattern de 50 ítems).
     */
    async getHistorial(conversationId: string, page = 1): Promise<IMensaje[]> {
        const { data } = await api.get<IMensaje[]>(`/chat/conversations/${conversationId}/history`, {
            params: { page }
        });
        return data;
    },

    /**
     * Busca colaboradores activos en el sistema (Buscador altamente escalable).
     * Si la búsqueda tiene menos de 2 caracteres, no realiza petición y retorna [].
     */
    async buscarColaboradores(busqueda: string): Promise<IColaborador[]> {
        if (!busqueda || busqueda.trim().length < 2) {
            return [];
        }
        const { data } = await api.get<IColaborador[]>('/usuarios/colaboradores', {
            params: { busqueda }
        });
        return data;
    }
};
