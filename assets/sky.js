/* =========================================================
   Corphik – hvězdy na pozadí (úvod „uvnitř“ díry a portfolio)
   Hvězdy letí vstříc; při scrollu zrychlí a natáhnou se do čar, pak plynule zpomalí.
   Při prefers-reduced-motion stojí.
   ========================================================= */
(() => {
const root = document.documentElement;
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const cv = document.createElement('canvas');
cv.className = "sky"; cv.setAttribute("aria-hidden", "true");
document.body.prepend(cv);
root.classList.add('sky-live');
/* úvod: hvězdy jen „uvnitř“ díry; portfolio (html.space): pořád */
const on = () => root.classList.contains('is-inside') || root.classList.contains('space');
const ctx = cv.getContext('2d');
let W = 0, H = 0, DPR = 1, stars = [], boost = 0, lastY = scrollY, last = 0, raf = 0;
function resize(){
  DPR = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  cv.width = W*DPR; cv.height = H*DPR;
  const n = W < 700 ? 220 : 440;
  stars = Array.from({length: n}, () => ({x: Math.random()*2 - 1, y: Math.random()*2 - 1, z: Math.random()*.95 + .05, b: Math.random()}));
}
const respawn = s => { s.x = Math.random()*2 - 1; s.y = Math.random()*2 - 1; s.z = 1; };
function frame(now){
  raf = 0;
  if(!on() || document.hidden) return;
  const dt = last ? Math.min(.05, (now - last)/1000) : .016; last = now;
  const dy = Math.abs(scrollY - lastY); lastY = scrollY;
  /* rychlost letu podle rychlosti scrollu, pak plynule zpomalí; strop drží text čitelný */
  boost = Math.max(boost*Math.pow(.05, dt), Math.min(1.2, dy/dt/1600));
  const speed = REDUCE ? 0 : .04 + boost;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, W, H);
  const cx = W/2, cy = H*.42, f = Math.max(W, H)*.55;
  ctx.lineCap = "round";
  for(const st of stars){
    const z0 = st.z;
    st.z -= speed*dt;
    if(st.z <= .03){ respawn(st); continue; }
    const x1 = cx + st.x/st.z*f, y1 = cy + st.y/st.z*f;
    if(x1 < -40 || x1 > W + 40 || y1 < -40 || y1 > H + 40){ respawn(st); continue; }
    const zt = Math.min(1.2, z0 + speed*.08 + .002);
    const x0 = cx + st.x/zt*f, y0 = cy + st.y/zt*f;
    const near = 1 - st.z, a = Math.min(.85, (.2 + .8*st.b)*near*1.2);
    ctx.strokeStyle = `rgba(${Math.round(225 + 30*st.b)},${Math.round(212 + 30*st.b)},255,${a.toFixed(3)})`;
    ctx.lineWidth = .6 + near*1.4;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 + .01, y1); ctx.stroke();
  }
  raf = requestAnimationFrame(frame);
}
function run(){ if(!raf){ last = 0; lastY = scrollY; raf = requestAnimationFrame(frame); } }
addEventListener('resize', resize);
document.addEventListener('visibilitychange', () => { if(!document.hidden) run(); });
new MutationObserver(() => { if(on()){ boost = 1.2; run(); } })
  .observe(root, {attributes: true, attributeFilter: ["class"]});
resize(); if(on()) run();

})();
