// routes/dashboardRoutes.js
import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { getFamilyDashboardData } from "../controllers/dashboardController.js";

const router = express.Router();
router.route("/").get(isAuthenticated, getFamilyDashboardData);

export default router;