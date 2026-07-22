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
  return values.flat(Infinity).filter((value) => typeof value === "string").join(" ").toLowerCase();
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

const loadJson = (file) => JSON.parse(fs.readFileSync(path.join(contentDir, file), "utf8"));

const profile = loadJson("profile.json");
const experience = loadJson("experience.json").sort((a, b) => a.displayOrder - b.displayOrder);
const projects = loadJson("projects.json").sort((a, b) => a.displayOrder - b.displayOrder);
const skills = loadJson("skills.json").sort((a, b) => a.displayOrder - b.displayOrder);
const certificates = loadJson("certificates.json").sort((a, b) => a.displayOrder - b.displayOrder);
const achievements = loadJson("achievements.json").sort((a, b) => a.displayOrder - b.displayOrder);
const education = loadJson("education.json");
const seo = loadJson("seo.json");
const ai = loadJson("ai.json");

let htmlTemplate = fs.readFileSync(srcTemplate, "utf8");

// Fix relative paths in template to absolute paths
htmlTemplate = htmlTemplate.replace(/href="assets\//g, 'href="/assets/');
htmlTemplate = htmlTemplate.replace(/src="assets\//g, 'src="/assets/');

const mainMatch = htmlTemplate.match(/<main id="main">([\s\S]*?)<\/main>/);
const homeMainContent = mainMatch ? mainMatch[1] : '';

let layoutTemplate = htmlTemplate.replace(/<main id="main">[\s\S]*?<\/main>/, '<main id="main">\n<!-- TEMPLATE: MAIN_CONTENT -->\n</main>');
layoutTemplate = layoutTemplate.replace('<link rel="canonical" href="https://abdullahcyber.dev/" />', '<link rel="canonical" href="{{ canonicalUrl }}" />');
layoutTemplate = layoutTemplate.replace('<meta property="og:url" content="https://abdullahcyber.dev/" />', '<meta property="og:url" content="{{ canonicalUrl }}" />');
layoutTemplate = layoutTemplate.replace('<meta property="og:type" content="profile" />', '<meta property="og:type" content="{{ ogType }}" />');
layoutTemplate = layoutTemplate.replace('<title>{{ seo.title }}</title>', '<title>{{ pageTitle }}</title>');
layoutTemplate = layoutTemplate.replace('content="{{ seo.description }}"', 'content="{{ pageDescription }}"');
layoutTemplate = layoutTemplate.replace('content="{{ seo.openGraph.title }}"', 'content="{{ pageTitle }}"');
layoutTemplate = layoutTemplate.replace('content="{{ seo.openGraph.description }}"', 'content="{{ pageDescription }}"');
layoutTemplate = layoutTemplate.replace('content="{{ seo.twitter.title }}"', 'content="{{ pageTitle }}"');
layoutTemplate = layoutTemplate.replace('content="{{ seo.twitter.description }}"', 'content="{{ pageDescription }}"');

function prepareLayout(layoutStr, pageTitle, pageDescription, canonicalUrl, ogType, schemaObj) {
  let html = layoutStr;
  
  html = html.replaceAll("{{ pageTitle }}", escapeHtml(pageTitle));
  html = html.replaceAll("{{ pageDescription }}", escapeHtml(pageDescription));
  html = html.replaceAll("{{ seo.keywords }}", escapeHtml(seo.keywords));
  html = html.replaceAll("{{ canonicalUrl }}", escapeHtml(canonicalUrl));
  html = html.replaceAll("{{ ogType }}", escapeHtml(ogType));

  html = html.replaceAll("{{ profile.location }}", escapeHtml(profile.location));
  html = html.replaceAll("{{ profile.availabilityStatus }}", escapeHtml(profile.availabilityStatus));
  html = html.replaceAll("{{ profile.heroHeading }}", escapeHtml(profile.heroHeading));
  html = html.replaceAll("{{ profile.heroAccent }}", escapeHtml(profile.heroAccent));
  html = html.replaceAll("{{ profile.professionalTitle }}", escapeHtml(profile.professionalTitle));
  html = html.replaceAll("{{ profile.heroIntroduction }}", escapeHtml(profile.heroIntroduction));
  html = html.replaceAll("{{ profile.mainCtaLabels.explore }}", escapeHtml(profile.mainCtaLabels.explore));
  html = html.replaceAll(/\{\{ profile.email \}\}/g, escapeHtml(profile.email));
  html = html.replaceAll("{{ profile.mainCtaLabels.contact }}", escapeHtml(profile.mainCtaLabels.contact));
  html = html.replaceAll("{{ profile.githubUrl }}", escapeHtml(profile.githubUrl));
  html = html.replaceAll("{{ profile.linkedinUrl }}", escapeHtml(profile.linkedinUrl));
  html = html.replaceAll("{{ profile.tryhackmeUrl }}", escapeHtml(profile.tryhackmeUrl));
  html = html.replaceAll("{{ profile.youtubeUrl }}", escapeHtml(profile.youtubeUrl));
  html = html.replaceAll(/\{\{ profile.cvPath \}\}/g, escapeHtml(profile.cvPath));

  const safeSchema = escapeJson(JSON.stringify(schemaObj));
  const schemaOrg = `\n  <script type="application/ld+json">\n  ${safeSchema}\n  </script>`;
  html = html.replace("<!-- TEMPLATE: SCHEMA_ORG -->", schemaOrg);

  const aiPayload = {
    config: ai,
    knowledge: { profile, experience, projects, skills, certificates, achievements, education },
  };
  html = html.replaceAll("<!-- TEMPLATE: AI_PAYLOAD -->", escapeJson(JSON.stringify(aiPayload)));

  return html;
}

function writePage(routePath, pageTitle, pageDescription, canonicalUrl, ogType, schemaObj, mainContent) {
  const isHome = routePath === '/';
  let html = prepareLayout(layoutTemplate, pageTitle, pageDescription, canonicalUrl, ogType, schemaObj);
  html = html.replace('<!-- TEMPLATE: MAIN_CONTENT -->', mainContent);
  
  const outDir = routePath === '/' ? rootDir : path.join(rootDir, routePath.slice(1));
  if (!fs.existsSync(outDir) && routePath !== '/404.html') {
    fs.mkdirSync(outDir, { recursive: true });
  }
  
  const outFile = routePath === '/404.html' ? path.join(rootDir, '404.html') : path.join(outDir, 'index.html');
  fs.writeFileSync(outFile, html);
  console.log(`Generated ${routePath}`);
}

let homeMainContentProcessed = homeMainContent;

  homeMainContentProcessed = homeMainContentProcessed.replaceAll(
    "{{ profile.location }}",
    escapeHtml(profile.location),
  );
  homeMainContentProcessed = homeMainContentProcessed.replaceAll(
    "{{ profile.availabilityStatus }}",
    escapeHtml(profile.availabilityStatus),
  );
  homeMainContentProcessed = homeMainContentProcessed.replaceAll(
    "{{ profile.heroHeading }}",
    escapeHtml(profile.heroHeading),
  );
  homeMainContentProcessed = homeMainContentProcessed.replaceAll(
    "{{ profile.heroAccent }}",
    escapeHtml(profile.heroAccent),
  );
  homeMainContentProcessed = homeMainContentProcessed.replaceAll(
    "{{ profile.professionalTitle }}",
    escapeHtml(profile.professionalTitle),
  );
  homeMainContentProcessed = homeMainContentProcessed.replaceAll(
    "{{ profile.heroIntroduction }}",
    escapeHtml(profile.heroIntroduction),
  );
  homeMainContentProcessed = homeMainContentProcessed.replaceAll(
    "{{ profile.mainCtaLabels.explore }}",
    escapeHtml(profile.mainCtaLabels.explore),
  );
  homeMainContentProcessed = homeMainContentProcessed.replaceAll(/\{\{ profile.email \}\}/g, escapeHtml(profile.email));
  homeMainContentProcessed = homeMainContentProcessed.replaceAll(
    "{{ profile.mainCtaLabels.contact }}",
    escapeHtml(profile.mainCtaLabels.contact),
  );
  homeMainContentProcessed = homeMainContentProcessed.replaceAll(
    "{{ profile.githubUrl }}",
    escapeHtml(profile.githubUrl),
  );
  homeMainContentProcessed = homeMainContentProcessed.replaceAll(
    "{{ profile.linkedinUrl }}",
    escapeHtml(profile.linkedinUrl),
  );
  homeMainContentProcessed = homeMainContentProcessed.replaceAll(
    "{{ profile.tryhackmeUrl }}",
    escapeHtml(profile.tryhackmeUrl),
  );
  homeMainContentProcessed = homeMainContentProcessed.replaceAll(
    "{{ profile.youtubeUrl }}",
    escapeHtml(profile.youtubeUrl),
  );
  homeMainContentProcessed = homeMainContentProcessed.replaceAll(
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
  homeMainContentProcessed = homeMainContentProcessed.replaceAll("{{ profile.aboutText }}", aboutHtml);

  homeMainContentProcessed = homeMainContentProcessed.replaceAll(
    "{{ profile.ethicalDisclaimer }}",
    escapeHtml(profile.ethicalDisclaimer || ""),
  );

  // SEO replacements
  homeMainContentProcessed = homeMainContentProcessed.replaceAll("{{ seo.title }}", escapeHtml(seo.title));
  homeMainContentProcessed = homeMainContentProcessed.replaceAll("{{ seo.description }}", escapeHtml(seo.description));
  homeMainContentProcessed = homeMainContentProcessed.replaceAll("{{ seo.keywords }}", escapeHtml(seo.keywords));
  homeMainContentProcessed = homeMainContentProcessed.replaceAll(
    "{{ seo.openGraph.title }}",
    escapeHtml(seo.openGraph.title),
  );
  homeMainContentProcessed = homeMainContentProcessed.replaceAll(
    "{{ seo.openGraph.description }}",
    escapeHtml(seo.openGraph.description),
  );
  homeMainContentProcessed = homeMainContentProcessed.replaceAll(
    "{{ seo.twitter.title }}",
    escapeHtml(seo.twitter.title),
  );
  homeMainContentProcessed = homeMainContentProcessed.replaceAll(
    "{{ seo.twitter.description }}",
    escapeHtml(seo.twitter.description),
  );

  // Stats
  const internshipCount = experience.filter(
    (exp) => exp.workType === "Internship",
  ).length;
  homeMainContentProcessed = homeMainContentProcessed.replaceAll("{{ projectsCount }}", projects.length.toString());
  homeMainContentProcessed = homeMainContentProcessed.replaceAll("{{ skillsCount }}", skills.length.toString());
  homeMainContentProcessed = homeMainContentProcessed.replaceAll(
    "{{ certificatesCount }}",
    certificates.length.toString(),
  );
  homeMainContentProcessed = homeMainContentProcessed.replaceAll("{{ internshipsCount }}", internshipCount.toString());

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
  homeMainContentProcessed = homeMainContentProcessed.replaceAll("<!-- TEMPLATE: EXPERIENCE -->", expHtml);

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
  homeMainContentProcessed = homeMainContentProcessed.replaceAll("<!-- TEMPLATE: SKILLS -->", fullKeyboard);

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
        <img src="assets/branding/abdullah-cyber-symbol-transparent.png" alt="" width="40" height="40" style="width: auto; height: 100%; max-height: 40px;" />
      </div>
      ${skillMapNodes}
    </div>
    <div class="skill-map-details" aria-live="polite">
      ${skillMapPanels}
    </div>
  </div>`;
  homeMainContentProcessed = homeMainContentProcessed.replaceAll("<!-- TEMPLATE: SKILL_MAP -->", skillMapHtml);

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
  homeMainContentProcessed = homeMainContentProcessed.replaceAll("<!-- TEMPLATE: PROJECTS -->", projHtml);

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
  homeMainContentProcessed = homeMainContentProcessed.replaceAll(
    "<!-- TEMPLATE: FEATURED_CERTIFICATES -->",
    featCertHtml,
  );

  const suppCertHtml = supportCerts.map((c, i) => renderCertCard(c, false, i)).join("");
  homeMainContentProcessed = homeMainContentProcessed.replaceAll(
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
  homeMainContentProcessed = homeMainContentProcessed.replaceAll("<!-- TEMPLATE: ACHIEVEMENTS -->", achHtml);

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
  homeMainContentProcessed = homeMainContentProcessed.replaceAll("<!-- TEMPLATE: JOURNEY -->", journeyHtml);

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
  homeMainContentProcessed = homeMainContentProcessed.replaceAll("<!-- TEMPLATE: EDUCATION -->", eduHtml);

  
// Generate Homepage
const homeSchemaObj = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://abdullahcyber.dev/#website",
      "url": "https://abdullahcyber.dev/",
      "name": seo.title,
      "inLanguage": "en-PK"
    },
    {
      "@type": "ProfilePage",
      "@id": "https://abdullahcyber.dev/#profilepage",
      "url": "https://abdullahcyber.dev/",
      "name": seo.title,
      "isPartOf": { "@id": "https://abdullahcyber.dev/#website" },
      "mainEntity": { "@id": "https://abdullahcyber.dev/#person" }
    },
    {
      "@type": "Person",
      "@id": "https://abdullahcyber.dev/#person",
      "name": "Hafiz Muhammad Abdullah",
      "alternateName": [
        "Muhammad Abdullah",
        "Abdullah Cyber",
        "abdullahcyberx"
      ],
      "identifier": "abdullahcyberx",
      "url": "https://abdullahcyber.dev/",
      "jobTitle": "Junior Cybersecurity Analyst",
      "sameAs": [
        "https://www.linkedin.com/in/abdullahcyberx/",
        "https://www.youtube.com/@abdullahcyberx",
        "https://github.com/abdullahcyberx"
      ],
      "email": `mailto:${profile.email}`,
      "description": seo.description
    }
  ]
};

writePage('/', 'Muhammad Abdullah | Junior Cybersecurity Analyst', seo.description, 'https://abdullahcyber.dev/', 'profile', homeSchemaObj, homeMainContentProcessed);

// About
const aboutSchemaObj = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfilePage",
      "@id": "https://abdullahcyber.dev/about/#profilepage",
      "url": "https://abdullahcyber.dev/about/",
      "name": "About Muhammad Abdullah | Abdullah Cyber",
      "mainEntity": { "@id": "https://abdullahcyber.dev/#person" }
    },
    {
      "@type": "Person",
      "@id": "https://abdullahcyber.dev/#person",
      "name": "Hafiz Muhammad Abdullah",
      "alternateName": [
        "Muhammad Abdullah",
        "Abdullah Cyber",
        "abdullahcyberx"
      ],
      "identifier": "abdullahcyberx",
      "url": "https://abdullahcyber.dev/",
      "jobTitle": "Junior Cybersecurity Analyst",
      "sameAs": [
        "https://www.linkedin.com/in/abdullahcyberx/",
        "https://www.youtube.com/@abdullahcyberx",
        "https://github.com/abdullahcyberx"
      ]
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://abdullahcyber.dev/" },
        { "@type": "ListItem", "position": 2, "name": "About", "item": "https://abdullahcyber.dev/about/" }
      ]
    }
  ]
};
const aboutContent = `
<section class="container" style="padding-top: 120px; padding-bottom: 80px;">
  <h1 class="section-header">About Hafiz Muhammad Abdullah</h1>
  <div class="about-grid" style="margin-top: 40px;">
    <div class="about-info" style="line-height:1.6">
      <p><strong>Full name:</strong> Hafiz Muhammad Abdullah</p>
      <p><strong>Professional name:</strong> ${escapeHtml(profile.fullName)}</p>
      <p><strong>Known online as:</strong> ${escapeHtml(profile.displayName)}</p>
      <p><strong>Handle:</strong> abdullahcyberx</p>
      <p><strong>Role:</strong> ${escapeHtml(profile.professionalTitle)}</p>
      <p><strong>Education:</strong> ${escapeHtml(education[0].degree)} at ${escapeHtml(education[0].institution)}</p>
      <p><strong>Location:</strong> ${escapeHtml(profile.location)}</p>
      <p><strong>Website:</strong> abdullahcyber.dev</p>
    </div>
    <div class="about-copy" style="line-height:1.6">
      ${Array.isArray(profile.aboutText) ? profile.aboutText.map(p => `<p>${escapeHtml(p)}</p>`).join('') : `<p>${escapeHtml(profile.aboutText)}</p>`}
    </div>
  </div>
  <div style="margin-top: 40px;"><a href="/" class="btn btn-primary">Return to Homepage</a></div>
</section>
`;
writePage('/about/', 'Hafiz Muhammad Abdullah | Abdullah Cyber', 'Hafiz Muhammad Abdullah, professionally known as Muhammad Abdullah and Abdullah Cyber, is a Junior Cybersecurity Analyst and BS Cyber Security student at Riphah International University in Pakistan.', 'https://abdullahcyber.dev/about/', 'profile', aboutSchemaObj, aboutContent);

// Education
const eduSchemaObj = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": "https://abdullahcyber.dev/education/#webpage",
      "url": "https://abdullahcyber.dev/education/",
      "name": "BS Cyber Security at Riphah International University | Muhammad Abdullah",
      "about": { "@id": "https://abdullahcyber.dev/#person" }
    },
    {
      "@type": "CollegeOrUniversity",
      "@id": "https://abdullahcyber.dev/education/#university",
      "name": education[0].institution,
      "url": "https://www.riphah.edu.pk"
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://abdullahcyber.dev/" },
        { "@type": "ListItem", "position": 2, "name": "Education", "item": "https://abdullahcyber.dev/education/" }
      ]
    }
  ]
};
const eduContent = `
<section class="container" style="padding-top: 120px; padding-bottom: 80px;">
  <h1 class="section-header">Education</h1>
  <div class="education-block" style="margin-top: 40px; padding: 24px; border: 1px solid var(--border-color); border-radius: 8px;">
    <h2 style="font-size: 1.5rem; margin-bottom: 8px;">${escapeHtml(education[0].degree)}</h2>
    <p class="edu-inst" style="color: var(--accent); margin-bottom: 16px;">${escapeHtml(education[0].institution)}</p>
    <p><strong>CGPA:</strong> ${escapeHtml(education[0].cgpa)}</p>
    <p class="edu-date" style="margin-bottom: 16px;">Expected completion: ${escapeHtml(education[0].expectedCompletion)}</p>
    <p class="edu-desc">${escapeHtml(education[0].description)}</p>
    <div style="margin-top: 24px; padding: 16px; border: 1px solid var(--border-color); border-radius: 8px; background: rgba(255,255,255,0.02);">
      <p style="margin: 0; font-size: 0.9rem; color: var(--text-secondary);">This is Muhammad Abdullah’s personal portfolio and is not an official website of Riphah International University.</p>
    </div>
  </div>
  <div style="margin-top: 40px;"><a href="/" class="btn btn-primary">Return to Homepage</a></div>
</section>
`;
writePage('/education/', 'BS Cyber Security at Riphah International University | Muhammad Abdullah', 'Education details of Muhammad Abdullah pursuing a BS Cyber Security at Riphah International University.', 'https://abdullahcyber.dev/education/', 'website', eduSchemaObj, eduContent);

// Projects Index
const projectsSchemaObj = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://abdullahcyber.dev/projects/#webpage",
      "url": "https://abdullahcyber.dev/projects/",
      "name": "Cybersecurity Projects | Muhammad Abdullah"
    },
    {
      "@type": "ItemList",
      "itemListElement": projects.map((p, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "url": `https://abdullahcyber.dev/projects/${p.slug}/`
      }))
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://abdullahcyber.dev/" },
        { "@type": "ListItem", "position": 2, "name": "Projects", "item": "https://abdullahcyber.dev/projects/" }
      ]
    }
  ]
};
const projIndexHtml = projects.map(p => `
  <li class="journey-item premium-surface fade-in-up reveal" style="margin-bottom: 24px; padding: 24px; border-radius: 12px;">
    <article>
      <div class="journey-item-topline">
        <span class="journey-kind">${escapeHtml(p.category)}</span>
      </div>
      <h2 style="margin-top: 8px; font-size:1.5rem;"><a href="/projects/${escapeHtml(p.slug)}/" style="text-decoration:none; color:inherit;">${escapeHtml(p.title)}</a></h2>
      <p style="margin-top: 12px; color: var(--text-secondary); line-height: 1.6;">${escapeHtml(p.summary)}</p>
      <div class="project-tools" style="margin-top: 16px;">${p.tools.map(t => escapeHtml(t)).join(' · ')}</div>
      <div style="margin-top: 24px;">
        <a class="btn btn-outline" href="/projects/${escapeHtml(p.slug)}/">View Project Details</a>
      </div>
    </article>
  </li>
`).join('');
const projectsContent = `
<section class="container" style="padding-top: 120px; padding-bottom: 80px;">
  <h1 class="section-header">Cybersecurity Projects</h1>
  <p class="feature-section-intro" style="margin-top: 24px;">Practical cybersecurity, penetration testing, and analysis projects.</p>
  <ul style="list-style:none; padding:0; margin-top: 40px;">
    ${projIndexHtml}
  </ul>
  <div style="margin-top: 40px;"><a href="/" class="btn btn-primary">Return to Homepage</a></div>
</section>
`;
writePage('/projects/', 'Cybersecurity Projects | Muhammad Abdullah', 'Portfolio of practical cybersecurity projects by Muhammad Abdullah, including reconnaissance tools, honeypots, and vulnerability assessments.', 'https://abdullahcyber.dev/projects/', 'website', projectsSchemaObj, projectsContent);

