/* =========================================================
   Corphik – pohyb na stránkách Portfolio a O mně
   - případové studie: oběžná dráha se pootočí podle scrollu, obraz se při najetí myší lehce nakloní
   - O mně: disk černé díry se při scrollu nakloní
   Při prefers-reduced-motion se nic nehýbe. Načítá se po app.js.
   ========================================================= */
(() => {
if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
let ticking = false;

function update(){
  ticking = false;
  const vh = innerHeight;
  /* --p: 0 když je obraz pod oknem, 1 když odjel nahoru */
  document.querySelectorAll('.case-stage').forEach(st=>{
    const b = st.getBoundingClientRect();
    if(b.bottom < -100 || b.top > vh + 100) return;
    st.style.setProperty('--p', clamp((vh - b.top)/(vh + b.height)).toFixed(3));
  });
  const em = document.querySelector('.ab-emblem');
  if(em) em.style.setProperty('--s', clamp(scrollY/(vh*0.9)).toFixed(3));
}
function request(){ if(!ticking){ ticking = true; requestAnimationFrame(update); } }
addEventListener('scroll', request, {passive: true});
addEventListener('resize', request);
/* karty portfolia vykresluje app.js (i po přepnutí jazyka nebo filtru) */
const list = document.getElementById('pfList');
if(list) new MutationObserver(request).observe(list, {childList: true});
request();

/* náklon obrazu za kurzorem */
if(fine) document.addEventListener('pointermove', e=>{
  const st = e.target.closest && e.target.closest('.case-stage');
  document.querySelectorAll('.case-stage.tilt').forEach(x=>{ if(x !== st){ x.classList.remove('tilt'); const v = x.querySelector('.case-visual'); v.style.setProperty('--rx','0deg'); v.style.setProperty('--ry','0deg'); } });
  if(!st) return;
  const b = st.getBoundingClientRect(), v = st.querySelector('.case-visual');
  const x = (e.clientX - b.left)/b.width - .5, y = (e.clientY - b.top)/b.height - .5;
  st.classList.add('tilt');
  v.style.setProperty('--ry', (x*7).toFixed(2) + 'deg');
  v.style.setProperty('--rx', (-y*7).toFixed(2) + 'deg');
}, {passive: true});
})();
