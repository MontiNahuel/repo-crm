<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useUserAdmin } from '@/composables/useUserAdmin'
import { useGroupsAdmin } from '@/composables/useGroupsAdmin'
import type { IUsuario } from '@/services/admin/userService'

import TablaUsuariosAdmin from '@/components/admin/TablaUsuariosAdmin.vue'
import ListaGruposAdmin from '@/components/admin/ListaGruposAdmin.vue'
import ModalUsuario from '@/components/modals/ModalUsuario.vue'
import ModalCrearGrupo from '@/components/modals/ModalCrearGrupo.vue'
import ModalConfirmacion from '@/components/modals/ModalConfirmacion.vue'

// Pestaña activa por defecto
const tabActiva = ref('usuarios')

const {
    usuarios,
    cargando: cargandoUsuarios,
    cargarUsuarios,
    toggleEstadoUsuario
} = useUserAdmin()

const {
    grupos,
    cargandoGrupos,
    cargarGrupos,
    eliminarGrupo,
    asignarMiembro,
    removerMiembro
} = useGroupsAdmin()

const mostrarModal = ref(false)
const mostrarModalGrupo = ref(false)
const usuarioSeleccionado = ref<IUsuario | null>(null)

// Confirmación de borrado de grupo
const mostrarConfirmacionGrupo = ref(false)
const grupoParaBorrar = ref<number | null>(null)
const eliminandoGrupo = ref(false)

onMounted(() => {
    cargarUsuarios()
    cargarGrupos()
})

const abrirCrear = () => {
    usuarioSeleccionado.value = null
    mostrarModal.value = true
}

const abrirEditar = (user: IUsuario) => {
    usuarioSeleccionado.value = user
    mostrarModal.value = true
}

const alGuardar = () => {
    mostrarModal.value = false
    cargarUsuarios()
}

const alGuardarGrupo = () => {
    mostrarModalGrupo.value = false
    cargarGrupos()
}

const solicitarBorradoGrupo = (grupoId: number) => {
    grupoParaBorrar.value = grupoId
    mostrarConfirmacionGrupo.value = true
}

const confirmarBorrarGrupo = async () => {
    if (grupoParaBorrar.value !== null) {
        eliminandoGrupo.value = true
        try {
            await eliminarGrupo(grupoParaBorrar.value)
            await cargarUsuarios()
        } finally {
            eliminandoGrupo.value = false
            grupoParaBorrar.value = null
            mostrarConfirmacionGrupo.value = false
        }
    }
}

// Filtro computado: Usuarios sin grupo (solo vendedores o supervisores)
const usuariosSinGrupo = computed(() => {
    const idsEnGrupos = new Set<number>()
    grupos.value.forEach(g => {
        g.miembros?.forEach(m => {
            if (m.id) idsEnGrupos.add(m.id)
            if (m.user_id) idsEnGrupos.add(m.user_id)
        })
    })
    return usuarios.value.filter(u => 
        !idsEnGrupos.has(u.id) && 
        (u.rol === 'VENDEDOR' || u.rol === 'SUPERVISOR') && 
        u.es_activo
    )
})

// Acciones sobre miembros
const alAsignarMiembro = async ({ grupoId, usuarioId }: { grupoId: number; usuarioId: number }) => {
    try {
        await asignarMiembro(grupoId, usuarioId)
        await cargarUsuarios()
    } catch (e) {
        console.error(e)
    }
}

const alRemoverMiembro = async ({ grupoId, usuarioId }: { grupoId: number; usuarioId: number }) => {
    await removerMiembro(grupoId, usuarioId)
    await cargarUsuarios()
}
</script>

