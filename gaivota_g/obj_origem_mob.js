// ======= Configuração base e utilitários =======
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// Base de referência para calcular scale (ajuste conforme seu design)
const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;

let scale = 1;
let scaleX = 1;
let scaleY = 1;

// Placar
const placar = document.querySelector('h3') || { textContent: '' };

// Função degrau conforme fornecida
function degrau(x) {
    const e = Math.E ** (x * 0.2);
    const k = -((((x * 0.2) - 10) / e) ** 2);
    return (Math.E ** k) * 1.8801;
}

// ======= Ajuste do canvas e buffer para mobile rotacionado =======
function ajustarCanvas() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (isMobile) {
        // Buffer com dimensões trocadas para desenhar no "espaço lógico"
        const buffer = document.createElement("canvas");
        buffer.width = h;   // largura do buffer = altura da janela
        buffer.height = w;  // altura do buffer = largura da janela

        canvas.width = buffer.height; // = window.innerWidth
        canvas.height = buffer.width; // = window.innerHeight

        canvas._buffer = buffer;
        canvas._bufferCtx = buffer.getContext("2d");
        canvas._ctx = ctx;

        scaleX = canvas._buffer.width / BASE_WIDTH;
        scaleY = canvas._buffer.height / BASE_HEIGHT;
        scale = Math.min(scaleX, scaleY);

    } else {
        canvas.width = w;
        canvas.height = h;

        canvas._buffer = canvas;
        canvas._bufferCtx = ctx;
        canvas._ctx = ctx;

        scaleX = canvas.width / BASE_WIDTH;
        scaleY = canvas.height / BASE_HEIGHT;
        scale = Math.min(scaleX, scaleY);
    }
}
window.addEventListener("resize", () => {
    ajustarCanvas();
    // rescale objetos se necessário
    if (bg && bg.rescale) bg.rescale();
    if (bg2 && bg2.rescale) bg2.rescale();
    if (gaivota && gaivota.rescale) gaivota.rescale();
    if (gaivota2 && gaivota2.rescale) gaivota2.rescale();
    if (peixe && peixe.rescale) peixe.rescale();
});
ajustarCanvas();

// ======= Construtor Obj responsivo =======
function Obj(imageSrc, baseX, baseY, baseW = 64, baseH = 48) {
    this.image = new Image();
    this.image.src = imageSrc;

    // coordenadas e tamanhos na "base" (0..BASE_WIDTH, 0..BASE_HEIGHT)
    this.baseX = baseX;
    this.baseY = baseY;
    this.baseW = baseW;
    this.baseH = baseH;

    // propriedades escaladas
    this.position = [this.baseX * scale, this.baseY * scale];
    this.width = this.baseW * scale;
    this.height = this.baseH * scale;

    this.frame = 1;
    this.tick = 0;
    this.pontos = 0;
    this.velocidade = 0;
    this.x = 2; // parâmetro de dificuldade

    // rescale quando a tela muda
    this.rescale = function () {
        this.position[0] = this.baseX * scale;
        this.position[1] = this.baseY * scale;
        this.width = this.baseW * scale;
        this.height = this.baseH * scale;
    };

    this.drawing = function (bufferCtx) {
        bufferCtx.drawImage(this.image, this.position[0], this.position[1], this.width, this.height);
    };

    this.anim = function (imgPrefix, tickLimit, frames) {
        this.tick += 1;
        if (this.tick >= tickLimit) {
            this.tick = 0;
            this.frame += 1;
            if (this.frame > frames) this.frame = 1;
            this.image.src = imgPrefix + this.frame + '.png';
        }
    };

    this.move_gaivota = function (x, y) {
        // x,y já em coordenadas do buffer; aplica offsets proporcionais
        this.position[0] = (x - 43) * scale;
        this.position[1] = (y - 47) * scale;
    };

    this.move_gaivota2 = function (x, y) {
        this.position[0] = x * scale;
        this.position[1] = y * scale;
    };
}

// ======= Movimento do fundo =======
function move_bg(bg, bg2) {
    const step = 1 * scale;
    const limit = 773 * scale;
    if (bg.position[0] > -limit) {
        bg.position[0] -= step;
    }
    if (Math.abs(bg.position[0] - (-limit)) < 0.001) {
        bg.position[0] = 0;
    }
    if (bg2.position[0] > 0) {
        bg2.position[0] -= step;
    }
    if (Math.abs(bg2.position[0]) < 0.001) {
        bg2.position[0] = 774 * scale;
    }
}

// ======= Movimento e colisões dos peixes =======
function move_peixe(peixe, gaivota, gaivota2) {
    // velocidade base escalada
    this.velocidade = (2 + (gaivota.pontos + gaivota2.pontos) / (2 * peixe.x)) * scale;

    peixe.position[1] -= this.velocidade;

    // reposiciona quando sai do topo (valores base convertidos por scale)
    if (peixe.position[1] <= 0) {
        peixe.position[0] = (800 * Math.random()) * scale;
        peixe.position[1] = 750 * scale;
    }

    const hit = 36 * scale;

    // colisão com gaivota 1
    if (
        gaivota.position[0] > peixe.position[0] - hit &&
        gaivota.position[0] < peixe.position[0] + hit &&
        gaivota.position[1] > peixe.position[1] - hit &&
        gaivota.position[1] < peixe.position[1] + hit
    ) {
        peixe.position[0] = (800 * Math.random()) * scale;
        peixe.position[1] = 750 * scale;
        gaivota.pontos += 1;
    }

    // colisão com gaivota 2
    if (
        gaivota2.position[0] > peixe.position[0] - hit &&
        gaivota2.position[0] < peixe.position[0] + hit &&
        gaivota2.position[1] > peixe.position[1] - hit &&
        gaivota2.position[1] < peixe.position[1] + hit
    ) {
        peixe.position[0] = (800 * Math.random()) * scale;
        peixe.position[1] = 750 * scale;
        gaivota2.pontos += 1;
    }

    // aumenta dificuldade
    if (this.velocidade >= 15 * scale) {
        peixe.x += 1;
    }
}

