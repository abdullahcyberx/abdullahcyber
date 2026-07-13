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
  html = html.replace('{{ profile.location }}', escapeHtml(profile.location));
  html = html.replace('{{ profile.availabilityStatus }}', escapeHtml(profile.availabilityStatus));
  html = html.replaceAll('{{ profile.heroHeading }}', escapeHtml(profile.heroHeading));
  html = html.replaceAll('{{ profile.heroAccent }}', escapeHtml(profile.heroAccent));
  html = html.replace('{{ profile.professionalTitle }}', escapeHtml(profile.professionalTitle));
  html = html.replace('{{ profile.heroIntroduction }}', escapeHtml(profile.heroIntroduction));
  html = html.replace('{{ profile.mainCtaLabels.explore }}', escapeHtml(profile.mainCtaLabels.explore));
  html = html.replace(/\{\{ profile.email \}\}/g, escapeHtml(profile.email));
  html = html.replace('{{ profile.mainCtaLabels.contact }}', escapeHtml(profile.mainCtaLabels.contact));
  html = html.replace('{{ profile.githubUrl }}', escapeHtml(profile.githubUrl));
  html = html.replace('{{ profile.linkedinUrl }}', escapeHtml(profile.linkedinUrl));
  html = html.replace(/\{\{ profile.cvPath \}\}/g, escapeHtml(profile.cvPath));
  
  const aboutHtml = Array.isArray(profile.aboutText) 
    ? profile.aboutText.map((p, i) => `<p${i === 0 ? ' class="lead"' : ''}>${escapeHtml(p)}</p>`).join('')
    : `<p>${escapeHtml(profile.aboutText)}</p>`;
  html = html.replace('{{ profile.aboutText }}', aboutHtml);
  
  html = html.replace('{{ profile.ethicalDisclaimer }}', escapeHtml(profile.ethicalDisclaimer || ''));

  // SEO replacements
  html = html.replace('{{ seo.title }}', escapeHtml(seo.title));
  html = html.replace('{{ seo.description }}', escapeHtml(seo.description));
  html = html.replace('{{ seo.keywords }}', escapeHtml(seo.keywords));
  html = html.replace('{{ seo.openGraph.title }}', escapeHtml(seo.openGraph.title));
  html = html.replace('{{ seo.openGraph.description }}', escapeHtml(seo.openGraph.description));
  html = html.replace('{{ seo.twitter.title }}', escapeHtml(seo.twitter.title));
  html = html.replace('{{ seo.twitter.description }}', escapeHtml(seo.twitter.description));

  // EXPERIENCE
  const expHtml = experience.map(exp => `
    <article class="timeline-item reveal">
      <div class="timeline-date"><span>${escapeHtml(exp.startDate)} — ${escapeHtml(exp.endDate)}</span><i></i></div>
      <div class="timeline-card">
        <div class="timeline-head">
          <div><p>${escapeHtml(exp.company)} · ${escapeHtml(exp.location)}</p><h3>${escapeHtml(exp.role)}</h3></div>
          <span class="tag">${escapeHtml(exp.workType)}</span>
        </div>
        <p>${escapeHtml(exp.description)}</p>
        <ul class="chip-list">${exp.responsibilities.map(r => `<li>${escapeHtml(r)}</li>`).join('')}</ul>
      </div>
    </article>
  `).join('');
  html = html.replace('<!-- TEMPLATE: EXPERIENCE -->', expHtml);

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
  html = html.replace('<!-- TEMPLATE: SKILLS -->', fullKeyboard);

  // PROJECTS
  const projHtml = projects.map((p, idx) => `
    <article class="project-card ${p.featured ? 'project-featured' : ''} tilt-card reveal" tabindex="0">
      <div class="project-art ${escapeHtml(p.image)}" aria-hidden="true">
        <div class="project-number">0${idx+1}</div>
      </div>
      <div class="project-content">
        <div class="project-meta"><span>${escapeHtml(p.category)}</span></div>
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(p.summary)}</p>
        <ul class="chip-list">${p.tools.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
        ${p.repositoryUrl ? `<a class="project-link" href="${escapeHtml(p.repositoryUrl)}" target="_blank" rel="noreferrer">Visit Repository <span>↗</span></a>` : `<button class="project-link" type="button" data-modal="${escapeHtml(p.slug)}">Open case study <span>↗</span></button>`}
      </div>
    </article>
  `).join('');
  html = html.replace('<!-- TEMPLATE: PROJECTS -->', projHtml);

  // CERTIFICATES
  const featuredCerts = certificates.filter(c => c.featured);
  const supportCerts = certificates.filter(c => !c.featured);

  const featCertHtml = featuredCerts.map(c => `
    <a class="cert-card primary-cert reveal" href="${escapeHtml(c.certificateFile)}" target="_blank" rel="noreferrer" aria-label="Open ${escapeHtml(c.title)}">
      <div class="cert-icon">${escapeHtml(c.icon || c.title.charAt(0))}</div>
      <div><p>${escapeHtml(c.issueDate)}</p><h3>${escapeHtml(c.title)}</h3><span>${escapeHtml(c.issuer)} ${c.credentialId ? '· ID: ' + escapeHtml(c.credentialId) : ''}</span></div>
      <i aria-hidden="true">↗</i>
    </a>
  `).join('');
  html = html.replace('<!-- TEMPLATE: FEATURED_CERTIFICATES -->', featCertHtml);

  const suppCertHtml = supportCerts.map(c => `
    <a class="mini-cert" href="${escapeHtml(c.certificateFile)}" target="_blank" rel="noreferrer"><span class="mini-cert-icon">${escapeHtml(c.icon || c.title.charAt(0))}</span><span class="mini-cert-copy"><h4>${escapeHtml(c.title)}</h4><p>${escapeHtml(c.issuer)} · ${escapeHtml(c.issueDate)}</p></span><span class="mini-cert-arrow">↗</span></a>
  `).join('');
  html = html.replace('<!-- TEMPLATE: SUPPORTING_CERTIFICATES -->', suppCertHtml);

  // ACHIEVEMENTS
  const achHtml = `
    <div class="orbit-label">ACHIEVEMENTS</div>
    <div class="achievement-core"><strong>${achievements.filter(a=>!a.isBadge).length}×</strong><span>CTF<br>runner-up</span></div>
    ${achievements.map((a, i) => {
      if (!a.isBadge) return `<div class="achievement-ring ring-${i===0?'a':'b'}"><span>${escapeHtml(a.title)}</span></div>`;
      return `<div class="achievement-badge badge-${i===2?'a':'b'}">${escapeHtml(a.title)}</div>`;
    }).join('')}
  `;
  html = html.replace('<!-- TEMPLATE: ACHIEVEMENTS -->', achHtml);

  // EDUCATION
  const edu = education[0];
  const safeDegree = escapeHtml(edu.degree).replace(' of ', ' of<br><span>');
  const eduHtml = `
    <p class="eyebrow">06 / Education</p>
    <span class="education-year">${escapeHtml(edu.expectedCompletion)}</span>
    <h2>${safeDegree}</span></h2>
    <p>${escapeHtml(edu.institution)}<br>Expected completion: ${escapeHtml(edu.expectedCompletion)}</p>
  `;
  html = html.replace('<!-- TEMPLATE: EDUCATION -->', eduHtml);

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
  html = html.replace('<!-- TEMPLATE: SCHEMA_ORG -->', schemaOrg);

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
  html = html.replace('<!-- TEMPLATE: AI_PAYLOAD -->', safeAiPayload);

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
