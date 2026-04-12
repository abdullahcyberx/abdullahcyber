import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Contact from './components/Contact';

function App() {
  useEffect(() => {
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.1 }
    );

    const hiddenElements = document.querySelectorAll('.reveal');
    hiddenElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="app-container">
      <Navbar />
      <main>
        {/* SEO Hidden Keywords Block to maintain rankings */}
        <div style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
          <h1>Hafiz Muhammad Abdullah</h1>
          <h2>abdullah cyber</h2>
          <p>Muhammad Abdullah cyber, Muhammad Abdullah, abdullah riphah, abdullah pakistan, abdullh cyber riphah.</p>
        </div>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Contact />
      </main>
      <footer>
        <div className="container" style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}>
          <p>&copy; {new Date().getFullYear()} Muhammad Abdullah. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
