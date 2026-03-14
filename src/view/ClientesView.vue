<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { clientService } from '@/services/clients/clientService';
import { type ICliente } from '@/services/clients/interfacesClientes';

import ModalNuevoCliente from '@/components/modals/ModalNuevoCliente.vue';
import { useToast } from '@/composables/useToast';

const clientes = ref<ICliente[]>([]);
const cantidadTotalClientes = ref(0);
const cargando = ref(false);
const buscador = ref('');

const limite = 10;
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
                <h1 class="text-2xl font-bold text-gray-800">Directorio de Clientes</h1>
                <p class="text-sm text-gray-500">Gestioná tu cartera de clientes y leads</p>
            </div>
            
            <button @click="mostrarModalNuevoCliente = true" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-sm shadow-blue-200">
                + Nuevo Cliente
            </button>
        </div>

        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            
            <div class="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-4">
                <div class="relative flex-1 max-w-md">
                    <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input type="text" v-model="buscador" placeholder="Buscar por nombre, empresa o email..."
                           class="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition text-sm">
                </div>
            </div>

            <div class="overflow-x-auto relative min-h-[200px]">
                
                <div v-if="cargando" class="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex justify-center items-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>

                <table class="w-full text-left text-sm text-gray-600">
                    <thead class="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-100">
                        <tr>
                            <th class="px-6 py-4">Nombre / Empresa</th>
                            <th class="px-6 py-4">Contacto</th>
                            <th class="px-6 py-4">Estado</th>
                            <th class="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        <tr v-if="clientes.length === 0 && !cargando">
                            <td colspan="4" class="px-6 py-8 text-center text-gray-400">
                                No se encontraron clientes.
                            </td>
                        </tr>
                        
                        <tr v-for="cliente in clientes" :key="cliente.id" class="hover:bg-gray-50/50 transition-colors group">
                            <td class="px-6 py-4 font-medium text-gray-800">{{ cliente.nombre }}</td>
                            <td class="px-6 py-4">
                                <div class="flex flex-col">
                                    <span>{{ cliente.email }}</span>
                                    <span class="text-xs text-gray-400">{{ cliente.telefono }}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <span :class="{
                                    'bg-green-100 text-green-700': cliente.estado === 'ACTIVO',
                                    'bg-orange-100 text-orange-700': cliente.estado === 'LEAD',
                                    'bg-blue-100 text-blue-700': cliente.estado === 'INACTIVO',
                                    'bg-red-100 text-red-700': cliente.estado === 'PERDIDO'
                                }" class="px-2.5 py-1 rounded-md text-xs font-bold">
                                    {{ cliente.estado }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <button class="text-blue-600 hover:text-blue-800 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                    Ver Detalle →
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="p-4 border-t border-gray-100 text-sm text-gray-500 flex justify-between items-center bg-gray-50/30">
                <span>
                    Mostrando página <span class="font-bold text-gray-700">{{ paginaActual }}</span> 
                    de <span class="font-bold text-gray-700">{{ totalPaginas }}</span> 
                    (Total: {{ cantidadTotalClientes }} clientes)
                </span>
                
                <div class="flex gap-2">
                    <button @click="paginaAnterior" 
                            :disabled="skipActual === 0 || cargando"
                            class="px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition bg-white font-medium">
                        Anterior
                    </button>
                    <button @click="paginaSiguiente" 
                            :disabled="skipActual + limite >= cantidadTotalClientes || cargando"
                            class="px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition bg-white font-medium">
                        Siguiente
                    </button>
                </div>
            </div>
        </div>
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