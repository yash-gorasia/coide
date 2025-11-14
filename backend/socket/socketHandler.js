import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import File from '../models/File.js';
import ACTIONS from '../utils/socketEvents.js';

const userMap = {};
const roomCode = {};

// Socket authentication middleware
export const authenticateSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
            return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return next(new Error('Invalid token'));
        }

        socket.user = user;
        next();
    } catch (error) {
        next(new Error('Authentication failed'));
    }
};

function getAllConnectedClients(io, roomId) {
    const room = io.sockets.adapter.rooms.get(roomId);
    if (!room) return [];
    
    return Array.from(room).map((socketId) => {
        return {
            socketId,
            username: userMap[socketId]?.username,
            userId: userMap[socketId]?.userId
        };
    });
}

export const handleSocketConnection = (io) => {
    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id} - User: ${socket.user.username}`);
        
        // Store user info
        userMap[socket.id] = {
            username: socket.user.username,
            userId: socket.user._id
        };

        socket.on(ACTIONS.JOIN, ({ roomId }) => {
            socket.join(roomId);

            // Send the latest code to the newly joined user
            if (roomCode[roomId]) {
                setTimeout(() => {
                    socket.emit(ACTIONS.SYNC_CODE, { code: roomCode[roomId] });
                }, 400);
            }

            const clients = getAllConnectedClients(io, roomId);
            
            // Notify all clients about the new user
            clients.forEach(({ socketId }) => {
                io.to(socketId).emit(ACTIONS.JOINED, {
                    clients,
                    username: socket.user.username,
                    socketId: socket.id
                });
            });

            console.log(`User ${socket.user.username} joined room ${roomId}`);
        });

        socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
            roomCode[roomId] = code;
            socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
        });

        socket.on(ACTIONS.CODE_EXECUTION_RESULT, ({ roomId, outputDetails }) => {
            socket.to(roomId).emit(ACTIONS.CODE_EXECUTION_RESULT, {
                outputDetails,
                executedBy: socket.user.username
            });
        });

        // File Management Events
        socket.on(ACTIONS.FILE_CREATED, async ({ roomId, file }) => {
            socket.to(roomId).emit(ACTIONS.FILE_CREATED, {
                file,
                createdBy: socket.user.username
            });
        });

        socket.on(ACTIONS.FILE_UPDATED, async ({ roomId, file }) => {
            socket.to(roomId).emit(ACTIONS.FILE_UPDATED, {
                file,
                updatedBy: socket.user.username
            });
        });

        socket.on(ACTIONS.FILE_DELETED, async ({ roomId, fileId }) => {
            socket.to(roomId).emit(ACTIONS.FILE_DELETED, {
                fileId,
                deletedBy: socket.user.username
            });
        });

        socket.on(ACTIONS.FILE_RENAMED, async ({ roomId, file }) => {
            socket.to(roomId).emit(ACTIONS.FILE_RENAMED, {
                file,
                renamedBy: socket.user.username
            });
        });

        socket.on(ACTIONS.FILE_OPENED, async ({ roomId, fileId, fileName }) => {
            socket.to(roomId).emit(ACTIONS.FILE_OPENED, {
                fileId,
                fileName,
                openedBy: socket.user.username
            });
        });

        socket.on('disconnecting', () => {
            const rooms = [...socket.rooms];

            rooms.forEach((roomId) => {
                socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                    socketId: socket.id,
                    username: socket.user.username
                });
            });

            delete userMap[socket.id];
            console.log(`User ${socket.user.username} disconnected`);
        });
    });
};