<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { clientService } from '@/services/clients/clientService';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore()

const totalClientes = ref(0)
const cargando = ref(true)

onMounted(async () => {
    try {
        console.log('Cargando total de clientes para el rol:', authStore.userRole)
        const data = await clientService.getClientsByRole(authStore.userRole)
        totalClientes.value = data.cantidadClientes
    } catch (error) {
        console.error('Error al cargar total de clientes:', error)
    } finally {
        cargando.value = false
    }
})

</script>

<template>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-sidebar p-6 rounded-xl shadow-sm border border-border-main transition-colors duration-300">
            <h3 class="text-text-muted text-sm font-medium">Clientes Totales</h3>
            
            <p v-if="cargando" class="text-3xl font-bold text-blue-200 animate-pulse mt-2">...</p>
            <p v-else class="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2 transition-colors">{{ totalClientes }}</p>
        </div>
    </div>
</template>