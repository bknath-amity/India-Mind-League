/* India Mind League — onboarding intro controller */
(function () {
  'use strict';
  var ob = document.getElementById('onboarding');
  if (!ob) return;
  // Mobile-only: the inline head script adds 'intro' only at mobile widths.
  if (!document.documentElement.classList.contains('intro')) return;

  var root = document.documentElement;
  var slides = ob.querySelectorAll('.ob-slide');
  var dots = ob.querySelectorAll('.ob-dot');
  var bar = document.getElementById('obBar');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var DUR = [2800, 3400, 4600];   // ms per slide before auto-advance
  var i = 0;
  var timer = null;

  function show(n) {
    i = n;
    slides.forEach(function (s, k) { s.classList.toggle('active', k === n); });
    dots.forEach(function (d, k) { d.classList.toggle('on', k <= n); });

    if (bar) {
      bar.style.transition = 'none';
      bar.style.width = '0%';
      void bar.offsetWidth;            // reflow so the next transition runs
      if (!reduce) {
        bar.style.transition = 'width ' + DUR[n] + 'ms linear';
        bar.style.width = '100%';
      }
    }

    clearTimeout(timer);
    if (!reduce) timer = setTimeout(next, DUR[n]);
  }

  function next() {
    if (i < slides.length - 1) show(i + 1);
    else finish();
  }

  var finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    ob.classList.add('out');
    window.setTimeout(function () {
      root.classList.remove('intro');
      ob.setAttribute('aria-hidden', 'true');
    }, 620);
  }

  // Controls
  var skip = document.getElementById('obSkip');
  var go = document.getElementById('obGo');
  var nextBtn = document.getElementById('obNext');
  if (skip) skip.addEventListener('click', finish);
  if (go) go.addEventListener('click', finish);
  if (nextBtn) nextBtn.addEventListener('click', function () { clearTimeout(timer); next(); });
  dots.forEach(function (d) {
    d.addEventListener('click', function () { clearTimeout(timer); show(parseInt(d.dataset.go, 10)); });
  });

  document.addEventListener('keydown', function (e) {
    if (!root.classList.contains('intro')) return;
    if (e.key === 'Escape') finish();
    else if (e.key === 'ArrowRight' || e.key === ' ') { clearTimeout(timer); next(); }
    else if (e.key === 'ArrowLeft' && i > 0) { clearTimeout(timer); show(i - 1); }
  });

  // Start after the logo-reveal splash finishes (or immediately if no splash).
  if (document.getElementById('splash')) {
    window.addEventListener('iml:start', function () { show(0); }, { once: true });
  } else {
    show(0);
  }
})();
