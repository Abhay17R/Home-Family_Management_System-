// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import API from "../api/axios"

// 1. Context banaya
export const AuthContext = createContext();
const BACKEND_URLL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
//  export let socket = null;

// 2. Socket instance ko context ke bahar rakhein taaki re-renders par reset na ho

let socket;
export const getSocket = () => socket;

// 3. Provider component jo poori app ko wrap karega
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
      const [socketVersion, setSocketVersion] = useState(0);
    const [dashboardVersion, setDashboardVersion] = useState(0);
    // --- FUNCTION 1: LOGIN LOGIC ---
    // Yeh function Login component se call hoga
    const login = async (email, password) => {
        try {
            const { data } = await API.post('login', { email, password }, {
                withCredentials: true,
            });

            if (data.success) {
                // User state ko backend se mile poore data se update karo
                setUser(data.user);
                // Login component ko success ka signal do
                return { success: true, message: data.message };
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
            // Login component ko error ka signal do
            return { success: false, message: errorMessage };
        }
    };
    
    // --- FUNCTION 2: LOGOUT LOGIC ---
    // Yeh function logout button se call hoga
   
    const logout = async () => {
        try {
            await axios.get('http://localhost:4000/api/v1/logout', { withCredentials: true });
        } catch (error) {
            console.error("Logout API call failed, but logging out on client-side anyway.");
        } finally {
            // Har haal me client-side par logout karo
            setUser(null); // User state ko null karo
            // Socket disconnect karne ka kaam ab neeche wala useEffect karega
        }
    };

    // --- FUNCTION 3: USER DATA KO DOBARA FETCH KARNE KE LIYE ---
    // Yeh function real-time update ke liye istemal hoga
    const fetchLoggedInUser = async () => {
        try {
            const { data } = await API.get('me', { withCredentials: true });
            if (data.success) {
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.log("Fetch user failed, setting user to null.");
            setUser(null);
        }
    };

    // --- EFFECT #1: SIRF INITIAL PAGE LOAD KE LIYE ---
    // Yeh useEffect sirf ek baar chalega jab app load hogi
    useEffect(() => {
        const initialLoad = async () => {
            setIsLoading(true);
            await fetchLoggedInUser(); // Pehle user ka data fetch karo
            setIsLoading(false);
        };
        initialLoad();
    }, []);

    // --- EFFECT #2: SOCKET CONNECTION AUR REAL-TIME EVENTS KE LIYE ---
    // Yeh effect tab chalega jab 'user' state badlegi (yaani login ya logout hone par)
    useEffect(() => {
        // Step A: Agar user logged in hai, tabhi socket connection banayein
        if (user) {
            // Purana connection (agar ho) band karein
            if (socket) socket.disconnect();
            
            // Naya connection banayein
            socket = io(BACKEND_URLL, { withCredentials: true });
            setSocketVersion(prevVersion => prevVersion + 1);

            socket.on('connect', () => console.log(`✅ Socket connected for user: ${user.name}`));

            // --- YAHAN REAL-TIME UPDATE KA LOGIC HAI ---
            // 'userUpdated' event ko suno (jaise permission change)
            socket.on('userUpdated', () => {
                console.log('🔥 Real-time "userUpdated" event mila! Data dobara fetch kar raha hoon...');
                fetchLoggedInUser();
            });

            // 'dashboardUpdate' event ko suno (jaise online status change)
            // Iske liye aapko AnalyticsDashboard.jsx me badlav karna hoga, jo humne pehle discuss kiya tha
            socket.on('dashboardUpdate', () => {
                console.log('🔥 Real-time "dashboardUpdate" event mila! Triggering refresh.');
                // Yahan state update karne se dashboard refresh hoga
                setDashboardVersion(prevVersion => prevVersion + 1); 
            });



            // Cleanup function
            return () => {
                if (socket) {
                    socket.off('userUpdated');
                    socket.off('dashboardUpdate');
                    socket.disconnect();
                }
            };
        } 
        // Step B: Agar user logout ho jaata hai (user null ho jaata hai)
        else {
            if (socket) {
                socket.disconnect();
                console.log("❌ User logged out, socket disconnected.");
            }
        }
    }, [user]); // Yeh effect `user` object par depend karta hai

    // Sabhi zaroori cheezein value prop se poori app ko do
   const value = { user, isLoading, login, logout, fetchLoggedInUser, setUser, socketVersion,dashboardVersion };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};