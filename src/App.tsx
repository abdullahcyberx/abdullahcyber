import React, { useState, useEffect, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Resume from './components/Resume';

// --- Components ---

const TypewriterText = ({ text, style }: { text: string, style?: React.CSSProperties }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.substring(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 70);
    return () => clearInterval(interval);
  }, [text]);

  return <span className="typing" style={style}>{displayedText}</span>;
};

const ProCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--x", `${x}px`);
    e.currentTarget.style.setProperty("--y", `${y}px`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`pro-card ${className}`} 
      onMouseMove={handleMouseMove}
    >
      {children}
    </motion.div>
  );
};

const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`glass-card ${className}`}
    >
      {children}
    </motion.div>
  );
};

const PrimaryBtn = ({ children, onClick, className = "" }: { children: React.ReactNode, onClick?: () => void, className?: string }) => {
  const [ripples, setRipples] = useState<{x: number, y: number, id: number}[]>([]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipples([...ripples, { x, y, id: Date.now() }]);
    if (onClick) onClick();
  };

  return (
    <button className={`primary-btn ${className}`} onClick={handleClick}>
      {children}
      {ripples.map(r => (
        <span key={r.id} style={{ left: r.x, top: r.y }} onAnimationEnd={() => setRipples(ripples.filter(rip => rip.id !== r.id))} />
      ))}
    </button>
  );
};


