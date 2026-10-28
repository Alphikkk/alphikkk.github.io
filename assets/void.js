/* =========================================================
   Corphik – úvodní scéna (/, /en/, /es/)
   Černá díra v reálném čase (WebGL): paprsky světla se ohýbají kolem díry
   (Schwarzschild, rs = 1), akreční disk s Dopplerovým jasem, hvězdy,
   Mléčná dráha a spirální galaxie – gravitační čočka ohýbá i je.
   Tlačítko „Co nabízím“ kameru vtáhne do díry a uvnitř se otevřou služby.
   Bez knihoven. Bez WebGL zůstane statické pozadí z CSS, při
   prefers-reduced-motion se vykreslí jeden snímek a přechod je jen prolnutí.
   ========================================================= */
(() => {
const root = document.documentElement;
const voidEl = document.getElementById('void');
const cv = document.getElementById('voidCanvas');
const go = document.getElementById('voidGo');
if(!voidEl || !cv) return;

const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const COARSE = matchMedia('(pointer: coarse)').matches;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const INSIDE_HASH = /^#(sluzby|prace|kontakt|obl-|svc-)/;

/* ---------- Přepínání mezi scénou a obsahem „uvnitř“ ---------- */
let inside = false, diving = false;
function openInside(hash, instant){
  inside = true; diving = false;
  root.classList.add('is-inside'); root.classList.remove('is-diving');
  const el = hash && document.getElementById(hash.slice(1));
  if(el) el.scrollIntoView({block: "start"}); else scrollTo(0, 0);
  if(!instant){ const ins = document.getElementById('inside'); ins && ins.focus({preventScroll: true}); }
}
function closeInside(){
  inside = false; dive = 0; diveFrom = -1;
  root.classList.remove('is-inside', 'is-diving');
  scrollTo(0, 0); start();
}
if(INSIDE_HASH.test(location.hash)) openInside(location.hash, true);
addEventListener('popstate', () => {
  if(INSIDE_HASH.test(location.hash)){ if(!inside) openInside(location.hash, true); }
  else if(inside) closeInside();
});
/* odkazy na sekce uvnitř (#sluzby, /#prace…) otevřou obsah i bez průletu */
document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('a[href*="#"]');
  if(!a || a === go) return;
  const u = new URL(a.href, location.href);
  if(u.pathname !== location.pathname || !INSIDE_HASH.test(u.hash)) return;
  if(!inside){ e.preventDefault(); history.pushState(null, "", u.hash); openInside(u.hash); }
});
/* tlačítko „Zpět k černé díře“ uvnitř */
document.querySelectorAll('[data-out]').forEach(b => b.addEventListener('click', () => {
  if(!inside) return;
  history.pushState(null, "", location.pathname + location.search); closeInside();
}));
/* logo uvnitř vrátí zpět na scénu */
document.querySelectorAll('.nav .brand').forEach(b => b.addEventListener('click', e => {
  if(!inside) return;
  e.preventDefault(); history.pushState(null, "", location.pathname + location.search); closeInside();
}));

let dive = 0, diveFrom = -1;
go && go.addEventListener('click', e => {
  e.preventDefault();
  if(diving || inside) return;
  history.pushState(null, "", "#sluzby");
  if(!gl || REDUCE){ root.classList.add('is-diving'); setTimeout(() => openInside("#sluzby"), REDUCE ? 250 : 500); return; }
  diving = true; diveFrom = -1; root.classList.add('is-diving'); start();
});

/* ---------- WebGL ---------- */
const gl = cv.getContext('webgl', {antialias: false, alpha: false, depth: false, powerPreference: "high-performance", preserveDrawingBuffer: false});
if(!gl){ root.classList.add('no-gl'); return; }

