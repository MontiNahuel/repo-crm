// --- Interfaces ---
import type { INoteClient, INoteCreate } from '@/interfaces/INote';

// --- Servicios ---
import { noteService } from '@/services/notes/noteService';

// --- Composables ---
import { useToast } from '@/composables/useToast';


export function useNotas() {

    const toast = useToast();

    const obtenerNotas = async (clienteId: number): Promise<INoteClient[]> => {
        try {
            const notas = await noteService.getNotesByClientId(clienteId);
            return notas;
        } catch (error) {
            toast.error('Error al cargar las notas del cliente.');
            return [];
        }
    };

    const createNote = async (note: INoteCreate) => {
        try {
            const response = await noteService.createNote(note);
            toast.exito('Nota creada correctamente')
            return response;
        } catch (error) {
            toast.error('Error al crear la nota del cliente.');
            return {}
        }
    };

    const analizeNote = async (noteId: number) => {
        try {
            const response = await noteService.analizeNoteWithIA(noteId);
            toast.exito('Nota analizada correctamente')
            return response;
        } catch (error) {
            toast.error('Error al analizar la nota del cliente.');
            return {}
        }
    };

    const deleteNote = async (noteId: number) => {
        try {
            const response = await noteService.deleteNote(noteId);
            toast.exito('Nota eliminada correctamente')
            return response;
        } catch (error) {
            toast.error('Error al eliminar la nota del cliente.');
            return {}
        }
    }


    return {
        obtenerNotas,
        createNote,
        analizeNote,
        deleteNote
    };
}