// src/pages/ResetPassword.jsx

import React, { useState } from "react";
import axios from "axios";
import API from '../api/axios'
import { Navigate, useParams, Link, useNavigate } from "react-router-dom"; // useNavigate import karein
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth.js"; // ✅ Step 1: Sahi hook import karein
import "../styles/Auth.css";

const ResetPassword = () => {
  // ✅ Step 2: 'useAuth' se zaroori cheezein nikal lein
  const { user, setUser } = useAuth();
  
  const { token } = useParams();
  const navigate = useNavigate(); // Navigation ke liye

  // Yeh local states bilkul sahi hain
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const res = await API.put(
        `password/reset/${token}`,
        { password, confirmPassword },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      toast.success(res.data.message);
      
      // ✅ Step 3: Global state ko naye AuthContext se update karein
      setUser(res.data.user);
      
      // ✅ Step 4: User ko seedha dashboard par bhej dein
      navigate("/dashboard", { replace: true });

    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  // ✅ Step 5: 'isAuthenticated' ki jagah 'user' se check karein
  // Agar user pehle se logged in hai, to use dashboard bhej do
  if (user) {
    return <Navigate to={"/dashboard"} replace />;
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <form onSubmit={handleResetPassword} className="auth-form">
          <h2>Reset Password</h2>
          <p className="form-description">
            Choose a new, strong password. Make sure you remember it this time!
          </p>

          <div>
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit">Reset Password</button>

          <div className="bottom-links">
            <Link to="/auth" className="link-style">
              Remembered your password? Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;