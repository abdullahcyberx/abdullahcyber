# Content Update Guide

Here is the simple workflow for updating your portfolio content safely and deploying it automatically:

1. **Open local Portfolio Manager**: Run `npm run manager` in your terminal and open the editor in your browser.
2. **Edit content**: Load your JSON files, make your changes across the different tabs.
3. **Export JSON**: Click `Download Individual JSONs` to export the modified files.
4. **Replace JSON files**: Copy the downloaded JSON files into the `content/` folder of the project, replacing the old ones.
5. **Copy new PDFs/images**: If you added new certificates, copy the actual files into `public/assets/certificates/`.
6. **Run PUBLISH-CHANGES.bat**: Double-click `PUBLISH-CHANGES.bat` (or run `.\PUBLISH-CHANGES.ps1` in PowerShell). This will automatically validate, test, build, and push your changes to GitHub.
7. **Cloudflare deploys automatically**: Once pushed to GitHub, Cloudflare Pages will automatically trigger a new deployment for your live website.
