import type { ClientStatus } from "@/consts/clientStatuses"

export interface ICliente {
    id: number
    nombre: string
    email: string
    telefono: string
    estado: ClientStatus
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
    filtroEstado?: string
    orden?: string
}

export interface IClienteCreacion {
    nombre: string
    email: string
    telefono: string
}