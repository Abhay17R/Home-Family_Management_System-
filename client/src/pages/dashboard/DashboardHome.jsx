// src/pages/dashboard/DashboardHome.jsx

import React from 'react';
// Dhyan dein: CSS ka path aapke naye folder structure ke hisaab se hai
// import '../../style/Dashboard/dashboard.css';
import '../../styles/Dashboard/dashboard.css'


// Dummy data, asli data backend se aayega
const summaryData = {
  billsDue: 3,
  unreadMessages: 5,
  upcomingAssignments: 2,
  alerts: 1,
};

const DashboardHome = () => {
  return (
    <div className="dashboard-container">
      {/* Page Heading */}
      <div className="dashboard-header">
        <h1>Welcome Back, [User Name]!</h1>
        <p>Here's a quick summary of your family's activities.</p>
      </div>

      {/* Summary Cards Grid */}
      <div className="summary-cards-grid">
        {/* Card 1: Bills Due */}
        <div className="summary-card bills">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3 className="card-title">Bills Due</h3>
            <p className="card-value">{summaryData.billsDue}</p>
            <a href="/expenses" className="card-link">View Bills →</a>
          </div>
        </div>

        {/* Card 2: Unread Messages */}
        <div className="summary-card messages">
          <div className="card-icon">✉️</div>
          <div className="card-content">
            <h3 className="card-title">Unread Messages</h3>
            <p className="card-value">{summaryData.unreadMessages}</p>
            <a href="/chat" className="card-link">Read Now →</a>
          </div>
        </div>

        {/* Card 3: Upcoming Assignments */}
        <div className="summary-card assignments">
          <div className="card-icon">📚</div>
          <div className="card-content">
            <h3 className="card-title">Upcoming Assignments</h3>
            <p className="card-value">{summaryData.upcomingAssignments}</p>
            <a href="/education" className="card-link">Check Deadlines →</a>
          </div>
        </div>

        {/* Card 4: Alerts */}
        <div className="summary-card alerts">
          <div className="card-icon">⚠️</div>
          <div className="card-content">
            <h3 className="card-title">Important Alerts</h3>
            <p className="card-value">{summaryData.alerts}</p>
            <a href="#" className="card-link">View Alerts →</a>
          </div>
        </div>
      </div>

      {/* Yahan par baki dashboard elements aa sakte hain, jaise recent activity, quick links etc. */}
    </div>
  );
};

export default DashboardHome;