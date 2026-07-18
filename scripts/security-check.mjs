import fs from 'fs';
import path from 'path';

const contentDir = path.join(process.cwd(), 'content');

const maliciousPatterns = [
  /<script\b[^>]*>/i,
  /<\/script>/i,
  /javascript:/i,
  /data:text\/html/i,
  /\bon\w+\s*=/i, // inline event handlers like onerror=
  /<iframe\b[^>]*>/i,
  /<object\b[^>]*>/i,
  /<embed\b[^>]*>/i,
  /<svg\b[^>]*>/i,
  /\.\.\//, // path traversal
  /\.\.\\/, // path traversal windows
  /[\x00-\x08\x0B\x0C\x0E-\x1F]/ // control characters (excluding tab, newline, carriage return)
];

let hasErrors = false;

function scanObject(obj, filePath) {
  if (typeof obj === 'string') {
    for (const pattern of maliciousPatterns) {
      if (pattern.test(obj)) {
        console.error(`Security Warning in ${filePath}: Found suspicious pattern matching ${pattern} in string: "${obj.substring(0, 50)}..."`);
        hasErrors = true;
      }
    }
  } else if (Array.isArray(obj)) {
    obj.forEach(item => scanObject(item, filePath));
  } else if (obj !== null && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      scanObject(obj[key], filePath);
    }
  }
}

try {
  const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.json'));
  files.forEach(file => {
    const filePath = path.join(contentDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    scanObject(content, file);
  });
} catch (e) {
  console.error(`Security Check Error: ${e.message}`);
  hasErrors = true;
}


// Also scan src/main.js for strict AI local requirements
try {
  const mainJsPath = path.join(process.cwd(), 'src', 'main.js');
  const mainJsContent = fs.readFileSync(mainJsPath, 'utf8');
  
  const aiPatterns = [
    { regex: /api[_-]?key/i, msg: 'API Key reference found in main.js' },
    { regex: /bearer\s+[\w-]/i, msg: 'Bearer token found in main.js' },
    { regex: /openai\.com|anthropic\.com|api\.groq|cloudflare/i, msg: 'External AI provider URL found in main.js' },
    { regex: /\.innerHTML\s*=\s*[^'"\s]/i, msg: 'Unsafe innerHTML assignment found in main.js (must only be static string clear)' },
    { regex: /\.innerHTML\s*\+=/i, msg: 'Unsafe innerHTML concatenation found in main.js' }
  ];

  for (const pattern of aiPatterns) {
    if (pattern.regex.test(mainJsContent)) {
      // Exclude safe known empty clears or safe markdown parser logic
      const matches = mainJsContent.match(new RegExp(pattern.regex, 'g')) || [];
      const unsafe = matches.filter(m => !m.includes('innerHTML = \'\'') && !m.includes('innerHTML = ""'));
      if (unsafe.length > 0) {
        console.error(`Security Warning: ${pattern.msg}`);
        hasErrors = true;
      }
    }
  }
} catch (e) {
  console.error(`Security Check Error reading main.js: ${e.message}`);
  hasErrors = true;
}

if (hasErrors) {
  console.error('Security Check Failed.');
  process.exit(1);
} else {
  console.log('Security Check Passed.');
}
