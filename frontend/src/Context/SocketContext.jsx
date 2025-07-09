
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
            try {
                console.log('Initializing socket connection...');
                socketRef.current = await initSocket();

                // Connection event handlers
                socketRef.current.on("connect", () => {
                    console.log("Socket connected successfully");
                    toast.success("Connected to server");
                });

                socketRef.current.on("disconnect", (reason) => {
                    console.log("Socket disconnected:", reason);
                    toast.warning("Disconnected from server");
                });

                socketRef.current.on("connect_error", handleErrors);
                socketRef.current.on("connect_failed", handleErrors);
                socketRef.current.on("reconnect_error", handleErrors);

                function handleErrors(err) {
                    console.error("Socket error:", err);
                    console.error("Error details:", {
                        message: err.message,
                        description: err.description,
                        context: err.context,
                        type: err.type
                    });
                    toast.error(`Socket connection failed: ${err.message || 'Unknown error'}`);
                    // Don't navigate immediately, give time for retries
                    setTimeout(() => navigate("/"), 5000);
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
            } catch (error) {
                console.error("Failed to initialize socket:", error);
                toast.error("Failed to connect to server");
                navigate("/");
            }
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