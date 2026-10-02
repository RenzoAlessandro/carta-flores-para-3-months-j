var audio = document.getElementById("bg-music");
var lyrics = document.querySelector("#lyrics");
var musicToggle = document.getElementById("music-toggle");

// Frases románticas propias (no dependen de la canción)
var lyricsData = [
  { text: "Jimena… mi lugar favorito en el mundo ♡", time: 6 },
  { text: "Tres meses, mil ganas de estar juntos", time: 14 },
  { text: "La distancia duele… pero nosotros podemos", time: 22 },
  { text: "Tú eres mi apoyo cuando más lo necesito", time: 30 },
  { text: "Tus consejos me sostienen", time: 38 },
  { text: "En mis peores días, tú eres mi fortaleza", time: 46 },
  { text: "Cada viaje hacia ti vale todo", time: 54 },
  { text: "Hoy celebro que existes en mi vida", time: 62 },
  { text: "Y que elegimos seguir eligiéndonos", time: 70 },
  { text: "Estas flores son para ti, mi amor", time: 78 },
  { text: "Programadas con cariño… hechas de Renzo para Jimena", time: 86 },
  { text: "Felices 3 meses ♡", time: 96 },
];

function updateLyrics() {
  if (!audio || !lyrics) return;

  var time = Math.floor(audio.currentTime || 0);
  // Si el audio aún no suena, usar el tiempo desde que cargó la página
  if (audio.paused && time === 0) {
    time = Math.floor((Date.now() - pageStart) / 1000);
  }

  var currentLine = lyricsData.find(
    (line) => time >= line.time && time < line.time + 7
  );

  if (currentLine) {
    lyrics.style.opacity = 1;
    lyrics.innerHTML = currentLine.text;
  } else {
    lyrics.style.opacity = 0;
    lyrics.innerHTML = "";
  }
}

var pageStart = Date.now();
setInterval(updateLyrics, 400);

function tryPlayMusic() {
  if (!audio) return;
  var playPromise = audio.play();
  if (playPromise && typeof playPromise.then === "function") {
    playPromise
      .then(function () {
        if (musicToggle) musicToggle.textContent = "♫";
      })
      .catch(function () {
        if (musicToggle) musicToggle.textContent = "♪";
      });
  }
}

if (musicToggle && audio) {
  musicToggle.addEventListener("click", function () {
    if (audio.paused) {
      tryPlayMusic();
    } else {
      audio.pause();
      musicToggle.textContent = "♪";
    }
  });

  // Intento suave de autoplay; si el navegador lo bloquea, el botón la activa
  document.addEventListener(
    "click",
    function once() {
      tryPlayMusic();
      document.removeEventListener("click", once);
    },
    { once: true }
  );

  tryPlayMusic();
}
