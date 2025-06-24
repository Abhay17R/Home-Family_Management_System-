import express from 'express';
const router = express.Router();
import { isAuthenticated } from '../middleware/auth.js';

import {
  changePassword,
  toggle2FA,
  getActiveSessions,
  logoutSession,
  deleteAccount
} from '../controllers/settingsController.js';


router.put('/change-password', isAuthenticated , changePassword);// change password
router.post('/2fa/toggle', isAuthenticated , toggle2FA);//2fa toggle
router.get('/sessions', isAuthenticated , getActiveSessions);//get active session
router.delete('/sessions/:sessionId', isAuthenticated , logoutSession);//logout session
router.delete('/delete-account', isAuthenticated , deleteAccount);//account delete


export default router;