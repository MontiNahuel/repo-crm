<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProducts } from '@/composables/useProducts';
import type { IProducts } from '@/interfaces/IProducts';
import PanelContenedor from '@/components/ui/PanelContenedor.vue';
import CreateProductModal from '@/components/modals/CreateProductModal.vue';

const route = useRoute();
const router = useRouter();

const { loadProductById, adjustProductStock, deleteProductExistente } = useProducts();

const producto = ref<IProducts | null>(null);
const cargando = ref(true);
const copiado = ref(false);
const confirmandoEliminar = ref(false);
const eliminando = ref(false);
const guardandoStock = ref(false);

// Controladores para la edición del producto completo
const mostrarModalEditar = ref(false);

// Controladores para la edición absoluta de stock
const editandoStock = ref(false);
const valorStockEdicion = ref(0);

const stockStatus = computed(() => {
    if (!producto.value || !producto.value.inventario) return 'SERVICIOS';
    const { stock, stock_minimo } = producto.value.inventario;
    if (stock === 0) return 'SIN_STOCK';
    if (stock <= stock_minimo) return 'BAJO_STOCK';
    return 'OK';
});

const cargarProducto = async () => {
    cargando.value = true;
    try {
        const id = Number(route.params.id as string);
        if (isNaN(id)) {
            router.push('/productos');
            return;
        }
        producto.value = await loadProductById(id);
    } catch (error) {
        console.error('Error al cargar detalle del producto:', error);
        router.push('/productos');
    } finally {
        cargando.value = false;
    }
};

const copiarSku = () => {
    if (!producto.value) return;
    navigator.clipboard.writeText(producto.value.sku);
    copiado.value = true;
    setTimeout(() => {
        copiado.value = false;
    }, 2000);
};

const ajustarStock = async (ajuste: number) => {
    if (!producto.value || !producto.value.inventario || guardandoStock.value) return;
    const nuevoStock = producto.value.inventario.stock + ajuste;
    if (nuevoStock < 0) return;

    guardandoStock.value = true;
    try {
        const prodAct = await adjustProductStock(producto.value.id, ajuste);
        producto.value = prodAct;
    } catch (e) {
        console.error(e);
    } finally {
        guardandoStock.value = false;
    }
};

const iniciarEdicionStock = () => {
    if (!producto.value || !producto.value.inventario) return;
    valorStockEdicion.value = producto.value.inventario.stock;
    editandoStock.value = true;
};

const guardarStockAbsoluto = async () => {
    if (!producto.value || !producto.value.inventario) return;
    const nuevoValor = Number(valorStockEdicion.value);
    if (isNaN(nuevoValor) || nuevoValor < 0) {
        editandoStock.value = false;
        return;
    }
    const ajuste = nuevoValor - producto.value.inventario.stock;
    if (ajuste === 0) {
        editandoStock.value = false;
        return;
    }
    guardandoStock.value = true;
    try {
        const prodAct = await adjustProductStock(producto.value.id, ajuste);
        producto.value = prodAct;
        editandoStock.value = false;
    } catch (e) {
        console.error(e);
    } finally {
        guardandoStock.value = false;
    }
};

const ejecutarEliminacion = async () => {
    if (!producto.value) return;
    eliminando.value = true;
    try {
        await deleteProductExistente(producto.value.id);
        router.push('/productos');
    } catch (e) {
        console.error(e);
    } finally {
        eliminando.value = false;
        confirmandoEliminar.value = false;
    }
};

const alGuardarCambiosProducto = (prodEditado: IProducts) => {
    producto.value = prodEditado;
    mostrarModalEditar.value = false;
};

onMounted(() => {
    cargarProducto();
});
</script>

