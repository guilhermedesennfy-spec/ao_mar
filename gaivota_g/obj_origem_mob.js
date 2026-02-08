// ======= Configuração base =======
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;

let scale = 1;

// Placar
const placar = document.querySelector("h3") || { textContent: "" };

// ======= Ajuste do canvas =======
function ajustarCanvas() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.width = w;
    canvas.height = h;

    scale = Math.min(w / BASE_WIDTH, h / BASE_HEIGHT);
}
window.addEventListener("resize", ajustarCanvas);
ajustarCanvas();

// ======= Função degrau =======
function degrau(x) {
    const e = Math.E ** (x * 0.2);
    const k = -((((x * 0.2) - 10) / e) ** 2);
    return (Math.E ** k) * 1.8801;
}

// ======= Construtor Obj =======
function Obj(imageSrc, baseX, baseY, baseW = 64, baseH = 48) {
    this.image = new Image();
    this.image.src = imageSrc;

    this.baseX = baseX;
    this.baseY = baseY;
    this.baseW = baseW;
    this.baseH = baseH;

    this.position = [baseX, baseY];
    this.width = baseW;
    this.height = baseH;

    this.frame = 1;
    this.tick = 0;
    this.pontos = 0;
    this.velocidade = 0;
    this.x = 2;

    this.rescale = function () {
        this.position[0] = this.baseX * scale;
        this.position[1] = this.baseY * scale;
        this.width = this.baseW * scale;
        this.height = this.baseH * scale;
    };

    this.drawing = function (ctx) {
        ctx.drawImage(this.image, this.position[0], this.position[1], this.width, this.height);
    };

    this.anim = function (imgPrefix, tickLimit, frames) {
        this.tick++;
        if (this.tick >= tickLimit) {
            this.tick = 0;
            this.frame++;
            if (this.frame > frames) this.frame = 1;
            this.image.src = imgPrefix + this.frame + ".png";
        }
    };

    this.move_gaivota = function (x, y) {
        this.position[0] = x - this.width / 2;
        this.position[1] = y - this.height / 2;
    };

    this.move_gaivota2 = function (x, y) {
        this.position[0] = x - this.width / 2;
        this.position[1] = y - this.height / 2;
    };
}

// ======= Movimento do fundo =======
function move_bg(bg, bg2) {
    const step = 1 * scale;
    const limit = 1920 * scale;

    bg.position[0] -= step;
    bg2.position[0] -= step;

    if (bg.position[0] <= -limit) bg.position[0] = limit;
    if (bg2.position[0] <= -limit) bg2.position[0] = limit;
}

// ======= Movimento e colisões dos peixes =======
function move_peixe(peixe, gaivota, gaivota2) {
    peixe.velocidade = (2 + (gaivota.pontos + gaivota2.pontos) / (2 * peixe.x)) * scale;

    peixe.position[1] -= peixe.velocidade;

    if (peixe.position[1] <= 0) {
        peixe.position[0] = Math.random() * (BASE_WIDTH * scale);
        peixe.position[1] = 750 * scale;
    }

    const hit = 36 * scale;

    function colisao(g) {
        return (
            g.position[0] > peixe.position[0] - hit &&
            g.position[0] < peixe.position[0] + hit &&
            g.position[1] > peixe.position[1] - hit &&
            g.position[1] < peixe.position[1] + hit
        );
    }

    if (colisao(gaivota)) {
        peixe.position[0] = Math.random() * (BASE_WIDTH * scale);
        peixe.position[1] = 750 * scale;
        gaivota.pontos++;
    }

    if (colisao(gaivota2)) {
        peixe.position[0] = Math.random() * (BASE_WIDTH * scale);
        peixe.position[1] = 750 * scale;
        gaivota2.pontos++;
    }

    if (peixe.velocidade >= 15 * scale) peixe.x++;
}

// ======= Objetos =======
const bg = new Obj("img_fundo/fundo2.png", 0, 0, 1920, 1080);
const bg2 = new Obj("img_fundo/fundo2.png", 1920, 0, 1920, 1080);
const gaivota = new Obj("img_gaivota/gaivota1.png", 100, 200, 120, 80);
const gaivota2 = new Obj("img_gaivota2/gaivota1.png", 400, 200, 120, 80);
const peixe = new Obj("img_peixe/peixe1.png", Math.random() * 774, 750, 64, 48);

// ======= Entrada do usuário =======
let destino = null;

canvas.addEventListener("mousemove", (e) => {
    destino = { x: e.clientX, y: e.clientY };
});

canvas.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    destino = { x: t.clientX, y: t.clientY };
    e.preventDefault();
});

// ======= Loop =======
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    bg.drawing(ctx);
    bg2.drawing(ctx);

    if (destino) {
        gaivota.move_gaivota(destino.x, destino.y);
    }

    if (peixe.position[1] <= 560 * scale) {
        const fatorX = 0.0015 + (gaivota.pontos + gaivota2.pontos) / 3500;
        const fatorY = 0.0002 + (gaivota.pontos + gaivota2.pontos) / 2000;

        gaivota2.move_gaivota2(
            peixe.position[0] * fatorX + gaivota2.position[0],
            peixe.position[1] * fatorY + gaivota2.position[1]
        );
    }

    gaivota.drawing(ctx);
    gaivota2.drawing(ctx);
    peixe.drawing(ctx);

    gaivota.anim("img_gaivota/gaivota", 4, 6);
    gaivota2.anim("img_gaivota2/gaivota", 4, 6);
    peixe.anim("img_peixe/peixe", 6, 6);

    move_bg(bg, bg2);
    move_peixe(peixe, gaivota, gaivota2);

    placar.textContent =
        "Gaivota1: " + gaivota.pontos + " | Gaivota2: " + gaivota2.pontos;

    requestAnimationFrame(gameLoop);
}

// ======= Inicialização =======
function initGame() {
    bg.rescale();
    bg2.rescale();
    gaivota.rescale();
    gaivota2.rescale();
    peixe.rescale();

    requestAnimationFrame(gameLoop);
}
initGame();
