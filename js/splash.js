/* India Mind League — logo-reveal splash → tagline word-build, with logo sound */
(function () {
  'use strict';
  var splash = document.getElementById('splash');
  if (!splash) return;

  // Show the intro only once per browser session.
  var seen = false;
  try { seen = !!sessionStorage.getItem('imlIntroSeen'); } catch (e) {}
  if (seen) {
    if (splash.parentNode) splash.parentNode.removeChild(splash); // hero/onboarding start immediately
    return;
  }
  try { sessionStorage.setItem('imlIntroSeen', '1'); } catch (e) {}

  var rootEl = document.documentElement;
  rootEl.style.overflow = 'hidden'; // lock scroll during the reveal

  /* ---------- Logo sound (real audio file) ---------- */
  var audio = new Audio('sounds/logo-reveal.mp3');
  audio.preload = 'auto';
  audio.volume = 0.9;
  var played = false;

  function playSound() {
    if (played) return;
    var p = audio.play();
    if (p && typeof p.then === 'function') {
      p.then(function () { played = true; }).catch(function () { /* autoplay blocked → wait for a gesture */ });
    } else {
      played = true;
    }
  }

  // Play from the start (Amity phase); browsers block autoplay until the user
  // interacts, so also play on the first gesture of any kind.
  playSound();
  ['pointerdown', 'mousedown', 'click', 'keydown', 'touchstart', 'touchend', 'wheel'].forEach(function (ev) {
    window.addEventListener(ev, playSound, { passive: true });
  });

  // Smoothly fade the audio out instead of hard-cutting it.
  function fadeAudioOut() {
    var startVol = audio.volume || 0;
    var steps = 24, i = 0;
    var iv = setInterval(function () {
      i++;
      audio.volume = Math.max(0, startVol * (1 - i / steps));
      if (i >= steps) { clearInterval(iv); try { audio.pause(); } catch (e) {} }
    }, 55); // ~1.3s fade
  }

  /* ---------- End splash → hand off to onboarding (mobile) / hero (desktop) ---------- */
  var done = false;
  function finish() {
    if (done) return;
    done = true;
    fadeAudioOut();
    splash.classList.add('hide');
    rootEl.style.overflow = '';
    window.dispatchEvent(new Event('iml:start'));
    setTimeout(function () { if (splash.parentNode) splash.parentNode.removeChild(splash); }, 800);
  }

  // Sequence (crossfaded): Amity (0.4–3.4s) → IML logo fade (3–6.9s) → tagline build (6.6–8.9s) → hold → done.
  setTimeout(finish, 9600);
  splash.addEventListener('click', finish); // tap to skip
})();
