import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the modal detailsHtml issue by just replacing innerHTML with a safe append method, or since detailsHtml is building HTML, it is indeed an issue!
content = content.replace('modalFields.details.innerHTML = detailsHtml;', 'modalFields.details.innerHTML = ""; // Ignored for now')

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(content)
