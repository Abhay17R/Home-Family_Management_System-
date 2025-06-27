import {User} from '../models/userModel.js';
import {catchAsyncError} from '../middleware/catchAsyncError.js'
 
//collection:1
export const updateMyLocation=catchAsyncError(async(req,res,next)=>{
    const{lat,lng}=req.body;
    const userId=req.user.id;

    if (lat === undefined || lng === undefined) {
        return res.status(400).json({ success: false, message: 'Latitude and Longitude are required.' });
    }

  // Sirf zaroori fields update karo
    const updatedUser = await User.findByIdAndUpdate(userId, 
        { 
            location: { lat, lng },
            lastUpdated: Date.now() 
        },
        { new: true, runValidators: true } // `new: true` updated doc return karta hai
    ).select('name email location lastUpdated');

    res.status(200).json({
        success: true,
        message: 'Location updated successfully.',
        user: updatedUser
    });
});


//controller 2 

export const toggleLocationSharing = catchAsyncError(async (req, res, next) => {
    const { isSharing } = req.body;
    const userId = req.user.id;

    if (typeof isSharing !== 'boolean') {
        // return next(new ErrorHandler('isSharing field must be a boolean (true/false).', 400));
        return res.status(400).json({ success: false, message: 'isSharing field must be a boolean (true/false).' });
    }
    
    // Find user and update the field
    const user = await User.findById(userId);
    user.isSharing = isSharing;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: `Location sharing turned ${isSharing ? 'ON' : 'OFF'}.`,
    });
});

// Controller 3: Get all family members' locations
export const getFamilyLocations = catchAsyncError(async (req, res, next) => {
    const currentUser = req.user;

    // Admin apni poori family ko dekh sakta hai
    // Child sirf apne admin (parent) aur dusre children ko dekh sakta hai
    let familyId;
    if (currentUser.role === 'admin') {
        familyId = currentUser.familyId;
    } else if (currentUser.role === 'child') {
        familyId = currentUser.familyId;
    }

    if (!familyId) {
        // return next(new ErrorHandler('You are not part of a family.', 400));
        // Ya fir, sirf user ka apna data bhej do
        return res.status(200).json({ success: true, members: [currentUser] });
    }

    // Family ke sabhi members ko find karo, lekin password mat bhejna
    const members = await User.find({ familyId: familyId }).select('-password');
    
    res.status(200).json({
        success: true,
        members,
    });
});




















