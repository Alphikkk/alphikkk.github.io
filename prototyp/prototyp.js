/* Corphik – prototyp úvodní stránky */
(function () {
  'use strict';
  var S = {
    fix:     { n: 'Diagnostika a opravy', p: 'od 400 Kč', d: 'Najdu příčinu a vyřeším ji. Cena diagnostiky se odečte z opravy.', m: 'Částečně na dálku' },
    remote:  { n: 'Vzdálená pomoc', p: '400 Kč / hod', d: 'Připojím se k tvému počítači přes internet – ať jsi kdekoli. Účtuje se každých započatých 15 minut.', m: 'Na dálku' },
    os:      { n: 'Instalace Windows a Linuxu', p: 'od 700 Kč', d: 'Čistá instalace, ovladače, aktualizace a nastavení. Licence Windows není v ceně.', m: '' },
    build:   { n: 'Sestavení PC na míru', p: 'od 1 500 Kč', d: 'Vyberu komponenty podle rozpočtu a účelu, PC sestavím, otestuju a přivezu.', m: 'Dovoz po Praze a okolí v ceně' },
    upgrade: { n: 'Upgrade a zrychlení PC', p: 'od 500 Kč', d: 'Výměna disku, RAM nebo grafiky, vyčištění a nová teplovodivá pasta. Díly se platí zvlášť.', m: '' },
    web:     { n: 'Redesign webu', p: 'od 3 499 Kč', d: 'Nový vzhled, mobilní verze, rychlejší načítání a základní zabezpečení.', m: 'I na dálku' },
    dns:     { n: 'Nastavení domény a DNS', p: 'od 800 Kč', d: 'Záznamy A, AAAA, CNAME, MX a TXT (SPF, DKIM, DMARC). Propojím doménu s webem i e-mailem.', m: 'Pouze na dálku' }
  };
  var list = document.getElementById('triageList');
  var out = document.getElementById('triageOut');
  var $ = function (id) { return document.getElementById(id); };

  if (list && out) {
    var items = [].slice.call(list.querySelectorAll('a[data-k]'));
    // Z odkazů (fungují i bez JS) se stanou přepínače.
    items.forEach(function (a) {
      var b = document.createElement('button');
      b.type = 'button';
      b.dataset.k = a.dataset.k;
      b.textContent = a.textContent;
      b.setAttribute('aria-pressed', a.hasAttribute('aria-current') ? 'true' : 'false');
      a.parentNode.replaceChild(b, a);
    });
    list.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-k]');
      if (!b) return;
      var s = S[b.dataset.k];
      [].forEach.call(list.querySelectorAll('button'), function (x) {
        x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
      });
      $('tName').textContent = s.n;
      $('tPrice').textContent = s.p;
      $('tDesc').textContent = s.d;
      $('tMode').textContent = s.m;
      $('tMode').hidden = !s.m;
      place(b);
      out.classList.remove('swap');
      void out.offsetWidth;
      out.classList.add('swap');
    });

    // Na úzkém displeji se výsledek vloží přímo pod zvolenou položku (nic nepřekrývá);
    // na širokém zůstává vedle seznamu.
    var grid = list.parentNode;
    var narrow = window.matchMedia('(max-width: 820px)');
    var place = function (btn) {
      var cur = btn || list.querySelector('button[aria-pressed="true"]');
      if (narrow.matches && cur) {
        var before = btn ? btn.getBoundingClientRect().top : 0;
        cur.parentNode.appendChild(out);
        // Když se panel nad položkou zavře, stránka poskočí – vrátíme položku pod prst.
        if (btn) window.scrollBy(0, btn.getBoundingClientRect().top - before);
      } else if (out.parentNode !== grid) {
        grid.appendChild(out);
      }
    };
    place();
    if (narrow.addEventListener) narrow.addEventListener('change', function () { place(); });
    else if (narrow.addListener) narrow.addListener(function () { place(); });
  }

  // Černá díra v průzoru se při scrollu pomalu přibližuje.
  var hole = document.querySelector('.hero-hole');
  var still = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (hole && !still.matches) {
    var tick = false;
    window.addEventListener('scroll', function () {
      if (tick) return;
      tick = true;
      requestAnimationFrame(function () {
        var t = Math.min(1, window.scrollY / (window.innerHeight || 1));
        hole.style.setProperty('--s', t.toFixed(3));
        tick = false;
      });
    }, { passive: true });
  }

  var y = $('year');
  if (y) y.textContent = new Date().getFullYear();
})();
