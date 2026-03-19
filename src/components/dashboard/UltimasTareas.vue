<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { tareaService } from '@/services/tareas/tareaService'
import { formatearFechaHora } from '@/core/dependencias'
import CrearTareaModal from '../modals/CrearTareaModal.vue'
import ModalConfirmacion from '../modals/ModalConfirmacion.vue'
import { type Tarea } from '@/services/tareas/interfacesTareas'
import { useSocket } from '@/composables/useSocket'
import { useTasks } from '@/composables/useTasks'
import { useTaskModals } from '@/composables/useTasksModal'

const { socket } = useSocket()
const { toggleCompletada } = useTasks()

const tareas = ref<Tarea[]>([])
const cargando = ref(true)

const cargarTareas = async () => {
    try {
        tareas.value = await tareaService.getMisTareas(0, 3, true) // Solo las últimas 3 tareas pendientes
    } catch (error) {
        // Acá podrías meter un toast/alerta
        console.error("Error al cargar tareas:", error)
    } finally {
        cargando.value = false
    }
}

const toggleTarea = async (tarea: Tarea) => {
    // 1. El composable hace el cambio optimista, llama al backend y tira el Toast
    await toggleCompletada(tarea);

    // 2. Si la tarea quedó completada, le damos 400ms para que vea el check 
    // y recargamos para que venga la siguiente tarea pendiente a ocupar su lugar
    if (tarea.esta_completada) {
        setTimeout(async () => {
            await cargarTareas()
        }, 400);
    }
}

const modales = useTaskModals(async () => {
    // Si borramos el último ítem de la página, retrocedemos
    await cargarTareas();
});



onMounted(cargarTareas)

socket.on('tareas_actualizadas', () => {
    cargarTareas()
})

</script>

<template>
    <div class="bg-sidebar p-6 rounded-2xl shadow-sm border border-border-main flex flex-col h-full transition-colors duration-300">
        
        <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-text-main flex items-center gap-2 transition-colors">
                <span class="text-blue-500">✅</span> Mis Tareas
            </h3>
            <button 
            @click="modales.abrirModalCrear()"
            class="text-sm font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition">
                + Nueva
            </button>
            <Teleport to="body">
                <CrearTareaModal v-if="modales.mostrarModalCrearEditar.value" @close="modales.cerrarModalCrearEditar(false)" @tarea-creada="modales.cerrarModalCrearEditar(true)"/>
            </Teleport>
        </div>

        <div v-if="cargando" class="space-y-4 flex-1">
            <div v-for="i in 4" :key="i" class="h-12 bg-bg-hover animate-pulse rounded-xl border border-border-main"></div>
        </div>

        <div v-else-if="tareas.length === 0" class="text-center py-8 text-text-muted flex-1 flex flex-col justify-center transition-colors">
            <p>¡Todo al día! No tenés tareas pendientes.</p>
        </div>

        <ul v-else class="space-y-3 flex-1 overflow-y-auto">
            <li v-for="tarea in tareas" :key="tarea.id" 
                class="group relative flex items-start gap-3 p-3 rounded-xl border transition-all overflow-hidden"
                :class="tarea.esta_completada ? 'bg-bg-hover border-transparent opacity-60' : 'bg-sidebar border-border-main hover:border-blue-200 dark:hover:border-blue-800 shadow-sm'">
                
                <div class="pt-1">
                    <input type="checkbox" 
                           :checked="tarea.esta_completada"
                           @change="toggleTarea(tarea)"
                           class="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-800 cursor-pointer">
                </div>

                <div class="flex-1 pr-10">
                    <p class="text-sm font-medium transition-colors"
                       :class="tarea.esta_completada ? 'line-through text-text-muted' : 'text-text-main'">
                        {{ tarea.titulo }}
                    </p>
                    
                    <div class="flex gap-2 mt-1.5">
                        <span v-if="tarea.tipo === 'cliente'" 
                              class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-bg-etiqueta-cliente text-text-etiqueta-cliente transition-colors">
                            👤 Cliente #{{ tarea.cliente_id }}
                        </span>
                        <span v-else 
                              class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-bg-etiqueta-personal text-text-etiqueta-personal transition-colors">
                            ⚡ Personal
                        </span>
                        <span v-if="tarea.fecha_limite" 
                            class="inline-flex items-center text-[11px] font-medium"
                            :class="tarea.esta_completada ? 'text-gray-400' : 'text-orange-600'">
                            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            {{ formatearFechaHora(tarea.fecha_limite) }}
                        </span>
                    </div>
                </div>

                <button @click="modales.abrirModalEditar(tarea)" 
                        class="p-2 rounded-lg transition-all text-text-icon-default hover:text-text-icon-edit-hover hover:bg-bg-icon-edit-hover"
                        title="Editar tarea">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
                <button @click="modales.intentarEliminar(tarea.id)" 
                        class="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 transition-all z-10 text-text-icon-default hover:text-text-icon-delete-hover hover:bg-bg-icon-delete-hover"
                        title="Eliminar tarea">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
                
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
                        @close="modales.cerrarModalCrearEditar(false)" 
                        @tarea-creada="modales.cerrarModalCrearEditar(true)" 
                    />
                </Teleport>

            </li>
        </ul>

        <div class="w-full mt-4 pt-4 border-t border-border-main transition-colors flex justify-center">
            <router-link 
                    to="/todo" 
                    class="flex items-center text-sm text-text-muted hover:text-text-main font-medium transition-colors">
                Ver todo mi To-Do
            </router-link>
        </div>
    </div>
</template>

<style scoped>
/* Agrega una transición suave al tachar y ocultar */
li {
    transition: all 0.3s ease-in-out;
}

/* Opcional: Animar la entrada de los nuevos elementos */
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>