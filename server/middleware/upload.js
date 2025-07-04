// ✅ PASTE THIS ENTIRE CODE IN YOUR MIDDLEWARE FILE (e.g., middlewares/upload.js or middlewares/multer.js)

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Step 1: Cloudinary Configuration
// Yeh sunishchit karein ki aapke .env file mein ya Render ke Environment Variables mein ye values set hain.
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Step 2: Cloudinary Storage Engine
// Yahan hum multer ko batate hain ki file ko seedhe Cloudinary par bhejna hai, disk par nahi.
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
        // req object se zaroori data nikalenge taaki Cloudinary par folder structure sahi bane.
        const { folderId } = req.params;
        const { familyId } = req.user; // Ye user authentication middleware se aana chahiye.

        // File ke type ke hisaab se 'resource_type' set karenge. Ye PDF/DOCX ke liye 'raw' hona zaroori hai.
        let resourceType = 'raw'; // Default for documents
        if (file.mimetype.startsWith('image/')) {
            resourceType = 'image';
        } else if (file.mimetype.startsWith('video/')) {
            resourceType = 'video';
        }

        // Ye object Cloudinary ko bheja jayega.
        return {
            folder: `family_dashboard/${familyId}/${folderId}`, // Dynamic folder path
            resource_type: resourceType,
            // (Optional) Hum original file naam ko public_id ke hisaab se set kar sakte hain, ya Cloudinary ko unique ID banane de sakte hain.
            // public_id: file.originalname.split('.')[0] // Example: 'document' from 'document.pdf'
        };
    },
});

// Step 3: File Filter (Optional but Recommended)
// Yahan hum define karte hain ki kaun se file types ko allow karna hai.
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true); // File ko accept karo
    } else {
        // File ko reject karo aur ek error pass karo
        cb(new Error('Unsupported file format! Please upload images, PDFs, or documents.'), false);
    }
};

// Step 4: Create the Multer Middleware
const upload = multer({
    storage: storage, // Yahan hum apna naya Cloudinary wala storage pass kar rahe hain.
    limits: { fileSize: 1024 * 1024 * 15 }, // 15 MB limit
    fileFilter: fileFilter,
});

export default upload;