import { productService } from "@/services/products/productService";

export function useProducts() {
    const loadProducts = async (skip: number = 0, limit: number = 100, busqueda: string = '', filtroEstado: string = '', filtroCategoria: string = '') => {
        try {
            const products = await productService.getProducts(skip, limit, filtroEstado, filtroCategoria, busqueda);
            return products;
        } catch (error) {
            console.error('Error al cargar productos:', error);
            //toast.error('Error al cargar productos. Inténtalo de nuevo.');
            return [];
        }
    };

    return {
        loadProducts
    };

}