<template>
    <div class="space-y-6 animate-fade-in pb-10">
        
        <!-- Cabecera de Retorno y Título -->
        <div class="flex items-center justify-between">
            <button 
                @click="router.push('/productos')" 
                class="flex items-center gap-2 text-text-muted hover:text-text-main transition text-sm font-semibold cursor-pointer"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path>
                </svg>
                Volver al Directorio
            </button>
            
            <div class="flex gap-2">
                <span class="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    {{ producto?.inventario ? 'Producto Físico' : 'Servicio' }}
                </span>
                <span 
                    v-if="producto"
                    :class="[
                        'text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full border',
                        producto.is_active 
                            ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                            : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                    ]"
                >
                    {{ producto.is_active ? 'Activo' : 'Inactivo' }}
                </span>
            </div>
        </div>

        <!-- Cargando -->
        <div v-if="cargando" class="min-h-[400px] flex justify-center items-center">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>

        <!-- Ficha de Detalles en Dos Columnas -->
        <div v-else-if="producto" class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            <!-- Columna Izquierda (2/3): Datos principales e Historial -->
            <div class="lg:col-span-2 space-y-6">
                
                <!-- Tarjeta Principal de Información -->
                <PanelContenedor class="p-6 space-y-6">
                    <div>
                        <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Nombre Comercial</span>
                        <h2 class="text-2xl font-black text-text-main leading-tight mt-1">
                            {{ producto.nombre }}
                        </h2>
                    </div>

                    <!-- Ficha Técnica Rápida -->
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-b border-border-main py-5 transition-colors">
                        <div>
                            <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">SKU / Identificador</span>
                            <div class="flex items-center gap-1.5">
                                <span class="font-mono text-sm font-semibold text-text-main uppercase">{{ producto.sku }}</span>
                                <button 
                                    @click="copiarSku"
                                    class="text-text-muted hover:text-blue-500 p-1 rounded hover:bg-bg-hover transition cursor-pointer"
                                    :title="copiado ? '¡Copiado!' : 'Copiar SKU'"
                                >
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-if="!copiado">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                                    </svg>
                                    <span v-else class="text-xs text-green-500 font-bold">✓</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Categoría Asociada</span>
                            <span class="font-semibold text-sm text-text-main block mt-0.5">
                                {{ producto.categoria?.nombre || 'Sin categoría asignada' }}
                            </span>
                        </div>

                        <div>
                            <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Última Modificación</span>
                            <span class="text-xs text-text-muted block mt-0.5">
                                Sincronizado con API
                            </span>
                        </div>
                    </div>

                    <!-- Descripción -->
                    <div class="space-y-2">
                        <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Detalles del Ítem</span>
                        <div class="p-4 rounded-2xl bg-bg-main/50 border border-border-main min-h-[100px] transition-colors">
                            <p class="text-sm leading-relaxed text-text-main whitespace-pre-line" v-if="producto.descripcion">
                                {{ producto.descripcion }}
                            </p>
                            <p class="text-sm italic text-text-muted" v-else>
                                Sin descripción detallada registrada para este producto.
                            </p>
                        </div>
                    </div>
                </PanelContenedor>

                <!-- Historial / Futuras Integraciones (Visualmente Atractivo) -->
                <PanelContenedor class="p-6 space-y-4">
                    <div class="flex items-center justify-between border-b border-border-main pb-4 transition-colors">
                        <div>
                            <h3 class="text-sm font-bold text-text-main">Historial & Auditoría de Stock</h3>
                            <p class="text-xs text-text-muted mt-0.5">Reportes y movimientos del producto.</p>
                        </div>
                        <span class="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full font-bold border border-blue-500/20">
                            Próxima Integración
                        </span>
                    </div>

                    <!-- Gráfico o Logs de Simulación -->
                    <div class="py-6 flex flex-col items-center justify-center text-center space-y-2 bg-bg-main/30 border border-dashed border-border-main rounded-2xl transition-colors">
                        <span class="text-3xl block opacity-60">📊</span>
                        <h4 class="text-xs font-bold text-text-main">Módulo de Trazabilidad</h4>
                        <p class="text-[11px] text-text-muted max-w-sm">
                            Próximamente podrás visualizar gráficos de fluctuación de demanda e historial detallado de salidas y entradas de stock asociadas a facturas.
                        </p>
                    </div>
                </PanelContenedor>
            </div>

            <!-- Columna Derecha (1/3): Inventario, Precio y Acciones administrativas -->
            <div class="space-y-6">
                
                <!-- Tarjeta de Precio -->
                <PanelContenedor class="p-6 bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/10">
                    <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Precio de Lista</span>
                    <div class="mt-2 flex items-baseline gap-1">
                        <span class="text-3xl font-black text-blue-600 dark:text-blue-400">
                            ${{ producto.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}
                        </span>
                        <span class="text-xs text-text-muted">ARS</span>
                    </div>
                </PanelContenedor>

                <!-- Tarjeta de Inventario -->
                <PanelContenedor v-if="producto.inventario" class="p-6 space-y-5">
                    <div class="flex justify-between items-center border-b border-border-main pb-3 transition-colors">
                        <h3 class="text-xs font-bold text-text-muted uppercase tracking-wider">Control de Inventario</h3>
                        
                        <!-- Badges de Stock -->
                        <span 
                            v-if="stockStatus === 'SIN_STOCK'"
                            class="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse"
                        >
                            Agotado
                        </span>
                        <span 
                            v-else-if="stockStatus === 'BAJO_STOCK'"
                            class="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20"
                        >
                            Stock Crítico
                        </span>
                        <span 
                            v-else
                            class="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20"
                        >
                            Disponible
                        </span>
                    </div>

                    <!-- Ajuste Físico interactivo -->
                    <div class="space-y-4">
                        <div class="p-4 bg-bg-main border border-border-main rounded-2xl flex items-center justify-between transition-colors">
                            <div>
                                <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Stock Disponible</span>
                                
                                <!-- Modo Edición Absoluta -->
                                <div v-if="editandoStock" class="flex items-center gap-1.5 mt-1">
                                    <input 
                                        v-model.number="valorStockEdicion" 
                                        type="number"
                                        min="0"
                                        class="w-16 px-1.5 py-0.5 text-center text-xs rounded border border-border-main bg-sidebar text-text-main outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                                        @keyup.enter="guardarStockAbsoluto"
                                        @keyup.esc="editandoStock = false"
                                        autofocus
                                    >
                                    <button 
                                        @click="guardarStockAbsoluto"
                                        class="p-1 rounded bg-green-600 hover:bg-green-700 text-white transition text-xs font-bold cursor-pointer"
                                    >
                                        ✓
                                    </button>
                                    <button 
                                        @click="editandoStock = false"
                                        class="p-1 rounded border border-border-main hover:bg-bg-hover text-text-muted transition text-xs font-bold cursor-pointer"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <span 
                                    v-else 
                                    @click="iniciarEdicionStock"
                                    class="font-black text-xl text-text-main cursor-pointer hover:bg-bg-hover px-1 rounded block transition"
                                    title="Editar cantidad exacta"
                                >
                                    {{ producto.inventario.stock }} un.
                                </span>
                            </div>

                            <!-- Botones de ajuste rápido -->
                            <div class="flex items-center gap-1" v-if="!editandoStock">
                                <button 
                                    @click="ajustarStock(-1)"
                                    :disabled="producto.inventario.stock <= 0 || guardandoStock"
                                    class="w-7 h-7 rounded-lg border border-border-main hover:bg-bg-hover text-text-muted hover:text-text-main disabled:opacity-40 transition flex items-center justify-center font-bold text-base cursor-pointer select-none"
                                >
                                    -
                                </button>
                                <button 
                                    @click="ajustarStock(1)"
                                    :disabled="guardandoStock"
                                    class="w-7 h-7 rounded-lg border border-border-main hover:bg-bg-hover text-text-muted hover:text-text-main disabled:opacity-40 transition flex items-center justify-center font-bold text-base cursor-pointer select-none"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <!-- Stock Mínimo -->
                        <div class="p-4 bg-bg-main border border-border-main rounded-2xl flex items-center justify-between transition-colors">
                            <div>
                                <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Límite de Alerta</span>
                                <span class="font-black text-base text-text-main">{{ producto.inventario.stock_minimo }} un.</span>
                            </div>
                            <span class="text-[10px] text-text-muted italic max-w-[120px] text-right">
                                Notifica al llegar a este stock.
                            </span>
                        </div>
                    </div>
                </PanelContenedor>

                <!-- Tarjeta de Acciones Administrativas -->
                <PanelContenedor class="p-6 space-y-4">
                    <h3 class="text-xs font-bold text-text-muted uppercase tracking-wider border-b border-border-main pb-3 transition-colors">
                        Acciones de Administración
                    </h3>

                    <div class="flex flex-col gap-2.5">
                        <button 
                            @click="mostrarModalEditar = true"
                            class="w-full px-4 py-2.5 text-xs font-bold text-text-main bg-sidebar hover:bg-bg-hover border border-border-main rounded-xl transition cursor-pointer flex justify-center items-center gap-1.5"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                            </svg>
                            Editar Ficha Completa
                        </button>
                        
                        <button 
                            v-if="!confirmandoEliminar"
                            @click="confirmandoEliminar = true"
                            class="w-full px-4 py-2.5 text-xs font-bold text-red-500 hover:text-white hover:bg-red-600 border border-red-500/30 dark:border-red-500/20 hover:border-transparent rounded-xl transition flex justify-center items-center gap-1.5 cursor-pointer"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                            Eliminar del Catálogo
                        </button>

                        <!-- Panel de Confirmación de Borrado -->
                        <div v-else class="p-3 bg-red-500/5 border border-red-500/20 rounded-2xl flex flex-col gap-2.5 items-center text-center animate-fade-in">
                            <span class="text-xs text-red-500 font-semibold leading-tight">
                                ¿Estás seguro? Esta acción no se puede deshacer.
                            </span>
                            <div class="flex gap-2 w-full">
                                <button 
                                    @click="ejecutarEliminacion"
                                    :disabled="eliminando"
                                    class="flex-1 px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition cursor-pointer"
                                >
                                    Sí, eliminar
                                </button>
                                <button 
                                    @click="confirmandoEliminar = false"
                                    class="flex-1 px-3 py-1.5 text-xs font-bold text-text-main bg-sidebar border border-border-main hover:bg-bg-hover rounded-xl transition cursor-pointer"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </PanelContenedor>
            </div>
        </div>

        <!-- Modal de Edición Completa -->
        <CreateProductModal 
            v-if="mostrarModalEditar && producto"
            :productoAEditar="producto"
            @close="mostrarModalEditar = false"
            @producto-actualizado="alGuardarCambiosProducto"
        />
    </div>
</template>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.25s ease-in-out;
}
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
</style>
