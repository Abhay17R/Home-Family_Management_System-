import multer from 'multer';
import path from 'path'; // Node.js ka built-in module for paths

// Hum multer ko bol rahe hain ki file ko disk (server ki hard drive) par save karo.
// Isse 'multer-storage-cloudinary' ki zaroorat nahi padegi.
const storage = multer.diskStorage({
    // Destination: file ko kahan save karna hai.
    destination: (req, file, cb) => {
        // 'temp/' naam ke folder mein save karo.
        // Make sure to create this 'temp' folder in your server's root directory.
        cb(null, 'temp/');
    },
    // Filename: server par temporary file ka naam kya rakhna hai.
    // Hum ek unique naam banayenge taaki same naam ki do files ek dusre ko overwrite na karein.
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter (Aapka pehle wala hi theek hai)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|zip/;
    // path.extname se file ka extension check karna zyada reliable hai.
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Error: File format not supported!'), false);
    }
};

// Multer middleware ko create karein
const upload = multer({
    storage: storage, // Yahan hum naya disk wala storage pass kar rahe hain.
    limits: { fileSize: 1024 * 1024 * 15 }, // 15 MB limit
    fileFilter: fileFilter,
});

export default upload;