import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();

const secretPatterns = [
  /(?:NEXT_PUBLIC_TINA_CLIENT_ID|TINA_TOKEN|NEXT_PUBLIC_TINA_BRANCH|CF_ACCESS_TEAM_DOMAIN|CF_ACCESS_AUD|ADMIN_EMAIL)\s*=\s*.+/i,
  /['"](?:NEXT_PUBLIC_TINA_CLIENT_ID|TINA_TOKEN|NEXT_PUBLIC_TINA_BRANCH)['"]\s*:\s*['"].+['"]/i
];

function scanDirectory(dir) {
  let hasSecrets = false;
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    if (['node_modules', '.git', 'dist', '.local-node'].includes(file)) continue;
    
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (scanDirectory(fullPath)) hasSecrets = true;
    } else {
      // Check for .env files
      if (file.startsWith('.env') && file !== '.env.example') {
        console.error(`Secret Scan Failed: Found ${file} which should not be tracked.`);
        hasSecrets = true;
        continue;
      }
      
      // Check file content for secrets
      if (['.html', '.json', '.js', '.mjs', '.css', '.md', '.txt'].includes(path.extname(file))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        for (const pattern of secretPatterns) {
          if (pattern.test(content)) {
            console.error(`Secret Scan Failed: Found potential secret in ${fullPath}`);
            hasSecrets = true;
          }
        }
      }
    }
  }
  return hasSecrets;
}

if (scanDirectory(rootDir)) {
  process.exit(1);
} else {
  console.log('Secret Scan Passed.');
}
