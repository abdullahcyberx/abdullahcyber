  /* -------------------------
     Shehzada's AI
     ------------------------- */
  const aiPanel = document.getElementById("ai-assistant");
  const aiInput = document.getElementById("ai-input");
  const aiForm = document.getElementById("ai-form");
  const aiMessages = document.getElementById("ai-messages");
  const aiSuggestions = document.getElementById("ai-suggestions");
  const aiVoiceInputBtn = document.getElementById("ai-voice-input");
  const aiVoiceOutputBtn = document.getElementById("ai-voice-output");
  const aiLiveRegion = document.getElementById("ai-live-region");
  const aiFocusableSelectors =
    'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select';

  let lastOpenedBy = null;
  let activeResponseController = null;

  const state = {
    greeted: false,
    busy: false,
    sound: false,
    challengeActive: false,
    challengeIndex: 0,
    challengeAttempts: 0,
    challengeHintShown: false,
    turnCount: 0
  };

  const getContext = () => {
    try {
      const c = sessionStorage.getItem("ai-context");
      return c ? JSON.parse(c) : {};
    } catch { return {}; }
  };
  const setContext = (c) => {
    try { sessionStorage.setItem("ai-context", JSON.stringify(c)); } catch {}
  };

  const escapeHTML = (value) => String(value).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c]);

  // Recruiter Briefing
  const buildRecruiterBriefing = (knowledge) => {
    let text = `Muhammad Abdullah is a Cyber Security student focused on web penetration testing, application security and practical security testing.`;
    if (knowledge.experience && knowledge.experience.length > 0) {
      text += `\n\nHis experience includes:\n`;
      const expSlice = knowledge.experience.slice(0, 3);
      text += expSlice.map(e => `- ${e.role} at ${e.company}`).join("\n");
    }
    let hasPortfolio = false;
    let portfolioText = `\n\nHis portfolio includes:\n`;
    if (knowledge.projects?.length > 0) { portfolioText += `- ${knowledge.projects.length} practical projects\n`; hasPortfolio = true; }
    if (knowledge.skills?.length > 0) { portfolioText += `- ${knowledge.skills.length} documented technical skills\n`; hasPortfolio = true; }
    if (knowledge.certificates?.length > 0) { portfolioText += `- ${knowledge.certificates.length} certifications\n`; hasPortfolio = true; }
    if (knowledge.achievements?.length > 0) { portfolioText += `- ${knowledge.achievements.length} achievements\n`; hasPortfolio = true; }
    if (hasPortfolio) text += portfolioText.trimEnd();

    if (knowledge.projects?.length > 0) {
      text += `\n\nSelected projects:\n`;
      const projSlice = knowledge.projects.slice(0, 3);
      text += projSlice.map(p => `- ${p.title}: ${p.summary}`).join("\n");
    }
    if (knowledge.certificates?.length > 0) {
      text += `\n\nKey certifications:\n`;
      const featured = knowledge.certificates.filter(c => c.featured);
      const others = knowledge.certificates.filter(c => !c.featured);
      let certsToShow = featured.concat(others).slice(0, featured.length + 2);
      text += certsToShow.map(c => `- ${c.title} from ${c.issuer}`).join("\n");
    }
    if (knowledge.education?.length > 0) {
      text += `\n\nEducation:\n`;
      text += knowledge.education.map(e => `- ${e.degree}, ${e.institution} (${e.expectedCompletion || e.date})`).join("\n");
    }
    return text.trim();
  };

  const recruiterBriefingText = buildRecruiterBriefing(portfolioKnowledge);

  const scrollMessages = () => requestAnimationFrame(() => {
    if (aiMessages) aiMessages.scrollTop = aiMessages.scrollHeight;
  });

  const speakText = (text) => {
    if (!state.sound || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const temp = document.createElement("div");
    temp.innerHTML = text;
    const utterance = new SpeechSynthesisUtterance(temp.textContent || temp.innerText || "");
    window.speechSynthesis.speak(utterance);
  };

  const setBusy = (isBusy) => {
    state.busy = isBusy;
    if (aiInput) aiInput.disabled = isBusy;
    const btn = aiForm?.querySelector('button[type="submit"]');
    if (btn) btn.disabled = isBusy;
    if (!isBusy && aiInput && aiPanel?.classList.contains("open")) {
      setTimeout(() => { if (aiPanel?.classList.contains("open")) aiInput.focus(); }, 50);
    }
  };

  const renderQuickActions = (items) => {
    if (!aiSuggestions) return;
    aiSuggestions.innerHTML = "";
    items.forEach(item => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ai-chip";
      btn.textContent = item.label;
      if (item.special) btn.dataset.aiSpecial = item.special;
      btn.addEventListener("click", () => {
        if (state.busy) return;
        if (item.special) {
          handleSpecial(item.special);
        } else {
          if (aiInput) aiInput.value = btn.textContent;
          if (aiForm) aiForm.dispatchEvent(new Event("submit", { cancelable: true }));
        }
      });
      aiSuggestions.appendChild(btn);
    });
  };

  const defaultActions = () => {
    const actions = [
      { label: "Why hire Muhammad?" },
      { label: "Show his strongest projects" },
      { label: "Explain his internships" },
      { label: "Key certifications" },
      { label: "Contact Muhammad" },
      { label: "Recruiter briefing", special: "brief" },
      { label: "Evidence scan", special: "scan" },
      { label: "CTF challenge", special: "challenge" }
    ];
    renderQuickActions(actions);
  };

  const generateSuggestions = (intent) => {
    let actions = [];
    if (intent === "projects" || intent === "specific_project") {
      actions = [{ label: "Tools used" }, { label: "Why it matters" }, { label: "Strongest project" }, { label: "View Projects", special: "nav-projects" }];
    } else if (intent === "internships" || intent === "specific_internship") {
      actions = [{ label: "Responsibilities" }, { label: "Skills gained" }, { label: "Why hire him?" }, { label: "View Experience", special: "nav-experience" }];
    } else if (intent === "certifications" || intent === "specific_certification") {
      actions = [{ label: "Main certifications" }, { label: "Practical relevance" }, { label: "Technical skills" }, { label: "View Certificates", special: "nav-credentials" }];
    } else if (intent === "recruiter") {
      actions = [{ label: "Strongest project" }, { label: "Internship experience" }, { label: "Key certifications" }, { label: "Contact Muhammad", special: "nav-contact" }];
    } else {
      actions = [
        { label: "Why hire Muhammad?" },
        { label: "Show his strongest projects" },
        { label: "Key certifications" },
        { label: "Contact Muhammad" }
      ];
    }
    renderQuickActions(actions);
  };

  const createMessageBubble = (role) => {
    const msg = document.createElement("div");
    msg.className = `ai-message ai-${role}`;
    if (aiMessages) aiMessages.appendChild(msg);
    scrollMessages();
    return msg;
  };

  const renderProgressiveText = async (bubble, text, htmlMode = false, signal) => {
    bubble.innerHTML = "";
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || htmlMode) {
      if (htmlMode) bubble.innerHTML = text;
      else bubble.textContent = text;
      scrollMessages();
      return;
    }
    const chunks = text.split(/(\s+)/);
    const delay = Math.max(10, Math.min(40, 600 / chunks.length));
    let current = "";
    for (const chunk of chunks) {
      if (signal?.aborted) break;
      current += chunk + " ";
      bubble.textContent = current;
      scrollMessages();
      await new Promise(r => setTimeout(r, delay));
    }
  };

  // Local AI Engine
  const normalizeQuery = (q) => q.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, " ").trim();
  const tokenize = (q) => normalizeQuery(q).split(" ");
  
  const synonyms = {
    recruitment: ["hire", "hiring", "employ", "candidate", "recruiter", "suitable", "qualified", "role", "job"],
    experience: ["experience", "internship", "intern", "practical", "work", "job"],
    certifications: ["certification", "certificate", "cert", "credential", "qualification"],
    projects: ["project", "built", "developed", "created", "portfolio"],
    security: ["pentest", "penetration", "ethical", "hacking", "offensive", "web", "application", "appsec", "cyber", "cybersecurity", "soc"],
    contact: ["contact", "email", "reach", "message", "connect", "linkedin", "github", "cv", "resume"],
    education: ["education", "university", "degree", "semester", "student", "graduation", "study"]
  };

  const expandQuery = (tokens) => {
    let expanded = new Set(tokens);
    for (const t of tokens) {
      if (t === "certficate") expanded.add("certificate");
      if (t === "experince" || t === "intership") { expanded.add("experience"); expanded.add("internship"); }
      if (t === "secuirty") expanded.add("security");
      if (t === "projectes") expanded.add("project");
      if (t === "skil") expanded.add("skill");
      if (t === "recon") expanded.add("reconnaissance");
      for (const [key, syns] of Object.entries(synonyms)) {
        if (syns.includes(t)) {
          expanded.add(key);
          syns.forEach(s => expanded.add(s));
        }
      }
    }
    return Array.from(expanded);
  };

  const detectIntent = (expanded, q) => {
    const qStr = normalizeQuery(q);
    if (expanded.includes("who") || expanded.includes("identity") || qStr.includes("tell me about abdullah") || qStr.includes("who is")) return "identity";
    if (expanded.includes("specialization") || expanded.includes("specialize")) return "specialization";
    if (expanded.includes("education") || expanded.includes("graduation")) return "education";
    if (expanded.includes("contact") || expanded.includes("linkedin") || expanded.includes("github") || expanded.includes("cv")) return "contact";
    if (expanded.includes("recruitment") || expanded.includes("suitable") || expanded.includes("hire")) return "recruiter";
    if (expanded.includes("soc") || qStr.includes("soc role") || qStr.includes("soc internship")) return "soc_suitability";
    if (expanded.includes("pentest") || expanded.includes("penetration")) return "pentest_suitability";
    if (expanded.includes("web") && expanded.includes("security")) return "web_suitability";
    
    if (qStr.includes("tell me more") || qStr.includes("what tools")) return "followup_more";
    if (expanded.includes("skill") || expanded.includes("tools") || expanded.includes("languages") || expanded.includes("python")) return "skills";
    if (qStr.includes("compare")) return "project_compare";
    if (qStr.includes("which one is strongest") || qStr.includes("strongest")) {
      if (expanded.includes("project")) return "strongest_project";
      if (expanded.includes("certification")) return "strongest_certification";
      return "strongest_project";
    }

    if (expanded.includes("experience") || expanded.includes("internship")) return "internships";
    if (expanded.includes("certifications")) return "certifications";
    if (expanded.includes("achievements") || expanded.includes("ctf")) return "achievements";
    if (expanded.includes("projects")) return "projects";
    if (expanded.includes("reconnaissance") || expanded.includes("phishing")) return "general_cybersecurity";
    
    return "unknown";
  };

  const scoreRecord = (record, expanded) => {
    let score = 0;
    const title = normalizeQuery(record.title || record.role || record.name || record.degree || "");
    const desc = normalizeQuery(record.summary || record.description || record.company || "");
    const tools = (record.tools || []).map(normalizeQuery).join(" ");
    
    for (const token of expanded) {
      if (title.includes(token)) score += 10;
      if (tools.includes(token)) score += 5;
      if (desc.includes(token)) score += 2;
    }
    if (expanded.join(" ") === title) score += 50;
    return score;
  };

  const searchPortfolio = (expanded, collection) => {
    if (!collection) return [];
    const scored = collection.map(item => ({ item, score: scoreRecord(item, expanded) })).filter(x => x.score > 0);
    return scored.sort((a, b) => b.score - a.score).map(x => x.item);
  };

  const composeResponse = (intent, expanded, context, q) => {
    let text = "";
    let newContext = { ...context };
    const qStr = normalizeQuery(q);
    state.turnCount++;

    const getVariation = (options) => options[state.turnCount % options.length];

    if (intent === "identity") {
      text = getVariation([
        "Muhammad Abdullah is a Cyber Security student focusing on web application security, penetration testing, and practical security projects.",
        "Muhammad Abdullah is an early-career cybersecurity candidate with hands-on experience through internships and technical projects.",
        "Muhammad Abdullah specializes in offensive security and practical cyber defense, evidenced by his portfolio projects and certifications."
      ]);
    } else if (intent === "contact") {
      text = "You can contact Muhammad through the contact form at the bottom of the page, or via his verified LinkedIn and GitHub profiles. His email is also listed in his CV.";
    } else if (intent === "specialization") {
      text = "He specializes in web application security and penetration testing. This is demonstrated by his practical projects, such as the Modular Recon Tool, and his internship experience.";
    } else if (intent === "skills") {
      if (qStr.includes("python")) {
        text = "Yes, Python appears prominently in his portfolio. He used it to build the Modular Recon Tool, demonstrating network programming and security automation skills.";
        newContext.lastEntity = "Modular Recon Tool";
      } else {
        text = "Muhammad's technical skills include Python, Linux, networking, Docker, and various security tools. You can view the full interactive skill keyboard below for details.";
      }
    } else if (intent === "strongest_project") {
      text = "His strongest documented work is likely the Modular Recon Tool, as it demonstrates independent Python development, networking knowledge, and practical tool-building for security assessments.";
      newContext.lastEntity = "Modular Recon Tool";
    } else if (intent === "projects") {
      const topProjects = searchPortfolio(expanded, portfolioKnowledge.projects);
      if (topProjects.length > 0 && topProjects[0].title.toLowerCase() !== "ctf") {
        const p = topProjects[0];
        text = `Regarding projects: ${p.title} is a notable example. ${p.summary} It utilizes ${(p.tools||[]).join(", ")}.`;
        newContext.lastEntity = p.title;
        newContext.lastIntent = "projects";
      } else {
        text = "Muhammad has several practical projects, including a Modular Recon Tool, a simulated phishing campaign, and a honeypot setup. These show hands-on technical engagement.";
      }
    } else if (intent === "internships") {
      if (portfolioKnowledge.experience && portfolioKnowledge.experience.length > 0) {
        const exp = portfolioKnowledge.experience[0];
        text = `His experience includes working as a ${exp.role} at ${exp.company}. ${exp.description}`;
        newContext.lastEntity = exp.role;
        newContext.lastIntent = "internships";
      } else {
        text = "He has internship experience in cybersecurity, involving practical tasks like penetration testing and vulnerability assessments.";
      }
    } else if (intent === "certifications") {
      text = "Muhammad holds several certifications that validate his knowledge. Key credentials include his practical training and achievements in offensive security and networking.";
    } else if (intent === "recruiter" || intent === "soc_suitability" || intent === "pentest_suitability" || intent === "web_suitability") {
      text = "His portfolio presents him as an early-career candidate with practical exposure rather than a senior specialist. For a cybersecurity role, the strongest evidence is his practical project work combined with his internships and offensive-security certifications.";
    } else if (intent === "education") {
      text = "He is currently pursuing a degree in Cyber Security. His academic foundation is complemented by hands-on labs and certifications.";
    } else if (intent === "achievements") {
      text = "His achievements include participating in CTFs and earning security badges, which shows a continuous commitment to practical learning.";
    } else if (intent === "project_compare") {
      text = "Comparing his projects: the Modular Recon Tool focuses on scripting and network enumeration, whereas his phishing campaign project highlights social engineering awareness and reporting. Both show different practical aspects of security.";
    } else if (intent === "followup_more") {
      if (context.lastEntity) {
        text = `Regarding ${context.lastEntity}, the portfolio indicates he used relevant tools to solve practical challenges. For example, his projects often involve Python, Linux, and networking utilities.`;
      } else {
        text = "Muhammad's portfolio combines practical projects, internships, and certifications to demonstrate his readiness for cybersecurity roles.";
      }
    } else if (intent === "general_cybersecurity") {
      if (qStr.includes("reconnaissance")) {
        text = "Reconnaissance is the information-gathering phase of a security assessment. In Muhammad's portfolio, this is demonstrated through his Modular Recon Tool.";
      } else {
        text = "I'm focused on Muhammad's portfolio and cybersecurity background. I can help with his projects, skills, internships, certifications, achievements or contact details.";
      }
    } else {
      text = "I'm focused on Muhammad's portfolio and cybersecurity background. I can help with his projects, skills, internships, certifications, achievements or contact details.";
    }

    return { text, newContext };
  };

  const challengeConfig = aiConfig.ctfChallengeData || {};
  const challengeQuestions = Array.isArray(challengeConfig.questions) ? challengeConfig.questions : [];

  const startChallenge = () => {
    if (challengeQuestions.length === 0) {
      createMessageBubble("ai").innerHTML = challengeConfig.unavailableMessage || "Challenge currently unavailable.";
      defaultActions();
      return;
    }
    state.challengeActive = true;
    state.challengeIndex = 0;
    state.challengeAttempts = 0;
    state.challengeHintShown = false;

    createMessageBubble("ai").innerHTML = `<p><strong>${escapeHTML(challengeConfig.title || "CTF Challenge")}</strong></p><p>${escapeHTML(challengeConfig.intro || "")}</p>`;

    setTimeout(() => {
      createMessageBubble("ai").innerHTML = `<p>${escapeHTML(challengeQuestions[0].prompt)}</p>`;
      renderQuickActions([
        { label: "Hint", special: "hint" },
        { label: "Quit", special: "quit-challenge" }
      ]);
    }, 400);
  };

  const normalizeAnswer = (value) => String(value).trim().toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ");

  const handleChallenge = (query) => {
    if (!state.challengeActive) return false;
    const q = query.trim().toLowerCase();
    if (q === "quit" || q === "/quit") {
      state.challengeActive = false;
      createMessageBubble("ai").textContent = "Challenge exited.";
      defaultActions();
      return true;
    }
    if (q === "hint" || q === "give me a hint" || q === "/help") {
      const qData = challengeQuestions[state.challengeIndex];
      createMessageBubble("ai").innerHTML = `<p><em>Hint:</em> ${escapeHTML(qData.hint)}</p>`;
      return true;
    }
    const qData = challengeQuestions[state.challengeIndex];
    const normalizedQuery = normalizeAnswer(query);
    const isCorrect = Array.isArray(qData.answers) && qData.answers.some((ans) => normalizeAnswer(ans) === normalizedQuery);

    if (isCorrect) {
      state.challengeIndex++;
      state.challengeAttempts = 0;
      state.challengeHintShown = false;
      if (state.challengeIndex >= challengeQuestions.length) {
        state.challengeActive = false;
        createMessageBubble("ai").innerHTML = `<p><strong>${escapeHTML(challengeConfig.successMessage || "Challenge Complete!")}</strong></p><p style="font-family: monospace; padding: 8px; background: var(--surface); border-radius: 4px;">${escapeHTML(challengeConfig.flag)}</p>`;
        defaultActions();
      } else {
        createMessageBubble("ai").innerHTML = `<p>Correct. Next: ${escapeHTML(challengeQuestions[state.challengeIndex].prompt)}</p>`;
      }
    } else {
      state.challengeAttempts++;
      createMessageBubble("ai").innerHTML = `<p>${escapeHTML(challengeConfig.incorrectMessage || "Incorrect. Try again.")}</p>`;
    }
    return true;
  };

  const processQuery = (query) => {
    if (handleChallenge(query)) return;

    if (query.toLowerCase() === "/clear" || query.toLowerCase() === "clear") {
      if (activeResponseController) activeResponseController.abort();
      if (aiMessages) aiMessages.innerHTML = "";
      state.greeted = false;
      setContext({});
      createMessageBubble("ai").innerHTML = aiConfig.greeting || "Hi — I'm Shehzada's AI. I can guide you through Muhammad's projects, skills, internships, certifications and practical cybersecurity work. What would you like to explore?";
      defaultActions();
      return;
    }

    if (state.busy) return;
    setBusy(true);
    
    const statusBubble = createMessageBubble("ai");
    statusBubble.innerHTML = `<span style="opacity: 0.7; font-style: italic;">Searching portfolio knowledge...</span>`;

    const abortCtrl = new AbortController();
    activeResponseController = abortCtrl;
    
    renderQuickActions([{ label: "Stop", special: "stop-generation" }]);

    setTimeout(() => {
      if (abortCtrl.signal.aborted) {
        statusBubble.remove();
        setBusy(false);
        defaultActions();
        return;
      }
      
      const tokens = tokenize(query);
      const expanded = expandQuery(tokens);
      let context = getContext();
      
      const intent = detectIntent(expanded, query);
      const { text, newContext } = composeResponse(intent, expanded, context, query);
      
      setContext(newContext);
      
      renderProgressiveText(statusBubble, text, false, abortCtrl.signal).then(() => {
        if (!abortCtrl.signal.aborted) {
          generateSuggestions(intent);
          if (aiLiveRegion) aiLiveRegion.textContent = "Answer ready.";
        }
        setBusy(false);
        activeResponseController = null;
      });
      
    }, 150 + Math.random() * 100);
  };

  const runScan = () => {
    if (state.busy) return;
    setBusy(true);
    const msg = createMessageBubble("ai");
    msg.innerHTML = `<p>${escapeHTML(aiConfig.scanLabels?.summary || "Scanning...")}</p>`;
    setTimeout(() => {
      msg.innerHTML = `<p><strong>${escapeHTML(aiConfig.scanLabels?.title || "Evidence Scan Complete")}</strong></p><p>Found ${portfolioKnowledge.projects?.length || 0} projects and ${portfolioKnowledge.certificates?.length || 0} certificates.</p>`;
      setBusy(false);
      defaultActions();
    }, 800);
  };

  const displayRecruiterBriefing = () => {
    const briefHtml = `<p><strong>${escapeHTML(aiConfig.recruiterBriefingLabels?.title || "Recruiter Briefing")}</strong></p>
      <div style="white-space: pre-wrap; font-size: 0.9em;">${escapeHTML(recruiterBriefingText)}</div>
      <div style="margin-top: 8px;">
        <button type="button" class="ai-chip" data-ai-special="copy-brief">Copy summary</button>
        <span id="copy-status" style="font-size: 0.8em; color: var(--text-muted); margin-left: 8px; display: none;">Copied!</span>
      </div>`;
    createMessageBubble("ai").innerHTML = briefHtml;
    defaultActions();
  };

  const copyRecruiterBriefing = () => {
    const onSuccess = () => {
      if (aiLiveRegion) aiLiveRegion.textContent = "Summary copied to clipboard";
      const statusEl = document.getElementById("copy-status");
      if (statusEl) {
        statusEl.style.display = "inline";
        setTimeout(() => { statusEl.style.display = "none"; }, 3000);
      }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(recruiterBriefingText).then(onSuccess).catch(() => {});
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = recruiterBriefingText;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try { document.execCommand("copy"); onSuccess(); } catch (err) {}
      document.body.removeChild(textarea);
    }
  };

  const handleSpecial = (special) => {
    if (special === "stop-generation") {
      if (activeResponseController) {
        activeResponseController.abort();
        setBusy(false);
        defaultActions();
      }
      return;
    }
    if (special === "brief") displayRecruiterBriefing();
    if (special === "scan") runScan();
    if (special === "challenge") startChallenge();
    if (special === "copy-brief") copyRecruiterBriefing();
    if (special === "hint") handleChallenge("hint");
    if (special === "quit-challenge") handleChallenge("quit");
    if (special === "nav-projects") window.location.hash = "#projects";
    if (special === "nav-experience") window.location.hash = "#experience";
    if (special === "nav-credentials") window.location.hash = "#credentials";
    if (special === "nav-contact") window.location.hash = "#contact";
  };

  // Voice Features
  let recognition = null;
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRec && aiVoiceInputBtn) {
    aiVoiceInputBtn.hidden = false;
    recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (aiInput) {
        aiInput.value = transcript;
        aiInput.focus();
      }
      aiVoiceInputBtn.setAttribute("aria-pressed", "false");
      aiVoiceInputBtn.setAttribute("aria-label", "Start voice input");
    };

    recognition.onerror = () => {
      aiVoiceInputBtn.setAttribute("aria-pressed", "false");
      aiVoiceInputBtn.setAttribute("aria-label", "Start voice input");
    };

    recognition.onend = () => {
      aiVoiceInputBtn.setAttribute("aria-pressed", "false");
      aiVoiceInputBtn.setAttribute("aria-label", "Start voice input");
    };

    aiVoiceInputBtn.addEventListener("click", () => {
      if (aiVoiceInputBtn.getAttribute("aria-pressed") === "true") {
        recognition.stop();
        aiVoiceInputBtn.setAttribute("aria-pressed", "false");
        aiVoiceInputBtn.setAttribute("aria-label", "Start voice input");
      } else {
        try {
          recognition.start();
          aiVoiceInputBtn.setAttribute("aria-pressed", "true");
          aiVoiceInputBtn.setAttribute("aria-label", "Stop voice input");
        } catch (e) {
          aiVoiceInputBtn.setAttribute("aria-pressed", "false");
          aiVoiceInputBtn.setAttribute("aria-label", "Start voice input");
        }
      }
    });
  }

  if (window.speechSynthesis && aiVoiceOutputBtn) {
    aiVoiceOutputBtn.hidden = false;
    aiVoiceOutputBtn.addEventListener("click", () => {
      state.sound = !state.sound;
      aiVoiceOutputBtn.setAttribute("aria-pressed", state.sound ? "true" : "false");
      aiVoiceOutputBtn.setAttribute("aria-label", state.sound ? "Disable speech output" : "Enable speech output");
      if (!state.sound) window.speechSynthesis.cancel();
    });
  }

  // Accessibility Focus Trap
  const trapFocus = (e) => {
    if (e.key === "Tab" && aiPanel.classList.contains("open")) {
      const focusables = Array.from(aiPanel.querySelectorAll(aiFocusableSelectors)).filter(
        el => !el.disabled && el.offsetParent !== null && !el.hidden && el.getAttribute("tabindex") !== "-1"
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    if (e.key === "Escape" && aiPanel.classList.contains("open")) {
      e.preventDefault();
      closeAi();
    }
  };

  const openAi = (e) => {
    if (!aiPanel) return;
    lastOpenedBy = document.activeElement;
    if (e && e.currentTarget) lastOpenedBy = e.currentTarget;

    aiPanel.removeAttribute("inert");
    aiPanel.setAttribute("aria-hidden", "false");
    aiPanel.classList.add("open");
    document.body.classList.add("ai-open");

    if (aiInput) setTimeout(() => aiInput.focus(), 50);
    document.addEventListener("keydown", trapFocus);

    if (!state.greeted) {
      state.greeted = true;
      if (aiConfig.privacyMessage) {
        createMessageBubble("ai").innerHTML = aiConfig.privacyMessage;
      }
      createMessageBubble("ai").innerHTML = aiConfig.greeting || "Hi — I'm Shehzada's AI. I can guide you through Muhammad's projects, skills, internships, certifications and practical cybersecurity work. What would you like to explore?";
      defaultActions();
    }
  };

  const closeAi = () => {
    if (!aiPanel) return;
    aiPanel.setAttribute("aria-hidden", "true");
    aiPanel.setAttribute("inert", "");
    aiPanel.classList.remove("open");
    document.body.classList.remove("ai-open");

    document.removeEventListener("keydown", trapFocus);

    if (activeResponseController) {
      activeResponseController.abort();
      setBusy(false);
      defaultActions();
    }

    if (recognition && aiVoiceInputBtn && aiVoiceInputBtn.getAttribute("aria-pressed") === "true") {
      recognition.stop();
      aiVoiceInputBtn.setAttribute("aria-pressed", "false");
      aiVoiceInputBtn.setAttribute("aria-label", "Start voice input");
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    if (lastOpenedBy && typeof lastOpenedBy.focus === "function") lastOpenedBy.focus();
  };

  document.querySelectorAll("[data-ai-open]").forEach(btn => btn.addEventListener("click", openAi));
  document.querySelectorAll("[data-ai-close]").forEach(btn => btn.addEventListener("click", closeAi));

  if (aiForm) {
    aiInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        aiForm.dispatchEvent(new Event("submit", { cancelable: true }));
      }
    });
    aiForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = aiInput.value.trim();
      if (!val || state.busy) return;
      if (val.length > 500) {
        alert("Message is too long.");
        return;
      }
      createMessageBubble("user").textContent = val;
      aiInput.value = "";
      setTimeout(() => processQuery(val), 10);
    });
  }
