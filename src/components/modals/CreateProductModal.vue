<script setup lang="ts">
import { ref, watch } from 'vue';
import type { IProducts } from '@/interfaces/IProducts';
import { useProductsModal } from '@/composables/useProductsModal';
import type { IProductCreate } from '@/interfaces/IProducts';
// TODO: Importar tu composable o servicio real cuando lo tengas
// import { useProducts } from '@/composables/useProducts';
// const { submitProduct } = useProducts();

const emit = defineEmits(['close', 'productoGuardado'])

const props = defineProps<{
    productoAEditar?: IProducts | null;
}>()

const cargando = ref(false)

const { submitProduct } = useProductsModal();

// Categorías hardcodeadas temporalmente basadas en tus INSERTs de SQL.
// TAREA PARA DESPUÉS DE DORMIR: Cargar esto desde la API.
const categorias = ref([
    { id: 1, nombre: 'Hardware' },
    { id: 2, nombre: 'Software' },
    { id: 3, nombre: 'Servicios' }
])

// Variable auxiliar para la UI (controla si mostramos los campos de stock)
const tipoItem = ref<'producto' | 'servicio'>('producto')

const form = ref<IProductCreate>({
    sku: '',
    nombre: '',
    descripcion: '',
    precio: 0,
    is_active: true,
    id_categoria: null as any, 
    inventario: {
        stock: 0,
        stock_minimo: 5
    }
})

const resetForm = () => {
    form.value = {
        sku: '',
        nombre: '',
        descripcion: '',
        precio: 0,
        is_active: true,
        id_categoria: null as any,
        inventario: { stock: 0, stock_minimo: 5 }
    }
    tipoItem.value = 'producto'
}

watch(() => props.productoAEditar, (nuevoProd) => {
    if (nuevoProd) {
        // --- MODO EDICIÓN ---
        form.value = {
            sku: nuevoProd.sku,
            nombre: nuevoProd.nombre,
            descripcion: nuevoProd.descripcion || '',
            precio: nuevoProd.precio,
            is_active: nuevoProd.is_active, // o is_activate según tu interfaz
            id_categoria: nuevoProd.id_categoria,
            inventario: nuevoProd.inventario ? { ...nuevoProd.inventario } : { stock: 0, stock_minimo: 5 }
        };
        // Si el backend mandó inventario, es un producto. Si es null, es servicio.
        tipoItem.value = nuevoProd.inventario ? 'producto' : 'servicio';
    } else {
        // --- MODO CREACIÓN ---
        resetForm();
    }
}, { immediate: true });

const submitFormulario = async () => {
    if (!form.value.nombre.trim() || !form.value.sku.trim()) return

    cargando.value = true
    try {
        // Armamos el payload exacto que Pydantic espera
        const payload: IProductCreate = {
            sku: form.value.sku,
            nombre: form.value.nombre,
            descripcion: form.value.descripcion,
            precio: form.value.precio,
            is_active: form.value.is_active,
            id_categoria: form.value.id_categoria,
            // LA MAGIA DE LA NORMALIZACIÓN:
            inventario: tipoItem.value === 'producto' ? form.value.inventario : undefined
        }

        console.log("Enviando al backend:", payload);

        // TODO: Descomentar esto cuando conectes tu endpoint de creación
        /*
        const productoGuardado = props.productoAEditar 
            ? await updateProduct(props.productoAEditar.id, payload)
            : await submitProduct(payload);
        */

        await submitProduct(payload);

        // Simulamos respuesta exitosa para que lo pruebes ahora
        emit('productoGuardado', payload) 
        emit('close')
        
    } catch (error) {
        console.log("Hubo un error al guardar el producto", error)
    } finally {
        // cargando.value = false (lo maneja el unmount del modal, pero lo dejamos por seguridad)
        if (!props.productoAEditar) cargando.value = false;
    }
}
</script>