// Single Projects
projects.forEach(p => {
  const pSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": (p.repositoryUrl && p.slug !== 'ctf-practice') ? "SoftwareSourceCode" : "CreativeWork",
        "@id": `https://abdullahcyber.dev/projects/${p.slug}/#project`,
        "url": `https://abdullahcyber.dev/projects/${p.slug}/`,
        "name": p.title,
        "description": p.summary,
        "author": { "@id": "https://abdullahcyber.dev/#person" },
        "keywords": p.tools.join(", ")
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://abdullahcyber.dev/" },
          { "@type": "ListItem", "position": 2, "name": "Projects", "item": "https://abdullahcyber.dev/projects/" },
          { "@type": "ListItem", "position": 3, "name": p.title, "item": `https://abdullahcyber.dev/projects/${p.slug}/` }
        ]
      }
    ]
  };
  if (p.repositoryUrl) pSchema["@graph"][0].codeRepository = p.repositoryUrl;
  if (p.date) pSchema["@graph"][0].dateCreated = p.date;

  const featuresHtml = p.features && p.features.length ? `<h3 style="margin-top:24px;">Key Features</h3><ul style="line-height:1.6;">${p.features.map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul>` : '';
  
  const singleProjContent = `
  <section class="container" style="padding-top: 120px; padding-bottom: 80px;">
    <div style="margin-bottom: 24px;"><a href="/projects/" style="color: var(--text-secondary); text-decoration: none;">← Back to Projects</a></div>
    <h1 class="section-header">${escapeHtml(p.title)}</h1>
    <div class="project-detail-content" style="margin-top: 40px;">
      <div class="journey-item-topline" style="margin-bottom: 24px;"><span class="journey-kind">${escapeHtml(p.category)}</span></div>
      ${p.date ? `<p><strong>Date:</strong> ${escapeHtml(p.date)}</p>` : ''}
      <p><strong>Tools and Technologies:</strong> ${p.tools.map(t => escapeHtml(t)).join(', ')}</p>
      
      <div style="margin-top: 40px; line-height: 1.7; color: var(--text-primary);">
        <h2>Project Overview</h2>
        <p>${escapeHtml(p.fullDescription || p.summary)}</p>
        
        ${featuresHtml}
        
        ${p.ethicalDisclaimer ? `<div style="margin-top: 32px; padding: 24px; border-left: 4px solid var(--accent); background: rgba(255,255,255,0.02);"><strong>Scope & Ethics:</strong> ${escapeHtml(p.ethicalDisclaimer)}</div>` : ''}
      </div>
      
      <div style="margin-top: 48px; display: flex; gap: 16px; flex-wrap: wrap;">
        ${p.repositoryUrl ? `<a class="btn btn-primary" href="${escapeHtml(p.repositoryUrl)}" target="_blank" rel="noopener noreferrer">View Source Repository</a>` : ''}
      </div>
    </div>
  </section>
  `;
  writePage(`/projects/${p.slug}/`, `${p.title} | Muhammad Abdullah Cybersecurity Project`, `Details about ${p.title}, a cybersecurity project by Muhammad Abdullah.`, `https://abdullahcyber.dev/projects/${p.slug}/`, 'article', pSchema, singleProjContent);
});

