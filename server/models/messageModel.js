import mongoose from "mongoose";
import {User} from '../models/userModel.js';

const messageModel = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    // Reactions ke liye Map use karna best hai. Example: { '❤️': 2, '👍': 5 }

      familyId: {
        type: String,
        required: true,
    },
    reactions: {
        type: Map,
        of: Number,
        default: {}
    },
     readBy: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        default: [] // Default me khaali array
    },
}, { timestamps: true });

export default mongoose.model("Message", messageModel);