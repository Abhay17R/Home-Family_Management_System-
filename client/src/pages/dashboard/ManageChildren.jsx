import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Dashboard/ManageChildren.css'; // Is CSS file ko hum abhi banayenge

// --- DUMMY DATA ---
// Jab aap backend se connect karenge, toh yeh data API se aayega.
const initialChildrenData = [
    {
        id: 1,
        firstName: 'Rohan',
        lastName: 'Sharma',
        username: 'rohan.sharma',
        profilePic: 'https://i.pravatar.cc/150?img=12', // Random user image
        permissions: {
            locationTracking: true,
            emergencyAlerts: true,
        },
    },
    {
        id: 2,
        firstName: 'Priya',
        lastName: 'Verma',
        username: 'priya.verma',
        profilePic: 'https://i.pravatar.cc/150?img=25',
        permissions: {
            locationTracking: true,
            emergencyAlerts: false,
        },
    },
    {
        id: 3,
        firstName: 'Aarav',
        lastName: 'Patel',
        username: 'aarav.p',
        profilePic: 'https://i.pravatar.cc/150?img=32',
        permissions: {
            locationTracking: false,
            emergencyAlerts: true,
        },
    },
];

// Chhote SVG Icons
const AddIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const RemoveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;


const ManageChildren = () => {
    const [children, setChildren] = useState(initialChildrenData);

    const handleRemoveChild = (childId) => {
        // Confirmation dialog
        if (window.confirm('Are you sure you want to remove this profile? This action cannot be undone.')) {
            setChildren(prevChildren => prevChildren.filter(child => child.id !== childId));
            // Yahan aap backend par API call bhejenge to delete the profile
            console.log(`Removing child with ID: ${childId}`);
        }
    };

    return (
        <div className="manage-children-container">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h2>Manage Child Profiles</h2>
                    <p>View, edit, or remove child profiles from your family dashboard.</p>
                </div>
                <Link to="/dashboard/add-child" className="btn btn-primary add-child-btn">
                    <AddIcon />
                    <span>Add New Child</span>
                </Link>
            </div>

            {/* Children Grid */}
            <div className="children-grid">
                {children.map((child) => (
                    <div className="child-card" key={child.id}>
                        <div className="card-header">
                            <img src={child.profilePic} alt={`${child.firstName}'s profile`} className="profile-pic" />
                            <div className="name-details">
                                <h3 className="child-name">{child.firstName} {child.lastName}</h3>
                                <span className="child-username">@{child.username}</span>
                            </div>
                        </div>

                        <div className="card-body">
                            <h4>Permissions</h4>
                            <div className="permission-item">
                                <span>Location Tracking</span>
                                <label className="switch">
                                    <input type="checkbox" defaultChecked={child.permissions.locationTracking} />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                            <div className="permission-item">
                                <span>Emergency Alerts</span>
                                <label className="switch">
                                    <input type="checkbox" defaultChecked={child.permissions.emergencyAlerts} />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                        </div>

                        <div className="card-actions">
                            <button className="btn-edit">
                                <EditIcon />
                                <span>Edit</span>
                            </button>
                            <button className="btn-remove" onClick={() => handleRemoveChild(child.id)}>
                                <RemoveIcon />
                                <span>Remove</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {children.length === 0 && (
                <div className="no-children-found">
                    <h3>No child profiles found.</h3>
                    <p>Click on "Add New Child" to create a new profile.</p>
                </div>
            )}
        </div>
    );
};

export default ManageChildren;