// Experience
const expSchemaObj = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://abdullahcyber.dev/experience/#webpage",
      "url": "https://abdullahcyber.dev/experience/",
      "name": "Cybersecurity Experience and Internships | Muhammad Abdullah"
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://abdullahcyber.dev/" },
        { "@type": "ListItem", "position": 2, "name": "Experience", "item": "https://abdullahcyber.dev/experience/" }
      ]
    }
  ]
};
const expContentHtml = experience.map(exp => `
  <article class="timeline-row premium-surface" style="margin-bottom: 32px; padding: 24px; border-radius: 12px;">
    <div class="timeline-year" style="margin-bottom: 12px; font-weight: bold;">${escapeHtml(exp.startDate)} — ${escapeHtml(exp.endDate)}</div>
    <div class="timeline-content" style="margin-left: 0;">
      <h2 class="timeline-role" style="font-size: 1.5rem;">${escapeHtml(exp.role)}</h2>
      <div class="timeline-company" style="font-size: 1.1rem; color: var(--accent); margin-bottom: 16px;">${escapeHtml(exp.company)}</div>
      <p style="margin-bottom: 16px; line-height: 1.6;">${escapeHtml(exp.description)}</p>
      ${exp.responsibilities && exp.responsibilities.length ? `<ul style="line-height: 1.6; margin-bottom: 16px;">${exp.responsibilities.map(r => `<li>${escapeHtml(r)}</li>`).join('')}</ul>` : ''}
      ${exp.certificateFile ? `<div style="margin-top: 16px;"><a href="${escapeHtml(exp.certificateFile.replace('assets/', '/assets/'))}" class="btn btn-outline" target="_blank">${escapeHtml(exp.certificateLabel || 'View Internship Certificate')}</a></div>` : ''}
    </div>
  </article>
`).join('');
const expPageContent = `
<section class="container" style="padding-top: 120px; padding-bottom: 80px;">
  <h1 class="section-header">Cybersecurity Experience</h1>
  <div style="margin-top: 40px;">
    ${expContentHtml}
  </div>
  <div style="margin-top: 40px;"><a href="/" class="btn btn-primary">Return to Homepage</a></div>
</section>
`;
writePage('/experience/', 'Cybersecurity Experience and Internships | Muhammad Abdullah', 'Internships and practical cybersecurity experience of Muhammad Abdullah.', 'https://abdullahcyber.dev/experience/', 'website', expSchemaObj, expPageContent);

