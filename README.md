# Abdullah Cyber Portfolio

This is a pure static Vite portfolio for Muhammad Abdullah. It is designed to be easily editable without any backend, CMS, or public admin panel. All content is driven by clean JSON files.

## Updating Content

Normal updates require editing the JSON files located in `content/*.json`. 
An AI coding assistant or a human can safely update certificates, projects, experience, skills, achievements, education, and profile information by modifying these files.

1. **Content**: Edit JSON files in `content/`
2. **Assets**: Place new images, PDFs, and icons in `public/assets/`
3. **Schemas**: Refer to `content/README.md` or the schemas in `schemas/` for documentation on supported fields.

**No design changes, CSS modifications, or JavaScript edits are required for standard content updates.**

## Local Development

You need Node.js (v22.23.1 recommended).

```bash
# Install dependencies
npm ci

# Start the local development server
npm run dev
```

## Building and Verifying

To ensure your content is valid, secure, and ready for production:

```bash
# Full verification (Validates JSON, checks security, builds site, runs content and E2E tests)
npm run verify

# Build only
npm run build
```

## Deployment

This portfolio automatically deploys to Cloudflare Pages when changes are pushed to GitHub.

## Documentation

- `AGENTS.md`: Strict rules and instructions for AI assistants modifying the portfolio.
- `CONTENT-UPDATE-GUIDE.md`: Simple guide for human editors.
- `AI-UPDATE-EXAMPLES.md`: Examples of prompts you can use to ask an AI to update your site.
- `SECURITY.md`: Security policies.
- `CLOUDFLARE-PAGES-SETUP.md`: Cloudflare configuration instructions.
