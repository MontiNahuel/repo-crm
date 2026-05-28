// --- Axios ---
import api from "@/api/axios";
import type { IProductCreate } from "@/interfaces/IProducts";

export const productService = {
    async getProducts(skip: number, limit: number, filtroEstado: string = "", filtroCategoria: string = "", busqueda: string = "") {
        try {
            const response = await api.get('/productos', { params: { skip, limit, filtroEstado, filtroCategoria, busqueda } });
            return response.data;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },

    async createProduct(productoData: IProductCreate) {
        try {
            // Mandamos el payload al endpoint exacto que armaste en FastAPI
            const response = await api.post('/productos/', productoData);
            return response.data;
        } catch (error) {
            console.error('Error creando el producto:', error);
            throw error;
        }
    },
}