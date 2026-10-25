/* =========================================================
   Corphik – pohyb na stránkách Portfolio a O mně
   - případové studie: fotky a snímky webu se při scrollu lehce posouvají (paralaxa)
   - O mně: disk černé díry se při scrollu nakloní
   Při prefers-reduced-motion se nic nehýbe. Načítá se po app.js.
   ========================================================= */
(() => {
if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
let ticking = false;

function update(){
  ticking = false;
  const vh = innerHeight;
  /* --p: 0 když je obraz pod oknem, 1 když odjel nahoru */
  document.querySelectorAll('.pf-media, .pf-device').forEach(st=>{
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
})();
