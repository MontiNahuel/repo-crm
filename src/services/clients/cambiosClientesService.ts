import api from "@/api/axios";
import type { ClientStatus } from "@/consts/clientStatuses";

export const cambiosClientesService = {
    async getCambiosClientesPropios(skip: number = 0, limit: number = 5) {
        try {
            const { data } = await api.get('/clientes/cambios-clientes', { params: { skip, limit } });
            return data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`An error occurred while fetching client changes: ${error.message}`);
            }
            throw new Error('An unexpected error occurred while fetching client changes. Please try again later.');
        }
    },

    async changeStateClient(id: number, estado: ClientStatus) {
        try {
            const { data } = await api.put(`/clientes/${id}/estado`, { estado });
            return data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`An error occurred while changing client status: ${error.message}`);
            }
            throw new Error('An unexpected error occurred while changing client status. Please try again later.');
        }
    }
}