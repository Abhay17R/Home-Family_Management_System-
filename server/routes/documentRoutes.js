import express from 'express';
import {
    createFolder,
    getFolders,
    uploadFile,
     deleteFolder,
    getFilesByFolder,
    deleteFile,
} from '../controllers/documentController.js';
import { isAuthenticated } from '../middleware/auth.js'; // Maan rahe hain ki aapka auth middleware yahan hai
import upload from '../middleware/upload.js';

const router = express.Router();

// --- FOLDER ROUTES ---

// Naya folder banane ke liye (POST /api/v1/documents/folders)
// Saare folders fetch karne ke liye (GET /api/v1/documents/folders)
router.route('/folders')
    .post(isAuthenticated, createFolder)
    .get(isAuthenticated, getFolders);

router.route('/folders/:folderId')
    .delete(isAuthenticated, deleteFolder); 
// --- FILE ROUTES ---

// Ek specific folder mein file upload karne ke liye (POST /api/v1/documents/files/:folderId)
// Ek specific folder ki saari files fetch karne ke liye (GET /api/v1/documents/files/:folderId)
router.route('/files/:folderId')
    .post(isAuthenticated, upload.single('file'), uploadFile) // `upload.single('file')` file upload ko handle karega
    .get(isAuthenticated, getFilesByFolder);

// Ek specific file ko delete karne ke liye (DELETE /api/v1/documents/files/:fileId)
router.route('/files/:fileId')
    .delete(isAuthenticated, deleteFile);


// Router ko export karein taaki app.js me use ho sake
export default router;