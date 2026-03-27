import { ref } from 'vue';

export function useConfirmacion() {
    // Estados visuales
    const mostrarModal = ref(false);
    const tituloModal = ref('');
    const mensajeModal = ref('');
    const textoBoton = ref('Confirmar');
    const cargando = ref(false);

    // EL SECRETO: Una variable que guarda LA FUNCIÓN que le pasemos
    const accionEjecutar = ref<(() => Promise<void>) | null>(null);

    // La función para invocar el modal desde cualquier componente
    const pedirConfirmacion = (
        titulo: string,
        mensaje: string,
        textoBtn: string,
        accionFondo: () => Promise<void> // <--- Recibimos la lógica por parámetro
    ) => {
        tituloModal.value = titulo;
        mensajeModal.value = mensaje;
        textoBoton.value = textoBtn;
        accionEjecutar.value = accionFondo; // Guardamos la función
        mostrarModal.value = true;
    };

    const cancelar = () => {
        mostrarModal.value = false;
        accionEjecutar.value = null; // Limpiamos la función por seguridad
    };

    const confirmar = async () => {
        if (!accionEjecutar.value) return;

        cargando.value = true;
        try {
            // EJECUTAMOS la función que estaba guardada
            await accionEjecutar.value();
            mostrarModal.value = false;
        } catch (error) {
            console.error("Error al ejecutar la acción confirmada:", error);
        } finally {
            cargando.value = false;
        }
    };

    return {
        mostrarModal,
        tituloModal,
        mensajeModal,
        textoBoton,
        cargando,
        pedirConfirmacion,
        cancelar,
        confirmar
    };
}