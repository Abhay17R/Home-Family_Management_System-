// routes/expenseRoutes.js
import express from 'express';
import {
  addExpense,
  getMyExpenses,
  deleteExpense,
} from '../controllers/expenseController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Protected routes for adding, viewing, and deleting expenses
router.post('/expenses', isAuthenticated, addExpense);
router.get('/expenses', isAuthenticated, getMyExpenses);
router.delete('/expense/:id', isAuthenticated, deleteExpense);

export default router;
