const GAME_HTML = "<!DOCTYPE html>\n<html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n<title>HEADSHOT.EXE — The Endless Range</title>\n<style>\n:root{color-scheme:dark;--bg:#060b16;--panel:#0b1524;--line:#27425f;--mint:#57f5be;--sky:#5fc8ff;--orange:#ffba6f;--red:#fa627c;--light:#e7f0ff;--muted:#8aa2b7}\n*{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(circle at 50% 0%,#163250 0%,#090f1e 44%,#050912 100%);font:15px/1.5 'Segoe UI',Arial,sans-serif;color:var(--light)}\nbody:before{content:'';position:fixed;inset:0;pointer-events:none;opacity:.14;background:repeating-linear-gradient(0deg,transparent 0 3px,#85cafe0f 3px 4px);z-index:30}\n.page{max-width:1180px;margin:0 auto;padding:22px 18px 28px}.topbar{display:flex;justify-content:space-between;gap:15px;align-items:center;margin-bottom:14px;flex-wrap:wrap}\n.brand{font-weight:900;letter-spacing:.16em;font-size:clamp(20px,3vw,29px);color:#e5f8ff}.brand em{color:var(--mint);font-style:normal}.tiny{font:12px Consolas,monospace;color:var(--muted)}\n.pill{border:1px solid #3b647e;background:#0a1a2c;border-radius:100px;padding:7px 13px;color:var(--mint);font:12px Consolas,monospace}\n.grid{display:grid;grid-template-columns:minmax(0,1fr) 255px;gap:15px}.stagebox,.side{border:1px solid var(--line);border-radius:12px;background:linear-gradient(135deg,#0e2031,#08101d);box-shadow:0 20px 70px #0007;overflow:hidden}\n.hud{padding:13px 18px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:9px}.hud strong{color:var(--mint);letter-spacing:.12em}.hud .current{color:var(--orange)}\n.arena{position:relative;min-height:520px;height:min(67vh,650px);overflow:hidden;cursor:crosshair;background:radial-gradient(ellipse at 50% 70%,#25405d 0%,#102134 31%,#08111d 70%),linear-gradient(90deg,#12283b,#091525)}\n.arena:after{content:'';pointer-events:none;position:absolute;inset:0;background:linear-gradient(90deg,#071625ab 0 1px,transparent 1px 76px),linear-gradient(#101e32ab 0 1px,transparent 1px 76px);background-size:76px 76px;opacity:.4}\n.horizon{position:absolute;left:0;right:0;bottom:21%;height:1px;background:#4f77934c;box-shadow:0 0 30px #51acee66}.light-top{position:absolute;inset:0 0 auto;height:28%;background:linear-gradient(#5fb7ff0c,transparent);pointer-events:none}\n.crosshair{position:absolute;left:50%;top:48%;width:34px;height:34px;border:1px solid #ffffff66;border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:5}.crosshair:before,.crosshair:after{content:'';position:absolute;background:var(--mint)}.crosshair:before{top:50%;left:-8px;width:48px;height:1px}.crosshair:after{left:50%;top:-8px;height:48px;width:1px}\n.target{position:absolute;width:150px;height:260px;left:50%;top:43%;transform:translate(-50%, -43px);z-index:4;transition:left .12s ease,top .12s ease;filter:drop-shadow(0 0 13px #3af3d044)}\n.target .head{position:absolute;width:86px;height:87px;left:32px;top:0;border:3px solid #c8e7e7;background:linear-gradient(135deg,#233b48,#53727b 51%,#213c4a);border-radius:47% 47% 42% 42%;cursor:crosshair;z-index:6;box-shadow:inset 0 -9px 20px #13202f}\n.target .visor{position:absolute;top:31px;left:7px;right:7px;height:21px;border-radius:5px;background:var(--mint);box-shadow:0 0 14px #57f5be88}\n.target .head:after{content:'';position:absolute;top:39px;left:24px;width:26px;height:3px;background:#083a43;opacity:.6}\n.target .neck{position:absolute;top:83px;left:61px;width:30px;height:24px;background:#92bbc2}.target .torso{position:absolute;top:100px;left:13px;width:125px;height:119px;border-radius:21px 21px 12px 12px;border:3px solid #79a2ac;background:linear-gradient(135deg,#264c65,#153043 65%,#0a1e2d);z-index:2}.target .torso:after{content:'RANGE / AI';position:absolute;top:43px;left:17px;font:11px Consolas,monospace;letter-spacing:1px;color:#8bf5d2}\n.target .leg{position:absolute;top:205px;width:35px;height:55px;background:#244b61;border:2px solid #83abb2}.target .leg.left{left:28px}.target .leg.right{right:28px}\n.target .arm{position:absolute;top:110px;height:112px;width:29px;background:#21455b;border:2px solid #83abb2}.target .arm.left{left:0;transform:rotate(8deg)}.target .arm.right{right:0;transform:rotate(-8deg)}\n.target.hit .head{box-shadow:0 0 35px var(--orange);background:#a7eec7}.target.final .visor{background:#ff4f70;box-shadow:0 0 20px #ff4f70}\n.stage-sign{position:absolute;top:18px;left:18px;font:12px Consolas,monospace;color:#bad1e0;letter-spacing:1px}\n.prompt{position:absolute;top:60px;left:50%;transform:translateX(-50%);font:900 clamp(20px,4vw,41px) 'Segoe UI',sans-serif;letter-spacing:.08em;text-align:center;color:#ff6f87;text-shadow:0 0 22px #ff385d77;opacity:0;transition:opacity .2s;z-index:9;width:90%;pointer-events:none}.prompt.show{opacity:1}\n.shot-ring{position:absolute;width:42px;height:42px;border:2px solid #ffe1a1;border-radius:50%;pointer-events:none;transform:translate(-50%,-50%);animation:ring .4s ease-out forwards;z-index:8}@keyframes ring{to{opacity:0;transform:translate(-50%,-50%) scale(2.2)}}\n#weapon{position:absolute;z-index:10;bottom:-8px;left:50%;transform:translateX(-50%);width:235px;height:200px;pointer-events:none;filter:drop-shadow(0 12px 18px #000c)}\n.gun-sight{position:absolute;width:48px;height:78px;background:linear-gradient(90deg,#0b1725,#405268 50%,#07121e);border:4px solid #314960;border-radius:10px;left:94px;top:0}.gun-slide{position:absolute;left:54px;top:42px;width:130px;height:85px;background:linear-gradient(110deg,#45566c,#162d42 42%,#081422);border:4px solid #687b86;clip-path:polygon(17% 0,84% 0,100% 100%,0% 100%)}.gun-grip{position:absolute;left:71px;top:113px;width:94px;height:100px;background:linear-gradient(90deg,#102034,#435c69,#0e1d2c);clip-path:polygon(13% 0,87% 0,100% 100%,0 100%);border-radius:8px}\n.weapon-label{position:absolute;bottom:7px;left:50%;transform:translateX(-50%);z-index:11;font:10px Consolas,monospace;color:#a6b1c7;letter-spacing:1px;pointer-events:none}\n.tipline{border-top:1px solid var(--line);padding:12px 18px;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;font:12px Consolas,monospace;color:var(--muted)}\n.side{padding:18px}.side h3{font:700 14px Consolas,monospace;color:var(--sky);letter-spacing:.08em;margin:0 0 15px}.stat{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #25435c;font:13px Consolas,monospace}.stat b{color:var(--mint)}\n.level-list{display:grid;gap:9px;margin:18px 0}.level-item{display:flex;gap:11px;align-items:center;padding:10px;border:1px solid #2b4257;border-radius:8px;color:#839fb7;font:12px Consolas,monospace}.level-item .num{font-weight:800;color:#a8bdca}.level-item.active{border-color:#53ddbd;color:var(--mint);background:#133337}.level-item.done{color:#a2d6c6}.level-item.done .num{color:var(--mint)}\n.status{min-height:120px;border:1px solid #2b455b;border-radius:8px;background:#07131e;padding:12px;white-space:pre-wrap;font:12px/1.65 Consolas,monospace;color:#c6ecdd}\n.btn{font:700 13px Consolas,monospace;border:1px solid #68e8c3;padding:12px 16px;background:#12382f;color:#9bffdf;border-radius:7px;cursor:pointer;width:100%;margin-top:14px}.btn:hover{background:#1c5a49}\n.subtle{font:12px/1.6 Consolas,monospace;color:#8da4b8;margin-top:14px}\n.overlay{position:fixed;inset:0;background:#020711;z-index:40;display:flex;align-items:center;justify-content:center;padding:20px}.overlay.hidden{display:none}.modal{width:min(550px,100%);padding:35px;border:1px solid #57f5be;border-radius:15px;background:#0c2030;box-shadow:0 0 75px #1bb7ab24;text-align:center}.modal h1{margin:5px 0;color:var(--mint);font-size:clamp(24px,6vw,42px)}.modal p{color:#c2d6e6}.end-value{background:#020e16;border:1px dashed #80fdd4;padding:17px;overflow-wrap:anywhere;font:700 20px Consolas,monospace;color:#f9d282}.foot{text-align:center;margin:16px;color:#6a839a;font:12px Consolas,monospace}\n@media(max-width:760px){.grid{grid-template-columns:1fr}.arena{height:490px;min-height:490px}.side{order:2}.page{padding:12px}.target{transform:translate(-50%,-43px)}}\n</style></head><body>\n<div class=\"page\"><header class=\"topbar\"><div><div class=\"brand\">HEADSHOT<em>.EXE</em></div></div><div class=\"pill\" id=\"connection\">● SERVER CONNECTED</div></header>\n<div class=\"grid\"><section class=\"stagebox\"><div class=\"hud\"><strong id=\"level-name\">LOADING...</strong><span class=\"current\" id=\"shot-progress\">CONNECTING</span></div>\n<div class=\"arena\" id=\"arena\"><div class=\"light-top\"></div><div class=\"horizon\"></div><div class=\"stage-sign\" id=\"stage-sign\">TRAINING STAGE</div>\n<div class=\"prompt\" id=\"prompt\"></div><div class=\"crosshair\"></div>\n<div class=\"target\" id=\"target\" aria-label=\"hologram training opponent\"><div class=\"head\" id=\"target-head\"><div class=\"visor\"></div></div><div class=\"neck\"></div><div class=\"torso\"></div><div class=\"arm left\"></div><div class=\"arm right\"></div><div class=\"leg left\"></div><div class=\"leg right\"></div></div>\n\n<div id=\"weapon\"><div class=\"gun-sight\"></div><div class=\"gun-slide\"></div><div class=\"gun-grip\"></div></div>\n<div class=\"weapon-label\">VIRTUAL SIDEARM / ACTIVE</div></div>\n<div class=\"tipline\"><span>LEFT CLICK: FIRE // AIM FOR THE HOLOGRAM HEAD</span><span>SYSTEM: ACTIVE</span></div></section>\n<aside class=\"side\"><h3>// MISSION CONTROL</h3><div class=\"stat\"><span>STAGE</span><b id=\"stage-stat\">01 / 04</b></div><div class=\"stat\"><span>HEADSHOTS</span><b id=\"hit-stat\">0 / 3</b></div><div class=\"stat\"><span>SHOTS FIRED</span><b id=\"shots-stat\">0</b></div>\n<div class=\"level-list\" id=\"level-list\"></div><h3>// SIMULATION FEED</h3><div class=\"status\" id=\"message\" role=\"status\" aria-live=\"polite\">Initializing neural range…</div><button class=\"btn\" id=\"reset\">RESTART SIMULATION</button></aside></div>\n</div>\n<div class=\"overlay hidden\" id=\"end-overlay\"><div class=\"modal\"><div class=\"end-value\" id=\"end-value\"></div></div></div>\n<script>\n(()=>{\n'use strict';\nconst $=id=>document.getElementById(id);\nconst arena=$('arena'),target=$('target'),prompt=$('prompt'),equipment=$('weapon');\nconst names=['CALIBRATION RANGE','MOVING TARGET','PHANTOM ARENA','THE FINAL GATE'];\nconst required=[3,4,5,0];\nlet state=null, busy=false, motionTimer=null, finishing=false, promptTimeout=null, gateKey=null;\nconst GAME_API = location.pathname.replace(/\\/$/, '') + '/api';\nasync function api(action, payload={}) {\n const r=await fetch(GAME_API,{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json','X-Headshot-Client':'1'},body:JSON.stringify({action,...payload})});\n const data=await r.json();\n if(!r.ok)throw Error(data.error||'Network error');\n return data;\n}\nfunction log(msg){$('message').textContent='> '+msg;}\nfunction draw(){if(!state)return;\n const level=state.level;\n $('level-name').textContent='// '+names[level-1];\n $('stage-stat').textContent=String(level).padStart(2,'0')+' / 04';\n $('hit-stat').textContent=level<4?state.hits+' / '+state.required:'LOCKED';\n $('shots-stat').textContent=state.shots;\n $('shot-progress').textContent=level<4?`HEADSHOTS ${state.hits} / ${state.required}`:'EXIT PROTOCOL LOCKED';\n $('stage-sign').textContent='TRAINING STAGE '+String(level).padStart(2,'0');\n $('level-list').replaceChildren(...names.map((n,i)=>{let d=document.createElement('div');d.className='level-item '+(i+1===level?'active':i+1<level?'done':'');let k=document.createElement('span');k.className='num';k.textContent=i+1<level?'✓':String(i+1).padStart(2,'0');let t=document.createElement('span');t.textContent=n;d.append(k,t);return d;}));\n target.classList.toggle('final',level===4);positionTarget();\n clearInterval(motionTimer);motionTimer=null;\n if(level===2||level===3)motionTimer=setInterval(moveTarget,level===2?1100:660);\n if(level===4){log('FINAL ROUND INITIALIZED.');if(!equipment.isConnected)arena.append(equipment);}\n}\nfunction positionTarget(){if(!state?.target)return;target.style.left=state.target.x+'%';target.style.top=state.target.y+'%';}\nasync function moveTarget(){if(!state || state.level===4 || busy || finishing)return;busy=true;try{state=await api('track');positionTarget();}catch(e){log('ERROR: '+e.message);}finally{busy=false;}}\nfunction ring(x,y){let r=document.createElement('div');r.className='shot-ring';r.style.left=x+'px';r.style.top=y+'px';arena.append(r);setTimeout(()=>r.remove(),480);}\nasync function fire(ev){if(busy||!state||state.won||finishing)return;const a=arena.getBoundingClientRect();ring(ev.clientX-a.left,ev.clientY-a.top);\n const p={x:((ev.clientX-a.left)/a.width)*100,y:((ev.clientY-a.top)/a.height)*100,shotId:state.shotId};busy=true;\n try{let d=await api('shoot',p);state=d.state;log(d.message);if(d.hit){target.classList.add('hit');setTimeout(()=>target.classList.remove('hit'),180);}\n   if(state.level===4 && d.loop){gateKey=d.receipt||gateKey;prompt.textContent=d.message;prompt.classList.add('show');clearTimeout(promptTimeout);promptTimeout=setTimeout(()=>prompt.classList.remove('show'),2300);}\n   if(d.advanced){gateKey=null;draw();}else{positionTarget();$('hit-stat').textContent=state.level<4?state.hits+' / '+state.required:'LOCKED';$('shots-stat').textContent=state.shots;$('shot-progress').textContent=state.level<4?`HEADSHOTS ${state.hits} / ${state.required}`:'EXIT PROTOCOL LOCKED'; }\n }catch(e){log('ERROR: '+e.message);}finally{busy=false;}\n}\nasync function reachExit(){if(finishing||!state||state.level!==4)return;finishing=true;\n try{const d=await api('checkpoint',{receipt:gateKey});gateKey=null;state=null;$('end-value').textContent=d.result;$('end-overlay').classList.remove('hidden');clearInterval(motionTimer);}\n catch(e){finishing=false;log('ERROR: '+e.message);}\n}\nconst domWatcher=new MutationObserver(records=>{if(!state||state.level!==4||finishing)return;for(const record of records){for(const node of record.removedNodes){if(node===equipment){reachExit();return;}}}});\ndomWatcher.observe(arena,{childList:true});\narena.addEventListener('click',fire);\n$('reset').addEventListener('click',async()=>{if(!confirm('Reset all four stages?'))return;try{state=await api('reset',{});gateKey=null;$('end-overlay').classList.add('hidden');finishing=false;prompt.classList.remove('show');if(!equipment.isConnected)location.reload();else{draw();log('SIMULATION RESET. Begin stage 1.');}}catch(e){log(e.message);}});\napi('state').then(s=>{state=s;draw();if(state.level===1){log('Aim for the head of the hologram.');}}).catch(e=>{log('FAILED TO CONNECT: '+e.message);$('connection').textContent='● DISCONNECTED';});\n})();\n</script></body></html>";
const LIMITS = [3, 4, 5];
const SHOT_DELAYS_MS = [210, 240, 260];
const TRACK_DELAYS_MS = [0, 1100, 660];
const COOKIE_NAME = 'headshot_ctf';
const textEncoder = new TextEncoder();