// ======= Objetos do jogo =======
// Ajuste os caminhos das imagens conforme sua pasta
const bg = new Obj('img_fundo/fundo2.png', 0, 0, 1920, 1080);
const bg2 = new Obj('img_fundo/fundo2.png', 774, 0, 1920, 1080);
const gaivota = new Obj('img_gaivota/gaivota1.png', 100, 200, 120, 80);
const gaivota2 = new Obj('img_gaivota2/gaivota1.png', 400, 200, 120, 80);
const peixe = new Obj('img_peixe/peixe1.png', Math.random() * 774, 750, 64, 48);

// ======= Entrada do usuário mouse e touch =======
let destinoToque = null;
let toqueAnterior = null;

function atualizarDestino(event) {
    const rect = canvas.getBoundingClientRect();

    if (isMobile && event.touches && event.touches.length) {
        const touch = event.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        // converter para coordenadas do buffer rotacionado
        const rotatedX = y;
        const rotatedY = canvas.width - x;

        if (toqueAnterior) {
            const dx = (rotatedX - toqueAnterior.x);
            const dy = (rotatedY - toqueAnterior.y);

            destinoToque = {
                x: gaivota.position[0] + dx * 1.5,
                y: gaivota.position[1] + dy * 1.5
            };
        } else {
            destinoToque = {
                x: rotatedX * scale,
                y: rotatedY * scale
            };
        }

        toqueAnterior = { x: rotatedX, y: rotatedY };
        event.preventDefault();

    } else if (!isMobile) {
        // mouse em desktop
        destinoToque = {
            x: (event.clientX - rect.left) * scale,
            y: (event.clientY - rect.top) * scale
        };
    }
}

canvas.addEventListener("mousemove", atualizarDestino, { passive: true });
canvas.addEventListener("touchmove", atualizarDestino, { passive: false });
canvas.addEventListener("touchstart", atualizarDestino, { passive: false });

// ======= Loop de jogo e render =======
function gameLoop() {
    const buffer = canvas._buffer;
    const bufferCtx = canvas._bufferCtx;
    const mainCtx = canvas._ctx;

    // limpa buffer
    bufferCtx.clearRect(0, 0, buffer.width, buffer.height);

    // desenha fundo (pode desenhar imagens em vez de fill)
    bg.drawing(bufferCtx);
    bg2.drawing(bufferCtx);

    // atualiza gaivota 1 em direção ao destino com smoothing
    if (destinoToque) {
        gaivota.position[0] += (destinoToque.x - gaivota.position[0]) * 0.08;
        gaivota.position[1] += (destinoToque.y - gaivota.position[1]) * 0.08;
    }

    // lógica de pontos inicial (preserva comportamento original: garantir pontos mínimos)
    if (gaivota.pontos <= 10) {
        gaivota.pontos += 12;
    }

    // se peixe estiver acima de certo ponto, gaivota2 persegue com fórmula original adaptada
    if (peixe.position[1] <= 560 * scale) {
        const fatorX = 0.0015 + (gaivota.pontos + gaivota2.pontos) / 3500 + (degrau((gaivota.pontos + gaivota2.pontos / 2)) * (Math.abs(gaivota.pontos - gaivota2.pontos))) / 100;
        const fatorY = 0.0002 + (gaivota.pontos + gaivota2.pontos) / 2000;
        const novoX = (peixe.position[0] - gaivota2.position[0]) * fatorX + gaivota2.position[0];
        const novoY = (peixe.position[1] - gaivota2.position[1]) * fatorY + gaivota2.position[1];
        gaivota2.move_gaivota2(novoX / scale, novoY / scale); // move_gaivota2 aplica scale internamente
    }

    // desenha gaivotas e peixe
    gaivota.drawing(bufferCtx);
    gaivota2.drawing(bufferCtx);
    peixe.drawing(bufferCtx);

    // animações
    gaivota.anim('img_gaivota/gaivota', 4, 6);
    gaivota2.anim('img_gaivota2/gaivota', 4, 6);
    peixe.anim('img_peixe/peixe', 6, 6);

    // move fundo e peixe
    move_bg(bg, bg2);
    move_peixe.call({}, peixe, gaivota, gaivota2);

    // atualiza placar
    placar.textContent = "pontos Gaivota1 : " + gaivota.pontos + "  pontos Gaivota2 : " + gaivota2.pontos;

    // se mobile, desenha buffer rotacionado no canvas principal
    if (isMobile) {
        mainCtx.save();
        mainCtx.translate(canvas.width / 2, canvas.height / 2);
        mainCtx.rotate(-Math.PI / 2);
        mainCtx.drawImage(buffer, -buffer.width / 2, -buffer.height / 2);
        mainCtx.restore();
    }

    requestAnimationFrame(gameLoop);
}

// ======= Inicialização simples =======
function initGame() {
    // garantir propriedades escaladas iniciais
    bg.rescale();
    bg2.rescale();
    gaivota.rescale();
    gaivota2.rescale();
    peixe.rescale();

    // posicionar bg2 corretamente (base)
    bg2.position[0] = 774 * scale;

    requestAnimationFrame(gameLoop);
}

// inicia
initGame()
