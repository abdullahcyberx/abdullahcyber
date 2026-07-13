# TinaCMS and admin-security test report

**Project:** Abdullah Cyber portfolio  
**Domain prepared for:** `https://abdullahcyber.dev`  
**Test date:** 11 July 2026

## Passed checks

1. **Content validation** — canonical domain, email, social URLs, local paths, certificate links, project links, slugs, duplicate keys, ordering and skill percentages passed.
2. **Repository secret scan** — no committed TinaCloud token, GitHub token, Cloudflare token or private key pattern was found.
3. **Static production render** — generated 3 experience entries, 18 mobile/desktop skill keys, 3 projects and 17 certificates.
4. **JavaScript syntax** — renderer, validator, security checker, Tina TypeScript configuration and generated inline scripts passed syntax checks.
5. **Stored-content injection boundary** — a test payload containing `</script><script>…</script>` was inserted into CMS content. The renderer encoded it inside JavaScript data instead of creating an executable script. The original content was restored afterward.
6. **Unsafe URL handling** — only HTTPS, validated email links, safe root-relative paths and safe section anchors are accepted by the renderer. Protocol-relative paths, backslashes, control characters and script URLs fall back to a safe target.
7. **CMS update simulation 1** — a temporary certificate was added through a JSON content file only. It appeared in the generated portfolio and disappeared after deletion, with no template code change.
8. **CMS update simulation 2** — the access-denied message was changed through Site Settings only. The generated denial page updated and was then restored to `not here boy 🙂`.
9. **DOM checks** — no duplicate IDs, exactly 18 skill keys, 2 main certificates, 15 supporting certificates, the correct Shehzada’s AI label and no `javascript:` links.
10. **Vite production build** — completed successfully; generated HTML was approximately 188 KB before compression and 46 KB gzip.
11. **Crawler controls** — `/admin/` and `/not-here-boy/` are disallowed in `robots.txt`; admin responses are also prepared with `noindex`, `nofollow`, `noarchive` and no-store headers.
12. **Admin media restrictions** — repository media is limited to PDF, PNG, JPEG, WebP and AVIF; SVG and HTML uploads are excluded.
13. **Cloudflare Access origin gate** — generated RS256 test tokens were verified against a mocked rotating JWK set. The exact owner token was accepted; missing tokens, wrong email, wrong audience, expired tokens and missing configuration were denied and redirected to `not here boy 🙂`.
14. **Fail-closed route coverage** — separate Pages Function routes protect both `/admin` and all depths under `/admin/*`.

## Security design reviewed

- Cloudflare Access is the first authentication gate for both `/admin` and `/admin/*`.
- The Access Allow rule is limited to `abdullahcyberx@gmail.com`.
- A Pages Function independently validates the Access JWT signature, issuer, audience, timestamps and exact email.
- TinaCloud editor authorization is the final independent gate.
- The denied-user redirect points to `/not-here-boy/`.
- Production and preview `pages.dev` routes are called out so they cannot silently bypass the custom-domain rule.
- Build-time secrets are read from environment variables and are not committed to the repository.

## Deployment checks still required

These cannot be completed without access to the owner’s external accounts and real credentials:

- Live TinaCloud sign-in, content commit and GitHub write test.
- Live Cloudflare Access allow/deny test in an incognito browser.
- MFA challenge test through the chosen Google or GitHub identity provider.
- Unauthorized-user redirect test to `https://abdullahcyber.dev/not-here-boy/`.
- Cloudflare Pages production and preview URL protection test.

No system can honestly be described as impossible to compromise. The prepared setup uses defense in depth and removes client-side-only authentication, but the Cloudflare and TinaCloud dashboard steps in the included guides are mandatory before `/admin/` is considered protected.
