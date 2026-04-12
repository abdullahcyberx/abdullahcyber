import React from 'react';
import './Projects.css';

const Projects = () => {
  const projects = [
    {
      title: "Authorized Phishing Awareness Campaign",
      description: "Conducted an authorized phishing simulation using Gophish to evaluate real-world phishing awareness among students under academic supervision.",
      tags: ["Gophish", "Social Engineering", "Security Awareness"],
      github: "#"
    },
    {
      title: "Deployment of Honeypot",
      description: "Deployed an SSH honeypot using sshesame in a VirtualBox environment to analyze SSH brute-force attack behavior and understand attacker methodologies.",
      tags: ["sshesame", "VirtualBox", "Network Security", "Threat Analysis"],
      github: "#"
    }
  ];

  return (
    <section id="projects" className="projects-section">
      <div className="container">
        <h2 className="section-title reveal">Featured Projects</h2>
        
        <div className="projects-grid">
          {projects.map((project, index) => (
            <div className="project-card glass-panel reveal" style={{ transitionDelay: `${index * 0.1}s` }} key={index}>
              <div className="project-content">
                <div className="project-header">
                  <div className="folder-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                  <div className="project-links">
                    <a href={project.github} target="_blank" rel="noreferrer" aria-label="GitHub">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                      </svg>
                    </a>
                  </div>
                </div>
                
                <h3 className="project-title">{project.title}</h3>
                <p className="project-desc">{project.description}</p>
                
                <div className="project-tags">
                  {project.tags.map((tag, i) => (
                    <span key={i}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
