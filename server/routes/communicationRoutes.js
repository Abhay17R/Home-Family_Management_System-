import express from "express";
import { isAuthenticated } from '../middleware/auth.js';

import {
    getMyChats,
    getChatMessages,
    sendMessage,
    createPoll,
    voteInPoll,
    getChatPolls,
    addPinnedNote,
} from "../controllers/communicationController.js";
import { isAuthenticated as protect } from "../middleware/auth.js"; // Tere project ke hisaab se import kar lena

const router = express.Router();

// protect middleware user ko authenticate karega
// Main maan raha hu ki iska naam 'auth' hai aur ye req.user set karta hai

// Chat and Message Routes
router.route("/chats").get(protect, getMyChats); // User ke saare chats laane ke liye
router.route("/messages/:chatId").get(protect, getChatMessages); // Ek chat ke saare messages
router.route("/messages").post(protect, sendMessage); // Naya message bhejne ke liye

// Poll Routes
router.route("/polls/:chatId").get(protect, getChatPolls); // Ek chat ke active polls
router.route("/polls").post(protect, createPoll); // Naya poll banane ke liye
router.route("/polls/vote/:pollId").post(protect, voteInPoll); // Poll me vote karne ke liye

// Pinned Note Routes
router.route("/pins/:chatId").post(protect, addPinnedNote); // Naya note pin karne ke liye

export default router;