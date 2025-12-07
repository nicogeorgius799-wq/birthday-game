const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// --- BILDDATEIEN (PLATZHALTER) ---
// ERSETZE DIESE DURCH DEINE ECHTEN DATEINAMEN!
const OBSTACLE_DOG_IMG_SRC = 'Hund.png'; // z.B. 'hund.png'
const OBSTACLE_TIRE_IMG_SRC = 'Reifen.png'; // z.B. 'reifen.png'
const BACKGROUND_IMG_SRC = 'Straße.webp'; // z.B. 'strasse.jpg'


// --- KONSTANTEN & VARIABLEN ---
const PLAYER_WIDTH = 20;
const PLAYER_HEIGHT = 40;
const PLAYER_SPEED = 4;
const OBSTACLE_WIDTH = 40;
const OBSTACLE_HEIGHT = 40;
const OBSTACLE_SPEED_INITIAL = 4.5;
const OBSTACLE_SPAWN_RATE = 500;
const HIGHSCORE_REDIRECT = 20;
const REDIRECT_URL = 'deine_zielseite.html'; 

let player = {
    x: canvas.width / 2 - PLAYER_WIDTH / 2,
    y: canvas.height - PLAYER_HEIGHT - 10,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    dx: 0
    // Kein Bildobjekt mehr nötig
};

let obstacles = [];
let score = 0;
let gameOver = false;
let gameStarted = false;
let obstacleSpeed = OBSTACLE_SPEED_INITIAL;

// Hintergrundbild Logik für unendliches Scrollen
let backgroundImage = new Image();
backgroundImage.src = BACKGROUND_IMG_SRC;
let backgroundY = 0;

// --- STEUERUNG (unverändert) ---
let movingLeft = false;
let movingRight = false;
document.addEventListener('keydown', handleInputStart);
document.addEventListener('keyup', handleInputEnd);
canvas.addEventListener('touchstart', handleInputStart);
canvas.addEventListener('touchend', handleInputEnd);
canvas.addEventListener('mousedown', handleInputStart);
document.addEventListener('mouseup', handleInputEnd); // 'document' statt 'canvas' für besseres Handy-Handling

function handleInputStart(e) {
    if (!gameStarted) {
        gameStarted = true;
        
        // NEUE LOGIK: Prüfe, ob das Bild schon geladen ist
        if (backgroundImage.complete) {
            requestAnimationFrame(gameLoop); // Starte sofort
        } else {
            // Sonst warte auf den Lade-Event
            backgroundImage.onload = () => requestAnimationFrame(gameLoop);
        }
    }

    // Existierende Logik zur Richtungsbestimmung beibehalten
    if (e.type.includes('key')) {
        if (e.key === 'ArrowLeft' || e.key === 'a') movingLeft = true;
        if (e.key === 'ArrowRight' || e.key === 'd') movingRight = true;
    } else {
        const touchX = e.clientX || (e.touches.length > 0 ? e.touches.clientX : 0);
        const canvasRect = canvas.getBoundingClientRect();
        const relativeX = touchX - canvasRect.left;
        if (relativeX < player.x + player.width / 2) { 
            movingLeft = true; 
            movingRight = false; 
        } else { 
            movingRight = true; 
            movingLeft = false; 
        }
    }
}

function handleInputEnd(e) {
    // ... (Logik wie in V3) ...
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
    // ... (Logik wie in V3) ...
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
    const type = Math.random() > 0.5 ? 'dog' : 'tire'; 
    const image = new Image();
    image.src = type === 'dog' ? OBSTACLE_DOG_IMG_SRC : OBSTACLE_TIRE_IMG_SRC;

    obstacles.push({ x, y, width: OBSTACLE_WIDTH, height: OBSTACLE_HEIGHT, type, image });
    // Secret Logik
    if (Math.random() < 0.1) { 
        obstacles[obstacles.length - 1].secret = "Hammerstatt";
    }
}

function updateObstacles() {
    // ... (Logik wie in V3) ...
    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        obs.y += obstacleSpeed;
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

function drawBackground() {
    // Zeichne das Bild zweimal für den Scrolling-Effekt
    ctx.drawImage(backgroundImage, 0, backgroundY, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, backgroundY - canvas.height, canvas.width, canvas.height);
    backgroundY += obstacleSpeed * 0.5;
    if (backgroundY >= canvas.height) {
        backgroundY = 0;
    }
}

// SPIELER WIRD WIEDER GEZEICHNET (Version V2 Logik)
function drawPlayer() {
    // Haarfarbe (Blond)
    ctx.fillStyle = '#FFD700'; 
    ctx.fillRect(player.x, player.y, player.width, player.height / 3); 

    // Gesicht/Kopf
    ctx.fillStyle = '#FAEBD7'; // Hautfarbe
    ctx.fillRect(player.x, player.y + player.height / 3, player.width, player.height / 3);

    // Kleidung (z.B. ein schickes Kleid)
    ctx.fillStyle = '#C71585'; // MediumVioletRed
    ctx.fillRect(player.x, player.y + (2 * player.height) / 3, player.width, player.height / 3);
}

function drawObstacles() {
    obstacles.forEach(obs => {
        // Zeichne das Hindernis-Bild
        ctx.drawImage(obs.image, obs.x, obs.y, obs.width, obs.height);
        
        // Zeichne das Secret "Hammerstatt", falls vorhanden
        if (obs.secret === "Hammerstatt") {
            ctx.fillStyle = 'yellow';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Hammerstatt', obs.x + obs.width / 2, obs.y - 5);
        }
    });
}

// Hauptspielschleife & Initialisierung bleiben gleich
function gameLoop() {
    if (gameOver) return;
    drawBackground(); 
    updatePlayer();
    updateObstacles();
    drawPlayer();
    drawObstacles();
    requestAnimationFrame(gameLoop);
}

function drawStartScreen() {
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Tippe/Klicke Links/Rechts', canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText('um dich zu bewegen.', canvas.width / 2, canvas.height / 2);
    ctx.fillText('Erreiche 20 Punkte!', canvas.width / 2, canvas.height / 2 + 30);
}

drawStartScreen();
setInterval(createObstacle, OBSTACLE_SPAWN_RATE);


