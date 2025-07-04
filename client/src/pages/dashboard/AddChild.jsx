import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Step 1: Import useNavigate
// import axios from 'axios'; // ✅ Behtar handling ke liye axios ka istemal
import '../../styles/Dashboard/AddChild.css';

import API from '../../api/axios';

// SVG Icon component - No changes here
const UploadIcon = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="48" 
        height="48" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1"
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
);


const AddChild = () => {
    // Form data state - No changes
    const [formData, setFormData] = useState({
        profilePic: null,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dob: '',
        username: '',
        password: '',
        confirmPassword: '',
        verificationMethod: 'email',
        locationTracking: true,
        emergencyAlerts: true,
        communicationTools: false,
    });

    // Loading and error state - No changes
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // ✅ Step 2: Component ke andar useNavigate ko initialize karein
    const navigate = useNavigate();

    // Input change handler - No changes
    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === 'file') {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({
                ...formData,
                [name]: type === 'checkbox' ? checked : value,
            });
        }
    };

    // ✅ Form submit handler - NAVIGATION LOGIC KE SAATH UPDATE KIYA GAYA
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        setLoading(true);

        const payload = {
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            verificationMethod: formData.verificationMethod,
        };

        try {
            // Axios ka istemal karke API call
            const { data } = await API.post(
                'admin/create-child',
                payload,
                { withCredentials: true } // Cookies bhejne ke liye zaroori
            );

            // ✅ Step 3: Success hone par navigate karein
            alert( "Family member profile created! Redirecting to OTP page...");
            
            // User ko OTP page par bhej dein
            navigate(`/dashboard/otp-child/${encodeURIComponent(payload.email)}`);

        } catch (err) {
            const errorMessage = err.response?.data?.message || "Failed to create member's profile."
            ;
            setError(errorMessage);
            alert(`Error: ${errorMessage}`);
            console.error('Form Submission Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-child-container">
            <div className="form-header">
                <h2>Add a New Member Profile</h2>
                <p>Fill in the details below to create a new family member profile in the dashboard.</p>
            </div>

            <div className="form-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-body">
                        {/* Left Column */}
                        <div className="form-left">
                            <div className="form-group profile-uploader">
                                <label>Profile Picture</label>
                                <div className="uploader-box">
                                    <UploadIcon />
                                    <span className="upload-text">Click to upload or drag & drop</span>
                                    <small className="upload-hint">PNG, JPG</small>
                                    <input type="file" name="profilePic" accept="image/png, image/jpeg" onChange={handleChange} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="first-name">First Name</label>
                                <input type="text" id="first-name" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="e.g., Rohan" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="last-name">Last Name</label>
                                <input type="text" id="last-name" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="e.g., Sharma" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="e.g., rohan@example.com" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="phone">Phone Number</label>
                                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="e.g., 9876543210" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="dob">Date of Birth</label>
                                <input type="date" id="dob" name="dob" value={formData.dob} onChange={handleChange} required />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="form-right">
                            <div className="form-group">
                                <label htmlFor="username">Username</label>
                                <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} placeholder="Create a unique username" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter a strong password" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirm-password">Confirm Password</label>
                                <input type="password" id="confirm-password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter the password" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="verification-method">Verification Method</label>
                                <select id="verification-method" name="verificationMethod" value={formData.verificationMethod} onChange={handleChange} required>
                                    <option value="email">Send code via Email</option>
                                    <option value="phone">Send code via Phone (SMS)</option>
                                </select>
                            </div>
                            <div className="permissions-section">
                                <h4>Manage Permissions</h4>
                                <div className="permission-item">
                                    <span>Enable Location Tracking</span>
                                    <label className="switch">
                                        <input type="checkbox" name="locationTracking" checked={formData.locationTracking} onChange={handleChange} />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                                <div className="permission-item">
                                    <span>Allow Emergency Alerts</span>
                                    <label className="switch">
                                        <input type="checkbox" name="emergencyAlerts" checked={formData.emergencyAlerts} onChange={handleChange} />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                                <div className="permission-item">
                                    <span>Access Communication Tools</span>
                                    <label className="switch">
                                        <input type="checkbox" name="communicationTools" checked={formData.communicationTools} onChange={handleChange} />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" disabled={loading}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddChild;