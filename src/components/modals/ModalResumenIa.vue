<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useResumenIa, type IResumenIa } from '@/composables/useResumenIa'

const props = defineProps<{
    clienteId: number
    clienteNombre: string
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'updated', nuevoResumen: IResumenIa): void
}>()

const {
    resumenIa,
    historial,
    generando,
    cargandoHistorial,
    generarResumen,
    cargarHistorial
} = useResumenIa()

const resumenSeleccionado = ref<IResumenIa | null>(null)

// Carga el historial al abrir el modal
onMounted(async () => {
    await cargarHistorial(props.clienteId)
    if (historial.value.length > 0) {
        resumenSeleccionado.value = historial.value[0] || null
    }
})

// Escucha si hay nuevos resúmenes generados para seleccionarlos por defecto
watch(resumenIa, (nuevo) => {
    if (nuevo) {
        resumenSeleccionado.value = nuevo
        emit('updated', nuevo)
    }
})

const ejecutarGeneracion = async () => {
    await generarResumen(props.clienteId)
    await cargarHistorial(props.clienteId)
}

const seleccionarResumen = (res: IResumenIa) => {
    resumenSeleccionado.value = res
}

// Convertir Markdown simple a HTML con seguridad básica
const formatearMarkdown = (text: string | null) => {
    if (!text) return ''
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')

    html = html.replace(/^### (.*$)/gim, '<h4 class="text-xs font-bold text-text-main mt-4 mb-1 uppercase tracking-wider">$1</h4>')
    html = html.replace(/^## (.*$)/gim, '<h3 class="text-sm font-bold text-text-main mt-5 mb-2 border-b border-border-main/50 pb-1">$1</h3>')
    html = html.replace(/^# (.*$)/gim, '<h2 class="text-base font-bold text-text-main mt-6 mb-3">$1</h2>')
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-text-main">$1</strong>')
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')

    const lineas = html.split('\n')
    let enLista = false
    for (let i = 0; i < lineas.length; i++) {
        const item = lineas[i]
        if (item === undefined) continue
        const linea = item.trim()
        if (linea.startsWith('* ') || linea.startsWith('- ')) {
            const contenido = linea.substring(2)
            lineas[i] = `<li class="ml-4 list-disc text-sm text-text-muted mb-1">${contenido}</li>`
            if (!enLista) {
                lineas[i] = `<ul class="space-y-0.5 my-2">` + lineas[i]
                enLista = true
            }
        } else {
            if (enLista && i > 0) {
                const prev = lineas[i - 1]
                if (prev !== undefined) {
                    lineas[i - 1] = prev + '</ul>'
                }
                enLista = false
            }
            if (linea && !linea.startsWith('<h') && !linea.startsWith('<u') && !linea.startsWith('<l')) {
                lineas[i] = `<p class="text-sm text-text-muted mb-2.5 leading-relaxed">${linea}</p>`
            }
        }
    }
    if (enLista) {
        lineas[lineas.length - 1] = (lineas[lineas.length - 1] || '') + '</ul>'
    }
    return lineas.join('\n')
}

const formatearFecha = (fechaStr?: string) => {
    if (!fechaStr) return ''
    return new Date(fechaStr).toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    })
}
</script>

<template>
    <Teleport to="body">
        <div 
            class="fixed inset-0 bg-slate-900/20 dark:bg-slate-950/40 backdrop-blur-md z-50 flex justify-center items-center p-4"
            @click.self="emit('close')"
        >
            <div class="bg-sidebar border border-border-main rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">
                
                <!-- Encabezado -->
                <div class="p-6 border-b border-border-main flex justify-between items-center bg-sidebar transition-colors shrink-0">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center text-lg">
                            ✨
                        </div>
                        <div>
                            <h3 class="font-bold text-lg text-text-main">Perfil Inteligente</h3>
                            <p class="text-xs text-text-muted">Resumen ejecutivo generado para {{ props.clienteNombre }}</p>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-3">
                        <button 
                            @click="ejecutarGeneracion" 
                            :disabled="generando"
                            class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-500/10"
                        >
                            <span v-if="generando" class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            {{ generando ? 'Generando análisis...' : 'Regenerar con IA' }}
                        </button>
                        <button 
                            @click="emit('close')" 
                            class="text-text-muted hover:text-text-main bg-bg-main hover:bg-bg-hover w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <!-- Contenido Principal Split -->
                <div class="flex flex-1 overflow-hidden min-h-0">
                    
                    <!-- Columna Izquierda: Historial de Informes -->
                    <div class="w-64 border-r border-border-main bg-bg-main/30 flex flex-col transition-colors shrink-0 overflow-y-auto">
                        <div class="p-4 border-b border-border-main shrink-0">
                            <h4 class="text-xs font-bold text-text-muted uppercase tracking-wider">Historial de Reportes</h4>
                        </div>
                        
                        <div v-if="cargandoHistorial" class="flex justify-center p-6">
                            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        </div>

                        <div v-else-if="historial.length === 0" class="p-6 text-center text-xs text-text-muted">
                            No hay informes anteriores guardados.
                        </div>

                        <div v-else class="p-2 space-y-1">
                            <button
                                v-for="res in historial"
                                :key="res.id || res.fecha"
                                @click="seleccionarResumen(res)"
                                class="w-full text-left p-3 rounded-xl transition flex flex-col gap-1 cursor-pointer"
                                :class="[
                                    resumenSeleccionado?.id === res.id || resumenSeleccionado?.fecha === res.fecha
                                        ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-500/20 text-blue-600 dark:text-blue-400'
                                        : 'hover:bg-bg-hover text-text-muted hover:text-text-main border border-transparent'
                                ]"
                            >
                                <span class="text-xs font-bold">{{ formatearFecha(res.fecha) }}</span>
                                <span class="text-[10px] opacity-80 truncate">
                                    Por: {{ typeof res.solicitante === 'string' ? res.solicitante : (res.solicitante?.nombre + ' ' + (res.solicitante?.apellido || '')) }}
                                </span>
                            </button>
                        </div>
                    </div>

                    <!-- Columna Derecha: Vista del Reporte Seleccionado -->
                    <div class="flex-1 overflow-y-auto p-6 bg-sidebar transition-colors">
                        
                        <div v-if="generando && !resumenSeleccionado" class="flex flex-col items-center justify-center h-full text-center">
                            <div class="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 border border-blue-500/20 relative">
                                <span class="text-2xl animate-pulse">✨</span>
                                <div class="absolute inset-0 border-2 border-dashed border-blue-500 rounded-full animate-spin duration-3000"></div>
                            </div>
                            <h4 class="text-text-main font-bold text-sm">Gemini está analizando la cuenta...</h4>
                            <p class="text-text-muted text-xs mt-1 max-w-xs">Uniendo notas de ventas, tareas resueltas e historial de cambios.</p>
                        </div>

                        <div v-else-if="resumenSeleccionado">
                            <div class="flex justify-between items-center pb-4 border-b border-border-main/50 mb-6 text-xs text-text-muted">
                                <span>Solicitante: <strong class="text-text-main font-semibold">{{ typeof resumenSeleccionado.solicitante === 'string' ? resumenSeleccionado.solicitante : (resumenSeleccionado.solicitante?.nombre + ' ' + (resumenSeleccionado.solicitante?.apellido || '')) }}</strong></span>
                                <span>Fecha: <strong class="text-text-main font-semibold">{{ formatearFecha(resumenSeleccionado.fecha) }}</strong></span>
                            </div>

                            <div 
                                class="markdown-body text-text-muted space-y-3 leading-relaxed"
                                v-html="formatearMarkdown(resumenSeleccionado.resumen)"
                            ></div>
                        </div>

                        <div v-else class="flex flex-col items-center justify-center h-full text-center py-12">
                            <div class="w-16 h-16 bg-bg-main rounded-full flex items-center justify-center mb-4 text-3xl border border-border-main">✨</div>
                            <h4 class="text-text-main font-bold text-sm">Sin informe ejecutivo generado</h4>
                            <p class="text-text-muted text-xs mt-1 max-w-xs mb-4">Usa el botón de arriba para iniciar un escaneo del cliente mediante IA.</p>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    </Teleport>
</template>
