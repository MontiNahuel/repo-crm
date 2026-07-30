import { ref } from 'vue'
import { clientService } from '@/services/clients/clientService'
import { useToast } from './useToast'

export interface IResumenIa {
    id?: string;
    cliente_id: number;
    resumen: string | null;
    fecha?: string;
    solicitante?: {
        user_id: number;
        nombre: string;
        apellido?: string;
    } | string;
}

export function useResumenIa() {
    const toast = useToast()
    const resumenIa = ref<IResumenIa | null>(null)
    const historial = ref<IResumenIa[]>([])
    const cargando = ref(false)
    const generando = ref(false)
    const cargandoHistorial = ref(false)

    const cargarResumen = async (clienteId: number) => {
        cargando.value = true
        try {
            const response = await clientService.getResumenIa(clienteId)
            if (response && response.resumen) {
                resumenIa.value = response
            } else {
                resumenIa.value = null
            }
        } catch (error) {
            console.error('Error al cargar resumen de IA:', error)
        } finally {
            cargando.value = false
        }
    }

    const generarResumen = async (clienteId: number) => {
        generando.value = true
        try {
            const response = await clientService.generarResumenIa(clienteId)
            resumenIa.value = response
            // Agregamos al principio del historial si ya lo teníamos cargado
            if (historial.value.length > 0) {
                historial.value.unshift(response)
            }
            toast.exito('¡Resumen ejecutivo generado con éxito!')
        } catch (error) {
            toast.error('Error al generar resumen con Gemini.')
            console.error('Error al generar resumen de IA:', error)
        } finally {
            generando.value = false
        }
    }

    const cargarHistorial = async (clienteId: number) => {
        cargandoHistorial.value = true
        try {
            const response = await clientService.getHistorialResumenesIa(clienteId)
            historial.value = response || []
        } catch (error) {
            console.error('Error al cargar historial de resúmenes:', error)
        } finally {
            cargandoHistorial.value = false
        }
    }

    return {
        resumenIa,
        historial,
        cargando,
        generando,
        cargandoHistorial,
        cargarResumen,
        generarResumen,
        cargarHistorial
    }
}
