import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

target = """  const displayRecruiterBriefing = () => {
    const briefHtml = `<p><strong>${escapeHTML(aiConfig.recruiterBriefingLabels?.title || "Recruiter Briefing")}</strong></p>
      <div style="white-space: pre-wrap; font-size: 0.9em;">${escapeHTML(recruiterBriefingText)}</div>
      <div style="margin-top: 8px;">
        <button type="button" class="ai-chip" data-ai-special="copy-brief">Copy summary</button>
        <span id="copy-status" style="font-size: 0.8em; color: var(--text-muted); margin-left: 8px; display: none;">Copied!</span>
      </div>`;
    renderSafeMarkdown(createMessageBubble("ai"), "Muhammad Abdullah\\nCyber Security\\nEmail: abdullahcyberx@gmail.com");
    defaultActions();
  };"""

replacement = """  const displayRecruiterBriefing = () => {
    const msg = createMessageBubble("ai");
    
    const titleP = document.createElement("p");
    const titleStrong = document.createElement("strong");
    titleStrong.textContent = aiConfig.recruiterBriefingLabels?.title || "Recruiter Briefing";
    titleP.appendChild(titleStrong);
    msg.appendChild(titleP);
    
    const textDiv = document.createElement("div");
    textDiv.style.whiteSpace = "pre-wrap";
    textDiv.style.fontSize = "0.9em";
    textDiv.textContent = recruiterBriefingText;
    msg.appendChild(textDiv);
    
    const actionsDiv = document.createElement("div");
    actionsDiv.style.marginTop = "8px";
    
    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "ai-chip";
    copyBtn.setAttribute("data-ai-special", "copy-brief");
    copyBtn.textContent = "Copy summary";
    actionsDiv.appendChild(copyBtn);
    
    const copyStatus = document.createElement("span");
    copyStatus.id = "copy-status";
    copyStatus.style.fontSize = "0.8em";
    copyStatus.style.color = "var(--text-muted)";
    copyStatus.style.marginLeft = "8px";
    copyStatus.style.display = "none";
    copyStatus.textContent = "Copied!";
    actionsDiv.appendChild(copyStatus);
    
    msg.appendChild(actionsDiv);
    
    defaultActions();
  };"""

if target in content:
    content = content.replace(target, replacement)
    print("Found exact target string, applying fix...")
else:
    print("Exact target not found, trying regex...")
    # Use regex to find it, since whitespace might differ
    pattern = re.compile(r'const displayRecruiterBriefing = \(\) => \{.*?renderSafeMarkdown\(createMessageBubble\("ai"\), "Muhammad Abdullah\\nCyber Security\\nEmail: abdullahcyberx@gmail.com"\);\s*defaultActions\(\);\s*\};', re.DOTALL)
    if pattern.search(content):
        content = pattern.sub(replacement, content)
        print("Regex found and replaced.")
    else:
        print("Regex failed to find target block.")

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(content)
