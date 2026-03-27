export type ClientStatus = 'LEAD' | 'ACTIVO' | 'INACTIVO' | 'PERDIDO';

export interface StatusConfig {
    label: string;
    dotColor: string; // Color del circulito
    badgeClass: string; // Clases de la píldora
    hoverClass: string; // Color al pasar el mouse en el menú
}

export const CLIENT_STATUS_CONFIG: Record<ClientStatus, StatusConfig> = {
    LEAD: {
        label: 'Lead',
        dotColor: 'bg-orange-500',
        badgeClass: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        hoverClass: 'hover:bg-orange-50 dark:hover:bg-orange-900/20'
    },
    ACTIVO: {
        label: 'Activo',
        dotColor: 'bg-emerald-500',
        badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        hoverClass: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
    },
    INACTIVO: {
        label: 'Inactivo',
        dotColor: 'bg-blue-500',
        badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        hoverClass: 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
    },
    PERDIDO: {
        label: 'Perdido',
        dotColor: 'bg-red-500',
        badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        hoverClass: 'hover:bg-red-50 dark:hover:bg-red-900/20'
    },
};