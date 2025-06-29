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
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    familyId: { type: String, required: true }, // ya ObjectId agar Family model hai

    name: { type: String, required: true, trim: true },
    grade: { type: String, required: true },
    school: { type: String, required: true },
    assignments: [assignmentSchema],
    grades: {
      type: Map,
      of: String,
    },
    feeStatus: feeStatusSchema,
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.model('Student', studentSchema);

export default Student;