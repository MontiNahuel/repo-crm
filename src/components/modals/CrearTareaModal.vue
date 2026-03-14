<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { tareaService } from '@/services/tareas/tareaService';
import { type ITareaCreate, type Tarea } from '@/services/tareas/interfacesTareas';
import { clientService } from '@/services/clients/clientService';
import { type ICliente } from '@/services/clients/interfacesClientes';

const emit = defineEmits(['close', 'tareaCreada'])

const props = defineProps<{
    tareaAEditar?: Tarea | null // Idealmente usá tu interfaz Tarea aquí
}>()

const cargando = ref(false)
const clientes = ref<ICliente[]>([]) // Para llenar el select de clientes

const form = ref<ITareaCreate>({
    titulo: '',
    tipo: 'personal',
    cliente_id: null,
    fecha_limite: null
})

const resetForm = () => {
    form.value = {
        titulo: '',
        tipo: 'personal',
        cliente_id: null,
        fecha_limite: null
    }
}

watch(() => props.tareaAEditar, (nuevaTarea) => {
    if (nuevaTarea) {
        // Si hay una tarea, llenamos los campos para EDITAR
        form.value = {
            titulo: nuevaTarea.titulo,
            tipo: nuevaTarea.tipo,
            cliente_id: nuevaTarea.cliente_id || null,
            fecha_limite: nuevaTarea.fecha_limite 
                ? String(nuevaTarea.fecha_limite).slice(0, 16) 
                : null
        }
    } else {
        // Si viene null o undefined, vaciamos para CREAR
        resetForm()
    }
}, { immediate: true }) // immediate: true hace que se ejecute ni bien se renderiza

onMounted(async () => {
    try {
        const data = await clientService.getClientsByUser() // Solo los clientes para admin
        clientes.value = data
    } catch (error) {
        console.error('Error al cargar clientes para el select:', error)
    }
})

const submitTarea = async () => {
    if (!form.value.titulo.trim()) return
    
    // Validación extra: si es de cliente, debe tener un ID
    if (form.value.tipo === 'cliente' && !form.value.cliente_id) {
        alert("Por favor, selecciona un cliente.")
        return
    }

    cargando.value = true
    try {
        if (props.tareaAEditar) {
            await tareaService.actualizarTarea(props.tareaAEditar.id!, form.value)
        } else {
            await tareaService.crearTarea(form.value)
        }
        emit('tareaCreada') // Avisamos al padre (Dashboard)
        emit('close')       // Cerramos el modal
    } catch (error) {
        console.log("Hubo un error al guardar la tarea", error)
    } finally {
        cargando.value = false
    }
}

</script>

<template>
    <div class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center">
        
        <div class="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
            
            <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 class="text-lg font-bold text-gray-800">Agregar nueva tarea</h3>
                <button @click="emit('close')" class="text-gray-400 hover:text-gray-600 transition">
                    ✕
                </button>
            </div>

            <form @submit.prevent="submitTarea" class="p-6 space-y-5">
                
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">¿Qué tenés que hacer?</label>
                    <input type="text" v-model="form.titulo" required autofocus
                           placeholder="Ej: Llamar para confirmar presupuesto..."
                           class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition">
                </div>

                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Tipo de Tarea</label>
                    <div class="flex p-1 bg-gray-100 rounded-lg" :class="{ 'opacity-60 cursor-not-allowed': tareaAEditar }">
                        <label class="flex-1 text-center" :class="{ 'cursor-pointer': !tareaAEditar, 'cursor-not-allowed': tareaAEditar }">
                            <input type="radio" v-model="form.tipo" value="personal" class="peer hidden" :disabled="!!tareaAEditar">
                            <div class="py-1.5 text-sm font-medium rounded-md text-gray-500 peer-checked:bg-white peer-checked:text-blue-600 peer-checked:shadow-sm transition-all">
                                ⚡ Personal
                            </div>
                        </label>
                        <label class="flex-1 text-center" :class="{ 'cursor-pointer': !tareaAEditar, 'cursor-not-allowed': tareaAEditar }">
                            <input type="radio" v-model="form.tipo" value="cliente" class="peer hidden" :disabled="!!tareaAEditar">
                            <div class="py-1.5 text-sm font-medium rounded-md text-gray-500 peer-checked:bg-white peer-checked:text-blue-600 peer-checked:shadow-sm transition-all">
                                👤 De Cliente
                            </div>
                        </label>
                    </div>
                    <p v-if="tareaAEditar" class="text-xs text-gray-400 mt-1 text-center">
                        El tipo de tarea no se puede modificar.
                    </p>
                    <div class="animate-fade-in mt-4">
                        <label class="block text-sm font-semibold text-gray-700 mb-1">
                            Fecha y Hora límite <span class="text-gray-400 font-normal">(Opcional)</span>
                        </label>
                        <input type="datetime-local" v-model="form.fecha_limite"
                            class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white transition text-sm">
                    </div>
                </div>

                <div v-if="form.tipo === 'cliente'" class="animate-fade-in">
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Seleccionar Cliente</label>
                    <select v-model="form.cliente_id" :disabled="!!tareaAEditar" required
                            class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                        <option :value="null" disabled>Elegí un cliente...</option>
                        <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
                            {{ cliente.nombre }} </option>
                    </select>
                </div>

                <div class="pt-4 flex gap-3">
                    <button type="button" @click="emit('close')"
                            class="flex-1 px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition">
                        Cancelar
                    </button>
                    <button type="submit" :disabled="cargando"
                            class="flex-1 px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition flex justify-center items-center disabled:opacity-70">
                        <span v-if="cargando" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                        Guardar Tarea
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
/* Animaciones simples y limpias para que no se sienta tosco al abrirse */
.animate-fade-in-up {
    animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.animate-fade-in {
    animation: fadeIn 0.2s ease-in-out;
}
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
</style>