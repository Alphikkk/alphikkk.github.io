/* =========================================================
   Corphik – planetární soustava služeb (úvod, obsah „uvnitř“ díry)
   Tři dráhy kolem malé černé díry: IT podpora, Stavba PC, Weby a domény (SVC_AREAS z app.js).
   Každá služba je planeta; klik otevře kartu s popisem, cenou a tlačítkem do košíku.
   Košík i texty bere z app.js (SERVICES, SVC_AREAS, t, lang, getCart, money…), načítá se až po něm.
   Při prefers-reduced-motion planety stojí.
   ========================================================= */
(() => {
const stage = document.getElementById('orbitStage');
const card = document.getElementById('orbitCard');
const bar = document.getElementById('orbitBar');
if(!stage || typeof SVC_AREAS === "undefined") return;

const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const NS = "http://www.w3.org/2000/svg";
const esc2 = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
/* dráhy zevnitř ven; barva planet podle oblasti, rychlost klesá s poloměrem (jako u Keplera) */
const ORB = [
  {r: .44, speed: .16, hue: "it"},
  {r: .7, speed: .1, hue: "pc"},
  {r: .96, speed: .065, hue: "web"}
];
const TILT = -9*Math.PI/180;

/* ---------- Kostra: dráhy (SVG), díra uprostřed, planety ---------- */
const svg = document.createElementNS(NS, "svg");
svg.setAttribute("class", "orbit-rings"); svg.setAttribute("aria-hidden", "true");
stage.appendChild(svg);
const hole = document.createElement("div");
hole.className = "orbit-hole"; hole.setAttribute("aria-hidden", "true");
stage.appendChild(hole);

const planets = [];
SVC_AREAS.forEach((area, ai) => {
  const n = area.ids.length;
  area.ids.forEach((id, k) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "planet p-" + area.id; b.dataset.svc = id;
    b.innerHTML = '<span class="orb"></span><span class="lbl"></span>';
    stage.appendChild(b);
    planets.push({el: b, id, area: area.id, ring: ai, a0: (k/n)*Math.PI*2 + ai*1.3 + .4});
  });
});
const ringEls = ORB.map(() => {
  const g = document.createElementNS(NS, "g");
  const back = document.createElementNS(NS, "path"), front = document.createElementNS(NS, "path"), label = document.createElementNS(NS, "text");
  back.setAttribute("class", "ring back"); front.setAttribute("class", "ring front"); label.setAttribute("class", "ring-l");
  g.append(back, front, label); svg.appendChild(g);
  return {back, front, label};
});

/* ---------- Rozměry ---------- */
let W = 0, H = 0, cx = 0, cy = 0, R = 0, flat = .34;
function layout(){
  const r = stage.getBoundingClientRect();
  W = r.width; H = r.height;
  const narrow = W < 640;
  cx = W/2; cy = H/2;
  R = Math.min(W*(narrow ? .47 : .42), H*(narrow ? 1.05 : 1.25));
  flat = narrow ? .42 : .34;
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  ORB.forEach((o, i) => {
    const a = R*o.r, b = a*flat;
    /* zadní a přední polovina zvlášť, aby přední šla přes díru a zadní za ni */
    const arc = (s, e) => {
      const p = t => { const x = a*Math.cos(t), y = b*Math.sin(t); return [cx + x*Math.cos(TILT) - y*Math.sin(TILT), cy + x*Math.sin(TILT) + y*Math.cos(TILT)]; };
      let d = ""; for(let k = 0; k <= 48; k++){ const [x, y] = p(s + (e - s)*k/48); d += (k ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1); }
      return d;
    };
    ringEls[i].back.setAttribute("d", arc(Math.PI, Math.PI*2));
    ringEls[i].front.setAttribute("d", arc(0, Math.PI));
    /* popisek dráhy na její přední (spodní) části, každý v jiném úhlu, ať se nepřekrývají */
    const th = Math.PI*(.5 + .17*(i - 1)) + .06, x = a*Math.cos(th), y = b*Math.sin(th);
    const lx = cx + x*Math.cos(TILT) - y*Math.sin(TILT), ly = cy + x*Math.sin(TILT) + y*Math.cos(TILT) + 18;
    ringEls[i].label.setAttribute("x", lx.toFixed(1)); ringEls[i].label.setAttribute("y", ly.toFixed(1));
    ringEls[i].label.setAttribute("text-anchor", "middle");
  });
  hole.style.setProperty("--d", Math.max(54, R*.24) + "px");
}

/* ---------- Texty (jazyk) ---------- */
function texts(){
  planets.forEach(p => {
    const s = findService(p.id);
    p.el.querySelector(".lbl").textContent = s.name[lang];
    p.el.setAttribute("aria-label", s.name[lang] + ", " + s.price[lang]);
  });
  ORB.forEach((o, i) => ringEls[i].label.textContent = t("s.a." + SVC_AREAS[i].id));
  if(sel) showCard(sel, true);
  renderBar();
}

/* ---------- Pohyb ---------- */
let time = 0, last = 0, speed = 1, target = 1, raf = 0, sel = null;
function place(){
  planets.forEach(p => {
    const o = ORB[p.ring], a = R*o.r, b = a*flat;
    const th = p.a0 + time*o.speed;
    const x = a*Math.cos(th), y = b*Math.sin(th);
    const px = cx + x*Math.cos(TILT) - y*Math.sin(TILT), py = cy + x*Math.sin(TILT) + y*Math.cos(TILT);
    const depth = Math.sin(th);                      /* +1 vpředu (blíž), −1 vzadu */
    const sc = .78 + .3*(depth + 1)/2;
    p.el.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px) scale(${sc.toFixed(3)})`;
    p.el.style.zIndex = depth > 0 ? 4 : 1;
    p.el.style.setProperty("--fade", (.55 + .45*(depth + 1)/2).toFixed(2));
  });
}
function tick(now){
  raf = 0;
  const dt = last ? Math.min(.05, (now - last)/1000) : 0; last = now;
  speed += (target - speed)*Math.min(1, dt*4);
  time += dt*speed;
  place();
  if(!REDUCE && document.documentElement.classList.contains('is-inside') && !document.hidden) raf = requestAnimationFrame(tick);
}
function run(){ if(!raf){ last = 0; raf = requestAnimationFrame(tick); } }
/* při najetí na soustavu se oběh zpomalí, ať se dá trefit */
stage.addEventListener('pointerenter', () => target = .25);
stage.addEventListener('pointerleave', () => target = sel ? .25 : 1);

/* ---------- Karta služby ---------- */
const order = planets.map(p => p.id);
function showCard(id, quiet){
  sel = id; target = .25;
  const s = findService(id), area = SVC_AREAS.find(a => a.ids.includes(id));
  planets.forEach(p => p.el.classList.toggle('on', p.id === id));
  const tag = s.remote ? `<span class="oc-tag">${esc2(t(s.onlyRemote ? "s.only" : s.tag === "partial" ? "s.partial" : "s.remote"))}</span>` : "";
  card.className = "orbit-card p-" + area.id;
  card.innerHTML =
    `<button class="oc-x" type="button" data-oc="close" aria-label="${esc2(t("o2.close"))}"></button>`
    + `<p class="oc-area">${esc2(t("s.a." + area.id))}</p>`
    + `<h3 class="oc-h">${esc2(s.name[lang])}</h3>${tag}`
    + `<p class="oc-d">${esc2(s.desc[lang])}</p>`
    + buyHTML(s)
    + `<div class="oc-nav"><button type="button" data-oc="prev">${esc2(t("o2.prev"))}</button><button type="button" data-oc="next">${esc2(t("o2.next"))}</button></div>`;
  card.hidden = false;
  stage.classList.add('has-card');
  updateCartUI();
  if(!quiet) card.querySelector('.buy').focus({preventScroll: true});
}
function hideCard(){
  const was = sel; sel = null; card.hidden = true; target = 1;
  stage.classList.remove('has-card');
  planets.forEach(p => p.el.classList.remove('on'));
  const p = planets.find(p => p.id === was); if(p) p.el.focus({preventScroll: true});
}
stage.addEventListener('click', e => {
  const p = e.target.closest('.planet'); if(!p) return;
  sel === p.dataset.svc ? hideCard() : showCard(p.dataset.svc);
});
card.addEventListener('click', e => {
  const b = e.target.closest('[data-oc]'); if(!b) return;
  const k = b.dataset.oc;
  if(k === "close") return hideCard();
  const i = order.indexOf(sel), n = order.length;
  showCard(order[(i + (k === "next" ? 1 : n - 1)) % n]);
});
addEventListener('keydown', e => { if(e.key === "Escape" && sel) hideCard(); });

/* ---------- Lišta košíku ---------- */
function plural(n){
  if(lang === "cs") return n === 1 ? t("o2.one") : n < 5 ? t("o2.few") : t("o2.many");
  return n === 1 ? t("o2.one") : t("o2.many");
}
function renderBar(){
  if(!bar) return;
  const ids = getCart(), n = ids.length;
  bar.classList.toggle('full', n > 0);
  bar.innerHTML = n
    ? `<span class="ob-dots">${ids.map(id => `<i class="p-${(SVC_AREAS.find(a => a.ids.includes(id)) || {id: "it"}).id}"></i>`).join("")}</span>`
      + `<span class="ob-t"><b>${n} ${esc2(plural(n))}</b> <span>${esc2(t("o2.from"))} ${esc2(money(estimate()))}</span></span>`
      + `<a class="ob-go" href="${esc2(typeof inLang === "function" ? inLang("/orders/") : "/orders/")}">${esc2(t("o2.go"))}</a>`
    : `<span class="ob-t ob-empty">${esc2(t("o2.empty"))}</span>`;
}
/* app.js mění košík ve svém posluchači na document; tenhle běží po něm */
document.addEventListener('click', e => { if(e.target.closest('[data-add]')) renderBar(); });
addEventListener('storage', e => { if(e.key === "corphikCart") renderBar(); });

/* ---------- Start: až když je obsah vidět ---------- */
const ro = new ResizeObserver(() => { layout(); place(); });
ro.observe(stage);
new MutationObserver(() => { if(document.documentElement.classList.contains('is-inside')){ layout(); place(); run(); } })
  .observe(document.documentElement, {attributes: true, attributeFilter: ["class"]});
document.addEventListener('visibilitychange', () => { if(!document.hidden) run(); });
/* texty se přepínají s jazykem (setLang v app.js volá updateCartUI přes render); stačí obnovit po kliknutí na jazyk */
document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => setTimeout(texts)));
texts(); layout(); place(); run();
})();
