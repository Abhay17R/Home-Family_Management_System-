import React from 'react';
import '../../styles/Dashboard/Analytic.css';

// SVG Icons (in-component for simplicity, can be moved to a separate file)
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);

const AlertIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);

const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);

const MessageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);


function AnalyticsDashboard() {
  const recentActivities = [
    { id: 1, user: 'Aarav', action: 'sent an emergency SOS.', time: '2 mins ago', type: 'alert' },
    { id: 2, user: 'Priya', action: 'checked in from School.', time: '15 mins ago', type: 'location' },
    { id: 3, user: 'Admin', action: 'updated family settings.', time: '1 hour ago', type: 'setting' },
    { id: 4, user: 'Rohan', action: 'sent a message to family group.', time: '3 hours ago', type: 'message' },
    { id: 5, user: 'Priya', action: 'left the geofence "Home".', time: '5 hours ago', type: 'location' },
  ];

  return (
    <div className="dashboard-container">
      {/* Page Header */}
      <div className="dashboard-header">
        <h1>Analytics & Dashboard</h1>
        <p>Welcome back! Here's a summary of your family's activity.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'rgb(79, 70, 229)' }}>
            <UsersIcon />
          </div>
          <div className="stat-value">4</div>
          <div className="stat-label">Total Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(217, 48, 37, 0.1)', color: 'rgb(217, 48, 37)' }}>
            <AlertIcon />
          </div>
          <div className="stat-value">1</div>
          <div className="stat-label">Active Alerts</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(22, 163, 74, 0.1)', color: 'rgb(22, 163, 74)' }}>
            <LocationIcon />
          </div>
          <div className="stat-value">3</div>
          <div className="stat-label">Locations Tracked</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(2, 132, 199, 0.1)', color: 'rgb(2, 132, 199)' }}>
            <MessageIcon />
          </div>
          <div className="stat-value">28</div>
          <div className="stat-label">Messages Today</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-card">
          <h3>Weekly Activity</h3>
          <p className="chart-subtitle">SOS alerts and check-ins over the last 7 days.</p>
          <div className="chart-placeholder">
            {/* Placeholder for a real chart library like Chart.js or Recharts */}
            <img src="https://i.imgur.com/5z2Z2Yt.png" alt="A line graph showing weekly activity trends" style={{ width: '100%', height: '100%', objectFit: 'contain' }}/>
          </div>
        </div>
        <div className="chart-card">
          <h3>Member Usage</h3>
          <p className="chart-subtitle">Activity distribution by family member.</p>
          <div className="chart-placeholder">
             {/* Placeholder for a real chart library */}
             <img src="https://i.imgur.com/eBf2gH0.png" alt="A bar chart showing member usage" style={{ width: '100%', height: '100%', objectFit: 'contain' }}/>
          </div>
        </div>
      </div>
      
      {/* Recent Activity Table */}
      <div className="activity-table-card">
        <h3>Recent Activity</h3>
        <ul className="activity-list">
          {recentActivities.map(activity => (
            <li key={activity.id} className="activity-item">
              <div className="activity-details">
                <span className="activity-user">{activity.user}</span>
                <span className="activity-action">{activity.action}</span>
              </div>
              <div className="activity-time">{activity.time}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;