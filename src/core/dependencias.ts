// Función para formatear: "06/03/2026, 15:30"
export const formatearFechaHora = (fechaIso?: string | null) => {
    if (!fechaIso) return '';
    const fecha = new Date(fechaIso);
    return new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // Formato 24hs
    }).format(fecha);
}