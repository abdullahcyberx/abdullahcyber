import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { protectAdmin } from '../functions/_lib/access-gate.js';

if (!globalThis.crypto) globalThis.crypto = webcrypto;

const encoder = new TextEncoder();
const base64url = (bytes) => Buffer.from(bytes).toString('base64url').replace(/=/g, '');
const jsonPart = (value) => base64url(encoder.encode(JSON.stringify(value)));

const keyPair = await crypto.subtle.generateKey(
  { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
  true,
  ['sign', 'verify'],
);
const publicJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
Object.assign(publicJwk, { kid: 'test-key', alg: 'RS256', use: 'sig' });

const teamDomain = 'https://abdullah-test.cloudflareaccess.com';
const audience = 'test-audience';
const adminEmail = 'abdullahcyberx@gmail.com';
const now = Math.floor(Date.now() / 1000);

async function makeToken(overrides = {}, headerOverrides = {}, fakeSign = false) {
  const header = { alg: 'RS256', typ: 'JWT', kid: 'test-key', ...headerOverrides };
  const payload = {
    iss: teamDomain,
    aud: [audience],
    email: adminEmail,
    iat: now,
    nbf: now - 5,
    exp: now + 300,
    ...overrides,
  };
  const unsigned = `${jsonPart(header)}.${jsonPart(payload)}`;
  if (fakeSign) {
    return `${unsigned}.fake-signature`;
  }
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', keyPair.privateKey, encoder.encode(unsigned));
  return `${unsigned}.${base64url(new Uint8Array(signature))}`;
}

let jwksShouldFail = false;
let jwksShouldBeMalformed = false;

const realFetch = globalThis.fetch;
globalThis.fetch = async (url) => {
  assert.equal(String(url), `${teamDomain}/cdn-cgi/access/certs`);
  if (jwksShouldFail) return new Response('error', { status: 500 });
  if (jwksShouldBeMalformed) return new Response('not json', { status: 200, headers: { 'Content-Type': 'text/plain' } });
  return new Response(JSON.stringify({ keys: [publicJwk] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};

const makeContext = (token, envOverrides = {}) => ({
  request: new Request('https://abdullahcyber.dev/admin/', {
    headers: token ? { 'cf-access-jwt-assertion': token } : {},
  }),
  env: {
    CF_ACCESS_TEAM_DOMAIN: teamDomain,
    CF_ACCESS_AUD: audience,
    ADMIN_EMAIL: adminEmail,
    ...envOverrides,
  },
  next: async () => new Response('admin asset', { status: 200 }),
});

try {
  const valid = await protectAdmin(makeContext(await makeToken()));
  assert.equal(valid.status, 200);
  assert.equal(await valid.text(), 'admin asset');
  assert.equal(valid.headers.get('Cache-Control'), 'private, no-store, max-age=0');

  // Normalization
  const validUpperEmail = await protectAdmin(makeContext(await makeToken({ email: 'ABDULLAHCYBERX@GMAIL.COM' })));
  assert.equal(validUpperEmail.status, 200);

  const testCases = [
    { name: 'missing token', ctx: makeContext(null) },
    { name: 'empty token', ctx: makeContext('') },
    { name: 'token too large', ctx: makeContext('a'.repeat(17000)) },
    { name: 'malformed jwt', ctx: makeContext('not.a.jwt') },
    { name: 'wrong signature', ctx: makeContext(await makeToken({}, {}, true)) },
    { name: 'wrong alg (HS256)', ctx: makeContext(await makeToken({}, { alg: 'HS256' })) },
    { name: 'wrong issuer', ctx: makeContext(await makeToken({ iss: 'https://wrong.cloudflareaccess.com' })) },
    { name: 'wrong audience', ctx: makeContext(await makeToken({ aud: ['wrong'] })) },
    { name: 'wrong email', ctx: makeContext(await makeToken({ email: 'attacker@example.com' })) },
    { name: 'expired token', ctx: makeContext(await makeToken({ exp: now - 300 })) },
    { name: 'future nbf', ctx: makeContext(await makeToken({ nbf: now + 300 })) },
    { name: 'invalid future iat', ctx: makeContext(await makeToken({ iat: now + 300 })) },
    { name: 'missing team domain', ctx: makeContext(await makeToken(), { CF_ACCESS_TEAM_DOMAIN: '' }) },
    { name: 'missing aud', ctx: makeContext(await makeToken(), { CF_ACCESS_AUD: '' }) },
    { name: 'missing admin email', ctx: makeContext(await makeToken(), { ADMIN_EMAIL: '' }) },
  ];

  for (const tc of testCases) {
    const denied = await protectAdmin(tc.ctx);
    assert.equal(denied.status, 302, `Test failed: ${tc.name}`);
    assert.equal(denied.headers.get('Location'), 'https://abdullahcyber.dev/not-here-boy/');
  }

  // test jwks fetch failures
  jwksShouldFail = true;
  const failRes = await protectAdmin(makeContext(await makeToken()));
  assert.equal(failRes.status, 302);
  jwksShouldFail = false;

  jwksShouldBeMalformed = true;
  const malformedRes = await protectAdmin(makeContext(await makeToken()));
  assert.equal(malformedRes.status, 302);
  jwksShouldBeMalformed = false;

  console.log('All comprehensive Cloudflare Access origin-gate tests passed!');
} finally {
  globalThis.fetch = realFetch;
}
