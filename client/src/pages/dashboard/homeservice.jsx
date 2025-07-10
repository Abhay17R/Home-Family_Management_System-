// src/components/HomeServices.jsx

import React from 'react';
import '../../styles/Dashboard/homeServices.css'// Hum iski CSS file abhi banayenge

// Services ki list, isse manage karna aasan hoga
const services = [
  { name: 'Plumber', icon: 'fa-solid fa-wrench' },
  { name: 'Electrician', icon: 'fa-solid fa-bolt' },
  { name: 'Home Cleaning', icon: 'fa-solid fa-broom' },
  { name: 'Doctor on Call', icon: 'fa-solid fa-user-doctor' },
  { name: 'Tutor', icon: 'fa-solid fa-graduation-cap' },
  { name: 'Appliance Repair', icon: 'fa-solid fa-blender' },
  { name: 'Carpenter', icon: 'fa-solid fa-hammer' },
  { name: 'Painting', icon: 'fa-solid fa-paint-roller' }
];

const HomeServices = () => {
  return (
    <div className="home-services-container">
      <div className="services-header">
        <h2>Your One-Stop Solution for Home Services</h2>
        <p>
          Need a helping hand? From fixing a leaky tap to finding a reliable doctor, 
          we connect you with trusted professionals for every need.
        </p>
      </div>

      <div className="services-grid">
        {services.map((service, index) => (
          <div key={index} className="service-card">
            <i className={service.icon}></i>
            <h3>{service.name}</h3>
          </div>
        ))}
      </div>

      <div className="cta-section">
        <p>And many more services available...</p>
        <a 
          href="https://servicelink-gules.vercel.app/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="cta-button"
        >
          Explore All Services & Book Now
        </a>
      </div>
    </div>
  );
};

export default HomeServices;