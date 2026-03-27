<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PanelContenedor from '@/components/ui/PanelContenedor.vue';
import ListaTareas from '@/components/tasks/ListaTareas.vue';
import { useTasks } from '@/composables/useTasks';
import { useTaskModals } from '@/composables/useTasksModal';
import { type ICliente } from '@/services/clients/interfacesClientes';
import { type Tarea } from '@/services/tareas/interfacesTareas';
import { clientService } from '@/services/clients/clientService';
import PaginadorComponent from '@/components/ui/PaginadorComponent.vue';
import NotasCliente from '@/components/viewClientes/NotasCliente.vue';
import StatusSelector from '@/components/ui/StatusSelector.vue';
import { useClients } from '@/composables/useClients';
import type { ClientStatus } from '@/consts/clientStatuses';

// --- Modales ---
import ModalConfirmacion from '@/components/modals/ModalConfirmacion.vue';
import CrearTareaModal from '@/components/modals/CrearTareaModal.vue';
import ModalTareasIA from '@/components/modals/ModalTareasIA.vue';

const route = useRoute();
const router = useRouter();
const paginaActual = ref(1)
const limit = 3
const masTareas = ref(true)
const { loadTasksByClient, toggleCompletada } = useTasks();
const { cambiarEstadoDelCliente, cambiandoEstado } = useClients();

const cliente = ref<ICliente | null>(null);
const cargando = ref(true);
const cargandoTareas = ref(true);

const tareasCliente = ref<Tarea[]>([]);

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

const cargarTareasCliente = async () => {
    if (!cliente.value) return;
    try {
        cargandoTareas.value = true;
        const skip = (paginaActual.value - 1) * limit
        tareasCliente.value = await loadTasksByClient(cliente.value.id, skip, limit, true);
        masTareas.value = tareasCliente.value.length === limit
        cargandoTareas.value = false;
    } catch (error) {
        console.error("Error al cargar tareas del cliente", error);
        cargandoTareas.value = false;
    }
}

const toggleTarea = async (tarea: Tarea) => {
    await toggleCompletada(tarea);
    if (tarea.esta_completada) {
        setTimeout(async () => {
            await cargarTareasCliente()
        }, 400);
    }
}

const modales = useTaskModals(async () => {
    // Si borramos el último ítem de la página, retrocedemos
    if (tareasCliente.value.length === 1 && paginaActual.value > 1) {
        paginaActual.value--;
    }
    await cargarTareasCliente();
});

const actualizarEstadoDelCliente = async (nuevoEstado: ClientStatus) => {
    // Solo pasamos el objeto y el nuevo valor. 
    // El composable se encarga del resto.
    await cambiarEstadoDelCliente(cliente.value!, nuevoEstado, cliente.value!.estado);
};

// Botones de Navegacion
const paginaAnterior = async () => {
    if (paginaActual.value === 1) return
    paginaActual.value--
    await cargarTareasCliente()
}

const paginaSiguiente = async () => {
    if (!masTareas.value) return
    paginaActual.value++
    await cargarTareasCliente()
}

onMounted(async () => {
    await cargarDetalleCliente();
    cargarTareasCliente();
});
</script>

<template>
    <div class="space-y-6 animate-fade-in max-w-6xl mx-auto p-4 md:p-0">
        
        <!--
        <div class="flex items-center gap-4 mb-2">
            <button @click="router.push('/clientes')" class="p-2 hover:bg-bg-hover rounded-lg text-text-muted transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </button>
            <div>
                <h1 class="text-2xl font-bold text-text-main transition-colors">Perfil del Cliente</h1>
            </div>
        </div>
        -->

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
                        
                        <div class="relative mt-2 inline-block">
                        <StatusSelector 
                            :model-value="cliente.estado" 
                            :disabled="cambiandoEstado"
                            @change="actualizarEstadoDelCliente" 
                        />
                    </div>
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
                        <button @click="modales.abrirModalCrear({ tipo: 'cliente', cliente_id: Number(route.params.id) })" class="text-sm text-blue-500 font-semibold hover:text-blue-400 transition-colors">
                            + Nueva Tarea
                        </button>
                    </div>
                    
                    <ListaTareas 
                        :tareas="tareasCliente" 
                        :cargando="cargandoTareas"
                        @toggle="toggleTarea"
                        @eliminar="modales.intentarEliminar"
                        @editar="modales.abrirModalEditar"
                    />

                    <PaginadorComponent
                        :pagina-actual="paginaActual"
                        :cargando="cargando"
                        :deshabilitar-anterior="paginaActual === 1"
                        :deshabilitar-siguiente="!masTareas"
                        @anterior="paginaAnterior"
                        @siguiente="paginaSiguiente"
                    />

                </PanelContenedor>

                <PanelContenedor>
                    <NotasCliente
                        :cliente-id="cliente.id"
                        @tareas-extraidas="modales.abrirModalTareasPorIA"
                    />
                </PanelContenedor>
            </div>
        </div>
        <Teleport to="body">
            <ModalConfirmacion 
                v-if="modales.mostrarModalEliminar.value" 
                titulo="Eliminar tarea" 
                mensaje="¿Estás seguro de que querés eliminar esta tarea del To-Do?" 
                textoConfirmar="Sí, eliminar" 
                :cargando="modales.eliminando.value" 
                @confirmar="modales.confirmarEliminacion" 
                @cancelar="modales.cancelarEliminacion" 
            />
            
            <CrearTareaModal 
                v-if="modales.mostrarModalCrearEditar.value" 
                :tareaAEditar="modales.tareaSeleccionada.value" 
                :valoresIniciales="modales.valoresPorDefecto.value"
                @close="modales.cerrarModalCrearEditar(false)" 
                @tarea-creada="modales.cerrarModalCrearEditar(true)" 
            />

            <ModalTareasIA 
                v-if="modales.mostrarModalIA.value" 
                :tareas="modales.tareasRecientesIA.value" 
                @close="modales.cerrarModalTareasPorIA(true)" 
                @borrar-tarea="modales.descartarTareaIA" 
            />
        </Teleport>
    </div>
</template>