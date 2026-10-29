/* =========================================================
   Corphik – úvod: navigace dostane tmavé sklo, když pod ní už není úvodní scéna;
   odkazy z jiných stránek (#sluzby, #obl-…, #svc-…, #w-ask) po vykreslení služeb dojedou na místo.
   ========================================================= */
(() => {
const nav = document.querySelector('.nav'), hero = document.querySelector('.hero');
if(nav && hero){
  const navBg = () => nav.classList.toggle('solid', scrollY > hero.offsetHeight - 120);
  addEventListener('scroll', navBg, {passive: true}); navBg();
}
addEventListener('load', () => {
  if(!location.hash) return;
  const el = (window.corphikTarget && window.corphikTarget(location.hash)) || document.getElementById(location.hash.slice(1));
  if(el) el.scrollIntoView({block: "start"});
});
})();
