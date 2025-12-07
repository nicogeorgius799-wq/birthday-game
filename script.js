const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// --- KONSTANTEN: HIER WIRD ES SCHWIERIGER ---
const PLAYER_WIDTH = 20;
const PLAYER_HEIGHT = 40; // Figur ist jetzt größer/menschlicher
const PLAYER_SPEED = 4; // Schneller als vorher (von 3 auf 4)
const OBSTACLE_WIDTH = 30;
const OBSTACLE_HEIGHT = 30;
const OBSTACLE_SPEED_INITIAL = 4; // Startgeschwindigkeit höher (von 3 auf 4)
const OBSTACLE_SPAWN_RATE = 700; // Häufiger spawnen (von 1000ms auf 700ms)
const HIGHSCORE_REDIRECT = 20;
const REDIRECT_URL = 'deine_zielseite.html'; 

let player = {
    x: canvas.width / 2 - PLAYER_WIDTH / 2,
    y: canvas.height - PLAYER_HEIGHT - 10,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    dx: 0 
};

let obstacles = [];
let score = 0;
let gameOver = false;
let gameStarted = false; // Neu: Spiel startet erst nach dem ersten Input
let obstacleSpeed = OBSTACLE_SPEED_INITIAL;

// --- STEUERUNG ---
let movingLeft = false;
let movingRight = false;

document.addEventListener('keydown', handleInputStart);
document.addEventListener('keyup', handleInputEnd);
canvas.addEventListener('touchstart', handleInputStart);
canvas.addEventListener('touchend', handleInputEnd);
canvas.addEventListener('mousedown', handleInputStart);
canvas.addEventListener('mouseup', handleInputEnd);

function handleInputStart(e) {
    if (!gameStarted) {
        gameStarted = true;
        requestAnimationFrame(gameLoop); // Startet die Schleife erst jetzt
    }

    // Existierende Logik zur Richtungsbestimmung beibehalten
    if (e.type.includes('key')) {
        if (e.key === 'ArrowLeft' || e.key === 'a') movingLeft = true;
        if (e.key === 'ArrowRight' || e.key === 'd') movingRight = true;
    } else {
        const touchX = e.clientX || (e.touches.length > 0 ? e.touches[0].clientX : 0);
        const canvasRect = canvas.getBoundingClientRect();
        const relativeX = touchX - canvasRect.left;
        if (relativeX < player.x) { movingLeft = true; movingRight = false; } 
        else if (relativeX > player.x + player.width) { movingRight = true; movingLeft = false; }
    }
}

function handleInputEnd(e) {
    if (e.type.includes('key')) {
        if (e.key === 'ArrowLeft' || e.key === 'a') movingLeft = false;
        if (e.key === 'ArrowRight' || e.key === 'd') movingRight = false;
    } else {
        movingLeft = false;
        movingRight = false;
    }
}


// --- SPIELLOGIK & ZEICHNEN ---

function updatePlayer() {
    if (movingLeft) player.dx = -PLAYER_SPEED;
    else if (movingRight) player.dx = PLAYER_SPEED;
    else player.dx = 0;

    player.x += player.dx;

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

function createObstacle() {
    const x = Math.random() * (canvas.width - OBSTACLE_WIDTH);
    const y = -OBSTACLE_HEIGHT; 
    obstacles.push({ x, y, width: OBSTACLE_WIDTH, height: OBSTACLE_HEIGHT });
}

function updateObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        obs.y += obstacleSpeed;

        // Kollision prüfen
        if (
            player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y
        ) {
            gameOver = true;
            alert('Game Over! Dein Score: ' + score + '. Versuch es noch einmal!');
            document.location.reload(); 
        }

        if (obs.y > canvas.height) {
            obstacles.splice(i, 1);
            i--;
            score++;
            scoreElement.textContent = score;
            if (score % 5 === 0) { obstacleSpeed += 0.5; }
            if (score >= HIGHSCORE_REDIRECT) {
                window.location.href = REDIRECT_URL;
            }
        }
    }
}

// NEUE ZEICHENFUNKTION FÜR DIE PERSONALISIERTE FIGUR
function drawPlayer() {
    // Haarfarbe (Blond)
    ctx.fillStyle = '#FFD700'; 
    ctx.fillRect(player.x, player.y, player.width, player.height / 3); // Oberer Teil (Haare)

    // Gesicht/Kopf
    ctx.fillStyle = '#FAEBD7'; // Hautfarbe
    ctx.fillRect(player.x, player.y + player.height / 3, player.width, player.height / 3);

    // Kleidung (z.B. ein realistisches Blau)
    ctx.fillStyle = '#4682B4'; 
    ctx.fillRect(player.x, player.y + (2 * player.height) / 3, player.width, player.height / 3);

    // Ganz simpel, aber persönlicher als ein grünes Quadrat!
}

function drawObstacles() {
    ctx.fillStyle = '#FF4500'; // Realistischeres, intensives Rot für Gefahr
    obstacles.forEach(obs => {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });
}

// Hauptspielschleife
function gameLoop() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updatePlayer();
    updateObstacles();
    drawPlayer();
    drawObstacles();

    requestAnimationFrame(gameLoop);
}

// Startbildschirm-Nachricht (wird einmalig beim Laden angezeigt)
function drawStartScreen() {
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Tippe/Klicke Links/Rechts', canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText('um dich zu bewegen.', canvas.width / 2, canvas.height / 2);
    ctx.fillText('Erreiche 20 Punkte!', canvas.width / 2, canvas.height / 2 + 30);
}

// Initialisierung: Zeige Startbildschirm, starte Interval, aber pausiere die gameLoop
drawStartScreen();
setInterval(createObstacle, OBSTACLE_SPAWN_RATE);
// gameLoop startet jetzt erst in handleInputStart beim ersten Tippen.
