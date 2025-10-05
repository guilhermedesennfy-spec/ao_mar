const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);


function degrau(x){

    var e = (Math.E)**(x*0.2);
    var k = -((((x*0.2)-10)/e)**2)
    return ((Math.E)**(k))*1.8801

}

function Obj(image,x,y){
    
    var canvas = document.getElementById("canvas");
    var ctx =canvas.getContext("2d");
    this.image = new Image();
    this.image.src = image;
    this.position= [x,y];
    this.frame=1;
    this.tick =0
    this.pontos =0
    this.velocidade = 0
    this.x =2

   // 1 primeiro drawing 
  //  this.drawing = function () {
  //  const bufferCtx = canvas._bufferCtx;
   // const scaleX = canvas._buffer.width / 744;
   // const scaleY = canvas._buffer.height / 742;

  //  bufferCtx.save();
   // bufferCtx.translate((this.position[0] + this.image.width / 2) * scaleX, (this.position[1] + this.image.height / 2) * scaleY);
   // bufferCtx.rotate(isMobile ? Math.PI / 2 : 0);
   // bufferCtx.drawImage(
   //     this.image,
   //     -this.image.width / 2 * scaleX,
    //    -this.image.height / 2 * scaleY,
   //     this.image.width * scaleX,
   //     this.image.height * scaleY
   // );
    //bufferCtx.restore();
    //};
    this.drawing = function () {
    const bufferCtx = canvas._bufferCtx;
    const scaleX = canvas._buffer.width / 744;
    const scaleY = canvas._buffer.height / 742;

    bufferCtx.save();
    bufferCtx.translate(
        (this.position[0]) * scaleX,
        (this.position[1]) * scaleY
    );
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





    this.anim=function(img,tick,frames){

        this.tick +=1;

        if (this.tick == tick){
            this.tick =0;
            this.frame +=1;
        }
        if (this.frame == frames){
            this.frame=1;
        }
        this.image.src=img+this.frame+'.png'
    }
    this.move_gaivota = function(x,y){
        this.position[0]= x-43
        this.position[1]= y-47

    }
    this.move_gaivota2 = function(x,y){
        this.position[0]= x
        this.position[1]= y
    }
}
function move_bg(bg,bg2){
    if (bg.position[0]>=-744){
        bg.position[0] -=1;
    }
    if (bg.position[0]==-744){
        bg.position[0]=0;
    }
    if (bg2.position[0]>=0){
        bg2.position[0] -=1;
    }
    if (bg2.position[0]==0){
        bg2.position[0]=744;
    }
    
}

function move_peixe(peixe,gaivota,gaivota2){
    
    this.velocidade =2+(gaivota.pontos+gaivota2.pontos)/(2*peixe.x);
    peixe.position[1] -= this.velocidade
    if (peixe.position[1]<=0 ){
        peixe.position[0] =800*Math.random()
        peixe.position[1] =700

    }
    if(((gaivota.position[0]>peixe.position[0]-36 && gaivota.position[0]<peixe.position[0]+36)&&(gaivota.position[1]>peixe.position[1]-36 && gaivota.position[1]<peixe.position[1]+36))){
        peixe.position[0] =800*Math.random()
        peixe.position[1] =700
        gaivota.pontos +=1;
    }
    if(((gaivota2.position[0]>peixe.position[0]-36 && gaivota2.position[0]<peixe.position[0]+36)&&(gaivota2.position[1]>peixe.position[1]-36 && gaivota2.position[1]<peixe.position[1]+36))){
        peixe.position[0] =800*Math.random()
        peixe.position[1] =700
        gaivota2.pontos +=1;

    }
    if(this.velocidade >=15){
        peixe.x+=1
}
    

}

function ajustarCanvas() {
    const canvas = document.getElementById("canvas");
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
function normalizarObjetos(objetos) {
    const canvas = document.getElementById("canvas");
    objetos.forEach(obj => {
    
        obj.relX = obj.position[0] / canvas._buffer.width;
        obj.relY = obj.position[1] / canvas._buffer.height;
    });
}

function atualizarPosicoes(objetos) {
    const canvas = document.getElementById("canvas");
    objetos.forEach(obj => {
        
        obj.position[0] = obj.relX * canvas._buffer.width;
        obj.position[1] = obj.relY * canvas._buffer.height;
    });
}






let destinoToque = null;
let ultimoToque = 0;
let toqueAnterior = null;

function configurarControles() {
    const canvas = document.getElementById("canvas");
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice) {
        canvas.addEventListener("touchstart", atualizarDestino);
        canvas.addEventListener("touchmove", atualizarDestino);
        canvas.addEventListener("touchend", () => {
            toqueAnterior = null;
        });
    } else {
        document.addEventListener("mousemove", function(event) {
            const canvasRect = canvas.getBoundingClientRect();
            destinoToque = {
                x: event.clientX - canvasRect.left,
                y: event.clientY - canvasRect.top
            };
        });
    }
}




function atualizarDestino(event) {
    const canvas = document.getElementById("canvas");
    const canvasRect = canvas.getBoundingClientRect();
    const touch = event.touches[0];

    let x = touch.clientX - canvasRect.left;
    let y = touch.clientY - canvasRect.top;

    if (isMobile) {
        const rotatedX = y;
        const rotatedY = canvas.width - x;

        if (toqueAnterior) {
            const dx = rotatedX - toqueAnterior.x;
            const dy = rotatedY - toqueAnterior.y;

            destinoToque = {
                x: gaivota.position[0] + dx * 1.5, // fator de intensidade
                y: gaivota.position[1] + dy * 1.5
            };
        }

        toqueAnterior = { x: rotatedX, y: rotatedY };
    } else {
        destinoToque = {
            x: x,
            y: y - 80
        };
    }
}




function ativarFullscreen() {
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) {
        docEl.requestFullscreen();
    }
}




var bg = new Obj('img_fundo/fundo2.png',0,0);
var bg2 = new Obj('img_fundo/fundo2.png',744,0);
var gaivota =new Obj('img_gaivota/gaivota1.png',100,200);
var gaivota2 =new Obj('img_gaivota2/gaivota1.png',400,200);
var peixe =new Obj("img_peixe/peixe1.png",1.1*744*Math.random(),710);

ajustarCanvas()

var objetos = [bg, bg2, gaivota, gaivota2, peixe];
normalizarObjetos(objetos);

gaivota.pontos=0;
var placar = document.querySelector('h3');
console.log(placar)

//ajustarCanvas();subindo para atualizar o buffer antes
configurarControles();
//window.addEventListener("resize", ajustarCanvas);
window.addEventListener("resize", () => {
    ajustarCanvas();
    atualizarPosicoes(objetos);
});


function jogo() {

    if (isMobile) {
    canvas._bufferCtx.clearRect(0, 0, canvas._buffer.width, canvas._buffer.height);
    }


    
    
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
    placar.textContent = `pontos Gaivota1 : ${gaivota.pontos}  pontos Gaivota2 : ${gaivota2.pontos}`;
   
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
jogo()
