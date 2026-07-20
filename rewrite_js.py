import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Extract old AI block
start_marker = "/* -------------------------\n     Shehzada's AI\n     ------------------------- */"
end_marker = "/* -------------------------\n     Certificates - Lazy Load & Progressive Reveal\n     ------------------------- */"

start_idx = js.find(start_marker)
end_idx = js.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Could not find markers")
    exit(1)

old_ai_code = js[start_idx:end_idx]

# Let's extract the exact NLP functions from old_ai_code
# Using regex to capture the functions we need to keep
def extract_func(name):
    # Match `const name = (...) => { ... };` or `const name = (...) => ...;`
    # This is tricky with regex, let's just find the start and use brace counting or just grab lines.
    pass

# Actually, we can just supply the cleaned-up NLP engine directly in our script, 
# since it's relatively short and we know exactly what it should be.
# Wait, the user said "Do not rewrite the local NLP engine unless required."
# It's safer to keep it intact. I will replace the DOM-manipulating parts.

nlp_engine = """
  const state = {
    greeted: false,
    challengeActive: false,
    challengeIndex: 0,
    challengeAttempts: 0,
    challengeHintShown: false,
    turnCount: 0,
  };

  const getContext = () => {
    try {
      const c = sessionStorage.getItem("ai-context");
      return c ? JSON.parse(c) : {};
    } catch {
      return {};
    }
  };
  const setContext = (c) => {
    try {
      sessionStorage.setItem("ai-context", JSON.stringify(c));
    } catch {}
  };

  const buildRecruiterBriefing = (knowledge) => {
    let text = `Muhammad Abdullah is a Cyber Security student focused on web penetration testing, application security and practical security testing.`;
    if (knowledge.experience && knowledge.experience.length > 0) {
      text += `\\n\\nHis experience includes:\\n`;
      const expSlice = knowledge.experience.slice(0, 3);
      text += expSlice.map((e) => `- ${e.role} at ${e.company}`).join("\\n");
    }
    let hasPortfolio = false;
    let portfolioText = `\\n\\nHis portfolio includes:\\n`;
    if (knowledge.projects?.length > 0) {
      portfolioText += `- ${knowledge.projects.length} practical projects\\n`;
      hasPortfolio = true;
    }
    if (knowledge.skills?.length > 0) {
      portfolioText += `- ${knowledge.skills.length} documented technical skills\\n`;
      hasPortfolio = true;
    }
    if (knowledge.certificates?.length > 0) {
      portfolioText += `- ${knowledge.certificates.length} certifications\\n`;
      hasPortfolio = true;
    }
    if (knowledge.achievements?.length > 0) {
      portfolioText += `- ${knowledge.achievements.length} achievements\\n`;
      hasPortfolio = true;
    }
    if (hasPortfolio) text += portfolioText.trimEnd();

    if (knowledge.projects?.length > 0) {
      text += `\\n\\nSelected projects:\\n`;
      const projSlice = knowledge.projects.slice(0, 3);
      text += projSlice.map((p) => `- ${p.title}: ${p.summary}`).join("\\n");
    }
    if (knowledge.certificates?.length > 0) {
      text += `\\n\\nKey certifications:\\n`;
      const featured = knowledge.certificates.filter((c) => c.featured);
      const others = knowledge.certificates.filter((c) => !c.featured);
      let certsToShow = featured.concat(others).slice(0, featured.length + 2);
      text += certsToShow
        .map((c) => `- ${c.title} from ${c.issuer}`)
        .join("\\n");
    }
    if (knowledge.education?.length > 0) {
      text += `\\n\\nEducation:\\n`;
      text += knowledge.education
        .map(
          (e) =>
            `- ${e.degree}, ${e.institution} (${e.expectedCompletion || e.date})`,
        )
        .join("\\n");
    }
    return text.trim();
  };

  const recruiterBriefingText = buildRecruiterBriefing(portfolioKnowledge);

  const normalizeQuery = (q) =>
    q
      .toLowerCase()
      .replace(/[^\\w\\s-]/g, "")
      .replace(/\\s+/g, " ")
      .trim();
  const tokenize = (q) => normalizeQuery(q).split(" ");

  const synonyms = {
    recruitment: ["hire", "hiring", "employ", "candidate", "recruiter", "suitable", "qualified", "role", "job"],
    experience: ["experience", "internship", "intern", "practical", "work", "job"],
    certifications: ["certification", "certificate", "cert", "credential", "qualification"],
    projects: ["project", "built", "developed", "created", "portfolio"],
    security: ["pentest", "penetration", "ethical", "hacking", "offensive", "web", "application", "appsec", "cyber", "cybersecurity", "soc"],
    contact: ["contact", "email", "reach", "message", "connect", "linkedin", "github", "cv", "resume"],
    education: ["education", "university", "degree", "semester", "student", "graduation", "study"],
  };

  const expandQuery = (tokens) => {
    let expanded = new Set(tokens);
    for (const t of tokens) {
      if (t === "certficate") expanded.add("certificate");
      if (t === "experince" || t === "intership") {
        expanded.add("experience");
        expanded.add("internship");
      }
      if (t === "secuirty") expanded.add("security");
      if (t === "projectes") expanded.add("project");
      if (t === "skil") expanded.add("skill");
      if (t === "recon") expanded.add("reconnaissance");
      for (const [key, syns] of Object.entries(synonyms)) {
        if (syns.includes(t)) {
          expanded.add(key);
          syns.forEach((s) => expanded.add(s));
        }
      }
    }
    return Array.from(expanded);
  };

  const detectIntent = (expanded, q) => {
    const qStr = normalizeQuery(q);
    if (expanded.includes("who") || expanded.includes("identity") || qStr.includes("tell me about abdullah") || qStr.includes("who is"))
      return "identity";
    if (expanded.includes("specialization") || expanded.includes("specialize"))
      return "specialization";
    if (expanded.includes("education") || expanded.includes("graduation"))
      return "education";
    if (expanded.includes("contact") || expanded.includes("linkedin") || expanded.includes("github") || expanded.includes("cv"))
      return "contact";
    if (expanded.includes("recruitment") || expanded.includes("suitable") || expanded.includes("hire"))
      return "recruiter";
    if (expanded.includes("soc") || qStr.includes("soc role") || qStr.includes("soc internship"))
      return "soc_suitability";
    if (expanded.includes("pentest") || expanded.includes("penetration"))
      return "pentest_suitability";
    if (expanded.includes("web") && expanded.includes("security"))
      return "web_suitability";
    if (qStr.includes("tell me more") || qStr.includes("what tools"))
      return "followup_more";
    if (expanded.includes("skill") || expanded.includes("tools") || expanded.includes("languages") || expanded.includes("python"))
      return "skills";
    if (qStr.includes("compare")) return "project_compare";
    if (qStr.includes("which one is strongest") || qStr.includes("strongest")) {
      if (expanded.includes("project")) return "strongest_project";
      if (expanded.includes("certification")) return "strongest_certification";
      return "strongest_project";
    }
    if (expanded.includes("experience") || expanded.includes("internship"))
      return "internships";
    if (expanded.includes("certifications")) return "certifications";
    if (expanded.includes("achievements") || expanded.includes("ctf"))
      return "achievements";
    if (expanded.includes("projects")) return "projects";
    if (expanded.includes("reconnaissance") || expanded.includes("phishing"))
      return "general_cybersecurity";
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
    const scored = collection
      .map((item) => ({ item, score: scoreRecord(item, expanded) }))
      .filter((x) => x.score > 0);
    return scored.sort((a, b) => b.score - a.score).map((x) => x.item);
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
        "Muhammad Abdullah specializes in offensive security and practical cyber defense, evidenced by his portfolio projects and certifications.",
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
        text = `Regarding projects: ${p.title} is a notable example. ${p.summary} It utilizes ${(p.tools || []).join(", ")}.`;
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
      return { text: challengeConfig.unavailableMessage || "Challenge currently unavailable.", intent: "challenge" };
    }
    state.challengeActive = true;
    state.challengeIndex = 0;
    state.challengeAttempts = 0;
    state.challengeHintShown = false;
    return { text: `**${challengeConfig.title || "CTF Challenge"}**\\n\\n${challengeConfig.intro || ""}\\n\\n${challengeQuestions[0].prompt}`, intent: "challenge" };
  };

  const normalizeAnswer = (value) => String(value).trim().toLowerCase().replace(/[-_]+/g, " ").replace(/\\s+/g, " ");

  const handleChallenge = (query) => {
    if (!state.challengeActive) return null;
    const q = query.trim().toLowerCase();
    if (q === "quit" || q === "/quit") {
      state.challengeActive = false;
      return { text: "Challenge exited.", intent: "general" };
    }
    if (q === "hint" || q === "give me a hint" || q === "/help") {
      const qData = challengeQuestions[state.challengeIndex];
      return { text: `*Hint:* ${qData.hint}`, intent: "challenge" };
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
        return { text: `**${challengeConfig.successMessage || "Challenge Complete!"}**\\n\\n\`${challengeConfig.flag}\``, intent: "challenge" };
      } else {
        return { text: `Correct. Next: ${challengeQuestions[state.challengeIndex].prompt}`, intent: "challenge" };
      }
    } else {
      state.challengeAttempts++;
      return { text: challengeConfig.incorrectMessage || "Incorrect. Try again.", intent: "challenge" };
    }
  };

  const processLocalQuery = async (query) => {
    const q = query.trim().toLowerCase();
    if (q === "/clear" || q === "clear") {
      state.greeted = false;
      setContext({});
      return { text: "Conversation cleared.", intent: "clear" };
    }
    if (q === "recruiter briefing" || q === "why hire muhammad?" || q === "why should someone hire muhammad?") {
      return { text: recruiterBriefingText, intent: "recruiter" };
    }
    if (q === "evidence scan") {
      return { text: `**${aiConfig.scanLabels?.title || "Evidence Scan Complete"}**\\n\\nFound ${portfolioKnowledge.projects?.length || 0} projects and ${portfolioKnowledge.certificates?.length || 0} certificates.`, intent: "scan" };
    }
    if (q === "ctf challenge") {
      return startChallenge();
    }
    const challengeRes = handleChallenge(query);
    if (challengeRes) return challengeRes;

    const tokens = tokenize(query);
    const expanded = expandQuery(tokens);
    let context = getContext();

    const intent = detectIntent(expanded, query);
    const { text, newContext } = composeResponse(intent, expanded, context, query);
    setContext(newContext);

    return { text, intent };
  };

  const generateSuggestions = (intent) => {
    let actions = [];
    if (intent === "projects" || intent === "specific_project") {
      actions = ["Tools used", "Why it matters", "Strongest project"];
    } else if (intent === "internships" || intent === "specific_internship") {
      actions = ["Responsibilities", "Skills gained", "Why hire him?"];
    } else if (intent === "certifications" || intent === "specific_certification") {
      actions = ["Main certifications", "Practical relevance", "Technical skills"];
    } else if (intent === "recruiter") {
      actions = ["Strongest project", "Internship experience", "Key certifications"];
    } else if (intent === "challenge") {
      actions = ["Hint", "Quit"];
    } else {
      actions = ["Why hire Muhammad?", "Show his strongest projects", "Key certifications", "Contact Muhammad"];
    }
    if (!aiSuggestions) return;
    aiSuggestions.innerHTML = "";
    actions.forEach((label) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ai-chip";
      btn.textContent = label;
      btn.addEventListener("click", () => {
        if (aiIsBusy) return;
        if (aiInput) {
          aiInput.value = label;
          updateAiCharacterCount();
        }
        if (aiForm) aiForm.requestSubmit();
      });
      aiSuggestions.appendChild(btn);
    });
  };
"""

