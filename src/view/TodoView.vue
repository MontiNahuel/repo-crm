<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { type Tarea } from '@/services/tareas/interfacesTareas';
import { tareaService } from '@/services/tareas/tareaService';
import PaginadorComponent from '@/components/ui/PaginadorComponent.vue';
import PanelContenedor from '@/components/ui/PanelContenedor.vue';

const tareas = ref<Tarea[]>([])
const cargando = ref(true)
const paginaActual = ref(1)
const limit = 7
const masTareas = ref(true)


const cargarTareas = async () => {
    try {
        const skip = (paginaActual.value - 1) * limit
        tareas.value = await tareaService.getMisTareas(skip, limit, false) // Traemos las primeras 10 tareas sin importar su estado
        cargando.value = false
        masTareas.value = tareas.value.length === limit // Si trajo menos de 10, no hay más para cargar
    } catch (error) {
        console.error("Error al cargar tareas:", error)
        cargando.value = false
    }
}

const toggleCompletada = async (tarea: Tarea) => {
    tarea.esta_completada = !tarea.esta_completada
    try {
        await tareaService.toggleCompletada(tarea.id)
    } catch (error) {
        // Si falló el servidor, revertimos el cambio
        tarea.esta_completada = !tarea.esta_completada
        console.error("No se pudo actualizar la tarea", error)
    }
}

// Botones de Navegacion
const paginaAnterior = async () => {
    if (paginaActual.value === 1) return
    paginaActual.value--
    await cargarTareas()
}

const paginaSiguiente = async () => {
    if (!masTareas.value) return
    paginaActual.value++
    await cargarTareas()
}


onMounted(async () => {
    cargarTareas()
})

</script>
<template>
    <div class="p-6 max-w-4xl mx-auto animate-fade-in">
        
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-2xl font-bold text-text-main transition-colors">Mi To-Do List</h1>
                <p class="text-sm text-text-muted mt-1 transition-colors">Gestioná tus pendientes y organizá tu día.</p>
            </div>
            <button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm dark:shadow-none">
                + Nueva Tarea
            </button>
        </div>

        <PanelContenedor>
            
            <div v-if="cargando" class="p-12 text-center text-text-muted flex flex-col items-center">
                <svg class="animate-spin h-8 w-8 mb-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Cargando tus tareas...
            </div>

            <div v-else-if="tareas.length === 0" class="p-12 text-center">
                <div class="text-5xl mb-4">🎉</div>
                <h3 class="text-text-main font-bold text-lg">¡Todo al día!</h3>
                <p class="text-text-muted text-sm mt-1">No tenés tareas pendientes por el momento.</p>
            </div>

            <ul v-else class="divide-y divide-border-main transition-colors">
                <li v-for="tarea in tareas" :key="tarea.id" 
                    class="p-4 flex items-center gap-4 hover:bg-bg-hover transition-colors group">
                    
                    <button @click="toggleCompletada(tarea)" 
                            :class="['w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0',
                                    tarea.esta_completada ? 'bg-green-500 border-green-500 text-white' : 'border-border-main hover:border-blue-500 bg-transparent']">
                        <svg v-if="tarea.esta_completada" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                    </button>

                    <div class="flex-1 min-w-0 cursor-pointer" @click="toggleCompletada(tarea)">
                        <p :class="['text-sm font-medium truncate transition-all duration-200', 
                                   tarea.esta_completada ? 'text-text-muted line-through' : 'text-text-main']">
                            {{ tarea.titulo }}
                        </p>
                        
                        <div class="flex items-center gap-3 mt-1.5 text-xs text-text-muted">
                            <span v-if="tarea.tipo === 'cliente'" class="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-md font-semibold transition-colors">
                                Cliente
                            </span>
                            <span v-else class="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-0.5 rounded-md font-semibold transition-colors">
                                Personal
                            </span>
                            
                            <span v-if="tarea.fecha_limite" class="flex items-center gap-1">
                                📅 {{ new Date(tarea.fecha_limite).toLocaleDateString() }}
                            </span>
                        </div>
                    </div>

                    <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 shrink-0">
                        <button class="p-2 text-text-muted hover:text-blue-500 transition-colors rounded-lg hover:bg-bg-main" title="Editar">
                            ✏️
                        </button>
                        <button class="p-2 text-text-muted hover:text-red-500 transition-colors rounded-lg hover:bg-bg-main" title="Eliminar">
                            🗑️
                        </button>
                    </div>
                </li>
            </ul>
            
            <PaginadorComponent
                :pagina-actual="paginaActual"
                :cargando="cargando"
                :deshabilitar-anterior="paginaActual === 1"
                :deshabilitar-siguiente="!masTareas"
                @anterior="paginaAnterior"
                @siguiente="paginaSiguiente"
            />
        </PanelContenedor>
    </div>
</template>