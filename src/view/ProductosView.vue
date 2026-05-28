<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import PanelContenedor from '@/components/ui/PanelContenedor.vue';
import PaginadorComponent from '@/components/ui/PaginadorComponent.vue';
import { useProducts } from '@/composables/useProducts';
import type { IProducts } from '@/interfaces/IProducts';
import CreateProductModal from '@/components/modals/CreateProductModal.vue';

const { loadProducts } = useProducts();

const buscador = ref('');
const filtroCategoria = ref('');
const filtroEstado = ref('');
const cargando = ref(false);

const paginaActual = ref(1);
const totalPaginas = ref(1);
const cantidadTotalProductos = ref(0); // Empezamos en 0
const skipActual = ref(0);
const limite = ref(7);

let timeoutBusqueda: ReturnType<typeof setTimeout> | null = null;

// CORRECCIÓN 1: Vuelve a ser un array tipado, no un Response
const productos = ref<IProducts[]>([]);

const calcularEstado = (p: IProducts): string => {
    if (!p.is_active) return 'INACTIVO';
    if (p.inventario && p.inventario.stock <= p.inventario.stock_minimo) return 'BAJO_STOCK';
    return 'ACTIVO';
};

const badgeEstado = (estado: string) => {
    const config: Record<string, string> = {
        'ACTIVO': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400',
        'INACTIVO': 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400',
        'BAJO_STOCK': 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return config[estado] || 'bg-blue-100 text-blue-700';
};

const mostrarModalNuevoProducto = ref(false);

watch(buscador, (nuevoValor) => {
    if (timeoutBusqueda) {
        clearTimeout(timeoutBusqueda);
    }
    cargando.value = true; // Mostramos el spinner de inmediato
    timeoutBusqueda = setTimeout(() => {
        console.log("Buscando:", nuevoValor);
        
        // Reseteamos a la página 1 para que no nos quede un skip colgado
        skipActual.value = 0;
        
        // Ejecutamos la carga real
        cargarProductos();
        
    }, 500); // 500ms es el "punto dulce" entre respuesta rápida y ahorro de recursos
})

// 2. Watcher instantáneo para los selectores
watch([filtroEstado, filtroCategoria], () => {
    skipActual.value = 0;
    cargarProductos();
});

// CORRECCIÓN 3: Paginación simple basada en la página actual
const paginaAnterior = () => {
    if (paginaActual.value > 1) {
        paginaActual.value--;
        cargarProductos();
    }
}

const paginaSiguiente = () => {
    if (paginaActual.value < totalPaginas.value) {
        paginaActual.value++;
        cargarProductos();
    }
}

const cargarProductos = async () => {
    try {
        cargando.value = true;
        
        // La matemática perfecta manda acá
        skipActual.value = (paginaActual.value - 1) * limite.value;
        
        const data = await loadProducts(
            skipActual.value, 
            limite.value,
            buscador.value,
            filtroEstado.value,
            filtroCategoria.value
            
        );
        console.log('Datos recibidos:', data);
        cantidadTotalProductos.value = data.cantidadProductos;
        totalPaginas.value = Math.ceil(data.cantidadProductos / limite.value);
        productos.value = data.productos;
        
    } catch (error) {
        console.error(error);
    } finally {
        cargando.value = false;
    }
};

onMounted(() => {
    cargarProductos();
});
</script>

<template>
    <div class="space-y-6 animate-fade-in">
        
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold text-text-main transition-colors">Directorio de Productos</h1>
                <p class="text-sm text-text-muted transition-colors">Gestioná tu catálogo de productos y servicios</p>
            </div>
            
            <button @click="mostrarModalNuevoProducto = true" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-sm shadow-blue-200 dark:shadow-none">
                + Nuevo Producto
            </button>
        </div>

        <PanelContenedor>
            
            <div class="p-4 border-b border-border-main bg-bg-main/50 flex flex-col lg:flex-row gap-4 transition-colors items-center justify-between">
    
                <div class="relative flex-1 w-full max-w-md">
                    <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input type="text" v-model="buscador" placeholder="Buscar por SKU o nombre..."
                        class="w-full pl-10 pr-4 py-2 rounded-xl border border-border-main bg-sidebar text-text-main focus:ring-2 focus:ring-blue-500 outline-none transition text-sm">
                </div>

                <div class="flex gap-3 w-full lg:w-auto">
                    <select v-model="filtroCategoria" class="flex-1 lg:flex-none px-4 py-2 rounded-xl border border-border-main bg-sidebar text-text-main focus:ring-2 focus:ring-blue-500 outline-none transition text-sm appearance-none cursor-pointer">
                        <option value="">Todas las categorías</option>
                        <option value="Hardware">Hardware</option>
                        <option value="Software">Software</option>
                        <option value="Servicios">Servicios</option>
                    </select>

                    <select v-model="filtroEstado" class="flex-1 lg:flex-none px-4 py-2 rounded-xl border border-border-main bg-sidebar text-text-main focus:ring-2 focus:ring-blue-500 outline-none transition text-sm appearance-none cursor-pointer">
                        <option value="">Todos los estados</option>
                        <option value="ACTIVO">Activo</option>
                        <option value="INACTIVO">Inactivo</option>
                        <option value="BAJO_STOCK">Bajo Stock</option>
                    </select>
                </div>
            </div>

            <div class="overflow-x-auto relative min-h-[200px]">
                
                <div v-if="cargando" class="absolute inset-0 bg-sidebar/60 backdrop-blur-sm z-10 flex justify-center items-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>

                <table class="w-full text-left text-sm text-text-main table-fixed">
                    <thead class="bg-bg-main/80 text-text-muted font-semibold border-b border-border-main transition-colors">
                        <tr>
                            <th class="px-6 py-4">SKU / Nombre</th>
                            <th class="px-6 py-4 text-center">Categoría</th>
                            <th class="px-6 py-4 text-right">Precio</th>
                            <th class="px-6 py-4 text-center">Stock</th>
                            <th class="px-6 py-4 text-center">Estado</th>
                            <th class="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-border-main transition-colors">
                        
                        <tr v-if="productos.length === 0 && !cargando">
                            <td colspan="6" class="px-6 py-8 text-center text-text-muted">
                                No se encontraron productos con esos filtros.
                            </td>
                        </tr>
                        
                        <tr v-for="producto in productos" :key="producto.id" class="hover:bg-bg-hover transition-colors group">
                            <td class="px-6 py-4">
                                <div class="flex flex-col">
                                    <span class="font-medium text-text-main">{{ producto.nombre }}</span>
                                    <span class="font-mono text-xs text-text-muted">{{ producto.sku }}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <span class="bg-sidebar px-2 py-1 rounded border border-border-main text-xs text-text-muted">
                                    {{ producto.categoria?.nombre || 'N/A' }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-right font-medium text-text-main">
                                ${{ producto.precio.toLocaleString('es-AR') }}
                            </td>
                            <td class="px-6 py-4 text-center">
                                <template v-if="producto.inventario">
                                    <span :class="producto.inventario.stock > producto.inventario.stock_minimo ? 'text-text-main' : 'text-orange-500 font-bold'">
                                        {{ producto.inventario.stock }} un.
                                    </span>
                                </template>
                                <span v-else class="text-text-muted text-xs italic">N/A</span>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <span :class="['inline-block w-24 text-center px-3 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider transition-all', badgeEstado(calcularEstado(producto))]">
                                    {{ calcularEstado(producto).replace('_', ' ') }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <div class="text-blue-500 hover:text-blue-400 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    Ver Detalle →
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <PaginadorComponent
                :pagina-actual="paginaActual"
                :total-paginas="totalPaginas"
                :total-items="cantidadTotalProductos"
                item-label="productos"
                :cargando="cargando"
                :deshabilitar-anterior="skipActual === 0"
                :deshabilitar-siguiente="skipActual + limite >= cantidadTotalProductos"
                @anterior="paginaAnterior"
                @siguiente="paginaSiguiente"
            />
        </PanelContenedor>

        <CreateProductModal v-if="mostrarModalNuevoProducto" @close="mostrarModalNuevoProducto = false" @producto-creado="cargarProductos" />
    </div>
</template>

<style scoped>
/* Las animaciones toast de tu original */
.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translateY(20px);
}
</style>