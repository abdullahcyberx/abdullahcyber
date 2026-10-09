// LUCKY.exe / Cloudflare Pages Functions. Keep game secrets in Cloudflare bindings.
const MOD = 0x100000000n;
const COOKIE = '__Host-lucky_session';
const MAX_AGE = 60 * 60 * 2;
const SPIN_PRICE = 5;
const MIN_SPINS = 5;
const MAX_ATTEMPTS = 3;
const TEXT_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function json(data, status = 200, cookie = null) {
  const headers = new Headers(TEXT_HEADERS);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  if (cookie) headers.set('Set-Cookie', cookie);
  return new Response(JSON.stringify(data), { status, headers });
}
function error(code, status = 400) { return json({ error: code }, status); }
function random32() { return crypto.getRandomValues(new Uint32Array(1))[0] >>> 0; }
function nextNumber(current, a, c) {
  return Number((BigInt(a) * BigInt(current) + BigInt(c)) % MOD);
}
function newGame() {
  // A full-period 32-bit LCG. Consecutive ticket differences are odd/invertible.
  const a = ((random32() & 0xfffffffc) | 1) >>> 0;
  const c = (random32() | 1) >>> 0;
  const now = Math.floor(Date.now() / 1000);
  return { v: 1, iat: now, exp: now + MAX_AGE, a, c, current: random32(), spins: 0,
    coins: 100, tickets: [], attempts: 0 };
}
function encoded(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function decoded(str) {
  if (!/^[A-Za-z0-9_-]+$/.test(str) || str.length > 4096) throw Error('bad token');
  const s = atob(str.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - str.length % 4) % 4));
  return Uint8Array.from(s, c => c.charCodeAt(0));
}
async function encryptionKey(env) {
  const hex = env?.LUCKY_SESSION_KEY;
  if (typeof hex !== 'string' || !/^[a-fA-F0-9]{64}$/.test(hex)) throw Error('LUCKY_SESSION_KEY must be 64 hex characters');
  const bytes = Uint8Array.from(hex.match(/../g), h => parseInt(h, 16));
  return crypto.subtle.importKey('raw', bytes, 'AES-GCM', false, ['encrypt', 'decrypt']);
}
async function pack(state, key) {
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const sealed = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, key, encoder.encode(JSON.stringify(state))));
  const bytes = new Uint8Array(nonce.length + sealed.length);
  bytes.set(nonce, 0); bytes.set(sealed, nonce.length);
  return encoded(bytes);
}
async function unpack(token, key) {
  try {
    const bytes = decoded(token);
    if (bytes.length < 29) return null;
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes.slice(0, 12) }, key, bytes.slice(12));
    const s = JSON.parse(decoder.decode(plain));
    const now = Math.floor(Date.now() / 1000);
    if (s?.v !== 1 || !Number.isInteger(s.exp) || s.exp <= now || s.iat > now ||
        s.exp - s.iat > MAX_AGE || !Number.isInteger(s.current) || s.current < 0 || s.current > 4294967295 ||
        !Number.isInteger(s.a) || !Number.isInteger(s.c) || !Number.isInteger(s.spins) ||
        !Number.isInteger(s.coins) || !Array.isArray(s.tickets) || !Number.isInteger(s.attempts)) return null;
    return s;
  } catch { return null; }
}
function getCookie(request) {
  const header = request.headers.get('Cookie') || '';
  const item = header.split(';').map(c => c.trim()).find(c => c.startsWith(COOKIE + '='));
  return item ? item.slice(COOKIE.length + 1) : null;
}
function setCookie(token) {
  return COOKIE + '=' + token + '; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=' + MAX_AGE;
}
function sessionView(s) {
  return {
    coins: s.coins, spins: s.spins, tickets: s.tickets, price: SPIN_PRICE,
    unlocked: s.spins >= MIN_SPINS, needed: Math.max(0, MIN_SPINS - s.spins),
    attemptsLeft: MAX_ATTEMPTS - s.attempts,
  };
}
function validAccess(ctx) {
  const expected = ctx.env?.LUCKY_ACCESS_TOKEN;
  const supplied = ctx.params?.access;
  return typeof expected === 'string' && /^[A-Za-z0-9_-]{24,90}$/.test(expected) &&
    typeof supplied === 'string' && supplied === expected;
}
function reelsFor(ticket) {
  const icons = ['7', '★', '♦', '♣', '♥', '◆'];
  return [icons[ticket % 6], icons[(ticket >>> 8) % 6], icons[(ticket >>> 16) % 6]];
}
function prizeFor(reels) {
  return reels[0] === reels[1] && reels[1] === reels[2] ? 35 :
    reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2] ? 9 : 0;
}
function safeUint(v) {
  if (typeof v !== 'string' || !/^\d{1,10}$/.test(v)) return null;
  const n = Number(v);
  return Number.isSafeInteger(n) && n <= 4294967295 ? n : null;
}

