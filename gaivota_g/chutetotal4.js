// ======= DETECTAR MOBILE =======
const isMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);

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
}
window.addEventListener("resize", resize);

// ======= FLAGS =======
let listenersAtivos = false;

// ======= FUNÇÃO DEGRAU =======
function degrau(x) {
    let e = Math.E ** (x * 0.2);
    let k = -((((x * 0.2) - 10) / e) ** 2);
    let d = Math.E ** k * 1.8801;

    if (!isFinite(d)) d = 0;
    return Math.max(0, Math.min(d, 1.5));
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
            if (++this.tick >= tickLimit) {
                this.tick = 0;
                this.frame = (this.frame % frames) + 1;
                this.image.src = `${prefix}${this.frame}.png`;
            }
        }
    };
}

// ======= OBJETOS =======
let bg = new Obj("img_fundo/fundo2.png", 0, 0, W, H);
let bg2 = new Obj("img_fundo/fundo2.png", W, 0, W, H);

let gaivota = new Obj("img_gaivota/gaivota1.png", 100, 200, 120, 80);
let gaivota2 = new Obj("img_gaivota2/gaivota1.png", 400, 200, 120, 80);

let peixe = new Obj("img_peixe/peixe1.png", Math.random() * W, H - 100, 64, 48);

// ======= FUNDO =======
function move_bg() {
    bg.x -= 1;
    bg2.x -= 1;

    if (bg.x <= -W) bg.x = W;
    if (bg2.x <= -W) bg2.x = W;
}

// ======= PEIXE =======
function move_peixe() {
    peixe.speed = 2 + (gaivota.pontos + gaivota2.pontos) / (2 * peixe.speed);
    peixe.y -= peixe.speed;

    if (peixe.y < -50) {
        peixe.x = Math.random() * W;
        peixe.y = H - 100;
    }

    if (Math.abs(gaivota.x - peixe.x) < 40 && Math.abs(gaivota.y - peixe.y) < 40) {
        peixe.x = Math.random() * W;
        peixe.y = H - 100;
        gaivota.pontos++;
    }

    if (Math.abs(gaivota2.x - peixe.x) < 40 && Math.abs(gaivota2.y - peixe.y) < 40) {
        peixe.x = Math.random() * W;
        peixe.y = H - 100;
        gaivota2.pontos++;
    }
}

// ======= IA DA GAIVOTA2 =======
function move_gaivota2() {
    if (peixe.y <= H * 0.6) {
        let soma = gaivota.pontos + gaivota2.pontos;

        let fatorX = 0.0015 + soma / 3500 + (degrau(soma / 2) * Math.abs(gaivota.pontos - gaivota2.pontos)) / 100;
        fatorX = Math.min(fatorX, 0.05);

        let fatorY = 0.0002 + soma / 2000;

        gaivota2.x += (peixe.x - gaivota2.x) * fatorX;
        gaivota2.y += (peixe.y - gaivota2.y) * fatorY;
    }
}

// ======= ATIVAR EVENTOS (APENAS UMA VEZ) =======
function ativarEventos() {
    if (listenersAtivos) return;

    if (!isMobile) {
        canvas.addEventListener("mousemove", e => {
            destino.x = e.clientX;
            destino.y = e.clientY;
        });
    } else {
        canvas.addEventListener("touchmove", e => {
            let t = e.touches[0];
            destino.x = t.clientX;
            destino.y = t.clientY;
            e.preventDefault();
        });
    }

    listenersAtivos = true;
}

// ======= LOOP =======
function loop() {

    // checar listeners dentro do loop (mas só ativar 1 vez)
    ativarEventos();//if (!listenersAtivos) 

    // ======= DESENHO =======
    ctx.clearRect(0, 0, W, H);

    bg.draw();
    bg2.draw();
    gaivota.draw();
    gaivota2.draw();
    peixe.draw();

    move_bg();

    gaivota.anim("img_gaivota/gaivota", 4, 6);
    gaivota2.anim("img_gaivota2/gaivota", 4, 6);
    peixe.anim("img_peixe/peixe", 6, 6);

    move_gaivota2();

    gaivota.x = destino.x - 40;
    gaivota.y = destino.y - 40;

    move_peixe();

    placar.textContent = `Gaivota1: ${gaivota.pontos} | Gaivota2: ${gaivota2.pontos}`;

    requestAnimationFrame(loop);
}

loop();
