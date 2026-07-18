import sys
import re

with open('scripts/security-check.mjs', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'console\.error\(Security Warning: \);', 'console.error(Security Warning: );', content)
content = re.sub(r'console\.error\(Security Check Error reading main\.js: \);', 'console.error(Security Check Error reading main.js: );', content)

with open('scripts/security-check.mjs', 'w', encoding='utf-8') as f:
    f.write(content)
