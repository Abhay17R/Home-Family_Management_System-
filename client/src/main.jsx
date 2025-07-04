// src/main.jsx

import React, { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import axios from "axios";
import API from './api/axios'

// ✅ NAYA AUR SAHI IMPORT PATH (Aapke file structure ke hisaab se)
import { Context } from "./context/Context.jsx";

const AppWrapper = () => {
  // Authentication, User, aur Theme ke liye States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("dark");
  
  // Loading state taaki page refresh par UI flash na kare
  const [loading, setLoading] = useState(true);

  // Theme badalne wala function
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // App load hote hi user ka login status check karne wala effect
  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        // Backend ke "/me" route ko call karke user ki details maango
        const { data } = await API.get("me", {
          withCredentials: true, // Cookie ko request ke saath bhejega
        });
        
        // Agar response successful hai, to user logged in hai
        setIsAuthenticated(true);
        setUser(data.user);
        setLoading(false); // Check ho gaya, ab loading band karo
      } catch (error) {
        // Agar error aaya (matlab cookie nahi hai ya invalid hai)
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false); // Check ho gaya, ab loading band karo
      }
    };
    
    fetchUserStatus();
  }, []); // [] ka matlab ye sirf ek baar chalega jab app shuru hogi

  // Jab tak loading true hai, tab tak poori App ko rok ke rakho
  if (loading) {
    return <div>Loading...</div>; // Yahan aap ek fancy spinner bhi laga sakte hain
  }

  // Jab loading poori ho jaaye, tab App dikhao
  return (
    <Context.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        user,
        setUser,
        theme,
        toggleTheme,
      }}
    >
      <App />
    </Context.Provider>
  );
};

// App ko render karo
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>
);