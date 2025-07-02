// controllers/dashboardController.js
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import ErrorHandler from "../middleware/error.js";
import { User } from "../models/userModel.js";
import { Alert } from "../models/alertModel.js"; // Naya alert model import hoga
import Message  from "../models/messageModel.js";
import { Activity } from "../models/activityModel.js";

export const getFamilyDashboardData = catchAsyncError(async (req, res, next) => {
  const familyId = req.user.familyId;

  if (!familyId) {
    return next(new ErrorHandler("You are not part of any family group.", 400));
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    familyMembersResult,
    // --- YAHAN BADLAV KIYA GAYA HAI ---
    activeAlerts,
    messagesToday,
    recentActivitiesFromDB,
  ] = await Promise.all([
    User.find({ familyId }).select("name avatar isOnline lastSeen"),
    // status ab 'Active' (capital A ke saath) hoga
    Alert.countDocuments({ familyId, status: "Active" }),
    Message.countDocuments({ familyId, createdAt: { $gte: today, $lt: tomorrow } }),
    Activity.find({ familyId }).sort({ createdAt: -1 }).limit(5).populate('user', 'name'),
    User.countDocuments({ familyId, isSharing: true })
  ]);

  const totalMembers = familyMembersResult.length;
  const onlineMembersCount = familyMembersResult.filter(m => m.isOnline).length;
  
  const onlineMembers = familyMembersResult.map(member => {
    let status = 'offline';
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    if (member.isOnline) {
      status = 'online';
    } else if (member.lastSeen && new Date(member.lastSeen) > fifteenMinutesAgo) {
      status = 'away';
    }

    return {
      id: member._id,
      name: member.name,
      avatar: member.avatar.url,
      status: status,
    };
  });
  
  const recentActivity = recentActivitiesFromDB.map(act => ({
    id: act._id,
    user: act.user ? act.user.name : "A user",
    action: act.action,
    time: act.createdAt,
    type: act.type,
  }));

  if(recentActivity.length === 0){
      recentActivity.push({
          id: 1, user: 'System', action: 'Welcome! No activity to show yet.', time: new Date(), type: 'setting'
      });
  }

  res.status(200).json({
    success: true,
    stats: {
      totalMembers,
      onlineMembersCount,
      activeAlerts, // Yeh ab updated count hai
      locationsTracked: 0, 
      messagesToday,
    },
    onlineMembers,
    recentActivity,
  });
});