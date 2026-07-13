import fs from 'fs';
import path from 'path';

const contentDir = 'content';
if (!fs.existsSync(contentDir)) {
  fs.mkdirSync(contentDir, { recursive: true });
}

const profile = {
  "fullName": "Muhammad Abdullah",
  "professionalTitle": "Penetration Tester",
  "heroHeading": "Muhammad<br><span>Abdullah</span>",
  "heroIntroduction": "I’m Muhammad Abdullah, also known online as Abdullah Cyber—a Cyber Security student at Riphah International University in Pakistan, focused on web penetration testing, practical labs and CTF challenges.",
  "aboutText": "<p class=\"lead\">I focus on web penetration testing—understanding how applications behave, questioning their trust boundaries and finding weaknesses before attackers do.</p><p>As a Bachelor of Cyber Security student at Riphah International University, I am building practical experience in Pakistan through authorized assessments, security labs, internships and CTF events.</p><p>My learning is practical: I combine Linux, networking and Docker fundamentals with vulnerability testing, security controls and CTF problem-solving. I am continuously improving through labs, projects and collaborative security events.</p>",
  "location": "Pakistan",
  "availabilityStatus": "Open to cybersecurity opportunities",
  "email": "abdullahcyberx@gmail.com",
  "githubUrl": "https://github.com/abdullahcyberx",
  "linkedinUrl": "https://www.linkedin.com/in/hafizabdullahx",
  "cvPath": "assets/Muhammad-Abdullah-CV.pdf",
  "mainCtaLabels": {
    "explore": "Explore my work",
    "contact": "Start a conversation"
  }
};

const experience = [
  { "id": "exp-1", "company": "Self-employed", "role": "CTF Organizer & Player", "location": "Remote", "workType": "Current", "startDate": "2025", "endDate": "Present", "currentStatus": true, "description": "Organizing and solving capture-the-flag challenges with an emphasis on offensive and defensive cybersecurity techniques.", "responsibilities": ["CTF design", "Web exploitation", "Problem solving", "Team collaboration"], "displayOrder": 1 },
  { "id": "exp-2", "company": "Inara Technologies", "role": "Cyber Security Intern", "location": "On-site", "workType": "Internship", "startDate": "Jan 2026", "endDate": "Mar 2026", "currentStatus": false, "description": "Completed practical training across Linux administration, networking, Docker, security principles, access control, firewalls, IDS, malware analysis and web vulnerability testing.", "responsibilities": ["Linux", "Networking", "Docker", "SQL injection", "XSS"], "displayOrder": 2 },
  { "id": "exp-3", "company": "Digital Empowerment Network", "role": "Cyber Security Intern", "location": "Remote", "workType": "Internship", "startDate": "Jul 2025", "endDate": "Sep 2025", "currentStatus": false, "description": "Conducted penetration testing and vulnerability assessments in simulated attack environments, identifying weaknesses and recommending improvements.", "responsibilities": ["Vulnerability assessment", "Reporting", "Simulated attacks"], "displayOrder": 3 }
];

const projects = [
  { "id": "proj-1", "slug": "phishing", "title": "Authorized Phishing Awareness Campaign", "summary": "Designed and conducted an authorized Gophish simulation to assess real-world phishing awareness among students in a controlled academic setting.", "fullDescription": "", "category": "Social engineering", "tools": ["Gophish", "Campaign design", "Awareness testing", "Ethical scope"], "date": "", "image": "phishing-art", "repositoryUrl": "", "liveUrl": "", "caseStudyContent": "", "featured": true, "displayOrder": 1, "ethicalDisclaimer": "Every security test, simulation and demonstration shown here was performed in an authorized, isolated or educational environment. No unauthorized systems were targeted." },
  { "id": "proj-2", "slug": "honeypot", "title": "SSH Honeypot Deployment", "summary": "Deployed an SSH honeypot using sshesame inside VirtualBox to observe brute-force behavior and study attacker interaction patterns.", "fullDescription": "", "category": "Threat observation", "tools": ["sshesame", "VirtualBox", "SSH", "Attack analysis"], "date": "", "image": "honeypot-art", "repositoryUrl": "", "liveUrl": "", "caseStudyContent": "", "featured": true, "displayOrder": 2, "ethicalDisclaimer": "" },
  { "id": "proj-3", "slug": "ctf-practice", "title": "CTF Challenge Practice & Organization", "summary": "Solving and organizing security challenges that encourage structured thinking across offensive and defensive cybersecurity concepts.", "fullDescription": "", "category": "CTF operations", "tools": ["Web challenges", "Challenge design", "Team play", "Write-ups"], "date": "", "image": "ctf-art", "repositoryUrl": "https://github.com/abdullahcyberx", "liveUrl": "", "caseStudyContent": "", "featured": true, "displayOrder": 3, "ethicalDisclaimer": "" }
];

