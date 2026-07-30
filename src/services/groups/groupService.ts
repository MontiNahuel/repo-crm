import api from '@/api/axios';

export interface IMiembroEquipo {
  id: number;
  user_id?: number;
  nombre: string;
  apellido?: string;
  email: string;
  rol: string;
}

export interface IGrupoTrabajo {
  id: number;
  nombre: string;
  descripcion?: string;
  creado_en?: string;
  chat_conversation_id?: string;
  miembros: IMiembroEquipo[];
}

export const groupService = {
  /**
   * Obtiene todos los grupos de trabajo del sistema (Solo Administradores).
   */
  async getGrupos(skip: number = 0, limit: number = 100): Promise<IGrupoTrabajo[]> {
    const { data } = await api.get<IGrupoTrabajo[]>('/grupos/', {
      params: { skip, limit }
    });
    return data;
  },

  /**
   * Obtiene los detalles de tu propio equipo de trabajo.
   */
  async getMiEquipo(): Promise<IGrupoTrabajo> {
    const { data } = await api.get<IGrupoTrabajo>('/grupos/mi-equipo');
    return data;
  },

  /**
   * Obtiene los detalles de un grupo específico por ID.
   */
  async getGrupoPorId(grupoId: number): Promise<IGrupoTrabajo> {
    const { data } = await api.get<IGrupoTrabajo>(`/grupos/${grupoId}`);
    return data;
  },

  /**
   * Crea un nuevo grupo de trabajo (Solo Administradores).
   */
  async crearGrupo(nombre: string, descripcion: string): Promise<IGrupoTrabajo> {
    const { data } = await api.post<IGrupoTrabajo>('/grupos/', {
      nombre,
      descripcion
    });
    return data;
  },

  /**
   * Asigna un colaborador a un grupo de trabajo (Administradores o Supervisores de su grupo).
   */
  async asignarMiembro(grupoId: number, usuarioId: number): Promise<{ mensaje: string; grupo_id: number; usuario: IMiembroEquipo }> {
    const { data } = await api.post<{ mensaje: string; grupo_id: number; usuario: IMiembroEquipo }>(
      `/grupos/${grupoId}/miembros`,
      { usuario_id: usuarioId }
    );
    return data;
  },

  /**
   * Remueve a un colaborador de su grupo de trabajo (Administradores o Supervisores de su grupo).
   */
  async removerMiembro(grupoId: number, usuarioId: number): Promise<{ mensaje: string; grupo_id: number; usuario_id: number }> {
    const { data } = await api.delete<{ mensaje: string; grupo_id: number; usuario_id: number }>(
      `/grupos/${grupoId}/miembros/${usuarioId}`
    );
    return data;
  },

  /**
   * Elimina físicamente un grupo de trabajo (Solo Administradores).
   */
  async eliminarGrupo(grupoId: number): Promise<{ mensaje: string; grupo_id: number }> {
    const { data } = await api.delete<{ mensaje: string; grupo_id: number }>(`/grupos/${grupoId}`);
    return data;
  }
};
