import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

with open('ai_engine.js', 'r', encoding='utf-8') as f:
    ai_engine = f.read()

# using lambda avoids escape character interpretation in replacement string
content = re.sub(r'/\* -+\s+Shehzada\'s AI Assistant\s+-+ \*/.*?/\* -+\s+Case-study Modal\s+-+ \*/', lambda m: ai_engine + '\n\n  /* -------------------------\n     Case-study Modal\n     ------------------------- */', content, flags=re.DOTALL)

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Injected ai_engine via lambda")
