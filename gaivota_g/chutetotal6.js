// ======= DETECTAR MOBILE =======
const isMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);

// ======= VARIÁVEIS GLOBAIS INICIAIS =======
let canvas = null;
let ctx = null;
let placar = null;

let W = window.innerWidth;
let H = window.innerHeight;

// destino definido globalmente
let destino = { x: W / 2, y: H / 2 };

// estado do ponteiro (atualizado pelos listeners uma vez)
const pointerState = {
    x: destino.x,
    y: destino.y,
    active: false // true enquanto o ponteiro/touch estiver pressionado/movendo
};

// ======= INICIALIZAÇÃO DE ELEMENTOS =======
function initElements() {
    canvas = document.getElementById("canvas");
    placar = document.getElementById("placar");

    if (!canvas) {
        console.error("Canvas não encontrado. Adicione <canvas id='canvas'></canvas> no HTML.");
        return false;
    }

    ctx = canvas.getContext("2d");
    canvas.width = W;
    canvas.height = H;
    return true;
}

function onResize() {
    W = window.innerWidth;
    H = window.innerHeight;
    if (canvas) {
        canvas.width = W;
        canvas.height = H;
    }
}
window.addEventListener("resize", onResize);

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
            if (this.image.complete) {
                ctx.drawImage(this.image, this.x, this.y, this.w, this.h);
            }
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

// ======= CRIAÇÃO DE OBJETOS =======
let bg, bg2, gaivota, gaivota2, peixe;

function createObjects() {
    bg = new Obj("img_fundo/fundo2.png", 0, 0, W, H);
    bg2 = new Obj("img_fundo/fundo2.png", W, 0, W, H);

    gaivota = new Obj("img_gaivota/gaivota1.png", 100, 200, 120, 80);
    gaivota2 = new Obj("img_gaivota2/gaivota1.png", 400, 200, 120, 80);

    peixe = new Obj("img_peixe/peixe1.png", Math.random() * (W - 64), H - 100, 64, 48);
    peixe.baseSpeed = 2;
    peixe.speed = peixe.baseSpeed;
}

// ======= MOVIMENTOS =======
function move_bg() {
    bg.x -= 1;
    bg2.x -= 1;

    if (bg.x <= -W) bg.x = W;
    if (bg2.x <= -W) bg2.x = W;
}

function move_peixe() {
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

// ======= INPUTS: listeners registrados UMA vez, atualizam pointerState =======
function setupInput() {
    if (!canvas) return;

    // Usar Pointer Events quando disponível (unifica mouse + touch)
    const supportsPointer = window.PointerEvent !== undefined;

    if (supportsPointer) {
        canvas.addEventListener("pointerdown", (e) => {
            pointerState.active = true;
            pointerState.x = e.clientX;
            pointerState.y = e.clientY;
        });
        canvas.addEventListener("pointermove", (e) => {
            // atualiza posição mesmo se não estiver ativo (movimento do mouse)
            pointerState.x = e.clientX;
            pointerState.y = e.clientY;
        });
        canvas.addEventListener("pointerup", () => {
            pointerState.active = false;
        });
        canvas.addEventListener("pointercancel", () => {
            pointerState.active = false;
        });
    } else {
        // fallback: mouse + touch separados
        canvas.addEventListener("mousemove", (e) => {
            pointerState.x = e.clientX;
            pointerState.y = e.clientY;
        });
        canvas.addEventListener("mousedown", (e) => {
            pointerState.active = true;
            pointerState.x = e.clientX;
            pointerState.y = e.clientY;
        });
        canvas.addEventListener("mouseup", () => {
            pointerState.active = false;
        });

        canvas.addEventListener("touchstart", (e) => {
            const t = e.touches[0];
            if (t) {
                pointerState.active = true;
                pointerState.x = t.clientX;
                pointerState.y = t.clientY;
            }
            e.preventDefault();
        }, { passive: false });

        canvas.addEventListener("touchmove", (e) => {
            const t = e.touches[0];
            if (t) {
                pointerState.x = t.clientX;
                pointerState.y = t.clientY;
            }
            e.preventDefault();
        }, { passive: false });

        canvas.addEventListener("touchend", () => {
            pointerState.active = false;
        }, { passive: true });
    }

    // clique simples para posicionar (sem manter ativo)
    canvas.addEventListener("click", (e) => {
        pointerState.x = e.clientX;
        pointerState.y = e.clientY;
        pointerState.active = false;
    });
}

// ======= LOOP PRINCIPAL (lê pointerState a cada frame) =======
function loop() {
    if (!ctx) return;

    // --- leitura de input por frame (a "verificação" que você pediu) ---
    // aqui fazemos a verificação a cada frame: se pointerState.active ou posição mudou,
    // atualizamos destino. Isso evita recriar listeners dentro do loop.
    destino.x = pointerState.x;
    destino.y = pointerState.y;

    // --- desenho e lógica ---
    ctx.clearRect(0, 0, W, H);

    // desenhar fundos com dimensões atuais
    if (bg.image.complete) ctx.drawImage(bg.image, bg.x, bg.y, W, H);
    if (bg2.image.complete) ctx.drawImage(bg2.image, bg2.x, bg2.y, W, H);

    gaivota.draw();
    gaivota2.draw();
    peixe.draw();

    move_bg();

    gaivota.anim("img_gaivota/gaivota", 4, 6);
    gaivota2.anim("img_gaivota2/gaivota", 4, 6);
    peixe.anim("img_peixe/peixe", 6, 6);

    move_gaivota2();

    // seguir destino (centraliza a sprite)
    gaivota.x = destino.x - gaivota.w / 2;
    gaivota.y = destino.y - gaivota.h / 2;

    move_peixe();

    if (placar) placar.textContent = `Gaivota1: ${gaivota.pontos} | Gaivota2: ${gaivota2.pontos}`;

    requestAnimationFrame(loop);
}

// ======= INICIALIZAÇÃO SEGURA =======
window.addEventListener("DOMContentLoaded", () => {
    if (!initElements()) return;
    createObjects();
    setupInput();
    requestAnimationFrame(loop);
});
