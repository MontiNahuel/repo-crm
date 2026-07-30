<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useCategories } from '@/composables/useCategories'
import type { ICategoria } from '@/services/products/categoryService'
import ModalConfirmacion from './ModalConfirmacion.vue'

const emit = defineEmits<{
    (e: 'cerrar'): void
    (e: 'actualizado'): void
}>()

const {
    categorias,
    cargandoCategorias,
    guardandoCategoria,
    cargarCategorias,
    crearNuevaCategoria,
    actualizarCategoriaExistente,
    eliminarCategoriaExistente
} = useCategories()

const buscador = ref('')
const categoriaSeleccionada = ref<ICategoria | null>(null)

// Formulario reactivo
const formulario = ref({
    nombre: '',
    descripcion: ''
})

// Control de confirmación de borrado
const mostrarConfirmacionBorrado = ref(false)
const categoriaParaBorrar = ref<ICategoria | null>(null)
const eliminandoCategoria = ref(false)

onMounted(() => {
    cargarCategorias()
})

const categoriasFiltradas = computed(() => {
    if (!buscador.value.trim()) return categorias.value
    const term = buscador.value.toLowerCase()
    return categorias.value.filter(c => 
        c.nombre.toLowerCase().includes(term) || 
        (c.descripcion && c.descripcion.toLowerCase().includes(term))
    )
})

const seleccionarCategoria = (cat: ICategoria) => {
    categoriaSeleccionada.value = cat
    formulario.value.nombre = cat.nombre
    formulario.value.descripcion = cat.descripcion || ''
}

const limpiarFormulario = () => {
    categoriaSeleccionada.value = null
    formulario.value.nombre = ''
    formulario.value.descripcion = ''
}

const submitFormulario = async () => {
    if (!formulario.value.nombre.trim()) return
    
    try {
        if (categoriaSeleccionada.value) {
            await actualizarCategoriaExistente(
                categoriaSeleccionada.value.id,
                formulario.value.nombre,
                formulario.value.descripcion
            )
        } else {
            await crearNuevaCategoria(
                formulario.value.nombre,
                formulario.value.descripcion
            )
        }
        limpiarFormulario()
        emit('actualizado')
    } catch (e) {
        console.error(e)
    }
}

const solicitarBorrado = (cat: ICategoria) => {
    categoriaParaBorrar.value = cat
    mostrarConfirmacionBorrado.value = true
}

const confirmarBorrar = async () => {
    if (!categoriaParaBorrar.value) return
    eliminandoCategoria.value = true
    try {
        await eliminarCategoriaExistente(categoriaParaBorrar.value.id)
        if (categoriaSeleccionada.value?.id === categoriaParaBorrar.value.id) {
            limpiarFormulario()
        }
        emit('actualizado')
    } catch (e) {
        console.error(e)
    } finally {
        eliminandoCategoria.value = false
        categoriaParaBorrar.value = null
        mostrarConfirmacionBorrado.value = false
    }
}
</script>

