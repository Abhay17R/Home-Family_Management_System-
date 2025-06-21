// src/hooks/useAuth.js

import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../context/Context"; // Sahi path check kar lein

// Yeh hamara custom hook hai
export const useLogout = () => {
    // Hook ke andar hum doosre hooks use kar sakte hain
    const { setIsAuthenticated, setUser } = useContext(Context);
    const navigate = useNavigate();

    // Hum logout logic ko ek function mein daal denge
    const logout = async () => {
        try {
            const res = await axios.get("http://localhost:4000/api/v1/logout", {
                withCredentials: true,
            });
            toast.success(res.data.message);
            // Global state update karein
            setUser(null);
            setIsAuthenticated(false);
            // User ko redirect karein
            navigate('/intro'); 
        } catch (err) {
            toast.error(err.response.data.message || "Logout failed");
            console.error(err);
        }
    };

    // Hum is hook se 'logout' function ko return karenge
    return { logout }; 
    // Isse future mein login, register jaise functions bhi return kar sakte hain
    // return { login, logout, register };
};