import { ref } from 'vue'

// Definimos la forma de cada cartelito
interface Toast {
    id: number;
    mensaje: string;
    tipo: 'exito' | 'error' | 'info';
}

// El estado global ahora es una LISTA de cartelitos
const toasts = ref<Toast[]>([])
let contadorIds = 0 // Para darle un ID único a cada uno

export function useToast() {
    
    const agregarToast = (mensaje: string, tipo: 'exito' | 'error' | 'info' = 'exito') => {
        const id = contadorIds++
        
        // Metemos el nuevo cartel a la lista
        toasts.value.push({ id, mensaje, tipo })
        
        // Programamos su destrucción
        setTimeout(() => {
            removerToast(id)
        }, 4000)
    }

    const removerToast = (idToRemove: number) => {
        // Filtramos la lista para dejar todos MENOS el que queremos borrar
        toasts.value = toasts.value.filter(t => t.id !== idToRemove)
    }

    return {
        toasts,
        exito: (msg: string) => agregarToast(msg, 'exito'),
        error: (msg: string) => agregarToast(msg, 'error'),
        info: (msg: string) => agregarToast(msg, 'info'),
        removerToast
    }
}