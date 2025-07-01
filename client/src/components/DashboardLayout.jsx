// src/components/DashboardLayout.jsx

// React aur 'useAuth' hook ko import karein
import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js'; 

// ✅ STEP 1: Global Context se 'useAppFocus' hook import karein
import { useAppFocus } from '../context/AppFocusContext.jsx'; 

// Aapke existing components ko import karein
import Sidebar from './Sidebar'; 
import Header from './Header';   
import './DashboardLayout.css'; 

const DashboardLayout = ({ theme, toggleTheme }) => {
    
    const { fetchLoggedInUser } = useAuth();
    
    // ✅ STEP 2: Context se state aur function lein
    // isActionBlockingFocus: Batayega ki focus ko block karna hai ya nahi
    // unblockFocusAction: State ko wapas normal (false) karne ke liye
    const { isActionBlockingFocus, unblockFocusAction } = useAppFocus();

    useEffect(() => {
        // Yeh function tab call hoga jab user window par wapas aayega
        const handleFocus = () => {
            
            // ✅ STEP 3: YAHAN HAI MAIN LOGIC
            // Check karein ki kya global state focus ko block kar raha hai
            if (isActionBlockingFocus) {
                console.log("DashboardLayout: Focus was blocked by a file dialog. Unblocking now and skipping fetch.");
                
                // State ko reset kar do taaki agli baar fetch ho
                unblockFocusAction();
                
                // Refetch ko skip karne ke liye function se bahar nikal jao
                return; 
            }
            
            // Agar focus block nahi tha, to normal tareeke se data fetch karo
            console.log("DashboardLayout: Window focused normally, re-fetching user data...");
            if (fetchLoggedInUser) {
                fetchLoggedInUser();
            }
        };

        // Event listener add karein
        window.addEventListener('focus', handleFocus);

        // Cleanup function: Component unmount hone par listener hata dein
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
        
        // Dependency array mein context se aaye hue functions/state daalna zaroori hai
    }, [fetchLoggedInUser, isActionBlockingFocus, unblockFocusAction]);
    

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