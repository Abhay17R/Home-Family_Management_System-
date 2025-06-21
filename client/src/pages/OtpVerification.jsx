// src/pages/OtpVerification.jsx

import React, { useContext, useState } from "react";
import axios from "axios";
import { Navigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
// import { Context } from "../main";
import { Context } from "../context/Context.jsx"; // ✅

// Hum ab Auth.css ka istemaal karenge
import "../styles/Auth.css";

const OtpVerification = () => {
  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(Context);
  const { email, phone } = useParams();
  
  // Aapka OTP state logic bilkul theek hai
  const [otp, setOtp] = useState(["", "", "", "", ""]);

  // Aapke saare functions (handleChange, handleKeyDown, etc.) bilkul safe hain
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
    // Yahan aap resend OTP ki API call kar sakte hain
    toast.info("Resend OTP functionality to be implemented!");
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    // OTP poora hai ya nahi, yeh check karna ek acchi practice hai
    if (enteredOtp.length !== 5) {
      toast.error("Please enter the complete 5-digit OTP.");
      return;
    }
    const data = { email, otp: enteredOtp, phone };
    try {
      const res = await axios.post(
        "http://localhost:4000/api/v1/otp-verification",
        data,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      toast.success(res.data.message);
      setIsAuthenticated(true);
      setUser(res.data.user);
    } catch (err) {
      toast.error(err.response.data.message);
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  if (isAuthenticated) {
    return <Navigate to={"/"} />;
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
                inputMode="numeric" // Mobile par numeric keyboard dikhayega
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