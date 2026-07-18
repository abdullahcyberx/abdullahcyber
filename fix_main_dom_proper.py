with open('src/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace safeMarkdown rendering inside ai_engine
content = content.replace('temp.innerHTML = text;', 'temp.textContent = text;')
content = content.replace('if (htmlMode) bubble.innerHTML = text;', 'if (htmlMode) renderSafeMarkdown(bubble, text);')

# Fix Case-study Modal innerHTML
modal_fix = r'''
      if (project.gallery && project.gallery.length) {
        const h3 = document.createElement('h3');
        h3.textContent = 'Gallery';
        modalFields.details.appendChild(h3);
        const galDiv = document.createElement('div');
        galDiv.className = 'modal-gallery';
        project.gallery.forEach(img => {
          const mImg = document.createElement('img');
          mImg.src = img.url;
          mImg.alt = img.caption || '';
          galDiv.appendChild(mImg);
        });
        modalFields.details.appendChild(galDiv);
      }
      
      if (project.ethicalDisclaimer) {
        const h3 = document.createElement('h3');
        h3.textContent = 'Ethics';
        modalFields.details.appendChild(h3);
        const p = document.createElement('p');
        p.textContent = project.ethicalDisclaimer;
        modalFields.details.appendChild(p);
      }
'''
import re
content = re.sub(r'let detailsHtml = "";\s*if \(project\.gallery && project\.gallery\.length\) \{.*?modalFields\.details\.innerHTML = detailsHtml;', modal_fix, content, flags=re.DOTALL)

# Fix the remaining detailsHtml block
safe_details = r'''
        if (modalFields.details) {
          modalFields.details.innerHTML = "";
          
          const addSection = (title, text) => {
            const h = document.createElement("h3");
            h.textContent = title;
            const p = document.createElement("p");
            p.textContent = text;
            modalFields.details.appendChild(h);
            modalFields.details.appendChild(p);
          };

          if (project.fullDescription) addSection("Description", project.fullDescription);
          if (project.caseStudyContent) addSection("Case Study", project.caseStudyContent);
          if (project.tools && project.tools.length) addSection("Tools", project.tools.join(", "));
          if (project.date) addSection("Date", project.date);
          if (project.ethicalDisclaimer) addSection("Ethics", project.ethicalDisclaimer);
        }
'''
content = re.sub(r'let detailsHtml = "";\s*if \(project\.fullDescription\)\s*detailsHtml \+= <h3>Description</h3><p>\$\{project\.fullDescription\}</p>;\s*if \(project\.caseStudyContent\)\s*detailsHtml \+= <h3>Case Study</h3><p>\$\{project\.caseStudyContent\}</p>;\s*if \(project\.tools && project\.tools\.length\)\s*detailsHtml \+= <h3>Tools</h3><p>\$\{project\.tools\.join\([^)]+\)\}</p>;\s*if \(project\.date\) detailsHtml \+= <h3>Date</h3><p>\$\{project\.date\}</p>;\s*if \(project\.ethicalDisclaimer\)\s*detailsHtml \+= <h3>Ethics</h3><p>\$\{project\.ethicalDisclaimer\}</p>;\s*modalFields\.details\.innerHTML = detailsHtml;', safe_details, content, flags=re.DOTALL)

# Safely replace innerHTML with textContent or renderSafeMarkdown without using re.sub with a lambda returning escapes
content = content.replace('createMessageBubble("ai").innerHTML = challengeConfig.unavailableMessage || "Challenge currently unavailable.";', 'createMessageBubble("ai").textContent = challengeConfig.unavailableMessage || "Challenge currently unavailable.";')

content = content.replace('createMessageBubble("ai").innerHTML = <p><strong></strong></p><p></p>;', 'renderSafeMarkdown(createMessageBubble("ai"), ****\\n\\n);')

content = content.replace('createMessageBubble("ai").innerHTML = <p></p>;', 'renderSafeMarkdown(createMessageBubble("ai"), challengeQuestions[0].prompt);')

content = content.replace('createMessageBubble("ai").innerHTML = <p><em>Hint:</em> </p>;', 'renderSafeMarkdown(createMessageBubble("ai"), *Hint:* );')

content = content.replace('createMessageBubble("ai").innerHTML = <p><strong></strong></p><p style="font-family: monospace; padding: 8px; background: var(--surface); border-radius: 4px;"></p>;', 'renderSafeMarkdown(createMessageBubble("ai"), ****\\n\\n\${challengeConfig.flag}\`);')

content = content.replace('createMessageBubble("ai").innerHTML = <p>Correct. Next: </p>;', 'renderSafeMarkdown(createMessageBubble("ai"), Correct. Next: );')

content = content.replace('createMessageBubble("ai").innerHTML = <p></p>;', 'renderSafeMarkdown(createMessageBubble("ai"), challengeConfig.incorrectMessage || "Incorrect. Try again.");')

content = content.replace('statusBubble.innerHTML = <span style="opacity: 0.7; font-style: italic;">Searching portfolio knowledge...</span>;', 'statusBubble.textContent = "Searching portfolio knowledge...";')

content = content.replace('msg.innerHTML = <p></p>;', 'renderSafeMarkdown(msg, aiConfig.scanLabels?.summary || "Scanning...");')

content = content.replace('msg.innerHTML = <p><strong></strong></p><p>Found  projects and  certificates.</p>;', 'renderSafeMarkdown(msg, ****\\n\\nFound  projects and  certificates.);')

content = content.replace('createMessageBubble("ai").innerHTML = briefHtml;', 'renderSafeMarkdown(createMessageBubble("ai"), "Muhammad Abdullah\\nCyber Security\\nEmail: abdullahcyberx@gmail.com");')

content = content.replace('createMessageBubble("ai").innerHTML = aiConfig.privacyMessage;', 'renderSafeMarkdown(createMessageBubble("ai"), aiConfig.privacyMessage);')

# There are two of these:
content = content.replace('createMessageBubble("ai").innerHTML = aiConfig.greeting || "Hi — I\'m Shehzada\'s AI. I can guide you through Muhammad\'s projects, skills, internships, certifications and practical cybersecurity work. What would you like to explore?";', 'renderSafeMarkdown(createMessageBubble("ai"), aiConfig.greeting || "Hi - I\'m Shehzada\'s AI. I can guide you through Muhammad\'s projects, skills, internships, certifications and practical cybersecurity work. What would you like to explore?");')

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed main.js innerHTML properly")
