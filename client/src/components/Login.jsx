// src/components/Login.jsx

import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

const Login = ({ setIsLogin }) => {
    // Context se sirf 'login' function nikalo
    const { login } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { isSubmitting } } = useForm();

    // Form submit hone par yeh function chalega
    const handleLogin = async (formData) => {
        // Context me banaya gaya login function call karo
        const result = await login(formData.email, formData.password);

        // Result ke hisaab se toast dikhao aur redirect karo
        if (result.success) {
            toast.success(result.message || "Logged in successfully!");
             await fetchLoggedInUser();
            navigate('/dashboard', { replace: true });
        } else {
            toast.error(result.message);
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