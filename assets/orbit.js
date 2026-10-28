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
let TILT = -9*Math.PI/180;
/* každá planeta má vlastní ikonu (24×24, tah) a povrch; krátké názvy pro telefon */
const ICON = {
  fix: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3.5 17.3a1.9 1.9 0 0 0 2.7 2.7l5.8-5.8a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
  remote: '<rect x="2.5" y="5" width="13" height="9" rx="1.5"/><path d="M6 18h6M9 14v4M18.5 9.5a3 3 0 0 1 0 4M20.8 7.5a6 6 0 0 1 0 8"/>',
  os: '<rect x="2.5" y="4" width="19" height="14" rx="2"/><path d="M6.5 9l2.5 2-2.5 2M11 13h4"/>',
  build: '<rect x="6.5" y="2.5" width="11" height="19" rx="2"/><circle cx="12" cy="14.5" r="3"/><path d="M9.5 6.5h5"/>',
  upgrade: '<rect x="5.5" y="5.5" width="13" height="13" rx="2"/><path d="M9 2.5v3M15 2.5v3M9 18.5v3M15 18.5v3M2.5 9h3M2.5 15h3M18.5 9h3M18.5 15h3M12 15V9M9.5 11.5 12 9l2.5 2.5"/>',
  web: '<rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="M2.5 9h19"/><circle cx="5.5" cy="6.8" r=".4"/><circle cx="7.6" cy="6.8" r=".4"/><path d="M7 13h6M7 16h10"/>',
  dns: '<circle cx="12" cy="5" r="2.2"/><circle cx="5" cy="18" r="2.2"/><circle cx="19" cy="18" r="2.2"/><circle cx="12" cy="13" r="1.6"/><path d="M12 7.2v4.2M10.7 14l-4.1 2.6M13.3 14l4.1 2.6M7.2 18h9.6"/>'
};
const SHORT = {
  cs: {fix: "Opravy", remote: "Na dálku", os: "Windows a Linux", build: "PC na míru", upgrade: "Upgrade", web: "Web", dns: "Doména a DNS"},
  en: {fix: "Repairs", remote: "Remote", os: "Windows & Linux", build: "Custom PC", upgrade: "Upgrade", web: "Website", dns: "Domain & DNS"},
  es: {fix: "Reparación", remote: "A distancia", os: "Windows y Linux", build: "PC a medida", upgrade: "Mejora", web: "Web", dns: "Dominio y DNS"}
};

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
    b.type = "button"; b.className = "planet p-" + area.id + " pl-" + id; b.dataset.svc = id;
    b.innerHTML = `<span class="orb"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[id] || ""}</svg></span>`
      + '<span class="lbl"><span class="full"></span><span class="short"></span></span>';
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
  /* telefon je na výšku: soustava se natočí svisle, ať planety využijí výšku obrazovky */
  TILT = (narrow ? -76 : -9)*Math.PI/180;
  flat = narrow ? .5 : .34;
  R = narrow ? Math.min(H*.47, W*.46/flat) : Math.min(W*.38, H*.46/flat);
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
    /* popisek dráhy hned vně jejího levého konce: mezi dráhami je na něj místo */
    const lx = cx - a*Math.cos(TILT) - 10, ly = cy - a*Math.sin(TILT) + 4;
    ringEls[i].label.setAttribute("x", lx.toFixed(1)); ringEls[i].label.setAttribute("y", ly.toFixed(1));
    ringEls[i].label.setAttribute("text-anchor", "end");
  });
  hole.style.setProperty("--d", Math.max(54, R*.24) + "px");
}

/* ---------- Texty (jazyk) ---------- */
function texts(){
  planets.forEach(p => {
    const s = findService(p.id);
    p.el.querySelector(".full").textContent = s.name[lang];
    p.el.querySelector(".short").textContent = (SHORT[lang] || SHORT.en)[p.id] || s.name[lang];
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
    /* planety u pravého okraje mají popisek vlevo, ať nevyjede z obrazovky */
    p.el.classList.toggle('flip', px > W*.74);
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
