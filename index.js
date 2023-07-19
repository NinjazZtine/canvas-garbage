const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
let running = false;

const Player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
};

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
    constructor(xVel, yVel) {
        this.x = Player.x;
        this.y = Player.y;
        this.xVel = xVel * 5;
        this.yVel = yVel * 5;
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
    constructor(x, y, color, speed) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 2;
        this.xVel = (Math.random() * 8 - 4) * speed / 60;
        this.yVel = (Math.random() * 8 - 4) * speed / 60;
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
    let x;
    let y;
    if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? -10 : canvas.width + 10;
        y = Math.random() * canvas.height;
    } else {
        x = Math.random() * canvas.width;
        y = Math.random() < 0.5 ? -10 : canvas.height + 10;
    }
    const angle = Math.atan2(Player.y - y, Player.x - x);
    const randomVel = Math.random() * 1.2 + .5;
    const xVel = Math.cos(angle) * randomVel;
    const yVel = Math.sin(angle) * randomVel;
    const size = Math.floor(Math.random() * 16 + 5);
    const color = "hsl(" + Math.random() * 361 + "0,100%,50%)";
    enemyArray.push(new Enemy(x, y, xVel, yVel, size, color));
}

function createParticle(x, y, multiplier, color) {
    for (i = 0; i < multiplier; i++) {
        particleArray.push(new Particle(x, y, color, multiplier));
    }
}

function createProjectile(xVel, yVel) {
    projectileArray.push(new Projectile(xVel, yVel));
}

function renderPlayer() {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(Player.x, Player.y, 20, 0, Math.PI * 2);
    ctx.fill();
}

function renderEnemy() {
    for (i = 0; i < enemyArray.length; i++) {
        enemyArray[i].update();
        enemyArray[i].draw();
    }
}

function renderParticle() {
    for (i = 0; i < particleArray.length; i++) {
        particleArray[i].update();
        particleArray[i].draw();
        if (particleArray[i].size <= 0.2) {
            particleArray.splice(i, 1);
            i--;
        }
    }
}

function renderProjectile() {
    for (i = 0; i < projectileArray.length; i++) {
        const projectile = projectileArray[i];
        projectile.update();
        projectile.draw();
        if (checkProjectileBorderCollision(projectile)) {
            projectileArray.splice(i, 1);
            i--;
        }
        projectileEnemyCollision(projectile, i);
    }
}

function projectileEnemyCollision(projectile, i) {
    enemyArray.forEach((enemy, eIndex) => {
        const distance = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
        const radiiSum = enemy.size + projectile.size;
        if (distance <= radiiSum) {
            createParticle(projectile.x, projectile.y, Math.floor(enemy.size * 3), enemy.color);
            enemyArray.splice(eIndex, 1);
            projectileArray.splice(i, 1);
        }
    });
}

function checkProjectileBorderCollision(projectile) {
    if (
        projectile.x >= canvas.width ||
        projectile.x <= 0 ||
        projectile.y >= canvas.height ||
        projectile.y <= 0
    ) {
        return true;
    } else return false;
}

canvas.addEventListener("click", function (ev) {
    const angle = Math.atan2(ev.x - Player.x, ev.y - Player.y);
    const xVel = Math.cos(angle);
    const yVel = Math.sin(angle);
    createProjectile(yVel, xVel);
});

function startEnemySpawnTimeout() {
    if (!running) return;
    setInterval(() => {
        createEnemy();
    }, 100);
}

function startAnimation() {
    running = true;
    updateFrame();
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
    ctx.fillStyle = "hsla(0,0%,0%,0.3)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

startAnimation();
startEnemySpawnTimeout();
