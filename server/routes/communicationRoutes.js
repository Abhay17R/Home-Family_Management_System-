import express from "express";
import { isAuthenticated as protect } from "../middleware/auth.js";

// Controller se saare functions import karo
import {
    getMyChats,
    getChatMessages,
    sendMessage,
    createPoll,
    getFamilyPolls,   // 'getChatPolls' ki jagah 'getFamilyPolls' use karo
    voteInPoll,
    addPinnedNote,
    //  markChatAsRead,
} from "../controllers/communicationController.js";

const router = express.Router();

// --- Chat and Message Routes ---
router.route("/chats").get(protect, getMyChats);
router.route("/messages/:chatId").get(protect, getChatMessages);
router.route("/messages").post(protect, sendMessage);

// --- Poll Routes (Global for Family) ---
router.route("/polls").get(protect, getFamilyPolls); // Route: GET /api/v1/communication/polls
router.route("/polls").post(protect, createPoll);    // Route: POST /api/v1/communication/polls
router.route("/polls/vote/:pollId").post(protect, voteInPoll); // Route for voting
// router.route('/chats/:chatId/read').post(protect, markChatAsRead);

// --- Pinned Note Routes (Chat-specific) ---
router.route("/pins/:chatId").post(protect, addPinnedNote);

export default router;