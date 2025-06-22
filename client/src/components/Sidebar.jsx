// Sidebar.jsx

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLogout } from '../hooks/useLogout.js'; // Maan kar chal rahe hain ki yeh hook aapne banaya hai

// --- MENU CONFIGURATION ---
const menuItems = [
    { heading: 'General' },
    { name: 'Dashboard / Home', path: '/dashboard', role: ['admin', 'child'] },
    { name: 'User Profile', path: '/dashboard/user-profile', role: ['admin'] },
    { name: 'My Profile', path: '/dashboard/child-profile', role: ['child'] },
    { name: 'Documents', path: '/dashboard/documents', role: ['admin', 'child'] },
    
    { heading: 'Finance & Planning' },
    { name: 'Household Expenses', path: '/dashboard/expenses', role: ['admin'] },
    { name: 'Education', path: '/dashboard/education', role: ['admin', 'child'] },
    { name: 'Shopping & Orders', path: '/dashboard/orders', role: ['admin', 'child'] },

    { heading: 'Tools' },
    { name: 'Communication', path: '/dashboard/communication', role: ['admin', 'child'] },
    
    // PERMISSION-BASED ITEMS
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
    { name: 'Manage Children', path: '/dashboard/manage-children', role: ['admin'] },
    { name: 'Add New Child', path: '/dashboard/add-child', role: ['admin'] },
];

const Sidebar = ({ user }) => {
    const navigate = useNavigate();
    const { logout } = useLogout();
    
    const currentUserRole = user?.role;
    const currentUserPermissions = user?.permissions;

    const renderMenuItems = (items) => {
        return items.map((item, index) => {
            // Section Heading ko render karne ka logic
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

            // Check karo ki user ka role item ke role se match karta hai ya nahi
            if (item.role.includes(currentUserRole)) {
                
                // ✅ --- YEH HAI NAYA SAHI LOGIC --- ✅
                // Agar user 'admin' hai, to usko sab kuch dikhao.
                if (currentUserRole === 'admin') {
                    return (
                        <li key={item.path} className="menu-item">
                            <NavLink to={item.path} end>{item.name}</NavLink>
                        </li>
                    );
                }

                // Agar user 'child' hai, to permission check karo.
                // 1. Agar item ko permission ki zaroorat hai...
                if (item.permission) {
                    // to check karo ki child ke paas woh permission hai ya nahi.
                    if (currentUserPermissions && currentUserPermissions[item.permission]) {
                        return (
                            <li key={item.path} className="menu-item">
                                <NavLink to={item.path} end>{item.name}</NavLink>
                            </li>
                        );
                    }
                    return null; // Permission nahi to kuch mat dikhao.
                }
                
                // 2. Agar item ko permission ki zaroorat nahi hai, to seedha render karo.
                return (
                    <li key={item.path} className="menu-item">
                        <NavLink to={item.path} end>{item.name}</NavLink>
                    </li>
                );
            }
            return null;
        });
    };
    
    if (!user) {
        return (
            <aside className="sidebar">
                <div className="sidebar-header">Loading...</div>
            </aside>
        );
    }

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