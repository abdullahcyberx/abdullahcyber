# Netlify Emergency Backup Deployment

This document describes how to manage the emergency backup portfolio deployed on Netlify.

## Normal mode

By default, the Netlify URL redirects all visitors to the main Cloudflare-hosted domain (`https://abdullahcyber.dev`).

The redirect block in `netlify.toml` remains enabled:

```toml
[[redirects]]
  from = "/*"
  to = "https://abdullahcyber.dev/:splat"
  status = 302
  force = true
```

## Emergency backup mode

To display the portfolio directly on Netlify, remove or comment out only the redirect block in `netlify.toml`:

```toml
# [[redirects]]
#   from = "/*"
#   to = "https://abdullahcyber.dev/:splat"
#   status = 302
#   force = true
```

Do not remove the build settings.

After removing the redirect block, commit and push the change. Netlify will rebuild and serve the complete portfolio directly from the `.netlify.app` URL.

## Restoring normal mode

Add the redirect block back to `netlify.toml`, commit, and push.

## Commands

**Activate emergency backup:**
```bash
git add netlify.toml
git commit -m "Activate Netlify backup portfolio"
git push origin main
```

**Restore redirect:**
```bash
git add netlify.toml
git commit -m "Restore Netlify redirect to primary domain"
git push origin main
```

**Note:** Ensure the independent `netlify.app` URL is saved securely. It can remain accessible even when the custom domain (`abdullahcyber.dev`) experiences DNS or domain-level problems.
