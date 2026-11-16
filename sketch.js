let bgImg, instrucImg, settingsImg, musicCreditsImg, musicSlider, bgMusic, lvWood, lvOrange, lvGreen, lvTable, lvOven, sauce;
let btnImages = {}, buttons = [], currentScreen = "menu", assetsLoaded = false;
const CX = 640, CY = 360, TOL = 18, WIN = 12, PASSES = 2, PIZZAS = 3, PATH_PTS = 60, WAVE = [0, 28, 42];
let lvState = 'READY', lvPass = 0, lvPizza = 0, lvPath = [], lvIdx = 0, lvScores = [], lvTrail = [], lvTimer = 0, lvTotal = 0, lvDoughR = 180;
let lvPinX = 640, lvPinY = 600, lvGrabX = 0, lvGrabY = 0, lvArmed = false, lvMsg = '', lvMsgGood = true, lvStars = 0, lvQuals = [], lvAll = [];
const L5R = { x: 930, y: 400 }, L5B = { x: 290, y: 400 }, L5_ROUNDS = 3;
let l5State = 'PINCH', l5Round = 0, l5Total = 0, l5Pinch = [], l5Slice = [], l5T = 240, l5D = 360, l5Cuts = 4, l5Done = [], l5Drag = null;
let l5Grab = false, l5Was = false, l5Multi = null, l5Off = 0, l5Start = 0, l5Pa = 0, l5Timer = 0, l5Msg = '', l5Good = true, l5Stars = 0, l5Topp = [];
let l2Shape = 'Circle', l2Poly = [], l2Cell = [], l2Mk = [], l2State = 'PLAY', l2Pizza = 1, l2Scores = [], l2Stars = [], l2Sh = 0, l2Hit = 0, l2Out = 0, l2Built = '', l2Note = '', l2Acc = 0, l2Lx = null, l2Ly = null, l2Hx = 640, l2Hy = 385, l2Pen = false, l2Was = true;
let l3State = 'PLAY', l3Tick = [], l3Top = [[], [], []], l3Drag = -1, l3Was = true, l3Time = 0, l3Acc = [], l3Stars = [];
let l4State = 'PLAY', l4Bar = 384, l4Hold = false, l4Run = false, l4Speed = 90, l4P = 1, l4Z = [0, 0, 0], l4Zs = [], l4Stars = [], l4Topp = [], l4T = 0, l4Was = true;
let lvRun = {}, lvStats = lvNone(), lvConfirm = false;
const inRect = (x, y, w, h) => mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
const hit = b => mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h;
const lvSum = a => a.reduce((x, y) => x + y, 0), lvAvg = a => lvSum(a) / a.length;
const lvStar = a => a >= 0.9 ? 5 : a >= 0.8 ? 4 : a >= 0.7 ? 3 : a >= 0.55 ? 2 : 1;
const l5Star = (p, q) => { const a = (3 * min(p, q) + max(p, q)) / 4; return a >= 0.95 ? 5 : a >= 0.88 ? 4 : a >= 0.78 ? 3 : a >= 0.62 ? 2 : 1; };
const pct = v => Math.round(v * 100) + '%';
const lvAccuracy = () => lvAvg(lvScores.slice(0, lvIdx + 1));
const lvCol = d => lvState === 'RED' ? color(220, 40, 40) : lvState === 'GREEN' ? color(30, 170, 50) : d;
const lvDash = (x1, y1, x2, y2, c = color(248)) => { stroke(c); strokeWeight(7); strokeCap(SQUARE); line(x1, y1, x2, y2); strokeCap(ROUND); };
const lvMsgCard = (m, g, n) => lvCard(m.split('\n')[0], m.slice(m.indexOf('\n') + 1), g, n);
const segDist = (p, a, b, dx = b.x - a.x, dy = b.y - a.y, t = constrain(((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy), 0, 1)) => dist(p.x, p.y, a.x + t * dx, a.y + t * dy);
const lvSafe = (f, c) => { try { return f(); } catch (e) { console.log('Background could not be built, using a plain color: ' + e); return c; } };
const lvBack = g => Array.isArray(g) ? background(g) : image(g, 0, 0);
const lvBtn = (l, x, y, w, h, s = 28) => {
  noStroke(); fill(40, 130, 25); rect(x, y + 6, w, h, 14); stroke(40, 130, 25); strokeWeight(3); fill(inRect(x, y, w, h) ? color(130, 245, 90) : color(96, 232, 50)); rect(x, y, w, h, 14);
  noStroke(); fill(20, 70, 15); textSize(s); textAlign(CENTER, CENTER); text(l, x + w / 2, y + h / 2);
};
async function setup() {
  createCanvas(1280, 720);
  lvLoad();
  try { drawingContext.canvas.style.touchAction = 'none'; } catch (err) {}
  musicSlider = createSlider(0, 100, 30);
  musicSlider.hide();
  bgMusic = loadSound('soundtrack.mp3', () => { console.log("Music loaded successfully!"); bgMusic.loop(); });
  bgImg = await loadImage('background.png');
  for (const k of ['stats', 'play', 'settings', 'music']) btnImages[k] = await loadImage(k + '.png');
  instrucImg = await loadImage('Instructions 1.png');
  settingsImg = await loadImage('Settings page.png');
  musicCreditsImg = await loadImage('Music Credits.png');
  buttons = [["stats", 40, 410, 340, 345], ["play", 350, 420, 310, 300], ["settings", 660, 410, 320, 310], ["music", 970, 400, 290, 350]]
    .map(([key, x, y, w, h]) => ({ key, x, y, w, h, target: key }));
  lvWood = lvSafe(lvMakeWood, [150, 95, 45]); lvOrange = lvSafe(lvMakeOrange, [192, 98, 46]); lvGreen = lvSafe(lvMakeGreen, [43, 94, 80]); lvTable = lvSafe(lvMakeTable, [204, 210, 216]); lvOven = lvSafe(lvMakeOven, [158, 76, 50]);
  assetsLoaded = true;
}
function draw() {
  background(220);
  if (!assetsLoaded) { if (bgImg) image(bgImg, 0, 0, width, height); return; }
  if (currentScreen === "settings") { musicSlider.show(); musicSlider.position(width / 2 - 77.5, height / 2 + 10); musicSlider.style('width', '150px'); }
  else musicSlider.hide();
  const imgs = { settings: settingsImg, music_credits: musicCreditsImg };
  const runs = { level1_instructions: l1Intro, level1: runLevel, level2_instructions: () => lvIntro(2, L2_STEPS), level2: runLevel2, level3_instructions: () => lvIntro(3, L3_STEPS), level3: runLevel3, level4_instructions: () => lvIntro(4, L4_STEPS, 165), level4: runLevel4, level5_instructions: () => lvIntro(5, L5_STEPS), level5: runLevel5, stats: lvStatsPage, end: lvEndPage };
  if (imgs[currentScreen]) image(imgs[currentScreen], 0, 0, width, height);
  else if (runs[currentScreen]) { try { runs[currentScreen](); } catch (e) { lvCrash(e); } }
  else if (currentScreen === "menu") {
    image(bgImg, 0, 0, width, height);
    buttons.forEach(b => { push(); if (hit(b)) tint(255, 200, 200); else noTint(); image(btnImages[b.key], b.x, b.y, b.w, b.h); pop(); });
    drawTitle();
  }
  if (bgMusic) bgMusic.setVolume(musicSlider.value() / 100);
}
function mousePressed() {
  if (!assetsLoaded) return;
  loop();
  userStartAudio();
  const back = inRect(20, 20, 140, 60), s = currentScreen;
  if (s === "menu") buttons.forEach(b => { if (hit(b)) handleButtonPress(b.target); });
  else if (s === "level1_instructions") { if (inRect(20, 20, 190, 95)) currentScreen = "menu"; else startLevel(); }
  else if (s === "level1") { if (lvState !== 'NEXT_STAGE') { if (back) currentScreen = "menu"; } else if (inRect(392, 593, 496, 78)) goToNextStage(); }
  else if (s === "level2_instructions") { if (inRect(20, 20, 190, 95)) currentScreen = "menu"; else startLevel2(); }
  else if (s === "level2") l2Click(back);
  else if (s === "level3_instructions") { if (inRect(20, 20, 190, 95)) currentScreen = "menu"; else startLevel3(); }
  else if (s === "level3") l3Click(back);
  else if (s === "level4_instructions") { if (inRect(20, 20, 190, 95)) currentScreen = "menu"; else startLevel4(); }
  else if (s === "level4") l4Click(back);
  else if (s === "level5_instructions") { if (inRect(20, 20, 190, 95)) currentScreen = "menu"; else startLevel5(); }
  else if (s === "level5") { if (l5State !== 'NEXT_STAGE') { if (back) currentScreen = "menu"; } else if (inRect(392, 593, 496, 78)) { lvFinish(); goToNextStage(); } }
  else if (s === "stats") { if (back) currentScreen = "menu"; else if (inRect(900, 628, 280, 54)) { if (lvConfirm) lvReset(); lvConfirm = !lvConfirm; } else lvConfirm = false; }
  else if (s === "end") { if (inRect(250, 600, 360, 76)) currentScreen = "level1_instructions"; else if (inRect(670, 600, 360, 76)) currentScreen = "menu"; }
  else if ((s === "settings" || s === "music_credits") && back) currentScreen = "menu";
}
function handleButtonPress(target) {
  console.log("Clicked button: " + target);
  const screens = { play: "level1_instructions", stats: "stats", settings: "settings", music: "music_credits" };
  if (screens[target]) { currentScreen = screens[target]; lvConfirm = false; }
}
function goToNextStage() { currentScreen = { level1: "level2_instructions", level2: "level3_instructions", level3: "level4_instructions", level4: "level5_instructions", level5: "end" }[currentScreen]; }
function keyPressed() { const k = { 2: "level2_instructions", 3: "level3_instructions", 4: "level4_instructions", 5: "level5_instructions" }[key]; if (k && assetsLoaded) currentScreen = k; }
function drawTitle() {
  push(); lvPill(CX - 330, 40, 660, 110, color(200, 50, 40)); lvPill(CX - 316, 52, 632, 86, color(255, 236, 170));
  textAlign(CENTER, CENTER); textFont('Georgia'); textStyle(BOLDITALIC); textSize(64);
  fill(255, 190, 90); text("Fulton's Pizzeria", CX + 3, 98); fill(120, 50, 15); text("Fulton's Pizzeria", CX, 95); pop();
}
function lvCrash(e) {
  console.error(e); resetMatrix(); noStroke(); fill(0, 220); rect(40, 180, width - 80, 340, 16); fill(255, 130, 130); textAlign(LEFT, TOP); textSize(22);
  text('Level error - please screenshot this:\n' + (e && e.message ? e.message : e) + '\n' + (e && e.stack ? String(e.stack).split('\n').slice(0, 4).join('\n') : ''), 60, 200, width - 120, 300);
  noLoop();
}
function lvPill(x, y, w, h, c) { stroke(120, 60, 20); strokeWeight(4); fill(c); rect(x, y, w, h, h / 2); noStroke(); fill(120, 50, 15); }
function lvCard(title, body, good, n = -1, bs = 28) {
  stroke(120, 60, 20); strokeWeight(5); fill(255, 236, 170); rect(CX - 250, CY - 120, 500, 240, 36); noStroke(); textAlign(CENTER, CENTER);
  fill(good ? color(30, 130, 50) : color(180, 40, 30)); textSize(46); text(title, CX, CY - (n < 0 ? 70 : 78));
  fill(120, 50, 15); textSize(bs); textLeading(n < 0 ? 42 : 36); text(body, CX, CY + (n < 0 ? 25 : -5));
  for (let i = 0; i < 5 && n >= 0; i++) { fill(i < n ? color(245, 180, 20) : color(205, 180, 130)); textSize(48); text('\u2605', CX + (i - 2) * 56, CY + 76); }
}
function lvMakeGreen() {
  const g = createGraphics(width, height);
  g.background(43, 94, 80); g.noStroke();
  for (let n = 0; n < 240; n++) {
    const x = n % 20, y = floor(n / 20);
    if ((x + y) % 2 === 0) { g.fill(255, 255, 255, 9); g.rect(x * 64, y * 64, 64, 64); }
  }
  return g;
}
function lvBricks(g, rows, w, h, c, v, r) {
  const cols = ceil(width / w) + 1;
  for (let i = 0; i < rows * cols; i++) {
    const row = floor(i / cols), j = random(-v, v);
    g.fill(c[0] + j, c[1] + j * 0.6, c[2] + j * 0.5); g.rect(i % cols * w - row % 2 * w / 2 + 1, row * h + 1, w - 2, h - 2, r);
  }
}
function lvMakeTable() {
  const g = createGraphics(width, height);
  randomSeed(3); g.background(214, 208, 194); g.noStroke(); lvBricks(g, 8, 80, 40, [244, 240, 230], 5, 3);
  g.fill(176, 48, 36); g.rect(0, 262, width, 22); g.fill(122, 28, 20); g.rect(0, 284, width, 6);
  g.fill(204, 210, 216); g.rect(0, 290, width, height); g.fill(234, 238, 242); g.rect(0, 290, width, 8);
  for (let i = 0; i < 170; i++) {
    const x = random(-100, width), y = random(304, 690);
    i % 2 ? g.stroke(255, 255, 255, 60) : g.stroke(90, 100, 110, 24); g.strokeWeight(random(1, 2.5)); g.line(x, y, x + random(120, 420), y);
  }
  g.noStroke(); g.fill(150, 158, 166); g.rect(0, 692, width, 28); g.fill(190, 198, 206); g.rect(0, 692, width, 4);
  randomSeed(Date.now());
  return g;
}
function lvMakeOven() {
  const g = createGraphics(width, height), arch = (hw, ry, bot) => {
    g.beginShape(); g.vertex(420 - hw, bot);
    for (let k = 0; k <= 40; k++) g.vertex(420 - hw * cos(k * PI / 40), 360 - ry * sin(k * PI / 40));
    g.vertex(420 + hw, bot); g.endShape(CLOSE);
  };
  randomSeed(5); g.background(196, 170, 140); g.noStroke(); lvBricks(g, 24, 70, 30, [158, 76, 50], 16, 3);
  g.fill(70, 40, 30); arch(285, 255, 655); g.fill(222, 186, 140); arch(275, 245, 650); g.fill(26, 14, 10); arch(235, 200, 640);
  [[470, 330], [370, 250], [270, 180]].forEach(([w, h]) => { g.fill(255, 120, 30, 28); g.ellipse(420, 450, w, h); });
  [58, 148, 88, 166, 72].forEach((f, i) => {
    const x = 232 + i * 94, t = x + [-6, 5, -4, 6, -5][i];
    g.fill(238, 100, 30); g.triangle(x - 40, 480, x + 40, 480, t, 480 - f); g.fill(255, 200, 70); g.triangle(x - 22, 480, x + 22, 480, x, 480 - f * 0.6);
  });
  g.fill(168, 158, 146); g.rect(120, 640, 600, 44, 8); g.fill(120, 110, 98); g.rect(120, 676, 600, 8);
  randomSeed(Date.now());
  return g;
}
function lvProps() {
  const A = [[0.5, 0.55], [1.7, 0.45], [2.9, 0.6], [4.1, 0.5], [5.3, 0.55], [0, 0]].map(([a, r]) => ({ a, r }));
  l5DrawPizza(55, 650, 190, A); l5DrawPizza(1225, 650, 190, A.map(t => ({ a: t.a + 1, r: t.r })));
}
function lvResult(lines, avg, n, acc, label = 'Next Level') {
  lvDone(n, avg, acc); lvBack(lvGreen); textFont('Arial'); lvProps();
  const tails = [[[117, 128], [269, 128], [269, 291], [117, 291], [198, 209]], [[1011, 121], [1163, 121], [1083, 203], [1163, 285], [1011, 285]]];
  const ribbon = () => tails.forEach(t => { beginShape(); t.forEach(p => vertex(p[0], p[1])); endShape(CLOSE); });
  noStroke(); fill(0, 0, 0, 45); push(); translate(0, 8); ribbon(); rect(269, 91, 742, 224, 32); pop();
  stroke(190, 140, 40); strokeWeight(2); fill(255, 210, 90); ribbon();
  stroke(200, 150, 60); strokeWeight(3); fill(255, 232, 160); rect(269, 91, 742, 224, 32);
  drawingContext.setLineDash([10, 8]); noFill(); stroke(225, 185, 95); strokeWeight(2); rect(283, 105, 714, 196, 22); drawingContext.setLineDash([]);
  noStroke(); fill(95, 45, 10); textAlign(CENTER, CENTER); textSize(58); const y = 203 - 22 * lines.length; text('Level Complete', CX, y);
  fill(130, 70, 20); textSize(32); lines.forEach((l, i) => text(l, CX, y + 62 + i * 40));
  for (let n = 0; n < 10; n++) {
    const i = floor(n / 2), k = n % 2, on = i < round(avg), o = k ? 0 : 6;
    if (k) { stroke(on ? color(200, 135, 10) : color(105, 155, 138)); strokeWeight(3); fill(on ? color(255, 200, 40) : color(76, 128, 112)); } else { noStroke(); fill(0, 0, 0, 55); }
    beginShape();
    for (let j = 0; j < 10; j++) { const a = -HALF_PI + j * PI / 5, d = j % 2 ? 20 : 50; vertex(CX + (i - 2) * 148 + cos(a) * d, 438 + o + sin(a) * d); }
    endShape(CLOSE);
  }
  noStroke(); fill(255, 236, 170); textSize(26); text('Average stars: ' + avg.toFixed(1) + ' / 5', CX, 528);
  lvBtn(label, 392, 593, 496, 78);
}
function lvTop(label, title, tw, ts) {
  textFont('Arial'); textAlign(CENTER, CENTER);
  lvPill(20, 20, 140, 60, inRect(20, 20, 140, 60) ? color(255, 236, 170) : color(255, 214, 120)); textSize(28); text(label, 90, 51);
  lvPill(CX - tw / 2, 20, tw, 70, color(255, 236, 170)); textSize(ts); text(title, CX, 56);
}
function lvHud(title, tw, ts, ls, line1, line2, c) {
  lvTop('Menu', title, tw, ts);
  lvPill(width - 350, 20, 330, 84, color(255, 236, 170)); textSize(ls); text(line1, width - 185, 46);
  fill(c); textSize(24); text(line2, width - 185, 80);
}
function lens(g, x, y, w, h) {
  g.beginShape();
  for (let k = 0; k <= 21; k++) { const t = (k <= 10 ? k : 21 - k) / 10; g.vertex(x + w * t, y + (k <= 10 ? -1 : 1) * h * 4 * t * (1 - t)); }
  g.endShape(CLOSE);
}

function lvMakeOrange() {
  const g = createGraphics(width, height);
  g.background(192, 98, 46); g.noStroke();
  const band = (i, dy, c, k) => {
    g.fill(c); g.beginShape();
    const y = x => 45 + i * 80 + dy + (14 + i * 3 % 14) * sin(x * (0.004 + i % 3 * 0.002) + i * 1.7), t = x => k * (0.15 + max(0, sin(x * 0.006 + i * 2.3)));
    for (let x = 0; x <= width; x += 16) g.vertex(x, y(x) - t(x));
    for (let x = width; x >= 0; x -= 16) g.vertex(x, y(x) + t(x));
    g.endShape(CLOSE);
  };
  for (let i = 0; i < 10; i++) { band(i, 0, color(146, 60, 24), 9); band(i, 16, color(222, 130, 66, 170), 3); }
  return g;
}

function lvMakeWood() {
  const g = createGraphics(width, height);
  randomSeed(7); noiseSeed(7); g.noStroke(); g.background(158, 98, 40);
  for (let i = 0; i < 420; i++) {
    const x = random(-200, width), y = random(height), len = random(150, 700), th = random(1, 4), dy = k => (noise(k * 0.01, i) - 0.5) * 10;
    if (random() < 0.3) g.fill(120, 66, 24, 90); else g.fill(190, 125, 58, 70);
    g.beginShape();
    for (let k = 0; k <= len; k += 20) g.vertex(x + k, y + dy(k));
    for (let k = len; k >= 0; k -= 20) g.vertex(x + k, y + th + dy(k));
    g.endShape(CLOSE);
  }
  for (let i = 0; i < 14; i++) {
    const x = random(width), y = random(height), w = random(150, 350), h = random(8, 18);
    g.fill(130, 70, 25, 150); lens(g, x - w / 2, y, w, h);
  }
  randomSeed(Date.now());
  return g;
}
function startLevel() {
  lvRun = {}; lvState = 'READY'; lvPass = 0; lvPizza = 0; lvTotal = 0; lvDoughR = 180; lvQuals = []; lvAll = []; lvArmed = false;
  lvNewPath(); currentScreen = "level1";
}
function lvNewPath() {
  const wave = WAVE[min(lvPizza, WAVE.length - 1)];
  lvPath = Array.from({ length: PATH_PTS }, (_, i) => {
    const t = i / (PATH_PTS - 1), w = wave * sin(t * TWO_PI);
    return lvPass % 2 === 0 ? { x: CX + w, y: lerp(565, 175, t) } : { x: lerp(CX - 260, CX + 260, t), y: CY + w };
  });
  lvIdx = 0; lvScores = Array(PATH_PTS).fill(1); lvTrail = []; lvPinX = lvPath[0].x; lvPinY = lvPath[0].y;
}
const lvOverPin = (h = lvPass % 2 === 0) => abs(mouseX - lvPinX) <= (h ? 260 : 50) && abs(mouseY - lvPinY) <= (h ? 50 : 260);
function lvUpdate() {
  const n = lvPath.length;
  if (lvState === 'READY') {
    if (!mouseIsPressed) lvArmed = true;
    else if (lvArmed && lvOverPin()) { lvGrabX = lvPinX - mouseX; lvGrabY = lvPinY - mouseY; lvState = 'GREEN'; }
  } else if (lvState === 'GREEN' || lvState === 'RED') {
    if (!mouseIsPressed) { lvNewPath(); lvState = 'READY'; lvArmed = false; return; }
    lvPinX = mouseX + lvGrabX; lvPinY = mouseY + lvGrabY;
    const old = lvIdx;
    for (let i = old, bd = 1e5; i <= min(n - 1, old + WIN); i++) {
      const d = dist(lvPinX, lvPinY, lvPath[i].x, lvPath[i].y);
      if (d < bd) { bd = d; lvIdx = i; }
    }
    const lo = max(0, old - WIN), hi = min(n - 1, lvIdx + WIN), pin = { x: lvPinX, y: lvPinY };
    const dev = Math.min(...lvPath.slice(lo, hi).map((p, i) => segDist(pin, p, lvPath[lo + i + 1]))), sc = max(0, 1 - max(0, dev - 6) / 42);
    for (let i = old + 1; i <= lvIdx; i++) lvScores[i] = sc;
    lvScores[lvIdx] = min(lvScores[lvIdx], sc);
    lvTrail.push({ x: lvPinX, y: lvPinY, off: dev > TOL }); lvState = dev > TOL ? 'RED' : 'GREEN';
    if (lvIdx >= (n - 1) * 0.97) lvPathEnds();
  } else if (lvState === 'PATH_END' && --lvTimer <= 0) lvAfterPath();
}
function lvPathEnds() {
  const e = lvPath[lvPath.length - 1], acc = lvAccuracy();
  lvPinX = e.x; lvPinY = e.y; lvDoughR += 25; lvQuals.push(acc); lvAll.push(acc);
  lvState = 'PATH_END'; lvTimer = 25; lvArmed = false; lvMsg = '';
  if (lvPass + 1 >= PASSES) {
    const pa = lvAvg(lvQuals);
    lvStars = lvStar(pa); lvTotal += lvStars; lvPizza++; lvQuals = []; lvTimer = 55; lvMsgGood = pa >= 0.8;
    lvMsg = 'Pizza ' + lvPizza + ' rolled!\nAccuracy: ' + pct(pa);
  }
}
function lvAfterPath() {
  if (lvPass + 1 >= PASSES) { if (lvPizza >= PIZZAS) { lvState = 'NEXT_STAGE'; return; } lvPass = 0; lvDoughR = 180; } else lvPass++;
  lvNewPath(); lvState = 'READY'; lvArmed = false;
}
function runLevel() {
  lvUpdate(); push();
  if (lvState === 'NEXT_STAGE') lvResult(['Average accuracy: ' + pct(lvAvg(lvAll))], lvTotal / PIZZAS, 1, lvAvg(lvAll));
  else { lvBack(lvWood); lvBoard(); lvDrawDough(); lvDrawPath(); lvDrawPin(); lvDrawHud(); }
  pop();
}
function lvBoard() {
  stroke(45, 25, 10); strokeWeight(5); fill(112, 66, 38); rect(320, 116, 640, 508, 36);
  noFill(); stroke(150, 98, 60, 160); strokeWeight(2); rect(334, 130, 612, 480, 26);
  for (let i = 0; i < 12; i++) {
    stroke(i % 2 ? color(255, 215, 160, 22) : color(0, 0, 0, 30)); strokeWeight(2 + i % 3); beginShape();
    for (let x = 344; x <= 936; x += 16) vertex(x, 150 + i * 40 + 8 * sin(x * 0.01 + i * 1.3));
    endShape();
  }
}
function lvDrawDough() { noStroke(); fill(0, 0, 0, 45); ellipse(CX + 6, CY + 9, lvDoughR * 2, lvDoughR * 1.86); stroke(214, 160, 80); strokeWeight(8); fill(255, 229, 153); ellipse(CX, CY, lvDoughR * 2, lvDoughR * 1.86); }
function lvDrawPath() {
  for (let i = 0; i < lvPath.length - 2; i += 4) lvDash(lvPath[i].x, lvPath[i].y, lvPath[i + 2].x, lvPath[i + 2].y, lvCol(color(248)));
  const s = lvPath[0], e = lvPath[lvPath.length - 1];
  fill(244, 204, 204); stroke(150, 90, 90); strokeWeight(2); ellipse(s.x, s.y, 72, 72);
  noFill(); stroke(255); strokeWeight(4); ellipse(e.x, e.y, 70, 70); strokeWeight(5);
  for (let i = 1; i < lvTrail.length; i++) {
    stroke(lvTrail[i].off ? color(220, 40, 40) : color(30, 170, 50)); line(lvTrail[i - 1].x, lvTrail[i - 1].y, lvTrail[i].x, lvTrail[i].y);
  }
}
function lvPinBody() {
  stroke(120, 60, 20); strokeWeight(2); fill(214, 166, 100); rect(-262, -11, 70, 22, 11); rect(192, -11, 70, 22, 11);
  fill(234, 196, 134); rect(-200, -20, 400, 40, 8);
  fill(200, 152, 88); rect(-186, -20, 12, 40); rect(174, -20, 12, 40);
}
function lvDrawPin() {
  push(); translate(lvPinX, lvPinY); rotate(lvPass % 2 === 0 ? 0 : HALF_PI); lvPinBody();
  stroke(lvCol(color(70))); strokeWeight(4); fill(255); ellipse(0, 0, 20, 20);
  pop();
}
function lvDrawHud() {
  const on = lvState === 'GREEN' || lvState === 'RED';
  lvHud('Roll The Dough', 460, 42, 20, 'Pizza ' + min(lvPizza + 1, PIZZAS) + '/' + PIZZAS + '   Roll ' + min(lvPass + 1, PASSES) + '/' + PASSES + '   Score ' + lvTotal,
    on ? 'Accuracy ' + pct(lvAccuracy()) : lvAll.length ? 'Last roll ' + pct(lvAll[lvAll.length - 1]) : 'Accuracy --', !on ? color(120, 50, 15) : lvState === 'GREEN' ? color(30, 130, 50) : color(180, 40, 30));
  if (lvState === 'PATH_END' && lvMsg) lvMsgCard(lvMsg, lvMsgGood, lvStars);
}
const L5_STEPS = [['1. Pinch', 'Drag a pink spot inward until the big\npizza matches the dashed circle.\nLet go to lock it in.'], ['2. Slice', 'Drag from one pink spot to the opposite\none along each dashed line.\nStay close for a higher score!']];
const l5Fit = () => max(0, 1 - max(0, abs(l5D - l5T) / l5T - 0.02) / 0.18);
const l5Path = dev => max(0, 1 - max(0, dev - 2) / 22);
const l5Live = () => l5Path(lvAvg(l5Drag.pts.map(p => segDist(p, l5Drag.a, l5Drag.b))));
const l5H = () => Array.from({ length: l5Cuts * 2 }, (_, i) => ({ x: L5B.x + (l5D / 2 + 16) * cos(-HALF_PI + i * PI / l5Cuts), y: L5B.y + (l5D / 2 + 16) * sin(-HALF_PI + i * PI / l5Cuts) }));
const l5Dot = (x, y, s, c = color(244, 204, 204)) => { fill(c); stroke(150, 90, 90); strokeWeight(2); ellipse(x, y, s, s); };
const l5Dash = (a, b, c, w, d) => { drawingContext.setLineDash(d); stroke(c); strokeWeight(w); line(a.x, a.y, b.x, b.y); drawingContext.setLineDash([]); };
function startLevel5() { lvRun[5] = 0; l5Round = 0; l5Total = 0; l5Pinch = []; l5Slice = []; l5Was = true; l5NewRound(); currentScreen = "level5"; }
function l5NewRound() {
  l5T = round(random(190, 280)); l5D = round(l5T + random(70, 170)); l5Cuts = floor(random(2, 6)); l5Topp = lvTopp();
  l5Done = []; l5Drag = null; l5Grab = false; l5State = 'PINCH';
}
function l5Update() {
  const down = mouseIsPressed, press = down && !l5Was;
  l5Was = down;
  if (l5State === 'PINCH') {
    if (press && [-1, 1].some(k => dist(mouseX, mouseY, L5R.x + k * l5D / 2, L5R.y) < 60)) { l5Grab = true; l5Multi = null; l5Start = l5D; }
    if (l5Grab && down) {
      const m = touches.length > 1, raw = m ? abs(touches[0].x - touches[1].x) : 2 * abs(mouseX - L5R.x);
      if (m !== l5Multi) l5Off = raw - l5D;
      l5Multi = m; l5D = constrain(raw - l5Off, 60, 480);
    } else if (l5Grab) {
      l5Grab = false;
      if (abs(l5D - l5Start) < 3) return;
      l5Pa = l5Fit(); l5State = 'SLICE';
    }
  } else if (l5State === 'SLICE') {
    if (press) {
      const H = l5H(), i = H.findIndex((h, j) => !l5Done[j % l5Cuts] && dist(mouseX, mouseY, h.x, h.y) < 45);
      if (i >= 0) l5Drag = { a: H[i], b: H[(i + l5Cuts) % (l5Cuts * 2)], k: i % l5Cuts, pts: [{ x: mouseX, y: mouseY }] };
    }
    if (l5Drag && down) {
      const p = l5Drag.pts, l = p[p.length - 1];
      if (dist(l.x, l.y, mouseX, mouseY) > 3) p.push({ x: mouseX, y: mouseY });
    } else if (l5Drag) l5EndCut();
  } else if (l5State === 'SLICE_END' && --l5Timer <= 0) { if (l5Round >= L5_ROUNDS) l5State = 'NEXT_STAGE'; else l5NewRound(); }
}
function l5EndCut() {
  const { a, b, k, pts } = l5Drag, e = pts[pts.length - 1];
  l5Drag = null;
  if (dist(a.x, a.y, e.x, e.y) < 0.6 * dist(a.x, a.y, b.x, b.y)) return;
  l5Done[k] = { pts, acc: 0.7 * l5Path(lvAvg(pts.map(p => segDist(p, a, b)))) + 0.3 * max(0, 1 - max(0, dist(e.x, e.y, b.x, b.y) - 8) / 36) };
  if (l5Done.filter(Boolean).length < l5Cuts) return;
  const sa = lvAvg(l5Done.map(c => c.acc)), stars = l5Star(l5Pa, sa);
  l5Pinch.push(l5Pa); l5Slice.push(sa); l5Total += stars; l5Round++; l5Good = stars >= 3;
  l5Msg = 'Pizza ' + l5Round + ' done!\nPinch accuracy: ' + pct(l5Pa) + '\nSlice accuracy: ' + pct(sa); l5Stars = stars;
  l5State = 'SLICE_END'; l5Timer = 55;
}
function runLevel5() {
  l5Update(); push();
  if (l5State === 'NEXT_STAGE') lvResult(['Average pinch: ' + pct(lvAvg(l5Pinch)), 'Average slicing: ' + pct(lvAvg(l5Slice))], l5Total / L5_ROUNDS, 5, (lvAvg(l5Pinch) + lvAvg(l5Slice)) / 2, 'See Final Results');
  else {
    lvBack(lvWood); l5DrawBox();
    if (l5State === 'PINCH') l5DrawPizza(L5R.x, L5R.y, l5D); else l5DrawPizza(L5B.x, L5B.y, l5D);
    l5DrawTools(); l5DrawHud();
  }
  pop();
}
function l5DrawBox() {
  stroke(110, 75, 40); strokeWeight(3); fill(165, 130, 90);
  [[-170, -232, 340, 62], [-170, 170, 340, 62], [-232, -160, 62, 320], [170, -160, 62, 320]].forEach(r => rect(L5B.x + r[0], L5B.y + r[1], r[2], r[3]));
  fill(140, 105, 70); rect(L5B.x - 170, L5B.y - 170, 340, 340);
  drawingContext.setLineDash([14, 10]); stroke(255, 240, 200); strokeWeight(5); fill(0, 30); ellipse(L5B.x, L5B.y, l5T, l5T); drawingContext.setLineDash([]);
}
const lvTopp = () => {
  const a = [];
  for (let k = 0; k < 80 && a.length < 7; k++) {
    const t = { a: random(TWO_PI), r: random(0.1, 0.65) };
    if (a.every(o => Math.hypot(cos(t.a) * t.r - cos(o.a) * o.r, sin(t.a) * t.r - sin(o.a) * o.r) > 0.36)) a.push(t);
  }
  return a;
};
function l5DrawPizza(x, y, d, tp = l5Topp, c = L4_P.ok) {
  noStroke(); fill(0, 45); ellipse(x + d * 0.025, y + d * 0.035, d, d);
  stroke(...c[0]); strokeWeight(max(3, d * 0.03)); fill(...c[1]); ellipse(x, y, d, d);
  noStroke(); fill(...c[2]); ellipse(x, y, d * 0.86, d * 0.86);
  tp.forEach(t => {
    const px = x + cos(t.a) * t.r * d / 2, py = y + sin(t.a) * t.r * d / 2, s = d * 0.14;
    fill(...c[4]); ellipse(px + s * 0.07, py + s * 0.1, s, s); fill(...c[3]); ellipse(px, py, s, s);
  });
}
function l5Trail(pts, good) { noFill(); stroke(good ? color(30, 170, 50) : color(220, 40, 40)); strokeWeight(5); beginShape(); pts.forEach(p => vertex(p.x, p.y)); endShape(); }
function l5DrawTools() {
  if (l5State === 'PINCH') {
    const l = { x: L5R.x - l5D / 2, y: L5R.y }, r = { x: L5R.x + l5D / 2, y: L5R.y }, c = l5Grab && l5Fit() >= 0.8 ? color(150, 225, 140) : color(244, 204, 204);
    l5Dash(l, r, 90, 4, [14, 10]); l5Dot(l.x, l.y, 58, c); l5Dot(r.x, r.y, 58, c);
  }
  if (l5State === 'SLICE') {
    const H = l5H();
    for (let i = 0; i < l5Cuts; i++) if (!l5Done[i]) l5Dash(H[i], H[i + l5Cuts], 0, 3, [10, 8]);
    H.forEach((h, i) => { if (!l5Done[i % l5Cuts]) l5Dot(h.x, h.y, 34); });
  }
  l5Done.forEach(c => c && l5Trail(c.pts, c.acc >= 0.8));
  if (l5Drag) l5Trail(l5Drag.pts, l5Live() >= 0.8);
}
function l5DrawHud() {
  const pinch = l5State === 'PINCH', dn = l5Done.filter(Boolean).map(c => c.acc);
  const acc = pinch ? (l5Grab ? l5Fit() : null) : l5Drag ? l5Live() : dn.length ? lvAvg(dn) : null;
  lvHud('Pinch and Slice the Pizza', 560, 38, 18, 'Pizza ' + min(l5Round + (l5State === 'SLICE_END' ? 0 : 1), L5_ROUNDS) + '/' + L5_ROUNDS + '   Slices ' + l5Cuts * 2 + '   Score ' + l5Total,
    pinch ? 'Pinch accuracy ' + (acc === null ? '--' : pct(acc)) : 'Pinch ' + pct(l5Pa) + '   Slice ' + (acc === null ? '--' : pct(acc)), acc === null ? color(120, 50, 15) : acc >= 0.8 ? color(30, 130, 50) : color(180, 40, 30));
  if (l5State === 'SLICE_END') lvMsgCard(l5Msg, l5Good, l5Stars);
}
const L2X = 640, L2Y = 385, L2R = 165, L2B = 38, L2N = 67, L2_PIZZAS = 3, L4_PIZZAS = 3, L4_TIME = 15, L4_LIMIT = 7.5, L4_RISE = 120;
const L2 = {
  Circle: [120, i => [145 * cos(i * PI / 60), 145 * sin(i * PI / 60)]],
  Square: [4, i => [[-115, -115], [115, -115], [115, 115], [-115, 115]][i]],
  Star: [10, i => { const r = i % 2 ? 75 : 158, a = -HALF_PI + i * PI / 5; return [r * cos(a), r * sin(a)]; }],
  Heart: [120, i => { const t = i * PI / 60; return [139.2 * pow(sin(t), 3), -8.7 * (13 * cos(t) - 5 * cos(2 * t) - 2 * cos(3 * t) - cos(4 * t))]; }],
  Triangle: [3, i => [[0, -155], [-145, 95], [145, 95]][i]]
};
const L2_STEPS = [['1. Select', 'Choose a shape from the list\non the left.'], ['2. Spread', 'Use one finger to spread sauce on\nthe pizza within the lines of\nthe shape!']];
const L4_STEPS = [['1. Heat', 'Hold down the HOLD button to raise\nthe bar. Let go and it drops, so\nkeep tapping to hold it steady.'], ['2. Stay Green', 'Keep the bar in the green zone for\n15 seconds. Time spent outside the\ngreen cooks the pizza, too much\nburns it. Each pizza drops faster!']];
const L4_KIND = ['Overcooked!', 'Almost burnt', 'Very crispy', 'A bit overdone', 'Nicely done', 'Perfect!'], L4_ZONES = ['Green', 'Yellow', 'Red'];
const L4_P = { ok: [[190, 120, 50], [232, 160, 70], [255, 214, 120], [200, 60, 45], [150, 40, 30]], burnt: [[40, 24, 14], [70, 40, 22], [110, 72, 40], [60, 25, 20], [35, 15, 12]] };
const l4Pal = c => L4_P.ok.map((v, i) => v.map((x, k) => lerp(x, L4_P.burnt[i][k], c)));
const lvGrade = a => [40, 60, 70, 80, 90].filter(t => a >= t).length;
const inPoly = (x, y, p) => p.reduce((s, a, i) => { const b = p[(i + p.length - 1) % p.length]; return (a.y > y) !== (b.y > y) && x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x ? !s : s; }, false);
const l2Calc = () => { l2Acc = l2Hit / (l2Sh + l2Out) * 100; };
const lvBox = (x, y, w, h) => { stroke(120, 60, 20); strokeWeight(4); fill(255, 236, 170); rect(x, y, w, h, 20); noStroke(); fill(120, 50, 15); };
function startLevel2() { lvRun[2] = 0; l2Pizza = 1; l2Scores = []; l2Stars = []; l2State = 'PLAY'; l2Clear('Circle'); l2Was = true; currentScreen = "level2"; }
function l2Next() { l2Pizza++; l2State = 'PLAY'; l2Clear(); }
function l2Clear(s = l2Shape) {
  l2Shape = s;
  if (s !== l2Built) {
    l2Poly = Array.from({ length: L2[s][0] }, (_, i) => { const [x, y] = L2[s][1](i); return { x: L2X + x, y: L2Y + y }; });
    l2Cell = Array.from({ length: L2N * L2N }, (_, n) => {
      const x = L2X - L2R + n % L2N * 5, y = L2Y - L2R + floor(n / L2N) * 5;
      return dist(x, y, L2X, L2Y) > L2R ? 0 : inPoly(x, y, l2Poly) ? 1 : l2Poly.some((a, i) => segDist({ x, y }, a, l2Poly[(i + 1) % l2Poly.length]) <= 5) ? 0 : 2;
    });
    l2Sh = l2Cell.filter(c => c === 1).length; l2Built = s;
  }
  sauce = sauce || createGraphics(width, height); sauce.clear(); l2Mk = Array(L2N * L2N).fill(0); l2Hit = l2Out = l2Acc = 0; l2Lx = l2Ly = null; l2Hx = L2X; l2Hy = L2Y; l2Pen = false;
}
function l2Paint(x, y) {
  if (dist(x, y, L2X, L2Y) > L2R - L2B / 2) return;
  sauce.noStroke(); sauce.fill(188, 42, 28, 245); sauce.ellipse(x, y, L2B, L2B); sauce.fill(205, 52, 32, 100); sauce.ellipse(x - 2, y - 2, L2B - 7, L2B - 7);
  const ci = round((x - L2X + L2R) / 5), cj = round((y - L2Y + L2R) / 5);
  for (let n = 0; n < 81; n++) {
    const i = ci - 4 + n % 9, j = cj - 4 + floor(n / 9), k = j * L2N + i;
    if (i >= 0 && i < L2N && j >= 0 && j < L2N && !l2Mk[k] && dist(L2X - L2R + i * 5, L2Y - L2R + j * 5, x, y) <= L2B / 2) { l2Mk[k] = 1; if (l2Cell[k] === 1) l2Hit++; else if (l2Cell[k] === 2) l2Out++; }
  }
}
function l2Spread() {
  if (dist(mouseX, mouseY, L2X, L2Y) > L2R) { l2Lx = null; return; }
  if (l2Lx === mouseX && l2Ly === mouseY) return;
  const n = l2Lx === null ? 1 : max(1, ceil(dist(l2Lx, l2Ly, mouseX, mouseY) / 2)), x0 = l2Lx === null ? mouseX : l2Lx, y0 = l2Lx === null ? mouseY : l2Ly;
  for (let i = 1; i <= n; i++) l2Paint(lerp(x0, mouseX, i / n), lerp(y0, mouseY, i / n));
  l2Lx = mouseX; l2Ly = mouseY; l2Calc();
}
function l2Update() {
  const press = mouseIsPressed && !l2Was; l2Was = mouseIsPressed;
  if (l2State !== 'PLAY') return;
  if (dist(mouseX, mouseY, L2X, L2Y) <= L2R) { l2Hx = mouseX; l2Hy = mouseY; }
  if (!mouseIsPressed) { l2Pen = false; l2Lx = null; } else if (press && !inRect(980, 560, 200, 60) && !inRect(70, 135, 255, 320) && !inRect(20, 20, 140, 60)) l2Pen = true;
  if (l2Pen) l2Spread();
}
function l2Finish() {
  l2Calc(); l2Scores.push(l2Acc); l2Stars.push(lvGrade(l2Acc)); l2Lx = null; l2Pen = false;
  l2Note = 'Accuracy: ' + floor(l2Acc) + '%\nCovered ' + floor(l2Hit / l2Sh * 100) + '%   Spilled ' + floor(l2Out / max(1, l2Hit + l2Out) * 100) + '%';
  l2State = l2Pizza === L2_PIZZAS ? 'NEXT_STAGE' : 'PIZZA_END';
}
function l2Click(back) {
  const k = Object.keys(L2), i = round((mouseY - 215) / 48);
  if (l2State === 'NEXT_STAGE') { if (inRect(392, 593, 496, 78)) goToNextStage(); }
  else if (back) currentScreen = "menu";
  else if (l2State === 'PIZZA_END') { if (inRect(520, 496, 240, 60)) { l2Next(); l2Was = true; } }
  else if (mouseX > 75 && mouseX < 320 && i >= 0 && i < 5 && abs(mouseY - 215 - i * 48) < 20) { if (k[i] !== l2Shape) l2Clear(k[i]); }
  else if (inRect(980, 560, 200, 60)) l2Finish();
}
function runLevel2() {
  l2Update(); push();
  if (l2State === 'NEXT_STAGE') lvResult(['Average accuracy: ' + pct(lvAvg(l2Scores) / 100)], lvAvg(l2Stars), 2, lvAvg(l2Scores) / 100);
  else { lvBack(lvTable); lvTop('Menu', 'Add The Sauce', 460, 42); l2Draw(); }
  pop();
}
function l2Draw() {
  stroke(45, 25, 10); strokeWeight(5); fill(112, 66, 38); ellipse(L2X, L2Y, 450, 450);
  noFill(); stroke(150, 98, 60, 160); strokeWeight(2); ellipse(L2X, L2Y, 424, 424);
  noStroke(); fill(0, 0, 0, 45); ellipse(L2X + 6, L2Y + 9, 380, 380);
  stroke(214, 160, 80); strokeWeight(8); fill(255, 229, 153); ellipse(L2X, L2Y, 380, 380);
  noFill(); strokeWeight(2); ellipse(L2X, L2Y, 340, 340); image(sauce, 0, 0);
  stroke(85, 50, 20); strokeWeight(4); drawingContext.setLineDash([12, 8]); beginShape(); l2Poly.forEach(p => vertex(p.x, p.y)); endShape(CLOSE); drawingContext.setLineDash([]);
  lvBox(70, 135, 255, 320); textAlign(LEFT, CENTER); textSize(22); text('Pizza Shapes', 100, 168); textSize(20);
  Object.keys(L2).forEach((s, i) => {
    const y = 215 + i * 48; noStroke(); fill(120, 50, 15); text(s, 140, y); noFill(); stroke(120, 60, 20); strokeWeight(2); rect(100, y - 7, 14, 14);
    if (l2Shape === s) { noStroke(); fill(200, 60, 45); rect(103, y - 4, 8, 8); }
  });
  lvBox(955, 120, 250, 105); textAlign(CENTER, CENTER); textSize(22); text('Accuracy', 1080, 147);
  fill(205, 180, 130); rect(980, 173, 200, 22, 11); fill(l2Acc >= 80 ? color(70, 200, 90) : l2Acc >= 50 ? color(240, 180, 50) : color(220, 60, 50)); rect(980, 173, map(l2Acc, 0, 100, 0, 200), 22, 11);
  fill(120, 50, 15); textSize(18); text(floor(l2Acc) + '%', 1080, 208);
  lvBox(955, 240, 250, 55); textSize(22); text('Pizza ' + l2Pizza + ' of ' + L2_PIZZAS, 1080, 268);
  l2Jar(); l2Ladle(l2Hx, l2Hy);
  if (l2State === 'PLAY') lvBtn('Finish', 980, 560, 200, 60, 26);
  else { const n = l2Stars[l2Stars.length - 1]; lvCard('Pizza ' + l2Pizza + ' Complete!', l2Note, n >= 3, n); lvBtn('Next Pizza', 520, 496, 240, 60, 26); }
}
function l2Ladle(x, y) {
  push();
  [[color(90, 90, 90, 100), 14, 18, -8, 105, -95], [180, 11, 15, -10, 102, -97], [235, 3, 18, -13, 99, -94]].forEach(([c, w, a, b, d, e]) => { stroke(c); strokeWeight(w); line(x + a, y + b, x + d, y + e); });
  fill(170); stroke(90); strokeWeight(3); ellipse(x, y, 58, 47);
  noStroke(); fill(175, 35, 25); ellipse(x, y + 3, 43, 31); fill(220, 70, 45, 150); ellipse(x - 5, y - 2, 18, 9);
  pop();
}
function l2Jar() {
  push(); translate(135, 0); noStroke(); fill(0, 0, 0, 60); ellipse(945, 515, 165, 30);
  fill(230, 235, 230); stroke(100); strokeWeight(3); rect(870, 335, 150, 180, 22);
  noStroke(); fill(175, 35, 25); rect(880, 390, 130, 112, 15); ellipse(945, 393, 130, 25);
  fill(250, 225, 180); rect(877, 420, 136, 55, 8); fill(165, 35, 25); textAlign(CENTER, CENTER); textSize(23); text('PIZZA', 945, 437); textSize(18); text('SAUCE', 945, 458);
  fill(75); stroke(45); strokeWeight(3); rect(865, 320, 160, 32, 7); stroke(130); strokeWeight(2);
  for (let x = 875; x <= 1015; x += 12) line(x, 325, x, 347);
  pop();
}
function startLevel4() { lvRun[4] = 0; l4P = 1; l4Speed = 90; l4Zs = []; l4Stars = []; l4Reset(); l4Was = true; currentScreen = "level4"; }
function l4Reset() { l4Bar = 384; l4Hold = l4Run = false; l4Z = [0, 0, 0]; l4Topp = lvTopp(); l4State = 'PLAY'; }
function l4Update() {
  const press = mouseIsPressed && !l4Was; l4Was = mouseIsPressed;
  if (l4State === 'COOK' && ++l4T >= 40) l4State = 'POP';
  if (l4State !== 'PLAY') return;
  if (press && dist(mouseX, mouseY, 1120, 390) < 90) l4Hold = l4Run = true;
  l4Hold = l4Hold && mouseIsPressed;
  if (!l4Run) return;
  const dt = min(deltaTime, 50) / 1000, d = abs((l4Bar = constrain(l4Bar + dt * (l4Hold ? -L4_RISE : l4Speed), 216, 600)) + 6 - 390), z = d <= 18 ? 0 : d <= 96 ? 1 : 2;
  l4Z[z] += min(dt, L4_TIME - lvSum(l4Z), z ? L4_LIMIT - l4Z[1] - l4Z[2] : dt);
  if (lvSum(l4Z) >= L4_TIME - 1e-9 || l4Z[1] + l4Z[2] >= L4_LIMIT - 1e-9) l4Finish();
}
function l4Finish() {
  const o = l4Z[1] + l4Z[2];
  l4Zs.push(l4Z); l4Stars.push(o >= L4_LIMIT - 1e-9 ? 0 : 5 - floor(5 * o / L4_LIMIT)); l4Hold = false; l4State = 'COOK'; l4T = 0;
}
function l4Click(back) {
  if (l4State === 'NEXT_STAGE') { if (inRect(392, 593, 496, 78)) goToNextStage(); }
  else if (back) currentScreen = "menu";
  else if (l4State === 'POP' && inRect(520, 496, 240, 60)) { l4Was = true; if (l4P < L4_PIZZAS) { l4P++; l4Speed += 55; l4Reset(); } else l4State = 'NEXT_STAGE'; }
}
function runLevel4() {
  l4Update(); push();
  if (l4State === 'NEXT_STAGE') lvResult(L4_ZONES.map((z, i) => z + ' zone: ' + lvSum(l4Zs.map(a => a[i])).toFixed(1) + 's'), lvAvg(l4Stars), 4, lvSum(l4Zs.map(a => a[0])) / lvSum(l4Zs.map(lvSum)));
  else { lvBack(lvOven); l4Draw(); }
  pop();
}
function l4Draw() {
  const o = l4Z[1] + l4Z[2], c = min(1, o / L4_LIMIT), hov = dist(mouseX, mouseY, 1120, 390) < 90, n = l4Stars[l4Stars.length - 1];
  noStroke(); push(); translate(420, 560); scale(1, 0.55); l5DrawPizza(0, 0, 280, l4Topp, l4Pal(c)); pop();
  lvBox(735, 150, 270, 555); textAlign(RIGHT, CENTER); textSize(20); text('Overcooking', 880, 222); text('Perfect', 880, 390); text('Overcooking', 880, 600);
  stroke(120, 60, 20); strokeWeight(3); fill(240, 180, 115); rect(903, 198, 64, 438, 8); ellipse(934, 642, 114, 96);
  noStroke(); fill(220, 60, 50); rect(913, 208, 44, 414, 5); fill(250, 210, 60); rect(913, 294, 44, 78, 5); rect(913, 408, 44, 78, 5); fill(70, 190, 90); rect(913, 372, 44, 36); fill(220, 60, 50); ellipse(934, 642, 80, 64);
  fill(150); stroke(100); strokeWeight(2); rect(889, l4Bar, 92, 12);
  lvBox(1025, 135, 230, 130); textAlign(CENTER, CENTER); textSize(24); text('Doneness', 1140, 165); fill(205, 180, 130); rect(1045, 190, 190, 24, 12); fill(lerp(250, 200, c), lerp(200, 50, c), lerp(60, 40, c)); rect(1045, 190, 190 * c, 24, 12);
  fill(120, 50, 15); textSize(18); text(o.toFixed(1) + ' / ' + L4_LIMIT + 's out of green', 1140, 238);
  stroke(120, 60, 20); strokeWeight(5); fill(l4Hold ? color(190, 60, 40) : hov ? color(255, 120, 90) : color(232, 92, 62)); ellipse(1120, 390, l4Hold ? 170 : 180, l4Hold ? 170 : 180);
  noStroke(); fill(255, 236, 170); textAlign(CENTER, CENTER); textSize(36); text('HOLD', 1120, 392);
  lvHud('Cook The Pizza', 460, 42, 20, 'Pizza ' + l4P + ' of ' + L4_PIZZAS, l4State !== 'PLAY' ? 'Finished' : l4Run ? 'Time left: ' + (L4_TIME - lvSum(l4Z)).toFixed(1) + 's' : 'Press HOLD to start', color(120, 50, 15));
  if (l4State === 'POP') { lvCard(L4_KIND[n], 'Pizza ' + l4P + ' of ' + L4_PIZZAS + '\n' + L4_ZONES.map((z, i) => z + ' ' + l4Z[i].toFixed(1) + 's').join('  '), n >= 3, n, 24); lvBtn('Continue', 520, 496, 240, 60, 26); }
}
const L3_NAMES = ['pepperoni', 'pineapple', 'green pepper', 'onions', 'mushrooms', 'olives', 'cheese'], L3_X = [200, 450, 700], l3X = i => 100 + i * 115;
const L3_STEPS = [['1. Read The Tickets', 'Each ticket on the right lists the\ntoppings one pizza needs.'], ['2. Add Toppings', 'Drag toppings from the counter onto\nthe matching pizza. Click a topping\nto remove it, then press Finish!']];
const L3_ICON = {
  pepperoni: () => { stroke(130, 25, 20); strokeWeight(3); fill(205, 60, 45); ellipse(0, 0, 50, 50); noStroke(); fill(150, 35, 28); [[-12, -8], [10, -12], [4, 10], [-8, 12], [15, 6]].forEach(([x, y]) => ellipse(x, y, 8, 8)); },
  pineapple: () => { rotate(0.35); stroke(225, 170, 30); strokeWeight(3); fill(250, 215, 70); rect(-22, -22, 44, 44, 10); stroke(235, 185, 40); strokeWeight(2); line(-14, -18, 18, 14); line(-18, -4, 4, 18); line(-4, -18, 18, 4); },
  'green pepper': () => { noFill(); stroke(60, 150, 60); strokeWeight(9); ellipse(0, 0, 40, 40); stroke(120, 200, 100); strokeWeight(3); ellipse(0, 0, 40, 40); },
  onions: () => { noFill(); stroke(235, 220, 235); strokeWeight(6); ellipse(0, 0, 50, 50); stroke(210, 170, 205); strokeWeight(4); ellipse(0, 0, 32, 32); stroke(185, 135, 180); strokeWeight(3); ellipse(0, 0, 16, 16); },
  mushrooms: () => { noStroke(); fill(240, 228, 205); rect(-8, 2, 16, 26, 5); stroke(150, 105, 70); strokeWeight(3); fill(200, 160, 120); ellipse(0, -4, 54, 36); noStroke(); fill(225, 190, 150); ellipse(-12, -8, 7, 6); ellipse(8, -10, 8, 6); },
  olives: () => { noFill(); stroke(35, 35, 48); strokeWeight(11); ellipse(0, 0, 38, 38); noStroke(); fill(110, 110, 130); ellipse(-11, -11, 6, 6); },
  cheese: () => { stroke(225, 150, 20); strokeWeight(3); fill(255, 205, 60); triangle(-28, 16, 28, 16, 28, -16); noStroke(); fill(235, 165, 30); ellipse(14, 6, 9, 9); ellipse(2, 10, 6, 6); ellipse(20, -4, 6, 6); }
};
const l3Calc = p => l3Tick[p].filter(n => l3Top[p].some(t => t.n === n)).length / (l3Tick[p].length + l3Top[p].filter(t => t.bad).length) * 100;
const l3Clock = () => [floor(l3Time / 60), floor(l3Time) % 60].map(v => String(v).padStart(2, '0')).join(':');
const l3Paper = d => {
  beginShape();
  for (let k = 0; k <= 15; k++) vertex(950 + k * 20 + d, (k % 2 ? 38 : 50) + d);
  for (let k = 15; k >= 0; k--) vertex(950 + k * 20 + d, (k % 2 ? 692 : 680) + d);
  endShape(CLOSE);
};
function l3Icon(n, x, y, s = 60) { push(); translate(x, y); scale(s / 60); L3_ICON[n](); pop(); }
function startLevel3() {
  lvRun[3] = 0; l3Top = [[], [], []]; l3Acc = []; l3Stars = []; l3Time = 0; l3Drag = -1; l3Was = true; l3State = 'PLAY';
  l3Tick = [0, 1, 2].map(() => L3_NAMES.map(n => [random(), n]).sort((a, b) => a[0] - b[0]).slice(0, floor(random(3, 5))).map(a => a[1]));
  currentScreen = "level3";
}
function l3Update() {
  const press = mouseIsPressed && !l3Was, rel = !mouseIsPressed && l3Was; l3Was = mouseIsPressed;
  if (l3State !== 'PLAY') return;
  l3Time += min(deltaTime, 50) / 1000;
  if (press) l3Drag = L3_NAMES.findIndex((n, i) => abs(mouseX - l3X(i)) <= 30 && abs(mouseY - 190) <= 30);
  if (rel && l3Drag >= 0) {
    const p = L3_X.findIndex(x => dist(mouseX, mouseY, x, 450) < 110);
    if (p >= 0) l3Top[p].push({ n: L3_NAMES[l3Drag], x: mouseX, y: mouseY, bad: !l3Tick[p].includes(L3_NAMES[l3Drag]) });
    l3Drag = -1;
  }
}
function l3Finish() { l3Acc = [0, 1, 2].map(l3Calc); l3Stars = l3Acc.map(a => lvGrade(a)); l3State = 'NEXT_STAGE'; l3Drag = -1; }
function l3Click(back) {
  if (l3State === 'NEXT_STAGE') { if (inRect(392, 593, 496, 78)) goToNextStage(); }
  else if (back) currentScreen = "menu";
  else if (inRect(760, 626, 180, 60)) l3Finish();
  else { const h = l3Top.flatMap((a, p) => a.map((t, i) => [p, i, t])).filter(e => dist(mouseX, mouseY, e[2].x, e[2].y) < 20).pop(); if (h) l3Top[h[0]].splice(h[1], 1); }
}
function runLevel3() {
  l3Update(); push();
  if (l3State === 'NEXT_STAGE') lvResult(['Average accuracy: ' + pct(lvAvg(l3Acc) / 100), 'Time: ' + l3Clock()], lvAvg(l3Stars), 3, lvAvg(l3Acc) / 100);
  else { lvBack(lvWood); l3Draw(); }
  pop();
}
function l3Draw() {
  lvTop('Menu', 'Add The Toppings', 340, 36); lvPill(825, 20, 110, 70, color(255, 236, 170)); textAlign(CENTER, CENTER); textSize(16); text('TIME', 880, 38); textSize(28); text(l3Clock(), 880, 66);
  noStroke(); fill(0, 0, 0, 45); rect(54, 136, 800, 124, 14); stroke(95, 100, 108); strokeWeight(4); fill(196, 202, 208); rect(50, 130, 800, 120, 14); noStroke(); fill(225, 230, 235); rect(58, 134, 784, 8, 4);
  L3_NAMES.forEach((n, i) => { l3Icon(n, l3X(i), 188); noStroke(); fill(70, 75, 85); textAlign(CENTER, CENTER); textSize(16); text(n, l3X(i), 236); });
  L3_X.forEach((x, p) => {
    const over = l3Drag >= 0 && dist(mouseX, mouseY, x, 450) < 110;
    noStroke(); fill(0, 0, 0, 45); ellipse(x + 6, 459, 220, 220); stroke(over ? color(255, 255, 255) : color(214, 160, 80)); strokeWeight(8); fill(255, 229, 153); ellipse(x, 450, 220, 220); noStroke(); fill(188, 42, 28); ellipse(x, 450, 190, 190);
    fill(255); textAlign(CENTER, CENTER); textSize(24); text('Pizza ' + (p + 1), x, 322);
    l3Top[p].forEach(t => {
      l3Icon(t.n, t.x, t.y, 44);
      if (t.bad) { noFill(); stroke(255, 0, 0); strokeWeight(3); drawingContext.shadowBlur = 15; drawingContext.shadowColor = 'red'; ellipse(t.x, t.y, 48, 48); drawingContext.shadowBlur = 0; noStroke(); }
    });
  });
  noStroke(); fill(0, 0, 0, 40); l3Paper(8); stroke(200, 175, 130); strokeWeight(2); fill(255, 250, 236); l3Paper(0);
  l3Tick.forEach((r, p) => {
    const y = 66 + p * 208; noStroke(); fill(120, 50, 15); textAlign(LEFT, CENTER); textSize(24); text('Ticket ' + (p + 1), 975, y + 14);
    r.forEach((n, j) => { l3Icon(n, 990, y + 56 + j * 36, 30); noStroke(); fill(120, 50, 15); textAlign(LEFT, CENTER); textSize(22); text(n[0].toUpperCase() + n.slice(1), 1015, y + 56 + j * 36); });
    if (p < 2) { stroke(200, 175, 130); strokeWeight(2); drawingContext.setLineDash([8, 6]); line(970, y + 196, 1230, y + 196); drawingContext.setLineDash([]); }
  });
  lvBtn('Finish', 760, 626, 180, 60, 26);
  if (l3Drag >= 0) l3Icon(L3_NAMES[l3Drag], mouseX, mouseY, 72);
}
const LV = [[1, 'Roll The Dough', 'path accuracy'], [2, 'Add The Sauce', 'sauce accuracy'], [3, 'Add The Toppings', 'topping accuracy'], [4, 'Cook The Pizza', 'time in green'], [5, 'Pinch and Slice', 'pinch and slice accuracy']], LV_KEY = 'fultonsPizzeriaStats';
function lvNone() { return { lv: {}, games: 0, best: 0 }; }
function lvLoad() {
  try {
    const t = JSON.parse(localStorage.getItem(LV_KEY));
    if (t && Number.isFinite(t.games) && Number.isFinite(t.best) && Object.values(t.lv).every(v => ['plays', 'best', 'sum', 'acc', 'accBest'].every(k => Number.isFinite(v[k])))) lvStats = t;
  } catch (e) { }
}
function lvSave() { try { localStorage.setItem(LV_KEY, JSON.stringify(lvStats)); } catch (e) { } }
function lvDone(n, stars, acc) {
  if (lvRun[n]) return;
  lvRun[n] = { stars, acc };
  const t = lvStats.lv[n] = lvStats.lv[n] || { plays: 0, best: 0, sum: 0, acc: 0, accBest: 0 };
  t.plays++; t.best = max(t.best, stars); t.sum += stars; t.acc += acc; t.accBest = max(t.accBest, acc); lvSave();
}
function lvFinish() {
  const r = LV.map(l => lvRun[l[0]]);
  if (r.every(Boolean)) { lvStats.games++; lvStats.best = max(lvStats.best, lvAvg(r.map(x => x.stars))); lvSave(); }
}
function lvReset() { lvStats = lvNone(); lvSave(); }
function lvStarRow(x, y, v, s = 30) {
  textAlign(CENTER, CENTER); textSize(s);
  for (let i = 0; i < 5; i++) { fill(i < round(v) ? color(245, 180, 20) : color(205, 180, 130)); text('\u2605', x + (i - 2) * s * 1.2, y); }
}
function lvStarVal(x, y, v) { textAlign(CENTER, CENTER); textSize(26); fill(245, 180, 20); text('\u2605', x - 28, y - 1); fill(120, 50, 15); text(v.toFixed(1), x + 8, y); }
function lvStatsPage() {
  lvBack(lvOrange); lvTop('Menu', 'Stats', 460, 42); lvBox(60, 110, 1160, 590);
  const X = [590, 725, 860, 995, 1130], h = min(96, 380 / LV.length), t = lvStats;
  textAlign(CENTER, CENTER); textSize(20); ['Plays', 'Best\nstars', 'Avg\nstars', 'Avg\naccuracy', 'Best\naccuracy'].forEach((l, i) => text(l, X[i], 152));
  textAlign(LEFT, CENTER); text('Level', 95, 152); stroke(190, 150, 100); strokeWeight(2); line(85, 182, 1195, 182);
  LV.forEach(([k, name, sub], i) => {
    const s = t.lv[k], y = 190 + h * i + h / 2;
    stroke(225, 195, 140); strokeWeight(1.5); if (i) line(85, y - h / 2, 1195, y - h / 2);
    noStroke(); fill(120, 50, 15); textAlign(LEFT, CENTER); textSize(28); text('Level ' + k + ': ' + name, 95, y - 14); textSize(18); fill(150, 100, 60); text(sub, 95, y + 16);
    textAlign(CENTER, CENTER); textSize(26); fill(120, 50, 15);
    if (!s) { text('0', X[0], y); X.slice(1).forEach(x => text('--', x, y)); return; }
    text(s.plays, X[0], y); lvStarVal(X[1], y, s.best); lvStarVal(X[2], y, s.sum / s.plays); text(pct(s.acc / s.plays), X[3], y); text(pct(s.accBest), X[4], y);
  });
  noStroke(); fill(120, 50, 15); textAlign(LEFT, CENTER); textSize(24); text('Full games finished: ' + t.games + '     Best overall rating: ' + (t.games ? t.best.toFixed(1) + ' / 5' : '--'), 95, 655);
  lvPill(900, 628, 280, 54, lvConfirm ? color(200, 50, 40) : color(255, 214, 120)); textAlign(CENTER, CENTER); textSize(22); fill(lvConfirm ? color(255, 236, 170) : color(120, 50, 15)); text(lvConfirm ? 'Tap again to confirm' : 'Reset stats', 1040, 655);
}
function lvEndPage() {
  lvBack(lvGreen); textFont('Arial'); lvProps(); push();
  lvPill(CX - 330, 24, 660, 100, color(200, 50, 40)); lvPill(CX - 316, 36, 632, 76, color(255, 236, 170));
  textAlign(CENTER, CENTER); textFont('Georgia'); textStyle(BOLDITALIC); textSize(54); fill(255, 190, 90); text('Game Complete!', CX + 3, 79); fill(120, 50, 15); text('Game Complete!', CX, 76); pop();
  const h = min(62, 280 / LV.length), r = LV.map(l => lvRun[l[0]]).filter(Boolean), ov = r.length ? lvAvg(r.map(x => x.stars)) : 0, oy = 210 + LV.length * h + h / 2 + 8;
  lvBox(190, 150, 900, oy + h / 2 + 14 - 150); textAlign(LEFT, CENTER); textSize(20); text('Level', 225, 184); textAlign(CENTER, CENTER); text('Stars', 650, 184); text('Accuracy', 985, 184);
  stroke(190, 150, 100); strokeWeight(2); line(210, 202, 1070, 202); line(210, oy - h / 2 - 2, 1070, oy - h / 2 - 2); noStroke();
  LV.forEach(([k, name, sub], i) => {
    const s = lvRun[k], y = 210 + h * i + h / 2; fill(120, 50, 15); textAlign(LEFT, CENTER); textSize(24); text('Level ' + k + ': ' + name, 225, y - 8); textSize(16); fill(150, 100, 60); text(sub, 225, y + 14);
    textAlign(CENTER, CENTER); textSize(26); fill(120, 50, 15);
    if (!s) { text('--', 650, y); text('--', 985, y); return; }
    lvStarRow(630, y, s.stars, 28); fill(120, 50, 15); textSize(26); textAlign(LEFT, CENTER); text(s.stars.toFixed(1), 745, y); textAlign(CENTER, CENTER); text(pct(s.acc), 985, y);
  });
  fill(120, 50, 15); textAlign(LEFT, CENTER); textSize(30); text('Overall', 225, oy); lvStarRow(630, oy, ov, 28); fill(120, 50, 15); textSize(30); textAlign(LEFT, CENTER); text(ov.toFixed(1), 745, oy);
  textAlign(CENTER, CENTER); text(r.length ? pct(lvAvg(r.map(x => x.acc))) : '--', 985, oy);
  lvBtn('Play Again', 250, 600, 360, 76); lvBtn('Main Menu', 670, 600, 360, 76);
}
function lvPaper() {
  stroke(150, 110, 70); strokeWeight(3); fill(245, 230, 199); rect(372, 104, 536, 536, 12);
  noStroke(); fill(90); textAlign(CENTER, CENTER); textSize(34); text('Instructions', CX, 146);
  stroke(118, 80, 61); strokeWeight(4); fill(inRect(540, 572, 200, 56) ? color(248, 205, 150) : color(239, 181, 119)); rect(540, 572, 200, 56, 10);
  noStroke(); fill(20); textSize(36); text('NEXT', CX, 601);
}

function lvSteps(txt, y) { noStroke(); fill(90); textAlign(CENTER, TOP); textSize(26); textLeading(33); text(txt, CX, y); }

function l1Intro() {
  image(instrucImg, 0, 0, width, height); lvPaper();
  stroke(214, 160, 80); strokeWeight(6); fill(255, 229, 153); ellipse(CX, 292, 130, 120);
  for (let y = 205; y < 360; y += 26) lvDash(CX, y, CX, y + 13);
  noFill(); stroke(120, 60, 20); strokeWeight(4); ellipse(CX, 205, 40, 40);
  push(); translate(CX, 380); scale(0.5); lvPinBody(); stroke(70); strokeWeight(6); fill(255); ellipse(0, 0, 30, 30); pop();
  stroke(30, 170, 50); strokeWeight(6); line(CX + 150, 380, CX + 150, 300); noStroke(); fill(30, 170, 50); triangle(CX + 136, 304, CX + 164, 304, CX + 150, 276);
  lvSteps('Press and hold the rolling pin,\nthen drag it along the dashed path\nto roll the dough. Stay on the line\nfor a better accuracy score!', 418);
}

function lvIntro(n, steps, gap = 185) {
  lvBack(lvOrange); lvArrow(); textSize(44); fill(255); textAlign(CENTER, CENTER); text('Level ' + n, CX, 75); lvPaper();
  steps.forEach(([h, t], i) => { noStroke(); fill(120, 50, 15); textAlign(CENTER, CENTER); textSize(34); text(h, CX, 200 + i * gap); lvSteps(t, 240 + i * gap); });
}

function lvArrow() {
  stroke(118, 80, 61); strokeWeight(4); fill(inRect(20, 20, 190, 95) ? color(248, 205, 150) : color(239, 181, 119));
  beginShape(); [[35, 68], [72, 30], [72, 48], [197, 48], [197, 90], [72, 90], [72, 108]].forEach(p => vertex(p[0], p[1])); endShape(CLOSE);
  noStroke(); fill(40); textAlign(CENTER, CENTER); textSize(26); text('BACK', 134, 70);
}