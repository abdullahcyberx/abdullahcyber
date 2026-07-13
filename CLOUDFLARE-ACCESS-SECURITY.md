# Cloudflare Access Security

The `/admin` path is secured by a Cloudflare Pages Function that requires a valid JSON Web Token (JWT) issued by Cloudflare Access.

## Setup Instructions

1. Go to **Zero Trust** in the Cloudflare Dashboard.
2. Navigate to **Access** -> **Applications** -> **Add an Application**.
3. Choose **Self-Hosted**.
4. Set the **Application name** (e.g., "Abdullah Cyber Admin").
5. Set the **Application domain** to `abdullahcyber.dev` and the path to `admin*`.
6. Go to **Policies** and add a policy:
   - Action: **Allow**
   - Name: `Allow Admin`
   - Include: Emails ending in `abdullahcyberx@gmail.com`.
7. Ensure no broad "Everyone" rules are enabled.
8. Enable an Identity Provider (IdP) protected by MFA (e.g., Google or GitHub).
9. Session duration should be 1-4 hours.
10. Copy the **AUD** tag from the application overview page.
11. Add `CF_ACCESS_AUD` and your `CF_ACCESS_TEAM_DOMAIN` (e.g., `https://<your-team>.cloudflareaccess.com`) to the Cloudflare Pages environment variables.

Unauthorized access will be automatically redirected to `/not-here-boy/` displaying:
`not here boy 🙂`
