// src/App.jsx

import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import {  useAuth } from './hooks/useAuth.js'; // Sahi jagah se import
import { AuthProvider } from "./context/AuthContext.jsx";

// Components & Pages

import Intro from "./pages/intro";
import About from "./pages/About";
import Auth from "./pages/Auth";
import UserProfile from "./pages/dashboard/Userprofile.jsx";
// import Communication from "./pages/dashboard/Communication.jsx";
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
import EducationDashboard from "./pages/dashboard/Education.jsx";
import DashboardHome from "./pages/dashboard/DashboardHome.jsx";
import AnalyticsDashboard from "./pages/dashboard/AnalyticsDashboard.jsx";
import EmergencyAlertSystem from "./pages/dashboard/Emergency.jsx";
import OtpChild from "./pages/dashboard/OtpChild";
import ShoppingAndOrders from "./pages/dashboard/Shopping.jsx"
import { AppFocusProvider } from './context/AppFocusContext.jsx';
import HomeService from './pages/dashboard/homeservice.jsx';

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CommunicationHub from "./pages/dashboard/Communication.jsx";

// AppRoutes component routing aur navigation logic handle karega
const AppRoutes = () => {
  // ✅ STEP 1: Sirf 'useAuth' hook ka istemaal karein
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // ✅ STEP 2: Login ke baad automatic redirection ke liye useEffect
  useEffect(() => {
    // Shuruaati loading poori hone tak intezaar karein
    if (!isLoading) {
        
        // --- LOGIN LOGIC ---
        if (user) {
            // Agar user login ho gaya hai aur woh public page par hai,
            // to use dashboard par bhej do.
            const publicPaths = ['/auth', '/login', '/'];
            if (publicPaths.includes(window.location.pathname)) {
                navigate('/dashboard', { replace: true });
            }
        } 
        
        // --- LOGOUT LOGIC ---
        else {
            // Agar user login nahi hai (yaani logout ho chuka hai)
            // aur woh kisi protected (private) page par hai,
            // to use login page par bhej do.
            if (window.location.pathname.startsWith('/dashboard')) {
                navigate('/login', { replace: true });
            }
        }
    }
}, [user, isLoading, navigate]); // Dependencies


// ✅ Initial loading state handle karna bilkul sahi hai
if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
}
  return (
    // Note: Theme ke liye aapko 'user' object se theme nikalni hogi,
    // ya koi alag context use karna hoga. Abhi ke liye aasan rakhte hain.
    <div className={`app-container`}> 
      
      <Routes>
        {/* ===== PUBLIC ROUTES ===== */}
        {/* Agar user login hai, to in routes se usko dashboard bhej do */}
        <Route path="/" element={!user ? <Intro /> : <Navigate to="/dashboard" replace />} />
        <Route path="/about" element={<About />} />
        <Route path="/intro" element={<Intro />} />
        <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" replace />} />
        <Route path="/otp-verification/:email/:phone" element={<OtpVerification />} />
        <Route path="/password/forgot" element={<ForgotPassword />} />
        <Route path="/password/reset/:token" element={<ResetPassword />} />
        
        {/* ===== PROTECTED DASHBOARD ROUTES ===== */}
        <Route
          path="/dashboard/*"
          element={
            user ? (
              // Ab user object seedha context se aa raha hai, prop ki zaroorat nahi
              <DashboardLayout /> 
            ) : (
              // Agar logged in nahi hai to Auth page par bhej do
              <Navigate to="/auth" replace /> 
            )
          }
        >
          {/* Dashboard ke andar ke saare child routes */}
          <Route index element={<DashboardHome />} />
          <Route path="expenses" element={<HouseHoldExpense />} />
          <Route path="education" element={<EducationDashboard />} />
          <Route path="communication" element={<CommunicationHub />} />
          <Route path="user-profile" element={<UserProfile />} />
          <Route path="orders" element={<ShoppingAndOrders />} />
          <Route path="emergency" element={<EmergencyAlertSystem />} />
          <Route path="location" element={<LocationDashboard />} />
          <Route path="reports" element={<AnalyticsDashboard />} />
          <Route path="security" element={<SecuritySettings />} />
          <Route path="add-member" element={<AddChild />} />
          <Route path="documents" element={<FileManager />} />
          <Route path="manage-members" element={<ManageChildren />} />
          <Route path="otp-child/:email" element={<OtpChild />} />
          <Route path="home-service" element={<HomeService />} />
        </Route>

      </Routes>
      
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={false}
      />
    </div>
  );
};


const App = () => {
  return (
    // ✅ STEP 4: Sirf AuthProvider istemaal karein
    <AuthProvider>
      <AppFocusProvider>
      <Router>
        <AppRoutes />
      </Router>
      </AppFocusProvider>
    </AuthProvider>

  );
};

export default App;