import { io, Socket } from "socket.io-client";
import { ref } from "vue";

const socketURL = 'http://localhost:8000';
const socket: Socket = io(socketURL, {
    autoConnect: false,
    transports: ["websocket"]
});

const isConnected = ref(false);

socket.on('connect', () => {
    isConnected.value = true;
    console.log('⚡ Conectado al servidor de Socket.IO con ID:', socket.id);
});

socket.on('disconnect', () => {
    isConnected.value = false;
    console.log('🔴 Desconectado del servidor');
});

socket.on('connect_error', (err) => {
    isConnected.value = false;
    console.error('❌ Error de conexión de Socket.IO:', err);
});

export function useSocket() {

    const connect = () => {
        const token = localStorage.getItem("token");
        if (token) {
            socket.auth = { token };
        }
        
        if (!socket.connected) {
            socket.connect();
        } else {
            isConnected.value = true;
        }
    };

    const disconnect = () => {
        if (socket.connected) {
            socket.disconnect();
        }
    };

    return {
        socket,
        isConnected,
        connect,
        disconnect,
    };
}