let bgImg, instrucImg, settingsImg, musicCreditsImg, musicSlider, bgMusic;
let btnImages = {}, buttons = [], currentScreen = "menu", assetsLoaded = false;

const CX = 640, CY = 360, TOL = 18, WIN = 12, PASSES = 2, PIZZAS = 3, PATH_PTS = 60;
const WAVE = [0, 28, 42];
let lvState = 'READY', lvPass = 0, lvPizza = 0, lvPath = [], lvIdx = 0, lvScores = [], lvTrail = [];
let lvTimer = 0, lvTotal = 0, lvDoughR = 180, lvPinX = 640, lvPinY = 600, lvGrabX = 0, lvGrabY = 0;
let lvArmed = false, lvMsg = '', lvMsgGood = true, lvQuals = [], lvAll = [], lvWood;

const inRect = (x, y, w, h) => mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
const hit = b => mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h;
const lvSeg = (a, b) => {
  const dx = b.x - a.x, dy = b.y - a.y, t = constrain(((lvPinX - a.x) * dx + (lvPinY - a.y) * dy) / (dx * dx + dy * dy), 0, 1);
  return dist(lvPinX, lvPinY, a.x + t * dx, a.y + t * dy);
};
const lvAccuracy = () => lvScores.slice(0, lvIdx + 1).reduce((a, b) => a + b, 0) / (lvIdx + 1);

async function setup() {
  createCanvas(1280, 720);
  try { drawingContext.canvas.style.touchAction = 'none'; } catch (err) {}
  musicSlider = createSlider(0, 100, 50);
  musicSlider.hide();
  bgMusic = loadSound('soundtrack.mp3', () => {
    console.log("Music loaded successfully!");
    bgMusic.loop();
  });
  bgImg = await loadImage('background.png');
  for (const k of ['stats', 'play', 'settings', 'music']) btnImages[k] = await loadImage(k + '.png');
  instrucImg = await loadImage('Instructions 1.png');
  settingsImg = await loadImage('Settings page.png');
  musicCreditsImg = await loadImage('Music Credits.png');
  buttons = [
    { key: "stats", x: 40, y: 410, w: 340, h: 345, target: "stats" },
    { key: "play", x: 350, y: 420, w: 310, h: 300, target: "play" },
    { key: "settings", x: 660, y: 410, w: 320, h: 310, target: "settings" },
    { key: "music", x: 970, y: 400, w: 290, h: 350, target: "music" }
  ];
  lvWood = lvMakeWood();
  assetsLoaded = true;
}

function draw() {
  background(220);
  if (!assetsLoaded) {
    background(50); fill(255); textAlign(CENTER, CENTER); textSize(24);
    text("Loading assets...", width / 2, height / 2);
    return;
  }
  if (currentScreen === "settings") {
    musicSlider.show();
    musicSlider.position(width / 2 - 77.5, height / 2 + 10);
    musicSlider.style('width', '150px');
  } else musicSlider.hide();

  if (currentScreen === "menu") {
    image(bgImg, 0, 0, width, height);
    buttons.forEach(b => {
      push();
      if (hit(b)) tint(255, 200, 200); else noTint();
      image(btnImages[b.key], b.x, b.y, b.w, b.h);
      pop();
    });
    drawTitle();
  } else if (currentScreen === "level1_instructions") {
    image(instrucImg, 0, 0, width, height);
  } else if (currentScreen === "level1") {
    try { runLevel(); } catch (e) { lvCrash(e); }
  } else if (currentScreen === "settings") image(settingsImg, 0, 0, width, height);
  else if (currentScreen === "music_credits") image(musicCreditsImg, 0, 0, width, height);

  if (bgMusic) bgMusic.setVolume(musicSlider.value() / 100);
}

