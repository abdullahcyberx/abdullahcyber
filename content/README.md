# Content Architecture

This directory contains the entire content schema for the Abdullah Cyber portfolio. It is designed to be easily editable by humans and AI coding assistants.

## 1. `achievements.json`
Array of achievements and CTF participations.
- `id` (String): Unique lowercase ID (e.g., `ach-1`).
- `title` (String, Required): The title of the achievement.
- `isBadge` (Boolean): If true, renders as a badge. If false, renders as an achievement ring.

## 2. `ai.json`
Configuration for Shehzada's AI assistant. **Note:** Shehzada automatically understands projects, certificates, experience, and education from their respective JSON files. Do not duplicate facts here.
- `name` (String): The AI's name (e.g., `Shehzada`).
- `greeting` (String): First message shown when opened.
- `fallbackResponse` (String): Message shown when AI does not understand.

## 3. `certificates.json`
Array of certificates and credentials.
- `id` (String, Required): Unique ID.
- `slug` (String, Required): URL-safe slug.
- `title` (String, Required): Certificate title.
- `issuer` (String, Required): Issuing organization.
- `issueDate` (String): Date of issue.
- `credentialId` (String): Official ID for verification.
- `certificateFile` (String, Required): Path starting with `/assets/certificates/`.
- `featured` (Boolean): Controls if it shows in the main hero section.
- `displayOrder` (Number): Controls sort order.
- `icon` (String): Fallback icon letter.

## 4. `education.json`
Array of education records.
- `id` (String): Unique ID.
- `degree` (String, Required): e.g., "Bachelor of Cyber Security".
- `institution` (String, Required): e.g., "Riphah International University".
- `expectedCompletion` (String): e.g., "Expected 2027".
- `displayOrder` (Number): Sort order.

## 5. `experience.json`
Array of professional roles or internships.
- `id` (String): Unique ID.
- `company` (String, Required): Company name.
- `role` (String, Required): Job title.
- `startDate` / `endDate` (String): Employment dates.
- `location` (String): e.g., "Remote, Pakistan".
- `workType` (String): e.g., "Internship".
- `displayOrder` (Number): Controls sort order.

## 6. `profile.json`
Primary personal information.
- `fullName` (String, Required): Real name.
- `professionalTitle` (String, Required): E.g. "Penetration Tester".
- `aboutText` (Array of Strings): Paragraphs for the about section.
- `email`, `githubUrl`, `linkedinUrl` (String): Contact information.
- `cvPath` (String): Path starting with `assets/`.

## 7. `projects.json`
Array of portfolio projects.
- `id` (String, Required): Unique ID.
- `slug` (String, Required): URL-safe string.
- `title` (String, Required): Project name.
- `summary` (String): Brief description.
- `tools` (Array of Strings): Tools used (e.g., `["Python", "Docker"]`).
- `featured` (Boolean): Highlights the project if true.
- `displayOrder` (Number): Sort order.
- `image` (String): CSS class or asset path reference for the project art.

## 8. `seo.json`
Search engine optimization metadata.
- `title` (String, Required): Page `<title>`.
- `description` (String, Required): Meta description.
- `keywords` (String): Comma-separated SEO keywords.
- `siteUrl` (String): Full HTTPS URL to the site.

## 9. `skills.json`
Array of technical skills.
- `id` (String, Required): Unique ID.
- `name` (String, Required): Skill name.
- `keyboardPosition` (String, Required): Key label mapping it to the visual skills keyboard (e.g., `Tab`, `Q`, `Shift`).
- `icon` (String): Single character or symbol for the keycap.
- `proficiency` (Number): 0-100 score.
