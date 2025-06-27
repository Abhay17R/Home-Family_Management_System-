// routes/emergencyRoutes.js
import express from 'express';
import { triggerAlert, resolveAlert, getAlertHistory } from '../controllers/emergencyController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Sabhi routes protected hain
router.route('/trigger').post(isAuthenticated, triggerAlert);
router.route('/resolve').post(isAuthenticated, resolveAlert);
router.route('/history').get(isAuthenticated, getAlertHistory);

export default router;