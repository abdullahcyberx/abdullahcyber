with open('scripts/security-check.mjs', 'r', encoding='utf-8') as f:
    content = f.read()

import re

safe_patterns = r'''const aiPatterns = [
    { regex: /api[_-]?key/i, msg: 'API Key reference found in main.js' },
    { regex: /bearer\s+[\w-]/i, msg: 'Bearer token found in main.js' },
    { regex: /openai\.com|anthropic\.com|api\.groq|cloudflare/i, msg: 'External AI provider URL found in main.js' },
    { regex: /\.innerHTML\s*=\s*[^'"\s]/i, msg: 'Unsafe innerHTML assignment found in main.js (must only be static string clear)' },
    { regex: /\.innerHTML\s*\+=/i, msg: 'Unsafe innerHTML concatenation found in main.js' }
  ];'''

content = re.sub(r'const aiPatterns = \[.*?\];', lambda m: safe_patterns, content, flags=re.DOTALL)

with open('scripts/security-check.mjs', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed security-check.mjs regexes properly")