<template>
    <Teleport to="body">
        <div class="fixed inset-0 bg-slate-900/65 backdrop-blur-md z-50 flex justify-center items-center p-4 animate-fade-in">
            <div 
                class="bg-white dark:bg-sidebar border border-slate-100 dark:border-white/5 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[550px]"
                @click.stop
            >
                
                <!-- Columna Izquierda: Listado de Categorías -->
                <div class="w-full md:w-1/2 border-r border-border-main flex flex-col h-full bg-bg-hover/30 dark:bg-slate-950/40">
                    <!-- Cabecera Izquierda -->
                    <div class="p-5 border-b border-border-main">
                        <h3 class="text-base font-bold text-text-main">Categorías de Producto</h3>
                        <p class="text-xs text-text-muted mt-0.5">Agrupa y organiza los ítems de tu catálogo.</p>
                        
                        <!-- Buscador -->
                        <div class="relative mt-4">
                            <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                            <input 
                                v-model="buscador" 
                                type="text" 
                                placeholder="Buscar categoría..."
                                class="w-full pl-9 pr-4 py-2 rounded-xl border border-border-main bg-sidebar text-text-main focus:ring-2 focus:ring-blue-500 outline-none transition text-xs"
                            >
                        </div>
                    </div>

                    <!-- Lista de Categorías -->
                    <div class="flex-1 overflow-y-auto p-4 space-y-2">
                        <div v-if="cargandoCategorias" class="space-y-2.5">
                            <div v-for="i in 4" :key="i" class="h-14 bg-slate-100 dark:bg-slate-800/30 border border-border-main rounded-2xl animate-pulse"></div>
                        </div>

                        <div v-else-if="categoriasFiltradas.length > 0" class="space-y-2">
                            <div 
                                v-for="cat in categoriasFiltradas" 
                                :key="cat.id"
                                @click="seleccionarCategoria(cat)"
                                :class="[
                                    'p-3.5 rounded-2xl border transition-all cursor-pointer flex justify-between items-start group',
                                    categoriaSeleccionada?.id === cat.id 
                                        ? 'bg-blue-500/5 dark:bg-blue-500/10 border-blue-500 text-text-main shadow-sm' 
                                        : 'bg-sidebar border-border-main hover:bg-bg-hover hover:border-border-main/80 text-text-main'
                                ]"
                            >
                                <div class="pr-3 flex-1">
                                    <span class="font-bold text-xs block transition-colors" :class="categoriaSeleccionada?.id === cat.id ? 'text-blue-500' : 'text-text-main'">
                                        {{ cat.nombre }}
                                    </span>
                                    <span class="text-[10px] text-text-muted line-clamp-1 mt-0.5">
                                        {{ cat.descripcion || 'Sin descripción.' }}
                                    </span>
                                </div>
                                <button 
                                    @click.stop="solicitarBorrado(cat)"
                                    class="text-text-muted hover:text-red-500 p-1 rounded-lg hover:bg-red-500/10 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                                    title="Eliminar Categoría"
                                >
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div v-else class="text-center py-12">
                            <span class="text-2xl block mb-2 opacity-50">📂</span>
                            <span class="text-xs text-text-muted italic">No se encontraron categorías.</span>
                        </div>
                    </div>
                </div>

                <!-- Columna Derecha: Formulario de Creación/Edición -->
                <div class="w-full md:w-1/2 flex flex-col h-full bg-sidebar">
                    <!-- Cabecera Derecha -->
                    <div class="p-5 border-b border-border-main flex justify-between items-center">
                        <div>
                            <h3 class="text-base font-bold text-text-main">
                                {{ categoriaSeleccionada ? 'Editar Categoría' : 'Nueva Categoría' }}
                            </h3>
                            <p class="text-xs text-text-muted mt-0.5">
                                {{ categoriaSeleccionada ? 'Modifica los datos del registro seleccionado.' : 'Registra un nuevo grupo en el catálogo.' }}
                            </p>
                        </div>
                        <button 
                            @click="emit('cerrar')" 
                            class="p-2 rounded-xl text-text-muted hover:bg-bg-hover hover:text-text-main transition-colors cursor-pointer md:hidden"
                        >
                            ✕
                        </button>
                    </div>

                    <!-- Formulario -->
                    <form @submit.prevent="submitFormulario" class="p-6 flex-1 flex flex-col justify-between overflow-y-auto">
                        <div class="space-y-4">
                            <!-- Nombre -->
                            <div>
                                <label class="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Nombre *</label>
                                <input 
                                    v-model="formulario.nombre" 
                                    type="text" 
                                    required
                                    placeholder="Ej: Accesorios, Licencias"
                                    class="w-full px-3.5 py-2.5 rounded-xl border border-border-main bg-sidebar text-text-main focus:ring-2 focus:ring-blue-500 outline-none transition text-xs"
                                >
                            </div>

                            <!-- Descripción -->
                            <div>
                                <label class="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Descripción</label>
                                <textarea 
                                    v-model="formulario.descripcion" 
                                    rows="4"
                                    placeholder="Breve descripción sobre qué tipo de productos entran aquí..."
                                    class="w-full px-3.5 py-2.5 rounded-xl border border-border-main bg-sidebar text-text-main focus:ring-2 focus:ring-blue-500 outline-none transition text-xs resize-none"
                                ></textarea>
                            </div>

                            <!-- Botón Cancelar Edición -->
                            <div v-if="categoriaSeleccionada" class="pt-2">
                                <button 
                                    type="button" 
                                    @click="limpiarFormulario"
                                    class="text-xs text-blue-500 hover:underline font-semibold cursor-pointer"
                                >
                                    ← Volver a crear una categoría nueva
                                </button>
                            </div>
                        </div>

                        <!-- Botones de Acción -->
                        <div class="pt-6 border-t border-border-main flex gap-3 justify-end items-center mt-6">
                            <button 
                                type="button" 
                                @click="emit('cerrar')" 
                                :disabled="guardandoCategoria"
                                class="px-4 py-2.5 rounded-xl text-xs font-semibold text-text-muted hover:bg-bg-hover transition cursor-pointer"
                            >
                                Cerrar Modal
                            </button>
                            <button 
                                type="submit" 
                                :disabled="guardandoCategoria"
                                class="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-70 cursor-pointer shadow-sm shadow-blue-500/20"
                            >
                                <span v-if="guardandoCategoria" class="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></span>
                                {{ guardandoCategoria ? 'Guardando...' : (categoriaSeleccionada ? 'Actualizar' : 'Guardar Categoría') }}
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>

        <!-- Confirmación de Borrado de Categoría -->
        <ModalConfirmacion 
            v-if="mostrarConfirmacionBorrado"
            titulo="¿Eliminar Categoría?"
            :mensaje="`¿Estás seguro de que deseas eliminar la categoría '${categoriaParaBorrar?.nombre}'? Esta acción no se puede deshacer y fallará si hay productos vinculados.`"
            textoConfirmar="Eliminar"
            :cargando="eliminandoCategoria"
            @confirmar="confirmarBorrar"
            @cancelar="mostrarConfirmacionBorrado = false"
        />
    </Teleport>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
</style>
