/* =========================================================
   Corphik – služby na jedné obrazovce (úvod, obsah „uvnitř“ díry)
   Vlevo 7 služeb po oblastech jako kompaktní řádky (ikona, název, cena, +), popis na rozkliknutí.
   Vpravo košík a krátká zpráva (Web3Forms jako objednávky). Žádné procházení po zastávkách.
   Texty, ceny a košík bere z app.js (SERVICES, SVC_AREAS, t, lang, getCart…), načítá se až po něm.
   ========================================================= */
(() => {
const list = document.getElementById('deckList');
if(!list || typeof SVC_AREAS === "undefined") return;

const esc2 = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const tr = (n, d) => { if(typeof track === "function") track(n, d); };
const ICON = {
  fix: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3.5 17.3a1.9 1.9 0 0 0 2.7 2.7l5.8-5.8a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
  remote: '<rect x="2.5" y="5" width="13" height="9" rx="1.5"/><path d="M6 18h6M9 14v4M18.5 9.5a3 3 0 0 1 0 4M20.8 7.5a6 6 0 0 1 0 8"/>',
  os: '<rect x="2.5" y="4" width="19" height="14" rx="2"/><path d="M6.5 9l2.5 2-2.5 2M11 13h4"/>',
  build: '<rect x="6.5" y="2.5" width="11" height="19" rx="2"/><circle cx="12" cy="14.5" r="3"/><path d="M9.5 6.5h5"/>',
  upgrade: '<rect x="5.5" y="5.5" width="13" height="13" rx="2"/><path d="M9 2.5v3M15 2.5v3M9 18.5v3M15 18.5v3M2.5 9h3M2.5 15h3M18.5 9h3M18.5 15h3M12 15V9M9.5 11.5 12 9l2.5 2.5"/>',
  web: '<rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="M2.5 9h19"/><circle cx="5.5" cy="6.8" r=".4"/><circle cx="7.6" cy="6.8" r=".4"/><path d="M7 13h6M7 16h10"/>',
  dns: '<circle cx="12" cy="5" r="2.2"/><circle cx="5" cy="18" r="2.2"/><circle cx="19" cy="18" r="2.2"/><circle cx="12" cy="13" r="1.6"/><path d="M12 7.2v4.2M10.7 14l-4.1 2.6M13.3 14l4.1 2.6M7.2 18h9.6"/>'
};
const tagOf = s => s.remote ? t(s.onlyRemote ? "s.only" : s.tag === "partial" ? "s.partial" : "s.remote") : "";

/* ---------- Seznam služeb ---------- */
function render(){
  list.innerHTML = SVC_AREAS.map(a => `<section class="d-area w-${a.id}" id="obl-${a.id}-d" aria-labelledby="d-${a.id}-h">`
    + `<h3 class="d-area-h" id="d-${a.id}-h">${esc2(t("s.a." + a.id))}</h3><ul class="d-rows">`
    + a.ids.map(id => {
        const s = findService(id), tag = tagOf(s);
        return `<li class="d-row" id="d-${id}">`
          + `<span class="d-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICON[id] || ""}</svg></span>`
          + `<button class="d-name" type="button" aria-expanded="false" aria-controls="d-${id}-x">${esc2(s.name[lang])}</button>`
          + `<span class="d-pr">${esc2(s.price[lang])}</span>`
          + `<button class="d-add" type="button" data-add="${id}" aria-pressed="false" aria-label="${esc2(t("cart.add") + ": " + s.name[lang])}"><span class="lab">${esc2(t("cart.add"))}</span><i class="d-star" aria-hidden="true"></i></button>`
          + `<div class="d-x" id="d-${id}-x" hidden><p>${esc2(s.desc[lang])}</p>`
          + `<p class="d-x-foot">${tag ? `<span class="d-tag">${esc2(tag)}</span>` : ""}<a class="d-ask" href="#w-ask" data-ask="${id}">${esc2(t("w.ask"))}</a></p></div>`
          + `</li>`;
      }).join("")
    + `</ul></section>`).join("");
  updateCartUI();
  renderCart();
}
list.addEventListener('click', e => {
  const b = e.target.closest('.d-name'); if(!b) return;
  const x = document.getElementById(b.getAttribute('aria-controls')), open = b.getAttribute('aria-expanded') !== "true";
  b.setAttribute('aria-expanded', open); x.hidden = !open;
  b.closest('.d-row').classList.toggle('open', open);
  if(open) tr("service-open", {service: b.closest('.d-row').id.slice(2)});
});

/* ---------- Košík nad formulářem (odejde se zprávou, samostatná objednávka už není) ---------- */
function plural(n){
  if(lang === "cs") return n === 1 ? t("o2.one") : n < 5 ? t("o2.few") : t("o2.many");
  return n === 1 ? t("o2.one") : t("o2.many");
}
function renderCart(){
  const box = document.getElementById('deckCart'); if(!box) return;
  const ids = getCart(), n = ids.length;
  box.hidden = !n;
  box.innerHTML = n
    ? `<ul class="dc-list">${ids.map(id => { const s = findService(id); const a = (SVC_AREAS.find(x => x.ids.includes(id)) || {id: "it"}).id;
        return s ? `<li class="w-${a}"><span>${esc2(s.name[lang])}</span><button type="button" data-remove="${id}" aria-label="${esc2(t("ck.remove") + ": " + s.name[lang])}">×</button></li>` : ""; }).join("")}</ul>`
      + `<p class="dc-sum"><span>${n} ${esc2(plural(n))}, ${esc2(t("o2.from"))}</span> <b>${esc2(money(estimate()))}</b></p>`
    : "";
}
document.addEventListener('click', e => {
  const add = e.target.closest('[data-add]');
  if(add){ renderCart(); if(getCart().includes(add.dataset.add)) tr("cart-add", {service: add.dataset.add}); }
  const rm = e.target.closest('[data-remove]'); if(rm){ toggleCart(rm.dataset.remove); renderCart(); }
  /* „Zeptat se na tohle“: předvyplní zprávu a dá kurzor do jména (formulář je hned vedle) */
  const ask = e.target.closest('[data-ask]');
  if(ask){
    e.preventDefault();
    const s = findService(ask.dataset.ask), m = document.getElementById('wfMsg');
    if(s && m && (!m.value.trim() || m.dataset.auto === "1")){ m.value = t("w.pre") + s.name[lang] + "\n"; m.dataset.auto = "1"; }
    const f = document.getElementById('w-ask'); f.scrollIntoView({block: "nearest", behavior: "smooth"});
    document.getElementById('wfName').focus({preventScroll: true});
    tr("ask", {service: ask.dataset.ask});
  }
});
addEventListener('storage', e => { if(e.key === "corphikCart") renderCart(); });

/* ---------- Krátká zpráva (Web3Forms jako objednávky; bez klíče se otevře e-mail) ---------- */
const form = document.getElementById('w-ask');
if(form) form.addEventListener('submit', async e => {
  e.preventDefault();
  const $f = id => document.getElementById(id), st = $f('wfStatus'), btn = form.querySelector('.w-send');
  const name = $f('wfName').value.trim(), contact = $f('wfContact').value.trim(), msg = $f('wfMsg').value.trim();
  form.querySelectorAll('.bad').forEach(x => x.classList.remove('bad'));
  const bad = [!contact && $f('wfContact'), !msg && $f('wfMsg')].filter(Boolean);
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

/* odkazy z jiných stránek (#sluzby, #obl-it, #svc-fix) míří sem; void.js se ptá tady */
window.corphikTarget = hash => {
  const id = (hash || "").slice(1);
  if(id === "sluzby" || id.startsWith("obl-")) return document.getElementById('deck');
  if(id.startsWith("svc-")){
    const row = document.getElementById('d-' + id.slice(4));
    if(row){ const b = row.querySelector('.d-name'); if(b && b.getAttribute('aria-expanded') !== "true") b.click(); }
    return row;
  }
  return null;
};

document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => setTimeout(render)));
render();
})();
