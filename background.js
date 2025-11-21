/* ============================================================
   HEX BACKGROUND — Moves LEFT like DamnBruh
============================================================ */

const hexCanvas = document.getElementById("hexCanvas");
const hexCtx = hexCanvas.getContext("2d");

function resizeHex() {
    hexCanvas.width = window.innerWidth;
    hexCanvas.height = window.innerHeight;
}
resizeHex();
window.addEventListener("resize", resizeHex);

const HEX_SIZE = 28;
const HEX_H = Math.sqrt(3) * HEX_SIZE;
const HEX_W = HEX_SIZE * 2;
const HEX_HDIST = HEX_W * 0.75;

let hexOffset = 0;

function drawHex(x, y) {
    hexCtx.beginPath();
    for (let i = 0; i < 6; i++) {
        const ang = Math.PI / 3 * i;
        const px = x + HEX_SIZE * Math.cos(ang);
        const py = y + HEX_SIZE * Math.sin(ang);

        if (i === 0) hexCtx.moveTo(px, py);
        else hexCtx.lineTo(px, py);
    }
    hexCtx.closePath();
    hexCtx.strokeStyle = "rgba(0,155,255,0.08)";
    hexCtx.stroke();
}

function drawHexGrid(offset) {
    hexCtx.clearRect(0, 0, hexCanvas.width, hexCanvas.height);

    for (let row = -2; row < hexCanvas.height / HEX_H + 4; row++) {
        for (let col = -2; col < hexCanvas.width / HEX_HDIST + 4; col++) {
            const x = col * HEX_HDIST + offset;
            const y = row * HEX_H + (col % 2 === 0 ? 0 : HEX_H / 2);
            drawHex(x, y);
        }
    }
}

function animateHex() {
    hexOffset -= 0.15;
    drawHexGrid(hexOffset);
    requestAnimationFrame(animateHex);
}

animateHex();


/* ============================================================
   SNAKE ENGINE — DamnBruh Accurate Re-Creation
============================================================ */

const snakeCanvas = document.getElementById("snakeCanvas");
const snakeCtx = snakeCanvas.getContext("2d");

function resizeSnake() {
    snakeCanvas.width = window.innerWidth;
    snakeCanvas.height = window.innerHeight;
}
resizeSnake();
window.addEventListener("resize", resizeSnake);

// SAME thickness + spacing as DamnBruh
const SEGMENTS = 22;
const SPACING = 13;
const RADIUS = 13;

// EXACT DamnBruh colors (pulled from screenshots)
const COLORS = [
    "#1ca3ec", // blue
    "#f6cd61", // yellow
    "#d75eb7", // pink/purple
    "#9d87ff"  // lavender
];

function makeSnake(color) {
    let angle = Math.random() * Math.PI * 2;
    let headX = Math.random() * window.innerWidth;
    let headY = Math.random() * window.innerHeight;

    let nodes = [];
    for (let i = 0; i < SEGMENTS; i++) {
        nodes.push({
            x: headX - Math.cos(angle) * SPACING * i,
            y: headY - Math.sin(angle) * SPACING * i
        });
    }

    return {
        nodes,
        angle,
        turnSpeed: 0.012,
        speed: 1.1 + Math.random() * 0.35,
        alive: true,
        color,
        respawnTimer: 0
    };
}

let snakes = COLORS.map(c => makeSnake(c));

function respawnSnake(s) {
    let side = Math.floor(Math.random() * 4);
    let x, y, a;

    if (side === 0) { x = -100; y = Math.random() * window.innerHeight; a = 0; }
    if (side === 1) { x = window.innerWidth + 100; y = Math.random() * window.innerHeight; a = Math.PI; }
    if (side === 2) { x = Math.random() * window.innerWidth; y = -100; a = Math.PI / 2; }
    if (side === 3) { x = Math.random() * window.innerWidth; y = window.innerHeight + 100; a = -Math.PI / 2; }

    s.angle = a;

    s.nodes = [];
    for (let i = 0; i < SEGMENTS; i++) {
        s.nodes.push({
            x: x - Math.cos(a) * SPACING * i,
            y: y - Math.sin(a) * SPACING * i
        });
    }

    s.speed = 1.1 + Math.random() * 0.35;
    s.turnSpeed = 0.012;
    s.alive = true;
}

function updateSnake(s) {
    if (!s.alive) {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) respawnSnake(s);
        return;
    }

    const head = s.nodes[0];

    // DAMNBRUH turning logic
    s.angle += (Math.random() - 0.5) * s.turnSpeed;

    head.x += Math.cos(s.angle) * s.speed;
    head.y += Math.sin(s.angle) * s.speed;

    // Body follows the leader (THIS is the REAL DamnBruh feel)
    for (let i = 1; i < s.nodes.length; i++) {
        const prev = s.nodes[i - 1];
        const node = s.nodes[i];

        const dx = prev.x - node.x;
        const dy = prev.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const diff = dist - SPACING;
        const a = Math.atan2(dy, dx);

        node.x += Math.cos(a) * diff * 0.35;
        node.y += Math.sin(a) * diff * 0.35;
    }

    // DESPAWN on exit
    if (
        head.x < -120 || head.x > window.innerWidth + 120 ||
        head.y < -120 || head.y > window.innerHeight + 120
    ) {
        s.alive = false;
        s.respawnTimer = 50 + Math.random() * 80;
    }
}

function drawSnake(s) {
    if (!s.alive) return;

    for (let i = s.nodes.length - 1; i >= 0; i--) {
        const n = s.nodes[i];

        snakeCtx.beginPath();
        snakeCtx.arc(n.x, n.y, RADIUS, 0, Math.PI * 2);
        snakeCtx.fillStyle = s.color;
        snakeCtx.fill();
    }

    // Eyes
    const h = s.nodes[0];

    snakeCtx.fillStyle = "white";
    snakeCtx.beginPath();
    snakeCtx.arc(h.x + 6, h.y - 6, 5, 0, Math.PI * 2);
    snakeCtx.arc(h.x + 6, h.y + 6, 5, 0, Math.PI * 2);
    snakeCtx.fill();

    snakeCtx.fillStyle = "black";
    snakeCtx.beginPath();
    snakeCtx.arc(h.x + 7, h.y - 6, 2.3, 0, Math.PI * 2);
    snakeCtx.arc(h.x + 7, h.y + 6, 2.3, 0, Math.PI * 2);
    snakeCtx.fill();
}

function animateSnakes() {
    snakeCtx.clearRect(0, 0, snakeCanvas.width, snakeCanvas.height);

    for (let s of snakes) {
        updateSnake(s);
        drawSnake(s);
    }

    requestAnimationFrame(animateSnakes);
}

animateSnakes();
