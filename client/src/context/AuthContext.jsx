// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// 1. Context banaya aur EXPORT kiya taaki hook use kar sake
export const AuthContext = createContext();

// 2. Provider Component banaya
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const fetchLoggedInUser = async () => {
        setIsLoading(true);
        try {
            const { data } = await axios.get('http://localhost:4000/api/v1/me', {
                withCredentials: true,
            });
            if (data.success) {
                setUser(data.user);
            }
        } catch (error) {
            console.log("No logged in user found or token expired.");
            setUser(null); // Error ke case me user ko null set karna acchi practice hai
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLoggedInUser();
    }, []);

    const value = {
        user,
        setUser,
        isLoading,
        fetchLoggedInUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
