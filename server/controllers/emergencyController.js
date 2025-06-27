import { Alert } from '../models/alertModel.js';
import { User } from '../models/userModel.js';
import {catchAsyncError} from '../middleware/catchAsyncError.js';
import { getSocketServerInstance } from '../socket/socket.js'; 
import { sendSmsAndCallAlerts } from '../utils/twilioHelper.js';

/**
 * @description Trigger a new SOS Alert
 * @route POST /api/v1/emergency/trigger
 * @access Private
 */
export const triggerAlert = catchAsyncError(async (req, res, next) => {
    const { lat, lng } = req.body;
    const user = req.user; // Logged-in user who triggered the alert

    if (!lat || !lng) {
        return res.status(400).json({ success: false, message: 'Location is required to trigger an alert.' });
    }

    // Check if an active alert already exists for this user to avoid duplicates
    const existingActiveAlert = await Alert.findOne({ triggeredBy: user._id, status: 'Active' });
    if (existingActiveAlert) {
        return res.status(409).json({ success: false, message: 'You already have an active alert.' });
    }

    const newAlert = await Alert.create({
        triggeredBy: user._id,
        familyId: user.familyId,
        location: { lat, lng },
    });

    // --- SMART NOTIFICATION LOGIC ---
    // Decide who should receive the SMS/Call notifications
    let notificationTargets = [];

    if (user.role === 'child') {
        // If a child triggers the alert, find their parent (admin)
        if (user.parentId) {
            const admin = await User.findById(user.parentId);
            if (admin) {
                notificationTargets.push(admin);
            }
        }
    } else if (user.role === 'admin') {
        // If an admin triggers the alert, find all their children
        notificationTargets = await User.find({ 
            familyId: user.familyId, 
            role: 'child' 
        });
    }
    
    // --- REAL-TIME & SMS/CALL PART ---

    // 1. Notify everyone in the family via Socket.IO for in-app alert
    const io = getSocketServerInstance();
    // Populate the user's name before sending
    const populatedAlert = await newAlert.populate('triggeredBy', 'name');
    io.to(user.familyId).emit('new-alert', populatedAlert);

    // 2. Send SMS and Voice Calls only to the critical targets
    if (notificationTargets.length > 0) {
        await sendSmsAndCallAlerts(notificationTargets, user.name, { lat, lng });
    }

    res.status(201).json({
        success: true,
        message: 'Alert triggered! Emergency contacts have been notified.',
        alert: newAlert,
    });
});

/**
 * @description Resolve an active alert ("I'm Safe" button)
 * @route POST /api/v1/emergency/resolve
 * @access Private
 */
export const resolveAlert = catchAsyncError(async (req, res, next) => {
    const user = req.user;

    const alert = await Alert.findOneAndUpdate(
        { triggeredBy: user._id, status: 'Active' },
        { status: 'Resolved', resolvedAt: Date.now() },
        { new: true }
    );

    if (!alert) {
        return res.status(404).json({ success: false, message: 'No active alert found to resolve.' });
    }

    // Notify family members that the alert is resolved
    const io = getSocketServerInstance();
    io.to(user.familyId).emit('alert-resolved', { 
        alertId: alert._id, 
        resolvedBy: user.name 
    });

    res.status(200).json({
        success: true,
        message: 'Alert resolved successfully.',
        alert,
    });
});

/**
 * @description Get alert history for the family
 * @route GET /api/v1/emergency/history
 * @access Private
 */
export const getAlertHistory = catchAsyncError(async (req, res, next) => {
    const familyId = req.user.familyId;

    const alerts = await Alert.find({ familyId })
        .sort({ createdAt: -1 }) // Show newest first
        .populate('triggeredBy', 'name avatar'); // Get name and avatar of the user

    res.status(200).json({
        success: true,
        alerts,
    });
});