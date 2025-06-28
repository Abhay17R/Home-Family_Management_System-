import mongoose from "mongoose";
import {User} from '../models/userModel.js';

const pollModel = new mongoose.Schema({
    question: { type: String, required: true },
    options: [
        {
            text: { type: String, required: true },
            // Hum count ki jagah voters ki ID store karenge taaki double voting na ho
            votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        },
    ],
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Poll", pollModel);