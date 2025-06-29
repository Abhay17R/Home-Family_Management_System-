import Order from '../models/orderModel.js';
import {catchAsyncError} from '../middleware/catchAsyncError.js';
import {User} from '../models/userModel.js';


//new orders
export const createOrder = catchAsyncError(async (req, res, next) => {
    // Step 1: Logged-in user ki ID ko request body mein daalein
    req.body.user = req.user.id; 

    // ✅✅ --- YEH HAI FIX --- ✅✅
    // Step 2: Logged-in user ki familyId ko bhi request body mein daalein
    req.body.familyId = req.user.familyId;
    
    // Ab jab order create hoga, usme user ki ID aur familyId dono honge
    const order = await Order.create(req.body);

    res.status(201).json({
        success: true,
        order,
    });
});
//get orders

// catchAsyncError ko import rehne dein, bas use mat karein

// Humne 'catchAsyncError' wrapper ko hata diya hai
export const getAllOrders = async (req, res, next) => {
    try {
        console.log("--- Starting Order Fetch (No Wrapper) ---");
        const loggedInUser = req.user;
        console.log("Logged-in user email:", loggedInUser.email);
        const familyId = loggedInUser.familyId;
        console.log("Found Family ID:", familyId);

        if (!familyId) {
            return res.status(400).json({ success: false, message: 'User is not part of any family.' });
        }

        // Is line se pehle aur baad mein console log lagayein
        console.log("About to search for family members...");
        const familyMembers = await User.find({ familyId: familyId }).select('_id');
        console.log("Successfully found family members:", familyMembers);

        if (!familyMembers || familyMembers.length === 0) {
            console.log("No members found, returning empty list.");
            return res.status(200).json({ success: true, count: 0, orders: [] });
        }
        
        const familyMemberIds = familyMembers.map(member => member._id);
        console.log("Family Member IDs array:", familyMemberIds);

        const queryFilter = { user: { $in: familyMemberIds } };

        const orders = await Order.find(queryFilter).sort({ orderDate: -1 });
        console.log(`Found ${orders.length} orders.`);

        res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });

    } catch (error) {
        // Asli error yahan pakda jaayega
        console.error("!!! CRITICAL ERROR IN getAllOrders !!!:", error);
        // Frontend ko ek saaf-suthra error message bhejenge
        res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
            error: error.message // Development ke liye error message bhej sakte hain
        });
    }
};

//details of only on order
export const getOrderDetails = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new Error('Order not found with this ID'));
    }

    res.status(200).json({
        success: true,
        order,
    });
});
//update order
export const updateOrder = catchAsyncError(async (req, res, next) => {
    let order = await Order.findById(req.params.id);

    if (!order) {
        return next(new Error('Order not found with this ID'));
    }

    if (req.user.role !== 'admin' &&order.user.toString() !== req.user.id) {
        return next(new Error('You are not authorized to update this order'));
    }

    order = await Order.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        order,
    });
});
//delete orders
export const deleteOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new Error('Order not found with this ID'));
    }

    if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
        return next(new Error('You are not authorized to delete this order'));
    }

    await order.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Order deleted successfully',
    });
});

