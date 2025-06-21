// routes/dashboardRoutes.js

import express from "express";
import { isAuthenticated } from "../middleware/auth.js"; // Aapka auth middleware
import { getFamilyDashboardData } from "../controllers/dashboardController.js"; // Aapka naya controller

const router = express.Router();

// GET /api/dashboard/
// Is route par aane wali request pehle isAuthenticated middleware se guzregi.
// Agar successful hui, to getFamilyDashboardData controller chalega.
router.route("/").get(isAuthenticated, getFamilyDashboardData);

export default router;