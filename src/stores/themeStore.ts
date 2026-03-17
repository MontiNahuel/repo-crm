// src/stores/themeStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useThemeStore = defineStore('theme', () => {
    const isDark = ref(localStorage.getItem('theme') === 'dark');

    const toggleTheme = () => {
        isDark.value = !isDark.value;
        localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
        aplicarTema();
    };

    const aplicarTema = () => {
        if (isDark.value) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const loadTheme = () => {
        const temaGuardado = localStorage.getItem('theme');
        if (temaGuardado) {
            isDark.value = temaGuardado === 'dark';
        } else {
            isDark.value = false
            document.documentElement.classList.remove('dark')
        }
        aplicarTema();
    };

    return { isDark, toggleTheme, aplicarTema, loadTheme };
});