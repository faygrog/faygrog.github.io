// Setup canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.backgroundColor = 'black';

// Load assets
const backgroundMusic = new Audio('assets/musics/gardens-stylish-chill-303261.mp3');
backgroundMusic.loop = true;

const welcomeBackgroundImage = new Image();
welcomeBackgroundImage.src = 'assets/images/rainbow frog background for 2D web shooting game.png';

const gameBackgroundImage = new Image();
gameBackgroundImage.src = 'assets/images/2111.w032.n003.211B.p1.211.jpg';

const playerImage = new Image();
playerImage.src = 'assets/images/for_loyal_guest.png';

// Game state variables
let gameStarted = false;
let gameOver = false;
let gamePaused = false;
let backgroundY = 0;
let backgroundPatternCanvas;
const keys = { left: false, right: false };
const enemies = [];

// Setup UI elements
const startButton = document.createElement('button');
startButton.innerText = 'Press Enter to Start';
document.body.appendChild(startButton);

const pauseScreen = document.createElement('div');
pauseScreen.className = 'pause-screen';
pauseScreen.innerText = 'Paused';
document.body.appendChild(pauseScreen);

const endGameScreen = document.createElement('div');
endGameScreen.className = 'end-game-screen';
endGameScreen.innerText = 'Game Over! Click to Restart';
document.body.appendChild(endGameScreen);

endGameScreen.addEventListener('click', () => {
    document.location.reload();
});

// Player class
class Player {
    constructor() {
        this.width = 50;
        this.height = 50;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 10;
        this.speed = 5;
        this.dx = 0;
    }

    draw() {
        ctx.drawImage(playerImage, this.x, this.y, this.width, this.height);
    }

    update() {
        this.x += this.dx;
        this.checkBounds();
        this.draw();
    }

    checkBounds() {
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
    }

    moveLeft() {
        this.dx = -this.speed;
    }

    moveRight() {
        this.dx = this.speed;
    }

    stop() {
        this.dx = 0;
    }
}

// Enemy class
class Enemy {
    constructor() {
        this.width = 50;
        this.height = 50;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = 0;
        this.speed = 2;
    }

    draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y += this.speed;
        this.draw();
    }
}

const player = new Player();

// Setup background
gameBackgroundImage.onload = function () {
    const offScreenCanvas = document.createElement('canvas');
    const offScreenCtx = offScreenCanvas.getContext('2d');
    const scale = 0.08;
    const textureWidth = gameBackgroundImage.width / 3;

    offScreenCanvas.width = textureWidth * scale;
    offScreenCanvas.height = gameBackgroundImage.height * scale;

    offScreenCtx.drawImage(gameBackgroundImage, 0, 0, textureWidth, gameBackgroundImage.height, 0, 0, offScreenCanvas.width, offScreenCanvas.height);

    backgroundPatternCanvas = document.createElement('canvas');
    backgroundPatternCanvas.width = canvas.width;
    backgroundPatternCanvas.height = canvas.height * 2;
    const patternCtx = backgroundPatternCanvas.getContext('2d');
    patternCtx.fillStyle = patternCtx.createPattern(offScreenCanvas, 'repeat');
    patternCtx.fillRect(0, 0, backgroundPatternCanvas.width, backgroundPatternCanvas.height);
};

function drawBackground() {
    if (!backgroundPatternCanvas) return;

    ctx.drawImage(backgroundPatternCanvas, 0, backgroundY - canvas.height);
    ctx.drawImage(backgroundPatternCanvas, 0, backgroundY);

    backgroundY += 2;
    if (backgroundY >= canvas.height) {
        backgroundY = 0;
    }
}

function drawWelcomeBackground() {
    const imageX = (canvas.width - welcomeBackgroundImage.width) / 2;
    const imageY = (canvas.height - welcomeBackgroundImage.height) / 2 - 50;
    ctx.drawImage(welcomeBackgroundImage, imageX, imageY);
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

function endGame() {
    if (!gameOver) {
        gameOver = true;
        backgroundMusic.pause();
        endGameScreen.style.display = 'block';
    }
}

function togglePause() {
    if (gameOver) return;
    gamePaused = !gamePaused;
    if (gamePaused) {
        backgroundMusic.pause();
        pauseScreen.style.display = 'block';
    } else {
        backgroundMusic.play();
        pauseScreen.style.display = 'none';
        update();
    }
}

function autoPause() {
    if (!gamePaused && gameStarted) {
        togglePause();
    }
}

function startGame() {
    gameStarted = true;
    backgroundMusic.play();
    update();
    startButton.style.display = 'none';
    clear();
}

function update() {
    if (!gameOver && !gamePaused) {
        clear();
        drawBackground();
        handleInput();
        player.update();
        enemies.forEach(enemy => {
            enemy.update();
            if (checkCollision(player, enemy)) {
                endGame();
            }
        });
        requestAnimationFrame(update);
    }
}

function handleInput() {
    if (keys.left) {
        player.moveLeft();
    } else if (keys.right) {
        player.moveRight();
    } else {
        player.stop();
    }
}

function spawnEnemy() {
    if (gameStarted && !gamePaused) {
        const enemy = new Enemy();
        enemies.push(enemy);
    }
}

function keyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right' || e.key === 'd' || e.key === 'D') {
        keys.right = true;
    } else if (e.key === 'ArrowLeft' || e.key === 'Left' || e.key === 'a' || e.key === 'A') {
        keys.left = true;
    }
}

function keyUp(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right' || e.key === 'd' || e.key === 'D') {
        keys.right = false;
    } else if (e.key === 'ArrowLeft' || e.key === 'Left' || e.key === 'a' || e.key === 'A') {
        keys.left = false;
    }
}

startButton.addEventListener('click', startGame);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        startGame();
    }
    if (e.key === 'Escape') {
        togglePause();
    }
});
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);
window.addEventListener('blur', autoPause);
setInterval(spawnEnemy, 2000);

// Draw the welcome background image when the page loads
welcomeBackgroundImage.onload = drawWelcomeBackground;