const BASE_HEADERS = {
  'Cache-Control': 'no-store, private, max-age=0',
  'Pragma': 'no-cache',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Content-Security-Policy': "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'none'",
};

function hasSecrets(ctx) {
  return typeof ctx.env?.HEADSHOT_ACCESS_TOKEN === 'string' && ctx.env.HEADSHOT_ACCESS_TOKEN.length >= 24
    && typeof ctx.env?.HEADSHOT_SESSION_KEY === 'string' && ctx.env.HEADSHOT_SESSION_KEY.length >= 32
    && /^CIR\{[A-Za-z0-9_-]{8,100}\}$/.test(ctx.env?.HEADSHOT_FLAG || '');
}

function isAllowed(ctx) {
  return hasSecrets(ctx) && ctx.params?.access === ctx.env.HEADSHOT_ACCESS_TOKEN;
}

const response = (body, status = 200, extra = {}) => new Response(body, {
  status, headers: { ...BASE_HEADERS, ...extra },
});
const json = (body, status = 200, extra = {}) => response(JSON.stringify(body), status, {
  'Content-Type': 'application/json; charset=utf-8', ...extra,
});

function brokenConfiguration(ctx) {
  // Avoid serving pages if secrets are missing. No secret values in errors.
  return !hasSecrets(ctx) ? response('Not available.', 503, {'Content-Type':'text/plain'}) : null;
}
function forbiddenOrNotFound(ctx) {
  return brokenConfiguration(ctx) || (isAllowed(ctx) ? null : response('Not found.', 404, {'Content-Type':'text/plain'}));
}

