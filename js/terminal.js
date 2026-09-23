(function () {
  var body = document.getElementById("terminal-body");
  if (!body) return;

  var lines = [
    { html: '<span class="muted">Welcome to love-shell v3.0.0</span>', delay: 400 },
    { html: '<span class="muted">user: renzo · project: jimena</span>', delay: 700 },
    { html: '<span class="cmd">$ npm install forever-with-jimena</span>', delay: 1100 },
    { html: '<span class="muted">installing dependencies…</span>', delay: 1800 },
    { html: '<span class="muted">+ cariño@3.0.0</span>', delay: 2400 },
    { html: '<span class="muted">+ paciencia@∞</span>', delay: 2800 },
    { html: '<span class="muted">+ viajes-para-vernos@latest</span>', delay: 3200 },
    { html: '<span class="ok">❤️  relationship installed successfully</span>', delay: 3900 },
    { html: '<span class="cmd">$ git status</span>', delay: 4700 },
    { html: '<span class="pink">On branch forever</span>', delay: 5200 },
    { html: '<span class="ok">nothing to commit, we\'re perfect ♡</span>', delay: 5800 },
  ];

  lines.forEach(function (line) {
    setTimeout(function () {
      body.innerHTML += line.html + "\n";
      body.scrollTop = body.scrollHeight;
    }, line.delay);
  });
})();
