import re
with open('src/main.js', 'r', encoding='utf-8') as f:
    c = f.read()
print(re.findall(r'\.innerHTML\s*=\s*(?![\'"]|""|\'\')', c))
