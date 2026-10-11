// Cipher Vault / isolated Cloudflare Pages Crypto CTF (no login secrets in GitHub)
// Public source exposes only the intentionally recoverable ciphertext.
const NOTE_CIPHERTEXT = 'IzIwbDlIYwIzRCMUXScSC0FBJBEpUmMENzZTEEw=';
const LOGIN_ACCOUNT = 'operator';
const encoder = new TextEncoder();
const RESP_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "default-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; connect-src 'self'; img-src 'self' data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'",
};
function response(body,status=200,type='text/html; charset=utf-8') {
  return new Response(body,{status,headers:{...RESP_HEADERS,'Content-Type':type}});
}
function json(obj,status=200){return response(JSON.stringify(obj),status,'application/json; charset=utf-8');}
function validAccess(ctx){
  const token=ctx.env?.CIPHER_VAULT_ACCESS_TOKEN;
  return typeof token==='string' && token.length>=20 && ctx.params?.access === token;
}
function gate(ctx){return validAccess(ctx)?null:response('Not found',404,'text/plain; charset=utf-8');}
const STYLE = `
:root{color-scheme:dark;--bg:#060913;--card:#101b2b;--line:#294355;--mint:#62fac4;--pale:#e1e9f5;--muted:#91a6ba;--red:#ff8292}
*{box-sizing:border-box}html,body{min-height:100%;margin:0}body{font:15px/1.5 'Segoe UI',Arial,sans-serif;background:radial-gradient(ellipse at 47% 5%,#19334c 0%,#0a1727 40%,#050914 95%);color:var(--pale)}
.wrap{min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:30px 16px 18px}
.brand{font:900 22px Consolas,monospace;letter-spacing:.14em;color:var(--mint);margin:24px 0 28px;text-align:center}
.panel{width:min(460px,100%);padding:35px 32px;background:linear-gradient(160deg,#112438,#0a1425);border:1px solid var(--line);border-radius:15px;box-shadow:0 24px 64px #0009}
.icon{width:57px;height:57px;border:1px solid #54e6b099;border-radius:16px;margin:0 auto 17px;display:flex;align-items:center;justify-content:center;font-size:29px;background:#0f3734}
h1{margin:0;text-align:center;font-size:24px;letter-spacing:.04em}p.sub{text-align:center;color:var(--muted);margin:8px auto 29px;font-size:13px;max-width:330px}
label{display:block;color:#bdd3e4;font:bold 12px Consolas,monospace;margin:16px 0 8px;letter-spacing:.04em}
input{width:100%;border-radius:7px;border:1px solid #385773;color:#fff;background:#060e1b;padding:13px;font:14px Consolas,monospace;outline:none}input:focus{border-color:var(--mint);box-shadow:0 0 0 2px #62fac427}
button{margin-top:24px;width:100%;padding:13px 12px;background:#19b68d;border:1px solid #67f8c5;border-radius:8px;color:#081c1a;font:bold 14px Consolas,monospace;cursor:pointer}button:hover{background:#5bf3be}button:disabled{opacity:.6;cursor:wait}
#notice{min-height:20px;margin-top:14px;text-align:center;font:12px Consolas,monospace;color:var(--red)}.fine{font:12px Consolas,monospace;color:var(--muted);text-align:center;margin:22px 0 0}
.site-bottom{position:fixed;right:8px;bottom:6px;width:auto;text-align:right;z-index:10}.site-bottom a{display:inline-block;font:9px/1.2 Consolas,monospace;letter-spacing:0;color:#64788a;text-decoration:none;opacity:.55;padding:2px 3px;border-radius:2px}.site-bottom a:hover,.site-bottom a:focus-visible{color:#a9f5da;opacity:1;outline:1px dotted #83d9b7;background:#0d1b2a}
.note{width:min(700px,100%);padding:32px;background:linear-gradient(135deg,#101f31,#0b1525);border:1px solid var(--line);border-radius:14px;box-shadow:0 22px 62px #0008}.note h1{text-align:left;font:800 24px Consolas,monospace;color:var(--mint);margin:0 0 12px}.note p{text-align:left;color:var(--muted);font-size:14px}
pre{font:13px/1.8 Consolas,monospace;color:#c7f6e4;background:#050e18;padding:18px;border:1px solid #284458;border-radius:8px;white-space:pre-wrap;overflow-wrap:anywhere}.meta{font:12px/1.8 Consolas,monospace;color:#abc4d3;margin:23px 0 12px}
#result{display:none;background:#051610;border:1px solid #408f72;border-radius:8px;padding:14px;margin-top:17px;text-align:center;color:var(--mint);font:600 14px Consolas,monospace;overflow-wrap:anywhere}
@media(max-width:520px){.panel,.note{padding:25px 19px}.brand{margin:12px 0 22px}}
`;
function page(body,title){return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${title}</title><style>${STYLE}</style></head><body>${body}</body></html>`;}
export function serveLogin(ctx){
  const denied=gate(ctx);if(denied)return denied;
  return response(page(`<main class="wrap"><div class="brand">CIPHER VAULT // ACCESS TERMINAL</div><section class="panel" aria-label="Vault login"><div class="icon">🔒</div><h1>ACCESS RESTRICTED</h1><p class="sub">The vault requires valid operator credentials.</p>
  <form id="login" autocomplete="off"><label for="username">USERNAME</label><input id="username" name="username" value="operator" maxlength="40" required spellcheck="false" autocomplete="off"><label for="password">PASSWORD</label><input id="password" name="password" type="password" placeholder="Enter password" maxlength="128" required autocomplete="off"><button id="submit" type="submit">UNLOCK VAULT</button><div id="notice" role="status" aria-live="polite"></div></form><div class="fine">SECURE LOGIN | AUTHENTICATION REQUIRED</div></section>
  <footer class="site-bottom"><a href="${new URL(ctx.request.url).pathname.replace(/\/?$/,'/')}note">ARCHIVED NOTE #07 ↗</a></footer></main>
  <script>(()=>{'use strict';const form=document.getElementById('login'),notice=document.getElementById('notice'),btn=document.getElementById('submit'),basePath=location.pathname.endsWith('/')?location.pathname.slice(0,-1):location.pathname;form.addEventListener('submit',async ev=>{ev.preventDefault();btn.disabled=true;notice.textContent='VERIFYING CREDENTIALS...';try{const r=await fetch(basePath+'/api',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',cache:'no-store',body:JSON.stringify({username:document.getElementById('username').value,password:document.getElementById('password').value})});const d=await r.json();if(!r.ok){notice.textContent=d.error||'ACCESS DENIED';return;}if(d.success&&typeof d.next==='string'&&d.next.startsWith(basePath+'/')){notice.textContent='ACCESS GRANTED — OPENING VAULT...';location.replace(d.next);}else{notice.textContent='Unexpected server response.';}}catch(e){notice.textContent='CONNECTION ERROR. TRY AGAIN.'}finally{btn.disabled=false;}});})();</script>`, 'Cipher Vault | Secure Access'));
}
export function serveNote(ctx){
  const denied=gate(ctx);if(denied)return denied;
  // Only the ciphertext is visible. The browser tab contains the decryption-key clue.
  const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>use me 2</title><style>body{margin:0;padding:18px;background:#070d17;color:#d7f6e9;font:16px/1.7 Consolas,monospace;overflow-wrap:anywhere}</style></head><body>'+NOTE_CIPHERTEXT+'</body></html>';
  return response(html);
}
function secureEqualHex(a,b){
  if(typeof b!=='string'||!/^([a-fA-F0-9]{64})$/.test(b))return false;
  let diff=0;for(let i=0;i<64;i++)diff|=a.charCodeAt(i)^b.toLowerCase().charCodeAt(i);return diff===0;
}
// Signed short-lived authorization cookie; stored HttpOnly and verified for protected page.
const AUTH_COOKIE = 'cipher_vault_auth';
function sessionPath(ctx) { return '/vault/' + ctx.params.access; }
function b64url(bytes) { return btoa(Array.from(bytes,b=>String.fromCharCode(b)).join('')).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
function fromB64url(str) {
  const base=str.replace(/-/g,'+').replace(/_/g,'/');
  const raw=atob(base.padEnd(Math.ceil(base.length/4)*4,'='));
  return Uint8Array.from(raw,c=>c.charCodeAt(0));
}
async function signToken(ctx, expires) {
  const secret=encoder.encode('cipher-session-v1|' + ctx.env.CIPHER_VAULT_FLAG + '|' + ctx.env.CIPHER_VAULT_PASSWORD_SHA256);
  const key=await crypto.subtle.importKey('raw',secret,{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const payload='v1.'+expires+'.'+ctx.params.access;
  return b64url(new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(payload))));
}
async function isSignedIn(ctx) {
  const cookies=ctx.request.headers.get('cookie')||'';
  const match=cookies.match(/(?:^|;\s*)cipher_vault_auth=(v1\.\d{10}\.\w[\w-]*)/);
  if(!match || !ctx.env?.CIPHER_VAULT_FLAG || !ctx.env?.CIPHER_VAULT_PASSWORD_SHA256)return false;
  const parts=match[1].split('.');
  if(parts.length!==3 || !/^[\w-]{43}$/.test(parts[2]))return false;
  const exp=Number(parts[1]);
  const now=Math.floor(Date.now()/1000);
  if(!Number.isSafeInteger(exp)||exp<=now||exp>now+901)return false;
  try {
    const expected=await signToken(ctx,exp);
    const a=fromB64url(parts[2]);
    const b=fromB64url(expected);
    // Cryptographic constant-time verification by deriving the expected HMAC and comparing bytes.
    if(a.length!==b.length)return false;
    let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];
    return diff===0;
  }catch{return false;}
}
export async function checkLogin(ctx){
  const denied=gate(ctx);if(denied)return denied;
  const {CIPHER_VAULT_PASSWORD_SHA256:passwordHash,CIPHER_VAULT_FLAG:flag}=ctx.env||{};
  if(!/^[a-fA-F0-9]{64}$/.test(passwordHash||'')||!/^CIR\{[^{}\s]{4,120}\}$/.test(flag||''))return json({error:'Vault configuration incomplete.'},503);
  if((ctx.request.headers.get('content-type')||'').split(';')[0].trim().toLowerCase()!=='application/json')return json({error:'Invalid request.'},415);
  if(Number(ctx.request.headers.get('content-length')||0)>1024)return json({error:'Invalid request.'},413);
  let input;try{const raw=await ctx.request.text();if(raw.length>1024)return json({error:'Invalid request.'},413);input=JSON.parse(raw)}catch{return json({error:'Invalid request.'},400)}
  if(!input||typeof input.username!=='string'||typeof input.password!=='string'||input.username.length>40||input.password.length>128)return json({error:'Invalid request.'},400);
  const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(input.password)));
  const digestHex=Array.from(digest).map(b=>b.toString(16).padStart(2,'0')).join('');
  const accepted=secureEqualHex(digestHex,passwordHash)&&input.username===LOGIN_ACCOUNT;
  if(!accepted)return json({error:'ACCESS DENIED — INVALID CREDENTIALS'},401);
  const exp=Math.floor(Date.now()/1000)+900;
  const signature=await signToken(ctx,exp);
  const cookie=`${AUTH_COOKIE}=v1.${exp}.${signature}; Path=${sessionPath(ctx)}; Max-Age=900; HttpOnly; Secure; SameSite=Strict`;
  return new Response(JSON.stringify({success:true,next:sessionPath(ctx)+'/welcome'}),{
    status:200, headers:{...RESP_HEADERS,'Content-Type':'application/json; charset=utf-8','Set-Cookie':cookie}
  });
}
const WELCOME_CSS=`
:root{color-scheme:dark;--ink:#e8faff;--mint:#6fe6d2;--rose:#f58bba}
*{box-sizing:border-box}
html,body{margin:0;min-height:100%;width:100%}
body{font-family:'Segoe UI',system-ui,Arial,sans-serif;color:var(--ink);background:#06101d;overflow-x:hidden}
.backdrop{position:fixed;inset:0;overflow:hidden;pointer-events:none;background:radial-gradient(ellipse 62% 65% at 50% 42%,#174558 0%,#0b2234 42%,#06111f 76%,#040912 100%)}
.backdrop:before{content:'';position:absolute;inset:-40%;opacity:.22;background:radial-gradient(circle at 37% 44%,#53e1d955 0%,transparent 28%),radial-gradient(circle at 68% 62%,#668cfa38 0%,transparent 24%);animation:lightshift 17s ease-in-out infinite alternate}
.backdrop:after{content:'';position:absolute;inset:0;opacity:.13;background-image:linear-gradient(#a3ffff35 1px,transparent 1px),linear-gradient(90deg,#a3ffff35 1px,transparent 1px);background-size:74px 74px;mask-image:radial-gradient(ellipse at 50% 51%,black,transparent 78%)}
.aura{position:fixed;left:50%;top:48%;width:min(82vw,780px);height:min(70vw,620px);transform:translate(-50%,-50%);border-radius:50%;background:#44d2bd17;filter:blur(80px);pointer-events:none;animation:aura 6s ease-in-out infinite alternate}
.sparks{position:fixed;inset:0;overflow:hidden;pointer-events:none}
.sparks span{position:absolute;width:3px;height:3px;border-radius:50%;background:#9dfae1a6;box-shadow:0 0 12px #5ff7d4a6;animation:twinkle 3s ease-in-out infinite alternate}
.welcome-center{min-height:100svh;display:flex;align-items:center;justify-content:center;padding:32px 20px;position:relative;isolation:isolate}
.welcome-card{position:relative;overflow:hidden;width:min(600px,100%);min-height:300px;padding:52px 38px 48px;display:flex;align-items:center;justify-content:center;flex-direction:column;border:1px solid #8ae9e43b;border-radius:24px;background:linear-gradient(142deg,#153548e8 0%,#0b1e31f2 50%,#081525f6 100%);box-shadow:0 25px 70px #000a,0 0 68px #4ffff311,inset 0 1px 0 #c0fff218;backdrop-filter:blur(12px);animation:rise .8s cubic-bezier(.18,.82,.23,1) both}
.welcome-card:before{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(110deg,transparent 16%,#ffffff08 47%,transparent 65%);transform:translateX(-115%);animation:sweep 6s 1.1s ease-in-out infinite}
.welcome-card:after{content:'';position:absolute;left:15%;right:15%;bottom:0;height:1px;background:linear-gradient(90deg,transparent,#76fae6ad,transparent)}
.seal{position:relative;display:grid;place-items:center;width:82px;height:82px;margin-bottom:25px;border-radius:50%;background:radial-gradient(circle at 50% 44%,#266d71a8,#0b343caa 75%);border:1px solid #7af4dc70;box-shadow:0 0 42px #4ae4d533,inset 0 0 24px #6cffe51c;animation:breath 4s ease-in-out infinite}
.seal:before{content:'';position:absolute;inset:-11px;border:1px solid #67e6d636;border-radius:50%;animation:ring 4s ease-in-out infinite}
.seal:after{content:'';position:absolute;inset:9px;border:1px solid #a0ffeb24;border-radius:50%}
.seal svg{position:relative;z-index:1;width:37px;height:37px;stroke:#b8fff0;stroke-width:2.6;fill:none;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 0 7px #5fffe4a0)}
.greeting{position:relative;margin:0;display:flex;flex-wrap:nowrap;align-items:baseline;justify-content:center;gap:.22em;font-size:clamp(36px,6vw,66px);font-weight:780;line-height:1.25;letter-spacing:-.048em;white-space:nowrap;color:#eaffff;text-align:center;text-shadow:0 3px 30px #93fff629}
.greeting .words{white-space:nowrap}
.greeting .smile{white-space:nowrap;color:var(--rose);letter-spacing:-.07em;font-weight:750;animation:smile 3.4s ease-in-out infinite}
.glow-line{height:2px;width:76px;margin-top:28px;border-radius:10px;background:linear-gradient(90deg,transparent,#79efdac0,transparent);box-shadow:0 0 16px #3deecb77;animation:linelight 4s ease-in-out infinite}
@keyframes rise{from{opacity:0;transform:translateY(24px) scale(.965)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes breath{50%{box-shadow:0 0 58px #4ae4d54d,inset 0 0 26px #6cffe52b;transform:translateY(-3px)}}
@keyframes ring{50%{transform:scale(1.07);opacity:.65}}
@keyframes smile{50%{text-shadow:0 0 20px #ff82bb7d}}
@keyframes linelight{50%{opacity:.5;width:115px}}
@keyframes sweep{0%,58%,100%{transform:translateX(-115%)}80%{transform:translateX(115%)}}
@keyframes twinkle{50%{opacity:.2;transform:translateY(-8px)}}
@keyframes aura{to{opacity:.55;filter:blur(105px)}}
@keyframes lightshift{to{transform:translate(5%,3%) scale(1.12)}}
@media(max-width:480px){.welcome-center{padding:20px 12px}.welcome-card{padding:42px 14px 40px;min-height:280px;border-radius:18px}.greeting{font-size:clamp(29px,8.5vw,42px);letter-spacing:-.055em}.seal{width:70px;height:70px}.seal svg{width:30px;height:30px}}
@media(max-height:420px){.welcome-center{padding:15px}.welcome-card{min-height:0;padding:25px}.seal{width:54px;height:54px;margin-bottom:12px}.glow-line{margin-top:13px}}
@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important;transition:none!important}}
`;
// Service archive payload.
const ARCHIVE = Array.from({length:14000},(_,i)=>{
  const a=((i*2654435761)>>>0).toString(16).padStart(8,'0');
  const b=(((i+971)*1103515245+12345)>>>0).toString(16).padStart(8,'0');
  const c=(((i+2741)*48271)>>>0).toString(16).padStart(8,'0');
  return `{"sequence":${i+100001},"nonce":"${a}${c}","checksum":"${b}${a}","status":"archived","partition":"v_${i%19}"}`;
});
export async function serveWelcome(ctx){
  const denied=gate(ctx);if(denied)return denied;
  if(!await isSignedIn(ctx))return response('Authentication required',401,'text/plain; charset=utf-8');
  // Build the private stage response at request time.
  const flagB64=btoa(Array.from(encoder.encode(ctx.env.CIPHER_VAULT_FLAG),b=>String.fromCharCode(b)).join(''));
  const specialKey=['birth','day'].join('');
  const rows=ARCHIVE.slice();
  rows.splice(7303,0,`{"sequence":107304,"${specialKey}":"${flagB64}","status":"archived"}`);
  const records=rows.join(',\n');
  const bits=Array.from({length:18},(_,i)=>`<span style="left:${(i*41+19)%100}%;top:${(i*31+13)%100}%;animation-duration:${3+i%5}s;animation-delay:-${i*.46}s"></span>`).join('');
  const body=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>ACCESS GRANTED</title><style>${WELCOME_CSS}</style></head><body><div class="backdrop" aria-hidden="true"></div><div class="aura" aria-hidden="true"></div><div class="sparks" aria-hidden="true">${bits}</div><main class="welcome-center"><section class="welcome-card" aria-label="Access granted"><div class="seal" aria-hidden="true"><svg viewBox="0 0 40 40"><path d="M9 20.5 17 28l15-16"/></svg></div><h1 class="greeting"><span class="words">hello sir</span><span class="smile">:)</span></h1><div class="glow-line" aria-hidden="true"></div></section></main>
<script type="application/json" id="archived-runtime-records">[
${records}
]</script></body></html>`;
  return response(body);
}
