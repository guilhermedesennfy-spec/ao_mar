// ======= DETECTAR MOBILE =======
const isMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);

// ======= CONFIGURAÇÃO =======
let canvas, ctx, placar;
let W = window.innerWidth;
let H = window.innerHeight;

let destino = { x: W / 2, y: H / 2 };

function initElements() {
    canvas = document.getElementById("canvas");
    placar = document.getElementById("placar");
    if (!canvas) {
        console.error("Canvas não encontrado. Verifique se existe um elemento <canvas id='canvas'> no HTML.");
        return false;
    }
    ctx = canvas.getContext("2d");
    canvas.width = W;
    canvas.height = H;
    return true;
}

function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    if (canvas) {
        canvas.width = W;
        canvas.height = H;
    }
    // atualizar tamanhos de fundo se necessário (será tratado no loop)
}
window.addEventListener("resize", resize);

// ======= FUNÇÃO DEGRAU =======
function degrau(x) {
    let e = Math.E ** (x * 0.2);
    let k = -((((x * 0.2) - 10) / e) ** 2);
    let d = Math.E ** k * 1.8801;

    if (!isFinite(d)) d = 0;
    d = Math.min(d, 1.5);
    d = Math.max(d, 0);

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
        baseSpeed: 2,
        speed: 2,

        draw() {
            // desenha mesmo que a imagem ainda não tenha carregado (nada é desenhado até carregar)
            ctx.drawImage(this.image, this.x, this.y, this.w, this.h);
        },

        anim(prefix, tickLimit, frames) {
            this.tick++;
            if (this.tick >= tickLimit) {
                this.tick = 0;
                this.frame++;
                if (this.frame > frames) this.frame = 1;
                this.image.src = prefix + this.frame + ".png";
            }
        }
    };
}

// ======= OBJETOS =======
let bg, bg2, gaivota, gaivota2, peixe;

function createObjects() {
    bg = new Obj("img_fundo/fundo2.png", 0, 0, W, H);
    bg2 = new Obj("img_fundo/fundo2.png", W, 0, W, H);

    gaivota = new Obj("img_gaivota/gaivota1.png", 100, 200, 120, 80);
    gaivota2 = new Obj("img_gaivota2/gaivota1.png", 400, 200, 120, 80);

    peixe = new Obj("img_peixe/peixe1.png", Math.random() * W, H - 100, 64, 48);
    peixe.baseSpeed = 2;
    peixe.speed = peixe.baseSpeed;
}

// ======= FUNDO =======
function move_bg() {
    bg.x -= 1;
    bg2.x -= 1;

    if (bg.x <= -W) bg.x = W;
    if (bg2.x <= -W) bg2.x = W;
}

// ======= PEIXE =======
function move_peixe() {
    // velocidade base mais um incremento suave conforme pontos
    const soma = gaivota.pontos + gaivota2.pontos;
    peixe.speed = peixe.baseSpeed + soma * 0.02;
    peixe.y -= peixe.speed;

    if (peixe.y < -50) {
        peixe.x = Math.random() * (W - peixe.w);
        peixe.y = H - 100;
    }

    if (Math.abs(gaivota.x - peixe.x) < 40 && Math.abs(gaivota.y - peixe.y) < 40) {
        peixe.x = Math.random() * (W - peixe.w);
        peixe.y = H - 100;
        gaivota.pontos++;
    }

    if (Math.abs(gaivota2.x - peixe.x) < 40 && Math.abs(gaivota2.y - peixe.y) < 40) {
        peixe.x = Math.random() * (W - peixe.w);
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
        fatorY = Math.min(fatorY, 0.05);

        gaivota2.x += (peixe.x - gaivota2.x) * fatorX;
        gaivota2.y += (peixe.y - gaivota2.y) * fatorY;
    }
}

// ======= EVENTOS (apenas uma vez) =======
function setupInput() {
    if (!canvas) return;

    if (!isMobile) {
        canvas.addEventListener("mousemove", e => {
            destino.x = e.clientX;
            destino.y = e.clientY;
        });
    } else {
        canvas.addEventListener("touchmove", e => {
            let t = e.touches[0];
            if (t) {
                destino.x = t.clientX;
                destino.y = t.clientY;
            }
            e.preventDefault();
        }, { passive: false });
    }

    // também permitir clique/tap para posicionar
    canvas.addEventListener("click", e => {
        destino.x = e.clientX;
        destino.y = e.clientY;
    });
    canvas.addEventListener("touchstart", e => {
        let t = e.touches[0];
        if (t) {
            destino.x = t.clientX;
            destino.y = t.clientY;
        }
    }, { passive: true });
}

// ======= LOOP =======
function loop() {
    if (!ctx) return;

    // ======= DESENHO =======
    ctx.clearRect(0, 0, W, H);

    // garantir que os fundos cubram a tela (atualiza w/h caso de resize)
    bg.w = bg.h = 0; // não usar; em vez disso desenhar com dimensões atuais
    ctx.drawImage(bg.image, bg.x, bg.y, W, H);
    ctx.drawImage(bg2.image, bg2.x, bg2.y, W, H);

    gaivota.draw();
    gaivota2.draw();
    peixe.draw();

    move_bg();

    gaivota.anim("img_gaivota/gaivota", 4, 6);
    gaivota2.anim("img_gaivota2/gaivota", 4, 6);
    peixe.anim("img_peixe/peixe", 6, 6);

    move_gaivota2();

    // seguir o destino (com offset para centralizar a imagem)
    gaivota.x = destino.x - 40;
    gaivota.y = destino.y - 40;

    move_peixe();

    if (placar) placar.textContent = `Gaivota1: ${gaivota.pontos} | Gaivota2: ${gaivota2.pontos}`;

    requestAnimationFrame(loop);
}

// ======= INICIALIZAÇÃO SEGURA =======
window.addEventListener("DOMContentLoaded", () => {
    if (!initElements()) return;
    createObjects();
    setupInput();
    // iniciar loop após garantir elementos e listeners
    requestAnimationFrame(loop);
});
