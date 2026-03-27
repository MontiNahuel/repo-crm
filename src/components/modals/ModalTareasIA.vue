<script setup lang="ts">
import type { Tarea } from '@/services/tareas/interfacesTareas';

defineProps<{
    tareas: Tarea[];
}>();

const emit = defineEmits(['close', 'borrar-tarea']);

</script>

<template>
    <div class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
        
        <div class="bg-sidebar w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-fade-in-up border border-border-main flex flex-col max-h-[90vh]">
            
            <div class="px-6 py-4 border-b border-border-main flex justify-between items-center bg-bg-hover shrink-0">
                <h3 class="text-lg font-bold text-text-main flex items-center gap-2">
                    <span>✨</span> Tareas Extraídas
                </h3>
                <button @click="emit('close')" class="text-text-muted hover:text-text-main transition-colors text-xl">
                    ✕
                </button>
            </div>

            <div class="p-6 overflow-y-auto space-y-4 flex-1">
                <p v-if="tareas.length > 0" class="text-sm text-text-muted mb-2">
                    Gemini analizó la nota y agregó esto a la agenda:
                </p>
                <p v-else class="text-sm text-text-muted text-center py-4">
                    Ya no quedan tareas nuevas.
                </p>

                <div v-for="tarea in tareas" :key="tarea.id" 
                     class="p-4 bg-bg-main rounded-xl border border-border-main relative group hover:border-blue-500/30 transition-colors pr-10">
                    
                    <span class="absolute -top-2.5 -left-2 bg-emerald-500 text-white text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full shadow-md animate-pulse">
                        Nueva
                    </span>
                    
                    <h4 class="font-bold text-text-main text-sm mb-1">{{ tarea.titulo }}</h4>
                    <!--<p class="text-xs text-text-muted leading-relaxed">{{ tarea.descripcion }}</p>-->

                    <button @click="emit('borrar-tarea', tarea.id)" 
                            class="absolute top-1/2 -translate-y-1/2 right-3 text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-lg hover:bg-red-500/10"
                            title="Descartar tarea">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            <div class="px-6 py-4 border-t border-border-main flex justify-end bg-bg-hover shrink-0">
                <button @click="emit('close')" 
                        class="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-md shadow-blue-500/20 active:scale-95">
                    ¡Entendido!
                </button>
            </div>
            
        </div>
    </div>
</template>

<style scoped>
/* Tus animaciones clásicas */
.animate-fade-in-up {
    animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>