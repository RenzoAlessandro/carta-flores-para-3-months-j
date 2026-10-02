(function () {
  // Cambia esta fecha por el día en que se vuelven a ver (YYYY-MM-DD)
  var NEXT_HUG_DATE = "2026-10-08";

  var daysEl = document.getElementById("cd-days");
  var hoursEl = document.getElementById("cd-hours");
  var minsEl = document.getElementById("cd-mins");
  var secsEl = document.getElementById("cd-secs");
  var label = document.getElementById("hug-date-label");

  if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

  var target = new Date(NEXT_HUG_DATE + "T12:00:00");

  if (label) {
    var formatted = target.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    label.textContent = "Nos vemos el " + formatted;
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function tick() {
    var now = new Date();
    var diff = target.getTime() - now.getTime();

    if (diff <= 0) {
      daysEl.textContent = "0";
      hoursEl.textContent = "00";
      minsEl.textContent = "00";
      secsEl.textContent = "00";
      if (label) label.textContent = "¡Hoy es día de abrazo! Corre hacia ella ♡";
      return;
    }

    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    var mins = Math.floor((diff / (1000 * 60)) % 60);
    var secs = Math.floor((diff / 1000) % 60);

    daysEl.textContent = String(days);
    hoursEl.textContent = pad(hours);
    minsEl.textContent = pad(mins);
    secsEl.textContent = pad(secs);
  }

  tick();
  setInterval(tick, 1000);
})();
