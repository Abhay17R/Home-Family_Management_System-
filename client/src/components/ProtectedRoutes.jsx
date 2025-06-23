// src/components/ProtectedRoute.jsx

import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useContext(AuthContext);

    // Jab tak auth status check ho raha hai, loading dikhayein
    if (loading) {
        return <div>Loading Application...</div>; // Ya ek fancy spinner
    }

    // Agar loading ho chuki hai, aur user authenticated hai, to use andar aane dein
    // <Outlet /> uss route ke child components ko render karega (e.g., DashboardLayout)
    return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;