const skills = [
  { "id": "skill-1", "name": "Burp", "category": "CORE", "icon": "BURP", "keyboardPosition": "01", "description": "Web proxy for assessing application vulnerabilities.", "proficiencyValue": 90, "featured": true, "displayOrder": 1, "skillKey": "burp" },
  { "id": "skill-2", "name": "Nmap", "category": "CORE", "icon": "NMAP", "keyboardPosition": "02", "description": "Network discovery and security auditing.", "proficiencyValue": 85, "featured": true, "displayOrder": 2, "skillKey": "nmap" },
  { "id": "skill-3", "name": "Gobuster", "category": "CORE", "icon": "GOBUSTER", "keyboardPosition": "03", "description": "Directory and DNS busting tool.", "proficiencyValue": 80, "featured": true, "displayOrder": 3, "skillKey": "gobuster" },
  { "id": "skill-4", "name": "Wireshark", "category": "CORE", "icon": "WIRESHARK", "keyboardPosition": "04", "description": "Network protocol analyzer.", "proficiencyValue": 75, "featured": true, "displayOrder": 4, "skillKey": "wireshark" },
  { "id": "skill-5", "name": "Web Testing", "category": "CORE", "icon": "WEB TESTING", "keyboardPosition": "05", "description": "Assessing web application security.", "proficiencyValue": 90, "featured": true, "displayOrder": 5, "skillKey": "web" },
  { "id": "skill-6", "name": "Linux", "category": "CORE", "icon": "LINUX", "keyboardPosition": "06", "description": "System administration and operation.", "proficiencyValue": 85, "featured": true, "displayOrder": 6, "skillKey": "linux" },
  { "id": "skill-7", "name": "Docker", "category": "CORE", "icon": "DOCKER", "keyboardPosition": "07", "description": "Containerization platform.", "proficiencyValue": 80, "featured": true, "displayOrder": 7, "skillKey": "docker" },
  { "id": "skill-8", "name": "Vulnerability Assess", "category": "CORE", "icon": "VULN ASSESS", "keyboardPosition": "08", "description": "Identifying, quantifying, and prioritizing vulnerabilities.", "proficiencyValue": 85, "featured": true, "displayOrder": 8, "skillKey": "vulnerability" },
  { "id": "skill-9", "name": "SQLi", "category": "CORE", "icon": "SQLi", "keyboardPosition": "09", "description": "Exploiting SQL Injection vulnerabilities.", "proficiencyValue": 85, "featured": true, "displayOrder": 9, "skillKey": "sqli" },
  { "id": "skill-10", "name": "XSS", "category": "CORE", "icon": "XSS", "keyboardPosition": "10", "description": "Exploiting Cross-Site Scripting vulnerabilities.", "proficiencyValue": 85, "featured": true, "displayOrder": 10, "skillKey": "xss" },
  { "id": "skill-11", "name": "Networking", "category": "CORE", "icon": "NETWORKING", "keyboardPosition": "11", "description": "Understanding network protocols and traffic.", "proficiencyValue": 80, "featured": true, "displayOrder": 11, "skillKey": "networking" },
  { "id": "skill-12", "name": "Firewall", "category": "CORE", "icon": "FIREWALL", "keyboardPosition": "12", "description": "Configuring and managing network firewalls.", "proficiencyValue": 75, "featured": true, "displayOrder": 12, "skillKey": "firewall" },
  { "id": "skill-13", "name": "IDS", "category": "CORE", "icon": "IDS", "keyboardPosition": "13", "description": "Intrusion Detection Systems.", "proficiencyValue": 75, "featured": true, "displayOrder": 13, "skillKey": "ids" },
  { "id": "skill-14", "name": "Gophish", "category": "CORE", "icon": "GOPHISH", "keyboardPosition": "14", "description": "Open-source phishing framework.", "proficiencyValue": 85, "featured": true, "displayOrder": 14, "skillKey": "gophish" },
  { "id": "skill-15", "name": "Honeypot", "category": "CORE", "icon": "HONEYPOT", "keyboardPosition": "15", "description": "Deploying decoy systems to study attacks.", "proficiencyValue": 80, "featured": true, "displayOrder": 15, "skillKey": "honeypot" },
  { "id": "skill-16", "name": "CTF", "category": "CORE", "icon": "CTF", "keyboardPosition": "16", "description": "Capture the Flag competitions.", "proficiencyValue": 85, "featured": true, "displayOrder": 16, "skillKey": "ctf" },
  { "id": "skill-17", "name": "Security Mindset", "category": "CORE", "icon": "SECURITY MINDSET", "keyboardPosition": "SPACE", "description": "Understanding application logic, questioning trust boundaries and combining tools with structured reasoning.", "proficiencyValue": 92, "featured": true, "displayOrder": 17, "skillKey": "mindset" },
  { "id": "skill-18", "name": "OSINT", "category": "CORE", "icon": "OSINT", "keyboardPosition": "17", "description": "Open-source intelligence gathering.", "proficiencyValue": 80, "featured": true, "displayOrder": 18, "skillKey": "osint" }
];

