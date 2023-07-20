const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const statusContainer = document.querySelector(".statusContainer");
const scoreText = document.getElementById("score");
const blastText = document.getElementById("blast");
const uiStart = document.querySelector(".uiStart");
const startButton = document.getElementById("startButton");
const uiGameOver = document.querySelector(".uiGameOver");
const restartButton = document.getElementById("restartButton");
const pointsDisplay = document.getElementById("points");
const blastButton = document.getElementById("blastButton");

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

let running = false;

const Player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 15
};

let score = 0;
let blastCharge = 0;
let enemyArray = [];
let projectileArray = [];
let particleArray = [];

canvas.addEventListener("resize",() => {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
});

class Enemy {
    constructor(x, y, xVel, yVel, size, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.xVel = xVel;
        this.yVel = yVel;
        this.color = color;
    }

    update() {
        this.x += this.xVel;
        this.y += this.yVel;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Projectile {
    constructor(xVel, yVel, speed) {
        this.x = Player.x;
        this.y = Player.y;
        this.xVel = xVel * speed;
        this.yVel = yVel * speed;
        this.size = 3;
    }

    update() {
        this.x += this.xVel;
        this.y += this.yVel;
    }

    draw() {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Particle {
    constructor(x, y, color, speed, xVelOffset, yVelOffset) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 2;
        this.xVel = (Math.random() * 8 - 4) * speed * 0.02 + xVelOffset;
        this.yVel = (Math.random() * 8 - 4) * speed * 0.02 + yVelOffset;
        this.color = color;
    }

    update() {
        this.x += this.xVel;
        this.y += this.yVel;
        this.xVel *= 0.95;
        this.yVel *= 0.95;
        if (this.size > 0.2) this.size -= 0.05;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    }
}

function createEnemy() {
    const size = Math.floor(Math.random() * 16 + 7);
    let x;
    let y;
    if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? -size : canvas.width + size;
        y = Math.random() * canvas.height;
    } else {
        x = Math.random() * canvas.width;
        y = Math.random() < 0.5 ? -size : canvas.height + size;
    }
    const angle = Math.atan2(Player.y - y, Player.x - x);
    const randomVel = Math.random() * 1 + 0.3;
    const xVel = Math.cos(angle) * randomVel;
    const yVel = Math.sin(angle) * randomVel;
    const color = "hsl(" + Math.random() * 361 + "0,100%,50%)";
    enemyArray.push(new Enemy(x, y, xVel, yVel, size, color));
}

function createRandomEnemy() {
    const size = Math.floor(Math.random() * 16 + 7);
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const xVel = Math.random() - 0.5;
    const yVel = Math.random() - 0.5;
    const color = "hsl(" + Math.random() * 361 + "0,100%,50%)";
    enemyArray.push(new Enemy(x, y, xVel, yVel, size, color));
}

function createParticle(x, y, multiplier, color = "white", xVelOffset = 0, yVelOffset = 0) {
    for (i = 0; i < multiplier; i++) {
        particleArray.push(new Particle(x, y, color, multiplier, xVelOffset, yVelOffset));
    }
}

function createProjectile(x, y, speed = 5) {
    const angle = Math.atan2(y - Player.y, x - Player.x);
    const xVel = Math.cos(angle);
    const yVel = Math.sin(angle);
    projectileArray.push(new Projectile(xVel, yVel, speed));
}

function blast(power) {
    for (i = 0; i < power; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        createProjectile(x, y, Math.random() * 1 + 5)
    }
}

function renderPlayer() {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(Player.x, Player.y, Player.size, 0, Math.PI * 2);
    ctx.fill();
    playerEnemyCollision();
}

function renderEnemy() {
    enemyArray.forEach((enemy, i) => {
        enemy.update();
        enemy.draw();
    });
    
}

function renderParticle() {
    particleArray.forEach((particle, i) => {
        particle.update();
        particle.draw();
        if (particle.size <= 0.2) {
            particleArray.splice(i, 1);
            i--;
        }
    });
}

function renderProjectile() {
    projectileArray.forEach((projectile, i) => {
        projectile.update();
        projectile.draw();
        projectileEnemyCollision(projectile, i);
        projectileBorderCollision();
    });
    
}

function playerEnemyCollision() {
    enemyArray.forEach((enemy, i) => {
        const distance = Math.hypot(Player.x - enemy.x, Player.y - enemy.y);
        const radiiSum = enemy.size + Player.size;
        if (distance <= radiiSum) {
            flashCanvas("red");
            createParticle(enemy.x, enemy.y, Math.floor(enemy.size * 3), enemy.color, enemy.xVel * (enemy.size / 5), enemy.yVel * (enemy.size / 5));
            createParticle(enemy.x, enemy.y, Math.floor(enemy.size * 2), "white", enemy.xVel, enemy.yVel);
            enemyArray.splice(i, 1);
            
            if (Player.size > 5) {
                Player.size -= 5;
            } else {
                Player.size = 0;
                destroyAllEnemy();
                createParticle(Player.x, Player.y, 1000, "white");
                setTimeout(function() {
                    gameOver();
                }, 1500);
            }
        }
    });
}

function projectileEnemyCollision(projectile, i) {
    enemyArray.forEach((enemy, j) => {
        const distance = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
        const radiiSum = enemy.size + projectile.size;
        if (distance <= radiiSum) {
            createParticle(enemy.x, enemy.y, Math.floor(enemy.size * 2), enemy.color, projectile.xVel * 0.4, projectile.yVel * 0.4);
            createParticle(projectile.x, projectile.y, Math.floor(enemy.size), "white", projectile.xVel * 0.1, projectile.yVel * 0.1);
            projectileArray.splice(i, 1);
            if (enemy.size - 7 > 7) {
                 enemy.size -= 5;
                 score += 7;
                 blastCharge += 2;
            } else {
                enemyArray.splice(j, 1);
                score += 15;
                blastCharge += 5;
            }
            switch (true) {
                case (blastCharge > 100):
                    blastCharge = 100;
                    blastText.style.color = "lightgreen";
                    break;
                case (blastCharge >= 50):
                    blastText.style.color = "orange";
                    blastButton.style.visibility = "visible";
                    break;
                case (blastCharge < 50):
                    blastText.style.color = "red";
                    blastButton.style.visibility = "hidden";
                    break;
            }
            blastText.innerText = blastCharge;
            scoreText.innerText = score;
        }
    });
}

function projectileBorderCollision() {
    projectileArray.forEach((projectile, i) => {
        if (projectile.x >= canvas.width || projectile.x <= 0 || projectile.y >= canvas.height || projectile.y <= 0) {
        projectileArray.splice(i, 1);
    }
    });
}

function destroyAllEnemy() {
    enemyArray.forEach((enemy, i) => {
        createParticle(enemy.x, enemy.y, Math.floor(enemy.size * 2), enemy.color, enemy.xVel * -0.4, enemy.yVel * -0.4);
    });
    enemyArray = [];
}

function randomEnemy(amount) {
    for (i = 0; i < amount; i++) {
        createRandomEnemy();
    }
}

canvas.addEventListener("click", function (ev) {
    createProjectile(ev.x, ev.y, 5);
});

startButton.addEventListener("click", () => {
    startGame();
});

restartButton.addEventListener("click", () => {
    startGame();
});

blastButton.addEventListener("click", () => {
    blast(blastCharge);
    blastCharge = 0;
    blastText.innerText = blastCharge;
    blastText.style.color = "red";
    setTimeout(() => {
        blastCharge = 0;
        blastText.innerText = blastCharge;
        blastText.style.color = "red";
    }, 800);
});

function startEnemySpawnTimeout() {
    setTimeout(() => {
        if (!running) return;
        createEnemy();
        startEnemySpawnTimeout();
    }, 550);
}

function startGame() {
    running = true;
    resetValues();
    blastText.style.color = "red";
    uiStart.style.visibility = "hidden";
    uiGameOver.style.visibility = "hidden";
    statusContainer.style.visibility = "visible";
    startEnemySpawnTimeout();
    updateFrame();
}

function gameOver() {
    running = false;
    uiGameOver.style.visibility = "visible";
    statusContainer.style.visibility = "hidden";
    pointsDisplay.innerText = score;
    randomEnemy(50);
    updateFrameBackground();
    
}

function updateFrameBackground() {
    if (!running) {
        clearCanvas();
        renderEnemy();
        requestAnimationFrame(updateFrameBackground);
    }
}

function updateFrame() {
    if (running) {
        clearCanvas();
        renderPlayer();
        renderEnemy();
        renderParticle();
        renderProjectile();
        requestAnimationFrame(updateFrame);
    }
}

function clearCanvas() {
    ctx.fillStyle = "hsla(0,0%,0%,0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function flashCanvas(color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function resetValues() {
    enemyArray = [];
    projectileArray = []
    particleArray = [];
    score = 0;
    blastCharge = 0;
    Player.size = 15;
    scoreText.innerText = score;
    blastText.innerText = blastCharge;
}

randomEnemy(50);
updateFrameBackground();
