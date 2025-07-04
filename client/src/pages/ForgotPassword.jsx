// src/pages/ForgotPassword.jsx

import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js"; // ✅ Step 1: Sahi hook import karein
import "../styles/Auth.css"; // Styles import
import API from "../api/axios";

const ForgotPassword = () => {
  // ✅ Step 2: useAuth se 'user' object nikalein
  const { user } = useAuth();
  
  // Yeh local state hai, iska context se koi lena-dena nahi. Yeh bilkul sahi hai.
  const [email, setEmail] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      // Yeh logic bilkul sahi hai aur ismein koi badlaav ki zaroorat nahi hai.
      const res = await API.post(
        "password/forgot",
        { email },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      toast.success(res.data.message);
      setEmail(""); // Success ke baad field ko khali kar dein
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  // ✅ Step 3: 'isAuthenticated' ki jagah 'user' se check karein
  // Agar user pehle se logged in hai, to use yeh page mat dikhao,
  // use seedha dashboard bhej do.
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Agar logged in nahi hai, to Forgot Password form dikhao.
  return (
    <div className="auth-page">
      <div className="auth-container">
        <form onSubmit={handleForgotPassword} className="auth-form">
          <h2>Forgot Password</h2>

          <p className="form-description">
            No worries! Enter your email address below and we'll send you a
            link to reset your password.
          </p>

          <div>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit">Send Reset Link</button>

          <div className="bottom-links">
            <Link to="/auth" className="link-style">
              ← Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;