import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

match = re.search(r'/\* -+\s+Shehzada\'s AI Assistant\s+-+ \*/.*?/\* -+\s+Case-study Modal\s+-+ \*/', content, flags=re.DOTALL)
print("Matched:" if match else "Not matched")
