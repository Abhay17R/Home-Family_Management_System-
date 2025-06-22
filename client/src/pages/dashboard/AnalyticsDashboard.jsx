import React, { useState, useEffect } from 'react'; // ✅ useEffect aur useState add karein
import axios from 'axios'; // ✅ axios add karein
import '../../styles/Dashboard/Analytic.css';

// --- SVG Icons (purane waale) ---
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


// ✅ NAYA SVG ICON
const OnlineIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path><path d="M12 16.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z"></path></svg>
);


function AnalyticsDashboard() {
  
  // ✅ DUMMY DATA ko STATE se replace karein
  const [stats, setStats] = useState({
    totalMembers: 4,
    activeAlerts: 1,
    locationsTracked: 3,
    messagesToday: 28,
    onlineMembersCount: 2, // Default value
  });
  const [loading, setLoading] = useState(true);

  // Yeh data abhi bhi dummy hai, isko bhi API se laa sakte hain
  const recentActivities = [
    { id: 1, user: 'Aarav', action: 'sent an emergency SOS.', time: '2 mins ago', type: 'alert' },
    { id: 2, user: 'Priya', action: 'checked in from School.', time: '15 mins ago', type: 'location' },
    { id: 3, user: 'Admin', action: 'updated family settings.', time: '1 hour ago', type: 'setting' },
  ];
  
  // ✅ API se data fetch karein
  useEffect(() => {
    const fetchStats = async () => {
        try {
            // Maan lijiye aapka stats wala route yeh hai
            const { data } = await axios.get('/api/v1/dashboard/stats', { withCredentials: true });
            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error("Stats fetch karne me error:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchStats();
  }, []);


  return (
    <div className="dashboard-container">
      {/* Page Header (No change) */}
      <div className="dashboard-header">
        <h1>Analytics & Dashboard</h1>
        <p>Welcome back! Here's a summary of your family's activity.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {/* Total Members (No change) */}
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'rgb(79, 70, 229)' }}>
            <UsersIcon />
          </div>
          <div className="stat-value">{loading ? '...' : stats.totalMembers}</div>
          <div className="stat-label">Total Members</div>
        </div>
        
        {/* ✅ NAYA CARD - ONLINE MEMBERS */}
        <div className="stat-card online-card"> {/* Special class for styling */}
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'rgb(34, 197, 94)' }}>
            <OnlineIcon />
          </div>
          <div className="stat-value">{loading ? '...' : stats.onlineMembersCount}</div>
          <div className="stat-label">Members Online</div>
        </div>

        {/* Active Alerts (No change) */}
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(217, 48, 37, 0.1)', color: 'rgb(217, 48, 37)' }}>
            <AlertIcon />
          </div>
          <div className="stat-value">{loading ? '...' : stats.activeAlerts}</div>
          <div className="stat-label">Active Alerts</div>
        </div>
        
        {/* Locations Tracked (No change) */}
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(22, 163, 74, 0.1)', color: 'rgb(22, 163, 74)' }}>
            <LocationIcon />
          </div>
          <div className="stat-value">{loading ? '...' : stats.locationsTracked}</div>
          <div className="stat-label">Locations Tracked</div>
        </div>
      </div>

      {/* --- ✅✅✅ ONLINE MEMBERS KI LIST (MAIN CONTENT AREA) ✅✅✅ --- */}
      <div className="main-content-area">
        <div className="online-list-card">
          <div className="online-list-header">
            <h3>Who's Online Right Now?</h3>
            <span className="online-dot"></span>
          </div>
          <div className="online-members-list">
            {/* Yeh list bhi API se aani chahiye, abhi ke liye dummy */}
            <div className="online-member">
                <img src="https://i.pravatar.cc/150?img=12" alt="Aarav" className="avatar" />
                <span className="member-name">Aarav Jha</span>
                <span className="status-dot online"></span>
            </div>
            <div className="online-member">
                <img src="https://i.pravatar.cc/150?img=1" alt="Admin" className="avatar" />
                <span className="member-name">Abhay Jha (You)</span>
                <span className="status-dot online"></span>
            </div>
            <div className="online-member">
                <img src="https://i.pravatar.cc/150?img=25" alt="Priya" className="avatar" />
                <span className="member-name">Priya Verma</span>
                <span className="status-dot away"></span>
                <span className="status-text">Away</span>
            </div>
          </div>
        </div>
        
        {/* Recent Activity Table (Iske Bagal Mein) */}
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

      {/* Charts Section (No change) */}
      <div className="charts-section">
        <div className="chart-card">
            {/* ... */}
        </div>
        <div className="chart-card">
            {/* ... */}
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;