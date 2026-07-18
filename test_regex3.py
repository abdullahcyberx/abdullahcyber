import re
with open('src/main.js', 'r', encoding='utf-8') as f:
    c = f.read()

for match in re.finditer(r'.{0,30}\.innerHTML\s*=\s*[^;]+;', c):
    print(match.group(0))
