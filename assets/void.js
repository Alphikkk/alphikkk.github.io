/* =========================================================
   Corphik – úvodní scéna (/, /en/, /es/)
   Černá díra v reálném čase (WebGL): paprsky světla se ohýbají kolem díry
   (Schwarzschild, rs = 1), akreční disk s Dopplerovým jasem, hvězdy,
   Mléčná dráha a spirální galaxie – gravitační čočka ohýbá i je.
   Díra je vedle nabídky na úvodu; tlačítka a karty služeb kameru vtáhnou do díry
   a uvnitř se otevře vybrané místo (služby, formulář).
   Bez knihoven. Bez WebGL zůstane statické pozadí z CSS, při
   prefers-reduced-motion se vykreslí jeden snímek a přechod je jen prolnutí.
   ========================================================= */
(() => {
const root = document.documentElement;
const voidEl = document.getElementById('void');
const cv = document.getElementById('voidCanvas');
const go = document.getElementById('voidGo');
/* tlačítka a karty služeb na úvodu: všechny vtáhnou do díry, každé otevře svoje místo uvnitř */
const divers = document.querySelectorAll('.void [data-dive]');
if(!voidEl || !cv) return;

const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const COARSE = matchMedia('(pointer: coarse)').matches;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const INSIDE_HASH = /^#(sluzby|w-ask|prace|kontakt|obl-|svc-)/;

/* ---------- Přepínání mezi scénou a obsahem „uvnitř“ ---------- */
let inside = false, diving = false, frozen = false;   /* frozen: pomalé zařízení, obraz stojí na posledním snímku */
let sized = false;                                  /* false: velikost plátna se přepočítá před dalším snímkem */
function openInside(hash, instant){
  inside = true; diving = false;
  root.classList.add('is-inside'); root.classList.remove('is-diving');
  /* služby jsou na úvodu jako jedna obrazovka (deck.js); staré kotvy (#sluzby, #obl-…, #svc-…) míří na ni */
  const el = hash && ((window.corphikTarget && window.corphikTarget(hash)) || document.getElementById(hash.slice(1)));
  if(el) el.scrollIntoView({block: "start"}); else scrollTo(0, 0);
  /* karta oblasti z úvodu: služby začínají nahoře, oblast se jen doroluje do záběru (na telefonu bývá níž) */
  const area = /^#obl-/.test(hash || "") && document.getElementById(hash.slice(1) + "-d");
  if(area) area.scrollIntoView({block: "nearest"});
  if(!instant){ const ins = document.getElementById('inside'); ins && ins.focus({preventScroll: true}); }
}
function closeInside(){
  inside = false; dive = 0; diveFrom = -1; sized = false;
  root.classList.remove('is-inside', 'is-diving');
  scrollTo(0, 0);
  /* bez WebGL (nebo když se díra nespustila) se nic nekreslí */
  if(gl && !root.classList.contains('no-gl')) start();
}
if(INSIDE_HASH.test(location.hash)) openInside(location.hash, true);
addEventListener('popstate', () => {
  if(INSIDE_HASH.test(location.hash)){ if(!inside) openInside(location.hash, true); }
  else if(inside) closeInside();
});
/* odkazy na sekce uvnitř (#sluzby, /#prace…) otevřou obsah i bez průletu */
document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('a[href*="#"]');
  if(!a || a.closest('.void [data-dive]')) return;
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

let dive = 0, diveFrom = -1, diveTo = "#sluzby";
divers.forEach(el => el.addEventListener('click', e => {
  e.preventDefault();
  if(diving || inside) return;
  diveTo = new URL(el.href, location.href).hash || "#sluzby";
  if(typeof track === "function") track("dive", {to: diveTo.slice(1)});
  history.pushState(null, "", diveTo);
  if(!gl || REDUCE || frozen || root.classList.contains('no-gl')){ root.classList.add('is-diving'); setTimeout(() => openInside(diveTo), REDUCE ? 250 : 500); return; }
  diving = true; diveFrom = -1; sized = false; root.classList.add('is-diving'); start();
}));

/* ---------- WebGL ---------- */
const gl = cv.getContext('webgl', {antialias: false, alpha: false, depth: false, powerPreference: "high-performance", preserveDrawingBuffer: false});
if(!gl){ root.classList.add('no-gl'); return; }
/* bez grafické karty (softwarové vykreslování) by díra zahltila procesor a stránka by se sekala:
   takové zařízení dostane statický obraz z CSS, tlačítko i průlet fungují dál */
try{
  const dbg = gl.getExtension('WEBGL_debug_renderer_info');
  const name = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : "";
  if(/swiftshader|llvmpipe|softpipe|software/i.test(name)){ root.classList.add('no-gl'); return; }
}catch(_){}

const VS = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const FS = `
precision highp float;
uniform vec2 uRes;
uniform float uTime, uIntro, uDist, uFov, uSteps;
uniform vec3 uCam, uFwd, uRight, uUp;
uniform vec3 uGal;                                /* směr ke spirální galaxii (podle orientace obrazovky) */
uniform vec2 uOff;                                /* posun díry na obrazovce (vpravo vedle textu, na mobilu nahoru) */
uniform vec2 uJit;                                /* posun o zlomek pixelu pro vyhlazování (TAA) */
uniform float uDither;

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
      c += tint*b*2.0;
    }
  }
  /* Mléčná dráha jen jako hustší pás jednotlivých hvězd (práh výše podle band): žádný rozptýlený svit,
     ten by čočka kolem díry rozmazala do kouřového oparu */
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
  vec2 uv = (gl_FragCoord.xy + uJit - 0.5*uRes)/min(uRes.x, uRes.y) - uOff;
  vec3 rd = normalize(uFwd + (uRight*uv.x + uUp*uv.y)*uFov);
  vec3 p = uCam;
  vec3 col = vec3(0.0);
  float trans = 1.0;
  vec3 h = cross(p, rd); float h2 = dot(h, h);
  bool fell = false;
  float py = p.y;
  vec3 glow = vec3(0.0);
  /* paprsek, který míjí díru daleko (b > 22), se jen mírně ohne a disk ani záři nepotká:
     ohyb ve slabém poli (rs/b)·(1 + cos α) se spočítá najednou místo krokování.
     Na telefonu je to většina obrazovky pod dírou, na počítači pás vlevo pod textem. */
  if(h2 > 484.0){
    float b = sqrt(h2);
    vec3 c = p - dot(p, rd)*rd;
    float a = (1.0 - dot(p, rd)/length(p))/b;
    rd = normalize(rd*cos(a) - normalize(c)*sin(a));
  }
  else{
  /* náhodný posun startu paprsku (jiný v každém snímku): vzorky záře nesedí na pevné mřížce kroků,
     takže místo soustředných „letokruhů“ vznikne šum, který vyhlazování (TAA) zprůměruje */
  p += rd*hash2(gl_FragCoord.xy + fract(uTime*7.31)*97.0);
  for(int i = 0; i < 400; i++){
    if(float(i) >= uSteps) break;
    float r = length(p);
    if(r < 1.0){ fell = true; break; }
    if(r > 60.0 && dot(p, rd) > 0.0) break;
    float dt = clamp(0.065*r*r/(1.0 + 0.25*r), 0.03, 2.4);
    if(r < 3.2) dt = min(dt, 0.08);
    /* ve vrstvě záře nad diskem kratší kroky, jinak záře (silná ~1) padá mezi kroky (až 2,4) a dělá vlny */
    else if(abs(p.y) < 3.0 && length(p.xz) < ROUT*1.3) dt = min(dt, 0.5);
    vec3 acc = -1.5*h2*p/pow(r, 5.0);
    vec3 np = p + rd*dt + 0.5*acc*dt*dt;
    rd = normalize(rd + acc*dt);
    /* fialová záře nad diskem a kolem fotonové sféry (ohýbá se stejně jako světlo) */
    float rxz = length(np.xz);
    float halo = exp(-abs(np.y)*1.272)*smoothstep(ROUT*1.2, RIN, rxz)*smoothstep(RIN*0.7, RIN*1.3, rxz);
    float ring = exp(-pow(r - 1.6, 2.0)*6.0);
    glow += trans*(vec3(0.55, 0.32, 1.0)*halo*0.06 + vec3(0.75, 0.6, 1.0)*ring*0.0788)*dt;
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
  }
  /* stín díry je úplně černý: paprsek, který spadl dovnitř, si záři nenese */
  if(fell) glow = vec3(0.0);
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
  /* černý bod: slabé okraje záře a hvězd se stáhnou do čisté černé (OLED); záře má měkký okraj, jen to nejslabší zmizí */
  col = max(col - 0.04, 0.0)*1.04;
  /* šum proti stupňům v přechodech, jen kde něco svítí: černá zůstane přesně 0.
     S TAA ho přidává až výstup (průměrování by ho smazalo). */
  col += uDither*step(0.004, max(col.r, max(col.g, col.b)))*(hash2(gl_FragCoord.xy + fract(uTime)*100.0) - 0.5)/255.0;
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
gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.bindAttribLocation(prog, 0, 'p'); gl.linkProgram(prog);
if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){ root.classList.add('no-gl'); return; }
gl.useProgram(prog);
const buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
const U = {};
["uRes","uTime","uIntro","uDist","uFov","uSteps","uCam","uFwd","uRight","uUp","uGal","uOff","uJit","uDither"].forEach(n => U[n] = gl.getUniformLocation(prog, n));

/* ---------- Vyhlazování v čase (TAA) ----------
   Jemné proužky disku jsou užší než pixel, u díry se lámou do schodů a blikají. Každý snímek se kreslí
   s posunem o zlomek pixelu (Halton 2,3) do textury a míchá se s historií předchozích snímků;
   historie se ořízne na rozsah barev okolních pixelů, aby za pohybem nezůstávaly šmouhy.
   Dva levné průchody navíc (10 čtení z textury na pixel) proti stovkám kroků paprsku. */
function mk(src){
  const f2 = sh(gl.FRAGMENT_SHADER, src); if(!f2) return null;
  const p = gl.createProgram(); gl.attachShader(p, vs); gl.attachShader(p, f2); gl.bindAttribLocation(p, 0, 'p'); gl.linkProgram(p);
  return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
}
const progR = mk(`precision mediump float;
uniform sampler2D uCur, uHist; uniform vec2 uPx; uniform float uBlend, uSeed;
float h(vec2 q){ return fract(sin(dot(q, vec2(12.9898, 78.233)))*43758.5453); }
void main(){
  vec2 t = gl_FragCoord.xy*uPx;
  vec3 c = texture2D(uCur, t).rgb, lo = c, hi = c;
  for(int y = -1; y <= 1; y++) for(int x = -1; x <= 1; x++){
    vec3 s = texture2D(uCur, t + vec2(float(x), float(y))*uPx).rgb; lo = min(lo, s); hi = max(hi, s);
  }
  /* šum ±½ úrovně: v 8bitové historii se jinak malé změny zaokrouhlí na nulu a barva se zasekne ve stupních */
  vec3 o = mix(c, clamp(texture2D(uHist, t).rgb, lo, hi), uBlend);
  gl_FragColor = vec4(o + step(0.002, max(o.r, max(o.g, o.b)))*(h(gl_FragCoord.xy + uSeed) - 0.5)/255.0, 1.0);
}`);
const progC = mk(`precision mediump float;
uniform sampler2D uTex; uniform vec2 uPx; uniform float uSeed;
float h(vec2 q){ return fract(sin(dot(q, vec2(12.9898, 78.233)))*43758.5453); }
void main(){
  vec3 o = texture2D(uTex, gl_FragCoord.xy*uPx).rgb;
  /* černá zůstane přesně černá: šum jen tam, kde něco svítí */
  gl_FragColor = vec4(o + step(0.002, max(o.r, max(o.g, o.b)))*(h(gl_FragCoord.xy + uSeed + 17.0) - 0.5)/255.0, 1.0);
}`);
const UR = progR && {cur: gl.getUniformLocation(progR, 'uCur'), hist: gl.getUniformLocation(progR, 'uHist'), px: gl.getUniformLocation(progR, 'uPx'), blend: gl.getUniformLocation(progR, 'uBlend'), seed: gl.getUniformLocation(progR, 'uSeed')};
const UC = progC && {tex: gl.getUniformLocation(progC, 'uTex'), px: gl.getUniformLocation(progC, 'uPx'), seed: gl.getUniformLocation(progC, 'uSeed')};
/* historie v 16bitových barvách, kde to grafika umí (jemné přechody bez stupňů); jinak 8 bitů s šumem */
const HF = gl.getExtension('OES_texture_half_float');
gl.getExtension('EXT_color_buffer_half_float');
let texType = HF ? HF.HALF_FLOAT_OES : gl.UNSIGNED_BYTE;
/* tři cíle: aktuální snímek a dvě historie, které se střídají */
const RT = [0, 1, 2].map(() => ({tex: gl.createTexture(), fb: gl.createFramebuffer()}));
let taa = !!(progR && progC), hist = 0, histOk = false, jit = 0;
const HALTON = [[.5,.333],[.25,.667],[.75,.111],[.125,.444],[.625,.778],[.375,.222],[.875,.556],[.0625,.889]];
function allocRT(){
  if(!taa) return;
  for(const t of RT){
    gl.bindTexture(gl.TEXTURE_2D, t.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, texType, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, t.fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t.tex, 0);
    if(gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE){
      /* do half-float nejde kreslit: znovu s 8 bity */
      if(texType !== gl.UNSIGNED_BYTE){ texType = gl.UNSIGNED_BYTE; gl.bindFramebuffer(gl.FRAMEBUFFER, null); return allocRT(); }
      taa = false;
    }
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  histOk = false;
}
/* scéna do textury s posunem, smíchání s historií, výsledek na obrazovku */
function draw(blend){
  if(!taa){ gl.uniform2f(U.uJit, 0, 0); gl.uniform1f(U.uDither, 1); gl.drawArrays(gl.TRIANGLES, 0, 3); return; }
  const seed = (jit*7.13) % 101;
  gl.uniform1f(U.uDither, 0);
  const j = HALTON[jit++ & 7], cur = RT[2], from = RT[hist], to = RT[1 - hist];
  gl.uniform2f(U.uJit, j[0] - .5, j[1] - .5);
  gl.bindFramebuffer(gl.FRAMEBUFFER, cur.fb); gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.useProgram(progR);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, cur.tex);
  gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, from.tex);
  gl.uniform1i(UR.cur, 0); gl.uniform1i(UR.hist, 1); gl.uniform2f(UR.px, 1/W, 1/H); gl.uniform1f(UR.blend, histOk ? blend : 0); gl.uniform1f(UR.seed, seed);
  gl.bindFramebuffer(gl.FRAMEBUFFER, to.fb); gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.useProgram(progC);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, to.tex);
  gl.uniform1i(UC.tex, 0); gl.uniform2f(UC.px, 1/W, 1/H); gl.uniform1f(UC.seed, seed);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.useProgram(prog);
  hist = 1 - hist; histOk = true;
}

/* ---------- Nápis jako textura (písmo Archivo, široký řez) ---------- */
/* ---------- Kamera, myš, kvalita ---------- */
let mx = 0, my = 0, sx = 0, sy = 0;
addEventListener('pointermove', e => { mx = e.clientX/innerWidth*2 - 1; my = e.clientY/innerHeight*2 - 1; }, {passive: true});
if(COARSE) addEventListener('deviceorientation', e => {
  if(e.gamma == null) return; mx = clamp(e.gamma/30, -1, 1); my = clamp((e.beta - 45)/30, -1, 1);
}, {passive: true});

/* kvalita: plátno má strop počtu pixelů (díra je měkká, roztažení obrazu není znát), slabší zařízení
   (telefon, málo jader nebo paměti) nižší. Podle času snímku se kvalita jen ubírá, nikdy nepřidává,
   takže se obraz neustále nepřepíná: nejdřív kroky paprsku, pak rozlišení, pak kreslení na 30 snímků/s,
   a když nestíhá ani to, obraz se zastaví na posledním snímku (frozen). */
const LOW = COARSE || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
const DPR = Math.min(devicePixelRatio || 1, 1.5);
const FIXED = /[?&]hq\b/.test(location.search);
const BUDGET = FIXED ? Infinity : LOW ? 0.35e6 : 1.0e6;
let scale = 1, steps = FIXED ? 240 : LOW ? 140 : 200, every = 1;
let W = 0, H = 0;
/* kde má díra být a jak velká: určuje home.css (--hole-x, --hole-y = střed jako podíl okna, --hole-dist = vzdálenost kamery) */
let hx = .5, hy = .5, hd = 38;
function place(){
  const cs = getComputedStyle(voidEl), n = (v, d) => { const x = parseFloat(cs.getPropertyValue(v)); return isNaN(x) ? d : x; };
  hx = n('--hole-x', .5); hy = n('--hole-y', .5); hd = n('--hole-dist', 38);
}
/* nová velikost plátna se nastaví až těsně před kreslením: změna velikosti plátno vymaže
   a mimo snímek by na okamžik probliklo černé */
function resize(){
  sized = true;
  place();
  /* při ponoru poloviční rozlišení: obraz letí a tmavne, rozdíl není vidět */
  const px = innerWidth*innerHeight*DPR*DPR, k = scale*Math.min(1, Math.sqrt(BUDGET/px))*(diving ? 0.55 : 1);
  const w = Math.max(1, Math.round(innerWidth*DPR*k)), h = Math.max(1, Math.round(innerHeight*DPR*k));
  if(w === W && h === H) return;
  W = cv.width = w; H = cv.height = h;
  gl.viewport(0, 0, W, H);
  allocRT();
}
addEventListener('resize', () => { sized = false; if(frozen) start(); });
resize();

const t0 = performance.now();
let running = false, raf = 0, last = 0, ft = [], tick = 0;
const ease = x => x < 0.5 ? 4*x*x*x : 1 - Math.pow(-2*x + 2, 3)/2;
const easeIn = x => Math.pow(x, 2.4);

function frame(now){
  raf = 0;
  /* zpomalený režim: kreslí se jen každý druhý snímek (30 snímků/s) */
  if(every > 1 && (tick++ % every)){ raf = requestAnimationFrame(frame); return; }
  if(!sized) resize();
  const time = (now - t0)/1000;
  const intro = REDUCE ? 1 : clamp(time/1.1);
  sx += (mx - sx)*0.04; sy += (my - sy)*0.04;

  /* ponor: kamera se rozjede k díře, zorné pole se rozšíří */
  if(diving){
    if(diveFrom < 0) diveFrom = now;
    dive = clamp((now - diveFrom)/1700);
    if(dive >= 1){ openInside(diveTo); return; }
  }
  const dv = easeIn(dive);
  const portrait = innerHeight > innerWidth;
  let dist = hd*(1 - dv) + 1.15*dv;
  /* nástup: kamera přiletí z dálky během první sekundy */
  if(!REDUCE) dist += 14*Math.pow(1 - clamp(time/1.6), 3);
  const az = (portrait ? -0.03 : -0.07) + sx*0.22 + Math.sin(time*0.07)*0.06;
  const el = 0.105 + sy*0.06 + dv*0.12;
  const cam = [Math.sin(az)*Math.cos(el)*dist, Math.sin(el)*dist, Math.cos(az)*Math.cos(el)*dist];
  const tgt = [0, 0, 0];
  let f = [tgt[0]-cam[0], tgt[1]-cam[1], tgt[2]-cam[2]];
  const fl = Math.hypot(...f); f = f.map(v => v/fl);
  const roll = -0.07 + sx*0.02;
  const wu = [Math.sin(roll), Math.cos(roll), 0];
  let r = [f[1]*wu[2]-f[2]*wu[1], f[2]*wu[0]-f[0]*wu[2], f[0]*wu[1]-f[1]*wu[0]];
  const rl = Math.hypot(...r); r = r.map(v => v/rl);
  const u = [r[1]*f[2]-r[2]*f[1], r[2]*f[0]-r[0]*f[2], r[0]*f[1]-r[1]*f[0]];

  gl.uniform2f(U.uRes, W, H);
  /* při ponoru se díra stáhne do středu, kamera letí přímo do ní */
  const k = (1 - dv)/Math.min(innerWidth, innerHeight);
  gl.uniform2f(U.uOff, (hx - .5)*innerWidth*k, (.5 - hy)*innerHeight*k);
  gl.uniform1f(U.uTime, time);
  gl.uniform1f(U.uIntro, intro);
  gl.uniform1f(U.uDist, dist);
  gl.uniform1f(U.uFov, (portrait ? 0.66 : 0.58) + dv*0.9);
  /* při ponoru jde skoro každý paprsek těsně kolem díry (nejdražší část): méně kroků, čím blíž */
  gl.uniform1f(U.uSteps, diving ? Math.round(Math.min(steps, 140)*(1 - 0.4*dv)) : steps);
  gl.uniform3fv(U.uGal, portrait ? [0.14, -0.33, -0.93] : [-0.2, -0.25, -0.95]);
  gl.uniform3fv(U.uCam, cam); gl.uniform3fv(U.uFwd, f); gl.uniform3fv(U.uRight, r); gl.uniform3fv(U.uUp, u);
  /* kamera pro obíhající IT problémy (orbit.js): kreslí je stejnou projekcí, aby seděly k disku */
  window.corphikVoidCam = {cam, f, r, u, fov: (portrait ? 0.66 : 0.58) + dv*0.9, ox: (hx - .5)*innerWidth*k, oy: (.5 - hy)*innerHeight*k};
  /* historie: v klidu silně (~5 snímků), při ponoru a nástupu slabě, ať pohyb nezanechává stopu */
  draw(diving || intro < 1 ? 0.4 : 0.82);
  voidEl.style.setProperty('--dive', dv.toFixed(3));

  /* ladění kvality podle skutečné rychlosti: po 20 snímcích nebo 1,5 s, jen dolů a rovnou o tolik,
     kolik chybí (need = kolikrát rychleji by snímek musel být), takže obraz se změní jen párkrát */
  if(last){ ft.push(now - last); }
  last = now;
  if(!FIXED && (ft.length >= 20 || (ft.length >= 4 && ft.reduce((a, b) => a + b, 0) > 1500))){
    ft.sort((a, b) => a - b);
    const med = ft[ft.length >> 1], need = every*16.7/med; ft = [];
    if(time < 1.6 || diving || need > 0.75) {}         /* během příletu se neměří, tam se kreslí víc */
    else if(need < 0.15) frozen = true;                 /* pod ~9 snímků/s ani snížená kvalita nepomůže */
    else if(steps > 110) steps = Math.max(110, Math.round(steps*Math.max(0.6, need)));
    else if(scale > 0.5){ scale = Math.max(0.5, scale*Math.max(0.6, Math.sqrt(need))); sized = false; }
    else if(every === 1) every = 2;
    else frozen = true;                                 /* obraz zůstane stát na posledním snímku, tlačítka fungují dál */
  }

  if((REDUCE || frozen) && !diving){ running = false; return; }
  if(!inside && !document.hidden) raf = requestAnimationFrame(frame);
  else running = false;
}
function start(){
  if(inside || root.classList.contains('no-gl')) return;
  if(!raf){ running = true; last = 0; ft = []; raf = requestAnimationFrame(frame); }
}
document.addEventListener('visibilitychange', () => { if(!document.hidden) start(); });
if(!inside) start();
})();