export async function serveGame(ctx) {
  if (!validAccess(ctx)) return new Response('Not Found', { status: 404, headers: TEXT_HEADERS });
  const headers = new Headers(TEXT_HEADERS);
  headers.set('Content-Type', 'text/html; charset=utf-8');
  headers.set('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
  return new Response(PAGE, { headers });
}

export async function handleAction(ctx) {
  if (!validAccess(ctx)) return error('Not Found', 404);
  const req = ctx.request;
  const origin = req.headers.get('Origin');
  if (origin && origin !== new URL(req.url).origin) return error('Request rejected', 403);
  if (!(req.headers.get('Content-Type') || '').toLowerCase().startsWith('application/json')) return error('Invalid request', 415);
  let body;
  try {
    const raw = await req.text();
    if (raw.length > 4096) return error('Request too large', 413);
    body = JSON.parse(raw);
    if (body === null || typeof body !== 'object' || Array.isArray(body)) return error('Invalid request');
  } catch { return error('Invalid JSON'); }
  let key;
  try { key = await encryptionKey(ctx.env); }
  catch { return error('Game configuration unavailable', 503); }
  let s = getCookie(req) ? await unpack(getCookie(req), key) : null;
  if (!s || body.action === 'reset') s = newGame();

  if (body.action === 'state' || body.action === 'reset') {
    return json({ state: sessionView(s) }, 200, setCookie(await pack(s, key)));
  }
  if (body.action === 'spin') {
    if (s.coins < SPIN_PRICE) return json({ error: 'Not enough coins. Restart to play again.', state: sessionView(s) }, 409);
    s.current = nextNumber(s.current, s.a, s.c);
    const ticket = s.current;
    const reels = reelsFor(ticket);
    const reward = prizeFor(reels);
    s.coins = s.coins - SPIN_PRICE + reward;
    s.spins++;
    s.tickets.push({ spin: s.spins, value: String(ticket).padStart(10, '0'), reels, reward });
    if (s.tickets.length > 16) s.tickets.shift();
    return json({ state: sessionView(s), latest: s.tickets[s.tickets.length - 1] }, 200, setCookie(await pack(s, key)));
  }
  if (body.action === 'predict') {
    if (s.spins < MIN_SPINS) return error('The VIP terminal is still locked', 403);
    if (s.attempts >= MAX_ATTEMPTS) return error('VIP access suspended. Restart for a new session.', 429);
    const first = safeUint(body.first), second = safeUint(body.second);
    if (first === null || second === null) return error('Enter two unsigned 32-bit decimal ticket numbers');
    const correct1 = nextNumber(s.current, s.a, s.c);
    const correct2 = nextNumber(correct1, s.a, s.c);
    if (first === correct1 && second === correct2) {
      const flag = ctx.env?.LUCKY_FLAG;
      if (typeof flag !== 'string' || !/^CIR\{[^\r\n{}]{4,100}\}$/.test(flag)) return error('Jackpot unavailable', 503);
      // Return a brand new session cookie: refreshing after victory starts at zero.
      return json({ success: true, result: flag }, 200, setCookie(await pack(newGame(), key)));
    }
    s.attempts++;
    return json({ error: s.attempts < MAX_ATTEMPTS ? 'Prediction rejected' : 'VIP access suspended. Restart for a new session.',
      state: sessionView(s) }, 403, setCookie(await pack(s, key)));
  }
  return error('Unknown action', 400);
}

const PAGE = String.raw`<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive"><title>LUCKY.exe | The House Always Wins</title>
<style>
:root{color-scheme:dark;--bg:#090916;--box:#15152c;--stroke:#3b3560;--gold:#fdd479;--mint:#5ff2cd;--pink:#ff4da3;--dim:#a8a7c5;--white:#f8f3ff}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 50% 0%,#34204f 0%,#101126 45%,#080915 100%);font:15px/1.5 'Segoe UI',Arial,sans-serif;color:var(--white);min-height:100vh}
body:before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.12;background:repeating-linear-gradient(0deg,transparent 0 4px,#f3d8ff26 4px 5px)}
.shell{max-width:1160px;margin:auto;padding:22px 18px 60px}.bar{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:15px;border-bottom:1px solid #444061;padding-bottom:18px}
.logo{font-size:clamp(24px,4vw,36px);font-weight:1000;color:var(--gold);letter-spacing:.07em;text-shadow:0 0 20px #feaf5570}.logo em{color:var(--pink);font-style:normal}
.tag{font:12px Consolas,monospace;color:var(--dim);letter-spacing:.1em}.pill{border:1px solid #62547c;border-radius:50px;padding:8px 14px;font:12px Consolas,monospace;color:var(--mint)}
.intro{text-align:center;padding:20px 5px 16px}.intro h1{font-size:clamp(20px,3.5vw,32px);margin:0;color:var(--gold)}.intro p{color:var(--dim);margin:4px 0}
.cols{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:20px}.machine,.panel{background:linear-gradient(160deg,#252044,#11142d);border:1px solid #514572;border-radius:18px;box-shadow:0 22px 72px #0006;overflow:hidden}
.machine{border:3px solid #8c6091;box-shadow:0 0 0 3px #291d47,0 20px 80px #0009}.mach-top{text-align:center;background:linear-gradient(90deg,#5a245e,#952d7d,#4e225d);border-bottom:2px solid #d2a75f;padding:18px}
.mach-top h2{margin:0;font-size:clamp(24px,4vw,42px);letter-spacing:.1em;color:#ffe4a8;text-shadow:0 2px 12px #000b}.mach-top small{font:12px Consolas,monospace;color:#ffe4c6}
.reel-wrap{padding:22px 24px 14px}.reels{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;perspective:500px}.reel{display:flex;align-items:center;justify-content:center;min-height:150px;background:linear-gradient(170deg,#ede5ec,#fff4d1,#bcaac5);border:4px solid #f4ce7a;border-radius:14px;color:#952346;font:900 clamp(56px,8vw,88px) Georgia,serif;box-shadow:inset 0 12px 20px #56376a44,0 9px 0 #493257}
.reels.spinning .reel{animation:jitter .11s ease-in-out infinite alternate}@keyframes jitter{to{transform:translateY(-9px);filter:blur(1.5px)}}
.readout{margin:13px 0;border:1px solid #55466f;border-radius:10px;background:#090d21;padding:13px;text-align:center;min-height:65px}.readout b{font:700 24px Consolas,monospace;color:var(--mint);letter-spacing:.05em}.readout small{display:block;color:var(--dim);font:11px Consolas,monospace}
.metrics{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:5px 24px 14px}.metric{border:1px solid #594569;background:#130e29;border-radius:10px;padding:12px;text-align:center}.metric small{color:var(--dim);display:block;font:11px Consolas,monospace}.metric strong{color:var(--gold);font:900 25px Consolas,monospace}
.control{padding:0 24px 22px}.btn{appearance:none;border:0;border-radius:12px;background:linear-gradient(135deg,#fbd078,#d98b34);padding:16px 18px;cursor:pointer;width:100%;color:#2e1830;font-weight:900;font-size:17px;letter-spacing:.1em;box-shadow:0 5px 0 #8d5118;transition:filter .12s}.btn:hover{filter:brightness(1.1)}.btn:disabled{filter:grayscale(.8);cursor:not-allowed;opacity:.55}.secondary{background:#28233d;box-shadow:none;border:1px solid #72628b;color:var(--white);font:700 12px Consolas,monospace;padding:12px}
.panel{padding:18px}.panel h3{font:800 14px Consolas,monospace;letter-spacing:.06em;color:var(--gold);margin:3px 0 12px}.panel p{color:var(--dim);font-size:13px}.audit{background:#090e22;border:1px solid #3d3558;border-radius:9px;padding:12px;height:235px;overflow-y:auto;font:12px/1.75 Consolas,monospace}.entry{display:flex;justify-content:space-between;gap:10px;border-bottom:1px solid #282643;padding:7px 0}.entry span{color:#d7cde2}.entry b{color:var(--mint)}
.vip{margin-top:18px;padding:15px;border:1px solid #584272;border-radius:10px;background:#1b1736}.vip.locked{opacity:.63}.vip label{display:block;font:12px Consolas,monospace;color:var(--dim);margin:12px 0 5px}.vip input{width:100%;padding:12px;background:#0b1026;border:1px solid #666187;border-radius:8px;color:var(--mint);font:16px Consolas,monospace}.vip input:focus{outline:2px solid var(--gold)}.vip .btn{margin-top:14px;padding:13px;font-size:14px}
.status{margin-top:14px;min-height:42px;color:var(--mint);font:12px/1.5 Consolas,monospace;white-space:pre-wrap}.notes{color:#9b93b7;font:12px Consolas,monospace;margin-top:10px}
.win{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:15px;background:#080713f4;z-index:100}.win[hidden]{display:none}.result{color:#ffe39b;font:800 clamp(17px,3vw,25px) Consolas,monospace;overflow-wrap:anywhere;text-align:center;border:1px solid #fbd078;background:#181128;border-radius:12px;padding:34px;box-shadow:0 0 60px #dba75e44}
@media(max-width:820px){.cols{grid-template-columns:1fr}.reel{min-height:100px}.panel{order:2}.shell{padding:14px 10px}}
</style></head><body>
<main class="shell"><header class="bar"><div><div class="logo">LUCKY<em>.exe</em></div><div class="tag">CRYPTO ROYALE // TERMINAL 32</div></div><span class="pill">● MACHINE ONLINE</span></header>
<section class="intro"><h1>The House Always Wins</h1><p>Spin your luck. Then challenge the VIP prediction terminal.</p></section>
<div class="cols"><section class="machine" aria-label="Slot machine"><div class="mach-top"><h2>★ JACKPOT ★</h2><small>ALL-TIME PRIZE: 1,000,000 COINS</small></div>
<div class="reel-wrap"><div class="reels" id="reels"><div class="reel" id="r1">7</div><div class="reel" id="r2">★</div><div class="reel" id="r3">7</div></div>
<div class="readout"><small>LAST GENERATED TICKET // DECIMAL</small><b id="ticket">---------- </b></div></div>
<div class="metrics"><div class="metric"><small>AVAILABLE COINS</small><strong id="coins">100</strong></div><div class="metric"><small>RECORDED SPINS</small><strong id="spins">0</strong></div></div>
<div class="control"><button id="spin" class="btn">SPIN — 5 COINS</button><button id="reset" class="btn secondary">START NEW SESSION</button></div></section>
<aside class="panel"><h3>▸ TICKET AUDIT LOG</h3><p>The receipt printer is old, but it never forgets a number. The terminal runs on a legacy 32-bit sequence engine.</p>
<div id="audit" class="audit"><span class="tag">No receipts yet.</span></div>
<div class="vip locked" id="vip"><h3>🔒 VIP PREDICTION TERMINAL</h3><p id="vipstatus">Record 5 spins to unlock the terminal.</p>
<form id="prediction" autocomplete="off"><label for="first">NEXT TICKET NUMBER</label><input id="first" type="text" inputmode="numeric" pattern="[0-9]{1,10}" maxlength="10" placeholder="0000000000" required disabled>
<label for="second">TICKET AFTER THAT</label><input id="second" type="text" inputmode="numeric" pattern="[0-9]{1,10}" maxlength="10" placeholder="0000000000" required disabled>
<button id="predict" class="btn" type="submit" disabled>CLAIM THE JACKPOT</button></form>
<div class="notes" id="attempts"></div></div><div id="status" class="status" role="status">CONNECTING...</div></aside></div></main>
<div class="win" id="win" hidden><div class="result" id="flag"></div></div>
<script>
(function(){'use strict';
var byId=function(id){return document.getElementById(id);};
var endpoint=location.pathname.replace(/\/$/,'')+'/api';
var busy=false,last=null,anim=null;
async function call(action,payload){var r=await fetch(endpoint,{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.assign({action:action},payload||{}))});
var d=await r.json();if(!r.ok)throw Error(d.error||'Request failed');return d;}
function status(s){byId('status').textContent='> '+s;}
function show(s){last=s;byId('coins').textContent=s.coins;byId('spins').textContent=s.spins;
byId('ticket').textContent=s.tickets.length?s.tickets[s.tickets.length-1].value:'----------';
var list=byId('audit');list.replaceChildren();if(!s.tickets.length){list.textContent='No receipts yet.';}else{s.tickets.slice().reverse().forEach(function(t){var row=document.createElement('div');row.className='entry';
var n=document.createElement('span');n.textContent='#'+String(t.spin).padStart(3,'0');var v=document.createElement('b');v.textContent=t.value;row.append(n,v);list.append(row);});}
if(s.tickets.length){var reels=s.tickets[s.tickets.length-1].reels;['r1','r2','r3'].forEach(function(id,i){byId(id).textContent=reels[i];});}
byId('vip').classList.toggle('locked',!s.unlocked);byId('vipstatus').textContent=s.unlocked?'Predict the next TWO consecutive 32-bit decimal tickets.':'Record '+s.needed+' more spin(s) to unlock the terminal.';
byId('attempts').textContent=s.unlocked?'Predictions remaining: '+s.attemptsLeft+'/3':'';
byId('spin').disabled=busy||s.coins<s.price;
['first','second'].forEach(function(id){byId(id).disabled=busy||!s.unlocked||s.attemptsLeft<1;});byId('predict').disabled=busy||!s.unlocked||s.attemptsLeft<1;}
function lock(b){busy=b;byId('spin').disabled=b;byId('reset').disabled=b;byId('predict').disabled=b;if(last)show(last);}
byId('spin').addEventListener('click',async function(){if(busy)return;lock(true);byId('reels').classList.add('spinning');
var timer=setInterval(function(){['r1','r2','r3'].forEach(function(id){byId(id).textContent=['7','★','♦','♥','♣'][Math.floor(Math.random()*5)];});},85);
try{var d=await call('spin');await new Promise(function(resolve){setTimeout(resolve,700);});clearInterval(timer);byId('reels').classList.remove('spinning');
last=d.state;show(last);status(d.latest.reward?'MATCH! +'+d.latest.reward+' coins. Receipt #'+d.latest.spin:'No match. Receipt #'+d.latest.spin+' printed.');}
catch(e){clearInterval(timer);byId('reels').classList.remove('spinning');status('ERROR: '+e.message);}finally{lock(false);}});
byId('prediction').addEventListener('submit',async function(ev){ev.preventDefault();if(busy)return;lock(true);
try{var d=await call('predict',{first:byId('first').value.trim(),second:byId('second').value.trim()});
if(d.success){byId('flag').textContent=d.result;byId('win').hidden=false;return;}}
catch(e){status('VIP: '+e.message);try{var x=await call('state');show(x.state);}catch{}}finally{lock(false);}});
byId('reset').addEventListener('click',async function(){if(busy)return;if(!confirm('Begin a new casino session? Your receipts will be replaced.'))return;lock(true);
try{var d=await call('reset');byId('win').hidden=true;byId('first').value='';byId('second').value='';show(d.state);status('A new ticket sequence has been generated.');}
catch(e){status('ERROR: '+e.message);}finally{lock(false);}});
call('state').then(function(d){show(d.state);status('Casino online. Each spin prints a new ticket.');}).catch(function(e){status('CONNECTION ERROR: '+e.message);});
})();
</script></body></html>`;
