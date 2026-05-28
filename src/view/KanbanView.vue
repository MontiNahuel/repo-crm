<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { clientService } from '@/services/clients/clientService'
import { useClients } from '@/composables/useClients'
import { CLIENT_STATUS_CONFIG, type ClientStatus } from '@/consts/clientStatuses'
import type { ICliente } from '@/services/clients/interfacesClientes'
import PanelContenedor from '@/components/ui/PanelContenedor.vue'

// Columnas fijas del Kanban en su orden de embudo (Pipeline)
const COLUMNAS: { key: ClientStatus; label: string; color: string; bgClass: string; textClass: string; borderClass: string }[] = [
    { key: 'LEAD', label: 'Lead / Prospecto', color: 'blue', bgClass: 'bg-blue-500/10', textClass: 'text-blue-500', borderClass: 'border-blue-500/20' },
    { key: 'ACTIVO', label: 'Cliente Activo', color: 'emerald', bgClass: 'bg-emerald-500/10', textClass: 'text-emerald-500', borderClass: 'border-emerald-500/20' },
    { key: 'INACTIVO', label: 'Inactivo', color: 'amber', bgClass: 'bg-amber-500/10', textClass: 'text-amber-500', borderClass: 'border-amber-500/20' },
    { key: 'PERDIDO', label: 'Perdido', color: 'rose', bgClass: 'bg-rose-500/10', textClass: 'text-rose-500', borderClass: 'border-rose-500/20' }
]

const pipeline = ref<Record<ClientStatus, ICliente[]>>({
    LEAD: [],
    ACTIVO: [],
    INACTIVO: [],
    PERDIDO: []
})

const cargando = ref(false)
const { cambiarEstadoDelCliente } = useClients()

// Carga la información agrupada por estado desde el backend
const cargarKanban = async () => {
    cargando.value = true
    try {
        const data = await clientService.getPipeline()
        // Nos aseguramos de rellenar todas las columnas vacías por seguridad
        pipeline.value = {
            LEAD: data.LEAD || [],
            ACTIVO: data.ACTIVO || [],
            INACTIVO: data.INACTIVO || [],
            PERDIDO: data.PERDIDO || []
        }
    } catch (error) {
        console.error('Error al cargar pipeline:', error)
    } finally {
        cargando.value = false
    }
}

// Variables temporales para el Drag & Drop nativo
const itemArrastrado = ref<ICliente | null>(null)
const columnaOrigen = ref<ClientStatus | null>(null)

const onDragStart = (cliente: ICliente, origen: ClientStatus) => {
    itemArrastrado.value = cliente
    columnaOrigen.value = origen
}

const onDragOver = (e: DragEvent) => {
    // Necesario para permitir que el drop se dispare
    e.preventDefault()
}

const onDrop = async (destino: ClientStatus) => {
    if (!itemArrastrado.value || !columnaOrigen.value) return
    
    const cliente = itemArrastrado.value
    const origen = columnaOrigen.value
    
    // Si se soltó en la misma columna, no hacemos nada
    if (origen === destino) {
        itemArrastrado.value = null
        columnaOrigen.value = null
        return
    }

    // 1. Efecto Visual Optimista Inmediato (Localmente)
    pipeline.value[origen] = pipeline.value[origen].filter(c => c.id !== cliente.id)
    pipeline.value[destino].push({ ...cliente, estado: destino })

    // Limpiamos los datos del arrastre
    itemArrastrado.value = null
    columnaOrigen.value = null

    try {
        // 2. Realizamos la llamada al service a través del composable (tiene rollback automático)
        await cambiarEstadoDelCliente(cliente, destino, origen)
    } catch (error) {
        // 3. Rollback en la vista si falla el backend
        cargarKanban()
    }
}

onMounted(() => {
    cargarKanban()
})
</script>

<template>
    <div class="space-y-6 animate-fade-in h-full flex flex-col">
        
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold text-text-main transition-colors">Pipeline de Ventas (Kanban)</h1>
                <p class="text-sm text-text-muted transition-colors">Arrastrá y soltá los clientes para actualizar su estado de embudo en tiempo real.</p>
            </div>
            
            <button @click="cargarKanban" class="bg-bg-main hover:bg-bg-hover text-text-main border border-border-main px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2">
                <svg :class="{'animate-spin': cargando}" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18"></path>
                </svg>
                Actualizar Tablero
            </button>
        </div>

        <div class="flex-1 overflow-x-auto pb-4 -mx-8 px-8 min-h-[500px]">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 min-w-[1000px] h-full items-start">
                
                <div 
                    v-for="columna in COLUMNAS" 
                    :key="columna.key" 
                    class="bg-sidebar border border-border-main rounded-2xl flex flex-col h-full max-h-[75vh] overflow-hidden transition-colors"
                    @dragover="onDragOver"
                    @drop="onDrop(columna.key)"
                >
                    <!-- Encabezado de la Columna -->
                    <div class="p-4 border-b border-border-main flex justify-between items-center transition-colors">
                        <div class="flex items-center gap-2">
                            <span :class="[columna.bgClass, columna.textClass]" class="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                                {{ columna.label }}
                            </span>
                        </div>
                        <span class="text-xs font-semibold text-text-muted bg-bg-main/50 px-2 py-0.5 rounded-md transition-colors">
                            {{ pipeline[columna.key]?.length || 0 }}
                        </span>
                    </div>

                    <!-- Lista de Tarjetas (Tarjetero scrollable) -->
                    <div class="flex-1 p-4 space-y-3 overflow-y-auto min-h-[300px] bg-bg-main/20 transition-colors">
                        <div v-if="cargando" class="flex justify-center py-10">
                            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        </div>

                        <div v-else-if="pipeline[columna.key]?.length === 0" class="flex flex-col items-center justify-center py-12 text-center text-text-muted select-none border border-dashed border-border-main/50 rounded-xl bg-sidebar/20">
                            <span class="text-2xl mb-1">📭</span>
                            <span class="text-xs">Sin clientes</span>
                        </div>

                        <div 
                            v-else 
                            v-for="cliente in pipeline[columna.key]" 
                            :key="cliente.id"
                            draggable="true"
                            @dragstart="onDragStart(cliente, columna.key)"
                            class="bg-sidebar hover:bg-bg-hover border border-border-main hover:border-slate-300 dark:hover:border-white/10 rounded-xl p-4 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all duration-200 group"
                        >
                            <div class="flex flex-col gap-2">
                                <div class="flex justify-between items-start gap-2">
                                    <h4 class="font-bold text-sm text-text-main group-hover:text-blue-500 transition-colors line-clamp-1">
                                        {{ cliente.nombre }}
                                    </h4>
                                </div>
                                
                                <div class="space-y-1">
                                    <p class="text-xs text-text-muted flex items-center gap-1.5 line-clamp-1">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                        </svg>
                                        {{ cliente.email }}
                                    </p>
                                    <p v-if="cliente.telefono" class="text-xs text-text-muted flex items-center gap-1.5 line-clamp-1">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 00.996.807h.465a1 1 0 00.996-.807l.548-2.2A1 1 0 0113 3H16a2 2 0 012 2v15a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"></path>
                                        </svg>
                                        {{ cliente.telefono }}
                                    </p>
                                </div>

                                <div class="pt-2.5 border-t border-border-main transition-colors flex justify-end">
                                    <router-link :to="{ name: 'cliente-detalle', params: { id: cliente.id } }" class="text-[11px] text-blue-500 font-bold hover:underline">
                                        Ver Perfil →
                                    </router-link>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>

    </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* Estilo para las tarjetas en arrastre */
[draggable="true"] {
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
}
</style>
