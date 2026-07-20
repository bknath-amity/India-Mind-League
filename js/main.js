/* India Mind League — landing interactions */
(function () {
  'use strict';

  /* Year */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* Nav: scrolled state */
  var nav = document.getElementById('nav');
  function scrollPos() {
    return window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }
  // Nav stays hidden over the full-screen hero, slides in once you scroll into content.
  var onScroll = function () { nav.classList.toggle('show', scrollPos() > 40); };
  onScroll();
  window.addEventListener('scroll', onScroll, true);   // capture: catches document/body scroll

  /* Nav: mobile toggle */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  function setMenu(open) {
    links.classList.toggle('open', open);
    toggle.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
  }
  toggle.addEventListener('click', function () { setMenu(!links.classList.contains('open')); });
  links.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });

  /* Scroll reveal */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en, i) {
        if (en.isIntersecting) {
          var el = en.target;
          setTimeout(function () { el.classList.add('in'); }, (i % 3) * 90);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.14 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* Stat count-up */
  var counted = false;
  var stats = document.querySelectorAll('.num[data-count]');
  function runCounters() {
    if (counted) return;
    var strip = document.querySelector('.stats');
    if (!strip) return;
    var top = strip.getBoundingClientRect().top;
    if (top < window.innerHeight - 60) {
      counted = true;
      stats.forEach(function (el) {
        var target = parseInt(el.getAttribute('data-count'), 10) || 0;
        var suffix = el.textContent.indexOf('+') > -1 ? '+' : '';
        var n = 0, steps = 26, inc = Math.max(1, Math.ceil(target / steps));
        var t = setInterval(function () {
          n += inc;
          if (n >= target) { n = target; clearInterval(t); }
          el.textContent = n + suffix;
        }, 28);
      });
    }
  }
  runCounters();
  window.addEventListener('scroll', runCounters, { passive: true });

  /* Toast */
  var toastEl = document.getElementById('toast');
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }

  /* Registration */
  var form = document.getElementById('regForm');
  var formMsg = document.getElementById('formMsg');
  var success = document.getElementById('formSuccess');

  function msg(text, kind) {
    formMsg.innerHTML = text ? '<div class="alert ' + (kind || 'error') + '">' + text + '</div>' : '';
  }
  function isPhone(v) { return /^[6-9]\d{9}$/.test((v || '').trim()); }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = Object.fromEntries(new FormData(form).entries());
      if (!data.name || !data.grade) { msg('Please enter the student name and class.'); return; }
      if (!isPhone(data.phone || '')) { msg('Enter a valid 10-digit mobile number.'); return; }

      msg('');
      form.style.display = 'none';
      document.getElementById('successName').textContent =
        data.name + ', welcome to the India Mind League!';
      success.classList.add('show');
      toast('Registration complete 🎉');
    });

    var regAgain = document.getElementById('regAgain');
    if (regAgain) regAgain.addEventListener('click', function () {
      form.reset();
      success.classList.remove('show');
      form.style.display = 'block';
    });
  }

  /* Visionary message modal */
  var vModal = document.getElementById('visionaryModal');
  var vBtn = document.getElementById('visionaryBtn');
  if (vModal && vBtn) {
    var openV = function () {
      vModal.classList.add('open');
      vModal.setAttribute('aria-hidden', 'false');
      document.documentElement.style.overflow = 'hidden';
    };
    var closeV = function () {
      vModal.classList.remove('open');
      vModal.setAttribute('aria-hidden', 'true');
      document.documentElement.style.overflow = '';
    };
    vBtn.addEventListener('click', openV);
    vModal.addEventListener('click', function (e) { if (e.target.hasAttribute('data-close')) closeV(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && vModal.classList.contains('open')) closeV();
    });
  }
})();
