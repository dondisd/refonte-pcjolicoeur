// PC Jolicoeur v3 — expérience continue « le chemin vers tes clés » (réf. Urban Jungle).
// Un seul flux : les scènes plein écran se fondent et s'enfoncent (push-in) au fil du
// scroll, les panneaux de verre glissent par-dessus, la maison 3D suit tout du long.
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stage = document.getElementById('stage');
  if (!stage) return;
  if (reduced) { document.body.classList.add('flat'); return; }
  document.body.classList.add('scrolly');

  var scenes = Array.prototype.slice.call(stage.querySelectorAll('.scene'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.panneau'));
  var N = panels.length;

  // Chaque panneau occupe une tranche égale du parcours ; sa scène (data-scene)
  // est pleinement visible au centre de la tranche, crossfade aux frontières.
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  function layout() {
    var doc = document.documentElement;
    var p = doc.scrollHeight > doc.clientHeight ? window.scrollY / (doc.scrollHeight - doc.clientHeight) : 0;

    // Scènes : fondu + push-in continu
    scenes.forEach(function (sc, i) {
      var n = scenes.length;
      var center = n > 1 ? i / (n - 1) : 0;
      var d = Math.abs(p - center) * (n - 1);       // 0 au centre de sa plage, 1 au centre voisin
      var op = clamp(1.25 - d * 1.6, 0, 1);
      var zoom = 1.06 + (p * (n - 1) - i + 1) * 0.055; // push-in qui continue à travers la scène
      sc.style.opacity = op.toFixed(3);
      sc.style.transform = 'scale(' + clamp(zoom, 1.0, 1.3).toFixed(4) + ')';
    });

    // Panneaux : chacun monte, tient, puis sort par le haut dans sa tranche
    panels.forEach(function (pa, i) {
      var t0 = i / N, t1 = (i + 1) / N;
      var lp = clamp((p - t0) / (t1 - t0), 0, 1);
      var y, op;
      if (i === 0 && lp < 0.22) { y = 0; op = 1; } // le panneau hero est visible dès le chargement
      else if (lp < 0.22) { var e = lp / 0.22; y = (1 - e) * 46; op = e; }
      else if (lp > 0.86 && i < N - 1) { var s = (lp - 0.86) / 0.14; y = -s * 40; op = 1 - s; }
      else { y = 0; op = 1; }
      pa.style.opacity = op.toFixed(3);
      pa.style.transform = 'translateY(' + y.toFixed(1) + 'px)';
      pa.style.visibility = op <= 0.01 ? 'hidden' : 'visible';
    });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { layout(); ticking = false; });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  layout();

  // Décodage différé des scènes suivantes (la scène 1 est preload)
  window.addEventListener('load', function () {
    scenes.slice(1).forEach(function (sc) {
      var img = sc.querySelector('img[data-src]');
      if (img) { img.src = img.getAttribute('data-src'); img.removeAttribute('data-src'); }
    });
  });
})();

// Maison 3D : rotation continue + pointeur + scroll (CSS 3D pur, un seul transform par frame).
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pivot = document.getElementById('mPivot');
  if (!pivot) return;
  if (reduced) { pivot.parentElement.style.display = 'none'; return; }
  var px = 0, py = 0, tx = 0, ty = 0;
  window.addEventListener('pointermove', function (e) {
    tx = (e.clientX / window.innerWidth - 0.5) * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });
  var start = performance.now();
  (function frame(now) {
    px += (tx - px) * 0.06;
    py += (ty - py) * 0.06;
    var t = (now - start) / 1000;
    var doc = document.documentElement;
    var sf = doc.scrollHeight > doc.clientHeight ? (window.scrollY / (doc.scrollHeight - doc.clientHeight)) : 0;
    var ry = t * 24 + sf * 360 + px * 26;
    var rx = -14 + py * 12 + Math.sin(t * 0.9) * 3;
    var bob = Math.sin(t * 1.4) * 5;
    var s = 1 + Math.sin(sf * Math.PI) * -0.18;
    pivot.style.transform = 'translateY(' + bob.toFixed(1) + 'px) scale(' + s.toFixed(3) + ') rotateX(' + rx.toFixed(1) + 'deg) rotateY(' + ry.toFixed(1) + 'deg)';
    requestAnimationFrame(frame);
  })(start);
})();
