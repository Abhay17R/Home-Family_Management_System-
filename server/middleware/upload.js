// ✅ REVISED AND FINAL CODE FOR MULTER MIDDLEWARE

import multer from 'multer';

// 1. Disk storage ke bajaye Memory Storage use karein
// Yeh file ko disk par save karne ke bajaye req.file.buffer me as a buffer (RAM me) store karega.
const storage = multer.memoryStorage();

// 2. File filter (Aapka pehle wala hi theek hai)
// Yeh alag-alag file types ko allow karega.
const fileFilter = (req, file, cb) => {
    // PDF, images, aur common document types ko allow karte hain
    if (
        file.mimetype.startsWith('image/') ||
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.mimetype === 'application/zip'
    ) {
        cb(null, true); // File ko accept karo
    } else {
        // Agar file type ajeeb hai, toh error do
        cb(new Error('File format not supported! Please upload images, PDFs, or documents.'), false);
    }
};

// Multer middleware ko create karein
const upload = multer({
    storage: storage, // Yahan hum naya memory wala storage pass kar rahe hain.
    limits: { fileSize: 1024 * 1024 * 15 }, // 15 MB limit
    fileFilter: fileFilter,
});

export default upload;