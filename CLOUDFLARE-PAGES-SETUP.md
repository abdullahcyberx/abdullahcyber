# Cloudflare Pages Setup

1. Log into your [Cloudflare Dashboard](https://dash.cloudflare.com).
2. Go to **Workers & Pages**.
3. Click **Create Application**, then select **Pages**, and **Connect to Git**.
4. Select `abdullahcyberx/abdullahcyber`.
5. Configure the Build settings:
   - **Framework preset:** `None`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/` (leave empty)
6. Add Environment Variables:
   - `NODE_VERSION`: `22.23.1`
   - `NEXT_PUBLIC_TINA_CLIENT_ID`: `<from TinaCloud>`
   - `TINA_TOKEN`: `<from TinaCloud>`
   - `NEXT_PUBLIC_TINA_BRANCH`: `feature/tinacms-secure-admin` or `main`
   - `CF_ACCESS_TEAM_DOMAIN`: `https://<your-team>.cloudflareaccess.com`
   - `CF_ACCESS_AUD`: `<from Access>`
   - `ADMIN_EMAIL`: `abdullahcyberx@gmail.com`
7. Click **Save and Deploy**.
