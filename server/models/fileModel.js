import mongoose from 'mongoose';
import {User} from '../models/userModel.js';
const fileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide the original file name.'],
        trim: true,
    },
    url: {
        type: String,
        required: [true, 'File URL from Cloudinary is missing.'],
    },
    public_id: {
        type: String,
        required: [true, 'Cloudinary public_id is missing.'],
        unique: true,
    },
    mimetype: {
        type: String,
        required: true,
    },
    size: {
        type: Number,
        required: true,
    },
    folder: {
        type: mongoose.Schema.ObjectId,
        ref: 'Folder',
        required: true,
    },
    // User jisne file upload ki hai
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    // Yeh file kis parivar ki hai
    familyId: {
       type: String,
        ref: 'User', // Family head ka reference
        required: true,
    },
}, { timestamps: true });

// Mongoose hooks waise hi rahenge

const File = mongoose.model('File', fileSchema);

export default File;