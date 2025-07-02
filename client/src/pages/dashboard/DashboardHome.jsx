// src/pages/dashboard/DashboardHome.jsx

import React, { useState, useEffect } from 'react';
// import axios from 'axios'; // API calls ke liye
import API from '../../api/axios.js';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'; // Chart ke liye

// Icons (yeh pehle se hi the)
import { FaFileInvoiceDollar, FaRegCommentDots, FaTasks, FaExclamationTriangle, FaMapMarkerAlt, FaPlus, FaUpload, FaGift } from 'react-icons/fa';

// CSS file (yeh pehle se hi thi)
import '../../styles/Dashboard/dashboard.css';

// Chart ke liye colors define kar lete hain
const COLORS = {
    Housing: '#0088FE',
    Groceries: '#00C49F',
    Utilities: '#FFBB28',
    Other: '#FF8042',
    Transport: '#AF19FF',
    Entertainment: '#FF4560',
    Education: '#775DD0',
    Health: '#4CAF50',
};

const DashboardHome = () => {
  // State variables data, loading, aur error ko manage karne ke liye
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect hook component ke mount hone par data fetch karega
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Apne backend API endpoint ko call karein.
        // NOTE: Agar aapka API URL alag hai to usko yahan update karein.
        // `withCredentials: true` cookies (jaise login token) ko request ke saath bhejega.
        const response = await API.get('HOME', { withCredentials: true });
        
        // API se aaye data ko state mein set karein
        setDashboardData(response.data.data);
        setError(null);
      } catch (err) {
        // Agar koi error aaye to use state mein set karein
        setError('Failed to fetch dashboard data. Please try again later.');
        console.error("Dashboard fetch error:", err);
      } finally {
        // Loading state ko false karein, chahe success ho ya error
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // Empty array ka matlab hai ki yeh effect sirf ek baar chalega

  // Action buttons ke liye placeholder functions
  const handleAddExpense = () => {
    // Yahan aap user ko naye expense page par navigate kar sakte hain
    // Example: navigate('/expenses/new');
    alert('Add Expense Clicked!');
  };

  const handleUploadDocument = () => {
    // Yahan file upload ka modal open kar sakte hain
    alert('Upload Certificate Clicked!');
  };

  const handleAddToWishlist = () => {
    alert('Add to Wishlist Clicked!');
  };


  // --- JSX Rendering ---

  if (loading) {
    return <div className="dashboard-content-area"><h2>Loading Dashboard...</h2></div>;
  }

  if (error) {
    return <div className="dashboard-content-area"><h2 style={{color: 'red'}}>{error}</h2></div>;
  }

  // Agar data na mile to
  if (!dashboardData) {
    return <div className="dashboard-content-area"><h2>No dashboard data available.</h2></div>;
  }

  // Agar data mil jaye to poora dashboard render karein
  return (
    <div className="dashboard-content-area">
      {/* HEADER: Yahan user ka naam API se aa raha hai */}
      <header className="dashboard-header">
        <div className="greeting">
          <h2>Hello, {dashboardData.user?.name || 'User'} 👋</h2>
          <p>Welcome back to your Family Dashboard</p>
        </div>
        {/* User profile section pehle jaisa hi hai, aap isko bhi dynamic bana sakte hain */}
        <div className="user-profile">
          <img src='https://i.pravatar.cc/50?u=admin' alt="Admin" className="avatar" />
          <div className="user-details">
            <span className="user-name">Admin</span>
            <span className="current-date">Tuesday, April 23</span>
          </div>
        </div>
      </header>
      
      {/* TOP STATS GRID: Saare numbers API se aa rahe hain */}
      <div className="stats-grid">
        <div className="stat-card">
          <FaFileInvoiceDollar className="card-icon bills" />
          <div className="card-info">
            <span className="card-title">Bills Due</span>
            <span className="card-value">{dashboardData.stats.billsDue}</span>
            <span className="card-subtitle">unpaid bills</span>
          </div>
        </div>
        <div className="stat-card">
          <FaRegCommentDots className="card-icon messages" />
          <div className="card-info">
            <span className="card-title">Unread Messages</span>
            <span className="card-value">{dashboardData.stats.unreadMessages}</span>
            <span className="card-subtitle">unread chats</span>
          </div>
        </div>
        <div className="stat-card">
          <FaTasks className="card-icon assignments" />
          <div className="card-info">
            <span className="card-title">Upcoming Assignments</span>
            <span className="card-value">{dashboardData.stats.upcomingAssignments}</span>
            <span className="card-subtitle">due this week</span>
          </div>
        </div>
        <div className="stat-card">
          <FaExclamationTriangle className="card-icon alerts" />
          <div className="card-info">
            <span className="card-title">Alerts</span>
            <span className="card-value">{dashboardData.stats.alerts}</span>
            <span className="card-subtitle">Emergency Alert active</span>
          </div>
        </div>
        <div className="stat-card">
          <FaMapMarkerAlt className="card-icon location" />
          <div className="card-info">
            <span className="card-title">Location</span>
            <span className="card-value">{dashboardData.stats.locationsShared}</span>
            <span className="card-subtitle">members sharing location</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <main className="main-content-grid">
        {/* LEFT COLUMN - EXPENSE CHART */}
        <div className="dashboard-widget expense-summary">
          <h3 className="widget-title">Monthly Expense Summary</h3>
          <div className="expense-content">
            <div className="chart-container">
              {dashboardData.expenseSummary.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={dashboardData.expenseSummary}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="totalAmount"
                      nameKey="category"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {dashboardData.expenseSummary.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.category] || COLORS['Other']} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p>No expense data for this month.</p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="right-column">
          <div className="dashboard-widget quick-actions">
            <h3 className="widget-title">Quick Actions</h3>
            <ul className="activity-list">
              {dashboardData.quickActions.length > 0 ? dashboardData.quickActions.map((item, index) => (
                <li key={index} className="activity-item">
                  <img src={item.avatar} alt={item.user} className="activity-avatar" />
                  <p><strong>{item.user}</strong> {item.action}</p>
                </li>
              )) : (
                <li>No recent activities.</li>
              )}
            </ul>
          </div>

          <div className="dashboard-widget family-status">
            <h3 className="widget-title">Family Member Status</h3>
            <ul className="member-list">
              {dashboardData.familyStatus.length > 0 ? dashboardData.familyStatus.map((member, index) => (
                <li key={index} className="member-item">
                  <div className="member-info">
                    <img src={member.avatar} alt={member.name} className="member-avatar" />
                    <span>{member.name}</span>
                  </div>
                  <span className={`status ${member.status.toLowerCase().replace(' ', '-')}`}>{member.status}</span>
                </li>
              )) : (
                <li>No family members found.</li>
              )}
            </ul>
          </div>
        </div>
      </main>
      
      {/* BOTTOM ACTION BUTTONS */}
      <div className="bottom-actions-grid">
        <div className="action-button-card" onClick={handleAddExpense}>
            <FaPlus className="action-icon" />
            <span>Add Expense</span>
        </div>
        <div className="action-button-card" onClick={handleUploadDocument}>
            <FaUpload className="action-icon" />
            <span>Upload Document</span>
        </div>
        <div className="action-button-card" onClick={handleAddToWishlist}>
            <FaGift className="action-icon" />
            <span>Add to Wishlist</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;