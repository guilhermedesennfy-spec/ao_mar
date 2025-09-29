

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
    if (bg.position[0]>=-window.innerWidth){
        bg.position[0] -=1;
    }
    if (bg.position[0]==-window.innerWidth){
        bg.position[0]=0;
    }
    if (bg2.position[0]>=0){
        bg2.position[0] -=1;
    }
    if (bg2.position[0]==0){
        bg2.position[0]=window.innerWidth;
    }
    
}

function move_peixe(peixe,gaivota,gaivota2){
    
    this.velocidade =2+(gaivota.pontos+gaivota2.pontos)/(2*peixe.x);
    peixe.position[1] -= this.velocidade
    if (peixe.position[1]<=0 ){
        peixe.position[0] =800*Math.random()
        peixe.position[1] =750

    }
    if(((gaivota.position[0]>peixe.position[0]-36 && gaivota.position[0]<peixe.position[0]+36)&&(gaivota.position[1]>peixe.position[1]-36 && gaivota.position[1]<peixe.position[1]+36))){
        peixe.position[0] =800*Math.random()
        peixe.position[1] =750
        gaivota.pontos +=1;
    }
    if(((gaivota2.position[0]>peixe.position[0]-36 && gaivota2.position[0]<peixe.position[0]+36)&&(gaivota2.position[1]>peixe.position[1]-36 && gaivota2.position[1]<peixe.position[1]+36))){
        peixe.position[0] =800*Math.random()
        peixe.position[1] =750
        gaivota2.pontos +=1;

    }
    if(this.velocidade >=15){
        peixe.x+=1
}
    

}
function ajustarCanvas() {
    const canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
function configurarControles() {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice) {
        let lastTouch = null;
        document.addEventListener("touchmove", function(event) {
            const touch = event.touches[0];
            if (lastTouch) {
                const deltaX = touch.clientX - lastTouch.clientX;
                const deltaY = touch.clientY - lastTouch.clientY;
                gaivota.move_gaivota(gaivota.position[0] + deltaX*0.01, gaivota.position[1] - deltaY*0.01);
            }
            lastTouch = touch;
        });
    } else {
        document.addEventListener("mousemove", function(event) {
            gaivota.move_gaivota(event.clientX, event.clientY);
        });
    }
}


var bg = new Obj('img_fundo/fundo2.png',0,0);
var bg2 = new Obj('img_fundo/fundo2.png',window.innerWidth,0);
var gaivota =new Obj('img_gaivota/gaivota1.png',0.13*window.innerWidth,0.27*window.innerHeight);
var gaivota2 =new Obj('img_gaivota2/gaivota1.png',0.26*window.innerWidth,0.27*window.innerHeight);
var peixe =new Obj("img_peixe/peixe1.png",1.1*window.innerWidth*Math.random(),1.2*window.innerHeight);

var placar = document.querySelector('h3');
console.log(placar)

ajustarCanvas();
configurarControles();
window.addEventListener("resize", ajustarCanvas);

//function jogo(){
    
//    bg.drawing();
//    bg2.drawing();
//    gaivota.drawing();
//    gaivota2.drawing();
//    peixe.drawing();
//    move_bg(bg,bg2);
//    gaivota.anim('img_gaivota/gaivota',4,6);
//    gaivota2.anim('img_gaivota2/gaivota',4,6);
//   peixe.anim("img_peixe/peixe",6,6);

//   document.addEventListener("mousemove",function(event){
//        x = event.x;
//        y = event.y;
//        gaivota.move_gaivota(x,y);
//    })
//    var x =gaivota.pontos;
//    if(gaivota.pontos <=10){
//       gaivota.pontos +=12;
//    }
    
//    if (peixe.position[1]<=560){
//        gaivota2.move_gaivota2((peixe.position[0]-gaivota2.position[0])*(0.0015+(gaivota.pontos+gaivota2.pontos)/3500+(degrau((gaivota.pontos+gaivota2.pontos/2))*(Math.abs(gaivota.pontos-gaivota2.pontos)))/100)+gaivota2.position[0],(peixe.position[1]-gaivota2.position[1])*(0.0002+(gaivota.pontos+gaivota2.pontos)/2000)+gaivota2.position[1])

//    }
//   if(x <=10){
//        gaivota.pontos -=12;
//    }
//    move_peixe(peixe,gaivota,gaivota2);
//    placar.textContent ="pontos Gaivota1 : "+gaivota.pontos + "  pontos Gaivota2 : "+gaivota2.pontos;
//    requestAnimationFrame(jogo);

//}
function jogo() {
    bg.drawing();
    bg2.drawing();
    gaivota.drawing();
    gaivota2.drawing();
    peixe.drawing();

    move_bg(bg, bg2);
    gaivota.anim('img_gaivota/gaivota', 4, 6);
    gaivota2.anim('img_gaivota2/gaivota', 4, 6);
    peixe.anim("img_peixe/peixe", 6, 6);

    if (gaivota.pontos <= 10) gaivota.pontos += 12;

    if (peixe.position[1] <= 560) {
        const dx = peixe.position[0] - gaivota2.position[0];
        const dy = peixe.position[1] - gaivota2.position[1];
        const fatorX = 0.0015 + (gaivota.pontos + gaivota2.pontos) / 3500 + (degrau((gaivota.pontos + gaivota2.pontos / 2)) * Math.abs(gaivota.pontos - gaivota2.pontos)) / 100;
        const fatorY = 0.0002 + (gaivota.pontos + gaivota2.pontos) / 2000;
        gaivota2.move_gaivota2(dx * fatorX + gaivota2.position[0], dy * fatorY + gaivota2.position[1]);
    }

    if (gaivota.pontos <= 10) gaivota.pontos -= 12;

    move_peixe(peixe, gaivota, gaivota2);
    placar.textContent = `pontos Gaivota1 : ${gaivota.pontos}  pontos Gaivota2 : ${gaivota2.pontos}`;

    requestAnimationFrame(jogo);
}
jogo()
