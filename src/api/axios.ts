import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

// Creamos una instancia pre-configurada
const api = axios.create({
  baseURL: 'http://localhost:8000', // La URL de tu FastAPI
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si FastAPI nos devuelve un 401 (token inválido o vencido)
    if (error.response && error.response.status === 401) {
      const authStore = useAuthStore();
      console.warn("Token vencido o inválido. Cerrando sesión...");
      authStore.logout(); // Esto limpia todo y lo patea al /login
    }
    return Promise.reject(error);
  }
);

export default api;