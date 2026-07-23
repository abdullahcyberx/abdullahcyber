import re
import os

with open('scripts/render-site.mjs', 'r', encoding='utf-8') as f:
    content = f.read()

# Get the original render-site content until the first `html = html.replaceAll` block
# No, let's just do it directly.

# I will write the final `scripts/render-site.mjs` entirely from python so we don't have dupes.
# Since my previous `page_generation` string had duplicated sections, let's write it carefully.

script = """import fs from "fs";
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
    .replace(/</g, "\\\\u003C")
    .replace(/>/g, "\\\\u003E")
    .replace(/&/g, "\\\\u0026")
    .replace(/\\u2028/g, "\\\\u2028")
    .replace(/\\u2029/g, "\\\\u2029");
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
  const year = value.match(/\\b(20\\d{2})\\b/);
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
htmlTemplate = htmlTemplate.replace(/href="assets\\//g, 'href="/assets/');
htmlTemplate = htmlTemplate.replace(/src="assets\\//g, 'src="/assets/');

const mainMatch = htmlTemplate.match(/<main id="main">([\\s\\S]*?)<\\/main>/);
const homeMainContent = mainMatch ? mainMatch[1] : '';

let layoutTemplate = htmlTemplate.replace(/<main id="main">[\\s\\S]*?<\\/main>/, '<main id="main">\\n<!-- TEMPLATE: MAIN_CONTENT -->\\n</main>');
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
  html = html.replaceAll(/\\{\\{ profile.email \\}\\}/g, escapeHtml(profile.email));
  html = html.replaceAll("{{ profile.mainCtaLabels.contact }}", escapeHtml(profile.mainCtaLabels.contact));
  html = html.replaceAll("{{ profile.githubUrl }}", escapeHtml(profile.githubUrl));
  html = html.replaceAll("{{ profile.linkedinUrl }}", escapeHtml(profile.linkedinUrl));
  html = html.replaceAll("{{ profile.tryhackmeUrl }}", escapeHtml(profile.tryhackmeUrl));
  html = html.replaceAll("{{ profile.personalProfileUrl }}", escapeHtml(profile.personalProfileUrl));
  html = html.replaceAll(/\\{\\{ profile.cvPath \\}\\}/g, escapeHtml(profile.cvPath));

  const safeSchema = escapeJson(JSON.stringify(schemaObj));
  const schemaOrg = `\\n  <script type="application/ld+json">\\n  ${safeSchema}\\n  </script>`;
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
"""

home_logic = re.search(r'// Basic replacements(.*?)// SCHEMA.ORG', content, re.DOTALL).group(1)
home_logic = home_logic.replace('html = html.replaceAll', 'homeMainContentProcessed = homeMainContentProcessed.replaceAll')

script += """
let homeMainContentProcessed = homeMainContent;
"""
script += home_logic.replace('homeMainContent = homeMainContent', 'homeMainContentProcessed = homeMainContentProcessed')

script += """
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
      "name": profile.fullName,
      "alternateName": profile.displayName,
      "url": "https://abdullahcyber.dev/",
      "email": `mailto:${profile.email}`,
      "jobTitle": profile.professionalTitle,
      "description": seo.description,
      "sameAs": [profile.githubUrl, profile.linkedinUrl]
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
      "name": profile.fullName,
      "alternateName": profile.displayName,
      "url": "https://abdullahcyber.dev/",
      "jobTitle": profile.professionalTitle
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
  <h1 class="section-header">About Muhammad Abdullah</h1>
  <div class="about-grid" style="margin-top: 40px;">
    <div class="about-info" style="line-height:1.6">
      <p><strong>Name:</strong> ${escapeHtml(profile.fullName)}</p>
      <p><strong>Public portfolio identity:</strong> ${escapeHtml(profile.displayName)}</p>
      <p><strong>Primary role:</strong> ${escapeHtml(profile.professionalTitle)}</p>
      <p><strong>Location:</strong> ${escapeHtml(profile.location)}</p>
      <p><strong>Education:</strong> ${escapeHtml(education[0].degree)}</p>
      <p><strong>University:</strong> ${escapeHtml(education[0].institution)}</p>
      <p><strong>CGPA:</strong> ${escapeHtml(education[0].cgpa)}</p>
      <p><strong>Expected graduation:</strong> ${escapeHtml(education[0].expectedCompletion)}</p>
      <p><strong>Focus areas:</strong> Vulnerability assessment, web security, security monitoring, network analysis and penetration testing</p>
      <p><strong>Primary technical areas:</strong> Python scripting, Linux, Windows, Docker, VirtualBox, Burp Suite, Nmap, Gobuster and Wireshark</p>
    </div>
    <div class="about-copy" style="line-height:1.6">
      ${Array.isArray(profile.aboutText) ? profile.aboutText.map(p => `<p>${escapeHtml(p)}</p>`).join('') : `<p>${escapeHtml(profile.aboutText)}</p>`}
    </div>
  </div>
  <div style="margin-top: 40px;"><a href="/" class="btn btn-primary">Return to Homepage</a></div>
</section>
`;
writePage('/about/', 'About Muhammad Abdullah | Abdullah Cyber', 'Detailed profile of Muhammad Abdullah, a Junior Cybersecurity Analyst based in Pakistan specializing in vulnerability assessment and web security.', 'https://abdullahcyber.dev/about/', 'profile', aboutSchemaObj, aboutContent);

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
        "@type": p.repositoryUrl ? "SoftwareSourceCode" : "CreativeWork",
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
html404 = html404.replace('<head>', '<head>\\n    <meta name="robots" content="noindex, follow" />');
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
${publicUrls.map(url => `  <url>\\n    <loc>${url}</loc>\\n  </url>`).join('\\n')}
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

Muhammad Abdullah is a Junior Cybersecurity Analyst based in Pakistan, pursuing a BS in Cyber Security at Riphah International University.

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
${projects.map(p => `- ${p.title}: https://abdullahcyber.dev/projects/${p.slug}/`).join('\\n')}
`;
fs.writeFileSync(path.join(rootDir, 'public', 'llms.txt'), llmsContent);

console.log("All pages, sitemap, robots, and llms.txt generated successfully.");
"""

with open('scripts/render-site.mjs', 'w', encoding='utf-8') as f:
    f.write(script)

print("Updated render-site.mjs cleanly")
