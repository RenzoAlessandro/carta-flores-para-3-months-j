(function () {
  var ROWS = 6;
  var COLS = 7;
  var players = {
    renzo: { name: "Renzo", className: "disc--renzo" },
    jimena: { name: "Jimena", className: "disc--jimena" },
  };
  var order = [3, 2, 4, 1, 5, 0, 6];

  var boardEl = document.getElementById("board");
  var statusEl = document.getElementById("game-status");
  var restartBtn = document.getElementById("restart");
  var setupEl = document.getElementById("setup");
  var gameEl = document.querySelector(".game");
  if (!boardEl || !statusEl || !restartBtn || !setupEl || !gameEl) return;

  var grid = [];
  var turn = "renzo";
  var locked = false;
  var winning = [];
  var lastMove = null;
  var human = null;
  var cpu = null;
  var thinking = false;

  function emptyGrid() {
    var next = [];
    for (var r = 0; r < ROWS; r++) {
      next[r] = [];
      for (var c = 0; c < COLS; c++) next[r][c] = null;
    }
    return next;
  }

  function other(player) {
    return player === "renzo" ? "jimena" : "renzo";
  }

  function key(row, col) {
    return row + "," + col;
  }

  function lineFrom(row, col, dRow, dCol, player) {
    var cells = [];
    var r = row;
    var c = col;
    while (r >= 0 && r < ROWS && c >= 0 && c < COLS && grid[r][c] === player) {
      cells.push(key(r, c));
      r += dRow;
      c += dCol;
    }
    return cells;
  }

  function winnerAt(row, col, player) {
    var dirs = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];
    for (var i = 0; i < dirs.length; i++) {
      var forward = lineFrom(row, col, dirs[i][0], dirs[i][1], player);
      var back = lineFrom(row - dirs[i][0], col - dirs[i][1], -dirs[i][0], -dirs[i][1], player);
      var cells = forward.concat(back);
      if (cells.length >= 4) return cells;
    }
    return null;
  }

  function isFull() {
    for (var c = 0; c < COLS; c++) {
      if (grid[0][c] === null) return false;
    }
    return true;
  }

  function lowestEmpty(col) {
    for (var r = ROWS - 1; r >= 0; r--) {
      if (grid[r][col] === null) return r;
    }
    return -1;
  }

  function drop(col, player) {
    var row = lowestEmpty(col);
    if (row < 0) return -1;
    grid[row][col] = player;
    return row;
  }

  function undo(row, col) {
    grid[row][col] = null;
  }

  function windowScore(cells, machine) {
    var mine = 0;
    var opp = 0;
    var empty = 0;
    var rival = other(machine);
    for (var i = 0; i < cells.length; i++) {
      if (cells[i] === machine) mine++;
      else if (cells[i] === rival) opp++;
      else empty++;
    }
    if (mine === 4) return 100;
    if (opp === 4) return -100;
    if (mine === 3 && empty === 1) return 12;
    if (opp === 3 && empty === 1) return -14;
    if (mine === 2 && empty === 2) return 4;
    if (opp === 2 && empty === 2) return -3;
    return 0;
  }

  function evaluate(machine) {
    var score = 0;
    var r;
    var c;
    for (r = 0; r < ROWS; r++) {
      if (grid[r][3] === machine) score += 3;
    }
    for (r = 0; r < ROWS; r++) {
      for (c = 0; c <= COLS - 4; c++) {
        score += windowScore([grid[r][c], grid[r][c + 1], grid[r][c + 2], grid[r][c + 3]], machine);
      }
    }
    for (c = 0; c < COLS; c++) {
      for (r = 0; r <= ROWS - 4; r++) {
        score += windowScore([grid[r][c], grid[r + 1][c], grid[r + 2][c], grid[r + 3][c]], machine);
      }
    }
    for (r = 0; r <= ROWS - 4; r++) {
      for (c = 0; c <= COLS - 4; c++) {
        score += windowScore(
          [grid[r][c], grid[r + 1][c + 1], grid[r + 2][c + 2], grid[r + 3][c + 3]],
          machine
        );
      }
    }
    for (r = 0; r <= ROWS - 4; r++) {
      for (c = 3; c < COLS; c++) {
        score += windowScore(
          [grid[r][c], grid[r + 1][c - 1], grid[r + 2][c - 2], grid[r + 3][c - 3]],
          machine
        );
      }
    }
    return score;
  }

  function minimax(depth, maximizing, machine, alpha, beta, lastRow, lastCol) {
    if (lastRow !== null) {
      var who = grid[lastRow][lastCol];
      if (winnerAt(lastRow, lastCol, who)) {
        return who === machine ? 1000 + depth : -1000 - depth;
      }
    }
    if (depth === 0 || isFull()) return evaluate(machine);

    var player = maximizing ? machine : other(machine);
    var best = maximizing ? -Infinity : Infinity;
    for (var i = 0; i < order.length; i++) {
      var row = drop(order[i], player);
      if (row < 0) continue;
      var score = minimax(depth - 1, !maximizing, machine, alpha, beta, row, order[i]);
      undo(row, order[i]);
      if (maximizing) {
        if (score > best) best = score;
        if (score > alpha) alpha = score;
      } else {
        if (score < best) best = score;
        if (score < beta) beta = score;
      }
      if (alpha >= beta) break;
    }
    return best;
  }

  function urgentColumn(player) {
    for (var i = 0; i < order.length; i++) {
      var row = drop(order[i], player);
      if (row < 0) continue;
      var win = winnerAt(row, order[i], player);
      undo(row, order[i]);
      if (win) return order[i];
    }
    return -1;
  }

  function chooseColumn(machine) {
    var winNow = urgentColumn(machine);
    if (winNow >= 0) return winNow;
    var block = urgentColumn(other(machine));
    if (block >= 0) return block;

    var bestCol = 3;
    var best = -Infinity;
    for (var i = 0; i < order.length; i++) {
      var row = drop(order[i], machine);
      if (row < 0) continue;
      var score = minimax(3, false, machine, -Infinity, Infinity, row, order[i]);
      undo(row, order[i]);
      if (score > best) {
        best = score;
        bestCol = order[i];
      }
    }
    return bestCol;
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
    for (var c = 0; c < COLS; c++) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "board__col";
      button.setAttribute("aria-label", "Soltar ficha en la columna " + (c + 1));
      button.disabled = locked || thinking || lowestEmpty(c) < 0 || (cpu && turn !== human);
      button.addEventListener("click", onColumn(c));

      for (var r = 0; r < ROWS; r++) {
        var cell = document.createElement("span");
        cell.className = "board__cell";
        var owner = grid[r][c];
        if (owner) {
          var disc = document.createElement("span");
          disc.className = "disc " + players[owner].className;
          if (winning.indexOf(key(r, c)) !== -1) disc.classList.add("disc--win");
          if (lastMove && lastMove.row === r && lastMove.col === c) {
            disc.classList.add("disc--fresh");
            disc.style.setProperty("--drop", String(r + 1));
          }
          cell.appendChild(disc);
        }
        button.appendChild(cell);
      }
      boardEl.appendChild(button);
    }
  }

  function place(col, player) {
    var row = drop(col, player);
    if (row < 0) return false;
    lastMove = { row: row, col: col };
    var win = winnerAt(row, col, player);
    if (win) {
      winning = win;
      locked = true;
      statusEl.textContent = winText(player);
    } else if (isFull()) {
      locked = true;
      statusEl.textContent = "Empate. Otra ronda.";
    } else {
      turn = other(player);
      statusEl.textContent = turnText();
    }
    render();
    if (!locked && cpu && turn === cpu) machineMove();
    return true;
  }

  function machineMove() {
    if (locked || !cpu || turn !== cpu) return;
    thinking = true;
    statusEl.textContent = "Turno de la máquina";
    render();
    window.setTimeout(function () {
      var col = chooseColumn(cpu);
      thinking = false;
      place(col, cpu);
    }, 420);
  }

  function onColumn(col) {
    return function () {
      if (locked || thinking) return;
      if (cpu && turn !== human) return;
      place(col, turn);
    };
  }

  function start() {
    grid = emptyGrid();
    turn = "renzo";
    locked = false;
    thinking = false;
    winning = [];
    lastMove = null;
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
