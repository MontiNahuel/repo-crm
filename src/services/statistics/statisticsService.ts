import api from "@/api/axios";
import { type IKpisResponse } from "./InterfacesStatistics";

export const statisticsService = {
    async getKpis(): Promise<IKpisResponse> {
        try {
            const response = await api.get<IKpisResponse>("/dashboard/kpis");
            return response.data;
        } catch (error) {
            console.error("Error fetching KPIs:", error);
            throw error;
        }
    },
};
