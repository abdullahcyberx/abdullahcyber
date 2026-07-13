# Abdullah Cyber Portfolio

A lightweight, production-ready static Vite website featuring a local visual Portfolio Manager, JSON-based content management, and robust security optimizations.

## Features
- **JSON Content Management**: All content is stored in clean JSON schemas under `content/`.
- **Local Portfolio Manager**: Edit content visually without a server or database.
- **Shehzada's AI**: A local, deterministic chatbot assistant grounded in verified portfolio facts.
- **Secure Static Rendering**: Generates strict, sanitized HTML for Cloudflare Pages deployment.
- **Fast Build Times**: Powered by Vite and custom Node scripts.

## Getting Started
1. Run `npm ci`
2. Run `npm run manager` to open the visual content editor.
3. Edit your content, download the updated JSON files, and replace them in `content/`.
4. Run `npm run build` to generate the production-ready `dist` folder.