const certificates = [
  { "id": "cert-1", "slug": "web-rta", "title": "Certified Web Red Team Analyst (WEB-RTA)", "issuer": "CyberWarfare Labs", "issueDate": "January 8, 2026", "credentialId": "WEB-RTA-695f78e7350a0624a439e29d", "verificationUrl": "", "certificateFile": "/assets/certificates/web-rta.pdf", "thumbnail": "", "featured": true, "displayOrder": 1, "skills": [], "description": "", "icon": "W" },
  { "id": "cert-2", "slug": "capt", "title": "Certified Associate Penetration Tester (CAPT)", "issuer": "Hackviser", "issueDate": "October 22, 2025", "credentialId": "HV-CAPT-DVG92YR9", "verificationUrl": "", "certificateFile": "/assets/certificates/capt-hackviser.pdf", "thumbnail": "", "featured": true, "displayOrder": 2, "skills": [], "description": "", "icon": "C" },
  { "id": "cert-3", "slug": "cpps", "title": "Certified Phishing Prevention Specialist", "issuer": "Hack & Fix", "issueDate": "Dec 17, 2025", "credentialId": "", "verificationUrl": "", "certificateFile": "/assets/certificates/cpps-phishing-prevention.pdf", "thumbnail": "", "featured": false, "displayOrder": 3, "skills": [], "description": "", "icon": "CP" },
  { "id": "cert-4", "slug": "crtom", "title": "Red Team Operations Management", "issuer": "Red Team Leaders", "issueDate": "Dec 24, 2025", "credentialId": "", "verificationUrl": "", "certificateFile": "/assets/certificates/crtom-red-team-operations.pdf", "thumbnail": "", "featured": false, "displayOrder": 4, "skills": [], "description": "", "icon": "RT" },
  { "id": "cert-5", "slug": "ics", "title": "ICS/SCADA Cybersecurity", "issuer": "Red Team Leaders", "issueDate": "Jan 5, 2026", "credentialId": "", "verificationUrl": "", "certificateFile": "/assets/certificates/ics-scada-cybersecurity.pdf", "thumbnail": "", "featured": false, "displayOrder": 5, "skills": [], "description": "", "icon": "ICS" },
  { "id": "cert-6", "slug": "cyber-essentials", "title": "Cybersecurity Essentials", "issuer": "Cisco Networking Academy", "issueDate": "Dec 4, 2025", "credentialId": "", "verificationUrl": "", "certificateFile": "/assets/certificates/cisco-cybersecurity-essentials.pdf", "thumbnail": "", "featured": false, "displayOrder": 6, "skills": [], "description": "", "icon": "CS" },
  { "id": "cert-7", "slug": "network-defense", "title": "Network Defense", "issuer": "Cisco Networking Academy", "issueDate": "May 6, 2025", "credentialId": "", "verificationUrl": "", "certificateFile": "/assets/certificates/cisco-network-defense.pdf", "thumbnail": "", "featured": false, "displayOrder": 7, "skills": [], "description": "", "icon": "ND" },
  { "id": "cert-8", "slug": "intro-cybersecurity", "title": "Introduction to Cybersecurity", "issuer": "Cisco Networking Academy", "issueDate": "Apr 27, 2025", "credentialId": "", "verificationUrl": "", "certificateFile": "/assets/certificates/cisco-introduction-cybersecurity.pdf", "thumbnail": "", "featured": false, "displayOrder": 8, "skills": [], "description": "", "icon": "IC" },
  { "id": "cert-9", "slug": "security-principles", "title": "Security Principles", "issuer": "ISC2 via Coursera", "issueDate": "Jul 10, 2025", "credentialId": "", "verificationUrl": "", "certificateFile": "/assets/certificates/isc2-security-principles-coursera.pdf", "thumbnail": "", "featured": false, "displayOrder": 9, "skills": [], "description": "", "icon": "ISC" },
  { "id": "cert-10", "slug": "advent-of-cyber", "title": "Advent of Cyber 2025", "issuer": "TryHackMe", "issueDate": "Dec 25, 2025", "credentialId": "", "verificationUrl": "", "certificateFile": "/assets/certificates/tryhackme-advent-of-cyber-2025.pdf", "thumbnail": "", "featured": false, "displayOrder": 10, "skills": [], "description": "", "icon": "THM" },
  { "id": "cert-11", "slug": "linux-essential", "title": "Linux & Essential Cybersecurity", "issuer": "UrduCourses", "issueDate": "Mar 21, 2025", "credentialId": "", "verificationUrl": "", "certificateFile": "/assets/certificates/cybersavvy-linux-essential-cybersecurity.pdf", "thumbnail": "", "featured": false, "displayOrder": 11, "skills": [], "description": "", "icon": "LX" },
  { "id": "cert-12", "slug": "cyber-internship", "title": "Cyber Security Internship", "issuer": "Digital Empowerment Network", "issueDate": "Sep 2025", "credentialId": "", "verificationUrl": "", "certificateFile": "/assets/certificates/digital-empowerment-network-internship.pdf", "thumbnail": "", "featured": false, "displayOrder": 12, "skills": [], "description": "", "icon": "IN" },
  { "id": "cert-13", "slug": "it-essentials", "title": "IT Essentials", "issuer": "Cisco Networking Academy", "issueDate": "Dec 16, 2024", "credentialId": "", "verificationUrl": "", "certificateFile": "/assets/certificates/cisco-it-essentials.pdf", "thumbnail": "", "featured": false, "displayOrder": 13, "skills": [], "description": "", "icon": "IT" },
  { "id": "cert-14", "slug": "intro-iot", "title": "Introduction to IoT & Digital Transformation", "issuer": "Cisco Networking Academy", "issueDate": "Apr 26, 2025", "credentialId": "", "verificationUrl": "", "certificateFile": "/assets/certificates/cisco-introduction-iot.pdf", "thumbnail": "", "featured": false, "displayOrder": 14, "skills": [], "description": "", "icon": "IoT" },
  { "id": "cert-15", "slug": "cpp-essentials", "title": "C++ Essentials 1", "issuer": "Cisco Networking Academy", "issueDate": "Jan 8, 2025", "credentialId": "", "verificationUrl": "", "certificateFile": "/assets/certificates/cisco-cpp-essentials-1.pdf", "thumbnail": "", "featured": false, "displayOrder": 15, "skills": [], "description": "", "icon": "C+" },
  { "id": "cert-16", "slug": "cpp-advanced", "title": "C++ Advanced", "issuer": "Cisco Networking Academy", "issueDate": "Dec 6, 2025", "credentialId": "", "verificationUrl": "", "certificateFile": "/assets/certificates/cisco-cpp-advanced.pdf", "thumbnail": "", "featured": false, "displayOrder": 16, "skills": [], "description": "", "icon": "C++" },
  { "id": "cert-17", "slug": "nascon", "title": "NaSCon'25 Participation", "issuer": "FAST-NUCES Islamabad", "issueDate": "Apr 2025", "credentialId": "", "verificationUrl": "", "certificateFile": "/assets/certificates/nascon-2025-participation.pdf", "thumbnail": "", "featured": false, "displayOrder": 17, "skills": [], "description": "", "icon": "NC" }
];

