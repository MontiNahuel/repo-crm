import { defineStore } from "pinia";
import { ref, computed } from "vue";
import router from "@/router";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
    sub: string;
    rol: string;
    exp: number;
    nombre: string;
    apellido: string;
}

export const useAuthStore = defineStore("auth", () => {
    const token = ref<string | null>(localStorage.getItem("token"));
    const userRole = ref<string | null>(null);
    const isAuthenticated = computed(() => token.value !== null && token.value !== '');
    const name = ref<string | null>(null);
    const subname = ref<string | null>(null);


    const updateRoleFromToken = () => {
        if (token.value) {
            try {
                const decoded = jwtDecode<TokenPayload>(token.value);
                userRole.value = decoded.rol;
                name.value = decoded.nombre;
                subname.value = decoded.apellido;

            } catch (error) {
                console.error("Error decoding token:", error);
                userRole.value = null;
            }
        }
    };

    updateRoleFromToken();

    const setToken = (newToken: string) => {
        token.value = newToken;
        localStorage.setItem("token", newToken);
        updateRoleFromToken();
    };

    const logout = () => {
        token.value = null;
        localStorage.removeItem("token");
        userRole.value = null;
        router.push({ name: 'login' });
    }

    return { token, isAuthenticated, userRole, name, subname, setToken, logout };
});