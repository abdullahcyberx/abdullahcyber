import React from 'react';
import './Experience.css';

const Experience = () => {
  const experiences = [
    {
      role: "Cyber Security Intern",
      company: "Inara Technologies",
      date: "Jan 2026 - Mar 2026",
      location: "On-Site",
      points: [
        "Completed hands-on training in Linux system administration, networking fundamentals, and Docker containerization.",
        "Studied cybersecurity principles, access control, firewall/IDS configuration, and malware analysis.",
        "Performed hands-on vulnerability testing (SQL Injection, XSS) and firewall setup labs."
      ]
    },
    {
      role: "Cyber Security Intern",
      company: "Digital Empowerment Network",
      date: "Jul 2025 - Sep 2025",
      location: "Remote",
      points: [
        "Conducted penetration testing and vulnerability assessments in simulated cyber-attack environments.",
        "Identified security weaknesses and recommended effective improvement measures."
      ]
    },
    {
      role: "CTF Organizer & Player",
      company: "Self Employed",
      date: "Sep 2025 - Current",
      location: "Remote",
      points: [
        "Organized and solved CTF challenges, focusing on both offensive and defensive cybersecurity techniques.",
        "Secured 2nd Place in Riphah CTF and Islamia Bahawalpur CTF."
      ]
    }
  ];

  const certifications = [
    {
      title: "Web Red Team Analyst (WEB-RTA)",
      issuer: "Cyber WarFare",
      date: "January 2026",
      id: "69cb8639257cd5f5"
    },
    {
      title: "Certified Associate Penetration Tester (CAPT)",
      issuer: "Hack Viser",
      date: "October 2025",
      id: "HV-CAPT-DVG92YR9"
    }
  ];

  return (
    <section id="experience" className="experience-section">
      <div className="container">
        <h2 className="section-title reveal">Experience & Certifications</h2>
        
        <div className="resume-grid">
          <div className="experience-column reveal">
            <h3 className="column-title">Work Experience</h3>
            <div className="timeline">
              {experiences.map((exp, index) => (
                <div className="timeline-item" key={index}>
                  <div className="timeline-dot"></div>
                  <div className="timeline-content glass-panel">
                    <div className="timeline-header">
                      <h4>{exp.role}</h4>
                      <span className="date">{exp.date}</span>
                    </div>
                    <div className="timeline-company">
                      {exp.company} <span>• {exp.location}</span>
                    </div>
                    <ul className="timeline-points">
                      {exp.points.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="certifications-column reveal" style={{ transitionDelay: '0.2s' }}>
            <h3 className="column-title">Certifications & Education</h3>
            
            <div className="cert-list">
              {certifications.map((cert, index) => (
                <div className="cert-card glass-panel" key={index}>
                  <div className="cert-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </div>
                  <div className="cert-details">
                    <h4>{cert.title}</h4>
                    <p className="cert-issuer">{cert.issuer} • {cert.date}</p>
                    <p className="cert-id">ID: {cert.id}</p>
                  </div>
                </div>
              ))}
              
              <div className="cert-card glass-panel edu-card" style={{ marginTop: '2rem' }}>
                <div className="cert-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                </div>
                <div className="cert-details">
                  <h4>Bachelor of Cyber Security</h4>
                  <p className="cert-issuer">Riphah International University</p>
                  <p className="cert-id" style={{ color: 'var(--accent-green)' }}>Expected Completion: 2028</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
