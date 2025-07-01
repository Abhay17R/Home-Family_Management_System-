import Folder from '../models/folderModel.js';
import File from '../models/fileModel.js';
import { catchAsyncError } from '../middleware/catchAsyncError.js';
import ErrorHandler from '../middleware/error.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'; // File System ko import karna zaroori hai temp file delete karne ke liye

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


// --- FILE CONTROLLERS ---

// ✅✅✅ --- YEH FUNCTION PURI TARAH SE THEEK KAR DIYA GAYA HAI --- ✅✅✅
export const uploadFile = catchAsyncError(async (req, res, next) => {
    const { folderId } = req.params;
    const { id: userId, familyId } = req.user;

    // Step 1: Check karo ki file aayi hai ya nahi
    if (!req.file) {
        return next(new ErrorHandler('Please upload a file.', 400));
    }

    // Step 2: Check karo ki folder मौजूद hai aur user ki family ka hi hai
    const folder = await Folder.findOne({ _id: folderId, familyId: familyId });
    if (!folder) {
        return next(new ErrorHandler('Folder not found or you do not have permission.', 404));
    }

    // Step 3: File ko Cloudinary par upload karo
    // 'req.file.path' woh temporary location hai jahan 'multer' ne file ko save kiya hai
    const result = await cloudinary.uploader.upload(req.file.path, {
        folder: `family_dashboard/${familyId}/${folderId}`, // Cloudinary par ek saaf folder structure
        resource_type: "auto", // Har tarah ki file (pdf, image, video) ke liye
    });

    // Optional but Recommended: Debugging ke liye Cloudinary ka response check karo
    console.log('Cloudinary Result:', result);

    // Step 4: Cloudinary se mile 'result' se zaroori details nikalo
    const newFile = await File.create({
        name: req.file.originalname,
        url: result.secure_url,       // ✅ Sahi URL 'result.secure_url' se aayega
        public_id: result.public_id, // ✅ Sahi public_id 'result.public_id' se aayega
        mimetype: req.file.mimetype,
        size: result.bytes,          // ✅ Sahi size 'result.bytes' se aayega
        folder: folderId,
        user: userId,
        familyId: familyId,
    });
    
    // Step 5 (Important): Server se temporary file ko delete kar do
    fs.unlinkSync(req.file.path);

    res.status(201).json({
        success: true,
        file: newFile,
    });
});
// ✅✅✅ --- UPLOAD FILE FUNCTION YAHAN KHATAM HOTA HAI --- ✅✅✅


// @desc Get all files in a specific folder for the family
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


// @desc Delete a file from the family's collection
export const deleteFile = catchAsyncError(async (req, res, next) => {
    const file = await File.findById(req.params.fileId);
    if (!file) {
        return next(new ErrorHandler('File not found.', 404));
    }
    if (file.familyId.toString() !== req.user.familyId) {
        return next(new ErrorHandler('You are not authorized to delete this file.', 403));
    }
    await cloudinary.uploader.destroy(file.public_id);
    await File.findByIdAndDelete(file._id);
    res.status(200).json({ success: true, message: 'File deleted successfully.' });
});