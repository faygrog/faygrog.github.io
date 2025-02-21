const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.backgroundColor = 'black'; // Add this line to set a background color

const backgroundMusic = new Audio('assets/musics/gardens-stylish-chill-303261.mp3'); // Update the path to the new mp3 file
backgroundMusic.loop = true;

const startButton = document.createElement('button');
startButton.innerText = 'Press Enter to Start';
startButton.style.position = 'absolute';
startButton.style.top = '50%';
startButton.style.left = '50%';
startButton.style.transform = 'translate(-50%, -50%)';
document.body.appendChild(startButton);

const pauseScreen = document.createElement('div');
pauseScreen.innerText = 'Paused';
pauseScreen.style.position = 'absolute';
pauseScreen.style.top = '50%';
pauseScreen.style.left = '50%';
pauseScreen.style.transform = 'translate(-50%, -50%)';
pauseScreen.style.color = 'white';
pauseScreen.style.fontSize = '30px';
pauseScreen.style.display = 'none';
document.body.appendChild(pauseScreen);

const keys = {
    left: false,
    right: false
};

function startGame() {
    backgroundMusic.play();
    update(); // Start the game loop
    startButton.style.display = 'none'; // Hide the start button
}

startButton.addEventListener('click', startGame);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        startGame();
    }
});

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

        // Wall detection
        if (this.x < 0) {
            this.x = 0;
        }

        if (this.x + this.width > canvas.width) {
            this.x = canvas.width - this.width;
        }

        this.draw();
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
        alert('Game Over!');
        document.location.reload();
    }
}

function togglePause() {
    if (gamePaused) {
        gamePaused = false;
        backgroundMusic.play();
        pauseScreen.style.display = 'none';
        update();
    } else {
        gamePaused = true;
        backgroundMusic.pause();
        pauseScreen.style.display = 'block';
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        togglePause();
    }
    if (e.key === 'Enter') {
        startGame();
    }
});

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
    const enemy = new Enemy();
    enemies.push(enemy);
}

setInterval(spawnEnemy, 2000); // Spawn an enemy every 2 seconds

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

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);
