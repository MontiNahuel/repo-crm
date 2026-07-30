<script setup lang="ts">
import { ref, computed } from 'vue';
import type { IProducts } from '@/interfaces/IProducts';
import { useProducts } from '@/composables/useProducts';

const props = defineProps<{
    producto: IProducts;
}>();

const emit = defineEmits(['close', 'edit', 'actualizado', 'eliminado']);

const { adjustProductStock, deleteProductExistente } = useProducts();

const cargando = ref(false);
const confirmandoEliminar = ref(false);
const copiado = ref(false);

const stockStatus = computed(() => {
    if (!props.producto.inventario) return 'SERVICIOS';
    const { stock, stock_minimo } = props.producto.inventario;
    if (stock === 0) return 'SIN_STOCK';
    if (stock <= stock_minimo) return 'BAJO_STOCK';
    return 'OK';
});

const copiarSku = () => {
    navigator.clipboard.writeText(props.producto.sku);
    copiado.value = true;
    setTimeout(() => {
        copiado.value = false;
    }, 2000);
};

const ajustarStock = async (ajuste: number) => {
    if (!props.producto.inventario || cargando.value) return;
    
    // Validar que no quede stock negativo
    const nuevoStock = props.producto.inventario.stock + ajuste;
    if (nuevoStock < 0) return;

    cargando.value = true;
    try {
        const prodAct = await adjustProductStock(props.producto.id, ajuste);
        emit('actualizado', prodAct);
    } catch (e) {
        console.error(e);
    } finally {
        cargando.value = false;
    }
};

const eliminarProducto = async () => {
    cargando.value = true;
    try {
        await deleteProductExistente(props.producto.id);
        emit('eliminado', props.producto.id);
        emit('close');
    } catch (e) {
        console.error(e);
    } finally {
        cargando.value = false;
        confirmandoEliminar.value = false;
    }
};
</script>

