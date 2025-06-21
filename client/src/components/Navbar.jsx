import React from "react";
import { Link } from "react-router-dom";
import { FiSun, FiMoon } from "react-icons/fi";

const Navbar = ({ theme, toggleTheme }) => {
  return (
    <header className="home-header">
      <h1>HOME</h1>
      <div className="header-controls">
        <Link to="/auth" className="btn btn-secondary">Login</Link>
        <Link to="/auth" className="btn btn-primary">Register</Link>
        <button onClick={toggleTheme} className="theme-toggle-btn">
          {theme === 'light' ? <FiMoon /> : <FiSun />}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