function mousePressed() {
  if (!assetsLoaded) return;
  loop();
  userStartAudio();
  const back = inRect(20, 20, 140, 60);
  if (currentScreen === "menu") {
    buttons.forEach(b => { if (hit(b)) handleButtonPress(b.target); });
  } else if (currentScreen === "level1_instructions") {
    if (back) currentScreen = "menu"; else startLevel();
  } else if (currentScreen === "level1") {
    if (back) currentScreen = "menu"; else if (lvState === 'NEXT_STAGE') goToNextStage();
  } else if ((currentScreen === "settings" || currentScreen === "music_credits") && back) {
    currentScreen = "menu";
  }
}

function handleButtonPress(target) {
  console.log("Clicked button: " + target);
  const screens = { play: "level1_instructions", settings: "settings", music: "music_credits" };
  if (screens[target]) currentScreen = screens[target];
}

function drawTitle() {
  push();
  lvPill(CX - 330, 40, 660, 110, color(200, 50, 40));
  lvPill(CX - 316, 52, 632, 86, color(255, 236, 170));
  textAlign(CENTER, CENTER); textFont('Georgia'); textStyle(BOLDITALIC); textSize(64);
  fill(255, 190, 90); text("Fulton's Pizzeria", CX + 3, 98);
  fill(120, 50, 15); text("Fulton's Pizzeria", CX, 95);
  pop();
}

function goToNextStage() { currentScreen = "menu"; }

function lvCrash(e) {
  console.error(e);
  resetMatrix(); noStroke(); fill(0, 220); rect(40, 180, width - 80, 340, 16);
  fill(255, 130, 130); textAlign(LEFT, TOP); textSize(22);
  text('Level error - please screenshot this:\n' + (e && e.message ? e.message : e) + '\n' +
       (e && e.stack ? String(e.stack).split('\n').slice(0, 4).join('\n') : ''), 60, 200, width - 120, 300);
  noLoop();
}

function startLevel() {
  lvState = 'READY'; lvPass = 0; lvPizza = 0; lvTotal = 0; lvDoughR = 180; lvQuals = []; lvAll = []; lvArmed = false;
  lvNewPath();
  currentScreen = "level1";
}

function lvNewPath() {
  const wave = WAVE[min(lvPizza, WAVE.length - 1)];
  lvPath = [];
  for (let i = 0; i < PATH_PTS; i++) {
    const t = i / (PATH_PTS - 1), w = wave * sin(t * TWO_PI);
    lvPath.push(lvPass % 2 === 0 ? { x: CX + w, y: lerp(600, 150, t) } : { x: lerp(CX - 300, CX + 300, t), y: CY + w });
  }
  lvIdx = 0; lvScores = Array(PATH_PTS).fill(1); lvTrail = [];
  lvPinX = lvPath[0].x; lvPinY = lvPath[0].y;
}

function lvOverPin() {
  const h = lvPass % 2 === 0;
  return abs(mouseX - lvPinX) <= (h ? 260 : 50) && abs(mouseY - lvPinY) <= (h ? 50 : 260);
}

