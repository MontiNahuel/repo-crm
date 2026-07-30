<script setup lang="ts">
import type { IUsuario } from '@/services/admin/userService'

defineProps<{
    usuarios: IUsuario[]
    cargando: boolean
}>()

const emit = defineEmits<{
    (e: 'editar', user: IUsuario): void
    (e: 'toggleEstado', user: IUsuario): void
    (e: 'crearPrimerUsuario'): void
}>()
</script>

<template>
    <div>
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg font-bold text-text-main">Equipo Comercial</h2>
            <span class="text-xs bg-bg-main text-text-muted border border-border-main px-2.5 py-1 rounded-full font-medium">
                {{ usuarios.length }} Colaboradores
            </span>
        </div>
        
        <!-- Cargando / Pulse Skeleton -->
        <div v-if="cargando" class="space-y-4 py-2">
            <div v-for="i in 3" :key="i" class="h-14 bg-bg-main rounded-xl animate-pulse flex items-center justify-between px-4 border border-border-main/50">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-border-main rounded-full"></div>
                    <div class="space-y-1.5">
                        <div class="h-3 w-28 bg-border-main rounded"></div>
                        <div class="h-2 w-44 bg-border-main rounded"></div>
                    </div>
                </div>
                <div class="h-3 w-16 bg-border-main rounded"></div>
            </div>
        </div>

        <!-- Tabla de Usuarios -->
        <div v-else-if="usuarios.length > 0" class="overflow-x-auto animate-fade-in">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="border-b border-border-main text-text-muted text-xs uppercase tracking-wider font-semibold">
                        <th class="pb-3 px-4">Colaborador</th>
                        <th class="pb-3 px-4">Email</th>
                        <th class="pb-3 px-4">Rol</th>
                        <th class="pb-3 px-4">Estado</th>
                        <th class="pb-3 px-4 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in usuarios" :key="user.id" 
                        class="border-b border-border-main last:border-0 hover:bg-bg-hover transition-colors group"
                    >
                        <td class="py-3 px-4 font-semibold text-text-main flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-xs">
                                        {{ user.nombre.charAt(0).toUpperCase() }}
                            </div>
                            <div>
                                <span class="text-sm font-bold">{{ user.nombre }} {{ user.apellido }}</span>
                            </div>
                        </td>
                        <td class="py-3 px-4 text-text-muted text-sm">{{ user.email }}</td>
                        <td class="py-3 px-4">
                            <span :class="['px-2.5 py-0.5 text-[10px] font-bold rounded-full border', 
                                    user.rol === 'ADMIN' ? 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/30' : 
                                    user.rol === 'SUPERVISOR' ? 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/30' :
                                    'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30']">
                                {{ user.rol }}
                            </span>
                        </td>
                        <td class="py-3 px-4">
                            <button 
                                @click="emit('toggleEstado', user)"
                                class="flex items-center gap-1.5 text-xs font-semibold select-none cursor-pointer"
                                :class="user.es_activo ? 'text-green-500' : 'text-text-muted'"
                            >
                                <span class="w-1.5 h-1.5 rounded-full" :class="user.es_activo ? 'bg-green-500 animate-pulse' : 'bg-text-muted/60'"></span>
                                {{ user.es_activo ? 'Activo' : 'Inactivo' }}
                            </button>
                        </td>
                        <td class="py-3 px-4 text-right">
                            <button 
                                @click="emit('editar', user)"
                                class="text-xs text-blue-500 font-bold hover:underline cursor-pointer bg-transparent border-0"
                            >
                                Editar
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Estado Vacío -->
        <div v-else class="flex flex-col items-center justify-center py-16 text-center">
            <div class="w-14 h-14 bg-bg-main rounded-full flex items-center justify-center mb-3 text-2xl border border-border-main">👥</div>
            <h3 class="text-text-main font-bold text-sm">No hay colaboradores registrados</h3>
            <p class="text-text-muted text-xs mt-1 max-w-sm mb-4">Comienza registrando tu primer ejecutivo de ventas o supervisor de célula.</p>
            <button 
                @click="emit('crearPrimerUsuario')"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
                Registrar Primer Usuario
            </button>
        </div>
    </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
</style>
