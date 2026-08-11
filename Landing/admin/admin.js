/* India Mind League — Admin panel
   Registrations / Schools / Question Bank are backed by PHP + MySQL
   (see admin/api/*.php). Exam Dates / Notifications / Admin Users /
   Results / Leaderboard remain local-only (not requested to be wired
   to the DB) but no longer ship with dummy seed data. */
(function () {
  'use strict';

  /* ================= local (non-DB) store ================= */
  var KEY = 'imlAdmin.v1';

  function emptyLocal() {
    return { exams: [], notifications: [], admins: [] };
  }

  var local;
  try { local = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { local = null; }
  if (!local) local = emptyLocal();
  function persistLocal() { try { localStorage.setItem(KEY, JSON.stringify(local)); } catch (e) {} }

  /* db holds everything the views read from. registrations/schools/questions
     are always populated from the server (never from localStorage). */
  var db = {
    registrations: [],
    schools: [],
    questions: [],
    exams: local.exams,
    notifications: local.notifications,
    admins: local.admins,
    results: [],
  };

  /* ================= helpers ================= */
  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function uid(p) { return p + Math.random().toString(36).slice(2, 7).toUpperCase(); }
  function today() { var d = new Date(); return d.toISOString().slice(0, 10); }
  function score(r) { var s = 0; r.answers.forEach(function (an) { var q = db.questions.find(function (x) { return x.id === an.q; }); if (q && q.correct === an.a) s++; }); return s; }
  function byId(arr, id) { return arr.find(function (x) { return x.id === id; }); }

  /* ---------- API helpers ---------- */
  function apiGet(url) {
    return fetch(url, { headers: { 'Accept': 'application/json' } })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data || !data.ok) throw new Error((data && data.message) || 'Request failed.');
        return data;
      });
  }
  function apiPost(url, params) {
    var body = new URLSearchParams();
    Object.keys(params).forEach(function (k) { body.append(k, params[k] == null ? '' : params[k]); });
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
      body: body.toString()
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data || !data.ok) throw new Error((data && data.message) || 'Request failed.');
        return data;
      });
  }

  function loadRegistrations(sort) {
    var url = 'api/registrations.php?sort=' + encodeURIComponent(sort.col) + '&dir=' + encodeURIComponent(sort.dir);
    return apiGet(url).then(function (d) { db.registrations = d.rows; });
  }
  function loadSchools(sort) {
    var url = 'api/schools.php?sort=' + encodeURIComponent(sort.col) + '&dir=' + encodeURIComponent(sort.dir);
    return apiGet(url).then(function (d) { db.schools = d.rows; });
  }
  function loadQuestions(sort) {
    var url = 'api/questions.php?sort=' + encodeURIComponent(sort.col) + '&dir=' + encodeURIComponent(sort.dir);
    return apiGet(url).then(function (d) { db.questions = d.rows; });
  }

  /* Sortable column header: click toggles asc/desc and refetches from the
     server (the actual ORDER BY lives in the PHP endpoints). Only adds a
     click handler + a tiny arrow to the existing header text — no new
     styling. */
  function sortTh(label, key, state) {
    var arrow = state.col === key ? (state.dir === 'asc' ? ' ▲' : ' ▼') : '';
    return '<th data-sort-key="' + key + '" style="cursor:pointer">' + esc(label) + arrow + '</th>';
  }
  function bindSortHeaders(state, onChange) {
    content.querySelectorAll('th[data-sort-key]').forEach(function (th) {
      th.addEventListener('click', function () {
        var key = th.getAttribute('data-sort-key');
        if (state.col === key) { state.dir = state.dir === 'asc' ? 'desc' : 'asc'; }
        else { state.col = key; state.dir = 'asc'; }
        onChange();
      });
    });
  }

  var toastTimer;
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2400);
  }

  /* ---------- modal ---------- */
  var modalRoot = $('#modalRoot');
  function modal(title, bodyHtml, footHtml, wide) {
    modalRoot.innerHTML =
      '<div class="modal' + (wide ? ' wide' : '') + '" role="dialog" aria-modal="true">' +
      '<div class="m-head"><h3>' + esc(title) + '</h3><button class="m-x" data-close>✕</button></div>' +
      '<div class="m-body">' + bodyHtml + '</div>' +
      (footHtml ? '<div class="m-foot">' + footHtml + '</div>' : '') +
      '</div>';
    modalRoot.hidden = false;
    return modalRoot;
  }
  function closeModal() { modalRoot.hidden = true; modalRoot.innerHTML = ''; }
  modalRoot.addEventListener('click', function (e) { if (e.target === modalRoot || e.target.hasAttribute('data-close')) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modalRoot.hidden) closeModal(); });

  function confirmDlg(text, onYes) {
    modal('Please confirm', '<p style="color:var(--muted)">' + esc(text) + '</p>',
      '<button class="btn" data-close>Cancel</button><button class="btn btn-danger" id="cfYes">Delete</button>');
    $('#cfYes').addEventListener('click', function () { closeModal(); onYes(); });
  }

  function field(label, inner) { return '<div class="f"><label>' + label + '</label>' + inner + '</div>'; }
  function inp(id, val, ph, type) { return '<input id="' + id + '" type="' + (type || 'text') + '" value="' + esc(val || '') + '" placeholder="' + (ph || '') + '" />'; }
  function sel(id, options, val) {
    return '<select id="' + id + '">' + options.map(function (o) {
      return '<option value="' + esc(o) + '"' + (o === val ? ' selected' : '') + '>' + esc(o) + '</option>';
    }).join('') + '</select>';
  }

  /* ================= views ================= */
  var content = $('#content');

  /* ---------- dashboard ---------- */
  function vDashboard() {
    var up = db.exams.filter(function (e) { return e.status !== 'Completed'; }).length;
    content.innerHTML =
      '<div class="grid g4">' +
      '<div class="card stat"><b>' + db.registrations.length + '</b><small>Registrations</small></div>' +
      '<div class="card stat"><b>' + db.schools.length + '</b><small>Schools</small></div>' +
      '<div class="card stat"><b>' + db.questions.length + '</b><small>Questions</small></div>' +
      '<div class="card stat"><b>' + up + '</b><small>Upcoming exams</small></div>' +
      '</div>' +
      '<div class="grid g2" style="margin-top:1rem">' +
      '<div class="card"><h3>Recent registrations</h3><div class="tbl-wrap" style="border:0"><table style="min-width:0">' +
      '<thead><tr><th>Student</th><th>Grade</th><th>Status</th></tr></thead><tbody>' +
      (db.registrations.length
        ? db.registrations.slice(0, 5).map(function (r) {
            return '<tr><td class="b">' + esc(r.name) + '</td><td>' + esc(r.grade) + '</td><td>' + statusBadge(r.status) + '</td></tr>';
          }).join('')
        : '<tr><td colspan="3" class="empty">No registrations yet.</td></tr>') +
      '</tbody></table></div></div>' +
      '<div class="card"><h3>Upcoming exams</h3>' +
      (db.exams.length
        ? db.exams.map(function (e) {
            return '<div style="display:flex;justify-content:space-between;gap:.6rem;padding:.5rem 0;border-bottom:1px solid var(--line)">' +
              '<span class="b" style="font-weight:700">' + esc(e.title) + '<small>Grade ' + esc(e.grade) + ' · ' + esc(e.date) + ' ' + esc(e.time) + '</small></span>' +
              examBadge(e.status) + '</div>';
          }).join('')
        : '<p style="color:var(--faint)">No exams scheduled yet.</p>') +
      '</div></div>';
  }
  function statusBadge(s) {
    var c = s === 'Qualified' ? 'green' : s === 'Test Taken' ? 'blue' : 'grey';
    return '<span class="bdg ' + c + '">' + esc(s) + '</span>';
  }
  function examBadge(s) {
    var c = s === 'Live' ? 'green' : s === 'Completed' ? 'grey' : 'gold';
    return '<span class="bdg ' + c + '" style="align-self:center">' + esc(s) + '</span>';
  }

  /* ---------- registrations (DB-backed) ---------- */
  var regQ = '';
  var regSort = { col: 'id', dir: 'desc' };
  function vRegistrations() {
    loadRegistrations(regSort)
      .then(renderRegistrations)
      .catch(function (e) { toast(e.message || 'Failed to load registrations'); renderRegistrations(); });
  }
  function renderRegistrations() {
    var rows = db.registrations.filter(function (r) {
      var t = (r.name + ' ' + r.school + ' ' + r.phone + ' ' + r.grade).toLowerCase();
      return t.indexOf(regQ.toLowerCase()) > -1;
    });
    content.innerHTML =
      '<div class="bar"><input class="search" id="regSearch" placeholder="Search name, school, phone…" value="' + esc(regQ) + '" />' +
      '<span class="grow"></span><button class="btn btn-gold" id="regAdd">＋ Add Registration</button></div>' +
      '<div class="tbl-wrap"><table><thead><tr>' +
      sortTh('ID', 'id', regSort) + sortTh('Student', 'name', regSort) + sortTh('Grade', 'grade', regSort) +
      sortTh('School', 'school', regSort) + sortTh('Mobile', 'phone', regSort) + sortTh('Status', 'status', regSort) +
      '<th style="text-align:right">Actions</th></tr></thead><tbody>' +
      (rows.length ? rows.map(function (r) {
        return '<tr><td>' + esc(r.id) + '</td><td class="b">' + esc(r.name) + '<small>' + esc(r.email || '') + '</small></td><td>' + esc(r.grade) + '</td>' +
          '<td>' + esc(r.school) + '</td><td>' + esc(r.phone) + '</td><td>' + statusBadge(r.status) + '</td>' +
          '<td><div class="acts">' +
          '<button class="btn btn-sm" data-view-reg="' + r.id + '">View</button>' +
          '<button class="btn btn-sm" data-edit-reg="' + r.id + '">Edit</button>' +
          '<button class="btn btn-sm btn-danger" data-del-reg="' + r.id + '">Delete</button></div></td></tr>';
      }).join('') : '<tr><td colspan="7" class="empty">No registrations found.</td></tr>') +
      '</tbody></table></div>';

    $('#regSearch').addEventListener('input', function () { regQ = this.value; renderRegistrations(); $('#regSearch').focus(); $('#regSearch').setSelectionRange(regQ.length, regQ.length); });
    $('#regAdd').addEventListener('click', function () { regForm(null); });
    bindSortHeaders(regSort, vRegistrations);
    content.querySelectorAll('[data-view-reg]').forEach(function (b) { b.addEventListener('click', function () { regView(b.getAttribute('data-view-reg')); }); });
    content.querySelectorAll('[data-edit-reg]').forEach(function (b) { b.addEventListener('click', function () { regForm(b.getAttribute('data-edit-reg')); }); });
    content.querySelectorAll('[data-del-reg]').forEach(function (b) {
      b.addEventListener('click', function () {
        var r = byId(db.registrations, b.getAttribute('data-del-reg'));
        confirmDlg('Delete registration of "' + r.name + '"? This cannot be undone.', function () {
          apiPost('api/registrations.php', { action: 'delete', id: r._id })
            .then(function () { toast('Registration deleted'); vRegistrations(); })
            .catch(function (e) { toast(e.message || 'Delete failed'); });
        });
      });
    });
  }

  function regView(id) {
    var r = byId(db.registrations, id);
    modal('Registration ' + r.id,
      '<dl class="dl"><dt>Student</dt><dd>' + esc(r.name) + '</dd><dt>Class / Grade</dt><dd>' + esc(r.grade) + '</dd>' +
      '<dt>School</dt><dd>' + esc(r.school) + '</dd><dt>Parent</dt><dd>' + esc(r.parent || '—') + '</dd>' +
      '<dt>Mobile</dt><dd>' + esc(r.phone) + '</dd><dt>Email</dt><dd>' + esc(r.email || '—') + '</dd>' +
      '<dt>Registered on</dt><dd>' + esc(r.date) + '</dd><dt>Status</dt><dd>' + statusBadge(r.status) + '</dd></dl>',
      '<button class="btn" data-close>Close</button><button class="btn btn-gold" id="rvEdit">Edit</button>');
    $('#rvEdit').addEventListener('click', function () { regForm(id); });
  }

  function regForm(id) {
    var r = id ? byId(db.registrations, id) : { name: '', grade: '9', school: '', parent: '', phone: '', email: '', status: 'Registered' };
    var schools = db.schools.map(function (s) { return s.name; });
    modal(id ? 'Edit Registration' : 'Add Registration',
      '<div class="f-row">' + field('Student Name *', inp('fName', r.name, 'Full name')) + field('Class / Grade *', sel('fGrade', ['9', '10', '11', '12'], r.grade)) + '</div>' +
      field('School', sel('fSchool', [''].concat(schools), r.school)) +
      '<div class="f-row">' + field('Parent Name', inp('fParent', r.parent)) + field('Mobile *', inp('fPhone', r.phone, '10-digit mobile')) + '</div>' +
      '<div class="f-row">' + field('Email', inp('fEmail', r.email, 'name@example.com', 'email')) + field('Status', sel('fStatus', ['Registered', 'Test Taken', 'Qualified'], r.status)) + '</div>',
      '<button class="btn" data-close>Cancel</button><button class="btn btn-gold" id="fSave">' + (id ? 'Save changes' : 'Add registration') + '</button>');
    $('#fSave').addEventListener('click', function () {
      var name = $('#fName').value.trim(), phone = $('#fPhone').value.trim();
      if (!name) return toast('Student name is required');
      if (!/^[6-9]\d{9}$/.test(phone)) return toast('Enter a valid 10-digit mobile');
      var payload = {
        action: id ? 'update' : 'create',
        name: name, grade: $('#fGrade').value, school: $('#fSchool').value,
        parent: $('#fParent').value.trim(), phone: phone,
        email: $('#fEmail').value.trim(), status: $('#fStatus').value
      };
      if (id) payload.id = r._id;
      apiPost('api/registrations.php', payload)
        .then(function () { toast(id ? 'Registration updated' : 'Registration added'); closeModal(); vRegistrations(); })
        .catch(function (e) { toast(e.message || 'Save failed'); });
    });
  }

  /* ---------- schools (DB-backed) ---------- */
  var schSort = { col: 'id', dir: 'asc' };
  function vSchools() {
    loadSchools(schSort)
      .then(renderSchools)
      .catch(function (e) { toast(e.message || 'Failed to load schools'); renderSchools(); });
  }
  function renderSchools() {
    content.innerHTML =
      '<div class="bar"><span class="grow"></span><button class="btn btn-gold" id="schAdd">＋ Add School</button></div>' +
      '<div class="tbl-wrap"><table><thead><tr>' +
      sortTh('ID', 'id', schSort) + sortTh('School', 'name', schSort) + sortTh('City', 'city', schSort) +
      sortTh('Coordinator', 'coordinator', schSort) + sortTh('Contact', 'contact', schSort) + sortTh('Students', 'students', schSort) +
      '<th style="text-align:right">Actions</th></tr></thead><tbody>' +
      (db.schools.length ? db.schools.map(function (s) {
        return '<tr><td>' + esc(s.id) + '</td><td class="b">' + esc(s.name) + '</td><td>' + esc(s.city) + '</td><td>' + esc(s.coordinator) + '</td>' +
          '<td>' + esc(s.contact) + '</td><td>' + esc(s.students) + '</td>' +
          '<td><div class="acts"><button class="btn btn-sm" data-v="' + s.id + '">View</button><button class="btn btn-sm" data-e="' + s.id + '">Edit</button>' +
          '<button class="btn btn-sm btn-danger" data-d="' + s.id + '">Delete</button></div></td></tr>';
      }).join('') : '<tr><td colspan="7" class="empty">No schools added yet.</td></tr>') +
      '</tbody></table></div>';

    $('#schAdd').addEventListener('click', function () { schForm(null); });
    bindSortHeaders(schSort, vSchools);
    content.querySelectorAll('[data-v]').forEach(function (b) {
      b.addEventListener('click', function () {
        var s = byId(db.schools, b.getAttribute('data-v'));
        modal(s.name, '<dl class="dl"><dt>City</dt><dd>' + esc(s.city) + '</dd><dt>Coordinator</dt><dd>' + esc(s.coordinator) + '</dd>' +
          '<dt>Contact</dt><dd>' + esc(s.contact) + '</dd><dt>Registered students</dt><dd>' + esc(s.students) + '</dd></dl>',
          '<button class="btn" data-close>Close</button>');
      });
    });
    content.querySelectorAll('[data-e]').forEach(function (b) { b.addEventListener('click', function () { schForm(b.getAttribute('data-e')); }); });
    content.querySelectorAll('[data-d]').forEach(function (b) {
      b.addEventListener('click', function () {
        var s = byId(db.schools, b.getAttribute('data-d'));
        confirmDlg('Delete "' + s.name + '"?', function () {
          apiPost('api/schools.php', { action: 'delete', id: s._id })
            .then(function () { toast('School deleted'); vSchools(); })
            .catch(function (e) { toast(e.message || 'Delete failed'); });
        });
      });
    });
  }
  function schForm(id) {
    var s = id ? byId(db.schools, id) : { name: '', city: '', coordinator: '', contact: '', students: 0 };
    modal(id ? 'Edit School' : 'Add School',
      field('School Name *', inp('fSName', s.name)) +
      '<div class="f-row">' + field('City', inp('fSCity', s.city)) + field('Coordinator', inp('fSCoord', s.coordinator)) + '</div>' +
      '<div class="f-row">' + field('Contact', inp('fSContact', s.contact)) + field('Registered Students', inp('fSCount', s.students, '', 'number')) + '</div>',
      '<button class="btn" data-close>Cancel</button><button class="btn btn-gold" id="fSave">' + (id ? 'Save changes' : 'Add school') + '</button>');
    $('#fSave').addEventListener('click', function () {
      var name = $('#fSName').value.trim();
      if (!name) return toast('School name is required');
      var payload = {
        action: id ? 'update' : 'create',
        name: name, city: $('#fSCity').value.trim(), coordinator: $('#fSCoord').value.trim(),
        contact: $('#fSContact').value.trim(), students: parseInt($('#fSCount').value, 10) || 0
      };
      if (id) payload.id = s._id;
      apiPost('api/schools.php', payload)
        .then(function () { toast(id ? 'School updated' : 'School added'); closeModal(); vSchools(); })
        .catch(function (e) { toast(e.message || 'Save failed'); });
    });
  }

  /* ---------- question bank (DB-backed) ---------- */
  var qGrade = 'All', qCat = 'All';
  var qSort = { col: 'id', dir: 'asc' };
  function vQuestions() {
    loadQuestions(qSort)
      .then(renderQuestions)
      .catch(function (e) { toast(e.message || 'Failed to load questions'); renderQuestions(); });
  }
  function renderQuestions() {
    var rows = db.questions.filter(function (q) {
      return (qGrade === 'All' || q.grade === qGrade) && (qCat === 'All' || q.cat === qCat);
    });
    content.innerHTML =
      '<div class="bar">' + sel('qfGrade', ['All', '9', '10', '11', '12'], qGrade).replace('<select', '<select class="filter"') +
      sel('qfCat', ['All', 'IQ', 'EQ', 'Values'], qCat).replace('<select', '<select class="filter"') +
      '<span class="grow"></span><button class="btn btn-gold" id="qAdd">＋ MCQ Builder</button></div>' +
      '<div class="tbl-wrap"><table><thead><tr>' +
      sortTh('ID', 'id', qSort) + sortTh('Question', 'q', qSort) + sortTh('Grade', 'grade', qSort) +
      sortTh('Category', 'cat', qSort) + sortTh('Correct', 'correct', qSort) +
      '<th style="text-align:right">Actions</th></tr></thead><tbody>' +
      (rows.length ? rows.map(function (q) {
        return '<tr><td>' + esc(q.id) + '</td><td class="b" style="max-width:380px">' + esc(q.q) + '</td><td>' + esc(q.grade) + '</td>' +
          '<td><span class="bdg ' + (q.cat === 'IQ' ? 'blue' : q.cat === 'EQ' ? 'pink' : 'purple') + '">' + esc(q.cat) + '</span></td>' +
          '<td>' + 'ABCD'[q.correct] + '. ' + esc(q.opts[q.correct]) + '</td>' +
          '<td><div class="acts"><button class="btn btn-sm" data-e="' + q.id + '">Edit</button><button class="btn btn-sm btn-danger" data-d="' + q.id + '">Delete</button></div></td></tr>';
      }).join('') : '<tr><td colspan="6" class="empty">No questions for this filter.</td></tr>') +
      '</tbody></table></div>';

    $('#qfGrade').addEventListener('change', function () { qGrade = this.value; renderQuestions(); });
    $('#qfCat').addEventListener('change', function () { qCat = this.value; renderQuestions(); });
    $('#qAdd').addEventListener('click', function () { qForm(null); });
    bindSortHeaders(qSort, vQuestions);
    content.querySelectorAll('[data-e]').forEach(function (b) { b.addEventListener('click', function () { qForm(b.getAttribute('data-e')); }); });
    content.querySelectorAll('[data-d]').forEach(function (b) {
      b.addEventListener('click', function () {
        var q = byId(db.questions, b.getAttribute('data-d'));
        confirmDlg('Delete this question? "' + q.q.slice(0, 60) + '…"', function () {
          apiPost('api/questions.php', { action: 'delete', id: q._id })
            .then(function () { toast('Question deleted'); vQuestions(); })
            .catch(function (e) { toast(e.message || 'Delete failed'); });
        });
      });
    });
  }
  function qForm(id) {
    var q = id ? byId(db.questions, id) : { grade: '9', cat: 'IQ', q: '', opts: ['', '', '', ''], correct: 0 };
    modal(id ? 'Edit Question' : 'MCQ Builder',
      '<div class="f-row">' + field('Grade', sel('fQGrade', ['9', '10', '11', '12'], q.grade)) + field('Category', sel('fQCat', ['IQ', 'EQ', 'Values'], q.cat)) + '</div>' +
      field('Question *', '<textarea id="fQText">' + esc(q.q) + '</textarea>') +
      field('Options — pick the correct answer', q.opts.map(function (o, i) {
        return '<div class="opt-row"><input type="radio" name="fQCorrect" value="' + i + '"' + (q.correct === i ? ' checked' : '') + ' />' +
          '<span class="key">' + 'ABCD'[i] + '</span><input id="fQOpt' + i + '" value="' + esc(o) + '" placeholder="Option ' + 'ABCD'[i] + '" /></div>';
      }).join('')),
      '<button class="btn" data-close>Cancel</button><button class="btn btn-gold" id="fSave">' + (id ? 'Save question' : 'Add to bank') + '</button>', true);
    $('#fSave').addEventListener('click', function () {
      var text = $('#fQText').value.trim();
      var opts = [0, 1, 2, 3].map(function (i) { return $('#fQOpt' + i).value.trim(); });
      if (!text) return toast('Question text is required');
      if (opts.some(function (o) { return !o; })) return toast('All four options are required');
      var correct = parseInt(($('input[name=fQCorrect]:checked') || {}).value, 10);
      if (isNaN(correct)) return toast('Select the correct answer');
      var payload = {
        action: id ? 'update' : 'create',
        grade: $('#fQGrade').value, cat: $('#fQCat').value, q: text,
        optA: opts[0], optB: opts[1], optC: opts[2], optD: opts[3], correct: correct
      };
      if (id) payload.id = q._id;
      apiPost('api/questions.php', payload)
        .then(function () { toast(id ? 'Question updated' : 'Question added'); closeModal(); vQuestions(); })
        .catch(function (e) { toast(e.message || 'Save failed'); });
    });
  }

  /* ---------- exam dates (local only) ---------- */
  function vExams() {
    content.innerHTML =
      '<div class="bar"><span class="grow"></span><button class="btn btn-gold" id="exAdd">＋ Schedule Exam</button></div>' +
      '<div class="tbl-wrap"><table><thead><tr><th>Title</th><th>Grade</th><th>Date</th><th>Time</th><th>Duration</th><th>Status</th><th style="text-align:right">Actions</th></tr></thead><tbody>' +
      (db.exams.length ? db.exams.map(function (e) {
        return '<tr><td class="b">' + esc(e.title) + '</td><td>' + esc(e.grade) + '</td><td>' + esc(e.date) + '</td><td>' + esc(e.time) + '</td>' +
          '<td>' + esc(e.duration) + ' min</td><td>' + examBadge(e.status) + '</td>' +
          '<td><div class="acts"><button class="btn btn-sm" data-e="' + e.id + '">Edit</button><button class="btn btn-sm btn-danger" data-d="' + e.id + '">Delete</button></div></td></tr>';
      }).join('') : '<tr><td colspan="7" class="empty">No exams scheduled yet.</td></tr>') +
      '</tbody></table></div>';

    $('#exAdd').addEventListener('click', function () { exForm(null); });
    content.querySelectorAll('[data-e]').forEach(function (b) { b.addEventListener('click', function () { exForm(b.getAttribute('data-e')); }); });
    content.querySelectorAll('[data-d]').forEach(function (b) {
      b.addEventListener('click', function () {
        var e = byId(db.exams, b.getAttribute('data-d'));
        confirmDlg('Delete "' + e.title + '"?', function () {
          db.exams = db.exams.filter(function (x) { return x.id !== e.id; }); local.exams = db.exams; persistLocal(); toast('Exam deleted'); vExams();
        });
      });
    });
  }
  function exForm(id) {
    var e = id ? byId(db.exams, id) : { title: '', grade: 'All', date: '', time: '10:00', duration: 15, status: 'Scheduled' };
    modal(id ? 'Edit Exam' : 'Schedule Exam',
      field('Title *', inp('fETitle', e.title, 'e.g. Digital Qualifier — Window 1')) +
      '<div class="f-row">' + field('Grade', sel('fEGrade', ['All', '9', '10', '11', '12', '9-10', '11-12'], e.grade)) + field('Status', sel('fEStatus', ['Scheduled', 'Live', 'Completed'], e.status)) + '</div>' +
      '<div class="f-row">' + field('Date *', inp('fEDate', e.date, '', 'date')) + field('Time', inp('fETime', e.time, '', 'time')) + '</div>' +
      field('Duration (minutes)', inp('fEDur', e.duration, '', 'number')),
      '<button class="btn" data-close>Cancel</button><button class="btn btn-gold" id="fSave">' + (id ? 'Save changes' : 'Schedule') + '</button>');
    $('#fSave').addEventListener('click', function () {
      var title = $('#fETitle').value.trim(), date = $('#fEDate').value;
      if (!title) return toast('Title is required');
      if (!date) return toast('Pick a date');
      var data = { title: title, grade: $('#fEGrade').value, date: date, time: $('#fETime').value, duration: parseInt($('#fEDur').value, 10) || 15, status: $('#fEStatus').value };
      if (id) { Object.assign(byId(db.exams, id), data); toast('Exam updated'); }
      else { data.id = uid('E'); db.exams.push(data); toast('Exam scheduled'); }
      local.exams = db.exams; persistLocal(); closeModal(); vExams();
    });
  }

  /* ---------- notifications (local only) ---------- */
  var ntTab = 'history';
  function vNotifications() {
    content.innerHTML =
      '<div class="tabs"><button class="tab' + (ntTab === 'history' ? ' on' : '') + '" data-t="history">History</button>' +
      '<button class="tab' + (ntTab === 'send' ? ' on' : '') + '" data-t="send">Send New</button></div>' +
      (ntTab === 'history' ? ntHistory() : ntSend());
    content.querySelectorAll('.tab').forEach(function (b) { b.addEventListener('click', function () { ntTab = b.getAttribute('data-t'); vNotifications(); }); });
    if (ntTab === 'send') ntBindSend();
  }
  function ntHistory() {
    return '<div class="tbl-wrap"><table><thead><tr><th>Date</th><th>Channel</th><th>Audience</th><th>Subject / Message</th><th>Status</th></tr></thead><tbody>' +
      (db.notifications.length ? db.notifications.map(function (n) {
        return '<tr><td>' + esc(n.date) + '</td><td><span class="bdg ' + (n.type === 'EMAIL' ? 'blue' : 'purple') + '">' + esc(n.type) + '</span></td>' +
          '<td>' + esc(n.audience) + '</td><td class="b" style="max-width:420px">' + esc(n.subject || n.message.slice(0, 70)) + '<small>' + esc(n.message.slice(0, 90)) + (n.message.length > 90 ? '…' : '') + '</small></td>' +
          '<td><span class="bdg green">' + esc(n.status) + '</span></td></tr>';
      }).join('') : '<tr><td colspan="5" class="empty">No notifications sent yet.</td></tr>') + '</tbody></table></div>';
  }
  function ntSend() {
    return '<div class="card" style="max-width:640px">' +
      '<div class="f-row">' + field('Channel', sel('fNType', ['EMAIL', 'SMS'], 'EMAIL')) +
      field('Audience', sel('fNAud', ['All Registered', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Qualified only', 'Schools'], 'All Registered')) + '</div>' +
      '<div id="fNSubWrap">' + field('Subject (email)', inp('fNSub', '', 'Subject line')) + '</div>' +
      field('Message *', '<textarea id="fNMsg" placeholder="Type the message…"></textarea>') +
      '<button class="btn btn-gold" id="fNSend">Send Notification →</button></div>';
  }
  function ntBindSend() {
    $('#fNType').addEventListener('change', function () { $('#fNSubWrap').style.display = this.value === 'EMAIL' ? '' : 'none'; });
    $('#fNSend').addEventListener('click', function () {
      var msg = $('#fNMsg').value.trim();
      if (!msg) return toast('Message is required');
      db.notifications.unshift({ id: uid('N'), type: $('#fNType').value, audience: $('#fNAud').value, subject: $('#fNType').value === 'EMAIL' ? $('#fNSub').value.trim() : '', message: msg, date: today(), status: 'Sent' });
      local.notifications = db.notifications; persistLocal(); toast('Notification sent (demo)'); ntTab = 'history'; vNotifications();
    });
  }

  /* ---------- admin users (local only) ---------- */
  function vAdmins() {
    content.innerHTML =
      '<div class="bar"><span class="grow"></span><button class="btn btn-gold" id="adAdd">＋ Add Admin</button></div>' +
      '<div class="tbl-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th style="text-align:right">Actions</th></tr></thead><tbody>' +
      (db.admins.length ? db.admins.map(function (a) {
        return '<tr><td class="b">' + esc(a.name) + '</td><td>' + esc(a.email) + '</td>' +
          '<td><span class="bdg ' + (a.role === 'Super Admin' ? 'gold' : a.role === 'Editor' ? 'blue' : 'grey') + '">' + esc(a.role) + '</span></td>' +
          '<td><span class="bdg ' + (a.status === 'Active' ? 'green' : 'red') + '">' + esc(a.status) + '</span></td>' +
          '<td><div class="acts"><button class="btn btn-sm" data-e="' + a.id + '">Edit</button><button class="btn btn-sm btn-danger" data-d="' + a.id + '">Delete</button></div></td></tr>';
      }).join('') : '<tr><td colspan="5" class="empty">No admins added yet.</td></tr>') + '</tbody></table></div>';

    $('#adAdd').addEventListener('click', function () { adForm(null); });
    content.querySelectorAll('[data-e]').forEach(function (b) { b.addEventListener('click', function () { adForm(b.getAttribute('data-e')); }); });
    content.querySelectorAll('[data-d]').forEach(function (b) {
      b.addEventListener('click', function () {
        var a = byId(db.admins, b.getAttribute('data-d'));
        confirmDlg('Remove admin "' + a.name + '"?', function () {
          db.admins = db.admins.filter(function (x) { return x.id !== a.id; }); local.admins = db.admins; persistLocal(); toast('Admin removed'); vAdmins();
        });
      });
    });
  }
  function adForm(id) {
    var a = id ? byId(db.admins, id) : { name: '', email: '', role: 'Editor', status: 'Active' };
    modal(id ? 'Edit Admin' : 'Add Admin',
      field('Name *', inp('fAName', a.name)) + field('Email *', inp('fAEmail', a.email, 'name@amity.edu', 'email')) +
      '<div class="f-row">' + field('Role', sel('fARole', ['Super Admin', 'Editor', 'Viewer'], a.role)) + field('Status', sel('fAStatus', ['Active', 'Disabled'], a.status)) + '</div>',
      '<button class="btn" data-close>Cancel</button><button class="btn btn-gold" id="fSave">' + (id ? 'Save changes' : 'Add admin') + '</button>');
    $('#fSave').addEventListener('click', function () {
      var name = $('#fAName').value.trim(), email = $('#fAEmail').value.trim();
      if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast('Valid name and email are required');
      var data = { name: name, email: email, role: $('#fARole').value, status: $('#fAStatus').value };
      if (id) { Object.assign(byId(db.admins, id), data); toast('Admin updated'); }
      else { data.id = uid('A'); db.admins.push(data); toast('Admin added'); }
      local.admins = db.admins; persistLocal(); closeModal(); vAdmins();
    });
  }

  /* ---------- leaderboard ---------- */
  function vLeaderboard() {
    var rows = db.results.map(function (r) { return { name: r.student, school: r.school, grade: r.grade, score: score(r), total: r.answers.length }; })
      .sort(function (a, b) { return b.score - a.score || a.name.localeCompare(b.name); });
    content.innerHTML =
      '<div class="tbl-wrap"><table><thead><tr><th>Rank</th><th>Student</th><th>Grade</th><th>School</th><th>Score</th></tr></thead><tbody>' +
      (rows.length ? rows.map(function (r, i) {
        return '<tr' + (i === 0 ? ' class="top1"' : '') + '><td class="b">' + (i === 0 ? '👑 ' : '') + '#' + (i + 1) + '</td><td class="b">' + esc(r.name) + '</td>' +
          '<td>' + esc(r.grade) + '</td><td>' + esc(r.school) + '</td><td class="b" style="color:var(--gold-2)">' + r.score + ' / ' + r.total + '</td></tr>';
      }).join('') : '<tr><td colspan="5" class="empty">No completed attempts yet.</td></tr>') + '</tbody></table></div>';
  }

  /* ---------- results ---------- */
  function vResults() {
    content.innerHTML =
      '<div class="tbl-wrap"><table><thead><tr><th>Attempt</th><th>Student</th><th>Grade</th><th>Date</th><th>Time</th><th>Score</th><th style="text-align:right">Actions</th></tr></thead><tbody>' +
      (db.results.length ? db.results.map(function (r) {
        var s = score(r);
        return '<tr><td>' + esc(r.id) + '</td><td class="b">' + esc(r.student) + '<small>' + esc(r.school) + '</small></td><td>' + esc(r.grade) + '</td>' +
          '<td>' + esc(r.date) + '</td><td>' + esc(r.time) + '</td>' +
          '<td><span class="bdg ' + (s >= r.answers.length * 0.6 ? 'green' : s >= r.answers.length * 0.4 ? 'gold' : 'red') + '">' + s + ' / ' + r.answers.length + '</span></td>' +
          '<td><div class="acts"><button class="btn btn-sm" data-v="' + r.id + '">View responses</button></div></td></tr>';
      }).join('') : '<tr><td colspan="7" class="empty">No attempts recorded yet.</td></tr>') + '</tbody></table></div>';

    content.querySelectorAll('[data-v]').forEach(function (b) {
      b.addEventListener('click', function () {
        var r = byId(db.results, b.getAttribute('data-v'));
        modal('Responses — ' + r.student + ' (' + score(r) + '/' + r.answers.length + ')',
          r.answers.map(function (an, i) {
            var q = byId(db.questions, an.q);
            if (!q) return '';
            var right = q.correct === an.a;
            return '<div class="resp"><div class="q">' + (i + 1) + '. ' + esc(q.q) + '</div>' +
              '<div class="a">Answered: <span class="' + (right ? 'ok' : 'bad') + '">' + 'ABCD'[an.a] + '. ' + esc(q.opts[an.a]) + (right ? ' ✓' : ' ✕') + '</span>' +
              (right ? '' : ' &nbsp;·&nbsp; Correct: <span class="ok">' + 'ABCD'[q.correct] + '. ' + esc(q.opts[q.correct]) + '</span>') + '</div></div>';
          }).join(''),
          '<button class="btn" data-close>Close</button>', true);
      });
    });
  }

  /* ================= router ================= */
  var views = {
    dashboard: { title: 'Dashboard', render: vDashboard },
    registrations: { title: 'Registrations', render: vRegistrations },
    schools: { title: 'Schools', render: vSchools },
    questions: { title: 'Question Bank', render: vQuestions },
    exams: { title: 'Exam Date Management', render: vExams },
    notifications: { title: 'Notification Management', render: vNotifications },
    admins: { title: 'Admin Users', render: vAdmins },
    leaderboard: { title: 'Leaderboard', render: vLeaderboard },
    results: { title: 'Results', render: vResults },
  };
  function route() {
    var v = (location.hash.replace('#/', '') || 'dashboard').split('?')[0];
    if (!views[v]) v = 'dashboard';
    document.querySelectorAll('.sb-nav a').forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-view') === v); });
    $('#tbTitle').textContent = views[v].title;
    closeModal();
    views[v].render();
    sbClose();
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);

  /* mobile sidebar */
  var sb = $('#sidebar'), sbBk = $('#sbBackdrop');
  function sbClose() { sb.classList.remove('open'); sbBk.classList.remove('show'); }
  $('#tbBurger').addEventListener('click', function () { sb.classList.add('open'); sbBk.classList.add('show'); });
  sbBk.addEventListener('click', sbClose);

  /* ---------- boot ---------- */
  // Preload registrations/schools/questions once so Dashboard stats and the
  // registration form's school dropdown are correct on first paint, then
  // hand off to the router (each of the three views also refreshes itself
  // from the server every time it's opened).
  Promise.all([loadRegistrations(regSort), loadSchools(schSort), loadQuestions(qSort)])
    .catch(function (e) { toast(e.message || 'Could not reach the server'); })
    .then(route);
})();