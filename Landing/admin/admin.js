/* India Mind League — Admin panel (demo, localStorage-backed, no backend) */
(function () {
  'use strict';

  /* ================= store ================= */
  var KEY = 'imlAdmin.v1';

  function seed() {
    return {
      registrations: [
        { id: 'R1001', name: 'Aarav Mehta', grade: '9', school: 'Amity International School, Saket', parent: 'Rohit Mehta', phone: '9876500011', email: 'aarav.mehta@example.com', date: '2026-06-20', status: 'Qualified' },
        { id: 'R1002', name: 'Diya Sharma', grade: '10', school: 'Amity International School, Noida', parent: 'Neha Sharma', phone: '9876500012', email: 'diya.sharma@example.com', date: '2026-06-21', status: 'Test Taken' },
        { id: 'R1003', name: 'Kabir Rao', grade: '11', school: 'Amity International School, Gurugram 46', parent: 'Vikram Rao', phone: '9876500013', email: 'kabir.rao@example.com', date: '2026-06-21', status: 'Registered' },
        { id: 'R1004', name: 'Ananya Iyer', grade: '12', school: 'Amity International School, Vasundhara', parent: 'Suresh Iyer', phone: '9876500014', email: 'ananya.iyer@example.com', date: '2026-06-22', status: 'Qualified' },
        { id: 'R1005', name: 'Vivaan Gupta', grade: '9', school: 'Amity International School, Mayur Vihar', parent: 'Amit Gupta', phone: '9876500015', email: 'vivaan.gupta@example.com', date: '2026-06-23', status: 'Registered' },
        { id: 'R1006', name: 'Myra Nair', grade: '10', school: 'Amity International School, Saket', parent: 'Deepa Nair', phone: '9876500016', email: 'myra.nair@example.com', date: '2026-06-24', status: 'Test Taken' },
        { id: 'R1007', name: 'Reyansh Jain', grade: '11', school: 'Amity International School, Noida', parent: 'Pankaj Jain', phone: '9876500017', email: 'reyansh.jain@example.com', date: '2026-06-25', status: 'Registered' },
        { id: 'R1008', name: 'Saanvi Kapoor', grade: '12', school: 'Amity International School, Gurugram 46', parent: 'Karan Kapoor', phone: '9876500018', email: 'saanvi.kapoor@example.com', date: '2026-06-25', status: 'Qualified' },
      ],
      schools: [
        { id: 'S01', name: 'Amity International School, Saket', city: 'New Delhi', contact: '011-4000 0001', coordinator: 'Mrs. R. Khanna', students: 42 },
        { id: 'S02', name: 'Amity International School, Noida', city: 'Noida', contact: '0120-400 0002', coordinator: 'Mr. S. Bhatia', students: 58 },
        { id: 'S03', name: 'Amity International School, Gurugram 46', city: 'Gurugram', contact: '0124-400 0003', coordinator: 'Mrs. P. Anand', students: 37 },
        { id: 'S04', name: 'Amity International School, Vasundhara', city: 'Ghaziabad', contact: '0120-400 0004', coordinator: 'Mr. A. Verma', students: 29 },
        { id: 'S05', name: 'Amity International School, Mayur Vihar', city: 'New Delhi', contact: '011-4000 0005', coordinator: 'Mrs. K. Menon', students: 33 },
      ],
      questions: [
        { id: 'Q1', grade: '9', cat: 'IQ', q: 'Which number completes the series? 2, 6, 12, 20, 30, ___', opts: ['36', '40', '42', '48'], correct: 2 },
        { id: 'Q2', grade: '9', cat: 'IQ', q: 'If CAT is coded as 3-1-20, what is the code for DOG?', opts: ['4-15-7', '4-14-7', '3-15-7', '4-15-8'], correct: 0 },
        { id: 'Q3', grade: '10', cat: 'IQ', q: 'Find the odd one out.', opts: ['Square', 'Circle', 'Triangle', 'Cube'], correct: 3 },
        { id: 'Q4', grade: '10', cat: 'EQ', q: 'A teammate is upset after losing a round. The best first response is to…', opts: ['Tell them to get over it', 'Acknowledge how they feel and offer support', 'Ignore them and move on', 'Point out their mistakes'], correct: 1 },
        { id: 'Q5', grade: '11', cat: 'EQ', q: 'You feel nervous before a big test. A healthy way to handle it is to…', opts: ['Avoid the test', 'Take slow breaths and make a plan', 'Blame other people', 'Stay up all night worrying'], correct: 1 },
        { id: 'Q6', grade: '11', cat: 'Values', q: 'You find a wallet that belongs to a classmate. What should you do?', opts: ['Keep it', 'Return it to them or a teacher', 'Spend the money', 'Leave it lying there'], correct: 1 },
        { id: 'Q7', grade: '12', cat: 'IQ', q: 'Which fraction is the largest?', opts: ['1/2', '2/5', '3/7', '4/9'], correct: 0 },
        { id: 'Q8', grade: '12', cat: 'Values', q: 'During a team task, the fairest way to decide is to…', opts: ['Let the loudest person choose', 'Listen to everyone and agree together', 'Always follow one leader', 'Decide in secret'], correct: 1 },
      ],
      exams: [
        { id: 'E01', title: 'Digital Qualifier — Window 1', grade: '9-10', date: '2026-07-15', time: '10:00', duration: 15, status: 'Scheduled' },
        { id: 'E02', title: 'Digital Qualifier — Window 2', grade: '11-12', date: '2026-07-16', time: '10:00', duration: 15, status: 'Scheduled' },
        { id: 'E03', title: 'Practice Mock Test', grade: 'All', date: '2026-07-05', time: '17:00', duration: 15, status: 'Live' },
      ],
      notifications: [
        { id: 'N01', type: 'EMAIL', audience: 'All Registered', subject: 'Your Qualifier window is confirmed', message: 'Dear participant, your Digital Qualifier opens on 15 July at 10:00 AM…', date: '2026-06-28', status: 'Sent' },
        { id: 'N02', type: 'SMS', audience: 'Grade 9', subject: '', message: 'IML: Practice mock test is live now. Log in to attempt. All the best!', date: '2026-06-27', status: 'Sent' },
        { id: 'N03', type: 'EMAIL', audience: 'Schools', subject: 'Coordinator briefing — IML Stage 1', message: 'Dear coordinator, please find the Stage-1 schedule and guidelines attached…', date: '2026-06-25', status: 'Sent' },
      ],
      admins: [
        { id: 'A01', name: 'Arjun Sharma', email: 'arjun@amity.edu', role: 'Super Admin', status: 'Active' },
        { id: 'A02', name: 'Priya Malhotra', email: 'priya@amity.edu', role: 'Editor', status: 'Active' },
        { id: 'A03', name: 'Rahul Bose', email: 'rahul@amity.edu', role: 'Viewer', status: 'Disabled' },
      ],
      results: [
        { id: 'T01', student: 'Aarav Mehta', grade: '9', school: 'Amity International School, Saket', date: '2026-06-26', time: '11:32', answers: [{ q: 'Q1', a: 2 }, { q: 'Q2', a: 0 }, { q: 'Q4', a: 1 }, { q: 'Q6', a: 1 }, { q: 'Q7', a: 0 }] },
        { id: 'T02', student: 'Saanvi Kapoor', grade: '12', school: 'Amity International School, Gurugram 46', date: '2026-06-26', time: '12:04', answers: [{ q: 'Q1', a: 2 }, { q: 'Q3', a: 3 }, { q: 'Q5', a: 1 }, { q: 'Q7', a: 1 }, { q: 'Q8', a: 1 }] },
        { id: 'T03', student: 'Diya Sharma', grade: '10', school: 'Amity International School, Noida', date: '2026-06-27', time: '10:47', answers: [{ q: 'Q1', a: 1 }, { q: 'Q3', a: 3 }, { q: 'Q4', a: 1 }, { q: 'Q6', a: 0 }, { q: 'Q8', a: 1 }] },
        { id: 'T04', student: 'Myra Nair', grade: '10', school: 'Amity International School, Saket', date: '2026-06-27', time: '13:20', answers: [{ q: 'Q2', a: 0 }, { q: 'Q3', a: 0 }, { q: 'Q4', a: 3 }, { q: 'Q6', a: 1 }, { q: 'Q7', a: 2 }] },
        { id: 'T05', student: 'Ananya Iyer', grade: '12', school: 'Amity International School, Vasundhara', date: '2026-06-28', time: '09:58', answers: [{ q: 'Q1', a: 2 }, { q: 'Q2', a: 0 }, { q: 'Q5', a: 1 }, { q: 'Q7', a: 0 }, { q: 'Q8', a: 1 }] },
      ],
    };
  }

  var db;
  try { db = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { db = null; }
  if (!db || !db.registrations) { db = seed(); persist(); }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} }

  /* ================= helpers ================= */
  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function uid(p) { return p + Math.random().toString(36).slice(2, 7).toUpperCase(); }
  function today() { var d = new Date(); return d.toISOString().slice(0, 10); }
  function score(r) { var s = 0; r.answers.forEach(function (an) { var q = db.questions.find(function (x) { return x.id === an.q; }); if (q && q.correct === an.a) s++; }); return s; }

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
      db.registrations.slice(-5).reverse().map(function (r) {
        return '<tr><td class="b">' + esc(r.name) + '</td><td>' + esc(r.grade) + '</td><td>' + statusBadge(r.status) + '</td></tr>';
      }).join('') + '</tbody></table></div></div>' +
      '<div class="card"><h3>Upcoming exams</h3>' +
      db.exams.map(function (e) {
        return '<div style="display:flex;justify-content:space-between;gap:.6rem;padding:.5rem 0;border-bottom:1px solid var(--line)">' +
          '<span class="b" style="font-weight:700">' + esc(e.title) + '<small>Grade ' + esc(e.grade) + ' · ' + esc(e.date) + ' ' + esc(e.time) + '</small></span>' +
          examBadge(e.status) + '</div>';
      }).join('') + '</div></div>';
  }
  function statusBadge(s) {
    var c = s === 'Qualified' ? 'green' : s === 'Test Taken' ? 'blue' : 'grey';
    return '<span class="bdg ' + c + '">' + esc(s) + '</span>';
  }
  function examBadge(s) {
    var c = s === 'Live' ? 'green' : s === 'Completed' ? 'grey' : 'gold';
    return '<span class="bdg ' + c + '" style="align-self:center">' + esc(s) + '</span>';
  }

  /* ---------- registrations ---------- */
  var regQ = '';
  function vRegistrations() {
    var rows = db.registrations.filter(function (r) {
      var t = (r.name + ' ' + r.school + ' ' + r.phone + ' ' + r.grade).toLowerCase();
      return t.indexOf(regQ.toLowerCase()) > -1;
    });
    content.innerHTML =
      '<div class="bar"><input class="search" id="regSearch" placeholder="Search name, school, phone…" value="' + esc(regQ) + '" />' +
      '<span class="grow"></span><button class="btn btn-gold" id="regAdd">＋ Add Registration</button></div>' +
      '<div class="tbl-wrap"><table><thead><tr><th>ID</th><th>Student</th><th>Grade</th><th>School</th><th>Mobile</th><th>Status</th><th style="text-align:right">Actions</th></tr></thead><tbody>' +
      (rows.length ? rows.map(function (r) {
        return '<tr><td>' + esc(r.id) + '</td><td class="b">' + esc(r.name) + '<small>' + esc(r.email || '') + '</small></td><td>' + esc(r.grade) + '</td>' +
          '<td>' + esc(r.school) + '</td><td>' + esc(r.phone) + '</td><td>' + statusBadge(r.status) + '</td>' +
          '<td><div class="acts">' +
          '<button class="btn btn-sm" data-view-reg="' + r.id + '">View</button>' +
          '<button class="btn btn-sm" data-edit-reg="' + r.id + '">Edit</button>' +
          '<button class="btn btn-sm btn-danger" data-del-reg="' + r.id + '">Delete</button></div></td></tr>';
      }).join('') : '<tr><td colspan="7" class="empty">No registrations found.</td></tr>') +
      '</tbody></table></div>';

    $('#regSearch').addEventListener('input', function () { regQ = this.value; vRegistrations(); $('#regSearch').focus(); $('#regSearch').setSelectionRange(regQ.length, regQ.length); });
    $('#regAdd').addEventListener('click', function () { regForm(null); });
    content.querySelectorAll('[data-view-reg]').forEach(function (b) { b.addEventListener('click', function () { regView(b.getAttribute('data-view-reg')); }); });
    content.querySelectorAll('[data-edit-reg]').forEach(function (b) { b.addEventListener('click', function () { regForm(b.getAttribute('data-edit-reg')); }); });
    content.querySelectorAll('[data-del-reg]').forEach(function (b) {
      b.addEventListener('click', function () {
        var r = byId(db.registrations, b.getAttribute('data-del-reg'));
        confirmDlg('Delete registration of "' + r.name + '"? This cannot be undone.', function () {
          db.registrations = db.registrations.filter(function (x) { return x.id !== r.id; }); persist(); toast('Registration deleted'); vRegistrations();
        });
      });
    });
  }
  function byId(arr, id) { return arr.find(function (x) { return x.id === id; }); }

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
      var data = { name: name, grade: $('#fGrade').value, school: $('#fSchool').value, parent: $('#fParent').value.trim(), phone: phone, email: $('#fEmail').value.trim(), status: $('#fStatus').value };
      if (id) { Object.assign(byId(db.registrations, id), data); toast('Registration updated'); }
      else { data.id = uid('R'); data.date = today(); db.registrations.push(data); toast('Registration added'); }
      persist(); closeModal(); vRegistrations();
    });
  }

  /* ---------- schools ---------- */
  function vSchools() {
    content.innerHTML =
      '<div class="bar"><span class="grow"></span><button class="btn btn-gold" id="schAdd">＋ Add School</button></div>' +
      '<div class="tbl-wrap"><table><thead><tr><th>ID</th><th>School</th><th>City</th><th>Coordinator</th><th>Contact</th><th>Students</th><th style="text-align:right">Actions</th></tr></thead><tbody>' +
      db.schools.map(function (s) {
        return '<tr><td>' + esc(s.id) + '</td><td class="b">' + esc(s.name) + '</td><td>' + esc(s.city) + '</td><td>' + esc(s.coordinator) + '</td>' +
          '<td>' + esc(s.contact) + '</td><td>' + esc(s.students) + '</td>' +
          '<td><div class="acts"><button class="btn btn-sm" data-v="' + s.id + '">View</button><button class="btn btn-sm" data-e="' + s.id + '">Edit</button>' +
          '<button class="btn btn-sm btn-danger" data-d="' + s.id + '">Delete</button></div></td></tr>';
      }).join('') + '</tbody></table></div>';

    $('#schAdd').addEventListener('click', function () { schForm(null); });
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
          db.schools = db.schools.filter(function (x) { return x.id !== s.id; }); persist(); toast('School deleted'); vSchools();
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
      var data = { name: name, city: $('#fSCity').value.trim(), coordinator: $('#fSCoord').value.trim(), contact: $('#fSContact').value.trim(), students: parseInt($('#fSCount').value, 10) || 0 };
      if (id) { Object.assign(byId(db.schools, id), data); toast('School updated'); }
      else { data.id = uid('S'); db.schools.push(data); toast('School added'); }
      persist(); closeModal(); vSchools();
    });
  }

  /* ---------- question bank ---------- */
  var qGrade = 'All', qCat = 'All';
  function vQuestions() {
    var rows = db.questions.filter(function (q) {
      return (qGrade === 'All' || q.grade === qGrade) && (qCat === 'All' || q.cat === qCat);
    });
    content.innerHTML =
      '<div class="bar">' + sel('qfGrade', ['All', '9', '10', '11', '12'], qGrade).replace('<select', '<select class="filter"') +
      sel('qfCat', ['All', 'IQ', 'EQ', 'Values'], qCat).replace('<select', '<select class="filter"') +
      '<span class="grow"></span><button class="btn btn-gold" id="qAdd">＋ MCQ Builder</button></div>' +
      '<div class="tbl-wrap"><table><thead><tr><th>ID</th><th>Question</th><th>Grade</th><th>Category</th><th>Correct</th><th style="text-align:right">Actions</th></tr></thead><tbody>' +
      (rows.length ? rows.map(function (q) {
        return '<tr><td>' + esc(q.id) + '</td><td class="b" style="max-width:380px">' + esc(q.q) + '</td><td>' + esc(q.grade) + '</td>' +
          '<td><span class="bdg ' + (q.cat === 'IQ' ? 'blue' : q.cat === 'EQ' ? 'pink' : 'purple') + '">' + esc(q.cat) + '</span></td>' +
          '<td>' + 'ABCD'[q.correct] + '. ' + esc(q.opts[q.correct]) + '</td>' +
          '<td><div class="acts"><button class="btn btn-sm" data-e="' + q.id + '">Edit</button><button class="btn btn-sm btn-danger" data-d="' + q.id + '">Delete</button></div></td></tr>';
      }).join('') : '<tr><td colspan="6" class="empty">No questions for this filter.</td></tr>') +
      '</tbody></table></div>';

    $('#qfGrade').addEventListener('change', function () { qGrade = this.value; vQuestions(); });
    $('#qfCat').addEventListener('change', function () { qCat = this.value; vQuestions(); });
    $('#qAdd').addEventListener('click', function () { qForm(null); });
    content.querySelectorAll('[data-e]').forEach(function (b) { b.addEventListener('click', function () { qForm(b.getAttribute('data-e')); }); });
    content.querySelectorAll('[data-d]').forEach(function (b) {
      b.addEventListener('click', function () {
        var q = byId(db.questions, b.getAttribute('data-d'));
        confirmDlg('Delete this question? "' + q.q.slice(0, 60) + '…"', function () {
          db.questions = db.questions.filter(function (x) { return x.id !== q.id; }); persist(); toast('Question deleted'); vQuestions();
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
      var data = { grade: $('#fQGrade').value, cat: $('#fQCat').value, q: text, opts: opts, correct: correct };
      if (id) { Object.assign(byId(db.questions, id), data); toast('Question updated'); }
      else { data.id = uid('Q'); db.questions.push(data); toast('Question added'); }
      persist(); closeModal(); vQuestions();
    });
  }

  /* ---------- exam dates ---------- */
  function vExams() {
    content.innerHTML =
      '<div class="bar"><span class="grow"></span><button class="btn btn-gold" id="exAdd">＋ Schedule Exam</button></div>' +
      '<div class="tbl-wrap"><table><thead><tr><th>Title</th><th>Grade</th><th>Date</th><th>Time</th><th>Duration</th><th>Status</th><th style="text-align:right">Actions</th></tr></thead><tbody>' +
      db.exams.map(function (e) {
        return '<tr><td class="b">' + esc(e.title) + '</td><td>' + esc(e.grade) + '</td><td>' + esc(e.date) + '</td><td>' + esc(e.time) + '</td>' +
          '<td>' + esc(e.duration) + ' min</td><td>' + examBadge(e.status) + '</td>' +
          '<td><div class="acts"><button class="btn btn-sm" data-e="' + e.id + '">Edit</button><button class="btn btn-sm btn-danger" data-d="' + e.id + '">Delete</button></div></td></tr>';
      }).join('') + '</tbody></table></div>';

    $('#exAdd').addEventListener('click', function () { exForm(null); });
    content.querySelectorAll('[data-e]').forEach(function (b) { b.addEventListener('click', function () { exForm(b.getAttribute('data-e')); }); });
    content.querySelectorAll('[data-d]').forEach(function (b) {
      b.addEventListener('click', function () {
        var e = byId(db.exams, b.getAttribute('data-d'));
        confirmDlg('Delete "' + e.title + '"?', function () {
          db.exams = db.exams.filter(function (x) { return x.id !== e.id; }); persist(); toast('Exam deleted'); vExams();
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
      persist(); closeModal(); vExams();
    });
  }

  /* ---------- notifications ---------- */
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
      persist(); toast('Notification sent (demo)'); ntTab = 'history'; vNotifications();
    });
  }

  /* ---------- admin users ---------- */
  function vAdmins() {
    content.innerHTML =
      '<div class="bar"><span class="grow"></span><button class="btn btn-gold" id="adAdd">＋ Add Admin</button></div>' +
      '<div class="tbl-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th style="text-align:right">Actions</th></tr></thead><tbody>' +
      db.admins.map(function (a) {
        return '<tr><td class="b">' + esc(a.name) + '</td><td>' + esc(a.email) + '</td>' +
          '<td><span class="bdg ' + (a.role === 'Super Admin' ? 'gold' : a.role === 'Editor' ? 'blue' : 'grey') + '">' + esc(a.role) + '</span></td>' +
          '<td><span class="bdg ' + (a.status === 'Active' ? 'green' : 'red') + '">' + esc(a.status) + '</span></td>' +
          '<td><div class="acts"><button class="btn btn-sm" data-e="' + a.id + '">Edit</button><button class="btn btn-sm btn-danger" data-d="' + a.id + '">Delete</button></div></td></tr>';
      }).join('') + '</tbody></table></div>';

    $('#adAdd').addEventListener('click', function () { adForm(null); });
    content.querySelectorAll('[data-e]').forEach(function (b) { b.addEventListener('click', function () { adForm(b.getAttribute('data-e')); }); });
    content.querySelectorAll('[data-d]').forEach(function (b) {
      b.addEventListener('click', function () {
        var a = byId(db.admins, b.getAttribute('data-d'));
        confirmDlg('Remove admin "' + a.name + '"?', function () {
          db.admins = db.admins.filter(function (x) { return x.id !== a.id; }); persist(); toast('Admin removed'); vAdmins();
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
      persist(); closeModal(); vAdmins();
    });
  }

  /* ---------- leaderboard ---------- */
  function vLeaderboard() {
    var rows = db.results.map(function (r) { return { name: r.student, school: r.school, grade: r.grade, score: score(r), total: r.answers.length }; })
      .sort(function (a, b) { return b.score - a.score || a.name.localeCompare(b.name); });
    content.innerHTML =
      '<div class="tbl-wrap"><table><thead><tr><th>Rank</th><th>Student</th><th>Grade</th><th>School</th><th>Score</th></tr></thead><tbody>' +
      rows.map(function (r, i) {
        return '<tr' + (i === 0 ? ' class="top1"' : '') + '><td class="b">' + (i === 0 ? '👑 ' : '') + '#' + (i + 1) + '</td><td class="b">' + esc(r.name) + '</td>' +
          '<td>' + esc(r.grade) + '</td><td>' + esc(r.school) + '</td><td class="b" style="color:var(--gold-2)">' + r.score + ' / ' + r.total + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  /* ---------- results ---------- */
  function vResults() {
    content.innerHTML =
      '<div class="tbl-wrap"><table><thead><tr><th>Attempt</th><th>Student</th><th>Grade</th><th>Date</th><th>Time</th><th>Score</th><th style="text-align:right">Actions</th></tr></thead><tbody>' +
      db.results.map(function (r) {
        var s = score(r);
        return '<tr><td>' + esc(r.id) + '</td><td class="b">' + esc(r.student) + '<small>' + esc(r.school) + '</small></td><td>' + esc(r.grade) + '</td>' +
          '<td>' + esc(r.date) + '</td><td>' + esc(r.time) + '</td>' +
          '<td><span class="bdg ' + (s >= r.answers.length * 0.6 ? 'green' : s >= r.answers.length * 0.4 ? 'gold' : 'red') + '">' + s + ' / ' + r.answers.length + '</span></td>' +
          '<td><div class="acts"><button class="btn btn-sm" data-v="' + r.id + '">View responses</button></div></td></tr>';
      }).join('') + '</tbody></table></div>';

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

  route();
})();
