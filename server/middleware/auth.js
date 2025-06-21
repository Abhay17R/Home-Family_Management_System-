
import {catchAsyncError} from "./catchAsyncError.js"
import ErrorHandler from "./error.js"
import jwt from "jsonwebtoken"
import {User} from "../models/userModel.js"

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user.role}) is not allowed to access this resource`,
      });
    }
    next();
  };
};


export const isAuthenticated =catchAsyncError(async(req,res,next)=>{
    const {token}=req.cookies;
    if(!token){
    return next(new ErrorHandler("User is not Authenticated", 400));
    }
    const decoded=jwt.verify(token,process.env.JWT_KEY);

    req.user=await User.findById(decoded.id);

    next();



});