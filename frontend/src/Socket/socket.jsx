import { io } from "socket.io-client";

export const initSocket = async (token) => {
    const options = {
        'force new connection': true,
        reconnectionAttempt: 'Infinity',
        timeout: 10000,
        transports: ['websocket'],
        secure: true,
        auth: {
            token: token
        }
    };
    return io(import.meta.env.VITE_BACKEND_URL, options);
}