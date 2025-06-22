// About.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
// import './about.css';
import "../styles/about.css";
import creator from'../img/creator.png'
// import creator2 from'../img/creator2.png'


import { FiArrowLeft, FiSun, FiMoon } from 'react-icons/fi';
import { 
  FaBullseye, FaStar, FaUserGraduate, FaLinkedin, FaGithub,
  FaFileInvoiceDollar, FaUserGraduate as FaEdu, FaShoppingCart, FaComments, FaExclamationTriangle, FaMapMarkedAlt
} from 'react-icons/fa';

// Data for the key features section to keep the JSX clean
const featuresList = [
  { Icon: FaFileInvoiceDollar, text: "Expense Tracking" },
  { Icon: FaEdu, text: "Education Management" },
  { Icon: FaShoppingCart, text: "Shopping & Orders" },
  { Icon: FaComments, text: "Family Communication" },
  { Icon: FaExclamationTriangle, text: "Emergency Alerts" },
  { Icon: FaMapMarkedAlt, text: "Live Location Sharing" },
];

// Reusable animated section component
const AnimatedSection = ({ children, className }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <section ref={ref} className={`${className} about-section ${inView ? 'visible' : ''}`}>
      {children}
    </section>
  );
};


const About = () => {
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className={`about-us-container ${theme}`}>
      <header className="about-header">
        <Link to="/" className="back-home-btn">
          <FiArrowLeft />
          Back to Home
        </Link>
        <button onClick={toggleTheme} className="theme-toggle-btn">
          {theme === 'light' ? <FiMoon /> : <FiSun />}
        </button>
      </header>

      <main className="about-main">
        <div className="about-hero">
          <h1>The Heart of <span>HOME</span></h1>
          <p className="hero-subtitle">
            This Family Management System is a comprehensive digital platform designed to simplify and efficiently manage the daily activities and responsibilities of every family member.
          </p>
        </div>

        <AnimatedSection className="mission-section">
          <div className="mission-icon">
            <FaBullseye />
          </div>
          <div className="mission-text">
            <h2>Our Mission</h2>
            <p>
              Our mission is to provide a smart and user-friendly system where family members can 
              manage household expenses, education details, shopping orders, reminders, and 
              communication all in one place. This helps save both time and effort for the entire family.
            </p>
          </div>
        </AnimatedSection>
        
        <AnimatedSection className="features-overview">
          <h2>Key Features at a Glance</h2>
          <div className="features-grid-about">
            {featuresList.map((feature, index) => (
              <div key={index} className="feature-item-card">
                <feature.Icon className="feature-item-icon" />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection className="creator-section">
          <h2>About the <span>Creator</span></h2>
          <div className="creator-card">
            <div className="creator-photo-wrapper">
              {/* IMPORTANT: Replace with your actual photo URL! */}
              <img 
                src={creator} 
                alt="Abhay Kumar Jha" 
                className="creator-photo"
              />
            </div>
            <div className="creator-info">
              <h3>Abhay Kumar Jha</h3>
              <p className="creator-bio">
                A passionate Computer Science Engineering (CSE) student at 
                <strong> Motilal Nehru National Institute of Technology, Allahabad</strong>.
                Driven by a love for building practical solutions that make a real-world impact.
              </p>
              <div className="creator-socials">
                <a href="https://www.linkedin.com/in/abhay-kumar-jha-a1a9b9303/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <FaLinkedin />
                </a>
                <a href="https://github.com/Abhay17R" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <FaGithub />
                </a>
              </div>
            </div>
          </div>
        </AnimatedSection>

      </main>

      <footer className="about-footer">
        © {new Date().getFullYear()} HOME - The Family Management System | Developed with ❤️ by Abhay Kumar Jha
      </footer>
    </div>
  );
};

export default About;