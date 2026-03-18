<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PanelContenedor from '@/components/ui/PanelContenedor.vue';
import { type ICliente } from '@/services/clients/interfacesClientes';
import { clientService } from '@/services/clients/clientService';

const route = useRoute();
const router = useRouter();


const cliente = ref<ICliente | null>(null);
const cargando = ref(true);

const cargarDetalleCliente = async () => {
    cargando.value = true;
    try {
        const id = Number(route.params.id as string);
        
        if (isNaN(id)) {
            console.error("El ID del cliente no es un número válido");
            router.push('/clientes'); // Lo devolvemos a la tabla si hizo trampa en la URL
            return;
        }
        const response = await clientService.getClientById(id);
        cliente.value = response;
        cargando.value = false;
    } catch (error) {
        console.error("Error al cargar cliente", error);
        cargando.value = false;
    }
}

onMounted(() => {
    cargarDetalleCliente();
});
</script>

<template>
    <div class="space-y-6 animate-fade-in max-w-6xl mx-auto p-4 md:p-0">
        
        <div class="flex items-center gap-4 mb-2">
            <button @click="router.push('/clientes')" class="p-2 hover:bg-bg-hover rounded-lg text-text-muted transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </button>
            <div>
                <h1 class="text-2xl font-bold text-text-main transition-colors">Perfil del Cliente</h1>
            </div>
        </div>

        <div v-if="cargando" class="flex justify-center p-12">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>

        <div v-else-if="cliente" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div class="lg:col-span-1 space-y-6">
                <PanelContenedor>
                    <div class="p-6 flex flex-col items-center text-center border-b border-border-main transition-colors">
                        <div class="w-20 h-20 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full flex items-center justify-center text-3xl font-bold mb-4">
                            {{ cliente.nombre.charAt(0).toUpperCase() }}
                        </div>
                        <h2 class="text-xl font-bold text-text-main mb-1">{{ cliente.nombre }}</h2>
                        
                        <span :class="{
                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': cliente.estado === 'ACTIVO',
                            'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400': cliente.estado === 'LEAD',
                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400': cliente.estado === 'INACTIVO',
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': cliente.estado === 'PERDIDO'
                        }" class="px-3 py-1 rounded-md text-xs font-bold mt-2">
                            {{ cliente.estado }}
                        </span>
                    </div>

                    <div class="p-6 space-y-4">
                        <div>
                            <p class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Email</p>
                            <p class="text-sm text-text-main">{{ cliente.email }}</p>
                        </div>
                        <div>
                            <p class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Teléfono</p>
                            <p class="text-sm text-text-main">{{ cliente.telefono }}</p>
                        </div>
                        <!--
                        <div v-if="cliente.direccion">
                            <p class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Dirección</p>
                            <p class="text-sm text-text-main">{{ cliente.direccion }}</p>
                        </div>
                        -->
                        <div class="pt-4 border-t border-border-main transition-colors">
                            <button class="w-full bg-bg-main hover:bg-bg-hover text-text-main border border-border-main px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                                Editar Cliente
                            </button>
                        </div>
                    </div>
                </PanelContenedor>
            </div>

            <div class="lg:col-span-2 space-y-6">
                <PanelContenedor>
                    <div class="p-6 border-b border-border-main flex justify-between items-center transition-colors">
                        <h3 class="text-lg font-bold text-text-main">Tareas Pendientes</h3>
                        <button class="text-sm text-blue-500 font-semibold hover:text-blue-400 transition-colors">
                            + Nueva Tarea
                        </button>
                    </div>
                    
                    <div class="p-6 text-center text-text-muted">
                        <div class="text-4xl mb-3">📋</div>
                        <p>No hay tareas asignadas a este cliente todavía.</p>
                    </div>
                </PanelContenedor>

                <PanelContenedor>
                    <div class="p-6 border-b border-border-main transition-colors">
                        <h3 class="text-lg font-bold text-text-main">Historial de Notas</h3>
                    </div>
                    <div class="p-6 text-center text-text-muted">
                        <p class="text-sm">Próximamente: Registro de llamadas y reuniones.</p>
                    </div>
                </PanelContenedor>
            </div>

        </div>
    </div>
</template>