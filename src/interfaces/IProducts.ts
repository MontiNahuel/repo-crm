export interface IProductCreate {
    sku: string;
    nombre: string;
    descripcion: string;
    precio: number;
    is_active: boolean;
    id_categoria: number;
    inventario?: IInventoryCreate;
}

export interface IProducts {
    sku: string;
    nombre: string;
    descripcion: string;
    precio: number;
    is_active: boolean;
    id_categoria: number;
    id: number;
    categoria?: ICategory;
    inventario?: IInventory;
}

export interface ICategory {
    id: number;
    nombre: string;
    descripcion: string;
}

export interface IInventoryCreate {
    stock: number;
    stock_minimo: number;
}

export interface IInventory {
    id_producto: number;
    stock: number;
    stock_minimo: number;
}

export interface IProductsResponse {
    productos: IProducts[];
    cantidadProductos: number;
}
