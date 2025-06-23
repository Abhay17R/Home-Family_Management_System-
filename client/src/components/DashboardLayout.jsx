// src/components/DashboardLayout.jsx

// ✅ STEP 1: 'useEffect' ko React se aur 'useAuth' ko apne hook se import karein
import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js'; // Sahi path check kar lein

// Aapke existing components ko import karein
import Sidebar from './Sidebar'; 
import Header from './Header';   

// Nayi CSS file
import './DashboardLayout.css'; 

const DashboardLayout = ({ theme, toggleTheme }) => {
    
    // ✅ STEP 2: 'useAuth' hook ko call karke 'fetchLoggedInUser' nikalein
    const { fetchLoggedInUser } = useAuth();

    // Yeh effect bilkul sahi hai. Yeh real-time updates ke liye accha hai.
    useEffect(() => {
        // Yeh function tab call hoga jab user window par wapas aayega
        const handleFocus = () => {
            console.log("Window focused, re-fetching user data...");
            fetchLoggedInUser();
        };

        // Event listener add karein
        window.addEventListener('focus', handleFocus);

        // Cleanup function: Component unmount hone par listener hata dein
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchLoggedInUser]); // Dependency bilkul sahi hai
    

    // Baaki ka JSX bilkul sahi hai
    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="main-content-wrapper">
                <Header theme={theme} toggleTheme={toggleTheme} />
                <main className="page-outlet">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;