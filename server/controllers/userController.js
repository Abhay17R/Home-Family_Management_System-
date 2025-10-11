import ErrorHandler from "../middleware/error.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { User } from "../models/userModel.js";
import { sendEmail } from "../utils/sendEmail.js";
import twilio from "twilio";
import dotenv from 'dotenv';
import { sendToken } from "../utils/sendToken.js";
import streamifier from 'streamifier';
import crypto from "crypto";
import fs from 'fs'; // File System module for deleting files
// import { v2 as cloudinary } from 'cloudinary'; 
import { getSocketServerInstance } from '../socket/socket.js';
import cloudinary from '../utils/cloudinary.js'

import { ExportConfigurationContextImpl } from "twilio/lib/rest/bulkexports/v1/exportConfiguration.js";
dotenv.config({ path: 'config.env' });

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

export const register = catchAsyncError(async (req, res, next) => {
  const { name, email, phone, password, verificationMethod, role = "child", parentId, familyId } = req.body;
  console.log(req.body);
  if (!name || !email || !phone || !password || !verificationMethod) {
    return next(new ErrorHandler("All fields are required.", 400));
  }

  // Validate phone format (E.164)
  function validatePhoneNumber(phone) {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  if (!validatePhoneNumber(phone)) {
    return next(new ErrorHandler("Invalid phone number.", 400));
  }

  // For child role, familyId must be provided
  if (role === "child" && !familyId) {
    return next(new ErrorHandler("Family ID is required for child account.", 400));
  }

  // Check if email or phone already verified
  const existingVerifiedUser = await User.findOne({
    $or: [{ email: email.toLowerCase(), accountVerified: true }, { phone, accountVerified: true }],
  });

  if (existingVerifiedUser) {
    return next(new ErrorHandler("Phone or Email is already used.", 400));
  }

  // Limit unverified registration attempts in last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const registrationAttemptsByUser = await User.find({
    $or: [{ phone, accountVerified: false }, { email: email.toLowerCase(), accountVerified: false }],
    createdAt: { $gte: oneHourAgo },
  });

  if (registrationAttemptsByUser.length >= 3) {
    return next(new ErrorHandler("You have exceeded the maximum number of attempts (3) in the last hour. Please try again later.", 400));
  }

  // Find if unverified user already exists with same email
  let user = await User.findOne({ email: email.toLowerCase() });

  if (user) {
    if (user.accountVerified) {
      return next(new ErrorHandler("Email already registered.", 400));
    }
    // Update password, role, parentId, familyId & generate new verification code for unverified user
    user.password = password;
    user.role = role;
    user.parentId = role === "child" ? parentId : null;
    user.familyId = role === "child" ? familyId : crypto.randomBytes(8).toString("hex");
    user.generateVerificationCode();
    await user.save();
  } else {
    // Create new user with role, parentId, familyId
    user = new User({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role,
      parentId: role === "child" ? parentId : null,
      familyId: role === "child" ? familyId : crypto.randomBytes(8).toString("hex"),
    });
    user.generateVerificationCode();
    await user.save();
  }

  // Send verification code by selected method
  await sendVerificationCode(verificationMethod, user.verificationCode, user.email, user.phone);

  res.status(200).json({
    success: true,
    message: `Verification code sent via ${verificationMethod}`,
  });
});

export const createChildUser = catchAsyncError(async (req, res, next) => {
  const adminId = req.user._id;
  const familyId = req.user.familyId;

  const { name, email, phone, password, verificationMethod } = req.body;

  if (!name || !email || !phone || !password || !verificationMethod) {
    return next(new ErrorHandler("All fields are required.", 400));
  }

  // Check if email or phone already used by any VERIFIED account
  const existingVerifiedUser = await User.findOne({
    $or: [
      { email: email.toLowerCase(), accountVerified: true },
      { phone, accountVerified: true },
    ],
  });

  if (existingVerifiedUser) {
    return next(new ErrorHandler("Email or phone already in use by a verified account.", 400));
  }

  // --- START OF THE FIX ---
  // Find if a user (even unverified) already exists with this email or phone
  let childUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { phone }],
  });

  if (childUser) {
    // If an unverified user exists, update their details for the new registration attempt
    childUser.name = name;
    childUser.password = password; // Important to update the password
    childUser.parentId = adminId;
    childUser.familyId = familyId;
    // Role is already 'child' presumably, or you can set it again
    childUser.role = "child";
    childUser.generateVerificationCode();
    await childUser.save(); // Update the existing record
  } else {
    // If no user exists at all, create a new one
    childUser = new User({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role: "child",
      parentId: adminId,
      familyId: familyId,
    });
    childUser.generateVerificationCode();
    await childUser.save(); // Create a new record
  }
  // --- END OF THE FIX ---

  // Send verification code via preferred method
  await sendVerificationCode(
    verificationMethod,
    childUser.verificationCode,
    childUser.email,
    childUser.phone
  );

  res.status(201).json({
    success: true,
    message: "Child user processed successfully. Verification code sent.",
    childUserId: childUser._id,
  });
});

