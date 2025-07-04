import Expense from '../models/expenseModel.js';
import {catchAsyncError} from '../middleware/catchAsyncError.js';
import ErrorHandler from '../middleware/error.js';

// Create New Expense
export const addExpense = catchAsyncError(async (req, res, next) => {
    const { description, amount, category, date } = req.body;
    const paidBy = req.user.id; 
    const familyId = req.user.familyId; 
    if (!familyId) {
        return next(new ErrorHandler('User is not linked to a family. Cannot add expense.', 400));
    }

    // Step 1: Naya expense create aur save karein
    const newExpense = await Expense.create({
        description,
        amount,
        category,
        date,
        paidBy,
        familyId,
    });

    // Step 2: Naye banaye gaye expense ko populate karein
    // Hum usi document par .populate() call kar sakte hain
    const populatedExpense = await newExpense.populate('paidBy', 'name');

    // Step 3: Populated data ko frontend par bhejein
    res.status(201).json({
        success: true,
        expense: populatedExpense, // <-- Ab isme 'paidBy' ka naam bhi hoga!
    });
});

// Get All Expenses for the Logged-in User
export const getMyExpenses = catchAsyncError(async (req, res, next) => {
    // Sirf us user ke expenses laayein jo logged-in hai
    // Hum `populate` ka use karke paidBy user ka naam bhi fetch kar sakte hain (optional)
    const expenses = await Expense.find({  familyId: req.user.familyId})
                                  .populate('paidBy', 'name') // Optional: User ka naam bhi saath mein bhejega
                                  .sort({ date: -1 });

    res.status(200).json({
        success: true,
        count: expenses.length,
        expenses,
    });
});

// Delete an Expense
export const deleteExpense = catchAsyncError(async (req, res, next) => {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
        return next(new ErrorHandler('Expense not found', 404));
    }

    // Check karein ki expense delete karne wala user wahi hai jisne use banaya tha
    if (expense.paidBy.toString() !== req.user.id) {
        return next(new ErrorHandler('Not authorized to delete this expense', 403));
    }

    await expense.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Expense deleted successfully',
    });
});