import mongoose from "mongoose";
import {User} from '../models/userModel.js';

const chatModel = new mongoose.Schema({
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Tere userModel se reference
    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    pinnedNotes: [
        {
            text: { type: String, required: true },
            pinnedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            pinnedAt: { type: Date, default: Date.now },
        },
    ],
}, { timestamps: true });

export default mongoose.model("Chat", chatModel);