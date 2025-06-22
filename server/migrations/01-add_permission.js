// migrations/01-add_permission.js
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { User } from '../models/userModel.js'; 

config({ path: './config.env' });
console.log("Connecting to MongoDB URI:", process.env.MONGO_URI); 


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Database connected for migration!');
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
};

const runMigration = async () => {
    await connectDB();
    try {
        // ✅✅✅ YAHAN LOGIC CHANGE KIYA GAYA HAI ✅✅✅
        console.log("Migration started: Adding 'permissions' to child users...");

        const result = await User.updateMany(
            // Condition: Un sabhi 'child' users ko dhundo jinke paas 'permissions' field NAHI hai.
            { 
                role: 'child', 
                permissions: { $exists: false } 
            },
            
            // Action: Un sab mein 'permissions' object ko default values ke saath set kar do.
            { 
                $set: { 
                    permissions: { 
                        locationTracking: true, 
                        emergencyAlerts: true 
                    } 
                } 
            }
        );
  const childCount = await User.countDocuments({ role: 'child' });
        console.log(`Total documents with role 'child' found in DB: ${childCount}`);
        console.log(`Migration complete!`);
        console.log(`- Documents matched: ${result.matchedCount}`);
        console.log(`- Documents updated: ${result.modifiedCount}`);

    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed.');
    }
};

// Script ko chalaayein
runMigration();