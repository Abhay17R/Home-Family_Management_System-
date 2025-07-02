// routes/dashboardRoutes.js

import express from 'express';
import { getDashboardData } from '../controllers/homeController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Sirf ek hi route hoga: GET /
// `isAuthenticated` middleware user ko verify karega aur `req.user` me user data daal dega.
router.route('/').get(isAuthenticated, getDashboardData);

export default router;