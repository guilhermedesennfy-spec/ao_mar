
const LARGURA_LOGICA = 800;
const ALTURA_LOGICA = 600;

const canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');
let dpr = window.devicePixelRatio || 1;


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
    
});
canvas.addEventListener('touchstart', function(e){
    const pt = obterCoordenadasCanvas(e);
    
    e.preventDefault();
});

window.addEventListener('resize', ajustarCanvas);
window.addEventListener('orientationchange', ajustarCanvas);


function loopJogo() {
    atualizarEstado();
    desenharTudo();
    requestAnimationFrame(loopJogo);
}


function desenharTudo() {
    ctx.clearRect(0, 0, LARGURA_LOGICA, ALTURA_LOGICA);
    
}


function preloadImagens(callback) {
    let imagens = {};
    let toLoad = 3;
    imagens.bg = new Image();
    imagens.bg.src = "fundo.png";
    imagens.bg.onload = checar;

    imagens.peixe = new Image();
    imagens.peixe.src = "peixe.png";
    imagens.peixe.onload = checar;

    imagens.gaivota = new Image();
    imagens.gaivota.src = "gaivota.png";
    imagens.gaivota.onload = checar;

    function checar() { if(--toLoad === 0) callback(imagens); }
}


document.addEventListener('DOMContentLoaded', function() {
    preloadImagens(function(imagens){
        
        ajustarCanvas();
        loopJogo(); 
    });
});
