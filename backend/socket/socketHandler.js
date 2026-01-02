import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import File from '../models/File.js';
import Room from '../models/Room.js';
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

        socket.on(ACTIONS.JOIN, async ({ roomId }) => {
            try {
                socket.join(roomId);

                // Update room participant status
                const room = await Room.findOne({ roomId, isActive: true });
                if (room) {
                    await room.addParticipant(socket.user._id, socket.user.username);
                    console.log(`Updated room ${roomId} with participant ${socket.user.username}`);
                } else {
                    console.log(`Room ${roomId} not found in database, using temporary session`);
                }

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
            } catch (error) {
                console.error('Error joining room:', error);
                socket.emit('error', { message: 'Failed to join room' });
            }
        });

        socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
            console.log(`CODE_CHANGE received from ${socket.user.username} in room ${roomId}`);
            roomCode[roomId] = code;
            socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
            console.log(`CODE_CHANGE broadcasted to room ${roomId}`);
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

        socket.on(ACTIONS.FILE_DELETED, async ({ roomId, fileId }) => {
            socket.to(roomId).emit(ACTIONS.FILE_OPENED, {
                fileId,
                fileName,
                openedBy: socket.user.username
            });
        });

        socket.on('disconnecting', async () => {
            const rooms = [...socket.rooms];

            // Update room activity for persistent rooms
            for (const roomId of rooms) {
                if (roomId !== socket.id) { // Skip the default room which is the socket ID
                    try {
                        const room = await Room.findOne({ roomId, isActive: true });
                        if (room) {
                            await room.removeParticipant(socket.user._id);
                            console.log(`Removed participant ${socket.user.username} from room ${roomId}`);
                        }
                    } catch (error) {
                        console.error('Error updating room on disconnect:', error);
                    }
                    
                    socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                        socketId: socket.id,
                        username: socket.user.username
                    });
                }
            }

            delete userMap[socket.id];
            console.log(`User ${socket.user.username} disconnected`);
        });
    });
};