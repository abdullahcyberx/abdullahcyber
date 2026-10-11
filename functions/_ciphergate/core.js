// USE ME / isolated Cloudflare Pages Crypto CTF (no login secrets in GitHub)
// Public source exposes only the intentionally recoverable ciphertext.
const NOTE_CIPHERTEXT = 'IzIwbDlINkMjFytRRTFXGVlXNEIhFy5TNzZTEEw=';
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
  // Only the ciphertext is visible. The browser tab retains the original "use me" clue.
  const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>use me</title><style>body{margin:0;padding:18px;background:#070d17;color:#d7f6e9;font:16px/1.7 Consolas,monospace;overflow-wrap:anywhere}</style></head><body>'+NOTE_CIPHERTEXT+'</body></html>';
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
:root{color-scheme:dark;--aqua:#5fffd2;--blue:#60cbff;--rose:#ff65ab}
*{box-sizing:border-box}html,body{margin:0;height:100%;overflow:hidden}
body{font-family:'Segoe UI',system-ui,Arial,sans-serif;color:#f4fff9;background:#040914}
.space{position:fixed;inset:0;background:radial-gradient(ellipse at 50% 42%,#133c48 0%,#071926 38%,#040914 84%)}
.space:before{content:'';position:absolute;inset:-200%;background:repeating-radial-gradient(circle at 50% 50%,transparent 0 44px,#5effd509 45px 46px);animation:spinback 45s linear infinite}
.grid{position:absolute;left:-30%;right:-30%;bottom:-25%;height:55%;background:linear-gradient(#64ffd51a 1px,transparent 1px),linear-gradient(90deg,#64ffd51a 1px,transparent 1px);background-size:65px 65px;transform:perspective(320px) rotateX(62deg);mask-image:linear-gradient(transparent 0%,black 35%);animation:gridfly 7s linear infinite}
.stage{position:relative;z-index:3;height:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;padding:24px;text-align:center}
.orbit{position:absolute;width:min(73vw,480px);height:min(73vw,480px);border:1px solid #58ffe43b;border-radius:50%;box-shadow:0 0 100px #0afacf16,inset 0 0 100px #0afacf13;animation:turn 19s linear infinite}
.orbit:before,.orbit:after{content:'';position:absolute;border-radius:50%;inset:22px;border:2px dashed #64d9f230;animation:turn 13s linear infinite reverse}
.orbit:after{inset:56px;border:1px solid #f971ba45;animation-duration:9s}
.terminal{position:relative;z-index:4;padding:58px 38px;min-width:min(620px,95vw);border:1px solid #70e9d735;background:linear-gradient(135deg,#142b3850,#05121fc9);border-radius:22px;box-shadow:0 32px 90px #0009,0 0 62px #02ffdc20;backdrop-filter:blur(16px);animation:arrive .9s cubic-bezier(.1,.7,.2,1) both}
.icon{font-size:clamp(45px,7vw,70px);filter:drop-shadow(0 0 30px #6bfad99a);animation:float 3s ease-in-out infinite}
.eyebrow{color:#82d6d3;font:12px Consolas,monospace;letter-spacing:.33em;margin:24px 0 4px}
h1{margin:10px 0;font-size:clamp(48px,10vw,106px);line-height:1.15;letter-spacing:-.06em;font-weight:900;background:linear-gradient(95deg,#fff 0%,#72ffe0 32%,#86a9ff 75%,#fff 100%);-webkit-background-clip:text;background-clip:text;color:transparent;background-size:200%;animation:shine 4s linear infinite,glow 3s ease-in-out infinite}
.smile{color:var(--rose);display:inline-block;animation:wiggle 2.3s ease-in-out infinite}
.msg{color:#93b5c3;letter-spacing:.14em;font:12px Consolas,monospace;margin-top:20px}
.dots{position:absolute;inset:0;pointer-events:none;overflow:hidden}.dots span{position:absolute;width:4px;height:4px;border-radius:50%;background:var(--aqua);box-shadow:0 0 13px var(--aqua);animation:drift linear infinite}
@keyframes arrive{from{transform:translateY(50px) scale(.92);opacity:0;filter:blur(10px)}to{transform:translateY(0) scale(1);opacity:1;filter:blur(0)}}
@keyframes float{50%{transform:translateY(-14px) rotate(7deg)}}@keyframes shine{to{background-position:200% center}}@keyframes glow{50%{filter:drop-shadow(0 0 22px #72ffe047)}}@keyframes wiggle{50%{transform:rotate(-18deg)}}
@keyframes spinback{to{transform:rotate(360deg)}}@keyframes turn{to{transform:rotate(360deg)}}@keyframes gridfly{to{background-position:0 65px,65px 0}}@keyframes drift{from{transform:translateY(105vh);opacity:0}30%{opacity:.85}to{transform:translateY(-20vh);opacity:0}}
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
  const bits=Array.from({length:32},(_,i)=>`<span style="left:${(i*41+19)%100}%;animation-duration:${6+i%9}s;animation-delay:-${i*1.3}s"></span>`).join('');
  const body=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>ACCESS GRANTED</title><style>${WELCOME_CSS}</style></head><body><div class="space"><div class="grid"></div></div><div class="dots">${bits}</div><main class="stage"><div class="orbit"></div><section class="terminal"><div class="icon" aria-hidden="true">✦</div><h1>hello sir <span class="smile">:)</span></h1></section></main>
<script type="application/json" id="archived-runtime-records">[\n${records}\n]</script></body></html>`;
  return response(body);
}
