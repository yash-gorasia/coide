// Test file to verify socket connection
import { io } from "socket.io-client";

const testConnection = () => {
    const socket = io(import.meta.env.VITE_WS_URL, {
        transports: ['websocket', 'polling'],
        timeout: 5000
    });

    socket.on('connect', () => {
        console.log('✅ Socket connected successfully');
        console.log('Socket ID:', socket.id);
        socket.disconnect();
    });

    socket.on('connect_error', (err) => {
        console.error('❌ Socket connection failed:', err);
    });
};

// Call this function to test
// testConnection();

export default testConnection;