// Certifications
const certSchemaObj = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://abdullahcyber.dev/certifications/#webpage",
      "url": "https://abdullahcyber.dev/certifications/",
      "name": "Cybersecurity Certifications | Muhammad Abdullah"
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://abdullahcyber.dev/" },
        { "@type": "ListItem", "position": 2, "name": "Certifications", "item": "https://abdullahcyber.dev/certifications/" }
      ]
    }
  ]
};
const certContentHtml = certificates.map(c => {
  const fallbackId = c.credentialId ? ` · ID: ${escapeHtml(c.credentialId)}` : '';
  return `
  <div class="cert-card premium-surface" style="margin-bottom: 32px; display: flex; flex-direction: column; padding: 24px; border-radius: 12px; gap: 24px;">
    <div style="flex: 1;">
      <h2 class="cert-title" style="font-size: 1.4rem;">${escapeHtml(c.title)}</h2>
      <div class="cert-meta" style="margin-top: 12px; font-size: 1rem; color: var(--text-secondary);">
        <p><strong>Issuer:</strong> ${escapeHtml(c.issuer)}</p>
        <p><strong>Date:</strong> ${escapeHtml(c.issueDate)}${fallbackId}</p>
        ${c.skills ? `<p><strong>Skills:</strong> ${c.skills.map(s => escapeHtml(s)).join(', ')}</p>` : ''}
      </div>
      <div style="margin-top: 24px;">
        <a href="${escapeHtml(c.certificateFile).replace('assets/', '/assets/')}" class="btn btn-outline" target="_blank">View Full Certificate</a>
      </div>
    </div>
  </div>
  `;
}).join('');
const certPageContent = `
<section class="container" style="padding-top: 120px; padding-bottom: 80px;">
  <h1 class="section-header">Cybersecurity Certifications</h1>
  <div style="margin-top: 40px;">
    ${certContentHtml}
  </div>
  <div style="margin-top: 40px;"><a href="/" class="btn btn-primary">Return to Homepage</a></div>
</section>
`;
writePage('/certifications/', 'Cybersecurity Certifications | Muhammad Abdullah', 'Verified cybersecurity certifications held by Muhammad Abdullah.', 'https://abdullahcyber.dev/certifications/', 'website', certSchemaObj, certPageContent);