function randomId() {
  return toB64url(crypto.getRandomValues(new Uint8Array(16)));
}
function newState() {
  return { level:1, hits:0, shots:0, won:false, target:{x:50,y:43},
    shotId:randomId(), readyAt:Date.now()+300, movedAt:Date.now(),
    gateId:null, gateAt:0 };
}
function publicState(s) {
  return { level:s.level, hits:s.hits, shots:s.shots, won:false,
    required:s.level<=3?LIMITS[s.level-1]:0, target:s.target,
    shotId:s.shotId };
}
function movePosition(s, now, newLevel=false) {
  if (s.level===1 || s.level===4) s.target={x:50,y:43};
  else s.target={x:Math.round(22+Math.random()*56),y:Math.round(34+Math.random()*22)};
  s.shotId=randomId();
  s.movedAt=now;
  s.readyAt=newLevel?now+350:Math.max(s.readyAt,now);
}
function toB64url(data) {
  let s = '';
  for (const n of data) s += String.fromCharCode(n);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function fromB64url(s) {
  if (!/^[a-zA-Z0-9_-]+$/.test(s)) throw new Error('Invalid encoding');
  const raw = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4-s.length%4)%4));
  return Uint8Array.from(raw, c => c.charCodeAt(0));
}
async function hmacKey(secret) {
  return crypto.subtle.importKey('raw', textEncoder.encode(secret), {name:'HMAC',hash:'SHA-256'}, false, ['sign','verify']);
}
function cookieValue(cookie, key) {
  const part = cookie.split(';').map(x => x.trim()).find(x => x.startsWith(key+'='));
  return part ? part.slice(key.length+1) : null;
}
function isValidState(s) {
  const now=Date.now();
  return !!s && Number.isInteger(s.level) && s.level>=1 && s.level<=4
    && Number.isInteger(s.hits) && s.hits>=0 && s.hits<=5
    && Number.isInteger(s.shots) && s.shots>=0 && s.shots<=100000
    && s.won===false && Number.isInteger(s.issuedAt)
    && now-s.issuedAt<4*60*60*1000 && s.issuedAt<=now+60000
    && (s.level===4 || s.hits<LIMITS[s.level-1])
    && typeof s.shotId==='string' && /^[A-Za-z0-9_-]{20,32}$/.test(s.shotId)
    && s.target && Number.isInteger(s.target.x) && s.target.x>=20 && s.target.x<=80
    && Number.isInteger(s.target.y) && s.target.y>=30 && s.target.y<=60
    && Number.isInteger(s.readyAt) && Number.isInteger(s.movedAt)
    && Number.isInteger(s.gateAt) && (s.gateId===null || /^[A-Za-z0-9_-]{20,32}$/.test(s.gateId));
}
async function loadState(request, ctx) {
  const packed = cookieValue(request.headers.get('Cookie') || '', COOKIE_NAME);
  if (!packed || packed.length > 1300) return newState();
  try {
    const [msg, tag, extra] = packed.split('.');
    if (!msg || !tag || extra) return newState();
    const key = await hmacKey(ctx.env.HEADSHOT_SESSION_KEY);
    if (!await crypto.subtle.verify('HMAC', key, fromB64url(tag), textEncoder.encode(msg))) return newState();
    const value = JSON.parse(new TextDecoder().decode(fromB64url(msg)));
    return isValidState(value) ? { level:value.level, hits:value.hits, shots:value.shots, won:false, target:value.target, shotId:value.shotId, readyAt:value.readyAt, movedAt:value.movedAt, gateId:value.gateId, gateAt:value.gateAt } : newState();
  } catch { return newState(); }
}
async function sessionHeader(s, ctx) {
  const payload = toB64url(textEncoder.encode(JSON.stringify({...s, issuedAt:Date.now()})));
  const key = await hmacKey(ctx.env.HEADSHOT_SESSION_KEY);
  const sig = toB64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, textEncoder.encode(payload))));
  return `${COOKIE_NAME}=${payload}.${sig}; Path=/arena/${ctx.env.HEADSHOT_ACCESS_TOKEN}; HttpOnly; Secure; SameSite=Lax; Max-Age=14400`;
}

