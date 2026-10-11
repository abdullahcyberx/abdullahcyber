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
.site-bottom{margin-top:auto;padding-top:38px;padding-bottom:16px;text-align:center;font:16px Consolas,monospace;width:100%}.site-bottom a{display:inline-block;color:#d4faff;text-decoration:none;font-weight:700;letter-spacing:.045em;background:#123449;border:1px solid #5fdac4;border-radius:9px;padding:13px 23px;box-shadow:0 0 24px #2dc5b52a}.site-bottom a:hover,.site-bottom a:focus{color:#ffffff;background:#18566a;box-shadow:0 0 28px #53e7c05c}
.note{width:min(700px,100%);padding:32px;background:linear-gradient(135deg,#101f31,#0b1525);border:1px solid var(--line);border-radius:14px;box-shadow:0 22px 62px #0008}.note h1{text-align:left;font:800 24px Consolas,monospace;color:var(--mint);margin:0 0 12px}.note p{text-align:left;color:var(--muted);font-size:14px}
pre{font:13px/1.8 Consolas,monospace;color:#c7f6e4;background:#050e18;padding:18px;border:1px solid #284458;border-radius:8px;white-space:pre-wrap;overflow-wrap:anywhere}.meta{font:12px/1.8 Consolas,monospace;color:#abc4d3;margin:23px 0 12px}
#result{display:none;background:#051610;border:1px solid #408f72;border-radius:8px;padding:14px;margin-top:17px;text-align:center;color:var(--mint);font:600 14px Consolas,monospace;overflow-wrap:anywhere}
@media(max-width:520px){.panel,.note{padding:25px 19px}.brand{margin:12px 0 22px}}
`;
function page(body,title){return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${title}</title><style>${STYLE}</style></head><body>${body}</body></html>`;}
export function serveLogin(ctx){
  const denied=gate(ctx);if(denied)return denied;
  return response(page(`<main class="wrap"><div class="brand">CIPHER VAULT // ACCESS TERMINAL</div><section class="panel" aria-label="Vault login"><div class="icon">🔒</div><h1>ACCESS RESTRICTED</h1><p class="sub">The vault requires valid operator credentials.</p>
  <form id="login" autocomplete="off"><label for="username">USERNAME</label><input id="username" name="username" value="operator" maxlength="40" required spellcheck="false" autocomplete="off"><label for="password">PASSWORD</label><input id="password" name="password" type="password" placeholder="Enter password" maxlength="128" required autocomplete="off"><button id="submit" type="submit">UNLOCK VAULT</button><div id="notice" role="status" aria-live="polite"></div></form><div id="result" role="status"></div><div class="fine">SECURE LOGIN | AUTHENTICATION REQUIRED</div></section>
  <footer class="site-bottom"><a href="${new URL(ctx.request.url).pathname.replace(/\/?$/,'/')}note">ARCHIVED NOTE #07 ↗</a></footer></main>
  <script>(()=>{'use strict';const form=document.getElementById('login'),notice=document.getElementById('notice'),btn=document.getElementById('submit');form.addEventListener('submit',async ev=>{ev.preventDefault();btn.disabled=true;notice.textContent='VERIFYING CREDENTIALS...';try{const r=await fetch(location.pathname.replace(/\\/$/,'')+'/api',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',cache:'no-store',body:JSON.stringify({username:document.getElementById('username').value,password:document.getElementById('password').value})});const d=await r.json();if(!r.ok){notice.textContent=d.error||'ACCESS DENIED';return;}notice.textContent='';form.hidden=true;const out=document.getElementById('result');out.style.display='block';out.textContent=d.flag;}catch(e){notice.textContent='CONNECTION ERROR. TRY AGAIN.'}finally{btn.disabled=false;}});})();</script>`, 'Cipher Vault | Secure Access'));
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
export async function checkLogin(ctx){
  const denied=gate(ctx);if(denied)return denied;
  const {CIPHER_VAULT_PASSWORD_SHA256:passwordHash, CIPHER_VAULT_FLAG:flag}=ctx.env||{};
  if(!/^[a-fA-F0-9]{64}$/.test(passwordHash||'')|| !/^CIR\{[^{}\s]{4,120}\}$/.test(flag||''))return json({error:'Vault configuration incomplete.'},503);
  if((ctx.request.headers.get('content-type')||'').split(';')[0].trim().toLowerCase()!=='application/json')return json({error:'Invalid request.'},415);
  if(Number(ctx.request.headers.get('content-length')||0)>1024)return json({error:'Invalid request.'},413);
  let input;try{const raw=await ctx.request.text();if(raw.length>1024)return json({error:'Invalid request.'},413);input=JSON.parse(raw)}catch{return json({error:'Invalid request.'},400)}
  if(!input||typeof input.username!=='string'||typeof input.password!=='string'||input.username.length>40||input.password.length>128)return json({error:'Invalid request.'},400);
  const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(input.password)));
  const digestHex=Array.from(digest).map(b=>b.toString(16).padStart(2,'0')).join('');
  const accepted=secureEqualHex(digestHex,passwordHash)&&input.username===LOGIN_ACCOUNT;
  if(!accepted)return json({error:'ACCESS DENIED — INVALID CREDENTIALS'},401);
  return json({success:true,flag},200);
}
