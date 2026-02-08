// ======= CONFIGURAÇÃO =======
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const placar = document.getElementById("placar");

let W = window.innerWidth;
let H = window.innerHeight;

canvas.width = W;
canvas.height = H;

let destino = { x: W / 2, y: H / 2 };

function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    // Atualiza dimensões dos fundos (se já existirem)
    if (bg) { bg.w = W; bg.h = H; }
    if (bg2) { bg2.w = W; bg2.h = H; bg2.x = W; }
}
window.addEventListener("resize", resize);

// ======= FUNÇÃO DEGRAU (VERSÃO ESTÁVEL) =======
function degrau(x) {
    // fórmula original preservada, com proteção contra overflow
    let e = Math.E ** (x * 0.2);
    let k = -((((x * 0.2) - 10) / e) ** 2);
    let d = Math.E ** k * 1.8801;

    //  LIMITADOR SEGURO (mantém comportamento original, mas evita explosões)
    if (!isFinite(d)) d = 0;
    d = Math.min(d, 1.5);   // limite máximo recomendado
    d = Math.max(d, 0);     // evita valores negativos

    return d;
}


// ======= OBJETO =======
function Obj(img, x, y, w, h) {
    const image = new Image();
    image.src = img;

    return {
        image,
        x, y, w, h,
        frame: 1,
        tick: 0,
        pontos: 0,
        speed: 2,

        draw() {
            ctx.drawImage(this.image, this.x, this.y, this.w, this.h);
        },

        anim(prefix, tickLimit, frames) {
            this.tick++;
            if (this.tick >= tickLimit) {
                this.tick = 0;
                this.frame++;
                if (this.frame > frames) this.frame = 1;
                const newSrc = prefix + this.frame + ".png";
                if (this.image.src.indexOf(newSrc) === -1) {
                    this.image.src = newSrc;
                }
            }
        }
    };
}

// ======= OBJETOS =======
let bg = Obj("img_fundo/fundo2.png", 0, 0, W, H);
let bg2 = Obj("img_fundo/fundo2.png", W, 0, W, H);

let gaivota = Obj("img_gaivota/gaivota1.png", 100, 200, 120, 80);
let gaivota2 = Obj("img_gaivota2/gaivota1.png", 400, 200, 120, 80);

let peixe = Obj("img_peixe/peixe1.png", Math.random() * W, H - 100, 64, 48);

// ======= CONTROLES =======
canvas.addEventListener("mousemove", e => {
    destino.x = e.clientX;
    destino.y = e.clientY;
});

canvas.addEventListener("touchmove", e => {
    let t = e.touches[0];
    destino.x = t.clientX;
    destino.y = t.clientY;
    e.preventDefault();
});

// ======= FUNDO =======
function move_bg() {
    bg.x -= 1;
    bg2.x -= 1;

    if (bg.x <= -W) bg.x = W;
    if (bg2.x <= -W) bg2.x = W;
}

// ======= PEIXE =======
function move_peixe() {
    // velocidade baseada em pontos, sem dependência recursiva
    const baseSpeed = 2;
    const somaPontos = gaivota.pontos + gaivota2.pontos;
    const incremento = Math.min(somaPontos * 0.05, 4); // incremento limitado
    peixe.speed = baseSpeed + incremento;

    peixe.y -= peixe.speed;

    if (peixe.y < -50) {
        peixe.x = Math.random() * (W - peixe.w);
        peixe.y = H - 100;
    }

    // colisões usando centros
    const peixeCx = peixe.x + peixe.w / 2;
    const peixeCy = peixe.y + peixe.h / 2;
    const g1Cx = gaivota.x + gaivota.w / 2;
    const g1Cy = gaivota.y + gaivota.h / 2;
    const g2Cx = gaivota2.x + gaivota2.w / 2;
    const g2Cy = gaivota2.y + gaivota2.h / 2;

    const colisaoRaio = 50; // ajuste fino conforme sprites

    // colisão gaivota1
    if (Math.hypot(g1Cx - peixeCx, g1Cy - peixeCy) < colisaoRaio) {
        peixe.x = Math.random() * (W - peixe.w);
        peixe.y = H - 100;
        gaivota.pontos++;
    }

    // colisão gaivota2
    if (Math.hypot(g2Cx - peixeCx, g2Cy - peixeCy) < colisaoRaio) {
        peixe.x = Math.random() * (W - peixe.w);
        peixe.y = H - 100;
        gaivota2.pontos++;
    }
}

// ======= IA DA GAIVOTA2 (SCRIPT ANTIGO) =======
function move_gaivota2() {
    if (peixe.y <= H * 0.6) {
        let soma = gaivota.pontos + gaivota2.pontos;

        let fatorX = 0.0015 + soma / 3500 + (degrau(soma / 2) * Math.abs(gaivota.pontos - gaivota2.pontos)) / 100;

        //  LIMITADOR FINAL (evita teletransporte da gaivota2)
        fatorX = Math.min(fatorX, 0.05);
        fatorX = Math.max(fatorX, 0.001); // limite inferior

        let fatorY = 0.0002 + soma / 2000;
        fatorY = Math.min(fatorY, 0.03);
        fatorY = Math.max(fatorY, 0.0005);

        gaivota2.x += (peixe.x - gaivota2.x) * fatorX;
        gaivota2.y += (peixe.y - gaivota2.y) * fatorY;
    } else {
        // comportamento passivo quando peixe está baixo (pequeno flutuar)
        gaivota2.y += Math.sin(Date.now() / 500) * 0.2;
    }
}

// ======= LOOP =======
function loop() {
    // limpar primeiro para evitar apagar depois de desenhar
    ctx.clearRect(0, 0, W, H);

    // centraliza a gaivota controlada pelo jogador
    gaivota.x = destino.x - gaivota.w / 2;
    gaivota.y = destino.y - gaivota.h / 2;

    bg.draw();
    bg2.draw();
    gaivota.draw();
    gaivota2.draw();
    peixe.draw();

    gaivota.anim("img_gaivota/gaivota", 4, 6);
    gaivota2.anim("img_gaivota2/gaivota", 4, 6);
    peixe.anim("img_peixe/peixe", 6, 6);

    move_bg();
    move_peixe();
    move_gaivota2();

    placar.textContent = `Gaivota1: ${gaivota.pontos} | Gaivota2: ${gaivota2.pontos}`;

    requestAnimationFrame(loop);
}

loop();
