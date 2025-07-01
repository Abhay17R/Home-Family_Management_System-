// server/middleware/upload.js (Cloudinary Version)

import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary ko configure karein
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

// Multer ke liye Cloudinary storage banayein
const storage = new CloudinaryStorage({
    cloudinary: cloudinary, // Hum 'diskStorage' ke bajaye Cloudinary ka storage use kar rahe hain
    params: {
        folder: 'user_documents', // Cloudinary par folder ka naam
        resource_type: 'auto',
        public_id: (req, file) => {
            const fileName = file.originalname.split('.').slice(0, -1).join('.');
            return `${req.user.id}-${fileName}-${Date.now()}`;
        },
    },
});

// File filter (optional)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|zip/;
    if (allowedTypes.test(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file format.'), false);
    }
};

// Multer middleware ko create karein
const upload = multer({
    storage: storage, // Yahan hum Cloudinary wala storage pass kar rahe hain
    limits: { fileSize: 1024 * 1024 * 15 }, // 15 MB limit
    fileFilter: fileFilter,
});

export default upload;