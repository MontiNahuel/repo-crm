<script setup lang="ts">

// --- Componentes ---
import TareasComponent from '@/components/tasks/TareasComponent.vue';

</script>
<template>
    <div class="p-6 max-w-4xl mx-auto animate-fade-in">

        <TareasComponent 
            :compact="false"
        />

    </div>
</template>