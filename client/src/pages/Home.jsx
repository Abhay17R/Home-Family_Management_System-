import React from "react";
import "../styles/Home.css"; // Dashboard ki style
import "../pages/intro.css"; // Landing page ki style (agar alag hai to)
import { Link } from "react-router-dom"; // Login button ke link ke liye
import { useAuth } from "../hooks/useAuth.js";
import { useLogout } from "../hooks/useLogout.js";

const Home = () => {
  const { user } = useAuth(); 
  const { logout } = useLogout();

  // ---------------------------------------------------------
  // SCENARIO 1: USER LOGGED IN HAI 
  // ---------------------------------------------------------
  if (user) {
    return (
      <section className="home-dashboard">
        <h1>Welcome Back, {user.firstName || user.name}!</h1>
        <p>You are successfully logged in.</p>
        
        <button className="logout-button" onClick={logout}>
          Logout
        </button>
      </section>
    );
  }

  // ---------------------------------------------------------
  // SCENARIO 2: USER NOT LOGGED
  //  "Static Page"
  // ---------------------------------------------------------
  return (
    <div className="landing-page-container">
      {/* NAVBAR */}
      <nav className="navbar">
        <h1 className="logo">HOME</h1>
        <div className="nav-buttons">
            {/* Ye button user ko login page par le jayega jab wo chahega */}
            <Link to="/auth">
                <button className="btn-login">Login</button>
            </Link>
            <button className="btn-about">About Us</button>
        </div>
      </nav>

      {/* HERO SECTION (Jo screenshot me tha) */}
      <div className="hero-section">
        <h1>Welcome to <span className="highlight">HOME</span></h1>
        <p>
          Organize your family life smartly: Track expenses, education,
          tasks, and much more.
        </p>
        <Link to="/auth">
            <button className="explore-btn">Explore Features ↓</button>
        </Link>
      </div>
    </div>
  );
};

export default Home;