import { ref } from 'vue'
import { categoryService, type ICategoria, type ICategoriaCreate, type ICategoriaUpdate } from '@/services/products/categoryService'
import { useToast } from './useToast'

export function useCategories() {
    const toast = useToast()
    const categorias = ref<ICategoria[]>([])
    const cargandoCategorias = ref(false)
    const guardandoCategoria = ref(false)

    const cargarCategorias = async () => {
        cargandoCategorias.value = true
        try {
            categorias.value = await categoryService.getCategorias(0, 200)
        } catch (error) {
            console.error('Error al cargar categorías:', error)
            toast.error('No se pudo cargar la lista de categorías.')
        } finally {
            cargandoCategorias.value = false
        }
    }

    const crearNuevaCategoria = async (nombre: string, descripcion: string) => {
        guardandoCategoria.value = true
        try {
            const payload: ICategoriaCreate = {
                nombre: nombre.trim(),
                descripcion: descripcion.trim() || null
            }
            const nueva = await categoryService.crearCategoria(payload)
            categorias.value.push(nueva)
            toast.exito('Categoría creada con éxito.')
            return nueva
        } catch (error) {
            console.error('Error al crear categoría:', error)
            toast.error('No se pudo crear la categoría.')
            throw error
        } finally {
            guardandoCategoria.value = false
        }
    }

    const actualizarCategoriaExistente = async (id: number, nombre: string, descripcion: string) => {
        guardandoCategoria.value = true
        try {
            const payload: ICategoriaUpdate = {
                nombre: nombre.trim(),
                descripcion: descripcion.trim() || null
            }
            const actualizada = await categoryService.actualizarCategoria(id, payload)
            
            // Reemplazar localmente
            const idx = categorias.value.findIndex(c => c.id === id)
            if (idx !== -1) {
                categorias.value[idx] = actualizada
            }
            
            toast.exito('Categoría actualizada con éxito.')
            return actualizada
        } catch (error) {
            console.error('Error al actualizar categoría:', error)
            toast.error('No se pudo actualizar la categoría.')
            throw error
        } finally {
            guardandoCategoria.value = false
        }
    }

    const eliminarCategoriaExistente = async (id: number) => {
        try {
            await categoryService.eliminarCategoria(id)
            categorias.value = categorias.value.filter(c => c.id !== id)
            toast.exito('Categoría eliminada con éxito.')
        } catch (error: any) {
            console.error('Error al eliminar categoría:', error)
            // Si el backend lanza error de integridad referencial, informar al usuario
            const msg = error.response?.data?.detail || 'No se pudo eliminar la categoría. Verifique que no esté asignada a ningún producto.'
            toast.error(msg)
            throw error
        }
    }

    return {
        categorias,
        cargandoCategorias,
        guardandoCategoria,
        cargarCategorias,
        crearNuevaCategoria,
        actualizarCategoriaExistente,
        eliminarCategoriaExistente
    }
}