const VS = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const FS = `
precision highp float;
uniform vec2 uRes;
uniform float uTime, uIntro, uDist, uFov, uSteps;
uniform vec3 uCam, uFwd, uRight, uUp;
uniform vec3 uGal;                                /* směr ke spirální galaxii (podle orientace obrazovky) */

const float RIN = 2.6, ROUT = 15.0;

float hash(vec3 p){ p = fract(p*0.3183099 + 0.1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float hash2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7)))*43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash2(i), hash2(i+vec2(1,0)), f.x), mix(hash2(i+vec2(0,1)), hash2(i+vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p){ float s = 0.0, a = 0.5; for(int i = 0; i < 5; i++){ s += a*noise(p); p = p*2.03 + 7.1; a *= 0.5; } return s; }

/* obloha: hvězdy ve třech vrstvách (jasné, střední, drobné), pás Mléčné dráhy s prachem a vzdálená spirální galaxie */
const vec3 NB = vec3(0.55, 0.83, 0.08);           /* normála roviny Mléčné dráhy */
vec3 galaxy(vec3 d){
  vec3 G = normalize(uGal);
  float cg = dot(d, G);
  if(cg < 0.94) return vec3(0.0);
  vec3 e1 = normalize(cross(G, vec3(0.15, 1.0, 0.0))), e2 = cross(e1, G);
  vec2 q = vec2(dot(d, e1), dot(d, e2))/0.07;
  float ca = cos(0.55), sa = sin(0.55);
  q = mat2(ca, -sa, sa, ca)*q; q.y /= 0.42;
  float r = length(q), a = atan(q.y, q.x);
  float arms = 0.5 + 0.5*cos(2.0*(a - 2.6*log(r + 0.06)));
  float n = fbm(q*2.6 + 4.0);
  float disc = exp(-r*1.8)*(0.18 + 1.3*pow(arms, 2.2)*n);
  float bulge = exp(-r*r*12.0);
  vec3 c = vec3(0.56, 0.58, 1.0)*disc*0.55 + vec3(1.0, 0.9, 0.8)*bulge*1.1;
  return c*smoothstep(0.94, 0.97, cg);
}
vec3 stars(vec3 d){
  vec3 c = vec3(0.0);
  vec3 nb = normalize(NB);
  vec3 b1 = normalize(cross(nb, vec3(0.0, 0.0, 1.0))), b2 = cross(nb, b1);
  float lat = dot(d, nb), lon = atan(dot(d, b2), dot(d, b1));
  float band = exp(-lat*lat*16.0);
  for(int k = 0; k < 3; k++){
    float sc = k == 0 ? 80.0 : (k == 1 ? 200.0 : 380.0);
    vec3 g = d*sc, id = floor(g), f = fract(g) - 0.5;
    float h = hash(id + float(k)*31.0);
    float th = (k == 0 ? 0.972 : (k == 1 ? 0.955 : 0.945)) - band*(k == 2 ? 0.2 : 0.03);
    if(h > th){
      vec3 o = vec3(hash(id + 1.3), hash(id + 4.7), hash(id + 9.1)) - 0.5;
      float r = length(f - o*0.45);
      float m = fract(h*91.0);
      float s = k == 0 ? 0.07 : (k == 1 ? 0.13 : 0.2);
      float b = exp(-r*r/(s*s))*(k == 0 ? 2.2 : (k == 1 ? 0.8 : 0.3))*(0.25 + 0.75*m*m);
      if(k == 0) b *= 0.85 + 0.15*sin(uTime*2.3 + h*400.0);
      float tc = fract(h*53.0);
      vec3 tint = tc < 0.3 ? vec3(1.0, 0.84, 0.68) : (tc < 0.75 ? vec3(1.0, 0.98, 0.96) : vec3(0.72, 0.8, 1.0));
      c += tint*b;
    }
  }
  /* Mléčná dráha: světlý pás, jasnější střed a tmavé prachové žíly */
  float n1 = fbm(vec2(lon*4.0, lat*12.0));
  float n2 = fbm(vec2(lon*10.0 + 3.0, lat*34.0));
  float core = exp(-lat*lat*70.0);
  float dust = smoothstep(0.42, 0.72, n2)*exp(-lat*lat*40.0);
  vec3 mw = (vec3(0.4, 0.34, 0.62)*band*n1 + vec3(0.8, 0.66, 0.82)*core*n1*n1*1.4)*(1.0 - 0.9*dust);
  c += mw*0.2;
  c += galaxy(d);
  return c;
}

/* akreční disk: teplota klesá s poloměrem, víří podle Keplera, Dopplerův jas; do fialova */
vec4 disk(vec3 p, vec3 rd){
  float r = length(p.xz);
  if(r < RIN || r > ROUT) return vec4(0.0);
  float ang = atan(p.z, p.x);
  float om = 1.6*pow(r, -1.5);
  float a = ang + uTime*om*3.0;
  float lr = log(r);
  float n = fbm(vec2(a*3.0, lr*9.0)) * 0.65 + fbm(vec2(a*9.0 + lr*4.0, lr*30.0))*0.45;
  float rings = 0.82 + 0.18*sin(lr*42.0 + n*9.0);
  n = pow(n, 1.6)*1.9;
  float x = RIN/r;
  float T = pow(x, 0.75)*pow(max(1.0 - sqrt(x*0.98), 0.0), 0.25)*2.6;
  /* zapálení disku při nástupu: od vnitřního okraje ven */
  float ign = smoothstep(RIN + (uIntro*1.35 - 0.25)*(ROUT - RIN), RIN + (uIntro*1.35 - 0.45)*(ROUT - RIN), r);
  /* rychlost disku a Dopplerův faktor (foton letí ke kameře: -rd) */
  float v = clamp(sqrt(0.5/(r - 1.0)), 0.0, 0.7);
  vec3 vel = normalize(vec3(-p.z, 0.0, p.x))*v;
  float g = sqrt(1.0 - v*v)/(1.0 - dot(vel, -rd));
  float grav = sqrt(max(1.0 - 1.0/r, 0.0));
  float D = g*grav;
  float I = T*T*pow(D, 4.0)*n*rings*0.55;
  /* barva: horký střed bíle, okraje do teplé slonovinové, přibližující se strana do studené */
  vec3 warm = vec3(0.66, 0.42, 1.0), hot = vec3(0.97, 0.92, 1.0), cool = vec3(0.7, 0.78, 1.0);
  vec3 col = mix(warm, hot, clamp(T*0.8, 0.0, 1.0));
  col = mix(col, cool, clamp((D - 1.0)*1.4, 0.0, 0.8));
  col = mix(col*vec3(0.78, 0.55, 1.0), col, clamp(D, 0.0, 1.0));
  float edge = smoothstep(ROUT, ROUT*0.55, r)*smoothstep(RIN, RIN + 0.35, r);
  float alpha = clamp(I*0.9, 0.0, 1.0)*edge;
  return vec4(col*I*edge*ign, alpha*ign);
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*uRes)/min(uRes.x, uRes.y);
  vec3 rd = normalize(uFwd + (uRight*uv.x + uUp*uv.y)*uFov);
  vec3 p = uCam;
  vec3 col = vec3(0.0);
  float trans = 1.0;
  vec3 h = cross(p, rd); float h2 = dot(h, h);
  bool fell = false;
  float py = p.y;
  vec3 glow = vec3(0.0);
  for(int i = 0; i < 400; i++){
    if(float(i) >= uSteps) break;
    float r = length(p);
    if(r < 1.0){ fell = true; break; }
    if(r > 60.0 && dot(p, rd) > 0.0) break;
    float dt = clamp(0.065*r*r/(1.0 + 0.25*r), 0.03, 2.4);
    if(r < 3.2) dt = min(dt, 0.08);
    vec3 acc = -1.5*h2*p/pow(r, 5.0);
    vec3 np = p + rd*dt + 0.5*acc*dt*dt;
    rd = normalize(rd + acc*dt);
    /* jemná fialová záře nad diskem a kolem fotonové sféry (ohýbá se stejně jako světlo) */
    float rxz = length(np.xz);
    float halo = exp(-abs(np.y)*1.6)*smoothstep(ROUT*1.2, RIN, rxz)*smoothstep(RIN*0.7, RIN*1.3, rxz);
    float ring = exp(-pow(r - 1.6, 2.0)*6.0);
    glow += trans*(vec3(0.55, 0.32, 1.0)*halo*0.022 + vec3(0.75, 0.6, 1.0)*ring*0.03)*dt;
    /* průchod rovinou disku */
    if(py*np.y < 0.0){
      float k = py/(py - np.y);
      vec3 hp = mix(p, np, k);
      vec4 dc = disk(hp, rd);
      col += trans*dc.rgb;
      trans *= 1.0 - dc.a;
      if(trans < 0.01) break;
    }
    p = np; py = p.y;
  }
  col += glow*smoothstep(0.15, 0.8, uIntro);
  if(!fell){
    vec3 bg = stars(rd)*smoothstep(0.0, 0.35, uIntro);
    col += trans*bg;
  }
  /* slabá záře kolem fotonové sféry */
  /* tónování, expozice při nástupu a ponoru */
  float ex = smoothstep(0.0, 0.25, uIntro)*1.15;
  col = 1.0 - exp(-col*ex*1.4);
  col = pow(col, vec3(1.05));
  col *= 1.0 - 0.35*dot(uv, uv)*0.6;
  col += (hash2(gl_FragCoord.xy + fract(uTime)*100.0) - 0.5)/255.0;
  gl_FragColor = vec4(col, 1.0);
}`;

