/* art/cutscenes.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
/* Black swan cutscenes (240x135 pixel art), their character portraits, and the CEO portrait. */
const CUT = (() => {
const SW = 240, SH = 135, OUT = "#140f24";
let c = null;
const P = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); };
const px = (x, y, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), 1, 1); };
const hs = (a, b) => { const s = Math.sin(a*127.1 + b*311.7)*43758.5453; return s - Math.floor(s); };
const fr = v => v - Math.floor(v);
const ease = t => t < 0 ? 0 : t > 1 ? 1 : t*t*(3 - 2*t);

function bands(y0, y1, cols, x0 = 0, w = SW){
  const n = cols.length, bh = (y1 - y0)/n;
  for (let i = 0; i < n; i++){ const a = Math.round(y0 + i*bh), b = Math.round(y0 + (i + 1)*bh); P(x0, a, w, b - a, cols[i]); }
  for (let i = 1; i < n; i++){ const yb = Math.round(y0 + i*bh);
    for (let x = x0; x < x0 + w; x++){ if ((x + yb) % 2 === 0) px(x, yb - 1, cols[i]); else px(x, yb, cols[i - 1]); if (x % 4 === 0) px(x, yb - 2, cols[i]); } }
}
function disc(cx, cy, r, col){ for (let y = -r; y <= r; y++){ const w = Math.floor(Math.sqrt(r*r - y*y) + 0.35); P(cx - w, cy + y, w*2 + 1, 1, col); } }
function oval(cx, cy, rx, ry, col){ for (let y = -ry; y <= ry; y++){ const w = Math.floor(rx*Math.sqrt(Math.max(0, 1 - (y*y)/(ry*ry))) + 0.35); P(cx - w, cy + y, w*2 + 1, 1, col); } }
function tri(x1, y1, x2, y2, x3, y3, col){
  const minY = Math.floor(Math.min(y1, y2, y3)), maxY = Math.ceil(Math.max(y1, y2, y3));
  for (let y = minY; y <= maxY; y++){
    const xs = [];
    for (const [ax, ay, bx, by] of [[x1,y1,x2,y2],[x2,y2,x3,y3],[x3,y3,x1,y1]]) if (y >= Math.min(ay, by) && y < Math.max(ay, by)) xs.push(ax + (y - ay)*(bx - ax)/(by - ay));
    if (xs.length >= 2){ const a = Math.min(...xs), b = Math.max(...xs); P(a, y, b - a + 1, 1, col); }
  }
}
function line(x0, y0, x1, y1, col){ const n = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)))); for (let i = 0; i <= n; i++) px(x0 + (x1 - x0)*i/n, y0 + (y1 - y0)*i/n, col); }
function dither(x, y, w, h, col, density = 0.5, seed = 0){ for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++){ const d = (xx + yy) % 2 === 0 ? 0.25 : 0.75; if (hs(x + xx + seed, y + yy) < density*(d + 0.25)) px(x + xx, y + yy, col); } }

/* 3x5 pixel font */
const G = {A:"010101111101101",B:"110101110101110",C:"011100100100011",D:"110101101101110",E:"111100110100111",F:"111100110100100",G:"011100101101011",H:"101101111101101",I:"111010010010111",J:"001001001101010",K:"101101110101101",L:"100100100100111",M:"101111111101101",N:"110101101101101",O:"010101101101010",P:"110101110100100",Q:"010101101110011",R:"110101110101101",S:"011100010001110",T:"111010010010010",U:"101101101101111",V:"101101101101010",W:"101101111111101",X:"101101010101101",Y:"101101010010010",Z:"111001010100111",
  "0":"111101101101111","1":"010110010010111","2":"110001010100111","3":"110001010001110","4":"101101111001001","5":"111100110001110","6":"011100110101010","7":"111001010010010","8":"010101010101010","9":"010101011001110","!":"010010010000010","?":"110001010000010","%":"101001010100101","£":"011010111010111","-":"000000111000000",".":"000000000000010",":":"000010000010000","'":"010010000000000","(":"010100100100010","+":"000010111010000",")":"010001001001010"," ":"000000000000000"};
function text(str, x, y, col, s = 1, shadow){
  str = String(str).toUpperCase(); let cx = x;
  for (const ch of str){ const g = G[ch] || G[" "];
    for (let i = 0; i < 15; i++) if (g[i] === "1"){ const gx = cx + (i % 3)*s, gy = y + Math.floor(i/3)*s; if (shadow) P(gx + s, gy + s, s, s, shadow); P(gx, gy, s, s, col); }
    cx += 4*s; }
}
const textW = (str, s = 1) => String(str).length*4*s - s;

/* sprites: drawn once into small canvases, outlined, then blitted (with rotation if needed) */
const cache = {};
function makeSprite(name, w, h, fn, outline = true){
  if (cache[name]) return cache[name];
  const cv = document.createElement("canvas"); cv.width = w + 2; cv.height = h + 2;
  const saved = c; c = cv.getContext("2d"); c.translate(1, 1); fn(); c = saved;
  if (outline){
    const g = cv.getContext("2d"), id = g.getImageData(0, 0, cv.width, cv.height), d = id.data, W = cv.width, H = cv.height, mark = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){ const i = (y*W + x)*4; if (d[i+3] > 0) continue;
      const nb = [[1,0],[-1,0],[0,1],[0,-1]].some(([dx, dy]) => { const X = x + dx, Y = y + dy; return X >= 0 && Y >= 0 && X < W && Y < H && d[(Y*W + X)*4 + 3] > 0; });
      if (nb) mark.push(i); }
    for (const i of mark){ d[i] = 26; d[i+1] = 30; d[i+2] = 52; d[i+3] = 255; }
    g.putImageData(id, 0, 0);
  }
  return cache[name] = cv;
}
function blit(cv, x, y, ang = 0, flip = false, sc = 1){
  c.save(); c.imageSmoothingEnabled = false; c.translate(Math.round(x), Math.round(y));
  if (ang) c.rotate(ang); if (flip) c.scale(-1, 1); if (sc !== 1) c.scale(sc, sc);
  c.drawImage(cv, -Math.floor(cv.width/2), -Math.floor(cv.height/2)); c.restore();
}
const LOOKS = [
  {skin:"#f2c39b", hair:"#3a2418", shirt:"#2f6fe4", pants:"#2b2d52", tie:"#e8452c"},
  {skin:"#c68650", hair:"#1c1c1c", shirt:"#f4f1e8", pants:"#3a3f6b", tie:"#ffd23f"},
  {skin:"#8d5524", hair:"#111111", shirt:"#e8452c", pants:"#2b2d52", tie:"#2f6fe4"},
  {skin:"#ffdbac", hair:"#c9a227", shirt:"#5a6fd6", pants:"#1f2238", tie:"#ff8fb1"},
  {skin:"#e0a878", hair:"#b5562e", shirt:"#3fa05a", pants:"#2b2d52", tie:"#ffd23f"},
];
function guy(lk, pose, key){
  return makeSprite(`guy_${key}_${pose}`, 12, 20, () => {
    const sh = "rgba(0,0,0,.22)";
    if (pose === "run"){ P(3,14,2,4,lk.pants); P(7,13,2,4,lk.pants); P(1,18,4,2,"#1b1b2b"); P(8,16,3,2,"#1b1b2b"); }
    else { P(3,14,2,5,lk.pants); P(7,14,2,5,lk.pants); P(2,18,3,2,"#1b1b2b"); P(7,18,3,2,"#1b1b2b"); }
    P(2,8,8,7,lk.shirt); P(2,13,8,2,sh); P(5,8,2,5,lk.tie); P(5,8,2,1,"#fff");
    if (pose === "panic"){ P(0,2,2,7,lk.shirt); P(10,2,2,7,lk.shirt); P(0,0,2,2,lk.skin); P(10,0,2,2,lk.skin); }
    else if (pose === "run"){ P(0,9,2,4,lk.shirt); P(10,7,2,4,lk.shirt); P(0,13,2,1,lk.skin); P(10,6,2,1,lk.skin); }
    else { P(1,9,1,5,lk.shirt); P(10,9,1,5,lk.shirt); P(1,14,1,1,lk.skin); P(10,14,1,1,lk.skin); }
    P(2,1,8,7,lk.skin); P(2,6,8,1,sh);
    P(2,0,8,2,lk.hair); P(2,2,1,2,lk.hair); P(9,2,1,1,lk.hair);
    P(3,3,2,2,"#fff"); P(7,3,2,2,"#fff"); px(4,4,"#111"); px(8,4,"#111");
    if (pose === "panic" || pose === "run"){ P(5,5,2,2,"#5a1a1a"); } else P(5,6,2,1,"#7a3a2a");
    P(3,1,2,1,"rgba(255,255,255,.35)");
  });
}
const cow = () => makeSprite("cow", 20, 13, () => {
  P(2,3,14,7,"#f4f1e8"); P(5,3,4,3,"#1b1b2b"); P(11,6,3,3,"#1b1b2b"); P(2,8,14,2,"rgba(0,0,0,.15)");
  P(15,1,5,6,"#f4f1e8"); P(16,0,1,2,"#d8d0b8"); P(19,0,1,2,"#d8d0b8"); P(17,5,3,2,"#ff9cb0"); px(16,2,"#111");
  P(3,10,2,3,"#f4f1e8"); P(13,10,2,3,"#f4f1e8"); P(7,10,2,2,"#f4f1e8"); P(0,4,2,1,"#1b1b2b");
});
const umbrella = () => makeSprite("umb", 16, 12, () => {
  for (let i = 0; i < 8; i++) P(i, 7 - Math.floor(i*0.6), 16 - i*2, 1, i % 2 ? "#ff5a5f" : "#e8452c");
  P(0,8,16,1,"#b8352a"); P(7,0,2,1,"#1b1b2b"); P(7.5,8,1,4,"#3a3a4a");
});
const cone = () => makeSprite("cone", 7, 9, () => { tri(3.5,0,0,8,7,8,"#ff7a1a"); P(1,4,5,1,"#fff"); P(0,8,7,1,"#e05a10"); });
const brief = () => makeSprite("brief", 10, 8, () => { P(0,2,10,6,"#6b4a2b"); P(3,0,4,2,"#3a2a1e"); P(0,4,10,1,"#4e3520"); P(4,4,2,2,"#ffd23f"); });
const paper = () => makeSprite("paper", 6, 7, () => { P(0,0,6,7,"#f4f1e8"); P(1,1,4,1,"#9aa3b5"); P(1,3,4,1,"#9aa3b5"); P(1,5,3,1,"#9aa3b5"); }, false);
const cab = () => makeSprite("cab", 26, 12, () => {
  P(0,4,26,6,"#1b1b2b"); P(4,0,16,5,"#1b1b2b"); P(6,1,6,3,"#7fa7c4"); P(13,1,6,3,"#7fa7c4"); P(6,1,6,1,"#cfe3f2");
  P(10,-1,4,1,"#ffd23f"); P(3,9,5,3,"#2b2b3a"); P(18,9,5,3,"#2b2b3a"); P(4,10,3,1,"#9a9aa8"); P(19,10,3,1,"#9a9aa8"); P(24,5,2,2,"#ffe88a"); P(0,5,2,2,"#e8452c");
});
const bus = () => makeSprite("bus", 42, 24, () => {
  P(0,0,42,20,"#d7262e"); P(0,0,42,2,"#ff5a5f"); P(0,9,42,2,"#a51c22");
  for (let k = 0; k < 6; k++){ P(3 + k*6.5,3,5,4,"#bfd9ea"); P(3 + k*6.5,12,5,4,"#bfd9ea"); P(3 + k*6.5,3,5,1,"#eef6fb"); }
  P(4,19,7,5,"#1b1b2b"); P(30,19,7,5,"#1b1b2b"); P(6,21,3,1,"#9a9aa8"); P(32,21,3,1,"#9a9aa8"); P(40,14,2,3,"#ffe88a");
});
const car = col => makeSprite("car_" + col, 20, 10, () => { P(0,3,20,5,col); P(4,0,11,4,col); P(5,1,4,2,"#bfd9ea"); P(10,1,4,2,"#bfd9ea"); P(2,7,4,3,"#1b1b2b"); P(14,7,4,3,"#1b1b2b"); P(0,3,20,1,"rgba(255,255,255,.3)"); });
const desk = () => makeSprite("desk", 16, 12, () => { P(0,0,16,3,"#8a5a32"); P(0,0,16,1,"#b07848"); P(1,3,2,9,"#5e3a20"); P(13,3,2,9,"#5e3a20"); P(9,-5,6,5,"#1e2240"); P(10,-4,4,3,"#7fd3f7"); });
const cabinet = () => makeSprite("cab2", 9, 14, () => { P(0,0,9,14,"#7b8da6"); for (let k = 0; k < 3; k++){ P(0,4 + k*4,9,1,"#5d6e86"); P(3,1.5 + k*4,3,1,"#e6ecf4"); } });
const duck = () => makeSprite("duck", 7, 6, () => { oval(3,3,3,2,"#ffd23f"); disc(5,1,1.5,"#ffd23f"); P(6,1,2,1,"#ff9f1c"); px(5,1,"#111"); });

