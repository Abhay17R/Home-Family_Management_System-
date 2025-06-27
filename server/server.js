// index.js (Correct and Final Version)

import { app } from './app.js'; // Apni app.js se app ko import karo
import { createServer } from 'http'; // Node.js ka built-in HTTP server
import { initializeSocketServer } from './socket/socket.js'; // Socket.IO ko initialize karne wala function
import { connection } from "./database/dbconnection.js"; // Database connection

// Step 1: Pehle Database se connect karo
connection();

// Step 2: Express 'app' ko Node ke standard HTTP server me wrap karo
// Isse Express aur Socket.IO dono ek hi server/port par chal payenge
const server = createServer(app);

// Step 3: Ab is wrapped server par Socket.IO ko attach karo
// Ye 'Socket.IO not initialized!' error ko 100% fix karega
initializeSocketServer(server);

// Step 4: Server ko listen karwao
const PORT = process.env.PORT || 4000;

// Important: app.listen() ke bajaye server.listen() call karo
server.listen(PORT, () => {
    console.log(`✅ Server is running on port: ${PORT}`);
    console.log(`✅ Socket.IO is attached and listening for real-time events.`);
});