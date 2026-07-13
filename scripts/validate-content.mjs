import fs from 'fs';
import path from 'path';

const contentDir = path.join(process.cwd(), 'content');

const loadJson = (file) => JSON.parse(fs.readFileSync(path.join(contentDir, file), 'utf8'));

const isValidUrl = (string) => {
  if (!string) return true; // optional
  try {
    const url = new URL(string);
    return url.protocol === 'https:' || url.protocol === 'mailto:';
  } catch (_) {
    return false;
  }
};

const isValidEmail = (email) => {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const hasSafeExtension = (filePath) => {
  if (!filePath) return true;
  const ext = filePath.split('.').pop().toLowerCase();
  return ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'avif'].includes(ext);
};

let errors = [];

try {
  const profile = loadJson('profile.json');
  if (!profile.fullName) errors.push('Profile: fullName is required');
  if (!isValidEmail(profile.email)) errors.push('Profile: invalid email');
  if (!isValidUrl(profile.githubUrl)) errors.push('Profile: invalid github URL');
  if (!isValidUrl(profile.linkedinUrl)) errors.push('Profile: invalid linkedin URL');
  if (profile.cvPath && !hasSafeExtension(profile.cvPath)) errors.push('Profile: unsafe CV path extension');

  const experience = loadJson('experience.json');
  const expIds = new Set();
  experience.forEach(e => {
    if (!e.id) errors.push('Experience: missing id');
    if (expIds.has(e.id)) errors.push(`Experience: duplicate id ${e.id}`);
    expIds.add(e.id);
    if (typeof e.displayOrder !== 'number') errors.push(`Experience: invalid displayOrder for ${e.id}`);
  });

  const projects = loadJson('projects.json');
  const projIds = new Set();
  const projSlugs = new Set();
  projects.forEach(p => {
    if (!p.id) errors.push('Project: missing id');
    if (projIds.has(p.id)) errors.push(`Project: duplicate id ${p.id}`);
    projIds.add(p.id);

    if (!p.slug) errors.push(`Project ${p.id}: missing slug`);
    if (projSlugs.has(p.slug)) errors.push(`Project: duplicate slug ${p.slug}`);
    projSlugs.add(p.slug);

    if (p.repositoryUrl && !isValidUrl(p.repositoryUrl)) errors.push(`Project ${p.id}: invalid repository URL`);
    if (p.liveUrl && !isValidUrl(p.liveUrl)) errors.push(`Project ${p.id}: invalid live URL`);
  });

  const skills = loadJson('skills.json');
  const skillIds = new Set();
  const skillKeys = new Set();
  skills.forEach(s => {
    if (!s.id) errors.push('Skill: missing id');
    if (skillIds.has(s.id)) errors.push(`Skill: duplicate id ${s.id}`);
    skillIds.add(s.id);

    if (s.skillKey) {
      if (skillKeys.has(s.skillKey)) errors.push(`Skill: duplicate skill key ${s.skillKey}`);
      skillKeys.add(s.skillKey);
    }

    if (typeof s.proficiencyValue !== 'number' || s.proficiencyValue < 0 || s.proficiencyValue > 100) {
      errors.push(`Skill ${s.id}: proficiency out of bounds`);
    }
  });

  const certificates = loadJson('certificates.json');
  const certIds = new Set();
  const certSlugs = new Set();
  certificates.forEach(c => {
    if (!c.id) errors.push('Certificate: missing id');
    if (certIds.has(c.id)) errors.push(`Certificate: duplicate id ${c.id}`);
    certIds.add(c.id);

    if (!c.slug) errors.push(`Certificate ${c.id}: missing slug`);
    if (certSlugs.has(c.slug)) errors.push(`Certificate: duplicate slug ${c.slug}`);
    certSlugs.add(c.slug);

    if (c.verificationUrl && !isValidUrl(c.verificationUrl)) errors.push(`Certificate ${c.id}: invalid URL`);
    if (c.certificateFile && !hasSafeExtension(c.certificateFile)) errors.push(`Certificate ${c.id}: unsafe file extension`);
    if (typeof c.featured !== 'boolean') errors.push(`Certificate ${c.id}: featured must be boolean`);
  });

  const seo = loadJson('seo.json');
  if (!isValidUrl(seo.canonicalUrl)) errors.push('SEO: invalid canonical URL');

} catch (e) {
  errors.push(`Error reading/parsing JSON: ${e.message}`);
}

if (errors.length > 0) {
  console.error('Validation Failed:');
  errors.forEach(e => console.error('- ' + e));
  process.exit(1);
} else {
  console.log('Content Validation Passed.');
}