// Achievements
const achSchemaObj = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://abdullahcyber.dev/achievements/#webpage",
      "url": "https://abdullahcyber.dev/achievements/",
      "name": "Cybersecurity and CTF Achievements | Muhammad Abdullah"
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://abdullahcyber.dev/" },
        { "@type": "ListItem", "position": 2, "name": "Achievements", "item": "https://abdullahcyber.dev/achievements/" }
      ]
    }
  ]
};
const achContentHtml = achievements.map(a => `
  <li class="premium-surface" style="margin-bottom: 24px; padding: 24px; border-radius: 12px;">
    <h2 style="font-size: 1.3rem;">${escapeHtml(a.title)}</h2>
    <p style="color: var(--accent); margin-top: 8px;">${escapeHtml(a.organization)}</p>
    <p style="margin-top: 16px; line-height: 1.6;">${escapeHtml(a.description)}</p>
    ${a.certificateFile ? `<div style="margin-top: 16px;"><a href="${escapeHtml(a.certificateFile).replace('assets/', '/assets/')}" class="btn btn-outline" target="_blank">${escapeHtml(a.certificateLabel || 'View Certificate')}</a></div>` : ''}
  </li>
`).join('');
const achPageContent = `
<section class="container" style="padding-top: 120px; padding-bottom: 80px;">
  <h1 class="section-header">Cybersecurity Achievements</h1>
  <ul style="list-style: none; padding: 0; margin-top: 40px;">
    ${achContentHtml}
  </ul>
  <div style="margin-top: 40px;"><a href="/" class="btn btn-primary">Return to Homepage</a></div>
</section>
`;
writePage('/achievements/', 'Cybersecurity and CTF Achievements | Muhammad Abdullah', 'CTF achievements and cybersecurity recognitions for Muhammad Abdullah.', 'https://abdullahcyber.dev/achievements/', 'website', achSchemaObj, achPageContent);

