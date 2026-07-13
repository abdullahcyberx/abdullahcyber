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
     Interactive Skills Keyboard
     ------------------------- */
  const skillKeys = document.querySelectorAll(".skill-key");
  skillKeys.forEach((key) => {
    key.addEventListener("pointerenter", () => {
      skillKeys.forEach((k) => k.classList.remove("active"));
      key.classList.add("active");
    });
    key.addEventListener("focus", () => {
      skillKeys.forEach((k) => k.classList.remove("active"));
      key.classList.add("active");
    });
  });

  /* -------------------------
     Case-study Modal
     ------------------------- */
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

  const modalRoot = document.getElementById("modal-root");
  if (modalRoot) {
    modalRoot.innerHTML = `
      <dialog id="case-modal" class="modal-dialog">
        <div class="modal-content">
          <button class="modal-close" aria-label="Close modal">✕</button>
          <div id="modal-label" class="modal-label"></div>
          <h2 id="modal-title"></h2>
          <p id="modal-summary"></p>
          <h3>Objective</h3><p id="modal-objective"></p>
          <h3>Environment</h3><p id="modal-environment"></p>
          <h3>Learning</h3><p id="modal-learning"></p>
          <h3>Ethics</h3><p id="modal-ethics"></p>
        </div>
      </dialog>
    `;
  }

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

  /* -------------------------
     Shehzada's AI
     ------------------------- */
  const aiDataScript = document.getElementById("ai-data");
  let aiConfig = null;
  if (aiDataScript) {
    try {
      aiConfig = JSON.parse(aiDataScript.textContent);
    } catch (e) {}
  }

  const aiPanel = document.getElementById("ai-assistant");
  const aiInput = document.getElementById("ai-input");
  const aiForm = document.getElementById("ai-form");
  const aiMessages = document.getElementById("ai-messages");
  const aiSuggestions = document.getElementById("ai-suggestions");

  const openAi = () => {
    if (!aiPanel) return;
    aiPanel.setAttribute("aria-hidden", "false");
    aiPanel.classList.add("open");
    if (aiInput) aiInput.focus();

    if (aiMessages && aiMessages.children.length === 0 && aiConfig) {
      appendMessage(
        "ai",
        aiConfig.greeting || "Hello. I am Shehzada's AI. How can I help you?",
      );
      if (aiConfig.suggestedQueries) {
        aiSuggestions.innerHTML = aiConfig.suggestedQueries
          .map((q) => `<button type="button" class="ai-chip">${q}</button>`)
          .join("");
        aiSuggestions.querySelectorAll(".ai-chip").forEach((chip) => {
          chip.addEventListener("click", () => {
            if (aiInput) aiInput.value = chip.textContent;
            if (aiForm) aiForm.dispatchEvent(new Event("submit"));
          });
        });
      }
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

  const appendMessage = (role, text) => {
    if (!aiMessages) return;
    const msg = document.createElement("div");
    msg.className = `ai-message ai-${role}`;
    msg.textContent = text;
    aiMessages.appendChild(msg);
    aiMessages.scrollTop = aiMessages.scrollHeight;
  };

  if (aiForm) {
    aiForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = aiInput.value.trim();
      if (!val) return;
      appendMessage("user", val);
      aiInput.value = "";

      const response = getAiResponse(val);
      setTimeout(() => appendMessage("ai", response), 400);
    });
  }

  const getAiResponse = (query) => {
    if (!aiConfig || !aiConfig.knowledgeBase)
      return "I'm currently unable to answer that.";
    const q = query.toLowerCase();
    for (const kb of aiConfig.knowledgeBase) {
      if (kb.keywords.some((kw) => q.includes(kw.toLowerCase()))) {
        return kb.response;
      }
    }
    return (
      aiConfig.fallbackResponse ||
      "I don't have specific information on that. Would you like to know about his latest projects?"
    );
  };
})();
