/* India Mind League — hero slider (autoplay + arrows + dots + swipe) */
(function () {
  'use strict';
  var slider = document.getElementById('heroSlider');
  if (!slider) return;
  // Desktop/laptop-only: the carousel is hidden on mobile.
  if (window.matchMedia('(max-width: 768px)').matches) return;

  var slides = slider.querySelectorAll('.hs-slide');
  var dots = slider.querySelectorAll('.hs-dot');
  var bar = slider.querySelector('.hs-progress span');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DUR = 6500;
  var i = 0;
  var timer = null;

  function restart() {
    if (bar) {
      bar.style.transition = 'none';
      bar.style.width = '0%';
      void bar.offsetWidth;
      if (!reduce) { bar.style.transition = 'width ' + DUR + 'ms linear'; bar.style.width = '100%'; }
    }
    clearTimeout(timer);
    if (!reduce && slides.length > 1) timer = setTimeout(function () { go(i + 1); }, DUR);
  }

  function go(n) {
    i = (n + slides.length) % slides.length;
    slides.forEach(function (s, k) { s.classList.toggle('active', k === i); });
    dots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
    restart();
  }

  dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); }); });

  slider.addEventListener('mouseenter', function () { clearTimeout(timer); });
  slider.addEventListener('mouseleave', function () { restart(); });

  // Touch swipe
  var x0 = null, y0 = null;
  slider.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  slider.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    var dy = e.changedTouches[0].clientY - y0;
    // horizontal swipe OR a clear vertical swipe both change slides on the hero
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) go(i + (dx < 0 ? 1 : -1));
    else if (Math.abs(dy) > 50 && window.scrollY < 10) {
      if (dy < 0 && i < slides.length - 1) go(i + 1);
      else if (dy > 0 && i > 0) go(i - 1);
    }
    x0 = y0 = null;
  });

  // Mouse-wheel: cycle slides while on the hero; release to page scroll at the ends
  function scrollPos() {
    return window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }
  var wheelLock = false;
  window.addEventListener('wheel', function (e) {
    if (document.documentElement.classList.contains('intro')) return; // intro still up
    if (scrollPos() > 10) return;                    // already scrolled into content
    var down = e.deltaY > 0;
    if (down && i === slides.length - 1) return;      // last slide + down -> let page scroll
    if (!down && i === 0) return;                     // first slide + up -> nothing
    e.preventDefault();
    if (wheelLock) return;
    wheelLock = true;
    go(i + (down ? 1 : -1));
    setTimeout(function () { wheelLock = false; }, 800);
  }, { passive: false });

  // Reveal from slide 1 after the logo-reveal splash (or immediately if none).
  if (document.getElementById('splash')) {
    window.addEventListener('iml:start', function () { go(0); }, { once: true });
  } else {
    go(0);
  }
})();
