import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ignored = new Set(['node_modules','dist','.git']);
const findings = [];
const patterns = [
  [/TINA_TOKEN\s*=\s*(?!replace_|$)([^\s]+)/i,'Possible Tina token'],
  [/ghp_[A-Za-z0-9]{20,}/,'Possible GitHub personal access token'],
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,'Private key'],
  [/CLOUDFLARE_API_TOKEN\s*=\s*(?!replace_|$)([^\s]+)/i,'Possible Cloudflare API token'],
];
const walk = (dir) => {
  for (const item of fs.readdirSync(dir,{withFileTypes:true})) {
    if (ignored.has(item.name) || item.name === '.env.example') continue;
    const full = path.join(dir,item.name);
    if (item.isDirectory()) walk(full);
    else if (item.isFile() && fs.statSync(full).size < 2_000_000) {
      let text; try { text = fs.readFileSync(full,'utf8'); } catch { continue; }
      for (const [regex,label] of patterns) if (regex.test(text)) findings.push(`${label}: ${path.relative(root,full)}`);
    }
  }
};
walk(root);
for (const required of ['public/_headers','public/not-here-boy/index.html','CLOUDFLARE-ACCESS-SECURITY.md','.env.example','functions/_lib/access-gate.js','functions/admin.js','functions/admin/[[path]].js']) if (!fs.existsSync(path.join(root,required))) findings.push(`Missing security file: ${required}`);
if (findings.length) { console.error(findings.join('\n')); process.exit(1); }
console.log('Security repository check passed.');
