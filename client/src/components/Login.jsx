// src/components/Login.jsx

import React, { useState } from "react"; // useState add kiya
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

const Login = ({ setIsLogin }) => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { isSubmitting } } = useForm();
    
    // Naya state server wake-up check karne ke liye
    const [isWakingUpServer, setIsWakingUpServer] = useState(false);

    const handleLogin = async (formData) => {
        // Agar 4 second tak response na aaye, toh message badal do
        const timeoutId = setTimeout(() => {
            setIsWakingUpServer(true);
        }, 4000);

        try {
            const result = await login(formData.email, formData.password);

            if (result.success) {
                toast.success(result.message || "Logged in successfully!");
                // Agar aapka fetchLoggedInUser yahan hai toh call karein, warna useAuth context handle kar lega
                // await fetchLoggedInUser(); 
                navigate('/dashboard', { replace: true });
            } else {
                toast.error(result.message);
            }
        } finally {
            // Request poori hote hi timer hata do aur state reset kar do
            clearTimeout(timeoutId);
            setIsWakingUpServer(false);
        }
    };

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
            
            {/* Yahan Smart Button Logic lagaya hai */}
            <button type="submit" disabled={isSubmitting}>
                {isSubmitting 
                    ? (isWakingUpServer ? "Backend is connecting, please wait (up to 30s)..." : "Logging in...") 
                    : "Login"}
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