import api from "@/api/axios"

export interface IUsuario {
    id: number;
    email: string;
    rol: string;
    es_activo: boolean;
    nombre: string;
    apellido: string;
    grupo_id?: number | null;
}

export interface IUsuarioEdicion {
    nombre?: string;
    apellido?: string;
    email?: string;
    password?: string;
    rol?: string;
    es_activo?: boolean;
}

export const userService = {
    async getUsers(skip = 0, limit = 100): Promise<IUsuario[]> {
        try {
            const { data } = await api.get('/usuarios/', {
                params: { skip, limit }
            })
            return data
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error al listar usuarios: ${error.message}`)
            }
            throw new Error('Error inesperado al listar usuarios.')
        }
    },

    async createUser(usuario: Omit<IUsuario, 'id' | 'es_activo'> & { password?: string }): Promise<IUsuario> {
        try {
            const { data } = await api.post('/usuarios/', usuario)
            return data
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error al crear usuario: ${error.message}`)
            }
            throw new Error('Error inesperado al registrar el usuario.')
        }
    },

    async updateUser(userId: number, datos: IUsuarioEdicion): Promise<IUsuario> {
        try {
            const { data } = await api.patch(`/usuarios/${userId}`, datos)
            return data
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error al actualizar usuario: ${error.message}`)
            }
            throw new Error('Error inesperado al actualizar el usuario.')
        }
    }
}
