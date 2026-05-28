<script setup lang="ts">
import { onMounted } from 'vue'
import ActividadReciente from '@/components/dashboard/ActividadReciente.vue'
import KpisDashboard from '@/components/dashboard/KpisDashboard.vue'
//import ClientesTotales from '@/components/dashboard/ClientesTotales.vue'
import UltimasTareas from '@/components/dashboard/UltimasTareas.vue'
import { useSocket } from '@/composables/useSocket'

const { connect } = useSocket()

onMounted(() => {
    connect() // Conectar al socket al montar el dashboard
})

</script>

<template>
    <div class="min-h-screen">
        
        <div class="flex items-center mb-6">
        </div>

        <KpisDashboard />

        <ActividadReciente />

        <UltimasTareas />

    </div>
</template>

<style scoped>
</style>