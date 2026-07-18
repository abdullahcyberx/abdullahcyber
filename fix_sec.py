import sys

with open('scripts/security-check.mjs', 'r', encoding='utf-8') as f:
    content = f.read()

# I used a template literal with $ inside a python string that was itself written via powershell!
# Ah, .msg was evaluated by Powershell!
# Let me fix the file directly using Python.

