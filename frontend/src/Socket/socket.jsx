import { io } from "socket.io-client";

export const initSocket = async () => {
    const options = {
        'force new connection': true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        transports: ['polling', 'websocket'], // Try polling first, then websocket
        upgrade: true,
        autoConnect: true,
        forceNew: true
    };
    
    const serverUrl = import.meta.env.VITE_WS_URL;
    console.log('Connecting to:', serverUrl);
    
    if (!serverUrl) {
        throw new Error('VITE_WS_URL environment variable is not set');
    }
    
    return io(serverUrl, options);
}