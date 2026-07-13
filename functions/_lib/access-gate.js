const DEFAULT_ADMIN_EMAIL = 'abdullahcyberx@gmail.com';
const MAX_TOKEN_LENGTH = 16_384;
const CLOCK_SKEW_SECONDS = 60;

const textEncoder = new TextEncoder();

function decodeBase64Url(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new Error('Invalid base64url value');
  }
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function decodeJson(value) {
  return JSON.parse(new TextDecoder().decode(decodeBase64Url(value)));
}

function normalizeTeamDomain(value) {
  const text = String(value || '').trim().replace(/\/$/, '');
  if (!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/i.test(text)) return '';
  return text;
}

function claimHasAudience(claim, expected) {
  if (typeof claim === 'string') return claim === expected;
  return Array.isArray(claim) && claim.includes(expected);
}

function deny(context) {
  const deniedUrl = new URL('/not-here-boy/', context.request.url);
  return new Response(null, {
    status: 302,
    headers: {
      Location: deniedUrl.toString(),
      'Cache-Control': 'private, no-store, max-age=0',
      'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
      'Referrer-Policy': 'no-referrer',
    },
  });
}

async function verifyAccessJwt(token, env) {
  const teamDomain = normalizeTeamDomain(env.CF_ACCESS_TEAM_DOMAIN);
  const audience = String(env.CF_ACCESS_AUD || '').trim();
  const allowedEmail = String(env.ADMIN_EMAIL || '').trim().toLowerCase();

  // Fail closed until the Access application values are configured.
  if (!teamDomain || !audience || !allowedEmail) return false;
  if (!token || token.length > MAX_TOKEN_LENGTH) return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  let header;
  let payload;
  try {
    header = decodeJson(parts[0]);
    payload = decodeJson(parts[1]);
  } catch {
    return false;
  }

  if (header.alg !== 'RS256' || typeof header.kid !== 'string' || !header.kid) return false;
  if (payload.iss !== teamDomain || !claimHasAudience(payload.aud, audience)) return false;
  if (String(payload.email || '').trim().toLowerCase() !== allowedEmail) return false;

  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(payload.exp) || payload.exp < now - CLOCK_SKEW_SECONDS) return false;
  if (payload.nbf != null && (!Number.isFinite(payload.nbf) || payload.nbf > now + CLOCK_SKEW_SECONDS)) return false;
  if (payload.iat != null && (!Number.isFinite(payload.iat) || payload.iat > now + CLOCK_SKEW_SECONDS)) return false;

  let jwks;
  try {
    const response = await fetch(`${teamDomain}/cdn-cgi/access/certs`, {
      headers: { Accept: 'application/json' },
      cf: { cacheEverything: true, cacheTtl: 3600 },
    });
    if (!response.ok) return false;
    jwks = await response.json();
  } catch {
    return false;
  }

  const jwk = Array.isArray(jwks?.keys)
    ? jwks.keys.find((key) => key.kid === header.kid && key.kty === 'RSA' && key.alg === 'RS256' && key.use === 'sig')
    : null;
  if (!jwk) return false;

  try {
    const publicKey = await crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    return await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      publicKey,
      decodeBase64Url(parts[2]),
      textEncoder.encode(`${parts[0]}.${parts[1]}`),
    );
  } catch {
    return false;
  }
}

export async function protectAdmin(context) {
  const token = context.request.headers.get('cf-access-jwt-assertion');
  if (!(await verifyAccessJwt(token, context.env || {}))) return deny(context);

  const response = await context.next();
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'private, no-store, max-age=0');
  headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  headers.set('Referrer-Policy', 'no-referrer');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export const __test = { verifyAccessJwt, normalizeTeamDomain, decodeBase64Url };
