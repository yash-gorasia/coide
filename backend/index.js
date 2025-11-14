import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv'
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.js';
import fileRoutes from './routes/files.js';
import { authenticateSocket, handleSocketConnection } from './socket/socketHandler.js';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const PORT = process.env.PORT || 8000;

const app = express();
const server = http.createServer(app);

// Connect to database
connectDB();

// Middleware
app.use(cors({
    origin: ["http://localhost:5173", "https://coide.vercel.app"],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'CoIDE Backend Server is running',
        timestamp: new Date().toISOString()
    });
});

// Socket.IO setup
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "https://coide.vercel.app"],
        credentials: true
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true
});

// Socket authentication
io.use(authenticateSocket);

// Handle socket connections
handleSocketConnection(io);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});