/**
 * @description Verify a child's account via OTP, using robust logic adapted from the main OTP verification.
 *              Initiated by an authenticated parent/admin.
 * @route       POST /api/v1/child/verify-otp
 * @access      Private (Parent/Admin)
 */
// controllers/userController.js

export const verifyChildOtp = catchAsyncError(async (req, res, next) => {
  const { email, otp } = req.body;
  const parentId = req.user._id;

  if (!email || !otp) {
    return next(new ErrorHandler("Please provide the child's email and OTP.", 400));
  }
  
  // ✅ OTP LENGTH CHECK ADD KIYA GAYA
  if (otp.length !== 5) {
      return next(new ErrorHandler("Invalid OTP format. It must be 5 digits.", 400));
  }

  // ... baaki ka code bilkul waisa hi rahega ...
  try {
    const childUserEntries = await User.find({
      email,
      parentId, 
      accountVerified: false,
    }).sort({ createdAt: -1 });

    if (!childUserEntries || childUserEntries.length === 0) {
      return next(new ErrorHandler("No unverified child account found for your profile with this email.", 404));
    }

    let childUser;
    if (childUserEntries.length > 1) {
      childUser = childUserEntries[0];
      await User.deleteMany({
        _id: { $in: childUserEntries.slice(1).map(doc => doc._id) }
      });
    } else {
      childUser = childUserEntries[0];
    }

    if (childUser.verificationCode !== Number(otp)) {
      return next(new ErrorHandler("Invalid OTP provided.", 400));
    }

    if (Date.now() > childUser.verificationCodeExpires) {
      return next(new ErrorHandler("OTP has expired. Please try adding the child again to receive a new OTP.", 400));
    }

    childUser.accountVerified = true;
    childUser.verificationCode = null;
    childUser.verificationCodeExpires = null;
    
    await childUser.save({ validateModifiedOnly: true });

    res.status(200).json({
      success: true,
      message: "Child account has been successfully verified!",
    });

  } catch (error) {
    console.error("Child OTP verification error:", error);
    return next(new ErrorHandler("An internal server error occurred.", 500));
  }
});

async function sendVerificationCode(method, code, email, phone) {
  try {
    if (method === "email") {
      const message = generateEmailTemplate(code);
      await sendEmail({ email, subject: "Your verification code", message });
    } else if (method === "phone") {
      const spacedCode = code.toString().split("").join(" ");
      await client.calls.create({
        twiml: `<Response><Say>Your verification code is ${spacedCode}. Repeat, your verification code is ${spacedCode}.</Say></Response>`,
        from: process.env.TWILIO_NUM,
        to: phone,
      });
    } else {
      throw new ErrorHandler("Invalid verification method", 400);
    }
  } catch (error) {
    console.error("Verification sending error:", error);
    throw new ErrorHandler("Failed to send verification code", 500);
  }
}

