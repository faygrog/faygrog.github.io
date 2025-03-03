// Setup canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.backgroundColor = 'black';

// Define cacheBust variable
const cacheBust = Date.now();

// Resource URLs
const resources = {
    backgroundMusic: 'app/assets/musics/gardens-stylish-chill-303261.mp3',
    welcomeBackgroundImage: 'app/assets/images/rainbow frog background for 2D web shooting game.png',
    gameBackgroundImage: 'app/assets/images/2111.w032.n003.211B.p1.211.jpg',
    playerImage: 'app/assets/images/a_simple_and_cute_cartoon_frog_with_large_white_eyeballs_on_a_white_background-removebg-preview.png',
    enemyImage: 'app/assets/images/cartoon_garter_snake_entity_with_transparent_background_and_white_background_for_web_game-removebg-preview.png',
    deadPlayerImage: 'app/assets/images/A_frog_looking_dead__passed_out__with_a_white_background__in_a_simple_art_style-removebg-preview.png'
};

// Add cacheBust to resource URLs
function cacheBustUrl(url) {
    return `${url}?v=${cacheBust}`;
}
Object.keys(resources).forEach(key => {
    resources[key] = cacheBustUrl(resources[key]);
});

// Load assets
const backgroundMusic = new Audio(resources.backgroundMusic);
backgroundMusic.loop = true;

const welcomeBackgroundImage = new Image();
welcomeBackgroundImage.src = resources.welcomeBackgroundImage;

const gameBackgroundImage = new Image();
gameBackgroundImage.src = resources.gameBackgroundImage;

const playerImage = new Image();
playerImage.src = resources.playerImage;

const enemyImage = new Image();
enemyImage.src = resources.enemyImage;

const deadPlayerImage = new Image();
deadPlayerImage.src = resources.deadPlayerImage;

// Game state variables
let gameStarted = false;
let gameOver = false;
let gamePaused = false;
let backgroundY = 0;
let backgroundPatternCanvas;
const keys = { left: false, right: false };
const enemies = [];

// Setup UI elements
const startButton = document.getElementById('startButton');
const pauseButton = document.createElement('button');
pauseButton.id = 'pauseButton';
pauseButton.innerText = 'Pause';
pauseButton.style.display = 'none';
document.body.appendChild(pauseButton);

const pauseScreen = document.createElement('div');
pauseScreen.className = 'pause-screen';
pauseScreen.innerText = 'Paused';
document.body.appendChild(pauseScreen);

const endGameScreen = document.createElement('div');
endGameScreen.className = 'end-game-screen';
endGameScreen.innerText = 'Game Over! Click to Restart';
document.body.appendChild(endGameScreen);

const fullScreenButton = document.getElementById('fullScreenButton');
fullScreenButton.addEventListener('click', toggleFullScreen);

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
            resizeCanvas();
            redrawCurrentScreen();
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen().then(() => {
                resizeCanvas();
                redrawCurrentScreen();
            });
        }
    }
}

function resizeCanvas() {
    const size = Math.min(window.innerWidth, window.innerHeight);
    canvas.width = size;
    canvas.height = size;
}

function redrawCurrentScreen() {
    clear();
    if (!gameStarted) {
        drawWelcomeBackground();
    } else if (gameOver) {
        drawBackground();
        player.draw();
        enemies.forEach(enemy => enemy.draw());
        endGameScreen.style.display = 'block';
    } else {
        drawBackground();
        player.draw();
        enemies.forEach(enemy => enemy.draw());
    }
}

function setupEventListeners() {
    endGameScreen.addEventListener('click', () => {
        document.location.reload();
    });

    pauseButton.addEventListener('click', togglePause);

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
}

setupEventListeners();

// Player class
class Player {
    constructor() {
        this.width = 50;
        this.height = 50;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 10;
        this.speed = 5;
        this.dx = 0;
        this.isDead = false; // Add a flag to check if the player is dead
    }

    draw() {
        if (this.isDead) {
            ctx.drawImage(deadPlayerImage, this.x, this.y, this.width, this.height);
        } else {
            ctx.drawImage(playerImage, this.x, this.y, this.width, this.height);
        }
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
        this.y = -this.height; // Spawn off-screen
        this.speed = 2;
    }

    draw() {
        ctx.drawImage(enemyImage, this.x, this.y, this.width, this.height);
    }

    update() {
        this.y += this.speed;
        this.draw();
    }
}

const player = new Player();

// Setup background
function createBackgroundPattern() {
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
}

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
        rect1.y + rect2.height > rect2.y
    );
}

function endGame() {
    if (!gameOver) {
        gameOver = true;
        backgroundMusic.pause();
        player.isDead = true; // Set the player to dead

        // Clear the canvas and redraw everything with the dead frog
        clear();
        drawBackground();
        player.draw();
        enemies.forEach(enemy => enemy.draw());

        // Display the game over screen
        endGameScreen.style.display = 'block';
        pauseButton.style.display = 'none';
    }
}

function togglePause() {
    if (gameOver) return;
    gamePaused = !gamePaused;
    if (gamePaused) {
        backgroundMusic.pause();
        pauseButton.innerText = 'Resume';
        pauseScreen.style.display = 'block';
    } else {
        backgroundMusic.play();
        pauseButton.innerText = 'Pause';
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
    if (!gameStarted) {
        gameStarted = true;
        backgroundMusic.play();
        update();
        startButton.style.display = 'none';
        pauseButton.style.display = 'block';
        clear();
    }
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

window.addEventListener('blur', autoPause);
setInterval(spawnEnemy, 2000);

// Preload resources and hide the loading screen when done
const loadingScreen = document.getElementById('loadingScreen');
const progressBar = document.getElementById('progressBar');
let resourcesLoaded = 0;
const totalResources = 5;

function updateProgressBar() {
    const progress = (resourcesLoaded / totalResources) * 100;
    progressBar.style.width = `${progress}%`;
}

function resourceLoaded() {
    resourcesLoaded++;
    updateProgressBar();
    if (resourcesLoaded === totalResources) {
        loadingScreen.style.display = 'none';
        drawWelcomeBackground();
        createBackgroundPattern();
        startButton.style.display = 'block'; // Show the start button after resources are loaded
    }
}

backgroundMusic.addEventListener('canplaythrough', resourceLoaded, false);
welcomeBackgroundImage.onload = resourceLoaded;
gameBackgroundImage.onload = resourceLoaded;
playerImage.onload = resourceLoaded;
enemyImage.onload = resourceLoaded;
deadPlayerImage.onload = resourceLoaded;

window.addEventListener('resize', () => {
    resizeCanvas();
    redrawCurrentScreen();
});
