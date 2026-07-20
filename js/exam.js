/* India Mind League — Digital Qualifier MCQ engine (demo, no backend) */
(function () {
  'use strict';

  /* require a login session (reached from the dashboard) */
  try {
    if (!JSON.parse(localStorage.getItem('iml_student') || 'null')) {
      window.location.replace('login.html'); return;
    }
  } catch (e) { window.location.replace('login.html'); return; }

  var QUESTIONS = [
    { cat: 'IQ', q: 'Which number completes the series?  2, 6, 12, 20, 30, ___', opts: ['36', '40', '42', '48'], correct: 2 },
    { cat: 'IQ', q: 'If CAT is coded as 3-1-20, what is the code for DOG?', opts: ['4-15-7', '4-14-7', '3-15-7', '4-15-8'], correct: 0 },
    { cat: 'IQ', q: 'Find the odd one out.', opts: ['Square', 'Circle', 'Triangle', 'Cube'], correct: 3 },
    { cat: 'EQ', q: 'A teammate is upset after losing a round. The best first response is to…', opts: ['Tell them to get over it', 'Acknowledge how they feel and offer support', 'Ignore them and move on', 'Point out their mistakes'], correct: 1 },
    { cat: 'EQ', q: 'You feel nervous before a big test. A healthy way to handle it is to…', opts: ['Avoid the test', 'Take slow breaths and make a plan', 'Blame other people', 'Stay up all night worrying'], correct: 1 },
    { cat: 'Values', q: 'You find a wallet that belongs to a classmate. What should you do?', opts: ['Keep it', 'Return it to them or a teacher', 'Spend the money', 'Leave it lying there'], correct: 1 },
    { cat: 'IQ', q: 'Which fraction is the largest?', opts: ['1/2', '2/5', '3/7', '4/9'], correct: 0 },
    { cat: 'Values', q: 'During a team task, the fairest way to decide is to…', opts: ['Let the loudest person choose', 'Listen to everyone and agree together', 'Always follow one leader', 'Decide in secret'], correct: 1 },
    { cat: 'EQ', q: 'A friend shares some good news with you. An empathetic response is to…', opts: ['Change the subject', 'Celebrate it with them', 'Compare it to your own news', 'Stay silent'], correct: 1 },
    { cat: 'IQ', q: 'A bat and a ball cost 110 in total. The bat costs 100 more than the ball. The ball costs…', opts: ['10', '5', '15', '0'], correct: 1 },
  ];

  var KEYS = ['A', 'B', 'C', 'D'];
  var answers = {}, visited = {};
  var current = 0, submitted = false, reviewing = false;

  var $ = function (id) { return document.getElementById(id); };
  var qCat = $('qCat'), qNum = $('qNum'), qText = $('qText'), qOpts = $('qOpts'),
      palGrid = $('palGrid'), palCounts = $('palCounts'),
      examBar = $('examBar'), palette = $('palette');
  $('qTotal').textContent = QUESTIONS.length;

  /* ---------- render a question ---------- */
  function renderQuestion() {
    var q = QUESTIONS[current];
    visited[current] = true;
    qCat.textContent = q.cat;
    qCat.className = 'q-cat ' + q.cat.toLowerCase();
    qNum.textContent = current + 1;
    qText.textContent = q.q;

    qOpts.innerHTML = '';
    q.opts.forEach(function (text, i) {
      var el = document.createElement('div');
      el.className = 'opt' + (answers[current] === i ? ' sel' : '');
      if (reviewing) {
        if (i === q.correct) el.className += ' correct';
        else if (answers[current] === i) el.className += ' wrong';
      }
      el.innerHTML = '<span class="key">' + KEYS[i] + '</span><span class="otext">' + text + '</span>';
      if (!reviewing) el.addEventListener('click', function () { select(i); });
      qOpts.appendChild(el);
    });

    $('prevBtn').disabled = current === 0;
    $('nextBtn').textContent = current === QUESTIONS.length - 1 ? 'Review →' : 'Next →';
    updateProgress();
    renderPalette();
  }

  function select(i) {
    answers[current] = i;
    [].forEach.call(qOpts.children, function (el, idx) { el.classList.toggle('sel', idx === i); });
    renderPalette(); updateProgress();
  }

  function updateProgress() {
    examBar.style.width = (Object.keys(answers).length / QUESTIONS.length * 100) + '%';
  }

  /* ---------- palette ---------- */
  function renderPalette() {
    palGrid.innerHTML = '';
    QUESTIONS.forEach(function (q, i) {
      var b = document.createElement('button');
      b.textContent = i + 1;
      if (answers[i] != null) b.classList.add('answered');
      if (i === current) b.classList.add('current');
      b.addEventListener('click', function () { goto(i); palette.classList.remove('open'); });
      palGrid.appendChild(b);
    });
    var ans = Object.keys(answers).length;
    palCounts.innerHTML = '<span>Answered <b>' + ans + '</b></span><span>Left <b>' + (QUESTIONS.length - ans) + '</b></span>';
  }

  function goto(i) { current = Math.max(0, Math.min(QUESTIONS.length - 1, i)); renderQuestion(); }

  /* ---------- nav ---------- */
  $('prevBtn').addEventListener('click', function () { goto(current - 1); });
  $('nextBtn').addEventListener('click', function () {
    if (current === QUESTIONS.length - 1) { openSubmitConfirm(); } else { goto(current + 1); }
  });
  $('palToggle').addEventListener('click', function () { palette.classList.add('open'); });
  $('palClose').addEventListener('click', function () { palette.classList.remove('open'); });
  palette.addEventListener('click', function (e) { if (e.target === palette) palette.classList.remove('open'); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && palette.classList.contains('open')) { palette.classList.remove('open'); return; }
    if (submitted) return;
    if (e.key === 'ArrowRight') goto(current + 1);
    else if (e.key === 'ArrowLeft') goto(current - 1);
    else if (['1', '2', '3', '4'].indexOf(e.key) > -1 && !reviewing) select(parseInt(e.key, 10) - 1);
    else if (['a', 'b', 'c', 'd'].indexOf(e.key.toLowerCase()) > -1 && !reviewing) select('abcd'.indexOf(e.key.toLowerCase()));
  });

  /* ---------- submit + result ---------- */
  function openSubmitConfirm() {
    var left = QUESTIONS.length - Object.keys(answers).length;
    var ok = left > 0
      ? window.confirm(left + ' question(s) still unanswered. Submit the test anyway?')
      : window.confirm('Submit your test? You cannot change answers after this.');
    if (ok) doSubmit();
  }
  $('submitBtn').addEventListener('click', openSubmitConfirm);

  function doSubmit() {
    submitted = true;
    clearInterval(timerInt);
    palette.classList.remove('open');
    var score = 0, byCat = {};
    QUESTIONS.forEach(function (q, i) {
      byCat[q.cat] = byCat[q.cat] || { c: 0, t: 0 };
      byCat[q.cat].t++;
      if (answers[i] === q.correct) { score++; byCat[q.cat].c++; }
    });
    var pct = Math.round(score / QUESTIONS.length * 100);
    $('resPct').textContent = pct + '%';
    $('resRing').style.setProperty('--p', pct);
    $('resSub').textContent = 'You scored ' + score + ' out of ' + QUESTIONS.length + '.';
    $('resTitle').textContent = pct >= 70 ? 'Brilliant work! 🎉' : pct >= 40 ? 'Good effort! 👏' : 'Keep practising! 💪';
    var rb = '';
    ['IQ', 'EQ', 'Values'].forEach(function (c) {
      if (byCat[c]) rb += '<div class="rb"><b>' + byCat[c].c + '/' + byCat[c].t + '</b><small>' + c + '</small></div>';
    });
    $('resBreak').innerHTML = rb;
    $('result').hidden = false;
  }

  $('reviewBtn').addEventListener('click', function () {
    reviewing = true;
    document.body.classList.add('reviewing');
    $('result').hidden = true;
    current = 0; renderQuestion();
  });

  $('quitBtn').addEventListener('click', function () {
    if (window.confirm('Exit the test? Your progress on this attempt will be lost.')) window.location.href = 'dashboard.html';
  });

  /* ---------- timer ---------- */
  var remaining = 15 * 60, timerInt;
  function tick() {
    var m = Math.floor(remaining / 60), s = remaining % 60;
    $('timeLeft').textContent = m + ':' + (s < 10 ? '0' : '') + s;
    $('timer').classList.toggle('warn', remaining <= 60);
    if (remaining <= 0) { clearInterval(timerInt); if (!submitted) doSubmit(); return; }
    remaining--;
  }
  timerInt = setInterval(tick, 1000); tick();

  renderQuestion();
})();