function face(o){
  // o: skin, hair, style, eyes, mouth, extras
  const t = o.t || 0, blink = fr(t*1.7) < 0.06;
  P(0, 0, 48, 48, o.bg || "#24264f"); for (let y = 0; y < 48; y += 3) P(0, y, 48, 1, "rgba(255,255,255,.03)");
  // hair that falls behind the head
  const hs2 = o.hairStyle, hD = o.hair ? shadeC(o.hair, -0.25) : "#000", hL = o.hair ? shadeC(o.hair, 0.25) : "#fff";
  if (hs2 === "long"){ oval(24, 20, 16, 14, o.hair); P(8, 18, 8, 28, o.hair); P(32, 18, 8, 28, o.hair); P(9, 30, 1, 14, hD); P(38, 30, 1, 14, hD); }
  else if (hs2 === "curly"){ oval(24, 19, 19, 17, o.hair); for (let k = 0; k < 26; k++){ const a = k*0.9, r = 12 + (k % 3)*3; px(24 + Math.cos(a)*r, 19 + Math.sin(a)*r*0.85, hL); } }
  else if (hs2 === "braids"){ oval(24, 19, 15, 13, o.hair); for (let y = 24; y < 47; y += 3){ P(8, y, 5, 2, o.hair); P(35, y, 5, 2, o.hair); P(9, y + 2, 3, 1, hD); P(36, y + 2, 3, 1, hD); } P(9, 45, 3, 2, "#E3C064"); P(36, 45, 3, 2, "#E3C064"); }
  else if (hs2 === "ponytail"){ P(35, 11, 7, 18, o.hair); P(37, 27, 5, 8, o.hair); P(38, 14, 1, 18, hD); }
  else if (hs2 === "bun"){ disc(24, 6, 6, o.hair); P(21, 3, 3, 1, hL); }
  else if (hs2 === "manbun"){ disc(24, 5, 4, o.hair); P(22, 3, 2, 1, hL); }
  else if (hs2 === "scarf"){ const sc = o.scarf || "#3E2E6A"; oval(24, 22, 18, 19, sc); P(6, 34, 36, 14, sc); P(9, 24, 2, 14, shadeC(sc, -0.2)); P(37, 24, 2, 14, shadeC(sc, -0.2)); }
  // shoulders and outfit
  const at = o.attire || "tie";
  if (at === "open"){ P(6, 38, 36, 10, o.shirt); P(19, 32, 10, 7, o.skin); tri(18, 38, 30, 38, 24, 46, "#F7F2E6"); tri(21, 38, 27, 38, 24, 42, o.skin); line(18, 38, 24, 47, shadeC(o.shirt, -0.3)); line(30, 38, 24, 47, shadeC(o.shirt, -0.3)); }
  else if (at === "three"){ P(6, 38, 36, 10, o.shirt); P(19, 32, 10, 7, o.skin); P(17, 38, 14, 10, shadeC(o.shirt, -0.28)); P(20, 38, 8, 3, "#F7F2E6"); P(22, 40, 4, 8, "#E3C064"); for (let k = 0; k < 3; k++) px(24, 42 + k*2, "#E3C064"); line(17, 38, 22, 47, "#F7F2E6"); line(31, 38, 26, 47, "#F7F2E6"); }
  else if (at === "casual"){ P(6, 39, 36, 9, o.shirt); P(19, 32, 10, 8, o.skin); P(17, 38, 14, 2, "#F7F2E6"); P(22, 40, 4, 3, o.shirt); px(24, 41, "#F7F2E6"); for (let x = 8; x < 40; x += 3) px(x, 44, shadeC(o.shirt, -0.15)); }
  else if (at === "trouser"){ P(6, 38, 36, 10, o.shirt); P(19, 32, 10, 7, o.skin); tri(18, 38, 30, 38, 24, 46, "#F7F2E6"); line(16, 38, 22, 47, shadeC(o.shirt, 0.25)); line(32, 38, 26, 47, shadeC(o.shirt, 0.25)); }
  else if (at === "dress"){ P(6, 38, 36, 10, o.shirt); P(19, 32, 10, 7, o.skin); oval(24, 39, 7, 4, o.skin); P(6, 38, 36, 1, shadeC(o.shirt, 0.2)); }
  else if (at === "blouse" || at === "skirt"){ P(6, 38, 36, 10, o.shirt); P(19, 32, 10, 7, o.skin); tri(17, 38, 31, 38, 24, 48, "#F7F2E6"); line(17, 38, 24, 47, shadeC(o.shirt, -0.3)); line(31, 38, 24, 47, shadeC(o.shirt, -0.3)); if (at === "skirt") disc(13, 43, 1.5, "#E3C064"); }
  else { P(6, 38, 36, 10, o.shirt); P(20, 38, 8, 10, o.collar || "#f4f1e8"); if (o.tie) P(22, 40, 4, 8, o.tie); P(19, 32, 10, 7, o.skin); }
  // head
  oval(24, 22, 13, 15, o.skin); P(12, 26, 24, 2, "rgba(0,0,0,.08)");
  P(10, 20, 2, 6, o.skin); P(36, 20, 2, 6, o.skin);
  // hair
  if (o.hairStyle === "windswept"){ for (let k = 0; k < 9; k++) P(8 + k*3, 6 + (k%2)*2 - Math.sin(t*30 + k)*2, 8, 4, o.hair); P(10, 9, 30, 5, o.hair); P(34, 10, 10, 3, o.hair); }
  else if (o.hairStyle === "cap"){ P(10, 8, 28, 7, o.hair); P(8, 13, 32, 3, "#14142a"); P(20, 9, 8, 3, "#ffd23f"); }
  else if (o.hairStyle === "bob"){ P(10, 6, 28, 8, o.hair); P(9, 10, 4, 16, o.hair); P(35, 10, 4, 16, o.hair); }
  else if (o.hairStyle === "hood"){ oval(24, 20, 17, 19, o.hair); oval(24, 24, 12, 13, o.skin); }
  else if (o.hairStyle === "pixie"){ P(11, 7, 26, 5, o.hair); tri(12, 10, 31, 8, 12, 17, o.hair); P(10, 10, 3, 6, o.hair); P(35, 10, 2, 4, o.hair); }
  else if (o.hairStyle === "long" || o.hairStyle === "braids"){ P(11, 6, 26, 7, o.hair); P(10, 9, 4, 14, o.hair); P(34, 9, 4, 14, o.hair); P(23, 6, 1, 4, hD); }
  else if (o.hairStyle === "ponytail"){ P(11, 7, 26, 6, o.hair); P(10, 10, 3, 6, o.hair); P(35, 10, 3, 5, o.hair); P(36, 13, 3, 2, "#E3C064"); }
  else if (o.hairStyle === "bun"){ P(11, 7, 26, 6, o.hair); P(10, 10, 3, 6, o.hair); P(35, 10, 3, 6, o.hair); P(20, 7, 8, 1, "#E3C064"); }
  else if (o.hairStyle === "curly"){ for (let k = 0; k < 8; k++) disc(12 + k*3.4, 8 + (k % 2)*2, 3, o.hair); disc(10, 16, 3, o.hair); disc(38, 16, 3, o.hair); }
  else if (o.hairStyle === "crew"){ P(12, 8, 24, 3, o.hair); P(11, 10, 2, 5, o.hair); P(35, 10, 2, 5, o.hair); for (let x = 12; x < 36; x += 2) px(x, 11, hD); }
  else if (o.hairStyle === "sidepart"){ P(11, 7, 26, 6, o.hair); P(10, 10, 3, 7, o.hair); P(35, 10, 2, 5, o.hair); P(18, 7, 1, 5, hD); tri(19, 8, 36, 8, 36, 13, hL); }
  else if (o.hairStyle === "quiff"){ P(11, 8, 26, 5, o.hair); oval(19, 6, 8, 3, o.hair); P(14, 4, 8, 1, hL); P(10, 10, 3, 6, o.hair); P(35, 10, 3, 6, o.hair); }
  else if (o.hairStyle === "manbun"){ P(11, 8, 26, 4, o.hair); P(10, 10, 3, 6, o.hair); P(35, 10, 3, 6, o.hair); P(22, 7, 4, 2, o.hair); }
  else if (o.hairStyle === "bald"){ P(15, 9, 5, 2, "rgba(255,255,255,.35)"); P(10, 16, 2, 5, shadeC(o.skin, -0.12)); P(36, 16, 2, 5, shadeC(o.skin, -0.12)); }
  else if (o.hairStyle === "scarf"){ const sc = o.scarf || "#3E2E6A"; P(12, 8, 24, 3, sc); P(11, 9, 3, 18, sc); P(34, 9, 3, 18, sc); P(16, 8, 10, 1, shadeC(sc, 0.25)); }
  else { P(11, 7, 26, 7, o.hair); P(10, 10, 4, 8, o.hair); }
  if (o.hair && !["cap","bald","scarf","crew"].includes(o.hairStyle)) P(15, 8, 6, 1, "rgba(255,255,255,.22)");
  // eyes
  const ey = 22, wide = o.eyes === "wide";
  if (blink){ P(15, ey + 1, 6, 1, "#1F2238"); P(27, ey + 1, 6, 1, "#1F2238"); }
  else { P(15, ey - (wide ? 1 : 0), 6, wide ? 5 : 4, "#ffffff"); P(27, ey - (wide ? 1 : 0), 6, wide ? 5 : 4, "#ffffff");
    const lx = o.look || 0; P(17 + lx, ey + (wide ? 0 : 1), wide ? 2 : 3, wide ? 2 : 3, "#1F2238"); P(29 + lx, ey + (wide ? 0 : 1), wide ? 2 : 3, wide ? 2 : 3, "#1F2238"); px(17 + lx, ey + 1, "#fff"); }
  if (o.lashes){ P(14, ey - 1, 1, 1, "#1F2238"); P(13, ey - 2, 1, 1, "#1F2238"); P(33, ey - 1, 1, 1, "#1F2238"); P(34, ey - 2, 1, 1, "#1F2238"); P(15, ey - 1, 6, 1, "#1F2238"); P(27, ey - 1, 6, 1, "#1F2238"); }
  if (o.brows === "worried"){ line(14, ey - 3, 20, ey - 5, "#1F2238"); line(28, ey - 5, 34, ey - 3, "#1F2238"); }
  else if (o.brows === "angry"){ line(14, ey - 5, 20, ey - 3, "#1F2238"); line(28, ey - 3, 34, ey - 5, "#1F2238"); }
  else { P(15, ey - 4, 6, 1, "#1F2238"); P(27, ey - 4, 6, 1, "#1F2238"); }
  if (o.glasses){ P(13, ey - 2, 10, 1, "#1F2238"); P(25, ey - 2, 10, 1, "#1F2238"); P(13, ey + 4, 10, 1, "#1F2238"); P(25, ey + 4, 10, 1, "#1F2238"); P(13, ey - 2, 1, 7, "#1F2238"); P(22, ey - 2, 1, 7, "#1F2238"); P(25, ey - 2, 1, 7, "#1F2238"); P(34, ey - 2, 1, 7, "#1F2238"); P(23, ey, 2, 1, "#1F2238"); }
  // mouth
  const talk = fr(t*7) < 0.5, lipC = o.lip || "#5a1a1a";
  if (o.mouth === "scream"){ oval(24, 32, 5, talk ? 4 : 3, lipC); P(21, 29, 6, 1, "#fff"); }
  else if (o.mouth === "grit"){ P(18, 31, 12, 3, "#fff"); for (let x = 19; x < 30; x += 2) P(x, 31, 1, 3, "#c8c8d0"); P(18, 31, 12, 1, "#1F2238"); P(18, 34, 12, 1, "#1F2238"); }
  else if (o.mouth === "smile"){ P(20, 31, 8, o.lip ? 2 : 1, lipC); px(19, 30, lipC); px(28, 30, lipC); }
  else { P(20, 31, 8, talk ? 3 : 1, lipC); }
  P(22, 25, 3, 4, "rgba(0,0,0,.12)");
  if (o.beard){ P(14, 28, 20, 9, o.beard); P(18, 30, 12, 3, o.skin); P(20, 31, 8, talk ? 2 : 1, "#5a1a1a"); }
  if (o.sweat){ const sy = fr(t*1.2)*10; P(37, 14 + sy, 2, 3, "#9fd8ff"); px(37, 14 + sy, "#ffffff"); P(9, 18 + fr(t*1.2 + .5)*8, 2, 3, "#9fd8ff"); }
  if (o.freckles) for (const [fx, fy] of [[15,27],[17,28],[16,29],[31,27],[33,28],[32,29],[23,26]]) px(fx, fy, "rgba(150,80,40,.55)");
  if (o.facial === "stubble"){ for (let y = 29; y < 37; y += 2) for (let x = 14 + (y % 4 === 1 ? 1 : 0); x < 34; x += 2) if (Math.abs(x - 24) > 3 || y > 33) px(x, y, "rgba(40,30,30,.28)"); }
  else if (o.facial === "moustache"){ P(19, 29, 10, 2, o.hair); px(18, 30, o.hair); px(29, 30, o.hair); }
  else if (o.facial === "beard"){ P(14, 28, 20, 9, o.hair); P(18, 30, 12, 3, o.skin); P(19, 29, 10, 1, o.hair); P(20, 31, 8, 1, o.lip || "#5a1a1a"); P(15, 36, 18, 1, hD); }
  if (o.earrings){ disc(10, 28, 1.5, "#E3C064"); disc(37, 28, 1.5, "#E3C064"); px(10, 27, "#FFF6D0"); px(37, 27, "#FFF6D0"); }
  if (o.headset){ P(8, 14, 3, 12, "#2a2a3a"); P(37, 14, 3, 12, "#2a2a3a"); P(10, 5, 28, 3, "#2a2a3a"); P(36, 26, 2, 6, "#2a2a3a"); P(30, 31, 7, 2, "#2a2a3a"); }
  // rim light
  for (let y = 10; y < 34; y++) px(24 + Math.floor(13*Math.sqrt(Math.max(0, 1 - ((y - 22)*(y - 22))/225))) - 1, y, "rgba(255,255,255,.25)");
  if (o.extra) o.extra(t);
}
function rain(t, count, col, dx, dy, len){
  for (let i = 0; i < count; i++){ const x = fr(hs(i, 1) + t*dx)*(SW + 60) - 30, y = fr(hs(i, 2) + t*dy)*SH;
    for (let k = 0; k < len; k++) px(x - k*(dx/dy)*0.6, y - k, col); }
}
/* ---------- new-style characters: same proportions as the in-game people, scaled for the cutscene frame ---------- */
const shadeC = (hex, amt) => { const n = parseInt(hex.slice(1), 16), f = v => Math.round(Math.max(0, Math.min(255, amt < 0 ? v*(1 + amt) : v + (255 - v)*amt))); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };
function chibi(lk, pose, key){
  return makeSprite(`chibi_${key}_${pose}`, 11, 22, () => {
    const L = 2, y = 21, sh = shadeC(lk.shirt, -0.22), skD = shadeC(lk.skin, -0.14), hairH = shadeC(lk.hair, 0.3), pants = lk.pants || "#2B3352", shoe = "#1E2238";
    if (pose === "walk"){ P(L+2,y-3,3,2,pants); P(L+1,y-1,2,1,shoe); P(L+4,y-1,2,1,shoe); }
    else { P(L+1,y-3,2,2,pants); P(L+4,y-3,2,2,pants); P(L+1,y-1,2,1,shoe); P(L+4,y-1,2,1,shoe); }
    P(L+1,y-8,5,1,lk.shirt); P(L,y-7,7,4,lk.shirt); P(L,y-4,7,1,sh); px(L+2,y-8,"#F7F2E6"); px(L+4,y-8,"#F7F2E6");
    if (lk.tie) P(L+3,y-8,1,4,lk.tie);
    if (pose === "panic" || pose === "cheer"){ P(L-1,y-13,1,6,sh); P(L+7,y-13,1,6,sh); px(L-1,y-14,lk.skin); px(L+7,y-14,lk.skin); }
    else if (pose === "carry"){ P(L-1,y-7,1,3,sh); P(L+7,y-7,1,3,sh); P(L-1,y-7,9,4,"#C9A877"); P(L-1,y-7,9,1,"#E2C79A"); P(L+1,y-9,2,2,"#4E9A3A"); }
    else { P(L-1,y-7,1,3,sh); P(L+7,y-7,1,3,sh); px(L-1,y-4,lk.skin); px(L+7,y-4,lk.skin); }
    P(L+1,y-15,5,7,lk.skin); P(L,y-14,7,5,lk.skin); P(L+1,y-9,5,1,skD);
    if (lk.long){ P(L+1,y-17,5,1,lk.hair); P(L,y-16,7,3,lk.hair); P(L-1,y-15,1,6,lk.hair); P(L+7,y-15,1,6,lk.hair); }
    else { P(L+1,y-17,5,1,lk.hair); P(L,y-16,7,2,lk.hair); P(L,y-14,1,3,lk.hair); }
    P(L+2,y-16,2,1,hairH);
    P(L+3,y-13,1,2,"#1F2238"); P(L+5,y-13,1,2,"#1F2238");
    px(L+2,y-10,"rgba(235,110,110,.65)"); px(L+6,y-10,"rgba(235,110,110,.65)");
    if (pose === "panic") P(L+4,y-10,2,1,"#7A2A2A"); else if (pose === "cheer"){ px(L+3,y-10,"#7A2A2A"); P(L+4,y-9.5,1,0.6,"#7A2A2A"); px(L+5,y-10,"#7A2A2A"); }
    if (lk.glasses){ P(L+2,y-13,3,1,"rgba(31,34,56,.7)"); P(L+4,y-13,3,1,"rgba(31,34,56,.7)"); }
    if (lk.helmet){ P(L,y-18,7,3,lk.helmet); P(L-1,y-16,9,1,shadeC(lk.helmet, -0.2)); }
    if (lk.cap){ P(L,y-17,7,2,lk.cap); P(L+5,y-16,4,1,lk.cap); }
  });
}
const PEOPLE = [
  {skin:"#F2C9A0", hair:"#2B1B10", shirt:"#2F6FE4", tie:"#E3C064"},
  {skin:"#8D5524", hair:"#1C1C1C", shirt:"#F4F1EA", tie:"#B23A3A", long:true},
  {skin:"#C68650", hair:"#B5562E", shirt:"#3E9B4F"},
  {skin:"#FFDBAC", hair:"#C9A227", shirt:"#7A4FBF", long:true},
  {skin:"#E0A878", hair:"#5A3825", shirt:"#E39A2C", glasses:true},
  {skin:"#5C3A21", hair:"#1C1C1C", shirt:"#2B3352", tie:"#E3C064"},
];
function palm(x, base, lean, t, k){
  for (let i = 0; i < 26; i++){ const a = lean*(i/26)*(i/26); P(x + Math.sin(a)*i, base - Math.cos(a)*i, 2, 1, i % 4 === 0 ? "#8E6A3E" : "#A8824E"); }
  const tx = x + Math.sin(lean)*26, ty = base - Math.cos(lean)*26;
  for (let f = 0; f < 5; f++){ const ang = lean*1.6 + (f - 2)*0.35 + Math.sin(t*14 + f + k)*0.12; for (let i = 0; i < 12; i++){ const fx = tx + Math.sin(ang + 1.2)*i*1.1, fy = ty - Math.cos(ang + 1.2)*i*0.6 + i*i*0.03; P(fx, fy, 2, 1.4, i < 6 ? "#3E8A3A" : "#5DB04A"); } }
  disc(tx, ty, 2, "#6E5030");
}
function cloudPuff(x, y, w, col, shadow){ oval(x, y, w, w*0.45, col); oval(x - w*0.5, y + 2, w*0.6, w*0.3, col); oval(x + w*0.55, y + 2, w*0.55, w*0.28, col); P(x - w, y + w*0.3, w*2, 1, shadow); }
function cityBlock(x, base, w, h, col, lit, night, seed){
  P(x, base - h, w, h, col); P(x, base - h, w, 1, shadeC(col, 0.18));
  for (let yy = base - h + 3; yy < base - 2; yy += 4) for (let xx = x + 2; xx < x + w - 1; xx += 3) if (hs(xx + seed, yy) < lit) P(xx, yy, 1.5, 2, night ? "#FFE18A" : "#CFE6F2");
}
function banner(x, y, w, txt, bg, fg){ P(x, y, w, 9, "#1F2238"); P(x + 1, y + 1, w - 2, 7, bg); text(txt, x + w/2 - textW(txt)/2, y + 2, fg); }

