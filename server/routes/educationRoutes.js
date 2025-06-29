// routes/education.routes.js

import express from 'express';
import {
  getAllStudents,
  addStudent,
  addAssignment,
  updateStudent,
  deleteStudent
} from '../controllers/educationController.js';

// 1. IMPORT YOUR AUTHENTICATION MIDDLEWARE
import { isAuthenticated } from '../middleware/auth.js'; 

const router = express.Router();

// 2. APPLY THE MIDDLEWARE TO ALL ROUTES IN THIS FILE
// Any request to this router will first have to pass through the 'protect' middleware.
router.use(isAuthenticated);

// Now, all routes below are protected and will have access to `req.user`
// =====================================================================

// Route for getting all students and adding a new one
router.route('/students')
  .get(getAllStudents)
  .post(addStudent);

// Route for updating and deleting a specific student
router.route('/students/:id')
    .put(updateStudent)
    .delete(deleteStudent);

// Route for adding an assignment to a specific student
router.post('/students/:id/assignments', addAssignment);

export default router;