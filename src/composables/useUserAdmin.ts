import { ref } from 'vue'
import { userService, type IUsuario, type IUsuarioEdicion } from '@/services/admin/userService'
import { useToast } from './useToast'

export function useUserAdmin() {
    const toast = useToast()
    const usuarios = ref<IUsuario[]>([])
    const cargando = ref(false)
    const guardando = ref(false)

    const cargarUsuarios = async () => {
        cargando.value = true
        try {
            usuarios.value = await userService.getUsers()
        } catch (error) {
            console.error('Error al cargar usuarios:', error)
            toast.error('No se pudo cargar la lista de usuarios.')
        } finally {
            cargando.value = false
        }
    }

    const guardarUsuario = async (datos: Omit<IUsuario, 'id' | 'es_activo'> & { password?: string }) => {
        guardando.value = true
        try {
            const nuevo = await userService.createUser(datos)
            usuarios.value.push(nuevo)
            toast.exito('Usuario creado correctamente.')
            return nuevo
        } catch (error) {
            console.error('Error al crear usuario:', error)
            toast.error('No se pudo crear el usuario.')
            throw error
        } finally {
            guardando.value = false
        }
    }

    const modificarUsuario = async (userId: number, datos: IUsuarioEdicion) => {
        guardando.value = true
        try {
            const actualizado = await userService.updateUser(userId, datos)
            const index = usuarios.value.findIndex(u => u.id === userId)
            if (index !== -1) {
                usuarios.value[index] = actualizado
            }
            toast.exito('Usuario actualizado correctamente.')
            return actualizado
        } catch (error) {
            console.error('Error al actualizar usuario:', error)
            toast.error('No se pudo actualizar el usuario.')
            throw error
        } finally {
            guardando.value = false
        }
    }

    const toggleEstadoUsuario = async (usuario: IUsuario) => {
        const nuevoEstado = !usuario.es_activo
        // Optimistic update
        usuario.es_activo = nuevoEstado
        try {
            await userService.updateUser(usuario.id, { es_activo: nuevoEstado })
            toast.exito(`Usuario ${nuevoEstado ? 'activado' : 'desactivado'} con éxito.`)
        } catch (error) {
            // Rollback on failure
            usuario.es_activo = !nuevoEstado
            console.error('Error al cambiar estado del usuario:', error)
            toast.error('No se pudo cambiar el estado del usuario.')
        }
    }

    return {
        usuarios,
        cargando,
        guardando,
        cargarUsuarios,
        guardarUsuario,
        modificarUsuario,
        toggleEstadoUsuario
    }
}
