/* =========================================================
   Corphik – černá díra na úvodní stránce (/, /en/, /es/)
   1) Vlétne zprava a usadí se do „O“ mezi C a R v nápisu CORPHIK.
   2) Reaguje na myš a dotek: gravitační čočka (hvězdy, písmena), částice padají do díry.
   3) Při scrollu se odpojí a putuje po světelné dráze přes služby a portfolio až do závěrečné výzvy.
   4) Klik na díru otevře rozcestník (Služby / Portfolio / Kontakt),
      projekt z portfolia se otevírá „průletem“ dírou.
   Jen <canvas> a SVG, bez knihoven. Při prefers-reduced-motion díra zůstane v klidu v nápisu.
   Potřebuje app.js (texty přes t()) – načítá se až po něm.
   ========================================================= */
(() => {
const cv = document.getElementById('bhCanvas');
if(!cv || !cv.getContext) return;

const root = document.documentElement;
const ctx = cv.getContext('2d');
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const COARSE = matchMedia('(pointer: coarse)').matches;
const TAU = Math.PI*2, ROT = -9*Math.PI/180;
const IMG_W = 640, IMG_H = 120, OX = 143, OY = 87;          /* střed „O“ v obrázku nápisu */
const ENTER = 1.9;                                            /* délka příletu (s) */
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a)*k;
const ease = x => 1 - Math.pow(1 - clamp(x), 3);
const say = k => (typeof t === "function" ? t(k) : k);

/* ---------- Barvy z motivu, písmena nápisu ---------- */
const imgs = ["/assets/img/wm-c.png", "/assets/img/wm-rphik.png"].map(src => { const i = new Image(); i.src = src; return i; });
let letters = null, lettersFor = "";
let ink = "", bg = "", dark = false;
function readColors(){
  const cs = getComputedStyle(root);
  const i = cs.getPropertyValue('--ink').trim() || "#000", b = cs.getPropertyValue('--bg').trim() || "#fff";
  if(i === ink && b === bg) return;
  ink = i; bg = b;
  const h = i.replace('#','');
  const n = h.length === 3 ? h.split('').map(c => parseInt(c + c, 16)) : [0,2,4].map(k => parseInt(h.slice(k, k + 2), 16));
  dark = n[0] + n[1] + n[2] > 384;
}
/* písmena v barvě textu + tenký okraj v barvě pozadí, aby disk šel „za“ ně jako v logu */
function tint(){
  if(letters && lettersFor === ink + bg) return;
  if(!imgs.every(i => i.complete && i.naturalWidth)) return;
  const c = document.createElement('canvas'), x = c.getContext('2d'); c.width = IMG_W + 16; c.height = IMG_H + 16;
  for(const img of imgs) for(let k = 0; k < 16; k++){ const a = k/16*TAU; x.drawImage(img, 8 + Math.cos(a)*5, 8 + Math.sin(a)*5); }
  x.globalCompositeOperation = 'source-in'; x.fillStyle = bg; x.fillRect(0, 0, c.width, c.height);
  x.globalCompositeOperation = 'source-over';
  const m = document.createElement('canvas'), mx = m.getContext('2d'); m.width = IMG_W; m.height = IMG_H;
  for(const img of imgs) mx.drawImage(img, 0, 0);
  mx.globalCompositeOperation = 'source-in'; mx.fillStyle = ink; mx.fillRect(0, 0, IMG_W, IMG_H);
  x.drawImage(m, 8, 8);
  letters = c; lettersFor = ink + bg;
}

/* ---------- Kreslení díry (sdílí úvod i putující díra) ----------
   (x,y) střed, R poloměr horizontu; o.spin čas obíhání, o.tx/o.ty náklon (−1…1),
   o.boost záblesk prstence (0…1), o.wave rázová vlna (0…1, 1 = žádná), o.alpha průhlednost */
const DOTS = Array.from({length: COARSE ? 70 : 120}, () => {
  const k = 0.55 + Math.random()*0.5;
  return { a: Math.random()*TAU, k, v: 0.42/Math.pow(k, 1.5), z: Math.random() < 0.08 ? 2.2 : 1 };
});
const dop = a => 0.42 + 0.58*(0.5 - 0.5*Math.cos(a));       /* levá strana disku letí k nám → je jasnější */
const RINGS = [[0.6, 3.4, 1], [0.78, 1.8, 0.6], [1, 1.1, 0.38]];   /* [poloměr, tloušťka, jas] */
function drawHole(c, x, y, R, o){
  const A = o.alpha == null ? 1 : o.alpha;
  if(A <= 0.01) return;
  const sc = R/26, rot = ROT + o.tx*0.08, rx = R*5.4, ry = rx*(0.17 + o.ty*0.05);
  const cr = Math.cos(rot), sr = Math.sin(rot);
  const pt = (a, k) => { const X = Math.cos(a)*rx*k, Y = Math.sin(a)*ry*k; return [x + X*cr - Y*sr, y + X*sr + Y*cr]; };
  c.save(); c.lineCap = 'round';
  /* záře; ve světlém motivu tmavá koróna, na které je bílý prstenec vidět */
  const gr = R*(dark ? 3.6 : 1.9), g = c.createRadialGradient(x, y, R*0.9, x, y, gr);
  if(dark){ g.addColorStop(0, `rgba(255,255,255,${0.13 + o.boost*0.12})`); g.addColorStop(1, 'rgba(255,255,255,0)'); }
  else { g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.45, 'rgba(0,0,0,.85)'); g.addColorStop(1, 'rgba(0,0,0,0)'); }
  c.globalAlpha = A; c.fillStyle = g; c.beginPath(); c.arc(x, y, gr, 0, TAU); c.fill();
  /* disk je u díry bílý, dál přechází do barvy textu (bílý disk by na bílém pozadí zmizel) */
  let st = '#fff';
  if(!dark){ st = c.createRadialGradient(x, y, R*1.15, x, y, R*1.9); st.addColorStop(0, '#fff'); st.addColorStop(1, ink); }
  const N = 36;
  const disk = front => {
    c.strokeStyle = st; c.fillStyle = st;
    const a0 = front ? 0 : Math.PI;
    for(const [k, w, al] of RINGS){
      c.lineWidth = Math.max(0.7, w*sc);
      let p = pt(a0, k);
      for(let i = 1; i <= N; i++){
        const a = a0 + Math.PI*i/N, q = pt(a, k);
        c.globalAlpha = A*al*dop(a); c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); c.stroke();
        p = q;
      }
    }
    for(const d of DOTS){
      const a = ((d.a + o.spin*d.v) % TAU + TAU) % TAU;
      if((a < Math.PI) !== front) continue;
      const [px, py] = pt(a, d.k);
      c.globalAlpha = A*0.85*dop(a); c.beginPath(); c.arc(px, py, Math.max(0.6, d.z*sc), 0, TAU); c.fill();
    }
  };
  disk(false);
  /* obraz zadní části disku ohnutý přes díru nahoru (a slabší pod ní) */
  const lx = x + o.tx*R*0.14;
  const bent = (r, from, to, al, n) => {
    for(let i = 0; i < n; i++){
      const a1 = from + (to - from)*i/n, a2 = from + (to - from)*(i + 1)/n;
      c.globalAlpha = A*al*dop(a1); c.beginPath(); c.arc(lx, y, r, a1, a2 + 0.01); c.stroke();
    }
  };
  c.strokeStyle = st;
  c.lineWidth = 3.2*sc*(1 + o.boost*0.3); bent(R*1.36, Math.PI + 0.2, TAU - 0.2, 0.95, 18);
  c.lineWidth = Math.max(0.8, 1.2*sc); bent(R*1.13, 0.35, Math.PI - 0.35, 0.5, 12);
  /* horizont a fotonový prstenec */
  c.globalAlpha = A; c.fillStyle = '#000'; c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill();
  c.strokeStyle = '#fff'; c.lineWidth = Math.max(1, 1.3*sc)*(1 + o.boost*0.8);
  c.shadowColor = 'rgba(255,255,255,.9)'; c.shadowBlur = (5 + o.boost*16)*sc;
  c.beginPath(); c.arc(x, y, R*1.05, 0, TAU); c.stroke(); c.shadowBlur = 0;
  /* přední půlka disku přes horizont */
  disk(true);
  /* rázová vlna po kliknutí */
  if(o.wave < 1){
    c.globalAlpha = A*(1 - o.wave)*0.7; c.strokeStyle = dark ? '#fff' : ink; c.lineWidth = Math.max(1, 1.6*sc);
    c.beginPath(); c.arc(x, y, R*(1.2 + o.wave*4.5), 0, TAU); c.stroke();
  }
  c.restore();
}
/* prázdné místo po díře, když putuje po stránce */
function drawGhost(c, x, y, R){
  c.save(); c.globalAlpha = 0.3; c.strokeStyle = ink; c.lineWidth = Math.max(1, R/26*1.2);
  c.setLineDash([2, 5]); c.beginPath(); c.arc(x, y, R*1.05, 0, TAU); c.stroke(); c.restore();
}

