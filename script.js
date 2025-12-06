const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player = {
    x: 100,
    y: canvas.height - 200,
    w: 80,
    h: 160,
    color: "#ffdb8a" // Haut / blond
};

let obstacles = [];
let gameOver = false;

// Hindernis-Spawner
setInterval(() => {
    obstacles.push({
        x: canvas.width,
        y: canvas.height - 150,
        w: 60,
        h: 120,
        color: "#ff6b6b"
    });
}, 1500);

// Steuerung
let targetY = player.y;

window.addEventListener("mousemove", (e) => {
    targetY = e.clientY;
});

// Game loop
function update() {
    if (gameOver) return;

    // Spieler smooth bewegen
    player.y += (targetY - player.y) * 0.1;

    // Hindernisse bewegen
    obstacles.forEach((o, i) => {
        o.x -= 10;
        if (o.x + o.w < 0) obstacles.splice(i, 1);

        // Kollision
        if (
            player.x < o.x + o.w &&
            player.x + player.w > o.x &&
            player.y < o.y + o.h &&
            player.y + player.h > o.y
        ) {
            gameOver = true;
            setTimeout(() => {
                // NACH GAME OVER → AUF CANVA SEITE
                window.location.href = "DEIN_CANVA_LINK_HIER";
            }, 800);
        }
    });
}

// Render
function draw() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Player (blondes Mädchen)
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.w, player.h);

    // Haare (blond)
    ctx.fillStyle = "#f7e779";
    ctx.fillRect(player.x, player.y - 40, player.w, 50);

    // Hindernisse
    obstacles.forEach((o) => {
        ctx.fillStyle = o.color;
        ctx.fillRect(o.x, o.y, o.w, o.h);
    });
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
