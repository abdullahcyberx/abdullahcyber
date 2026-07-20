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
    const hasTransform =
      computedTransform !== "none" && computedTransform !== "";

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

    // If scrolled to the bottom of the page, activate the last section.
    if (
      window.innerHeight + Math.round(window.scrollY) >=
      document.body.offsetHeight - 10
    ) {
      if (sectionTargets.length > 0) {
        activeId = sectionTargets[sectionTargets.length - 1].id;
      }
    } else {
      for (const target of sectionTargets) {
        const targetTop = target.anchor.getBoundingClientRect().top;

        if (targetTop <= probeLine) {
          activeId = target.id;
        } else {
          break;
        }
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

      if (
        link.closest(".mobile-nav") &&
        typeof window.closeMenuMobile === "function"
      ) {
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
  const renderSafeMarkdown = (el, str) => {
    if (!str) return;
    const parts = str.split(/(\*\*.*?\*\*|`.*?`|\n\n)/g);
    parts.forEach((p) => {
      if (p === "\n\n") {
        el.appendChild(document.createElement("br"));
        el.appendChild(document.createElement("br"));
      } else if (p.startsWith("**") && p.endsWith("**")) {
        const strong = document.createElement("strong");
        strong.textContent = p.slice(2, -2);
        el.appendChild(strong);
      } else if (p.startsWith("`") && p.endsWith("`")) {
        const code = document.createElement("code");
        code.textContent = p.slice(1, -1);
        el.appendChild(code);
      } else if (p) {
        el.appendChild(document.createTextNode(p));
      }
    });
  };

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
    modalRoot.insertAdjacentHTML(
      "beforeend",
      `
      <dialog id="case-modal" class="modal-dialog">
        <div class="modal-content">
          <button class="modal-close" aria-label="Close modal">Ã¢Å“â€¢</button>
          <div id="modal-label" class="modal-label"></div>
          <h2 id="modal-title"></h2>
          <p id="modal-summary"></p>
          <div id="modal-details"></div>
        </div>
      </dialog>
    `,
    );
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
        if (modalFields.details) {
          modalFields.details.innerHTML = "";

          const addSection = (title, text) => {
            const h = document.createElement("h3");
            h.textContent = title;
            const p = document.createElement("p");
            p.textContent = text;
            modalFields.details.appendChild(h);
            modalFields.details.appendChild(p);
          };

          if (project.fullDescription)
            addSection("Description", project.fullDescription);
          if (project.caseStudyContent)
            addSection("Case Study", project.caseStudyContent);
          if (project.tools && project.tools.length)
            addSection("Tools", project.tools.join(", "));
          if (project.date) addSection("Date", project.date);
          if (project.ethicalDisclaimer)
            addSection("Ethics", project.ethicalDisclaimer);
        }
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

  const state = {
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
    let text = `Muhammad Abdullah is a Cyber Security student focused on vulnerability assessment, web security, security monitoring and network analysis.`;
    if (knowledge.experience && knowledge.experience.length > 0) {
      text += `\n\nHis experience includes:\n`;
      const expSlice = knowledge.experience.slice(0, 3);
      text += expSlice.map((e) => `- ${e.role} at ${e.company}`).join("\n");
    }
    let hasPortfolio = false;
    let portfolioText = `\n\nHis portfolio includes:\n`;
    if (knowledge.projects?.length > 0) {
      portfolioText += `- ${knowledge.projects.length} practical projects\n`;
      hasPortfolio = true;
    }
    if (knowledge.skills?.length > 0) {
      portfolioText += `- ${knowledge.skills.length} documented technical skills\n`;
      hasPortfolio = true;
    }
    if (knowledge.certificates?.length > 0) {
      portfolioText += `- ${knowledge.certificates.length} certifications\n`;
      hasPortfolio = true;
    }
    if (knowledge.achievements?.length > 0) {
      portfolioText += `- ${knowledge.achievements.length} achievements\n`;
      hasPortfolio = true;
    }
    if (hasPortfolio) text += portfolioText.trimEnd();

    if (knowledge.projects?.length > 0) {
      text += `\n\nSelected projects:\n`;
      const projSlice = knowledge.projects.slice(0, 3);
      text += projSlice.map((p) => `- ${p.title}: ${p.summary}`).join("\n");
    }
    if (knowledge.certificates?.length > 0) {
      text += `\n\nKey certifications:\n`;
      const featured = knowledge.certificates.filter((c) => c.featured);
      const others = knowledge.certificates.filter((c) => !c.featured);
      let certsToShow = featured.concat(others).slice(0, featured.length + 2);
      text += certsToShow
        .map((c) => `- ${c.title} from ${c.issuer}`)
        .join("\n");
    }
    if (knowledge.education?.length > 0) {
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

  const normalizeQuery = (q) =>
    q
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, " ")
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
    const namesProject = portfolioKnowledge.projects?.some((project) => {
      const titleTokens = tokenize(project.title || "").filter((token) => token.length > 2);
      const matchingTokens = titleTokens.filter((token) => qStr.includes(token));
      return matchingTokens.length >= Math.min(2, titleTokens.length);
    });
    if (namesProject) return "specific_project";
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
        "Muhammad Abdullah is a BS Cyber Security student and early-career Junior Cybersecurity Analyst with practical experience in vulnerability assessment, web security, security monitoring, network analysis and penetration testing.",
        "Muhammad Abdullah is a BS Cyber Security student and early-career Junior Cybersecurity Analyst with practical experience in vulnerability assessment, web security, security monitoring, network analysis and penetration testing.",
        "Muhammad Abdullah is a BS Cyber Security student and early-career Junior Cybersecurity Analyst with practical experience in vulnerability assessment, web security, security monitoring, network analysis and penetration testing.",
      ]);
    } else if (intent === "contact") {
      text = "You can contact Muhammad through the contact form at the bottom of the page, or via his verified LinkedIn and GitHub profiles. His email is also listed in his CV.";
    } else if (intent === "specialization") {
      text = "His profile is broader than a single penetration-testing role. His strongest documented areas include vulnerability assessment and web security, supported by security monitoring, network analysis, Linux, Windows, Docker and Python scripting.";
    } else if (intent === "skills") {
      if (qStr.includes("python")) {
        text = "Yes, Python appears prominently in his portfolio. He used it to build the Modular Recon Tool, demonstrating network programming and security automation skills.";
        newContext.lastEntity = "Modular Recon Tool";
      } else {
        text = "His documented skills include vulnerability assessment, web security, network traffic analysis, security monitoring, Linux, Windows, Docker, VirtualBox, Python scripting, Git and GitHub, along with Burp Suite, Nmap, Gobuster and Wireshark.";
      }
    } else if (intent === "strongest_project") {
      text = "His strongest documented work is likely the Modular Recon Tool, as it demonstrates independent Python development, networking knowledge, and practical tool-building for security assessments.";
      newContext.lastEntity = "Modular Recon Tool";
    } else if (intent === "projects" || intent === "specific_project") {
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
        text = "His internship experience includes hands-on work with Linux, networking, Docker, access control, firewall and IDS configuration, malware analysis, SQL injection and XSS labs, vulnerability assessments, penetration testing, reporting and remediation.";
      }
    } else if (intent === "certifications") {
      text = "Muhammad holds several certifications that validate his knowledge. Key credentials include his practical training and achievements in offensive security and networking.";
    } else if (intent === "recruiter" || intent === "soc_suitability" || intent === "pentest_suitability" || intent === "web_suitability") {
      text = "His portfolio presents him as an early-career Junior Cybersecurity Analyst candidate with practical exposure rather than a senior specialist. His evidence includes cybersecurity internships, vulnerability assessments, web-security labs, security monitoring and network-analysis skills, Python security tooling, certifications and CTF work.";
    } else if (intent === "education") {
      text = "He is completing a BS Cyber Security degree at Riphah International University with a 3.3 CGPA and an expected graduation year of 2028.";
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
    return { text: `**${challengeConfig.title || "CTF Challenge"}**\n\n${challengeConfig.intro || ""}\n\n${challengeQuestions[0].prompt}`, intent: "challenge" };
  };

  const normalizeAnswer = (value) => String(value).trim().toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ");

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
        return { text: `**${challengeConfig.successMessage || "Challenge Complete!"}**\n\n\`${challengeConfig.flag}\``, intent: "challenge" };
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
    if (q === "recruiter briefing" || q === "why hire muhammad?" || q === "why should someone hire muhammad?") {
      return { text: recruiterBriefingText, intent: "recruiter" };
    }
    if (q === "evidence scan") {
      return { text: `**${aiConfig.scanLabels?.title || "Evidence Scan Complete"}**\n\nFound ${portfolioKnowledge.projects?.length || 0} projects and ${portfolioKnowledge.certificates?.length || 0} certificates.`, intent: "scan" };
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


  const aiDialog = document.getElementById("ai-assistant");
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
  let aiResponseSequence = 0;

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
      requestAnimationFrame(() => {
        if (isDesktopAi()) {
          aiInput?.focus();
        } else if (aiConversation) {
          aiConversation.scrollTop = 0;
        }
      });
    });
  };

  const closeAiAssistant = ({ restoreFocus = true } = {}) => {
    if (!aiDialog) return;
    aiDialog.classList.remove("open");
    aiDialog.setAttribute("aria-hidden", "true");
    aiDialog.setAttribute("inert", "");
    document.body.classList.remove("ai-open");
    resetAiPanelMode();
    const focusTarget = aiOpenedBy;
    if (restoreFocus && focusTarget instanceof HTMLElement) {
      requestAnimationFrame(() => focusTarget.focus());
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
    const focusable = Array.from(aiDialog.querySelectorAll(aiFocusableSelector)).filter(
      (element) => element.offsetParent !== null && element.tabIndex >= 0,
    );
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
    row.className =
      role === "assistant"
        ? "ai-message ai-assistant-message"
        : "ai-message ai-user";
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

  const aiHistoryKey = "ai-history";

  const getAiHistory = () => {
    try {
      const history = JSON.parse(sessionStorage.getItem(aiHistoryKey) || "[]");
      return Array.isArray(history)
        ? history.filter(
            (entry) =>
              ["user", "assistant"].includes(entry?.role) &&
              typeof entry?.text === "string",
          )
        : [];
    } catch {
      return [];
    }
  };

  const appendAiHistory = (role, text) => {
    try {
      const history = getAiHistory();
      history.push({ role, text: String(text) });
      sessionStorage.setItem(aiHistoryKey, JSON.stringify(history.slice(-50)));
    } catch {}
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
    const responseSequence = ++aiResponseSequence;
    const thinking = showAiThinking();
    setAiBusy(true);
    if (aiLiveRegion) aiLiveRegion.textContent = "Searching portfolio knowledge.";
    await new Promise((resolve) => {
      window.setTimeout(resolve, prefersReducedMotion() ? 0 : 160);
    });
    if (responseSequence !== aiResponseSequence) {
      thinking.remove();
      return;
    }
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
    appendAiHistory("assistant", answer);
    setAiBusy(false);
    scrollAiToBottom();
    if (aiLiveRegion) aiLiveRegion.textContent = "Answer ready.";
    if (aiDialog?.classList.contains("open")) aiInput?.focus();
  };

  const renderAiUserMessage = (text) => {
    const { bubble } = createAiMessage("user");
    bubble.textContent = text;
    appendAiHistory("user", text);
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
    aiInput.style.overflowY = aiInput.scrollHeight > 130 ? "auto" : "hidden";
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

  const clearAiConversation = () => {
    aiResponseSequence += 1;
    removeAiThinking();
    if (aiMessages) aiMessages.replaceChildren();
    if (aiSuggestions) aiSuggestions.replaceChildren();
    state.challengeActive = false;
    state.challengeIndex = 0;
    state.challengeAttempts = 0;
    state.challengeHintShown = false;
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
  };

  aiForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!aiInput || aiIsBusy) return;
    const question = aiInput.value.trim();
    if (!question) {
      aiInput.focus();
      return;
    }
    if (["/clear", "clear"].includes(question.toLowerCase())) {
      clearAiConversation();
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

  aiClearButton?.addEventListener("click", clearAiConversation);

  resizeAiInput();
  updateAiCharacterCount();

  const storedAiHistory = getAiHistory();
  if (storedAiHistory.length > 0) {
    hideAiWelcome();
    storedAiHistory.forEach(({ role, text }) => {
      const { bubble } = createAiMessage(role);
      if (role === "assistant") {
        renderSafeMarkdown(bubble, text);
      } else {
        bubble.textContent = text;
      }
    });
    scrollAiToBottom();
  }

/* -------------------------
     Certificates - Lazy Load & Progressive Reveal
     ------------------------- */
  const suppCerts = Array.from(document.querySelectorAll(".supp-cert-card"));
  const revealBtn = document.getElementById("cert-reveal-btn");
  const revealContainer = document.getElementById("cert-reveal-container");

  let currentBatchSize = 4;

  const previewObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target.querySelector(".cert-preview-image");
          if (img && img.dataset.previewSrc) {
            img.src = img.dataset.previewSrc;
            delete img.dataset.previewSrc;
          }
          obs.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px 200px 0px" },
  );

  // Initialize observer for already revealed cards (featured)
  document
    .querySelectorAll('.cert-card[data-revealed="true"]')
    .forEach((card) => {
      previewObserver.observe(card);
    });

  // Attach load and error listeners to all preview images
  document.querySelectorAll(".cert-preview-image").forEach((img) => {
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add("is-loaded");
    } else {
      img.addEventListener("load", () => img.classList.add("is-loaded"));
      img.addEventListener("error", () => {
        img.hidden = true;
        const viewport = img.closest(".cert-preview-viewport");
        if (viewport) viewport.classList.add("has-preview-error");
      });
    }
  });

  const updateRevealButton = () => {
    if (!revealBtn) return;
    const hiddenCerts = suppCerts.filter(
      (c) => c.getAttribute("data-revealed") === "false",
    );

    if (hiddenCerts.length === 0) {
      revealContainer.style.display = "none";
      return;
    }

    const nextRevealCount = Math.min(currentBatchSize, hiddenCerts.length);
    revealBtn.textContent = "Explore More";
    revealBtn.setAttribute(
      "aria-label",
      `Reveal ${nextRevealCount} more certificates`,
    );
  };

  if (revealBtn) {
    updateRevealButton();

    revealBtn.addEventListener("click", () => {
      const hiddenCerts = suppCerts.filter(
        (c) => c.getAttribute("data-revealed") === "false",
      );
      const toReveal = hiddenCerts.slice(0, currentBatchSize);

      toReveal.forEach((card) => {
        card.setAttribute("data-revealed", "true");
        card.classList.add("fade-in-up", "reveal");
        // trigger reflow
        void card.offsetWidth;
        card.classList.add("entered");
        previewObserver.observe(card);
      });

      currentBatchSize++;
      updateRevealButton();
    });
  }

  /* -------------------------
     Certificates - Fullscreen Viewer
     ------------------------- */
  const certViewer = document.getElementById("cert-viewer");
  const certViewerIframe = document.getElementById("cert-viewer-iframe");
  const certViewerTitle = document.getElementById("cert-viewer-title");
  const certViewerIssuer = document.getElementById("cert-viewer-issuer");
  const certViewerNewTab = document.getElementById("cert-viewer-new-tab");
  const certViewerClose = document.getElementById("cert-viewer-close");
  const certViewerBackdrop = document.getElementById("cert-viewer-backdrop");

  let certLastFocus = null;

  const openCertViewer = (card) => {
    if (!certViewer) return;
    certLastFocus = card;
    const pdfUrl = card.getAttribute("data-pdf-full");
    const title =
      card.getAttribute("data-cert-title") ||
      card.querySelector(".cert-title")?.textContent ||
      "";
    const issuer =
      card.getAttribute("data-cert-issuer") ||
      card.querySelector(".cert-meta span:first-child")?.textContent ||
      "";

    certViewerTitle.textContent = title;
    certViewerIssuer.textContent = issuer;
    certViewerNewTab.href = pdfUrl;
    certViewerIframe.src = pdfUrl;

    certViewer.classList.add("open");
    certViewer.setAttribute("aria-hidden", "false");
    certViewer.removeAttribute("inert");
    document.body.style.overflow = "hidden";
    document.body.classList.add("cert-viewer-open");

    setTimeout(() => {
      certViewerClose.focus();
    }, 350);
  };

  const closeCertViewer = () => {
    if (!certViewer) return;
    certViewer.classList.remove("open");
    certViewer.setAttribute("aria-hidden", "true");
    certViewer.setAttribute("inert", "");
    document.body.style.overflow = "";
    document.body.classList.remove("cert-viewer-open");

    // Clear iframe src
    certViewerIframe.src = "";

    if (certLastFocus) {
      certLastFocus.focus();
    }
  };

  if (certViewerClose && certViewerBackdrop) {
    certViewerClose.addEventListener("click", closeCertViewer);
    certViewerBackdrop.addEventListener("click", closeCertViewer);
  }

  // Need to use document.body to delegate in case cards are dynamically created
  // Though cards are rendered statically, it's safe.
  document.querySelectorAll("[data-pdf-full]").forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      if (trigger.tagName === "BUTTON" || trigger.tagName === "A") {
        e.preventDefault();
      }
      openCertViewer(trigger);
    });
    trigger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openCertViewer(trigger);
      }
    });
  });

  if (certViewer) {
    certViewer.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeCertViewer();
      }

      if (e.key === "Tab") {
        const focusables = Array.from(
          certViewer.querySelectorAll("a[href], button"),
        ).filter(
          (el) => !el.hidden && !el.disabled && el.offsetParent !== null,
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
          if (
            document.activeElement === last ||
            document.activeElement === certViewerIframe
          ) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    });
  }

  /* -------------------------
     Connected Skill Map
     ------------------------- */
  const skillDomainButtons = Array.from(
    document.querySelectorAll("[data-skill-domain]"),
  );
  const skillDomainPanels = Array.from(
    document.querySelectorAll(".skill-domain-panel"),
  );
  const skillDomainLines = Array.from(
    document.querySelectorAll("[data-domain-line]"),
  );

  const activateSkillDomain = (domain) => {
    skillDomainButtons.forEach((button) => {
      const active = button.dataset.skillDomain === domain;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    skillDomainPanels.forEach((panel) => {
      panel.hidden = panel.id !== `skill-domain-${domain}`;
    });

    skillDomainLines.forEach((line) => {
      line.classList.toggle("is-active", line.dataset.domainLine === domain);
    });
  };

  skillDomainButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      activateSkillDomain(button.dataset.skillDomain);
    });

    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
        return;
      }

      event.preventDefault();
      const direction = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
      const nextIndex = (index + direction + skillDomainButtons.length) % skillDomainButtons.length;
      const nextButton = skillDomainButtons[nextIndex];
      activateSkillDomain(nextButton.dataset.skillDomain);
      nextButton.focus();
    });
  });

  if (skillDomainButtons.length) {
    activateSkillDomain(skillDomainButtons[0].dataset.skillDomain);
  }

  /* -------------------------
     Unified Journey Filters
     ------------------------- */
  const journeyFilters = Array.from(
    document.querySelectorAll("[data-journey-filter]"),
  );
  const journeyItems = Array.from(document.querySelectorAll(".journey-item"));
  const journeyMoreButton = document.getElementById("journey-more");
  const journeyStatus = document.getElementById("journey-status");
  const journeyInitialLimit = 10;
  let activeJourneyFilter = "all";
  let journeyExpanded = false;

  const updateJourney = () => {
    let matchingIndex = 0;
    let visibleCount = 0;

    journeyItems.forEach((item) => {
      const tags = (item.dataset.journeyTags || "").split(" ");
      const matches =
        activeJourneyFilter === "all" || tags.includes(activeJourneyFilter);
      const withinLimit =
        activeJourneyFilter !== "all" ||
        journeyExpanded ||
        matchingIndex < journeyInitialLimit;

      item.hidden = !matches || !withinLimit;

      if (matches) matchingIndex += 1;
      if (matches && withinLimit) visibleCount += 1;
    });

    journeyFilters.forEach((button) => {
      const active = button.dataset.journeyFilter === activeJourneyFilter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    if (journeyMoreButton) {
      const canExpand =
        activeJourneyFilter === "all" && journeyItems.length > journeyInitialLimit;
      journeyMoreButton.hidden = !canExpand;
      journeyMoreButton.setAttribute("aria-expanded", String(journeyExpanded));
      journeyMoreButton.textContent = journeyExpanded
        ? "Show recent journey"
        : "Show complete journey";
    }

    if (journeyStatus) {
      journeyStatus.textContent = `${visibleCount} journey ${visibleCount === 1 ? "item" : "items"} shown.`;
    }
  };

  journeyFilters.forEach((button) => {
    button.addEventListener("click", () => {
      activeJourneyFilter = button.dataset.journeyFilter;
      journeyExpanded = false;
      updateJourney();
    });
  });

  journeyMoreButton?.addEventListener("click", () => {
    journeyExpanded = !journeyExpanded;
    updateJourney();
  });

  if (journeyItems.length) {
    updateJourney();
  }

  /* -------------------------
     Premium Pointer Microinteractions
     ------------------------- */
  const motionAllowed = !window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (finePointer && motionAllowed) {
    document.querySelectorAll("[data-spotlight-surface]").forEach((surface) => {
      let spotlightFrame = 0;

      surface.addEventListener("pointerenter", () => {
        surface.classList.add("has-spotlight");
      });

      surface.addEventListener("pointermove", (event) => {
        if (spotlightFrame) return;
        spotlightFrame = window.requestAnimationFrame(() => {
          const rect = surface.getBoundingClientRect();
          surface.style.setProperty("--spotlight-x", `${event.clientX - rect.left}px`);
          surface.style.setProperty("--spotlight-y", `${event.clientY - rect.top}px`);
          spotlightFrame = 0;
        });
      });

      surface.addEventListener("pointerleave", () => {
        surface.classList.remove("has-spotlight");
        surface.style.removeProperty("--spotlight-x");
        surface.style.removeProperty("--spotlight-y");
      });
    });

    document.querySelectorAll("[data-tilt-surface]").forEach((surface) => {
      let tiltFrame = 0;

      surface.addEventListener("pointermove", (event) => {
        if (tiltFrame) return;
        tiltFrame = window.requestAnimationFrame(() => {
          const rect = surface.getBoundingClientRect();
          const horizontal = (event.clientX - rect.left) / rect.width - 0.5;
          const vertical = (event.clientY - rect.top) / rect.height - 0.5;
          const maxTilt = 2.5;

          surface.style.setProperty("--tilt-x", `${vertical * -maxTilt * 2}deg`);
          surface.style.setProperty("--tilt-y", `${horizontal * maxTilt * 2}deg`);
          surface.classList.add("is-tilting");
          tiltFrame = 0;
        });
      });

      surface.addEventListener("pointerleave", () => {
        surface.classList.remove("is-tilting");
        surface.style.setProperty("--tilt-x", "0deg");
        surface.style.setProperty("--tilt-y", "0deg");
      });
    });
  }
})();

/* -------------------------
     Back to Top
     ------------------------- */
const backToTopBtn = document.getElementById("back-to-top");
if (backToTopBtn) {
  backToTopBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const mobileMenu = document.getElementById("mobile-menu");
    if (
      mobileMenu &&
      mobileMenu.classList.contains("open") &&
      typeof window.closeMenuMobile === "function"
    ) {
      window.closeMenuMobile({ restoreFocus: false });
    }

    const aiPanel = document.getElementById("ai-assistant");
    if (aiPanel && aiPanel.classList.contains("open")) {
      const closeBtn = document.querySelector("[data-ai-close]");
      if (closeBtn) closeBtn.click();
    }

    const certViewer = document.getElementById("cert-viewer");
    if (certViewer && certViewer.classList.contains("open")) {
      const certClose = document.getElementById("cert-viewer-close");
      if (certClose) certClose.click();
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });

    if (window.history && window.history.replaceState) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
  });
}
