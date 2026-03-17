import { io, Socket } from "socket.io-client";
import { ref } from "vue";

const socketURL = 'http://localhost:8000';
const socket: Socket = io(socketURL, {
    autoConnect: false,
});

const isConnected = ref(false);

export function useSocket() {

    const connect = () => {
        if (!socket.connected) {
            socket.connect();
        }
    };

    const disconnect = () => {
        if (socket.connected) {
            socket.disconnect();
        }
    };

    socket.on('connect', () => {
        isConnected.value = true;
        console.log('⚡ Conectado al servidor de Socket.IO con ID:', socket.id);
    });

    socket.on('disconnect', () => {
        isConnected.value = false;
        console.log('🔴 Desconectado del servidor');
    });

    return {
        socket,
        isConnected,
        connect,
        disconnect,
    };
}