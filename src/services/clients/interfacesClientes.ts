export interface ICliente {
    id: number
    nombre: string
    email: string
    telefono: string
    estado: string
    creado_en: string
}

export interface IPaginacionClientes {
    clientes: ICliente[]
    cantidadClientes: number
}

export interface IParamsForClientesPaginados {
    skip: number
    limit: number
    busqueda?: string
}

export interface IClienteCreacion {
    nombre: string
    email: string
    telefono: string
}