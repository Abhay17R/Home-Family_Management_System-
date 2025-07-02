import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Apni config.env file se environment variables load karo
// Yeh line ensure karegi ki is file ko use karne se pehle keys load ho chuki hain
dotenv.config({ path: './config.env' }); 

// Cloudinary ko apni API keys ke saath configure karo
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure kiye hue instance ko export karo
export default cloudinary;