const achievements = [
  { "id": "ach-1", "title": "Riphah CTF", "organization": "Riphah", "date": "2025", "description": "CTF runner-up placement", "displayOrder": 1, "isBadge": false },
  { "id": "ach-2", "title": "Islamia Bahawalpur", "organization": "Islamia Bahawalpur", "date": "2025", "description": "CTF runner-up placement", "displayOrder": 2, "isBadge": false },
  { "id": "ach-3", "title": "Advent of Cyber 2025", "organization": "TryHackMe", "date": "2025", "description": "Achievement badge", "displayOrder": 3, "isBadge": true },
  { "id": "ach-4", "title": "CTF Event Organizer", "organization": "Self-employed", "date": "2025", "description": "Organized events", "displayOrder": 4, "isBadge": true }
];

const education = [
  { "id": "edu-1", "institution": "Riphah International University", "degree": "Bachelor of Cyber Security", "startDate": "2024", "expectedCompletion": "2028", "description": "Building practical experience in Pakistan through authorized assessments, security labs, internships and CTF events." }
];

const seo = {
  "siteUrl": "https://abdullahcyber.dev/",
  "canonicalUrl": "https://abdullahcyber.dev/",
  "title": "Abdullah Cyber | Muhammad Abdullah — Cyber Security Pakistan",
  "description": "Muhammad Abdullah (Abdullah Cyber) is a Cyber Security student at Riphah International University in Pakistan, focused on web penetration testing and CTFs.",
  "keywords": "Muhammad Abdullah, Abdullah Cyber, cyber security Riphah, cyber security in Pakistan, penetration tester Pakistan, web penetration testing, cybersecurity portfolio, CTF Pakistan",
  "author": "Muhammad Abdullah",
  "openGraph": {
    "title": "Abdullah Cyber | Muhammad Abdullah — Cyber Security Pakistan",
    "description": "Cyber Security student at Riphah International University, Pakistan. Explore Muhammad Abdullah’s web penetration-testing projects, CTF achievements and credentials.",
    "siteName": "Abdullah Cyber",
    "image": "https://abdullahcyber.dev/assets/abdullah-cyber-og.png"
  },
  "twitter": {
    "title": "Abdullah Cyber | Muhammad Abdullah — Cyber Security Pakistan",
    "description": "Riphah Cyber Security student in Pakistan focused on web penetration testing, CTFs and practical security projects.",
    "image": "https://abdullahcyber.dev/assets/abdullah-cyber-og.png"
  },
  "socialImage": "https://abdullahcyber.dev/assets/abdullah-cyber-og.png"
};

