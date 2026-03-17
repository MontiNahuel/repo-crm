<script setup lang="ts">
import { ref } from 'vue'

// Pestaña activa por defecto
const tabActiva = ref('usuarios')

// Datos de prueba temporales para maquetar
const usuariosTemp = ref([
    { id: 1, nombre: 'Nahuel Monti', rol: 'ADMIN', email: 'nahuel@crm.com' },
    { id: 4, nombre: 'Vendedor 1', rol: 'VENDEDOR', email: 'vend1@crm.com' },
    { id: 5, nombre: 'Vendedor 2', rol: 'VENDEDOR', email: 'vend2@crm.com' }
])
</script>

<template>
    <div class="p-6 max-w-7xl mx-auto animate-fade-in">
        
        <div class="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold text-text-main transition-colors">Torre de Control</h1>
                <p class="text-sm text-text-muted mt-1 transition-colors">Gestión general de usuarios, grupos y asignaciones.</p>
            </div>
            <button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
                + Nuevo Usuario
            </button>
        </div>

        <div class="flex space-x-1 bg-bg-main p-1 rounded-xl border border-border-main mb-6 transition-colors w-full md:w-max">
            <button @click="tabActiva = 'usuarios'"
                    :class="['px-4 py-2 text-sm font-medium rounded-lg transition-all flex-1 md:flex-none', 
                            tabActiva === 'usuarios' ? 'bg-sidebar text-blue-500 shadow-sm' : 'text-text-muted hover:text-text-main']">
                👤 Usuarios
            </button>
            <button @click="tabActiva = 'grupos'"
                    :class="['px-4 py-2 text-sm font-medium rounded-lg transition-all flex-1 md:flex-none', 
                            tabActiva === 'grupos' ? 'bg-sidebar text-blue-500 shadow-sm' : 'text-text-muted hover:text-text-main']">
                👥 Grupos de Trabajo
            </button>
            <button @click="tabActiva = 'tareas'"
                    :class="['px-4 py-2 text-sm font-medium rounded-lg transition-all flex-1 md:flex-none', 
                            tabActiva === 'tareas' ? 'bg-sidebar text-blue-500 shadow-sm' : 'text-text-muted hover:text-text-main']">
                📋 Tareas Globales
            </button>
        </div>

        <div class="bg-sidebar border border-border-main rounded-2xl shadow-sm transition-colors overflow-hidden">
            
            <div v-if="tabActiva === 'usuarios'" class="p-6">
                <h2 class="text-lg font-bold text-text-main mb-4">Equipo Activo</h2>
                
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="border-b border-border-main text-text-muted text-sm">
                                <th class="pb-3 font-semibold px-4">Nombre</th>
                                <th class="pb-3 font-semibold px-4">Email</th>
                                <th class="pb-3 font-semibold px-4">Rol</th>
                                <th class="pb-3 font-semibold px-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="user in usuariosTemp" :key="user.id" 
                                class="border-b border-border-main last:border-0 hover:bg-bg-hover transition-colors group">
                                <td class="py-3 px-4 font-medium text-text-main">{{ user.nombre }}</td>
                                <td class="py-3 px-4 text-text-muted text-sm">{{ user.email }}</td>
                                <td class="py-3 px-4">
                                    <span :class="['px-2 py-1 text-xs font-bold rounded-md', 
                                          user.rol === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400']">
                                        {{ user.rol }}
                                    </span>
                                </td>
                                <td class="py-3 px-4 text-right">
                                    <button class="text-text-muted hover:text-blue-500 transition-colors text-sm font-medium">Editar</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div v-if="tabActiva === 'grupos'" class="p-6 flex flex-col items-center justify-center text-center py-12">
                <div class="w-16 h-16 bg-bg-main rounded-full flex items-center justify-center mb-4 text-2xl border border-border-main">👥</div>
                <h3 class="text-text-main font-bold text-lg">Próximamente: Grupos</h3>
                <p class="text-text-muted text-sm mt-1 max-w-sm">Acá armaremos los equipos de trabajo para asignar clientes y tareas masivas.</p>
            </div>

            <div v-if="tabActiva === 'tareas'" class="p-6 flex flex-col items-center justify-center text-center py-12">
                <div class="w-16 h-16 bg-bg-main rounded-full flex items-center justify-center mb-4 text-2xl border border-border-main">📋</div>
                <h3 class="text-text-main font-bold text-lg">Próximamente: Asignaciones</h3>
                <p class="text-text-muted text-sm mt-1 max-w-sm">Desde acá delegarás tareas a grupos enteros o vendedores específicos.</p>
            </div>

        </div>
    </div>
</template>