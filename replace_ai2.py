import re

with open('main_scratch.js', 'r', encoding='utf-8') as f:
    main_js = f.read()

with open('ai_logic.js', 'r', encoding='utf-8') as f:
    ai_logic = f.read()

start_idx = main_js.find("/* -------------------------\n     Shehzada's AI")
end_idx = main_js.find("/* -------------------------\n     Certificates - Lazy Load")

if start_idx != -1 and end_idx != -1:
    new_main = main_js[:start_idx] + ai_logic + "\n  " + main_js[end_idx:]
    with open('src/main.js', 'w', encoding='utf-8') as f:
        f.write(new_main)
    print("Successfully replaced AI engine directly.")
else:
    print(f"Could not find markers. start: {start_idx}, end: {end_idx}")