/* ---------- Úvod: rozměry, hvězdy, písmena ---------- */
let W = 0, H = 0, s = 1, ox = 0, oy = 0, hx = 0, hy = 0, R = 0, dpr = 1;
let stars = [];
function size(){
  const b = cv.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1);
  W = b.width; H = b.height; cv.width = Math.round(W*dpr); cv.height = Math.round(H*dpr);
  const wrap = document.querySelector('.home-hero .wrap'), wrapW = wrap ? Math.min(W, wrap.clientWidth) : W;
  const wd = Math.min(wrapW*0.86, 620, H*2.4); s = wd/IMG_W;
  ox = (W - wd)/2; oy = H*0.56 - OY*s; hx = ox + OX*s; hy = oy + OY*s; R = 26*s;
  const n = Math.round(clamp(W*H/5200, 30, 220)); let q = 11;
  const rnd = () => (q = q*16807 % 2147483647)/2147483647;
  stars = Array.from({length: n}, () => ({ x: rnd()*W, y: rnd()*H, z: rnd(), p: rnd()*TAU }));
  placeCore();
}
function drawStars(X, Y, T, lens){
  const thE = lens ? R*2.4*(1 + boost*0.5) : 0;
  const px = presence*(mx - W/2)*-0.015, py = presence*(my - H/2)*-0.015;
  const second = [];
  ctx.fillStyle = ink;
  for(const st of stars){
    const sx = st.x + px*st.z, sy = st.y + py*st.z;
    const a = (0.1 + st.z*0.32)*(REDUCE ? 1 : 0.7 + 0.3*Math.sin(T*1.3 + st.p)), sz = st.z > 0.9 ? 1.5 : 1;
    ctx.globalAlpha = a;
    if(!thE){ ctx.fillRect(sx, sy, sz, sz); continue; }
    /* gravitační čočka: hlavní obraz se odsune od díry, druhý se objeví u prstence na opačné straně */
    const dx = sx - X, dy = sy - Y, d = Math.hypot(dx, dy) || 1, r = Math.sqrt(d*d + 4*thE*thE);
    const d1 = (d + r)/2, d2 = (r - d)/2;
    ctx.fillRect(X + dx/d*d1, Y + dy/d*d1, sz, sz);
    if(d2 > R*1.1) second.push([X - dx/d*d2, Y - dy/d*d2, a, sz]);
  }
  ctx.fillStyle = '#fff';
  for(const [x2, y2, a, sz] of second){ ctx.globalAlpha = a; ctx.fillRect(x2, y2, sz, sz); }
  ctx.globalAlpha = 1;
}
/* písmena po svislých proužcích – čím blíž díře, tím víc je čočka roztáhne */
function drawLetters(a, X, Y, str){
  if(!letters || a <= 0) return;
  const dx0 = ox - 8*s, dy0 = oy - 8*s, sw = letters.width, sh = letters.height;
  ctx.globalAlpha = a;
  const vy = Math.exp(-Math.pow((Y - hy)/(H*0.45), 2));
  if(str*vy < 0.004){ ctx.drawImage(letters, dx0, dy0, sw*s, sh*s); ctx.globalAlpha = 1; return; }
  const step = 4, sig = R*2.2;
  for(let sx = 0; sx < sw; sx += step){
    const w = Math.min(step, sw - sx), cx = dx0 + (sx + w/2)*s, d = cx - X;
    const f = str*vy*Math.exp(-(d*d)/(sig*sig)), k = 1 + f;
    ctx.drawImage(letters, sx, 0, w, sh, cx - w*s/2, Y + (dy0 - Y)*k, w*s + 0.5, sh*s*k);
  }
  ctx.globalAlpha = 1;
}

