// src/components/Login.jsx

import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js"; // ✅ Sirf zaroori hook import kiya

// Yeh prop aap login/signup form switch karne ke liye le rahe hain
const Login = ({ setIsLogin }) => {
  // --- YAHAN SE CHANGES SHURU ---

  // 1. Apne 'useAuth' hook se 'setUser' nikalein.
  // Hum 'navigateTo' ko bhi yahan se hata denge aur App.jsx se handle karenge.
  const { setUser } = useAuth();
  const { fetchLoggedInUser } = useAuth();
  // 2. react-hook-form setup
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  // 3. Login submit handler
  const handleLogin = async (formData) => {
    try {
      // API call
      const { data } = await axios.post(
        "http://localhost:4000/api/v1/login",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      // Agar success hai
      if (data.success) {
        toast.success(data.message || "Logged in successfully!");
        
        // --- Sabse Zaroori Step ---
        // Global AuthContext state ko update karein.
        // Iske baad navigation ka kaam App.jsx mein useEffect karega.
        await fetchLoggedInUser();
        // setUser(data.user);
      }
      
    } catch (error) {
      // Error ko handle karein
      toast.error(error.response?.data?.message || "An error occurred. Please try again.");
    }
  };

  // --- YAHAN TAK CHANGES ---

  return (
    <form className="auth-form" onSubmit={handleSubmit(handleLogin)}>
      <h2>Login</h2>
      
      <div>
        <input 
          type="email" 
          placeholder="Email Address" 
          {...register("email", { required: "Email is required" })} 
        />
      </div>
      
      <div>
        <input 
          type="password" 
          placeholder="Password" 
          {...register("password", { required: "Password is required" })} 
        />
      </div>
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Login"}
      </button>
      
      <div className="bottom-links">
        <p>
          Don't have an account?{" "}
          <span className="link-style" onClick={() => setIsLogin(false)}>
            Sign Up
          </span>
        </p>
        <p>
          <Link to="/password/forgot">Forgot Password?</Link>
        </p>
      </div>
    </form>
  );
};

export default Login;