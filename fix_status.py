import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('statusBubble.textContent = "Searching portfolio knowledge..."; font-style: italic;">Searching portfolio knowledge...</span>;', 'statusBubble.textContent = "Searching portfolio knowledge...";')

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed messed up status bubble")