const ai = {
  "assistantName": "Shehzada's AI",
  "greeting": "Hello. I am Shehzada's AI, Muhammad Abdullah's verified portfolio assistant.",
  "fallbackAnswer": "I do not have enough verified information to answer that question. My knowledge is limited to Muhammad Abdullah's portfolio.",
  "suggestedQuestions": [
    "What is Muhammad's focus?",
    "Tell me about his certifications.",
    "What CTF experience does he have?"
  ],
  "customAnswers": {},
  "recruiterBriefingLabels": {
    "title": "Recruiter Briefing",
    "summary": "Generating a quick overview of Muhammad's capabilities..."
  },
  "scanLabels": {
    "title": "Evidence Scan",
    "summary": "Scanning portfolio for security artifacts..."
  },
  "ctfChallengeData": {
    "flag": "FLAG{think_beyond_tools}"
  },
  "privacyMessage": "Answers are grounded only in this portfolio. Voice processing, when used, is handled by your browser."
};

fs.writeFileSync(path.join(contentDir, 'profile.json'), JSON.stringify(profile, null, 2));
fs.writeFileSync(path.join(contentDir, 'experience.json'), JSON.stringify(experience, null, 2));
fs.writeFileSync(path.join(contentDir, 'projects.json'), JSON.stringify(projects, null, 2));
fs.writeFileSync(path.join(contentDir, 'skills.json'), JSON.stringify(skills, null, 2));
fs.writeFileSync(path.join(contentDir, 'certificates.json'), JSON.stringify(certificates, null, 2));
fs.writeFileSync(path.join(contentDir, 'achievements.json'), JSON.stringify(achievements, null, 2));
fs.writeFileSync(path.join(contentDir, 'education.json'), JSON.stringify(education, null, 2));
fs.writeFileSync(path.join(contentDir, 'seo.json'), JSON.stringify(seo, null, 2));
fs.writeFileSync(path.join(contentDir, 'ai.json'), JSON.stringify(ai, null, 2));

console.log('JSON files created successfully.');
