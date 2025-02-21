window.onload = function () {
    const canvas = document.getElementById('gameCanvas');
    const context = canvas.getContext('2d');

    const bird = {
        x: 50,
        y: 150,
        width: 20,
        height: 20,
        gravity: 0.6,
        lift: -15,
        velocity: 0,
        draw() {
            context.fillStyle = 'yellow';
            context.fillRect(this.x, this.y, this.width, this.height);
        },
        update() {
            this.velocity += this.gravity;
            this.y += this.velocity;
            if (this.y + this.height > canvas.height) {
                this.y = canvas.height - this.height;
                this.velocity = 0;
            }
            if (this.y < 0) {
                this.y = 0;
                this.velocity = 0;
            }
        },
        flap() {
            this.velocity = this.lift;
        }
    };

    let pipes = [];
    const pipeWidth = 30;
    const pipeGap = 100;
    let frameCount = 0;

    function drawPipes() {
        context.fillStyle = 'green';
        pipes.forEach(pipe => {
            context.fillRect(pipe.x, 0, pipeWidth, pipe.top);
            context.fillRect(pipe.x, canvas.height - pipe.bottom, pipeWidth, pipe.bottom);
        });
    }

    function updatePipes() {
        if (frameCount % 90 === 0) {
            const top = Math.random() * (canvas.height - pipeGap);
            const bottom = canvas.height - top - pipeGap;
            pipes.push({ x: canvas.width, top, bottom });
        }
        pipes.forEach(pipe => {
            pipe.x -= 2;
        });
        pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);
    }

    function gameLoop() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        bird.update();
        bird.draw();
        updatePipes();
        drawPipes();
        frameCount++;
        requestAnimationFrame(gameLoop);
    }

    canvas.addEventListener('click', () => {
        bird.flap();
    });

    document.addEventListener('keydown', function (event) {
        if (event.code === 'Space') {
            bird.flap();
        }
    });

    gameLoop();
};
