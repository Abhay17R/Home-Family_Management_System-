// routes/education.routes.js
import express from 'express';
import {
  getAllStudents,
  addStudent,
  addAssignment,
  updateStudent,
  deleteStudent
} from '../controllers/educationController.js';

const router = express.Router();

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