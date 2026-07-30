<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PanelContenedor from '@/components/ui/PanelContenedor.vue'
import ModalResumenIa from '@/components/modals/ModalResumenIa.vue'
import { useResumenIa } from '@/composables/useResumenIa'

const props = defineProps<{
    clienteId: number
    clienteNombre: string
}>()

const { resumenIa, cargando, cargarResumen } = useResumenIa()
const mostrarModal = ref(false)

onMounted(async () => {
    await cargarResumen(props.clienteId)
})

// Función para actualizar la vista previa si el modal actualiza/genera un nuevo resumen
const onResumenActualizado = () => {
    cargarResumen(props.clienteId)
}

const limpiarMarkdownParaPreview = (text: string | null) => {
    if (!text) return ''
    // Remueve marcas markdown sencillas para mostrar texto plano en el preview
    return text
        .replace(/[#*`_-]/g, '')
        .trim()
        .substring(0, 100) + '...'
}

const formatearFecha = (fechaStr?: string) => {
    if (!fechaStr) return ''
    return new Date(fechaStr).toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'short'
    })
}
</script>

<template>
    <div class="space-y-4">
        <PanelContenedor>
            <div class="p-5 space-y-4">
                <!-- Header -->
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <span class="text-lg">✨</span>
                        <h4 class="text-sm font-bold text-text-main">Resumen con IA</h4>
                    </div>
                    <span 
                        v-if="resumenIa" 
                        class="text-[10px] bg-blue-500/10 text-blue-500 dark:bg-blue-950/30 dark:text-blue-400 font-semibold px-2 py-0.5 rounded-full"
                    >
                        Gemini
                    </span>
                </div>

                <!-- Estado Cargando -->
                <div v-if="cargando" class="py-4 flex justify-center">
                    <div class="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                </div>

                <!-- Con Resumen -->
                <div v-else-if="resumenIa && resumenIa.resumen" class="space-y-3">
                    <p class="text-xs text-text-muted leading-relaxed italic">
                        "{{ limpiarMarkdownParaPreview(resumenIa.resumen) }}"
                    </p>
                    <div class="text-[10px] text-text-muted flex justify-between items-center transition-colors">
                        <span>Generado: {{ formatearFecha(resumenIa.fecha) }}</span>
                        <button 
                            @click="mostrarModal = true" 
                            class="text-blue-500 font-bold hover:text-blue-400 transition cursor-pointer"
                        >
                            Ver informe completo →
                        </button>
                    </div>
                </div>

                <!-- Sin Resumen -->
                <div v-else class="space-y-3 text-center py-2">
                    <p class="text-xs text-text-muted">
                        Aún no se ha consolidado la información de este cliente mediante IA.
                    </p>
                    <button 
                        @click="mostrarModal = true" 
                        class="w-full bg-blue-600/10 hover:bg-blue-600 text-blue-600 hover:text-white dark:bg-blue-950/20 dark:hover:bg-blue-600 dark:text-blue-400 font-bold py-2 rounded-xl text-xs transition cursor-pointer"
                    >
                        Generar Informe Ejecutivo
                    </button>
                </div>
            </div>
        </PanelContenedor>

        <!-- Modal de Detalle e Historial -->
        <ModalResumenIa 
            v-if="mostrarModal"
            :cliente-id="props.clienteId"
            :cliente-nombre="props.clienteNombre"
            @close="mostrarModal = false"
            @updated="onResumenActualizado"
        />
    </div>
</template>
