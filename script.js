const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameOver = false;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }

    obstacles.forEach(o => {
        o.y = canvas.height - o.height;
    });

    if (!gameRunning) {
        if (gameOver) {
            drawGameOver();
        } else {
            drawStartScreen();
        }
    }
}

let gameRunning = false;
let score = 0;
let highScore = 0;

const player = {
    x: 50,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    velocityY: 0,
    gravity: 0.6,
    jumps: 0,
    maxJumps: 2,
    image: new Image(),
    draw: function() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    },
    jump: function() {
        if (this.jumps < this.maxJumps) {
            this.velocityY = -12;
            this.jumps++;
        }
    },
    update: function() {
        this.velocityY += this.gravity;
        this.y += this.velocityY;

        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.velocityY = 0;
            this.jumps = 0;
        }
    }
};

player.image.src = 'creeper.png';

let obstacles = [];

function createObstacle() {
    const obstacleWidth = 20 + Math.random() * 30;
    let obstacleHeight;
    let obstacleColor = 'red';

    if (Math.random() < 0.25 && score > 5) {
        obstacleHeight = 80 + Math.random() * 40;
        obstacleColor = 'purple';
    } else {
        obstacleHeight = 20 + Math.random() * 50;
    }

    const obstacle = {
        x: canvas.width,
        y: canvas.height - obstacleHeight,
        width: obstacleWidth,
        height: obstacleHeight,
        color: obstacleColor,
        speed: 7 + score * 0.05,
        draw: function() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        },
        update: function() {
            this.x -= this.speed;
        }
    };
    obstacles.push(obstacle);
}

function checkCollision(player, obstacle) {
    return player.x < obstacle.x + obstacle.width &&
           player.x + player.width > obstacle.x &&
           player.y < obstacle.y + obstacle.height &&
           player.y + player.height > obstacle.y;
}

function initGame() {
    gameRunning = true;
    gameOver = false;
    score = 0;
    obstacles = [];
    player.y = canvas.height - player.height;
    player.velocityY = 0;
    player.jumps = 0;
    gameLoop();
}

let lastObstacleTime = 0;
const obstacleInterval = 1500;

function gameLoop(currentTime) {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    player.update();
    player.draw();

    if (currentTime - lastObstacleTime > obstacleInterval) {
        createObstacle();
        lastObstacleTime = currentTime;
    }

    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        obstacle.update();
        obstacle.draw();

        if (checkCollision(player, obstacle)) {
            gameRunning = false;
            gameOver = true;
            if (score > highScore) {
                highScore = score;
            }
            drawGameOver();
            return;
        }

        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(i, 1);
            i--;
            score++;
        }
    }

    drawScore();

    requestAnimationFrame(gameLoop);
}

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + score, 10, 25);
    ctx.fillText('High Score: ' + highScore, 10, 50);
}

function drawGameOver() {
    ctx.fillStyle = 'black';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText('Press Space or Tap to Restart', canvas.width / 2, canvas.height / 2 + 20);
}

document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        if (!gameRunning) {
            initGame();
        } else {
            player.jump();
        }
    }
});

canvas.addEventListener('touchstart', function(event) {
    event.preventDefault();
    if (!gameRunning) {
        initGame();
    } else {
        player.jump();
    }
});

function drawStartScreen() {
    ctx.fillStyle = 'black';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('避けるゲーム', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText('Press Space or Tap to Start', canvas.width / 2, canvas.height / 2 + 20);
}

window.addEventListener('resize', resizeCanvas);

resizeCanvas();
drawStartScreen();