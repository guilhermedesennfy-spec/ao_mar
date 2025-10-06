
const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

function degrau(x){
    const e = Math.exp(x * 0.2);
    const k = -((((x * 0.2) - 10) / e) ** 2);
    return Math.exp(k) * 1.8801;
}


const canvas = document.getElementById("canvas");

function ajustarCanvas() {
    const ctx = canvas.getContext("2d");

    if (isMobile) {
        
        const buffer = document.createElement("canvas");
        buffer.width = window.innerHeight;  
        buffer.height = window.innerWidth;  

        
        canvas.width = buffer.height;   
        canvas.height = buffer.width;

        canvas._ctx = ctx;
        canvas._buffer = buffer;
        canvas._bufferCtx = buffer.getContext("2d");
    } else {
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        canvas._ctx = ctx;
        canvas._buffer = canvas;
        canvas._bufferCtx = ctx;
    }
}


function Obj(image, x, y){
    this.image = new Image();
    this.image.src = image;
    this.position = [x, y];
    this.frame = 1;
    this.tick = 0;
    this.pontos = 0;
    this.velocidade = 0;
    this.x = 2;

    this.drawing = function () {
        const bufferCtx = canvas._bufferCtx;
        const scaleX = canvas._buffer.width / 744;
        const scaleY = canvas._buffer.height / 742;

        bufferCtx.save();
        bufferCtx.translate(this.position[0] * scaleX, this.position[1] * scaleY);
        bufferCtx.rotate(isMobile ? Math.PI / 2 : 0);
        bufferCtx.drawImage(
            this.image,
            -this.image.width / 2 * scaleX,
            -this.image.height / 2 * scaleY,
            this.image.width * scaleX,
            this.image.height * scaleY
        );
        bufferCtx.restore();
    };

    this.anim = function(img, tick, frames){
        this.tick += 1;
        if (this.tick === tick){
            this.tick = 0;
            this.frame += 1;
        }
        if (this.frame === frames){
            this.frame = 1;
        }
        this.image.src = img + this.frame + '.png';
    };

    this.move_gaivota = function(x, y){
        this.position[0] = x - 43;
        this.position[1] = y - 47;
    };

    this.move_gaivota2 = function(x, y){
        this.position[0] = x;
        this.position[1] = y;
    };
}


function move_bg(bg, bg2){
    if (bg.position[0] >= -744) bg.position[0] -= 1;
    if (bg.position[0] === -744) bg.position[0] = 0;
    if (bg2.position[0] >= 0) bg2.position[0] -= 1;
    if (bg2.position[0] === 0) bg2.position[0] = 744;
}


function move_peixe(peixe, gaivota, gaivota2){
    const velocidade = 2 + (gaivota.pontos + gaivota2.pontos) / (2 * peixe.x);
    peixe.position[1] -= velocidade;

    if (peixe.position[1] <= 0){
        peixe.position[0] = 800 * Math.random();
        peixe.position[1] = 700;
    }

    const colisao = (g, p) =>
        g.position[0] > p.position[0] - 36 && g.position[0] < p.position[0] + 36 &&
        g.position[1] > p.position[1] - 36 && g.position[1] < p.position[1] + 36;

    if (colisao(gaivota, peixe)){
        peixe.position[0] = 800 * Math.random();
        peixe.position[1] = 700;
        gaivota.pontos += 1;
    }

    if (colisao(gaivota2, peixe)){
        peixe.position[0] = 800 * Math.random();
        peixe.position[1] = 700;
        gaivota2.pontos += 1;
    }

    if (velocidade >= 15) peixe.x += 1;
}


function normalizarObjetos(objetos) {
    objetos.forEach(obj => {
        obj.relX = obj.position[0] / canvas._buffer.width;
        obj.relY = obj.position[1] / canvas._buffer.height;
    });
}

function atualizarPosicoes(objetos) {
    objetos.forEach(obj => {
        obj.position[0] = obj.relX * canvas._buffer.width;
        obj.position[1] = obj.relY * canvas._buffer.height;
    });
}


