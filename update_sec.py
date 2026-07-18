import sys

with open('scripts/security-check.mjs', 'r', encoding='utf-8') as f:
    content = f.read()

new_checks = r'''
// Also scan src/main.js for strict AI local requirements
try {
  const mainJsPath = path.join(process.cwd(), 'src', 'main.js');
  const mainJsContent = fs.readFileSync(mainJsPath, 'utf8');
  
  const aiPatterns = [
    { regex: /api[_-]?key/i, msg: 'API Key reference found in main.js' },
    { regex: /bearer\s+[\w-]/i, msg: 'Bearer token found in main.js' },
    { regex: /openai\.com|anthropic\.com|api\.groq|cloudflare/i, msg: 'External AI provider URL found in main.js' },
    { regex: /\.innerHTML\s*=\s*(?!['"]|''|"")/i, msg: 'Unsafe innerHTML assignment found in main.js (must only be static string clear)' },
    { regex: /innerHTML\s*\+?=\s*[^"']/i, msg: 'Unsafe innerHTML concatenation found in main.js' }
  ];

  for (const pattern of aiPatterns) {
    if (pattern.regex.test(mainJsContent)) {
      // Exclude safe known empty clears or safe markdown parser logic
      const matches = mainJsContent.match(new RegExp(pattern.regex, 'g')) || [];
      const unsafe = matches.filter(m => !m.includes('innerHTML = \'\'') && !m.includes('innerHTML = ""'));
      if (unsafe.length > 0) {
        console.error(Security Warning: );
        hasErrors = true;
      }
    }
  }
} catch (e) {
  console.error(Security Check Error reading main.js: );
  hasErrors = true;
}
'''

content = content.replace("if (hasErrors) {", new_checks + "\nif (hasErrors) {")

with open('scripts/security-check.mjs', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated security-check.mjs")
