import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

func = """const aiDataElement = document.getElementById("ai-data");
  const renderSafeMarkdown = (el, str) => {
    if (!str) return;
    const parts = str.split(/(\\*\\*.*?\\*\\*|`.*?`|\\n\\n)/g);
    parts.forEach(p => {
      if (p === "\\n\\n") {
        el.appendChild(document.createElement("br"));
        el.appendChild(document.createElement("br"));
      } else if (p.startsWith("**") && p.endsWith("**")) {
        const strong = document.createElement("strong");
        strong.textContent = p.slice(2, -2);
        el.appendChild(strong);
      } else if (p.startsWith("`") && p.endsWith("`")) {
        const code = document.createElement("code");
        code.textContent = p.slice(1, -1);
        el.appendChild(code);
      } else if (p) {
        el.appendChild(document.createTextNode(p));
      }
    });
  };
"""

content = content.replace('const aiDataElement = document.getElementById("ai-data");', func)

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done!")
