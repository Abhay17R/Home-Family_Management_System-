    import mongoose from 'mongoose';
    import {User} from '../models/userModel.js';

    const folderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter a folder name.'],
        trim: true,
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    familyId: {
       type: String,
        ref: 'User', // assuming admin user is the family head
        required: true,
    },
    }, { timestamps: true });

    const Folder = mongoose.model('Folder', folderSchema);

    export default Folder;
