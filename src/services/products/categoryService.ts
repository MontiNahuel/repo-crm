import api from '@/api/axios'

export interface ICategoria {
    id: number
    nombre: string
    descripcion: string | null
}

export interface ICategoriaCreate {
    nombre: string
    descripcion?: string | null
}

export interface ICategoriaUpdate {
    nombre?: string
    descripcion?: string | null
}

export const categoryService = {
    async getCategorias(skip: number = 0, limit: number = 100): Promise<ICategoria[]> {
        const { data } = await api.get<ICategoria[]>('/categorias/', {
            params: { skip, limit }
        })
        return data
    },

    async getCategoriaPorId(categoriaId: number): Promise<ICategoria> {
        const { data } = await api.get<ICategoria>(`/categorias/${categoriaId}`)
        return data
    },

    async crearCategoria(categoria: ICategoriaCreate): Promise<ICategoria> {
        const { data } = await api.post<ICategoria>('/categorias/', categoria)
        return data
    },

    async actualizarCategoria(categoriaId: number, categoria: ICategoriaUpdate): Promise<ICategoria> {
        const { data } = await api.patch<ICategoria>(`/categorias/${categoriaId}`, categoria)
        return data
    },

    async eliminarCategoria(categoriaId: number): Promise<void> {
        await api.delete(`/categorias/${categoriaId}`)
    }
}
