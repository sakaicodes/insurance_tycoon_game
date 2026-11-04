/* render/renderer.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
/* ---------- Phaser renderer ---------- */
const FONT = '"Chakra Petch", "Chakra Petch","Pixelify Sans", "Trebuchet MS", sans-serif';
let scene = null, game = null, RS = 2, cz = 1, cssW = 360, cssH = 600, dpr = 1;
let objs = [], floorObjs = [], custSpr = new Map(), cloudObjs = [];
let gSky = null, gStars = null, sunImg = null, imgSlot = null, imgLobby = null, imgRoof = null, imgSkyline = null, imgGround = null, imgFacade = null, elevImg = null, bellImg = null;
let rainEm = null, confettiEm = null, dustEm = null;
let lastKey = "", prevLevels = [], prevCount = 0, lastNight = null, bellRinging = false, rainOn = null, scrollHint = false;
let tick8 = 0, tick2 = 0, hudT = 0, saveT = 0, vel = 0, drag = null, pendingBottom = true;
let padX = 0;
let ceoW = {x:58, dir:1, pause:1.5, ft:0, where:"lobby", ride:0, init:false}, ceoSpr = null, ceoTag = null, ceoKey = "";
const pxL = css => css*dpr/cz;
const SK = n => n + "@" + RS;
const col = s => Phaser.Display.Color.ValueToColor(s).color;

