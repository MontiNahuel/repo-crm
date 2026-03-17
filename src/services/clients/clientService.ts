import api from "@/api/axios";
import type { IPaginacionClientes, IParamsForClientesPaginados, IClienteCreacion } from "./interfacesClientes";

export const clientService = {
    async getClients() {
        try {
            const { data } = await api.get('/clientes');
            return data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`An error occurred while fetching clients: ${error.message}`);
            }
            throw new Error('An unexpected error occurred while fetching clients. Please try again later.');
        }
    },

    async getClientsByUser() {
        try {
            const { data } = await api.get('/clientes/mis-clientes');
            //console.log('Clientes obtenidos por usuario:', data);
            return data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`An error occurred while fetching clients: ${error.message}`);
            }
            throw new Error('An unexpected error occurred while fetching clients. Please try again later.');
        }
    },

    async getClientsByRole(role: string | null) {
        return role === 'ADMIN' ? this.getClients() : this.getClientsByUser();
    },

    async getClientesPaginadosPorUsuario(skip: number = 0, limit: number = 10, busqueda: string = ''): Promise<IPaginacionClientes> {
        try {
            const params: IParamsForClientesPaginados = { skip, limit };
            if (busqueda) {
                params.busqueda = busqueda;
            }
            const { data } = await api.get('/clientes/mis-clientes', {
                params
            });
            return data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`An error occurred while fetching paginated clients: ${error.message}`);
            }
            throw new Error('An unexpected error occurred while fetching paginated clients. Please try again later.');
        }
    },

    async crearCliente(cliente: IClienteCreacion) {
        try {
            const { data } = await api.post('/clientes', cliente);
            return data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`An error occurred while creating the client: ${error.message}`);
            }
            throw new Error('An unexpected error occurred while creating the client. Please try again later.');
        }
    }
};