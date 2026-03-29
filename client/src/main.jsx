// src/main.jsx

import React, { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import axios from "axios";
import API from './api/axios';

import { Context } from "./context/Context.jsx";

const AppWrapper = () => {
  // Authentication, User, aur Theme ke liye States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("dark");

  // Theme badalne wala function
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // App load hote hi user ka login status check karne wala effect
  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const { data } = await API.get("me", {
          withCredentials: true, 
        });
        
        setIsAuthenticated(true);
        setUser(data.user);
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
      }
      // Yahan se setLoading(false) poori tarah hata diya hai!
    };
    
    fetchUserStatus();
  }, []); 

  // Jab backend load ho raha hoga, tab bhi normal App dikhegi
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