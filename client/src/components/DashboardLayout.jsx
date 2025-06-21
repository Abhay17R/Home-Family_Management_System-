import React from 'react';
import { Outlet } from 'react-router-dom';

// Aapke existing components ko import karein
import Sidebar from './Sidebar'; 
import Header from './Header';   

// Nayi CSS file jise hum abhi banayenge
import './DashboardLayout.css'; 

const DashboardLayout = ({ user, theme, toggleTheme }) => {
  return (
    <div className="dashboard-layout">
      {/* Sidebar fixed hai, isliye woh apne aap sahi jagah par aa jayega */}
      <Sidebar user={user} />

      {/* Yeh container main content (Header + Page) ko hold karega */}
      {/* Iski CSS isko sidebar ke bagal me rakhegi */}
      <div className="main-content-wrapper">
        
        {/* Aapka Header/Navbar */}
        <Header theme={theme} toggleTheme={toggleTheme} />
        
        {/* Yahan aapke child pages (AddChild, Profile, etc.) render honge */}
        <main className="page-outlet">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;