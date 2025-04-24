import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { config } from 'dotenv';
import ACTIONS from './utils/socketEvents.js';

config();

const PORT = process.env.PORT || 8000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "https://coide.vercel.app"],
        methods: ["GET", "POST"],
        credentials: true
    }
});


const userMap = {};
const roomCode = {};

function getAllConnectedClients(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId)).map((socketId) => {
        return {
            socketId,
            username: userMap[socketId]
        };
    });
};

io.on("connection", (socket) => {
    console.log("socket connected", socket.id);
    if (userMap[socket.id]) return;

    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        userMap[socket.id] = username;
        socket.join(roomId);

        // Send the latest code to the newly joined user
        if (roomCode[roomId]) {
            setTimeout(() => {
                socket.emit(ACTIONS.SYNC_CODE, { code: roomCode[roomId] });
            }, 400);
        }

        const clients = getAllConnectedClients(roomId);
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id
            })
        })

        socket.on(ACTIONS.CALL_USER, ({ offer, to }) => {
            console.log("Calling user", offer, to);

            socket.to(to).emit(ACTIONS.INCOMING_CALL, { offer, from: socket.id, username: userMap[socket.id] });
        });

        socket.on(ACTIONS.CALL_ACCEPTED, ({ socketId, answer }) => {
            socket.to(socketId).emit(ACTIONS.CALL_ACCEPTED, { answer });
        })

        socket.on(ACTIONS.ICE_CANDIDATE, ({ to, candidate }) => {
            console.log(`Forwarding ICE candidate to ${to}`);
            socket.to(to).emit(ACTIONS.ADD_ICE_CANDIDATE, {
                candidate,
                from: socket.id
            });
        });
    });

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        roomCode[roomId] = code;
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on(ACTIONS.CODE_EXECUTION_RESULT, ({ roomId, outputDetails }) => {
        // Broadcast code execution results to all users in the room
        socket.to(roomId).emit(ACTIONS.CODE_EXECUTION_RESULT, {
            outputDetails
        });
    });

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];

        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userMap[socket.id]
            });
        });

        delete userMap[socket.id];
        socket.leave();
    })
})


server.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
})