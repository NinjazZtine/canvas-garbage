const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const scoreText = document.getElementById("score");
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
let running = false;

const Player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 20
};

let score = 0;
let enemyArray = [];
let projectileArray = [];
let particleArray = [];

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
        this.xVel = (Math.random() * 8 - 4) * speed / 60 + xVelOffset;
        this.yVel = (Math.random() * 8 - 4) * speed / 60 + yVelOffset;
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
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function createEnemy() {
    const size = Math.floor(Math.random() * 16 + 10);
    
    let x;
    let y;
    if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? -size : canvas.width + size;
        y = Math.random() * canvas.height;
    } else {
        x = Math.random() * canvas.width;
        y = Math.random() < 0.5 ? -size : canvas.height + size;
    }
    
    //const x = Math.random() * canvas.width;
    //const y = -size;
    
    const angle = Math.atan2(Player.y - y, Player.x - x);
    const randomVel = Math.random() * 1.5 + 0.5;
    const xVel = Math.cos(angle) * randomVel;
    const yVel = Math.sin(angle) * randomVel;
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
            enemyArray.splice(i, 1);
        }
    });
}

function projectileEnemyCollision(projectile, i) {
    enemyArray.forEach((enemy, j) => {
        const distance = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
        const radiiSum = enemy.size + projectile.size;
        if (distance <= radiiSum) {
            createParticle(enemy.x, enemy.y, Math.floor(enemy.size * 2), enemy.color, projectile.xVel * 0.3, projectile.yVel * 0.3);
            createParticle(projectile.x, projectile.y, 10, "white", projectile.xVel * 0.4, projectile.yVel * 0.4);
            projectileArray.splice(i, 1);
            if (enemy.size - 7 > 7) {
                 enemy.size -= 7 
                 score += 5;
            } else {
                enemyArray.splice(j, 1);
                score += 15;
            }
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

canvas.addEventListener("click", function (ev) {
    createProjectile(ev.x, ev.y, 5);
});

function gameOver() {
    running = false;
}

function startEnemySpawnTimeout() {
    if (!running) return;
    setInterval(() => {
        createEnemy();
    }, 750);
}

function startGame() {
    running = true;
    updateFrame();
    startEnemySpawnTimeout();
}

function updateFrame() {
    if (!running) return;
    clearCanvas();
    renderPlayer();
    renderEnemy();
    renderParticle();
    renderProjectile();
    requestAnimationFrame(updateFrame);
}

function clearCanvas() {
    ctx.fillStyle = "hsla(0,0%,0%,0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

 startGame();

 