const SCENES2 = {
hurricane(t){
  const flash = fr(t*2.3) < 0.06;
  bands(0, 92, flash ? ["#8EA6C4","#A8BCD6","#C2D2E6"] : ["#2A3B52","#34495F","#3F566C","#4C6478","#5A7286"]);
  for (let k = 0; k < 8; k++){ const cx = fr(hs(k, 3) - t*0.35)*(SW + 80) - 40; cloudPuff(cx, 10 + hs(k, 4)*26, 14 + hs(k, 5)*10, flash ? "#9AAEC8" : "#3A4C62", flash ? "#C8D6E8" : "#566C84"); }
  if (flash) for (let y = 0, x = 150; y < 60; y += 3){ const nx = x + (hs(y, 9) - .5)*7; line(x, y, nx, y + 3, "#FFF6C8"); x = nx; }
  // sea and waves
  bands(66, 100, ["#4E7C98","#3E6C88","#335E7A","#2A506A"], 0, 150);
  for (let row = 0; row < 4; row++){ const wy = 70 + row*8, sp = 0.5 + row*0.15;
    for (let x = 0; x < 150; x++){ const ph = (x*0.18 - t*12*sp + row*1.7), crest = Math.sin(ph); const yy = wy + Math.round(crest*2.2);
      px(x, yy, crest > 0.55 ? "#F2F8FC" : "#7FA8C2"); if (crest > 0.8) px(x, yy - 1, "#FFFFFF"); if (crest > 0.7 && hs(x, row + Math.floor(t*10)) > 0.6) px(x + 1, yy - 2, "#E8F2F8"); } }
  P(0, 98, 150, 2, "#E8F2F8");
  // condo tower losing its sign
  P(150, 34, 66, 66, "#F2EDE2"); P(150, 34, 66, 2, "#FFFFFF");
  for (let r = 0; r < 7; r++) for (let c2 = 0; c2 < 6; c2++){ const wx = 154 + c2*10, wy = 40 + r*8; P(wx, wy, 7, 5, "#6A8EA8"); P(wx, wy + 5, 7, 1, "#C9C3B0"); }
  const sign = "OCEAN VIEW";
  sign.split("").forEach((ch, i) => { const loose = i >= 6 || (i >= 3 && t > 0.4), ft = loose ? Math.max(0, t - (i >= 6 ? 0.1 : 0.4)) : 0;
    text(ch, 156 + i*6 - ft*160, 26 - ft*30 + Math.sin(ft*20 + i)*4, "#C9A54A", 1, "#1F2238"); });
  // promenade, palms, flying pool flamingo
  P(0, 100, SW, 35, "#C4C2BC"); P(0, 100, SW, 2, "#E2E0DA"); for (let x = 0; x < SW; x += 8) P(x, 108, 1, 27, "#A8A6A0");
  palm(40, 102, 0.42 + Math.sin(t*16)*0.08, t, 1); palm(120, 102, 0.5 + Math.sin(t*15 + 1)*0.08, t, 2); palm(226, 102, 0.38 + Math.sin(t*17 + 2)*0.08, t, 3);
  const flam = makeSprite("flamingo", 16, 14, () => { oval(8, 10, 7, 3, "#F28AB0"); P(11, 2, 2, 8, "#F28AB0"); P(10, 1, 4, 2, "#F28AB0"); P(13, 2, 2, 1, "#1F2238"); oval(8, 10, 4, 1.5, "#F7B6CE"); });
  blit(flam, SW + 20 - fr(t*0.9)*300, 50 + Math.sin(t*10)*10, t*7);
  const lounger = makeSprite("lounger", 18, 6, () => { P(0, 2, 18, 2, "#F4F1EA"); P(12, 0, 6, 2, "#F4F1EA"); for (let k = 0; k < 6; k++) P(k*3, 2, 1, 2, "#2F6FE4"); P(2, 4, 1, 2, "#8A8A90"); P(14, 4, 1, 2, "#8A8A90"); });
  blit(lounger, SW + 40 - fr(t*0.7 + 0.4)*320, 88 - Math.abs(Math.sin(t*8))*8, t*5);
  // a fund manager clinging to a lamp post like a flag
  P(84, 70, 2, 32, "#1F2A44"); P(81, 68, 8, 2, "#1F2A44");
  blit(chibi({skin:"#F2C9A0", hair:"#C9A227", shirt:"#1F2A44", tie:"#E3C064"}, "panic", "chad"), 96, 76, Math.PI/2 + Math.sin(t*28)*0.1);
  rain(t, 150, flash ? "#FFFFFF" : "#B8CCE0", 1.8, 2.4, 4);
  if (flash){ c.fillStyle = "rgba(255,255,255,.18)"; c.fillRect(0, 0, SW, SH); }
},
canal(t){
  bands(0, 60, ["#6EB8E8","#8CC8EE","#AEDAF2","#CDE8F4"]);
  disc(200, 18, 8, "#FFF2C0"); disc(200, 18, 6, "#FFFBE6");
  bands(56, 135, ["#E8C98E","#E2BF80","#D9B472","#CFA866"]);
  for (let k = 0; k < 6; k++) oval(20 + k*44, 60 + (k % 2)*3, 30, 5, "#EED3A0");
  P(0, 84, SW, 24, "#3E7FA8"); P(0, 84, SW, 2, "#7FB8D8"); for (let k = 0; k < 18; k++) P(hs(k, 2)*SW, 88 + hs(k, 3)*16, 6, 1, "rgba(220,240,250,.5)");
  P(0, 82, SW, 2, "#C8A060"); P(0, 108, SW, 2, "#C8A060");
  // the queue grows on the horizon
  const queue = Math.floor(3 + t*10);
  for (let k = 0; k < queue; k++){ const qx = 8 + k*7; P(qx, 80, 6, 3, "#4A5670"); P(qx + 1, 77, 3, 3, "#E8452C"); }
  // the ship, wedged diagonally bank to bank
  c.save(); c.translate(140, 95); c.rotate(-0.42);
  P(-78, -6, 150, 14, "#B23A3A"); P(-78, 4, 150, 4, "#1F2A44"); P(-78, -6, 150, 1, "#D25A5A"); tri(72, -6, 86, 1, 72, 8, "#B23A3A");
  const cols = ["#2F6FE4","#E39A2C","#3E9B4F","#7A4FBF","#E8452C","#2BB3B1"];
  for (let r = 0; r < 2; r++) for (let k = 0; k < 13; k++){ P(-64 + k*10, -13 - r*7, 9, 6, cols[(r*5 + k) % 6]); P(-64 + k*10, -13 - r*7, 9, 1, "rgba(255,255,255,.3)"); }
  P(-76, -22, 10, 16, "#F2EDE2"); P(-75, -19, 8, 2, "#6A8EA8"); text("EVER STUCK", -40, 0, "#F7F2E6");
  c.restore();
  // one heroic little digger
  const arm = Math.sin(t*9)*0.4;
  P(206, 100, 18, 7, "#E3C064"); P(206, 100, 18, 1, "#F2DC8E"); P(214, 93, 8, 7, "#E3C064"); P(215, 94, 6, 4, "#AEDAF2"); P(205, 106, 20, 3, "#2B3352");
  c.save(); c.translate(208, 98); c.rotate(-0.9 + arm); P(-14, -1, 14, 2, "#C9A54A"); P(-16, -2, 4, 4, "#8E7228"); c.restore();
  for (let k = 0; k < 6; k++){ const tt = fr(t*2 + k/6); P(196 - tt*10, 96 - Math.sin(tt*3.14)*10, 2, 2, "#D9B472"); }
  // onlookers: two camels and a selfie
  const camel = makeSprite("camel", 16, 12, () => { oval(7, 6, 6, 3, "#C89A5A"); oval(6, 3, 3, 2, "#C89A5A"); P(12, 1, 2, 5, "#C89A5A"); P(12, 0, 4, 2, "#C89A5A"); P(3, 8, 1, 4, "#A87A3E"); P(10, 8, 1, 4, "#A87A3E"); px(15, 1, "#1F2238"); });
  blit(camel, 30, 120); blit(camel, 50, 122, 0, true);
  blit(chibi(PEOPLE[3], "stand", "selfie"), 72, 120); P(77, 108, 3, 4, "#1F2238"); if (fr(t*2) < 0.2) disc(78, 109, 3, "rgba(255,255,255,.7)");
},
outage(t){
  P(0, 0, SW, SH, "#EDE8DC"); P(0, 0, SW, 50, "#DCE6EC");
  for (let k = 0; k < 4; k++){ P(6 + k*60, 6, 54, 36, "#9CC9E6"); P(6 + k*60, 6, 54, 1, "#FFFFFF"); P(6 + k*60 + 26, 6, 2, 36, "#F2EDE2"); }
  const plane = makeSprite("plane2", 30, 10, () => { P(2,3,26,4,"#FFFFFF"); P(26,4,4,2,"#FFFFFF"); P(0,0,4,5,"#2F6FE4"); P(10,6,8,2,"#D8D4CA"); for (let k = 0; k < 6; k++) px(7 + k*3, 4, "#6A8EA8"); });
  blit(plane, 40, 36); blit(plane, 160, 34, 0, true);
  P(0, 50, SW, 3, "#C9A54A");
  // departure board: every screen the same sad face
  P(70, 56, 100, 34, "#1F2238"); P(72, 58, 96, 30, "#1F5FBF");
  text(":(", 80, 62, "#FFFFFF", 2); text("YOUR PC RAN INTO", 98, 62, "#DCE9FF"); text("A PROBLEM", 98, 69, "#DCE9FF"); text(Math.min(100, Math.floor(t*240)) + "% COMPLETE", 98, 78, "#FFFFFF");
  for (let k = 0; k < 4; k++){ const kx = 12 + k*58 + (k > 1 ? 112 - 58 : 0); if (k === 1 || k === 2) continue; }
  for (const kx of [14, 40, 186, 212]){ P(kx, 70, 16, 22, "#C9C3B0"); P(kx + 2, 72, 12, 9, "#1F5FBF"); text(":(", kx + 4, 74, "#FFFFFF"); P(kx + 5, 92, 6, 4, "#8A8A90"); }
  P(0, 100, SW, 35, "#C9C3B0"); for (let x = 0; x < SW; x += 12) P(x, 100, 6, 35, "#D3CDBF");
  // stranded travellers
  const suit = col => makeSprite("case_" + col, 10, 8, () => { P(0, 1, 10, 7, col); P(3, 0, 4, 1, "#1F2238"); P(0, 4, 10, 1, shadeC(col, -0.2)); });
  [[20, "#B23A3A"], [64, "#2F6FE4"], [150, "#3E9B4F"], [204, "#E39A2C"]].forEach(([x, col], k) => { blit(suit(col), x, 122); blit(chibi(PEOPLE[k], k % 2 ? "stand" : "panic", "trav" + k), x + 2, 112 + (k % 2 ? 0 : Math.round(Math.sin(t*20 + k)))); });
  const sleeper = makeSprite("sleeper", 20, 8, () => { P(0, 3, 16, 5, "#7A4FBF"); P(14, 1, 6, 6, "#F2C9A0"); P(14, 0, 6, 2, "#1C1C1C"); });
  blit(sleeper, 112, 126); text("Z", 120, 112 - fr(t)*8, "#2B3352"); text("Z", 126, 106 - fr(t + .5)*8, "#2B3352");
  // IT to the rescue, with a trolley of laptops
  const ix = 230 - t*130;
  P(ix - 2, 112, 22, 2, "#8A8A90"); for (let k = 0; k < 4; k++){ P(ix + k*5, 104 - (k % 2)*2, 5, 8, "#2B3352"); P(ix + k*5 + 1, 105 - (k % 2)*2, 3, 3, "#1F5FBF"); }
  blit(chibi({skin:"#C68650", hair:"#1C1C1C", shirt:"#4BB7A8", glasses:true}, "walk", "dev"), ix + 26, 112, 0, true);
},
ash(t){
  bands(0, 80, ["#5A6E8A","#7A8AA0","#9AA6B6","#C2B8B0","#E2C6A6"]);
  // the volcano and its growing plume
  tri(0, 82, 110, 82, 52, 34, "#4A5A4A"); tri(52, 34, 110, 82, 76, 82, "#3A4A3A"); P(46, 33, 12, 3, "#E8705F");
  for (let k = 0; k < 22; k++){ const tt = fr(t*0.45 + hs(k, 4)*0.9), r = 5 + tt*20; oval(52 + tt*(80 + hs(k, 6)*90), 28 - tt*14 + Math.sin(k)*5, r, r*0.6, k % 2 ? "#5E5E68" : "#74747E"); oval(50 + tt*(80 + hs(k, 6)*90), 25 - tt*14, r*0.55, r*0.3, "#8C8C96"); }
  for (let k = 0; k < 14; k++){ const tt = fr(t*1.4 + hs(k, 1)), a = -Math.PI/2 + (hs(k, 2) - .5)*1.4; P(52 + Math.cos(a)*tt*26, 32 + Math.sin(a)*tt*26 + tt*tt*24, 2, 2, tt < .5 ? "#F2C14E" : "#E8705F"); }
  bands(80, 135, ["#6E8A5A","#5E7A4C","#4E6A40"], 0, 120);
  // the airport side
  P(120, 76, 120, 59, "#F2EDE2"); P(120, 76, 120, 2, "#C9A54A"); for (let k = 0; k < 8; k++) P(124 + k*14, 82, 10, 12, "#9CC9E6");
  P(126, 98, 78, 34, "#1F2238"); text("DEPARTURES", 130, 100, "#E3C064");
  ["PARIS","ROME","OSLO","NICE"].forEach((d, k) => { text(d, 130, 108 + k*6, "#E3C064"); text("CANCELLED", 156, 108 + k*6, fr(t*3 + k*0.25) < 0.7 ? "#E8705F" : "#7A2A2A"); });
  // a newsreader losing a fight with the name
  P(206, 112, 30, 10, "#2B3352"); P(206, 112, 30, 1, "#C9A54A");
  blit(chibi({skin:"#8D5524", hair:"#2B1B10", shirt:"#B23A3A", long:true}, "stand", "news"), 221, 110);
  const tries = ["EYJA", "EYJAFJ", "EYJAFJALLA", "THE VOLCANO"], tr = tries[Math.min(3, Math.floor(t*4.2))];
  P(196 - textW(tr)/2, 88, textW(tr) + 6, 9, "#FFFFFF"); P(196 - textW(tr)/2, 88, textW(tr) + 6, 1, "#1F2238"); text(tr, 199 - textW(tr)/2, 90, "#1F2238"); P(214, 97, 2, 3, "#FFFFFF");
  for (let k = 0; k < 70; k++) px(fr(hs(k, 7) + t*0.05)*SW, fr(hs(k, 8) + t*0.35)*SH, "rgba(120,120,130,.8)");
},
cancel(t){
  bands(0, 50, ["#7CC0EA","#9CD0EE","#BCE0F2"]);
  for (let k = 0; k < 3; k++) cloudPuff(fr(hs(k, 2) + t*0.04)*SW, 10 + k*7, 10, "#FFFFFF", "#D8E8F4");
  // empty stands
  P(0, 40, SW, 22, "#2E5A3E"); for (let r = 0; r < 4; r++) for (let x = 2 + (r % 2)*3; x < SW; x += 6) P(x, 42 + r*5, 4, 3, "#3E7A50");
  P(0, 60, SW, 3, "#E3C064");
  P(96, 26, 48, 16, "#1F2238"); P(98, 28, 44, 12, "#2E5A3E"); text("CANCELLED", 120 - textW("CANCELLED")/2, 32, fr(t*2) < .7 ? "#F2DC8E" : "#7A6A2A");
  // the court, freshly striped by a groundskeeper with nothing else to do
  for (let k = 0; k < 10; k++) P(0, 63 + k*7.2, SW, 7.2, k % 2 ? "#5DB04A" : "#6CC05A");
  const mow = t*260 - 20;
  for (let k = 0; k < 10; k++) if (k % 2 === 0) P(0, 63 + k*7.2, Math.max(0, Math.min(SW, mow)), 7.2, "#7CD06A");
  // a proper grass tennis court: doubles and singles lines, service boxes, centre marks, net and posts
  const W0 = 28, W1 = 212, T0 = 70, T1 = 128;
  P(W0, T0, W1 - W0, 1, "#FFFFFF"); P(W0, T1, W1 - W0, 1, "#FFFFFF"); P(W0, T0, 1, T1 - T0 + 1, "#FFFFFF"); P(W1, T0, 1, T1 - T0 + 1, "#FFFFFF");
  P(W0, T0 + 7, W1 - W0, 1, "#FFFFFF"); P(W0, T1 - 7, W1 - W0, 1, "#FFFFFF");
  P(70, T0 + 7, 1, T1 - T0 - 14, "#FFFFFF"); P(170, T0 + 7, 1, T1 - T0 - 14, "#FFFFFF"); P(70, 99, 100, 1, "#FFFFFF");
  P(W0, 99, 4, 1, "#FFFFFF"); P(W1 - 3, 99, 4, 1, "#FFFFFF");
  P(119, T0 - 4, 2, T1 - T0 + 8, "#F7F2E6"); for (let y = T0 - 4; y < T1 + 4; y += 2) P(119, y, 2, 1, "#1F2238");
  P(118, T0 - 7, 4, 4, "#1F2A44"); P(118, T1 + 3, 4, 4, "#1F2A44"); P(118, T0 - 7, 4, 1, "#C9A54A"); P(118, T1 + 3, 4, 1, "#C9A54A");
  blit(chibi({skin:"#E0A878", hair:"#9A9AA8", shirt:"#3E9B4F", cap:"#2B3352"}, "walk", "mower"), Math.min(SW - 8, mow + 12), 96);
  P(Math.min(SW - 14, mow), 92, 10, 6, "#B23A3A"); P(Math.min(SW - 14, mow) + 2, 98, 2, 2, "#1F2238"); P(Math.min(SW - 14, mow) + 7, 98, 2, 2, "#1F2238");
  // strawberries and cream, unattended
  P(36, 112, 14, 6, "#FFFFFF"); P(36, 112, 14, 1, "#D8D4CA"); for (let k = 0; k < 4; k++) disc(39 + k*3, 111, 1.5, "#E8452C");
  // the one club treasurer who bought pandemic cover, jumping for joy
  const jump = Math.abs(Math.sin(t*12))*8;
  blit(chibi({skin:"#FFDBAC", hair:"#C9A227", shirt:"#3E2E6A", tie:"#3E9B4F"}, "cheer", "hugo"), 176, 118 - jump);
  P(184, 100 - jump, 14, 10, "#F7F2E6"); P(184, 100 - jump, 14, 1, "#C9A54A"); text("COVER", 185, 103 - jump, "#1F2238");
},
bank(t){
  bands(0, 70, ["#5E86B4","#7C9EC6","#9CB8D6","#C2D4E6"]);
  for (let k = 0; k < 8; k++) cityBlock(k*32 - 6, 92, 28, 40 + hs(k, 2)*36, k % 2 ? "#7A8EAA" : "#8A9CB6", 0.5, false, k);
  // the tower, losing its name
  P(78, 14, 84, 80, "#3B4C6E"); for (let r = 0; r < 9; r++) for (let k = 0; k < 7; k++) P(82 + k*11, 26 + r*7, 8, 4, hs(k, r) > .2 ? "#9CC9E6" : "#5A6E8A");
  const lower = Math.min(1, t*1.4);
  line(120, 0, 120, 6 + lower*20, "#1F2238");
  P(92, 6 + lower*20, 56, 10, "#E3C064"); P(93, 7 + lower*20, 54, 8, "#1F2238"); text("MEGABANK", 120 - textW("MEGABANK")/2, 9 + lower*20, "#E3C064");
  P(116, 2 + lower*20, 8, 4, "#C9A54A");
  // the plaza: staff leaving with their boxes
  P(0, 94, SW, 41, "#C4C2BC"); P(0, 94, SW, 2, "#E2E0DA"); for (let x = 0; x < SW; x += 10) P(x, 96, 1, 39, "#AAA8A2");
  P(104, 80, 32, 14, "#1F2238"); P(106, 82, 13, 12, "#9CC9E6"); P(121, 82, 13, 12, "#9CC9E6");
  for (let k = 0; k < 6; k++){ const sx = 120 + (k % 2 ? 1 : -1)*(10 + fr(t*0.35 + k/6)*110); blit(chibi(PEOPLE[k], "carry", "box" + k), sx, 118 + (k % 3)*4, 0, k % 2 === 0); }
  // papers and a crashing ticker
  for (let k = 0; k < 12; k++){ const tt = fr(t*0.6 + hs(k, 1)); blit(paper(), hs(k, 2)*SW + Math.sin(tt*8 + k)*10, -6 + tt*120, tt*7); }
  P(0, 0, SW, 7, "#1F2238"); const tick = "MEGABANK -94%   LUNCH CANCELLED   BONUSES -100%   ";
  text(tick, 4 - fr(t*0.8)*200, 1, "#E8705F"); text(tick, 204 - fr(t*0.8)*200, 1, "#E8705F");
  // the D&O claims handler, delighted
  blit(chibi({skin:"#F2C9A0", hair:"#5A3825", shirt:"#F4F1EA", tie:"#1F2A44", glasses:true}, "cheer", "gerald"), 222, 112);
},
rocket(t){
  const boom = t > 0.5, bt = boom ? ease((t - 0.5)/0.5) : 0;
  bands(0, 84, ["#1F2A44","#2E3B5E","#4A5280","#8A6A9A","#D88A82","#F2B48A","#F8D8A6"]);
  disc(40, 80, 9, "#FFE6B0"); disc(40, 80, 7, "#FFF4D6");
  for (let k = 0; k < 26; k++) if (hs(k, 1) < 0.6) px(hs(k, 2)*SW, hs(k, 3)*36, "#E9E2CF");
  bands(84, 100, ["#4A5A88","#3E4E7A","#34446E"]);
  P(0, 100, SW, 35, "#8A9A6A"); P(0, 100, SW, 2, "#A8B880"); P(120, 96, 100, 6, "#C4C2BC"); P(120, 96, 100, 1, "#E2E0DA");
  P(178, 30, 3, 66, "#C9A54A"); P(190, 30, 3, 66, "#C9A54A"); for (let y = 32; y < 96; y += 6){ line(178, y, 193, y + 6, "#8E7228"); P(178, y, 15, 1, "#E8D08A"); }
  const lift = t < 0.2 ? 0 : ease((t - 0.2)/0.3), wob = t > 0.36 ? Math.sin(t*60)*(t - 0.36)*1.6 : 0;
  const rx = 160 + wob*12 + (t > 0.4 ? (t - 0.4)*30 : 0), ry = 94 - lift*56;
  if (!boom){
    if (t >= 0.2){ const fl = 10 + Math.floor(Math.sin(t*90)*3 + 3); tri(rx - 4, ry, rx + 4, ry, rx, ry + fl + 6, "#E8705F"); tri(rx - 2, ry, rx + 2, ry, rx, ry + fl, "#F2C14E"); }
    c.save(); c.translate(Math.round(rx), Math.round(ry)); c.rotate(wob*0.25);
    P(-4, -40, 8, 40, "#F7F2E6"); P(2, -40, 2, 40, "#D8D4CA"); tri(-4, -40, 4, -40, 0, -50, "#1F2A44"); P(-4, -30, 8, 2, "#C9A54A"); P(-4, -12, 8, 2, "#C9A54A");
    tri(-4, -8, -4, 0, -9, 2, "#1F2A44"); tri(4, -8, 4, 0, 9, 2, "#1F2A44"); c.restore();
  }
  for (let k = 0; k < 20; k++){ const tt = fr(t*0.9 + hs(k, 7)), side = k % 2 ? 1 : -1; if (t < 0.18 && tt > .4) continue; oval(160 + side*tt*(30 + hs(k, 8)*40), 94 - tt*10, 4 + tt*10, 3 + tt*5, `rgba(${235 - tt*40},${232 - tt*40},${226 - tt*40},${0.9 - tt*0.6})`); }
  if (boom){
    const ex = 164, ey = 22, r = 6 + bt*30;
    disc(ex, ey, Math.round(r + 6), `rgba(242,180,120,${0.5*(1 - bt)})`); disc(ex, ey, Math.round(r), bt < 0.5 ? "#F2B64A" : "#8A8A96"); disc(ex, ey, Math.round(r*0.65), bt < 0.4 ? "#FFE9A8" : "#9A9AA6");
    for (let k = 0; k < 22; k++){ const a = hs(k, 1)*Math.PI*2, v = 30 + hs(k, 2)*50; P(ex + Math.cos(a)*v*bt, ey + Math.sin(a)*v*bt + bt*bt*70, 2 + hs(k, 3)*3, 2, k % 3 ? "#E9E2CF" : "#1F2A44"); }
    const sy = ey + 6 + bt*70, sx = ex - 20 - bt*20 + Math.sin(t*6)*4;
    tri(sx - 10, sy - 18, sx + 10, sy - 18, sx, sy - 26, "#B23A3A"); P(sx - 10, sy - 18, 20, 2, "#FFFFFF"); line(sx - 9, sy - 17, sx - 2, sy - 3, "#D8D4CA"); line(sx + 9, sy - 17, sx + 2, sy - 3, "#D8D4CA");
    P(sx - 3, sy - 4, 6, 6, "#C9A54A"); P(sx - 11, sy - 2, 7, 3, "#2F6FE4"); P(sx + 4, sy - 2, 7, 3, "#2F6FE4"); text("INSURED", sx - 13, sy + 4, "#E3C064", 1, "#1F2238");
  }
  for (let k = 0; k < 6; k++) blit(chibi(PEOPLE[k], boom ? "panic" : "stand", "crowd" + k), 14 + k*12, 120 + (k % 2)*3);
  P(16, 99, 46, 9, "#1F2238"); P(17, 100, 44, 7, "#F7F2E6"); const sgn = boom ? "OOPS" : (t < 0.2 ? "T-" + Math.max(1, 3 - Math.floor(t/0.2*3)) : "GO!");
  text(sgn, 39 - textW(sgn)/2, 101, boom ? "#B23A3A" : "#1F2A44");
  if (boom && bt < 0.12){ c.fillStyle = `rgba(255,240,210,${0.5*(1 - bt/0.12)})`; c.fillRect(0, 0, SW, SH); }
},
solar(t){
  bands(0, 100, ["#0E1430","#141C40","#1A2450","#22305E"]);
  for (let k = 0; k < 50; k++) px(hs(k, 1)*SW, hs(k, 2)*70, hs(k, 3) > .7 ? "#FFFFFF" : "#9AA6D0");
  // aurora ribbons over London
  for (let band = 0; band < 3; band++){ const col = ["rgba(90,230,160,","rgba(140,120,240,","rgba(240,120,180,"][band];
    for (let x = 0; x < SW; x += 2){ const y = 18 + band*10 + Math.sin(x*0.05 + t*6 + band)*8, h = 10 + Math.sin(x*0.08 + t*4)*5; for (let k = 0; k < h; k += 2) px(x, y + k, col + (0.55 - k/h*0.5) + ")"); } }
  // satellites having a terrible night
  for (let k = 0; k < 3; k++){ const sx = 30 + k*80 + Math.sin(t*3 + k)*6, sy = 12 + k*6, spin = t*(4 + k*2);
    c.save(); c.translate(sx, sy); c.rotate(spin); P(-2, -2, 4, 4, "#C9A54A"); P(-9, -1, 6, 2, "#2F6FE4"); P(3, -1, 6, 2, "#2F6FE4"); c.restore();
    if (fr(t*5 + k*0.3) < 0.3) for (let s = 0; s < 6; s++) px(sx + (hs(s, k + Math.floor(t*20)) - .5)*10, sy + (hs(s + 9, k) - .5)*10, "#FFE9A8"); }
  // skyline with a clock tower; lights flicker as the grid wobbles
  const flicker = fr(t*7) < 0.25;
  for (let k = 0; k < 9; k++) cityBlock(k*28 - 4, 104, 24, 22 + hs(k, 4)*26, "#1A2236", flicker ? 0.15 : 0.55, true, k + 20);
  P(200, 44, 12, 60, "#1A2236"); tri(198, 44, 214, 44, 206, 30, "#1A2236"); disc(206, 54, 4, flicker ? "#5A5A40" : "#F2DC8E"); px(206, 52, "#1A2236"); px(207, 54, "#1A2236");
  // power lines sparking
  P(30, 70, 2, 34, "#2B3352"); P(150, 66, 2, 38, "#2B3352"); for (let x = 31; x < 150; x++) px(x, 70 + Math.sin((x - 31)/119*Math.PI)*6 - (x - 31)/119*4, "#4A5670");
  if (fr(t*4) < 0.35) for (let s = 0; s < 10; s++){ const sx = 90 + (hs(s, Math.floor(t*16)) - .5)*16; px(sx, 74 + hs(s, 3)*8, "#FFF2A8"); }
  // the street: a cab whose sat-nav has given up
  P(0, 104, SW, 31, "#2E2C34"); P(0, 104, SW, 2, "#4A4A52"); for (let x = 2; x < SW; x += 12) P(x, 118, 6, 1, "#E9E2CF");
  const cx = 60 + Math.sin(t*3)*20;
  P(cx, 110, 30, 8, "#1F2238"); P(cx + 5, 105, 18, 6, "#1F2238"); P(cx + 7, 106, 6, 3, "#9CC9E6"); P(cx + 15, 106, 6, 3, "#9CC9E6"); P(cx + 12, 103, 4, 2, "#E3C064"); P(cx + 4, 117, 5, 3, "#141418"); P(cx + 21, 117, 5, 3, "#141418");
  P(cx + 20, 86, 54, 11, "#FFFFFF"); P(cx + 20, 86, 54, 1, "#1F2238"); text("RECALCULATING" + ".".repeat(Math.floor(t*12) % 4), cx + 23, 89, "#1F2238"); P(cx + 24, 97, 3, 4, "#FFFFFF");
},
};
const TITLES2 = {hurricane:"Hurricane Deductible makes landfall", canal:"Ship wedged in the canal", outage:"The update that broke the world", ash:"The volcano nobody can pronounce", cancel:"Everything is cancelled", bank:"Megabank goes bust overnight", rocket:"Rocket launch goes boom", solar:"The solar superstorm"};
const REPORTS2 = {
  hurricane:"A category 5 hurricane hit a coastline full of beachfront condos you insured. Cat bond investors in Mayfair are discovering what the “cat” stands for.",
  canal:"A 400-metre container ship you insure turned sideways and blocked the canal. Billions of pounds of cargo a day are stuck behind one very long parking mistake.",
  outage:"A routine software update crashed 8.5 million computers at once. Airlines, banks, broadcasters and the office coffee machine are all showing the same sad face.",
  ash:"An Icelandic volcano closed Europe’s airspace for a week. 100,000 flights were cancelled, and every travel policy you wrote just became a claim.",
  cancel:"A global outbreak cancelled every event on the calendar. Event cancellation claims are pouring in, led by one tennis club that paid for pandemic cover for 17 years straight.",
  bank:"A giant investment bank collapsed overnight. Its directors have all claimed on the D&O cover you wrote them, and every one of them was apparently on holiday that year.",
  rocket:"A rocket carrying satellites you insured exploded 40 seconds after launch. The satellites are now very expensive confetti.",
  solar:"The biggest solar storm since 1859 lit up the sky over London and fried satellites, power grids and every sat-nav in the country.",
};
function portrait2(o){
  face(o);
  P(13, 27, 3, 2, "rgba(235,110,110,.45)"); P(32, 27, 3, 2, "rgba(235,110,110,.45)");
  P(0, 0, 48, 1, "#1F2238"); P(0, 47, 48, 1, "#1F2238");
}
const PORTRAITS2 = {
  hurricane: t => portrait2({t, skin:"#F2C9A0", hair:"#C9A227", hairStyle:"windswept", shirt:"#1F2A44", tie:"#E3C064", eyes:"wide", brows:"worried", mouth:"grit", sweat:true, bg:"#3F566C"}),
  canal: t => portrait2({t, skin:"#C68650", hair:"#1C1C1C", hairStyle:"bob", shirt:"#F4F1EA", collar:"#E3C064", eyes:"normal", brows:"flat", mouth:"talk", bg:"#AEDAF2", look:1}),
  outage: t => portrait2({t, skin:"#C68650", hair:"#1C1C1C", shirt:"#4BB7A8", collar:"#4BB7A8", eyes:"normal", brows:"worried", mouth:"grit", glasses:true, headset:true, sweat:true, bg:"#1F5FBF"}),
  ash: t => portrait2({t, skin:"#8D5524", hair:"#2B1B10", hairStyle:"bob", shirt:"#B23A3A", collar:"#E3C064", eyes:"wide", brows:"worried", mouth:"scream", bg:"#9AA6B6"}),
  cancel: t => portrait2({t, skin:"#FFDBAC", hair:"#C9A227", shirt:"#3E2E6A", tie:"#3E9B4F", eyes:"wide", brows:"flat", mouth:"scream", bg:"#6CC05A"}),
  bank: t => portrait2({t, skin:"#F2C9A0", hair:"#5A3825", shirt:"#F4F1EA", collar:"#F4F1EA", tie:"#1F2A44", eyes:"normal", brows:"angry", mouth:"talk", glasses:true, bg:"#9CB8D6"}),
  rocket: t => portrait2({t, skin:"#C68650", hair:"#2B1B10", hairStyle:"bob", shirt:"#2B3352", collar:"#F4F1EA", eyes:"normal", brows:"flat", mouth:"talk", glasses:true, headset:true, bg:"#4A5280", look:1}),
  solar: t => portrait2({t, skin:"#E0A878", hair:"#9A9AA8", hairStyle:"bob", shirt:"#3E2E6A", collar:"#E3C064", eyes:"wide", brows:"flat", mouth:"talk", glasses:true, bg:"#22305E"}),
};
const LINES2 = {
  hurricane:{name:"Chad, Cat Bond Fund (Mayfair)", line:"It was a one-in-a-hundred-year storm. Same as the last three."},
  canal:{name:"Farida, Port Agent", line:"The digger is giving it everything. The queue now has its own postcode."},
  outage:{name:"Dev, IT", line:"It was a routine update. Routine as in it happened to everyone at the same time."},
  ash:{name:"Brenda, Travel Claims", line:"Eyja… Eyjafjalla… the volcano. It’s the volcano’s fault."},
  cancel:{name:"Hugo, Tennis Club Treasurer", line:"Seventeen years of premiums. Everyone laughed at the pandemic clause. Who’s laughing now? Me. I am."},
  bank:{name:"Gerald, D&O Claims", line:"Forty-two directors. Forty-two holidays. One very long weekend for me."},
  rocket:{name:"Dr Ada, Space Underwriting", line:"Technically, it did reach space. Some of it. Briefly."},
  solar:{name:"Professor Iris, Space Weather", line:"In 1859 it set telegraph offices on fire. Today it has so much more to work with."},
};

