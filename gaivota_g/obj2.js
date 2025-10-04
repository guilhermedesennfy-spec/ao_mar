window.addEventListener("load", init);

let canvas, ctx, buffer, bctx, scaleX, scaleY;
let pointer = { x: 0, y: 0 };
let isMobile;
const WORLD_W = 744;
const WORLD_H = 742;

// Asset containers
let bgImgs = [];
let g1Imgs = [];
let g2Imgs = [];
let fishImgs = [];

// Entities
let bg1, bg2, gull1, gull2, fish;
let scores = { g1: 0, g2: 0 };

// Entry point
function init() {
  canvas   = document.getElementById("canvas");
  ctx      = canvas.getContext("2d");
  isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // offscreen buffer
  buffer = document.createElement("canvas");
  bctx   = buffer.getContext("2d");

  adjustCanvas();
  window.addEventListener("resize", adjustCanvas);

  setupInput();
  loadAssets().then(startGame);
}

// Adjust sizes and scaling
function adjustCanvas() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (isMobile) {
    buffer.width  = vh;
    buffer.height = vw;
    canvas.width  = vh;
    canvas.height = vw;
  } else {
    buffer.width  = vw;
    buffer.height = vh;
    canvas.width  = vw;
    canvas.height = vh;
  }
  scaleX = buffer.width  / WORLD_W;
  scaleY = buffer.height / WORLD_H;
}

// Pointer input (mouse or touch)
function setupInput() {
  canvas.addEventListener("pointermove", e => {
    const r = canvas.getBoundingClientRect();
    let x = e.clientX - r.left;
    let y = e.clientY - r.top;
    if (isMobile) {
      // rotate coords 90° anticlockwise
      [x, y] = [y, canvas.width - x];
    }
    pointer.x = x / scaleX;
    pointer.y = y / scaleY;
  });
}

// Load all images
async function loadAssets() {
  function load(src) {
    return new Promise(res => {
      const img = new Image();
      img.onload = () => res(img);
      img.src   = src;
    });
  }

  bgImgs = await Promise.all([
    load("img_fundo/fundo2.png"),
    load("img_fundo/fundo2.png")
  ]);

  g1Imgs = await Promise.all(
    Array.from({ length: 6 }, (_, i) => load(`img_gaivota/gaivota${i+1}.png`))
  );
  g2Imgs = await Promise.all(
    Array.from({ length: 6 }, (_, i) => load(`img_gaivota2/gaivota${i+1}.png`))
  );
  fishImgs = await Promise.all(
    Array.from({ length: 6 }, (_, i) => load(`img_peixe/peixe${i+1}.png`))
  );
}

// Start the game after assets loaded
function startGame() {
  initEntities();
  requestAnimationFrame(gameLoop);
}

// Initialize entity objects
function initEntities() {
  bg1    = new Background(bgImgs,   0,     0);
  bg2    = new Background(bgImgs,   WORLD_W,0);
  gull1  = new Animated(g1Imgs,   100,   200, 4);
  gull2  = new Animated(g2Imgs,   400,   200, 4);
  fish   = new Animated(fishImgs, Math.random() * WORLD_W, 710, 6);
  scores = { g1: 0, g2: 0 };
}

// Base animated sprite
class Animated {
  constructor(frames, x, y, tickMax) {
    this.frames   = frames;
    this.pos      = { x, y };
    this.tick     = 0;
    this.idx      = 0;
    this.tickMax  = tickMax;
  }
  updateAnim() {
    if (++this.tick >= this.tickMax) {
      this.tick = 0;
      this.idx  = (this.idx + 1) % this.frames.length;
    }
  }
  draw(ctx) {
    const img = this.frames[this.idx];
    ctx.drawImage(
      img,
      this.pos.x * scaleX,
      this.pos.y * scaleY,
      img.width  * scaleX,
      img.height * scaleY
    );
  }
}

// Background class for seamless scroll
class Background {
  constructor(frames, x, y) {
    this.frames  = frames;
    this.pos     = { x, y };
  }
  update() {
    this.pos.x -= 1;
    if (this.pos.x <= -WORLD_W) this.pos.x = WORLD_W;
  }
  draw(ctx) {
    const img = this.frames[0];
    ctx.drawImage(
      img,
      this.pos.x * scaleX,
      this.pos.y * scaleY,
      img.width  * scaleX,
      img.height * scaleY
    );
  }
}

// Game loop
function gameLoop() {
  update();
  drawBuffer();
  renderToScreen();
  requestAnimationFrame(gameLoop);
}

// Update all game logic
function update() {
  // background
  bg1.update();
  bg2.update();

  // animations
  bg1.draw(bctx); // no anim tick for bg, single frame
  bg2.draw(bctx);
  gull1.updateAnim();
  gull2.updateAnim();
  fish.updateAnim();

  // fish movement & collisions
  updateFish();

  // seagull2 AI chase
  updateGull2();

  // seagull1 follows pointer
  updateGull1();
}

// Move fish and detect catches
function updateFish() {
  const speed = 2 + (scores.g1 + scores.g2) / 4;
  fish.pos.y -= speed;
  if (fish.pos.y <= 0) {
    fish.pos.x = Math.random() * WORLD_W;
    fish.pos.y = WORLD_H;
  }

  function hit(g, key) {
    const dx = Math.abs(g.pos.x - fish.pos.x);
    const dy = Math.abs(g.pos.y - fish.pos.y);
    return dx < 36 && dy < 36;
  }
  if (hit(gull1, "g1")) {
    scores.g1++;
    fish.pos.x = Math.random() * WORLD_W;
    fish.pos.y = WORLD_H;
  }
  if (hit(gull2, "g2")) {
    scores.g2++;
    fish.pos.x = Math.random() * WORLD_W;
    fish.pos.y = WORLD_H;
  }
}

// Seagull2 AI
function updateGull2() {
  if (fish.pos.y <= WORLD_H * 0.75) {
    const dx = fish.pos.x - gull2.pos.x;
    const dy = fish.pos.y - gull2.pos.y;
    const fx = 0.001 + (scores.g1 + scores.g2) / 3000
              + (degrau((scores.g1 + scores.g2) / 2) *
                Math.abs(scores.g1 - scores.g2)) / 200;
    const fy = 0.0002 + (scores.g1 + scores.g2) / 2000;
    gull2.pos.x += dx * fx;
    gull2.pos.y += dy * fy;
  }
}

// Seagull1 follows pointer
function updateGull1() {
  const s = 0.2;
  gull1.pos.x += (pointer.x - gull1.pos.x) * s;
  gull1.pos.y += (pointer.y - gull1.pos.y) * s;
}

// Draw everything onto the offscreen buffer
function drawBuffer() {
  bctx.clearRect(0, 0, buffer.width, buffer.height);
  bg1.draw(bctx);
  bg2.draw(bctx);
  fish.draw(bctx);
  gull2.draw(bctx);
  gull1.draw(bctx);
}

// Copy buffer to main canvas, rotating on mobile
function renderToScreen() {
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (isMobile) {
    ctx.translate(0, canvas.height);
    ctx.rotate(-Math.PI / 2);
  }
  ctx.drawImage(buffer, 0, 0);
  // update score display
  document.querySelector("h3").textContent =
    `G1: ${scores.g1}   G2: ${scores.g2}`;
  ctx.restore();
}
