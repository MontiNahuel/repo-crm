import { productService } from '@/services/products/productService'; // Ajustá la ruta a donde tengas el archivo
import { useToast } from './useToast';
import type { IProductCreate } from '@/interfaces/IProducts'; // Ajustá la ruta a donde tengas el archivo

export function useProductsModal() {
    const toast = useToast();
    // ... tu loadProducts que ya tenés ...

    // NUEVA FUNCIÓN: Puente para el modal
    const submitProduct = async (productoData: IProductCreate) => {
        try {
            const nuevoProducto = await productService.createProduct(productoData);
            toast.exito('¡Producto creado correctamente!');
            return nuevoProducto;
        } catch (error) {
            console.error("Falló la creación en el composable:", error);
            toast.error('Error al crear el producto. Inténtalo de nuevo.');
            throw error; // Lo lanzamos para que el Modal atrape el catch y frene el spinner
        }
    };

    return {
        // loadProducts,
        submitProduct, // ¡No te olvides de exportarla!
    }
}