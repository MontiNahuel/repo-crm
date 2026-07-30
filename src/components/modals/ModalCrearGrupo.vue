<script setup lang="ts">
import { ref } from 'vue'
import { useGroupsAdmin } from '@/composables/useGroupsAdmin'

const emit = defineEmits<{
    (e: 'cerrar'): void
    (e: 'guardado'): void
}>()

const { crearGrupo, guardandoGrupo } = useGroupsAdmin()

const formulario = ref({
    nombre: '',
    descripcion: ''
})

const submitFormulario = async () => {
    if (!formulario.value.nombre.trim()) return
    try {
        await crearGrupo(formulario.value.nombre, formulario.value.descripcion)
        emit('guardado')
    } catch (error) {
        console.error('Error al crear grupo:', error)
    }
}
</script>

<template>
    <div class="fixed inset-0 bg-slate-900/65 backdrop-blur-md z-50 flex justify-center items-center p-4 animate-fade-in">
        <div class="bg-white dark:bg-sidebar border border-slate-100 dark:border-white/5 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" @click.stop>
            
            <!-- Encabezado -->
            <div class="px-6 py-5 border-b border-border-main flex justify-between items-center transition-colors">
                <h3 class="text-lg font-bold text-text-main">Crear Grupo de Trabajo</h3>
                <button @click="emit('cerrar')" class="p-1.5 rounded-lg text-text-muted hover:bg-bg-hover hover:text-text-main transition-colors cursor-pointer">
                    ✕
                </button>
            </div>

            <!-- Formulario -->
            <form @submit.prevent="submitFormulario" class="p-6 space-y-4">
                
                <div>
                    <label class="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Nombre del Grupo *</label>
                    <input 
                        v-model="formulario.nombre" 
                        type="text" 
                        required
                        placeholder="Ej: Ventas LATAM, Soporte Técnico"
                        class="w-full px-4 py-2.5 rounded-xl border border-border-main bg-bg-main/50 text-text-main focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                    >
                </div>

                <div>
                    <label class="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Descripción del Grupo</label>
                    <textarea 
                        v-model="formulario.descripcion" 
                        rows="3"
                        placeholder="Propósito del equipo, metas, o región a la que atiende..."
                        class="w-full px-4 py-2.5 rounded-xl border border-border-main bg-bg-main/50 text-text-main focus:ring-2 focus:ring-blue-500 outline-none transition text-sm resize-none"
                    ></textarea>
                </div>

                <!-- Botones -->
                <div class="pt-4 flex gap-3 justify-end border-t border-border-main transition-colors">
                    <button 
                        type="button" 
                        @click="emit('cerrar')" 
                        :disabled="guardandoGrupo"
                        class="px-5 py-2.5 rounded-xl text-sm font-semibold text-text-muted hover:bg-bg-hover transition cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        :disabled="guardandoGrupo"
                        class="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-70 cursor-pointer"
                    >
                        <span v-if="guardandoGrupo" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        {{ guardandoGrupo ? 'Creando...' : 'Crear Grupo' }}
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
