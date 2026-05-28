import { ref } from "vue";
import { clientService } from "@/services/clients/clientService";
import { cambiosClientesService } from "@/services/clients/cambiosClientesService";
import { useToast } from "./useToast";
import type { ClientStatus } from "@/consts/clientStatuses";
import type { ICliente, IClienteCreacion } from "@/services/clients/interfacesClientes";

export function useClients() {

    const toast = useToast();
    const cambiandoEstado = ref(false);
    const guardando = ref(false);

    const cambiarEstadoDelCliente = async (cliente: ICliente, nuevoEstado: ClientStatus, antiguoEstado: ClientStatus) => {
        // 1. Guardamos el backup INTERNAMENTE en el composable
        const estadoAnterior = antiguoEstado;
        console.log("Nuevo estado: ", nuevoEstado)

        cambiandoEstado.value = true;

        // 2. Aplicamos el cambio en la UI inmediatamente (Optimistic)
        cliente.estado = nuevoEstado;

        try {
            await cambiosClientesService.changeStateClient(cliente.id, nuevoEstado);
            toast.exito('¡Estado actualizado!');
        } catch (error) {
            // 3. ROLLBACK AUTOMÁTICO: El composable sabe qué valor había antes
            cliente.estado = estadoAnterior;
            toast.error('Error al actualizar. Revirtiendo cambios...');
            throw error;
        } finally {
            cambiandoEstado.value = false;
        }
    };

    const editarCliente = async (clienteId: number, datosParciales: Partial<IClienteCreacion>) => {
        guardando.value = true;
        try {
            const data = await clientService.editarCliente(clienteId, datosParciales);
            toast.exito('¡Cliente actualizado con éxito!');
            return data;
        } catch (error) {
            toast.error('Error al actualizar el cliente.');
            throw error;
        } finally {
            guardando.value = false;
        }
    };

    const eliminarCliente = async (clienteId: number) => {
        guardando.value = true;
        try {
            await clientService.eliminarCliente(clienteId);
            toast.exito('¡Cliente eliminado con éxito!');
        } catch (error) {
            toast.error('Error al eliminar el cliente.');
            throw error;
        } finally {
            guardando.value = false;
        }
    };

    return {
        cambiarEstadoDelCliente,
        cambiandoEstado,
        editarCliente,
        eliminarCliente,
        guardando
    };
}