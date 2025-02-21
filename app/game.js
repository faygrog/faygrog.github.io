const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.backgroundColor = 'black';

const backgroundMusic = new Audio('assets/musics/gardens-stylish-chill-303261.mp3');
backgroundMusic.loop = true;

const welcomeBackgroundImage = new Image();
welcomeBackgroundImage.src = 'assets/images/rainbow frog background for 2D web shooting game.png';

const gameBackgroundImage = new Image();
gameBackgroundImage.src = 'assets/images/summer_background_47_a.jpg';

welcomeBackgroundImage.onload = function () {
    const imageX = (canvas.width - welcomeBackgroundImage.width) / 2;
    const imageY = (canvas.height - welcomeBackgroundImage.height) / 2 - 50;
    ctx.drawImage(welcomeBackgroundImage, imageX, imageY);
};

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

const keys = {
    left: false,
    right: false
};

let gameStarted = false;
let gameOver = false;
let gamePaused = false;

class Player {
    constructor() {
        this.width = 50;
        this.height = 50;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 10;
        this.speed = 5;
        this.dx = 0;
        this.image = new Image();
        this.image.src = 'assets/images/for_loyal_human.png'; // Set the player image source
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height); // Draw the player image
    }

    update() {
        this.x += this.dx;
        this.checkBounds();
        this.draw();
    }

    checkBounds() {
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x + this.width > canvas.width) {
            this.x = canvas.width - this.width;
        }
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
const enemies = [];

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

let backgroundY = 0; // Add a variable to track the background's vertical position

function drawBackground(image) {
    const offScreenCanvas = document.createElement('canvas');
    const offScreenCtx = offScreenCanvas.getContext('2d');
    const scale = 0.08; // Adjust the scale to zoom out the background by an additional 5x (1/25 = 0.04)

    offScreenCanvas.width = image.width * scale;
    offScreenCanvas.height = image.height * scale;

    offScreenCtx.drawImage(image, 0, 0, offScreenCanvas.width, offScreenCanvas.height);

    const pattern = ctx.createPattern(offScreenCanvas, 'repeat'); // Create a repeatable pattern
    ctx.fillStyle = pattern;
    ctx.save();
    ctx.translate(0, backgroundY); // Translate the canvas to create the scrolling effect
    ctx.fillRect(0, -canvas.height, canvas.width, canvas.height * 2); // Fill the canvas with the pattern
    ctx.restore();

    backgroundY += 2; // Move the background downward at the same speed as the enemies
    if (backgroundY >= canvas.height) {
        backgroundY = 0; // Reset the background position when it moves off the screen
    }
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

// Remove the autoResume function and its event listener
// function autoResume() {
//     if (gamePaused && gameStarted) {
//         togglePause();
//     }
// }

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
        drawBackground(gameBackgroundImage); // Draw the game background
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
