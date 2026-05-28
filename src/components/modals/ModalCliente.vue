<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { clientService } from '@/services/clients/clientService'
import { useClients } from '@/composables/useClients'
import type { ICliente } from '@/services/clients/interfacesClientes'

// Propiedades que recibe el modal
const props = defineProps<{
    cliente?: ICliente | null // Si está presente, editamos. Si no, creamos.
}>()

// Eventos que este hijo le manda al padre
const emit = defineEmits(['cerrar', 'guardado', 'error'])

// Composable de clientes
const { editarCliente, guardando: editando } = useClients()

// Estado del formulario
const formulario = ref({
    nombre: '',
    email: '',
    telefono: ''
})

const guardando = ref(false)

onMounted(() => {
    // Si estamos editando, rellenamos el formulario con los datos actuales
    if (props.cliente) {
        formulario.value = {
            nombre: props.cliente.nombre,
            email: props.cliente.email || '',
            telefono: props.cliente.telefono || ''
        }
    }
})

const submitFormulario = async () => {
    guardando.value = true
    try {
        if (props.cliente) {
            // Caso: Edición
            await editarCliente(props.cliente.id, formulario.value)
            emit('guardado')
        } else {
            // Caso: Creación
            await clientService.crearCliente(formulario.value)
            emit('guardado')
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error al guardar cliente:', error)
            const mensajeError = error.message || 'Ocurrió un error al procesar el cliente.'
            emit('error', mensajeError)
        }
    } finally {
        guardando.value = false
    }
}
</script>

<template>
    <div class="fixed inset-0 bg-slate-900/65 backdrop-blur-md z-50 flex justify-center items-center animate-fade-in p-4">
        
        <div class="bg-white dark:bg-sidebar rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 dark:border-white/5" @click.stop>
            
            <div class="px-6 py-5 border-b border-border-main flex justify-between items-center transition-colors">
                <h3 class="text-lg font-bold text-text-main">
                    {{ props.cliente ? 'Editar Perfil del Cliente' : 'Agregar Nuevo Cliente' }}
                </h3>
                <button @click="$emit('cerrar')" class="p-1.5 rounded-lg text-text-muted hover:bg-bg-hover hover:text-text-main transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>

            <form @submit.prevent="submitFormulario" class="p-6 space-y-5">
                
                <div>
                    <label class="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Nombre o Empresa *</label>
                    <input 
                        v-model="formulario.nombre" 
                        type="text" 
                        required
                        placeholder="Ej: Acero S.A. o Juan Pérez"
                        class="w-full px-4 py-3 rounded-xl border border-border-main bg-bg-main/50 text-text-main focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                    >
                </div>

                <div>
                    <label class="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Email corporativo / personal</label>
                    <input 
                        v-model="formulario.email" 
                        type="email"
                        placeholder="ejemplo@empresa.com"
                        class="w-full px-4 py-3 rounded-xl border border-border-main bg-bg-main/50 text-text-main focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                    >
                </div>

                <div>
                    <label class="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Número de Teléfono</label>
                    <input 
                        v-model="formulario.telefono" 
                        type="text"
                        placeholder="Ej: +54 9 11 1234-5678"
                        class="w-full px-4 py-3 rounded-xl border border-border-main bg-bg-main/50 text-text-main focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                    >
                </div>

                <div class="pt-4 flex gap-3 justify-end border-t border-border-main transition-colors">
                    <button 
                        type="button" 
                        @click="$emit('cerrar')" 
                        :disabled="guardando || editando"
                        class="px-5 py-2.5 rounded-xl text-sm font-semibold text-text-muted hover:bg-bg-hover transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        :disabled="guardando || editando"
                        class="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-70 shadow-sm shadow-blue-200 dark:shadow-none"
                    >
                        <span v-if="guardando || editando" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        {{ (guardando || editando) ? 'Guardando...' : (props.cliente ? 'Guardar Cambios' : 'Registrar Cliente') }}
                    </button>
                </div>
                
            </form>
        </div>
    </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
</style>
