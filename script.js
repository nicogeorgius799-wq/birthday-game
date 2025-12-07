const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const backgroundMusic = document.getElementById('backgroundMusic');

// NEUE ELEMENTE FÜR GAME OVER SCREEN
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');

// --- BILDDATEIEN (PLATZHALTER) ---
const OBSTACLE_DOG_IMG_SRC = 'Hund.png'; 
const OBSTACLE_TIRE_IMG_SRC = 'Reifen.png'; 
const BACKGROUND_IMG_SRC = 'Straße.png'; 
const GAMEOVER_IMAGE_SRC = 'Nico.png'; // 🌟 WICHTIG: HIER DEN NAMEN IHRES BILDES ANPASSEN! 🌟

// --- KONSTANTEN & VARIABLEN ---
const PLAYER_WIDTH = 20;
const PLAYER_HEIGHT = 40;
const PLAYER_SPEED = 4;
const OBSTACLE_WIDTH = 60;
const OBSTACLE_HEIGHT = 60;
const OBSTACLE_SPEED_INITIAL = 4.5;
const OBSTACLE_SPAWN_RATE = 500;
const HIGHSCORE_REDIRECT = 20;
const REDIRECT_URL = 'deine_zielseite.html'; 
const BIRTHDAY_WORD = "HAMMERSTATT";

let currentLetterIndex = 0; 
let letters = []; 

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
let gameStarted = false;
let obstacleSpeed = OBSTACLE_SPEED_INITIAL;

// Hintergrundbild Logik für unendliches Scrollen
let backgroundImage = new Image();
backgroundImage.src = BACKGROUND_IMG_SRC;
let backgroundY = 0;

// --- STEUERUNG ---
let movingLeft = false;
let movingRight = false;
document.addEventListener('keydown', handleInputStart);
document.addEventListener('keyup', handleInputEnd);
canvas.addEventListener('touchstart', handleInputStart);
canvas.addEventListener('touchend', handleInputEnd);
canvas.addEventListener('mousedown', handleInputStart);
document.addEventListener('mouseup', handleInputEnd); 

// Listener für den Neustart-Button hinzufügen
if (restartButton) {
    restartButton.addEventListener('click', restartGame);
}

function handleInputStart(e) {
    // 1. Spielstart (wird nur einmal ausgeführt)
    if (!gameStarted) {
        gameStarted = true;
        
        // MUSIK STARTET HIER BEIM ERSTEN NUTZER-KLICK/TIPP
        if (backgroundMusic) {
            backgroundMusic.play().catch(error => {
                console.log("Musik-Autoplay fehlgeschlagen, startet mit Klick/Tipp:", error);
            });
        }
        
        // Spiel-Loop starten
        if (backgroundImage.complete) {
            requestAnimationFrame(gameLoop);
        } else {
            backgroundImage.onload = () => requestAnimationFrame(gameLoop);
        }
    } 

    // 2. Steuerung (wird bei jedem Tastendruck/Klick ausgeführt)
    if (e.type.includes('key')) {
        if (e.key === 'ArrowLeft' || e.key === 'a') movingLeft = true;
        if (e.key === 'ArrowRight' || e.key === 'd') movingRight = true;
    } else {
        // Berechne die x-Position des Touchs relativ zum linken Rand des Canvas
        const touchX = e.clientX || (e.touches.length > 0 ? e.touches[0].clientX : 0);
        const canvasRect = canvas.getBoundingClientRect();
        const relativeX = touchX - canvasRect.left;

        // Wenn Tap links von der Mitte des Canvas
        if (relativeX < canvas.width / 2) { 
            movingLeft = true; 
            movingRight = false; 
        } else { 
            // Wenn Tap rechts von der Mitte des Canvas
            movingRight = true; 
            movingLeft = false; 
        }
    }
}


