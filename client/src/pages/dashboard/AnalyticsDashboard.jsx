import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API from '../../api/axios';
import { formatDistanceToNow } from 'date-fns'; // Time ko format karne ke liye
import '../../styles/Dashboard/Analytic.css';
import { useAuth } from '../../hooks/useAuth.js';

// --- SVG Icons (Inmein koi badlav nahi) ---
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);
const AlertIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);
const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);
const OnlineIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path><path d="M12 16.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z"></path></svg>
);


function AnalyticsDashboard() {
  const { dashboardVersion } = useAuth();
  
  // States to hold data from API
  const [stats, setStats] = useState({
      totalMembers: 0,
      onlineMembersCount: 0,
      activeAlerts: 0,
      locationsTracked: 0,
      messagesToday: 0
  });
  const [onlineMembers, setOnlineMembers] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Time ko '... ago' format me dikhane wala function
  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    try {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch(e) {
        return 'a moment ago'; // Fallback
    }
  };

  // API se data fetch karne ke liye useEffect
  useEffect(() => {
    const fetchDashboardData = async () => {
        try {
            setError(null); // Purani error clear karein
            setLoading(true);

            // Sirf ek API call jo saara data laayegi
            const { data } = await API.get('/dashboard', { withCredentials: true });
            
            if (data.success) {
                setStats(data.stats);
                setOnlineMembers(data.onlineMembers);
                setRecentActivities(data.recentActivity);
            } else {
                setError(data.message || "Could not fetch dashboard data.");
            }
        } catch (err) {
            console.error("Dashboard data fetch error:", err);
            setError(err.response?.data?.message || "Failed to connect to the server.");
        } finally {
            setLoading(false);
        }
    };
    fetchDashboardData();
  }, [dashboardVersion]); // [] ka matlab yeh sirf ek baar component mount hone par chalega


  return (
    <div className="dashboard-container">
      {/* Page Header */}
      <div className="dashboard-header">
        <h1>Analytics & Dashboard</h1>
        <p>Welcome back! Here's a summary of your family's activity.</p>
      </div>

      {/* Error Message Display */}
      {error && <div className="error-message-bar">{error}</div>}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'rgb(79, 70, 229)' }}>
            <UsersIcon />
          </div>
          <div className="stat-value">{loading ? '...' : stats.totalMembers}</div>
          <div className="stat-label">Total Members</div>
        </div>
        
        <div className="stat-card online-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'rgb(34, 197, 94)' }}>
            <OnlineIcon />
          </div>
          <div className="stat-value">{loading ? '...' : stats.onlineMembersCount}</div>
          <div className="stat-label">Members Online</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(217, 48, 37, 0.1)', color: 'rgb(217, 48, 37)' }}>
            <AlertIcon />
          </div>
          <div className="stat-value">{loading ? '...' : stats.activeAlerts}</div>
          <div className="stat-label">Active Alerts</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(22, 163, 74, 0.1)', color: 'rgb(22, 163, 74)' }}>
            <LocationIcon />
          </div>
          <div className="stat-value">{loading ? '...' : stats.locationsTracked}</div>
          <div className="stat-label">Locations Tracked</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content-area">
        {/* Who's Online List */}
        <div className="online-list-card">
          <div className="online-list-header">
            <h3>Who's Online Right Now?</h3>
            <span className="online-dot"></span>
          </div>
          <div className="online-members-list">
            {loading ? (
                <p>Loading members...</p>
            ) : onlineMembers.length > 0 ? (
                onlineMembers.map(member => (
                    <div className="online-member" key={member.id}>
                        <img src={member.avatar} alt={member.name} className="avatar" />
                        <span className="member-name">{member.name}</span>
                        {/* Status dot ka color status ke hisaab se badlega */}
                        <span className={`status-dot ${member.status}`}></span>
                        {/* Agar 'away' hai to text dikhayein */}
                        {member.status === 'away' && <span className="status-text">Away</span>}
                    </div>
                ))
            ) : (
                <p>No members are currently online.</p>
            )}
          </div>
        </div>
        
        {/* Recent Activity Table */}
        <div className="activity-table-card">
          <h3>Recent Activity</h3>
          <ul className="activity-list">
            {loading ? (
                <li>Loading activities...</li>
            ) : recentActivities.length > 0 ? (
                recentActivities.map(activity => (
                    <li key={activity.id} className="activity-item">
                        <div className="activity-details">
                            <span className="activity-user">{activity.user}</span>
                            <span className="activity-action">{activity.action}</span>
                        </div>
                        {/* Time ko format karke dikhayein */}
                        <div className="activity-time">{formatTimeAgo(activity.time)}</div>
                    </li>
                ))
            ) : (
                <li>No recent activity to show.</li>
            )}
          </ul>
        </div>
      </div>

    </div>
  );
}

export default AnalyticsDashboard;