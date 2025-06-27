// models/student.model.js
import mongoose from 'mongoose';

// Chhote schemas pehle banate hain
const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dueDate: { type: Date, required: true },
});

const feeStatusSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Paid', 'Due', 'Overdue'], // Sirf ye values allowed hongi
    required: true,
  },
  amount: { type: String, required: true }, // Isko Number bhi kar sakte ho for calculations
  dueDate: { type: Date },
});

// Main Student Schema
const studentSchema = new mongoose.Schema(
  {
    // Important: Student ko family/user se link karna zaroori hai
    // userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    name: { type: String, required: true, trim: true },
    grade: { type: String, required: true },
    school: { type: String, required: true },
    assignments: [assignmentSchema], // Array of assignments
    grades: {
      type: Map, // 'maths': 'A', 'science': 'A+' ke liye perfect hai
      of: String,
    },
    feeStatus: feeStatusSchema,
  },
  {
    timestamps: true, // `createdAt` aur `updatedAt` fields automatically add ho jayengi
  }
);

const Student = mongoose.model('Student', studentSchema);

export default Student;