function generateEmailTemplate(code) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Verification Code</title>
    <style>
      body { font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); color: #333; }
      h2 { color: #0044cc; margin-bottom: 20px; }
      .code { font-size: 28px; font-weight: bold; background: #e6f0ff; padding: 15px 20px; border-radius: 6px; display: inline-block; letter-spacing: 4px; margin: 20px 0; }
      p { font-size: 16px; line-height: 1.5; }
      .footer { margin-top: 30px; font-size: 12px; color: #999; }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Your Verification Code</h2>
      <p>Hello,</p>
      <p>Use the verification code below to complete your sign-up process:</p>
      <div class="code">${code}</div>
      <p>This code will expire in 5 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
      <div class="footer">&copy; 2025 Your Company Name. All rights reserved.</div>
    </div>
  </body>
  </html>
  `;
}

export const verifyOTP = catchAsyncError(async (req, res, next) => {
  const { email, otp, phone } = req.body;

  function validatePhoneNumber(phone) {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  if (!validatePhoneNumber(phone)) {
    return next(new ErrorHandler("Invalid phone number.", 400));
  }

  try {
    const userAllEntries = await User.find({
      $or: [
        { email, accountVerified: false },
        { phone, accountVerified: false }
      ],
    }).sort({ createdAt: -1 });

    if (!userAllEntries || userAllEntries.length === 0) {
      return res.status(404).json({
        success: false,
        message: "USER NOT FOUND."
      });
    }

    let user;
    if (userAllEntries.length > 1) {
      user = userAllEntries[0];
      await User.deleteMany({
        _id: { $ne: user._id },
        $or: [
          { phone, accountVerified: false },
          { email, accountVerified: false },
        ]
      });
    } else {
      user = userAllEntries[0];
    }

    if (user.verificationCode !== Number(otp)) {
      return next(new ErrorHandler("Invalid OTP", 400));
    }

    const currentTime = Date.now();
    const verificationCodeExpire = new Date(user.verificationCodeExpire).getTime();

    if (currentTime > verificationCodeExpire) {
      return next(new ErrorHandler("OTP Expired", 400));
    }

    user.accountVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpire = null;
    await user.save({ validateModifiedOnly: true });

    // Use updated sendToken to send user info with role, familyId, parentId
    sendToken(user, 200, "Account Verified", res);

  } catch (error) {
    console.error("OTP verification error:", error);
    return next(new ErrorHandler("Internal server error", 500));
  }
});



export const login = catchAsyncError(async (req, res, next) => {
    console.log("Login request body:", req.body); 
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Email and Password required", 400));
  }

  // Select password + role, familyId, parentId to send back
  const user = await User.findOne({ email, accountVerified: true }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 400));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Password is incorrect", 400));
  }

  const token=await user.generateToken();
  //new session object
   const newSession = {
    token: token,
    ipAddress: req.ip, // User ka IP address (e.g., '::1' for localhost)
    deviceInfo: req.headers['user-agent'] // User ka browser/device info
  };
  // . Is naye session ko user ke activeSessions array mein daal do.
  // Agar 'activeSessions' array nahi hai, to pehle use initialize karo.

  if (!user.activeSessions) {
    user.activeSessions = [];
  }
  user.activeSessions.push(newSession);
  await user.save({ validateBeforeSave: false });

        const options = {
        // Cookie kab expire hogi (e.g., 15 din).
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        // Isse cookie ko sirf server access kar sakta hai, frontend JavaScript nahi (Security).
        httpOnly: true,

        // YEH DO LINES SABSE ZAROORI HAIN
        // Production (live website) par 'None' aur Development (localhost) par 'Lax' set hoga.
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        // Production mein cookie sirf HTTPS par kaam karegi.
        secure: process.env.NODE_ENV === "production",
        
    };

  user.password = undefined;
  console.log("Setting cookie now...")

 res.status(200).cookie("token", token, options).json({
    success: true,
    message: "User logged in successfully.",
    user,
    token, // Token ko JSON body mein bhi bhej sakte hain agar mobile app use karega
  });

});



export const updateAvatar = catchAsyncError(async (req, res, next) => {
    // 1. Check karo ki file upload hui hai ya nahi (ab yeh buffer me hogi)
    if (!req.file) {
        return next(new ErrorHandler('Please upload an image.', 400));
    }

    const user = await User.findById(req.user.id);

    // 2. Purana avatar (agar hai) delete karne ka logic same rahega
    if (user.avatar && user.avatar.public_id && user.avatar.public_id !== "avatars/default_avatar") {
        try {
            await cloudinary.uploader.destroy(user.avatar.public_id);
        } catch (error) {
            console.error("Failed to delete old avatar from Cloudinary:", error);
        }
    }

    // 3. Buffer ko Cloudinary par upload karne ka function
    const uploadAvatarFromBuffer = (buffer) => {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "avatars",
                    resource_type: "image",
                    width: 150,
                    height: 150,
                    crop: "fill",
                    gravity: "face"
                },
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );
            streamifier.createReadStream(buffer).pipe(uploadStream);
        });
    };

    try {
        // Upar banaye function ko call karke buffer upload karo
        const result = await uploadAvatarFromBuffer(req.file.buffer);

        // 4. User ke database record me naye avatar ka URL aur public_id save karo
        user.avatar = {
            public_id: result.public_id,
            url: result.secure_url,
        };
        await user.save();

        // 5. Success response bhejo
        res.status(200).json({
            success: true,
            message: "Avatar Updated Successfully",
            avatar: user.avatar,
        });

    } catch (error) {
        console.error("Error during avatar upload to Cloudinary:", error);
        return next(new ErrorHandler('Avatar processing failed. Please try again.', 500));
    }
});

export const logout = catchAsyncError(async (req, res, next) => {
    // Login wale options yahan bhi use karein
    const cookieOptions = {
        httpOnly: true,
        // Production (live website) par 'None' aur Development (localhost) par 'Lax' set hoga.
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        // Production mein cookie sirf HTTPS par kaam karegi.
        secure: process.env.NODE_ENV === "production",
       
    };

    res.status(200)
       .cookie("token", null, {
           ...cookieOptions, // Saare options yahan daalein
           expires: new Date(Date.now()), // Bas expiry ko past mein set kar dein
       })
       .json({
           success: true,
           message: "Logged out successfully.",
       });
});

export const getUser= catchAsyncError(async(req,res,next)=>{
  const user=req.user;
  res.status(200).json({
    success:true,
    user,
  });

});
export const updateMyProfile = catchAsyncError(async (req, res, next) => {
    // Frontend se ye data aayega
    const { name, email, phone, address, bio } = req.body;

    const user = await User.findById(req.user.id);

    // User se mili jaankari ko update karo
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (bio) user.bio = bio;

    // Changes ko database mein save karo
    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile Updated Successfully",
    });
});


export const forgotPassword = catchAsyncError(async (req, res, next) => {
  // User dhundho jiska email aur verified account ho
  const user = await User.findOne({ email: req.body.email, accountVerified: true });
  if (!user) {
    return next(new ErrorHandler("User not Found", 404));
  }

  // Password reset token generate karo
  const resetToken = user.generateResetToken();

  // User ko save karo bina validation ke (kyunki sirf token badla hai)
  await user.save({ validateBeforeSave: false });

  // Reset password ke liye frontend ka url banao
  const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  // Email me bhejne ke liye message prepare karo
  const message = `
Hello ${user.name},

Please click on the link below to reset your password:

${resetPasswordUrl}

If you did not request this email, please ignore it.
`;

  try {
    // Email bhejo
    await sendEmail({
      email: user.email,
      subject: "Reset Password",
      message: message,
    });

    // Client ko success response do
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully.`,
    });
  } catch (error) {
    // Agar email na bhej paye, toh token hata do
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message || "Cannot send reset password token", 500));
  }
});

