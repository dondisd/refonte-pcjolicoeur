// PC Jolicoeur v5 — bookends + dispositions Axion : horloge locale, reveals, maison 3D.
// Horloge locale (réf. Axion « London time ») : heure de Montréal dans la nav.
(function () {
  var el = document.getElementById('heure');
  if (!el) return;
  function maj() {
    var t = new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Montreal', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
    el.textContent = 'Il est ' + t.replace(':', ' h ') + ' à Saint-Hubert';
  }
  maj();
  setInterval(maj, 30000);
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

// Reveals au scroll avec cascade. Rien de bloquant.
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = document.querySelectorAll('[data-reveal]');
  if (!reduced && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var siblings = el.parentElement ? el.parentElement.querySelectorAll('[data-reveal]') : [];
        var idx = Array.prototype.indexOf.call(siblings, el);
        el.style.transitionDelay = (idx > 0 ? Math.min(idx * 90, 450) : 0) + 'ms';
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }
})();
