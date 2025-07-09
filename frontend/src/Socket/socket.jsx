import { io } from "socket.io-client";

export const initSocket = async () => {
    const options = {
        'force new connection': true,
        reconnectionAttempts: Infinity,
        timeout: 10000,
        transports: ['websocket', 'polling'], // Allow fallback to polling
        secure: true,
        autoConnect: true,
        forceNew: true
    };
    
    console.log('Connecting to:', import.meta.env.VITE_WS_URL);
    return io(import.meta.env.VITE_WS_URL, options);
}