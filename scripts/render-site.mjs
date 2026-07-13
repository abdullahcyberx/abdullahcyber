import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const readCollection = (dir) => fs.readdirSync(path.join(root, dir))
  .filter((name) => name.endsWith('.json'))
  .map((name) => readJson(path.join(dir, name)))
  .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

const settings = readJson('content/settings/site.json');
const experiences = readCollection('content/experience');
const skills = readCollection('content/skills');
const projects = readCollection('content/projects');
const certificates = readCollection('content/certificates');
const achievements = readCollection('content/achievements');
const education = readJson('content/education/site.json');
const ai = readJson('content/ai/site.json');

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
const serializeForScript = (value) => JSON.stringify(value)
  .replace(/</g, '\\u003c')
  .replace(/>/g, '\\u003e')
  .replace(/&/g, '\\u0026')
  .replace(/\u2028/g, '\\u2028')
  .replace(/\u2029/g, '\\u2029');
const safeUrl = (value = '', fallback = '#') => {
  const text = String(value).trim();
  if (!text || /[\u0000-\u001f\u007f]/.test(text) || text.includes('\\')) return fallback;
  if (/^https:\/\/[A-Za-z0-9.-]+(?::\d+)?(?:[/?#]|$)/i.test(text)) return text;
  if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(text)) return text;
  if (/^\/(?!\/)/.test(text)) return text;
  if (/^#[A-Za-z][A-Za-z0-9_-]*$/.test(text)) return text;
  return fallback;
};
const joinText = (items = []) => items.filter(Boolean).map(String).join(', ');
const paragraphHtml = (text = '') => `<p>${escapeHtml(text)}</p>`;
const listHtml = (items = []) => items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
const absolute = (value) => {
  const url = safeUrl(value, '/');
  return url.startsWith('http') ? url : `${settings.domain.replace(/\/$/, '')}${url.startsWith('/') ? url : `/${url}`}`;
};

let template = fs.readFileSync(path.join(root, 'src/template.html'), 'utf8');

// Add generic art style once; existing specialized art remains untouched.
template = template.replace('</style>', `
.generic-art { display:grid; place-items:center; background:radial-gradient(circle at 50% 45%, rgba(97,231,255,.16), transparent 34%), radial-gradient(circle at 50% 50%, rgba(154,121,255,.14), transparent 60%), #090b20; }
.generic-art .generic-project-orb { width:130px; height:130px; border-radius:50%; border:1px solid rgba(97,231,255,.32); box-shadow:0 0 55px rgba(97,231,255,.13), inset 0 0 35px rgba(154,121,255,.2); display:grid; place-items:center; font-weight:800; letter-spacing:.12em; color:#dffaff; position:relative; }
.generic-art .generic-project-orb::before,.generic-art .generic-project-orb::after { content:""; position:absolute; inset:-34px; border:1px dashed rgba(154,121,255,.24); border-radius:50%; animation:rotate 18s linear infinite; }
.generic-art .generic-project-orb::after { inset:-70px; animation-direction:reverse; animation-duration:28s; border-color:rgba(97,231,255,.12); }
.achievement-cms-list { grid-column:1/-1; display:flex; flex-wrap:wrap; gap:10px; margin-top:18px; }
.achievement-cms-list span { border:1px solid var(--line); background:rgba(255,255,255,.025); border-radius:999px; padding:7px 11px; font-size:10px; color:#b9bbd7; }
</style>`);

const skillObject = Object.fromEntries(skills.map((skill) => [skill.key, {
  index: skill.index,
  title: skill.title,
  description: skill.description,
  level: skill.levelLabel,
  percent: Math.max(0, Math.min(100, Number(skill.percent || 0))),
}]));
template = template.replace(/const skills = \{[\s\S]*?\n  \};\n\n  const skillKeys/, `const skills = ${serializeForScript(skillObject)};\n\n  const skillKeys`);

const modalProjects = Object.fromEntries(projects.filter((p) => p.linkType === 'modal' && p.caseStudy).map((p) => [p.slug, {
  label: p.caseStudy.label || 'Case study',
  title: p.title,
  summary: p.caseStudy.summary || p.description,
  objective: p.caseStudy.objective || '',
  environment: p.caseStudy.environment || '',
  learning: p.caseStudy.learning || '',
  ethics: p.caseStudy.ethics || 'Authorized or educational scope only.',
}]));
template = template.replace(/const caseStudies = \{[\s\S]*?\n  \};\n  const modal/, `const caseStudies = ${serializeForScript(modalProjects)};\n  const modal`);

const featuredCerts = certificates.filter((c) => c.featured);
const supportingCerts = certificates.filter((c) => !c.featured);
const summaryText = `${settings.profile.name} is an entry-level cybersecurity candidate focused on ${settings.about.focus}. Evidence includes ${experiences.length} experience entries, practical work with ${joinText(skills.slice(0, 6).map((s) => s.title))}, ${projects.length} documented projects, ${featuredCerts.map((c) => c.title).join(' and ')} as primary certifications, and ${achievements.length} listed achievements. Best fit: a cybersecurity internship or junior penetration-testing role with mentorship and practical assessment work. Degree completion is expected in ${education.expectedCompletion}.`;
template = template.replace(/const recruiterText = `[^`]*`;/, `const recruiterText = ${serializeForScript(summaryText)};`);

const aiAnswer = (text, link = '') => `${paragraphHtml(text)}${link}`;
const experienceSummary = experiences.map((e) => `${e.title} at ${e.organization} (${e.period})`).join('; ');
const projectSummary = projects.map((p) => p.title).join('; ');
const certSummary = featuredCerts.map((c) => `${c.title} — ${c.issuer}`).join('; ');
const achievementSummary = achievements.map((a) => a.title).join('; ');
const skillsSummary = skills.map((s) => s.title).join(', ');
const knowledge = [
  { id:'overview', patterns:['who is muhammad abdullah','tell me about muhammad','who is abdullah cyber','profile summary'], keywords:['muhammad','abdullah','cyber','overview','profile'], answer: aiAnswer(`${settings.profile.name}, also known as ${settings.profile.alternateName}, is a ${settings.profile.jobTitle} and Cyber Security student at ${education.institution} in ${settings.profile.location}. His primary focus is ${settings.about.focus}.`, `<a class="ai-inline-link" href="#about" data-ai-nav="about">Explore his profile ↗</a>`), source:'Generated from Site Settings, About and Education.' },
  { id:'experience', patterns:['work experience','internship experience','where has he worked','professional experience'], keywords:['experience','internship','worked','organization'], answer: aiAnswer(`Verified experience: ${experienceSummary}.`, `<a class="ai-inline-link" href="#experience" data-ai-nav="experience">View experience timeline ↗</a>`), source:'Generated from Experience entries.' },
  { id:'projects', patterns:['what projects has he done','show projects','portfolio projects','hands on projects'], keywords:['projects','project','gophish','honeypot','ctf'], answer: aiAnswer(`Highlighted projects: ${projectSummary}.`, `<a class="ai-inline-link" href="#projects" data-ai-nav="projects">Open project evidence ↗</a>`), source:'Generated from Projects.' },
  { id:'skills', patterns:['what tools does he use','technical skills','security skills','what are his skills'], keywords:['skills','tools','burp','nmap','linux','web'], answer: aiAnswer(`His published skills include ${skillsSummary}.`, `<a class="ai-inline-link" href="#skills" data-ai-nav="skills">Open skills constellation ↗</a>`), source:'Generated from Skills Keyboard.' },
  { id:'certifications', patterns:['certifications','certificates','credentials','main certifications'], keywords:['certification','certificate','credential','web-rta','capt'], answer: aiAnswer(`Primary certifications: ${certSummary}. The portfolio also contains ${supportingCerts.length} supporting learning and participation certificates.`, `<a class="ai-inline-link" href="#credentials" data-ai-nav="credentials">Review credentials ↗</a>`), source:'Generated from Certificates.' },
  { id:'education', patterns:['education','degree','university','riphah','graduation'], keywords:['education','degree','riphah','university','2028'], answer: aiAnswer(`${settings.profile.name} is studying ${education.degree} at ${education.institution}, with expected completion in ${education.expectedCompletion}.`, `<a class="ai-inline-link" href="#education" data-ai-nav="education">View education ↗</a>`), source:'Generated from Education.' },
  { id:'achievements', patterns:['achievements','ctf placement','awards','runner up'], keywords:['achievement','ctf','runner','award'], answer: aiAnswer(`Published achievements: ${achievementSummary}.`, `<a class="ai-inline-link" href="#achievements" data-ai-nav="achievements">View achievements ↗</a>`), source:'Generated from Achievements.' },
  { id:'contact', patterns:['contact muhammad','email address','how can i contact him','hire him'], keywords:['contact','email','hire','linkedin'], answer: aiAnswer(`For professional enquiries, contact ${settings.profile.name} at ${settings.profile.email} or through LinkedIn.`, `<a class="ai-inline-link" href="mailto:${escapeHtml(settings.profile.email)}">Email Muhammad ↗</a>`), source:'Generated from public contact details.' },
  { id:'ethics', patterns:['is his work ethical','authorized testing','legal hacking','scope'], keywords:['ethical','authorized','legal','scope','permission'], answer: aiAnswer('All testing and demonstrations described in this portfolio are presented as authorized, isolated or educational. No unauthorized systems are claimed.'), source:'Generated from project case-study ethics fields and portfolio disclaimer.' },
  { id:'private', patterns:['phone number','home address','age','birthday','date of birth','salary','cnic','marital status'], keywords:['phone','address','age','birthday','birth','salary','cnic','marital'], answer: aiAnswer(`That detail is not listed in ${settings.profile.name}’s verified portfolio, so I will not guess. Use the public contact information for professional enquiries.`), source:'Privacy guard: only public portfolio information is used.' },
  ...(ai.customFacts || []).map((fact) => ({ id: fact.id, patterns: fact.patterns || [], keywords: fact.keywords || [], answer: aiAnswer(fact.answer || ''), source: fact.source || 'Custom verified portfolio fact.' })),
];
template = template.replace(/const knowledge = \[[\s\S]*?\n  \];\n\n  const canned =/, `const knowledge = ${serializeForScript(knowledge)};\n\n  const canned =`);
const canned = {
  greeting: `${paragraphHtml(ai.greeting)}<p>Ask about experience, projects, skills or credentials, or try the recruiter briefing and hidden CTF challenge.</p>`,
  thanks: `<p>You’re welcome. I can also prepare a recruiter briefing, guide you to supporting evidence or launch the mini CTF challenge.</p>`,
  unknown: `${paragraphHtml(ai.unknown)}<p>Try asking about experience, web-security skills, projects, achievements, education or certifications.</p>`,
  help: `<p><strong>${escapeHtml(ai.assistantName)} commands</strong></p><ul><li><strong>/brief</strong> — recruiter-ready candidate briefing</li><li><strong>/scan</strong> — run the cosmic evidence scan</li><li><strong>/challenge</strong> — unlock the hidden CTF dossier</li><li><strong>/clear</strong> — reset the conversation</li></ul><p>You can also use the microphone where browser voice input is supported.</p>`,
};
template = template.replace(/const canned = \{[\s\S]*?\n  \};\n\n  const matchIntent/, `const canned = ${serializeForScript(canned)};\n\n  const matchIntent`);

const $ = load(template, { decodeEntities: false });

// Metadata and structured data
$('html').attr('lang', 'en-PK');
$('title').text(settings.seo.title);
$('meta[name="author"]').attr('content', settings.profile.name);
$('meta[name="description"]').attr('content', settings.seo.description);
$('meta[name="keywords"]').attr('content', joinText(settings.seo.keywords));
$('link[rel="canonical"]').attr('href', `${settings.domain.replace(/\/$/, '')}/`);
$('meta[property="og:site_name"]').attr('content', settings.siteName);
$('meta[property="og:url"]').attr('content', `${settings.domain.replace(/\/$/, '')}/`);
$('meta[property="og:title"]').attr('content', settings.seo.ogTitle);
$('meta[property="og:description"]').attr('content', settings.seo.ogDescription);
$('meta[property="og:image"]').attr('content', absolute(settings.seo.ogImage));
$('meta[name="twitter:title"]').attr('content', settings.seo.ogTitle);
$('meta[name="twitter:description"]').attr('content', settings.seo.ogDescription);
$('meta[name="twitter:image"]').attr('content', absolute(settings.seo.ogImage));

const jsonLd = {
  '@context':'https://schema.org',
  '@graph':[
    { '@type':'WebSite', '@id':`${settings.domain}/#website`, url:`${settings.domain}/`, name:settings.siteName, alternateName:`${settings.profile.name} Cyber Security Portfolio`, inLanguage:'en-PK' },
    { '@type':'ProfilePage', '@id':`${settings.domain}/#profilepage`, url:`${settings.domain}/`, name:`${settings.profile.name} — Cyber Security Portfolio`, isPartOf:{'@id':`${settings.domain}/#website`}, dateModified:new Date().toISOString().slice(0,10), mainEntity:{'@id':`${settings.domain}/#person`} },
    { '@type':'Person', '@id':`${settings.domain}/#person`, name:settings.profile.name, alternateName:[settings.profile.alternateName,'abdullahcyberx'], url:`${settings.domain}/`, image:absolute(settings.seo.ogImage), email:`mailto:${settings.profile.email}`, jobTitle:settings.profile.jobTitle, description:settings.seo.description, homeLocation:{'@type':'Country',name:settings.profile.location}, affiliation:{'@type':'CollegeOrUniversity',name:education.institution}, sameAs:[settings.profile.github,settings.profile.linkedin], knowsAbout:skills.map((s)=>s.title), hasCredential:featuredCerts.map((c)=>({'@type':'EducationalOccupationalCredential',name:c.title,credentialCategory:'Professional certification',recognizedBy:{'@type':'Organization',name:c.issuer}})) }
  ]
};
$('script[type="application/ld+json"]').first().text(serializeForScript(jsonLd));

// Global links and brand
$('.brand').attr('aria-label', `${settings.profile.name} home`);
$('.brand > span:last-child').html(`${escapeHtml(settings.brandText.replace(/\.$/, ''))}<span class="brand-dot">.</span>`);
$('a[href^="https://github.com/abdullahcyberx"]').attr('href', safeUrl(settings.profile.github));
$('a[href^="https://www.linkedin.com/in/hafizabdullahx"]').attr('href', safeUrl(settings.profile.linkedin));
$('a[href^="mailto:abdullahcyberx@gmail.com"]').attr('href', `mailto:${settings.profile.email}`);
$('a[href="assets/Muhammad-Abdullah-CV.pdf"], a[href="/assets/Muhammad-Abdullah-CV.pdf"]').attr('href', safeUrl(settings.profile.cv));

// Hero
$('.status-pill').html(`<span class="status-dot"></span> ${escapeHtml(settings.hero.status)}`);
$('#home .hero-copy > .eyebrow').text(settings.hero.eyebrow);
$('#hero-title').html(`${escapeHtml(settings.hero.firstName)}<br><span>${escapeHtml(settings.hero.lastName)}</span>`);
$('#typed-role').text(settings.hero.roles?.[0] || settings.profile.jobTitle);
$('.hero-description').text(settings.hero.description);
$('.hero-actions .button-primary').html(`${escapeHtml(settings.hero.primaryButton)} <span aria-hidden="true">↓</span>`);
$('.hero-actions .button-ghost').text(settings.hero.secondaryButton).attr('href', `mailto:${settings.profile.email}`);
$('.hero-links a').eq(0).attr('href', safeUrl(settings.profile.github));
$('.hero-links a').eq(1).attr('href', safeUrl(settings.profile.linkedin));
$('.hero-links a').eq(2).attr('href', `mailto:${settings.profile.email}`);

// About
$('#about .section-heading .eyebrow').text(settings.about.eyebrow);
$('#about .section-heading h2').html(`${escapeHtml(settings.about.headingLine1)}<br><span>${escapeHtml(settings.about.headingHighlight)}</span>`);
$('#about .about-copy').html(`<p class="lead">${escapeHtml(settings.about.lead)}</p>${(settings.about.paragraphs || []).map(paragraphHtml).join('')}<div class="about-quote"><span aria-hidden="true">“</span><p>${escapeHtml(settings.about.quote)}</p></div>`);
const identityRows = [
  ['Focus',settings.about.focus],['Approach',settings.about.approach],['Based in',settings.profile.location],['Education',settings.about.educationShort]
];
$('.identity-panel dl').html(identityRows.map(([k,v])=>`<div><dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd></div>`).join(''));
$('.identity-panel > a').attr('href', safeUrl(settings.profile.cv));
$('.profile-context .eyebrow').text(`${settings.profile.alternateName} · ${settings.profile.location}`);
$('#pakistan-profile-title').text(settings.about.contextTitle);
$('.profile-context > p').text(settings.about.contextText);

// Experience
$('.timeline').html(experiences.map((e)=>`<article class="timeline-item reveal"><div class="timeline-date"><span>${escapeHtml(e.period)}</span><i></i></div><div class="timeline-card"><div class="timeline-head"><div><p>${escapeHtml(e.organization)} · ${escapeHtml(e.location)}</p><h3>${escapeHtml(e.title)}</h3></div><span class="tag">${escapeHtml(e.type || (e.current ? 'Current' : 'Experience'))}</span></div><p>${escapeHtml(e.description)}</p><ul class="chip-list">${listHtml(e.skills || [])}</ul></div></article>`).join(''));

// Skills keyboard
const primarySkill = skills.find((s)=>s.primary) || skills[0];
const rowSizes = [5,5,5,Math.max(1, skills.length-15)];
let cursor = 0;
const keyboardRows = rowSizes.map((size,rowIndex)=>{
  const slice = skills.slice(cursor,cursor+size); cursor += size;
  if (!slice.length) return '';
  return `<div class="key-row key-row-${['one','two','three','four'][rowIndex] || 'four'}">${slice.map((s)=>`<button class="skill-key${s.wide?' wide':''}${s.primary?' space-key active':''}" data-skill="${escapeHtml(s.key)}" role="listitem"><span>${escapeHtml(s.keyLabel)}</span><small>${s.primary?'SPACE':String(s.order).padStart(2,'0')}</small></button>`).join('')}</div>`;
}).join('');
$('#keyboard-board').html(keyboardRows);
if (primarySkill) {
  $('#skill-index').text(primarySkill.index);
  $('#skill-title').text(primarySkill.title);
  $('#skill-description').text(primarySkill.description);
  $('#skill-level-label').text(primarySkill.levelLabel);
  $('#skill-level-bar').attr('style', `width:${Math.max(0,Math.min(100,Number(primarySkill.percent||0)))}%`);
}

// Projects
const art = (p, number) => {
  if (p.artStyle === 'phishing') return `<div class="project-art phishing-art" aria-hidden="true"><div class="mail-window"><div class="mail-top"><i></i><i></i><i></i><span>Awareness simulation</span></div><div class="mail-body"><div class="fake-logo">!</div><b>Verify your account</b><span>Controlled training scenario</span><button>Review activity</button></div></div><div class="radar-ring"></div><div class="project-number">${number}</div></div>`;
  if (p.artStyle === 'honeypot') return `<div class="project-art honeypot-art" aria-hidden="true"><div class="server-stack"><span></span><span></span><span></span></div><div class="attack-line line-a"></div><div class="attack-line line-b"></div><div class="attack-line line-c"></div><div class="shield-core">SSH</div><div class="project-number">${number}</div></div>`;
  if (p.artStyle === 'ctf') return `<div class="project-art ctf-art" aria-hidden="true"><div class="ctf-terminal"><p>&gt; flag_search</p><p>route: web → logic → exploit</p><p class="flag-text">FLAG{think_beyond_tools}</p></div><div class="cube cube-one"></div><div class="cube cube-two"></div><div class="project-number">${number}</div></div>`;
  return `<div class="project-art generic-art" aria-hidden="true"><div class="generic-project-orb">${escapeHtml((p.title || 'PROJECT').split(/\s+/).slice(0,2).map((x)=>x[0]).join('').toUpperCase())}</div><div class="project-number">${number}</div></div>`;
};
const projectAction = (p) => {
  if (p.linkType === 'modal') return `<button class="project-link" type="button" data-modal="${escapeHtml(p.slug)}">Open case study <span>↗</span></button>`;
  if (p.linkType === 'external' && p.externalUrl) return `<a class="project-link" href="${escapeHtml(safeUrl(p.externalUrl))}" target="_blank" rel="noreferrer">Visit project <span>↗</span></a>`;
  return '';
};
$('.project-grid').html(projects.map((p,i)=>`<article class="project-card${p.featured?' project-featured':''} tilt-card reveal" tabindex="0">${art(p,String(i+1).padStart(2,'0'))}<div class="project-content"><div class="project-meta">${(p.meta||[]).map((m)=>`<span>${escapeHtml(m)}</span>`).join('')}</div><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.description)}</p><ul class="chip-list">${listHtml(p.tools||[])}</ul>${projectAction(p)}</div></article>`).join(''));

// Certificates
$('.cert-list').html(featuredCerts.map((c)=>`<a class="cert-card primary-cert reveal" href="${escapeHtml(safeUrl(c.file))}" target="_blank" rel="noreferrer" aria-label="Open ${escapeHtml(c.title)} certificate"><div class="cert-icon">${escapeHtml(c.icon)}</div><div><p>${escapeHtml(c.displayDate)}</p><h3>${escapeHtml(c.title)}</h3><span>${escapeHtml(c.issuer)}${c.credentialId?` · ID: ${escapeHtml(c.credentialId)}`:''}</span></div><i aria-hidden="true">↗</i></a>`).join(''));
$('.supporting-summary-copy > span:last-child > span').text(`${supportingCerts.length} supporting certificates · kept intentionally compact`);
$('.supporting-grid').html(supportingCerts.map((c)=>`<a class="mini-cert" href="${escapeHtml(safeUrl(c.file))}" target="_blank" rel="noreferrer"><span class="mini-cert-icon">${escapeHtml(c.icon)}</span><span class="mini-cert-copy"><h4>${escapeHtml(c.title)}</h4><p>${escapeHtml(c.issuer)} · ${escapeHtml(c.displayDate)}</p></span><span class="mini-cert-arrow">↗</span></a>`).join(''));

// Achievements + dynamic compact list
const short = achievements.map((a)=>a.shortTitle || a.title);
$('.achievement-ring.ring-a span').text(short[0] || 'Achievement');
$('.achievement-ring.ring-b span').text(short[1] || 'Achievement');
$('.achievement-badge.badge-a').text(short[2] || 'Milestone');
$('.achievement-badge.badge-b').text(short[3] || 'Milestone');
$('.achievement-core strong').text(`${achievements.filter((a)=>/runner|place/i.test(`${a.category} ${a.title}`)).length || achievements.length}×`);
$('.achievement-orbit').after(`<div class="achievement-cms-list reveal">${achievements.map((a)=>`<span>${escapeHtml(a.title)}</span>`).join('')}</div>`);

// Education
$('#education .education-main .eyebrow').text(education.eyebrow);
$('.education-year').text(education.expectedCompletion);
$('.education-main h2').html(`${escapeHtml(education.degree.replace(/\s+Cyber Security$/i,''))}<br><span>Cyber Security</span>`);
$('.education-main > p:last-child').html(`${escapeHtml(education.institution)}<br>Expected completion: ${escapeHtml(education.expectedCompletion)}`);
$('.education-extra').html(`<p class="eyebrow">Beyond the terminal</p>${(education.extras||[]).map((item)=>`<div class="extra-item"><b>${escapeHtml(item.title)}</b><span>${escapeHtml(item.description)}</span></div>`).join('')}`);

// Contact + footer
$('#contact .eyebrow').text(settings.contact.eyebrow);
$('#contact h2').html(`${escapeHtml(settings.contact.headingLine1)}<br><span>${escapeHtml(settings.contact.headingHighlight)}</span>`);
$('.contact-copy > p:not(.eyebrow)').text(settings.contact.description);
$('.email-link').attr('href',`mailto:${settings.profile.email}`).html(`${escapeHtml(settings.profile.email)} <span>↗</span>`);
$('.form-note').text(settings.contact.formNote);
$('.footer-brand p').text(settings.footer.tagline);
$('.footer-bottom > span').html(`© <span id="year"></span> ${escapeHtml(settings.profile.name)} · ${escapeHtml(settings.domain.replace(/^https?:\/\//,''))}`);

// AI name in visible UI and buttons
$('[data-ai-open]').each((_,el)=>{ const node=$(el); if(node.is('button') && node.text().trim()) node.text(node.text().replace(/Shehzada’s AI|Orbit AI/g, ai.assistantName)); });
$('.ai-launcher-label').text(`Ask ${ai.assistantName}`);
$('.ai-panel[aria-label]').attr('aria-label', `${ai.assistantName} portfolio assistant`);
$('.ai-head-copy strong').text(ai.assistantName);
$('#ai-input').attr('placeholder','Ask about experience, skills or projects…');

// Build-time content used by role rotation, contact form and AI features.
const publicContent = {
  profile: settings.profile,
  roles: settings.hero.roles || [],
  assistantName: ai.assistantName,
  recruiterText: summaryText,
  counts: { experiences: experiences.length, projects: projects.length, certificates: certificates.length, achievements: achievements.length },
};
const injected = `<script id="portfolio-content">window.__PORTFOLIO_CONTENT__=${serializeForScript(publicContent)};<\/script>`;
$('body > script').first().before(injected);

let html = $.html();
html = html.replace("const roles = ['Penetration Tester', 'Web Security Enthusiast', 'CTF Organizer & Player'];", `const roles = window.__PORTFOLIO_CONTENT__?.roles?.length ? window.__PORTFOLIO_CONTENT__.roles : ['${escapeHtml(settings.profile.jobTitle)}'];`);
html = html.replace('window.location.href = `mailto:abdullahcyberx@gmail.com?subject=${subject}&body=${body}`;', 'window.location.href = `mailto:${window.__PORTFOLIO_CONTENT__?.profile?.email || \'abdullahcyberx@gmail.com\'}?subject=${subject}&body=${body}`;');
// Keep any remaining assistant labels synchronized with the CMS field.
html = html
  .replaceAll('Shehzada’s AI', ai.assistantName)
  .replaceAll('Shehzada’s AI', ai.assistantName)
  .replaceAll('SHEHZADA’S DOSSIER', `${ai.assistantName.toUpperCase()} DOSSIER`);

fs.writeFileSync(path.join(root, 'index.html'), html);
fs.mkdirSync(path.join(root, 'public/content'), { recursive: true });
fs.writeFileSync(path.join(root, 'public/content/portfolio.json'), JSON.stringify({ settings, experiences, skills, projects, certificates, achievements, education, ai }, null, 2));

// Generate the Access-denied destination from CMS settings. It remains a
// static, script-free page and exposes no authentication logic or secrets.
const deniedMessage = escapeHtml(settings.security?.denialMessage || 'not here boy 🙂');
const deniedPage = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>Access denied · ${escapeHtml(settings.siteName)}</title><style>
:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;overflow:hidden;background:radial-gradient(circle at 50% 35%,#251a52 0,#090a18 35%,#03040a 75%);font-family:Inter,system-ui,sans-serif;color:#f7f5ff}.stars{position:fixed;inset:0;background-image:radial-gradient(circle,#fff 0 1px,transparent 1.5px);background-size:47px 47px;opacity:.13}.card{position:relative;text-align:center;width:min(92vw,560px);padding:52px 32px;border:1px solid rgba(154,121,255,.3);border-radius:30px;background:rgba(10,11,29,.92);box-shadow:0 35px 100px #0009}.orb{width:110px;height:110px;margin:0 auto 25px;border-radius:50%;display:grid;place-items:center;font-size:44px;border:1px solid #61e7ff66;box-shadow:0 0 60px #61e7ff24,inset 0 0 30px #9a79ff40}.orb:after{content:"";position:absolute;width:150px;height:52px;border:1px solid #9a79ff88;border-radius:50%;transform:rotate(-18deg)}h1{margin:0;font-size:clamp(34px,8vw,62px);letter-spacing:-.05em}p{color:#aaaecb;margin:12px 0 30px}a{display:inline-block;padding:12px 20px;border-radius:999px;background:linear-gradient(135deg,#9a79ff,#61e7ff);color:#07101a;text-decoration:none;font-weight:800}</style></head><body><div class="stars"></div><main class="card"><div class="orb" aria-hidden="true">🛸</div><h1>${deniedMessage}</h1><p>This area is private. Return to the public orbit.</p><a href="/">Back to portfolio</a></main></body></html>`;
fs.mkdirSync(path.join(root, 'public/not-here-boy'), { recursive: true });
fs.writeFileSync(path.join(root, 'public/not-here-boy/index.html'), deniedPage);

console.log(`Rendered portfolio: ${experiences.length} experiences, ${skills.length} skills, ${projects.length} projects, ${certificates.length} certificates.`);
