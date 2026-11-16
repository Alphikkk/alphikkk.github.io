/* Corphik prototyp – sdílené interakce */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  // menu na mobilu
  var mb = $('.menu-btn'), nav = $('.nav');
  if (mb && nav) {
    mb.addEventListener('click', function () {
      var o = nav.classList.toggle('open');
      mb.setAttribute('aria-expanded', o);
      mb.textContent = o ? 'Zavřít' : 'Menu';
    });
  }

  // odhalování při scrollu
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('.rv, .lang').forEach(function (el) { io ? io.observe(el) : el.classList.add('in'); });

  // ---------- Služby: filtr ----------
  var filter = $('.filter');
  if (filter) {
    filter.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      $$('button', filter).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      var f = b.dataset.f;
      $$('.svc').forEach(function (s) {
        s.classList.toggle('hide', f !== 'all' && s.dataset.m.indexOf(f) < 0);
      });
    });
  }
  // otevřít službu podle kotvy (#fix…)
  function openHash() {
    var t = location.hash && document.getElementById(location.hash.slice(1));
    if (t && t.tagName === 'DETAILS') { t.open = true; setTimeout(function () { t.scrollIntoView({ block: 'center' }); }, 60); }
  }
  openHash(); addEventListener('hashchange', openHash);

  // ---------- Služby: kalkulačka vzdálené pomoci ----------
  var rng = $('#mins');
  if (rng) {
    var upd = function () {
      var m = +rng.value, blocks = Math.ceil(m / 15);
      $('#minsOut').textContent = m >= 60 ? (Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + (m % 60) + ' min' : '')) : m + ' min';
      $('#price').textContent = (blocks * 100).toLocaleString('cs-CZ') + ' Kč';
      $('#blocks').textContent = blocks + ' × 15 min po 100 Kč';
    };
    rng.addEventListener('input', upd); upd();
  }

  // ---------- Stavba PC: body na fotce ----------
  var hs = $$('.hs'), parts = $$('.parts button');
  if (hs.length) {
    var pick = function (k) {
      hs.forEach(function (h) { h.setAttribute('aria-pressed', h.dataset.k === k); });
      parts.forEach(function (p) { p.setAttribute('aria-expanded', p.dataset.k === k); });
    };
    hs.forEach(function (h) { h.addEventListener('click', function () { pick(h.dataset.k); var p = $('.parts button[data-k="' + h.dataset.k + '"]'); if (innerWidth < 860) p.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }); });
    parts.forEach(function (p) {
      p.addEventListener('click', function () { pick(p.getAttribute('aria-expanded') === 'true' ? '' : p.dataset.k); });
      p.addEventListener('mouseenter', function () { hs.forEach(function (h) { h.style.transform = h.dataset.k === p.dataset.k ? 'scale(1.18)' : ''; }); });
      p.addEventListener('mouseleave', function () { hs.forEach(function (h) { h.style.transform = ''; }); });
    });
  }

  // ---------- Portfolio: kolejnice ----------
  var rail = $('.rail');
  if (rail) {
    var prev = $('.rail-ctl .prev'), next = $('.rail-ctl .next'), bar = $('.progress i');
    var step = function () { var c = $('.work', rail); return c ? c.offsetWidth + 16 : 300; };
    prev.addEventListener('click', function () { rail.scrollBy({ left: -step(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { rail.scrollBy({ left: step(), behavior: 'smooth' }); });
    var sync = function () {
      var max = rail.scrollWidth - rail.clientWidth;
      prev.disabled = rail.scrollLeft < 4; next.disabled = rail.scrollLeft > max - 4;
      var vis = rail.clientWidth / rail.scrollWidth;
      bar.style.width = (vis * 100) + '%';
      bar.style.transform = 'translateX(' + (max > 0 ? (rail.scrollLeft / max) * (1 / vis - 1) * 100 : 0) + '%)';
    };
    rail.addEventListener('scroll', sync, { passive: true }); addEventListener('resize', sync); sync();
    // tažení myší
    var down = false, sx = 0, sl = 0, moved = false;
    rail.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft; });
    addEventListener('pointermove', function (e) {
      if (!down) return; var dx = e.clientX - sx;
      if (Math.abs(dx) > 5) { moved = true; rail.classList.add('drag'); }
      rail.scrollLeft = sl - dx;
    });
    addEventListener('pointerup', function () {
      if (!down) return; down = false;
      setTimeout(function () { rail.classList.remove('drag'); }, 0);
    });
    rail.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
    rail.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev.click(); }
    });
  }

  // ---------- O mně: časová osa ----------
  var tabs = $$('.tl-nav [role=tab]');
  if (tabs.length) {
    var sel = function (t, focus) {
      tabs.forEach(function (x) {
        var on = x === t;
        x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1;
        var p = document.getElementById(x.getAttribute('aria-controls'));
        p.hidden = !on; if (on) { p.classList.remove('show'); void p.offsetWidth; p.classList.add('show'); }
      });
      if (focus) t.focus();
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { sel(t); });
      t.addEventListener('keydown', function (e) {
        var d = (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1 : (e.key === 'ArrowUp' || e.key === 'ArrowLeft') ? -1 : 0;
        if (d) { e.preventDefault(); sel(tabs[(i + d + tabs.length) % tabs.length], true); }
      });
    });
  }

  // ---------- Kontakt: zkopírovat e-mail ----------
  var cp = $('.copy');
  if (cp) {
    cp.addEventListener('click', function () {
      var done = function () { cp.classList.add('ok'); cp.textContent = 'Zkopírováno ✓'; setTimeout(function () { cp.classList.remove('ok'); cp.textContent = 'Zkopírovat'; }, 1800); };
      if (navigator.clipboard) navigator.clipboard.writeText(cp.dataset.v).then(done, function () { location.href = 'mailto:' + cp.dataset.v; });
      else location.href = 'mailto:' + cp.dataset.v;
    });
  }
})();
