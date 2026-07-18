import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

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
content = re.sub(r'let detailsHtml = "";\s*if \(project\.gallery && project\.gallery\.length\) \{.*?modalFields\.details\.innerHTML = detailsHtml;', modal_fix, content, flags=re.DOTALL)

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed Case Study Modal innerHTML")
