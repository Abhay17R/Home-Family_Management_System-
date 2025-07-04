// src/hooks/useLogout.js

import axios from 'axios';
import { useAuth } from './useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api/axios';
export const useLogout = () => {
    const { setUser } = useAuth();
    const navigate = useNavigate(); // ✅ Make sure this is here

    const logout = async () => {
        try {
            // Backend se cookie clear karwayein
            await API.get('logout', {
                withCredentials: true,
            });
            
            // Frontend state ko null karein
            setUser(null);
            
            // Success message dikhayein
            toast.success("Logged out successfully.");
            
            // ✅ --- SABSE ZAROORI LINE --- ✅
            // User ko login page par redirect karein
            navigate('/login', { replace: true }); 

        } catch (error) {
            // Agar logout fail hota hai (jo ki rare hai), to error dikhayein
            // Aur user ko state me wapas daal sakte hain ya kuch nahi kar sakte
            toast.error("Logout failed. Please try again.");
            console.error('Logout error:', error);
        }
    };

    return { logout };
};