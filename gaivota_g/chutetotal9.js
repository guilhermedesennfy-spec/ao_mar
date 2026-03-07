
const isMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);


const BASE_W = 800;
const BASE_H = 2000;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const W = canvas.width;
const H = canvas.height;

//const scaleX = W / BASE_W;
//const scaleY = H / BASE_H;
const scaleX = W / BASE_W;
const scaleY = H / BASE_H;

const scale = (Math.min(scaleX*1.5, scaleY*1.5));


function degrau(x){
    const e = Math.E ** (x * 0.2);
    const k = -((((x * 0.2) - 10) / e) ** 2);
    return (Math.E ** k) * 9;//1.2;//1.6;//1.8801;
}


function Obj(image, x, y){
    this.image = new Image();
    this.image.src = image;

    this.position = [x * scale, y * scale];
    this.frame = 1;
    this.tick = 0;
    this.pontos = 0;
    this.velocidade = 0;
    this.x = 2;

    this.drawing = function(){
        if ((this.image ==bg.image)){
            ctx.drawImage(
            this.image,
            this.position[0],
            this.position[1],
            W,H//this.image.width * scale,
            //this.image.height * scale
        );
        }else if((this.image ==bg2.image)){
            ctx.drawImage(
            this.image,
            this.position[0],
            this.position[1],
            W,H//this.image.width * scale,
            //this.image.height * scale
        );}else{
        ctx.drawImage(
            this.image,
            this.position[0],
            this.position[1],
            this.image.width * scale,
            this.image.height * scale
        );}
    };

    this.anim = function(img, tick, frames){
        this.tick++;
        if (this.tick === tick){
            this.tick = 0;
            this.frame++;
        }
        if (this.frame === frames){
            this.frame = 1;
        }
        this.image.src = img + this.frame + ".png";
    };

    this.move_gaivota = function(x, y){
        this.position[0] = x - (43 * scale);
        this.position[1] = y - (47 * scale);
    };

    this.move_gaivota2 = function(x, y){
        this.position[0] = x;
        this.position[1] = y;
    };
}


function move_bg(bg, bg2){
    const limite = -773 * scale;

    if (bg.position[0] > limite){
        bg.position[0] -= 1 * scale;
    } else {
        bg.position[0] = 0;
    }

    if (bg2.position[0] > 0){
        bg2.position[0] -= 1 * scale;
    } else {
        bg2.position[0] = 774 * scale;
    }
}


function move_peixe(peixe, gaivota, gaivota2){
    const soma = gaivota.pontos + gaivota2.pontos;

    peixe.velocidade = (2 + soma / (2 * peixe.x)) * scale;
    peixe.position[1] -= peixe.velocidade;

    if (peixe.position[1] <= 0){
        peixe.position[0] = W * Math.random();
        peixe.position[1] = H - (50 * scale);
    }

    const hitbox = 36 * scale;

    if (Math.abs(gaivota.position[0] - peixe.position[0]) < hitbox &&
        Math.abs(gaivota.position[1] - peixe.position[1]) < hitbox){
        peixe.position[0] = W * Math.random();
        peixe.position[1] = H - (50 * scale);
        gaivota.pontos++;
    }

    if (Math.abs(gaivota2.position[0] - peixe.position[0]) < hitbox &&
        Math.abs(gaivota2.position[1] - peixe.position[1]) < hitbox){
        peixe.position[0] = W * Math.random();
        peixe.position[1] = H - (50 * scale);
        gaivota2.pontos++;
    }
}


var bg = new Obj("img_fundo/fundo2.png", 0, 0);
var bg2 = new Obj("img_fundo/fundo2.png", 774, 0);
var gaivota = new Obj("img_gaivota/gaivota1.png", 100, 200);
var gaivota2 = new Obj("img_gaivota2/gaivota1.png", 400, 200);
var peixe = new Obj("img_peixe/peixe1.png", 774 * Math.random(), 750);

var placar = document.querySelector("h3");




function jogo(){
    ctx.clearRect(0, 0, W, H);
    bg.drawing();
    bg2.drawing();
    gaivota.drawing();
    gaivota2.drawing();
    peixe.drawing();

    move_bg(bg, bg2);

    gaivota.anim("img_gaivota/gaivota", 4, 6);
    gaivota2.anim("img_gaivota2/gaivota", 4, 6);
    peixe.anim("img_peixe/peixe", 6, 6);
  // ======= CONTROLES (MOUSE E TOUCH) =======
  if (!isMobile){
        document.addEventListener("mousemove", (event)=>{
        gaivota.move_gaivota(event.clientX, event.clientY);
      });
    } else {
      document.addEventListener("touchmove", (e)=>{
        const t = e.touches[0];
        if (t) gaivota.move_gaivota(t.clientX, t.clientY);
        e.preventDefault();
      }, { passive: false });

      document.addEventListener("touchend", (e)=>{
        const t = e.changedTouches[0];
        if (t) gaivota.move_gaivota(t.clientX, t.clientY);
      });
    }

    if (peixe.position[1] <= H * scale){
        gaivota2.move_gaivota2(
            (peixe.position[0] - gaivota2.position[0]) *
            (0.0018 + (gaivota.pontos + gaivota2.pontos) / 3500 +
            (degrau((gaivota.pontos + gaivota2.pontos) / 2) *
            Math.abs(gaivota.pontos - gaivota2.pontos)) / 100) +
            gaivota2.position[0],

            (peixe.position[1] - gaivota2.position[1]) *
            (0.00032 + (gaivota.pontos + gaivota2.pontos) / 2000) +
            gaivota2.position[1]
        );
    }

    move_peixe(peixe, gaivota, gaivota2);

    placar.textContent =
        "pontos Gaivota1 : " + gaivota.pontos +
        "  pontos Gaivota2 : " + gaivota2.pontos;

    requestAnimationFrame(jogo);
}

jogo();
