import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const certsFile = path.join(process.cwd(), 'content', 'certificates.json');
const indexFile = path.join(process.cwd(), 'index.html');
const testCertName = 'Temporary JSON Manager Test Certificate';
const backupData = fs.readFileSync(certsFile, 'utf8');

function runChecks(expectFeatured, expectPresent) {
  execSync('node scripts/validate-content.mjs', { stdio: 'ignore' });
  execSync('node scripts/render-site.mjs', { stdio: 'ignore' });
  
  const html = fs.readFileSync(indexFile, 'utf8');
  const isPresent = html.includes(testCertName);
  
  if (expectPresent && !isPresent) {
    throw new Error(`Expected ${testCertName} to be present in HTML, but it was not.`);
  }
  if (!expectPresent && isPresent) {
    throw new Error(`Expected ${testCertName} to NOT be present in HTML, but it was.`);
  }

  // AI Check
  const aiDataMatch = html.match(/<script type="application\/json" id="ai-data">([\s\S]*?)<\/script>/);
  if (!aiDataMatch) throw new Error('AI data not found');
  const aiData = JSON.parse(aiDataMatch[1].replace(/\\u003C/g, '<').replace(/\\u003E/g, '>').replace(/\\u0026/g, '&'));
  const aiCerts = aiData.knowledge.certificates.map(c => c.title);
  if (expectPresent && !aiCerts.includes(testCertName)) {
    throw new Error(`${testCertName} missing from AI payload`);
  }

  // Check if it's featured
  const isFeatured = html.includes(`<h3 class="cert-title">${testCertName}</h3>`) && html.indexOf(`<h3 class="cert-title">${testCertName}</h3>`) < html.indexOf('class="additional-certs');
  
  if (expectPresent && expectFeatured) {
    if (!isFeatured) {
      throw new Error(`Expected ${testCertName} to be featured.`);
    }
  } else if (expectPresent && !expectFeatured) {
    if (isFeatured) {
      throw new Error(`Expected ${testCertName} to NOT be featured.`);
    }
  }
}

try {
  console.log('Running test-content-update...');
  
  // 1. Add non-featured
  const certs = JSON.parse(backupData);
  certs.push({
    id: 'test-cert-1',
    slug: 'test-cert',
    title: testCertName,
    issuer: 'Test',
    issueDate: '2026',
    credentialId: '',
    verificationUrl: '',
    certificateFile: '/assets/certificates/test.pdf',
    thumbnail: '',
    featured: false,
    displayOrder: 99,
    skills: [],
    description: ''
  });
  fs.writeFileSync(certsFile, JSON.stringify(certs, null, 2));
  console.log('Added temporary non-featured certificate.');
  runChecks(false, true);
  
  // 2. Change to featured
  certs[certs.length - 1].featured = true;
  fs.writeFileSync(certsFile, JSON.stringify(certs, null, 2));
  console.log('Changed to featured certificate.');
  runChecks(true, true);

  console.log('Test Content Update Passed.');
} catch (e) {
  console.error('Test Content Update Failed:', e.message);
  // Restore before exit
  fs.writeFileSync(certsFile, backupData);
  execSync('node scripts/render-site.mjs', { stdio: 'ignore' });
  process.exit(1);
}

// Success restore
fs.writeFileSync(certsFile, backupData);
execSync('node scripts/render-site.mjs', { stdio: 'ignore' });
console.log('Restored original certificates and re-rendered.');