<template>
    <div class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
        
        <div class="bg-sidebar w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-fade-in-up transition-colors duration-300 max-h-[90vh] flex flex-col">
            
            <div class="px-6 py-4 border-b border-border-main flex justify-between items-center bg-bg-hover transition-colors shrink-0">
                <h3 class="text-lg font-bold text-text-main">
                    {{ props.productoAEditar ? 'Editar Registro' : 'Agregar al Catálogo' }}
                </h3>
                <button @click="emit('close')" class="text-text-muted hover:text-text-main transition-colors text-xl">
                    ✕
                </button>
            </div>

            <form @submit.prevent="submitFormulario" class="p-6 space-y-5 overflow-y-auto">
                
                <div>
                    <label class="block text-sm font-semibold text-text-main mb-2 transition-colors">Naturaleza del ítem</label>
                    <div class="flex p-1 bg-bg-main border border-border-main rounded-lg transition-colors">
                        <label class="flex-1 text-center cursor-pointer">
                            <input type="radio" v-model="tipoItem" value="producto" class="peer hidden" :disabled="!!productoAEditar">
                            <div class="py-1.5 text-sm font-medium rounded-md text-text-muted peer-checked:bg-sidebar peer-checked:text-blue-500 peer-checked:shadow-sm transition-all">
                                📦 Producto Físico / Licencia
                            </div>
                        </label>
                        <label class="flex-1 text-center cursor-pointer">
                            <input type="radio" v-model="tipoItem" value="servicio" class="peer hidden" :disabled="!!productoAEditar">
                            <div class="py-1.5 text-sm font-medium rounded-md text-text-muted peer-checked:bg-sidebar peer-checked:text-blue-500 peer-checked:shadow-sm transition-all">
                                🛠️ Servicio (Sin stock)
                            </div>
                        </label>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="md:col-span-1">
                        <label class="block text-sm font-semibold text-text-main mb-1">SKU *</label>
                        <input type="text" v-model="form.sku" required
                               placeholder="Ej: HW-001"
                               class="w-full px-4 py-2 rounded-xl border border-border-main bg-bg-main text-text-main focus:ring-2 focus:ring-blue-500 outline-none transition-colors uppercase">
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm font-semibold text-text-main mb-1">Nombre Comercial *</label>
                        <input type="text" v-model="form.nombre" required autofocus
                               placeholder="Ej: Monitor Samsung 24..."
                               class="w-full px-4 py-2 rounded-xl border border-border-main bg-bg-main text-text-main focus:ring-2 focus:ring-blue-500 outline-none transition-colors">
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-text-main mb-1">Categoría</label>
                        <select v-model="form.id_categoria" required
                                class="w-full px-4 py-2 rounded-xl border border-border-main bg-bg-main text-text-main focus:ring-2 focus:ring-blue-500 outline-none transition-colors">
                            <option :value="null" disabled>Seleccioná una...</option>
                            <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
                                {{ cat.nombre }}
                            </option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-text-main mb-1">Precio Unitario ($) *</label>
                        <input type="number" v-model="form.precio" required min="0" step="0.01"
                               class="w-full px-4 py-2 rounded-xl border border-border-main bg-bg-main text-text-main focus:ring-2 focus:ring-blue-500 outline-none transition-colors">
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-semibold text-text-main mb-1">Descripción <span class="text-text-muted font-normal">(Opcional)</span></label>
                    <textarea v-model="form.descripcion" rows="2"
                              class="w-full px-4 py-2 rounded-xl border border-border-main bg-bg-main text-text-main focus:ring-2 focus:ring-blue-500 outline-none transition-colors resize-none"></textarea>
                </div>

                <div v-if="tipoItem === 'producto'" class="animate-fade-in p-4 border border-border-main rounded-xl bg-bg-main/50">
                    <h4 class="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Control de Inventario</h4>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-text-main mb-1">Stock Actual</label>
                            <input type="number" v-model="form.inventario!.stock" min="0"
                                   class="w-full px-4 py-2 rounded-xl border border-border-main bg-bg-main text-text-main focus:ring-2 focus:ring-blue-500 outline-none transition-colors">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-text-main mb-1">Stock Mínimo (Alerta)</label>
                            <input type="number" v-model="form.inventario!.stock_minimo" min="0"
                                   class="w-full px-4 py-2 rounded-xl border border-border-main bg-bg-main text-text-main focus:ring-2 focus:ring-blue-500 outline-none transition-colors">
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-between p-3 border border-border-main rounded-xl bg-bg-main/30">
                    <div>
                        <p class="text-sm font-semibold text-text-main">Disponibilidad</p>
                        <p class="text-xs text-text-muted">¿Este ítem está disponible para facturar?</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" v-model="form.is_active" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <div class="pt-2 flex gap-3 shrink-0">
                    <button type="button" @click="emit('close')"
                            class="flex-1 px-4 py-2.5 text-sm font-bold text-text-main bg-bg-hover hover:bg-border-main border border-border-main rounded-xl transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" :disabled="cargando"
                            class="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition flex justify-center items-center disabled:opacity-70 shadow-sm shadow-blue-200 dark:shadow-none">
                        <span v-if="cargando" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                        {{ props.productoAEditar ? 'Guardar Cambios' : 'Crear Producto' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
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