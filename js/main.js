const player = document.getElementById("player");
const bot = document.getElementById("bot");
const gameArea = document.getElementById("game-area");
const coinsContainer = document.getElementById("coins");
const scoreElement = document.getElementById("score");
const pauseBtn = document.getElementById("pause-btn");
const pauseIcon = document.getElementById("pause-icon");
const resumeBtn = document.getElementById("resume-btn");
const pauseModal = document.getElementById("pause-modal");
const gameoverModal = document.getElementById("gameover-modal");
const continueBtn = document.getElementById("continue-btn");

const playerImgFile = document.getElementById("player-img");
const playerImgUrl = document.getElementById("player-img-url");
const botImgFile = document.getElementById("bot-img");
const botImgUrl = document.getElementById("bot-img-url");
const difficultyBtns = document.querySelectorAll(".difficulty-btn");
const difficultyDescription = document.getElementById("difficulty-description");

const PLAYER_SIZE = 50;
const BOT_SIZE = 50;
const COIN_LIFETIME = 4000;

const difficulties = {
  easy: { player: 180, bot: 90, points: 1 },
  medium: { player: 280, bot: 180, points: 2 },
  hard: { player: 350, bot: 300, points: 4 }
};

let currentDifficulty = "easy";
let playerSpeed = difficulties.easy.player;
let botSpeed = difficulties.easy.bot;
let playerPosition = { x: 50, y: 50 };
let botPosition = { x: 450, y: 450 };
let score = 0;
let gameOver = false;
let isPaused = false;
let isGameOverVisible = false;

let coinSound = new Audio("assets/CoinSound.wav");
const recordSound = new Audio("assets/Record.wav");

function getHighScore(difficulty) {
  const saved = localStorage.getItem(`highscore_${difficulty}`);
  return saved ? parseInt(saved) : 0;
}

function saveHighScore(difficulty, score) {
  localStorage.setItem(`highscore_${difficulty}`, score);
}

/*
Testing Record code

saveHighScore("easy", 0);
saveHighScore("normal", 0);
saveHighScore("easy", 0);
*/

difficultyBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const newDifficulty = btn.dataset.difficulty;
    
    if (newDifficulty !== currentDifficulty) {
      difficultyBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentDifficulty = newDifficulty;
      updateDifficultyDescription();
      resetGame();
    }
  });
});

function updateDifficultyDescription() {
  const config = difficulties[currentDifficulty];
  const highScore = getHighScore(currentDifficulty);
  difficultyDescription.innerHTML = `
    Jugador: ${config.player} | Enemigo: ${config.bot} | Puntos: ${config.points}<br>
    <span class="difficulty-record">Récord: ${highScore}</span>
  `;
}

updateDifficultyDescription();

playerImgFile.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    player.style.backgroundImage = `url(${url})`;
  }
});

playerImgUrl.addEventListener("input", (e) => {
  const url = e.target.value.trim();
  if (url) {
    player.style.backgroundImage = `url(${url})`;
  }
});

botImgFile.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    bot.style.backgroundImage = `url(${url})`;
  }
});

botImgUrl.addEventListener("input", (e) => {
  const url = e.target.value.trim();
  if (url) {
    bot.style.backgroundImage = `url(${url})`;
  }
});

const keys = new Set();
const controlKeys = new Set([
  "arrowup", "arrowdown", "arrowleft", "arrowright",
  "w", "a", "s", "d"
]);

window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  
  if (e.key === "Enter" || e.key === "Escape") {
    e.preventDefault();
    togglePause();
    return;
  }

  if (gameOver || isPaused) return;
  if (controlKeys.has(k)) e.preventDefault();
  keys.add(k);
});

window.addEventListener("keyup", (e) => {
  const k = e.key.toLowerCase();
  if (controlKeys.has(k)) e.preventDefault();
  keys.delete(k);
});

function resetGame() {
  playerPosition = { x: 100, y: 100 };
  botPosition = { x: 400, y: 400 };
  score = 0;
  scoreElement.textContent = score;
  gameOver = false;
  keys.clear();
  updatePositions();
  coinsContainer.innerHTML = '';
}

function createCoin() {
  if (isPaused || gameOver) return;

  const coin = document.createElement("div");
  coin.classList.add("coin");
  coin.style.left = `${Math.random() * (gameArea.clientWidth - 30)}px`;
  coin.style.top = `${Math.random() * (gameArea.clientHeight - 30)}px`;
  
  coinsContainer.appendChild(coin);

  setTimeout(() => {
    if (coin.parentElement) {
      coin.classList.add("fading");
      setTimeout(() => {
        if (coin.parentElement) {
          coin.remove();
        }
      }, 300);
    }
  }, COIN_LIFETIME);
}

setInterval(createCoin, 2000);

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}