/* ---------- Úvod: myš, dotek, částice ---------- */
let mx = 0, my = 0, presence = 0, presT = 0, lastSpawn = 0;
let HX = 0, HY = 0, offX = 0, offY = 0, vX = 0, vY = 0, tiltX = 0, tiltY = 0;
let boost = 0, wave = 1, hoverCore = false, t0 = performance.now(), flashed = REDUCE, entered = REDUCE;
const parts = [], MAXP = COARSE ? 36 : 80, trail = [];
function spawn(x, y, n){
  const G = R*R*1.6;
  for(let i = 0; i < n && parts.length < MAXP; i++){
    const dx = x - HX, dy = y - HY, d = Math.hypot(dx, dy) || 1, v = Math.sqrt(G/d)*(0.7 + Math.random()*0.4);
    parts.push({ x: x + (Math.random() - 0.5)*8, y: y + (Math.random() - 0.5)*8, vx: -dy/d*v, vy: dx/d*v, life: 0 });
  }
}
function stepParticles(dt, X, Y, pull){
  const f = dt/16.67, G = R*R*1.6, drag = Math.pow(0.992, f);
  ctx.strokeStyle = ink; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
  for(let i = parts.length - 1; i >= 0; i--){
    const p = parts[i], dx = X - p.x, dy = Y - p.y, d2 = dx*dx + dy*dy, d = Math.sqrt(d2) || 1;
    const acc = pull ? G/Math.max(d2, R*R) : 0;
    p.vx = (p.vx + dx/d*acc*f)*drag; p.vy = (p.vy + dy/d*acc*f)*drag;
    const px = p.x, py = p.y; p.x += p.vx*f; p.y += p.vy*f; p.life += dt;
    if(pull && d < R*1.02){ parts.splice(i, 1); boost = Math.min(1, boost + 0.06); continue; }
    if(p.life > 6000 || p.x < -40 || p.x > W + 40 || p.y < -40 || p.y > H + 40){ parts.splice(i, 1); continue; }
    ctx.globalAlpha = Math.min(1, p.life/250)*(1 - p.life/6000)*0.7;
    ctx.beginPath(); ctx.moveTo(px - p.vx*2*f, py - p.vy*2*f); ctx.lineTo(p.x, p.y); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
function onPointer(e){
  const b = cv.getBoundingClientRect();
  mx = e.clientX - b.left; my = e.clientY - b.top; presT = 1;
  if(!REDUCE && entered){
    const now = performance.now(), touch = e.pointerType !== 'mouse';
    if(e.type === 'pointerdown') spawn(mx, my, touch ? 6 : 3);
    else if(now - lastSpawn > (touch ? 90 : 45)){ lastSpawn = now; spawn(mx, my, 1); }
  }
  kick();
}
const hero = document.querySelector('.home-hero');
if(hero){
  hero.addEventListener('pointermove', onPointer, {passive: true});
  hero.addEventListener('pointerdown', onPointer, {passive: true});
  hero.addEventListener('pointerleave', () => { presT = 0; });
}

function heroFrame(now, dt){
  readColors(); tint();
  const f = dt/16.67, T = REDUCE ? 99 : (now - t0)/1000;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
  /* přílet zprava po mírném oblouku, na konci drobné dokmitání */
  const e = ease(T/ENTER), iq = 1 - e;
  const sx0 = W + R*7, sy0 = hy - H*0.3, cx1 = lerp(W, hx, 0.3), cy1 = hy + H*0.25;
  let x = iq*iq*sx0 + 2*iq*e*cx1 + e*e*hx, y = iq*iq*sy0 + 2*iq*e*cy1 + e*e*hy;
  if(!REDUCE && T > ENTER){ const k = T - ENTER; x += Math.exp(-k*5)*Math.sin(k*13)*R*0.22; }
  if(!flashed && T >= ENTER){ flashed = true; boost = 1; wave = 0; }
  /* díra se lehce nakloní a posune za kurzorem (pružina) */
  presence = lerp(presence, presT, Math.min(1, 0.06*f));
  const tgx = presT ? clamp((mx - hx)*0.05, -R*0.5, R*0.5) : 0, tgy = presT ? clamp((my - hy)*0.05, -R*0.35, R*0.35) : 0;
  vX = (vX + (tgx - offX)*0.05*f)*Math.pow(0.84, f); vY = (vY + (tgy - offY)*0.05*f)*Math.pow(0.84, f);
  offX += vX*f; offY += vY*f;
  tiltX = lerp(tiltX, presT ? clamp((mx - hx)/(W*0.5), -1, 1) : 0, Math.min(1, 0.05*f));
  tiltY = lerp(tiltY, presT ? clamp((my - hy)/H, -1, 1) : 0, Math.min(1, 0.05*f));
  const X = x + offX*e, Y = y + offY*e; HX = X; HY = Y;
  const home = !tr.on;
  drawStars(X, Y, T, home);
  /* světelná stopa za přilétající dírou */
  if(!REDUCE){
    if(e < 1) trail.push([X, Y]);
    if(trail.length > 16 || (e >= 1 && trail.length)) trail.shift();
    ctx.strokeStyle = ink; ctx.lineCap = 'round';
    for(let i = 1; i < trail.length; i++){
      const k = i/trail.length; ctx.globalAlpha = k*0.45; ctx.lineWidth = Math.max(0.8, R*0.45*k);
      ctx.beginPath(); ctx.moveTo(trail[i - 1][0], trail[i - 1][1]); ctx.lineTo(trail[i][0], trail[i][1]); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  stepParticles(dt, X, Y, home);
  if(home) drawHole(ctx, X, Y, R, { spin: spin*0.35 + iq*4, tx: tiltX, ty: tiltY, boost, wave });
  else drawGhost(ctx, hx, hy, R);
  /* písmena navrch; kolem díry je ohne čočka, při průletu víc */
  drawLetters(REDUCE ? 1 : ease((T - 0.15)/0.8), X, Y, home ? 0.05 + 0.3*iq*(e > 0 ? 1 : 0) + boost*0.06 : 0);
}

/* ---------- Rozcestník po kliknutí na díru ---------- */
const core = document.getElementById('bhCore'), menu = document.getElementById('bhMenu');
const items = menu ? [...menu.querySelectorAll('li')] : [];
let menuOpen = false;
function placeCore(){
  if(!core) return;
  core.style.setProperty('--x', hx + 'px'); core.style.setProperty('--y', hy + 'px');
  core.style.setProperty('--d', Math.max(48, R*2.8) + 'px');
}
/* položky v oblouku pod dírou; vylétají z jejího středu */
function placeMenu(){
  const ws = items.map(li => li.firstElementChild.offsetWidth), gap = W < 560 ? 8 : 10;
  const total = ws.reduce((a, b) => a + b, 0) + gap*(ws.length - 1);
  let xx = clamp(hx - total/2, 12, Math.max(12, W - 12 - total));
  const y0 = hy + Math.max(R*3.2, W < 560 ? 50 : 66), dip = W < 560 ? 8 : 14;
  items.forEach((li, i) => {
    const cx = xx + ws[i]/2, cy = y0 + (i === 1 ? dip : 0); xx += ws[i] + gap;
    li.style.setProperty('--x', cx + 'px'); li.style.setProperty('--y', cy + 'px');
    li.style.setProperty('--dx', (hx - cx) + 'px'); li.style.setProperty('--dy', (hy - cy) + 'px');
    li.style.transitionDelay = (i*40) + 'ms';
  });
}
function setMenu(open, focus){
  if(!menu || !core || open === menuOpen) return;
  menuOpen = open;
  core.setAttribute('aria-expanded', open);
  core.setAttribute('aria-label', say(open ? "bh.close" : "bh.open"));
  if(open){
    menu.hidden = false; placeMenu();
    requestAnimationFrame(() => requestAnimationFrame(() => { if(menuOpen) menu.classList.add('open'); }));
    boost = 1; wave = 0; kick();
    if(focus) setTimeout(() => { const a = items[0] && items[0].firstElementChild; if(a) a.focus({preventScroll: true}); }, REDUCE ? 0 : 140);
  } else {
    menu.classList.remove('open');
    setTimeout(() => { if(!menuOpen) menu.hidden = true; }, REDUCE ? 0 : 420);
  }
}
if(core && menu){
  core.hidden = false;
  core.setAttribute('aria-label', say("bh.open"));
  core.addEventListener('click', e => setMenu(!menuOpen, e.detail === 0));    /* detail 0 = Enter/mezerník */
  core.addEventListener('pointerenter', () => { hoverCore = true; kick(); });
  core.addEventListener('pointerleave', () => { hoverCore = false; });
  menu.addEventListener('click', e => { if(e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && menuOpen){ setMenu(false); core.focus(); } });
  document.addEventListener('pointerdown', e => { if(menuOpen && !menu.contains(e.target) && !core.contains(e.target)) setMenu(false); });
}

/* ---------- Putování po stránce ---------- */
const main = document.querySelector('main');
const svg = document.getElementById('bhPath');
const travel = document.getElementById('bhTravel');
const tcv = travel && travel.querySelector('canvas'), tctx = tcv && tcv.getContext('2d');
const ctaIcon = document.querySelector('.cta-end .bh');
const TW = 300, TH = 150, NS = 'http://www.w3.org/2000/svg';
const tr = { on: false, x: 0, y: 0, R: 0, a: 0, vx: 0, vy: 0, boost: 0, docked: false };
let pathOK = false, samples = [], total = 0, stations = [], P0y = 0, P4y = 0, mainTop = 0, orbitEl = null, trailEl = null;
function buildPath(){
  pathOK = false;
  if(!svg || !main || !travel || !ctaIcon || REDUCE) return;
  const big = document.querySelector('.services .big-h'), list = document.getElementById('svcList'),
        work = document.querySelector('.work .big-h'), wrap = document.querySelector('.services .wrap');
  if(!big || !list || !wrap) return;
  const mr = main.getBoundingClientRect(); mainTop = mr.top + scrollY;
  const P = el => { const b = el.getBoundingClientRect(); return [b.left - mr.left + b.width/2, b.top - mr.top + b.height/2]; };
  const wb = wrap.getBoundingClientRect(), contentR = wb.right - parseFloat(getComputedStyle(wrap).paddingRight) - mr.left;
  const vw = root.clientWidth, space = vw - contentR;
  const rail = space > 90 ? contentR + space*0.5 : vw - Math.max(8, space*0.5);   /* pravý okraj stránky */
  const cr = cv.getBoundingClientRect();
  const p0 = [cr.left - mr.left + hx, cr.top - mr.top + hy];
  const p1 = [rail, P(big)[1]];
  const p2 = [rail, list.getBoundingClientRect().bottom - mr.top - 30];
  const p3 = work ? [rail, P(work)[1]] : null;
  const p4 = P(ctaIcon);
  const mid = [p1, p2, p3].filter(Boolean), pl = mid[mid.length - 1];
  const f = n => n.toFixed(1);
  let d = `M${f(p0[0])} ${f(p0[1])} C${f(p0[0] + (rail - p0[0])*0.85)} ${f(p0[1] + 30)} ${f(rail)} ${f(p1[1] - (p1[1] - p0[1])*0.45)} ${f(p1[0])} ${f(p1[1])}`;
  for(const p of mid.slice(1)) d += ` L${f(p[0])} ${f(p[1])}`;
  d += ` C${f(rail)} ${f(pl[1] + (p4[1] - pl[1])*0.65)} ${f(p4[0] + (rail - p4[0])*0.55)} ${f(p4[1])} ${f(p4[0])} ${f(p4[1])}`;
  if(!orbitEl){
    orbitEl = document.createElementNS(NS, 'path'); orbitEl.setAttribute('class', 'orbit');
    trailEl = document.createElementNS(NS, 'path'); trailEl.setAttribute('class', 'trail');
    svg.append(orbitEl, trailEl);
  }
  svg.setAttribute('viewBox', `0 0 ${f(mr.width)} ${f(mr.height)}`);
  orbitEl.setAttribute('d', d); trailEl.setAttribute('d', d);
  total = trailEl.getTotalLength();
  trailEl.style.strokeDasharray = `${total} ${total}`;
  /* body dráhy podle výšky (dráha jde pořád dolů) */
  samples = []; let maxY = -Infinity;
  const N = Math.max(240, Math.round(total/5));
  for(let i = 0; i <= N; i++){ const L = total*i/N, q = trailEl.getPointAtLength(L); maxY = Math.max(maxY, q.y); samples.push([q.x, maxY, L]); }
  /* zastávky u sekcí */
  svg.querySelectorAll('.st').forEach(n => n.remove());
  stations = mid.filter(p => p !== p2).map(p => {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('class', 'st'); c.setAttribute('cx', f(p[0])); c.setAttribute('cy', f(p[1])); c.setAttribute('r', '3.5');
    svg.appendChild(c); return { el: c, L: at(p[1])[2] };
  });
  P0y = p0[1]; P4y = p4[1];
  tcv.width = Math.round(TW*dpr); tcv.height = Math.round(TH*dpr);
  pathOK = true;
}
function at(y){
  let lo = 0, hi = samples.length - 1;
  if(y <= samples[0][1]) return samples[0];
  if(y >= samples[hi][1]) return samples[hi];
  while(hi - lo > 1){ const m = (lo + hi) >> 1; if(samples[m][1] < y) lo = m; else hi = m; }
  const a = samples[lo], b = samples[hi], k = (y - a[1])/((b[1] - a[1]) || 1);
  return [lerp(a[0], b[0], k), y, lerp(a[2], b[2], k)];
}
function updateTravel(){
  const was = tr.on;
  tr.on = false;
  if(pathOK && entered){
    const vh = innerHeight, maxScroll = Math.max(1, root.scrollHeight - vh);
    /* bod, který díra sleduje: na začátku „O“ v nápisu, po kousku scrollu 45 % výšky okna */
    const focus = scrollY - mainTop + lerp(P0y + mainTop, vh*0.45, ease(scrollY/(vh*0.5)));
    const maxFocus = maxScroll - mainTop + vh*0.45, tail = vh*1.2;
    let y = focus;
    if(P4y > maxFocus) y = focus + (P4y - maxFocus)*clamp((focus - (maxFocus - tail))/tail);
    y = Math.min(y, P4y);
    if(y > P0y + 1){
      const [px, py, L] = at(y);
      const sx = px + main.getBoundingClientRect().left, sy = py + mainTop - scrollY;
      const rMini = root.clientWidth < 720 ? 6 : 11, rCta = ctaIcon.getBoundingClientRect().width*11/64;
      let r = lerp(R, rMini, ease(L/260));
      r = lerp(rCta, r, clamp((P4y - py)/140));
      tr.vx = was ? sx - tr.x : 0; tr.vy = was ? sy - tr.y : 0;
      tr.on = true; tr.x = sx; tr.y = sy; tr.R = r; tr.a = clamp((P4y - py)/36);
      trailEl.style.strokeDashoffset = total - L;
      stations.forEach(st => st.el.classList.toggle('on', L >= st.L - 1));
      /* přistání v ikoně závěrečné výzvy */
      const docked = P4y - py < 2;
      if(docked && !tr.docked){ ctaIcon.classList.remove('lit'); void ctaIcon.getBoundingClientRect(); ctaIcon.classList.add('lit'); }
      tr.docked = docked;
    }
  }
  if(!tr.on && trailEl){ trailEl.style.strokeDashoffset = total; stations.forEach(st => st.el.classList.remove('on')); tr.docked = false; }
  if(travel){
    travel.style.opacity = tr.on ? tr.a : 0;
    if(tr.on) travel.style.transform = `translate3d(${(tr.x - TW/2).toFixed(1)}px,${(tr.y - TH/2).toFixed(1)}px,0)`;
  }
}
function drawTravel(dt){
  tr.boost = Math.max(0, tr.boost - dt/900);
  tctx.setTransform(dpr, 0, 0, dpr, 0, 0); tctx.clearRect(0, 0, TW, TH);
  drawHole(tctx, TW/2, TH/2, tr.R, { spin: spin*0.35, tx: clamp(tr.vx*0.08, -1, 1), ty: clamp(tr.vy*0.01, -0.6, 0.6), boost: tr.boost, wave: 1 });
}

/* ---------- Projekt z portfolia: karta spadne do díry, obraz se zavře do černé ---------- */
document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('a[data-pf]');
  if(!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || REDUCE) return;
  e.preventDefault();
  const b = a.getBoundingClientRect(), cx = b.left + b.width/2, cy = b.top + b.height/2;
  const x = tr.on ? tr.x : cx, y = tr.on ? tr.y : cy;
  a.style.setProperty('--dx', (x - cx) + 'px'); a.style.setProperty('--dy', (y - cy) + 'px');
  a.classList.add('pulled');
  const w = document.createElement('div'); w.className = 'bh-warp';
  w.style.setProperty('--x', x + 'px'); w.style.setProperty('--y', y + 'px');
  document.body.appendChild(w); w.getBoundingClientRect(); w.classList.add('go');
  tr.boost = 1; kick();
  setTimeout(() => location.assign(a.href), 650);
});
/* po návratu tlačítkem Zpět stránka nezůstane černá */
addEventListener('pageshow', () => {
  document.querySelectorAll('.bh-warp').forEach(n => n.remove());
  document.querySelectorAll('.pulled').forEach(n => n.classList.remove('pulled'));
});

/* ---------- Smyčka: běží jen když je co kreslit ---------- */
let running = false, last = 0, spin = 0, heroVisible = true;
function loop(now){
  const dt = Math.min(50, now - last); last = now;
  if(!REDUCE) spin += dt/1000;
  entered = REDUCE || (now - t0)/1000 > ENTER + 0.3;
  boost = Math.max(hoverCore ? 0.35 : 0, boost - dt/900);
  if(wave < 1) wave = Math.min(1, wave + dt/900);
  updateTravel();
  if(heroVisible) heroFrame(now, dt);
  if(tr.on) drawTravel(dt);
  if(!REDUCE && !document.hidden && (heroVisible || tr.on)) requestAnimationFrame(loop);
  else running = false;
}
function kick(){
  if(running || document.hidden) return;
  running = true; last = performance.now(); requestAnimationFrame(loop);
}

/* ---------- Start ---------- */
readColors(); size();
imgs.forEach(i => i.addEventListener('load', kick));
addEventListener('scroll', () => {
  /* kdo začne hned scrollovat, nečeká na dokončení příletu */
  if(!entered && scrollY > 40) t0 = performance.now() - (ENTER + 0.4)*1000;
  kick();
}, {passive: true});
let rt;
const relayout = () => { clearTimeout(rt); rt = setTimeout(() => { size(); buildPath(); if(menuOpen) placeMenu(); kick(); }, 120); };
addEventListener('resize', relayout);
if('ResizeObserver' in window && main) new ResizeObserver(relayout).observe(main);
if(document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
addEventListener('load', relayout);
if('IntersectionObserver' in window && hero) new IntersectionObserver(es => { heroVisible = es[0].isIntersecting; kick(); }).observe(hero);
document.addEventListener('visibilitychange', kick);
new MutationObserver(kick).observe(root, {attributes: true, attributeFilter: ['data-theme']});
const mq = matchMedia('(prefers-color-scheme: dark)'); if(mq.addEventListener) mq.addEventListener('change', kick);
buildPath();
kick();
})();
