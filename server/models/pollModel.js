import mongoose from "mongoose";

const pollModel = new mongoose.Schema({
    question: { type: String, required: true },
    options: [
        {
            text: { type: String, required: true },
            votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        },
    ],
    // 'chat' ko 'familyId' se replace kiya
    familyId: { type: String, required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Poll", pollModel);