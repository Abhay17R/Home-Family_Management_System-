// models/activityModel.js
import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
    // familyId ab String hoga
    familyId: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    action: {
        type: String, 
        required: true,
    },
    type: {
        type: String, 
        required: true,
    }
}, { timestamps: true });

export const Activity = mongoose.model('Activity', activitySchema);