
const LARGURA_LOGICA = 800;
const ALTURA_LOGICA = 600;

const canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let dpr = window.devicePixelRatio || 1;

let imagens = {};
let gaivota = { x: 100, y: 200, largura: 80, altura: 80 };
let peixe = { x: 400, y: 300, largura: 60, altura: 60 };


function ajustarCanvas() {
    const widthCSS = window.innerWidth;
    const heightCSS = window.innerHeight;
    const aspect = LARGURA_LOGICA / ALTURA_LOGICA;
    let width, height;

    if (widthCSS / heightCSS > aspect) {
        height = heightCSS;
        width = height * aspect;
    } else {
        width = widthCSS;
        height = width / aspect;
    }

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(canvas.width / LARGURA_LOGICA, canvas.height / ALTURA_LOGICA);

    desenharTudo();
}


function obterCoordenadasCanvas(evento) {
    const rect = canvas.getBoundingClientRect();
    let x, y;

    if (evento.touches && evento.touches.length > 0) {
        x = (evento.touches[0].clientX - rect.left) * (canvas.width / rect.width);
        y = (evento.touches[0].clientY - rect.top) * (canvas.height / rect.height);
    } else {
        x = (evento.clientX - rect.left) * (canvas.width / rect.width);
        y = (evento.clientY - rect.top) * (canvas.height / rect.height);
    }

    x = x * (LARGURA_LOGICA / canvas.width);
    y = y * (ALTURA_LOGICA / canvas.height);
    return { x, y };
}


canvas.addEventListener('mousedown', function(e){
    const pt = obterCoordenadasCanvas(e);
    gaivota.x = pt.x - gaivota.largura / 2;
    gaivota.y = pt.y - gaivota.altura / 2;
});
canvas.addEventListener('mousemove', function(e){
    if (e.buttons > 0) {
        const pt = obterCoordenadasCanvas(e);
        gaivota.x = pt.x - gaivota.largura / 2;
        gaivota.y = pt.y - gaivota.altura / 2;
    }
});
canvas.addEventListener('touchstart', function(e){
    const pt = obterCoordenadasCanvas(e);
    gaivota.x = pt.x - gaivota.largura / 2;
    gaivota.y = pt.y - gaivota.altura / 2;
    e.preventDefault();
});
canvas.addEventListener('touchmove', function(e){
    const pt = obterCoordenadasCanvas(e);
    gaivota.x = pt.x - gaivota.largura / 2;
    gaivota.y = pt.y - gaivota.altura / 2;
    e.preventDefault();
});


window.addEventListener('resize', ajustarCanvas);
window.addEventListener('orientationchange', ajustarCanvas);


function loopJogo() {
    atualizarEstado();
    desenharTudo();
    requestAnimationFrame(loopJogo);
}


function atualizarEstado() {
    peixe.y -= 2;
    if (peixe.y < -peixe.altura) {
        peixe.x = Math.random() * (LARGURA_LOGICA - peixe.largura);
        peixe.y = ALTURA_LOGICA;
    }
}


function desenharTudo() {
    ctx.clearRect(0, 0, LARGURA_LOGICA, ALTURA_LOGICA);

    ctx.fillStyle = "skyblue";
    ctx.fillRect(0, 0, LARGURA_LOGICA, ALTURA_LOGICA);

    if (imagens.bg) {
        ctx.drawImage(imagens.bg, 0, 0, LARGURA_LOGICA, ALTURA_LOGICA);
    }
    if (imagens.peixe) {
        ctx.drawImage(imagens.peixe, peixe.x, peixe.y, peixe.largura, peixe.altura);
    }
    if (imagens.gaivota) {
        ctx.drawImage(imagens.gaivota, gaivota.x, gaivota.y, gaivota.largura, gaivota.altura);
    }
}


function preloadImagens(callback) {
    let toLoad = 3;
    let carregadas = {};

    carregadas.bg = new Image();
    carregadas.bg.src = 'img_fundo/fundo2.png';
    carregadas.bg.onload = checar;

    carregadas.peixe = new Image();
    carregadas.peixe.src = "img_peixe/peixe1.png";
    carregadas.peixe.onload = checar;

    carregadas.gaivota = new Image();
    carregadas.gaivota.src = 'img_gaivota/gaivota1.png';
    carregadas.gaivota.onload = checar;

    function checar() {
        if (--toLoad === 0) callback(carregadas);
    }
}


document.addEventListener('DOMContentLoaded', function() {
    preloadImagens(function(carregadas){
        imagens = carregadas;
        ajustarCanvas();
        loopJogo();
    });
});

