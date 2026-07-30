import { productService } from "@/services/products/productService";
import { useToast } from "./useToast";
import type { IProductCreate } from "@/interfaces/IProducts";

export function useProducts() {
    const toast = useToast();

    const loadProducts = async (skip: number = 0, limit: number = 100, busqueda: string = '', filtroEstado: string = '', filtroCategoria: string = '') => {
        try {
            const products = await productService.getProducts(skip, limit, filtroEstado, filtroCategoria, busqueda);
            return products;
        } catch (error) {
            console.error('Error al cargar productos:', error);
            toast.error('Error al cargar productos. Inténtalo de nuevo.');
            return [];
        }
    };

    const adjustProductStock = async (productoId: number, ajuste: number) => {
        try {
            const updatedProduct = await productService.updateProductStock(productoId, ajuste);
            toast.exito(`Stock de "${updatedProduct.nombre}" actualizado.`);
            return updatedProduct;
        } catch (error: any) {
            console.error('Error al ajustar stock:', error);
            const msg = error.response?.data?.detail || 'No se pudo actualizar el stock del producto.';
            toast.error(msg);
            throw error;
        }
    };

    const editProductExistente = async (productoId: number, productoData: Partial<IProductCreate>) => {
        try {
            const updatedProduct = await productService.updateProduct(productoId, productoData);
            toast.exito(`Producto "${updatedProduct.nombre}" actualizado.`);
            return updatedProduct;
        } catch (error: any) {
            console.error('Error al editar producto:', error);
            const msg = error.response?.data?.detail || 'No se pudo actualizar el producto.';
            toast.error(msg);
            throw error;
        }
    };

    const deleteProductExistente = async (productoId: number) => {
        try {
            await productService.deleteProduct(productoId);
            toast.exito(`Producto eliminado correctamente.`);
        } catch (error: any) {
            console.error('Error al eliminar producto:', error);
            const msg = error.response?.data?.detail || 'No se pudo eliminar el producto.';
            toast.error(msg);
            throw error;
        }
    };

    const loadProductById = async (productoId: number) => {
        try {
            const product = await productService.getProduct(productoId);
            return product;
        } catch (error) {
            console.error('Error al cargar producto:', error);
            toast.error('No se pudo obtener el detalle del producto.');
            throw error;
        }
    };

    return {
        loadProducts,
        loadProductById,
        adjustProductStock,
        editProductExistente,
        deleteProductExistente
    };
}