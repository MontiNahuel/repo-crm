<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { tareaService } from '@/services/tareas/tareaService'
import { formatearFechaHora } from '@/core/dependencias'
import CrearTareaModal from '../modals/CrearTareaModal.vue'
import ModalConfirmacion from '../modals/ModalConfirmacion.vue'
import { type Tarea } from '@/services/tareas/interfacesTareas'

const tareas = ref<Tarea[]>([])
const cargando = ref(true)
const mostrarModal = ref(false)

const mostrarModalEliminar = ref(false)
const tareaAEliminar = ref<number | null>(null)
const eliminando = ref(false) // Para mostrar el spinner en el botón rojo

const tareaSeleccionada = ref<Tarea | null>(null)

const recargarTareas = () => {
    cargarTareas() 
}

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
    tarea.esta_completada = true 
    try {
        // 2. Le avisamos al backend
        await tareaService.toggleCompletada(tarea.id)
        // 3. Pequeño delay para que el usuario llegue a ver que se completó
        // antes de hacerla desaparecer y traer la siguiente de la fila
        setTimeout(async () => {
            await cargarTareas()
        }, 400) 
        
    } catch (error) {
        // Si falló el servidor, la volvemos a desmarcar
        tarea.esta_completada = false 
        console.error("No se pudo actualizar la tarea", error)
    }
}

const confirmarEliminacion = async () => {
    if (!tareaAEliminar.value) return

    eliminando.value = true
    const id = tareaAEliminar.value
    const estadoAnterior = [...tareas.value]
    
    // Eliminación optimista en la vista
    tareas.value = tareas.value.filter(t => t.id !== id)

    try {
        await tareaService.eliminarTarea(id)
        
        // Ocultamos el modal y limpiamos el ID
        mostrarModalEliminar.value = false
        tareaAEliminar.value = null
        
        // Recargamos las tareas para traer la siguiente
        setTimeout(async () => {
            await cargarTareas()
        }, 300)

    } catch (error) {
        tareas.value = estadoAnterior
        console.log('Hubo un error al intentar eliminar la tarea.', error)
    } finally {
        eliminando.value = false
    }
}

const intentarEliminarTarea = (tareaId: number) => {
    tareaAEliminar.value = tareaId
    mostrarModalEliminar.value = true
}

const cancelarEliminacion = () => {
    mostrarModalEliminar.value = false
    tareaAEliminar.value = null
}

const abrirModalEditar = (tarea: Tarea | null) => {
    tareaSeleccionada.value = tarea 
    mostrarModal.value = true
}

const guardarTareaEditada = () => {
    tareaSeleccionada.value = null
    mostrarModal.value = false
    setTimeout(async () => {
        await cargarTareas()
    }, 300)
}

const abrirModalCrear = () => {
    tareaSeleccionada.value = null
    mostrarModal.value = true
}


onMounted(cargarTareas)

</script>

<template>
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
        <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span class="text-blue-500">✅</span> Mis Tareas
            </h3>
            <button 
            @click="abrirModalCrear"
            class="text-sm font-semibold text-blue-600 hover:text-blue-800 transition">
                + Nueva
            </button>
            <Teleport to="body">
                <CrearTareaModal 
                    v-if="mostrarModal" 
                    @close="mostrarModal = false"
                    @tarea-creada="recargarTareas"
                />
            </Teleport>
        </div>

        <div v-if="cargando" class="space-y-4 flex-1">
            <div v-for="i in 4" :key="i" class="h-12 bg-gray-50 animate-pulse rounded-xl border border-gray-100"></div>
        </div>

        <div v-else-if="tareas.length === 0" class="text-center py-8 text-gray-400 flex-1 flex flex-col justify-center">
            <p>¡Todo al día! No tenés tareas pendientes.</p>
        </div>

        <ul v-else class="space-y-3 flex-1 overflow-y-auto">
            <li v-for="tarea in tareas" :key="tarea.id" 
                class="group relative flex items-start gap-3 p-3 rounded-xl border transition-all overflow-hidden"
                :class="tarea.esta_completada ? 'bg-gray-50 border-transparent opacity-60' : 'bg-white border-gray-100 hover:border-blue-100 shadow-sm'">
                
                <div class="pt-1">
                    <input type="checkbox" 
                           :checked="tarea.esta_completada"
                           @change="toggleTarea(tarea)"
                           class="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer">
                </div>

                <div class="flex-1 pr-10">
                    <p class="text-sm font-medium transition-all"
                       :class="tarea.esta_completada ? 'line-through text-gray-400' : 'text-gray-800'">
                        {{ tarea.titulo }}
                    </p>
                    
                    <div class="flex gap-2 mt-1.5">
                        <span v-if="tarea.tipo === 'cliente'" 
                              class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-blue-50 text-blue-700">
                            👤 Cliente #{{ tarea.cliente_id }}
                        </span>
                        <span v-else 
                              class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-purple-50 text-purple-700">
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
                <button @click="abrirModalEditar(tarea)" 
                        class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Editar tarea">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                </button>
                <button @click="intentarEliminarTarea(tarea.id)" 
                        class="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 transition-all z-10"
                        title="Eliminar tarea">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
                <Teleport to="body">
                    <ModalConfirmacion 
                        v-if="mostrarModalEliminar"
                        titulo="Eliminar tarea"
                        mensaje="¿Estás seguro de que querés eliminar esta tarea del To-Do? Esta acción no se puede deshacer."
                        textoConfirmar="Sí, eliminar"
                        :cargando="eliminando"
                        @confirmar="confirmarEliminacion"
                        @cancelar="cancelarEliminacion"
                    />
                </Teleport>
                <Teleport to="body">
                    <CrearTareaModal 
                        v-if="mostrarModal" 
                        :tareaAEditar="tareaSeleccionada"
                        @close="mostrarModal = false"
                        @tarea-creada="guardarTareaEditada" 
                    />
                </Teleport>
            </li>
        </ul>

        <div class="mt-4 pt-4 border-t border-gray-50">
            <button class="w-full text-center text-sm text-gray-500 hover:text-gray-800 font-medium transition">
                Ver todo mi To-Do
            </button>
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