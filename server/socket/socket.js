// socket/socket.js
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';

let io;

export const initializeSocketServer = (server) => {
    io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173', // Apne frontend ka URL
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    // Middleware to authenticate socket connection
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error('Authentication error: Token not provided'));
            
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            const user = await User.findById(decoded.id);

            if (!user) return next(new Error('Authentication error: User not found'));

            socket.user = user; // Attach user to the socket object
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);
        
        // User ko uski family ke "room" me join karwao
        if (socket.user.familyId) {
            socket.join(socket.user.familyId);
            console.log(`User ${socket.user.name} joined family room: ${socket.user.familyId}`);
        }

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
};

// Function to get the io instance in other files (like controllers)
export const getSocketServerInstance = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized!');
    }
    return io;
};