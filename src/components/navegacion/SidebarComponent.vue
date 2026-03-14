<script setup lang="ts">
// Acá por ahora no necesitamos lógica compleja, 
// Vue Router se encarga de todo el manejo de las clases activas.
</script>

<template>
    <aside class="w-64 h-screen bg-white border-r border-gray-100 flex flex-col shadow-sm">
        
        <div class="h-16 flex items-center px-6 border-b border-gray-50">
            <div class="flex items-center gap-2 text-blue-600">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                <span class="text-xl font-extrabold tracking-tight text-gray-800">Mi CRM</span>
            </div>
        </div>

        <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            
            <router-link to="/dashboard" 
                         class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium"
                         active-class="bg-blue-50 text-blue-700 font-bold hover:bg-blue-50 hover:text-blue-700">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                Dashboard
            </router-link>

            <router-link to="/clientes" 
                         class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium"
                         active-class="bg-blue-50 text-blue-700 font-bold hover:bg-blue-50 hover:text-blue-700">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                Clientes
            </router-link>

        </nav>

        <div class="p-4 border-t border-gray-100">
            <button class="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition">
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                    V
                </div>
                <div class="text-left flex-1">
                    <p class="font-bold text-gray-800">Vendedor</p>
                    <p class="text-xs text-gray-500">Cerrar sesión</p>
                </div>
            </button>
        </div>
        
    </aside>
</template>