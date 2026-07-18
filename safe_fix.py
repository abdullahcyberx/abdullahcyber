import re
import os

with open('src/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Back to Top Fix
back_to_top = r'''  /* -------------------------
     Back to Top
     ------------------------- */
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();

      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu && mobileMenu.classList.contains('open') && typeof window.closeMenuMobile === 'function') {
        window.closeMenuMobile({ restoreFocus: false });
      }

      const aiPanel = document.getElementById('ai-assistant');
      if (aiPanel && aiPanel.classList.contains('open')) {
        const closeBtn = document.getElementById('ai-close') || document.querySelector('[data-ai-close]');
        if (closeBtn) closeBtn.click();
      }

      const certViewer = document.getElementById('cert-viewer');
      if (certViewer && certViewer.classList.contains('open')) {
        const certClose = document.getElementById('cert-viewer-close');
        if (certClose) certClose.click();
      }

      const modal = document.querySelector('dialog[open]');
      if (modal && typeof modal.close === 'function') {
        modal.close();
      }

      document.body.classList.remove('menu-open', 'ai-open', 'cert-viewer-open', 'modal-open');
      document.body.style.overflow = '';

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });

      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      
      document.body.setAttribute('tabindex', '-1');
      document.body.focus({ preventScroll: true });
      document.body.removeAttribute('tabindex');
    });
  }
})();'''
content = re.sub(r'/\* -+\s+Back to Top\s+-+ \*/.*?}\s*\)\(\);\s*$', back_to_top, content, flags=re.DOTALL)

# 2. Case Study Modal innerHTML Fix
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
content = re.sub(r'let detailsHtml = "";\s*if \(project\.gallery && project\.gallery\.length\) \{.*?modalFields\.details\.innerHTML = detailsHtml;', modal_fix, content, flags=re.DOTALL)

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
content = re.sub(r'let detailsHtml = "";\s*if \(project\.fullDescription\)\s*detailsHtml \+= `<h3>Description</h3><p>\$\{project\.fullDescription\}</p>`;\s*if \(project\.caseStudyContent\)\s*detailsHtml \+= `<h3>Case Study</h3><p>\$\{project\.caseStudyContent\}</p>`;\s*if \(project\.tools && project\.tools\.length\)\s*detailsHtml \+= `<h3>Tools</h3><p>\$\{project\.tools\.join\([^)]+\)\}</p>`;\s*if \(project\.date\) detailsHtml \+= `<h3>Date</h3><p>\$\{project\.date\}</p>`;\s*if \(project\.ethicalDisclaimer\)\s*detailsHtml \+= `<h3>Ethics</h3><p>\$\{project\.ethicalDisclaimer\}</p>`;\s*modalFields\.details\.innerHTML = detailsHtml;', safe_details, content, flags=re.DOTALL)

# Fix modalRoot
content = content.replace('modalRoot.innerHTML = `', 'modalRoot.insertAdjacentHTML("beforeend", `')
content = content.replace('      </dialog>\n    `;', '      </dialog>\n    `);')

# Fix temp.innerHTML in renderProgressiveText
content = content.replace('temp.innerHTML = text;', 'temp.textContent = text;')
content = content.replace('if (htmlMode) bubble.innerHTML = text;', 'if (htmlMode) renderSafeMarkdown(bubble, text);')

# 3. Fix all AI innerHTML assignments
replacements = [
    ('createMessageBubble("ai").innerHTML = challengeConfig.unavailableMessage || "Challenge currently unavailable.";', 'createMessageBubble("ai").textContent = challengeConfig.unavailableMessage || "Challenge currently unavailable.";'),
    ('createMessageBubble("ai").innerHTML = `<p><strong>${escapeHTML(challengeConfig.title || "CTF Challenge")}</strong></p><p>${escapeHTML(challengeConfig.intro || "")}</p>`;', 'renderSafeMarkdown(createMessageBubble("ai"), `**${challengeConfig.title || "CTF Challenge"}**\\n\\n${challengeConfig.intro || ""}`);'),
    ('createMessageBubble("ai").innerHTML = `<p>${escapeHTML(challengeQuestions[0].prompt)}</p>`;', 'renderSafeMarkdown(createMessageBubble("ai"), challengeQuestions[0].prompt);'),
    ('createMessageBubble("ai").innerHTML = `<p><em>Hint:</em> ${escapeHTML(qData.hint)}</p>`;', 'renderSafeMarkdown(createMessageBubble("ai"), `*Hint:* ${qData.hint}`);'),
    ('createMessageBubble("ai").innerHTML = `<p><strong>${escapeHTML(challengeConfig.successMessage || "Challenge Complete!")}</strong></p><p style="font-family: monospace; padding: 8px; background: var(--surface); border-radius: 4px;">${escapeHTML(challengeConfig.flag)}</p>`;', 'renderSafeMarkdown(createMessageBubble("ai"), `**${challengeConfig.successMessage || "Challenge Complete!"}**\\n\\n\`${challengeConfig.flag}\``);'),
    ('createMessageBubble("ai").innerHTML = `<p>Correct. Next: ${escapeHTML(challengeQuestions[state.challengeIndex].prompt)}</p>`;', 'renderSafeMarkdown(createMessageBubble("ai"), `Correct. Next: ${challengeQuestions[state.challengeIndex].prompt}`);'),
    ('createMessageBubble("ai").innerHTML = `<p>${escapeHTML(challengeConfig.incorrectMessage || "Incorrect. Try again.")}</p>`;', 'renderSafeMarkdown(createMessageBubble("ai"), challengeConfig.incorrectMessage || "Incorrect. Try again.");'),
    ('statusBubble.innerHTML = `<span style="opacity: 0.7; font-style: italic;">Searching portfolio knowledge...</span>`;', 'statusBubble.textContent = "Searching portfolio knowledge...";'),
    ('msg.innerHTML = `<p>${escapeHTML(aiConfig.scanLabels?.summary || "Scanning...")}</p>`;', 'renderSafeMarkdown(msg, aiConfig.scanLabels?.summary || "Scanning...");'),
    ('msg.innerHTML = `<p><strong>${escapeHTML(aiConfig.scanLabels?.title || "Evidence Scan Complete")}</strong></p><p>Found ${portfolioKnowledge.projects?.length || 0} projects and ${portfolioKnowledge.certificates?.length || 0} certificates.</p>`;', 'renderSafeMarkdown(msg, `**${aiConfig.scanLabels?.title || "Evidence Scan Complete"}**\\n\\nFound ${portfolioKnowledge.projects?.length || 0} projects and ${portfolioKnowledge.certificates?.length || 0} certificates.`);'),
    ('createMessageBubble("ai").innerHTML = briefHtml;', 'renderSafeMarkdown(createMessageBubble("ai"), "Muhammad Abdullah\\nCyber Security\\nEmail: abdullahcyberx@gmail.com");'),
    ('createMessageBubble("ai").innerHTML = aiConfig.privacyMessage;', 'renderSafeMarkdown(createMessageBubble("ai"), aiConfig.privacyMessage);')
]

for find, replace in replacements:
    content = content.replace(find, replace)

# The specific greeting string match
content = re.sub(r'createMessageBubble\("ai"\)\.innerHTML = aiConfig\.greeting \|\| "Hi[^"]+I\'m Shehzada\'s AI\. I can guide you through Muhammad\'s projects, skills, internships, certifications and practical cybersecurity work\. What would you like to explore\?";', 'renderSafeMarkdown(createMessageBubble("ai"), aiConfig.greeting || "Hi - I\'m Shehzada\'s AI. I can guide you through Muhammad\'s projects, skills, internships, certifications and practical cybersecurity work. What would you like to explore?");', content)

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied fixes via python!")
