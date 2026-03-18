import React from 'react';
import { Mail, Linkedin, Github } from 'lucide-react';

export default function Resume() {
  return (
    <div style={{
      background: '#fff',
      color: '#333',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      maxWidth: '950px',
      margin: '0 auto',
      fontFamily: '"Inter", sans-serif',
      textAlign: 'left',
      lineHeight: 1.5
    }}>
      {/* Header */}
      <div style={{ background: '#b4755f', color: '#fff', padding: '2.5rem 2rem', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '2.8rem', letterSpacing: '2px', fontWeight: 400 }}>Muhammad Abdullah</h1>
        <p style={{ margin: '0.5rem 0 0', fontSize: '1.1rem', letterSpacing: '4px', textTransform: 'uppercase', opacity: 0.9 }}>Penetration Tester</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
        {/* Left Column */}
        <div style={{ flex: '2 1 500px', padding: '2.5rem' }}>
          <Section title="ABOUT ME">
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#444' }}>I focus on web penetration testing, testing web applications to find security flaws by understanding application logic, reviewing security controls, and doing hands-on vulnerability testing while continuously improving my skills.</p>
          </Section>

          <Section title="CERTIFICATIONS">
            <ResumeItem 
              title="Web Red Team Analyst (WEB-RTA) – Cyber WarFare"
              subtitle="Certification ID : HV-CAPT-DVG92YR9"
              date="January 2026"
            />
            <ResumeItem 
              title="Certified Associate Penetration Tester (CAPT) – Hack Viser"
              subtitle="Certification ID : 69cb8639257cd5f5"
              date="October 2025"
            />
          </Section>

          <Section title="EXPERIENCE">
            <ResumeItem 
              title="Cyber Security Intern"
              subtitle="Inara Technologies | On-Site"
              date="January 2026 – March 2026"
            >
              <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#444' }}>
                <li style={{ marginBottom: '0.25rem' }}>Completed hands-on training in Linux system administration, networking fundamentals, and Docker containerization.</li>
                <li>Studied cybersecurity principles, access control, firewall/IDS configuration, malware analysis, and web application vulnerabilities (SQL Injection, XSS) with hands-on labs in firewall setup, and vulnerability testing.</li>
              </ul>
            </ResumeItem>
            <ResumeItem 
              title="Cyber Security Intern"
              subtitle="Digital Empowerment Network | Remote"
              date="July 2025 – September 2025"
            >
              <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#444' }}>
                <li>Conducted penetration testing and vulnerability assessments in simulated cyber-attack environments to identify security weaknesses and recommend improvement measures.</li>
              </ul>
            </ResumeItem>
            <ResumeItem 
              title="CTF Organizer & Player"
              subtitle="Self Employed | Remote"
              date="September 2025 - Current"
            >
              <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#444' }}>
                <li>Organized and solved CTF challenges, focusing on offensive and defensive cybersecurity techniques.</li>
              </ul>
            </ResumeItem>
          </Section>

          <Section title="PROJECTS">
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ margin: '0 0 0.25rem', fontSize: '1rem', color: '#222' }}>• Authorized Phishing Awareness Campaign</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#444', paddingLeft: '1rem' }}>Conducted an authorized phishing simulation using Gophish to evaluate real world phishing awareness among students under academic supervision.</p>
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem', fontSize: '1rem', color: '#222' }}>• Deployment of honeypot</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#444', paddingLeft: '1rem' }}>Deployed an SSH honeypot using sshesame in a VirtualBox environment to analyze SSH brute-force attack behavior.</p>
            </div>
          </Section>
        </div>

        {/* Right Column */}
        <div style={{ flex: '1 1 250px', background: '#f4f4f4', padding: '2.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2.5rem' }}>
            <ContactItem icon={<Mail size={16} />} text="abdullahcyberx@gmail.com" />
            <ContactItem icon={<Linkedin size={16} />} text="linkedin.com/in/hafizabdullahx" />
            <ContactItem icon={<Github size={16} />} text="github.com/abdullahcyberx" />
          </div>

          <Section title="EDUCATION">
            <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', color: '#222', fontStyle: 'italic' }}>Bachelors in Cyber Security</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#444' }}>Riphah International University</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#666', fontStyle: 'italic' }}>2024 - 2028 (Expected) | 4th Semester</p>
          </Section>

          <Section title="ACHIEVEMENTS">
            <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.9rem', color: '#444', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>NESCON Fast Typing</li>
              <li>Advent of Cyber 2025 (THM)</li>
              <li>2nd Place Riphah CTF</li>
              <li>2nd Place Islamia Bahawalpur CTF</li>
              <li>CTF Event Organized Riphah University</li>
            </ul>
          </Section>

          <Section title="TOOLS">
            <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.9rem', color: '#444', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Burp Suite</li>
              <li>Nmap</li>
              <li>GoBuster</li>
              <li>WireShark</li>
            </ul>
          </Section>

          <Section title="MORE">
            <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.9rem', color: '#444', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Hafiz-e-Quran</li>
              <li>Vibe Coder</li>
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ 
        color: '#b4755f', 
        fontSize: '1.05rem', 
        letterSpacing: '1.5px', 
        borderBottom: '2px solid rgba(180, 117, 95, 0.3)', 
        paddingBottom: '0.5rem', 
        marginBottom: '1.2rem',
        textTransform: 'uppercase',
        fontWeight: 600
      }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function ResumeItem({ title, subtitle, date, children }: any) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#222', fontWeight: 600 }}>{title}</h4>
        {date && <span style={{ fontSize: '0.85rem', color: '#666', fontStyle: 'italic', whiteSpace: 'nowrap' }}>{date}</span>}
      </div>
      <p style={{ margin: '0.2rem 0 0', fontSize: '0.9rem', color: '#555', fontStyle: 'italic' }}>{subtitle}</p>
      {children}
    </div>
  );
}

function ContactItem({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <span style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        width: '32px', 
        height: '32px', 
        background: '#e5e5e5', 
        borderRadius: '50%', 
        color: '#555'
      }}>
        {icon}
      </span>
      <span style={{ color: '#333', fontSize: '0.9rem' }}>{text}</span>
    </div>
  );
}