function movePlayer(dt) {
  if (gameOver || isPaused) return;

  let dx = 0, dy = 0;

  if (keys.has("arrowup") || keys.has("w")) dy -= 1;
  if (keys.has("arrowdown") || keys.has("s")) dy += 1;
  if (keys.has("arrowleft") || keys.has("a")) dx -= 1;
  if (keys.has("arrowright") || keys.has("d")) dx += 1;

  if (dx !== 0 || dy !== 0) {
    const len = Math.hypot(dx, dy);
    dx /= len;
    dy /= len;

    playerPosition.x += dx * playerSpeed * dt;
    playerPosition.y += dy * playerSpeed * dt;

    playerPosition.x = clamp(playerPosition.x, 0, gameArea.clientWidth - PLAYER_SIZE);
    playerPosition.y = clamp(playerPosition.y, 0, gameArea.clientHeight - PLAYER_SIZE);
  }
}

function moveBot(dt) {
  if (gameOver || isPaused) return;

  const dx = playerPosition.x - botPosition.x;
  const dy = playerPosition.y - botPosition.y;
  const dist = Math.hypot(dx, dy);

  if (dist > 0.0001) {
    const nx = dx / dist;
    const ny = dy / dist;
    botPosition.x += nx * botSpeed * dt;
    botPosition.y += ny * botSpeed * dt;

    botPosition.x = clamp(botPosition.x, 0, gameArea.clientWidth - BOT_SIZE);
    botPosition.y = clamp(botPosition.y, 0, gameArea.clientHeight - BOT_SIZE);
  }
}

function updatePositions() {
  player.style.transform = `translate(${playerPosition.x}px, ${playerPosition.y}px)`;
  bot.style.transform = `translate(${botPosition.x}px, ${botPosition.y}px)`;
}

function checkCollisions() {
  const playerRect = player.getBoundingClientRect();
  const coins = document.querySelectorAll(".coin");

  coins.forEach((coin) => {
    const coinRect = coin.getBoundingClientRect();

    if (
      playerRect.x < coinRect.x + coinRect.width &&
      playerRect.x + playerRect.width > coinRect.x &&
      playerRect.y < coinRect.y + coinRect.height &&
      playerRect.y + playerRect.height > coinRect.y
    ) {
      const pointsEarned = difficulties[currentDifficulty].points;
      
      coin.remove();
      score += pointsEarned;
      scoreElement.textContent = score;

      if (coinSound) {
        coinSound.currentTime = 0;
        coinSound.play()
        .catch(err => console.log("Error al reproducir sonido:", err));
      }
    }
  });

  const px1 = playerPosition.x, py1 = playerPosition.y;
  const px2 = px1 + PLAYER_SIZE, py2 = py1 + PLAYER_SIZE;
  const bx1 = botPosition.x, by1 = botPosition.y;
  const bx2 = bx1 + BOT_SIZE, by2 = by1 + BOT_SIZE;

  const overlap =
    px1 < bx2 && px2 > bx1 &&
    py1 < by2 && py2 > by1;

  if (overlap) {
    handleGameOver();
  }
}

function handleGameOver() {
  if (isGameOverVisible) { return }
  isGameOverVisible = true;
  gameOver = true;
  
  const highScore = getHighScore(currentDifficulty);
  const isNewRecord = score > highScore;
  console.log(score, highScore, isNewRecord);
    
  const gameOverWrapper = document.querySelector("#gameover-modal .gameover-content");
  const gameoverTitle = document.getElementById("gameover-title");

  const scoreDisplay = document.getElementById("score-display");
  const recordDisplay = document.getElementById("record-display");

  gameOverWrapper.classList.remove("record-notification");
  gameoverTitle.classList.remove("new-record-text");

  if (isNewRecord) {
    saveHighScore(currentDifficulty, score);
    gameOverWrapper.classList.add("record-notification");
    gameoverTitle.classList.add("new-record-text");
    
    gameoverTitle.textContent = "¡NUEVO RÉCORD!";
    scoreDisplay.innerHTML = ``;
    recordDisplay.innerHTML = `Puntuación: ${score}`;

    recordSound.currentTime = 0;
    recordSound.play()
    .catch(err => console.log("Error al reproducir sonido:", err));
  } else {
    gameoverTitle.textContent = "Juego Terminado";
    
    scoreDisplay.innerHTML = `Puntaje: ${score}`;
    recordDisplay.innerHTML = `Anterior Record: ${highScore}`;
  }
  
  updateDifficultyDescription();
  gameoverModal.classList.add("active");
}

continueBtn.addEventListener("click", () => {
  isGameOverVisible = false;
  gameoverModal.classList.remove("active");
  resetGame();
});

function togglePause() {
  if (isGameOverVisible) {
    isGameOverVisible = false;
    gameoverModal.classList.remove("active");
    resetGame();
    return;
  }

  isPaused = !isPaused;
  
  if (isPaused) {
    pauseModal.classList.add("active");
    pauseIcon.src = "assets/PlayIcon.png";
  } else {
    const config = difficulties[currentDifficulty];
    playerSpeed = config.player;
    botSpeed = config.bot;
    
    pauseModal.classList.remove("active");
    pauseIcon.src = "assets/PauseIcon.png";
  }
}

pauseBtn.addEventListener("click", togglePause);
resumeBtn.addEventListener("click", togglePause);

let lastTime = performance.now();
updatePositions();

function gameLoop(now) {
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  movePlayer(dt);
  moveBot(dt);
  updatePositions();
  checkCollisions();

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);