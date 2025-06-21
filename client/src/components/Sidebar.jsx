// Sidebar.jsx

// ✅ YEH IMPORT BADLA GAYA HAI: `Link` ko add kiya gaya hai
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useLogout } from '../hooks/useLogout.js'; 

const menuItems = [
    { heading: 'General' },
    { name: 'Dashboard / Home', path: '/dashboard', role: ['admin', 'child'] },
    { name: 'User Profile', path: '/dashboard/user-profile', role: ['admin'] },
    { name: 'My Profile', path: '/dashboard/child-profile', role: ['child'] },
    { name: 'Documents & Certificates', path: '/dashboard/documents', role: ['admin', 'child'] },
    
    { heading: 'Finance & Planning' },
    { name: 'Household Expenses', path: '/dashboard/expenses', role: ['admin'] },
    { name: 'Education', path: '/dashboard/education', role: ['admin', 'child'] },
    { name: 'Shopping & Orders', path: '/dashboard/orders', role: ['admin', 'child'] },

    { heading: 'Tools' },
    { name: 'Communication & Collaboration', path: '/dashboard/communication', role: ['admin', 'child'] },
    { name: 'Emergency Alert System', path: '/dashboard/emergency', role: ['admin', 'child'] },
    { name: 'Location Tracking', path: '/dashboard/location', role: ['admin'] },
    
    { heading: 'Oversight' },
    { name: 'Analytics & Dashboard', path: '/dashboard/reports', role: ['admin'] },
    { name: 'Security & Settings', path: '/dashboard/security', role: ['admin', 'child'] },
];

const adminSpecificItems = [
    { heading: 'Admin Specific' },
    { name: 'Manage Children', path: '/dashboard/manage-children', role: ['admin'] },
    { name: 'Add Child', path: '/dashboard/add-child', role: ['admin'] },
];

const Sidebar = ({ user }) => {
    console.log("Sidebar ko mila user prop:", user);
    const navigate = useNavigate();
    const currentUserRole = user?.role;

    const {logout} =useLogout();
    

    const renderMenuItems = (items) => {
        return items.map((item, index) => {
            if (item.heading) {
                const nextItems = items.slice(index + 1);
                const isSectionVisible = nextItems.some(subItem => !subItem.heading && subItem.role.includes(currentUserRole));
                return isSectionVisible ? <li key={index} className="menu-heading">{item.heading}</li> : null;
            }
            if (item.role.includes(currentUserRole)) {
                return (
                    <li key={index} className="menu-item">
                        <NavLink to={item.path} end>
                            {item.name}
                        </NavLink>
                    </li>
                );
            }
            return null;
        });
    };

    return (
        <aside className="sidebar">
            {/* ✅✅✅ YAHAN DIV KI JAGAH LINK USE KIYA GAYA HAI ✅✅✅ */}
            {/* Ab ye page ko refresh nahi karega aur state (login status) zinda rahegi */}
            {/* Aapka intro page root URL (/) par hai, isliye to="/" likha hai */}
            <Link to="/" className="sidebar-header">
                HOME
            </Link>
            
            <ul className="sidebar-menu">
                {renderMenuItems(menuItems)}
                {currentUserRole === 'admin' && renderMenuItems(adminSpecificItems)}
            </ul>
            
            <div className="menu-item">
                 <button onClick={logout} className="logout-button">Logout</button>
            </div>
        </aside>
    );
};

export default Sidebar;