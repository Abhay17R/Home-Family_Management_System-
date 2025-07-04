// src/pages/OtpVerification.jsx

import React, { useState } from "react";
import axios from "axios";
import API from '../api/axios'
import { Navigate, useParams, useNavigate } from "react-router-dom"; // useNavigate ko import karein
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth.js"; // ✅ Step 1: Sahi hook import karein
import "../styles/Auth.css";

const OtpVerification = () => {
  // ✅ Step 2: 'useAuth' se zaroori cheezein nikal lein
  const { user, setUser } = useAuth();
  
  const { email, phone } = useParams();
  const navigate = useNavigate(); // Navigation ke liye

  // OTP state logic bilkul sahi hai
  const [otp, setOtp] = useState(["", "", "", "", ""]);

  // OTP input ke functions bilkul sahi hain
  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  const handleResendOtp = async () => {
    toast.info("Resend OTP functionality to be implemented!");
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 5) {
      toast.error("Please enter the complete 5-digit OTP.");
      return;
    }
    const data = { email, otp: enteredOtp, phone };
    try {
      const res = await API.post(
        "otp-verification",
        data,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      toast.success(res.data.message);
      
      // ✅ Step 3: Global state ko naye AuthContext se update karein
      setUser(res.data.user);
      
      // ✅ Step 4: User ko dashboard par bhej dein
      // Kyunki App.jsx mein redirection logic hai, iski shayad zaroorat na pade,
      // lekin yahan karna zyada direct aur foolproof hai.
      navigate("/dashboard", { replace: true });

    } catch (err) {
      toast.error(err.response.data.message);
      // Agar OTP galat hai, to user state ko null set karne ki zaroorat nahi
      // kyunki woh pehle se hi null hai.
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
        <form onSubmit={handleOtpVerification} className="auth-form">
          <h2>OTP Verification</h2>
          <p className="form-description">
            Please enter the 5-digit code sent to your registered email or phone.
          </p>

          <div className="otp-input-fields">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                type="text"
                maxLength="1"
                className="otp-input"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                required
                inputMode="numeric"
              />
            ))}
          </div>

          <button type="submit">Verify OTP</button>

          <div className="bottom-links">
            <p>
              Didn't receive the code?{" "}
              <span className="link-style" onClick={handleResendOtp}>
                Resend OTP
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OtpVerification;