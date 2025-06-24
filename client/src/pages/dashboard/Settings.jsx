// File: src/components/Dashboard/SecuritySettings.js

// --- Step 1: Saare zaroori modules import karo ---
import React, { useState, useEffect, useContext } from 'react';
import API from '../../api/axios.js'; // Hamara custom axios instance
import { ToastContainer, toast } from 'react-toastify'; // Sundar notifications ke liye
import 'react-toastify/dist/ReactToastify.css'; // Notifications ki CSS
import '../../styles/Dashboard/Setting.css'; // Tumhari component ki CSS
import { AuthContext } from '../../context/AuthContext'; // Tumhara Authentication Context

// ==============================================================================
// >> SecuritySettings Component <<
// ==============================================================================
const SecuritySettings = () => {
  // --- Step 2: Context se User Data lo ---
  // useContext hook se hum logged-in user ki jaankari aur usko update karne ka function le rahe hain.
  const { user, setUser } = useContext(AuthContext);

  // --- Step 3: State Management ---
  // Har form field, data list, aur loading state ke liye alag-alag state variables.
  
  // Change Password form ke liye
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Active Sessions ki list store karne ke liye
  const [sessions, setSessions] = useState([]);
  
  // 2FA ke status ke liye. Initial value user object se le rahe hain.
  const [is2faEnabled, setIs2faEnabled] = useState(user?.twoFactorAuth?.isEnabled || false);
  const [qrCode, setQrCode] = useState(''); // 2FA ka QR code image URL store karne ke liye

  // Loading state, taaki jab API call ho rahi ho toh button disable kar sakein.
  const [loading, setLoading] = useState(false);

  // --- Step 4: Data Fetching (Jab component load ho) ---
  // useEffect hook component ke pehli baar render hone par data fetch karega.
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // API instance ka use karke active sessions fetch karo.
        const { data } = await API.get('/settings/sessions');
        if (data.success) {
          setSessions(data.sessions);
        }
      } catch (error) {
        toast.error('Failed to fetch active sessions.');
        console.error("Session fetch error:", error);
      }
    };

    // Yeh check zaroori hai. Sirf tab data fetch karo jab user logged in ho.
    if (user) {
      fetchInitialData();
      // User object se 2FA ka current status set karo.
      setIs2faEnabled(user.twoFactorAuth.isEnabled);
    }
  }, [user]); // Dependency array me [user] ka matlab hai ki yeh code tab-tab chalega jab user object (login/logout) change hoga.

  // --- Step 5: Handler Functions (Saare button clicks aur form submissions ka logic) ---

  // Function 1: Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault(); // Form ko page refresh karne se roko.
    if (!currentPassword || !newPassword || !confirmPassword) return toast.warn('Please fill all password fields.');
    if (newPassword !== confirmPassword) return toast.error('New passwords do not match.');
    
    setLoading(true);
    try {
      const { data } = await API.put('/settings/change-password', { currentPassword, newPassword });
      toast.success(data.message);
      // Success ke baad form fields ko khali kar do.
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false); // Chahe success ho ya error, loading state ko false kar do.
    }
  };

  // Function 2: Toggle 2FA
  const handle2faToggle = async (e) => {
    const enable = e.target.checked;
    try {
        const { data } = await API.post('/settings/2fa/toggle', { enable });
        setIs2faEnabled(enable);
        toast.success(data.message);
        if (enable && data.qrCode) setQrCode(data.qrCode); // QR code dikhao
        else setQrCode(''); // QR code hatao
    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to update 2FA.');
        // Agar error aaye to toggle ko purani state par wapas le aao.
        setIs2faEnabled(!enable);
    }
  };

  // Function 3: Logout a Session
  const handleLogoutSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to log out this device?')) {
      try {
        const { data } = await API.delete(`/settings/sessions/${sessionId}`);
        toast.success(data.message);
        // UI se us session ko turant hata do.
        setSessions(prevSessions => prevSessions.filter(s => s._id !== sessionId));
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to log out.');
      }
    }
  };

  // Function 4: Delete Account
  const handleDeleteAccount = async () => {
    const password = prompt("This is irreversible. To delete your account, please enter your password.");
    if (password) {
      setLoading(true);
      try {
        const { data } = await API.delete('/settings/delete-account', { data: { password } });
        toast.success(data.message);
        // Account delete hone ke baad user ko logout karke login page par bhej do.
        setUser(null); // Context se user hata do.
        window.location.href = '/login'; // Login page par redirect kar do.
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete account.');
      } finally {
        setLoading(false);
      }
    }
  };

  // --- Step 6: Conditional Rendering ---
  // Agar user context se abhi tak load nahi hua hai, to loading message dikhao.
  if (!user) {
    return <div>Loading your settings... Please wait.</div>;
  }

  // --- Step 7: JSX Rendering (Tumhara UI Code) ---
  return (
    <div className="security-settings-container">
      {/* Notifications (Toast) dikhane ke liye container */}
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} theme="colored" />

      {/* Static Header part */}
      <h1 className="main-header">Security & Settings</h1>
      <p className="main-subheader">Manage your account's security, privacy, and settings.</p>

      {/* Card 1: Change Password */}
      <div className="settings-card">
        <h2 className="card-header">Change Password</h2>
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label htmlFor="current-password">Current Password</label>
            <input type="password" id="current-password" placeholder="Enter your current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="new-password">New Password</label>
            <input type="password" id="new-password" placeholder="Enter a new secure password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-password">Confirm New Password</label>
            <input type="password" id="confirm-password" placeholder="Confirm your new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <div className="card-footer">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Card 2: Two-Factor Authentication (2FA) */}
      <div className="settings-card">
        <h2 className="card-header">Two-Factor Authentication (2FA)</h2>
        <p className="card-description">Add an extra layer of security to your account by requiring a second verification step.</p>
        <div className="toggle-row">
          <span>Enable 2FA</span>
          <div className="toggle-switch">
            <input type="checkbox" id="two-factor-auth" className="toggle-checkbox" checked={is2faEnabled} onChange={handle2faToggle} />
            <label htmlFor="two-factor-auth" className="toggle-label"></label>
          </div>
        </div>
        {qrCode && (
            <div className="qr-code-section" style={{marginTop: '1rem', textAlign: 'center'}}>
                <p>Scan this QR code with your authenticator app (e.g., Google Authenticator).</p>
                <img src={qrCode} alt="2FA QR Code" />
            </div>
        )}
      </div>

      {/* Card 3: Active Sessions */}
      <div className="settings-card">
        <h2 className="card-header">Active Sessions</h2>
        <p className="card-description">This is a list of devices that have logged into your account.</p>
        <ul className="session-list">
          {sessions.length > 0 ? sessions.map(session => (
            <li key={session._id} className="session-item">
              <div className="session-info">
                <span className="device-info">{session.deviceInfo}</span>
                <span className="location-info">
                  {session.locationInfo || 'Unknown Location'} - {session.isCurrent ? '(Current Session)' : `Last active on ${new Date(session.lastActive).toLocaleDateString()}`}
                </span>
              </div>
              {!session.isCurrent && (
                <button className="btn btn-secondary" onClick={() => handleLogoutSession(session._id)}>
                  Log Out
                </button>
              )}
            </li>
          )) : <p>No other active sessions found.</p>}
        </ul>
      </div>

      {/* Card 4: Danger Zone */}
      <div className="settings-card danger-zone">
        <h2 className="card-header">Danger Zone</h2>
        <p className="card-description">These actions are irreversible. Please be certain before proceeding.</p>
        <div className="danger-action">
          <span>Delete your account and all associated data.</span>
          <button className="btn btn-danger" onClick={handleDeleteAccount} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete My Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;