function sh(type, src){
  const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
  if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){ console.warn(gl.getShaderInfoLog(s)); return null; }
  return s;
}
const vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
const prog = gl.createProgram();
if(!vs || !fs){ root.classList.add('no-gl'); return; }
gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){ root.classList.add('no-gl'); return; }
gl.useProgram(prog);
const buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
const loc = gl.getAttribLocation(prog, 'p');
gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
const U = {};
["uRes","uTime","uIntro","uDist","uFov","uSteps","uCam","uFwd","uRight","uUp","uGal"].forEach(n => U[n] = gl.getUniformLocation(prog, n));

/* ---------- Nápis jako textura (písmo Archivo, široký řez) ---------- */
/* ---------- Kamera, myš, kvalita ---------- */
let mx = 0, my = 0, sx = 0, sy = 0;
addEventListener('pointermove', e => { mx = e.clientX/innerWidth*2 - 1; my = e.clientY/innerHeight*2 - 1; }, {passive: true});
if(COARSE) addEventListener('deviceorientation', e => {
  if(e.gamma == null) return; mx = clamp(e.gamma/30, -1, 1); my = clamp((e.beta - 45)/30, -1, 1);
}, {passive: true});

/* rozlišení: začne střízlivě a podle času snímku se přizpůsobí (až do plného DPR) */
const DPR = Math.min(devicePixelRatio || 1, 2);
const FIXED = /[?&]hq\b/.test(location.search);
let scale = FIXED ? 1 : COARSE ? 0.7 : 0.85, steps = COARSE ? 170 : 240;
let W = 0, H = 0;
function resize(){
  const w = Math.max(1, Math.round(innerWidth*DPR*scale)), h = Math.max(1, Math.round(innerHeight*DPR*scale));
  if(w === W && h === H) return;
  W = cv.width = w; H = cv.height = h;
  gl.viewport(0, 0, W, H);
}
addEventListener('resize', resize);
resize();

