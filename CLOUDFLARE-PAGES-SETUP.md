# Cloudflare Pages Setup

Configure your Cloudflare Pages project with the following settings:

## Build Settings
- **Framework Preset**: None
- **Build command**: `npm run build`
- **Output directory**: `dist`
- **Root directory**: `/` (repository root)

## Environment Variables
- `NODE_VERSION` = `22.23.1`

*Note: No TinaCMS or Cloudflare Access variables are required anymore.*

## Security & Headers
The `public/_headers` file contains the Content-Security-Policy and other security headers. The `public/_redirects` ensures old `/admin` paths return 404 or redirect safely. These files are automatically deployed to Cloudflare Pages.
