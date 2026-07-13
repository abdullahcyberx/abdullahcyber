(() => {
  "use strict";

  const root = document.documentElement;
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)",
  ).matches;
  const cores = navigator.hardwareConcurrency || 8;
  const memory = navigator.deviceMemory || 8;
  const balanced = window.innerWidth < 820 || cores <= 4 || memory <= 4;
  root.dataset.quality = balanced ? "balanced" : "high";

  let pageVisible = !document.hidden;
  document.addEventListener(
    "visibilitychange",
    () => {
      pageVisible = !document.hidden;
      root.classList.toggle("page-hidden", !pageVisible);
      if (pageVisible && !balanced) startStarfield();
      else stopStarfield();
    },
    { passive: true },
  );

  /* -------------------------
     Lightweight starfield
     ------------------------- */
  const canvas = document.getElementById("starfield");
  const ctx = canvas?.getContext("2d", { alpha: true, desynchronized: true });
  let stars = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let starRaf = 0;
  let scrollY = window.scrollY || 0;
  let pointerX = 0.5;
  let pointerY = 0.5;

  const buildStars = () => {
    if (!ctx) return;
    const area = width * height;
    const maxStars = balanced ? 78 : 132;
    const divisor = balanced ? 17000 : 10500;
    const count = Math.max(46, Math.min(maxStars, Math.floor(area / divisor)));
    stars = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: index % 15 === 0 ? 1.7 : Math.random() * 0.95 + 0.45,
      alpha: Math.random() * 0.5 + 0.22,
      phase: Math.random() * Math.PI * 2,
      depth: index % 12 === 0 ? 1.6 : 0.65,
    }));
  };

  const resizeCanvas = () => {
    if (!ctx || !canvas) return;
    width = Math.max(window.innerWidth, 1);
    height = Math.max(window.innerHeight, 1);
    dpr = balanced ? 1 : Math.min(window.devicePixelRatio || 1, 1.35);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildStars();
  };

  const renderStars = (time = 0) => {
    starRaf = 0;
    if (!ctx || !pageVisible) return;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#e9e6ff";
    const shift = scrollY * 0.018;
    const px = (pointerX - 0.5) * (balanced ? 4 : 8);
    const py = (pointerY - 0.5) * (balanced ? 3 : 6);

    for (let i = 0; i < stars.length; i += 1) {
      const star = stars[i];
      let y = (star.y - shift * star.depth + py * star.depth) % height;
      if (y < 0) y += height;
      const x = star.x + px * star.depth;
      const twinkle =
        reducedMotion || balanced
          ? 1
          : 0.84 + Math.sin(time * 0.0012 + star.phase) * 0.16;
      ctx.globalAlpha = star.alpha * twinkle;
      ctx.fillRect(x, y, star.size, star.size);
    }
    ctx.globalAlpha = 1;
    if (!reducedMotion && !balanced)
      starRaf = requestAnimationFrame(renderStars);
  };

  const startStarfield = () => {
    if (!ctx || starRaf || !pageVisible || balanced) return;
    starRaf = requestAnimationFrame(renderStars);
  };
  const stopStarfield = () => {
    if (starRaf) cancelAnimationFrame(starRaf);
    starRaf = 0;
  };

  let resizeTimer = 0;
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resizeCanvas();
        if (reducedMotion || balanced) renderStars(performance.now());
      }, 120);
    },
    { passive: true },
  );
  window.addEventListener(
    "scroll",
    () => {
      scrollY = window.scrollY || 0;
    },
    { passive: true },
  );

  resizeCanvas();
  if (reducedMotion || balanced) renderStars(0);
  else startStarfield();

  /* -------------------------
     One pointer listener, one RAF
     ------------------------- */
  const glow = document.querySelector(".cursor-glow");
  let pointerRaf = 0;
  let clientX = -9999;
  let clientY = -9999;

  window.addEventListener(
    "pointermove",
    (event) => {
      clientX = event.clientX;
      clientY = event.clientY;
      pointerX = clientX / Math.max(window.innerWidth, 1);
      pointerY = clientY / Math.max(window.innerHeight, 1);
      if (!finePointer || !glow || pointerRaf) return;
      pointerRaf = requestAnimationFrame(() => {
        pointerRaf = 0;
        glow.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
      });
    },
    { passive: true },
  );

  const rafPointerEffect = (element, transformForEvent, minWidth = 0) => {
    if (!element || !finePointer || reducedMotion) return;
    let rect = null;
    let frame = 0;
    let lastEvent = null;

    const update = () => {
      frame = 0;
      if (!lastEvent || !rect || window.innerWidth < minWidth) return;
      element.style.transform = transformForEvent(lastEvent, rect);
    };

    element.addEventListener(
      "pointerenter",
      () => {
        rect = element.getBoundingClientRect();
        element.classList.add("is-interacting");
      },
      { passive: true },
    );

    element.addEventListener(
      "pointermove",
      (event) => {
        lastEvent = event;
        if (!rect) rect = element.getBoundingClientRect();
        if (!frame) frame = requestAnimationFrame(update);
      },
      { passive: true },
    );

    element.addEventListener(
      "pointerleave",
      () => {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        lastEvent = null;
        rect = null;
        element.classList.remove("is-interacting");
        element.style.transform = "";
      },
      { passive: true },
    );
  };

  rafPointerEffect(
    document.getElementById("visual-frame"),
    (event, rect) => {
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      return `perspective(1100px) rotateX(${-y * 5.5}deg) rotateY(${x * 6.5}deg) translate3d(0,0,0)`;
    },
    760,
  );

  rafPointerEffect(
    document.getElementById("keyboard-board"),
    (event, rect) => {
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      return `rotateX(${54 - y * 4}deg) rotateZ(${-9 + x * 2.4}deg) rotateY(${2 + x * 4}deg) translate3d(0,0,0)`;
    },
    1351,
  );

  document.querySelectorAll(".tilt-card").forEach((card) => {
    rafPointerEffect(
      card,
      (event, rect) => {
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        return `perspective(1100px) rotateX(${-y * 2.1}deg) rotateY(${x * 2.6}deg) translate3d(0,-3px,0)`;
      },
      860,
    );
  });

  document.querySelectorAll(".magnetic").forEach((button) => {
    rafPointerEffect(
      button,
      (event, rect) => {
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        return `translate3d(${x * 0.055}px, ${y * 0.07}px, 0)`;
      },
      860,
    );
  });

  /* Pause decorative CSS animations when offscreen. */
  const animatedDecor = document.querySelectorAll(
    ".planet, .orbit-one, .orbit-two, .floating-tag, .identity-avatar i, .radar-ring, .cube, .achievement-ring",
  );
  if (reducedMotion) {
    animatedDecor.forEach((element) => {
      element.style.animationPlayState = "paused";
    });
  } else if ("IntersectionObserver" in window) {
    animatedDecor.forEach((element) => {
      element.style.animationPlayState = "paused";
    });
    const animationObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.style.animationPlayState = entry.isIntersecting
            ? "running"
            : "paused";
        });
      },
      { rootMargin: "180px 0px", threshold: 0 },
    );
    animatedDecor.forEach((element) => animationObserver.observe(element));
  }

  /* Reveal animation */
  const revealElements = [...document.querySelectorAll(".reveal")];
  if ("IntersectionObserver" in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -35px 0px" },
    );
    revealElements.forEach((element, index) => {
      element.style.transitionDelay = `${Math.min((index % 3) * 45, 90)}ms`;
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => element.classList.add("visible"));
  }

  /* Typed role */
  const roles = [
    "Penetration Tester",
    "Web Security Learner",
    "CTF Organizer & Player",
    "Cybersecurity Student",
  ];
  const typedRole = document.getElementById("typed-role");
  let roleIndex = 0;
  let charIndex = roles[0].length;
  let deleting = true;
  let roleTimer = 0;

  const scheduleRole = (delay) => {
    clearTimeout(roleTimer);
    roleTimer = window.setTimeout(typeRole, delay);
  };
  const typeRole = () => {
    if (reducedMotion || !typedRole) return;
    if (!pageVisible) return scheduleRole(500);
    const current = roles[roleIndex];
    if (deleting) {
      charIndex -= 1;
      typedRole.textContent = current.slice(0, Math.max(charIndex, 0));
      if (charIndex <= 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        scheduleRole(360);
      } else scheduleRole(46);
    } else {
      const next = roles[roleIndex];
      charIndex += 1;
      typedRole.textContent = next.slice(0, charIndex);
      if (charIndex >= next.length) {
        deleting = true;
        scheduleRole(1450);
      } else scheduleRole(68);
    }
  };
  if (!reducedMotion) scheduleRole(1500);

  /* Mobile navigation */
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("main-nav");
  const closeMenu = () => {
    menuToggle?.setAttribute("aria-expanded", "false");
    nav?.classList.remove("open");
    document.body.classList.remove("menu-open");
  };
  menuToggle?.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    nav?.classList.toggle("open", !expanded);
    document.body.classList.toggle("menu-open", !expanded);
  });
  nav
    ?.querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", closeMenu));

  /* Active navigation */
  const sections = [...document.querySelectorAll("main section[id]")];
  const navLinks = [...document.querySelectorAll(".nav-links a")];
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        navLinks.forEach((link) => {
          link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${visible.target.id}`,
          );
        });
      },
      { threshold: [0.2, 0.45, 0.7], rootMargin: "-18% 0px -58% 0px" },
    );
    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* Interactive skills */
  const skills = {
    burp: {
      index: "TOOL / 01",
      title: "Burp Suite",
      description:
        "Intercepting, inspecting and testing web traffic to understand application behavior and identify security weaknesses.",
      level: "Hands-on toolkit",
      percent: 86,
    },
    nmap: {
      index: "TOOL / 02",
      title: "Nmap",
      description:
        "Mapping hosts, services and exposed ports to build an informed picture of a target environment.",
      level: "Network discovery",
      percent: 84,
    },
    gobuster: {
      index: "TOOL / 03",
      title: "Gobuster",
      description:
        "Discovering hidden web paths, virtual hosts and DNS entries during authorized reconnaissance.",
      level: "Content discovery",
      percent: 80,
    },
    wireshark: {
      index: "TOOL / 04",
      title: "Wireshark",
      description:
        "Inspecting packets and protocols to understand network conversations and troubleshoot suspicious behavior.",
      level: "Traffic analysis",
      percent: 78,
    },
    web: {
      index: "FOCUS / 05",
      title: "Web Penetration Testing",
      description:
        "Testing authentication, authorization, input handling and business logic in authorized web applications.",
      level: "Primary focus",
      percent: 92,
    },
    linux: {
      index: "PLATFORM / 06",
      title: "Linux",
      description:
        "Working comfortably with the command line, permissions, services and common security workflows.",
      level: "Daily environment",
      percent: 87,
    },
    docker: {
      index: "PLATFORM / 07",
      title: "Docker",
      description:
        "Using containers to build isolated labs, reproduce environments and support security testing workflows.",
      level: "Lab environment",
      percent: 76,
    },
    vulnerability: {
      index: "METHOD / 08",
      title: "Vulnerability Assessment",
      description:
        "Identifying, validating, prioritizing and communicating security weaknesses with practical recommendations.",
      level: "Assessment workflow",
      percent: 85,
    },
    sqli: {
      index: "VULN / 09",
      title: "SQL Injection",
      description:
        "Understanding how unsafe query handling can expose, alter or destroy application data.",
      level: "Web vulnerability",
      percent: 82,
    },
    xss: {
      index: "VULN / 10",
      title: "Cross-Site Scripting",
      description:
        "Testing how untrusted input reaches the browser and can affect users or application sessions.",
      level: "Web vulnerability",
      percent: 82,
    },
    networking: {
      index: "CORE / 11",
      title: "Networking Fundamentals",
      description:
        "Applying TCP/IP, routing, DNS, ports and service knowledge to security analysis and troubleshooting.",
      level: "Core foundation",
      percent: 86,
    },
    firewall: {
      index: "CONTROL / 12",
      title: "Firewall Configuration",
      description:
        "Understanding filtering rules and network boundaries through practical firewall setup labs.",
      level: "Security control",
      percent: 73,
    },
    ids: {
      index: "CONTROL / 13",
      title: "IDS Concepts",
      description:
        "Studying how intrusion detection systems identify suspicious activity and support defensive monitoring.",
      level: "Defensive awareness",
      percent: 70,
    },
    gophish: {
      index: "TOOL / 14",
      title: "Gophish",
      description:
        "Creating controlled and authorized phishing simulations for awareness assessment and education.",
      level: "Campaign tooling",
      percent: 80,
    },
    honeypot: {
      index: "LAB / 15",
      title: "Honeypot Deployment",
      description:
        "Deploying intentionally exposed services to observe brute-force attempts and attacker behavior safely.",
      level: "Threat observation",
      percent: 79,
    },
    ctf: {
      index: "PRACTICE / 16",
      title: "CTF Challenges",
      description:
        "Solving and organizing practical challenges that develop security intuition, creativity and teamwork.",
      level: "Competitive practice",
      percent: 90,
    },
    osint: {
      index: "METHOD / 17",
      title: "OSINT",
      description:
        "Collecting and validating publicly available information as part of structured reconnaissance.",
      level: "Reconnaissance",
      percent: 72,
    },
    mindset: {
      index: "CORE / 00",
      title: "Security Mindset",
      description:
        "Understanding application logic, questioning trust boundaries and combining tools with structured reasoning.",
      level: "Primary approach",
      percent: 92,
    },
  };

  const skillKeys = [...document.querySelectorAll(".skill-key")];
  const skillIndex = document.getElementById("skill-index");
  const skillTitle = document.getElementById("skill-title");
  const skillDescription = document.getElementById("skill-description");
  const skillLevelLabel = document.getElementById("skill-level-label");
  const skillLevelBar = document.getElementById("skill-level-bar");
  let activeSkill = "mindset";

  const selectSkill = (key) => {
    const id = key?.dataset.skill;
    if (!id || id === activeSkill) return;
    const skill = skills[id];
    if (!skill) return;
    activeSkill = id;
    skillKeys.forEach((item) => item.classList.toggle("active", item === key));
    skillIndex.textContent = skill.index;
    skillTitle.textContent = skill.title;
    skillDescription.textContent = skill.description;
    skillLevelLabel.textContent = skill.level;
    skillLevelBar.style.width = `${skill.percent}%`;
  };

  skillKeys.forEach((key) => {
    key.addEventListener("click", () => selectSkill(key));
    key.addEventListener("focus", () => selectSkill(key));
    if (finePointer)
      key.addEventListener("pointerenter", () => selectSkill(key), {
        passive: true,
      });
  });

  /* Case-study modal */
  const caseStudies = {
    phishing: {
      label: "Case study / Social engineering",
      title: "Authorized Phishing Awareness Campaign",
      summary:
        "A controlled, academically supervised simulation designed to evaluate how users respond to realistic phishing cues without exposing participants to harmful content.",
      objective:
        "Assess awareness, observe interaction patterns and identify opportunities for better security education.",
      environment:
        "Gophish-based campaign conducted under academic supervision with an explicitly authorized scope.",
      learning:
        "Campaign configuration, ethical scoping, communication design, result interpretation and awareness-focused reporting.",
      ethics:
        "No unauthorized targeting. The activity was conducted as a supervised learning exercise with a defined audience and purpose.",
    },
    honeypot: {
      label: "Case study / Threat observation",
      title: "SSH Honeypot Deployment",
      summary:
        "A lab deployment created to expose a controlled SSH service and study automated brute-force behavior in an isolated environment.",
      objective:
        "Observe login attempts, attacker patterns and the value of deception systems for security learning.",
      environment:
        "sshesame deployed inside a VirtualBox lab with controlled networking and logging.",
      learning:
        "Linux services, SSH behavior, log review, safe exposure design and basic attacker-behavior analysis.",
      ethics:
        "Isolated lab setup with no offensive interaction against external systems.",
    },
  };
  const modal = document.getElementById("case-modal");
  const modalFields = {
    label: document.getElementById("modal-label"),
    title: document.getElementById("modal-title"),
    summary: document.getElementById("modal-summary"),
    objective: document.getElementById("modal-objective"),
    environment: document.getElementById("modal-environment"),
    learning: document.getElementById("modal-learning"),
    ethics: document.getElementById("modal-ethics"),
  };

  document.querySelectorAll("[data-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = caseStudies[button.dataset.modal];
      if (!item || !modal) return;
      Object.entries(modalFields).forEach(([key, element]) => {
        if (element) element.textContent = item[key];
      });
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

  /* Contact form */
  document
    .getElementById("contact-form")
    ?.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const message = String(data.get("message") || "").trim();
      const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
      const body = encodeURIComponent(`Name: ${name}
Email: ${email}

${message}`);
      window.location.href = `mailto:abdullahcyberx@gmail.com?subject=${subject}&body=${body}`;
    });

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();

(() => {
  "use strict";

  const assistant = document.getElementById("ai-assistant");
  const launcher = document.getElementById("ai-launcher");
  const panel = document.getElementById("ai-panel");
  const closeButton = document.getElementById("ai-close");
  const soundButton = document.getElementById("ai-sound");
  const unread = document.getElementById("ai-unread");
  const messages = document.getElementById("ai-messages");
  const quickActions = document.getElementById("ai-quick-actions");
  const form = document.getElementById("ai-form");
  const input = document.getElementById("ai-input");
  const micButton = document.getElementById("ai-mic");
  const toast = document.getElementById("ai-toast");
  const starburst = document.getElementById("ai-starburst");
  if (!assistant || !launcher || !panel || !messages || !form || !input) return;

  const state = {
    open: false,
    greeted: false,
    busy: false,
    sound: false,
    lastIntent: "",
    challengeStep: 0,
    challengeUnlocked: false,
    recognition: null,
  };

  const stopWords = new Set([
    "a",
    "an",
    "the",
    "is",
    "are",
    "was",
    "were",
    "be",
    "about",
    "of",
    "to",
    "for",
    "and",
    "or",
    "his",
    "him",
    "he",
    "me",
    "i",
    "you",
    "your",
    "please",
    "can",
    "could",
    "would",
    "tell",
    "show",
    "give",
    "what",
    "who",
    "where",
    "when",
    "how",
    "does",
    "do",
  ]);
  const normalize = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9+#.\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const tokens = (value) =>
    normalize(value)
      .split(" ")
      .filter((token) => token && !stopWords.has(token));
  const escapeHTML = (value) =>
    String(value).replace(
      /[&<>'"]/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        })[character],
    );
  const stripHTML = (html) => {
    const node = document.createElement("div");
    node.innerHTML = html;
    return (node.textContent || "").replace(/\s+/g, " ").trim();
  };

  const aiData = JSON.parse(
    document.getElementById("ai-data")?.textContent || "{}",
  );
  const knowledge = (aiData.customAnswers || []).map((a, i) => ({
    id: "dynamic-" + i,
    patterns: a.keywords,
    keywords: a.keywords,
    answer: a.response,
    source: "Verified from portfolio content.",
  }));

  const canned = {
    greeting:
      "<p>Hello — I’m <strong>Shehzada’s AI</strong>, Muhammad’s portfolio assistant.</p><p>I answer from verified portfolio facts only.</p>",
    thanks:
      "<p>You’re welcome. I can also prepare a recruiter briefing, guide you to supporting evidence or launch the mini CTF challenge.</p>",
    unknown:
      "<p>" +
      (aiData.fallbackResponse ||
        "I could not verify that from the portfolio.") +
      "</p>",
    help: "<p><strong>Shehzada’s AI commands</strong></p><ul><li><strong>/brief</strong> — recruiter briefing</li><li><strong>/scan</strong> — evidence scan</li><li><strong>/challenge</strong> — CTF dossier</li><li><strong>/clear</strong> — reset</li></ul>",
  };

  const matchIntent = (query) => {
    const normalized = normalize(query);
    const queryTokens = tokens(normalized);
    let best = null;
    let bestScore = 0;

    for (const item of knowledge) {
      let score = 0;
      for (const pattern of item.patterns) {
        const normalizedPattern = normalize(pattern);
        if (normalized === normalizedPattern) score += 14;
        else if (normalized.includes(normalizedPattern)) score += 9;
        else {
          const patternTokens = tokens(normalizedPattern);
          const overlap = patternTokens.filter((token) =>
            queryTokens.includes(token),
          ).length;
          if (patternTokens.length && overlap === patternTokens.length)
            score += 5;
          else score += overlap * 1.5;
        }
      }
      for (const keyword of item.keywords) {
        const key = normalize(keyword);
        if (normalized.includes(key)) score += key.includes(" ") ? 4 : 2;
      }
      if (
        item.id === "private" &&
        /phone|address|age|birth|salary|cnic|marital/.test(normalized)
      )
        score += 20;
      if (score > bestScore) {
        bestScore = score;
        best = item;
      }
    }
    return bestScore >= 4 ? { item: best, score: bestScore } : null;
  };

  const scrollMessages = () =>
    requestAnimationFrame(() => {
      messages.scrollTop = messages.scrollHeight;
    });
  const addMessage = (content, role = "assistant", options = {}) => {
    const wrapper = document.createElement("div");
    wrapper.className = `ai-message ${role}`;
    if (role === "assistant") {
      const avatar = document.createElement("div");
      avatar.className = "ai-message-avatar";
      avatar.textContent = "AI";
      avatar.setAttribute("aria-hidden", "true");
      wrapper.appendChild(avatar);
    }
    const bubble = document.createElement("div");
    bubble.className = "ai-bubble";
    if (options.html) bubble.innerHTML = content;
    else bubble.textContent = content;
    if (options.source) {
      const source = document.createElement("div");
      source.className = "ai-source";
      source.textContent = `Source: ${options.source}`;
      bubble.appendChild(source);
    }
    wrapper.appendChild(bubble);
    messages.appendChild(wrapper);
    scrollMessages();
    if (role === "assistant" && state.sound && options.speak !== false)
      speak(stripHTML(content));
    return wrapper;
  };

  const addThinking = () => {
    const wrapper = addMessage(
      '<span class="ai-thinking" aria-label="Shehzada’s AI is thinking"><i></i><i></i><i></i></span>',
      "assistant",
      { html: true, speak: false },
    );
    wrapper.dataset.thinking = "true";
    return wrapper;
  };

  const speak = (text) => {
    if (!("speechSynthesis" in window) || !state.sound || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 700));
    utterance.rate = 1.04;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const renderQuickActions = (items) => {
    quickActions.innerHTML = "";
    items.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ai-chip";
      button.textContent = item.label;
      if (item.query) button.dataset.query = item.query;
      if (item.special) button.dataset.aiSpecial = item.special;
      quickActions.appendChild(button);
    });
  };

  const defaultActions = () =>
    renderQuickActions([
      { label: "Why hire Muhammad?", query: "Why should we hire Muhammad?" },
      {
        label: "Main certifications",
        query: "What are his main certifications?",
      },
      { label: "Recruiter briefing", special: "brief" },
      { label: "Cosmic scan", special: "scan" },
      { label: "CTF challenge", special: "challenge" },
    ]);

  const followupActions = (intent) => {
    const common = [
      { label: "Recruiter briefing", special: "brief" },
      { label: "Contact Muhammad", query: "How can I contact him?" },
    ];
    const map = {
      experience: [
        {
          label: "Inara internship",
          query: "Tell me about the Inara internship",
        },
        { label: "Projects", query: "What projects has he done?" },
      ],
      projects: [
        {
          label: "Phishing project",
          query: "Tell me about the phishing project",
        },
        { label: "Honeypot project", query: "Tell me about the SSH honeypot" },
      ],
      "main-certs": [
        { label: "All credentials", query: "Show all certificates" },
        { label: "Skills", query: "What tools does he use?" },
      ],
      skills: [
        { label: "Web-security focus", query: "What is his security focus?" },
        { label: "CTF record", query: "What are his CTF achievements?" },
      ],
    };
    renderQuickActions([...(map[intent] || []), ...common].slice(0, 4));
  };

  const openPanel = (focusInput = true) => {
    state.open = true;
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    launcher.setAttribute("aria-expanded", "true");
    document.body.classList.add("ai-open");
    unread?.classList.remove("show");
    if (!state.greeted) {
      state.greeted = true;
      addMessage(canned.greeting, "assistant", { html: true, speak: false });
      defaultActions();
    }
    if (focusInput) window.setTimeout(() => input.focus(), 120);
  };

  const closePanel = () => {
    state.open = false;
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
    launcher.setAttribute("aria-expanded", "false");
    document.body.classList.remove("ai-open");
    launcher.focus({ preventScroll: true });
  };

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 1700);
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied to clipboard");
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      showToast("Copied to clipboard");
    }
  };

  const recruiterText = `Muhammad Abdullah is an entry-level cybersecurity candidate focused on web penetration testing. Evidence includes two cybersecurity internships, hands-on work with Linux, networking and Docker, authorized phishing-awareness and SSH-honeypot projects, WEB-RTA and CAPT certifications, two CTF runner-up placements and CTF event organization. Best fit: cybersecurity internship or junior penetration-testing role with mentorship and practical assessment work. Degree completion is expected in 2028.`;

  const recruiterBriefing = () => {
    const html = `<p><strong>Recruiter briefing generated from verified evidence</strong></p>
      <div class="ai-feature-card">
        <div class="ai-feature-head">Candidate signal map <span>Grounded</span></div>
        <div class="ai-feature-body">
          <div class="ai-signal"><span>Web security</span><span class="ai-signal-track"><i style="--signal:92%"></i></span><b>Primary focus</b></div>
          <div class="ai-signal"><span>Practical exposure</span><span class="ai-signal-track"><i style="--signal:78%"></i></span><b>2 internships</b></div>
          <div class="ai-signal"><span>Competitive practice</span><span class="ai-signal-track"><i style="--signal:86%"></i></span><b>2× runner-up</b></div>
          <div class="ai-signal"><span>Evidence quality</span><span class="ai-signal-track"><i style="--signal:82%"></i></span><b>Projects + certs</b></div>
          <div class="ai-verdict"><strong>Best-fit positioning:</strong> cybersecurity intern or junior penetration-testing candidate. Strongest evidence is hands-on learning, web-security focus, ethical project work and CTF performance. Honest growth area: he is still completing his degree and does not claim senior production experience.</div>
          <div class="ai-action-row"><button class="ai-mini-action" type="button" data-ai-special="copy-brief">Copy briefing</button><a class="ai-mini-action" href="assets/Muhammad-Abdullah-CV.pdf" target="_blank">Open CV</a><a class="ai-mini-action" href="mailto:abdullahcyberx@gmail.com">Contact</a></div>
        </div>
      </div>`;
    addMessage(html, "assistant", {
      html: true,
      source:
        "Compiled from experience, projects, credentials, achievements and education.",
    });
    renderQuickActions([
      { label: "Interview questions", special: "interview" },
      { label: "Run evidence scan", special: "scan" },
      { label: "Start CTF challenge", special: "challenge" },
    ]);
  };

  const interviewQuestions = () => {
    addMessage(
      `<p><strong>Three evidence-based interview questions</strong></p><ol><li>Walk through how you scoped and measured the authorized phishing-awareness campaign.</li><li>What did your SSH honeypot logs reveal, and how did you keep the lab isolated?</li><li>Describe how you would test authentication and authorization in a new web application.</li></ol><p>These questions test the exact areas Muhammad claims and help distinguish memorized knowledge from practical understanding.</p>`,
      "assistant",
      {
        html: true,
        source: "Derived from his listed projects and web-security focus.",
      },
    );
  };

  const runScan = async () => {
    if (state.busy) return;
    state.busy = true;
    const wrapper = addMessage(
      `<p><strong>Initializing cosmic evidence scan…</strong></p><div class="ai-scan-line"><i></i></div><div class="ai-code" data-scan-log>→ verifying profile facts<br>→ mapping experience signals</div>`,
      "assistant",
      { html: true, speak: false },
    );
    const log = wrapper.querySelector("[data-scan-log]");
    const pause = (ms) =>
      new Promise((resolve) =>
        window.setTimeout(
          resolve,
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? 10
            : ms,
        ),
      );
    await pause(420);
    if (log) log.innerHTML += "<br>→ validating project scope";
    await pause(420);
    if (log) log.innerHTML += "<br>→ checking credential links";
    await pause(420);
    state.busy = false;
    if (log)
      log.innerHTML +=
        '<br><span class="ai-access">✓ EVIDENCE MAP COMPLETE</span>';
    recruiterBriefing();
  };

  const burst = () => {
    if (
      !starburst ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    starburst.innerHTML = "";
    const count = 24;
    for (let index = 0; index < count; index += 1) {
      const particle = document.createElement("i");
      const angle = (Math.PI * 2 * index) / count;
      const distance = 90 + Math.random() * 180;
      particle.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
      particle.style.setProperty("--y", `${Math.sin(angle) * distance}px`);
      particle.style.color =
        index % 3 === 0 ? "#ff75c8" : index % 2 === 0 ? "#9a79ff" : "#61e7ff";
      starburst.appendChild(particle);
    }
    window.setTimeout(() => {
      starburst.innerHTML = "";
    }, 800);
  };

  const startChallenge = () => {
    state.challengeStep = 1;
    addMessage(
      `<p><strong>CLASSIFIED CTF CHANNEL OPEN</strong></p><div class="ai-code">Challenge 1/2<br><br>I can alter a database query when user input is handled unsafely. What am I?</div><p>Type the vulnerability name to continue.</p>`,
      "assistant",
      { html: true, speak: false },
    );
    renderQuickActions([
      { label: "Hint", special: "hint" },
      { label: "Exit challenge", special: "exit-challenge" },
    ]);
    input.placeholder = "Enter your CTF answer…";
  };

  const finishChallenge = () => {
    state.challengeStep = 0;
    state.challengeUnlocked = true;
    input.placeholder = "Ask about experience, skills or projects…";
    burst();
    addMessage(
      `<p class="ai-access">✓ ACCESS GRANTED — SHEHZADA’S DOSSIER UNLOCKED</p>
      <div class="ai-feature-card"><div class="ai-feature-head">Hidden profile dossier <span>Unlocked</span></div><div class="ai-feature-body">
      <div class="ai-code">SUBJECT: MUHAMMAD ABDULLAH<br>PRIMARY_VECTOR: WEB_SECURITY<br>FIELD_EXPOSURE: 2_INTERNSHIPS<br>CTF_SIGNAL: 2X_RUNNER_UP<br>PROJECT_SCOPE: AUTHORIZED_ONLY<br>DISCIPLINE_MARKER: HAFIZ_E_QURAN<br>KEYBOARD_THROUGHPUT: 100+_WPM</div>
      <div class="ai-verdict">You unlocked the concise evidence layer. The real “secret” is not a hidden claim: it is the combination of disciplined learning, competitive practice and ethical hands-on work.</div>
      <div class="ai-action-row"><button class="ai-mini-action" type="button" data-ai-special="copy-brief">Copy recruiter summary</button><a class="ai-mini-action" href="#projects" data-ai-nav="projects">Inspect evidence</a></div>
      </div></div>`,
      "assistant",
      {
        html: true,
        source: "Every dossier field is verified elsewhere in the portfolio.",
      },
    );
    defaultActions();
  };

  const handleChallenge = (query) => {
    const normalized = normalize(query);
    if (state.challengeStep === 1) {
      if (/sql injection|sqli|sql-injection/.test(normalized)) {
        state.challengeStep = 2;
        addMessage(
          `<p class="ai-access">✓ Correct: SQL Injection</p><div class="ai-code">Challenge 2/2<br><br>I execute untrusted script in a visitor’s browser when output is not safely handled. What am I?</div>`,
          "assistant",
          { html: true, speak: false },
        );
        renderQuickActions([
          { label: "Hint", special: "hint" },
          { label: "Exit challenge", special: "exit-challenge" },
        ]);
      } else {
        addMessage(
          `<p>Not quite. Think about a vulnerability where crafted input changes the structure of a database command.</p>`,
          "assistant",
          { html: true, speak: false },
        );
      }
      return true;
    }
    if (state.challengeStep === 2) {
      if (/cross site scripting|cross-site scripting|xss/.test(normalized))
        finishChallenge();
      else
        addMessage(
          `<p>Not quite. The answer is a three-letter web vulnerability that runs script in the browser.</p>`,
          "assistant",
          { html: true, speak: false },
        );
      return true;
    }
    return false;
  };

  const clearConversation = () => {
    messages.innerHTML = "";
    state.greeted = true;
    state.lastIntent = "";
    state.challengeStep = 0;
    input.placeholder = "Ask about experience, skills or projects…";
    addMessage(canned.greeting, "assistant", { html: true, speak: false });
    defaultActions();
  };

  const processQuery = async (rawQuery) => {
    const query = String(rawQuery || "").trim();
    if (!query || state.busy) return;
    addMessage(query, "user");
    input.value = "";

    if (handleChallenge(query)) return;
    const normalized = normalize(query);
    if (
      /^(hi|hello|hey|salam|assalam|assalamu alaikum|good morning|good evening)\b/.test(
        normalized,
      )
    ) {
      addMessage(canned.greeting, "assistant", { html: true });
      defaultActions();
      return;
    }
    if (/^(thanks|thank you|thx|great|nice|good answer)\b/.test(normalized)) {
      addMessage(canned.thanks, "assistant", { html: true });
      defaultActions();
      return;
    }
    if (normalized === "/help" || normalized === "help") {
      addMessage(canned.help, "assistant", { html: true });
      return;
    }
    if (
      normalized === "/clear" ||
      normalized === "clear" ||
      normalized === "clear chat"
    ) {
      clearConversation();
      return;
    }
    if (
      normalized === "/brief" ||
      normalized === "brief" ||
      normalized.includes("recruiter briefing")
    ) {
      recruiterBriefing();
      return;
    }
    if (
      normalized === "/scan" ||
      normalized === "scan" ||
      normalized.includes("cosmic scan") ||
      normalized.includes("evidence scan")
    ) {
      runScan();
      return;
    }
    if (
      normalized === "/challenge" ||
      normalized === "challenge" ||
      normalized.includes("ctf challenge")
    ) {
      startChallenge();
      return;
    }
    if (
      /^(more|tell me more|continue|go on)$/.test(normalized) &&
      state.lastIntent
    ) {
      const previous = knowledge.find((item) => item.id === state.lastIntent);
      if (previous) {
        addMessage(previous.answer, "assistant", {
          html: true,
          source: previous.source,
        });
        followupActions(previous.id);
        return;
      }
    }

    state.busy = true;
    const thinking = addThinking();
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : Math.min(360, 110 + query.length * 3);
    window.setTimeout(() => {
      thinking.remove();
      const result = matchIntent(query);
      if (result?.item) {
        state.lastIntent = result.item.id;
        addMessage(result.item.answer, "assistant", {
          html: true,
          source: result.item.source,
        });
        followupActions(result.item.id);
      } else {
        addMessage(canned.unknown, "assistant", {
          html: true,
          source: "Accuracy guard: no matching verified fact was found.",
        });
        defaultActions();
      }
      state.busy = false;
    }, delay);
  };

  const handleSpecial = (special) => {
    switch (special) {
      case "brief":
        recruiterBriefing();
        break;
      case "scan":
        runScan();
        break;
      case "challenge":
        startChallenge();
        break;
      case "interview":
        interviewQuestions();
        break;
      case "copy-brief":
        copyText(recruiterText);
        break;
      case "hint":
        addMessage(
          state.challengeStep === 1
            ? "<p>Hint: the abbreviation begins with <strong>SQL</strong>.</p>"
            : "<p>Hint: the abbreviation is <strong>X__</strong>.</p>",
          "assistant",
          { html: true, speak: false },
        );
        break;
      case "exit-challenge":
        state.challengeStep = 0;
        input.placeholder = "Ask about experience, skills or projects…";
        addMessage(
          "<p>CTF channel closed. No progress was stored.</p>",
          "assistant",
          { html: true, speak: false },
        );
        defaultActions();
        break;
      default:
        break;
    }
  };

  launcher.addEventListener("click", () =>
    state.open ? closePanel() : openPanel(),
  );
  closeButton?.addEventListener("click", closePanel);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    processQuery(input.value);
  });
  quickActions.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.query) processQuery(button.dataset.query);
    else if (button.dataset.aiSpecial) handleSpecial(button.dataset.aiSpecial);
  });
  messages.addEventListener("click", (event) => {
    const special = event.target.closest("[data-ai-special]");
    if (special) {
      handleSpecial(special.dataset.aiSpecial);
      return;
    }
    const navLink = event.target.closest("[data-ai-nav]");
    if (!navLink) return;
    const sectionId = navLink.dataset.aiNav;
    const section = document.getElementById(sectionId);
    if (section) {
      event.preventDefault();
      if (navLink.dataset.aiOpenCerts === "true")
        section
          .querySelector("details.supporting-certificates")
          ?.setAttribute("open", "");
      section.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
      if (window.innerWidth < 621) closePanel();
    }
  });

  soundButton?.addEventListener("click", () => {
    state.sound = !state.sound;
    soundButton.classList.toggle("active", state.sound);
    soundButton.setAttribute("aria-pressed", String(state.sound));
    soundButton.setAttribute(
      "aria-label",
      state.sound ? "Disable spoken answers" : "Enable spoken answers",
    );
    if (!state.sound && "speechSynthesis" in window)
      window.speechSynthesis.cancel();
    showToast(
      state.sound ? "Spoken answers enabled" : "Spoken answers disabled",
    );
  });

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition && micButton) {
    micButton.hidden = false;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    state.recognition = recognition;
    recognition.addEventListener("start", () => {
      micButton.classList.add("active");
      input.placeholder = "Listening…";
    });
    recognition.addEventListener("end", () => {
      micButton.classList.remove("active");
      input.placeholder = state.challengeStep
        ? "Enter your CTF answer…"
        : "Ask about experience, skills or projects…";
    });
    recognition.addEventListener("result", (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      input.value = transcript;
      processQuery(transcript);
    });
    micButton.addEventListener("click", () => {
      try {
        recognition.start();
      } catch {
        /* Already listening. */
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "/") {
      event.preventDefault();
      state.open ? closePanel() : openPanel();
    } else if (event.key === "Escape" && state.open) closePanel();
  });

  window.setTimeout(() => {
    if (!state.open && !state.greeted) unread?.classList.add("show");
  }, 1200);

  const runSelfTest = () => {
    const assertions = [];
    const expect = (name, condition) =>
      assertions.push({ name, passed: Boolean(condition) });
    expect(
      "main certifications intent",
      matchIntent("What are the two main certifications?")?.item?.id ===
        "main-certs",
    );
    expect(
      "experience intent",
      matchIntent("Tell me about his internships")?.item?.id === "experience",
    );
    expect(
      "project intent",
      matchIntent("Explain the SSH honeypot project")?.item?.id === "honeypot",
    );
    expect(
      "private data guard",
      matchIntent("What is his phone number?")?.item?.id === "private",
    );
    expect(
      "unknown stays unknown",
      matchIntent("What is his favorite pizza?") === null,
    );
    expect(
      "contact intent",
      matchIntent("How can I email Muhammad?")?.item?.id === "contact",
    );
    return { passed: assertions.every((item) => item.passed), assertions };
  };

  window.ShehzadasAI = {
    ask: processQuery,
    open: openPanel,
    close: closePanel,
    matchIntent: (query) => matchIntent(query)?.item?.id || null,
    runSelfTest,
    getState: () => ({ ...state, recognition: Boolean(state.recognition) }),
  };
})();

(() => {
  "use strict";

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const progressBar = document.getElementById("scroll-progress-bar");
  const siteHeader = document.querySelector(".site-header");
  let scrollFrame = 0;
  let lastScrollY = window.scrollY || 0;
  const updateProgress = () => {
    scrollFrame = 0;
    const currentScrollY = window.scrollY || 0;
    const max = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      1,
    );
    const progress = Math.min(1, Math.max(0, currentScrollY / max));
    if (progressBar) progressBar.style.transform = `scaleX(${progress})`;

    if (siteHeader) {
      if (
        currentScrollY > lastScrollY &&
        currentScrollY > 100 &&
        window.innerWidth > 860
      ) {
        siteHeader.classList.add("nav-hidden");
      } else {
        siteHeader.classList.remove("nav-hidden");
      }
    }
    lastScrollY = currentScrollY;
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(updateProgress);
    },
    { passive: true },
  );
  updateProgress();

  const moreToggle = document.getElementById("nav-more-toggle");
  const moreMenu = document.getElementById("nav-more-menu");
  const closeDesktopMore = () => {
    moreToggle?.setAttribute("aria-expanded", "false");
    moreMenu?.setAttribute("aria-hidden", "true");
    moreMenu?.classList.remove("open");
  };
  const openDesktopMore = () => {
    moreToggle?.setAttribute("aria-expanded", "true");
    moreMenu?.setAttribute("aria-hidden", "false");
    moreMenu?.classList.add("open");
  };
  moreToggle?.addEventListener("click", (event) => {
    event.stopPropagation();
    moreMenu?.classList.contains("open")
      ? closeDesktopMore()
      : openDesktopMore();
  });
  moreMenu?.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeDesktopMore();
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".nav-more")) closeDesktopMore();
  });

  const sheet = document.getElementById("mobile-sheet");
  const sheetBackdrop = document.getElementById("mobile-sheet-backdrop");
  const sheetTrigger = document.getElementById("mobile-menu-trigger");
  let sheetReturnFocus = null;
  const closeSheet = () => {
    sheet?.classList.remove("active", "open");
    sheetBackdrop?.classList.remove("active", "open");
    sheet?.setAttribute("aria-hidden", "true");
    sheetBackdrop?.setAttribute("aria-hidden", "true");
    sheetTrigger?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("sheet-open");
    sheetReturnFocus?.focus?.();
  };
  const openSheet = () => {
    sheetReturnFocus = document.activeElement;
    sheet?.classList.add("active", "open");
    sheetBackdrop?.classList.add("active", "open");
    sheet?.setAttribute("aria-hidden", "false");
    sheetBackdrop?.setAttribute("aria-hidden", "false");
    sheetTrigger?.setAttribute("aria-expanded", "true");
    document.body.classList.add("sheet-open");
  };
  sheetTrigger?.addEventListener("click", () =>
    sheet?.classList.contains("open") ? closeSheet() : openSheet(),
  );
  sheetBackdrop?.addEventListener("click", closeSheet);
  sheet
    ?.querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", closeSheet));

  const commandDialog = document.getElementById("command-palette");
  const commandSearch = document.getElementById("command-search");
  const commandItems = [...document.querySelectorAll("[data-command-item]")];
  const commandEmpty = document.getElementById("command-empty");
  let commandIndex = 0;
  let commandReturnFocus = null;
  const visibleCommandItems = () => commandItems.filter((item) => !item.hidden);
  const selectCommand = (index) => {
    const visible = visibleCommandItems();
    if (!visible.length) return;
    commandIndex = (index + visible.length) % visible.length;
    commandItems.forEach((item) => item.classList.remove("command-selected"));
    visible[commandIndex].classList.add("command-selected");
    visible[commandIndex].scrollIntoView({ block: "nearest" });
  };
  const filterCommands = () => {
    const term = (commandSearch?.value || "").trim().toLowerCase();
    commandItems.forEach((item) => {
      const haystack =
        `${item.textContent} ${item.dataset.keywords || ""}`.toLowerCase();
      item.hidden = Boolean(term && !haystack.includes(term));
    });
    const visible = visibleCommandItems();
    if (commandEmpty) commandEmpty.hidden = visible.length > 0;
    commandIndex = 0;
    selectCommand(0);
  };
  const openCommand = () => {
    closeDesktopMore();
    if (sheet?.classList.contains("open")) closeSheet();
    commandReturnFocus = document.activeElement;
    if (typeof commandDialog?.showModal === "function")
      commandDialog.showModal();
    else commandDialog?.setAttribute("open", "");
    if (commandSearch) commandSearch.value = "";
    filterCommands();
    window.setTimeout(() => commandSearch?.focus(), reducedMotion ? 0 : 80);
  };
  const closeCommand = () => {
    if (commandDialog?.open && typeof commandDialog.close === "function")
      commandDialog.close();
    else commandDialog?.removeAttribute("open");
    commandReturnFocus?.focus?.();
  };
  document
    .getElementById("command-trigger")
    ?.addEventListener("click", openCommand);
  document
    .getElementById("mobile-command-trigger")
    ?.addEventListener("click", openCommand);
  document
    .querySelectorAll("[data-command-open]")
    .forEach((button) => button.addEventListener("click", openCommand));
  commandSearch?.addEventListener("input", filterCommands);
  commandDialog?.addEventListener("click", (event) => {
    const rect = commandDialog.getBoundingClientRect();
    const outside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;
    if (outside) closeCommand();
  });
  commandDialog?.addEventListener("keydown", (event) => {
    const visible = visibleCommandItems();
    if (event.key === "Escape") {
      event.preventDefault();
      closeCommand();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      selectCommand(commandIndex + 1);
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      selectCommand(commandIndex - 1);
    }
    if (
      event.key === "Enter" &&
      document.activeElement === commandSearch &&
      visible[commandIndex]
    ) {
      event.preventDefault();
      visible[commandIndex].click();
    }
  });
  commandDialog?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeCommand();
  });
  commandItems.forEach((item) =>
    item.addEventListener("click", () => {
      if (!item.hasAttribute("data-ai-open")) closeCommand();
    }),
  );

  const openAI = () => {
    closeDesktopMore();
    if (sheet?.classList.contains("open")) closeSheet();
    if (commandDialog?.open) closeCommand();
    if (window.ShehzadasAI?.open) window.ShehzadasAI.open();
    else document.getElementById("ai-launcher")?.click();
  };
  document.querySelectorAll("[data-ai-open]").forEach((button) =>
    button.addEventListener("click", (event) => {
      event.preventDefault();
      openAI();
    }),
  );

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      commandDialog?.open ? closeCommand() : openCommand();
      return;
    }
    if (event.key === "Escape") {
      if (sheet?.classList.contains("open")) closeSheet();
      else if (moreMenu?.classList.contains("open")) closeDesktopMore();
    }
  });

  const desktopLinks = [
    ...document.querySelectorAll(
      '.desktop-nav > a, .nav-more-menu a[href^="#"]',
    ),
  ];
  const mobileItems = [...document.querySelectorAll(".mobile-sheet-links a")];
  const observedSections = [...document.querySelectorAll("main section[id]")];
  const updateActiveNavigation = (id) => {
    desktopLinks.forEach((link) =>
      link.classList.toggle("active", link.getAttribute("href") === `#${id}`),
    );
    mobileItems.forEach((item) =>
      item.classList.toggle("active", item.getAttribute("href") === `#${id}`),
    );
  };
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const active = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (active) updateActiveNavigation(active.target.id);
      },
      { threshold: [0.12, 0.28, 0.48], rootMargin: "-18% 0px -62% 0px" },
    );
    observedSections.forEach((section) => observer.observe(section));
  }
  updateActiveNavigation(location.hash.replace("#", "") || "home");

  window.NavigationUX = {
    openCommand,
    closeCommand,
    openSheet,
    closeSheet,
    openAI,
    runSelfTest: () => ({
      passed: Boolean(
        document.querySelector(".desktop-nav") &&
        document.querySelector(".mobile-actions") &&
        commandDialog &&
        document.querySelector(".keyboard-board"),
      ),
      desktopLinks: desktopLinks.length,
      mobileItems: mobileItems.length,
      commandItems: commandItems.length,
      keyboardKeys: document.querySelectorAll(".skill-key").length,
    }),
  };
})();
/* Editorial Redesign Observers */
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

/* Desktop hover logic for projects */
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
        // Small delay for fade-in effect
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
      // adjust transform so it is centered on the right of cursor
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

/* Scrolled Header */
const header = document.querySelector(".site-header");
window.addEventListener(
  "scroll",
  () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  },
  { passive: true },
);

/* Mobile Menu */
const mobileMenuToggle = document.getElementById("mobile-menu-trigger");
const mobileMenuClose = document.getElementById("mobile-menu-close");
const mobileMenu = document.getElementById("mobile-menu");

if (mobileMenuToggle && mobileMenuClose && mobileMenu) {
  mobileMenuToggle.addEventListener("click", () => {
    mobileMenu.classList.add("open");
    document.body.classList.add("menu-open");
  });
  mobileMenuClose.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    document.body.classList.remove("menu-open");
  });
  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      document.body.classList.remove("menu-open");
    });
  });
}
