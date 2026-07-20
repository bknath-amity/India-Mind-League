/* India Mind League — podium leaderboard (sample data + tab switching) */
(function () {
  'use strict';
  var mount = document.getElementById('lbMount');
  if (!mount) return;

  function avatar(seed) {
    return 'https://api.dicebear.com/9.x/avataaars/svg?seed=' + encodeURIComponent(seed) +
      '&radius=50&backgroundColor=b6e3f4,c0aede,ffd5dc,d1d4f9,ffdfbf,c1f0dc';
  }

  // podium order = [1st, 2nd, 3rd]
  var DATA = {
    region: {
      podium: [{ n: 'Aditya Verma', u: 'aditya', s: 2430 }, { n: 'Saanvi Kapoor', u: 'saanvi', s: 1847 }, { n: 'Arjun Nair', u: 'arjunn', s: 1674 }],
      rest: [
        { n: 'Rohan Malhotra', s: 1124, t: 'up' }, { n: 'Tara Bhatia', s: 875, t: 'down' },
        { n: 'Dev Khanna', s: 774, t: 'up' }, { n: 'Anvi Saxena', s: 723, t: 'up' }, { n: 'Karan Bose', s: 559, t: 'down' },
      ],
    },
    national: {
      podium: [{ n: 'Aarav Mehta', u: 'aarav', s: 4810 }, { n: 'Diya Sharma', u: 'diya', s: 4655 }, { n: 'Kabir Rao', u: 'kabir', s: 4520 }],
      rest: [
        { n: 'Ananya Iyer', s: 4310, t: 'up' }, { n: 'Vivaan Gupta', s: 4188, t: 'up' },
        { n: 'Ishaan Roy', s: 3990, t: 'down' }, { n: 'Myra Nair', s: 3877, t: 'up' }, { n: 'Reyansh Jain', s: 3640, t: 'down' },
      ],
    },
    global: {
      podium: [{ n: 'Aarohi Pillai', u: 'aarohi', s: 9120 }, { n: 'Shaurya Menon', u: 'shaurya', s: 8940 }, { n: 'Riya Chopra', u: 'riya', s: 8710 }],
      rest: [
        { n: 'Aryan Desai', s: 8455, t: 'up' }, { n: 'Meera Krishnan', s: 8210, t: 'down' },
        { n: 'Nikhil Agarwal', s: 7980, t: 'up' }, { n: 'Sara Qureshi', s: 7740, t: 'up' }, { n: 'Veer Chauhan', s: 7522, t: 'down' },
      ],
    },
  };

  function podCard(x, rank) {
    return '<div class="pod pod-' + rank + '">' +
      (rank === 1 ? '<div class="crown">👑</div>' : '') +
      '<div class="pod-av"><img src="' + avatar(x.n) + '" alt="' + x.n + '" loading="lazy"><span class="rankbadge">' + rank + '</span></div>' +
      '<div class="pod-name">' + x.n + '</div>' +
      '<div class="pod-score">' + x.s + '</div>' +
      '<div class="pod-user">@' + x.u + '</div>' +
      '</div>';
  }

  function render(key) {
    var d = DATA[key];
    var p = d.podium;
    var podium = '<div class="podium">' + podCard(p[1], 2) + podCard(p[0], 1) + podCard(p[2], 3) + '</div>';
    var list = d.rest.map(function (x, i) {
      var arrow = x.t === 'up' ? '▲' : '▼';
      return '<div class="lb-item">' +
        '<div class="lb-av"><img src="' + avatar(x.n) + '" alt="" loading="lazy"></div>' +
        '<div class="lb-meta"><b>' + (i + 4) + '. ' + x.n + '</b><span>@username</span></div>' +
        '<div class="lb-end">' + x.s + ' <span class="lb-trend ' + x.t + '">' + arrow + '</span></div>' +
        '</div>';
    }).join('');
    mount.innerHTML = podium + '<div class="lb-list2">' + list + '</div>';
  }

  var tabs = document.querySelectorAll('.lb-tab');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.classList.remove('active'); });
      t.classList.add('active');
      render(t.dataset.key);
    });
  });

  render('region');
})();