let destinoToque = null;
let toqueAnterior = null;

function configurarControles() {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice) {
        canvas.addEventListener("touchstart", atualizarDestino);
        canvas.addEventListener("touchmove", atualizarDestino);
        canvas.addEventListener("touchend", () => {
            toqueAnterior = null;
        });
    } else {
        document.addEventListener("mousemove", function(event) {
            const rect = canvas.getBoundingClientRect();
            destinoToque = {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            };
        });
    }
}

function atualizarDestino(event) {
    const rect = canvas.getBoundingClientRect();

    if (isMobile && event.touches && event.touches.length) {
        const touch = event.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        
        const rotatedX = y;
        const rotatedY = canvas.width - x;

        if (toqueAnterior) {
            const dx = rotatedX - toqueAnterior.x;
            const dy = rotatedY - toqueAnterior.y;

            destinoToque = {
                x: gaivota.position[0] + dx * 1.5,
                y: gaivota.position[1] + dy * 1.5
            };
        }

        toqueAnterior = { x: rotatedX, y: rotatedY };
        event.preventDefault();
    } else if (!isMobile) {
        destinoToque = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top - 80
        };
    }
}


function ativarFullscreen() {
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) docEl.requestFullscreen();
}


ajustarCanvas(); 

const bg = new Obj('img_fundo/fundo2.png', 0, 0);
const bg2 = new Obj('img_fundo/fundo2.png', 744, 0);
const gaivota = new Obj('img_gaivota/gaivota1.png', 100, 200);
const gaivota2 = new Obj('img_gaivota2/gaivota1.png', 400, 200);
const peixe = new Obj("img_peixe/peixe1.png", 1.1 * 744 * Math.random(), 710);

const objetos = [bg, bg2, gaivota, gaivota2, peixe];
normalizarObjetos(objetos);

gaivota.pontos = 0;
const placar = document.querySelector('h3');

configurarControles();

window.addEventListener("resize", () => {
    ajustarCanvas();
    atualizarPosicoes(objetos);
});


function jogo() {
    const bufferCtx = canvas._bufferCtx;
    bufferCtx.clearRect(0, 0, canvas._buffer.width, canvas._buffer.height);

    
    bg.drawing();
    bg2.drawing();
    gaivota.drawing();
    gaivota2.drawing();
    peixe.drawing();

    
    move_bg(bg, bg2);
    gaivota.anim('img_gaivota/gaivota', 4, 6);
    gaivota2.anim('img_gaivota2/gaivota', 4, 6);
    peixe.anim("img_peixe/peixe", 6, 6);

    
    if (peixe.position[1] <= 560) {
        const dx = peixe.position[0] - gaivota2.position[0];
        const dy = peixe.position[1] - gaivota2.position[1];
        const fatorX = 0.0015 + (gaivota.pontos + gaivota2.pontos) / 3500 + (degrau((gaivota.pontos + gaivota2.pontos / 2)) * Math.abs(gaivota.pontos - gaivota2.pontos)) / 100;
        const fatorY = 0.0002 + (gaivota.pontos + gaivota2.pontos) / 2000;
        gaivota2.move_gaivota2(dx * fatorX + gaivota2.position[0], dy * fatorY + gaivota2.position[1]);
    }

    
    if (destinoToque) {
        const suavidade = 0.2;
        const dx = destinoToque.x - gaivota.position[0];
        const dy = destinoToque.y - gaivota.position[1];

        gaivota.move_gaivota(
            gaivota.position[0] + dx * suavidade,
            gaivota.position[1] + dy * suavidade
        );
    }

    
    move_peixe(peixe, gaivota, gaivota2);
    if (placar) {
        placar.textContent = `pontos Gaivota1 : ${gaivota.pontos}  pontos Gaivota2 : ${gaivota2.pontos}`;
    }

    
    if (isMobile) {
        const ctx = canvas._ctx;
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(canvas.width, 0);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(canvas._buffer, 0, 0);
        ctx.restore();
    }

    requestAnimationFrame(jogo);
}


jogo();
