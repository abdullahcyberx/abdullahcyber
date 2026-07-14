(() => {
  "use strict";

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

  /* -------------------------
     Project Desktop Preview
     ------------------------- */
  const projectRows = document.querySelectorAll(".project-row");
  const hoverPreview = document.getElementById("hover-preview");
  if (
    hoverPreview &&
    window.matchMedia("(hover: hover) and (min-width: 768px)").matches
  ) {
    const artDiv = hoverPreview.querySelector("#hover-preview-art");
    let hoverTimeout;

    projectRows.forEach((row) => {
      row.addEventListener("pointerenter", (e) => {
        const imageSrc = row.getAttribute("data-image");
        if (imageSrc) {
          if (artDiv) artDiv.className = "project-art " + imageSrc;
          hoverPreview.style.display = "block";
          clearTimeout(hoverTimeout);
          hoverTimeout = setTimeout(() => {
            hoverPreview.style.opacity = "1";
            hoverPreview.style.transform = "scale(1) translate(-50%, -50%)";
          }, 10);
        }
      });

      row.addEventListener("pointermove", (e) => {
        hoverPreview.style.left = e.clientX + 50 + "px";
        hoverPreview.style.top = e.clientY + "px";
        hoverPreview.style.transform = "translate(0, -50%) scale(1)";
      });

      row.addEventListener("pointerleave", () => {
        clearTimeout(hoverTimeout);
        hoverPreview.style.opacity = "0";
        hoverPreview.style.transform = "scale(0.95)";
        setTimeout(() => {
          if (hoverPreview.style.opacity === "0")
            hoverPreview.style.display = "none";
        }, 280);
      });
    });
  }

  /* -------------------------
     Header & Active Navigation
     ------------------------- */
  const header = document.querySelector(".site-header");
  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY > 50) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    },
    { passive: true },
  );

  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".desktop-nav a");
  window.addEventListener(
    "scroll",
    () => {
      let current = "";
      const scrollY = window.scrollY;
      sections.forEach((section) => {
        const sectionTop = section.offsetTop - 100;
        if (scrollY >= sectionTop) current = section.getAttribute("id");
      });
      navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href").includes(current))
          link.classList.add("active");
      });
    },
    { passive: true },
  );

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

    const closeMenu = () => {
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
      mobileMenuToggle.focus();
    };

    mobileMenuToggle.addEventListener("click", openMenu);
    mobileMenuClose.addEventListener("click", closeMenu);

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

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
     Interactive Skills Keyboard
     ------------------------- */
  const skillsByKey = new Map(
    (portfolioKnowledge.skills || []).map((skill) => [skill.skillKey, skill]),
  );

  const skillKeys = document.querySelectorAll(".skill-key");

  // Note: the original index.template.html doesn't have the elements for skill details display anymore,
  // but if it did or will be added, we'd update them here.
  skillKeys.forEach((key) => {
    const selectSkill = () => {
      skillKeys.forEach((k) => k.classList.remove("active"));
      key.classList.add("active");
      const skill = skillsByKey.get(key.dataset.skill);
      // If we had display elements, we'd update them using skill.name, skill.description, etc.
    };

    key.addEventListener("pointerenter", selectSkill);
    key.addEventListener("focus", selectSkill);
  });

  /* -------------------------
     Shehzada's AI
     ------------------------- */
  const aiPanel = document.getElementById("ai-assistant");
  const aiInput = document.getElementById("ai-input");
  const aiForm = document.getElementById("ai-form");
  const aiMessages = document.getElementById("ai-messages");
  const aiSuggestions = document.getElementById("ai-suggestions");

  const state = {
    greeted: false,
    busy: false,
    sound: false,
    challengeStep: 0,
    lastIntent: "",
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

  const scrollMessages = () =>
    requestAnimationFrame(() => {
      if (aiMessages) aiMessages.scrollTop = aiMessages.scrollHeight;
    });

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
        label: aiConfig.recruiterBriefingLabels?.[0] || "Recruiter briefing",
        special: "brief",
      },
      { label: aiConfig.scanLabels?.[0] || "Evidence scan", special: "scan" },
      { label: "CTF challenge", special: "challenge" },
    );
    renderQuickActions(actions);
  };

  const recruiterBriefing = () => {
    let experienceText =
      portfolioKnowledge.experience?.map((e) => e.role).join(", ") || "";
    const brief = `<p><strong>Recruiter briefing</strong></p>
      <p>Muhammad Abdullah is an entry-level cybersecurity candidate focused on web penetration testing.</p>
      <p><strong>Experience:</strong> ${experienceText}</p>
      <div style="margin-top: 8px;"><button type="button" class="ai-chip" data-ai-special="copy-brief">Copy summary</button></div>`;
    addMessage(brief, "ai", {
      html: true,
      source: "Verified from portfolio content",
    });
    defaultActions();
  };

  const runScan = () => {
    if (state.busy) return;
    state.busy = true;
    const msg = addMessage(`<p>Running Evidence scan...</p>`, "ai", {
      html: true,
    });
    setTimeout(() => {
      msg.innerHTML = `<p><strong>Evidence scan complete</strong></p><p>Found ${portfolioKnowledge.projects?.length || 0} projects and ${portfolioKnowledge.certificates?.length || 0} certificates.</p>`;
      state.busy = false;
      defaultActions();
    }, 800);
  };

  const startChallenge = () => {
    state.challengeStep = 1;
    addMessage(
      `<p><strong>CTF Challenge</strong></p><p>I can alter a database query when user input is handled unsafely. What am I?</p>`,
      "ai",
      { html: true },
    );
  };

  const handleChallenge = (query) => {
    const q = query.toLowerCase();
    if (state.challengeStep === 1) {
      if (q.includes("sql")) {
        state.challengeStep = 2;
        addMessage(
          `<p>Correct. Next: I execute untrusted script in a visitor's browser. What am I?</p>`,
          "ai",
          { html: true },
        );
      } else {
        addMessage(`<p>Incorrect. Try again.</p>`, "ai", { html: true });
      }
      return true;
    }
    if (state.challengeStep === 2) {
      if (q.includes("xss") || q.includes("cross")) {
        state.challengeStep = 0;
        addMessage(
          `<p><strong>Challenge Complete!</strong> Access granted.</p>`,
          "ai",
          { html: true },
        );
        defaultActions();
      } else {
        addMessage(`<p>Incorrect. Try again.</p>`, "ai", { html: true });
      }
      return true;
    }
    return false;
  };

  const handleSpecial = (special) => {
    if (special === "brief") recruiterBriefing();
    if (special === "scan") runScan();
    if (special === "challenge") startChallenge();
    if (special === "copy-brief") {
      navigator.clipboard
        .writeText(
          "Muhammad Abdullah is an entry-level cybersecurity candidate...",
        )
        .catch(() => {});
    }
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
      if (kb.keywords && kb.keywords.some((kw) => query.toLowerCase().includes(kw.toLowerCase()))) {
        addMessage(kb.response, 'ai', { html: true, source: 'Verified portfolio knowledge' });
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

  const openAi = () => {
    if (!aiPanel) return;
    aiPanel.setAttribute("aria-hidden", "false");
    aiPanel.classList.add("open");
    if (aiInput) aiInput.focus();

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
    aiPanel.classList.remove("open");
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
})();
