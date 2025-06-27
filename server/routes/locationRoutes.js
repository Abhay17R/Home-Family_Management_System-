// routes/locationRoutes.js (Nayi file banayein)

import express from 'express';
import { 
    updateMyLocation,
    toggleLocationSharing,
    getFamilyLocations
} from '../controllers/locationController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Sabhi routes ke liye user ka logged-in hona zaroori hai.
// isliye hum har route me `isAuthenticatedUser` middleware use karenge.

// GET /api/v1/location/family -> To get all family members' data for the map
router.route('/family').get(isAuthenticated, getFamilyLocations);

// POST /api/v1/location/update -> To update the logged-in user's own location
router.route('/update').post(isAuthenticated, updateMyLocation);

// POST /api/v1/location/privacy -> To toggle sharing on/off
router.route('/privacy').post(isAuthenticated, toggleLocationSharing);
// router.route('/me').get(isAuthenticated, getUserProfile);

export default router;