const t0 = performance.now();
let running = false, raf = 0, last = 0, ft = [], tuned = 0;
const ease = x => x < 0.5 ? 4*x*x*x : 1 - Math.pow(-2*x + 2, 3)/2;
const easeIn = x => Math.pow(x, 2.4);

function frame(now){
  raf = 0;
  const time = (now - t0)/1000;
  const intro = REDUCE ? 1 : clamp(time/1.1);
  sx += (mx - sx)*0.04; sy += (my - sy)*0.04;

  /* ponor: kamera se rozjede k díře, zorné pole se rozšíří */
  if(diving){
    if(diveFrom < 0) diveFrom = now;
    dive = clamp((now - diveFrom)/1700);
    if(dive >= 1){ openInside("#sluzby"); return; }
  }
  const dv = easeIn(dive);
  const portrait = innerHeight > innerWidth;
  let dist = (portrait ? 34 : 38)*(1 - dv) + 1.15*dv;
  /* nástup: kamera přiletí z dálky během první sekundy */
  if(!REDUCE) dist += 14*Math.pow(1 - clamp(time/1.6), 3);
  const az = (portrait ? -0.03 : -0.07) + sx*0.22 + Math.sin(time*0.07)*0.06;
  const el = 0.105 + sy*0.06 + dv*0.12;
  const cam = [Math.sin(az)*Math.cos(el)*dist, Math.sin(el)*dist, Math.cos(az)*Math.cos(el)*dist];
  /* cíl lehce pod dírou, aby nad textem a tlačítkem zůstala díra celá v záběru */
  const tgt = [0, portrait ? -4 : -1.6, 0];
  let f = [tgt[0]-cam[0], tgt[1]-cam[1], tgt[2]-cam[2]];
  const fl = Math.hypot(...f); f = f.map(v => v/fl);
  const roll = -0.07 + sx*0.02;
  const wu = [Math.sin(roll), Math.cos(roll), 0];
  let r = [f[1]*wu[2]-f[2]*wu[1], f[2]*wu[0]-f[0]*wu[2], f[0]*wu[1]-f[1]*wu[0]];
  const rl = Math.hypot(...r); r = r.map(v => v/rl);
  const u = [r[1]*f[2]-r[2]*f[1], r[2]*f[0]-r[0]*f[2], r[0]*f[1]-r[1]*f[0]];

  gl.uniform2f(U.uRes, W, H);
  gl.uniform1f(U.uTime, time);
  gl.uniform1f(U.uIntro, intro);
  gl.uniform1f(U.uDist, dist);
  gl.uniform1f(U.uFov, (portrait ? 0.66 : 0.58) + dv*0.9);
  gl.uniform1f(U.uSteps, steps);
  gl.uniform3fv(U.uGal, portrait ? [0.14, -0.33, -0.93] : [-0.2, -0.25, -0.95]);
  gl.uniform3fv(U.uCam, cam); gl.uniform3fv(U.uFwd, f); gl.uniform3fv(U.uRight, r); gl.uniform3fv(U.uUp, u);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  voidEl.style.setProperty('--dive', dv.toFixed(3));

  /* ladění kvality podle skutečné rychlosti (prvních ~2 s, pak jednou za čas) */
  if(last){ ft.push(now - last); }
  last = now;
  if(ft.length >= 24 && !FIXED){
    ft.sort((a, b) => a - b);
    const med = ft[12]; ft = [];
    if(med > 26 && scale > 0.45){ scale = Math.max(0.45, scale*0.8); if(steps > 140) steps -= 30; resize(); }
    else if(med < 14 && scale < 1 && tuned < 6){ scale = Math.min(1, scale*1.15); tuned++; resize(); }
  }

  if(REDUCE && !diving){ running = false; return; }
  if(!inside && !document.hidden) raf = requestAnimationFrame(frame);
  else running = false;
}
function start(){
  if(inside) return;
  if(!raf){ running = true; last = 0; ft = []; raf = requestAnimationFrame(frame); }
}
document.addEventListener('visibilitychange', () => { if(!document.hidden) start(); });
if(!inside) start();
})();
