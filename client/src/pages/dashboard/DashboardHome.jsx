// src/pages/dashboard/DashboardHome.jsx

import React from 'react';
// Icons ke liye import
import { FaFileInvoiceDollar, FaRegCommentDots, FaTasks, FaExclamationTriangle, FaMapMarkerAlt, FaPlus, FaUpload, FaGift } from 'react-icons/fa';
// CSS file ka path
import '../../styles/Dashboard/dashboard.css';

// Line 20 ko humne hata diya hai, kyunki file mil nahi rahi thi
// import userAvatar from '../../assets/user-avatar.png'; 

const DashboardHome = () => {
  // Dummy data (real data API se aayega)
  const familyMembers = [
    { name: 'Dad', status: 'Online', avatar: 'https://i.pravatar.cc/40?u=dad' },
    { name: 'Saira', status: 'Offline', avatar: 'https://i.pravatar.cc/40?u=saira' },
    { name: 'Rohan', status: 'In School', avatar: 'https://i.pravatar.cc/40?u=rohan' },
  ];

  const quickActions = [
    { user: 'Dad', action: 'paid 8,000 for electricity bill', avatar: 'https://i.pravatar.cc/40?u=dad' },
    { user: 'Mom', action: 'added "Grocery shopping" to wishlist', avatar: 'https://i.pravatar.cc/40?u=mom' },
    { user: 'Rohan', action: 'uploaded school assignment', avatar: 'https://i.pravatar.cc/40?u=rohan' },
  ];

  // Humne yahan ek dummy image URL daal diya hai
  const userAvatarUrl = 'https://i.pravatar.cc/50?u=admin'; 

  return (
    <div className="dashboard-content-area">
      {/* HEADER */}
      <header className="dashboard-header">
        <div className="greeting">
          <h2>Hello, Arjun 👋</h2>
          <p>Welcome back to your Family Dashboard</p>
        </div>
        <div className="user-profile">
          {/* Yahan 'src' ko change kiya hai */}
          <img src={userAvatarUrl} alt="Arjun" className="avatar" />
          <div className="user-details">
            <span className="user-name">Admin</span>
            <span className="current-date">Tuesday, April 23</span>
          </div>
        </div>
      </header>
      
      {/* Baaki ka code same rahega... */}
      
      {/* TOP STATS GRID */}
      <div className="stats-grid">
        <div className="stat-card">
          <FaFileInvoiceDollar className="card-icon bills" />
          <div className="card-info">
            <span className="card-title">Bills Due</span>
            <span className="card-value">3</span>
            <span className="card-subtitle">unpaid bills</span>
          </div>
        </div>
        <div className="stat-card">
          <FaRegCommentDots className="card-icon messages" />
          <div className="card-info">
            <span className="card-title">Unread Messages</span>
            <span className="card-value">5</span>
            <span className="card-subtitle">unread chats</span>
          </div>
        </div>
        <div className="stat-card">
          <FaTasks className="card-icon assignments" />
          <div className="card-info">
            <span className="card-title">Upcoming Assignments</span>
            <span className="card-value">2</span>
            <span className="card-subtitle">exams this week</span>
          </div>
        </div>
        <div className="stat-card">
          <FaExclamationTriangle className="card-icon alerts" />
          <div className="card-info">
            <span className="card-title">Alerts</span>
            <span className="card-value">1</span>
            <span className="card-subtitle">Emergency Alert active</span>
          </div>
        </div>
        <div className="stat-card">
          <FaMapMarkerAlt className="card-icon location" />
          <div className="card-info">
            <span className="card-title">Location</span>
            <span className="card-value">2</span>
            <span className="card-subtitle">members shared location</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <main className="main-content-grid">
        {/* LEFT COLUMN */}
        <div className="dashboard-widget expense-summary">
          <h3 className="widget-title">Monthly Expense Summary</h3>
          <div className="expense-content">
            {/* Note: This is a static representation. For a real chart, use a library like Chart.js or Recharts */}
            <div className="chart-container">
              <div className="donut-chart"></div>
              <ul className="chart-legend">
                <li><span className="dot housing"></span>Housing</li>
                <li><span className="dot groceries"></span>Groceries</li>
                <li><span className="dot utilities"></span>Utilities</li>
                <li><span className="dot other"></span>Other</li>
              </ul>
            </div>
            <div className="bar-chart-container">
                <div className="bars">
                    <div className="bar-group">
                        <div className="bar budget"></div>
                        <div className="bar actual"></div>
                    </div>
                </div>
              <div className="bar-labels">
                <span>Budget</span>
                <span>Actual</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="right-column">
          <div className="dashboard-widget quick-actions">
            <h3 className="widget-title">Quick Actions</h3>
            <ul className="activity-list">
              {quickActions.map((item, index) => (
                <li key={index} className="activity-item">
                  <img src={item.avatar} alt={item.user} className="activity-avatar" />
                  <p><strong>{item.user}</strong> {item.action}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="dashboard-widget family-status">
            <h3 className="widget-title">Family Member Status</h3>
            <ul className="member-list">
              {familyMembers.map((member, index) => (
                <li key={index} className="member-item">
                  <div className="member-info">
                    <img src={member.avatar} alt={member.name} className="member-avatar" />
                    <span>{member.name}</span>
                  </div>
                  <span className={`status ${member.status.toLowerCase().replace(' ', '-')}`}>{member.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      
      {/* BOTTOM ACTION BUTTONS */}
      <div className="bottom-actions-grid">
        <div className="action-button-card">
            <FaPlus className="action-icon" />
            <span>Add Expense</span>
        </div>
        <div className="action-button-card">
            <FaUpload className="action-icon" />
            <span>Upload Certificate</span>
        </div>
        <div className="action-button-card">
            <FaGift className="action-icon" />
            <span>Add to Wishlist</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;