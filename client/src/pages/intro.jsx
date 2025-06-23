// Intro.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js"; // ✅ STEP 1: Naya, sahi hook import kiya

import "./intro.css";
import { FiSun, FiMoon, FiArrowDownCircle } from 'react-icons/fi';
import { 
  FaChartPie, FaGraduationCap, FaShoppingCart, FaComments, FaMapMarkedAlt, FaExclamationTriangle,
  FaFolderOpen, FaNotesMedical, FaVoteYea
} from 'react-icons/fa';
import { useInView } from 'react-intersection-observer';

// --- FEATURE DATA (No Changes Here) ---
const featureData = [
  // ... (Aapka poora featureData jaisa tha waisa hi hai)
  {
    id: "expense",
    Icon: FaChartPie,
    title: "Expense Tracking",
    description: "Managing household expenses has never been easier. Add, edit, and categorize all your monthly bills including electricity, water, rent, and groceries. Seamlessly split expenses among family members, ensuring transparency. Real-time summaries and charts help you monitor spending and stay within budget, with reminders so you never miss a due date."
  },
  {
    id: "education",
    Icon: FaGraduationCap,
    title: "Education Hub",
    description: "Keep track of every child’s academic journey with ease. Manage school details, track fee payments, and organize assignments and exams with customizable reminders. Share study materials and monitor progress reports, fostering a collaborative learning environment that empowers both parents and children."
  },
  {
    id: "shopping",
    Icon: FaShoppingCart,
    title: "Group Shopping",
    description: "Shop smartly and save together. Create and share wishlists, place group orders, and track deliveries in real-time. This feature helps avoid duplicate purchases, manage payment contributions, and plan for special occasions by centralizing what everyone needs. Shopping becomes a coordinated family activity."
  },
  {
    id: "chat",
    Icon: FaComments,
    title: "Family Chat",
    description: "Stay connected with our secure and private family chat. Share updates, reminders, photos, and important information instantly. Create group or one-on-one conversations to coordinate events, discuss expenses, or simply stay in touch. End-to-end encryption ensures your family's communication remains private."
  },
  {
    id: "location",
    Icon: FaMapMarkedAlt,
    title: "Live Location",
    description: "Keep an eye on your loved ones’ whereabouts in real-time for enhanced safety. Set geofences to get notifications when a family member arrives at or leaves key locations like home or school. With user consent and privacy controls, this feature provides peace of mind for the whole family."
  },
  {
    id: "emergency",
    Icon: FaExclamationTriangle,
    title: "Emergency Alerts",
    description: "In critical situations, a single tap sends an SOS signal to all family members with your current location. The alert triggers a loud sound, instant app notifications, and SMS messages, ensuring that help is just a tap away. This system is designed for speed, reliability, and ultimate safety."
  },
  {
    id: "documents",
    Icon: FaFolderOpen,
    title: "Digital Document Vault",
    description: "Securely store all your important family documents in one place. From Aadhaar and PAN cards to birth certificates and property papers, our encrypted vault ensures your sensitive information is protected with bank-grade security. With role-based access control, you decide who can view or manage specific documents, providing both convenience and peace of mind. Never scramble for a document again."
  },
  {
    id: "health",
    Icon: FaNotesMedical,
    title: "Health & Medical Records",
    description: "Take proactive control of your family's well-being. This feature allows you to maintain a centralized record of each member's health information, including medical reports, allergies, and vaccination history. Set up customizable medicine reminders to ensure no dose is missed, and schedule doctor's appointments directly within the app. It's your family's digital health assistant."
  },
  {
    id: "polls",
    Icon: FaVoteYea,
    title: "Polls & Voting System",
    description: "Make family decisions fun, fair, and democratic. Whether you're deciding on a vacation destination, a movie for the weekend, or what to have for dinner, our polling system makes it easy. Create polls in seconds, allow for anonymous voting to get honest opinions, and watch the results come in live. It's the perfect way to ensure everyone's voice is heard."
  }
];

// --- FEATURE SECTION COMPONENT (No Changes Here) ---
const FeatureSection = ({ id, Icon, title, description, index }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  const isReversed = index % 2 !== 0;
  return (
    <section 
      id={id} 
      ref={ref} 
      className={`feature-section ${isReversed ? 'reversed' : ''} ${inView ? 'visible' : 'hidden'}`}
    >
      <div className="feature-icon-wrapper">
        <Icon className="feature-icon" />
      </div>
      <div className="feature-text-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </section>
  );
};


// --- INTRO COMPONENT (Only Auth Logic Changed) ---
const Intro = () => {
  const [theme, setTheme] = useState("dark");
  const [isHeroAnimated, setIsHeroAnimated] = useState(false);
  
  // ✅ STEP 2: Naye hook se 'user' object nikaalo
  const { user } = useAuth();

  // Baaki saare useEffects aur functions waise ke waise hi hain
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHeroAnimated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={`home-container ${theme}`}>
      <header className="home-header">
        <h1>HOME</h1>
        <div className="header-controls">
          
          {/* ✅ STEP 3: Header mein 'isAuthenticated' ki jagah 'user' ka istemaal karo */}
          {user ? (
            // Agar user object hai (logged in hai), to "Dashboard" button dikhao
            <Link to="/dashboard" className="btn btn-primary">Dashboard</Link>
          ) : (
            // Agar nahi (null hai), to "Login" button dikhao
            <Link to="/auth" className="btn btn-secondary">Login</Link>
          )}

          <Link to="/about" className="btn btn-secondary">About Us</Link>
          <button onClick={toggleTheme} className="theme-toggle-btn">
            {theme === 'light' ? <FiMoon /> : <FiSun />}
          </button>
        </div>
      </header>

      {/* --- MAIN CONTENT (No Changes Here) --- */}
      <main className="home-main">
        <div className={`hero-section ${isHeroAnimated ? 'is-animated' : ''}`}>
          <h2 className="hero-title">Welcome to <span>HOME</span></h2>
          <p className="subheading hero-subtitle">
            Organize your family life smartly: Track expenses, education, tasks, and much more.
          </p>
          <button className="cta-button hero-cta" onClick={() => scrollToSection('features-start')}>
            Explore Features <FiArrowDownCircle />
          </button>
        </div>

        <div className="features-grid">
          {featureData.map(feature => (
            <div className="feature-card" key={feature.id} onClick={() => scrollToSection(feature.id)}>
              <feature.Icon />
              {feature.title}
            </div>
          ))}
        </div>
        
        <div id="features-start" className="feature-descriptions">
          {featureData.map((feature, index) => (
            <FeatureSection 
              key={feature.id}
              id={feature.id}
              Icon={feature.Icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </main>

      {/* --- FOOTER (No Changes Here) --- */}
      <footer className="home-footer">
        © {new Date().getFullYear()} HOME - The Family Management System | Developed with ❤️ by Abhay Kumar Jha {" "}
      </footer>
    </div>
  );
};

export default Intro;