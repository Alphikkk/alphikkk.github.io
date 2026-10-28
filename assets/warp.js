/* =========================================================
   Corphik – průlet službami (úvod, obsah „uvnitř“ díry)
   Po pádu do díry se letí dál vesmírem: scroll řídí rychlost letu, hvězdy se natahují do čar.
   Každá služba je jedna zastávka přes celou obrazovku (pořadí podle SVC_AREAS z app.js),
   na konci košík a objednávka. Texty, ceny a košík bere z app.js (načítá se až po něm).
   Při prefers-reduced-motion hvězdy stojí.
   ========================================================= */
(() => {
const box = document.getElementById('warpStops');
const cv = document.getElementById('warpSky');
const rail = document.getElementById('warpRail');
if(!box || typeof SVC_AREAS === "undefined") return;

const root = document.documentElement;
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc2 = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const ICON = {
  fix: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3.5 17.3a1.9 1.9 0 0 0 2.7 2.7l5.8-5.8a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
  remote: '<rect x="2.5" y="5" width="13" height="9" rx="1.5"/><path d="M6 18h6M9 14v4M18.5 9.5a3 3 0 0 1 0 4M20.8 7.5a6 6 0 0 1 0 8"/>',
  os: '<rect x="2.5" y="4" width="19" height="14" rx="2"/><path d="M6.5 9l2.5 2-2.5 2M11 13h4"/>',
  build: '<rect x="6.5" y="2.5" width="11" height="19" rx="2"/><circle cx="12" cy="14.5" r="3"/><path d="M9.5 6.5h5"/>',
  upgrade: '<rect x="5.5" y="5.5" width="13" height="13" rx="2"/><path d="M9 2.5v3M15 2.5v3M9 18.5v3M15 18.5v3M2.5 9h3M2.5 15h3M18.5 9h3M18.5 15h3M12 15V9M9.5 11.5 12 9l2.5 2.5"/>',
  web: '<rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="M2.5 9h19"/><circle cx="5.5" cy="6.8" r=".4"/><circle cx="7.6" cy="6.8" r=".4"/><path d="M7 13h6M7 16h10"/>',
  dns: '<circle cx="12" cy="5" r="2.2"/><circle cx="5" cy="18" r="2.2"/><circle cx="19" cy="18" r="2.2"/><circle cx="12" cy="13" r="1.6"/><path d="M12 7.2v4.2M10.7 14l-4.1 2.6M13.3 14l4.1 2.6M7.2 18h9.6"/>'
};
/* barva hvězd a akcentu podle oblasti (RGB) */
const HUE = {it: [180, 156, 255], pc: [143, 176, 255], web: [240, 168, 255]};
const ORDER = SVC_AREAS.flatMap(a => a.ids.map(id => ({id, area: a.id})));
const tr = (n, d) => { if(typeof track === "function") track(n, d); };

/* ---------- Zastávky ---------- */
function tagOf(s){ return s.remote ? t(s.onlyRemote ? "s.only" : s.tag === "partial" ? "s.partial" : "s.remote") : ""; }
function render(){
  box.innerHTML = ORDER.map((o, i) => {
    const s = findService(o.id), tag = tagOf(s);
    return `<section class="stop w-${o.area}" id="w-${o.id}" data-area="${o.area}" data-i="${i}" aria-labelledby="w-${o.id}-h">`
      + `<div class="stop-in">`
      + `<div class="stop-txt">`
      + `<p class="stop-k"><span>${esc2(t("s.a." + o.area))}</span><span class="stop-n">${i + 1} / ${ORDER.length}</span></p>`
      + `<h3 class="stop-h" id="w-${o.id}-h">${esc2(s.name[lang])}</h3>`
      + `<p class="stop-d">${esc2(s.desc[lang])}</p>`
      + (tag ? `<p class="stop-tag">${esc2(tag)}</p>` : "")
      + `<div class="stop-act">${buyHTML(s)}<a class="stop-ask" href="#w-ask" data-ask="${o.id}">${esc2(t("w.ask"))}</a></div>`
      + `</div>`
      + `<div class="stop-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round">${ICON[o.id] || ""}</svg></div>`
      + `</div></section>`;
  }).join("");
  if(rail) rail.innerHTML = SVC_AREAS.map(a => `<li class="w-${a.id}"><a href="#w-${a.ids[0]}" data-area="${a.id}"><span class="r-t">${esc2(t("s.a." + a.id))}</span>`
    + `<span class="r-dots">${a.ids.map(id => `<i data-dot="${id}"></i>`).join("")}</span></a></li>`).join("");
  updateCartUI();
  renderEnd();
  watch();
}

/* ---------- Konec cesty: košík ---------- */
function plural(n){
  if(lang === "cs") return n === 1 ? t("o2.one") : n < 5 ? t("o2.few") : t("o2.many");
  return n === 1 ? t("o2.one") : t("o2.many");
}
function renderEnd(){
  const bar = document.getElementById('warpCart'); if(!bar) return;
  const ids = getCart(), n = ids.length;
  bar.classList.toggle('full', n > 0);
  bar.innerHTML = n
    ? `<p class="wc-h">${esc2(t("w.cart"))}</p><ul class="wc-list">${ids.map(id => { const s = findService(id); const a = (SVC_AREAS.find(x => x.ids.includes(id)) || {id: "it"}).id;
        return s ? `<li class="w-${a}"><span>${esc2(s.name[lang])}</span><b>${esc2(s.price[lang])}</b></li>` : ""; }).join("")}</ul>`
      + `<p class="wc-sum"><span>${n} ${esc2(plural(n))}, ${esc2(t("o2.from"))}</span> <b>${esc2(money(estimate()))}</b></p>`
      + `<a class="wc-go" href="${esc2(typeof inLang === "function" ? inLang("/orders/") : "/orders/")}" data-order>${esc2(t("o2.go"))}</a>`
    : "";
}
document.addEventListener('click', e => {
  const add = e.target.closest('[data-add]');
  if(add){ renderEnd(); if(getCart().includes(add.dataset.add)) tr("cart-add", {service: add.dataset.add}); }
  const pick = e.target.closest('[data-pick]'); if(pick) tr("pick", {choice: pick.dataset.pick});
  if(e.target.closest('[data-order]')) tr("order-click", {items: getCart().length});
  /* „Zeptat se na tohle“: předvyplní zprávu a po doletu k formuláři dá kurzor do jména */
  const ask = e.target.closest('[data-ask]');
  if(ask){
    const s = findService(ask.dataset.ask), m = document.getElementById('wfMsg');
    if(s && m && (!m.value.trim() || m.dataset.auto === "1")){ m.value = t("w.pre") + s.name[lang] + "\n"; m.dataset.auto = "1"; }
    tr("ask", {service: ask.dataset.ask});
  }
  if(ask || (pick && pick.dataset.pick === "ask")) setTimeout(() => { const f = document.getElementById('wfName'); f && f.focus({preventScroll: true}); }, 700);
});
addEventListener('storage', e => { if(e.key === "corphikCart") renderEnd(); });

/* ---------- Kde právě jsem: zvýraznění zastávky, kolejnice, barva hvězd ---------- */
const seen = new Set();
let io = null, area = "it", targetHue = HUE.it.slice(), hue = HUE.it.slice();
function watch(){
  if(io) io.disconnect();
  io = new IntersectionObserver(es => es.forEach(e => {
    if(!e.isIntersecting) return;
    const st = e.target;
    if(st.dataset.i && !seen.has(st.id)){ seen.add(st.id); tr("service-view", {service: st.id.slice(2)}); }
    box.querySelectorAll('.stop.here').forEach(x => x !== st && x.classList.remove('here'));
    st.classList.add('here');
    area = st.dataset.area; targetHue = HUE[area].slice();
    if(rail){
      rail.querySelectorAll('li').forEach(li => li.classList.toggle('on', li.classList.contains('w-' + area)));
      rail.querySelectorAll('[data-dot]').forEach(d => d.classList.toggle('on', 'w-' + d.dataset.dot === st.id));
    }
    root.style.setProperty('--w-c', `rgb(${HUE[area].join(",")})`);
  }), {rootMargin: "-45% 0px -45% 0px"});
  box.querySelectorAll('.stop').forEach(s => io.observe(s));
  /* kolejnice i létající hvězdy jsou vidět jen mezi zastávkami služeb (ne na úvodní otázce a u formuláře) */
  const span = document.getElementById('warpStops');
  if(span) new IntersectionObserver(([e]) => { rail && rail.classList.toggle('show', e.isIntersecting); cv && cv.classList.toggle('show', e.isIntersecting); },
    {rootMargin: "-40% 0px -40% 0px"}).observe(span);
}

/* ---------- Hvězdy: let vpřed, rychlost podle scrollu ---------- */
const ctx = cv && cv.getContext('2d');
let W = 0, H = 0, DPR = 1, stars = [], speed = .06, boost = 0, lastY = scrollY, last = 0, raf = 0;
function resize(){
  if(!cv) return;
  DPR = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  cv.width = W*DPR; cv.height = H*DPR;
  const n = W < 700 ? 260 : 520;
  stars = Array.from({length: n}, () => ({x: (Math.random()*2 - 1), y: (Math.random()*2 - 1), z: Math.random()*.95 + .05, b: Math.random()}));
}
function frame(now){
  raf = 0;
  if(!root.classList.contains('is-inside') || document.hidden) return;
  const dt = last ? Math.min(.05, (now - last)/1000) : .016; last = now;
  const dy = Math.abs(scrollY - lastY); lastY = scrollY;
  boost = Math.max(boost*Math.pow(.04, dt), Math.min(1.8, dy/dt/1400));
  speed = REDUCE ? 0 : .05 + boost;
  for(let k = 0; k < 3; k++) hue[k] += (targetHue[k] - hue[k])*Math.min(1, dt*3);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, W, H);
  const cx = W/2, cy = H*.46, f = Math.max(W, H)*.55;
  ctx.lineCap = "round";
  for(const s of stars){
    const z0 = s.z;
    s.z -= speed*dt;
    if(s.z <= .03){ s.x = Math.random()*2 - 1; s.y = Math.random()*2 - 1; s.z = 1; continue; }
    const x1 = cx + s.x/s.z*f, y1 = cy + s.y/s.z*f;
    if(x1 < -50 || x1 > W + 50 || y1 < -50 || y1 > H + 50){ s.z = 1; s.x = Math.random()*2 - 1; s.y = Math.random()*2 - 1; continue; }
    /* stopa: kde byla hvězda o kousek dřív (delší při rychlém letu) */
    const zt = Math.min(1.2, z0 + speed*.09 + .002);
    const x0 = cx + s.x/zt*f, y0 = cy + s.y/zt*f;
    const near = 1 - s.z, a = Math.min(1, (.25 + .75*s.b)*near*1.4);
    const tint = .35 + .65*s.b;
    ctx.strokeStyle = `rgba(${Math.round(255 - (255 - hue[0])*tint)},${Math.round(255 - (255 - hue[1])*tint)},${Math.round(255 - (255 - hue[2])*tint)},${a.toFixed(3)})`;
    ctx.lineWidth = .6 + near*1.6;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 + .01, y1); ctx.stroke();
  }
  raf = requestAnimationFrame(frame);
}
function run(){ if(cv && !raf){ last = 0; lastY = scrollY; raf = requestAnimationFrame(frame); } }
addEventListener('resize', resize);
document.addEventListener('visibilitychange', () => { if(!document.hidden) run(); });
new MutationObserver(() => { if(root.classList.contains('is-inside')){ boost = 2.4; run(); } })
  .observe(root, {attributes: true, attributeFilter: ["class"]});

