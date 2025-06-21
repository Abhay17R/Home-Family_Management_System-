import React, { useContext } from "react";
import "../styles/Home.css";
import { toast } from "react-toastify";
import axios from "axios";
// import { Context } from "../main";
import { Context } from "../context/Context.jsx"; // ✅

import { Navigate, useNavigate } from "react-router-dom";
import Footer from "../layout/Footer";

const Home = () => {
  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(Context);

  const logout = async () => {
    await axios
      .get("http://localhost:4000/api/v1/logout", {
        withCredentials: true,
      })
      .then((res) => {
        toast.success(res.data.message);
        setUser(null);
        setIsAuthenticated(false);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        console.error(err);
      });
  };

  if (!isAuthenticated) {
    return <Navigate to={"/auth"} />;
  }

  return (
    <>
      <section className="home">
        <button onClick={logout}>Logout</button>
      </section>
    </>
  );
};

export default Home;