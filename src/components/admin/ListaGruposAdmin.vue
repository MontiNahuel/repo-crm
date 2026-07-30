<script setup lang="ts">
import type { IGrupoTrabajo } from '@/services/groups/groupService'
import type { IUsuario } from '@/services/admin/userService'

defineProps<{
    grupos: IGrupoTrabajo[]
    cargandoGrupos: boolean
    usuariosSinGrupo: IUsuario[]
}>()

const emit = defineEmits<{
    (e: 'eliminarGrupo', grupoId: number): void
    (e: 'asignarMiembro', payload: { grupoId: number; usuarioId: number }): void
    (e: 'removerMiembro', payload: { grupoId: number; usuarioId: number }): void
    (e: 'crearPrimerGrupo'): void
    (e: 'nuevoGrupo'): void
}>()

const ejecutarAsignacion = (grupoId: number, event: Event) => {
    const target = event.target as HTMLSelectElement
    const userId = Number(target.value)
    if (!userId) return
    emit('asignarMiembro', { grupoId, usuarioId: userId })
    target.value = "" // reset dropdown
}
</script>

<template>
    <div>
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg font-bold text-text-main">Células Comerciales</h2>
            <button 
                @click="emit('nuevoGrupo')"
                class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition duration-200 cursor-pointer shadow-sm hover:shadow"
            >
                + Nuevo Grupo
            </button>
        </div>

        <!-- Cargando / Pulse Skeleton -->
        <div v-if="cargandoGrupos" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="i in 3" :key="i" class="h-44 bg-bg-main rounded-2xl animate-pulse border border-border-main/50 p-6 space-y-4">
                <div class="space-y-2">
                    <div class="h-4 w-32 bg-border-main rounded"></div>
                    <div class="h-3 w-48 bg-border-main rounded"></div>
                </div>
                <div class="h-10 bg-border-main rounded-xl"></div>
            </div>
        </div>

        <!-- Lista de Grupos -->
        <div v-else-if="grupos.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            <div 
                v-for="grupo in grupos" 
                :key="grupo.id" 
                class="bg-bg-main/30 border border-border-main rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:border-blue-500/30 shadow-sm"
            >
                <div>
                    <!-- Header de Tarjeta -->
                    <div class="flex justify-between items-start mb-3">
                        <div>
                            <h3 class="font-bold text-text-main text-base">{{ grupo.nombre }}</h3>
                            <p class="text-xs text-text-muted mt-0.5 line-clamp-2">{{ grupo.descripcion || 'Sin descripción.' }}</p>
                        </div>
                        <button 
                            @click="emit('eliminarGrupo', grupo.id)"
                            class="text-text-muted hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 transition cursor-pointer"
                            title="Eliminar Grupo"
                        >
                            ✕
                        </button>
                    </div>

                    <!-- Miembros del Grupo -->
                    <div class="space-y-2 mt-4">
                        <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider">Miembros ({{ grupo.miembros?.length || 0 }})</span>
                        
                        <div v-if="!grupo.miembros || grupo.miembros.length === 0" class="text-xs text-text-muted italic py-2">
                            Sin miembros asignados.
                        </div>
                        <div v-else class="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                            <div 
                                v-for="miembro in grupo.miembros" 
                                :key="miembro.id || miembro.user_id" 
                                class="flex justify-between items-center bg-sidebar border border-border-main/50 px-3 py-1.5 rounded-xl transition text-xs"
                            >
                                <div class="flex flex-col">
                                    <span class="font-semibold text-text-main">{{ miembro.nombre }} {{ miembro.apellido || '' }}</span>
                                    <span class="text-[9px] text-text-muted">{{ miembro.rol }}</span>
                                </div>
                                <button 
                                    @click="emit('removerMiembro', { grupoId: grupo.id, usuarioId: miembro.id || miembro.user_id || 0 })"
                                    class="text-text-muted hover:text-red-500 text-[10px] font-bold transition cursor-pointer"
                                    title="Remover de grupo"
                                >
                                    Quitar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Asignación de Miembros -->
                <div class="mt-5 pt-4 border-t border-border-main/50">
                    <label class="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Asignar Colaborador</label>
                    <select 
                        @change="ejecutarAsignacion(grupo.id, $event)"
                        class="w-full px-3 py-2 rounded-xl border border-border-main bg-sidebar text-text-main focus:ring-2 focus:ring-blue-500 outline-none transition text-xs cursor-pointer"
                    >
                        <option value="">-- Seleccionar --</option>
                        <option 
                            v-for="user in usuariosSinGrupo" 
                            :key="user.id" 
                            :value="user.id"
                        >
                            {{ user.nombre }} {{ user.apellido }} ({{ user.rol }})
                        </option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Estado Vacío -->
        <div v-else class="flex flex-col items-center justify-center py-16 text-center">
            <div class="w-14 h-14 bg-bg-main rounded-full flex items-center justify-center mb-3 text-2xl border border-border-main">👥</div>
            <h3 class="text-text-main font-bold text-sm">No hay grupos de trabajo creados</h3>
            <p class="text-text-muted text-xs mt-1 max-w-sm mb-4">Crea tu primer equipo comercial para organizar vendedores y delegar clientes de forma colaborativa.</p>
            <button 
                @click="emit('crearPrimerGrupo')"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
                Crear Primer Grupo
            </button>
        </div>
    </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
</style>
