window.addEventListener("load", () => {
  // Canvas e contexto
  const canvas = document.getElementById("canvas");
  let ctx, buffer, bctx, scaleX, scaleY;

  // Tamanho do mundo lógico
  const WORLD_W = 744;
  const WORLD_H = 742;

  // Detecta mobile
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Entradas (mouse ou toque)
  const input = { x: WORLD_W / 2, y: WORLD_H / 2 };

  // Entidades do jogo
  let bg1, bg2, gull1, gull2, fish;
  const scores = { gull1: 0, gull2: 0 };

  // Assets (imagens)
  const paths = {
    bg:       ["img_fundo/fundo2.png", "img_fundo/fundo2.png"],
    gull1:    Array.from({ length: 6 }, (_, i) => `img_gaivota/gaivota${i+1}.png`),
    gull2:    Array.from({ length: 6 }, (_, i) => `img_gaivota2/gaivota${i+1}.png`),
    fish:     Array.from({ length: 6 }, (_, i) => `img_peixe/peixe${i+1}.png`)
  };
  const assets = { bg: [], gull1: [], gull2: [], fish: [] };

  // Inicializa canvas e buffer
  function initCanvas() {
    ctx = canvas.getContext("2d");
    if (isMobile) {
      buffer = document.createElement("canvas");
      buffer.width  = window.innerWidth;
      buffer.height = window.innerHeight;
      canvas.width  = buffer.height;
      canvas.height = buffer.width;
      bctx = buffer.getContext("2d");
    } else {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      buffer = canvas;
      bctx = ctx;
    }
    // escala do mundo lógico para pixels
    scaleX = canvas._buffer
      ? canvas._buffer.width  / WORLD_W
      : canvas.width  / WORLD_W;
    scaleY = canvas._buffer
      ? canvas._buffer.height / WORLD_H
      : canvas.height / WORLD_H;
  }

  // Carrega uma única imagem
  function loadImage(src) {
    return new Promise(res => {
      const img = new Image();
      img.onload = () => res(img);
      img.src = src;
    });
  }

  // Carrega todos os assets
  async function loadAssets() {
    // fundo
    assets.bg = await Promise.all(paths.bg.map(loadImage));
    // gull1, gull2, peixe
    assets.gull1 = await Promise.all(paths.gull1.map(loadImage));
    assets.gull2 = await Promise.all(paths.gull2.map(loadImage));
    assets.fish  = await Promise.all(paths.fish.map(loadImage));
  }

  // Entidade genérica com animação de frames
  class Sprite {
    constructor(frames, x, y, frameTick = 6) {
      this.frames = frames;
      this.pos    = { x, y };
      this.tick   = 0;
      this.idx    = 0;
      this.frameTick = frameTick;
    }
    updateAnim() {
      if (++this.tick >= this.frameTick) {
        this.tick = 0;
        this.idx  = (this.idx + 1) % this.frames.length;
      }
    }
    draw(context) {
      const img = this.frames[this.idx];
      context.drawImage(
        img,
        this.pos.x * scaleX,
        this.pos.y * scaleY,
        img.width * scaleX,
        img.height * scaleY
      );
    }
  }

  // Inicializa entidades após carregar assets
  function setupEntities() {
    bg1   = new Sprite(assets.bg,   0,   0,  1);
    bg2   = new Sprite(assets.bg,   WORLD_W, 0, 1);
    gull1 = new Sprite(assets.gull1, 100, 200, 4);
    gull2 = new Sprite(assets.gull2, 400, 200, 4);
    fish  = new Sprite(assets.fish,  Math.random() * WORLD_W, 710, 6);
  }

  // Configura controles de mouse e toque (pointerevents unificam ambos)
  function initControls() {
    canvas.addEventListener("pointermove", e => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      let x = e.clientX - rect.left;
      let y = e.clientY - rect.top;
      if (isMobile) {
        // converte coords rotacionadas 90° anti-horário
        const ww = canvas.width, hh = canvas.height;
        ;[x, y] = [y, ww - x];
      }
      // mapeia para mundo lógico
      input.x = x / scaleX;
      input.y = y / scaleY;
    });
  }

  // Move fundo em looping
  function updateBackground() {
    bg1.pos.x -= 1;
    if (bg1.pos.x <= -WORLD_W) bg1.pos.x = 0;
    bg2.pos.x -= 1;
    if (bg2.pos.x <= 0) bg2.pos.x = WORLD_W;
  }

  // Move peixe e trata colisões
  function updateFish() {
    const speed = 2 + (scores.gull1 + scores.gull2) / 4;
    fish.pos.y -= speed;
    if (fish.pos.y <= 0) {
      fish.pos.x = Math.random() * WORLD_W;
      fish.pos.y = WORLD_H;
    }

    function hit(gull, key) {
      const gx = gull.pos.x, gy = gull.pos.y;
      const px = fish.pos.x, py = fish.pos.y;
      return gx > px - 36 && gx < px + 36 && gy > py - 36 && gy < py + 36;
    }

    if (hit(gull1, "gull1")) {
      scores.gull1++;
      fish.pos.x = Math.random() * WORLD_W;
      fish.pos.y = WORLD_H;
    }
    if (hit(gull2, "gull2")) {
      scores.gull2++;
      fish.pos.x = Math.random() * WORLD_W;
      fish.pos.y = WORLD_H;
    }
  }

  // Gaivota 2 persegue o peixe
  function updateGull2() {
    if (fish.pos.y <= WORLD_H * 0.75) {
      const dx = fish.pos.x - gull2.pos.x;
      const dy = fish.pos.y - gull2.pos.y;
      const fx = 0.001 + (scores.gull1 + scores.gull2) / 3000
                + (degrau((scores.gull1 + scores.gull2) / 2)
                   * Math.abs(scores.gull1 - scores.gull2)) / 200;
      const fy = 0.0002 + (scores.gull1 + scores.gull2) / 2000;
      gull2.pos.x += dx * fx;
      gull2.pos.y += dy * fy;
    }
  }

  // Gaivota 1 segue o input
  function updateGull1() {
    const s = 0.2;
    gull1.pos.x += (input.x - gull1.pos.x) * s;
    gull1.pos.y += (input.y - gull1.pos.y) * s;
  }

  // Atualização de todas as entidades
  function update() {
    updateBackground();
    bg1.updateAnim();
    bg2.updateAnim();
    gull1.updateAnim();
    gull2.updateAnim();
    fish.updateAnim();
    updateFish();
    updateGull2();
    updateGull1();
  }

  // Desenha tudo no buffer
  function drawBuffer() {
    bctx.clearRect(0, 0, buffer.width, buffer.height);
    // fundo duplo
    bg1.draw(bctx);
    bg2.draw(bctx);
    // sprites
    fish.draw(bctx);
    gull2.draw(bctx);
    gull1.draw(bctx);
  }

  // Render no canvas visível (rotaciona se mobile)
  function render() {
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (isMobile) {
      ctx.translate(0, canvas.height);
      ctx.rotate(-Math.PI / 2);
    }
    ctx.drawImage(buffer, 0, 0);
    ctx.restore();
    // placar
    placar.textContent = `G1: ${scores.gull1}   G2: ${scores.gull2}`;
  }

  // Loop principal
  function loop() {
    update();
    drawBuffer();
    render();
    requestAnimationFrame(loop);
  }

  // Inicia tudo
  (async function start() {
    initCanvas();
    window.addEventListener("resize", initCanvas);
    await loadAssets();
    setupEntities();
    initControls();
    requestAnimationFrame(loop);
  })();
});
