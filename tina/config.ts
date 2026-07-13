import { defineConfig } from 'tinacms';

const branch =
  process.env.NEXT_PUBLIC_TINA_BRANCH ||
  process.env.GITHUB_BRANCH ||
  process.env.CF_PAGES_BRANCH ||
  process.env.HEAD ||
  'main';

const textArea = { component: 'textarea' } as const;

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: 'uploads',
      publicFolder: 'public',
      static: false,
    },
    // Deliberately excludes SVG/HTML to reduce stored-XSS risk from untrusted uploads.
    accept: ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/avif'],
  },
  schema: {
    collections: [
      {
        name: 'settings',
        label: 'Site Settings',
        path: 'content/settings',
        format: 'json',
        match: { include: 'site' },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: 'string', name: 'siteName', label: 'Site name', required: true, isTitle: true },
          { type: 'string', name: 'domain', label: 'Canonical domain', required: true },
          { type: 'string', name: 'brandText', label: 'Brand text', required: true },
          {
            type: 'object', name: 'profile', label: 'Profile', required: true,
            fields: [
              { type: 'string', name: 'name', label: 'Full name', required: true },
              { type: 'string', name: 'alternateName', label: 'Public brand name', required: true },
              { type: 'string', name: 'jobTitle', label: 'Primary job title', required: true },
              { type: 'string', name: 'location', label: 'Location', required: true },
              { type: 'string', name: 'email', label: 'Public email', required: true },
              { type: 'string', name: 'github', label: 'GitHub URL', required: true },
              { type: 'string', name: 'linkedin', label: 'LinkedIn URL', required: true },
              { type: 'image', name: 'cv', label: 'CV PDF', required: true },
            ],
          },
          {
            type: 'object', name: 'hero', label: 'Hero section', required: true,
            fields: [
              { type: 'string', name: 'status', label: 'Availability status', required: true },
              { type: 'string', name: 'eyebrow', label: 'Hero eyebrow', required: true },
              { type: 'string', name: 'firstName', label: 'First-name line', required: true },
              { type: 'string', name: 'lastName', label: 'Highlighted surname', required: true },
              { type: 'string', name: 'roles', label: 'Rotating roles', list: true, required: true },
              { type: 'string', name: 'description', label: 'Hero description', required: true, ui: textArea },
              { type: 'string', name: 'primaryButton', label: 'Primary button label', required: true },
              { type: 'string', name: 'secondaryButton', label: 'Secondary button label', required: true },
            ],
          },
          {
            type: 'object', name: 'about', label: 'About section', required: true,
            fields: [
              { type: 'string', name: 'eyebrow', label: 'Eyebrow', required: true },
              { type: 'string', name: 'headingLine1', label: 'Heading first line', required: true },
              { type: 'string', name: 'headingHighlight', label: 'Heading highlight', required: true },
              { type: 'string', name: 'lead', label: 'Lead paragraph', required: true, ui: textArea },
              { type: 'string', name: 'paragraphs', label: 'Additional paragraphs', list: true, required: true, ui: textArea },
              { type: 'string', name: 'quote', label: 'Quote', required: true, ui: textArea },
              { type: 'string', name: 'focus', label: 'Focus', required: true },
              { type: 'string', name: 'approach', label: 'Approach', required: true },
              { type: 'string', name: 'educationShort', label: 'Education short label', required: true },
              { type: 'string', name: 'contextTitle', label: 'Pakistan/Riphah context title', required: true },
              { type: 'string', name: 'contextText', label: 'Pakistan/Riphah context text', required: true, ui: textArea },
            ],
          },
          {
            type: 'object', name: 'contact', label: 'Contact section', required: true,
            fields: [
              { type: 'string', name: 'eyebrow', label: 'Eyebrow', required: true },
              { type: 'string', name: 'headingLine1', label: 'Heading first line', required: true },
              { type: 'string', name: 'headingHighlight', label: 'Heading highlight', required: true },
              { type: 'string', name: 'description', label: 'Description', required: true, ui: textArea },
              { type: 'string', name: 'formNote', label: 'Form privacy note', required: true },
            ],
          },
          {
            type: 'object', name: 'footer', label: 'Footer', required: true,
            fields: [{ type: 'string', name: 'tagline', label: 'Tagline', required: true, ui: textArea }],
          },
          {
            type: 'object', name: 'seo', label: 'SEO', required: true,
            fields: [
              { type: 'string', name: 'title', label: 'SEO title', required: true },
              { type: 'string', name: 'description', label: 'Meta description', required: true, ui: textArea },
              { type: 'string', name: 'keywords', label: 'Keywords', list: true },
              { type: 'string', name: 'ogTitle', label: 'Social title', required: true },
              { type: 'string', name: 'ogDescription', label: 'Social description', required: true, ui: textArea },
              { type: 'image', name: 'ogImage', label: 'Social sharing image', required: true },
            ],
          },
          {
            type: 'object', name: 'security', label: 'Access denied page', required: true,
            fields: [{ type: 'string', name: 'denialMessage', label: 'Denied message', required: true }],
          },
        ],
      },
      {
        name: 'experience', label: 'Experience', path: 'content/experience', format: 'json',
        fields: [
          { type: 'string', name: 'title', label: 'Role', required: true, isTitle: true },
          { type: 'string', name: 'organization', label: 'Organization', required: true },
          { type: 'string', name: 'location', label: 'Location / work mode', required: true },
          { type: 'string', name: 'period', label: 'Display period', required: true },
          { type: 'string', name: 'type', label: 'Badge', required: true },
          { type: 'boolean', name: 'current', label: 'Current role' },
          { type: 'number', name: 'order', label: 'Display order', required: true },
          { type: 'string', name: 'description', label: 'Description', required: true, ui: textArea },
          { type: 'string', name: 'skills', label: 'Tags', list: true },
        ],
      },
      {
        name: 'skill', label: 'Skills Keyboard', path: 'content/skills', format: 'json',
        fields: [
          { type: 'string', name: 'title', label: 'Skill name', required: true, isTitle: true },
          { type: 'string', name: 'key', label: 'Unique key (lowercase)', required: true },
          { type: 'string', name: 'keyLabel', label: 'Keyboard label', required: true },
          { type: 'string', name: 'index', label: 'Category / index', required: true },
          { type: 'string', name: 'description', label: 'Description', required: true, ui: textArea },
          { type: 'string', name: 'levelLabel', label: 'Level label', required: true },
          { type: 'number', name: 'percent', label: 'Visual level (0–100)', required: true },
          { type: 'number', name: 'order', label: 'Display order', required: true },
          { type: 'boolean', name: 'wide', label: 'Wide key' },
          { type: 'boolean', name: 'primary', label: 'Default selected key' },
        ],
      },
      {
        name: 'project', label: 'Projects', path: 'content/projects', format: 'json',
        fields: [
          { type: 'string', name: 'title', label: 'Project title', required: true, isTitle: true },
          { type: 'string', name: 'slug', label: 'Unique slug', required: true },
          { type: 'number', name: 'order', label: 'Display order', required: true },
          { type: 'boolean', name: 'featured', label: 'Featured wide card' },
          { type: 'string', name: 'artStyle', label: 'Visual style', required: true, options: ['phishing', 'honeypot', 'ctf', 'generic'] },
          { type: 'string', name: 'meta', label: 'Meta labels', list: true },
          { type: 'string', name: 'description', label: 'Description', required: true, ui: textArea },
          { type: 'string', name: 'tools', label: 'Tools / tags', list: true },
          { type: 'string', name: 'linkType', label: 'Card action', required: true, options: ['modal', 'external', 'none'] },
          { type: 'string', name: 'externalUrl', label: 'External URL' },
          {
            type: 'object', name: 'caseStudy', label: 'Case study',
            fields: [
              { type: 'string', name: 'label', label: 'Case-study label' },
              { type: 'string', name: 'summary', label: 'Summary', ui: textArea },
              { type: 'string', name: 'objective', label: 'Objective', ui: textArea },
              { type: 'string', name: 'environment', label: 'Environment', ui: textArea },
              { type: 'string', name: 'learning', label: 'Learning', ui: textArea },
              { type: 'string', name: 'ethics', label: 'Ethics', ui: textArea },
            ],
          },
        ],
      },
      {
        name: 'certificate', label: 'Certificates', path: 'content/certificates', format: 'json',
        fields: [
          { type: 'string', name: 'title', label: 'Certificate title', required: true, isTitle: true },
          { type: 'string', name: 'slug', label: 'Unique slug', required: true },
          { type: 'string', name: 'issuer', label: 'Issuer', required: true },
          { type: 'string', name: 'displayDate', label: 'Display date', required: true },
          { type: 'string', name: 'credentialId', label: 'Credential ID' },
          { type: 'boolean', name: 'featured', label: 'Main certificate' },
          { type: 'number', name: 'order', label: 'Display order', required: true },
          { type: 'string', name: 'icon', label: 'Short icon text', required: true },
          { type: 'image', name: 'file', label: 'Certificate PDF or image', required: true },
          { type: 'string', name: 'verificationUrl', label: 'Verification URL' },
        ],
      },
      {
        name: 'achievement', label: 'Achievements', path: 'content/achievements', format: 'json',
        fields: [
          { type: 'string', name: 'title', label: 'Achievement', required: true, isTitle: true },
          { type: 'string', name: 'shortTitle', label: 'Short visual label', required: true },
          { type: 'string', name: 'category', label: 'Category', required: true },
          { type: 'number', name: 'order', label: 'Display order', required: true },
        ],
      },
      {
        name: 'education', label: 'Education', path: 'content/education', format: 'json', match: { include: 'site' },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: 'string', name: 'degree', label: 'Degree', required: true, isTitle: true },
          { type: 'string', name: 'institution', label: 'Institution', required: true },
          { type: 'string', name: 'expectedCompletion', label: 'Expected completion', required: true },
          { type: 'string', name: 'eyebrow', label: 'Eyebrow', required: true },
          { type: 'object', name: 'extras', label: 'Beyond the terminal', list: true, fields: [
            { type: 'string', name: 'title', label: 'Title', required: true },
            { type: 'string', name: 'description', label: 'Description', required: true },
          ] },
        ],
      },
      {
        name: 'ai', label: 'Shehzada’s AI', path: 'content/ai', format: 'json', match: { include: 'site' },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: 'string', name: 'assistantName', label: 'Assistant name', required: true, isTitle: true },
          { type: 'string', name: 'greeting', label: 'Greeting', required: true, ui: textArea },
          { type: 'string', name: 'unknown', label: 'Unknown-answer response', required: true, ui: textArea },
          { type: 'object', name: 'customFacts', label: 'Additional verified facts', list: true, fields: [
            { type: 'string', name: 'id', label: 'Unique ID', required: true },
            { type: 'string', name: 'patterns', label: 'Example questions', list: true, required: true },
            { type: 'string', name: 'keywords', label: 'Keywords', list: true, required: true },
            { type: 'string', name: 'answer', label: 'Plain-text answer', required: true, ui: textArea },
            { type: 'string', name: 'source', label: 'Evidence/source label', required: true },
          ] },
        ],
      },
    ],
  },
});
