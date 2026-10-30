/* =========================================================
   Corphik – IT problémy padají do černé díry (/, /en/, /es/)
   Chybové hlášky obíhají kolem díry po nakloněné dráze (keplerovsky: uvnitř rychleji), pomalu padají
   dovnitř a zhasnou; za dírou se schovají a u textu nabídky zhasínají, aby ho nepřekryly.
   Kreslí se do vlastního 2D plátna nad dírou stejnou kamerou jako díra (window.corphikVoidCam z void.js);
   bez WebGL obíhají po elipse v místě náhradního obrazu. Při ponoru spadnou do díry všechny naráz.
   ========================================================= */
(() => {
const voidEl = document.getElementById('void');
if(!voidEl) return;
const cv = document.createElement('canvas');
cv.id = 'itOrbit'; cv.setAttribute('aria-hidden', 'true');
voidEl.querySelector('canvas').after(cv);
const ctx = cv.getContext('2d');
const root = document.documentElement;
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* hlášky: [ikona, text, kód?] – kód (stejný ve všech jazycích) neproporcionálním písmem, věta běžným */
const T = {
  cs: ["Disk je plný", "Počítač se nespustil správně", "Není připojení k internetu", "404 – Stránka nenalezena", "Certifikát vypršel", "Procesor se přehřívá", "Načítání… 3 %", "Aktualizace se nezdařila", "Málo paměti", "E-mail se nedoručil", "Ventilátor je hlučný"],
  en: ["Disk is full", "Your PC did not start correctly", "No internet connection", "404 – Page not found", "Certificate expired", "CPU is overheating", "Loading… 3 %", "Update failed", "Low memory", "Email not delivered", "Fan is loud"],
  es: ["Disco lleno", "El equipo no se inició correctamente", "Sin conexión a internet", "404 – Página no encontrada", "Certificado caducado", "El procesador se sobrecalienta", "Cargando… 3 %", "La actualización falló", "Poca memoria", "Correo no entregado", "El ventilador hace ruido"]
};
const items = () => {
  const t = T[root.lang] || T.en;
  return [
    ["⚠", t[0]], ["", "0x0000007B", 1], ["⚠", t[1]], ["", "DNS_PROBE_FINISHED_NXDOMAIN", 1], ["✕", t[2]], ["", t[3], 1],
    ["⚠", t[4]], ["🌡", t[5]], ["⌛", t[6]], ["", "CRITICAL_PROCESS_DIED", 1], ["✕", t[7]], ["⚠", t[8]],
    ["", "ERR_CONNECTION_TIMED_OUT", 1], ["✕", t[9]], ["⚠", t[10]]
  ];
};
const RIN = 2.6, TILT = 0.5;
const ROUT = () => mobile() ? 8.5 : 14;        /* na telefonu je díra menší, dráha musí zůstat na obrazovce */
let parts = [], pool = 0, W = 0, H = 0, DPR = 1, last = 0;
const mobile = () => innerWidth <= 860;
const target = () => mobile() ? 4 : 7;
function spawn(seed){
  const list = items(), it = list[pool++ % list.length];
  return {icon: it[0], text: it[1], mono: !!it[2],
    R: seed ? RIN + 2 + Math.random()*(ROUT() - RIN - 2) : ROUT() - Math.random()*1.5,
    a: Math.random()*Math.PI*2, life: seed ? 1 : 0};
}
function size(){
  DPR = Math.min(devicePixelRatio || 1, 2);
  W = voidEl.clientWidth; H = voidEl.clientHeight;
  cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR);
}
addEventListener('resize', size); size();
for(let i = 0; i < target(); i++) parts.push(spawn(true));

/* bod v rovině disku → obrazovka (stejná projekce jako shader, bez ohybu světla) */
function project(R, a){
  const C = window.corphikVoidCam;
  const m = Math.min(W, H);
  if(!C){
    /* bez WebGL: elipsa v místě díry podle CSS */
    const cs = getComputedStyle(voidEl), hx = parseFloat(cs.getPropertyValue('--hole-x')) || .5, hy = parseFloat(cs.getPropertyValue('--hole-y')) || .5;
    const s = m*0.024;
    return {x: hx*W + Math.cos(a)*R*s, y: hy*H + Math.sin(a)*R*s*0.45, z: 10 - Math.sin(a), behind: Math.sin(a) < 0, depth: 1};
  }
  /* dráha hlášek je proti disku nakloněná, jinak by se při pohledu skoro z boku slily do jedné řady */
  const P = [Math.cos(a)*R, Math.sin(a)*R*Math.sin(TILT), Math.sin(a)*R*Math.cos(TILT)];
  const d = [P[0] - C.cam[0], P[1] - C.cam[1], P[2] - C.cam[2]];
  const z = d[0]*C.f[0] + d[1]*C.f[1] + d[2]*C.f[2];
  const x = (d[0]*C.r[0] + d[1]*C.r[1] + d[2]*C.r[2])/z/C.fov;
  const y = (d[0]*C.u[0] + d[1]*C.u[1] + d[2]*C.u[2])/z/C.fov;
  /* za dírou = dál od kamery než střed díry */
  const cl = Math.hypot(...C.cam);
  const behind = (P[0]*C.cam[0] + P[1]*C.cam[1] + P[2]*C.cam[2])/cl < 0;
  return {x: W/2 + (x + C.ox)*m, y: H/2 - (y + C.oy)*m, z, behind, depth: cl/z};
}
function hole(){
  const C = window.corphikVoidCam, m = Math.min(W, H);
  if(!C){
    /* bez WebGL: stín náhradního obrazu má poloměr 9vmin (home.css) */
    const cs = getComputedStyle(voidEl);
    return {x: (parseFloat(cs.getPropertyValue('--hole-x')) || .5)*W, y: (parseFloat(cs.getPropertyValue('--hole-y')) || .5)*H, r: 0.09*Math.min(innerWidth, innerHeight)};
  }
  const c = project(0, 0), cl = Math.hypot(...C.cam);
  /* úhlový poloměr stínu: kritický parametr 3√3/2 rs */
  return {x: W/2 + C.ox*m, y: H/2 - C.oy*m, r: Math.tan(2.598/cl)/C.fov*m};
}

function frame(now){
  requestAnimationFrame(frame);
  if(document.hidden || root.classList.contains('is-inside')) { last = 0; return; }
  const dt = last ? Math.min(0.05, (now - last)/1000) : 0; last = now;
  const diving = root.classList.contains('is-diving');
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, W, H);
  const h = hole(), ph = mobile();
  /* kde je text nabídky: hlášky u něj zhasínají, aby ho nepřekrývaly */
  const box = document.querySelector('.void-copy');
  const tb = box ? [...box.children].reduce((m, el) => { const q = el.getBoundingClientRect(); if(!q.width || !q.height) return m; return {l: Math.min(m.l, q.left), r: Math.max(m.r, q.right), t: Math.min(m.t, q.top), b: Math.max(m.b, q.bottom)}; }, {l: 1e9, r: -1e9, t: 1e9, b: -1e9}) : null;
  const vr = voidEl.getBoundingClientRect();
  /* pohyb: keplerovská rychlost (uvnitř rychleji), pomalý pád dovnitř, při ponoru vše spadne naráz */
  for(const p of parts){
    if(!REDUCE){
      p.a += dt*2.8*Math.pow(p.R, -1.5)*(diving ? 4 : 1);
      p.R -= dt*(0.5 + 5/(p.R*p.R))*(diving ? 14 : 1);
    }
    p.life = Math.min(1, p.life + dt*0.6);
  }
  parts = parts.filter(p => p.R > RIN*0.9);
  while(!diving && parts.length < target()) parts.push(spawn(false));
  /* nejdřív vzdálené (za dírou), pak bližší */
  const drawn = parts.map(p => ({p, s: project(p.R, p.a)})).filter(o => o.s.z > 0).sort((a, b) => b.s.z - a.s.z);
  for(const {p, s} of drawn){
    /* za dírou a uvnitř jejího stínu: schované */
    if(h && s.behind && Math.hypot(s.x - h.x, s.y - h.y) < h.r*1.15) continue;
    const near = Math.min(1, Math.max(0, (p.R - RIN)/4));           /* u díry zhasíná */
    let clear = 1;
    if(tb){
      /* vzdálenost od obdélníku s textem: v něm 0, 60 px od něj plně viditelné */
      const dx = Math.max(tb.l - vr.left - s.x, 0, s.x - (tb.r - vr.left)), dy = Math.max(tb.t - vr.top - s.y, 0, s.y - (tb.b - vr.top));
      clear = Math.min(1, Math.hypot(dx, dy)/60);
    }
    const fadeIn = p.life, alpha = near*fadeIn*clear*(s.behind ? 0.55 : 0.95);
    if(alpha < 0.02) continue;
    const sc = Math.max(0.45, Math.min(1.25, s.depth))*(0.55 + 0.45*near)*(ph ? 0.8 : 1);
    const fs = 13*sc;
    ctx.font = `600 ${fs}px ${p.mono ? "ui-monospace,SFMono-Regular,Menlo,monospace" : "Archivo,system-ui,sans-serif"}`;
    const label = (p.icon ? p.icon + "  " : "") + p.text;
    const tw = ctx.measureText(label).width, padX = 9*sc, hgt = fs + 10*sc;
    const x = s.x - tw/2 - padX, y = s.y - hgt/2;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "rgba(14,10,24,.72)";
    ctx.strokeStyle = p.mono ? "rgba(255,120,140,.55)" : "rgba(196,181,253,.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    if(ctx.roundRect) ctx.roundRect(x, y, tw + padX*2, hgt, hgt/2); else ctx.rect(x, y, tw + padX*2, hgt);  /* starší prohlížeče: hranatý štítek */
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = p.mono ? "#ffb4c0" : "#f2f1ee";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + padX, s.y + 0.5);
  }
  ctx.globalAlpha = 1;
}
requestAnimationFrame(frame);
})();
