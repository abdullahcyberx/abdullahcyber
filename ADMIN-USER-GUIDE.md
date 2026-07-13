# Admin User Guide

This guide explains how to manage your portfolio content using the secure TinaCMS admin panel.

## Logging In

1. Go to `https://abdullahcyber.dev/admin/`.
2. You will be prompted by Cloudflare Access to log in. Use the email `abdullahcyberx@gmail.com` and authenticate with your Identity Provider.
3. Once authenticated, you will enter the TinaCMS dashboard.

## Managing Content

In the TinaCMS sidebar, you can select different collections:

### Certificates
- **Add a Certificate:** Click on "Certificates" and then "Add new document". Fill in the Title, Date, Issuer, etc.
- **Upload a PDF:** Use the media manager in the "File" field to upload a new PDF or image.
- **Featured:** Toggle the "Featured" switch to move it between the main highlighted section and the supporting list.
- **Reorder:** Change the "Display Order" number to adjust its position.

### Projects
- Click "Projects" and add a new document. You can set the title, meta information, and the project description.

### Experience, Skills, and More
- Similarly, select the collection on the left and edit the fields.

### Shehzada's AI
- You can update AI knowledge by editing the `AI Knowledge` collection to add custom facts and answers.

## Publishing Changes

1. After making your changes, click **Save** in the top right corner.
2. The changes are automatically committed to the `main` (or feature) branch in GitHub.
3. Cloudflare Pages will detect the push and automatically start a build.
4. Your changes will be live once the build finishes (usually within a few minutes).

## Recovering from a Failed Deployment
If a deployment fails, log into your Cloudflare Pages dashboard to check the logs. You can always revert changes by editing the content again in the CMS or reverting the commit on GitHub.

## Logging Out
When finished, log out from your Identity Provider or wait for the Cloudflare Access session to expire (configured for 1-4 hours).