export function serveGame(ctx) {
  const error = forbiddenOrNotFound(ctx);
  if (error) return error;
  return response(GAME_HTML, 200, {'Content-Type':'text/html; charset=utf-8'});
}

export async function handleAction(ctx) {
  const error = forbiddenOrNotFound(ctx);
  if (error) return error;
  const req = ctx.request;
  const origin = req.headers.get('Origin');
  if (origin && origin !== new URL(req.url).origin) return json({error:'Origin denied.'}, 403);
  if (!req.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return json({error:'Expected JSON.'}, 415);
  if (req.headers.get('X-Headshot-Client') !== '1') return json({error:'Invalid client request.'}, 400);
  if (Number(req.headers.get('Content-Length') || 0) > 1024) return json({error:'Request too large.'}, 413);
  let input;
  try {
    const body = await req.text();
    if (body.length > 1024) return json({error:'Request too large.'}, 413);
    input = JSON.parse(body);
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error();
  } catch { return json({error:'Invalid JSON.'},400); }
  let s = await loadState(req, ctx);
  let result;
  switch (input.action) {
    case 'state':
      result=publicState(s);
      break;
    case 'reset':
      s=newState();
      result=publicState(s);
      break;
    case 'track': {
      const now=Date.now();
      if (s.level>=2 && s.level<=3 && now-s.movedAt>=TRACK_DELAYS_MS[s.level-1]) {
        movePosition(s,now);
      }
      result=publicState(s);
      break;
    }
    case 'shoot': {
      if (s.level===4) {
        s.shots=Math.min(s.shots+1,100000);
        s.gateId=randomId();s.gateAt=Date.now();
        result={state:publicState(s),message:'WEAPON CHHORO!',loop:true,receipt:s.gateId};
        break;
      }
      const x=input.x,y=input.y,now=Date.now();
      if (!Number.isFinite(x)||!Number.isFinite(y)||typeof input.shotId!=='string'
          ||x<0||x>100||y<0||y>100) return json({error:'Invalid shot coordinates.'},400);
      if (input.shotId!==s.shotId) return json({error:'Shot expired. Try again.'},409);
      if (now<s.readyAt) return json({error:'Weapon not ready.'},429);
      s.shots=Math.min(s.shots+1,100000);
      const hit=Math.abs(x-s.target.x)<=6 && Math.abs(y-s.target.y)<=7.8;
      s.shotId=randomId();s.readyAt=now+SHOT_DELAYS_MS[s.level-1];
      if (hit) {
        s.hits++;
        if (s.hits>=LIMITS[s.level-1]) {
          const completed=s.level++;
          s.hits=0;
          movePosition(s,now,true);
          result={state:publicState(s),message:s.level===4?'FINAL ROUND INITIALIZED.':`LEVEL ${completed} CLEARED. Incoming level ${s.level}.`,advanced:true,hit:true};
        } else result={state:publicState(s),message:'HEADSHOT CONFIRMED.',hit:true};
      } else result={state:publicState(s),message:'MISSED. Aim at the hologram head.',hit:false};
      break;
    }
    case 'checkpoint':
      if (s.level!==4 || !s.gateId || typeof input.receipt!=='string'
          || input.receipt!==s.gateId || Date.now()-s.gateAt>300000) {
        return json({error:'Final gate locked.'},403);
      }
      result={success:true,result:ctx.env.HEADSHOT_FLAG};
      s=newState();
      break;
    default:
      return json({error:'Unknown action.'},400);
  }
  const setCookie = await sessionHeader(s, ctx);
  return json(result, 200, {'Set-Cookie':setCookie});
}
