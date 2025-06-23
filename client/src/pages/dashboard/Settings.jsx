import React from 'react';
import '../../styles/Dashboard/Setting.css'; 

const SecuritySettings = () => {
  return (
    <div className="security-settings-container">
      <h1 className="main-header">Security & Settings</h1>
      <p className="main-subheader">Manage your account's security, privacy, and settings.</p>

      {/* Card 1: Change Password */}
      <div className="settings-card">
        <h2 className="card-header">Change Password</h2>
        <div className="form-group">
          <label htmlFor="current-password">Current Password</label>
          <input type="password" id="current-password" placeholder="Enter your current password" />
        </div>
        <div className="form-group">
          <label htmlFor="new-password">New Password</label>
          <input type="password" id="new-password" placeholder="Enter a new secure password" />
        </div>
        <div className="form-group">
          <label htmlFor="confirm-password">Confirm New Password</label>
          <input type="password" id="confirm-password" placeholder="Confirm your new password" />
        </div>
        <div className="card-footer">
          <button className="btn btn-primary">Save Changes</button>
        </div>
      </div>

      {/* Card 2: Two-Factor Authentication (2FA) */}
      <div className="settings-card">
        <h2 className="card-header">Two-Factor Authentication (2FA)</h2>
        <p className="card-description">
          Add an extra layer of security to your account by requiring a second verification step.
        </p>
        <div className="toggle-row">
          <span>Enable 2FA</span>
          <div className="toggle-switch">
            <input type="checkbox" id="two-factor-auth" className="toggle-checkbox" />
            <label htmlFor="two-factor-auth" className="toggle-label"></label>
          </div>
        </div>
      </div>

      {/* Card 3: Active Sessions */}
      <div className="settings-card">
        <h2 className="card-header">Active Sessions</h2>
        <p className="card-description">This is a list of devices that have logged into your account.</p>
        <ul className="session-list">
          <li className="session-item">
            <div className="session-info">
              <span className="device-info">Chrome on Windows 11</span>
              <span className="location-info">Mumbai, IN - (Current Session)</span>
            </div>
            <button className="btn btn-secondary">Log Out</button>
          </li>
          <li className="session-item">
            <div className="session-info">
              <span className="device-info">Safari on iPhone 14 Pro</span>
              <span className="location-info">Delhi, IN - 2 days ago</span>
            </div>
            <button className="btn btn-secondary">Log Out</button>
          </li>
        </ul>
      </div>

      {/* Card 4: Danger Zone */}
      <div className="settings-card danger-zone">
        <h2 className="card-header">Danger Zone</h2>
        <p className="card-description">
          These actions are irreversible. Please be certain before proceeding.
        </p>
        <div className="danger-action">
          <span>Delete your account and all associated data.</span>
          <button className="btn btn-danger">Delete My Account</button>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;