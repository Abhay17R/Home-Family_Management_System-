import express from 'express';
import { register, verifyOTP,login,logout, forgotPassword , verifyChildOtp } from '../controllers/userController.js';
import { getUser } from '../controllers/userController.js';
import { resetPassword } from '../controllers/userController.js';
import {createChildUser} from '../controllers/userController.js';
import { isAuthenticated, authorizeRoles } from '../middleware/auth.js';


const router = express.Router();

router.post('/register', register);

router.post("/otp-verification",verifyOTP);
router.post("/login",login);
router.get("/logout",isAuthenticated,logout);
router.get("/me",isAuthenticated,getUser);
router.post("/password/forgot",forgotPassword);
router.put("/password/reset/:token",resetPassword);
router.post('/admin/create-child', isAuthenticated, authorizeRoles('admin'), createChildUser);

router.post(
    '/admin/create-child', 
    isAuthenticated, 
    authorizeRoles('admin', 'parent'),
    createChildUser
);

// ✅ YEH HAI AAPKA NAYA ROUTE
router.post(
    "/child/verify-otp",
    isAuthenticated,                      // Check karega ki user logged-in hai
    authorizeRoles("admin", "parent"),    // Check karega ki role sahi hai
    verifyChildOtp                        // Controller ko call karega
);

export default router;