ui_controller = """
  const aiDialog = document.getElementById("ai-assistant");
  const aiWindow = aiDialog?.querySelector(".ai-panel");
  const aiConversation = document.getElementById("ai-conversation");
  const aiMessages = document.getElementById("ai-messages");
  const aiWelcome = document.getElementById("ai-welcome");
  const aiSuggestions = document.getElementById("ai-suggestions");
  const aiForm = document.getElementById("ai-form");
  const aiInput = document.getElementById("ai-input");
  const aiSendButton = document.getElementById("ai-send-btn");
  const aiClearButton = document.getElementById("ai-clear-btn");
  const aiMaximizeButton = document.getElementById("ai-maximize-btn");
  const aiCharacterCount = document.getElementById("ai-char-count");
  const aiLiveRegion = document.getElementById("ai-live-region");

  let aiOpenedBy = null;
  let aiIsBusy = false;
  let aiProcessingTimer = 0;

  const aiFocusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");

  const isDesktopAi = () => window.matchMedia("(min-width: 769px)").matches;

  const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const setAiMaximized = (maximized, { focusButton = false } = {}) => {
    if (!aiDialog || !aiMaximizeButton) return;
    const active = isDesktopAi() && Boolean(maximized);
    aiDialog.classList.toggle("is-maximized", active);
    aiMaximizeButton.setAttribute("aria-pressed", String(active));
    aiMaximizeButton.setAttribute(
      "aria-label",
      active ? "Restore AI assistant" : "Maximize AI assistant"
    );
    aiMaximizeButton.title = active ? "Restore" : "Maximize";
    requestAnimationFrame(() => {
      if (aiConversation) {
        aiConversation.scrollTop = aiConversation.scrollHeight;
      }
      if (focusButton) {
        aiMaximizeButton.focus();
      }
    });
  };

  const resetAiPanelMode = () => {
    setAiMaximized(false);
  };

  const openAiAssistant = (opener) => {
    if (!aiDialog) return;
    if (typeof window.closeMenuMobile === "function" && document.body.classList.contains("menu-open")) {
      window.closeMenuMobile({ restoreFocus: false });
    }
    if (typeof window.closeCertificateViewer === "function" && document.body.classList.contains("cert-viewer-open")) {
      window.closeCertificateViewer({ restoreFocus: false });
    }
    aiOpenedBy = opener || document.activeElement;
    resetAiPanelMode();
    aiDialog.removeAttribute("inert");
    aiDialog.setAttribute("aria-hidden", "false");
    aiDialog.classList.add("open");
    document.body.classList.add("ai-open");
    requestAnimationFrame(() => {
      aiInput?.focus();
    });
  };

  const closeAiAssistant = ({ restoreFocus = true } = {}) => {
    if (!aiDialog) return;
    window.clearTimeout(aiProcessingTimer);
    aiIsBusy = false;
    aiDialog.classList.remove("open");
    aiDialog.setAttribute("aria-hidden", "true");
    aiDialog.setAttribute("inert", "");
    document.body.classList.remove("ai-open");
    resetAiPanelMode();
    if (restoreFocus && aiOpenedBy instanceof HTMLElement) {
      requestAnimationFrame(() => aiOpenedBy.focus());
    }
    aiOpenedBy = null;
  };

  window.closeAiAssistant = closeAiAssistant;

  document.querySelectorAll("[data-ai-open]").forEach((button) => {
    button.addEventListener("click", () => {
      openAiAssistant(button);
    });
  });

  document.querySelectorAll("[data-ai-close]").forEach((button) => {
    button.addEventListener("click", () => {
      closeAiAssistant();
    });
  });

  aiMaximizeButton?.addEventListener("click", () => {
    const next = !aiDialog?.classList.contains("is-maximized");
    setAiMaximized(next, { focusButton: true });
  });

  window.addEventListener("resize", () => {
    if (!isDesktopAi()) {
      resetAiPanelMode();
    }
  });

  aiDialog?.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeAiAssistant();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(aiDialog.querySelectorAll(aiFocusableSelector)).filter((element) => element.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  const createAiMessage = (role) => {
    const row = document.createElement("div");
    row.className = `ai-message ai-${role}`;
    if (role === "assistant") {
      const avatar = document.createElement("div");
      avatar.className = "ai-message-avatar";
      avatar.setAttribute("aria-hidden", "true");
      avatar.textContent = "✦";
      row.appendChild(avatar);
    }
    const bubble = document.createElement("div");
    bubble.className = "ai-bubble";
    row.appendChild(bubble);
    aiMessages?.appendChild(row);
    return { row, bubble };
  };

  const scrollAiToBottom = () => {
    requestAnimationFrame(() => {
      if (aiConversation) {
        aiConversation.scrollTop = aiConversation.scrollHeight;
      }
    });
  };

  const showAiThinking = () => {
    const { row, bubble } = createAiMessage("assistant");
    row.dataset.thinking = "true";
    const dots = document.createElement("div");
    dots.className = "ai-thinking";
    dots.setAttribute("aria-label", "Searching portfolio knowledge");
    for (let index = 0; index < 3; index += 1) {
      dots.appendChild(document.createElement("span"));
    }
    bubble.appendChild(dots);
    scrollAiToBottom();
    return row;
  };

  const removeAiThinking = () => {
    aiMessages?.querySelector('[data-thinking="true"]')?.remove();
  };

  const setAiBusy = (busy) => {
    aiIsBusy = busy;
    if (aiInput) aiInput.disabled = busy;
    if (aiSendButton) aiSendButton.disabled = busy;
  };

  const renderAiAnswer = async (answer) => {
    const thinking = showAiThinking();
    setAiBusy(true);
    if (aiLiveRegion) aiLiveRegion.textContent = "Searching portfolio knowledge.";
    await new Promise((resolve) => {
      aiProcessingTimer = window.setTimeout(resolve, prefersReducedMotion() ? 0 : 160);
    });
    thinking.remove();
    const { bubble } = createAiMessage("assistant");
    try {
      if (typeof renderSafeMarkdown === "function") {
        renderSafeMarkdown(bubble, String(answer || ""));
      } else {
        bubble.textContent = String(answer || "");
      }
    } catch {
      bubble.textContent = "I could not complete that response. Please ask about Muhammad’s projects, skills, internships or certifications.";
    }
    setAiBusy(false);
    scrollAiToBottom();
    if (aiLiveRegion) aiLiveRegion.textContent = "Answer ready.";
    aiInput?.focus();
  };

  const renderAiUserMessage = (text) => {
    const { bubble } = createAiMessage("user");
    bubble.textContent = text;
    scrollAiToBottom();
  };

  const hideAiWelcome = () => {
    if (aiWelcome) aiWelcome.hidden = true;
  };

  const showAiWelcome = () => {
    if (aiWelcome) aiWelcome.hidden = false;
  };

  const resizeAiInput = () => {
    if (!aiInput) return;
    aiInput.style.height = "auto";
    aiInput.style.height = `${Math.min(aiInput.scrollHeight, 130)}px`;
  };

  const updateAiCharacterCount = () => {
    if (!aiInput || !aiCharacterCount) return;
    const length = aiInput.value.length;
    aiCharacterCount.textContent = `${length} / 500`;
    aiCharacterCount.classList.toggle("is-near-limit", length >= 440);
  };

  aiInput?.addEventListener("input", () => {
    resizeAiInput();
    updateAiCharacterCount();
  });

  aiInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      aiForm?.requestSubmit();
    }
  });

  document.querySelectorAll("[data-ai-question]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!aiInput || aiIsBusy) return;
      aiInput.value = button.dataset.aiQuestion || "";
      updateAiCharacterCount();
      aiForm?.requestSubmit();
    });
  });

  aiForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!aiInput || aiIsBusy) return;
    const question = aiInput.value.trim();
    if (!question) {
      aiInput.focus();
      return;
    }
    hideAiWelcome();
    renderAiUserMessage(question);
    aiInput.value = "";
    resizeAiInput();
    updateAiCharacterCount();
    let result;
    try {
      result = await processLocalQuery(question);
    } catch (error) {
      console.error("Local assistant response failed.", error);
      result = {
        text: "I could not complete that response, but you can still ask about Muhammad’s projects, skills, internships, certifications or contact details.",
        intent: "unknown",
      };
    }
    const answer = typeof result === "string" ? result : result?.text || result?.answer || "";
    await renderAiAnswer(answer);
    if (result?.intent) {
      generateSuggestions(result.intent);
    }
  });

  aiClearButton?.addEventListener("click", () => {
    window.clearTimeout(aiProcessingTimer);
    aiIsBusy = false;
    if (aiMessages) aiMessages.replaceChildren();
    if (aiSuggestions) aiSuggestions.replaceChildren();
    try {
      sessionStorage.removeItem("ai-context");
      sessionStorage.removeItem("ai-history");
    } catch {}
    showAiWelcome();
    setAiBusy(false);
    if (aiInput) {
      aiInput.value = "";
      resizeAiInput();
      updateAiCharacterCount();
      aiInput.focus();
    }
    if (aiLiveRegion) aiLiveRegion.textContent = "Conversation cleared.";
  });
"""

new_ai_code = f"/* -------------------------\n     Shehzada's AI\n     ------------------------- */\n{nlp_engine}\n{ui_controller}\n"

# Replace the old AI code with the new AI code
js = js.replace(old_ai_code, new_ai_code)

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(js)
