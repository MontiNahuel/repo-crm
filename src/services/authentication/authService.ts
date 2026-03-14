import api from "@/api/axios";
import axios from "axios";

export const authService = {

    async login(emailValue: string, passwordValue: string) {
        const params = new URLSearchParams();
        params.append('username', emailValue);
        params.append('password', passwordValue);
        try {
            const { data } = await api.post('/usuarios/login', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            return data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    const status = error.response.status;
                    if (status === 401 || status === 404 || status === 400) {
                        throw new Error('Unauthorized: Invalid email or password.');
                    }
                    if (status === 422) {
                        throw new Error('Bad Request: Please check your input.');
                    }
                    throw new Error(`Error en el servidor (Código: ${status}).`)
                } else if (error.request) {
                    throw new Error('No response from server. Please try again later.');
                } else {
                    throw new Error('An error occurred while setting up the request.');
                }
            }

            if (error instanceof Error) {
                throw new Error(`An unexpected error occurred: ${error.message}`);
            }

            throw new Error('An unexpected error occurred. Please try again later.');
        }
    }
}