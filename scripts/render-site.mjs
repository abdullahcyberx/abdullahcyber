import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const contentDir = path.join(rootDir, 'content');
const srcTemplate = path.join(rootDir, 'src', 'index.template.html');
const outHtml = path.join(rootDir, 'index.html');

function escapeHtml(unsafe) {
  if (typeof unsafe !== 'string') return unsafe;
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeJson(unsafe) {
  if (typeof unsafe !== 'string') return unsafe;
  return unsafe
    .replace(/</g, '\\u003C')
    .replace(/>/g, '\\u003E')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

const loadJson = (file) => JSON.parse(fs.readFileSync(path.join(contentDir, file), 'utf8'));

try {
  let html = fs.readFileSync(srcTemplate, 'utf8');

  const profile = loadJson('profile.json');
  const experience = loadJson('experience.json').sort((a,b) => a.displayOrder - b.displayOrder);
  const projects = loadJson('projects.json').sort((a,b) => a.displayOrder - b.displayOrder);
  const skills = loadJson('skills.json').sort((a,b) => a.displayOrder - b.displayOrder);
  const certificates = loadJson('certificates.json').sort((a,b) => a.displayOrder - b.displayOrder);
  const achievements = loadJson('achievements.json').sort((a,b) => a.displayOrder - b.displayOrder);
  const education = loadJson('education.json');
  const seo = loadJson('seo.json');
  const ai = loadJson('ai.json');

  // Basic replacements
  html = html.replaceAll('{{ profile.location }}', escapeHtml(profile.location));
  html = html.replaceAll('{{ profile.availabilityStatus }}', escapeHtml(profile.availabilityStatus));
  html = html.replaceAll('{{ profile.heroHeading }}', escapeHtml(profile.heroHeading));
  html = html.replaceAll('{{ profile.heroAccent }}', escapeHtml(profile.heroAccent));
  html = html.replaceAll('{{ profile.professionalTitle }}', escapeHtml(profile.professionalTitle));
  html = html.replaceAll('{{ profile.heroIntroduction }}', escapeHtml(profile.heroIntroduction));
  html = html.replaceAll('{{ profile.mainCtaLabels.explore }}', escapeHtml(profile.mainCtaLabels.explore));
  html = html.replaceAll(/\{\{ profile.email \}\}/g, escapeHtml(profile.email));
  html = html.replaceAll('{{ profile.mainCtaLabels.contact }}', escapeHtml(profile.mainCtaLabels.contact));
  html = html.replaceAll('{{ profile.githubUrl }}', escapeHtml(profile.githubUrl));
  html = html.replaceAll('{{ profile.linkedinUrl }}', escapeHtml(profile.linkedinUrl));
  html = html.replaceAll(/\{\{ profile.cvPath \}\}/g, escapeHtml(profile.cvPath));
  
  const aboutHtml = Array.isArray(profile.aboutText) 
    ? profile.aboutText.map((p, i) => `<p${i === 0 ? ' class="lead"' : ''}>${escapeHtml(p)}</p>`).join('')
    : `<p>${escapeHtml(profile.aboutText)}</p>`;
  html = html.replaceAll('{{ profile.aboutText }}', aboutHtml);
  
  html = html.replaceAll('{{ profile.ethicalDisclaimer }}', escapeHtml(profile.ethicalDisclaimer || ''));

  // SEO replacements
  html = html.replaceAll('{{ seo.title }}', escapeHtml(seo.title));
  html = html.replaceAll('{{ seo.description }}', escapeHtml(seo.description));
  html = html.replaceAll('{{ seo.keywords }}', escapeHtml(seo.keywords));
  html = html.replaceAll('{{ seo.openGraph.title }}', escapeHtml(seo.openGraph.title));
  html = html.replaceAll('{{ seo.openGraph.description }}', escapeHtml(seo.openGraph.description));
  html = html.replaceAll('{{ seo.twitter.title }}', escapeHtml(seo.twitter.title));
  html = html.replaceAll('{{ seo.twitter.description }}', escapeHtml(seo.twitter.description));

  // EXPERIENCE
  const expHtml = experience.map(exp => `
    <article class="timeline-row fade-in-up reveal">
      <div class="timeline-year">${escapeHtml(exp.startDate)} — ${escapeHtml(exp.endDate)}</div>
      <div class="timeline-content">
        <h3 class="timeline-role">${escapeHtml(exp.role)}</h3>
        <div class="timeline-company">${escapeHtml(exp.company)}</div>
        <p>${escapeHtml(exp.description)}</p>
        ${exp.responsibilities && exp.responsibilities.length ? `<ul>${exp.responsibilities.map(r => `<li>${escapeHtml(r)}</li>`).join('')}</ul>` : ''}
      </div>
    </article>
  `).join('');
  html = html.replaceAll('<!-- TEMPLATE: EXPERIENCE -->', expHtml);

  // SKILLS
  const skillHtml = skills.map((s, idx) => {
    let classes = ['skill-key'];
    if (s.name === 'Web Testing' || s.name === 'Vulnerability Assess' || s.name === 'Networking') classes.push('wide');
    if (s.name === 'Security Mindset') { classes.push('space-key'); classes.push('active'); }
    return `<button class="${classes.join(' ')}" data-skill="${escapeHtml(s.skillKey || s.name.toLowerCase().replace(/ /g, '-'))}" role="listitem"><span>${escapeHtml(s.icon)}</span><small>${escapeHtml(s.keyboardPosition)}</small></button>`;
  });
  
  // Create rows for keyboard
  const row1 = skillHtml.slice(0,5).join('');
  const row2 = skillHtml.slice(5,10).join('');
  const row3 = skillHtml.slice(10,15).join('');
  const row4 = skillHtml.slice(15).join('');
  
  const fullKeyboard = `
    <div class="key-row key-row-one">${row1}</div>
    <div class="key-row key-row-two">${row2}</div>
    <div class="key-row key-row-three">${row3}</div>
    <div class="key-row key-row-four">${row4}</div>
  `;
  html = html.replaceAll('<!-- TEMPLATE: SKILLS -->', fullKeyboard);

  // PROJECTS
  const projHtml = projects.map((p, idx) => `
    <li class="project-row fade-in-up reveal" data-image="${escapeHtml(p.image)}">
      <div class="project-number">0${idx+1}</div>
      <div class="project-content">
        <h3 class="project-title">${escapeHtml(p.title)}</h3>
        <div class="project-tools">${p.tools.map(t => escapeHtml(t)).join(' · ')}</div>
        <p class="project-desc">${escapeHtml(p.summary)}</p>
        ${p.repositoryUrl ? `<a class="project-link" href="${escapeHtml(p.repositoryUrl)}" target="_blank" rel="noreferrer">Visit Repository <span>↗</span></a>` : `<button class="project-link" type="button" data-modal="${escapeHtml(p.slug)}">View case study <span>↗</span></button>`}
      </div>
    </li>
  `).join('');
  html = html.replaceAll('<!-- TEMPLATE: PROJECTS -->', projHtml);

  // CERTIFICATES
  const featuredCerts = certificates.filter(c => c.featured);
  const supportCerts = certificates.filter(c => !c.featured);

  const featCertHtml = featuredCerts.map(c => `
    <div class="cert-card fade-in-up reveal">
      <h3 class="cert-title">${escapeHtml(c.title)}</h3>
      <div class="cert-meta">
        <span>${escapeHtml(c.issuer)}</span>
        <span>${escapeHtml(c.issueDate)}</span>
      </div>
      <a class="project-link" href="${escapeHtml(c.certificateFile)}" target="_blank" rel="noreferrer" aria-label="Open ${escapeHtml(c.title)}">View credential <span>↗</span></a>
    </div>
  `).join('');
  html = html.replaceAll('<!-- TEMPLATE: FEATURED_CERTIFICATES -->', featCertHtml);

  const suppCertHtml = supportCerts.map(c => `
    <li class="supp-cert-row">
      <span class="supp-cert-title"><a href="${escapeHtml(c.certificateFile)}" target="_blank" rel="noreferrer">${escapeHtml(c.title)}</a></span>
      <span class="supp-cert-issuer">${escapeHtml(c.issuer)}</span>
      <span class="supp-cert-date">${escapeHtml(c.issueDate)}</span>
    </li>
  `).join('');
  html = html.replaceAll('<!-- TEMPLATE: SUPPORTING_CERTIFICATES -->', `<ul>${suppCertHtml}</ul>`);

  // ACHIEVEMENTS
  const achHtml = `<ul>
    ${achievements.map((a, i) => `<li>
      <strong>${escapeHtml(a.title)}</strong> — ${escapeHtml(a.organization)}
      <p>${escapeHtml(a.description)}</p>
    </li>`).join('')}
  </ul>`;
  html = html.replaceAll('<!-- TEMPLATE: ACHIEVEMENTS -->', achHtml);

  // EDUCATION
  const edu = education[0];
  const safeDegree = escapeHtml(edu.degree).replace(' of ', ' of<br><span>');
  const eduHtml = `
    <div class="education-block">
      <h3>${escapeHtml(edu.degree)}</h3>
      <p class="edu-inst">${escapeHtml(edu.institution)}</p>
      <p class="edu-date">Expected completion: ${escapeHtml(edu.expectedCompletion)}</p>
      <p class="edu-desc">${escapeHtml(edu.description)}</p>
    </div>
  `;
  html = html.replaceAll('<!-- TEMPLATE: EDUCATION -->', eduHtml);

  // SCHEMA.ORG
  const schemaObj = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${seo.canonicalUrl}#website`,
        "url": seo.canonicalUrl,
        "name": seo.title,
        "inLanguage": "en-PK"
      },
      {
        "@type": "ProfilePage",
        "@id": `${seo.canonicalUrl}#profilepage`,
        "url": seo.canonicalUrl,
        "name": seo.title,
        "isPartOf": { "@id": `${seo.canonicalUrl}#website` },
        "mainEntity": { "@id": `${seo.canonicalUrl}#person` }
      },
      {
        "@type": "Person",
        "@id": `${seo.canonicalUrl}#person`,
        "name": profile.fullName,
        "url": seo.canonicalUrl,
        "email": `mailto:${profile.email}`,
        "jobTitle": profile.professionalTitle,
        "description": seo.description,
        "sameAs": [
          profile.githubUrl,
          profile.linkedinUrl
        ]
      }
    ]
  };
  
  const safeSchema = escapeJson(JSON.stringify(schemaObj));
  const schemaOrg = `\n  <script type="application/ld+json">\n  ${safeSchema}\n  </script>`;
  html = html.replaceAll('<!-- TEMPLATE: SCHEMA_ORG -->', schemaOrg);

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
      education
    }
  };
  const safeAiPayload = escapeJson(JSON.stringify(aiPayload));
  html = html.replaceAll('<!-- TEMPLATE: AI_PAYLOAD -->', safeAiPayload);

  const unresolvedTokens = html.match(/\{\{\s*[^}]+\s*\}\}/g);
  if (unresolvedTokens?.length) {
    throw new Error(
      `Unresolved template tokens: ${[
        ...new Set(unresolvedTokens)
      ].join(", ")}`
    );
  }

  fs.writeFileSync(outHtml, html);
  console.log('Site rendered successfully to root index.html.');

} catch (e) {
  console.error('Rendering failed:', e.message);
  process.exit(1);
}
