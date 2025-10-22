const player = document.getElementById("player");
const bot = document.getElementById("bot");
const gameArea = document.getElementById("game-area");

let playerPosition = {x:100, y: 100};
let botPosition = {x:300, y:300};

const playerSpeed = 40;
const botSpeed = 1;

window.addEventListener('keydown', (event)=> {
    switch (event.key) {
        case 'ArrowUp':
            if (playerPosition.y > 0) playerPosition.y -= playerSpeed;
            break;

        case 'ArrowDown':
            if (playerPosition.y < gameArea.clientHeight - 50) playerPosition.y += playerSpeed;
            break;

        case 'ArrowRight':
            if (playerPosition.x < gameArea.clientWidth - 50) playerPosition.x += playerSpeed; 
            break;

        case 'ArrowLeft':
            if (playerPosition.x > 0) playerPosition.x -= playerSpeed;
            break;
    }

    updatePositions();
})

function moveBot() {
    if(botPosition.x < playerPosition.x) {
        botPosition.x += botSpeed;
    } 
    else if (botPosition.x > playerPosition.x) {
        botPosition.x -= botSpeed;
    }

    if(botPosition.y < playerPosition.y) {
        botPosition.y += botSpeed;
    } 
    else if (botPosition.y > playerPosition.y) {
        botPosition.y -= botSpeed;
    }

    updatePositions();
    checkCollisions();
}

function updatePositions() {
    player.style.transform = `translate(${playerPosition.x}px, ${playerPosition.y}px)`;
    bot.style.transform = `translate(${botPosition.x}px, ${botPosition.y}px)`;
}

function checkCollisions() {
    if (Math.abs(playerPosition.x - botPosition.x) < 50 && Math.abs(playerPosition.y - botPosition.y) < 50) {
        alert("Juego terminado!");

        playerPosition = {x:100, y:100};
        botPosition = {x:300, y:300};
        updatePositions();
    }
}

function gameLoop() {
    moveBot();
    requestAnimationFrame(gameLoop);
}

gameLoop();
