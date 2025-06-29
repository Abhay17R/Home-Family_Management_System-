// controllers/education.controller.js
import Student from '../models/studentModel.js';

// @desc    Get all students (for a family)
// @route   GET /api/education/students
export const getAllStudents = async (req, res) => {
  try {
    const familyId = req.user.familyId;
    if (!familyId) {
      return res.status(401).json({ message: "Unauthorized: No familyId found" });
    }

    const students = await Student.find({ familyId });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Add a new student
// @route   POST /api/education/students
export const addStudent = async (req, res) => {
  try {
    const { name, grade, school, feeStatus, grades } = req.body;
    
    // Basic validation
    if (!name || !grade || !school) {
        return res.status(400).json({ message: 'Please provide name, grade, and school' });
    }

   const newStudent = new Student({
  name,
  grade,
  school,
  feeStatus,
  grades,
  familyId: req.user.familyId,
  userId: req.user._id, // ✅ add this line
});
    const savedStudent = await newStudent.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Add an assignment to a student
// @route   POST /api/education/students/:id/assignments
export const addAssignment = async (req, res) => {
  try {
    const { title, dueDate } = req.body;
    const studentId = req.params.id;

    if (!title || !dueDate) {
        return res.status(400).json({ message: 'Please provide title and due date for the assignment' });
    }

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.assignments.push({ title, dueDate });
    const updatedStudent = await student.save();

    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a student's details (e.g., grades, fee status)
// @route   PUT /api/education/students/:id
export const updateStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    const updatedData = req.body;

    const updatedStudent = await Student.findByIdAndUpdate(studentId, updatedData, {
      new: true, // Naya updated document return karo
      runValidators: true, // Schema validation run karo
    });

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a student
// @route   DELETE /api/education/students/:id
export const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if(!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json({ message: 'Student removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}