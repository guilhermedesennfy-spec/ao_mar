window.addEventListener("load", () => {
  const canvas = document.getElementById("canvas");
  const placar = document.querySelector("h3");
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  function degrau(x) {
    const e = Math.exp(x * 0.2);
    const k = -Math.pow(((x * 0.2) - 10) / e, 2);
    return Math.exp(k) * 1.8801;
  }

  function converterCoordenadas(vx, vy) {
    if (!isMobile) return { x: vx, y: vy };
    const bw = canvas._buffer.width;
    return { x: bw - vy, y: vx };
  }

  function Obj(src, x, y) {
    this.image = new Image();
    this.image.src = src;
    this.position = [x, y];
    this.frame = 1;
    this.tick = 0;
    this.pontos = 0;
    this.x = 2;

    this.drawing = () => {
      const ctxB = canvas._bufferCtx;
      const sx = canvas._buffer.width  / 744;
      const sy = canvas._buffer.height / 742;
      ctxB.drawImage(
        this.image,
        this.position[0] * sx,
        this.position[1] * sy,
        this.image.width  * sx,
        this.image.height * sy
      );
    };

    this.anim = (base, tMax, frames) => {
      this.tick++;
      if (this.tick === tMax) {
        this.tick = 0;
        this.frame = this.frame === frames ? 1 : this.frame + 1;
        this.image.src = `${base}${this.frame}.png`;
      }
    };

    this.move_gaivota = (x, y) => {
      this.position[0] = x - 43;
      this.position[1] = y - 47;
    };

    this.move_gaivota2 = (x, y) => {
      this.position[0] = x;
      this.position[1] = y;
    };
  }

  function move_bg(bg, bg2) {
    bg.position[0]  = bg.position[0]  > -744 ? bg.position[0]  - 1 : 0;
    bg2.position[0] = bg2.position[0] >    0 ? bg2.position[0] - 1 : 744;
  }

  function move_peixe(peixe, g1, g2) {
    const vel = 2 + (g1.pontos + g2.pontos) / (2 * peixe.x);
    peixe.position[1] -= vel;
    if (peixe.position[1] <= 0) {
      peixe.position = [800 * Math.random(), 700];
    }

    const colisao = g =>
      g.position[0] > peixe.position[0] - 36 &&
      g.position[0] < peixe.position[0] + 36 &&
      g.position[1] > peixe.position[1] - 36 &&
      g.position[1] < peixe.position[1] + 36;

    if (colisao(g1)) {
      g1.pontos++;
      peixe.position = [800 * Math.random(), 700];
    }
    if (colisao(g2)) {
      g2.pontos++;
      peixe.position = [800 * Math.random(), 700];
    }
    if (vel >= 15) peixe.x++;
  }

  function ajustarCanvas() {
    const ctx = canvas.getContext("2d");
    if (isMobile) {
      const buffer = document.createElement("canvas");
      buffer.width  = window.innerWidth;
      buffer.height = window.innerHeight;
      canvas.width  = buffer.height;
      canvas.height = buffer.width;
      canvas._ctx       = ctx;
      canvas._buffer    = buffer;
      canvas._bufferCtx = buffer.getContext("2d");
    } else {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas._ctx       = ctx;
      canvas._buffer    = canvas;
      canvas._bufferCtx = ctx;
    }
  }

  let destinoToque = null;
  let ultimoToque = Date.now();

  function configurarControles() {
    if (isMobile) {
      canvas.addEventListener("touchstart", atualizarDestino, { passive: false });
      canvas.addEventListener("touchmove",  atualizarDestino, { passive: false });
    } else {
      document.addEventListener("mousemove", e => {
        const r = canvas.getBoundingClientRect();
        destinoToque = converterCoordenadas(
          e.clientX - r.left,
          e.clientY - r.top
        );
      });
    }
  }

  function atualizarDestino(e) {
    e.preventDefault();
    const r = canvas.getBoundingClientRect();
    const t = e.touches[0];
    const vx = t.clientX - r.left;
    const vy = t.clientY - r.top;
    const { x: bx, y: by } = converterCoordenadas(vx, vy);
    const agora = Date.now();
    const dt = agora - ultimoToque;
    ultimoToque = agora;
    const f = dt > 150 ? 0.3 : 1;
    destinoToque = {
      x: bx * f + (destinoToque?.x || 0) * (1 - f),
      y: by * f + (destinoToque?.y || 0) * (1 - f)
    };
  }

  // Instancia os objetos
  const bg      = new Obj("img_fundo/fundo2.png", 0,   0);
  const bg2     = new Obj("img_fundo/fundo2.png", 744, 0);
  const gaivota  = new Obj("img_gaivota/gaivota1.png", 100, 200);
  const gaivota2 = new Obj("img_gaivota2/gaivota1.png", 400, 200);
  const peixe    = new Obj("img_peixe/peixe1.png", Math.random() * 744, 710);

  ajustarCanvas();
  configurarControles();
  window.addEventListener("resize", ajustarCanvas);

  

  function jogo() {
    // limpa buffer
    canvas._bufferCtx.clearRect(0, 0, canvas._buffer.width, canvas._buffer.height);

    // desenha tudo no buffer
    bg.drawing();   bg2.drawing();
    gaivota.drawing(); gaivota2.drawing();
    peixe.drawing();

    // lógica de movimento e animação
    move_bg(bg, bg2);
    gaivota.anim("img_gaivota/gaivota", 4, 6);
    gaivota2.anim("img_gaivota2/gaivota", 4, 6);
    peixe.anim("img_peixe/peixe", 6, 6);

    // gaivota2 persegue o peixe quando alto o suficiente
    if (peixe.position[1] <= 560) {
      const dx = peixe.position[0] - gaivota2.position[0];
      const dy = peixe.position[1] - gaivota2.position[1];
      const fx = 0.0015 + (gaivota.pontos + gaivota2.pontos) / 3500 +
        (degrau((gaivota.pontos + gaivota2.pontos) / 2) *
         Math.abs(gaivota.pontos - gaivota2.pontos)) / 100;
      const fy = 0.0002 + (gaivota.pontos + gaivota2.pontos) / 2000;
      gaivota2.move_gaivota2(
        gaivota2.position[0] + dx * fx,
        gaivota2.position[1] + dy * fy
      );
    }

    // gaivota1 segue o destinoToque
    if (destinoToque) {
      const s = 0.2;
      const dx = destinoToque.x - gaivota.position[0];
      const dy = destinoToque.y - gaivota.position[1];
      gaivota.move_gaivota(
        gaivota.position[0] + dx * s,
        gaivota.position[1] + dy * s
      );
    }

    // atualiza peixe e colisões
    move_peixe(peixe, gaivota, gaivota2);

    // atualiza placar
    placar.textContent = `Gaivota1: ${gaivota.pontos}   Gaivota2: ${gaivota2.pontos}`;

    // copia buffer para o canvas visível
    const ctxVis = canvas._ctx;
    ctxVis.save();
    ctxVis.clearRect(0, 0, canvas.width, canvas.height);

    if (isMobile) {
      ctxVis.translate(0, canvas.height);
      ctxVis.rotate(-Math.PI / 2);
    }

    ctxVis.drawImage(canvas._buffer, 0, 0);
    ctxVis.restore();

    // agendamento único de próximo frame
    requestAnimationFrame(jogo);
  }
  // dispara o loop pela primeira vez
  jogo();
});
