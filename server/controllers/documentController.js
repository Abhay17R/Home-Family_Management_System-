

import Folder from '../models/folderModel.js';
import File from '../models/fileModel.js';
import { catchAsyncError } from '../middleware/catchAsyncError.js';
import ErrorHandler from '../middleware/error.js';
import { v2 as cloudinary } from 'cloudinary'; // Sirf 'destroy' ke liye zaroori

// --- FOLDER CONTROLLERS (Inmein koi badlav nahi) ---
const DEFAULT_FOLDER_NAMES = ['School Certificates', 'Government IDs', 'Medical Records'];

export const createFolder = catchAsyncError(async (req, res, next) => {
    const { name } = req.body;
    const userId = req.user.id;
    const familyId = req.user.familyId;
    if (!familyId) {
        return next(new ErrorHandler('User is not associated with a family.', 400));
    }
    const folder = await Folder.create({ name, user: userId, familyId: familyId });
    res.status(201).json({ success: true, folder });
});

export const deleteFolder = catchAsyncError(async (req, res, next) => {
    const { folderId } = req.params;
    const { familyId } = req.user;
    const folder = await Folder.findOne({ _id: folderId, familyId });
    if (!folder) {
        return next(new ErrorHandler('Folder not found or you are not authorized.', 404));
    }
    if (DEFAULT_FOLDER_NAMES.includes(folder.name)) {
        return next(new ErrorHandler('Default folders cannot be deleted.', 400));
    }
    const filesInFolder = await File.find({ folder: folderId });
    if (filesInFolder.length > 0) {
        const publicIds = filesInFolder.map(file => file.public_id);
        // Important: Use v2 syntax
        await cloudinary.api.delete_resources(publicIds);
        await File.deleteMany({ folder: folderId });
    }
    await Folder.findByIdAndDelete(folderId);
    res.status(200).json({ success: true, message: `Folder "${folder.name}" and all its contents have been deleted.` });
});

export const getFolders = catchAsyncError(async (req, res, next) => {
    const folders = await Folder.find({ familyId: req.user.familyId }).sort({ createdAt: 'desc' });
    res.status(200).json({ success: true, folders });
});


// --- FILE CONTROLLERS (Updated & Simplified) ---

/**
 * @desc Upload a file directly to Cloudinary and save its metadata to the database.
 * The 'upload' middleware handles the entire Cloudinary upload process.
 */
export const uploadFile = catchAsyncError(async (req, res, next) => {
    // Agar 'upload' middleware ne file reject ki ya koi error hua, to req.file exist nahi karega.
    if (!req.file) {
        return next(new ErrorHandler('File upload failed. Please check file format or size.', 400));
    }

    // `req.file` ab Cloudinary se aaya hua response hai. Ismein local path nahi hai.
    // console.log('Cloudinary response in req.file:', req.file);

    const { folderId } = req.params;
    const { id: userId, familyId } = req.user;

    // Check if the folder exists and belongs to the family
    const folder = await Folder.findOne({ _id: folderId, familyId: familyId });
    if (!folder) {
        // Agar folder exist nahi karta, to humein Cloudinary se upload ki hui file delete karni hogi.
        await cloudinary.uploader.destroy(req.file.public_id);
        return next(new ErrorHandler('Folder not found or you do not have permission.', 404));
    }

    // Database mein file ki metadata save karein
    const newFile = await File.create({
        name: req.file.originalname,
        url: req.file.path, // `path` property mein Cloudinary ka secure URL hota hai
        public_id: req.file.public_id,
        mimetype: req.file.mimetype,
        size: req.file.size,
        folder: folderId,
        user: userId,
        familyId: familyId,
    });
    
    res.status(201).json({
        success: true,
        message: "File uploaded successfully!",
        file: newFile,
    });
});


/**
 * @desc Get all files in a specific folder for the family
 */
export const getFilesByFolder = catchAsyncError(async (req, res, next) => {
    const { folderId } = req.params;
    const { search } = req.query;
    const familyId = req.user.familyId;
    const folder = await Folder.findOne({ _id: folderId, familyId: familyId });
    if (!folder) {
        return next(new ErrorHandler('Folder not found or you do not have permission.', 404));
    }
    let query = { folder: folderId, familyId: familyId };
    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }
    const files = await File.find(query).sort({ createdAt: 'desc' });
    res.status(200).json({ success: true, files });
});


/**
 * @desc Delete a file from Cloudinary and the database
 */
export const deleteFile = catchAsyncError(async (req, res, next) => {
    const file = await File.findById(req.params.fileId);
    if (!file) {
        return next(new ErrorHandler('File not found.', 404));
    }
    if (file.familyId.toString() !== req.user.familyId) {
        return next(new ErrorHandler('You are not authorized to delete this file.', 403));
    }

    // File ko Cloudinary se delete karo
    await cloudinary.uploader.destroy(file.public_id, { resource_type: file.mimetype.startsWith('image') ? 'image' : 'raw' });
    
    // File ko database se delete karo
    await File.findByIdAndDelete(file._id);

    res.status(200).json({ success: true, message: 'File deleted successfully.' });
});