function paint(key, w, h, fn, tx, ty){
  const W2 = Math.max(1, Math.ceil(w*RS)), H2 = Math.max(1, Math.ceil(h*RS));
  let tex = scene.textures.exists(key) ? scene.textures.get(key) : null;
  if (tex && (tex.width !== W2 || tex.height !== H2)){ scene.textures.remove(key); tex = null; }
  if (!tex) tex = scene.textures.createCanvas(key, W2, H2);
  const c = tex.getContext(), saved = ctx; ctx = c;
  c.setTransform(1,0,0,1,0,0); c.clearRect(0,0,W2,H2); c.imageSmoothingEnabled = false;
  c.setTransform(RS,0,0,RS,tx*RS,ty*RS);
  try { fn(); } finally { ctx = saved; c.setTransform(1,0,0,1,0,0); }
  tex.refresh();
  return key;
}
function framesTex(key, fw, fh, frames, opt){
  if (scene.textures.exists(key)) return key;
  const tex = scene.textures.createCanvas(key, fw*frames.length*RS, fh*RS);
  const c = tex.getContext(), saved = ctx;
  const oc = document.createElement("canvas"); oc.width = fw*RS; oc.height = fh*RS; const ox = oc.getContext("2d");
  const tc = document.createElement("canvas"); tc.width = oc.width; tc.height = oc.height; const tx = tc.getContext("2d");
  frames.forEach(([name, fn, shadow], k) => {
    ox.setTransform(1,0,0,1,0,0); ox.clearRect(0, 0, oc.width, oc.height); ox.imageSmoothingEnabled = false; ox.setTransform(RS,0,0,RS,0,0);
    ctx = ox; fn(); ctx = saved;
    const X = k*fw*RS; c.setTransform(1,0,0,1,0,0);
    if (opt && opt.shadow && shadow !== false){ const [sx, sy, rx] = opt.shadow; c.fillStyle = "rgba(0,0,0,.28)"; c.beginPath(); c.ellipse(X + sx*RS, sy*RS, rx*RS, Math.max(1, rx*RS*0.32), 0, 0, Math.PI*2); c.fill(); }
    if (opt && opt.outline){
      tx.setTransform(1,0,0,1,0,0); tx.globalCompositeOperation = "source-over"; tx.clearRect(0, 0, tc.width, tc.height); tx.drawImage(oc, 0, 0);
      tx.globalCompositeOperation = "source-in"; tx.fillStyle = "rgba(26,30,52,.92)"; tx.fillRect(0, 0, tc.width, tc.height); tx.globalCompositeOperation = "source-over";
      const o = Math.max(1, Math.round(RS*0.5));
      for (const [dx, dy] of [[-o,0],[o,0],[0,-o],[0,o]]) c.drawImage(tc, X + dx, dy);
    }
    c.drawImage(oc, X, 0);
    tex.add(name, 0, X, 0, fw*RS, fh*RS);
  });
  tex.refresh();
  return key;
}
function personTexture(lk){
  const key = "p3_" + [lk.skin, lk.hair, lk.shirt, lk.pants, lk.style, lk.tie || "-", lk.glasses ? 1 : 0, lk.hat ? 1 : 0, lk.skirt || "-", lk.blouse ? 1 : 0, lk.earrings ? 1 : 0, lk.beard || "-", lk.mo || "-", lk.scarf || "-"].join("_") + "@" + RS;
  return framesTex(key, 11, 20, [["f0", () => person(5,18,lk,0,1)], ["f1", () => person(5,18,lk,1,1)], ["sit", () => person(5,18,lk,-1,1,0), false], ["sitb", () => person(5,18,lk,-1,1,1), false]], {outline:true, shadow:[5,18.1,3]});
}
function drawBub(kind){
  const bx = 0, by = 1;
  if (kind === "wait" || kind === "low"){
    const low = kind === "low";
    R(bx,by,9,8, low ? "#FF6B6B" : "#FFFFFF"); R(bx+3,by+8,2,2, low ? "#FF6B6B" : "#FFFFFF");
    R(bx,by,9,1,"#1F2A44"); R(bx,by+7,9,1,"#1F2A44"); R(bx,by,1,8,"#1F2A44"); R(bx+8,by,1,8,"#1F2A44");
    R(bx+4,by+2,1,3, low ? "#FFFFFF" : "#E8452C"); R(bx+4,by+6,1,1, low ? "#FFFFFF" : "#E8452C");
  } else if (kind === "happy"){ const c = "#FF5A5F"; R(bx+2,by+1,2,2,c); R(bx+5,by+1,2,2,c); R(bx+2,by+3,5,1,c); R(bx+3,by+4,3,1,c); R(bx+4,by+5,1,1,c); }
  else if (kind === "angry"){ R(bx+1,by+1,7,5,"#E8452C"); T("#!", bx+4.5, by+5, 4.5, "#FFFFFF", "center", 700); }
  else { R(bx+1,by+1,7,6,"#FFFFFF"); T("?", bx+4.5, by+6, 6, "#4A3C75", "center", 700); }
}
function ensureStatic(){
  if (scene.textures.exists(SK("drop"))) return;
  paint(SK("drop"), 1, 3, () => R(0,0,1,3,"#FFFFFF"), 0, 0);
  paint(SK("px"), 2, 2, () => R(0,0,2,2,"#FFFFFF"), 0, 0);
  [14,20,26].forEach((w,i) => paint(SK("cloud"+i), w, 8, () => { const h = 8; ctx.fillStyle = "#FFFFFF"; ctx.beginPath(); ctx.arc(w*0.28, h*0.62, h*0.34, 0, Math.PI*2); ctx.arc(w*0.52, h*0.46, h*0.44, 0, Math.PI*2); ctx.arc(w*0.76, h*0.62, h*0.32, 0, Math.PI*2); ctx.fill(); ctx.fillRect(w*0.26, h*0.62, w*0.5, h*0.33);
    ctx.globalCompositeOperation = "source-atop"; const g = ctx.createLinearGradient(0, h*0.45, 0, h); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(120,170,220,.38)"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); ctx.globalCompositeOperation = "source-over"; }, 0, 0));
  paint(SK("sun"), 18, 18, () => { const g = ctx.createRadialGradient(9,9,0,9,9,9); g.addColorStop(0,"rgba(255,255,255,1)"); g.addColorStop(0.5,"rgba(255,255,255,1)"); g.addColorStop(0.56,"rgba(255,255,255,.35)"); g.addColorStop(1,"rgba(255,255,255,0)"); ctx.fillStyle = g; ctx.fillRect(0,0,18,18); }, 0, 0);
  paint(SK("moon"), 8, 8, () => { R(1,0,6,8,"#F4F1FF"); R(0,1,8,6,"#F4F1FF"); ctx.clearRect(4,1,3,5); }, 0, 0);
  paint(SK("bell"), 14, 8, () => { R(62,7,5,1,"#E0B43A"); R(61,8,7,3,"#FFD23F"); R(60,11,9,1,"#E0B43A"); R(64,12,1,1,"#6B4A2B"); }, -58, -5);
  paint(SK("elev"), 14, 22, () => { R(0,0,14,22,"#1F2A44"); R(1,1,12,20,"#C9A54A"); R(2,2,4,18,"#E8D08A"); R(8,2,4,18,"#E8D08A"); R(6,1,2,20,"#8E7228"); R(3,9,2,1,"#FFF6D0"); R(9,9,2,1,"#FFF6D0"); R(0,21,14,1,"#161B2E"); }, 0, 0);
  paint(SK("bus"), 32, 17, () => {
    ctx.fillStyle = "rgba(0,0,0,.25)"; ctx.beginPath(); ctx.ellipse(16, 16, 16, 1, 0, 0, Math.PI*2); ctx.fill();
    const bc = cityId() === "nyc" ? ["#F2F2EE","#2F6FE4","#FFFFFF"] : ["#D7262E","#A51C22","#E8545A"];
    if (cityId() === "bermuda"){ R(0,0,32,7,"#F28AB0"); R(0,0,32,1,"#F7B6CE"); R(0,7,32,7,"#2F6FE4"); R(0,6.4,32,1.2,"#FFFFFF"); R(0,13,32,1,"#1F4FB4"); }
    else { R(0,0,32,14,bc[0]); R(0,6,32,1,bc[1]); R(0,0,32,1,bc[2]); }
    for (let k = 0; k < 5; k++){ R(2+k*6,2,4,3,"#BFD9EA"); R(2+k*6,8,4,3,"#BFD9EA"); }
    R(4,13,4,3,"#1B1B2F"); R(23,13,4,3,"#1B1B2F"); R(31,10,1,2,"#FFE88A");
  }, 0, 0);
  paint(SK("cab"), 19, 10, () => {
    const y = 1, cc = cityId() === "nyc" ? "#F2C11E" : cityId() === "bermuda" ? "#F7F2E6" : "#1B1B2F"; R(0,y+3,19,5,cc); R(4,y,11,4,cc); if (cityId() === "nyc") for (let k = 0; k < 4; k++) R(2 + k*4,y+5,2,1,"#1B1B2F"); if (cityId() === "bermuda") R(15,y-2,3,2,"#2F6FE4"); R(5,y+1,4,2,"#9DB8CC"); R(10,y+1,4,2,"#9DB8CC");
    R(8,y-1,3,1,"#FFD23F"); R(2,y+7,3,2,"#555"); R(14,y+7,3,2,"#555"); R(18,y+4,1,1,"#FFE88A");
  }, 0, 0);
  framesTex(SK("percy2"), 13, 20, [["p0", () => percy(6,18,0,1)], ["p1", () => percy(6,18,1,1)]], {outline:true, shadow:[6,18.1,4]});
  ["wait","low","happy","angry","confused"].forEach(k => paint(SK("bub_"+k), 9, 11, () => drawBub(k), 0, 0));
}

function drawRoomBG(f, ws, y){
  const v = variantOf(f); R(28,y,146,38,v.wall);
  if (v.pattern) v.pattern(y); else for (let x = 31; x < 174; x += 6){ R(x, y+3, 1, 21, shade(v.wall, 0.07)); if ((x/6|0) % 2) R(x+3, y+10, 1, 1, shade(v.wall, -0.08)); }
  R(28,y,146,1.6,shade(v.wall, 0.25)); R(28,y+1.6,146,0.8,shade(v.wall, -0.25));
  R(28,y+26,146,9,"rgba(31,42,68,.30)"); R(28,y+26,146,1,"#C9A54A"); R(28,y+27,146,0.6,"rgba(20,26,46,.5)");
  for (let x = 31; x < 172; x += 16){ R(x, y+29, 13, 5, "rgba(255,230,190,.08)"); R(x, y+33.4, 13, 0.6, "rgba(20,26,46,.35)"); }
  v.decor(y);
  roomLighting(y, v.trim);
  for (const w of ws) if (w.mode === "sit"){ const sx = 34 + w.slot*28; R(sx-1,y+25,1.4,9,"#6E4424"); R(sx-1,y+25,1.4,0.6,"#46526E"); R(sx-1,y+32,6,1,"#2E3B5E"); R(sx+1,y+33,1,2,"#6E4424"); R(sx+4,y+33,1,2,"#6E4424"); }
}
function shade(hex, amt){ const n = parseInt(hex.slice(1), 16); const f = v => Math.round(clamp(amt < 0 ? v*(1 + amt) : v + (255 - v)*amt, 0, 255)); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; }
function roomLighting(y, trim, h){
  h = h || 35;
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, "rgba(20,24,44,.18)"); g.addColorStop(0.12, "rgba(255,225,170,.08)"); g.addColorStop(0.65, "rgba(255,200,120,.03)"); g.addColorStop(1, "rgba(20,24,44,.14)");
  ctx.fillStyle = g; ctx.fillRect(28, y, 146, h);
  for (const lx of [55,101,147]){
    const rg = ctx.createRadialGradient(lx, y + 5, 0, lx, y + 5, 28);
    rg.addColorStop(0, "rgba(255,226,160,.38)"); rg.addColorStop(1, "rgba(255,226,160,0)");
    ctx.fillStyle = rg; ctx.fillRect(lx - 28, y, 56, h);
    R(lx - 0.3, y + 0.5, 0.6, 2.2, "#1E2238"); R(lx - 3, y + 2.6, 6, 1.6, "#C98A3A"); R(lx - 3, y + 2.6, 6, 0.5, "#F2DC8E"); R(lx - 2, y + 4.2, 4, 0.7, "#FFF1B8");
  }
  for (const [x0, dir] of [[28, 1], [174, -1]]){ const sg = ctx.createLinearGradient(x0, 0, x0 + dir*10, 0); sg.addColorStop(0, "rgba(20,24,44,.24)"); sg.addColorStop(1, "rgba(20,24,44,0)"); ctx.fillStyle = sg; ctx.fillRect(Math.min(x0, x0 + dir*10), y, 10, h); }
  if (trim){
    R(28, y + h, 146, 3, "#46526E");
    for (let x = 29, k = 0; x < 173; x += 3, k++) if (hash(k, y) > 0.55) R(x, y + h + 1 + (k % 2), 1, 0.6, "rgba(255,255,255,.12)");
    R(28, y + h, 146, 0.7, "#C9A54A"); R(28, y + h + 2.4, 146, 0.6, "#1F2A44");
  }

}
function drawRoomFG(f, ws, y){ for (const w of ws) if (w.mode === "sit") drawDesk(34 + w.slot*28, y, f.type, w.slot); }
function isAnimated(f){
  const d = DESIGNS[f.type][f.skin || 0];
  return d && d.decor ? /time/.test(String(d.decor)) : f.type === "breakroom";
}
const CHUNK = 300;
function paintTall(prefix, w, yTop, yBot, fn, tx, imgX, depth, create){
  for (let y = yTop, k = 0; y < yBot; y += CHUNK, k++){
    const h = Math.min(CHUNK, yBot - y), key = prefix + k;
    paint(key, w, h, fn, tx, -y);
    if (create) addImg(key, imgX, y, depth);
  }
}
function addImg(key, x, y, depth){ const im = scene.add.image(x, y, key).setOrigin(0,0).setScale(1/RS).setDepth(depth); objs.push(im); return im; }
function towerKey(){ return `${RS}|${cssW}|${cssH}|${cityId()}|` + S.floors.map(f => `${f.type}${f.level}${f.mode}${f.skin}${f.lim || 0}`).join(","); }
function viewH(){ return scene.cameras.main.height/scene.cameras.main.zoom; }
function clampScroll(y){ const vh = viewH(); const mn = Math.min(0, LH - vh), mx = Math.max(mn, LH - vh); return clamp(y, mn, mx); }

function buildFloorObjs(L, i){
  const f = S.floors[i], ws = W[i] || [], fy = floorY(L, i);
  const o = {i, fy, anim:{dy:0, a:1}, f, animated:false};
  o.bg = addImg(paint("rbg"+i, 146, 38, () => drawRoomBG(f, ws, 0), -28, 0), OX+28, fy, 10);
  o.fg = addImg(paint("rfg"+i, 146, 38, () => drawRoomFG(f, ws, 0), -28, 0), OX+28, fy, 12);
  o.animated = isAnimated(f);
  o.workers = ws.map(w => {
    const key = w.percy ? SK("percy2") : personTexture(w.look);
    const im = scene.add.image(0, 0, key, w.percy ? "p0" : (w.mode === "sit" ? "sit" : "f0")).setScale(1/RS).setDepth(w.mode === "sit" ? 11 : 12.5).setOrigin(w.percy ? 6/13 : 5/11, 18/20);
    objs.push(im); return {w, im};
  });
  const fs = Math.max(pxL(11.5), 6.6), pad = Math.max(pxL(5), 2.6), ps = Math.max(pxL(5), 2.8), gap = Math.max(pxL(2), 1);
  o.lt = scene.add.text(0, 0, TYPES[f.type].name, {fontFamily:FONT, fontSize:fs+"px", fontStyle:"600", color:"#FFF1D0", resolution:Math.ceil(cz)}).setDepth(20.2);
  objs.push(o.lt);
  o.ln = scene.add.text(0, 0, f.type === "penthouse" ? "PH" : String(i + 1), {fontFamily:FONT, fontSize:fs+"px", fontStyle:"700", color:"#E3C064", resolution:Math.ceil(cz)}).setDepth(20.2); objs.push(o.ln);
  o.numW = o.ln.width + pxL(6);
  let tagW = 0;
  if (f.type === "claims"){
    const [txt0, c] = f.mode === "deny" ? ["Deny all","#FF8A8A"] : f.mode === "smart" ? ["Intel","#8FDCFA"] : ["Pay all","#5BEFA6"];
    const txt = f.lim ? txt0.replace(" all", "") + ({0.6:" small", 1:" mid", 2:" most"}[f.lim] || "") : txt0;
    o.tag = scene.add.text(0, 0, txt, {fontFamily:FONT, fontSize:(fs*0.9)+"px", fontStyle:"600", color:c, resolution:Math.ceil(cz)}).setDepth(20.2);
    objs.push(o.tag); tagW = o.tag.width + pxL(5);
  }
  const tw = o.lt.width + o.numW, ph = o.lt.height + pxL(1);
  o.pipX = pad + tw + pxL(5);
  const pw = o.pipX + MAXL*(ps+gap) - gap + pxL(4) + tagW + pad - pxL(4);
  o.lg = scene.add.graphics().setDepth(20.1); objs.push(o.lg);
  o.lg.fillStyle(0x000000, .35); o.lg.fillRoundedRect(0, pxL(2), pw, ph, pxL(3));
  o.lg.fillStyle(0xC9A54A, 1); o.lg.fillRoundedRect(0, 0, pw, ph, pxL(3)); o.lg.fillStyle(0x1F2A44, 1); o.lg.fillRoundedRect(pxL(1.2), pxL(1.2), pw - pxL(2.4), ph - pxL(2.4), pxL(2));
  o.lg.fillStyle(0xC9A54A, .8); o.lg.fillRect(pad + o.numW - pxL(3.5), pxL(2.5), Math.max(pxL(0.9), 0.6), ph - pxL(5));
  for (let k = 0; k < MAXL; k++){ o.lg.fillStyle(k < f.level ? 0xFFD23F : 0xFFFFFF, k < f.level ? 1 : .28); o.lg.fillRect(o.pipX + k*(ps+gap), (ph-ps)/2, ps, ps); }
  o.pad = pad; o.ph = ph; o.tagX = o.pipX + MAXL*(ps+gap) + pxL(3);
  floorObjs[i] = o;
}
function placeFloor(o){
  const dy = o.anim.dy, a = o.anim.a, y = o.fy + dy;
  o.bg.setPosition(OX+28, y).setAlpha(a); o.fg.setPosition(OX+28, y).setAlpha(a);
  const lx = OX + 30, ly = y + 1;
  o.lg.setPosition(lx, ly).setAlpha(a);
  o.lt.setPosition(lx + o.pad + o.numW, ly + pxL(0.5)).setAlpha(a); o.ln.setPosition(lx + o.pad, ly + pxL(0.5)).setAlpha(a);
  if (o.tag) o.tag.setPosition(lx + o.tagX, ly + (o.ph - o.tag.height)/2).setAlpha(a);
  for (const {w, im} of o.workers){
    if (w.mode === "sit"){
      const sx = 34 + w.slot*28;
      im.setPosition(OX+sx+3, y+33).setFrame(Math.floor(time*3 + w.ph) % 2 ? "sitb" : "sit").setFlipX(false);
    } else {
      const fr = w.pause > 0 ? 0 : Math.floor(time*6 + w.x) % 2;
      im.setPosition(OX + w.x, y + 35).setFrame(w.percy ? (fr ? "p1" : "p0") : (fr ? "f1" : "f0")).setFlipX(w.dir < 0);
    }
    im.setAlpha(a);
  }
}

function rebuildAll(){
  const cam = scene.cameras.main; cam.scrollX = -padX;
  const oldLH = LH, fromBottom = oldLH ? oldLH - (cam.scrollY + viewH()) : 0;
  for (const o of objs){ scene.tweens.killTweensOf(o); o.destroy(); }
  for (const o of floorObjs) if (o) scene.tweens.killTweensOf(o.anim);
  objs = []; floorObjs = []; cloudObjs = [];
  for (const [, s] of custSpr){ s.spr.destroy(); s.bub.destroy(); } custSpr.clear();
  ensureStatic();
  const L = layout(); LH = L.LH;
  const vh = viewH(), skyTop = Math.min(0, LH - vh) - 20;

  gSky = scene.add.graphics().setDepth(0); objs.push(gSky);
  gStars = scene.add.graphics().setDepth(0.5); objs.push(gStars);
  sunImg = scene.add.image(0, 0, SK("sun")).setScale(1/RS).setDepth(0.6); objs.push(sunImg);
  for (let k = 0; k < 9 + Math.round(padX/28); k++){
    const im = scene.add.image(rand(-padX - 20, LW + padX), rand(4, 62), SK("cloud"+(k%3))).setOrigin(0,0).setScale(1/RS).setDepth(0.8);
    im._s = rand(1.5, 4); objs.push(im); cloudObjs.push(im);
  }
  imgSkyline = addImg(paint("skyline", LW, 164, () => { ctx.save(); ctx.transform(LW/256,0,0,1,0,0); drawSkyline(L); ctx.restore(); }, 0, -(L.groundY-162)), 0, L.groundY-162, 1);
  const needCopy = k => k < 0 ? (k + 1)*LW > -padX : k*LW < LW + padX;
  if (padX > 0) paint("skylineF", LW, 164, () => { ctx.save(); ctx.transform(LW/256,0,0,1,0,0); drawSkylineFiller(L); ctx.restore(); }, 0, -(L.groundY-162));
  for (const k of [-4,-3,-2,-1,1,2,3,4]) if (needCopy(k)) addImg("skylineF", k*LW, L.groundY-162, 1).setFlipX(k % 2 !== 0);
  rainEm = scene.add.particles(0, 0, SK("drop"), {
    x:{min:-padX - 20, max:LW + padX + 40}, y:skyTop, speedY:{min:90, max:130}, speedX:{min:-18, max:-12},
    lifespan:(LH - skyTop + 10)/90*1000, frequency:28, quantity:1, scale:1/RS, alpha:.5, tint:0xE8EEF6, emitting:false
  }).setDepth(1.5);
  objs.push(rainEm); rainOn = null;
  imgGround = addImg(paint("ground", LW, GROUND+34, () => drawGround(L), 0, -(L.groundY-34)), 0, L.groundY-34, 2);
  for (const k of [-4,-3,-2,-1,1,2,3,4]) if (needCopy(k)) addImg("ground", k*LW, L.groundY-34, 2).setFlipX(k % 2 !== 0);
  const bus = scene.add.image(-40, L.groundY+6, SK("bus")).setOrigin(0,0).setScale(1/RS).setDepth(3); objs.push(bus);
  const cab = scene.add.image(-40, L.groundY+10, SK("cab")).setOrigin(0,0).setScale(1/RS).setDepth(3.1); objs.push(cab);
  const drive = (im, sp, d0) => { im.x = -padX - 40; scene.tweens.add({targets:im, x:LW + padX + 10, duration:(LW + 2*padX + 50)/sp*1000, delay:d0 != null ? d0 : rand(4000, 16000), onComplete:() => drive(im, sp)}); };
  drive(bus, 20, 1500); drive(cab, 34, 7000);
  paintTall("facade", LW, TOP, L.groundY, () => facadeRows(L), OX, 0, 4, true);
  lastNight = isNight();
  imgRoof = addImg(paint("roof", LW, 44, () => drawRoof(L), OX, -(TOP-42)), 0, TOP-42, 5);
  imgSlot = L.can ? addImg(paint("slot", 172, FH, () => drawSlot(L), -24, -L.slotY), OX+24, L.slotY, 6) : null;
  for (let i = 0; i < L.n; i++) buildFloorObjs(L, i);
  imgLobby = addImg(paint("lobby", 146, 44, () => drawLobby(L), -28, -L.lobbyY), OX+28, L.lobbyY, 13);
  bellImg = scene.add.image(OX+64.5, L.lobbyY+5, SK("bell")).setOrigin(6.5/14, 0).setScale(1/RS).setDepth(13.5); objs.push(bellImg); bellRinging = false;
  paintTall("shaft", 172, L.ph ? TOP : L.floorsTop, L.groundY, () => drawShaftStatic(L), -24, OX+24, 16, true);
  elevImg = scene.add.image(OX+176, elev.y || L.lobbyY+18, SK("elev")).setOrigin(0,0).setScale(1/RS).setDepth(17); objs.push(elevImg);
  confettiEm = scene.add.particles(0, 0, SK("px"), {
    speed:{min:40, max:120}, angle:{min:200, max:340}, gravityY:170, lifespan:1200,
    scale:{start:1.2/RS, end:0.2/RS}, rotate:{min:0, max:360},
    tint:[0xFFD23F, 0x4BE39A, 0xFF8FB1, 0x7FD3F7, 0xFFFFFF], emitting:false
  }).setDepth(40); objs.push(confettiEm);
  dustEm = scene.add.particles(0, 0, SK("px"), {
    speed:{min:10, max:40}, angle:{min:180, max:360}, gravityY:40, lifespan:700,
    scale:{start:1.4/RS, end:0}, alpha:{start:.8, end:0}, tint:[0xD8D0C0, 0xB9BEC8], emitting:false
  }).setDepth(19); objs.push(dustEm);

  cam.scrollY = pendingBottom ? clampScroll(LH) : clampScroll(LH - vh - Math.max(0, fromBottom));
  pendingBottom = false;
  redrawSky(true);

  const L2 = layout();
  if (prevCount && S.floors.length > prevCount){
    const o = floorObjs[lastAddedFloor >= 0 ? lastAddedFloor : S.floors.length-1];
    o.anim.dy = -46; o.anim.a = 0; sfx("build");
    scene.tweens.add({targets:o.anim, dy:0, a:1, duration:800, ease:"Bounce.easeOut", onComplete:() => { [50,100,150].forEach(x => dustEm.explode(8, OX+x, o.fy+38)); }});
    scene.tweens.add({targets:cam, scrollY:clampScroll(o.fy - 50), duration:600, ease:"Cubic.easeOut"});
  }
  S.floors.forEach((f, i) => { if (prevLevels[i] != null && f.level > prevLevels[i] && i < prevCount){ confettiEm.explode(18, OX+100, floorY(L2, i)+22); sfx("upgrade"); } });
  prevCount = S.floors.length; prevLevels = S.floors.map(f => f.level);
  lastKey = towerKey();
  if (!scrollHint && LH > vh + 20){ scrollHint = true; setTimeout(() => toast("Drag the tower (or use your mouse wheel) to scroll up and down."), 1200); }
}
function redrawSky(force){
  const [top, bot] = skyAt(phase());
  const vh = viewH(), skyTop = Math.min(0, LH - vh) - 40;
  gSky.clear();
  gSky.fillGradientStyle(col(top), col(top), col(bot), col(bot), 1);
  gSky.fillRect(-padX - 8, skyTop, LW + 2*padX + 16, 160 - skyTop);
  gSky.fillStyle(col(bot), 1); gSky.fillRect(-padX - 8, 160, LW + 2*padX + 16, LH - 160);
  scene.cameras.main.setBackgroundColor(top);
}
function redrawStars(){
  const p = phase(), na = clamp((p-0.8)/0.08, 0, 1);
  gStars.clear();
  if (na > 0) for (const s of stars){ gStars.fillStyle(0xFFFFFF, na*(0.5 + 0.5*Math.sin(time*2 + s.b*9))); for (let ox = -768; ox <= 768; ox += 256) if (s.x + ox > -padX - 2 && s.x + ox < LW + padX + 2) gStars.fillRect(s.x + ox, s.y, 1, 1); }
  if (p < 0.82){
    const t = p/0.82; sunImg.setTexture(SK("sun")).setPosition(12 + t*(LW-24), 58 - Math.sin(Math.PI*t)*44).setTint(p > 0.6 ? 0xFFB347 : 0xFFE066);
  } else sunImg.setTexture(SK("moon")).setPosition(30, 20).clearTint();
}

function frameSync(dt){
  const L = layout();
  if (rainOn !== weather.rain){ rainOn = weather.rain; if (rainOn) rainEm.start(); else rainEm.stop(); setRainSound(rainOn); }
  const p = phase();
  const tint = p > 0.72 ? (p > 0.86 ? 0x7878BE : 0xFFC9B0) : (weather.rain ? 0xBCC5D0 : 0xFFFFFF);
  for (const c of cloudObjs){ c.x += c._s*dt; if (c.x > LW + padX + 10){ c.x = -padX - 30; c.y = rand(4, 62); } c.setTint(tint).setAlpha(p > 0.86 ? .5 : 1); }
  for (const o of floorObjs) if (o) placeFloor(o);
  elevImg.y = elev.y;
  if (bell.t > 0 && !bellRinging){
    bell.t = 0; bellRinging = true; sfx("bell", bell.n);
    scene.tweens.add({targets:bellImg, angle:{from:-28, to:28}, duration:130, yoyo:true, repeat:5, ease:"Sine.easeInOut", onComplete:() => { bellImg.angle = 0; bellRinging = false; }});
  }
  const fyL = L.lobbyY + 40, alive = new Set();
  for (const u of CUST){
    alive.add(u);
    let s = custSpr.get(u);
    if (!s){
      s = {spr:scene.add.image(0, 0, personTexture(u.look), "f0").setOrigin(5/11, 18/20).setScale(1/RS).setDepth(14),
           bub:scene.add.image(0, 0, SK("bub_wait")).setOrigin(0,0).setScale(1/RS).setDepth(15)};
      custSpr.set(u, s);
    }
    const fr = u.moving ? Math.floor(time*7 + u.x) % 2 : 0;
    s.spr.setPosition(OX + u.x, fyL).setFrame(fr ? "f1" : "f0").setFlipX(u.face < 0);
    let kind = null, jump = 0;
    if (u.state === "wait"){
      const c = S.claims.find(c => c.id === u.id); const low = c && c.pat/c.max < .35;
      kind = low ? "low" : "wait"; jump = low ? Math.floor(time*6)%2 : Math.floor(time*2)%2;
    } else if (u.mood) kind = u.mood;
    if (kind) s.bub.setVisible(true).setTexture(SK("bub_"+kind)).setPosition(OX + Math.round(u.x) - 4, fyL - 24 - jump);
    else s.bub.setVisible(false);
  }
  for (const [u, s] of custSpr) if (!alive.has(u)){ s.spr.destroy(); s.bub.destroy(); custSpr.delete(u); }
}
function redrawDynamic(){
  const L = layout();
  const cmv = scene.cameras.main, vTop = cmv.scrollY - 45, vBot = cmv.scrollY + viewH() + 5;
  for (const o of floorObjs) if (o && o.animated && o.fy + 40 > vTop && o.fy < vBot) paint("rbg"+o.i, 146, 38, () => drawRoomBG(o.f, W[o.i] || [], 0), -28, 0);
  paint("lobby", 146, 44, () => drawLobby(L), -28, -L.lobbyY);
  paint("roof", LW, 44, () => drawRoof(L), OX, -(TOP-42));
  if (imgSlot) paint("slot", 172, FH, () => drawSlot(L), -24, -L.slotY);
  redrawStars();
}
function redrawSlow(){
  const L = layout();
  paint("skyline", LW, 164, () => { ctx.save(); ctx.transform(LW/256,0,0,1,0,0); drawSkyline(L); ctx.restore(); }, 0, -(L.groundY-162));
  if (lastNight !== isNight()){
    lastNight = isNight();
    paintTall("facade", LW, TOP, L.groundY, () => facadeRows(L), OX, 0, 4, false);
    paint("ground", LW, GROUND+34, () => drawGround(L), 0, -(L.groundY-34));
    if (padX > 0) paint("skylineF", LW, 164, () => { ctx.save(); ctx.transform(LW/256,0,0,1,0,0); drawSkylineFiller(L); ctx.restore(); }, 0, -(L.groundY-162));
  }
  redrawSky();
}

function tapAt(wx, wy){
  if (modalOpen || cutsceneOn) return;
  const lx = wx - OX, ly = wy;
  const L = layout(), fy = L.lobbyY + 40;
  { const ph = S.floors.findIndex(f => f.type === "penthouse"), cy = ceoW.where === "pent" && ph >= 0 ? floorY(L, ph) + 35 : fy;
    if (S.setupDone && ceoW.where !== "ride" && Math.abs(lx - ceoW.x) <= 5 && ly >= cy - 22 && ly <= cy + 2){ openBoard(); return; } }
  for (const u of CUST){ if (u.state === "wait" && Math.abs(lx - u.x) <= 8 && ly >= fy - 26 && ly <= fy + 2){ openClaims(u.id); return; } }
  if (L.ph && ly >= TOP && ly < TOP + FH){ openFloor(L.n - 1); return; }
  if (L.can && ly >= L.slotY && ly < L.slotY + FH){ openFloors(); return; }
  if (ly >= L.floorsTop && ly < L.lobbyY){ const k = Math.floor((ly - L.floorsTop)/FH); openFloor(L.nw - 1 - k); return; }
  if (ly >= L.lobbyY && ly < L.groundY && lx >= 24 && lx <= 196){ openClaims(); return; }
  if (ly < TOP) openBoard();
}

function ceoSync(dt){
  if (!scene || !S.setupDone){ if (ceoSpr && ceoSpr.active){ ceoSpr.setVisible(false); ceoTag.setVisible(false); } return; }
  const L = layout(), ph = S.floors.findIndex(f => f.type === "penthouse"), key = personTexture(ceoLook());
  if (!ceoW.init){ ceoW.init = true; if (ph >= 0){ ceoW.where = "pent"; ceoW.x = 110; } }
  if (ph < 0) ceoW.where = "lobby";
  else if (ceoW.where === "lobby"){ ceoW.where = "toLift"; ceoW.pause = 0; }
  if (!ceoSpr || !ceoSpr.active || ceoKey !== key || ceoTag.text !== ceoName()){
    if (ceoSpr && ceoSpr.active){ ceoSpr.destroy(); ceoTag.destroy(); }
    ceoSpr = scene.add.image(0, 0, key, "f0").setOrigin(5/11, 18/20).setScale(1/RS).setDepth(14.5); objs.push(ceoSpr);
    ceoTag = scene.add.text(0, 0, ceoName(), {fontFamily:FONT, fontSize:Math.max(pxL(10), 5.4) + "px", fontStyle:"700", color:"#FFF1D0", stroke:"#1F2A44", strokeThickness:Math.max(pxL(3), 1.4), resolution:Math.ceil(cz)}).setOrigin(0.5, 1).setDepth(14.6); objs.push(ceoTag);
    ceoKey = key;
  }
  const lobbyFy = L.lobbyY + 40, pentFy = ph >= 0 ? floorY(L, ph) + 35 : lobbyFy;
  let fy = lobbyFy, x = ceoW.x, walking = false, riding = false;
  if (ceoW.where === "toLift"){                      // walk across The Room to the lift
    ceoW.dir = 1; ceoW.x = Math.min(170, ceoW.x + 24*dt); ceoW.ft += dt; walking = true; x = ceoW.x;
    if (ceoW.x >= 170){ ceoW.where = "ride"; ceoW.ride = 0; }
  } else if (ceoW.where === "ride"){                 // ride the lift up to the penthouse
    ceoW.ride = Math.min(1, ceoW.ride + dt/Math.max(2.5, (lobbyFy - pentFy)/90));
    const u = ceoW.ride < 0.5 ? 2*ceoW.ride*ceoW.ride : 1 - Math.pow(-2*ceoW.ride + 2, 2)/2;
    fy = lobbyFy + (pentFy - lobbyFy)*u; x = 183; riding = true;
    elev.y = elev.ty = fy - 20; elev.wait = 2; if (elevImg) elevImg.y = elev.y;
    if (ceoW.ride >= 1){ ceoW.where = "pent"; ceoW.x = 162; ceoW.dir = -1; ceoW.pause = 1; }
  } else {                                           // stroll around The Room, or the penthouse once it exists
    const inPent = ceoW.where === "pent", lo = inPent ? 40 : 50, hi = inPent ? 162 : 104;
    fy = inPent ? pentFy : lobbyFy;
    if (ceoW.pause > 0) ceoW.pause -= dt;
    else { ceoW.x += ceoW.dir*9*dt; ceoW.ft += dt; walking = true; if (ceoW.x > hi || ceoW.x < lo){ ceoW.x = clamp(ceoW.x, lo, hi); ceoW.dir *= -1; ceoW.pause = 1.5 + Math.random()*3; } }
    x = ceoW.x;
  }
  ceoSpr.setVisible(true).setDepth(riding ? 17.5 : 14.5).setPosition(OX + x, fy).setFrame(walking && Math.floor(ceoW.ft*6) % 2 ? "f1" : "f0").setFlipX(ceoW.dir < 0);
  ceoTag.setVisible(!riding).setPosition(OX + x, fy - 18.5 + (walking ? 0 : Math.round(Math.sin(time*2))*0.3));
}
class TowerScene extends Phaser.Scene {
  constructor(){ super("tower"); }
  create(){
    scene = this;
    const cam = this.cameras.main; cam.setOrigin(0, 0); cam.setZoom(cz); cam.scrollX = -padX;
    this.input.on("pointerdown", p => { drag = {y:p.y, sy:cam.scrollY, moved:false, lastY:p.y, lastT:performance.now()}; vel = 0; });
    this.input.on("pointermove", p => {
      if (!drag || !p.isDown) return;
      if (Math.abs(p.y - drag.y) > 7*dpr) drag.moved = true;
      if (drag.moved){
        cam.scrollY = clampScroll(drag.sy - (p.y - drag.y)/cam.zoom);
        const now = performance.now(), dtm = Math.max(1, now - drag.lastT);
        vel = -((p.y - drag.lastY)/cam.zoom)/(dtm/1000); drag.lastY = p.y; drag.lastT = now;
      }
    });
    this.input.on("pointerup", p => { if (drag && !drag.moved){ vel = 0; tapAt(p.worldX, p.worldY); } drag = null; });
    this.input.on("wheel", (p, over, dx, dy) => { vel = 0; cam.scrollY = clampScroll(cam.scrollY + dy*dpr/cam.zoom); });
    this.game.canvas.style.cursor = "pointer";
    rebuildAll();
  }
  update(_, dms){
    const dt = paused ? 0 : Math.min(0.1, dms/1000); time += dt;
    if (!modalOpen && !S.over && !paused && !tutorialOn && !cutsceneOn) update(S.idleMode ? dt*(S.idleSpeed || 0.5) : dt);
    if (!paused) animate(dt);
    if (towerKey() !== lastKey) rebuildAll();
    const cam = this.cameras.main;
    if (!drag && Math.abs(vel) > 2){ cam.scrollY = clampScroll(cam.scrollY + vel*dt); vel *= Math.pow(0.03, dt); }
    frameSync(dt); ceoSync(dt);
    tick8 += dt; if (tick8 > 0.125){ tick8 = 0; redrawDynamic(); }
    tick2 += dt; if (tick2 > 0.5){ tick2 = 0; redrawSlow(); }
    hudT += dt; if (hudT > 0.1){ hud(); hudT = 0; }
    if (!paused && !modalOpen && !tutorialOn){ this.__cs = (this.__cs || 0) + dt; if (this.__cs >= 1){ this.__cs = 0; sampleCash(); } }
    saveT += dt; if (saveT > 5){ save(); saveT = 0; }
  }
}
let paused = false;
function setPaused(v){
  paused = v;
  $("#pauseOv").hidden = !v;
  $("#btnPause").textContent = v ? "Resume" : "Pause";
  $("#btnPause").classList.toggle("on", v);
  if (scene){ if (v){ scene.tweens.pauseAll(); } else { scene.tweens.resumeAll(); } }
  if (rainEm){ if (v) rainEm.pause(); else rainEm.resume(); }
  setRainSound(SND.rainWanted);
}
$("#btnPause").addEventListener("click", () => setPaused(!paused));
$("#pauseOv").addEventListener("click", () => setPaused(false));
document.addEventListener("keydown", e => { if ((e.key === "p" || e.key === "P") && !modalOpen && !e.target.closest("input,textarea")) setPaused(!paused); });
function measure(){
  const el = $("#game");
  cssW = Math.max(200, el.clientWidth); cssH = Math.max(200, el.clientHeight);
  dpr = Math.min(window.matchMedia && matchMedia("(pointer: coarse)").matches ? 2 : 3, window.devicePixelRatio || 1);
  const zW = cssW*dpr/LW, zH = cssH*dpr/(8.5*FH + 24);
  cz = cssW < 600 ? zW : Math.min(zW, zH); RS = Math.max(1, Math.ceil(cz));
  padX = Math.max(0, (cssW*dpr/cz - LW)/2);
}
function onResize(){
  if (!game) return;
  measure();
  game.scale.resize(Math.round(cssW*dpr), Math.round(cssH*dpr));
  game.scale.setZoom(1/dpr);
  if (scene){ scene.cameras.main.setZoom(cz); scene.cameras.main.scrollX = -padX; }
}
function boot(){
  if (!window.Phaser){ $("#game").innerHTML = `<p style="padding:20px;color:#fff">Phaser couldn’t load. Check your connection and reload.</p>`; return; }
  measure();
  game = new Phaser.Game({
    type: Phaser.AUTO, parent: "game", width: Math.round(cssW*dpr), height: Math.round(cssH*dpr),
    backgroundColor: "#7EC6EE", banner: false, antialias: true, pixelArt: false,
    scale: {mode: Phaser.Scale.NONE, zoom: 1/dpr},
    input: {mouse: {preventDefaultWheel: true}},
    scene: [TowerScene],
  });
  window.addEventListener("resize", () => { clearTimeout(boot._t); boot._t = setTimeout(onResize, 120); });
}
document.addEventListener("visibilitychange", () => { if (document.hidden) save(); });
hud();
const fontReady = document.fonts && document.fonts.load ? Promise.race([Promise.all([document.fonts.load('600 12px "Pixelify Sans"'), document.fonts.load('700 12px "Chakra Petch"', "0123456789")]), new Promise(r => setTimeout(r, 2500))]) : Promise.resolve();
fontReady.then(() => {
  boot();
  setCity(cityId());
  setTimeout(() => flushPending().catch(() => {}), 4000);
  $("#verTag").textContent = "v" + VERSION;
  document.title = companyName();
  if (S.lastVersion && S.lastVersion !== VERSION && S.seen && !S.over) setTimeout(() => toast(`Updated to v${VERSION}. Tap ? to see what’s new.`, "good"), 1500);
  S.lastVersion = VERSION;
  if (S.over) gameOver(); else if (!S.setupDone) openSetup(); else if (!S.seen) startTutorial(); else offlineCheck();
});