<template>
    <Teleport to="body">
        <div class="fixed inset-0 bg-slate-900/65 backdrop-blur-md z-50 flex justify-center items-center p-4 animate-fade-in">
            <div 
                class="bg-white dark:bg-sidebar border border-slate-100 dark:border-white/5 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up"
                @click.stop
            >
                <!-- Cabecera / Detalle Visual -->
                <div class="p-6 pb-4 border-b border-border-main flex justify-between items-start">
                    <div class="space-y-1">
                        <div class="flex items-center gap-2">
                            <span class="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                {{ producto.inventario ? 'Producto' : 'Servicio' }}
                            </span>
                            <span 
                                :class="[
                                    'text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full border',
                                    producto.is_active 
                                        ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                        : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                                ]"
                            >
                                {{ producto.is_active ? 'Activo' : 'Inactivo' }}
                            </span>
                        </div>
                        <h3 class="text-xl font-bold text-text-main mt-2 leading-tight">
                            {{ producto.nombre }}
                        </h3>
                    </div>
                    <button 
                        @click="emit('close')" 
                        class="text-text-muted hover:text-text-main p-1.5 hover:bg-bg-hover rounded-full transition-all cursor-pointer"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <!-- Contenido Principal -->
                <div class="p-6 space-y-6 overflow-y-auto flex-1 text-sm text-text-main">
                    
                    <!-- Ficha Técnica -->
                    <div class="grid grid-cols-2 gap-4">
                        <div class="p-3 bg-bg-hover/30 border border-border-main rounded-2xl">
                            <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">SKU</span>
                            <div class="flex items-center gap-1.5">
                                <span class="font-mono text-xs font-semibold text-text-main uppercase">{{ producto.sku }}</span>
                                <button 
                                    @click="copiarSku"
                                    class="text-text-muted hover:text-blue-500 p-0.5 rounded transition"
                                    :title="copiado ? '¡Copiado!' : 'Copiar SKU'"
                                >
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-if="!copiado">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                                    </svg>
                                    <span v-else class="text-[10px] text-green-500 font-bold">✓</span>
                                </button>
                            </div>
                        </div>

                        <div class="p-3 bg-bg-hover/30 border border-border-main rounded-2xl">
                            <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Categoría</span>
                            <span class="font-medium text-xs text-text-main">
                                {{ producto.categoria?.nombre || 'Sin categoría' }}
                            </span>
                        </div>

                        <div class="p-3 bg-bg-hover/30 border border-border-main rounded-2xl">
                            <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Precio Unitario</span>
                            <span class="font-bold text-base text-blue-500 dark:text-blue-400">
                                ${{ producto.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}
                            </span>
                        </div>

                        <div class="p-3 bg-bg-hover/30 border border-border-main rounded-2xl flex flex-col justify-center">
                            <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Disponibilidad</span>
                            <div class="flex items-center gap-1.5 mt-0.5">
                                <span class="w-2.5 h-2.5 rounded-full" :class="producto.is_active ? 'bg-green-500' : 'bg-gray-400'"></span>
                                <span class="text-xs font-semibold">
                                    {{ producto.is_active ? 'Apto para Venta' : 'Venta Suspendida' }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Descripción -->
                    <div class="space-y-1">
                        <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Descripción</span>
                        <div class="p-4 bg-bg-main border border-border-main rounded-2xl min-h-[70px]">
                            <p class="text-xs leading-relaxed text-text-main whitespace-pre-line" v-if="producto.descripcion">
                                {{ producto.descripcion }}
                            </p>
                            <p class="text-xs italic text-text-muted" v-else>
                                Sin descripción detallada.
                            </p>
                        </div>
                    </div>

                    <!-- Sección de Inventario / Stock -->
                    <div v-if="producto.inventario" class="p-4 border border-border-main rounded-2xl bg-bg-main/60 space-y-4">
                        <div class="flex justify-between items-center">
                            <h4 class="text-xs font-bold text-text-muted uppercase tracking-wider">Estado de Inventario</h4>
                            
                            <!-- Badges de Stock -->
                            <span 
                                v-if="stockStatus === 'SIN_STOCK'"
                                class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20"
                            >
                                Sin Stock
                            </span>
                            <span 
                                v-else-if="stockStatus === 'BAJO_STOCK'"
                                class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 animate-pulse"
                            >
                                Stock Bajo
                            </span>
                            <span 
                                v-else
                                class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20"
                            >
                                Stock Óptimo
                            </span>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div class="p-3 bg-sidebar border border-border-main rounded-xl flex items-center justify-between">
                                <div>
                                    <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Stock Actual</span>
                                    <span class="font-bold text-lg text-text-main">{{ producto.inventario.stock }} un.</span>
                                </div>
                                
                                <!-- Botones de Ajuste Rápido Interno -->
                                <div class="flex items-center gap-1">
                                    <button 
                                        @click="ajustarStock(-1)"
                                        :disabled="producto.inventario.stock <= 0 || cargando"
                                        class="w-6 h-6 rounded-lg border border-border-main hover:bg-bg-hover text-text-muted hover:text-text-main disabled:opacity-40 transition flex items-center justify-center font-bold text-sm cursor-pointer select-none"
                                    >
                                        -
                                    </button>
                                    <button 
                                        @click="ajustarStock(1)"
                                        :disabled="cargando"
                                        class="w-6 h-6 rounded-lg border border-border-main hover:bg-bg-hover text-text-muted hover:text-text-main disabled:opacity-40 transition flex items-center justify-center font-bold text-sm cursor-pointer select-none"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div class="p-3 bg-sidebar border border-border-main rounded-xl">
                                <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Alerta de Mínimo</span>
                                <span class="font-bold text-lg text-text-main">{{ producto.inventario.stock_minimo }} un.</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer / Acciones -->
                <div class="p-6 border-t border-border-main bg-bg-hover/50 flex flex-col gap-3 shrink-0">
                    
                    <!-- Confirmación de Eliminación -->
                    <div v-if="confirmandoEliminar" class="p-3 bg-red-500/5 border border-red-500/20 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between animate-fade-in">
                        <span class="text-xs text-red-500 font-semibold">¿Seguro que querés eliminar permanentemente este ítem?</span>
                        <div class="flex gap-2 w-full md:w-auto">
                            <button 
                                @click="eliminarProducto"
                                :disabled="cargando"
                                class="flex-1 md:flex-none px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition cursor-pointer"
                            >
                                Sí, eliminar
                            </button>
                            <button 
                                @click="confirmandoEliminar = false"
                                class="flex-1 md:flex-none px-3 py-1.5 text-xs font-bold text-text-main bg-sidebar border border-border-main hover:bg-bg-hover rounded-xl transition cursor-pointer"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>

                    <!-- Botones Principales -->
                    <div v-else class="flex gap-3">
                        <button 
                            @click="confirmandoEliminar = true"
                            class="px-4 py-2.5 text-sm font-bold text-red-500 hover:text-red-600 hover:bg-red-500/5 border border-transparent rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                            Eliminar
                        </button>
                        <div class="flex gap-3 flex-1">
                            <button 
                                @click="emit('edit', producto)"
                                class="flex-1 px-4 py-2.5 text-sm font-bold text-text-main bg-sidebar hover:bg-bg-hover border border-border-main rounded-xl transition cursor-pointer flex justify-center items-center gap-1.5"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                                </svg>
                                Editar
                            </button>
                            <button 
                                @click="emit('close')"
                                class="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition cursor-pointer flex justify-center items-center"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
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
