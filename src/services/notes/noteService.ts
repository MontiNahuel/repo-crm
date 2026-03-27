// --- Axios ---
import api from "@/api/axios";

// --- Interfaces ---
import type { INoteClient, INoteCreate } from "@/interfaces/INote";

export const noteService = {
    async getNotesByClientId(clienteId: number): Promise<INoteClient[]> {
        try {
            const response = await api.get(`/notas/propios/cliente/${clienteId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching notes:', error);
            throw error;
        }
    },

    async createNote(note: INoteCreate) {
        try {
            const response = await api.post(`/notas/`, note);
            return response.data;
        } catch (error) {
            console.error('Error creating notes: ', error);
            throw error;
        }
    },

    async analizeNoteWithIA(noteId: number) {
        try {
            const response = await api.post(`/notas/analizar-tarea/${noteId}`);
            return response.data;
        } catch (error) {
            console.error('Error analizing notes: ', error);
            throw error;
        }
    },

    async deleteNote(noteId: number) {
        try {
            const response = await api.delete(`/notas/${noteId}`);
            return response.data
        } catch (error) {
            console.error('Error deleting notes: ', error);
            throw error;
        }
    },
}