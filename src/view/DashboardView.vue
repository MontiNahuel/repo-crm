<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import ActividadReciente from '@/components/dashboard/ActividadReciente.vue'
import KpisDashboard from '@/components/dashboard/KpisDashboard.vue'
import ClientesTotales from '@/components/dashboard/ClientesTotales.vue'
import UltimasTareas from '@/components/dashboard/UltimasTareas.vue'
import { useToast } from '@/composables/useToast'

const authStore = useAuthStore()

const toast = useToast()

const cerrarSesion = () => {
    authStore.logout()
    toast.info('Sesión cerrada')
}

</script>

<template>
    <div class="p-8 bg-gray-50 min-h-screen">
        <div class="flex items-center mb-6">
            <h1 class="text-3xl font-bold text-gray-800">Panel de Control ({{ authStore.userRole === 'ADMIN' && 'Administrador' }})</h1>
            
            <button 
                class="ml-auto bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow transition duration-200"
                @click="cerrarSesion"
            >
                Cerrar Sesión
            </button>
        </div>

        <ClientesTotales />

        <KpisDashboard />

        <ActividadReciente />

        <UltimasTareas />

    </div>
</template>

<style scoped>
</style>