import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('      </dialog>\n    ;', '      </dialog>\n    );')

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(content)
