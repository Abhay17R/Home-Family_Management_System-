// controllers/dashboardController.js

import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { User } from '../models/userModel.js';
import { Activity } from '../models/activityModel.js';
import { Alert } from '../models/alertModel.js';
import Expense from '../models/expenseModel.js'; // Note: Expense model has default export
// Abhi ke liye Message aur Assignment ke liye dummy data use karenge, kyunki model me kuch cheezein missing hain.
// import Message from '../models/messageModel.js';
export const getDashboardData = catchAsyncError(async (req, res, next) => {
    // Logged-in user ki details `req.user` se aayegi (isAuthenticated middleware se)
    const { _id: userId, familyId } = req.user;

    // Hum saare database calls ek saath parallel me karenge Promise.all se, taaki speed tez rahe.
    const [
        familyMembersResult,
        unpaidBillsCount,
        activeAlertsCount,
        sharedLocationsCount,
        monthlyExpenseSummary,
        recentActivities,
        familyMembers,
        // Yeh neeche ke do abhi theek se kaam nahi karenge, inke liye models me update chahiye.
        unreadMessagesCount,
        upcomingAssignmentsCount
    ] = await Promise.all([
        User.find({ familyId }).select("name avatar isOnline lastSeen"),
        
        // 1. Bills Due: Abhi ke liye hum is mahine ke saare expenses count kar rahe hain.
        //    Behtar tareeka: Expense model me 'status: "unpaid"' field add karna.
        Expense.countDocuments({ 
            familyId, // NOTE: Aapke Expense model me `familyId` nahi hai. Yeh add karna padega!
            date: { 
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                $lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
            }
        }),
        //   Message.countDocuments({ familyId, readBy: { $ne: userId } }),

        // 2. Alerts: Active alerts count karna. Yeh perfect hai.
        Alert.countDocuments({ familyId, status: 'Active' }),

        // 3. Location: Kitne members location share kar rahe hain. Yeh bhi perfect hai.
        User.countDocuments({ familyId, isSharing: true, _id: { $ne: userId } }), // Khud ko count na karein    

        // 4. Monthly Expense Summary (Chart ke liye)
        //    Is mahine ke expenses ko category ke hisaab se group karke total amount nikalenge.
        Expense.aggregate([
            { $match: { 
                familyId, // NOTE: Yahan bhi `familyId` zaroori hai.
                date: {
                    $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
            }},
            { $group: {
                _id: '$category',
                totalAmount: { $sum: '$amount' }
            }},
            { $project: {
                category: '$_id',
                totalAmount: 1,
                _id: 0
            }}
        ]),

        // 5. Quick Actions: Latest 3 activities fetch karna.
        Activity.find({ familyId }).sort({ createdAt: -1 }).limit(3).populate('user', 'name avatar'),

        // 6. Family Member Status: Saare family members aur unka status fetch karna.
        User.find({ familyId }).select('name avatar isOnline lastSeen role'),

        // 7. Unread Messages: Iske liye Message model me `isRead: false` field chahiye. Abhi dummy data.
        Promise.resolve(5), // DUMMY VALUE

        // 8. Upcoming Assignments: Iske liye ek alag `Assignment` model chahiye hoga. Abhi dummy data.
        Promise.resolve(2), // DUMMY VALUE
    ]);
    const totalMembers = familyMembersResult.length;

    // Ab saara data frontend ke liye ek object me daal kar bhej do.
    res.status(200).json({
        success: true,
        data: {
            user: {
                name: req.user.name
            },
            stats: {
                billsDue: unpaidBillsCount,
                unreadMessages: unreadMessagesCount,
                upcomingAssignments: upcomingAssignmentsCount,
                alerts: activeAlertsCount,
                locationsShared: sharedLocationsCount,
                totalMembers:totalMembers,
            },
            expenseSummary: monthlyExpenseSummary,
            
            quickActions: recentActivities.map(activity => ({
                user: activity.user.name,
                avatar: activity.user.avatar.url,
                action: activity.action,
                
            })),
            
            familyStatus: familyMembers.map(member => ({
                name: member.name,
                avatar: member.avatar.url,
                // Status "Online", "Offline" ya "Admin" ho sakta hai
                status: member.role === 'admin' ? 'Admin' : (member.isOnline ? 'Online' : 'Offline')
            }))
        }
    });
});