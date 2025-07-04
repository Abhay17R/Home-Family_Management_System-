import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connection } from "./database/dbconnection.js";
import { errorMiddleware } from "./middleware/error.js";
import userRouter from "./routes/userRouter.js";
import dashboardRoutes from './routes/dashboardRoutes.js'; 
import settingsRoutes from './routes/settingsRoutes.js'
import orderRoutes from './routes/orderRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import educationRoutes from'./routes/educationRoutes.js';
import locationRouter from './routes/locationRoutes.js';
import emergencyRouter from './routes/emergencyRoutes.js';
import communicationRoutes from "./routes/communicationRoutes.js"; 
import documentRoutes from './routes/documentRoutes.js';
import homeRoutes from './routes/homeRoutes.js';

config({ path: "./config.env" });

export const app = express();



const allowedOrigins = [
  process.env.FRONTEND_URL,   
  'http://localhost:5173'       // Aapka local development URL
];
const corsOptions = {
  origin: (origin, callback) => {
    // Agar request ka origin 'allowedOrigins' list me hai, ya request kahin bahar se nahi aa rhi (like Postman), to allow karo.
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

// CORS middleware ko updated options ke saath use karein.
app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json()); // parentheses important hain
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/dashboard", dashboardRoutes);

  app.use("/api/v1", userRouter);
  app.use('/api/v1/settings', settingsRoutes);
  app.use('/api/v1/', expenseRoutes);
  app.use('/api/v1/orders', orderRoutes);
  app.use('/api/v1/emergency', emergencyRouter);
   app.use('/api/v1/education', educationRoutes);
   app.use('/api/v1/documents', documentRoutes);
   app.use('/api/v1/location', locationRouter);
   app.use("/api/v1/communication", communicationRoutes);
   app.use("/api/v1/HOME", homeRoutes);

connection();

app.use(errorMiddleware);
