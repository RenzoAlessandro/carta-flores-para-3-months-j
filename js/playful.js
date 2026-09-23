(function () {
  var noBtn = document.getElementById("btn-no");
  var hint = document.getElementById("playful-hint");
  var area = document.getElementById("playful");
  if (!noBtn || !area) return;

  var escapes = 0;
  var phrases = [
    "¿Segura? 👀",
    "El No se puso nervioso…",
    "Mmm… intenta otra vez ♡",
    "Solo existe una respuesta correcta",
    "Jimena… el Sí te está esperando",
  ];

  function moveNo() {
    var areaRect = area.getBoundingClientRect();
    var btnRect = noBtn.getBoundingClientRect();
    var maxLeft = Math.max(0, areaRect.width - btnRect.width);
    var maxTop = Math.max(0, areaRect.height - btnRect.height);

    var left = Math.random() * maxLeft;
    var top = Math.random() * maxTop;

    noBtn.style.left = left + "px";
    noBtn.style.top = top + "px";

    escapes += 1;
    if (hint) {
      hint.textContent = phrases[Math.min(escapes - 1, phrases.length - 1)];
    }
  }

  noBtn.addEventListener("mouseenter", moveNo);
  noBtn.addEventListener("click", function (e) {
    e.preventDefault();
    moveNo();
  });
  noBtn.addEventListener("touchstart", function (e) {
    e.preventDefault();
    moveNo();
  }, { passive: false });
})();