/* ---------- career cutscenes: promotions, endings and exits. They star the player's own CEO. ---------- */
function ceoSpr(frame){
  const lk = (typeof ceoLook === "function") ? ceoLook() : {skin:"#F2C9A0", hair:"#2B1B10", shirt:"#2F6FE4", pants:"#2B3352", style:0};
  return makeSprite("ceo_" + JSON.stringify(lk) + "_" + frame, 11, 20, () => { const sv = ctx; ctx = c; person(5, 18, lk, frame, 1); ctx = sv; });
}
function confetti(t, n, top){ const cols = ["#E3C064","#B23A3A","#2F6FE4","#3E9B4F","#F7F2E6","#C8507A"]; for (let k = 0; k < n; k++){ const tt = fr(t*0.8 + hs(k, 1)); P(hs(k, 2)*SW + Math.sin(tt*9 + k)*6, (top || 0) + tt*140 - 10, 2, 1.5, cols[k % 6]); } }
function hallBackdrop(){
  bands(0, 100, ["#141A2C","#1A2236","#1F2A44","#24305A"]);
  for (let x = 0; x < SW; x += 10){ P(x, 0, 5, 100, "rgba(255,255,255,.04)"); P(x + 5, 0, 1, 100, "rgba(0,0,0,.18)"); }
  P(0, 0, SW, 4, "#C9A54A"); P(0, 4, SW, 1, "#8E7228");
  P(0, 100, SW, 35, "#2B3352"); P(0, 100, SW, 2, "#C9A54A"); for (let x = 0; x < SW; x += 8) P(x, 104, 4, 1, "rgba(255,255,255,.06)");
}
function spotlight(x, w){ for (let y = 0; y < 100; y++){ const half = 4 + (w - 4)*(y/100); for (let xx = -half; xx < half; xx += 2) if ((xx + y) % 4 === 0) px(x + xx, y, "rgba(255,240,190,.10)"); } oval(x, 100, w, 4, "rgba(255,240,190,.25)"); }
function crowd(y, n, t, cheer){ for (let k = 0; k < n; k++){ const x = 8 + k*(224/n), bob = cheer ? Math.round(Math.abs(Math.sin(t*14 + k))*2) : 0; disc(x, y - bob, 5, ["#1F2238","#2B2238","#22283A"][k % 3]); P(x - 6, y + 3 - bob, 12, 10, ["#2B3352","#3A2A3E","#24305A"][k % 3]); if (cheer && k % 2) { P(x - 7, y - 9 - bob, 2, 7, "#2B3352"); P(x + 5, y - 9 - bob, 2, 7, "#2B3352"); } } }
function bigText(str, cx, y, col, shadow){ const s = textW(str, 2) <= 200 ? 2 : 1; text(str, cx - textW(str, s)/2, y, col, s, shadow); }
const RANK_LINES = [
  "Regional disruption complete. Next: disrupting the region again, but harder.",
  "Synergy isn’t a word. It’s a lifestyle. And a consultancy fee.",
  "My new book is called Thinking. Chapter one: think. Chapter two: invoice.",
  "Fortune 500? I prefer to think of it as Fortune 499 and climbing.",
  "We’re now too big to fail. It’s like success, but with a government guarantee.",
  "I now own the weather. Tomorrow: sunny, with a 100% chance of premiums.",
];
SCENES2.promo = function(t){
  const r = clamp(S.rankIdx - 1, 0, 5), name = RANKS[clamp(S.rankIdx, 1, RANKS.length - 1)].name.toUpperCase();
  hallBackdrop(); spotlight(98, 34);
  P(28, 10, 184, 20, "#C9A54A"); P(30, 12, 180, 16, "#1F2A44"); bigText(name, 120, name.length > 12 ? 18 : 15, "#E3C064", "#0E1222");
  // rank prop on the right
  const px0 = 176;
  if (r === 0){ P(px0 - 8, 70, 16, 30, "#2B3352"); P(px0 - 8, 70, 16, 2, "#C9A54A"); tri(px0 - 9, 52, px0 + 9, 52, px0, 68, "#E3C064"); P(px0 - 2, 66, 4, 4, "#E3C064"); P(px0 - 11, 54, 3, 6, "#E3C064"); P(px0 + 8, 54, 3, 6, "#E3C064"); text("REGIONAL", px0 - 15, 82, "#E3C064"); }
  else if (r === 1){ P(px0 - 30, 40, 60, 38, "#F7F2E6"); P(px0 - 30, 40, 60, 3, "#B23A3A"); text("SYNERGY", px0 - 14, 50, "#1F2A44"); for (let k = 0; k < 3; k++){ line(px0 - 20 + k*14, 70, px0 - 12 + k*14, 60, "#3E9B4F"); } disc(px0, 100, 10, "#B23A3A"); }
  else if (r === 2){ P(px0 - 26, 84, 52, 16, "#8E5A30"); for (let k = 0; k < 5; k++){ P(px0 - 20 + (k % 2)*2, 78 - k*5, 22, 5, ["#2F6FE4","#B23A3A","#3E9B4F","#E39A2C","#7A4FBF"][k]); } text("THINKING", px0 - 16, 50, "#E3C064"); }
  else if (r === 3){ P(px0 - 22, 34, 44, 60, "#F7F2E6"); P(px0 - 22, 34, 44, 10, "#B23A3A"); text("FORTUNE", px0 - 14, 36, "#FFFFFF"); blit(ceoSpr(0), px0, 78, 0, false, 1.6); text("500", px0 - 6, 86, "#1F2A44"); }
  else if (r === 4){ blit(chibi({skin:"#F2C9A0", hair:"#9A9AA8", shirt:"#2B2D52", tie:"#B23A3A"}, "stand", "minister"), px0 + 14, 98); P(px0 - 34, 60, 50, 22, "#F7F2E6"); P(px0 - 34, 60, 50, 22, "rgba(201,165,74,.0)"); P(px0 - 34, 60, 50, 1, "#C9A54A"); text("BAILOUT", px0 - 30, 64, "#1F2A44"); text("£999BN", px0 - 30, 72, "#3E9B4F"); }
  else { const rainy = fr(t*1.6) < 0.5; cloudPuff(px0, 44, 14, rainy ? "#8A96AA" : "#F7F2E6", rainy ? "#6A768A" : "#D8E0EA"); if (rainy) for (let k = 0; k < 14; k++) P(px0 - 14 + k*2, 56 + fr(t*3 + k*0.3)*30, 1, 3, "#9CC9E6"); else { disc(px0 + 16, 34, 7, "#F2C14E"); for (let k = 0; k < 8; k++){ const a = k*Math.PI/4 + t*2; P(px0 + 16 + Math.cos(a)*11, 34 + Math.sin(a)*11, 2, 2, "#F2C14E"); } }
    for (let k = 0; k < 5; k++) for (let x = -24; x < 24; x++) px(px0 + x, 78 - Math.sqrt(Math.max(0, 576 - x*x))*0.5 + k*1.5, ["#E8452C","#E39A2C","#F2C14E","#3E9B4F","#2F6FE4"][k]); }
  // podium and the CEO walking on stage
  const walk = Math.min(1, t/0.35), cx = 24 + ease(walk)*68;
  blit(ceoSpr(walk < 1 ? (Math.floor(t*12) % 2) : 0), cx, 96 - (walk >= 1 ? Math.round(Math.abs(Math.sin(t*8))) : 0));
  P(102, 80, 22, 20, "#C9A54A"); P(104, 82, 18, 16, "#1F2A44"); P(102, 80, 22, 1, "#E8D08A"); P(110, 74, 1, 7, "#1F2238"); disc(110, 73, 2, "#1F2238");
  crowd(124, 14, t, t > 0.35);
  if (t > 0.35) confetti(t, 60, 0);
};
SCENES2.fired = function(t){
  P(0, 0, SW, SH, "#EDE8DC"); for (let x = 0; x < SW; x += 24){ P(x, 8, 22, 70, "#E2DCCF"); P(x, 8, 22, 1, "#F7F2E6"); }
  P(0, 0, SW, 8, "#1F2A44"); P(0, 8, SW, 2, "#C9A54A");
  // the boardroom through the glass: the board toasting, Biscuit in your chair
  P(120, 18, 110, 56, "#1F2A44"); P(122, 20, 106, 52, "#9CC9E6"); P(122, 20, 106, 1, "#FFFFFF"); text("BOARDROOM", 150, 12, "#E3C064");
  P(130, 52, 90, 6, "#5A3825"); P(130, 52, 90, 1, "#8E5A30");
  const clink = fr(t*2) < 0.3 ? -2 : 0;
  for (let k = 0; k < 4; k++){ const bx = 140 + k*18; disc(bx, 44, 4, "#2B3352"); P(bx - 5, 47, 10, 6, "#2B3352"); P(bx + 3, 38 + (k % 2 ? clink : 0), 2, 5, "#F7F2E6"); px(bx + 3, 38 + (k % 2 ? clink : 0), "#E3C064"); }
  P(206, 30, 14, 22, "#3A2618"); disc(213, 40, 5, "#D9A55A"); P(209, 36, 3, 4, "#C08A48"); P(214, 36, 3, 4, "#C08A48"); px(211, 40, "#1F2238"); px(215, 40, "#1F2238"); P(212, 43, 3, 1, "#1F2238"); P(208, 45, 10, 4, "#B23A3A");
  // the corridor floor and an exit sign
  P(0, 100, SW, 35, "#C9C3B0"); for (let x = 0; x < SW; x += 12) P(x, 100, 6, 35, "#D3CDBF");
  P(8, 26, 22, 9, "#3E9B4F"); text("EXIT", 11, 28, "#FFFFFF");
  // the long walk: you and your box, security close behind
  const cx = 110 - t*80;
  blit(ceoSpr(Math.floor(t*10) % 2), cx, 112, 0, true);
  P(cx - 7, 98, 12, 7, "#C9A877"); P(cx - 7, 98, 12, 1, "#E2C79A"); P(cx - 3, 92, 3, 6, "#6E8A3A"); P(cx - 5, 90, 3, 3, "#8AA04A"); px(cx - 2, 89, "#A8A04A");
  blit(chibi({skin:"#8D5524", hair:"#1C1C1C", shirt:"#1F2238", cap:"#1F2238"}, "walk", "security"), cx + 20, 112, 0, true);
  // Percy has claimed your parking space
  P(40, 112, 30, 14, "#4A4A52"); P(40, 112, 30, 1, "#F7F2E6"); text("CEO", 48, 116, "#E3C064");
  const percy = makeSprite("percy2", 10, 10, () => { oval(5, 6, 4, 3, "#9AA3B5"); disc(7, 3, 2.5, "#9AA3B5"); P(9, 3, 2, 1, "#E39A2C"); px(7, 2, "#1F2238"); P(3, 8, 1, 2, "#E39A2C"); P(6, 8, 1, 2, "#E39A2C"); P(3, 0, 6, 2, "#E3C064"); });
  blit(percy, 56, 106 - Math.round(Math.abs(Math.sin(t*6))));
};
SCENES2.bankrupt = function(t){
  bands(0, 90, ["#8AA6C4","#A2BAD2","#BACCE0","#D2DEEA"]);
  for (let k = 0; k < 3; k++) cloudPuff(fr(hs(k, 3) + t*0.03)*SW, 14 + k*8, 10, "#F7F2E6", "#D8E0EA");
  P(60, 10, 120, 92, "#C9C3B0"); for (let r = 0; r < 7; r++) for (let k = 0; k < 6; k++) P(66 + k*19, 16 + r*11, 14, 7, "#5A6E8A");
  P(96, 66, 48, 36, "#1F2A44"); P(100, 70, 18, 32, "#9CC9E6"); P(122, 70, 18, 32, "#9CC9E6");
  P(70, 40, 100, 18, "#B23A3A"); P(72, 42, 96, 14, "#F7F2E6"); bigText("FOR SALE", 120, 44, "#B23A3A");
  P(0, 102, SW, 33, "#C4C2BC"); P(0, 102, SW, 2, "#E2E0DA");
  // bailiffs carrying the furniture away
  const bx = 150 + t*60;
  blit(chibi({skin:"#E0A878", hair:"#2B1B10", shirt:"#4A4A52"}, "walk", "bailiff1"), bx, 120); blit(chibi({skin:"#C68650", hair:"#1C1C1C", shirt:"#4A4A52"}, "walk", "bailiff2"), bx + 22, 120);
  P(bx - 4, 100, 30, 3, "#8E5A30"); P(bx - 2, 103, 2, 6, "#5A3825"); P(bx + 22, 103, 2, 6, "#5A3825");
  const umb = makeSprite("umb2", 14, 10, () => { for (let i = 0; i < 6; i++) P(i, 6 - Math.floor(i*0.8), 14 - i*2, 1, i % 2 ? "#E8452C" : "#B23A3A"); P(6, 6, 1, 4, "#4A4A52"); });
  blit(umb, bx + 30, 96 - Math.abs(Math.sin(t*10))*2, 0.3);
  // Biscuit, your replacement, arrives in a suit
  const dog = makeSprite("biscuit", 18, 14, () => { oval(9, 9, 7, 4, "#D9A55A"); disc(15, 5, 3.5, "#D9A55A"); P(16, 6, 3, 2, "#C08A48"); px(15, 4, "#1F2238"); P(18, 6, 1, 1, "#1F2238"); P(4, 12, 2, 2, "#C08A48"); P(12, 12, 2, 2, "#C08A48"); P(6, 6, 7, 3, "#1F2A44"); P(8, 6, 2, 3, "#F7F2E6"); P(9, 6, 1, 3, "#B23A3A"); });
  blit(dog, 120 - (1 - ease(Math.min(1, t*1.5)))*60, 122);
  P(104, 112, 30, 6, "#E3C064"); text("NEW CEO", 105, 113, "#1F2A44");
  // and you, on the kerb, holding your box
  blit(ceoSpr(0), 30, 124); P(24, 116, 12, 7, "#C9A877"); P(24, 116, 12, 1, "#E2C79A");
};
SCENES2.licence = function(t){
  bands(0, 95, ["#7CB4E4","#98C6EC","#B4D8F2"]);
  P(70, 14, 100, 88, "#F2EDE2"); P(70, 14, 100, 2, "#C9A54A"); for (let r = 0; r < 6; r++) for (let k = 0; k < 5; k++) P(76 + k*19, 30 + r*10, 13, 6, "#9CC9E6");
  P(84, 4, 72, 16, "#3E2A1E"); P(86, 6, 68, 12, "#5A3825"); text("COFFEE", 108, 9, "#F7F2E6"); P(146, 8, 6, 7, "#F7F2E6"); P(152, 10, 2, 3, "#F7F2E6");
  P(0, 98, SW, 37, "#C4C2BC"); P(0, 98, SW, 2, "#E2E0DA");
  // the coffee counter, with you behind it in an apron
  P(14, 90, 60, 20, "#5A3825"); P(14, 90, 60, 2, "#8E5A30"); blit(ceoSpr(0), 44, 88);
  P(40, 80, 9, 8, "#F7F2E6"); P(40, 78, 9, 2, "#3E9B4F");
  P(28, 84, 6, 6, "#F7F2E6"); P(29, 82, 4, 2, "#8E5A30"); for (let k = 0; k < 3; k++) px(30 + k, 78 - fr(t*2 + k*0.3)*6, "rgba(255,255,255,.7)");
  // the regulator brings down the stamp
  const sx = 178, down = fr(t*1.4) > 0.55 ? 1 : 0;
  P(150, 102, 70, 24, "#F7F2E6"); P(150, 102, 70, 1, "#C9C3B0"); for (let k = 0; k < 4; k++) P(156, 108 + k*4, 50, 1, "#C9C3B0");
  if (t > 0.3) { P(158, 106, 48, 14, "rgba(178,58,58,.0)"); text("REVOKED", 164, 110, "#B23A3A", 1); P(160, 107, 44, 1, "#B23A3A"); P(160, 117, 44, 1, "#B23A3A"); }
  P(sx - 6, 70 + down*20, 12, 8, "#B23A3A"); P(sx - 2, 60 + down*20, 4, 10, "#4A3020");
  blit(chibi({skin:"#F2C9A0", hair:"#9A9AA8", shirt:"#6A6A72", long:true, glasses:true}, "stand", "regulator"), 210, 100);
};
SCENES2.ipo = function(t){
  P(0, 0, SW, SH, "#1A2236"); P(0, 0, SW, 60, "#141A2C");
  P(10, 8, 220, 40, "#06080E");
  const nm = ((typeof companyName === "function" ? companyName() : "FINE PRINT").toUpperCase().replace(/[^A-Z0-9 ]/g, "").slice(0, 18) || "FINE PRINT") + "  +38%   ";
  text(nm.repeat(3), 14 - fr(t*0.6)*nm.length*4, 14, "#5BEFA6"); bigText("+38%", 120, 28, "#5BEFA6", "#0E3020");
  P(0, 48, SW, 3, "#C9A54A");
  // the balcony and the bell
  P(80, 62, 80, 10, "#C9A54A"); P(80, 72, 80, 4, "#8E7228");
  const swing = Math.sin(t*18)*0.4;
  c.save(); c.translate(150, 54); c.rotate(swing); tri(-6, 0, 6, 0, 0, -10, "#E3C064"); P(-7, -1, 14, 4, "#E3C064"); disc(0, 4, 1.5, "#8E7228"); c.restore();
  for (let k = 0; k < 3; k++){ const r = 8 + fr(t*3 + k/3)*14; for (let a = -0.8; a < 0.8; a += 0.15) px(150 + Math.cos(a - Math.PI/2)*r*1.3, 50 + Math.sin(a - Math.PI/2)*r, "rgba(227,192,100,.6)"); }
  blit(ceoSpr(0), 128, 62 - Math.round(Math.abs(Math.sin(t*16))));
  P(132, 50, 2, 6, "#4A3020");
  // traders cheering on the floor
  P(0, 100, SW, 35, "#2B3352");
  for (let k = 0; k < 9; k++) blit(chibi(PEOPLE[k % 6], "cheer", "trader" + k), 16 + k*26, 124 - Math.round(Math.abs(Math.sin(t*14 + k))*3));
  confetti(t, 70, 40);
};
SCENES2.pe = function(t){
  bands(0, 80, ["#3A4A7A","#6A5A8A","#C8708A","#F2A07A","#FFD09A"]);
  disc(180, 74, 12, "#FFE2A8"); disc(180, 74, 9, "#FFF2D0");
  bands(78, 135, ["#3E5A88","#34507C","#2A4670","#203A60"]);
  for (let k = 0; k < 20; k++) P(hs(k, 1)*SW, 82 + hs(k, 2)*50, 6, 1, "rgba(255,210,160,.35)");
  // the superyacht deck
  P(10, 92, 220, 16, "#F7F2E6"); tri(220, 92, 238, 92, 220, 108, "#F7F2E6"); P(10, 104, 228, 4, "#1F2A44"); P(10, 92, 228, 1, "#FFFFFF");
  P(40, 70, 80, 22, "#F7F2E6"); P(44, 74, 72, 8, "#5A6E8A"); P(30, 66, 100, 4, "#E8E4DA");
  for (let x = 14; x < 230; x += 8) P(x, 86, 1, 6, "#C9C3B0"); P(14, 86, 216, 1, "#C9C3B0");
  // the handshake over a giant cheque
  blit(ceoSpr(0), 140, 90);
  blit(chibi({skin:"#F2C9A0", hair:"#C9A227", shirt:"#1F2A44", tie:null, glasses:true}, "stand", "rupert"), 166, 90);
  P(144, 79, 18, 2, "#F2C9A0");
  P(128, 58, 60, 20, "#F7F2E6"); P(128, 58, 60, 2, "#3E9B4F"); text("PAY", 131, 62, "#1F2A44"); text("£££££", 131, 70, "#3E9B4F"); P(176, 70, 10, 1, "#1F2238");
  // champagne
  const pop = fr(t*1.2);
  P(200, 82, 4, 10, "#2E5A3E"); P(201, 78, 2, 4, "#2E5A3E"); P(200, 84, 4, 2, "#E3C064");
  P(201 + pop*20, 76 - pop*30 + pop*pop*20, 2, 2, "#C8A060");
  for (let k = 0; k < 10; k++){ const tt = fr(t*2 + k/10); px(202 + (hs(k, 1) - .5)*10*tt, 76 - tt*14, "rgba(255,250,220,.8)"); }
  const gull = makeSprite("gull", 10, 5, () => { line(0, 2, 4, 0, "#F7F2E6"); line(4, 0, 5, 2, "#F7F2E6"); line(5, 2, 9, 0, "#F7F2E6"); });
  blit(gull, fr(t*0.3)*SW, 24 + Math.sin(t*6)*3);
};
PORTRAITS2.fired = t => portrait2({t, skin:"#F2C9A0", hair:"#E9E2CF", hairStyle:"windswept", shirt:"#1F2A44", tie:"#B23A3A", eyes:"normal", brows:"angry", mouth:"talk", glasses:true, bg:"#9CC9E6"});
PORTRAITS2.bankrupt = t => portrait2({t, skin:"#E0A878", hair:"#2B1B10", hairStyle:"cap", shirt:"#4A4A52", collar:"#6A6A72", eyes:"normal", brows:"flat", mouth:"talk", beard:"#3A2618", bg:"#C4C2BC"});
PORTRAITS2.licence = t => portrait2({t, skin:"#F2C9A0", hair:"#9A9AA8", hairStyle:"bob", shirt:"#6A6A72", collar:"#F7F2E6", eyes:"normal", brows:"flat", mouth:"talk", glasses:true, bg:"#B4D8F2"});
PORTRAITS2.pe = t => portrait2({t, skin:"#F2C9A0", hair:"#C9A227", hairStyle:"windswept", shirt:"#1F2A44", collar:"#F7F2E6", eyes:"normal", brows:"flat", mouth:"smile", glasses:true, bg:"#F2A07A"});
LINES2.fired = {name:"Sir Clive, Chair of the Board", line:"Clear your desk. Percy is having your parking space. He’s very good with stakeholders."};
LINES2.bankrupt = {name:"Barry, Bailiff", line:"Sign here, here and here. The umbrella’s ours as well, I’m afraid."};
LINES2.licence = {name:"The Regulator", line:"Your licence is revoked. Your flat white, however, is excellent."};
LINES2.pe = {name:"Rupert, Private Equity", line:"We’ll add some debt, cut some costs and sell it on in three years. Welcome to the family."};

