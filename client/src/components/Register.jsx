import React, { useContext } from "react";
import { useForm } from "react-hook-form";
// import { Context } from "../main";
import { Context } from "../context/Context.jsx"; 

// import { Context } from "./context/Context.jsx";
import { useNavigate } from "react-router-dom";
// import axios from "axios";
import API from "../api/axios"
import { toast } from "react-toastify";

const countryCodes = [
  { code: "+91", name: "India" },
  { code: "+92", name: "Pakistan" },
  { code: "+1", name: "USA/Canada" },
  { code: "+44", name: "UK" },
  { code: "+977", name: "Nepal" },
  { code: "+61", name: "Australia" },
];

const Register = ({ setIsLogin }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      verificationMethod: "email",
      countryCode: "+91",
      role: "admin" // default role
    }
  });
  const navigateTo = useNavigate();

  const handleRegister = async (data) => {
    data.phone = `${data.countryCode}${data.phone}`;

    try {
      const res = await API.post(
        "register",
        data,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      toast.success(res.data.message);
      navigateTo(`/otp-verification/${data.email}/${data.phone}`);
    } catch (error) {
      // toast.error(error.response?.data?.message || "Registration failed");
      console.log(error);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit(handleRegister)}>
      <h2>Create Account</h2>

      <div>
        <input
          type="text"
          placeholder="Full Name"
          {...register("name", { required: "Name is required." })}
        />
        {errors.name && <p className="error-message">{errors.name.message}</p>}
      </div>

      <div>
        <inputzz
          type="email"
          placeholder="Email Address"
          {...register("email", { required: "Email is required." })}
        />
        {errors.email && <p className="error-message">{errors.email.message}</p>}
      </div>

      <div className="phone-input-group">
        <select {...register("countryCode", { required: true })}>
          {countryCodes.map((c) => (
            <option key={c.code} value={c.code} title={c.name}>
              {c.code}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Phone Number"
          {...register("phone", { required: "Phone number is required." })}
        />
      </div>
      {(errors.phone || errors.countryCode) && (
        <p className="error-message">Please provide a valid phone number.</p>
      )}

      {/* Hidden role input */}
      <input type="hidden" value="user" {...register("role")} />

      <div>
        <input
          type="password"
          placeholder="Password"
          {...register("password", { required: "Password is required." })}
        />
        {errors.password && (
          <p className="error-message">{errors.password.message}</p>
        )}
      </div>

      <div className="verification-method">
        <p>Choose OTP verification method:</p>
        <div className="wrapper">
          <input
            type="radio"
            id="verify-email"
            value="email"
            {...register("verificationMethod")}
          />
          <label htmlFor="verify-email">Email</label>

          <input
            type="radio"
            id="verify-phone"
            value="phone"
            {...register("verificationMethod")}
          />
          <label htmlFor="verify-phone">Phone</label>
        </div>
      </div>

      <button type="submit" className="btn-register-submit">
        Register
      </button>

      <div className="bottom-links">
        <p>
          Already have an account?{" "}
          <span className="link-style" onClick={() => setIsLogin(true)}>
            Log In
          </span>
        </p>
      </div>
    </form>
  );
};

export default Register;
