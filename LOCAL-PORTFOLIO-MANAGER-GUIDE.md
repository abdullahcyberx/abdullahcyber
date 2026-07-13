# Local Portfolio Manager Guide

This guide explains how to use the local Portfolio Manager to safely manage content.

## How to Open the Manager
1. In your terminal, run `npm run manager`.
2. Open the provided `http://127.0.0.1:5173/local-tools/portfolio-manager.html` URL in your browser.
*(Alternatively, you can open `local-tools/portfolio-manager.html` directly in your browser, but the Vite server provides better support for local operations.)*

## How to Load JSON Files
1. Go to the **Import / Export** tab.
2. Click the drag-and-drop area and select all JSON files from the `content/` folder, or drag them into the box.

## Managing Certificates
### How to Add a Certificate
1. Go to the **Certificates** tab and click "Add Certificate".
2. Fill in the details.
3. **Where to place PDFs:** Copy your actual certificate PDF or image file into `public/assets/certificates/` in the project directory.
4. In the editor, ensure the certificate path is set to `/assets/certificates/your-file-name.pdf`.

### How to Feature a Certificate
Check the "featured" box next to a certificate to display it on the main grid. Only keep a few featured at once.

### How to Reorder Certificates
Change the numeric `displayOrder` value. Lower numbers appear first.

## Managing Other Content
- **Add a Project:** Go to the **Projects** tab, click "Add Project", and fill out the form.
- **Update Experience:** Go to the **Experience** tab to add or edit roles.
- **Update SEO:** Go to the **SEO Settings** tab to update metadata, keywords, and Open Graph content.
- **Update AI Settings:** Go to the **Shehzada's AI** tab to configure AI greeting, fallback answers, and custom questions.

## How to Export JSON & Publish Changes
1. Once finished editing, go to the **Import / Export** tab.
2. Click **Download Individual JSONs**.
3. Replace the original JSON files in your project's `content/` directory with the newly downloaded ones.
4. Run `PUBLISH-CHANGES.bat` (Windows) or `.\PUBLISH-CHANGES.ps1` to validate, build, and push your changes to GitHub. Cloudflare will deploy automatically.

## How to Restore a Backup
If you exported a Combined Backup (`portfolio-content-backup.json`), you can drag and drop it into the **Import / Export** tab to instantly reload all your saved state into the editor.
