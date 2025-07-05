import express from "express";
import { isAuthenticated as protect } from "../middleware/auth.js";

// Controller se saare functions import karo
import {
    getMyChats,
    getChatMessages,
    sendMessage,
    createPoll,
    getFamilyPolls,
    getPollDetails, // Add this import
    voteInPoll,
    addPinnedNote,
} from "../controllers/communicationController.js";

const router = express.Router();

// --- Chat and Message Routes ---
router.route("/chats").get(protect, getMyChats);
router.route("/messages/:chatId").get(protect, getChatMessages);
router.route("/messages").post(protect, sendMessage);

// --- Poll Routes (Global for Family) ---
router.route("/polls").get(protect, getFamilyPolls);
router.route("/polls").post(protect, createPoll);
router.route("/polls/:pollId").get(protect, getPollDetails); // Add this route
router.route("/polls/vote/:pollId").post(protect, voteInPoll);

// --- Pinned Note Routes (Chat-specific) ---
router.route("/pins/:chatId").post(protect, addPinnedNote);

export default router;