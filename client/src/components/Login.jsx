// src/components/Login.jsx

import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
// import { Context } from "../main";
import { Context } from "../context/Context.jsx"; // ✅

import { Link, useNavigate } from "react-router-dom";

// ✅ Accept setIsLogin as a prop
const Login = ({ setIsLogin }) => {
  const { setIsAuthenticated, setUser } = useContext(Context);
  const navigateTo = useNavigate();
  const { register, handleSubmit } = useForm();

  // Aapka backend logic bilkul safe hai
  const handleLogin = async (data) => {
    
    try {
      const res = await axios.post("http://localhost:4000/api/v1/login", data, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      toast.success(res.data.message);
      setIsAuthenticated(true);
      setUser(res.data.user);
      console.log("Login response user:", res.data.user);

      // navigateTo("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login Failed");
    }
  };

  return (
    // Iske andar koi container div nahi hai, sirf form hai
    <form className="auth-form" onSubmit={handleSubmit(handleLogin)}>
      <h2>Login</h2>
      <div>
        <input type="email" placeholder="Email Address" {...register("email", { required: true })} />
      </div>
      <div>
        <input type="password" placeholder="Password" {...register("password", { required: true })} />
      </div>
      <button type="submit">Login</button>
      <div className="bottom-links">
        <p>
          Don't have an account?{" "}
          {/* ✅ Is link se ab form switch hoga */}
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