<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { cambiosClientesService } from '@/services/clients/cambiosClientesService';

interface Actividad {
    id: number;
    cliente_id: number;
    cambio: string;
    fecha: string;
    usuario: {
        email: string;
        id: number;
        rol: string;
    };
    cliente: {
        id: number;
        nombre: string;
    };
}

const cargandoActividad = ref(true);
const actividades = ref<Actividad[]>([]);


const getActionColor = (cambio: string) => {
    if (cambio.includes('creó')) return 'bg-green-100 text-green-700'
    if (cambio.includes('borró')) return 'bg-red-100 text-red-700'
    return 'bg-blue-100 text-blue-700'
}


onMounted(async () => {
    try {
        const data = await cambiosClientesService.getCambiosClientesPropios();
        actividades.value = data;
    } catch (error) {
        console.error('Error al cargar actividad reciente:', error);
    } finally {
        cargandoActividad.value = false;
    }
});

</script>

<template>
    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 class="text-xl font-bold text-gray-800 mb-6">Actividad Reciente</h2>

        <div v-if="cargandoActividad" class="space-y-4">
            <div v-for="i in 3" :key="i" class="h-16 bg-gray-100 animate-pulse rounded-lg"></div>
        </div>

        <ul v-else class="space-y-6">
            <li v-for="item in actividades" :key="item.id" class="flex gap-4">
                <div :class="['w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', getActionColor(item.cambio)]">
                    <span class="text-xs font-bold">●</span>
                </div>

                <div class="flex-1">
                    <p class="text-sm text-gray-800">
                        <span class="font-semibold">
                            {{ item.usuario.email.split('@')[0] }}
                        </span> 
                        {{ item.cambio }} de
                        <span class="font-bold text-gray-900 italic">
                            "{{ item.cliente.nombre }}"
                        </span>
                    </p>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="text-xs text-gray-400 italic">
                            {{ new Date(item.fecha).toLocaleString() }}
                        </span>
                    </div>
                </div>
            </li>
        </ul>

        <div v-if="!cargandoActividad && actividades.length === 0" class="text-center py-8 text-gray-400">
            No hay actividad registrada aún.
        </div>
    </div>
</template>