// models/alertModel.js

import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
    // Kaunsa user alert trigger kar raha hai
    triggeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // User kis family ka hai
    familyId: {
        type: String,
        required: true,
    },
    // User ki location jab alert trigger hua
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    // Alert ka status
    status: {
        type: String,
        enum: ['Active', 'Resolved'],
        default: 'Active',
    },
    // Kab resolve hua
    resolvedAt: {
        type: Date,
    },
}, { timestamps: true }); // `createdAt` field automatically add ho jayega

export const Alert = mongoose.model('Alert', alertSchema);