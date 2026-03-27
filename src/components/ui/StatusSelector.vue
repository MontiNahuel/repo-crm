<script setup lang="ts">
import { ref } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { CLIENT_STATUS_CONFIG, type ClientStatus } from '@/consts/clientStatuses';

const props = defineProps<{
  modelValue: ClientStatus;
  disabled?: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'change']);

const container = ref(null);
const isOpen = ref(false);

// Cerramos el menú mágicamente al hacer clic afuera
onClickOutside(container, () => (isOpen.value = false));

const toggle = () => {
  if (!props.disabled) isOpen.value = !isOpen.value;
};

const seleccionar = (status: ClientStatus) => {
  if (status === props.modelValue) {
    isOpen.value = false;
    return;
  }
  emit('update:modelValue', status);
  emit('change', status);
  isOpen.value = false;
};
</script>

<template>
  <div ref="container" class="relative inline-block text-left">
    <button
      @click="toggle"
      type="button"
      :disabled="disabled"
      class="flex items-center justify-between gap-2 w-32 px-3 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider transition-all border border-transparent focus:ring-2 focus:ring-blue-500/50 active:scale-95 shadow-sm"
      :class="[CLIENT_STATUS_CONFIG[modelValue].badgeClass, { 'opacity-60 cursor-not-allowed': disabled }]"
    >
      <span class="w-2 h-2 rounded-full animate-pulse" :class="CLIENT_STATUS_CONFIG[modelValue].dotColor"></span>
      {{ CLIENT_STATUS_CONFIG[modelValue].label }}
      <svg class="w-3 h-3 transition-transform duration-300" :class="{'rotate-180': isOpen}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0 -translate-y-2"
      enter-to-class="transform scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-100 translate-y-0"
      leave-to-class="transform scale-95 opacity-0 -translate-y-2"
    >
      <div 
        v-if="isOpen" 
        class="absolute left-0 mt-2 w-44 bg-sidebar border border-border-main rounded-2xl shadow-2xl z-[110] py-2 overflow-hidden backdrop-blur-md bg-opacity-95"
      >
        <button
          v-for="(config, key) in CLIENT_STATUS_CONFIG"
          :key="key"
          @click="seleccionar(key as ClientStatus)"
          class="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-text-main transition-all"
          :class="[
            config.hoverClass,
            modelValue === key ? 'bg-bg-hover text-blue-500' : 'text-text-muted hover:text-text-main'
          ]"
        >
          <span class="w-2 h-2 rounded-full" :class="config.dotColor"></span>
          {{ config.label }}
          <span v-if="modelValue === key" class="ml-auto text-[10px]">●</span>
        </button>
      </div>
    </Transition>
  </div>
</template>