import { ref } from "vue";
import { clientService } from "@/services/clients/clientService";
import { cambiosClientesService } from "@/services/clients/cambiosClientesService";
import { useToast } from "./useToast";
import type { ClientStatus } from "@/consts/clientStatuses";
import type { ICliente } from "@/services/clients/interfacesClientes";

export function useClients() {

    const toast = useToast();
    const cambiandoEstado = ref(false);

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

    return {
        cambiarEstadoDelCliente,
        cambiandoEstado // Exponemos el loading para que el componente lo use
    };
}