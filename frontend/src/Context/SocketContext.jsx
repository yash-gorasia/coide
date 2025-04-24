
import { createContext, useContext, useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { initSocket } from "../Socket/socket";
import ACTIONS from "../Constants/socketEvents";
import { toast } from "react-toastify";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const roomId = localStorage.getItem("room-id");
    const username = localStorage.getItem("username");
    const [clients, setClients] = useState([]);
    const socketRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();

            socketRef.current.on("connect_error", handleErrors);
            socketRef.current.on("connect_failed", handleErrors);

            function handleErrors(err) {
                console.log("Socket error:", err);
                toast.error("Socket connection failed.");
                navigate("/");
            }

            socketRef.current.emit(ACTIONS.JOIN, { roomId, username });

            socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
                if (socketId !== socketRef.current.id) {
                    toast.info(`${username} has joined the room.`);
                }
                setClients(clients);
            });

            socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
                toast.success(`${username} left the room`);
                setClients((prev) => prev.filter((client) => client.socketId !== socketId));
            });
        };

        init();

        return () => {
            if (socketRef.current) {
                socketRef.current.off("connect_error");
                socketRef.current.off("connect_failed");
                socketRef.current.off(ACTIONS.JOINED);
                socketRef.current.disconnect();
            }
        };
    }, [roomId, username, navigate]);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, clients }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);