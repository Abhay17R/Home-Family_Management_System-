import React, { useContext, useState } from "react";
// import { Context } from "../main";
import { Context } from "../context/Context.jsx"; // ✅

import { Navigate, Link } from "react-router-dom";
import Register from "../components/Register";
import Login from "../components/Login";
import { FiSun, FiMoon } from "react-icons/fi";
import "../styles/Auth.css";

const Auth = () => {
  const { isAuthenticated } = useContext(Context);
  const [isLogin, setIsLogin] = useState(true);
  const [theme, setTheme] = useState("dark");

  if (isAuthenticated) return <Navigate to={"/dashboard"} />;

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div className={`auth-page-wrapper ${theme}`}>
      {/* ✅ SAME NAVBAR AS INTRO */}
      <header className="home-header">
      <h1><Link to="/intro" className="home-link">HOME</Link></h1>

        <div className="header-controls">
          {/* <Link to="/auth" className="btn btn-secondary">Login</Link> */}
          {/* <Link to="/auth" className="btn btn-primary">Register</Link> */}
          {/* <button onClick={toggleTheme} className="theme-toggle-btn">
            {theme === "light" ? <FiMoon /> : <FiSun />}
          </button> */}
        </div>
      </header>

      <div className="auth-page">
        <div className="auth-container">
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
