// src/pages/ForgotPassword.jsx

import React, { useContext, useState } from "react";
// import { Context } from "../main";
import { Context } from "../context/Context.jsx"; // ✅

import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom"; // Link import karein

// Hum ab Auth.css ka istemaal karenge
import "../styles/Auth.css";

const ForgotPassword = () => {
  const { isAuthenticated } = useContext(Context);
  const [email, setEmail] = useState("");

  // Aapka backend logic bilkul safe hai
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:4000/api/v1/password/forgot",
        { email },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    // Hum Auth page ki classes ka hi istemaal kar rahe hain
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

          <button type="submit">
            Send Reset Link
          </button>

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