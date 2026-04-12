import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section id="home" className="hero-section">
      <div className="hero-glow"></div>
      <div className="container hero-container">
        <div className="hero-content reveal active">
          <p className="hero-subtitle">Hello, I'm</p>
          <h1 className="hero-title">
            Hafiz Muhammad <span className="gradient-text">Abdullah</span>
          </h1>
          <h2 className="hero-role">Penetration Tester & Cyber Security Expert</h2>
          <p className="hero-description">
            I specialize in web penetration testing, finding security flaws, and reviewing security
            controls. Dedicated to continuous learning and hands-on vulnerability testing to 
            protect digital assets in 2026 and beyond.
          </p>
          <div className="hero-actions">
            <a href="#projects" className="btn btn-primary">View Projects</a>
            <a href="#contact" className="btn btn-outline">Contact Me</a>
          </div>
          
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number gradient-text">3+</span>
              <span className="stat-label">Years of<br/>Dedication</span>
            </div>
            <div className="stat-item">
              <span className="stat-number gradient-text-green">100+</span>
              <span className="stat-label">WPM<br/>Typing</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="scroll-indicator">
        <div className="mouse">
          <div className="wheel"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
