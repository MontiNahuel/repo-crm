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

    async getProduct(productoId: number) {
        try {
            const response = await api.get(`/productos/${productoId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching product:', error);
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

    async updateProductStock(productoId: number, ajuste: number) {
        try {
            const response = await api.patch(`/productos/${productoId}/stock`, null, { params: { ajuste } });
            return response.data;
        } catch (error) {
            console.error('Error actualizando stock del producto:', error);
            throw error;
        }
    },

    async updateProduct(productoId: number, productoData: Partial<IProductCreate>) {
        try {
            const response = await api.patch(`/productos/${productoId}`, productoData);
            return response.data;
        } catch (error) {
            console.error('Error actualizando el producto:', error);
            throw error;
        }
    },

    async deleteProduct(productoId: number) {
        try {
            const response = await api.delete(`/productos/${productoId}`);
            return response.data;
        } catch (error) {
            console.error('Error eliminando el producto:', error);
            throw error;
        }
    },
}