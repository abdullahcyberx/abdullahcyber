import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '..');

const patterns = [
  { regex: new RegExp('TINA_' + 'TOKEN=["\'][a-zA-Z0-9_-]+["\']', 'g'), name: 'TINA_TOKEN' },
  { regex: new RegExp('CF_ACCESS_AUD=["\'][a-zA-Z0-9_-]{60,}["\']', 'g'), name: 'CF_ACCESS_AUD' },
  { regex: new RegExp('https:\\/\\/[a-z0-9-]+\\.cloudflareaccess\\.com', 'g'), name: 'Cloudflare Team Domain' },
  { regex: new RegExp('ghp_[a-zA-Z0-9]{36}', 'g'), name: 'GitHub Token' },
  { regex: new RegExp('-----BEGIN ' + 'RSA ' + 'PRIVATE KEY-----', 'g'), name: 'RSA Private Key' },
  { regex: new RegExp('eyJ[a-zA-Z0-9_-]*\\.[a-zA-Z0-9_-]*\\.[a-zA-Z0-9_-]*', 'g'), name: 'JWT Token' }
];

const allowList = [
  'https://abdullah-test.cloudflareaccess.com',
  'https://wrong.cloudflareaccess.com',
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InRlc3Qta2V5In0', 
  'CF_ACCESS_AUD="<YOUR_AUD_TAG>"',
  'TINA_' + 'TOKEN="<YOUR_TINA_TOKEN>"'
];

function isAllowed(match) {
  for (const allowed of allowList) {
    if (match.includes(allowed)) return true;
  }
  return false;
}

const foldersToScan = ['dist', 'src', 'public', 'content', 'tina', 'functions', 'scripts'];
let failed = false;

function scanDir(directory) {
  if (!fs.existsSync(directory)) return;
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', '.local-node'].includes(file)) {
        scanDir(fullPath);
      }
    } else if (stat.isFile()) {
      scanFile(fullPath);
    }
  }
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  for (const p of patterns) {
    const matches = content.match(p.regex) || [];
    for (const match of matches) {
      if (!isAllowed(match)) {
        console.error(`[SECRET SCAN FAILURE] Exposed ${p.name} found in ${path.relative(root, filePath)}`);
        failed = true;
      }
    }
  }
}

for (const folder of foldersToScan) {
  scanDir(path.join(root, folder));
}

if (failed) {
  process.exit(1);
} else {
  console.log('Secret scan passed: No exposed credentials found.');
}
