export interface IKpisResponse {
    kpis: {
        clientes_activos: number;
        leads_pendientes: number;
        tasa_conversion: number;
        total_historico: number;
    };
    pipeline: {
        LEAD: number;
        ACTIVO: number;
        INACTIVO: number;
        PERDIDO: number;
    };
}