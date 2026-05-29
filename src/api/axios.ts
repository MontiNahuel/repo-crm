import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

// Creamos una instancia pre-configurada
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000', // URL dinámica en producción
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

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const authStore = useAuthStore();

    // Si FastAPI nos devuelve un 401 (token inválido o vencido)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      
      // Si la petición que falló ya era el refresh o el login, evitamos bucles infinitos
      if (originalRequest.url === '/usuarios/refresh' || originalRequest.url === '/usuarios/login') {
        authStore.logout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Encolamos la petición hasta que termine el refresh actual
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("Token de acceso vencido. Intentando silent-refresh...");
        const baseUrl = api.defaults.baseURL || 'http://localhost:8000';
        
        // Hacemos la petición de refresh usando la instancia de axios directo (no 'api') para evitar interceptores
        const { data } = await axios.post(`${baseUrl}/usuarios/refresh`, {
          refresh_token: authStore.refreshToken
        });

        console.log("¡Token renovado con éxito!");
        authStore.setTokens(data.access_token, data.refresh_token);
        
        // Procesamos la cola con el nuevo token
        processQueue(null, data.access_token);

        // Reintentamos la petición original
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Error al refrescar el token:", refreshError);
        processQueue(refreshError, null);
        authStore.logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;