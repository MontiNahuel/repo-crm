<script setup lang="ts">
import { type Tarea } from '@/interfaces/interfacesTareas';

defineProps<{
    tarea: Tarea | null;
    isOpen: boolean;
}>()

defineEmits<{
    (e: 'cerrar'): void;
    // Acá a futuro meteremos los emits para guardar la descripción o subtareas
}>()
</script>

<template>
    <Teleport to="body">
        <transition name="fade">
            <div v-if="isOpen" 
                 @click="$emit('cerrar')" 
                 class="fixed inset-0 bg-sidebar/60 backdrop-blur-sm z-40">
            </div>
        </transition>

        <transition name="slide">
            <div v-if="isOpen && tarea" 
                 class="fixed inset-y-0 right-0 w-full md:w-[450px] bg-bg-main shadow-2xl z-50 flex flex-col border-l border-border-main">
                
                <div class="px-6 py-4 border-b border-border-main flex justify-between items-center bg-sidebar">
                    <div class="flex items-center gap-3">
                        <span class="text-xs font-mono text-text-muted bg-bg-main px-2 py-1 rounded">#{{ tarea.id }}</span>
                        <h2 class="text-lg font-bold text-text-main truncate pr-4">{{ tarea.titulo }}</h2>
                    </div>
                    <button @click="$emit('cerrar')" class="p-2 text-text-muted hover:text-red-500 hover:bg-bg-hover rounded-xl transition-colors shrink-0">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div class="p-6 flex-1 overflow-y-auto space-y-6">
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-bg-hover p-3 rounded-xl border border-border-main">
                            <p class="text-xs font-semibold text-text-muted mb-1">Estado</p>
                            <p :class="['font-medium text-sm', tarea.esta_completada ? 'text-green-600' : 'text-orange-500']">
                                {{ tarea.esta_completada ? '✓ Completada' : '⏳ Pendiente' }}
                            </p>
                        </div>
                        <div v-if="tarea.fecha_limite" class="bg-bg-hover p-3 rounded-xl border border-border-main">
                            <p class="text-xs font-semibold text-text-muted mb-1">Fecha Límite</p>
                            <p class="text-sm text-text-main">{{ new Date(tarea.fecha_limite).toLocaleDateString() }}</p>
                        </div>
                    </div>

                    <div>
                        <h3 class="text-sm font-bold text-text-main mb-2 flex items-center gap-2">
                            📝 Descripción
                        </h3>
                        <textarea 
                            placeholder="Agregar una descripción más detallada..."
                            class="w-full h-32 p-3 rounded-xl border border-border-main bg-sidebar text-text-main text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all"
                        ></textarea>
                    </div>

                    <div>
                        <h3 class="text-sm font-bold text-text-main mb-3 flex justify-between items-center">
                            <span>✅ Mini-pasos</span>
                            <span class="text-xs text-text-muted font-normal">0/3 completados</span>
                        </h3>
                        
                        <div class="space-y-2">
                            <div class="flex items-center gap-3 p-2 hover:bg-bg-hover rounded-lg border border-transparent hover:border-border-main transition-colors group">
                                <input type="checkbox" class="w-4 h-4 rounded border-border-main text-blue-600 focus:ring-blue-500 bg-bg-main cursor-pointer">
                                <input type="text" placeholder="Nueva subtarea..." class="flex-1 bg-transparent border-none text-sm text-text-main outline-none placeholder:text-text-muted">
                            </div>
                            <button class="text-sm text-blue-500 font-medium px-2 py-1 hover:bg-blue-500/10 rounded transition-colors">
                                + Agregar paso
                            </button>
                        </div>
                    </div>

                </div>

                <div class="p-4 border-t border-border-main bg-bg-main flex justify-end gap-3">
                    <button @click="$emit('cerrar')" class="px-4 py-2 text-sm font-medium text-text-main hover:bg-bg-hover rounded-xl transition-colors border border-border-main">
                        Cancelar
                    </button>
                    <button class="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-200 dark:shadow-none transition-all">
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </transition>
    </Teleport>
</template>

<style scoped>
/* Transición del fondo oscuro */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Transición del panel deslizando desde la derecha */
.slide-enter-active, .slide-leave-active { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }
</style>