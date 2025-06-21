// controllers/dashboardController.js

import { catchAsyncError } from "../middleware/catchAsyncError.js";
import ErrorHandler from "../middleware/error.js";
import { User } from "../models/userModel.js";
// import { Expense } from "../models/expenseModel.js"; // Baad mein add kar lena

export const getFamilyDashboardData = catchAsyncError(async (req, res, next) => {
  // `isAuthenticated` middleware ne `req.user` mein user details daal di hain.
  const familyId = req.user.familyId;

  if (!familyId) {
    return next(new ErrorHandler("You are not part of any family.", 400));
  }

  // Promise.all se saare database calls ek saath karenge taaki speed tez rahe
  const [members/*, expenses*/] = await Promise.all([
    User.find({ familyId: familyId }).select("name email role"),
    // Expense.find({ familyId: familyId }), // Jab Expense model banaoge
  ]);

  res.status(200).json({
    success: true,
    members,
    // expenses,
  });
});