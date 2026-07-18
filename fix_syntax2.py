import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'      </dialog>\s+;', r'      </dialog>\n    );', content)

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(content)
