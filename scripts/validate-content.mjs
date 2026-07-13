import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const list = (dir) => fs.readdirSync(path.join(root, dir))
  .filter((n) => n.endsWith('.json'))
  .map((n) => read(path.join(dir, n)));
const fail = (message) => { console.error(`CONTENT ERROR: ${message}`); process.exitCode = 1; };
const isHttps = (value = '') => /^https:\/\/[A-Za-z0-9.-]+(?::\d+)?(?:[/?#]|$)/i.test(String(value).trim());
const isSafeSitePath = (value = '') => /^\/(?!\/)(?!.*(?:\\|\.\.))(?:[^\u0000-\u001f\u007f]*)$/.test(String(value).trim());
const isSafeUrl = (value = '') => isHttps(value) || isSafeSitePath(value);
const isSlug = (value = '') => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value));

const settings = read('content/settings/site.json');
if (!isHttps(settings.domain)) fail('Canonical domain must be a valid HTTPS URL');
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.profile?.email || '')) fail('Public email is invalid');
for (const [label, value] of [['GitHub URL', settings.profile?.github], ['LinkedIn URL', settings.profile?.linkedin]]) {
  if (!isHttps(value)) fail(`${label} must be a valid HTTPS URL`);
}
if (!isSafeSitePath(settings.profile?.cv)) fail('CV must use a safe root-relative site path');
if (!isSafeSitePath(settings.seo?.ogImage)) fail('Social image must use a safe root-relative site path');
if (!settings.hero?.roles?.length) fail('At least one rotating role is required');
if (!settings.security?.denialMessage?.trim()) fail('Access-denied message is required');

for (const [name, dir, key] of [
  ['skills', 'content/skills', 'key'],
  ['projects', 'content/projects', 'slug'],
  ['certificates', 'content/certificates', 'slug'],
]) {
  const items = list(dir);
  const seen = new Set();
  for (const item of items) {
    if (!item[key]) fail(`${name}: missing ${key}`);
    if (!isSlug(item[key])) fail(`${name}: ${key} must contain lowercase letters, numbers and single hyphens only (${item[key]})`);
    if (seen.has(item[key])) fail(`${name}: duplicate ${key} ${item[key]}`);
    seen.add(item[key]);
    if (!Number.isFinite(Number(item.order))) fail(`${name}: ${item[key]} has invalid order`);
  }
}

for (const skill of list('content/skills')) {
  if (Number(skill.percent) < 0 || Number(skill.percent) > 100) fail(`skills: ${skill.key} percent must be 0–100`);
}
for (const cert of list('content/certificates')) {
  if (!isSafeUrl(cert.file)) fail(`certificates: ${cert.slug} file must be a safe site path or HTTPS URL`);
}
for (const project of list('content/projects')) {
  if (project.linkType === 'external' && !isHttps(project.externalUrl)) fail(`projects: ${project.slug} external URL must use HTTPS`);
}

if (!process.exitCode) console.log('Content validation passed.');
