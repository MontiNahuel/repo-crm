import { ref } from 'vue'
import { groupService, type IGrupoTrabajo, type IMiembroEquipo } from '@/services/groups/groupService'
import { useToast } from './useToast'

export function useGroupsAdmin() {
    const toast = useToast()
    const grupos = ref<IGrupoTrabajo[]>([])
    const cargandoGrupos = ref(false)
    const guardandoGrupo = ref(false)

    const cargarGrupos = async () => {
        cargandoGrupos.value = true
        try {
            grupos.value = await groupService.getGrupos()
        } catch (error) {
            console.error('Error al cargar grupos:', error)
            toast.error('No se pudo cargar la lista de grupos.')
        } finally {
            cargandoGrupos.value = false
        }
    }

    const crearGrupo = async (nombre: string, descripcion: string) => {
        guardandoGrupo.value = true
        try {
            const nuevo = await groupService.crearGrupo(nombre, descripcion)
            grupos.value.push(nuevo)
            toast.exito('Grupo de trabajo creado con éxito.')
            return nuevo
        } catch (error) {
            console.error('Error al crear grupo:', error)
            toast.error('No se pudo crear el grupo de trabajo.')
            throw error
        } finally {
            guardandoGrupo.value = false
        }
    }

    const eliminarGrupo = async (grupoId: number) => {
        try {
            await groupService.eliminarGrupo(grupoId)
            grupos.value = grupos.value.filter(g => g.id !== grupoId)
            toast.exito('Grupo de trabajo eliminado.')
        } catch (error) {
            console.error('Error al eliminar grupo:', error)
            toast.error('No se pudo eliminar el grupo de trabajo.')
        }
    }

    const asignarMiembro = async (grupoId: number, usuarioId: number) => {
        try {
            const response = await groupService.asignarMiembro(grupoId, usuarioId)
            const grupo = grupos.value.find(g => g.id === grupoId)
            if (grupo) {
                // Agregar el miembro al array local
                grupo.miembros.push(response.usuario)
            }
            toast.exito('Miembro asignado con éxito.')
            return response
        } catch (error) {
            console.error('Error al asignar miembro:', error)
            toast.error('No se pudo asignar el miembro al grupo.')
            throw error
        }
    }

    const removerMiembro = async (grupoId: number, usuarioId: number) => {
        try {
            await groupService.removerMiembro(grupoId, usuarioId)
            const grupo = grupos.value.find(g => g.id === grupoId)
            if (grupo) {
                grupo.miembros = grupo.miembros.filter(m => (m.id !== usuarioId && m.user_id !== usuarioId))
            }
            toast.exito('Miembro removido con éxito.')
        } catch (error) {
            console.error('Error al remover miembro:', error)
            toast.error('No se pudo remover el miembro del grupo.')
        }
    }

    return {
        grupos,
        cargandoGrupos,
        guardandoGrupo,
        cargarGrupos,
        crearGrupo,
        eliminarGrupo,
        asignarMiembro,
        removerMiembro
    }
}
