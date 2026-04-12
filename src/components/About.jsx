import React from 'react';
import './About.css';

const About = () => {
  return (
    <section id="about" className="about-section">
      <div className="container">
        <h2 className="section-title reveal">About Me</h2>
        
        <div className="about-grid">
          <div className="about-text glass-panel reveal">
            <h3>My Journey</h3>
            <p>
              Hey! I am Hafiz Muhammad Abdullah, a passionate Penetration Tester. I focus on web penetration testing, identifying security flaws by understanding application logic and reviewing security controls.
            </p>
            <p>
              I take pride in my hands-on vulnerability testing approach, ensuring that web applications are secure against emerging threats. Being a "Vibe Coder" with a 100+ WPM typing speed allows me to work efficiently in fast-paced environments.
            </p>
            <p>
              I am also a Hafiz-e-Quran, bringing discipline and dedication to my professional cyber security career. Currently, I am pursuing my Bachelor of Cyber Security at Riphah International University (Expected 2028).
            </p>
          </div>
          
          <div className="about-skills glass-panel reveal" style={{ transitionDelay: '0.2s' }}>
            <h3>Core Capabilities</h3>
            
            <div className="skill-category">
              <h4>Tools & Platforms</h4>
              <div className="tags">
                <span className="tag">Burp Suite</span>
                <span className="tag">Nmap</span>
                <span className="tag">GoBuster</span>
                <span className="tag">WireShark</span>
                <span className="tag">Linux</span>
                <span className="tag">Docker</span>
              </div>
            </div>
            
            <div className="skill-category">
              <h4>Expertise</h4>
              <div className="tags">
                <span className="tag tag-alt">Web Vuln Testing</span>
                <span className="tag tag-alt">SQL Injection</span>
                <span className="tag tag-alt">XSS</span>
                <span className="tag tag-alt">Firewall / IDS</span>
                <span className="tag tag-alt">Malware Analysis</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
