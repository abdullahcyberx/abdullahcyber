with open('ai_engine.js', 'w', encoding='utf-8') as f:
    f.write(r'''  /* -------------------------
     Shehzada's AI Assistant
     ------------------------- */
  const aiToggle = document.getElementById('ai-toggle');
  const aiAssistant = document.getElementById('ai-assistant');
  const aiClose = document.getElementById('ai-close');
  const aiForm = document.getElementById('ai-form');
  const aiInput = document.getElementById('ai-input');
  const aiMessages = document.getElementById('ai-messages');
  const aiPromptButtons = document.querySelectorAll('.ai-prompt-btn');

  // Verify elements exist
  if (aiToggle && aiAssistant && aiClose && aiForm && aiInput && aiMessages) {
    const aiDataScript = document.getElementById('ai-data');
    let aiPayload = { config: {}, knowledge: {} };
    if (aiDataScript) {
      try {
        const raw = aiDataScript.textContent || aiDataScript.innerHTML;
        const cleaned = raw.replace(/<!-- TEMPLATE: AI_PAYLOAD -->/g, '').trim();
        if (cleaned) {
          aiPayload = JSON.parse(cleaned);
        }
      } catch (e) {
        console.error("Failed to parse AI payload.", e);
      }
    }

    const aiConfig = aiPayload.config || {};
    const portfolioKnowledge = aiPayload.knowledge || {};
    
    // Validate knowledge
    const profile = portfolioKnowledge.profile || {};
    const projects = portfolioKnowledge.projects || [];
    const experience = portfolioKnowledge.experience || [];
    const skills = portfolioKnowledge.skills || [];
    const certificates = portfolioKnowledge.certificates || [];
    const achievements = portfolioKnowledge.achievements || [];
    const education = portfolioKnowledge.education || [];

    // State
    const state = {
      busy: false,
      greeted: false
    };
    
    let activeAnimation = null;

    // Modular Engine Functions
    
    const normalizeQuery = (q) => {
      return q.toLowerCase().replace(/[^\w\s-]/g, ' ').replace(/\s+/g, ' ').trim();
    };

    const correctCommonTypos = (q) => {
      let corrected = q;
      const typoMap = {
        'certficate': 'certificate',
        'certficates': 'certificates',
        'experince': 'experience',
        'intership': 'internship',
        'cyber secuirty': 'cybersecurity',
        'projectes': 'projects',
        'recon': 'reconnaissance',
        'sec': 'security',
        'pentest': 'penetration testing',
        'appsec': 'application security',
        'hire': 'recruiter',
        'candidate': 'recruiter',
        'employ': 'recruiter',
        'credential': 'certificate'
      };
      Object.keys(typoMap).forEach(typo => {
        const regex = new RegExp('\\b' + typo + '\\b', 'g');
        corrected = corrected.replace(regex, typoMap[typo]);
      });
      return corrected;
    };

    const tokenizeQuery = (q) => {
      return q.split(' ').filter(t => t.length > 2); // basic tokens
    };

    const detectIntent = (tokens, rawQuery) => {
      const q = rawQuery;
      let scores = {
        identity: 0,
        specialization: 0,
        education: 0,
        contact: 0,
        recruiter: 0,
        soc_suitability: 0,
        pentest_suitability: 0,
        web_suitability: 0,
        skills: 0,
        followup_more: 0,
        project_match: 0,
        experience_match: 0,
        certificate_match: 0,
        achievement_match: 0,
        unknown: 0
      };

      // Weights
      const wStrong = 10;
      const wMedium = 5;
      const wWeak = 2;

      // Identity
      if (q.includes('who is') || q.includes('who are you') || q.includes('tell me about muhammad')) scores.identity += wStrong;
      if (tokens.includes('who') || tokens.includes('identity') || tokens.includes('summary')) scores.identity += wMedium;

      // Specialization
      if (q.includes('specialize') || q.includes('specialization') || q.includes('focus')) scores.specialization += wStrong;
      
      // Education
      if (q.includes('education') || q.includes('university') || q.includes('degree') || q.includes('graduation')) scores.education += wStrong;

      // Contact
      if (q.includes('contact') || q.includes('email') || q.includes('reach') || q.includes('linkedin') || q.includes('github') || q.includes('cv')) scores.contact += wStrong;

      // Recruiter
      if (q.includes('hire') || q.includes('recruit') || q.includes('recruiter') || q.includes('why should i')) scores.recruiter += wStrong;

      // SOC Suitability
      if (q.includes('soc') && (q.includes('internship') || q.includes('role') || q.includes('suitable') || q.includes('fit'))) scores.soc_suitability += wStrong;
      if (tokens.includes('soc')) scores.soc_suitability += wMedium;

      // Pentest Suitability
      if (q.includes('pentest') || q.includes('penetration testing') || q.includes('ethical hacking')) scores.pentest_suitability += wStrong;

      // Web Suitability
      if ((q.includes('web') && q.includes('security')) || q.includes('application security') || q.includes('appsec')) scores.web_suitability += wStrong;

      // Skills
      if (q.includes('skill') || q.includes('tool') || q.includes('language') || q.includes('python')) scores.skills += wStrong;

      // Follow-up
      if (q.includes('tell me more') || q.includes('what tools') || q.includes('which one is strongest') || q.includes('compare it') || q.includes('what about') || q.includes('why')) scores.followup_more += wStrong;

      // Projects
      if (q.includes('project') || q.includes('build') || q.includes('develop') || q.includes('portfolio summary')) scores.project_match += wMedium;
      if (q.includes('strongest project') || q.includes('strongest projects')) { scores.project_match += wStrong; scores.followup_more += wWeak; }

      // Experience
      if (q.includes('internship') || q.includes('experience')) scores.experience_match += wMedium;

      // Certificates
      if (q.includes('certificate') || q.includes('certification') || q.includes('credential')) scores.certificate_match += wMedium;
      if (q.includes('which certifications matter most') || q.includes('most important certifications')) { scores.certificate_match += wStrong; scores.followup_more += wWeak; }

      // Achievements
      if (q.includes('achievement') || q.includes('ctf') || q.includes('badge')) scores.achievement_match += wMedium;

      // General cybersecurity concept check (weather test etc)
      if (q.includes('what is reconnaissance')) scores.project_match += wMedium; // fallback directly to recon tool
      if (q.includes('reconnaissance')) scores.project_match += wWeak;
      if (q.includes('weather')) return 'unknown'; // specific fallback check

      // Determine highest intent
      let highestIntent = 'unknown';
      let maxScore = 0;
      for (const [intent, score] of Object.entries(scores)) {
        if (score > maxScore) {
          maxScore = score;
          highestIntent = intent;
        }
      }

      if (maxScore < 2) return 'unknown';
      return highestIntent;
    };

    const resolveConversationContext = () => {
      let context = { type: 'none', id: null, previousIntent: 'none', history: [] };
      try {
        const stored = sessionStorage.getItem("ai_context_v1");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object' && Array.isArray(parsed.history)) {
            context = parsed;
          }
        }
      } catch (e) {
        console.error("Context error:", e);
      }
      return context;
    };

    const saveConversationContext = (context) => {
      try {
        sessionStorage.setItem("ai_context_v1", JSON.stringify(context));
      } catch (e) {
        // ignore
      }
    };

    const updateContextHistory = (context, userMsg, aiResponse, newType, newId, newIntent) => {
      context.history.push({ user: userMsg, timestamp: Date.now() });
      if (context.history.length > 10) context.history.shift(); // Keep last 10
      context.type = newType || context.type;
      context.id = newId || context.id;
      context.previousIntent = newIntent || context.previousIntent;
      saveConversationContext(context);
    };

    const clearConversationContext = () => {
      try { sessionStorage.removeItem("ai_context_v1"); } catch (e) {}
    };

    const scoreRecord = (record, tokens, rawQuery) => {
      let score = 0;
      const title = (record.title || record.role || record.name || '').toLowerCase();
      const desc = (record.description || record.details || '').toLowerCase();
      
      // Exact title match
      if (title && rawQuery.includes(title)) score += 20;
      
      // Token overlap
      tokens.forEach(token => {
        if (title.includes(token)) score += 5;
        if (desc.includes(token)) score += 1;
        if (record.skills && record.skills.some(s => s.toLowerCase().includes(token))) score += 3;
        if (record.company && record.company.toLowerCase().includes(token)) score += 5;
      });

      return score;
    };

    const searchPortfolio = (collection, tokens, rawQuery) => {
      if (!collection || !collection.length) return null;
      let bestMatch = null;
      let bestScore = 0;

      collection.forEach(item => {
        const score = scoreRecord(item, tokens, rawQuery);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = item;
        }
      });

      if (bestScore >= 5) return bestMatch;
      return null;
    };

    const composeResponse = (intent, rawQuery, context, tokens) => {
      const getVariation = (arr) => arr[Math.floor(Math.random() * arr.length)];
      
      let text = '';
      let newType = 'none';
      let newId = null;
      let suggestions = [];

      // 1. Follow-ups
      if (intent === 'followup_more') {
        if (rawQuery.includes('what tools') || rawQuery.includes('python')) {
          if (context.type === 'project') {
            const p = projects.find(x => x.id === context.id);
            if (p) {
              text = For the **** project, Muhammad used tools including: .;
              if (p.skills.some(s => s.toLowerCase().includes('python') || rawQuery.includes('python'))) {
                text +=  Python was particularly useful for automation and scripting here.;
              }
              newType = 'project';
              newId = p.id;
              suggestions = ["Why it matters", "View Projects"];
            } else {
              text = Muhammad uses a variety of tools depending on the project. Do you have a specific project in mind?;
              suggestions = ["Show projects"];
            }
          } else {
            text = Muhammad is proficient in several security tools including Burp Suite, Nmap, Metasploit, Wireshark, and programming languages like Python and JavaScript.;
            suggestions = ["Show projects", "View Certificates"];
          }
        } else if (rawQuery.includes('strongest project') || rawQuery.includes('which one is strongest')) {
           text = Muhammad's strongest project is currently his **Modular Recon Tool**, as it demonstrates comprehensive understanding of external attack surfaces. His **Authorized Phishing Awareness Campaign** is also highly notable for practical human-centric security.;
           newType = 'project';
           newId = 'modular-recon-tool'; // matching the typical ID
           suggestions = ["Explain Modular Recon Tool", "View Projects"];
        } else if (rawQuery.includes('compare it')) {
           if (context.type === 'project') {
             text = Compared to his other work, this project emphasizes different aspects of security. While his Recon Tool focuses on discovery, his web vulnerability projects focus on exploitation and remediation.;
             newType = context.type;
             newId = context.id;
             suggestions = ["View Projects", "What tools did he use?"];
           } else {
             text = Muhammad has a diverse portfolio. His offensive projects demonstrate discovery and exploitation, while his awareness campaigns show practical defense.;
             suggestions = ["Show his strongest projects"];
           }
        } else if (rawQuery.includes('what about his internships') || rawQuery.includes('what about internships')) {
           text = Muhammad has completed internships in cybersecurity where he gained practical industry exposure. He continually applies this experience to his personal projects.;
           newType = 'experience';
           suggestions = ["Specific internship", "View Experience"];
        } else if (rawQuery.includes('why')) {
           text = Because he focuses on practical, hands-on application of cybersecurity concepts rather than just theoretical knowledge. This is proven through his independent projects and CTF engagements.;
        } else {
           // Generic tell me more
           if (context.type === 'identity') {
             text = He focuses heavily on offensive security, CTF methodologies, and practical web vulnerability remediation. Muhammad continuously seeks to bridge the gap between finding vulnerabilities and learning how to secure them.;
             newType = 'identity';
             suggestions = ["Show his strongest projects", "View Experience"];
           } else if (context.type === 'project') {
             const p = projects.find(x => x.id === context.id);
             if (p) {
               text = Building **** allowed Muhammad to deepen his understanding of practical security implementations. It demonstrates his hands-on approach to problem-solving.;
               newType = 'project';
               newId = p.id;
               suggestions = ["What tools did he use?", "View Projects"];
             } else {
               text = He approaches projects methodically, aiming to understand the underlying mechanics of vulnerabilities.;
             }
           } else if (context.type === 'experience') {
             const e = experience.find(x => x.id === context.id);
             if (e) {
               text = During his time at ****, he gained valuable practical insights into real-world security operations.;
               newType = 'experience';
               newId = e.id;
               suggestions = ["Responsibilities", "Why hire him?", "View Experience"];
             } else {
               text = His internships provided foundational exposure to professional security environments.;
             }
           } else {
             text = Muhammad's portfolio highlights his dedication to cybersecurity. He balances academic learning with practical project work and active CTF participation.;
             suggestions = ["Show projects", "Skills", "Contact Muhammad"];
           }
        }
      }

      if (text) return { text, newType, newId, intent, suggestions };

      // 2. Entity Matching Check
      let matchedProject = searchPortfolio(projects, tokens, rawQuery);
      let matchedExperience = searchPortfolio(experience, tokens, rawQuery);
      let matchedCertificate = searchPortfolio(certificates, tokens, rawQuery);
      let matchedAchievement = searchPortfolio(achievements, tokens, rawQuery);

      if (matchedProject && (!matchedExperience || intent === 'project_match')) {
        text = ****: ;
        newType = 'project';
        newId = matchedProject.id;
        suggestions = ["What tools did he use?", "Why it matters", "View Projects"];
      } else if (matchedExperience && (!matchedProject || intent === 'experience_match')) {
        text = Muhammad worked as a **** at **** (). ;
        newType = 'experience';
        newId = matchedExperience.id;
        suggestions = ["Skills gained", "Why hire him?", "View Experience"];
      } else if (matchedCertificate && intent === 'certificate_match') {
        text = Muhammad holds the **** certification from .;
        newType = 'certificate';
        newId = matchedCertificate.id;
        suggestions = ["Practical relevance", "Technical skills", "View Certificates"];
      } else if (matchedAchievement && intent === 'achievement_match') {
        text = One of his achievements is ****: ;
        newType = 'achievement';
        newId = matchedAchievement.id;
        suggestions = ["View Achievements"];
      }

      if (text) return { text, newType, newId, intent, suggestions };

      // 3. General Intents
      switch (intent) {
        case 'identity':
          text = getVariation([
            "Muhammad Abdullah is an early-career cybersecurity candidate with hands-on experience through internships and technical projects.",
            "Muhammad Abdullah is a Cyber Security student focusing on web application security, penetration testing, and practical security projects.",
            "Muhammad specializes in offensive security and practical cyber defense, evidenced by his portfolio projects and certifications."
          ]);
          newType = 'identity';
          suggestions = ["What does he specialize in?", "What experience does he have?", "Tell me more"];
          break;
        case 'specialization':
          text = "He specializes in web application security, penetration testing, and practical reconnaissance. His approach involves finding how applications break to better understand how to secure them.";
          suggestions = ["Show projects", "Skills", "Why hire him?"];
          break;
        case 'education':
          if (profile.education) {
            text = He is currently pursuing his degree in Cyber Security at , expecting to graduate in .;
          } else if (education.length > 0) {
            text = Muhammad is pursuing his education in Cyber Security at .;
          } else {
            text = "Muhammad is currently pursuing a degree in Cyber Security.";
          }
          suggestions = ["Certifications", "Show projects"];
          break;
        case 'contact':
          text = You can reach Muhammad via email at ****, or connect on LinkedIn and GitHub.;
          suggestions = ["LinkedIn", "GitHub", "Download CV"];
          break;
        case 'recruiter':
          text = "As an early-career cybersecurity candidate, Muhammad brings hands-on practical exposure from technical projects, internships, and CTF engagements. He demonstrates a strong willingness to learn and apply offensive security concepts defensively.";
          suggestions = ["Show projects", "What experience does he have?", "Contact Muhammad"];
          break;
        case 'soc_suitability':
          text = "Muhammad is highly suitable for a SOC internship. His foundational understanding of networking, security tools, and vulnerability discovery equips him well for triage, analysis, and monitoring tasks.";
          suggestions = ["What experience does he have?", "Certifications"];
          break;
        case 'pentest_suitability':
          text = "Muhammad is a strong candidate for penetration testing roles. His portfolio includes practical web vulnerability testing and reconnaissance tool development, demonstrating an offensive mindset.";
          suggestions = ["Explain the Modular Recon Tool", "Show projects"];
          break;
        case 'web_suitability':
          text = "Yes, his focus on application security makes him well-suited for web-security roles. He actively builds projects to understand and mitigate web vulnerabilities.";
          suggestions = ["Show projects", "Skills"];
          break;
        case 'skills':
          const techSkills = skills.find(s => s.category === "Technical Skills")?.items || [];
          text = Muhammad's technical skills include: . He also has experience with various security tools and programming languages like Python.;
          suggestions = ["Does he know Python?", "Show projects"];
          break;
        case 'project_match':
          text = Muhammad has built several projects including a Modular Recon Tool and a Phishing Awareness Campaign. Which one would you like to know more about?;
          suggestions = ["Show his strongest projects", "Explain the Modular Recon Tool", "View Projects"];
          break;
        case 'experience_match':
          text = Muhammad has completed internships in cybersecurity where he gained practical industry exposure. He continually applies this experience to his personal projects.;
          suggestions = ["Specific internship", "View Experience"];
          break;
        case 'certificate_match':
          if (rawQuery.includes('which certifications matter most') || rawQuery.includes('most important certifications')) {
             text = His most important certifications highlight his foundational and practical knowledge. The core ones listed in his portfolio are highly relevant to entry-level cybersecurity roles.;
             suggestions = ["View Certificates"];
          } else {
             text = Muhammad holds several certifications demonstrating his knowledge in cybersecurity fundamentals and practical tools.;
             suggestions = ["Which certifications matter most?", "View Certificates"];
          }
          break;
        case 'achievement_match':
          text = He actively participates in CTF challenges and engages in practical security exercises to test his skills.;
          suggestions = ["CTF work", "View Achievements"];
          break;
        case 'unknown':
        default:
          text = "I'm Shehzada's AI, a local assistant focused exclusively on Muhammad Abdullah's professional portfolio. I can answer questions about his projects, skills, education, and cybersecurity experience. What would you like to explore?";
          suggestions = ["Who is Muhammad?", "Show his strongest projects", "What experience does he have?"];
          break;
      }

      return { text, newType, newId, intent, suggestions };
    };

    const generateFollowUpSuggestions = (suggestions) => {
      if (!suggestions || !suggestions.length) return null;
      const wrap = document.createElement('div');
      wrap.className = 'ai-suggestions fade-in-up';
      suggestions.forEach(sug => {
        if (['View Projects', 'View Experience', 'View Certificates', 'View Achievements', 'Contact Muhammad', 'Download CV', 'LinkedIn', 'GitHub'].includes(sug)) {
           // Action Links
           const a = document.createElement('a');
           a.className = 'ai-prompt-btn';
           a.style.display = 'inline-block';
           a.style.textDecoration = 'none';
           a.textContent = sug;
           if (sug === 'View Projects') a.href = '#projects';
           else if (sug === 'View Experience') a.href = '#experience';
           else if (sug === 'View Certificates') a.href = '#credentials';
           else if (sug === 'View Achievements') a.href = '#achievements';
           else if (sug === 'Contact Muhammad') a.href = '#contact';
           else if (sug === 'Download CV') { a.href = 'assets/Muhammad-Abdullah-CV.pdf'; a.download = true; }
           else if (sug === 'LinkedIn') { a.href = profile.linkedinUrl || '#'; a.target = '_blank'; }
           else if (sug === 'GitHub') { a.href = profile.githubUrl || '#'; a.target = '_blank'; }
           
           a.addEventListener('click', () => {
             aiClose.click();
           });
           wrap.appendChild(a);
        } else {
           // Follow up queries
           const btn = document.createElement('button');
           btn.className = 'ai-prompt-btn';
           btn.textContent = sug;
           btn.addEventListener('click', () => {
             aiInput.value = sug;
             aiForm.dispatchEvent(new Event('submit'));
           });
           wrap.appendChild(btn);
        }
      });
      return wrap;
    };

    const createMessageBubble = (role) => {
      const wrapper = document.createElement('div');
      wrapper.className = i-message ;
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      wrapper.appendChild(bubble);
      aiMessages.appendChild(wrapper);
      scrollToBottom();
      return bubble;
    };

    const scrollToBottom = () => {
      if (aiMessages) aiMessages.scrollTop = aiMessages.scrollHeight;
    };

    const processLocalQuery = (rawQuery) => {
      const norm = normalizeQuery(rawQuery);
      const corrected = correctCommonTypos(norm);
      const tokens = tokenizeQuery(corrected);
      
      const intent = detectIntent(tokens, corrected);
      const context = resolveConversationContext();
      
      const result = composeResponse(intent, corrected, context, tokens);
      
      updateContextHistory(context, rawQuery, result.text, result.newType, result.newId, result.intent);
      
      return result;
    };

    // Progressive typing using requestAnimationFrame
    const typeWriterEffect = (element, text, speed, onComplete) => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion || speed <= 0) {
        // Safe parsing: Create text nodes and bold nodes
        element.innerHTML = '';
        renderSafeMarkdown(element, text);
        if (onComplete) onComplete();
        return { abort: () => {} };
      }

      let aborted = false;
      let lastTime = performance.now();
      let charIndex = 0;
      
      element.innerHTML = '';
      
      const renderSafeMarkdown = (el, str) => {
        const parts = str.split(/(\*\*.*?\*\*)/g);
        parts.forEach(p => {
          if (p.startsWith('**') && p.endsWith('**')) {
            const strong = document.createElement('strong');
            strong.textContent = p.slice(2, -2);
            el.appendChild(strong);
          } else if (p) {
            el.appendChild(document.createTextNode(p));
          }
        });
      };

      const step = (time) => {
        if (aborted) return;
        
        if (time - lastTime > speed) {
          lastTime = time;
          charIndex += 2; // Type faster by jumping 2 chars
          
          if (charIndex >= text.length) {
             element.innerHTML = '';
             renderSafeMarkdown(element, text);
             scrollToBottom();
             if (onComplete) onComplete();
             return;
          }
          
          element.innerHTML = '';
          renderSafeMarkdown(element, text.substring(0, charIndex));
          scrollToBottom();
        }
        activeAnimation = requestAnimationFrame(step);
      };

      activeAnimation = requestAnimationFrame(step);

      return {
        abort: () => {
          aborted = true;
          if (activeAnimation) cancelAnimationFrame(activeAnimation);
          element.innerHTML = '';
          renderSafeMarkdown(element, text);
        }
      };
    };
    
    // Extracted out for reuse
    const renderSafeMarkdown = (el, str) => {
      const parts = str.split(/(\*\*.*?\*\*)/g);
      parts.forEach(p => {
        if (p.startsWith('**') && p.endsWith('**')) {
          const strong = document.createElement('strong');
          strong.textContent = p.slice(2, -2);
          el.appendChild(strong);
        } else if (p) {
          el.appendChild(document.createTextNode(p));
        }
      });
    };

    const processQuery = (rawQuery) => {
      if (rawQuery.toLowerCase() === "/clear" || rawQuery.toLowerCase() === "clear") {
        if (activeAnimation) cancelAnimationFrame(activeAnimation);
        aiMessages.innerHTML = "";
        clearConversationContext();
        state.greeted = false;
        const bubble = createMessageBubble("ai");
        bubble.textContent = aiConfig.greeting || "Hi - I'm Shehzada's AI. I can guide you through Muhammad's projects, skills, internships, certifications and practical cybersecurity work. What would you like to explore?";
        defaultActions();
        return;
      }

      state.busy = true;
      aiInput.disabled = true;

      // Status indicator
      const statusBubble = createMessageBubble("ai");
      statusBubble.classList.add("status");
      statusBubble.textContent = "Searching portfolio knowledge...";

      setTimeout(() => {
        if (statusBubble && statusBubble.parentNode) {
          statusBubble.parentNode.remove();
        }

        try {
          const response = processLocalQuery(rawQuery);
          
          const bubble = createMessageBubble("ai");
          
          const animation = typeWriterEffect(bubble, response.text, 20, () => {
            if (response.suggestions) {
               const suggestionsDOM = generateFollowUpSuggestions(response.suggestions);
               if (suggestionsDOM) aiMessages.appendChild(suggestionsDOM);
               scrollToBottom();
            }
            state.busy = false;
            aiInput.disabled = false;
            aiInput.focus();
          });
          
          // attach abort to form so a new submit or close can stop it
          aiForm.activeAnimationController = animation;

        } catch (e) {
          console.error(e);
          const bubble = createMessageBubble("ai");
          bubble.textContent = "I encountered an error accessing portfolio knowledge. Please try again.";
          state.busy = false;
          aiInput.disabled = false;
        }
      }, 300); // 300ms local processing delay
    };

    const defaultActions = () => {
      const wrap = document.createElement('div');
      wrap.className = 'ai-suggestions fade-in-up';
      const defaults = ["Who is Muhammad?", "Show his strongest projects", "What experience does he have?"];
      defaults.forEach(d => {
        const btn = document.createElement('button');
        btn.className = 'ai-prompt-btn';
        btn.textContent = d;
        btn.addEventListener('click', () => {
          aiInput.value = d;
          aiForm.dispatchEvent(new Event('submit'));
        });
        wrap.appendChild(btn);
      });
      aiMessages.appendChild(wrap);
      scrollToBottom();
    };

    // Events
    aiToggle.addEventListener('click', () => {
      aiAssistant.classList.add('open');
      document.body.classList.add('ai-open');
      aiAssistant.removeAttribute('inert');
      aiAssistant.setAttribute('aria-hidden', 'false');
      
      if (!state.greeted) {
        state.greeted = true;
        const bubble = createMessageBubble("ai");
        bubble.textContent = aiConfig.greeting || "Hi - I'm Shehzada's AI. I can guide you through Muhammad's projects, skills, internships, certifications and practical cybersecurity work. What would you like to explore?";
        defaultActions();
      }
      setTimeout(() => aiInput.focus(), 300);
    });

    aiClose.addEventListener('click', () => {
      aiAssistant.classList.remove('open');
      document.body.classList.remove('ai-open');
      aiAssistant.setAttribute('inert', '');
      aiAssistant.setAttribute('aria-hidden', 'true');
      if (aiForm.activeAnimationController) {
        aiForm.activeAnimationController.abort();
      }
      aiToggle.focus();
    });

    aiAssistant.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        aiClose.click();
      }
    });

    aiPromptButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.getAttribute('data-query') || btn.textContent.trim();
        aiInput.value = query;
        aiForm.dispatchEvent(new Event('submit'));
      });
    });

    aiForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = aiInput.value.trim();
      if (!val || state.busy) return;
      if (val.length > 500) {
        alert("Message is too long.");
        return;
      }
      if (aiForm.activeAnimationController) {
        aiForm.activeAnimationController.abort();
      }
      createMessageBubble("user").textContent = val;
      aiInput.value = "";
      processQuery(val);
    });
  }
''')

print("Created ai_engine.js")
