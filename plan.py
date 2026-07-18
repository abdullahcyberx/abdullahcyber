import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix modalRoot.innerHTML
content = content.replace('modalRoot.innerHTML = ', 'modalRoot.innerHTML = ') # Actually it's static HTML, so I can just change it to use a safe method or ignore it.
# Actually, the security check fails on innerHTML. Let's just fix the security check to explicitly allow modalRoot.innerHTML since it's hardcoded HTML, or rewrite it.
# Let's just rewrite the regex in security-check.mjs to only fail if innerHTML is used on a bubble or something? No, user explicitly said "detect: unsafe response rendering". The regex I added is fine, I just need to remove all innerHTML in main.js.

