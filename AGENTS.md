# Abdullah Cyber Portfolio — AI Update Instructions

1. Do not change the visual design unless the user explicitly requests a design change.
2. Do not edit src/style.css for content updates.
3. Do not edit src/main.js for content updates.
4. Do not edit src/index.template.html for normal content updates.
5. Update portfolio information only in content/*.json.
6. Put certificate files in public/assets/certificates/.
7. Put project images in public/assets/projects/.
8. Preserve existing IDs unless replacing the same record.
9. Generate a new safe lowercase ID and slug for new records.
10. Keep the two main certifications featured unless the user says otherwise.
11. Run validation, security, build, and smoke tests after changes.
12. Never invent personal facts.
13. Never expose secrets or private information.
14. Never place HTML, scripts, event handlers, or unsafe URLs inside JSON.
15. Update Shehzada’s AI automatically through shared portfolio content rather than duplicating facts in ai.json.
16. Do not delete content unless the user explicitly requests deletion.
17. Preserve display ordering unless the user requests a change.
18. Confirm that every referenced asset exists.

## Adding a certificate
1. Copy the PDF to `public/assets/certificates/`.
2. Add a new object to `content/certificates.json`.
3. Set `featured: false` unless specified.
4. Run `npm run verify`.

## Updating a certificate
1. Locate the certificate in `content/certificates.json`.
2. Modify only the requested fields.
3. Run `npm run verify`.

## Replacing a certificate PDF
1. Copy the new PDF to `public/assets/certificates/`.
2. Update the `certificateFile` path in `content/certificates.json`.
3. Run `npm run verify`.

## Adding experience
1. Add a new object to `content/experience.json`.
2. Maintain the correct chronological `displayOrder`.
3. Run `npm run verify`.

## Updating experience
1. Locate the experience object in `content/experience.json`.
2. Modify the requested fields.
3. Run `npm run verify`.

## Adding a project
1. Copy the project image to `public/assets/projects/` (or specify the external URL).
2. Add the object to `content/projects.json`.
3. Run `npm run verify`.

## Adding a project image
1. Place the image in `public/assets/projects/`.
2. Update the `image` field in `content/projects.json`.
3. Run `npm run verify`.

## Adding a skill
1. Add the skill object to `content/skills.json`.
2. Ensure `keyboardPosition` is unique and follows the existing format.
3. Run `npm run verify`.

## Adding an achievement
1. Add the achievement object to `content/achievements.json`.
2. Ensure `isBadge` is set correctly depending on whether it's a ring or badge achievement.
3. Run `npm run verify`.

## Updating education
1. Locate the education object in `content/education.json`.
2. Modify the requested fields.
3. Run `npm run verify`.

## Updating contact information
1. Locate the contact fields in `content/profile.json` (e.g. `email`, `githubUrl`, `linkedinUrl`).
2. Update as needed.
3. Run `npm run verify`.

## Updating SEO
1. Locate `content/seo.json`.
2. Modify titles, descriptions, or keywords without keyword-stuffing.
3. Run `npm run verify`.

## Updating Shehzada’s AI greeting or fallback
1. Locate `content/ai.json`.
2. Modify the `greeting` or `fallbackResponse`.
3. Do not duplicate facts inside `ai.json`.
4. Run `npm run verify`.