function lvUpdate() {
  const n = lvPath.length;
  if (lvState === 'READY') {
    if (!mouseIsPressed) lvArmed = true;
    else if (lvArmed && lvOverPin()) { lvGrabX = lvPinX - mouseX; lvGrabY = lvPinY - mouseY; lvState = 'GREEN'; }
  } else if (lvState === 'GREEN' || lvState === 'RED') {
    if (!mouseIsPressed) { lvNewPath(); lvState = 'READY'; lvArmed = false; return; }
    lvPinX = mouseX + lvGrabX; lvPinY = mouseY + lvGrabY;
    let best = lvIdx, bestDist = 100000;
    for (let i = lvIdx; i <= min(n - 1, lvIdx + WIN); i++) {
      const d = dist(lvPinX, lvPinY, lvPath[i].x, lvPath[i].y);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    const old = lvIdx;
    lvIdx = best;
    const lo = max(0, old - WIN), hi = min(n - 1, lvIdx + WIN);
    const dev = Math.min(...lvPath.slice(lo, hi).map((p, i) => lvSeg(p, lvPath[lo + i + 1])));
    const sc = max(0, 1 - max(0, dev - 6) / 42);
    for (let i = old + 1; i <= lvIdx; i++) lvScores[i] = sc;
    lvScores[lvIdx] = min(lvScores[lvIdx], sc);
    lvTrail.push({ x: lvPinX, y: lvPinY, off: dev > TOL });
    lvState = dev > TOL ? 'RED' : 'GREEN';
    if (lvIdx >= (n - 1) * 0.97) lvPathEnds();
  } else if (lvState === 'PATH_END' && --lvTimer <= 0) lvAfterPath();
}

function lvPathEnds() {
  const e = lvPath[lvPath.length - 1], acc = lvAccuracy();
  lvMsgGood = acc >= 0.8;
  lvPinX = e.x; lvPinY = e.y;
  lvDoughR += 25; lvQuals.push(acc); lvAll.push(acc);
  lvState = 'PATH_END'; lvTimer = 100; lvArmed = false;
  lvMsg = (lvMsgGood ? 'On track!' : 'Off track') + '\n' + Math.round(acc * 100) + '% accuracy';
  if (lvPass + 1 >= PASSES) {
    const avg = lvQuals.reduce((a, b) => a + b, 0) / lvQuals.length;
    const stars = avg >= 0.9 ? 5 : avg >= 0.8 ? 4 : avg >= 0.7 ? 3 : avg >= 0.55 ? 2 : 1;
    lvTotal += stars; lvPizza++; lvQuals = [];
    lvMsg += '\nPizza ' + lvPizza + ' rolled! ' + '\u2605'.repeat(stars);
  }
}

function lvAfterPath() {
  if (lvPass + 1 >= PASSES) {
    if (lvPizza >= PIZZAS) { lvState = 'NEXT_STAGE'; return; }
    lvPass = 0; lvDoughR = 180;
  } else lvPass++;
  lvNewPath();
  lvState = 'READY'; lvArmed = false;
}

function runLevel() {
  lvUpdate();
  push();
  image(lvWood, 0, 0);
  lvDrawDough(); lvDrawPath(); lvDrawPin(); lvDrawHud();
  pop();
}

function lvDrawDough() {
  noStroke(); fill(0, 50); ellipse(CX + 8, CY + 10, lvDoughR * 2, lvDoughR * 1.86);
  stroke(214, 160, 80); strokeWeight(8); fill(255, 229, 153);
  ellipse(CX, CY, lvDoughR * 2, lvDoughR * 1.86);
}

function lvDrawPath() {
  noStroke();
  fill(lvState === 'RED' ? color(220, 40, 40) : lvState === 'GREEN' ? color(30, 170, 50) : color(255, 240, 200));
  for (let i = 0; i < lvPath.length; i += 2) ellipse(lvPath[i].x, lvPath[i].y, 7, 7);
  const s = lvPath[0], e = lvPath[lvPath.length - 1];
  fill(244, 204, 204); stroke(150, 90, 90); strokeWeight(2); ellipse(s.x, s.y, 72, 72);
  noFill(); stroke(255); strokeWeight(4); ellipse(e.x, e.y, 70, 70);
  strokeWeight(5);
  for (let i = 1; i < lvTrail.length; i++) {
    stroke(lvTrail[i].off ? color(220, 40, 40) : color(30, 170, 50));
    line(lvTrail[i - 1].x, lvTrail[i - 1].y, lvTrail[i].x, lvTrail[i].y);
  }
}

function lvDrawPin() {
  push();
  translate(lvPinX, lvPinY);
  rotate(lvPass % 2 === 0 ? 0 : HALF_PI);
  stroke(120, 60, 20); strokeWeight(2); fill(241, 194, 50);
  ellipse(-230, 0, 60, 26); ellipse(230, 0, 60, 26); rect(-200, -20, 400, 40, 6);
  noStroke(); fill(255, 225, 120); rect(-194, -15, 388, 9, 4);
  stroke(lvState === 'RED' ? color(220, 40, 40) : lvState === 'GREEN' ? color(30, 170, 50) : color(70)); strokeWeight(4);
  fill(255); ellipse(0, 0, 20, 20);
  pop();
}

function lvDrawHud() {
  textFont('Arial');
  textAlign(CENTER, CENTER);
  lvPill(20, 20, 140, 60, inRect(20, 20, 140, 60) ? color(255, 236, 170) : color(255, 214, 120)); textSize(28); text('Menu', 90, 51);
  lvPill(CX - 230, 20, 460, 70, color(255, 236, 170)); textSize(42); text('Roll The Dough', CX, 56);
  lvPill(width - 350, 20, 330, 84, color(255, 236, 170)); textSize(20);
  text('Pizza ' + min(lvPizza + 1, PIZZAS) + '/' + PIZZAS + '   Roll ' + min(lvPass + 1, PASSES) + '/' + PASSES +
       '   Score ' + lvTotal, width - 185, 46);
  const on = lvState === 'GREEN' || lvState === 'RED';
  fill(!on ? color(120, 50, 15) : lvState === 'GREEN' ? color(30, 130, 50) : color(180, 40, 30)); textSize(24);
  text('Accuracy ' + (on ? Math.round(lvAccuracy() * 100) + '%' : '--'), width - 185, 80);
  if (lvState === 'PATH_END') {
    lvCard(lvMsg.split('\n')[0], lvMsg.slice(lvMsg.indexOf('\n') + 1), lvMsgGood);
  }
  if (lvState === 'NEXT_STAGE') {
    fill(0, 170); rect(0, 0, width, height);
    lvCard('All pizzas rolled!', 'Average accuracy: ' + Math.round(lvAll.reduce((a, b) => a + b, 0) / lvAll.length * 100) +
           '%\nAverage stars: ' + (lvTotal / PIZZAS).toFixed(1) + ' / 5 \u2605\nClick anywhere to continue', true);
  }
}

function lvPill(x, y, w, h, c) {
  stroke(120, 60, 20); strokeWeight(4); fill(c); rect(x, y, w, h, h / 2);
  noStroke(); fill(120, 50, 15);
}

function lvCard(title, body, good) {
  stroke(120, 60, 20); strokeWeight(5); fill(255, 236, 170); rect(CX - 250, CY - 120, 500, 240, 36);
  noStroke(); textAlign(CENTER, CENTER);
  fill(good ? color(30, 130, 50) : color(180, 40, 30)); textSize(46); text(title, CX, CY - 70);
  fill(120, 50, 15); textSize(28); textLeading(42); text(body, CX, CY + 25);
}

function lvMakeWood() {
  const g = createGraphics(width, height);
  randomSeed(7); noiseSeed(7);
  g.noStroke(); g.background(158, 98, 40);
  for (let i = 0; i < 420; i++) {
    const x = random(-200, width), y = random(height), len = random(150, 700), th = random(1, 4);
    if (random() < 0.3) g.fill(120, 66, 24, 90); else g.fill(190, 125, 58, 70);
    g.beginShape();
    for (let k = 0; k <= len; k += 20) g.vertex(x + k, y + (noise(k * 0.01, i) - 0.5) * 10);
    for (let k = len; k >= 0; k -= 20) g.vertex(x + k, y + th + (noise(k * 0.01, i) - 0.5) * 10);
    g.endShape(CLOSE);
  }
  for (let i = 0; i < 14; i++) {
    const x = random(width), y = random(height), w = random(150, 350), h = random(8, 18);
    g.fill(130, 70, 25, 150);
    g.beginShape();
    for (let k = 0; k <= 10; k++) { const t = k / 10; g.vertex(x - w / 2 + w * t, y - h * 4 * t * (1 - t)); }
    for (let k = 10; k >= 0; k--) { const t = k / 10; g.vertex(x - w / 2 + w * t, y + h * 4 * t * (1 - t)); }
    g.endShape(CLOSE);
  }
  return g;
}