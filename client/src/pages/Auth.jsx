// src/pages/Auth.jsx

import React, { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js"; // ✅ Sahi hook import
import Register from "../components/Register";
import Login from "../components/Login";
import "../styles/Auth.css"; // Styles import

const Auth = () => {
  // ✅ Step 1: useAuth se 'user' nikalein
  const { user } = useAuth();
  
  // ✅ Step 2: 'isLogin' state ko define karein
  // Yeh state Login aur Register tabs ko switch karne ke liye hai
  const [isLogin, setIsLogin] = useState(true);

  // Yeh theme ke liye state hai
  const [theme, setTheme] = useState("dark"); // Default theme dark

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // ✅ Step 3: 'isAuthenticated' ki jagah 'user' se check karein
  // Agar user object hai (logged in), to use dashboard bhej do
  if (user) {
    return <Navigate to={"/dashboard"} replace />;
  }

  // Agar logged in nahi hai, to Login/Register UI dikhao
  return (
    <div className={`auth-page-wrapper ${theme}`}>
      {/* Navbar */}
      <header className="home-header">
        <h1>
          <Link to="/intro" className="home-link">
            HOME
          </Link>
        </h1>
        {/* Header controls (agar zaroorat ho to yahan daalein) */}
      </header>

      {/* Main Content */}
      <div className="auth-page">
        <div className="auth-container">
          {/* Login/Register Switcher */}
          <div className="auth-toggle">
            <button
              className={`toggle-btn ${isLogin ? "active" : ""}`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`toggle-btn ${!isLogin ? "active" : ""}`}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>

          {/* Conditional Rendering of Login/Register Component */}
          {isLogin ? (
            <Login setIsLogin={setIsLogin} />
          ) : (
            <Register setIsLogin={setIsLogin} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth; 