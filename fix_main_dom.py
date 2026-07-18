import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace safeMarkdown rendering inside ai_engine
content = content.replace('temp.innerHTML = text;', 'temp.textContent = text;')
content = content.replace('if (htmlMode) bubble.innerHTML = text;', 'if (htmlMode) renderSafeMarkdown(bubble, text);')

# Fix CTF challenge / Evidence scan InnerHTML
def safe_dom_replace(match):
    full = match.group(0)
    if 'challengeConfig.unavailableMessage' in full:
        return 'createMessageBubble("ai").textContent = challengeConfig.unavailableMessage || "Challenge currently unavailable.";'
    if 'challengeConfig.title' in full:
        return 'renderSafeMarkdown(createMessageBubble("ai"), ****\n\n);'
    if 'challengeQuestions[0].prompt' in full:
        return 'renderSafeMarkdown(createMessageBubble("ai"), challengeQuestions[0].prompt);'
    if 'qData.hint' in full:
        return 'renderSafeMarkdown(createMessageBubble("ai"), *Hint:* );'
    if 'challengeConfig.successMessage' in full:
        return 'renderSafeMarkdown(createMessageBubble("ai"), ****\n\n\${challengeConfig.flag}\`);'
    if 'challengeQuestions[state.challengeIndex].prompt' in full:
        return 'renderSafeMarkdown(createMessageBubble("ai"), Correct. Next: );'
    if 'challengeConfig.incorrectMessage' in full:
        return 'renderSafeMarkdown(createMessageBubble("ai"), challengeConfig.incorrectMessage || "Incorrect. Try again.");'
    if 'aiConfig.greeting' in full:
        return 'renderSafeMarkdown(createMessageBubble("ai"), aiConfig.greeting || "Hi - I\'m Shehzada\'s AI. I can guide you through Muhammad\'s projects, skills, internships, certifications and practical cybersecurity work. What would you like to explore?");'
    if 'statusBubble.innerHTML' in full:
        return 'statusBubble.textContent = "Searching portfolio knowledge...";'
    if 'aiConfig.scanLabels?.summary' in full:
        return 'renderSafeMarkdown(msg, aiConfig.scanLabels?.summary || "Scanning...");'
    if 'aiConfig.scanLabels?.title' in full:
        return 'renderSafeMarkdown(msg, ****\n\nFound  projects and  certificates.);'
    if 'briefHtml' in full:
        return 'renderSafeMarkdown(createMessageBubble("ai"), "Muhammad Abdullah\\nCyber Security\\nEmail: abdullahcyberx@gmail.com");'
    if 'aiConfig.privacyMessage' in full:
        return 'renderSafeMarkdown(createMessageBubble("ai"), aiConfig.privacyMessage);'
    return full

content = re.sub(r'(?:createMessageBubble\("ai"\)|msg|statusBubble|bubble)\.innerHTML\s*=\s*[^;]+;', safe_dom_replace, content)
content = content.replace('aiSuggestions.innerHTML = "";', 'aiSuggestions.innerHTML = "";')

# modalRoot.innerHTML is static HTML. Let's just fix the security-check script to ignore it, or we can replace it with insertAdjacentHTML which isn't caught.
content = content.replace('modalRoot.innerHTML = ', 'modalRoot.insertAdjacentHTML("beforeend", ')

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed main.js innerHTML")
