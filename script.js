const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 400;

// ゲームの状態
let gameRunning = false;
let score = 0;
let highScore = 0;

// プレイヤー
const player = {
    x: 50,
    y: canvas.height - 60,
    width: 50, // 画像のサイズに合わせて調整
    height: 50, // 画像のサイズに合わせて調整
    velocityY: 0,
    gravity: 0.6,
    isJumping: false,
    image: new Image(),
    draw: function() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    },
    jump: function() {
        if (!this.isJumping) {
            this.velocityY = -12;
            this.isJumping = true;
        }
    },
    update: function() {
        this.velocityY += this.gravity;
        this.y += this.velocityY;

        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.velocityY = 0;
            this.isJumping = false;
        }
    }
};

player.image.src = 'creeper.png';

// 障害物
let obstacles = [];

function createObstacle() {
    const obstacleWidth = 20 + Math.random() * 30;
    const obstacleHeight = 20 + Math.random() * 50;
    const obstacle = {
        x: canvas.width,
        y: canvas.height - obstacleHeight,
        width: obstacleWidth,
        height: obstacleHeight,
        speed: 5,
        draw: function() {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        },
        update: function() {
            this.x -= this.speed;
        }
    };
    obstacles.push(obstacle);
}

// 衝突判定
function checkCollision(player, obstacle) {
    return player.x < obstacle.x + obstacle.width &&
           player.x + player.width > obstacle.x &&
           player.y < obstacle.y + obstacle.height &&
           player.y + player.height > obstacle.y;
}

// ゲームの初期化
function initGame() {
    gameRunning = true;
    score = 0;
    obstacles = [];
    player.y = canvas.height - player.height;
    player.velocityY = 0;
    player.isJumping = false;
    gameLoop();
}

// ゲームループ
let lastObstacleTime = 0;
const obstacleInterval = 1500; // 障害物生成間隔 (ms)

function gameLoop(currentTime) {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // プレイヤーの更新と描画
    player.update();
    player.draw();

    // 障害物の生成
    if (currentTime - lastObstacleTime > obstacleInterval) {
        createObstacle();
        lastObstacleTime = currentTime;
    }

    // 障害物の更新と描画、衝突判定
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        obstacle.update();
        obstacle.draw();

        if (checkCollision(player, obstacle)) {
            gameRunning = false;
            if (score > highScore) {
                highScore = score;
            }
            drawGameOver();
            return;
        }

        // 画面外に出た障害物を削除
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(i, 1);
            i--;
            score++;
        }
    }

    // スコアの表示
    drawScore();

    requestAnimationFrame(gameLoop);
}

// スコア表示
function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 25);
    ctx.fillText('High Score: ' + highScore, 10, 50);
}

// ゲームオーバー表示
function drawGameOver() {
    ctx.fillStyle = 'black';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 20);
}

// キーボードイベント
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        if (!gameRunning) {
            initGame();
        } else {
            player.jump();
        }
    }
});

// ゲーム開始時の表示
function drawStartScreen() {
    ctx.fillStyle = 'black';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('避けるゲーム', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText('Press Space to Start', canvas.width / 2, canvas.height / 2 + 20);
}

drawStartScreen();