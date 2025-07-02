import React, { useState, useEffect, useRef } from 'react'; // 1. useRef ko import kiya gaya hai
import API from '../../api/axios';
import '../../styles/Dashboard/Userprofile.css';
import { useAppFocus } from '../../context/AppFocusContext'; // 2. AppFocusContext ko import kiya gaya hai

// Helper function to format the join date nicely
const formatJoinDate = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `Joined in ${month} ${year}`;
};

const UserProfile = () => {
    // State to hold all user data fetched from the API
    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        name: '',
        email: '',
        role: '',
        avatar: { url: '' },
        bio: '',
        phone: '',
        secondaryPhone: '',
        address: ''
    });
    
    // Separate states for UI elements
    const [joinDate, setJoinDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 3. useRef aur useAppFocus ko setup kiya gaya hai
    const avatarInputRef = useRef(null);
    const { blockFocusAction } = useAppFocus();

    // Fetch user profile data when the component loads
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                const { data } = await API.get('/me'); // Aapke bataye अनुसार /me endpoint
                
                const [firstName, ...lastNameParts] = data.user.name.split(' ');

                setUserData({
                    ...data.user,
                    firstName: firstName || '',
                    lastName: lastNameParts.join(' ') || '',
                });

                setJoinDate(formatJoinDate(data.user.createdAt));
                setError(null);
            } catch (err) {
                setError('Failed to fetch user data. Please try again later.');
                console.error("Fetch Profile Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, []);

    // Generic handler to update state on form input changes
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setUserData(prev => ({ ...prev, [id]: value }));
    };

    // Handler for submitting the profile details form
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const profileDataToUpdate = {
                name: `${userData.firstName} ${userData.lastName}`.trim(),
                email: userData.email,
                address: userData.address,
                bio: userData.bio,
                secondaryPhone: userData.secondaryPhone
            };
            
            const { data } = await API.put('/me', profileDataToUpdate); // Aapke bataye अनुसार /me endpoint
            alert(data.message || 'Profile updated successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update profile.');
            console.error("Update Profile Error:", err);
        }
    };
    
    // Handler for changing the user's avatar
    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const { data } = await API.put('/me/avatar', formData, { // Aapke bataye अनुसार /me/avatar endpoint
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            setUserData(prev => ({...prev, avatar: data.avatar}));
            alert('Avatar updated successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to upload avatar.');
            console.error("Avatar Upload Error:", err);
        }
    };

    if (loading) {
        return <div className="profile-container"><h1>Loading Profile...</h1></div>;
    }

    if (error) {
        return <div className="profile-container"><h1 className="error-message">{error}</h1></div>;
    }

    return (
        <div className="profile-container">
            <h1 className="profile-header">User Profile</h1>
            <div className="profile-grid">
                <div className="profile-card summary-card">
                    <div className="avatar-container">
                        <img src={userData.avatar?.url} alt="User Avatar" className="avatar-image" />
                        
                        {/* Hidden file input ko ref diya gaya hai */}
                        <input 
                            type="file" 
                            ref={avatarInputRef} 
                            id="avatar-upload" 
                            accept="image/*" 
                            style={{ display: 'none' }} 
                            onChange={handleAvatarChange} 
                        />
                        
                        {/* Is button ke onClick par focus blocking ka logic hai */}
                        <button 
                            className="change-avatar-btn"
                            onClick={() => {
                                blockFocusAction();
                                avatarInputRef.current?.click();
                            }}
                        >
                            Change Photo
                        </button>
                    </div>
                    <h2 className="user-name">{userData.name}</h2>
                    <p className="user-role">{userData.role === 'admin' ? 'Administrator' : 'Member'}</p>
                    <div className="join-date"><span>📅</span> {joinDate}</div>
                </div>

                <div className="profile-card details-card">
                    <h3 className="details-header">Profile Details</h3>
                    <form className="profile-form" onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group"><label htmlFor="firstName">First Name</label><input type="text" id="firstName" value={userData.firstName} onChange={handleInputChange} /></div>
                            <div className="form-group"><label htmlFor="lastName">Last Name</label><input type="text" id="lastName" value={userData.lastName} onChange={handleInputChange} /></div>
                        </div>
                        <div className="form-group"><label htmlFor="email">Email Address</label><input type="email" id="email" value={userData.email} onChange={handleInputChange}/></div>
                        <div className="form-group"><label htmlFor="phone">Phone Number</label><input type="tel" id="phone" value={userData.phone || ''} readOnly className="form-input-readonly" /></div>
                        {/* <div className="form-group"><label htmlFor="secondaryPhone">Secondary Phone</label><input type="tel" id="secondaryPhone" value={userData.secondaryPhone || ''} onChange={handleInputChange} /></div> */}
                        <div className="form-group"><label htmlFor="address">Address</label><input type="text" id="address" value={userData.address || ''} onChange={handleInputChange} /></div>
                        <div className="form-group"><label htmlFor="bio">About Me</label><textarea id="bio" rows="4" value={userData.bio || ''} onChange={handleInputChange}></textarea></div>
                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary">Cancel</button>
                            <button type="submit" className="btn btn-primary">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;