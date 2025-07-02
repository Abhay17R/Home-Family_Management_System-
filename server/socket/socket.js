// backend/socket/socket.js

import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';
import cookie from 'cookie';

let io;

export const initializeSocketServer = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    // --- SOCKET AUTHENTICATION MIDDLEWARE ---
    io.use(async (socket, next) => {
        try {
            const cookieString = socket.request.headers.cookie || "";
            const cookies = cookie.parse(cookieString);
            const token = cookies.token;
            if (!token) return next(new Error('Authentication Error: Token nahi mila.'));
            
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            const user = await User.findById(decoded.id);
            if (!user) return next(new Error('Authentication Error: User nahi mila.'));

            socket.user = user;
            next();
        } catch (error) {
            next(new Error('Authentication Error'));
        }
    });

    // --- MAIN CONNECTION LOGIC ---
    io.on('connection', async (socket) => {
        console.log(`✅ User Joda: ${socket.user.name}`);
        
        try {
            await User.findByIdAndUpdate(socket.user._id, { isOnline: true });
            io.to(socket.user.familyId).emit('dashboardUpdate'); // Family ko update bhejo
        } catch (dbError) {
            console.error("DB Error (Connection):", dbError.message);
        }
        
        if (socket.user.familyId) {
            socket.join(socket.user.familyId);
        }

        // --- DISCONNECT LOGIC ---
        socket.on('disconnect', async () => {
            // Humne yahan extra console.log daala hai
            console.log(`❌ User Hata Event Trigger Hua: ${socket.user.name}`);

            try {
                // Check karein ki socket.user hai ya nahi
                if (socket.user && socket.user._id) {
                    await User.findByIdAndUpdate(socket.user._id, { isOnline: false, lastSeen: new Date() });
                    console.log(`✅ DB Update: ${socket.user.name} ko offline set kar diya.`);
                    io.to(socket.user.familyId).emit('dashboardUpdate'); // Family ko update bhejo
                }
            } catch (dbError) {
                console.error("DB Error (Disconnect):", dbError.message);
            }
        });
    });

    return io;
};

// ... baaki ka file (getSocketServerInstance)
export const getSocketServerInstance = () => {
    if (!io) {
        throw new Error('Socket.IO initialize nahi hua hai!');
    }
    return io;
};