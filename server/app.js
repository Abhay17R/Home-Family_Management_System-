import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connection } from "./database/dbconnection.js";
import { errorMiddleware } from "./middleware/error.js";
import userRouter from "./routes/userRouter.js";
import dashboardRoutes from './routes/dashboardRoutes.js'; 
config({ path: "./config.env" });

export const app = express();



app.use(
  cors({
    origin: [process.env.FRONTEND_URL || "*"], // Agar FRONTEND_URL na ho to * laga do testing ke liye
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // spelling fix
  })
);

app.use(cookieParser());
app.use(express.json()); // parentheses important hain
app.use(express.urlencoded({ extended: true }));
app.use("/api/dashboard", dashboardRoutes);

app.use("/api/v1", userRouter);

connection();

app.use(errorMiddleware);
