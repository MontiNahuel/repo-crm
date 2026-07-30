<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserAdmin } from '@/composables/useUserAdmin'
import type { IUsuario } from '@/services/admin/userService'

const props = defineProps<{
    usuario?: IUsuario | null
}>()

const emit = defineEmits<{
    (e: 'cerrar'): void
    (e: 'guardado'): void
}>()

const { guardarUsuario, modificarUsuario, guardando } = useUserAdmin()

const formulario = ref({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'VENDEDOR',
    es_activo: true
})

onMounted(() => {
    if (props.usuario) {
        formulario.value = {
            nombre: props.usuario.nombre,
            apellido: props.usuario.apellido,
            email: props.usuario.email,
            password: '', // No cargamos el hash de la contraseña por seguridad
            rol: props.usuario.rol,
            es_activo: props.usuario.es_activo
        }
    }
})

const submitFormulario = async () => {
    try {
        if (props.usuario) {
            // Caso: Edición
            const payload: any = {
                nombre: formulario.value.nombre,
                apellido: formulario.value.apellido,
                email: formulario.value.email,
                rol: formulario.value.rol,
                es_activo: formulario.value.es_activo
            }
            if (formulario.value.password) {
                payload.password = formulario.value.password
            }
            await modificarUsuario(props.usuario.id, payload)
        } else {
            // Caso: Creación
            await guardarUsuario({
                nombre: formulario.value.nombre,
                apellido: formulario.value.apellido,
                email: formulario.value.email,
                password: formulario.value.password,
                rol: formulario.value.rol
            })
        }
        emit('guardado')
    } catch (error) {
        console.error('Error al guardar el colaborador:', error)
    }
}
</script>

<template>
    <div class="fixed inset-0 bg-slate-900/65 backdrop-blur-md z-50 flex justify-center items-center p-4 animate-fade-in">
        <div class="bg-white dark:bg-sidebar border border-slate-100 dark:border-white/5 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" @click.stop>
            
            <!-- Encabezado -->
            <div class="px-6 py-5 border-b border-border-main flex justify-between items-center transition-colors">
                <h3 class="text-lg font-bold text-text-main">
                    {{ props.usuario ? 'Editar Colaborador' : 'Registrar Nuevo Colaborador' }}
                </h3>
                <button @click="emit('cerrar')" class="p-1.5 rounded-lg text-text-muted hover:bg-bg-hover hover:text-text-main transition-colors cursor-pointer">
                    ✕
                </button>
            </div>

            <!-- Formulario -->
            <form @submit.prevent="submitFormulario" class="p-6 space-y-4">
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Nombre *</label>
                        <input 
                            v-model="formulario.nombre" 
                            type="text" 
                            required
                            placeholder="Juan"
                            class="w-full px-4 py-2.5 rounded-xl border border-border-main bg-bg-main/50 text-text-main focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                        >
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Apellido *</label>
                        <input 
                            v-model="formulario.apellido" 
                            type="text" 
                            required
                            placeholder="Pérez"
                            class="w-full px-4 py-2.5 rounded-xl border border-border-main bg-bg-main/50 text-text-main focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                        >
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Email de Acceso *</label>
                    <input 
                        v-model="formulario.email" 
                        type="email" 
                        required
                        placeholder="juan.perez@empresa.com"
                        class="w-full px-4 py-2.5 rounded-xl border border-border-main bg-bg-main/50 text-text-main focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                    >
                </div>

                <div>
                    <label class="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Rol del Sistema *</label>
                    <select 
                        v-model="formulario.rol" 
                        required
                        class="w-full px-4 py-2.5 rounded-xl border border-border-main bg-bg-main/50 text-text-main focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                    >
                        <option value="ADMIN">ADMIN (Administrador Global)</option>
                        <option value="SUPERVISOR">SUPERVISOR (Supervisor de Célula)</option>
                        <option value="VENDEDOR">VENDEDOR (Ejecutivo de Ventas)</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                        {{ props.usuario ? 'Cambiar Contraseña' : 'Contraseña de Acceso *' }}
                    </label>
                    <input 
                        v-model="formulario.password" 
                        type="password" 
                        :required="!props.usuario"
                        :placeholder="props.usuario ? 'Dejar en blanco para conservar' : 'Contraseña segura'"
                        class="w-full px-4 py-2.5 rounded-xl border border-border-main bg-bg-main/50 text-text-main focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                    >
                </div>

                <!-- Activo switch (Solo visible al editar) -->
                <div v-if="props.usuario" class="flex items-center justify-between pt-2">
                    <div>
                        <span class="text-sm font-bold text-text-main">Usuario Activo</span>
                        <p class="text-xs text-text-muted">Si se desactiva, perderá acceso inmediato al sistema.</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input 
                            v-model="formulario.es_activo" 
                            type="checkbox" 
                            class="sr-only peer"
                        >
                        <div class="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <!-- Botones -->
                <div class="pt-4 flex gap-3 justify-end border-t border-border-main transition-colors">
                    <button 
                        type="button" 
                        @click="emit('cerrar')" 
                        :disabled="guardando"
                        class="px-5 py-2.5 rounded-xl text-sm font-semibold text-text-muted hover:bg-bg-hover transition cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        :disabled="guardando"
                        class="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-70 cursor-pointer"
                    >
                        <span v-if="guardando" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        {{ guardando ? 'Guardando...' : (props.usuario ? 'Guardar Cambios' : 'Registrar Colaborador') }}
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