function handleInputEnd(e) {
    // Diese Funktion bleibt fast gleich, wir hören einfach auf uns zu bewegen, wenn wir loslassen
    if (e.type.includes('key')) {
        if (e.key === 'ArrowLeft' || e.key === 'a') movingLeft = false;
        if (e.key === 'ArrowRight' || e.key === 'd') movingRight = false;
    } else {
        // Bei Touch End oder Mouse Up beides stoppen, da wir nicht wissen, welche Seite losgelassen wurde
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
    const type = Math.random() > 0.5 ? 'dog' : 'tire'; 
    const image = new Image();
    image.src = type === 'dog' ? OBSTACLE_DOG_IMG_SRC : OBSTACLE_TIRE_IMG_SRC;

    obstacles.push({ x, y, width: OBSTACLE_WIDTH, height: OBSTACLE_HEIGHT, type, image });
}

function createLetter(char) {
    // Zentral platzieren
    const x = canvas.width / 2;
    const y = -100; 

    // Nur einen Buchstaben erstellen, der sich das Spielfeld hinunterbewegt
    letters = [{ 
        x, 
        y, 
        char,
        width: 40, 
        height: 40
    }];
}

function showGameOverScreen() {
    gameOver = true; // Stellt sicher, dass die GameLoop stoppt
    
    if (backgroundMusic) {
        backgroundMusic.pause(); // Musik stoppen
        backgroundMusic.currentTime = 0; // Musik zurücksetzen
    }

    finalScoreElement.textContent = score; // Aktuellen Score anzeigen
    
    // Sicherstellen, dass das Game Over Bild gesetzt ist (falls es im HTML nicht fest war)
    const gameOverImage = document.getElementById('gameOverImage');
    if (gameOverImage) {
        gameOverImage.src = GAMEOVER_IMAGE_SRC;
    }
    
    gameOverScreen.classList.remove('hidden'); // Game Over Bildschirm anzeigen
}


function restartGame() {
    gameOverScreen.classList.add('hidden'); // Game Over Bildschirm ausblenden

    // Spielvariablen zurücksetzen
    player.x = canvas.width / 2 - PLAYER_WIDTH / 2;
    player.y = canvas.height - PLAYER_HEIGHT - 10;
    player.dx = 0;
    obstacles = [];
    score = 0;
    scoreElement.textContent = score;
    gameOver = false;
    gameStarted = false; // Setze gameStarted zurück, damit handleInputStart wieder neu starten kann
    obstacleSpeed = OBSTACLE_SPEED_INITIAL;
    backgroundY = 0; // Hintergrund zurücksetzen
    currentLetterIndex = 0; // Buchstaben zurücksetzen
    letters = [];

    // Nur den Startbildschirm wieder zeichnen, die GameLoop startet mit dem nächsten Klick/Tipp
    drawStartScreen(); 
}


function updateObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        obs.y += obstacleSpeed;
        
        // Kollisionsprüfung
        if (
            player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y
        ) {
            // Game Over Logik anstelle von reload
            showGameOverScreen();
            return; // Schleife beenden, da das Spiel vorbei ist
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

function updateLetters() {
    if (gameOver || score >= HIGHSCORE_REDIRECT) return;

    // --- A) Starte den nächsten Buchstaben, wenn Array leer ist ---
    if (letters.length === 0) {
        if (currentLetterIndex < BIRTHDAY_WORD.length) {
            // Der Index ist gültig, erstelle den neuen Buchstaben
            createLetter(BIRTHDAY_WORD[currentLetterIndex]);
            currentLetterIndex++; // Gehe sofort zum nächsten Buchstaben
        } else {
            // Das Wort ist fertig, starte von vorne
            currentLetterIndex = 0;
            // Starte den ersten Buchstaben der neuen Runde
            createLetter(BIRTHDAY_WORD[currentLetterIndex]);
            currentLetterIndex++;
        }
    } 
    
    // --- B) Bewege den aktuellen Buchstaben, wenn er existiert ---
    if (letters.length > 0) {
        let letter = letters[0];
        letter.y += obstacleSpeed * 0.75; 
        
        // Prüfung, ob der Buchstabe das untere Ende verlassen hat
        if (letter.y > canvas.height + letter.height) {
            letters = []; // WICHTIG: Leere das Array, damit A) im nächsten Frame den neuen Buchstaben erstellt
        }
    }
}

function drawLetters() {
    ctx.fillStyle = '#ADD8E6'; // Hellblau
    ctx.font = '60px Impact, sans-serif'; // <- Deutlich größer
    ctx.textAlign = 'center';
    
    letters.forEach(letter => {
        // Zeichne den Buchstaben an der zentralen X-Position
        ctx.fillText(letter.char, letter.x, letter.y);
    });
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
    });
}

// Hauptspielschleife & Initialisierung bleiben gleich
function gameLoop() {
    if (gameOver) return;
    drawBackground(); 
    updatePlayer();
    updateObstacles();
    updateLetters();
    drawPlayer();
    drawObstacles();
    drawLetters();
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

