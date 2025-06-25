import Order from '../models/orderModel.js';
import {catchAsyncError} from '../middleware/catchAsyncError.js';


//new orders
export const createOrder = catchAsyncError(async (req, res, next) => {
    req.body.user = req.user.id; 

    const order = await Order.create(req.body);

    res.status(201).json({
        success: true,
        order,
    });
});

//get orders
export const getAllOrders = catchAsyncError(async (req, res, next) => {
    const { search } = req.query;
    const queryFilter = { user: req.user.id }; // Sirf logged-in user ke orders

    if (search) {
        queryFilter.$or = [
            { store: { $regex: search, $options: 'i' } },
            { orderId: { $regex: search, $options: 'i' } },
            { status: { $regex: search, $options: 'i' } },
        ];
    }

    const orders = await Order.find(queryFilter).sort({ orderDate: -1 });

    res.status(200).json({
        success: true,
        count: orders.length,
        orders,
    });
});

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

    if (order.user.toString() !== req.user.id) {
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

    if (order.user.toString() !== req.user.id) {
        return next(new Error('You are not authorized to delete this order'));
    }

    await order.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Order deleted successfully',
    });
});

