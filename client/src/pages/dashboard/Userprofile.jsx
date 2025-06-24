import React from 'react';
import '../../styles/Dashboard/Userprofile.css'

// User ka dummy data. Asli data aap API se ya state se laayenge.
const userData = {
  name: 'Aarav Sharma',
  email: 'aarav.sharma@family.com',
  joinDate: 'Joined in December 2022',
  role: 'Administrator',
  avatarUrl: 'https://i.pravatar.cc/150?img=12', // Ek random user avatar ke liye
  bio: 'Family tech enthusiast and planner. Managing our family\'s digital life, one component at a time.',
  phone: '+91-9876543210',
  address: 'A-123, Family Apartments, New Delhi, India'
};

const UserProfile = () => {
  return (
    <div className="profile-container">
      <h1 className="profile-header">User Profile</h1>

      <div className="profile-grid">
        {/* Left Card: User Summary */}
        <div className="profile-card summary-card">
          <div className="avatar-container">
            <img src={userData.avatarUrl} alt="User Avatar" className="avatar-image" />
            <button className="change-avatar-btn">Change Photo</button>
          </div>
          <h2 className="user-name">{userData.name}</h2>
          <p className="user-role">{userData.role}</p>
          <div className="join-date">
            <span>📅</span> {userData.joinDate}
          </div>
        </div>

        {/* Right Card: User Details Form */}
        <div className="profile-card details-card">
          <h3 className="details-header">Profile Details</h3>
          <form className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input type="text" id="firstName" defaultValue="Aarav" />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input type="text" id="lastName" defaultValue="Sharma" />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" defaultValue={userData.email} />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input type="tel" id="phone" defaultValue={userData.phone} />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input type="text" id="address" defaultValue={userData.address} />
            </div>
            
            <div className="form-group">
              <label htmlFor="bio">About Me</label>
              <textarea id="bio" rows="4" defaultValue={userData.bio}></textarea>
            </div>

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