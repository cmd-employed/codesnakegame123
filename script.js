// Pink Anime Snake — script.js
// Change the password here:
const PASSWORD = "changeMe123"; // <-- set your password here

// ---------------- Password overlay handling ----------------
const pwOverlay = document.getElementById('pwOverlay');
const pwInput = document.getElementById('pwInput');
const pwSubmit = document.getElementById('pwSubmit');
const pwClear = document.getElementById('pwClear');

function unlockIfCorrect() {
  const attempt = pwInput.value;
  if (attempt === PASSWORD) {
    pwOverlay.style.display = 'none';
    startGame(); // start the snake game after unlock
  } else {
    // simple shake animation
    pwInput.classList.add('shake');
    setTimeout(() => pwInput.classList.remove('shake'), 500);
    pwInput.value = '';
  }
}
pwSubmit.addEventListener('click', unlockIfCorrect);
pwInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') unlockIfCorrect();
});
pwClear.addEventListener('click', () => pwInput.value = '');

// ---------------- Snake Game ----------------
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const btnRestart = document.getElementById('btnRestart');
const btnPause = document.getElementById('btnPause');

const SCALE = 16; // size of each cell in pixels
const COLS = Math.floor(canvas.width / SCALE);
const ROWS = Math.floor(canvas.height / SCALE);

let snake = [];
let dir = { x: 1, y: 0 }; // initial moving right
let apple = { x: 0, y: 0 };
let gameInterval = null;
let speed = 100; // ms per frame
let score = 0;
let running = false;

function gridRandom() {
  return {
    x: Math.floor(Math.random() * COLS),
    y: Math.floor(Math.random() * ROWS)
  };
}

function resetGame() {
  snake = [];
  const startLength = 4;
  const startX = Math.floor(COLS / 2);
  const startY = Math.floor(ROWS / 2);
  for (let i = startLength - 1; i >= 0; i--) {
    snake.push({ x: startX - i, y: startY });
  }
  dir = { x: 1, y: 0 };
  apple = gridRandom();
  score = 0;
  scoreEl.textContent = score;
}

function drawCell(x, y, color = '#ff5ea2') {
  ctx.fillStyle = color;
  ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
  // small inner highlight
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(x * SCALE + 1, y * SCALE + 1, SCALE - 2, SCALE - 2);
}

function draw() {
  // clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // background grid subtle
  ctx.fillStyle = '#fffafc';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // draw apple
  drawCell(apple.x, apple.y, '#ff3b8e');

  // draw snake
  for (let i = 0; i < snake.length; i++) {
    const s = snake[i];
    const col = i === 0 ? '#7a2648' : '#ff7fbf';
    drawCell(s.x, s.y, col);
  }
}

function update() {
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  // wrap around (or you can change to collision death)
  if (head.x < 0) head.x = COLS - 1;
  if (head.x >= COLS) head.x = 0;
  if (head.y < 0) head.y = ROWS - 1;
  if (head.y >= ROWS) head.y = 0;

  // check collision with self
  for (let i = 0; i < snake.length; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) {
      // game over => reset
      resetGame();
      return;
    }
  }

  snake.unshift(head);

  // eat apple?
  if (head.x === apple.x && head.y === apple.y) {
    score += 1;
    scoreEl.textContent = score;
    // place new apple but avoid the snake body
    do {
      apple = gridRandom();
    } while (snake.some(s => s.x === apple.x && s.y === apple.y));
    // optionally increase speed slightly
    if (speed > 40) {
      speed -= 2;
      restartLoop();
    }
  } else {
    snake.pop();
  }
}

function gameTick() {
  update();
  draw();
}

function startLoop() {
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameTick, speed);
  running = true;
  btnPause.textContent = 'Pause';
}

function restartLoop() {
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameTick, speed);
}

function stopLoop() {
  if (gameInterval) {
    clearInterval(gameInterval);
    gameInterval = null;
  }
  running = false;
  btnPause.textContent = 'Resume';
}

// keyboard control
window.addEventListener('keydown', (e) => {
  const k = e.key;
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D'].includes(k)) {
    e.preventDefault();
  }
  if ((k === 'ArrowUp' || k === 'w' || k === 'W') && dir.y !== 1) { dir = { x: 0, y: -1 }; }
  if ((k === 'ArrowDown' || k === 's' || k === 'S') && dir.y !== -1) { dir = { x: 0, y: 1 }; }
  if ((k === 'ArrowLeft' || k === 'a' || k === 'A') && dir.x !== 1) { dir = { x: -1, y: 0 }; }
  if ((k === 'ArrowRight' || k === 'd' || k === 'D') && dir.x !== -1) { dir = { x: 1, y: 0 }; }
  // R to restart
  if (k === 'r' || k === 'R') {
    resetGame();
  }
});

btnRestart.addEventListener('click', () => {
  resetGame();
});

btnPause.addEventListener('click', () => {
  if (running) {
    stopLoop();
  } else {
    startLoop();
  }
});

// startGame is called after correct password input
function startGame() {
  resetGame();
  speed = 100;
  startLoop();
}

// Initially, do not start the game. Overlay blocks it until correct password.
// For easier testing during development: uncomment the next line to auto-unlock.
// startGame();