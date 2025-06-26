// EducationDashboard.js
import React from 'react';
import '../../styles/Dashboard/education.css';

// Sample data (Asli project mein yeh API se aayega)
const studentsData = [
  {
    id: 1,
    name: 'Aarav Sharma',
    grade: '8th Grade',
    school: 'Delhi Public School',
    assignments: [
      { title: 'Maths - Algebra Worksheet', dueDate: '2023-10-25' },
      { title: 'Science - Photosynthesis Project', dueDate: '2023-10-28' },
      { title: 'History - Mughal Empire Essay', dueDate: '2023-11-05' },
    ],
    grades: {
      maths: 'A',
      science: 'A+',
      english: 'B+',
    },
    feeStatus: {
      status: 'Paid',
      amount: '₹15,000',
      dueDate: 'N/A',
    },
  },
  {
    id: 2,
    name: 'Priya Singh',
    grade: '5th Grade',
    school: 'Kendriya Vidyalaya',
    assignments: [
      { title: 'English - Story Writing', dueDate: '2023-10-26' },
      { title: 'EVS - Water Cycle Diagram', dueDate: '2023-10-29' },
    ],
    grades: {
      maths: 'A',
      science: 'B',
      english: 'A+',
    },
    feeStatus: {
      status: 'Due',
      amount: '₹12,500',
      dueDate: '2023-10-30',
    },
  },
];

const EducationDashboard = () => {
  return (
    <div className="education-container">
      <div className="education-header">
        <h1>Education Hub</h1>
        <button className="add-student-btn">+ Add New Student</button>
      </div>

      <div className="student-cards-grid">
        {studentsData.map((student) => (
          <div key={student.id} className="student-card">
            <div className="card-header">
              <div>
                <h3>{student.name}</h3>
                <p>{student.school}</p>
              </div>
              <span className="student-grade">{student.grade}</span>
            </div>

            <div className="card-section">
              <h4>Upcoming Assignments</h4>
              <ul>
                {student.assignments.map((assignment, index) => (
                  <li key={index}>
                    <span>{assignment.title}</span>
                    <span className="due-date">Due: {assignment.dueDate}</span>
                  </li>
                ))}
              </ul>
              <button className="add-btn-small">+ Add Assignment</button>
            </div>
            
            <div className="card-section">
                <h4>Recent Grades</h4>
                <div className="grades-list">
                    {Object.entries(student.grades).map(([subject, grade]) => (
                        <div key={subject} className="grade-item">
                            <span className="subject">{subject.charAt(0).toUpperCase() + subject.slice(1)}</span>
                            <span className={`grade-badge grade-${grade.replace('+', 'plus')}`}>{grade}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card-section">
              <h4>Fee Status</h4>
              <div className={`fee-status ${student.feeStatus.status.toLowerCase()}`}>
                <p>
                  <strong>Status:</strong> {student.feeStatus.status} <br />
                  <strong>Amount:</strong> {student.feeStatus.amount}
                </p>
                {student.feeStatus.status === 'Due' && (
                  <button className="pay-now-btn">Pay Now</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EducationDashboard;