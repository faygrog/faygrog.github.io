const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.backgroundColor = 'black';

const backgroundMusic = new Audio('assets/musics/gardens-stylish-chill-303261.mp3');
backgroundMusic.loop = true;

const backgroundImage = new Image();
backgroundImage.src = 'assets/images/rainbow frog background for 2D web shooting game.png';

backgroundImage.onload = function () {
    const imageX = (canvas.width - backgroundImage.width) / 2;
    const imageY = (canvas.height - backgroundImage.height) / 2 - 50;
    ctx.drawImage(backgroundImage, imageX, imageY);
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
    }

    draw() {
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x, this.y, this.width, this.height);
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
setInterval(spawnEnemy, 2000);
