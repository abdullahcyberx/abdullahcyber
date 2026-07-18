with open('scripts/security-check.mjs', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("console.error(Security Warning: );", "console.error(Security Warning: );")
content = content.replace("console.error(Security Check Error reading main.js: );", "console.error(Security Check Error reading main.js: );")

with open('scripts/security-check.mjs', 'w', encoding='utf-8') as f:
    f.write(content)