const HeroHeader = ({ isScrolled, handleSmoothScroll }: { isScrolled: boolean, handleSmoothScroll: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { id: "certs", label: "Certifications" },
    { id: "resume", label: "Resume" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <>
      {/* Header */}
      <motion.header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 1000,
          display: "flex",
          justifyContent: "center", // center logo
          alignItems: "center",
          padding: isScrolled ? "0.8rem 2rem" : "1.5rem 2rem",
          background: isScrolled ? "rgba(5,5,5,0.85)" : "transparent",
          backdropFilter: isScrolled ? "blur(12px)" : "none",
          borderBottom: isScrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
          transition: "all 0.3s ease-in-out",
          flexDirection: "column",
        }}
      >
        {/* Logo / Name */}
        <motion.div
          style={{
            cursor: "pointer",
            fontWeight: 500,
            letterSpacing: "6px",
            textTransform: "uppercase",
            color: "#fff",
            fontFamily: "'Poppins', sans-serif", // aesthetic font
            fontSize: isScrolled ? "2rem" : "2.8rem",
            marginBottom: "1rem",
          }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          Muhammad Abdullah
        </motion.div>

        {/* Navigation (optional desktop only) */}
        <nav
          style={{
            display: "flex",
            gap: "2rem",
            justifyContent: "center",
            marginBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleSmoothScroll(e, item.id)}
              style={{
                letterSpacing: "2px",
                textTransform: "uppercase",
                fontSize: "0.85rem",
                color: "#fff",
                fontFamily: "'Roboto', sans-serif",
                transition: "color 0.2s",
                textDecoration: "none"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#0ff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#fff")}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </motion.header>

      {/* Hero Section */}
      <section
        id="hero"
        style={{
          paddingTop: "160px", // leave space for fixed header
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2rem", // spacing between name and title
        }}
      >
        <ProCard>
          <h1 style={{ 
            fontSize: '1.8rem', 
            textAlign: 'center', 
            color: '#0ff', 
            margin: '0', 
            fontFamily: "'Roboto Mono', monospace", 
            letterSpacing: '1px' 
          }}>
            Cybersecurity Student & Penetration Tester
          </h1>
          <p
            style={{
              fontSize: "1.05rem",
              color: "#ccc",
              textAlign: "center",
              marginTop: "1rem",
              maxWidth: "600px",
              lineHeight: 1.6,
            }}
          >
            Cybersecurity student specializing in web penetration testing, vulnerability discovery, and CTF competitions.
          </p>
        </ProCard>
      </section>
    </>
  );
};

const certsData = [
  { title: "Web Red Team Analyst", provider: "Cyber WarFare", date: "Jan 2026", file: "/certificates/CyberWarfare/WEB READ TEAM ANALYST.pdf" },
  { title: "Certified Associate Penetration Tester", provider: "Hack Viser", date: "Oct 2025", file: "/certificates/HACKVISER/capt hackviser.pdf" },
  { title: "ISC2 Certified in Cybersecurity", provider: "ISC2", date: "", file: "/certificates/Isc 2 Coursea.pdf" },
  { title: "Certified Red Team Operations Management", provider: "Red Team Leaders", date: "", file: "/certificates/Red Team Leaders/Certified Red Team Operations Management (CRTOM).pdf" },
  { title: "ICS/SCADA Certificate", provider: "Red Team Leaders", date: "", file: "/certificates/Red Team Leaders/ics_scada_certificate .pdf" },
  { title: "C++ Advanced", provider: "Cisco", date: "", file: "/certificates/cisco/C++ Advamced.pdf" },
  { title: "C++ Essential", provider: "Cisco", date: "", file: "/certificates/cisco/c++ essential cisco.pdf" },
  { title: "Cyber Security Essential", provider: "Cisco", date: "", file: "/certificates/cisco/cyber security essential.pdf" },
  { title: "Intro to Cyber", provider: "Cisco", date: "", file: "/certificates/cisco/intro to cyber cisco.pdf" },
  { title: "Intro to IoT", provider: "Cisco", date: "", file: "/certificates/cisco/intro to iot cisco.pdf" },
  { title: "IT Essential", provider: "Cisco", date: "", file: "/certificates/cisco/it essential cisco.pdf" },
  { title: "Network Defense", provider: "Cisco", date: "", file: "/certificates/cisco/network defense cisco.pdf" },
  { title: "CPPS", provider: "Hack and Fix", date: "", file: "/certificates/hack and fix/CPPS.pdf" },
  { title: "Urdu Course Cyber Sec", provider: "Urdu Course", date: "", file: "/certificates/urdu course cyber sec.pdf" }
];

const achievementsData = [
  { title: "NESCON Fast Typing", provider: "NESCON", date: "", file: "/certificates/nescon fast typing.pdf" },
  { title: "Advent Of Cyber 2025", provider: "TryHackMe", date: "Dec 2025", file: "/certificates/try hack me/Advent Of Cyber 2025.pdf" }
];

export default function App() {
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAllCerts, setShowAllCerts] = useState(false);

  const visibleCerts = showAllCerts ? certsData : certsData.slice(0, 2);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const headerOffset = 120; // Adjust for fixed header
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <div className="background-fx">
        <div className="bg-brand-text">ABDULLAH</div>
      </div>

      <HeroHeader isScrolled={isScrolled} handleSmoothScroll={handleSmoothScroll} />

      <section id="about" className="section">
        <h2 className="text-gradient section-title">About Me</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <GlassCard>
            <p style={{ lineHeight: 1.6 }}>
              I am Muhammad Abdullah, also known as Abdullah Cyber, a cybersecurity student at Riphah International University in Pakistan. I specialize in web penetration testing, vulnerability assessment, and ethical hacking. My goal is to identify and secure real-world web application vulnerabilities through hands-on testing and continuous learning.
            </p>
          </GlassCard>
        </div>
      </section>

      <section id="education" className="section">
        <h2 className="text-gradient section-title">Education</h2>
        <ProCard>
          <h3 style={{ marginBottom: '0.25rem' }}>Bachelors in Cyber Security</h3>
          <p style={{ color: '#777', fontSize: '0.9rem', marginBottom: '1rem' }}>
            <a href="https://riphah.edu.pk/" target="_blank" rel="noopener noreferrer" style={{ color: '#0ff', textDecoration: 'none' }}>Riphah International University</a> | 2024 – 2028 (Expected)
          </p>
          <ul style={{ color: '#aaa', lineHeight: 1.6, paddingLeft: '1.2rem', margin: 0 }}>
            <li>Currently studying in the 4th semester, building foundational knowledge and practical skills.</li>
          </ul>
        </ProCard>
      </section>

      <section id="experience" className="section">
        <h2 className="text-gradient section-title">Experience</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <ProCard>
            <h3 style={{ marginBottom: '0.25rem' }}>Security Intern</h3>
            <p style={{ color: '#777', fontSize: '0.9rem', marginBottom: '1rem' }}>Inara Technologies | On-Site | January 2026 – March 2026</p>
            <ul style={{ color: '#aaa', lineHeight: 1.6, paddingLeft: '1.2rem', margin: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>Completed hands-on training in Linux system administration, networking fundamentals, and Docker containerization.</li>
              <li>Studied cybersecurity principles, access control, firewall/IDS configuration, malware analysis, and web application vulnerabilities (SQL Injection, XSS) with hands-on labs in firewall setup, and vulnerability testing.</li>
            </ul>
          </ProCard>
          <ProCard>
            <h3 style={{ marginBottom: '0.25rem' }}>Cyber Security Intern</h3>
            <p style={{ color: '#777', fontSize: '0.9rem', marginBottom: '1rem' }}>Digital Empowerment Network | Remote | July 2025 – September 2025</p>
            <ul style={{ color: '#aaa', lineHeight: 1.6, paddingLeft: '1.2rem', margin: 0 }}>
              <li>Conducted penetration testing and vulnerability assessments in simulated cyber-attack environments to identify security weaknesses and recommend improvement measures.</li>
            </ul>
            <a href="/certificates/intership den/Abdullah den certificate.pdf" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '1rem', color: '#00ffff', textDecoration: 'underline', fontWeight: 500 }}>
              View Internship Certificate
            </a>
          </ProCard>
          <ProCard>
            <h3 style={{ marginBottom: '0.25rem' }}>CTF Organizer & Player</h3>
            <p style={{ color: '#777', fontSize: '0.9rem', marginBottom: '1rem' }}>Self Employed | Remote | September 2025 - Current</p>
            <ul style={{ color: '#aaa', lineHeight: 1.6, paddingLeft: '1.2rem', margin: 0 }}>
              <li>Organized and solved CTF challenges, focusing on offensive and defensive cybersecurity techniques.</li>
            </ul>
          </ProCard>
        </div>
      </section>

      <section id="resume" className="section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 className="text-gradient section-title">My Resume</h2>
        
        <motion.button
          onClick={() => setIsResumeOpen(!isResumeOpen)}
          whileHover={{ scale: 1.05, boxShadow: "0px 0px 15px rgba(0, 255, 255, 0.5)" }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '12px 24px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: '#0a0a0a',
            background: 'linear-gradient(90deg, #00ffff, #0088ff)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '2rem',
            outline: 'none'
          }}
        >
          {isResumeOpen ? 'Close Resume' : 'View My Resume'}
        </motion.button>

        <AnimatePresence>
          {isResumeOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{ width: '100%', overflow: 'hidden' }}
            >
              <Resume />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section id="certs" className="section">
        <h2 className="text-gradient section-title">Certifications</h2>
        <div className="content-grid">
          {visibleCerts.map((cert, index) => (
            <a key={index} href={cert.file} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
              <GlassCard>
                <h3>{cert.title}</h3>
                <p>{cert.provider}</p>
                {cert.date && <p style={{ color: '#777', fontSize: '0.85rem' }}>{cert.date}</p>}
              </GlassCard>
            </a>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem' }}>
          <motion.button
            onClick={() => setShowAllCerts(!showAllCerts)}
            whileHover={{ scale: 1.05, boxShadow: "0px 0px 15px rgba(0, 255, 255, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#0a0a0a',
              background: 'linear-gradient(90deg, #00ffff, #0088ff)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {showAllCerts ? 'Show Less' : 'Show More Certificates'}
          </motion.button>
        </div>
      </section>

      <section id="achievements" className="section">
        <h2 className="text-gradient section-title">Achievements</h2>
        <div className="content-grid">
          {achievementsData.map((cert, index) => (
            <a key={index} href={cert.file} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
              <GlassCard>
                <h3>{cert.title}</h3>
                <p>{cert.provider}</p>
                {cert.date && <p style={{ color: '#777', fontSize: '0.85rem' }}>{cert.date}</p>}
              </GlassCard>
            </a>
          ))}
        </div>
      </section>

      <section id="projects" className="section">
        <h2 className="text-gradient section-title">Cybersecurity Projects by Muhammad Abdullah</h2>
        <div className="content-grid">
          <ProCard>
            <h3>Phishing Awareness Campaign</h3>
            <p style={{ color: '#aaa', lineHeight: 1.6 }}>
              Authorized phishing simulation using GoPhish to measure phishing awareness.
            </p>
          </ProCard>
          <ProCard>
            <h3>SSH Honeypot Deployment</h3>
            <p style={{ color: '#aaa', lineHeight: 1.6 }}>
              Deployed SSH honeypot to analyze brute-force attacks.
            </p>
          </ProCard>
        </div>
      </section>

      <section className="section">
        <h2 className="text-gradient section-title">Tools</h2>
        <div className="content-grid">
          <GlassCard className="float">Burp Suite</GlassCard>
          <GlassCard className="float">Nmap</GlassCard>
          <GlassCard className="float">GoBuster</GlassCard>
          <GlassCard className="float">Wireshark</GlassCard>
        </div>
      </section>

      <section id="contact" className="section">
        <h2 className="text-gradient section-title" style={{ textAlign: 'center' }}>Contact</h2>
        <ProCard className="contact-card">
          <a href="mailto:contact@abdullahcyber.dev" className="contact-email">
            contact@abdullahcyber.dev
          </a>
          <p className="contact-alternate">
            Alternate: <a href="mailto:abdullahcyberx@gmail.com">abdullahcyberx@gmail.com</a>
          </p>
        </ProCard>
      </section>

      <div style={{ display: 'none' }}>
        Muhammad Abdullah Cybersecurity portfolio showcases projects related to web security, ethical hacking, and penetration testing. As a Riphah University cybersecurity student, Abdullah Cyber focuses on practical skills and real-world attack simulations to improve application security.
        Muhammad Abdullah Cybersecurity Student Pakistan
        Abdullah Cyber Portfolio
        Riphah University Cybersecurity Student Abdullah
        Ethical Hacker Muhammad Abdullah
        Penetration Tester Abdullah Cyber
        abdullahcyber.dev cybersecurity portfolio
      </div>

      <footer className="footer">
        <div style={{ marginBottom: '1.5rem', color: '#999' }}>
          <p>Muhammad Abdullah | Abdullah Cyber | Cybersecurity Student at Riphah International University Pakistan</p>
        </div>
        <div className="social-links">
          <a href="https://github.com/abdullahcyberx" target="_blank" rel="noreferrer" className="social-btn">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .5C5.73.5.75 5.48.75 11.75c0 5.02 3.26 9.27 7.78 10.77.57.1.78-.25.78-.55v-2.17c-3.16.69-3.83-1.53-3.83-1.53-.52-1.31-1.27-1.66-1.27-1.66-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.74 2.67 1.24 3.32.95.1-.74.4-1.24.73-1.53-2.52-.29-5.18-1.26-5.18-5.6 0-1.24.44-2.26 1.17-3.05-.12-.29-.51-1.46.11-3.04 0 0 .95-.3 3.1 1.17a10.8 10.8 0 012.82-.38c.96 0 1.92.13 2.82.38 2.15-1.47 3.1-1.17 3.1-1.17.62 1.58.23 2.75.11 3.04.73.79 1.17 1.81 1.17 3.05 0 4.35-2.66 5.31-5.2 5.59.41.35.77 1.04.77 2.1v3.12c0 .3.2.66.79.55A11.26 11.26 0 0023.25 11.75C23.25 5.48 18.27.5 12 .5z"/>
            </svg>
          </a>
          <a href="https://linkedin.com/in/hafizabdullahx" target="_blank" rel="noreferrer" className="social-btn">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.98 3.5C4.98 5 3.9 6.1 2.5 6.1 1.08 6.1 0 5 0 3.5S1.08.9 2.5.9c1.4 0 2.48 1.1 2.48 2.6zM.23 8h4.54v15H.23V8zm7.98 0h4.35v2.05h.06c.61-1.16 2.1-2.38 4.32-2.38 4.62 0 5.47 3.04 5.47 7v8.33h-4.54v-7.38c0-1.76-.03-4.03-2.46-4.03-2.46 0-2.83 1.92-2.83 3.9v7.5H8.21V8z"/>
            </svg>
          </a>
        </div>
        © 2026 Muhammad Abdullah
      </footer>
    </>
  );
}
