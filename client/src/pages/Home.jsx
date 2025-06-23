// src/components/Home.jsx (ya jahan bhi aapki file hai)

import React from "react";
import "../styles/Home.css";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";     // ✅ Step 1: useAuth hook import karein
import { useLogout } from "../hooks/useLogout.js"; // ✅ Step 2: useLogout hook import karein

const Home = () => {
  // Step 3: Apne custom hooks se zaroori cheezein nikal lein
  const { user } = useAuth(); // Hum yahan 'user' se check karenge, 'isAuthenticated' se nahi
  const { logout } = useLogout(); // Poora logout logic ab is hook ke andar hai

  // Step 4: Authentication check karein
  // Agar user object nahi hai, to use login/auth page par bhej do
  if (!user) {
    return <Navigate to={"/auth"} replace />;
  }

  // Agar user hai, to "Welcome" message aur logout button dikhayein
  return (
    <>
      <section className="home">
        {/* User ka naam dikhane ke liye aap user.name ya user.firstName use kar sakte hain */}
        <h1>Welcome, {user.firstName || user.name}!</h1>
        
        {/* 'logout' function ab seedha hook se aa raha hai */}
        <button className="logout-button" onClick={logout}>
          Logout
        </button>
      </section>
      
      {/* Footer yahan reh sakta hai agar zaroori hai */}
      {/* <Footer /> */}
    </>
  );
};

export default Home;