/* ---------- Rychlá zpráva (Web3Forms jako objednávky; bez klíče se otevře e-mail) ---------- */
const form = document.getElementById('w-ask');
if(form) form.addEventListener('submit', async e => {
  e.preventDefault();
  const $f = id => document.getElementById(id), st = $f('wfStatus'), btn = form.querySelector('.w-send');
  const name = $f('wfName').value.trim(), contact = $f('wfContact').value.trim(), msg = $f('wfMsg').value.trim();
  form.querySelectorAll('.bad').forEach(x => x.classList.remove('bad'));
  const bad = [!contact && $f('wfContact'), !msg && $f('wfMsg'), !$f('wfConsent').checked && $f('wfConsent')].filter(Boolean);
  if(bad.length){ bad.forEach(x => x.classList.add('bad')); st.textContent = t("w.err"); st.className = "w-status w-err"; bad[0].focus(); return; }
  if($f('wfHp').checked) return;
  const cart = getCart().map(findService).filter(Boolean).map(s => s.name[lang]);
  const text = `${msg}\n\n${t("w.fn")}: ${name || "-"}\n${t("w.fc")}: ${contact}` + (cart.length ? `\n${t("w.cart")}: ${cart.join(", ")}` : "");
  const key = typeof WEB3FORMS_KEY !== "undefined" ? WEB3FORMS_KEY : "";
  if(!key){ location.href = "mailto:ales@corphik.eu?subject=" + encodeURIComponent(t("w.subj")) + "&body=" + encodeURIComponent(text); return; }
  btn.disabled = true; st.textContent = t("ck.sending"); st.className = "w-status";
  try{
    const r = await fetch("https://api.web3forms.com/submit", {method: "POST", headers: {"Content-Type": "application/json", "Accept": "application/json"},
      body: JSON.stringify({access_key: key, subject: `${t("w.subj")}: ${name || contact}`, from_name: "Corphik web", ...(contact.includes("@") ? {replyto: contact} : {}), message: text})});
    const j = await r.json(); if(!j.success) throw 0;
    form.reset(); $f('wfMsg').dataset.auto = "";
    st.textContent = t("w.ok"); st.className = "w-status w-ok";
    tr("lead", {cart: cart.length});
  }catch(_){ st.textContent = t("ck.fail"); st.className = "w-status w-err"; }
  btn.disabled = false;
});

/* odkazy z jiných stránek (#sluzby, #obl-it, #svc-fix) míří na zastávky; void.js se ptá tady */
window.corphikWarpTarget = hash => {
  const id = (hash || "").slice(1);
  if(id === "sluzby") return document.getElementById('warp');
  const a = SVC_AREAS.find(x => "obl-" + x.id === id);
  if(a) return document.getElementById('w-' + a.ids[0]);
  if(id.startsWith("svc-")) return document.getElementById('w-' + id.slice(4));
  return null;
};

document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => setTimeout(render)));
resize(); render(); if(root.classList.contains('is-inside')) run();
})();
