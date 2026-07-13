import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'src', 'index.template.html');
let content = fs.readFileSync(file, 'utf8');

// Replace About text
content = content.replace(
  /<div class="about-copy reveal">[\s\S]*?<\/div>/,
  '<div class="about-copy reveal">\n          {{ profile.aboutText }}\n        </div>'
);

// Replace About Links
content = content.replace(
  /<a href="assets\/Muhammad-Abdullah-CV.pdf" target="_blank">View full résumé <span>↗<\/span><\/a>/,
  '<a href="{{ profile.cvPath }}" target="_blank">View full résumé <span>↗</span></a>'
);

// Replace Experience timeline
content = content.replace(
  /<div class="timeline">[\s\S]*?<\/div>\s*<\/section>/,
  '<div class="timeline">\n        <!-- TEMPLATE: EXPERIENCE -->\n      </div>\n    </section>'
);

// Replace Skills keyboard
content = content.replace(
  /<div class="keyboard-board" id="keyboard-board"[^>]*>[\s\S]*?<\/div>\s*<\/div>/,
  '<div class="keyboard-board" id="keyboard-board" role="list" aria-label="Interactive cybersecurity skills keyboard">\n            <!-- TEMPLATE: SKILLS -->\n          </div>\n        </div>'
);

// Replace Projects grid
content = content.replace(
  /<div class="project-grid">[\s\S]*?<\/div>\s*<p class="ethical-scope/,
  '<div class="project-grid">\n        <!-- TEMPLATE: PROJECTS -->\n      </div>\n      <p class="ethical-scope'
);

// Replace ethical scope
content = content.replace(
  /<p class="ethical-scope reveal" id="ethical-scope">.*?<\/p>/,
  '<p class="ethical-scope reveal" id="ethical-scope"><strong>Ethical scope:</strong> {{ profile.ethicalDisclaimer }}</p>'
);

// Replace Credentials list
content = content.replace(
  /<div class="cert-list">[\s\S]*?<\/div>\s*<details class="supporting-certificates reveal">/,
  '<div class="cert-list">\n            <!-- TEMPLATE: FEATURED_CERTIFICATES -->\n          </div>\n\n          <details class="supporting-certificates reveal">'
);

// Replace Supporting Credentials
content = content.replace(
  /<div class="supporting-grid">[\s\S]*?<\/div>\s*<\/details>/,
  '<div class="supporting-grid">\n              <!-- TEMPLATE: SUPPORTING_CERTIFICATES -->\n            </div>\n          </details>'
);

// Replace Achievements
content = content.replace(
  /<div id="achievements" class="achievement-orbit reveal">[\s\S]*?<\/div>\s*<\/div>/,
  '<div id="achievements" class="achievement-orbit reveal">\n          <!-- TEMPLATE: ACHIEVEMENTS -->\n        </div>\n      </div>'
);

// Replace Education
content = content.replace(
  /<div class="education-main reveal">[\s\S]*?<\/div>/,
  '<div class="education-main reveal">\n          <!-- TEMPLATE: EDUCATION -->\n        </div>'
);

// Add AI Script Block
if (!content.includes('<script type="application/json" id="ai-data">')) {
  content = content.replace(
    '</head>',
    '  <script type="application/json" id="ai-data">\n    <!-- TEMPLATE: AI_PAYLOAD -->\n  </script>\n</head>'
  );
}

// Replace contact links
content = content.replace(
  /<a class="email-link" href="mailto:.*?>.*?<\/a>/,
  '<a class="email-link" href="mailto:{{ profile.email }}">{{ profile.email }} <span>↗</span></a>'
);

// Replace meta tags and SEO
content = content.replace(
  /<title>.*?<\/title>/,
  '<title>{{ seo.title }}</title>'
);
content = content.replace(
  /<meta name="description" content=".*?" \/>/,
  '<meta name="description" content="{{ seo.description }}" />'
);
content = content.replace(
  /<meta name="keywords" content=".*?" \/>/,
  '<meta name="keywords" content="{{ seo.keywords }}" />'
);
content = content.replace(
  /<meta property="og:title" content=".*?" \/>/,
  '<meta property="og:title" content="{{ seo.openGraph.title }}" />'
);
content = content.replace(
  /<meta property="og:description" content=".*?" \/>/,
  '<meta property="og:description" content="{{ seo.openGraph.description }}" />'
);
content = content.replace(
  /<meta name="twitter:title" content=".*?" \/>/,
  '<meta name="twitter:title" content="{{ seo.twitter.title }}" />'
);
content = content.replace(
  /<meta name="twitter:description" content=".*?" \/>/,
  '<meta name="twitter:description" content="{{ seo.twitter.description }}" />'
);
content = content.replace(
  /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
  '<!-- TEMPLATE: SCHEMA_ORG -->'
);

// Orbit AI branding removal inside HTML template (there might be Orbit AI references)
content = content.replace(/Orbit\s?AI/gi, 'Shehzada’s AI');

fs.writeFileSync(file, content);
console.log('Template modified.');
