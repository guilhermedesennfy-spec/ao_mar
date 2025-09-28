function Gaivota(image,x,y){
    
    var canvas = document.getElementById("canvas");
    var ctx =canvas.getContext("2d");
    this.image = new Image();
    this.image.src = image;
    this.position= [x,y];
    this.frame=1;
    this.tick =0

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

    this.move = function(event){
        this.position[0]= event.x
        this.position[1]= event.y

    }

}