// 404
const page404Content = `
<section class="container" style="padding-top: 150px; text-align: center; min-height: 70vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
  <h1 style="font-size: 4rem; margin-bottom: 16px; color: var(--accent);">404</h1>
  <h2 class="section-header">Page Not Found</h2>
  <p style="margin-top: 24px; font-size: 1.2rem; color: var(--text-secondary); max-width: 500px;">
    The requested portfolio page does not exist or has been moved.
  </p>
  <div style="margin-top: 40px; display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
    <a href="/" class="btn btn-primary">Homepage</a>
    <a href="/projects/" class="btn btn-outline">Projects</a>
    <a href="/about/" class="btn btn-outline">About</a>
  </div>
</section>
`;
writePage('/404.html', 'Page Not Found | Muhammad Abdullah', 'Page not found on Abdullah Cyber portfolio.', 'https://abdullahcyber.dev/404.html', 'website', {}, page404Content);

const file404 = path.join(rootDir, '404.html');
let html404 = fs.readFileSync(file404, 'utf8');
html404 = html404.replace('<head>', '<head>\n    <meta name="robots" content="noindex, follow" />');
fs.writeFileSync(file404, html404);

// XML Sitemap
const publicUrls = [
  'https://abdullahcyber.dev/',
  'https://abdullahcyber.dev/about/',
  'https://abdullahcyber.dev/education/',
  'https://abdullahcyber.dev/projects/',
  ...projects.map(p => `https://abdullahcyber.dev/projects/${p.slug}/`),
  'https://abdullahcyber.dev/experience/',
  'https://abdullahcyber.dev/certifications/',
  'https://abdullahcyber.dev/achievements/'
];

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicUrls.map(url => `  <url>\n    <loc>${url}</loc>\n  </url>`).join('\n')}
</urlset>`;
fs.writeFileSync(path.join(rootDir, 'public', 'sitemap.xml'), sitemapContent);

// Robots
const robotsContent = `User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: *
Allow: /

