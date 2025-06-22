// src/App.jsx

import React, { useContext, useEffect } from "react";
import "./App.css";
// useNavigate ko BrowserRouter ke andar se use nahi karte, isliye yahan se hata sakte hain.
// AppRoutes component ke andar yeh apne aap context se mil jaata hai.
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OtpChild from "./pages/dashboard/OtpChild";

// Components & Pages
import Intro from "./pages/intro";
import About from "./pages/About";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ManageChildren from "./pages/dashboard/ManageChildren";
import ResetPassword from "./pages/ResetPassword";
import OtpVerification from "./pages/OtpVerification";
import DashboardLayout from "./components/DashboardLayout";
import AddChild from "./pages/dashboard/AddChild";
import HouseHoldExpense from "./pages/dashboard/Expenses.jsx";
import SecuritySettings from "./pages/dashboard/Settings.jsx";
import LocationDashboard from "./pages/dashboard/Location.jsx";
import FileManager from "./pages/dashboard/document.jsx";

import  AnalyticsDashboard from "./pages/dashboard/AnalyticsDashboard.jsx";
import  EmergencyAlertSystem from "./pages/dashboard/Emergency.jsx";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Context } from "./context/Context.jsx";


// Ek simple component jo dashboard ke home par dikhega
const DashboardHome = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h2>Welcome to your Dashboard!</h2>
    <p>Please select an option from the sidebar to continue.</p>
  </div>
);


// AppRoutes component routing ko handle karega
const AppRoutes = () => {
  const { isAuthenticated, user, setUser, setIsAuthenticated, theme } = useContext(Context);

  // NOTE: Yeh useEffect aapko login ke baad /dashboard par bhejta hai.
  // Lekin isse ek problem ho sakti hai: Agar aap /dashboard/add-child par page refresh
  // karenge, toh yeh aapko wapas /dashboard par bhej dega.
  // Behtar tareeka hai ki login successful hone par Auth page se navigate karein.
  useEffect(() => {
    if (isAuthenticated) {
      // Isko abhi ke liye comment kar sakte hain, ya login logic me move kar sakte hain.
      // navigate("/dashboard"); 
    }
  }, [isAuthenticated]);

  // Session check karne wala useEffect bilkul sahi hai.
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await axios.get("http://localhost:4000/api/v1/me", {
          withCredentials: true,
        });
        setUser(data.user);
        setIsAuthenticated(true);
      } catch (err) {
        setUser(null);
        setIsAuthenticated(false);
      }
    };
    getUser();
  }, [setUser, setIsAuthenticated]);

  return (
    <div className={`app-container ${theme}`}>
      <Routes>
        {/* ===== PUBLIC ROUTES ===== */}
        <Route path="/" element={<Intro />} />
        <Route path="/about" element={<About />} />
        <Route path="/intro" element={<Intro />} />
        <Route path="/auth" element={!isAuthenticated ? <Auth /> : <DashboardLayout user={user} theme={theme} />} />
        <Route path="/otp-verification/:email/:phone" element={<OtpVerification />} />
        <Route path="/password/forgot" element={<ForgotPassword />} />
        <Route path="/password/reset/:token" element={<ResetPassword />} />
        
        
        {/* ===== PROTECTED & NESTED DASHBOARD ROUTES ===== */}
        {/* 
          1. Yeh hamara Parent Route hai. Yeh self-closing nahi hai (<Route>...</Route>).
          2. Iska element DashboardLayout hai, jo hamesha dikhega.
          3. Iske andar ke child routes <Outlet/> ki jagah par render honge.
        */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <DashboardLayout
                user={user}
                theme={theme}
              />
            ) : (
              <Auth /> // Agar logged in nahi hai to Auth page par bhej do
            )
          }
        >
          {/* Child Route 1: Default Page. Yeh tab dikhega jab URL sirf /dashboard ho */}
          <Route index element={<DashboardHome />} />
          
          {/* Child Route 2: Add Child Page. URL: /dashboard/add-child */}
          <Route path="expenses"element={<HouseHoldExpense />} />
           <Route path="emergency"element={<EmergencyAlertSystem />} />
           <Route path="location"element={<LocationDashboard/>} />
          <Route path="reports"element={<AnalyticsDashboard/>} />
         
          <Route path="add-child" element={<AddChild />} />
        
          
          <Route path="manage-children" element={<ManageChildren />} /> 
          <Route path="otp-child/:email" element={<OtpChild />} />

          {/* Aap yahan aur bhi child routes daal sakte hain */}
          {/* e.g., <Route path="profile" element={<Profile />} /> */}
        </Route>

      </Routes>
      
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={false}
        theme={theme}
        // toggleTheme prop ToastContainer me nahi hota, isliye hata diya.
      />
    </div>
  );
};


const App = () => {
  return (
    // Router ko sabse top level par rakhein
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;