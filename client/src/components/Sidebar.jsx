// Sidebar.jsx

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLogout } from '../hooks/useLogout.js'; // Yeh hook aapne banaya hai, aage badhte hain
import { useAuth } from '../hooks/useAuth.js';  // ✅ STEP 1: Apne AuthContext se useAuth hook import karein

// --- MENU CONFIGURATION (No Changes Here) ---
const menuItems = [
    { heading: 'General' },
    { name: 'Dashboard / Home', path: '/dashboard', role: ['admin', 'child'] },
    { name: 'My Profile', path: '/dashboard/user-profile', role: ['admin','child'] },
    // { name: 'My Profile', path: '/dashboard/child-profile', role: ['child'] },  
    { name: 'Documents', path: '/dashboard/documents', role: ['admin', 'child'] },
    
    { heading: 'Finance & Planning' },
    { name: 'Household Expenses', path: '/dashboard/expenses', role: ['admin'] },
    { name: 'Education', path: '/dashboard/education', role: ['admin', 'child'] },
    { name: 'Shopping & Orders', path: '/dashboard/orders', role: ['admin', 'child'] },

    { heading: 'Tools' },
    { name: 'Communication', path: '/dashboard/communication', role: ['admin', 'child'] },
    
    { 
        name: 'Emergency Alert System', 
        path: '/dashboard/emergency', 
        role: ['admin', 'child'], 
        permission: 'emergencyAlerts'
    },
    { 
        name: 'Location Tracking', 
        path: '/dashboard/location', 
        role: ['admin', 'child'], 
        permission: 'locationTracking'
    },
    
    { heading: 'Oversight' },
    { name: 'Analytics & Reports', path: '/dashboard/reports', role: ['admin'] },
    { name: 'Security & Settings', path: '/dashboard/security', role: ['admin', 'child'] },
];

const adminSpecificItems = [
    { heading: 'Admin Controls' },
    { name: 'Manage Members', path: '/dashboard/manage-members', role: ['admin'] },
    { name: 'Add New Member', path: '/dashboard/add-member', role: ['admin'] },
    { name: 'Home Services', path: '/dashboard/home-service', role: ['admin'] },
    
];


const Sidebar = () => {
    const navigate = useNavigate();
    const { logout } = useLogout();
    
    // ✅ STEP 2: AuthContext se user aur isLoading state nikal lein
    // Isse 'user' variable ab defined ho jayega
    const { user, isLoading } = useAuth();

    // Pehle Loading state handle karein. Jab tak API se user data nahi aata, loading dikhayein.
    if (isLoading) {
        return (
            <aside className="sidebar">
                <div className="sidebar-header">Loading...</div>
                {/* Aap yahan ek accha sa skeleton loader bhi laga sakte hain */}
            </aside>
        );
    }

    // Agar loading poori ho gayi hai, lekin user login nahi hai (ya token expire ho gaya)
    // to sidebar khali dikhayein ya kuch message de dein.
    // Dashboard route par yeh component normally render nahi hoga agar user logged in nahi hai,
    // par yeh ek acchi practice hai.
    if (!user) {
        return (
            <aside className="sidebar">
                <div className="sidebar-header">Family Dashboard</div>
                <div style={{ padding: '20px', color: '#888' }}>
                    Please log in to see the menu.
                </div>
            </aside>
        );
    }
    
    // Ab jab user object available hai, hum role aur permissions nikal sakte hain
    const currentUserRole = user.role;
    const currentUserPermissions = user.permissions || {}; // Agar permissions na ho to empty object lein

    const renderMenuItems = (items) => {
        return items.map((item, index) => {
            // Section Heading ka logic bilkul theek tha
            if (item.heading) {
                const nextItems = items.slice(index + 1);
                const isSectionVisible = nextItems.some(subItem => {
                    if (subItem.heading || !subItem.role.includes(currentUserRole)) {
                        return false;
                    }
                    if (currentUserRole === 'admin') return true;
                    if (subItem.permission) {
                        return currentUserPermissions && currentUserPermissions[subItem.permission];
                    }
                    return true;
                });
                return isSectionVisible ? <li key={item.heading} className="menu-heading">{item.heading}</li> : null;
            }

            // Menu item ka logic bhi theek tha, ab yeh 'currentUserRole' ki wajah se sahi chalega
            if (item.role.includes(currentUserRole)) {
                if (currentUserRole === 'admin') {
                    return (
                        <li key={item.path} className="menu-item">
                            <NavLink to={item.path} end>{item.name}</NavLink>
                        </li>
                    );
                }

                if (item.permission) {
                    if (currentUserPermissions[item.permission]) {
                        return (
                            <li key={item.path} className="menu-item">
                                <NavLink to={item.path} end>{item.name}</NavLink>
                            </li>
                        );
                    }
                    return null; 
                }
                
                return (
                    <li key={item.path} className="menu-item">
                        <NavLink to={item.path} end>{item.name}</NavLink>
                    </li>
                );
            }
            return null;
        });
    };
    
    return (
        <aside className="sidebar">
            <div className="sidebar-header" onClick={() => navigate('/dashboard')} style={{cursor: 'pointer'}}>
                Family Dashboard
            </div>
            
            <ul className="sidebar-menu">
                {renderMenuItems(menuItems)}
                {currentUserRole === 'admin' && renderMenuItems(adminSpecificItems)}
            </ul>
            
            <div className="sidebar-footer">
                 <button onClick={logout} className="logout-button">Logout</button>
            </div>
        </aside>
    );
};

export default Sidebar;