import React from 'react';
import { Link } from "react-router-dom";

const Header = ({ theme, toggleTheme }) => {
    return (
        <header className="header">
            {/* React Router Link */}
            <Link to="/intro" className="header-brand" style={{ textDecoration: 'none' }}>
    HOME
</Link>
            
            <div className="header-title"><b>Your Family Dashboard</b></div>
            
            <button onClick={toggleTheme} className={`theme-toggle-button ${theme}`}>
                {/* SVGs can be uncommented if needed */}
            </button>
        </header>
    );
};

export default Header;
