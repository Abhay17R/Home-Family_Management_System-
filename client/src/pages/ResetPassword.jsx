// src/pages/ResetPassword.jsx

import React, { useContext, useState } from "react";
import axios from "axios";
import { Navigate, useParams, Link } from "react-router-dom"; // Link ko import karein
import { toast } from "react-toastify";
// import { Context } from "../main";
import { Context } from "../context/Context.jsx"; // ✅


// Hum Auth.css ka istemaal karenge
import "../styles/Auth.css";

const ResetPassword = () => {
  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(Context);
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Aapka backend logic bilkul safe hai
  const handleResetPassword = async (e) => {
    e.preventDefault();
    // Client-side par check karna ek acchi practice hai
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:4000/api/v1/password/reset/${token}`,
        { password, confirmPassword },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      toast.success(res.data.message);
      setIsAuthenticated(true);
      setUser(res.data.user);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }

  return (
    // Hum Auth page ki classes ka hi istemaal kar rahe hain
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