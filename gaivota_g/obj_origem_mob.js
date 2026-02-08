
// ======= Configuração base =======
let isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let BASE_WIDTH = 1920;
let BASE_HEIGHT = 1080;

let scale = 1;

// Placar
let placar = document.querySelector("h3") || { textContent: "" };

// Variável global para entrada do usuário
let destino = null;

// ======= Ajuste do canvas =======
function ajustarCanvas() {
    let w = window.innerWidth;
    let h = window.innerHeight;

    let isPortrait = h > w;
    let warning = document.getElementById("rotate-warning");

    if (isMobile && isPortrait) {
        warning.style.display = "flex";
        canvas.style.display = "none";
        return;
    }

    warning.style.display = "none";
    canvas.style.display = "block";

    canvas.width = w;
    canvas.height = h;

    scale = Math.min(w / BASE_WIDTH, h / BASE_HEIGHT);

    bg.rescale();
    bg2.rescale();
    gaivota.rescale();
    gaivota2.rescale();
    peixe.rescale();
}

window.addEventListener("resize", ajustarCanvas);
ajustarCanvas();

// ======= Função degrau =======
function degrau(x) {
    let e = Math.E ** (x * 0.2);
    let k = -((((x * 0.2) - 10) / e) ** 2);
    return (Math.E ** k) * 1.8801;
}

// ======= Factory Function para Objetos =======
function criarObj(imageSrc, baseX, baseY, baseW = 64, baseH = 48) {
    let image = new Image();
    image.src = imageSrc;

    let obj = {
        image,
        baseX,
        baseY,
        baseW,
        baseH,
        position: [baseX, baseY],
        width: baseW,
        height: baseH,
        frame: 1,
        tick: 0,
        pontos: 0,
        velocidade: 0,
        x: 2,

        rescale() {
            this.position[0] = this.baseX * scale;
            this.position[1] = this.baseY * scale;
            this.width = this.baseW * scale;
            this.height = this.baseH * scale;
        },

        drawing(ctx) {
            ctx.drawImage(this.image, this.position[0], this.position[1], this.width, this.height);
        },

        anim(prefix, tickLimit, frames) {
            this.tick++;
            if (this.tick >= tickLimit) {
                this.tick = 0;
                this.frame++;
                if (this.frame > frames) this.frame = 1;
                this.image.src = prefix + this.frame + ".png";
            }
        },

        move(x, y) {
            this.position[0] = x - this.width / 2;
            this.position[1] = y - this.height / 2;
        }
    };

    image.onload = () => obj.rescale();

    return obj;
}

// ======= Movimento do fundo =======
function move_bg(bg, bg2) {
    let step = 1 * scale;
    let limit = 1920 * scale;

    bg.position[0] -= step;
    bg2.position[0] -= step;

    if (bg.position[0] <= -limit) bg.position[0] = limit;
    if (bg2.position[0] <= -limit) bg2.position[0] = limit;
}

// ======= Movimento e colisões dos peixes =======
function move_peixe(peixe, g1, g2) {
    peixe.velocidade = (2 + (g1.pontos + g2.pontos) / (2 * peixe.x)) * scale;

    peixe.position[1] -= peixe.velocidade;

    if (peixe.position[1] <= 0) {
        peixe.position[0] = Math.random() * (BASE_WIDTH * scale);
        peixe.position[1] = 750 * scale;
    }

    let hit = 36 * scale;

    function colisao(g) {
        return (
            g.position[0] > peixe.position[0] - hit &&
            g.position[0] < peixe.position[0] + hit &&
            g.position[1] > peixe.position[1] - hit &&
            g.position[1] < peixe.position[1] + hit
        );
    }

    if (colisao(g1)) {
        peixe.position[0] = Math.random() * (BASE_WIDTH * scale);
        peixe.position[1] = 750 * scale;
        g1.pontos++;
    }

    if (colisao(g2)) {
        peixe.position[0] = Math.random() * (BASE_WIDTH * scale);
        peixe.position[1] = 750 * scale;
        g2.pontos++;
    }

    if (peixe.velocidade >= 15 * scale) peixe.x++;
}

// ======= Objetos =======
let bg = criarObj("img_fundo/fundo2.png", 0, 0, 1920, 1080);
let bg2 = criarObj("img_fundo/fundo2.png", 1920, 0, 1920, 1080);
let gaivota = criarObj("img_gaivota/gaivota1.png", 100, 200, 120, 80);
let gaivota2 = criarObj("img_gaivota2/gaivota1.png", 400, 200, 120, 80);
let peixe = criarObj("img_peixe/peixe1.png", Math.random() * 774, 750, 64, 48);

// ======= Eventos (fora do loop, mas lidos no loop) =======
canvas.addEventListener("mousemove", (e) => {
    destino = { x: e.clientX, y: e.clientY };
});

canvas.addEventListener("touchmove", (e) => {
    let t = e.touches[0];
    destino = { x: t.clientX, y: t.clientY };
    e.preventDefault();
});

// ======= Loop =======
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Reescala sempre
    //bg.rescale();
    //bg2.rescale();
    //gaivota.rescale();
    //gaivota2.rescale();
    //peixe.rescale();

    bg.drawing(ctx);
    bg2.drawing(ctx);
    gaivota.drawing(ctx);
    gaivota2.drawing(ctx);
    peixe.drawing(ctx);

    gaivota.anim("img_gaivota/gaivota", 4, 6);
    gaivota2.anim("img_gaivota2/gaivota", 4, 6);
    peixe.anim("img_peixe/peixe", 6, 6);

    move_bg(bg, bg2);

    // Entrada do usuário lida no loop
    if (destino) {
        gaivota.move(destino.x, destino.y);
    }

   if (peixe.position[1] <= 560 * scale) {
        let fatorX = 0.0015 + (gaivota.pontos + gaivota2.pontos) / 3500;
        let fatorY = 0.0002 + (gaivota.pontos + gaivota2.pontos) / 2000;

        gaivota2.move(
            peixe.position[0] * fatorX + gaivota2.position[0],
            peixe.position[1] * fatorY + gaivota2.position[1]
        );
    }

    move_peixe(peixe, gaivota, gaivota2);

    placar.textContent =
        "Gaivota1: " + gaivota.pontos + " | Gaivota2: " + gaivota2.pontos;

    requestAnimationFrame(gameLoop);
}

// ======= Inicialização =======
function initGame() {
    //bg.rescale();
    //bg2.rescale();
    //gaivota.rescale();
    //gaivota2.rescale();
    //peixe.rescale();

    requestAnimationFrame(gameLoop);
}



initGame();
