<script setup lang="ts">
// Definimos las props para que el modal sirva para cualquier cosa, no solo tareas
defineProps({
    titulo: { type: String, default: '¿Estás seguro?' },
    mensaje: { type: String, default: 'Esta acción no se puede deshacer.' },
    textoConfirmar: { type: String, default: 'Eliminar' },
    textoCancelar: { type: String, default: 'Cancelar' },
    cargando: { type: Boolean, default: false } // Útil si el borrado tarda un poco
})

// Emitimos los eventos de respuesta
defineEmits(['confirmar', 'cancelar'])
</script>

<template>
    <div class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
        
        <div class="bg-white w-full max-w-sm rounded-2xl shadow-xl animate-fade-in-up p-6 text-center border border-gray-100">
            
            <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
            </div>
            
            <h3 class="text-xl font-bold text-gray-800 mb-2">{{ titulo }}</h3>
            <p class="text-sm text-gray-500 mb-6 px-2">{{ mensaje }}</p>
            
            <div class="flex gap-3">
                <button @click="$emit('cancelar')" :disabled="cargando"
                        class="flex-1 px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition disabled:opacity-50">
                    {{ textoCancelar }}
                </button>
                <button @click="$emit('confirmar')" :disabled="cargando"
                        class="flex-1 px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition flex justify-center items-center disabled:opacity-70 shadow-sm shadow-red-200">
                    <span v-if="cargando" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                    {{ textoConfirmar }}
                </button>
            </div>
            
        </div>
    </div>
</template>

<style scoped>
.animate-fade-in-up {
    animation: fadeInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(10px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>