<template>
    <div class="p-6 max-w-7xl mx-auto animate-fade-in">
        
        <!-- Cabecera -->
        <div class="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold text-text-main transition-colors">Torre de Control</h1>
                <p class="text-sm text-text-muted mt-1 transition-colors">Gestión general de usuarios, grupos y asignaciones del sistema.</p>
            </div>
            
            <button 
                v-if="tabActiva === 'usuarios'"
                @click="abrirCrear"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm hover:shadow"
            >
                <span>+</span> Nuevo Usuario
            </button>
            <button 
                v-else-if="tabActiva === 'grupos'"
                @click="mostrarModalGrupo = true"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm hover:shadow"
            >
                <span>+</span> Nuevo Grupo
            </button>
        </div>

        <!-- Selector de Pestañas -->
        <div class="flex space-x-1 bg-bg-main p-1 rounded-xl border border-border-main mb-6 transition-colors w-full md:w-max">
            <button @click="tabActiva = 'usuarios'"
                    :class="['px-4 py-2 text-sm font-medium rounded-lg transition-all flex-1 md:flex-none cursor-pointer', 
                            tabActiva === 'usuarios' ? 'bg-sidebar text-blue-500 shadow-sm font-semibold' : 'text-text-muted hover:text-text-main']">
                👤 Usuarios
            </button>
            <button @click="tabActiva = 'grupos'"
                    :class="['px-4 py-2 text-sm font-medium rounded-lg transition-all flex-1 md:flex-none cursor-pointer', 
                            tabActiva === 'grupos' ? 'bg-sidebar text-blue-500 shadow-sm font-semibold' : 'text-text-muted hover:text-text-main']">
                👥 Grupos de Trabajo
            </button>
            <button @click="tabActiva = 'tareas'"
                    :class="['px-4 py-2 text-sm font-medium rounded-lg transition-all flex-1 md:flex-none cursor-pointer', 
                            tabActiva === 'tareas' ? 'bg-sidebar text-blue-500 shadow-sm' : 'text-text-muted hover:text-text-main']">
                📋 Tareas Globales
            </button>
        </div>

        <!-- Contenedor Principal -->
        <div class="bg-sidebar border border-border-main rounded-2xl shadow-sm transition-colors overflow-hidden">
            
            <!-- Pestaña Usuarios -->
            <div v-if="tabActiva === 'usuarios'" class="p-6">
                <TablaUsuariosAdmin 
                    :usuarios="usuarios"
                    :cargando="cargandoUsuarios"
                    @editar="abrirEditar"
                    @toggle-estado="toggleEstadoUsuario"
                    @crear-primer-usuario="abrirCrear"
                />
            </div>

            <!-- Pestaña Grupos de Trabajo -->
            <div v-if="tabActiva === 'grupos'" class="p-6">
                <ListaGruposAdmin 
                    :grupos="grupos"
                    :cargando-grupos="cargandoGrupos"
                    :usuarios-sin-grupo="usuariosSinGrupo"
                    @eliminar-grupo="solicitarBorradoGrupo"
                    @asignar-miembro="alAsignarMiembro"
                    @remover-miembro="alRemoverMiembro"
                    @crear-primer-grupo="mostrarModalGrupo = true"
                    @nuevo-grupo="mostrarModalGrupo = true"
                />
            </div>

            <!-- Pestaña Tareas Globales (Teaser) -->
            <div v-if="tabActiva === 'tareas'" class="p-6 flex flex-col items-center justify-center text-center py-16">
                <div class="w-16 h-16 bg-bg-main rounded-full flex items-center justify-center mb-4 text-2xl border border-border-main">📋</div>
                <h3 class="text-text-main font-bold text-lg">Próximamente: Asignaciones</h3>
                <p class="text-text-muted text-sm mt-1 max-w-sm">Desde acá delegarás tareas a grupos enteros o vendedores específicos.</p>
            </div>

        </div>

        <!-- Modales Teletransportados al Body para evitar que el transform/animación del padre los recorte -->
        <Teleport to="body">
            <ModalUsuario 
                v-if="mostrarModal"
                :usuario="usuarioSeleccionado"
                @cerrar="mostrarModal = false"
                @guardado="alGuardar"
            />
        </Teleport>

        <Teleport to="body">
            <ModalCrearGrupo 
                v-if="mostrarModalGrupo"
                @cerrar="mostrarModalGrupo = false"
                @guardado="alGuardarGrupo"
            />
        </Teleport>

        <Teleport to="body">
            <ModalConfirmacion 
                v-if="mostrarConfirmacionGrupo"
                titulo="¿Eliminar Grupo de Trabajo?"
                mensaje="Esta acción es irreversible. El grupo de chat asociado en MongoDB y todos sus registros serán eliminados de inmediato. Los miembros del grupo no serán eliminados pero pasarán a ser colaboradores independientes."
                textoConfirmar="Eliminar Grupo"
                :cargando="eliminandoGrupo"
                @confirmar="confirmarBorrarGrupo"
                @cancelar="mostrarConfirmacionGrupo = false"
            />
        </Teleport>
    </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
</style>