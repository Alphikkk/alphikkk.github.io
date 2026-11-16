/* Corphik prototyp – úvod: živá černá díra, do které se hází problémy. */
(function () {
  'use strict';
  var stage = document.querySelector('.stage');
  var cv = document.getElementById('hole');
  var chipsBox = document.querySelector('.chips');
  var result = document.querySelector('.result');
  var copy = document.querySelector('.home-copy');
  if (!stage || !cv) return;

  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var narrowQ = matchMedia('(max-width: 760px)');
  var ctx = cv.getContext('2d');
  var W = 0, H = 0, DPR = 1, cx = 0, cy = 0, R = 0;
  var tilt = 0.24, tiltT = 0.24, rot = -0.12, rotT = -0.12;
  var kick = 0, pulled = 0;

  // ---------- částice akrečního disku ----------
  var N = 1100, P = [];
  for (var i = 0; i < N; i++) {
    var u = Math.random();
    P.push({
      r: 1.55 + Math.pow(u, 1.7) * 3.1,      // v násobcích R
      a: Math.random() * Math.PI * 2,
      s: 0.6 + Math.random() * 0.9,          // velikost
      b: 0.35 + Math.random() * 0.65,        // jas
      w: (Math.random() - 0.5) * 0.06        // tloušťka disku
    });
  }

  function size() {
    var r = stage.getBoundingClientRect();
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = r.width; H = r.height;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    var narrow = narrowQ.matches;
    cx = narrow ? W * 0.5 : W * 0.68;
    cy = narrow ? H * 0.5 : H * 0.5;
    R = Math.min(W * (narrow ? 0.15 : 0.11), H * 0.16);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (!narrow) layoutChips();
    if (still) draw(0);
  }

  function draw(dt) {
    tilt += (tiltT - tilt) * 0.05;
    rot += (rotT - rot) * 0.05;
    kick *= 0.96;
    ctx.clearRect(0, 0, W, H);
    var cr = Math.cos(rot), sr = Math.sin(rot);
    var speed = 1 + kick * 6;
    var back = [], front = [];
    for (var i = 0; i < N; i++) {
      var p = P[i];
      p.a += dt * speed * 0.55 / Math.pow(p.r, 1.5);
      var r = p.r * R;
      var x = r * Math.cos(p.a), y = r * Math.sin(p.a) * tilt + p.w * R;
      var X = cx + x * cr - y * sr, Y = cy + x * sr + y * cr;
      (Math.sin(p.a) < 0 ? back : front).push([X, Y, p]);
    }
    // zadní polovina disku
    band(Math.PI, Math.PI * 2, 0.8);
    ctx.globalCompositeOperation = 'lighter';
    dots(back, 0.8);
    ctx.globalCompositeOperation = 'source-over';
    // zakřivené světlo – prstenec, který obepíná horizont shora i zdola
    var lg = ctx.createRadialGradient(cx, cy, R, cx, cy, R * 1.85);
    var la = Math.min(1, 0.75 * (1 + kick));
    lg.addColorStop(0, 'rgba(255,255,255,' + la.toFixed(3) + ')');
    lg.addColorStop(0.15, 'rgba(240,244,255,' + (la * 0.45).toFixed(3) + ')');
    lg.addColorStop(0.5, 'rgba(225,233,255,' + (la * 0.12).toFixed(3) + ')');
    lg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = lg;
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.85, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = Math.max(1.5, R * 0.03);
    ctx.strokeStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.03, 0, Math.PI * 2); ctx.stroke();
    // horizont událostí – jediná černá na celém webu
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(cx, cy, R * (1 + pulled * 0.08), 0, Math.PI * 2); ctx.fill();
    // přední polovina disku přes díru
    band(0, Math.PI, 1);
    ctx.globalCompositeOperation = 'lighter';
    dots(front, 1);
    ctx.globalCompositeOperation = 'source-over';
  }

  // hustý disk jako soustředné elipsy
  function band(a0, a1, k) {
    var r0 = R * 1.35, r1 = R * 4.6;
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(1, tilt);
    var g = ctx.createRadialGradient(0, 0, r0, 0, 0, r1);
    var a = Math.min(1, 0.85 * k * (1 + kick * 0.6));
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.04, 'rgba(255,255,255,' + a.toFixed(3) + ')');
    g.addColorStop(0.22, 'rgba(236,241,255,' + (a * 0.55).toFixed(3) + ')');
    g.addColorStop(0.55, 'rgba(220,229,255,' + (a * 0.18).toFixed(3) + ')');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, r1, a0, a1);
    ctx.arc(0, 0, r0, a1, a0, true);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function dots(list, k) {
    for (var i = 0; i < list.length; i++) {
      var q = list[i], p = q[2];
      // Dopplerovské zjasnění: strana, která letí k nám, svítí víc
      var dop = 0.6 + 0.4 * Math.cos(p.a + rot);
      var al = p.b * dop * k * (0.7 + kick * 0.3);
      ctx.fillStyle = 'rgba(255,255,255,' + al.toFixed(3) + ')';
      var s = p.s * (R / 75);
      ctx.fillRect(q[0], q[1], s * 2.2, s);
    }
  }

  var last = 0;
  function loop(t) {
    var dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016;
    last = t;
    draw(dt);
    bob(t);
    requestAnimationFrame(loop);
  }

  // ---------- naklánění podle kurzoru ----------
  window.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    var nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
    tiltT = 0.24 + ny * 0.22;
    rotT = -0.12 + nx * 0.22;
  }, { passive: true });

  // ---------- problémy ----------
  var S = {
    fix: ['Diagnostika a opravy', 'od 400 Kč', 'Najdu příčinu a vyřeším ji. Cena diagnostiky se odečte z opravy.', 'fix'],
    remote: ['Vzdálená pomoc', '400 Kč / hod', 'Připojím se k tvému počítači přes internet, ať jsi kdekoli. Účtuje se každých započatých 15 minut.', 'remote'],
    os: ['Instalace Windows a Linuxu', 'od 700 Kč', 'Čistá instalace, ovladače, aktualizace a nastavení. Licence Windows není v ceně.', 'os'],
    build: ['Sestavení PC na míru', 'od 1 500 Kč', 'Vyberu komponenty podle rozpočtu a účelu, PC sestavím, otestuju a přivezu.', 'build'],
    upgrade: ['Upgrade a zrychlení PC', 'od 500 Kč', 'Výměna disku, RAM nebo grafiky, vyčištění a nová teplovodivá pasta. Díly se platí zvlášť.', 'upgrade'],
    web: ['Redesign webu', 'od 3 499 Kč', 'Nový vzhled, mobilní verze, rychlejší načítání a základní zabezpečení.', 'web'],
    dns: ['Nastavení domény a DNS', 'od 800 Kč', 'Záznamy A, AAAA, CNAME, MX a TXT. Propojím doménu s webem i e-mailem.', 'dns']
  };
  var chips = [].slice.call(document.querySelectorAll('.chip'));
  var homes = [];

  function overlap(a, b, pad) {
    return !(a.x + a.w + pad < b.x || b.x + b.w + pad < a.x || a.y + a.h + pad < b.y || b.y + b.h + pad < a.y);
  }
  function layoutChips() {
    var sr = stage.getBoundingClientRect();
    var cr = copy.getBoundingClientRect();
    var block = [{ x: cr.left - sr.left, y: 0, w: Math.min(cr.width, 760), h: cr.bottom - sr.top },
                 { x: cx - R * 1.3, y: cy - R * 1.3, w: R * 2.6, h: R * 2.6 },
                 { x: W / 2 - 200, y: H - 80, w: 400, h: 80 }];
    var placed = [];
    chips.forEach(function (c, i) {
      var w = c.offsetWidth, h = c.offsetHeight, ok = null;
      for (var ring = 0; ring < 8 && !ok; ring++) {
        for (var k = 0; k < 36 && !ok; k++) {
          var ang = (i / chips.length) * Math.PI * 2 + k * 0.37 - 1.2;
          var rx = R * (2.3 + ring * 0.45), ry = R * (1.6 + ring * 0.35);
          var x = cx + Math.cos(ang) * rx - w / 2, y = cy + Math.sin(ang) * ry - h / 2;
          var box = { x: x, y: y, w: w, h: h };
          if (x < 12 || y < 12 || x + w > W - 12 || y + h > H - 12) continue;
          var hit = block.some(function (b) { return overlap(box, b, 8); }) ||
                    placed.some(function (b) { return overlap(box, b, 10); });
          if (!hit) ok = box;
        }
      }
      if (!ok) ok = { x: 12 + (i % 3) * (W / 3), y: H - 60 - Math.floor(i / 3) * 52, w: w, h: h };
      placed.push(ok);
      homes[i] = { x: ok.x, y: ok.y, ph: Math.random() * 6.28 };
      if (!c.classList.contains('drag')) place(c, ok.x, ok.y);
    });
  }
  function place(c, x, y) { c.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)'; }
  function bob(t) {
    if (narrowQ.matches) return;
    chips.forEach(function (c, i) {
      var h = homes[i];
      if (!h || c.classList.contains('drag') || c.classList.contains('gone') || c.classList.contains('back')) return;
      place(c, h.x + Math.sin(t / 1400 + h.ph) * 4, h.y + Math.cos(t / 1700 + h.ph) * 5);
    });
  }

  // tažení myší / prstem (na širokém displeji)
  chips.forEach(function (c, i) {
    var sx, sy, ox, oy, moved = false, id = null;
    c.addEventListener('pointerdown', function (e) {
      if (narrowQ.matches || c.classList.contains('gone')) return;
      id = e.pointerId; moved = false;
      c.setPointerCapture(id);
      var m = /translate3d\(([-\d.]+)px,\s*([-\d.]+)px/.exec(c.style.transform) || [0, 0, 0];
      ox = +m[1]; oy = +m[2]; sx = e.clientX; sy = e.clientY;
      c.classList.add('drag');
    });
    c.addEventListener('pointermove', function (e) {
      if (e.pointerId !== id) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
      place(c, ox + dx, oy + dy);
      var d = dist(c);
      pulled = Math.max(0, 1 - d / (R * 3));
    });
    function up(e) {
      if (e.pointerId !== id) return;
      id = null; c.classList.remove('drag'); pulled = 0;
      if (!moved || dist(c) < R * 2.6) { swallow(c); return; }
      // nedohodil – vrátí se zpátky
      c.classList.add('back');
      c.style.transition = 'transform .6s cubic-bezier(.2,.8,.1,1)';
      place(c, homes[i].x, homes[i].y);
      setTimeout(function () { c.style.transition = ''; c.classList.remove('back'); }, 620);
    }
    c.addEventListener('pointerup', up);
    c.addEventListener('pointercancel', up);
    c.addEventListener('click', function () { if (narrowQ.matches) swallow(c); });
    c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); swallow(c); } });
  });

  function dist(c) {
    var r = c.getBoundingClientRect(), s = cv.getBoundingClientRect();
    return Math.hypot(r.left + r.width / 2 - (s.left + cx), r.top + r.height / 2 - (s.top + cy));
  }

  function swallow(c) {
    if (c.classList.contains('gone')) return;
    var r = c.getBoundingClientRect(), s = cv.getBoundingClientRect();
    var tx = s.left + cx, ty = s.top + cy;
    var f = c.cloneNode(true);
    f.className = 'chip fly';
    f.removeAttribute('tabindex');
    f.style.cssText = 'left:0;top:0;width:' + r.width + 'px;transform:translate3d(' + r.left + 'px,' + r.top + 'px,0)';
    document.body.appendChild(f);
    c.classList.add('gone');
    c.style.visibility = 'hidden';
    var x0 = r.left + r.width / 2, y0 = r.top + r.height / 2;
    var a0 = Math.atan2(y0 - ty, x0 - tx), d0 = Math.hypot(x0 - tx, y0 - ty);
    var t0 = performance.now(), dur = still ? 1 : 1100;
    (function step(now) {
      var k = Math.min(1, (now - t0) / dur), e = k * k * (3 - 2 * k);
      var d = d0 * (1 - e), a = a0 + e * 5.2;          // spirála dovnitř
      var x = tx + Math.cos(a) * d - r.width / 2, y = ty + Math.sin(a) * d * 0.7 - r.height / 2;
      var sc = 1 - e * 0.95;
      f.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) rotate(' + (e * 260) + 'deg) scale(' + sc + ')';
      f.style.opacity = String(1 - Math.max(0, e - 0.7) / 0.3);
      if (k < 1) requestAnimationFrame(step);
      else { f.remove(); kick = 1; show(S[c.dataset.k]); }
    })(t0);
  }

  function show(s) {
    result.querySelector('h2').textContent = s[0];
    result.querySelector('.price').textContent = s[1];
    result.querySelector('.desc').textContent = s[2];
    result.querySelector('.detail').href = '/prototyp/sluzby/#' + s[3];
    result.classList.add('on');
    result.querySelector('h2').focus({ preventScroll: true });
  }
  function reset() {
    result.classList.remove('on');
    chips.forEach(function (c) { c.classList.remove('gone'); c.style.visibility = ''; });
  }
  result.querySelector('.x').addEventListener('click', function () { result.classList.remove('on'); });
  result.querySelector('.again').addEventListener('click', reset);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') result.classList.remove('on'); });

  size();
  addEventListener('resize', size);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(size);
  if (!still) requestAnimationFrame(loop);
})();
