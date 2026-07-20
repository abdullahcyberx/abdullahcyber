import re

with open('src/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# 1. Update .ai-header and sub-elements
ai_header_regex = re.compile(r'\.ai-header \{[\s\S]*?\}')
ai_header_replacement = """\
.ai-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  gap: 16px;
}

.ai-header-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ai-subtitle {
  font-size: 0.75rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}

.ai-status-indicator {
  width: 6px;
  height: 6px;
  background: var(--success);
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 4px var(--success);
}

.ai-header-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.ai-header-btn {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-secondary);
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 160ms var(--ease);
}

.ai-header-btn:hover,
.ai-header-btn:focus-visible {
  background: var(--surface-hover);
  color: var(--text);
  border-color: var(--border-strong);
}
"""
css = ai_header_regex.sub(ai_header_replacement, css)

# 2. Update .ai-close -> remove old .ai-close definition and hover since it's now handled by .ai-header-btn
css = re.sub(r'\.ai-close \{[\s\S]*?\}\n\n', '', css)
css = re.sub(r'\.ai-close:hover \{[\s\S]*?\}\n\n', '', css)

# 3. Add .ai-scroll-container, .ai-jump-to-latest and modify .ai-messages
ai_messages_regex = re.compile(r'\.ai-messages \{[\s\S]*?\}')
ai_messages_replacement = """\
.ai-scroll-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.ai-messages {
  padding: 16px 20px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scroll-behavior: smooth;
}

.ai-messages > * {
  max-width: 1050px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
}

.ai-jump-to-latest {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--surface-light);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 6px 14px;
  border-radius: 100px;
  font-size: 0.75rem;
  font-family: var(--font);
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  transition: all 160ms var(--ease);
}

.ai-jump-to-latest:hover,
.ai-jump-to-latest:focus-visible {
  border-color: var(--accent);
  color: var(--accent-light);
}

.ai-jump-to-latest[hidden] {
  display: none;
}
"""
css = ai_messages_regex.sub(ai_messages_replacement, css)

# 4. Modify .ai-message styles
css = re.sub(r'\.ai-message \{[\s\S]*?\}', """\
.ai-message {
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.9375rem;
  line-height: 1.6;
  max-width: 80%;
  word-break: break-word;
}
""", css)

css = re.sub(r'\.ai-ai \{[\s\S]*?\}', """\
.ai-ai {
  background: var(--surface-light);
  border: 1px solid var(--border);
  align-self: flex-start;
  color: var(--text);
}
""", css)

css = re.sub(r'\.ai-user \{[\s\S]*?\}', """\
.ai-user {
  background: var(--accent-soft);
  border: 1px solid rgba(129, 103, 255, 0.2);
  color: var(--accent-light);
  align-self: flex-end;
}
""", css)

# 5. Modify .ai-input-area and textarea
ai_input_area_input_regex = re.compile(r'\.ai-input-area input \{[\s\S]*?\}')
css = ai_input_area_input_regex.sub('', css)
ai_input_area_input_focus_regex = re.compile(r'\.ai-input-area input:focus \{[\s\S]*?\}')
css = ai_input_area_input_focus_regex.sub('', css)
ai_input_area_input_placeholder_regex = re.compile(r'\.ai-input-area input::placeholder \{[\s\S]*?\}')
css = ai_input_area_input_placeholder_regex.sub('', css)

ai_input_area_regex = re.compile(r'\.ai-input-area \{[\s\S]*?\}')
ai_input_area_replacement = """\
.ai-input-area {
  padding: 16px 20px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ai-input-area > * {
  max-width: 1050px;
  width: 100%;
}
"""
css = ai_input_area_regex.sub(ai_input_area_replacement, css)

textarea_css = """
.ai-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
}

.ai-input-wrapper textarea {
  width: 100%;
  padding: 10px 14px;
  padding-bottom: 24px;
  background: var(--bg);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 8px;
  font-family: var(--font);
  font-size: 0.9375rem;
  line-height: 1.5;
  resize: none;
  min-height: 44px;
  max-height: 120px;
  transition: border-color 160ms var(--ease);
}

.ai-input-wrapper textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.ai-input-wrapper textarea::placeholder {
  color: var(--text-muted);
}

.ai-char-count {
  position: absolute;
  bottom: 6px;
  right: 12px;
  font-size: 0.6875rem;
  color: var(--text-muted);
  pointer-events: none;
}
"""
# insert textarea_css after .ai-input-area form
css = css.replace('.ai-input-area form {\n  display: flex;\n  gap: 8px;\n  align-items: center;\n}', '.ai-input-area form {\n  display: flex;\n  gap: 12px;\n  align-items: flex-end;\n}\n' + textarea_css)


# 6. Maximize state CSS
maximize_css = """
.ai-assistant.is-maximized {
  top: 50%;
  left: 50%;
  bottom: auto;
  right: auto;
  width: min(96vw, 1500px);
  height: min(96dvh, 1200px);
  max-width: none;
  max-height: none;
  transform: translate(-50%, -50%) scale(1);
  border-radius: 16px;
}

.ai-assistant.is-maximized:not(.open) {
  transform: translate(-50%, -50%) scale(0.98);
}
"""
# insert before @media (max-width: 768px)
css = css.replace('@media (max-width: 768px) {', maximize_css + '\n@media (max-width: 768px) {')


# 7. Mobile updates
mobile_ai_regex = re.compile(r'  \.ai-assistant \{\s*bottom: 84px;\s*right: 16px;\s*left: 16px;\s*width: auto;\s*max-width: none;\s*max-height: calc\(100dvh - 120px - env\(safe-area-inset-top\)\);\s*\}')
mobile_ai_replacement = """  .ai-assistant,
  .ai-assistant.is-maximized {
    bottom: 0;
    right: 0;
    left: 0;
    top: auto;
    width: 100vw;
    height: 100dvh;
    max-width: none;
    max-height: none;
    border-radius: 0;
    transform: translateY(16px);
  }

  .ai-assistant.open,
  .ai-assistant.is-maximized.open {
    transform: translateY(0);
  }
  
  #ai-maximize-btn {
    display: none;
  }
  
  .ai-message {
    max-width: 92%;
  }
"""
css = mobile_ai_regex.sub(mobile_ai_replacement, css)


# Save
with open('src/style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Updated style.css successfully.")
