/* India Mind League — Student Dashboard (session‑aware) */
(function () {
  'use strict';

  // --------------------------------------------------------------
  // 1. Check session on page load
  // --------------------------------------------------------------
  fetch('session.php')
    .then(res => {
      if (!res.ok) throw new Error('Network error');
      return res.json();
    })
    .then(data => {
      if (data.status !== 'success' || !data.logged_in) {
        // Not logged in → redirect to login
        window.location.replace('login.html');
        return;
      }

      // Session is valid → populate UI with user data
      const user = data.user;
      const firstName = user.student_name.split(' ')[0] || 'Student';

      // Populate DOM elements
      setText('userName', firstName);
      setText('greetName', firstName);
      setText('udName', user.student_name);
      setText('udContact', user.email || user.mobile || '—');
      setText('meName', 'You · ' + firstName);
      // If you have avatar images, set them here
      // setAttr('userAv', 'src', user.avatar || 'default-avatar.png');
      // setAttr('udAv', 'src', user.avatar || 'default-avatar.png');

      // Footer year
      const yr = document.getElementById('year');
      if (yr) yr.textContent = new Date().getFullYear();

      // 2. Setup user dropdown (same as before)
      setupDropdown();

      // 3. Setup logout
      setupLogout();

      // 4. Exam countdown (demo)
      setupExamCountdown();
    })
    .catch(err => {
      console.error('Session check failed:', err);
      // In case of error, redirect to login for safety
      window.location.replace('login.html');
    });

  // --------------------------------------------------------------
  // Helper functions
  // --------------------------------------------------------------
  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function setAttr(id, attr, value) {
    const el = document.getElementById(id);
    if (el) el.setAttribute(attr, value);
  }

  function setupDropdown() {
    const menu = document.getElementById('userMenu');
    const btn = document.getElementById('userBtn');
    if (!menu || !btn) return;

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const open = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    document.addEventListener('click', function (e) {
      if (!menu.contains(e.target)) {
        menu.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        menu.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', function () {
      // Call logout.php to destroy session
      fetch('logout.php', { method: 'POST' })
        .then(() => {
          // Regardless of response, redirect to home
          window.location.href = 'index.html';
        })
        .catch(() => {
          // Even if fetch fails, redirect anyway
          window.location.href = 'index.html';
        });
    });
  }

  function setupExamCountdown() {
    // Demo: countdown from 3 seconds (adjust as needed)
    let remaining = 3;
    const clock = document.getElementById('examClock');
    const startBtn = document.getElementById('startBtn');
    const ecH = document.getElementById('ecH');
    const ecM = document.getElementById('ecM');
    const ecS = document.getElementById('ecS');

    if (!clock || !startBtn || !ecH || !ecM || !ecS) return;

    function pad(n) { return (n < 10 ? '0' : '') + n; }

    function render() {
      ecH.textContent = pad(Math.floor(remaining / 3600));
      ecM.textContent = pad(Math.floor((remaining % 3600) / 60));
      ecS.textContent = pad(remaining % 60);
    }

    function unlock() {
      clock.classList.add('live');
      const label = document.getElementById('ecLabel');
      if (label) label.innerHTML = '🟢 Your Qualifier is <b>live</b> — good luck!';
      const digits = document.getElementById('ecDigits');
      if (digits) digits.style.display = 'none';
      startBtn.classList.remove('locked');
      startBtn.classList.add('ready');
      startBtn.textContent = 'Start Exam Now →';
    }

    render();
    const interval = setInterval(function () {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(interval);
        remaining = 0;
        render();
        unlock();
        return;
      }
      render();
    }, 1000);
  }
})();