Sitemap: https://abdullahcyber.dev/sitemap.xml
`;
fs.writeFileSync(path.join(rootDir, 'public', 'robots.txt'), robotsContent);

// LLMs
const llmsContent = `# Abdullah Cyber Portfolio

Muhammad Abdullah, also known as Hafiz Muhammad Abdullah and Abdullah Cyber, is a Junior Cybersecurity Analyst and BS Cyber Security student at Riphah International University in Pakistan.

## Official Profiles

- Website: https://abdullahcyber.dev/
- LinkedIn: https://www.linkedin.com/in/abdullahcyberx/
- YouTube: https://www.youtube.com/@abdullahcyberx
- GitHub: https://github.com/abdullahcyberx

## Core Expertise
Vulnerability assessment, web security, security monitoring, network analysis, and penetration testing.

## Canonical Pages
- Home: https://abdullahcyber.dev/
- About: https://abdullahcyber.dev/about/
- Education: https://abdullahcyber.dev/education/
- Projects: https://abdullahcyber.dev/projects/
- Experience: https://abdullahcyber.dev/experience/
- Certifications: https://abdullahcyber.dev/certifications/
- Achievements: https://abdullahcyber.dev/achievements/

### Projects
${projects.map(p => `- ${p.title}: https://abdullahcyber.dev/projects/${p.slug}/`).join('\n')}
`;
fs.writeFileSync(path.join(rootDir, 'public', 'llms.txt'), llmsContent);

console.log("All pages, sitemap, robots, and llms.txt generated successfully.");
