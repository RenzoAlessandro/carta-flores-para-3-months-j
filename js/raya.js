(function () {
  var players = {
    renzo: { name: "Renzo", mark: "X", className: "xo__cell--renzo" },
    jimena: { name: "Jimena", mark: "O", className: "xo__cell--jimena" },
  };
  var lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  var boardEl = document.getElementById("board");
  var statusEl = document.getElementById("game-status");
  var restartBtn = document.getElementById("restart");
  var setupEl = document.getElementById("setup");
  var gameEl = document.querySelector(".game");
  if (!boardEl || !statusEl || !restartBtn || !setupEl || !gameEl) return;

  var cells = [];
  var turn = "renzo";
  var locked = false;
  var winning = [];
  var human = null;
  var cpu = null;
  var thinking = false;

  function other(player) {
    return player === "renzo" ? "jimena" : "renzo";
  }

  function findWin(player) {
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (
        cells[line[0]] === player &&
        cells[line[1]] === player &&
        cells[line[2]] === player
      ) {
        return line.slice();
      }
    }
    return null;
  }

  function isFull() {
    for (var i = 0; i < cells.length; i++) {
      if (cells[i] === null) return false;
    }
    return true;
  }

  function emptySpots() {
    var spots = [];
    for (var i = 0; i < cells.length; i++) {
      if (cells[i] === null) spots.push(i);
    }
    return spots;
  }

  function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function winningIndexes(player) {
    var spots = emptySpots();
    var wins = [];
    for (var i = 0; i < spots.length; i++) {
      cells[spots[i]] = player;
      if (findWin(player)) wins.push(spots[i]);
      cells[spots[i]] = null;
    }
    return wins;
  }

  function machineIndex() {
    var wins = winningIndexes(cpu);
    if (wins.length) return pickRandom(wins);

    if (Math.random() < 0.35) {
      var blocks = winningIndexes(human);
      if (blocks.length) return pickRandom(blocks);
    }

    return pickRandom(emptySpots());
  }

  function turnText() {
    if (!cpu) return "Turno de " + players[turn].name;
    if (turn === human) return "Tu turno";
    return "Turno de la máquina";
  }

  function winText(player) {
    if (!cpu) return "Ganó " + players[player].name + " ♡";
    if (player === human) return "Ganaste ♡";
    return "Ganó la máquina";
  }

  function render() {
    boardEl.innerHTML = "";
    for (var i = 0; i < 9; i++) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "xo__cell";
      button.setAttribute("aria-label", "Casilla " + (i + 1));
      var owner = cells[i];
      if (owner) {
        button.textContent = players[owner].mark;
        button.classList.add(players[owner].className);
        button.disabled = true;
      }
      if (winning.indexOf(i) !== -1) button.classList.add("xo__cell--win");
      if (locked || thinking || (cpu && turn !== human)) button.disabled = true;
      button.addEventListener("click", onCell(i));
      boardEl.appendChild(button);
    }
  }

  function finish(player) {
    var win = findWin(player);
    if (win) {
      winning = win;
      locked = true;
      statusEl.textContent = winText(player);
      return true;
    }
    if (isFull()) {
      locked = true;
      statusEl.textContent = "Empate. Otra ronda.";
      return true;
    }
    return false;
  }

  function machineMove() {
    if (locked || !cpu || turn !== cpu) return;
    thinking = true;
    statusEl.textContent = "Turno de la máquina";
    render();
    window.setTimeout(function () {
      var index = machineIndex();
      cells[index] = cpu;
      thinking = false;
      if (!finish(cpu)) {
        turn = human;
        statusEl.textContent = turnText();
      }
      render();
    }, 380);
  }

  function onCell(index) {
    return function () {
      if (locked || thinking || cells[index]) return;
      if (cpu && turn !== human) return;
      var player = turn;
      cells[index] = player;
      if (!finish(player)) {
        turn = other(player);
        statusEl.textContent = turnText();
        render();
        if (cpu && turn === cpu) machineMove();
        return;
      }
      render();
    };
  }

  function start() {
    cells = [null, null, null, null, null, null, null, null, null];
    turn = "renzo";
    locked = false;
    thinking = false;
    winning = [];
    statusEl.textContent = turnText();
    render();
    if (cpu && turn === cpu) machineMove();
  }

  function showSetup() {
    human = null;
    cpu = null;
    locked = true;
    thinking = false;
    gameEl.classList.remove("is-playing");
  }

  setupEl.addEventListener("click", function (event) {
    var button = event.target.closest("[data-mode]");
    if (!button) return;
    var mode = button.getAttribute("data-mode");
    if (mode === "together") {
      human = null;
      cpu = null;
    } else {
      human = mode;
      cpu = other(mode);
    }
    gameEl.classList.add("is-playing");
    start();
  });

  restartBtn.addEventListener("click", showSetup);
  showSetup();
})();
