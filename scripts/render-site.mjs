import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const contentDir = path.join(rootDir, "content");
const srcTemplate = path.join(rootDir, "src", "index.template.html");
const outHtml = path.join(rootDir, "index.html");

function escapeHtml(unsafe) {
  if (typeof unsafe !== "string") return unsafe;
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeJson(unsafe) {
  if (typeof unsafe !== "string") return unsafe;
  return unsafe
    .replace(/</g, "\\u003C")
    .replace(/>/g, "\\u003E")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function searchableText(...values) {
  return values
    .flat(Infinity)
    .filter((value) => typeof value === "string")
    .join(" ")
    .toLowerCase();
}

function hasSearchMatch(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function parsePortfolioDate(value) {
  if (!value || typeof value !== "string") return null;

  const parsed = Date.parse(value);
  if (Number.isFinite(parsed)) return parsed;

  const year = value.match(/\b(20\d{2})\b/);
  return year ? Date.UTC(Number(year[1]), 0, 1) : null;
}

function compactText(value, limit = 170) {
  if (!value || value.length <= limit) return value || "";
  return `${value.slice(0, limit - 1).trimEnd()}…`;
}

const loadJson = (file) =>
  JSON.parse(fs.readFileSync(path.join(contentDir, file), "utf8"));

try {
  let html = fs.readFileSync(srcTemplate, "utf8");

  const profile = loadJson("profile.json");
  const experience = loadJson("experience.json").sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
  const projects = loadJson("projects.json").sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
  const skills = loadJson("skills.json").sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
  const certificates = loadJson("certificates.json").sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
  const achievements = loadJson("achievements.json").sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
  const education = loadJson("education.json");
  const seo = loadJson("seo.json");
  const ai = loadJson("ai.json");

  // Basic replacements
  html = html.replaceAll(
    "{{ profile.location }}",
    escapeHtml(profile.location),
  );
  html = html.replaceAll(
    "{{ profile.availabilityStatus }}",
    escapeHtml(profile.availabilityStatus),
  );
  html = html.replaceAll(
    "{{ profile.heroHeading }}",
    escapeHtml(profile.heroHeading),
  );
  html = html.replaceAll(
    "{{ profile.heroAccent }}",
    escapeHtml(profile.heroAccent),
  );
  html = html.replaceAll(
    "{{ profile.professionalTitle }}",
    escapeHtml(profile.professionalTitle),
  );
  html = html.replaceAll(
    "{{ profile.heroIntroduction }}",
    escapeHtml(profile.heroIntroduction),
  );
  html = html.replaceAll(
    "{{ profile.mainCtaLabels.explore }}",
    escapeHtml(profile.mainCtaLabels.explore),
  );
  html = html.replaceAll(/\{\{ profile.email \}\}/g, escapeHtml(profile.email));
  html = html.replaceAll(
    "{{ profile.mainCtaLabels.contact }}",
    escapeHtml(profile.mainCtaLabels.contact),
  );
  html = html.replaceAll(
    "{{ profile.githubUrl }}",
    escapeHtml(profile.githubUrl),
  );
  html = html.replaceAll(
    "{{ profile.linkedinUrl }}",
    escapeHtml(profile.linkedinUrl),
  );
  html = html.replaceAll(
    "{{ profile.tryhackmeUrl }}",
    escapeHtml(profile.tryhackmeUrl),
  );
  html = html.replaceAll(
    "{{ profile.personalProfileUrl }}",
    escapeHtml(profile.personalProfileUrl),
  );
  html = html.replaceAll(
    /\{\{ profile.cvPath \}\}/g,
    escapeHtml(profile.cvPath),
  );

  const aboutHtml = Array.isArray(profile.aboutText)
    ? profile.aboutText
        .map(
          (p, i) => `<p${i === 0 ? ' class="lead"' : ""}>${escapeHtml(p)}</p>`,
        )
        .join("")
    : `<p>${escapeHtml(profile.aboutText)}</p>`;
  html = html.replaceAll("{{ profile.aboutText }}", aboutHtml);

  html = html.replaceAll(
    "{{ profile.ethicalDisclaimer }}",
    escapeHtml(profile.ethicalDisclaimer || ""),
  );

  // SEO replacements
  html = html.replaceAll("{{ seo.title }}", escapeHtml(seo.title));
  html = html.replaceAll("{{ seo.description }}", escapeHtml(seo.description));
  html = html.replaceAll("{{ seo.keywords }}", escapeHtml(seo.keywords));
  html = html.replaceAll(
    "{{ seo.openGraph.title }}",
    escapeHtml(seo.openGraph.title),
  );
  html = html.replaceAll(
    "{{ seo.openGraph.description }}",
    escapeHtml(seo.openGraph.description),
  );
  html = html.replaceAll(
    "{{ seo.twitter.title }}",
    escapeHtml(seo.twitter.title),
  );
  html = html.replaceAll(
    "{{ seo.twitter.description }}",
    escapeHtml(seo.twitter.description),
  );

  // Stats
  const internshipCount = experience.filter(
    (exp) => exp.workType === "Internship",
  ).length;
  html = html.replaceAll("{{ projectsCount }}", projects.length.toString());
  html = html.replaceAll("{{ skillsCount }}", skills.length.toString());
  html = html.replaceAll(
    "{{ certificatesCount }}",
    certificates.length.toString(),
  );
  html = html.replaceAll("{{ internshipsCount }}", internshipCount.toString());

  // EXPERIENCE
  const expHtml = experience
    .map(
      (exp) => `
    <article class="timeline-row fade-in-up reveal">
      <div class="timeline-year">${escapeHtml(exp.startDate)} — ${escapeHtml(exp.endDate)}</div>
      <div class="timeline-content">
        <h3 class="timeline-role">${escapeHtml(exp.role)}</h3>
        <div class="timeline-company">${escapeHtml(exp.company)}</div>
        <p>${escapeHtml(exp.description)}</p>
        ${exp.responsibilities && exp.responsibilities.length ? `<ul>${exp.responsibilities.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul>` : ""}
        ${exp.certificateFile ? `<div style="margin-top: 12px;"><button class="btn btn-outline" data-pdf-full="${escapeHtml(exp.certificateFile)}" data-cert-title="${escapeHtml(exp.role)}" data-cert-issuer="${escapeHtml(exp.company)}">${escapeHtml(exp.certificateLabel || 'View Internship Certificate')}</button></div>` : ""}
      </div>
    </article>
  `,
    )
    .join("");
  html = html.replaceAll("<!-- TEMPLATE: EXPERIENCE -->", expHtml);

  // SKILLS
  const skillHtml = skills.map((s, idx) => {
    let classes = ["skill-key"];
    if (
      s.name === "Web Testing" ||
      s.name === "Vulnerability Assess" ||
      s.name === "Networking"
    )
      classes.push("wide");
    if (s.name === "Security Mindset") {
      classes.push("space-key");
      classes.push("active");
    }
    return `<button class="${classes.join(" ")}" data-skill="${escapeHtml(s.skillKey || s.name.toLowerCase().replace(/ /g, "-"))}" role="listitem"><span>${escapeHtml(s.icon)}</span><small>${escapeHtml(s.keyboardPosition)}</small></button>`;
  });

  // Create rows for keyboard
  const row1 = skillHtml.slice(0, 5).join("");
  const row2 = skillHtml.slice(5, 10).join("");
  const row3 = skillHtml.slice(10, 15).join("");
  const row4 = skillHtml.slice(15).join("");

  const fullKeyboard = `
    <div class="key-row key-row-one">${row1}</div>
    <div class="key-row key-row-two">${row2}</div>
    <div class="key-row key-row-three">${row3}</div>
    <div class="key-row key-row-four">${row4}</div>
  `;
  html = html.replaceAll("<!-- TEMPLATE: SKILLS -->", fullKeyboard);

  // INTERACTIVE SKILL MAP
  // Domain relationships are derived from the existing portfolio records so
  // projects, internships and credentials remain the single source of truth.
  const skillDomains = [
    {
      id: "web",
      mark: "WEB",
      label: "Web Security",
      description: "Application testing, trust boundaries and vulnerability validation.",
      skillKeys: ["burp", "web", "vulnerability", "sqli", "xss"],
      keywords: ["web", "burp", "vulnerability", "penetration", "sqli", "sql injection", "xss", "phishing"],
    },
    {
      id: "recon",
      mark: "RE",
      label: "Recon",
      description: "Structured discovery across public data, hosts, services and technologies.",
      skillKeys: ["nmap", "gobuster", "osint"],
      keywords: ["recon", "whois", "dns", "osint", "nmap", "enumeration", "subdomain", "scanning", "penetration"],
    },
    {
      id: "linux",
      mark: "LX",
      label: "Linux",
      description: "Practical system operation, administration and security lab deployment.",
      skillKeys: ["linux", "honeypot"],
      keywords: ["linux", "ssh", "honeypot", "sshesame", "virtualbox", "malware"],
    },
    {
      id: "networking",
      mark: "NET",
      label: "Networking",
      description: "Protocols, traffic analysis, exposure discovery and defensive controls.",
      skillKeys: ["nmap", "wireshark", "networking", "firewall", "ids"],
      keywords: ["network", "wireshark", "firewall", "ids", "tcp", "socket", "port", "dns", "ssh", "iot"],
    },
    {
      id: "docker",
      mark: "DK",
      label: "Docker",
      description: "Portable, isolated environments for repeatable security tooling and labs.",
      skillKeys: ["docker"],
      keywords: ["docker", "container", "containerization"],
    },
    {
      id: "ctf",
      mark: "CTF",
      label: "CTFs",
      description: "Challenge solving, event organization and practical security problem-solving.",
      skillKeys: ["ctf", "mindset", "osint"],
      keywords: ["ctf", "capture the flag", "challenge", "tryhackme", "advent of cyber"],
    },
  ];

  const skillEvidenceSources = [
    ...projects.map((project) => ({
      id: project.id,
      type: "Project",
      title: project.title,
      meta: project.category || "Practical project",
      href: "#projects",
      priority: 0,
      text: searchableText(project.title, project.category, project.summary, project.fullDescription, project.tools),
    })),
    ...experience.map((item) => ({
      id: item.id,
      type: "Experience",
      title: `${item.role} · ${item.company}`,
      meta: `${item.startDate} — ${item.endDate}`,
      href: "#experience",
      priority: 1,
      text: searchableText(item.role, item.company, item.description, item.responsibilities),
    })),
    ...certificates.map((certificate) => ({
      id: certificate.id,
      type: "Certificate",
      title: certificate.title,
      meta: certificate.issuer,
      href: "#credentials",
      priority: 2,
      text: searchableText(certificate.title, certificate.issuer, certificate.description, certificate.skills),
    })),
  ];

  const skillMapNodes = skillDomains
    .map((domain, index) => {
      const evidenceCount = skillEvidenceSources.filter((item) =>
        hasSearchMatch(item.text, domain.keywords),
      ).length;
      const active = index === 0;

      return `<button class="skill-map-node${active ? " is-active" : ""}" id="skill-map-node-${domain.id}" type="button" data-skill-domain="${domain.id}" aria-pressed="${active}" aria-controls="skill-domain-${domain.id}">
        <span class="skill-map-node-mark" aria-hidden="true">${escapeHtml(domain.mark)}</span>
        <strong>${escapeHtml(domain.label)}</strong>
        <small>${evidenceCount} evidence ${evidenceCount === 1 ? "link" : "links"}</small>
      </button>`;
    })
    .join("");

  const skillMapPanels = skillDomains
    .map((domain, index) => {
      const relatedSkills = skills.filter((skill) =>
        domain.skillKeys.includes(skill.skillKey),
      );
      const relatedEvidence = skillEvidenceSources
        .filter((item) => hasSearchMatch(item.text, domain.keywords))
        .sort((a, b) => a.priority - b.priority)
        .slice(0, 5);

      return `<section class="skill-domain-panel" id="skill-domain-${domain.id}" aria-labelledby="skill-map-node-${domain.id}"${index === 0 ? "" : " hidden"}>
        <p class="skill-domain-label">Selected domain</p>
        <h3>${escapeHtml(domain.label)}</h3>
        <p class="skill-domain-description">${escapeHtml(domain.description)}</p>
        <div class="skill-domain-tags" aria-label="Related skills">
          ${relatedSkills.map((skill) => `<span>${escapeHtml(skill.name)}</span>`).join("")}
        </div>
        <ul class="skill-evidence-list">
          ${relatedEvidence.map((item) => `<li>
            <a href="${item.href}" data-skill-evidence="${escapeHtml(item.id)}">
              <span class="skill-evidence-type">${escapeHtml(item.type)}</span>
              <strong>${escapeHtml(item.title)}</strong>
              <small>${escapeHtml(item.meta)}</small>
              <span class="skill-evidence-arrow" aria-hidden="true">↗</span>
            </a>
          </li>`).join("")}
        </ul>
      </section>`;
    })
    .join("");

  const skillMapHtml = `<div class="skill-map-shell premium-surface fade-in-up reveal" data-spotlight-surface>
    <div class="skill-map-orbit" aria-label="Interactive cybersecurity skill map">
      <svg class="skill-map-connectors" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <line data-domain-line="web" x1="50" y1="50" x2="15" y2="20"></line>
        <line data-domain-line="recon" x1="50" y1="50" x2="50" y2="8"></line>
        <line data-domain-line="linux" x1="50" y1="50" x2="85" y2="20"></line>
        <line data-domain-line="networking" x1="50" y1="50" x2="15" y2="80"></line>
        <line data-domain-line="docker" x1="50" y1="50" x2="50" y2="92"></line>
        <line data-domain-line="ctf" x1="50" y1="50" x2="85" y2="80"></line>
      </svg>
      <div class="skill-map-core" aria-hidden="true">
        <span>MA.</span>
        <small>Practical security</small>
      </div>
      ${skillMapNodes}
    </div>
    <div class="skill-map-details" aria-live="polite">
      ${skillMapPanels}
    </div>
  </div>`;
  html = html.replaceAll("<!-- TEMPLATE: SKILL_MAP -->", skillMapHtml);

  // PROJECTS
  const projHtml = projects
    .map((p, idx) => {
      let visualHtml = "";
      let layoutClass = "";

      if (p.image === "recon-art") {
        layoutClass = "project-split";
        visualHtml = `
        <div class="project-visual proj-visual-recon">
          <div class="pv2-logs" style="margin-bottom: 12px; max-width: 100%;">
            <div class="pv2-log" style="border-left-color: #61afef;">$ python recon.py example.com --all</div>
            <div class="pv2-log" style="border-left-color: #98c379;">[✓] WHOIS information collected</div>
            <div class="pv2-log" style="border-left-color: #98c379;">[✓] DNS records enumerated</div>
            <div class="pv2-log" style="border-left-color: #98c379;">[✓] Subdomains discovered</div>
            <div class="pv2-log" style="border-left-color: #98c379;">[✓] Open ports identified</div>
            <div class="pv2-log" style="border-left-color: #98c379;">[✓] Technology signals detected</div>
            <div class="pv2-log" style="border-left-color: #98c379;">[✓] HTML report generated</div>
          </div>
          <div class="pv2-labels" style="flex-wrap: wrap; justify-content: flex-start; gap: 8px; display: flex;">
            <span class="pv2-label">WHOIS</span>
            <span class="pv2-label">DNS</span>
            <span class="pv2-label">SUBDOMAINS</span>
            <span class="pv2-label">PORTS</span>
            <span class="pv2-label">BANNERS</span>
            <span class="pv2-label">TECH</span>
            <span class="pv2-label">REPORT</span>
          </div>
        </div>
      `;
      } else if (p.image === "phishing-art") {
        layoutClass = "project-split";
        visualHtml = `
        <div class="project-visual proj-visual-1">
          <div class="pv1-flow">
            <div class="pv1-node">Email Campaign Setup</div>
            <div class="pv1-arrow">↓</div>
            <div class="pv1-node">Simulated Phishing</div>
          </div>
          <div class="pv1-report">
            <div class="pv1-report-header">Awareness Report Panel</div>
            <div class="pv1-report-bar"><div style="width: 45%;"></div></div>
            <div class="pv1-report-bar"><div style="width: 75%;"></div></div>
            <div class="pv1-report-footer">
              <div class="pv1-label">Ethical Academic Scope</div>
            </div>
          </div>
        </div>
      `;
      } else if (p.image === "honeypot-art") {
        layoutClass = "project-split-reverse";
        visualHtml = `
        <div class="project-visual proj-visual-2">
          <div class="pv2-logs">
            <div class="pv2-log"><span class="pv2-time">14:02:01</span> <span class="pv2-ip">192.168.1.***</span> Failed password for root</div>
            <div class="pv2-log"><span class="pv2-time">14:05:33</span> <span class="pv2-ip">10.0.0.***</span> Disconnected</div>
            <div class="pv2-log"><span class="pv2-time">14:12:45</span> <span class="pv2-ip">172.16.***.***</span> Connection closed</div>
          </div>
          <div class="pv2-labels">
            <span class="pv2-label">SSHesame</span>
            <span class="pv2-label">VirtualBox</span>
            <span class="pv2-label">Linux</span>
          </div>
        </div>
      `;
      } else if (p.image === "ctf-art") {
        layoutClass = "project-horizontal";
        visualHtml = `
        <div class="project-visual proj-visual-3">
          <div class="pv3-board">
            <div class="pv3-cat">Web</div>
            <div class="pv3-cat">Crypto</div>
            <div class="pv3-cat">Forensics</div>
            <div class="pv3-cat">OSINT</div>
          </div>
          <div class="pv3-roles">
            <span class="pv3-role">Organizer</span>
            <span class="pv3-role">Player</span>
          </div>
        </div>
      `;
      }

      return `
      <li class="project-row ${layoutClass} fade-in-up reveal" data-image="${escapeHtml(p.image)}" data-spotlight-surface>
        <div class="project-number">0${idx + 1}</div>
        <div class="project-visual-container" data-tilt-surface>
          ${visualHtml.trim()}
        </div>
        <div class="project-content">
          <div class="project-category">${escapeHtml(p.category)}</div>
          <h3 class="project-title">${escapeHtml(p.title)}</h3>
          <p class="project-desc">${escapeHtml(p.summary)}</p>
          <div class="project-tools">${p.tools.map((t) => escapeHtml(t)).join(" · ")}</div>
          ${p.repositoryUrl ? `<a class="project-link" href="${escapeHtml(p.repositoryUrl)}" target="_blank" rel="noopener noreferrer">Visit Repository <span>↗</span></a>` : `<button class="project-link" type="button" data-modal="${escapeHtml(p.slug)}">View case study <span>↗</span></button>`}
        </div>
      </li>
    `.trim();
    })
    .join("\n");
  html = html.replaceAll("<!-- TEMPLATE: PROJECTS -->", projHtml);

  // CERTIFICATES
  const featuredCerts = certificates.filter((c) => c.featured);
  const supportCerts = certificates.filter((c) => !c.featured);

  const renderCertCard = (c, isFeatured, index) => {
    const fallbackId = c.credentialId ? ` · ${escapeHtml(c.credentialId)}` : '';
    
    const webpPath = escapeHtml(c.certificateFile)
      .replace(/\.pdf$/i, '.webp')
      .replace('/assets/certificates/', '/assets/certificate-previews/');
    
    // Featured loads initially, supporting is deferred
    const imageHtml = isFeatured 
      ? `<img class="cert-preview-image" src="${webpPath}" alt="Preview of ${escapeHtml(c.title)}" loading="lazy" decoding="async">`
      : `<img class="cert-preview-image" data-preview-src="${webpPath}" alt="Preview of ${escapeHtml(c.title)}" loading="lazy" decoding="async">`;

    // Data attribute for progressive reveal order on supporting certs
    const revealAttr = isFeatured ? 'data-revealed="true"' : `data-reveal-order="${index}" data-revealed="false"`;
    const classNames = isFeatured ? 'cert-card featured-cert-card fade-in-up reveal' : 'cert-card supp-cert-card';

    return `
    <div class="${classNames}" ${revealAttr} data-pdf-full="${escapeHtml(c.certificateFile)}" data-spotlight-surface tabindex="0" role="button" aria-label="Open ${escapeHtml(c.title)} certificate viewer">
      <div class="cert-preview-viewport" data-tilt-surface>
        ${imageHtml}
        <div class="cert-preview-fallback" aria-hidden="true">
          <span class="cert-fallback-title">${escapeHtml(c.title)}</span>
          <span class="cert-fallback-issuer">${escapeHtml(c.issuer)}</span>
          <span class="cert-fallback-cta">Click to view certificate</span>
        </div>
      </div>
      <div class="cert-card-content">
        <h3 class="cert-title">${escapeHtml(c.title)}</h3>
        <div class="cert-meta">
          <span>${escapeHtml(c.issuer)}</span>
          <span>${escapeHtml(c.issueDate)}${fallbackId}</span>
        </div>
        <div class="cert-action" aria-hidden="true">
          <span class="project-link">View Certificate <span>↗</span></span>
        </div>
      </div>
    </div>
  `;
  };

  const featCertHtml = featuredCerts.map((c, i) => renderCertCard(c, true, i)).join("");
  html = html.replaceAll(
    "<!-- TEMPLATE: FEATURED_CERTIFICATES -->",
    featCertHtml,
  );

  const suppCertHtml = supportCerts.map((c, i) => renderCertCard(c, false, i)).join("");
  html = html.replaceAll(
    "<!-- TEMPLATE: SUPPORTING_CERTIFICATES -->",
    suppCertHtml,
  );

  // ACHIEVEMENTS
  const achHtml = `<ul>
    ${achievements
      .map(
        (a, i) => `<li>
      <strong>${escapeHtml(a.title)}</strong> — ${escapeHtml(a.organization)}
      <p>${escapeHtml(a.description)}</p>
      ${a.certificateFile ? `<div style="margin-top: 8px;"><button class="btn btn-outline" data-pdf-full="${escapeHtml(a.certificateFile)}" data-cert-title="${escapeHtml(a.title)}" data-cert-issuer="${escapeHtml(a.organization)}">${escapeHtml(a.certificateLabel || 'View Achievement Certificate')}</button></div>` : ""}
    </li>`,
      )
      .join("")}
  </ul>`;
  html = html.replaceAll("<!-- TEMPLATE: ACHIEVEMENTS -->", achHtml);

  // UNIFIED JOURNEY
  const isCtfEntry = (...values) =>
    hasSearchMatch(searchableText(...values), [
      "ctf",
      "capture the flag",
      "tryhackme",
      "advent of cyber",
      "challenge",
    ]);

  const journeyEntries = [
    ...experience.map((item) => ({
      id: item.id,
      kind: "experience",
      typeLabel: "Experience",
      title: `${item.role} · ${item.company}`,
      dateLabel: `${item.startDate} — ${item.endDate}`,
      sortDate: parsePortfolioDate(item.endDate) || parsePortfolioDate(item.startDate),
      meta: item.workType,
      description: item.description,
      href: "#experience",
      isCtf: isCtfEntry(item.role, item.description, item.responsibilities),
    })),
    ...projects.map((item) => ({
      id: item.id,
      kind: "project",
      typeLabel: "Project",
      title: item.title,
      dateLabel: item.date || "Date not listed",
      sortDate: parsePortfolioDate(item.date),
      meta: item.category,
      description: item.summary,
      href: "#projects",
      isCtf: isCtfEntry(item.title, item.category, item.summary, item.tools),
    })),
    ...certificates.map((item) => ({
      id: item.id,
      kind: "certificate",
      typeLabel: "Certificate",
      title: item.title,
      dateLabel: item.issueDate,
      sortDate: parsePortfolioDate(item.issueDate),
      meta: item.issuer,
      description: item.description || `Credential issued by ${item.issuer}.`,
      href: "#credentials",
      isCtf: isCtfEntry(item.title, item.issuer, item.description, item.skills),
    })),
    ...achievements.map((item) => ({
      id: item.id,
      kind: "achievement",
      typeLabel: "Achievement",
      title: item.title,
      dateLabel: item.date || "Date not listed",
      sortDate: parsePortfolioDate(item.date),
      meta: item.organization,
      description: item.description,
      href: "#achievements",
      isCtf: isCtfEntry(item.title, item.organization, item.description),
    })),
  ].sort((a, b) => {
    if (a.sortDate === null && b.sortDate === null) return a.title.localeCompare(b.title);
    if (a.sortDate === null) return 1;
    if (b.sortDate === null) return -1;
    return b.sortDate - a.sortDate;
  });

  const journeyFilters = [
    { id: "all", label: "All", count: journeyEntries.length },
    { id: "experience", label: "Experience", count: journeyEntries.filter((entry) => entry.kind === "experience").length },
    { id: "project", label: "Projects", count: journeyEntries.filter((entry) => entry.kind === "project").length },
    { id: "certificate", label: "Certificates", count: journeyEntries.filter((entry) => entry.kind === "certificate").length },
    { id: "ctf", label: "CTFs", count: journeyEntries.filter((entry) => entry.isCtf).length },
  ];

  const journeyHtml = `<div class="journey-controls fade-in-up reveal" role="group" aria-label="Filter Muhammad's journey">
      ${journeyFilters.map((filter, index) => `<button type="button" class="journey-filter${index === 0 ? " is-active" : ""}" data-journey-filter="${filter.id}" aria-pressed="${index === 0}">${filter.label}<span>${filter.count}</span></button>`).join("")}
    </div>
    <p class="visually-hidden" id="journey-status" aria-live="polite"></p>
    <ol class="journey-list" id="journey-list">
      ${journeyEntries.map((entry, index) => {
        const tags = [entry.kind, entry.isCtf ? "ctf" : ""].filter(Boolean).join(" ");
        const datetime = entry.sortDate === null ? "" : new Date(entry.sortDate).toISOString().slice(0, 10);
        return `<li class="journey-item premium-surface fade-in-up reveal" data-journey-tags="${tags}" data-journey-index="${index}" data-spotlight-surface>
          <div class="journey-date">${datetime ? `<time datetime="${datetime}">${escapeHtml(entry.dateLabel)}</time>` : `<span>${escapeHtml(entry.dateLabel)}</span>`}</div>
          <article>
            <div class="journey-item-topline">
              <span class="journey-kind journey-kind-${entry.kind}">${escapeHtml(entry.typeLabel)}</span>${entry.isCtf ? '<span class="journey-ctf-mark">CTF</span>' : ""}
            </div>
            <h3>${escapeHtml(entry.title)}</h3>
            <p class="journey-meta">${escapeHtml(entry.meta || "Portfolio milestone")}</p>
            <p>${escapeHtml(compactText(entry.description))}</p>
            <a href="${entry.href}">View source section <span aria-hidden="true">↗</span></a>
          </article>
        </li>`;
      }).join("")}
    </ol>
    <div class="journey-more-wrap">
      <button class="btn btn-outline journey-more" id="journey-more" type="button" aria-controls="journey-list" aria-expanded="false">Show complete journey</button>
    </div>`;
  html = html.replaceAll("<!-- TEMPLATE: JOURNEY -->", journeyHtml);

  // EDUCATION
  const edu = education[0];
  const safeDegree = escapeHtml(edu.degree).replace(" of ", " of<br><span>");
  const eduHtml = `
    <div class="education-block">
      <h3>${escapeHtml(edu.degree)}</h3>
      <p class="edu-inst">${escapeHtml(edu.institution)}</p>
      <p class="edu-date">Expected completion: ${escapeHtml(edu.expectedCompletion)}</p>
      <p class="edu-desc">${escapeHtml(edu.description)}</p>
    </div>
  `;
  html = html.replaceAll("<!-- TEMPLATE: EDUCATION -->", eduHtml);

  // SCHEMA.ORG
  const schemaObj = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${seo.canonicalUrl}#website`,
        url: seo.canonicalUrl,
        name: seo.title,
        inLanguage: "en-PK",
      },
      {
        "@type": "ProfilePage",
        "@id": `${seo.canonicalUrl}#profilepage`,
        url: seo.canonicalUrl,
        name: seo.title,
        isPartOf: { "@id": `${seo.canonicalUrl}#website` },
        mainEntity: { "@id": `${seo.canonicalUrl}#person` },
      },
      {
        "@type": "Person",
        "@id": `${seo.canonicalUrl}#person`,
        name: profile.fullName,
        url: seo.canonicalUrl,
        email: `mailto:${profile.email}`,
        jobTitle: profile.professionalTitle,
        description: seo.description,
        sameAs: [profile.githubUrl, profile.linkedinUrl],
      },
    ],
  };

  const safeSchema = escapeJson(JSON.stringify(schemaObj));
  const schemaOrg = `\n  <script type="application/ld+json">\n  ${safeSchema}\n  </script>`;
  html = html.replaceAll("<!-- TEMPLATE: SCHEMA_ORG -->", schemaOrg);

  // AI PAYLOAD
  const aiPayload = {
    config: ai,
    knowledge: {
      profile,
      experience,
      projects,
      skills,
      certificates,
      achievements,
      education,
    },
  };
  const safeAiPayload = escapeJson(JSON.stringify(aiPayload));
  html = html.replaceAll("<!-- TEMPLATE: AI_PAYLOAD -->", safeAiPayload);

  const unresolvedTokens = html.match(/\{\{\s*[^}]+\s*\}\}/g);
  if (unresolvedTokens?.length) {
    throw new Error(
      `Unresolved template tokens: ${[...new Set(unresolvedTokens)].join(
        ", ",
      )}`,
    );
  }

  fs.writeFileSync(outHtml, html);
  console.log("Site rendered successfully to root index.html.");
} catch (e) {
  console.error("Rendering failed:", e.message);
  process.exit(1);
}
