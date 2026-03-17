<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { clientService } from '@/services/clients/clientService';
import { type ICliente } from '@/services/clients/interfacesClientes';

import ModalNuevoCliente from '@/components/modals/ModalNuevoCliente.vue';
import PaginadorComponent from '@/components/ui/PaginadorComponent.vue';
import PanelContenedor from '@/components/ui/PanelContenedor.vue';
import { useToast } from '@/composables/useToast';

const clientes = ref<ICliente[]>([]);
const cantidadTotalClientes = ref(0);
const cargando = ref(false);
const buscador = ref('');

const limite = 7;
const skipActual = ref(0);

// Propiedades computadas para la interfaz (¡Magia de Vue!)
const paginaActual = computed(() => Math.floor(skipActual.value / limite) + 1)
const totalPaginas = computed(() => Math.ceil(cantidadTotalClientes.value / limite) || 1)

const mostrarModalNuevoCliente = ref(false)
const toast = useToast()

let timeoutBusqueda: ReturnType<typeof setTimeout> | null = null;

const cargarClientes = async () => {
    cargando.value = true;
    try {
        const respuesta = await clientService.getClientesPaginadosPorUsuario(skipActual.value, limite, buscador.value);
        clientes.value = respuesta.clientes;
        cantidadTotalClientes.value = respuesta.cantidadClientes;
    } catch (error) {
        console.error('Error al cargar clientes:', error);
    } finally {
        cargando.value = false;
    }
}

watch(buscador, (nuevoValor) => {
    if (timeoutBusqueda) {
        clearTimeout(timeoutBusqueda);
    }
    cargando.value = true; // Mostramos el spinner de inmediato
    timeoutBusqueda = setTimeout(() => {
        console.log("Buscando:", nuevoValor);
        
        // Reseteamos a la página 1 para que no nos quede un skip colgado
        skipActual.value = 0;
        
        // Ejecutamos la carga real
        cargarClientes();
        
    }, 500); // 500ms es el "punto dulce" entre respuesta rápida y ahorro de recursos
})

const paginaSiguiente = () => {
    if (skipActual.value + limite < cantidadTotalClientes.value) {
        skipActual.value += limite
        cargarClientes() // <-- Esto dispara el nuevo fetch
    }
}

const paginaAnterior = () => {
    if (skipActual.value >= limite) {
        skipActual.value -= limite
        cargarClientes() // <-- Esto dispara el nuevo fetch
    }
}

// Esta función se va a ejecutar cuando el modal nos avise que guardó con éxito
const onClienteCreado = () => {
    mostrarModalNuevoCliente.value = false // 1. Cerramos la ventana negra
    cargarClientes()                       // 2. Le pedimos a FastAPI los datos frescos
    toast.exito('¡Cliente creado con éxito!') // 3. Disparamos la magia del cartelito global
}

const onClienteError = (mensaje: string) => {
    toast.error(mensaje)
}

onMounted(() => {
    cargarClientes();
});
</script>

<template>
    <div class="space-y-6 animate-fade-in">
        
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold text-text-main transition-colors">Directorio de Clientes</h1>
                <p class="text-sm text-text-muted transition-colors">Gestioná tu cartera de clientes y leads</p>
            </div>
            
            <button @click="mostrarModalNuevoCliente = true" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-sm shadow-blue-200 dark:shadow-none">
                + Nuevo Cliente
            </button>
        </div>

        <PanelContenedor>
            
            <div class="p-4 border-b border-border-main bg-bg-main/50 flex gap-4 transition-colors">
                <div class="relative flex-1 max-w-md">
                    <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input type="text" v-model="buscador" placeholder="Buscar por nombre, empresa o email..."
                           class="w-full pl-10 pr-4 py-2 rounded-xl border border-border-main bg-sidebar text-text-main focus:ring-2 focus:ring-blue-500 outline-none transition text-sm">
                </div>
            </div>

            <div class="overflow-x-auto relative min-h-[200px]">
                
                <div v-if="cargando" class="absolute inset-0 bg-sidebar/60 backdrop-blur-sm z-10 flex justify-center items-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>

                <table class="w-full text-left text-sm text-text-main">
                    <thead class="bg-bg-main/80 text-text-muted font-semibold border-b border-border-main transition-colors">
                        <tr>
                            <th class="px-6 py-4">Nombre / Empresa</th>
                            <th class="px-6 py-4">Contacto</th>
                            <th class="px-6 py-4">Estado</th>
                            <th class="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-border-main transition-colors">
                        
                        <tr v-if="clientes.length === 0 && !cargando">
                            <td colspan="4" class="px-6 py-8 text-center text-text-muted">
                                No se encontraron clientes.
                            </td>
                        </tr>
                        
                        <tr v-for="cliente in clientes" :key="cliente.id" class="hover:bg-bg-hover transition-colors group">
                            <td class="px-6 py-4 font-medium text-text-main">{{ cliente.nombre }}</td>
                            <td class="px-6 py-4">
                                <div class="flex flex-col">
                                    <span class="text-text-main">{{ cliente.email }}</span>
                                    <span class="text-xs text-text-muted">{{ cliente.telefono }}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <span :class="{
                                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': cliente.estado === 'ACTIVO',
                                    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400': cliente.estado === 'LEAD',
                                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400': cliente.estado === 'INACTIVO',
                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': cliente.estado === 'PERDIDO'
                                }" class="px-2.5 py-1 rounded-md text-xs font-bold transition-colors">
                                    {{ cliente.estado }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <button class="text-blue-500 hover:text-blue-400 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                    Ver Detalle →
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <PaginadorComponent
                :pagina-actual="paginaActual"
                :total-paginas="totalPaginas"
                :total-items="cantidadTotalClientes"
                item-label="clientes"
                :cargando="cargando"
                :deshabilitar-anterior="skipActual === 0"
                :deshabilitar-siguiente="skipActual + limite >= cantidadTotalClientes"
                @anterior="paginaAnterior"
                @siguiente="paginaSiguiente"
            />
        </PanelContenedor>
    </div>
    
    <ModalNuevoCliente 
        v-if="mostrarModalNuevoCliente" 
        @cerrar="mostrarModalNuevoCliente = false" 
        @cliente-creado="onClienteCreado"
        @error="onClienteError"
    />
</template>

<style scoped>
/* Define la duración y el tipo de movimiento (suave) tanto al entrar como al salir */
.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Define el ESTADO INICIAL al entrar, y el ESTADO FINAL al salir */
/* (Es decir, arranca invisible y más abajo, y cuando se va, vuelve a ese estado) */
.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translateY(20px);
}
</style>