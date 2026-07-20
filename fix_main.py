import re
import sys

with open('src/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove voice variables
content = re.sub(r'  const aiVoiceInputBtn = document.getElementById\("ai-voice-input"\);\n', '', content)
content = re.sub(r'  const aiVoiceOutputBtn = document.getElementById\("ai-voice-output"\);\n', '', content)

# 2. Add new variables
new_vars = """  const aiClearBtn = document.getElementById("ai-clear-btn");
  const aiMaximizeBtn = document.getElementById("ai-maximize-btn");
  const aiStopBtn = document.getElementById("ai-stop-btn");
  const aiCharCount = document.getElementById("ai-char-count");
  const aiJumpBtn = document.getElementById("ai-jump-to-latest");"""
content = content.replace('  const aiLiveRegion = document.getElementById("ai-live-region");', '  const aiLiveRegion = document.getElementById("ai-live-region");\n' + new_vars)

# 3. Remove sound from state
content = content.replace('    sound: false,\n', '')

# 4. Remove speakText
speak_text_regex = re.compile(r'  const speakText = \(text\) => \{.*?\};\n', re.DOTALL)
content = speak_text_regex.sub('', content)

# 5. Fix Welcome State (Greeting)
old_greeting = "Hi - I'm Shehzada's AI. I can guide you through Muhammad's projects, skills, internships, certifications and practical cybersecurity work. What would you like to explore?"
new_greeting = "**Ask about Muhammad’s work**\\n\\nExplore his cybersecurity projects, internships, technical skills, certifications and practical experience."
content = content.replace(old_greeting, new_greeting)

# 6. Remove Voice Features section
voice_features_regex = re.compile(r'  // Voice Features\n  let recognition = null;\n  const SpeechRec = window\.SpeechRecognition \|\| window\.webkitSpeechRecognition;.*?  \}\n\n  // Accessibility Focus Trap', re.DOTALL)
content = voice_features_regex.sub('  // Accessibility Focus Trap', content)

# 7. Remove voice logic from closeAi
close_ai_voice_regex = re.compile(r'    if \(\n      recognition &&\n      aiVoiceInputBtn &&\n      aiVoiceInputBtn\.getAttribute\("aria-pressed"\) === "true"\n    \) \{\n      recognition\.stop\(\);\n      aiVoiceInputBtn\.setAttribute\("aria-pressed", "false"\);\n      aiVoiceInputBtn\.setAttribute\("aria-label", "Start voice input"\);\n    \}\n    if \(window\.speechSynthesis\) window\.speechSynthesis\.cancel\(\);\n\n', re.DOTALL)
content = close_ai_voice_regex.sub('', content)

# 8. Setup Maximize logic
maximize_logic = """
  // Maximize Logic
  const toggleMaximize = () => {
    const isMax = aiPanel.classList.toggle("is-maximized");
    try {
      sessionStorage.setItem("ai-maximized", isMax ? "true" : "false");
    } catch {}
    
    const iconMax = aiMaximizeBtn.querySelector(".icon-maximize");
    const iconRes = aiMaximizeBtn.querySelector(".icon-restore");
    if (isMax) {
      aiMaximizeBtn.setAttribute("aria-label", "Restore AI assistant");
      if (iconMax) iconMax.style.display = "none";
      if (iconRes) iconRes.style.display = "block";
    } else {
      aiMaximizeBtn.setAttribute("aria-label", "Maximize AI assistant");
      if (iconMax) iconMax.style.display = "block";
      if (iconRes) iconRes.style.display = "none";
    }
    scrollMessages();
  };

  if (aiMaximizeBtn) aiMaximizeBtn.addEventListener("click", toggleMaximize);

  // Clear Logic
  if (aiClearBtn) {
    aiClearBtn.addEventListener("click", () => {
      processQuery("/clear");
    });
  }

  // Auto-resize Textarea and Char Count
  const updateTextarea = () => {
    aiInput.style.height = "auto";
    const newHeight = Math.min(aiInput.scrollHeight, 120);
    aiInput.style.height = newHeight + "px";
    
    if (aiCharCount) {
      const len = aiInput.value.length;
      aiCharCount.textContent = `${len}/500`;
      if (len >= 480) {
        aiCharCount.style.color = "var(--danger)";
      } else {
        aiCharCount.style.color = "var(--text-muted)";
      }
    }
  };

  if (aiInput) {
    aiInput.addEventListener("input", updateTextarea);
  }

  // Stop Logic
  if (aiStopBtn) {
    aiStopBtn.addEventListener("click", () => {
      if (activeResponseController) {
        activeResponseController.abort();
        setBusy(false);
        defaultActions();
        aiStopBtn.hidden = true;
        if (aiForm) aiForm.querySelector('button[type="submit"]').hidden = false;
        createMessageBubble("ai").textContent = "Response stopped.";
      }
    });
  }

  // Jump to latest logic
  let isAutoScrolling = true;
  if (aiMessages) {
    aiMessages.addEventListener("scroll", () => {
      const atBottom = aiMessages.scrollHeight - aiMessages.scrollTop - aiMessages.clientHeight < 30;
      isAutoScrolling = atBottom;
      if (aiJumpBtn) {
        aiJumpBtn.hidden = atBottom;
      }
    });
  }

  if (aiJumpBtn) {
    aiJumpBtn.addEventListener("click", () => {
      isAutoScrolling = true;
      scrollMessages();
    });
  }
"""

# Insert maximize logic before the AI opening/closing logic
trap_focus_idx = content.find("  const trapFocus = (e) => {")
content = content[:trap_focus_idx] + maximize_logic + "\n" + content[trap_focus_idx:]

# Modify setBusy to handle stop btn
set_busy_replacement = """  const setBusy = (isBusy) => {
    state.busy = isBusy;
    if (aiInput) aiInput.disabled = isBusy;
    const sendBtn = aiForm?.querySelector('button[type="submit"]');
    if (sendBtn) sendBtn.hidden = isBusy;
    if (aiStopBtn) aiStopBtn.hidden = !isBusy;
    
    if (!isBusy && aiInput && aiPanel?.classList.contains("open")) {
      setTimeout(() => {
        if (aiPanel?.classList.contains("open")) aiInput.focus();
      }, 50);
    }
  };"""
content = re.sub(r'  const setBusy = \(isBusy\) => \{.*?  \};\n', set_busy_replacement + '\n', content, flags=re.DOTALL)


# Modify scrollMessages
scroll_replacement = """  const scrollMessages = () =>
    requestAnimationFrame(() => {
      if (!aiMessages) return;
      if (isAutoScrolling) {
        aiMessages.scrollTop = aiMessages.scrollHeight;
      }
    });"""
content = content.replace("  const scrollMessages = () =>\n    requestAnimationFrame(() => {\n      if (aiMessages) aiMessages.scrollTop = aiMessages.scrollHeight;\n    });", scroll_replacement)


# Modify openAi to check sessionStorage for maximized state
open_ai_replacement = """  const openAi = (e) => {
    if (!aiPanel) return;
    lastOpenedBy = document.activeElement;
    if (e && e.currentTarget) lastOpenedBy = e.currentTarget;

    aiPanel.removeAttribute("inert");
    aiPanel.setAttribute("aria-hidden", "false");
    aiPanel.classList.add("open");
    document.body.classList.add("ai-open");

    try {
      const isMax = sessionStorage.getItem("ai-maximized") === "true";
      if (isMax && !aiPanel.classList.contains("is-maximized")) {
        toggleMaximize();
      }
    } catch {}

    isAutoScrolling = true;
    scrollMessages();

    if (aiInput) setTimeout(() => aiInput.focus(), 50);
    document.addEventListener("keydown", trapFocus);

    if (!state.greeted) {
      state.greeted = true;
      if (aiConfig.privacyMessage) {
        renderSafeMarkdown(createMessageBubble("ai"), aiConfig.privacyMessage);
      }
      renderSafeMarkdown(
        createMessageBubble("ai"),
        "**Ask about Muhammad’s work**\\n\\nExplore his cybersecurity projects, internships, technical skills, certifications and practical experience."
      );
      defaultActions();
    }
  };"""
content = re.sub(r'  const openAi = \(e\) => \{.*?  \};\n', open_ai_replacement + '\n', content, flags=re.DOTALL)


# Modify aiInput keydown logic to handle Shift+Enter
keydown_replacement = """  if (aiForm) {
    aiInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        aiForm.dispatchEvent(new Event("submit", { cancelable: true }));
      }
    });
    aiForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = aiInput.value.trim();
      if (!val || state.busy) return;
      if (val.length > 500) {
        alert("Message is too long.");
        return;
      }
      createMessageBubble("user").textContent = val;
      aiInput.value = "";
      updateTextarea();
      isAutoScrolling = true;
      scrollMessages();
      setTimeout(() => processQuery(val), 10);
    });
  }"""
content = re.sub(r'  if \(aiForm\) \{\n    aiInput\.addEventListener\("keydown", \(e\) => \{.*?\n  \}', keydown_replacement, content, flags=re.DOTALL)

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated main.js successfully.")