return {SW, SH, TITLES:TITLES2, REPORTS:REPORTS2, LINES:LINES2, kinds:Object.keys(SCENES2),
  drawScene(g, kind, t){ c = g; c.imageSmoothingEnabled = false; c.setTransform(1,0,0,1,0,0); c.clearRect(0, 0, SW, SH); (SCENES2[kind] || SCENES2.hurricane)(t);
    const vg = c.createRadialGradient(SW/2, SH*0.52, SH*0.4, SW/2, SH*0.52, SW*0.64); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(14,18,34,.45)"); c.fillStyle = vg; c.fillRect(0, 0, SW, SH); },
  drawPortrait(g, kind, t){ c = g; c.imageSmoothingEnabled = false; c.setTransform(1,0,0,1,0,0); c.clearRect(0, 0, 48, 48); (PORTRAITS2[kind] || PORTRAITS2.hurricane)(t); },
  drawCEO(g, look, t){ t = t || 0.3; c = g; c.imageSmoothingEnabled = false; c.setTransform(1,0,0,1,0,0); c.clearRect(0, 0, 48, 48);
    face({t, skin:look.skin, hair:look.hair, hairStyle:look.hairStyle === "short" ? undefined : look.hairStyle, shirt:look.outfit, tie:["tie","three"].includes(look.attire || "tie") ? "#E3C064" : null,
      attire:look.attire || "tie", lashes:look.lashes, lip:look.lipstick ? "#C0395A" : null, earrings:look.earrings, glasses:look.glasses, freckles:look.freckles, facial:look.facial, scarf:look.outfit && look.hairStyle === "scarf" ? shadeC(look.outfit, -0.15) : null,
      eyes:"normal", brows:"flat", mouth:"smile", bg:"#E9E2CF"});
    P(13, 27, 3, 2, "rgba(235,110,110,.45)"); P(32, 27, 3, 2, "rgba(235,110,110,.45)"); },
};
})();
