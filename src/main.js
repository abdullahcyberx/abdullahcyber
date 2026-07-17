(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  });

  const finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)",
  ).matches;

  /* -------------------------
     Section Observer
     ------------------------- */
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("entered");
          obs.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -50px 0px", threshold: 0.1 },
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

  const contactObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          document.body.classList.add("contact-visible");
        } else {
          document.body.classList.remove("contact-visible");
        }
      });
    },
    { threshold: 0.1 },
  );

  const contactSection = document.getElementById("contact");
  if (contactSection) {
    contactObserver.observe(contactSection);
  }

  /* -------------------------
     Mobile Menu Accessibility
     ------------------------- */
  const mobileMenuToggle = document.getElementById("mobile-menu-trigger");
  const mobileMenuClose = document.getElementById("mobile-menu-close");
  const mobileMenu = document.getElementById("mobile-menu");
  const focusableSelectors =
    'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select';

  if (mobileMenuToggle && mobileMenuClose && mobileMenu) {
    let focusables = [];

    const mainElement = document.querySelector("main");

    const openMenu = () => {
      mobileMenu.classList.add("open");
      document.body.classList.add("menu-open");
      mobileMenu.setAttribute("aria-hidden", "false");
      mobileMenuToggle.setAttribute("aria-expanded", "true");
      if (mainElement) {
        if ("inert" in HTMLElement.prototype) {
          mainElement.inert = true;
        } else {
          mainElement.setAttribute("aria-hidden", "true");
        }
      }

      focusables = Array.from(mobileMenu.querySelectorAll(focusableSelectors));
      if (focusables.length) focusables[0].focus();
    };

    const closeMenu = ({ restoreFocus = true } = {}) => {
      mobileMenu.classList.remove("open");
      document.body.classList.remove("menu-open");
      mobileMenu.setAttribute("aria-hidden", "true");
      mobileMenuToggle.setAttribute("aria-expanded", "false");

      if (mainElement) {
        if ("inert" in HTMLElement.prototype) {
          mainElement.inert = false;
        } else {
          mainElement.removeAttribute("aria-hidden");
        }
      }

      if (restoreFocus) {
        mobileMenuToggle.focus();
      }
    };

    window.closeMenuMobile = closeMenu;

    mobileMenuToggle.addEventListener("click", openMenu);
    mobileMenuClose.addEventListener("click", () => closeMenu());

    document.addEventListener("keydown", (e) => {
      if (mobileMenu.classList.contains("open") && e.key === "Escape") {
        closeMenu();
        return;
      }
    });

    mobileMenu.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
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
    });
  }

  /* -------------------------
     Authoritative Navigation Controller
     ------------------------- */
  const header = document.querySelector(".site-header");

  const desktopSectionLinks = Array.from(
    document.querySelectorAll('.desktop-nav a[href^="#"]'),
  );

  const mobileSectionLinks = Array.from(
    document.querySelectorAll('.mobile-nav a[href^="#"]'),
  );

  const sectionLinks = [...desktopSectionLinks, ...mobileSectionLinks];

  const sectionTargets = [];
  const seenSectionIds = new Set();

  for (const link of sectionLinks) {
    const id = decodeURIComponent(link.hash.slice(1));
    const section = document.getElementById(id);

    if (!section || seenSectionIds.has(id)) {
      continue;
    }

    const anchor =
      section.querySelector("[data-section-anchor]") ||
      section.querySelector(":scope > h2") ||
      section;

    sectionTargets.push({
      id,
      section,
      anchor,
    });

    seenSectionIds.add(id);
  }

  const getHeaderHeight = () =>
    Math.ceil(header?.getBoundingClientRect().height || 72);

  const getAnchorGap = () =>
    window.matchMedia("(max-width: 767px)").matches ? 16 : 24;

  const getTargetScrollTop = (target) => {
    let absoluteTop =
      window.scrollY + target.anchor.getBoundingClientRect().top;

    const computedTransform = window.getComputedStyle(target.anchor).transform;
    const hasTransform = computedTransform !== "none" && computedTransform !== "";

    if (
      hasTransform &&
      target.anchor.classList.contains("fade-in-up") &&
      !target.anchor.classList.contains("entered")
    ) {
      absoluteTop -= 18;
    }

    return Math.max(
      0,
      Math.round(absoluteTop - getHeaderHeight() - getAnchorGap()),
    );
  };

  const setActiveSection = (id) => {
    for (const link of desktopSectionLinks) {
      const isActive = link.hash === `#${id}`;

      link.classList.toggle("active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    }
  };

  const getTargetById = (id) =>
    sectionTargets.find((target) => target.id === id);

  let lockedSectionId = null;
  let scrollSettleTimer = 0;

  const clearNavigationLockSoon = () => {
    window.clearTimeout(scrollSettleTimer);

    scrollSettleTimer = window.setTimeout(() => {
      lockedSectionId = null;
      updateActiveSectionFromScroll();
    }, 160);
  };

  const updateActiveSectionFromScroll = () => {
    if (lockedSectionId) {
      setActiveSection(lockedSectionId);
      return;
    }

    const probeLine = getHeaderHeight() + getAnchorGap() + 4;

    let activeId = "";

    for (const target of sectionTargets) {
      const targetTop = target.anchor.getBoundingClientRect().top;

      if (targetTop <= probeLine) {
        activeId = target.id;
      } else {
        break;
      }
    }

    if (activeId) {
      setActiveSection(activeId);
    } else {
      for (const link of desktopSectionLinks) {
        link.classList.remove("active");
        link.removeAttribute("aria-current");
      }
    }
  };

  const scrollToSection = (
    id,
    { updateHistory = true, smooth = true } = {},
  ) => {
    const target = getTargetById(id);

    if (!target) {
      return;
    }

    lockedSectionId = id;
    setActiveSection(id);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollTo({
      top: getTargetScrollTop(target),
      behavior: smooth && !prefersReducedMotion ? "smooth" : "auto",
    });

    if (updateHistory) {
      const nextHash = `#${id}`;

      if (window.location.hash !== nextHash) {
        window.history.pushState({ section: id }, "", nextHash);
      } else {
        window.history.replaceState({ section: id }, "", nextHash);
      }
    }

    clearNavigationLockSoon();
  };

  for (const link of sectionLinks) {
    link.addEventListener("click", (event) => {
      const id = decodeURIComponent(link.hash.slice(1));

      if (!getTargetById(id)) {
        return;
      }

      event.preventDefault();

      if (link.closest(".mobile-nav") && typeof window.closeMenuMobile === "function") {
        window.closeMenuMobile({ restoreFocus: false });
      }

      window.requestAnimationFrame(() => {
        scrollToSection(id);
      });
    });
  }

  let navigationFrame = 0;

  const handleNavigationScroll = () => {
    if (navigationFrame) {
      return;
    }

    navigationFrame = window.requestAnimationFrame(() => {
      header?.classList.toggle("scrolled", window.scrollY > 50);

      updateActiveSectionFromScroll();

      if (lockedSectionId) {
        clearNavigationLockSoon();
      }

      navigationFrame = 0;
    });
  };

  window.addEventListener("scroll", handleNavigationScroll, { passive: true });

  window.addEventListener("resize", () => {
    updateActiveSectionFromScroll();
  });

  window.addEventListener("popstate", () => {
    const id = decodeURIComponent(window.location.hash.slice(1));

    if (getTargetById(id)) {
      scrollToSection(id, {
        updateHistory: false,
        smooth: false,
      });
    }
  });

  window.addEventListener("load", () => {
    const id = decodeURIComponent(window.location.hash.slice(1));

    if (getTargetById(id)) {
      window.requestAnimationFrame(() => {
        scrollToSection(id, {
          updateHistory: false,
          smooth: false,
        });
      });
    } else {
      updateActiveSectionFromScroll();
    }
  });

  /* -------------------------
     Dynamic Data Initialization
     ------------------------- */
  const aiDataElement = document.getElementById("ai-data");
  let aiPayload = { config: {}, knowledge: {} };

  if (aiDataElement) {
    try {
      const parsed = JSON.parse(aiDataElement.textContent || "{}");
      aiPayload = {
        config: parsed.config || {},
        knowledge: parsed.knowledge || {},
      };
    } catch (error) {
      console.error("Unable to parse portfolio AI data.", error);
    }
  }

  const aiConfig = aiPayload.config;
  const portfolioKnowledge = aiPayload.knowledge;

  /* -------------------------
     Case-study Modal
     ------------------------- */
  const projectsByKey = new Map();
  for (const project of portfolioKnowledge.projects || []) {
    if (project.slug) projectsByKey.set(project.slug, project);
    if (project.id) projectsByKey.set(project.id, project);
  }

  const modalRoot = document.getElementById("modal-root");
  if (modalRoot) {
    modalRoot.innerHTML = `
      <dialog id="case-modal" class="modal-dialog">
        <div class="modal-content">
          <button class="modal-close" aria-label="Close modal">Ã¢Å“â€¢</button>
          <div id="modal-label" class="modal-label"></div>
          <h2 id="modal-title"></h2>
          <p id="modal-summary"></p>
          <div id="modal-details"></div>
        </div>
      </dialog>
    `;
  }

  const modal = document.getElementById("case-modal");
  const modalFields = {
    label: document.getElementById("modal-label"),
    title: document.getElementById("modal-title"),
    summary: document.getElementById("modal-summary"),
    details: document.getElementById("modal-details"),
  };

  document.querySelectorAll("[data-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      const project = projectsByKey.get(button.dataset.modal);
      if (!project || !modal) return;

      if (modalFields.label)
        modalFields.label.textContent = project.category || "";
      if (modalFields.title)
        modalFields.title.textContent = project.title || "";
      if (modalFields.summary)
        modalFields.summary.textContent = project.summary || "";

      if (modalFields.details) {
        let detailsHtml = "";
        if (project.fullDescription)
          detailsHtml += `<h3>Description</h3><p>${project.fullDescription}</p>`;
        if (project.caseStudyContent)
          detailsHtml += `<h3>Case Study</h3><p>${project.caseStudyContent}</p>`;
        if (project.tools && project.tools.length)
          detailsHtml += `<h3>Tools</h3><p>${project.tools.join(", ")}</p>`;
        if (project.date) detailsHtml += `<h3>Date</h3><p>${project.date}</p>`;
        if (project.ethicalDisclaimer)
          detailsHtml += `<h3>Ethics</h3><p>${project.ethicalDisclaimer}</p>`;

        modalFields.details.innerHTML = detailsHtml;
      }

      modal.showModal();
    });
  });

  document
    .querySelector(".modal-close")
    ?.addEventListener("click", () => modal?.close());
  modal?.addEventListener("click", (event) => {
    const rect = modal.getBoundingClientRect();
    const outside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;
    if (outside) modal.close();
  });

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

  const state = {
    greeted: false,
    busy: false,
    sound: false,
    challengeActive: false,
    challengeIndex: 0,
    challengeAttempts: 0,
    challengeHintShown: false,
  };

  const escapeHTML = (value) =>
    String(value).replace(
      /[&<>'"]/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        })[c],
    );

  // Dynamic Recruiter Briefing
  const buildRecruiterBriefing = (knowledge) => {
    let text = `Muhammad Abdullah is a Cyber Security student focused on web penetration testing, application security and practical security testing.`;

    if (knowledge.experience && knowledge.experience.length > 0) {
      text += `\n\nHis experience includes:\n`;
      const expSlice = knowledge.experience.slice(0, 3);
      text += expSlice.map((e) => `- ${e.role} at ${e.company}`).join("\n");
    }

    let hasPortfolio = false;
    let portfolioText = `\n\nHis portfolio includes:\n`;
    if (knowledge.projects && knowledge.projects.length > 0) {
      portfolioText += `- ${knowledge.projects.length} practical projects\n`;
      hasPortfolio = true;
    }
    if (knowledge.skills && knowledge.skills.length > 0) {
      portfolioText += `- ${knowledge.skills.length} documented technical skills\n`;
      hasPortfolio = true;
    }
    if (knowledge.certificates && knowledge.certificates.length > 0) {
      portfolioText += `- ${knowledge.certificates.length} certifications\n`;
      hasPortfolio = true;
    }
    if (knowledge.achievements && knowledge.achievements.length > 0) {
      portfolioText += `- ${knowledge.achievements.length} achievements\n`;
      hasPortfolio = true;
    }
    if (hasPortfolio) text += portfolioText.trimEnd();

    if (knowledge.projects && knowledge.projects.length > 0) {
      text += `\n\nSelected projects:\n`;
      const projSlice = knowledge.projects.slice(0, 3);
      text += projSlice.map((p) => `- ${p.title}: ${p.summary}`).join("\n");
    }

    if (knowledge.certificates && knowledge.certificates.length > 0) {
      text += `\n\nKey certifications:\n`;
      const featured = knowledge.certificates.filter((c) => c.featured);
      const others = knowledge.certificates.filter((c) => !c.featured);
      let certsToShow = featured.concat(others).slice(0, featured.length + 2);
      text += certsToShow
        .map((c) => `- ${c.title} from ${c.issuer}`)
        .join("\n");
    }

    if (knowledge.education && knowledge.education.length > 0) {
      text += `\n\nEducation:\n`;
      text += knowledge.education
        .map(
          (e) =>
            `- ${e.degree}, ${e.institution} (${e.expectedCompletion || e.date})`,
        )
        .join("\n");
    }

    return text.trim();
  };

  const recruiterBriefingText = buildRecruiterBriefing(portfolioKnowledge);

  const scrollMessages = () =>
    requestAnimationFrame(() => {
      if (aiMessages) aiMessages.scrollTop = aiMessages.scrollHeight;
    });

  const speakText = (text) => {
    if (!state.sound || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    // Strip HTML before speaking
    const temp = document.createElement("div");
    temp.innerHTML = text;
    const plainText = temp.textContent || temp.innerText || "";

    const utterance = new SpeechSynthesisUtterance(plainText);
    window.speechSynthesis.speak(utterance);
  };

  const addMessage = (content, role = "ai", options = {}) => {
    if (!aiMessages) return null;
    const msg = document.createElement("div");
    msg.className = `ai-message ai-${role}`;

    let innerHtml = options.html ? content : escapeHTML(content);
    if (options.source) {
      innerHtml += `<div class="ai-source" style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Source: ${escapeHTML(options.source)}</div>`;
    }
    msg.innerHTML = innerHtml;

    aiMessages.appendChild(msg);
    scrollMessages();

    if (role === "ai" && state.sound) {
      speakText(content);
    }

    return msg;
  };

  const renderQuickActions = (items) => {
    if (!aiSuggestions) return;
    aiSuggestions.innerHTML = items
      .map((item) => {
        const specialAttr = item.special
          ? `data-ai-special="${item.special}"`
          : "";
        return `<button type="button" class="ai-chip" ${specialAttr}>${escapeHTML(item.label)}</button>`;
      })
      .join("");

    aiSuggestions.querySelectorAll(".ai-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const special = chip.dataset.aiSpecial;
        if (special) {
          handleSpecial(special);
        } else {
          if (aiInput) aiInput.value = chip.textContent;
          if (aiForm) aiForm.dispatchEvent(new Event("submit"));
        }
      });
    });
  };

  const defaultActions = () => {
    const questions = aiConfig.suggestedQuestions || [
      "Why hire Muhammad?",
      "Main certifications",
    ];
    const actions = questions.map((q) => ({ label: q }));
    actions.push(
      {
        label: aiConfig.recruiterBriefingLabels?.title || "Recruiter briefing",
        special: "brief",
      },
      { label: aiConfig.scanLabels?.title || "Evidence scan", special: "scan" },
      { label: "CTF challenge", special: "challenge" },
    );
    renderQuickActions(actions);
  };

  const displayRecruiterBriefing = () => {
    const briefHtml = `<p><strong>${aiConfig.recruiterBriefingLabels?.title || "Recruiter Briefing"}</strong></p>
      <div style="white-space: pre-wrap; font-size: 0.9em;">${escapeHTML(recruiterBriefingText)}</div>
      <div style="margin-top: 8px;">
        <button type="button" class="ai-chip" data-ai-special="copy-brief">Copy summary</button>
        <span id="copy-status" style="font-size: 0.8em; color: var(--text-muted); margin-left: 8px; display: none;">Copied!</span>
      </div>`;
    addMessage(briefHtml, "ai", {
      html: true,
      source: "Generated from verified portfolio knowledge",
    });
    defaultActions();
  };

  const runScan = () => {
    if (state.busy) return;
    state.busy = true;
    const msg = addMessage(
      `<p>${aiConfig.scanLabels?.summary || "Scanning..."}</p>`,
      "ai",
      {
        html: true,
      },
    );
    setTimeout(() => {
      msg.innerHTML = `<p><strong>${aiConfig.scanLabels?.title || "Evidence Scan Complete"}</strong></p><p>Found ${portfolioKnowledge.projects?.length || 0} projects and ${portfolioKnowledge.certificates?.length || 0} certificates.</p>`;
      state.busy = false;
      defaultActions();
    }, 800);
  };

  const challengeConfig = aiConfig.ctfChallengeData || {};
  const challengeQuestions = Array.isArray(challengeConfig.questions)
    ? challengeConfig.questions
    : [];

  const startChallenge = () => {
    if (challengeQuestions.length === 0) {
      addMessage(
        `<p>${challengeConfig.unavailableMessage || "Challenge currently unavailable."}</p>`,
        "ai",
        { html: true },
      );
      defaultActions();
      return;
    }
    state.challengeActive = true;
    state.challengeIndex = 0;
    state.challengeAttempts = 0;
    state.challengeHintShown = false;

    addMessage(
      `<p><strong>${challengeConfig.title || "CTF Challenge"}</strong></p><p>${challengeConfig.intro || ""}</p>`,
      "ai",
      { html: true },
    );

    setTimeout(() => {
      addMessage(`<p>${challengeQuestions[0].prompt}</p>`, "ai", {
        html: true,
      });
      renderQuickActions([
        { label: "Hint", special: "hint" },
        { label: "Quit", special: "quit-challenge" },
      ]);
    }, 400);
  };

  const normalizeAnswer = (value) =>
    String(value)
      .trim()
      .toLowerCase()
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ");

  const handleChallenge = (query) => {
    if (!state.challengeActive) return false;

    const q = query.trim().toLowerCase();

    if (q === "quit" || q === "/quit") {
      state.challengeActive = false;
      addMessage("Challenge exited.", "ai");
      defaultActions();
      return true;
    }

    if (q === "hint" || q === "give me a hint" || q === "/help") {
      const qData = challengeQuestions[state.challengeIndex];
      addMessage(`<p><em>Hint:</em> ${qData.hint}</p>`, "ai", { html: true });
      return true;
    }

    const qData = challengeQuestions[state.challengeIndex];
    const normalizedQuery = normalizeAnswer(query);
    const isCorrect =
      Array.isArray(qData.answers) &&
      qData.answers.some((ans) => normalizeAnswer(ans) === normalizedQuery);

    if (isCorrect) {
      state.challengeIndex++;
      state.challengeAttempts = 0;
      state.challengeHintShown = false;

      if (state.challengeIndex >= challengeQuestions.length) {
        state.challengeActive = false;
        addMessage(
          `<p><strong>${challengeConfig.successMessage || "Challenge Complete!"}</strong></p><p style="font-family: monospace; padding: 8px; background: var(--surface); border-radius: 4px;">${challengeConfig.flag}</p>`,
          "ai",
          { html: true },
        );
        defaultActions();
      } else {
        addMessage(
          `<p>Correct. Next: ${challengeQuestions[state.challengeIndex].prompt}</p>`,
          "ai",
          { html: true },
        );
      }
    } else {
      state.challengeAttempts++;
      addMessage(
        `<p>${challengeConfig.incorrectMessage || "Incorrect. Try again."}</p>`,
        "ai",
        { html: true },
      );
    }
    return true;
  };

  const copyRecruiterBriefing = () => {
    const onSuccess = () => {
      if (aiLiveRegion)
        aiLiveRegion.textContent = "Summary copied to clipboard";
      const statusEl = document.getElementById("copy-status");
      if (statusEl) {
        statusEl.style.display = "inline";
        setTimeout(() => {
          statusEl.style.display = "none";
        }, 3000);
      }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(recruiterBriefingText)
        .then(onSuccess)
        .catch(() => {});
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = recruiterBriefingText;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        onSuccess();
      } catch (err) {}
      document.body.removeChild(textarea);
    }
  };

  const handleSpecial = (special) => {
    if (special === "brief") displayRecruiterBriefing();
    if (special === "scan") runScan();
    if (special === "challenge") startChallenge();
    if (special === "copy-brief") copyRecruiterBriefing();
    if (special === "hint") handleChallenge("hint");
    if (special === "quit-challenge") handleChallenge("quit");
  };

  const processQuery = (query) => {
    if (handleChallenge(query)) return;

    if (query.toLowerCase() === "/clear" || query.toLowerCase() === "clear") {
      if (aiMessages) aiMessages.innerHTML = "";
      state.greeted = false;
      addMessage(aiConfig.greeting || "Hello. How can I help you?", "ai", {
        html: true,
      });
      defaultActions();
      return;
    }

    let found = false;
    const customAnswers = Array.isArray(aiConfig.customAnswers)
      ? aiConfig.customAnswers
      : Object.values(aiConfig.customAnswers || {});

    for (const kb of customAnswers) {
      if (
        kb.keywords &&
        kb.keywords.some((kw) => query.toLowerCase().includes(kw.toLowerCase()))
      ) {
        addMessage(kb.response, "ai", {
          html: true,
          source: "Verified portfolio knowledge",
        });
        found = true;
        break;
      }
    }

    if (!found) {
      addMessage(
        aiConfig.fallbackAnswer || "I don't have specific information on that.",
        "ai",
      );
    }
    defaultActions();
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

    recognition.onerror = (event) => {
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
      aiVoiceOutputBtn.setAttribute(
        "aria-pressed",
        state.sound ? "true" : "false",
      );
      aiVoiceOutputBtn.setAttribute(
        "aria-label",
        state.sound ? "Disable speech output" : "Enable speech output",
      );
      if (!state.sound) {
        window.speechSynthesis.cancel();
      }
    });
  }

  // Accessibility Focus Trap
  const trapFocus = (e) => {
    if (e.key === "Tab" && aiPanel.classList.contains("open")) {
      const focusables = Array.from(
        aiPanel.querySelectorAll(aiFocusableSelectors),
      ).filter(
        (el) =>
          !el.disabled &&
          el.offsetParent !== null &&
          !el.hidden &&
          el.getAttribute("tabindex") !== "-1",
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

    if (aiInput) {
      setTimeout(() => aiInput.focus(), 50);
    }

    document.addEventListener("keydown", trapFocus);

    if (!state.greeted) {
      state.greeted = true;
      if (aiConfig.privacyMessage) {
        addMessage(aiConfig.privacyMessage, "ai", { html: true });
      }
      addMessage(aiConfig.greeting || "Hello. How can I help you?", "ai", {
        html: true,
      });
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

    if (
      recognition &&
      aiVoiceInputBtn &&
      aiVoiceInputBtn.getAttribute("aria-pressed") === "true"
    ) {
      recognition.stop();
      aiVoiceInputBtn.setAttribute("aria-pressed", "false");
      aiVoiceInputBtn.setAttribute("aria-label", "Start voice input");
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    if (lastOpenedBy && typeof lastOpenedBy.focus === "function") {
      lastOpenedBy.focus();
    }
  };

  document
    .querySelectorAll("[data-ai-open]")
    .forEach((btn) => btn.addEventListener("click", openAi));
  document
    .querySelectorAll("[data-ai-close]")
    .forEach((btn) => btn.addEventListener("click", closeAi));

  if (aiForm) {
    aiForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = aiInput.value.trim();
      if (!val) return;
      addMessage(val, "user");
      aiInput.value = "";
      setTimeout(() => processQuery(val), 300);
    });
  }

  /* -------------------------
     Certificates - Lazy Load & Progressive Reveal
     ------------------------- */
  const suppCerts = Array.from(document.querySelectorAll('.supp-cert-card'));
  const revealBtn = document.getElementById('cert-reveal-btn');
  const revealContainer = document.getElementById('cert-reveal-container');

  let currentBatchSize = 4;

  const pdfObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const iframe = entry.target.querySelector('.cert-preview-iframe');
        if (iframe && iframe.dataset.pdfSrc) {
          iframe.src = iframe.dataset.pdfSrc;
          delete iframe.dataset.pdfSrc;
        }
        obs.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px 200px 0px" });

  // Initialize observer for already revealed cards (featured)
  document.querySelectorAll('.cert-card[data-revealed="true"]').forEach(card => {
    pdfObserver.observe(card);
  });

  const updateRevealButton = () => {
    if (!revealBtn) return;
    const hiddenCerts = suppCerts.filter(c => c.getAttribute('data-revealed') === 'false');
    
    if (hiddenCerts.length === 0) {
      revealContainer.style.display = 'none';
      return;
    }
    
    const nextRevealCount = Math.min(currentBatchSize, hiddenCerts.length);
    revealBtn.textContent = `Read More Certificates (${nextRevealCount})`;
  };

  if (revealBtn) {
    updateRevealButton();
    
    revealBtn.addEventListener('click', () => {
      const hiddenCerts = suppCerts.filter(c => c.getAttribute('data-revealed') === 'false');
      const toReveal = hiddenCerts.slice(0, currentBatchSize);
      
      toReveal.forEach(card => {
        card.setAttribute('data-revealed', 'true');
        card.classList.add('fade-in-up', 'reveal');
        // trigger reflow
        void card.offsetWidth;
        card.classList.add('entered');
        pdfObserver.observe(card);
      });
      
      currentBatchSize++;
      updateRevealButton();
    });
  }

  /* -------------------------
     Certificates - Fullscreen Viewer
     ------------------------- */
  const certViewer = document.getElementById('cert-viewer');
  const certViewerIframe = document.getElementById('cert-viewer-iframe');
  const certViewerTitle = document.getElementById('cert-viewer-title');
  const certViewerIssuer = document.getElementById('cert-viewer-issuer');
  const certViewerNewTab = document.getElementById('cert-viewer-new-tab');
  const certViewerClose = document.getElementById('cert-viewer-close');
  const certViewerBackdrop = document.getElementById('cert-viewer-backdrop');
  
  let certLastFocus = null;

  const openCertViewer = (card) => {
    if (!certViewer) return;
    certLastFocus = card;
    const pdfUrl = card.getAttribute('data-pdf-full');
    const title = card.getAttribute('data-cert-title') || card.querySelector('.cert-title')?.textContent || '';
    const issuer = card.getAttribute('data-cert-issuer') || card.querySelector('.cert-meta span:first-child')?.textContent || '';
    
    certViewerTitle.textContent = title;
    certViewerIssuer.textContent = issuer;
    certViewerNewTab.href = pdfUrl;
    certViewerIframe.src = pdfUrl;
    
    certViewer.classList.add('open');
    certViewer.setAttribute('aria-hidden', 'false');
    certViewer.removeAttribute('inert');
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
      certViewerClose.focus();
    }, 150);
  };

  const closeCertViewer = () => {
    if (!certViewer) return;
    certViewer.classList.remove('open');
    certViewer.setAttribute('aria-hidden', 'true');
    certViewer.setAttribute('inert', '');
    document.body.style.overflow = '';
    
    // Clear iframe src
    certViewerIframe.src = '';
    
    if (certLastFocus) {
      certLastFocus.focus();
    }
  };

  if (certViewerClose && certViewerBackdrop) {
    certViewerClose.addEventListener('click', closeCertViewer);
    certViewerBackdrop.addEventListener('click', closeCertViewer);
  }

  // Need to use document.body to delegate in case cards are dynamically created
  // Though cards are rendered statically, it's safe.
  document.querySelectorAll('[data-pdf-full]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      if (trigger.tagName === 'BUTTON' || trigger.tagName === 'A') {
        e.preventDefault();
      }
      openCertViewer(trigger);
    });
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCertViewer(trigger);
      }
    });
  });

  if (certViewer) {
    certViewer.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeCertViewer();
      }
      
      if (e.key === 'Tab') {
        const focusables = Array.from(certViewer.querySelectorAll('a[href], button')).filter(el => !el.hidden && !el.disabled && el.offsetParent !== null);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || document.activeElement === certViewerIframe) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    });
  }

})();
