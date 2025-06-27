import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import '../../styles/Dashboard/education.css';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

const EducationDashboard = () => {
    // === STATE VARIABLES ===
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Add Student Modal State
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);
    const [studentFormError, setStudentFormError] = useState('');
    const [studentFormData, setStudentFormData] = useState({ name: '', grade: '', school: '' });

    // Add Assignment Modal State
    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false);
    const [assignmentFormError, setAssignmentFormError] = useState('');
    const [assignmentFormData, setAssignmentFormData] = useState({ title: '', dueDate: '' });

    // === DATA FETCHING ===
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await API.get('/education/students');
                setStudents(response.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching student data:", err);
                setError("Could not fetch student data. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchStudents();
    }, []);

    // === HANDLER FUNCTIONS for ADD STUDENT ===
    const handleStudentFormChange = (e) => setStudentFormData({ ...studentFormData, [e.target.name]: e.target.value });
    const handleOpenStudentModal = () => {
        setStudentFormData({ name: '', grade: '', school: '' });
        setStudentFormError('');
        setIsStudentModalOpen(true);
    };
    const handleCloseStudentModal = () => setIsStudentModalOpen(false);
    const handleStudentFormSubmit = async (e) => {
        e.preventDefault();
        if (!studentFormData.name || !studentFormData.grade || !studentFormData.school) {
            setStudentFormError('All fields are required.'); return;
        }
        setStudentFormError(''); setIsSubmittingStudent(true);
        try {
            const response = await API.post('/education/students', { ...studentFormData, feeStatus: { status: 'Due', amount: '₹0' } });
            setStudents((prev) => [...prev, response.data]);
            handleCloseStudentModal();
        } catch (err) {
            setStudentFormError(err.response?.data?.message || 'Could not add student.');
        } finally {
            setIsSubmittingStudent(false);
        }
    };

    // === HANDLER FUNCTIONS for ADD ASSIGNMENT ===
    const handleAssignmentFormChange = (e) => setAssignmentFormData({ ...assignmentFormData, [e.target.name]: e.target.value });
    const handleOpenAssignmentModal = (studentId) => {
        setSelectedStudentId(studentId);
        setAssignmentFormData({ title: '', dueDate: '' });
        setAssignmentFormError('');
        setIsAssignmentModalOpen(true);
    };
    const handleCloseAssignmentModal = () => setIsAssignmentModalOpen(false);
    const handleAssignmentFormSubmit = async (e) => {
        e.preventDefault();
        if (!assignmentFormData.title || !assignmentFormData.dueDate) {
            setAssignmentFormError('Both title and due date are required.'); return;
        }
        setAssignmentFormError(''); setIsSubmittingAssignment(true);
        try {
            const response = await API.post(`/education/students/${selectedStudentId}/assignments`, assignmentFormData);
            setStudents(prev => prev.map(s => s._id === selectedStudentId ? response.data : s));
            handleCloseAssignmentModal();
        } catch(err) {
            setAssignmentFormError(err.response?.data?.message || 'Could not add assignment.');
        } finally {
            setIsSubmittingAssignment(false);
        }
    };

    // === HANDLER FUNCTION for PAY NOW BUTTON ===
    const handlePayNowClick = () => {
        alert('Payment Gateway Integration is coming soon!');
    };


    // === RENDER LOGIC ===
    if (isLoading) return <div className="loading-state">Loading Education Hub...</div>;
    if (error) return <div className="error-state">{error}</div>;

    return (
        <div className="education-container">
            <div className="education-header">
                <h1>Education Hub</h1>
                <button className="add-student-btn" onClick={handleOpenStudentModal}>+ Add New Student</button>
            </div>

            {/* Student Cards Grid */}
            {students.length === 0 ? (
                <div className="no-data-state"><p>No students found. Click "+ Add New Student" to get started!</p></div>
            ) : (
                <div className="student-cards-grid">
                    {students.map((student) => (
                        <div key={student._id} className="student-card">
                            <div className="card-header">
                                <div><h3>{student.name}</h3><p>{student.school}</p></div>
                                <span className="student-grade">{student.grade}</span>
                            </div>

                            <div className="card-section">
                                <h4>Upcoming Assignments</h4>
                                {student.assignments && student.assignments.length > 0 ? (
                                    <ul>{student.assignments.map((ass) => (
                                        <li key={ass._id}><span>{ass.title}</span><span className="due-date">Due: {formatDate(ass.dueDate)}</span></li>
                                    ))}</ul>
                                ) : <p className="no-assignments">No upcoming assignments.</p>}
                                <button className="add-btn-small" onClick={() => handleOpenAssignmentModal(student._id)}>+ Add Assignment</button>
                            </div>
                            
                            <div className="card-section">
                                <h4>Recent Grades</h4>
                                <div className="grades-list">
                                    {student.grades && Object.keys(student.grades).length > 0 ? (
                                        Object.entries(student.grades).map(([subject, grade]) => (
                                            <div key={subject} className="grade-item">
                                                <span className="subject">{subject.charAt(0).toUpperCase() + subject.slice(1)}</span>
                                                <span className={`grade-badge grade-${grade.replace('+', 'plus')}`}>{grade}</span>
                                            </div>
                                        ))
                                    ) : <p className="no-grades">No grades recorded yet.</p>}
                                </div>
                            </div>

                            <div className="card-section">
                                <h4>Fee Status</h4>
                                <div className={`fee-status ${student.feeStatus?.status?.toLowerCase() || 'due'}`}>
                                    <p>
                                        <strong>Status:</strong> {student.feeStatus?.status || 'N/A'} <br />
                                        <strong>Amount:</strong> {student.feeStatus?.amount || 'N/A'}
                                    </p>
                                    {student.feeStatus?.status === 'Due' && (
                                        <button className="pay-now-btn" onClick={handlePayNowClick}>Pay Now</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* === MODALS === */}

            {/* Add Student Modal */}
            {isStudentModalOpen && (
                <div className="modal-overlay" onClick={handleCloseStudentModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={handleCloseStudentModal}>×</button>
                        <form onSubmit={handleStudentFormSubmit} className="add-student-form">
                            <h2>Add New Student</h2>
                            {studentFormError && <p className="form-error">{studentFormError}</p>}
                            <div className="form-group"><label>Student Name</label><input type="text" name="name" value={studentFormData.name} onChange={handleStudentFormChange} required /></div>
                            <div className="form-group"><label>Grade</label><input type="text" name="grade" value={studentFormData.grade} onChange={handleStudentFormChange} required /></div>
                            <div className="form-group"><label>School Name</label><input type="text" name="school" value={studentFormData.school} onChange={handleStudentFormChange} required /></div>
                            <button type="submit" className="form-submit-btn" disabled={isSubmittingStudent}>{isSubmittingStudent ? 'Adding...' : 'Add Student'}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Assignment Modal */}
            {isAssignmentModalOpen && (
                <div className="modal-overlay" onClick={handleCloseAssignmentModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={handleCloseAssignmentModal}>×</button>
                        <form onSubmit={handleAssignmentFormSubmit} className="add-student-form">
                            <h2>Add New Assignment</h2>
                            {assignmentFormError && <p className="form-error">{assignmentFormError}</p>}
                            <div className="form-group"><label>Assignment Title</label><input type="text" name="title" value={assignmentFormData.title} onChange={handleAssignmentFormChange} required /></div>
                            <div className="form-group"><label>Due Date</label><input type="date" name="dueDate" value={assignmentFormData.dueDate} onChange={handleAssignmentFormChange} required /></div>
                            <button type="submit" className="form-submit-btn" disabled={isSubmittingAssignment}>{isSubmittingAssignment ? 'Adding...' : 'Add Assignment'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EducationDashboard;