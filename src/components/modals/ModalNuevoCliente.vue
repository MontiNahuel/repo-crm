<script setup lang="ts">
import { ref } from 'vue'
import { clientService } from '@/services/clients/clientService'

// Eventos que este hijo le va a mandar al padre (ClientesView)
const emit = defineEmits(['cerrar', 'cliente-creado', 'error'])

// Estado del formulario
const formulario = ref({
    nombre: '',
    email: '',
    telefono: ''
})

const guardando = ref(false)

const submitFormulario = async () => {
    guardando.value = true
    try {
        await clientService.crearCliente(formulario.value)
        // Si todo sale bien, limpiamos y le avisamos al padre
        emit('cliente-creado')
        formulario.value = { nombre: '', email: '', telefono: '' }
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error al crear cliente:', error)
            const mensajeError = error.message || 'Ocurrió un error al crear el cliente.'
            emit('error', mensajeError)
        }
    } finally {
        guardando.value = false
    }
    
}
</script>

<template>
    <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex justify-center items-center animate-fade-in">
        
        <div class="bg-white rounded-2xl w-full max-w-md mx-4 shadow-xl overflow-hidden" @click.stop>
            
            <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 class="text-lg font-bold text-gray-800">Agregar Nuevo Cliente</h3>
                <button @click="$emit('cerrar')" class="text-gray-400 hover:text-gray-600 transition">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            <form @submit.prevent="submitFormulario" class="p-6 space-y-4">
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nombre o Empresa *</label>
                    <input v-model="formulario.nombre" type="text" required
                           class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition text-sm">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input v-model="formulario.email" type="email"
                           class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition text-sm">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input v-model="formulario.telefono" type="text"
                           class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition text-sm">
                </div>

                <div class="pt-4 flex gap-3 justify-end">
                    <button type="button" @click="$emit('cerrar')" :disabled="guardando"
                            class="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 border border-gray-200 transition">
                        Cancelar
                    </button>
                    <button type="submit" :disabled="guardando"
                            class="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-70">
                        <span v-if="guardando" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        {{ guardando ? 'Guardando...' : 'Guardar Cliente' }}
                    </button>
                </div>
                
            </form>
        </div>
    </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.2s ease-out; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>