import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import API from "../api/axios";

// 1. Context ko initialize karna default values ke saath
// Isse aapke code ko testing me aur auto-completion me मदद milti hai.
export const Context = createContext({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  user: null,
  setUser: () => {},
  theme: "light",
  toggleTheme: () => {},
  isLoading: true, // Loading state ko bhi default me add kar diya
});

// 2. ContextProvider component jo saari state aur logic ko manage karega
export const ContextProvider = ({ children }) => {
  // === STATE MANAGEMENT ===
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  // Theme ko localStorage se load karne ka logic, taaki refresh karne par theme change na ho
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  // Hamara sabse important state: isLoading
  const [isLoading, setIsLoading] =  useState(true);

  // === API CALL & SESSION MANAGEMENT ===
  // Yeh useEffect app load hote hi user ka session check karega
  useEffect(() => {
    const checkUserSession = async () => {
      setIsLoading(true); // API call shuru hone se pehle loading true
      try {
        // Axios ko withCredentials ke saath call karein taaki cookie (token) jaaye
        const { data } = await API.get("me", {
          withCredentials: true,
        });

        if (data.success && data.user) {
          // Agar server se user mila, to state update karo
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          // Agar server se success: false ya user: null aaya
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        // Agar API call fail ho gayi (e.g., token nahi hai, network error)
        console.error("Session check failed:", error.message);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        // Chahe success ho ya fail, API call poori hone ke baad loading ko false kar do
        setIsLoading(false);
      }
    };

    checkUserSession();
  }, []); // Empty dependency array [] ka matlab hai ki yeh effect sirf ek baar, component ke mount hone par chalega.

  // === THEME MANAGEMENT ===
  // Yeh function theme ko toggle karega
  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      // Nayi theme ko localStorage me save kar do
      localStorage.setItem("theme", newTheme);
      return newTheme;
    });
  }, []);
  
  // Jab bhi theme state badle, body par class laga do taaki CSS kaam kare
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);


  // === PROVIDER VALUE ===
  // Yeh saari values poori app me available hongi
  const contextValue = {
    isAuthenticated,
    setIsAuthenticated,
    user,
    setUser,
    theme,
    toggleTheme,
    isLoading, // isLoading ko yahan se pass karna zaroori hai
  };

  return (
    <Context.Provider value={contextValue}>
      {children}
    </Context.Provider>
  );
};