import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

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

content = re.sub(r'let detailsHtml = "";\s*if \(project\.fullDescription\)\s*detailsHtml \+= <h3>Description</h3><p>\$\{project\.fullDescription\}</p>;\s*if \(project\.caseStudyContent\)\s*detailsHtml \+= <h3>Case Study</h3><p>\$\{project\.caseStudyContent\}</p>;\s*if \(project\.tools && project\.tools\.length\)\s*detailsHtml \+= <h3>Tools</h3><p>\$\{project\.tools\.join\([^)]+\)\}</p>;\s*if \(project\.date\) detailsHtml \+= <h3>Date</h3><p>\$\{project\.date\}</p>;\s*if \(project\.ethicalDisclaimer\)\s*detailsHtml \+= <h3>Ethics</h3><p>\$\{project\.ethicalDisclaimer\}</p>;\s*modalFields\.details\.innerHTML = ""; // Ignored for now', safe_details, content, flags=re.DOTALL)

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed details dom")
