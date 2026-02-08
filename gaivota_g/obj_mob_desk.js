// ======= Configuração base =======
const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const placar = document.querySelector("#placar");

// posição alvo da gaivota controlada pelo jogador
let destino = null;

// ======= Função degrau (mesma do script antigo) =======
function degrau(x) {
    const e = Math.E ** (x * 0.2);
    const k = -((((x * 0.2) - 10) / e) ** 2);
    return Math.E ** k * 1.8801;
}

// ======= Factory de objetos (baseado no Obj antigo) =======
function criarObj(imageSrc, x, y) {
    const image = new Image();
    image.src = imageSrc;

    return {
        image,
        position: [x, y],
        frame: 1,
        tick: 0,
        pontos: 0,
        velocidade: 0,
        x: 2,

        drawing() {
            ctx.drawImage(this.image, this.position[0], this.position[1]);
        },

        anim(prefix, tickLimit, frames) {
            this.tick += 1;
            if (this.tick === tickLimit) {
                this.tick = 0;
                this.frame += 1;
            }
            if (this.frame === frames) {
                this.frame = 1;
            }
            this.image.src = prefix + this.frame + ".png";
        }
    };
}

// ======= Movimento do fundo (como no script antigo) =======
function move_bg(bg, bg2) {
    if (bg.position[0] > -773) {
        bg.position[0] -= 1;
    }
    if (bg.position[0] === -773) {
        bg.position[0] = 0;
    }
    if (bg2.position[0] > 0) {
        bg2.position[0] -= 1;
    }
    if (bg2.position[0] === 0) {
        bg2.position[0] = 774;
    }
}

// ======= Movimento e colisões do peixe (versão antiga) =======
function move_peixe(peixe, gaivota, gaivota2) {
    peixe.velocidade = 2 + (gaivota.pontos + gaivota2.pontos) / (2 * peixe.x);
    peixe.position[1] -= peixe.velocidade;

    if (peixe.position[1] <= 0) {
        peixe.position[0] = 800 * Math.random();
        peixe.position[1] = 750;
    }

    // colisão com gaivota 1
    if (
        gaivota.position[0] > peixe.position[0] - 36 &&
        gaivota.position[0] < peixe.position[0] + 36 &&
        gaivota.position[1] > peixe.position[1] - 36 &&
        gaivota.position[1] < peixe.position[1] + 36
    ) {
        peixe.position[0] = 800 * Math.random();
        peixe.position[1] = 750;
        gaivota.pontos += 1;
    }

    // colisão com gaivota 2
    if (
        gaivota2.position[0] > peixe.position[0] - 36 &&
        gaivota2.position[0] < peixe.position[0] + 36 &&
        gaivota2.position[1] > peixe.position[1] - 36 &&
        gaivota2.position[1] < peixe.position[1] + 36
    ) {
        peixe.position[0] = 800 * Math.random();
        peixe.position[1] = 750;
        gaivota2.pontos += 1;
    }

    if (peixe.velocidade >= 15) {
        peixe.x += 1;
    }
}

// ======= Objetos (mesmas posições lógicas do script antigo) =======
const bg = new criarObj("img_fundo/fundo2.png", 0, 0);
const bg2 = new criarObj("img_fundo/fundo2.png", 774, 0);
const gaivota =new criarObj("img_gaivota/gaivota1.png", 100, 200);
const gaivota2 =new criarObj("img_gaivota2/gaivota1.png", 400, 200);
const peixe = new criarObj("img_peixe/peixe1.png", 774 * Math.random(), 750);

// ======= Eventos de entrada (mouse + touch) =======
canvas.addEventListener("mousemove", (e) => {
    destino = { x: e.clientX, y: e.clientY };
});

canvas.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    destino = { x: t.clientX, y: t.clientY };
    e.preventDefault();
});

// ======= Canvas fullscreen (sem escala de jogo, só tela cheia) =======
function ajustarCanvas() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const isPortrait = h > w;
    const warning = document.getElementById("rotate-warning");

    if (isMobile && isPortrait) {
        warning.style.display = "flex";
        canvas.style.display = "none";
        return;
    }

    warning.style.display = "none";
    canvas.style.display = "block";

    canvas.width = w;
    canvas.height = h;
}

window.addEventListener("resize", ajustarCanvas);
ajustarCanvas();

// ======= Loop principal =======
function gameLoop() {
    

    // desenha tudo
    bg.drawing();
    bg2.drawing();
    gaivota.drawing();
    gaivota2.drawing();
    peixe.drawing();

    // animações
    gaivota.anim("img_gaivota/gaivota", 4, 6);
    gaivota2.anim("img_gaivota2/gaivota", 4, 6);
    peixe.anim("img_peixe/peixe", 6, 6);

    // fundo rolando
    move_bg(bg, bg2);

    // movimento da gaivota do jogador (mesmo offset do script antigo)
    if (destino) {
        gaivota.position[0] = destino.x - 43;
        gaivota.position[1] = destino.y - 47;
    }

    // comportamento da gaivota2: MESMO do script antigo
    const pontosAntes = gaivota.pontos;
    if (gaivota.pontos <= 10) {
        gaivota.pontos += 12;
    }

    if (peixe.position[1] <= 560) {
        const somaPontos = gaivota.pontos + gaivota2.pontos;
        const fatorBaseX = 0.0015 + somaPontos / 3500;
        const fatorBaseY = 0.0002 + somaPontos / 2000;
        const fatorDegrau =
            degrau((gaivota.pontos + gaivota2.pontos / 2)) *
            (Math.abs(gaivota.pontos - gaivota2.pontos)) /
            100;

        const fatorX = fatorBaseX + fatorDegrau;

        gaivota2.position[0] =
            (peixe.position[0] - gaivota2.position[0]) * fatorX +
            gaivota2.position[0];

        gaivota2.position[1] =
            (peixe.position[1] - gaivota2.position[1]) * fatorBaseY +
            gaivota2.position[1];
    }

    if (pontosAntes <= 10) {
        gaivota.pontos -= 12;
    }

    // movimento do peixe + colisões
    move_peixe(peixe, gaivota, gaivota2);

    // placar
    placar.textContent =
        "Gaivota1: " +
        gaivota.pontos +
        " | Gaivota2: " +
        gaivota2.pontos;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    requestAnimationFrame(gameLoop);
}

// ======= Inicialização =======
function initGame() {
    //gameLoop();
    requestAnimationFrame(gameLoop);
}

initGame();