export const resetPassword=catchAsyncError(async(req,res,next)=>{
  const {token}=req.params;
  const resetPasswordToken=crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire:{$gt:Date.now()},
  });
  if(!user){
    return next(new ErrorHandler("Reset Password token is invalid or has been expired",400));
  }

  if(req.body.password!==req.body.confirmPassword){
        return next(new ErrorHandler("Password & Confirm Password does not match",400));

  }

  user.password=req.body.password;
  user.resetPasswordExpire=undefined;
  user.resetPasswordToken=undefined;
  await user.save();

  sendToken(user,200,"Rest password successfully",res);

});

export const getAllMyChildren= (async(req,res,next)=>{
  
    try {
      const children=await User.find({
      role:'child',
      parentId:req.user.id,
       accountVerified: true 
    }).select('-password');

    res.status(200).json({
      success:true,
      count:children.length,children,
    });
      
    } catch (error) {
      res.status(500).json({success:false,message:'server error'})
      
    }
 });

 export const updateChildProfile=async(req,res,next)=>{
  try {
    
     const child=await User.findById(req.params.id);
    if(!child||child.parentId.toString()!==req.user.id){
      return res.status(403).json({success:false,message:'Profile not found or not authorized'});
    }


    const updatedChild =await User.findByIdAndUpdate(req.params.id,req.body,{
      new:true,
      runValidators:true,

    }).select('-password');
        const io = getSocketServerInstance();
        if (req.user.familyId) {
            io.to(req.user.familyId).emit('userUpdated');
            console.log(`✅ Event Bheja: 'userUpdated' to family ${req.user.familyId}`);
        }
    res.status(200).json({
      success:true,
      message:'Profile updated successfully',
      child:updatedChild,
    });
  } catch (error) {
    res.status(500).json({
      success:false,
      message:'Server Error'
    });
    
  }
 };

 export const deleteChildProfile=async(req,res,next)=>{
 try {
   const child=await User.findById(req.params.id);
   if(!child || child.parentId.toString()!==req.user.id){
    return res.status(403).json({success:false,message:'profile not found or not authorized'});

   }
   await User.findByIdAndDelete(req.params.id);
   res.status(200).json({
    success:true,
    message:'member has been removed.',
   });
  
 } catch (error) {
  res.status(500).json({
    success:false,
    message:'server error'
  });
  
 }
 }












