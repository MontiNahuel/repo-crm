<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { statisticsService } from '@/services/statistics/statisticsService'
import { type IKpisResponse } from '@/services/statistics/InterfacesStatistics'

import KpiPipelineItem from './KpiPipelineItem.vue'

import KpiCard from '@/components/dashboard/KpiCard.vue'

const cargando = ref(true)
const estadisticas = ref<IKpisResponse | null>(null)

onMounted(async () => {
    try {
        estadisticas.value = await statisticsService.getKpis()
    } catch (error) {
        console.error("No se pudieron cargar las estadísticas", error)
    } finally {
        cargando.value = false
    }
})
</script>

<template>
    <div v-if="cargando" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="estadisticas" class="space-y-6 animate-fade-in">
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <KpiCard 
                titulo="Win Rate" 
                :valor="`${estadisticas.kpis.tasa_conversion}%`" 
                descripcion="De negocios cerrados" 
                esPrincipal>
                <template #icono>
                    <div class="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                    </div>
                </template>
            </KpiCard>

            <KpiCard 
                titulo="Leads Nuevos" 
                :valor="estadisticas.kpis.leads_pendientes" 
                descripcion="Aún no contactados" 
                colorDescripcion="text-orange-600">
                <template #icono>
                    <div class="p-2 bg-orange-50 rounded-lg">
                        <svg class="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    </div>
                </template>
            </KpiCard>

            <KpiCard 
                titulo="Clientes Activos" 
                :valor="estadisticas.kpis.clientes_activos" 
                descripcion="Compradores recurrentes" 
                colorDescripcion="text-green-600">
                <template #icono>
                    <div class="p-2 bg-green-50 rounded-lg">
                        <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                </template>
            </KpiCard>

            <KpiCard 
                titulo="Total Histórico" 
                :valor="estadisticas.kpis.total_historico" 
                descripcion="Registros en base de datos">
                <template #icono>
                    <div class="p-2 bg-gray-50 rounded-lg">
                        <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    </div>
                </template>
            </KpiCard>
        </div>

        <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mt-6">
            <h4 class="text-sm font-bold text-gray-800 mb-4">Estado del Pipeline</h4>
            
            <div class="grid grid-cols-4 gap-2">
                <KpiPipelineItem 
                    :valor="estadisticas.pipeline.LEAD" 
                    etiqueta="Leads" 
                    colorFondo="bg-orange-100" 
                    colorTexto="text-orange-700" 
                />
                
                <KpiPipelineItem 
                    :valor="estadisticas.pipeline.ACTIVO" 
                    etiqueta="Activos" 
                    colorFondo="bg-green-100" 
                    colorTexto="text-green-700" 
                />

                <KpiPipelineItem 
                    :valor="estadisticas.pipeline.INACTIVO" 
                    etiqueta="Inactivos" 
                    colorFondo="bg-blue-100" 
                    colorTexto="text-blue-700" 
                />

                <KpiPipelineItem 
                    :valor="estadisticas.pipeline.PERDIDO" 
                    etiqueta="Perdidos" 
                    colorFondo="bg-red-100" 
                    colorTexto="text-red-700" 
                />
            </div>
        </div>
        
    </div>
</template>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>