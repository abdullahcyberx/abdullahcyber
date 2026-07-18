with open('src/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

with open('ai_engine.js', 'r', encoding='utf-8') as f:
    ai_engine = f.read()

start_marker = "  /* -------------------------\n     Shehzada's AI Assistant\n     ------------------------- */"
end_marker = "  /* -------------------------\n     Case-study Modal\n     ------------------------- */"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + ai_engine + "\n\n" + content[end_idx:]
    with open('src/main.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Injected successfully")
else:
    print("Markers not found!")
