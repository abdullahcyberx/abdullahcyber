with open('src/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

import re

# \1 in python's re.sub is interpreted as group 1!
# My python script returned enderSafeMarkdown(msg, \**\**\n\nFound \ projects and \ certificates.\);
# Because \1 was missing? No, I returned **** and because it was in e.sub(..., safe_dom_replace, ...), wait, safe_dom_replace returns a string.

# I will just restore the file from my main_copy.js and run a safer python script.
