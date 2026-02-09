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

    this.drawing =function () {
        ctx.drawImage(this.image,this.position[0],this.position[1])
        
    }


    this.anim=function(img,tick,frames){

        this.tick +=1;

        if (this.tick == tick){
            this.tick =0;
            this.frame +=1;
        }
        if (this.frame == frames){
            this.frame=1;
        }
        var newSrc = img+this.frame+'.png';
        if (this.image.src.indexOf(newSrc) === -1) {
            this.image.src = newSrc;
        }
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
    if (bg.position[0]>-773){
        bg.position[0] -=1
    }
    if (bg.position[0]==-773){
        bg.position[0]=0;
    }
    if (bg2.position[0]>0){
        bg2.position[0] -=1
    }
    if (bg2.position[0]==0){
        bg2.position[0]=774;
    }
    
}

function move_peixe(peixe,gaivota,gaivota2){
    // velocidade local, sem usar this e sem dividir por peixe.x
    var soma = gaivota.pontos + gaivota2.pontos;
    var base = 2;
    var incremento = Math.min(soma * 0.05, 12); // incremento limitado
    var velocidade = base + incremento;
    // proteção extra
    if (!isFinite(velocidade) || velocidade < 0) velocidade = base;

    peixe.position[1] -= velocidade;
    if (peixe.position[1]<=0 ){
        peixe.position[0] =800*Math.random()
        peixe.position[1] =750

    }

    // colisão por centros (mais robusto)
    var peixeCx = peixe.position[0] + (peixe.image.width || 32)/2;
    var peixeCy = peixe.position[1] + (peixe.image.height || 24)/2;
    var g1Cx = gaivota.position[0] + (gaivota.image.width || 86)/2;
    var g1Cy = gaivota.position[1] + (gaivota.image.height || 94)/2;
    var g2Cx = gaivota2.position[0] + (gaivota2.image.width || 86)/2;
    var g2Cy = gaivota2.position[1] + (gaivota2.image.height || 94)/2;

    var colisaoRaio = 50;

    function distancia(ax,ay,bx,by){
        var dx = ax-bx;
        var dy = ay-by;
        return Math.sqrt(dx*dx + dy*dy);
    }

    if(distancia(g1Cx,g1Cy,peixeCx,peixeCy) < colisaoRaio){
        peixe.position[0] =800*Math.random()
        peixe.position[1] =750
        gaivota.pontos +=1;
    }
    if(distancia(g2Cx,g2Cy,peixeCx,peixeCy) < colisaoRaio){
        peixe.position[0] =800*Math.random()
        peixe.position[1] =750
        gaivota2.pontos +=1;
    }

    if(velocidade >=15){
        peixe.x+=1
    }
    

}


var bg = new Obj('img_fundo/fundo2.png',0,0);
var bg2 = new Obj('img_fundo/fundo2.png',774,0);
var gaivota =new Obj('img_gaivota/gaivota1.png',100,200);
var gaivota2 =new Obj('img_gaivota2/gaivota1.png',400,200);
var peixe =new Obj("img_peixe/peixe1.png",774*Math.random(),750);

var placar = document.querySelector('h3');
console.log(placar)

// mover listener para fora do loop para não duplicar
document.addEventListener("mousemove",function(event){
    x = event.x;
    y = event.y;
    gaivota.move_gaivota(x,y);
})

function jogo(){
    
    bg.drawing();
    bg2.drawing();
    gaivota.drawing();
    gaivota2.drawing();
    peixe.drawing();
    move_bg(bg,bg2);
    gaivota.anim('img_gaivota/gaivota',4,6);
    gaivota2.anim('img_gaivota2/gaivota',4,6);
    peixe.anim("img_peixe/peixe",6,6);

    // variáveis locais e correção de precedência ao chamar degrau
    var somaP = gaivota.pontos + gaivota2.pontos;
    var x = gaivota.pontos;
    if(gaivota.pontos <=10){
        gaivota.pontos +=12;
    }
    
    if (peixe.position[1]<=560){
        // correção: média correta passada para degrau
        var fatorX = 0.0015 + somaP / 3500 + (degrau((gaivota.pontos + gaivota2.pontos)/2) * Math.abs(gaivota.pontos - gaivota2.pontos)) / 100;
        // limites para evitar teletransporte
        fatorX = Math.min(Math.max(fatorX, 0.001), 0.05);

        var fatorY = 0.0002 + somaP / 2000;
        fatorY = Math.min(Math.max(fatorY, 0.0005), 0.03);

        var novoX = (peixe.position[0]-gaivota2.position[0]) * fatorX + gaivota2.position[0];
        var novoY = (peixe.position[1]-gaivota2.position[1]) * fatorY + gaivota2.position[1];

        gaivota2.move_gaivota2(novoX, novoY);
    }
    if(x <=10){
        gaivota.pontos -=12;
    }
    move_peixe(peixe,gaivota,gaivota2);
    placar.textContent ="pontos Gaivota1 : "+gaivota.pontos + "  pontos Gaivota2 : "+gaivota2.pontos;
    requestAnimationFrame(jogo);

}
jogo()
