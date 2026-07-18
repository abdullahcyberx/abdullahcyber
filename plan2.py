import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('aiMessages.innerHTML = "";', 'aiMessages.innerHTML = "";') # this is safe
content = content.replace('aiSuggestions.innerHTML = "";', 'aiSuggestions.innerHTML = "";') # this is safe

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(content)
