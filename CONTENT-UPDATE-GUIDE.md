# Content Update Guide

This portfolio requires no backend, CMS, or public admin panel. Content updates are made exclusively by modifying the local JSON files in the `content/` folder.

## Add a certificate

1. Copy the PDF to:
   `public/assets/certificates/`

2. Add one object to:
   `content/certificates.json`

3. Set:
   `"featured": true`
   only for an important main certification.

4. Use:
   `"featured": false`
   for supporting certificates.

5. Run:
   `npm run verify`

## Add a project

1. Copy the image to:
   `public/assets/projects/`

2. Add a project object to:
   `content/projects.json`

3. Run:
   `npm run verify`

## Add experience

1. Add an experience object to:
   `content/experience.json`

2. Ensure chronological ordering using the `displayOrder` property.

3. Run:
   `npm run verify`

## Add a skill

1. Add a skill object to:
   `content/skills.json`

2. Supply a valid keyboard layout position for `keyboardPosition` to place it properly on the skills keyboard.

3. Run:
   `npm run verify`

## Update SEO and Profile Details

1. Open `content/seo.json` or `content/profile.json`.

2. Modify the values (e.g. `title`, `email`, `linkedinUrl`).

3. Run:
   `npm run verify`

## Update Shehzada's AI

1. Add new portfolio facts to the standard content files. The AI automatically understands new projects, certificates, and skills during the build.

2. Open `content/ai.json` only to change the AI's core behavior, greeting, or fallback responses.

3. Run:
   `npm run verify`
