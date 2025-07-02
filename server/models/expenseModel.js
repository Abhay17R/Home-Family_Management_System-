// models/expenseModel.js
import {User} from '../models/userModel.js';
import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    description: {
        type: String,
        required: [true, 'Please add a description'],
        trim: true,
    },
    amount: {
        type: Number,
        required: [true, 'Please add an amount'],
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        enum: ['Food', 'Utilities', 'Transport', 'Entertainment', 'Education', 'Health', 'Other'],
    },
    // === YAHAN PAR DATE FIELD ADD KAREIN ===
    date: {
        type: Date,
        required: [true, 'Please add a date for the expense'],
        default: Date.now // Agar date na bhejein to aaj ki date le lega
    },
    // =======================================
    paidBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
     familyId: { // <-- YEH ADD KAREIN
        type: String,
        required: true
    },
}, {
    timestamps: true
});

export default mongoose.model('Expense', expenseSchema);