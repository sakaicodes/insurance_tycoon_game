/* art/tower.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
/* ---------- Drawing target ---------- */
let ctx = null, LH = 0;
function R(x,y,w,h,c){ ctx.fillStyle = c; ctx.fillRect(x,y,w,h); }
function T(str,x,y,size,color,align="left",weight=600){
  size = Math.max(size, 4.4) * 1.08;
  ctx.font = `${weight} ${size}px "Chakra Petch","Pixelify Sans","Trebuchet MS",sans-serif`;
  ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = "alphabetic"; ctx.fillText(str,x,y);
}
function hexLerp(a,b,t){
  const pa = parseInt(a.slice(1),16), pb = parseInt(b.slice(1),16);
  const r = Math.round(((pa>>16)&255)*(1-t) + ((pb>>16)&255)*t);
  const g = Math.round(((pa>>8)&255)*(1-t) + ((pb>>8)&255)*t);
  const bl = Math.round((pa&255)*(1-t) + (pb&255)*t);
  return `rgb(${r},${g},${bl})`;
}
function skyAt(p){
  for (let i = 0; i < SKY.length-1; i++){
    const a = SKY[i], b = SKY[i+1];
    if (p <= b[0]){ const t = (p - a[0])/(b[0]-a[0]); return [hexLerp(a[1],b[1],t), hexLerp(a[2],b[2],t)]; }
  }
  return [SKY[4][1], SKY[4][2]];
}
let time = 0, lastSky = null;
const phase = () => S.qt/Q_LEN;
const isNight = () => phase() > 0.84;

function person(x, y, lk, walkF, face, bob = 0){
  x = Math.round(x); y = Math.round(y) - bob; const L = x - 3, fr = face > 0;
  const shoe = "#1E2238", sh = shade(lk.shirt, -0.22), skD = shade(lk.skin, -0.14), hairH = shade(lk.hair, 0.28);
  if (walkF >= 0){
    if (walkF % 2 === 0){ R(L+1,y-3,2,2,lk.pants); R(L+4,y-3,2,2,lk.pants); R(L+1,y-1,2,1,shoe); R(L+4,y-1,2,1,shoe); }
    else { R(L+2,y-3,3,2,lk.pants); R(L+1,y-1,2,1,shoe); R(L+4,y-1,2,1,shoe); }
  }
  R(L+1,y-8,5,1,lk.shirt); R(L,y-7,7,4,lk.shirt); R(L,y-4,7,1,sh);
  R(L+2,y-8,1,1,"#F7EEDC"); R(L+4,y-8,1,1,"#F7EEDC");
  if (lk.tie) R(L+3,y-8,1,4,lk.tie);
  else if (lk.blouse){ R(L+2,y-8,3,1,"#F7F2E6"); R(L+3,y-7,1,1,"#F7F2E6"); }
  if (lk.skirt){ R(L-0.5,y-4,8,2,lk.skirt); R(L-0.5,y-2.6,8,0.6,shade(lk.skirt, -0.25)); }
  R(L-1,y-7,1,3,sh); R(L+7,y-7,1,3,sh); R(L-1,y-4,1,1,lk.skin); R(L+7,y-4,1,1,lk.skin);
  R(L+1,y-15,5,7,lk.skin); R(L,y-14,7,5,lk.skin); R(L+1,y-9,5,1,skD);
  const hD = shade(lk.hair, -0.25);
  if (lk.style === 6){ R(L+2,y-16,2,1,"rgba(255,255,255,.35)"); }
  else if (lk.style === 7){ const sc = lk.scarf || "#3E2E6A"; R(L-1,y-17,9,9,sc); R(L-1,y-8,9,1,shade(sc, -0.2)); R(L+1,y-14,5,5,lk.skin); R(L+1,y-15,5,1,shade(sc, 0.2)); }
  else if (lk.style === 8){ R(L+1,y-17,5,1,lk.hair); R(L,y-16,7,2,lk.hair); R(L+1,y-18,3,1,lk.hair); R(fr ? L : L+6, y-14, 1, 2, lk.hair); }
  else if (lk.style === 1){ R(L+1,y-17,5,1,lk.hair); R(L,y-16,7,3,lk.hair); R(L-1,y-15,1,6,lk.hair); R(L+7,y-15,1,6,lk.hair); R(fr ? L : L+6, y-13, 1, 4, lk.hair); }
  else if (lk.style === 4){ R(L-1,y-17,9,3,lk.hair); R(L-1,y-14,1,4,lk.hair); R(L+7,y-14,1,4,lk.hair); R(L,y-18,7,1,lk.hair); R(L+1,y-17,1,1,shade(lk.hair, 0.3)); R(L+5,y-16,1,1,shade(lk.hair, 0.3)); }
  else if (lk.style === 5){ R(L+1,y-17,5,1,lk.hair); R(L,y-16,7,2,lk.hair); R(L-1,y-15,1,9,lk.hair); R(L+7,y-15,1,9,lk.hair); for (let k = 0; k < 4; k++){ R(L-1,y-13+k*2,1,1,hD); R(L+7,y-13+k*2,1,1,hD); } }
  else { R(L+1,y-17,5,1,lk.hair); R(L,y-16,7,2,lk.hair); R(fr ? L : L+6, y-14, 1, 3, lk.hair); R(fr ? L+1 : L+5, y-14, 1, 1, lk.hair);
    if (lk.style === 2){ R(fr ? L-1 : L+7, y-16, 1, 6, lk.hair); R(fr ? L-2 : L+8, y-13, 1, 3, lk.hair); R(fr ? L-1 : L+7, y-16, 1, 1, "#E3C064"); }
    if (lk.style === 3){ R(fr ? L-1 : L+6, y-18, 3, 2, lk.hair); R(fr ? L : L+7, y-18, 1, 1, shade(lk.hair, 0.3)); } }
  R(L+2,y-16,2,1,hairH);
  const e1 = fr ? L+3 : L+1, e2 = fr ? L+5 : L+3;
  R(e1, y-13, 1, 2, "#2B1A12"); R(e2, y-13, 1, 2, "#2B1A12");
  R(fr ? L+2 : L, y-10, 1, 1, "rgba(235,110,110,.6)"); R(fr ? L+6 : L+4, y-10, 1, 1, "rgba(235,110,110,.6)");
  if (lk.beard){ R(L,y-11,7,2,lk.beard); R(L+1,y-9,5,1,lk.beard); R(fr ? L+3 : L+2, y-10, 2, 1, lk.skin); }
  else if (lk.mo) R(fr ? L+3 : L+1, y-11, 3, 1, lk.mo);
  if (lk.earrings && lk.style !== 7) R(fr ? L : L+6, y-11, 1, 1, "#E3C064");
  if (lk.glasses){ R(e1-1, y-13, 3, 1, "rgba(70,40,25,.65)"); R(e2-1, y-13, 3, 1, "rgba(70,40,25,.65)"); }
  if (lk.hat){ R(L-1,y-16,9,1,"#3A2618"); R(L+1,y-18,5,2,"#4A3020"); R(L+1,y-17,5,1,"#8A5A2A"); }
}
function percy(x, y, f, face){
  const L = Math.round(x) - 3; y = Math.round(y);
  const o = f % 2;
  R(L+1+o,y-3,1,3,"#FF9F1C"); R(L+4-o,y-3,1,3,"#FF9F1C");
  R(L,y-9,7,6,"#9AA3B5"); R(L+2,y-8,3,4,"#C3CAD8");
  R(face>0?L-1:L+6, y-8, 2, 3, "#7E879C");
  R(L+1,y-10,5,1,"#5BB38A");
  R(L+1,y-15,5,5,"#9AA3B5");
  R(L+1,y-16,5,2,"#FFD23F"); R(L,y-15,7,1,"#FFD23F");
  R(face>0?L+6:L-1, y-13, 2, 1, "#FF9F1C");
  R(face>0?L+4:L+2, y-13, 1, 1, "#111");
}
function umbrella(x, y, holes){
  const c = "#FF5A5F";
  R(x-1,y,3,1,c); R(x-4,y+1,9,1,c); R(x-6,y+2,13,1,c); R(x-7,y+3,15,2,c);
  R(x-7,y+5,3,1,c); R(x-2,y+5,5,1,c); R(x+5,y+5,3,1,c);
  if (holes){ const hc = "#CFE0EE"; R(x-4,y+3,1,1,hc); R(x+2,y+2,1,1,hc); R(x+5,y+4,1,1,hc); }
  R(x,y+5,1,8,"#2E2552"); R(x-2,y+12,2,1,"#2E2552"); R(x-2,y+11,1,1,"#2E2552");
}
function hash(a,b){ const s = Math.sin(a*12.9898 + b*78.233)*43758.5453; return s - Math.floor(s); }

function drawSky(L){
  const [top, bot] = skyAt(phase());
  const g = ctx.createLinearGradient(0,0,0,LH);
  g.addColorStop(0, top); g.addColorStop(Math.min(1, 160/LH), bot); g.addColorStop(1, bot);
  ctx.fillStyle = g; ctx.fillRect(0,0,LW,LH);
  const p = phase();
  const na = clamp((p-0.8)/0.08, 0, 1);
  if (na > 0){ for (const s of stars){ ctx.globalAlpha = na*(0.5 + 0.5*Math.sin(time*2 + s.b*9)); R(s.x,s.y,1,1,"#FFFFFF"); } ctx.globalAlpha = 1; }
  if (p < 0.82){
    const t = p/0.82; const sx = Math.round(12 + t*(LW-24)), sy = Math.round(58 - Math.sin(Math.PI*t)*44);
    const sc = p > 0.6 ? "#FFB347" : "#FFE066";
    R(sx-3,sy-5,6,10,sc); R(sx-5,sy-3,10,6,sc); R(sx-4,sy-4,8,8,sc);
  } else {
    const mx = 30, my = 20; R(mx-3,my-4,6,8,"#F4F1FF"); R(mx-4,my-3,8,6,"#F4F1FF"); R(mx,my-3,3,5,top);
  }
  for (const c of clouds){
    const x = Math.round(c.x), y = Math.round(c.y);
    const col = p > 0.72 ? (p > 0.86 ? "rgba(120,120,190,.5)" : "#FFC9B0") : (weather.rain ? "#BCC5D0" : "#FFFFFF");
    R(x,y+3,c.w,4,col); R(x+3,y,Math.round(c.w*0.45),4,col); R(x+Math.round(c.w*0.45),y+1,Math.round(c.w*0.35),3,col);
  }
}
function drawSkyline(L){
  if (cityId() === "nyc") return skylineNYC(L); if (cityId() === "bermuda") return skylineBermuda(L);
  const gy = L.groundY, night = isNight();
  const far = night ? "#272D52" : "#A9B6C6", mid = night ? "#1E2446" : "#8E9DB1", near = night ? "#161B38" : "#73849B";
  const lit = "#FFE88A";
  for (let x = 0, k = 0; x < 256; k++){ const w = 6 + Math.floor(hash(k,11)*10), h = 10 + Math.floor(hash(k,12)*28); R(x, gy-h, w, h, far); if (night && hash(k,13) > .5) R(x+2, gy-h+3, 1, 1, lit); x += w; }
  // The big wheel
  const ex = 216, ey = gy-44, er = 26, rot = time*0.04;
  for (let a = 0; a < 90; a++){ const t = a/90*Math.PI*2; R(Math.round(ex+Math.cos(t)*er), Math.round(ey+Math.sin(t)*er), 1, 1, mid); }
  for (let k = 0; k < 8; k++){ const t = rot + k/8*Math.PI*2; for (let r = 3; r < er; r += 2) R(Math.round(ex+Math.cos(t)*r), Math.round(ey+Math.sin(t)*r), 1, 1, mid); }
  for (let k = 0; k < 16; k++){ const t = rot + k/16*Math.PI*2; R(Math.round(ex+Math.cos(t)*(er+1))-1, Math.round(ey+Math.sin(t)*(er+1))-1, 3, 2, night ? lit : mid); }
  for (let r = 0; r <= 44; r++){ R(Math.round(ex - r*0.4), ey + r, 1, 1, mid); R(Math.round(ex + r*0.4), ey + r, 1, 1, mid); }
  R(ex-1,ey-1,3,3,mid);
  // Cathedral dome
  R(30,gy-32,30,32,mid); R(22,gy-44,6,44,mid); R(62,gy-44,6,44,mid); R(23,gy-48,4,4,mid); R(63,gy-48,4,4,mid);
  for (let r = 0; r <= 13; r++){ const w = Math.round(Math.sqrt(169 - r*r))*2; R(45 - w/2, gy-32-r, w, 1, mid); }
  R(43,gy-52,4,7,mid); R(44,gy-57,2,5,mid); R(43,gy-55,4,1,mid);
  // The pointy glass one
  for (let r = 0; r < 150; r++){ const w = Math.max(1, Math.round(30*(1 - r/150))); R(16 - Math.floor(w/2), gy-r, w, 1, near);
    if (night && r % 7 === 3 && w > 4 && hash(r,5) > .4) R(16 - Math.floor(w/2) + 1 + Math.floor(hash(r,6)*(w-2)), gy-r, 1, 1, lit); }
  R(14,gy-157,1,7,near); R(17,gy-155,1,5,near);
  // The pickle-shaped one
  for (let r = 0; r < 64; r++){ const w = Math.max(2, Math.round(20*Math.sin(Math.PI*Math.min(1,(r+9)/73)))); const x0 = 232 - Math.floor(w/2);
    R(x0, gy-r, w, 1, near); const d = (r*2) % 8; if (d < w) R(x0 + d, gy-r, 1, 1, night ? "#2A3560" : "#8798B0"); }
  // Clock tower
  R(246,gy-74,9,74,near); R(244,gy-24,13,24,near);
  for (let r = 0; r < 14; r++){ const w = Math.max(1, Math.round(9 - r*0.62)); R(250 - Math.floor(w/2), gy-74-r, w, 1, near); }
  R(250,gy-92,1,5,near);
  R(247,gy-66,7,7, night ? lit : "#E4DDC0"); R(250,gy-65,1,3,"#3A3A4A"); R(250,gy-63,2,1,"#3A3A4A");
  ctx.globalCompositeOperation = "source-atop"; const hz = ctx.createLinearGradient(0, gy-160, 0, gy); hz.addColorStop(0, "rgba(255,255,255,0)"); hz.addColorStop(1, night ? "rgba(30,36,80,.3)" : "rgba(226,233,241,.42)"); ctx.fillStyle = hz; ctx.fillRect(0, gy-160, 256, 160); ctx.globalCompositeOperation = "source-over";
}
function drawSkylineFiller(L){
  const gy = L.groundY, night = isNight();
  if (cityId() === "bermuda"){ skylineBermuda(L); return; }
  const far = night ? "#272D52" : "#A9B6C6", mid = night ? "#1E2446" : "#8E9DB1", near = night ? "#181D3B" : "#7C8DA4", lit = "#FFE88A";
  for (let x = 0, k = 0; x < 256; k++){ const w = 6 + Math.floor(hash(k + 40, 11)*10), h = 12 + Math.floor(hash(k + 40, 12)*30); R(x, gy-h, w, h, far); if (night && hash(k + 40, 13) > .5) R(x+2, gy-h+3, 1, 1, lit); x += w; }
  for (let x = 2, k = 0; x < 250; k++){
    const w = 12 + Math.floor(hash(k, 21)*16), h = 34 + Math.floor(hash(k, 22)*60), c = hash(k, 25) > .5 ? mid : near;
    if (hash(k, 23) > 0.35){
      R(x, gy-h, w, h, c);
      if (hash(k, 26) > .6){ R(x + w/2 - 1, gy-h-8, 1.5, 8, c); R(x + w/2 - 0.5, gy-h-10, 0.8, 2, night ? "#FF5A5F" : c); }
      for (let yy = gy-h+4; yy < gy-5; yy += 5) for (let xx = x+2; xx < x+w-2; xx += 4) if (night ? hash(xx, yy) > .5 : hash(xx, yy) > .82) R(xx, yy, 1.6, 2, night ? lit : "#B4C2D3");
    }
    x += w + 4 + Math.floor(hash(k, 24)*14);
  }
  ctx.globalCompositeOperation = "source-atop"; const hz = ctx.createLinearGradient(0, gy-160, 0, gy); hz.addColorStop(0, "rgba(255,255,255,0)"); hz.addColorStop(1, night ? "rgba(30,36,80,.3)" : "rgba(226,233,241,.42)"); ctx.fillStyle = hz; ctx.fillRect(0, gy-160, 256, 160); ctx.globalCompositeOperation = "source-over";
}
function drawRain(){
  if (!weather.rain) return;
  ctx.globalAlpha = .5;
  for (const d of drops) R(Math.round(d.x), Math.round(d.y), 1, 3, "#E8EEF6");
  ctx.globalAlpha = 1;
}
function drawGround(L){
  const gy = L.groundY, night = isNight();
  R(0,gy,LW,3,night ? "#2E5A2E" : "#5FAF3E"); R(0,gy,LW,0.8,night ? "#3E6E38" : "#86CF56");
  for (let x = 1; x < LW; x += 3){ R(x, gy-1, 1, 1.5, night ? "#2E5A2E" : (x % 2 ? "#5FAF3E" : "#4E9A36")); }
  for (let x = 4, k = 0; x < LW; x += 7, k++) if (hash(k, 71) > 0.45) R(x, gy+0.6, 1, 1, ["#F2C14E","#E8705F","#FFFFFF","#C08AE0"][k % 4]);
  R(0,gy+3,LW,3,night ? "#6A6A70" : "#C4C2BC"); for (let x = 0, k = 0; x < LW; x += 4, k++) R(x + (k % 2)*2, gy+3 + (k % 2)*1.5, 0.5, 1.5, night ? "#505058" : "#9E9C96");
  R(0,gy+6,LW,0.8,night ? "#44444C" : "#86847E");
  R(0,gy+6.8,LW,GROUND-6.8,night ? "#2E2C34" : "#4A4650");
  for (let x = 2; x < LW; x += 12) R(x, gy+14, 6, 1, "#F2E6C8");
  R(12,gy-26,1,26,"#1F2A44"); R(9,gy-28,7,2,"#1F2A44"); R(10,gy-26,5,1, night ? "#FFE88A" : "#E6D2AE");
  if (night){ ctx.globalAlpha = .22; R(4,gy-25,17,25,"#FFE88A"); ctx.globalAlpha = 1; }
  if (cityId() === "bermuda") bermudaPalms(gy); else if (cityId() === "nyc") nycStreet(gy, night);
  for (const c of cars){
    if (c.wait > 0) continue; const x = Math.round(c.x);
    if (c.kind === "bus"){ const y = gy+6;
      R(x,y,32,14,"#D7262E"); R(x,y+6,32,1,"#A51C22"); R(x,y,32,1,"#E8545A");
      for (let k = 0; k < 5; k++){ R(x+2+k*6,y+2,4,3,night?"#FFE9A8":"#BFD9EA"); R(x+2+k*6,y+8,4,3,night?"#FFE9A8":"#BFD9EA"); }
      R(x+4,y+13,4,3,"#1B1B2F"); R(x+23,y+13,4,3,"#1B1B2F"); R(x+31,y+10,1,2,"#FFE88A");
    } else { const y = gy+11;
      R(x,y+3,19,5,"#1B1B2F"); R(x+4,y,11,4,"#1B1B2F"); R(x+5,y+1,4,2,"#9DB8CC"); R(x+10,y+1,4,2,"#9DB8CC");
      R(x+8,y-1,3,1,"#FFD23F"); R(x+2,y+7,3,2,"#555"); R(x+14,y+7,3,2,"#555"); R(x+18,y+4,1,1,"#FFE88A"); }
  }
}
function flareF(L, y){
  if (cityId() !== "london") return 14;
  const body = 14, base = 5, crown = 30, sm = t => t*t*(3 - 2*t);
  if (y < L.floorsTop){ const t = clamp((L.floorsTop - y)/Math.max(1, L.floorsTop - TOP), 0, 1); return body + (crown - body)*sm(t); }
  const baseTop = L.lobbyY - FH*0.6;
  if (y > baseTop){ const t = clamp((L.groundY - y)/(L.groundY - baseTop), 0, 1); return base + (body - base)*sm(t); }
  return body;
}
function flareAt(L, y){ return Math.round(flareF(L, y)); }
function facadeRows(L){
  if (cityId() !== "london") return facadeAlt(L);
  const night = isNight(), top = TOP, bot = L.groundY;
  const fl = y => flareF(L, y);
  for (const side of [-1, 1]){
    const base = side < 0 ? 24 : 196, maxF = fl(top), x0 = Math.min(base, base + side*maxF);
    ctx.beginPath(); ctx.moveTo(base, top);
    for (let y = top; y <= bot; y += 1) ctx.lineTo(base + side*fl(y), y);
    ctx.lineTo(base, bot); ctx.closePath();
    const g = ctx.createLinearGradient(base, 0, base + side*maxF, 0);
    g.addColorStop(0, night ? "#3A5577" : "#A7C8DE"); g.addColorStop(0.5, night ? "#2C4262" : "#7EA6C2"); g.addColorStop(1, night ? "#1E3049" : "#56809F");
    ctx.save(); ctx.fillStyle = g; ctx.fill(); ctx.clip();
    ctx.fillStyle = night ? "rgba(8,16,34,.4)" : "rgba(36,66,96,.32)";
    for (let k = 3; k < maxF; k += 3) ctx.fillRect(base + side*k - 0.25, top, 0.5, bot - top);
    ctx.fillStyle = "rgba(30,42,68,.9)";
    for (let i = 0; i < L.n; i++) ctx.fillRect(x0, floorY(L, i) + 38, maxF, 2);
    const sh = ctx.createLinearGradient(base, top, base + side*maxF*1.5, top + 160);
    sh.addColorStop(0, "rgba(255,255,255,0)"); sh.addColorStop(0.42, night ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.24)"); sh.addColorStop(0.5, "rgba(255,255,255,0)");
    ctx.fillStyle = sh; ctx.fillRect(x0, top, maxF, bot - top);
    if (night) for (let i = 0; i < L.n; i++) for (let k = 4; k < maxF - 1; k += 6) if (hash(i, k) > .72){ ctx.fillStyle = "rgba(255,226,140,.55)"; ctx.fillRect(base + side*k - 1, floorY(L, i) + 12, 2, 6); }
    ctx.restore();
    ctx.beginPath(); for (let y = top; y <= bot; y += 1){ const x = base + side*fl(y); if (y === top) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
    ctx.strokeStyle = night ? "rgba(140,170,210,.55)" : "rgba(235,245,255,.85)"; ctx.lineWidth = 0.6; ctx.stroke();
  }
}
function drawRoof(L){
  if (cityId() === "nyc") return roofNYC(L); if (cityId() === "bermuda") return roofBermuda(L);
  const base = TOP, night = isNight();
  const tf = flareAt(L, TOP) + 2, x0 = 24 - tf, x1 = 196 + tf, w = x1 - x0;
  for (let x = x0; x < x1; x++){
    const h = Math.round(20 + 16*(x - x0)/w);
    R(x, base-h, 1, h-9, (x - x0) % 6 === 0 ? (night ? "#22344D" : "#6E95B3") : (night ? "#2F4562" : "#B4D0E2"));
    R(x, base-h-1, 1, 1, "#3E5672");
  }
  ctx.beginPath(); ctx.moveTo(x0, base-9); ctx.lineTo(x0, base-20); ctx.lineTo(x1, base-36); ctx.lineTo(x1, base-9); ctx.closePath();
  const rg = ctx.createLinearGradient(0, base-36, 0, base-9); rg.addColorStop(0, "rgba(255,255,255,.3)"); rg.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = rg; ctx.fill();
  for (let x = x0 + 3, k = 0; x < x1 - 6; x += 7, k++){
    const hh = 4 + Math.floor(hash(k,7)*7);
    R(x+2.5, base-12, 1, 3, "#6B4A2B");
    ctx.fillStyle = "#3FA05A"; ctx.beginPath(); ctx.arc(x+3, base-11-hh*0.45, 2+hh*0.35, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "#62C977"; ctx.beginPath(); ctx.arc(x+2.2, base-12-hh*0.6, 1+hh*0.18, 0, Math.PI*2); ctx.fill();
  }
  R(x0+20, base-12, 1, 3, "#1B1B2F"); R(x0+20, base-14, 1, 2, "#FFD23F");
  R(x1-40, base-12, 1, 3, "#1B1B2F"); R(x1-40, base-14, 1, 2, "#FF8FB1");
  R(x0, base-9, w, 9, "#1F2A44"); R(x0, base-8, w, 7, "#2E3B5E"); R(x0, base-8, w, 0.6, "#C9A54A"); R(x0, base-9, w, 1, "#F2C14E");
  for (let i = 0; i < Math.floor(w/6); i++) R(x0 + 2 + i*6, base-1, 2, 1, (Math.floor(time*3) + i) % 2 ? "#FFE9A8" : "#7A5A28");
  { const nm = companyName(); let fs = 7.2; ctx.font = `700 ${fs*1.08}px "Chakra Petch","Pixelify Sans","Trebuchet MS",sans-serif`;
    while (fs > 4.5 && ctx.measureText(nm).width > w - 14){ fs -= 0.2; ctx.font = `700 ${fs*1.08}px "Chakra Petch","Pixelify Sans","Trebuchet MS",sans-serif`; }
    T(nm, 110, base-2, fs, "#FFE9A8", "center", 700); }
  R(x1-3, base-38, 2, 2, Math.floor(time*1.5) % 2 ? "#FF5A5F" : "#7A2A2A");
}
function drawSlot(L){
  const y = L.slotY, can = S.cash >= buildCost();
  ctx.globalAlpha = can ? 0.28 + 0.12*Math.sin(time*4) : 0.16;
  R(24,y,172,FH,"#FFFFFF"); ctx.globalAlpha = 1;
  const c = "#C98A2E";
  [24,96,168,194].forEach(x => R(x,y,2,FH,c));
  R(24,y+FH-2,172,2,c); R(24,y+13,172,1,c);
  for (let t = 0; t <= 1; t += 1/60){ R(Math.round(26+70*t), Math.round(y+13+(FH-15)*t), 1, 1, c); R(Math.round(96-70*t), Math.round(y+13+(FH-15)*t), 1, 1, c); }
  R(57,y+13,106,24,"#1F2A44"); R(58,y+14,104,22,"#2E3B5E"); R(59,y+15,102,20,"#46526E"); R(59,y+15,102,0.8,"#C9A54A");
  for (const [bx, by] of [[60.5,16.5],[158.5,16.5],[60.5,33.5],[158.5,33.5]]) R(bx, y + by - 15 + 15, 1, 1, "#E2C48A");
  T("+ Build a floor", 110, y+24, 8.5, can ? "#FFE9A8" : "#E6D2AE", "center", 700);
  T(fmt(buildCost()), 110, y+33, 7, can ? "#B9F28A" : "#D9C29A", "center", 600);
}
function drawDesk(sx, y, type, slot){
  const t = TYPES[type];
  ctx.fillStyle = "rgba(20,24,44,.22)"; ctx.beginPath(); ctx.ellipse(sx + 7, y + 35.2, 8, 1.3, 0, 0, Math.PI*2); ctx.fill();
  R(sx,y+28,14,2,"#E9E5DB"); R(sx,y+28,14,0.6,"#FFFFFF"); R(sx,y+30,14,1,"#BDB6A6");
  R(sx+1,y+31,2,4,"#2E3B5E"); R(sx+11,y+31,2,4,"#2E3B5E"); R(sx+3,y+31,8,2,"#D8D2C4"); R(sx+6,y+31.8,2,0.6,"#C9A54A");
  R(sx+2,y+28.9,4,0.4,"rgba(150,145,130,.4)"); R(sx+8,y+29.3,4,0.4,"rgba(150,145,130,.4)");
  R(sx+6,y+21,7,6,"#2A2F45"); R(sx+7,y+22,5,4,t.screen); R(sx+9,y+27,1,1,"#2A2F45"); R(sx+8,y+27.5,3,0.6,"#2A2F45");
  R(sx+7,y+22,5,0.9,"rgba(255,255,255,.35)");
  if (type === "actuary"){ ctx.globalAlpha = .18; R(sx+4,y+19,11,10,"#4BE39A"); ctx.globalAlpha = 1;
    const bl = Math.floor(time*4 + slot) % 4; R(sx+8, y+23 + (bl%2), 1+bl, 1, "#2B1A12"); }
  if (type === "sales"){ R(sx+1,y+27,3,1,"#1E2238"); R(sx+1,y+26,1,1,"#1E2238"); }
  if (type === "claims" || type === "legal"){ const h = 1 + Math.floor(hash(slot, 3)*4) + (type==="claims"?2:0); R(sx+1,y+28-h,4,h,"#FFF6E2"); R(sx+1,y+28-h,4,1,"#E6D2AE"); }
  if (type === "marketing"){ R(sx+1,y+26,2,2,"#D9443A"); }
  if (slot % 2 === 0){ R(sx+1.5,y+25,2,3,"#C86A3A"); R(sx+1,y+23,3,2,"#4E9A3A"); px2(sx+2,y+22.4,"#6CC24A"); }
}
function px2(x, y, c){ R(x, y, 1, 1, c); }
function variantOf(f){
  const list = DESIGNS[f.type];
  if (f.skin == null || f.skin >= list.length) f.skin = Math.floor(Math.random()*list.length);
  const d = list[f.skin], t = TYPES[f.type];
  return {name:d.name, wall:d.wall || t.wall, trim:d.trim || t.trim, pattern:d.pattern, decor:d.decor || (y => decorOld(f, y))};
}
function decorOld(f, y){
  const t = f.type;
  if (t === "sales"){
    R(96,y+10,18,10,"#FFFFFF"); R(98,y+16,2,3,"#3FA05A"); R(101,y+14,2,5,"#3FA05A"); R(104,y+12,2,7,"#3FA05A"); R(108,y+11,2,8,"#E8452C");
    R(122,y+10,9,9,"#FFFFFF"); R(122,y+10,9,1,"#2E2552"); R(126,y+11,1,4,"#222"); R(126,y+14,3,1,"#222");
    R(138,y+10,32,8,"#E8452C"); T("Write it!", 154, y+16, 5.5, "#FFFFFF", "center", 700);
  } else if (t === "claims"){
    R(96,y+10,42,9,"#FFFFFF"); T("Please hold", 117, y+16.5, 5.5, "#2B3157", "center", 600);
    R(146,y+10,22,10,"#7B8DA6"); R(146,y+13,22,1,"#5D6E86"); R(146,y+16,22,1,"#5D6E86"); R(156,y+11,2,1,"#E6ECF4"); R(156,y+14,2,1,"#E6ECF4"); R(156,y+17,2,1,"#E6ECF4");
  } else if (t === "actuary"){
    for (let gx = 94; gx < 172; gx += 6) R(gx,y+10,1,11,"rgba(75,227,154,.2)");
    R(94,y+20,78,1,"rgba(75,227,154,.35)");
    for (let x = 96; x < 170; x++){ const v = Math.exp(-Math.pow((x-133)/12, 2)); R(x, Math.round(y+19 - v*9), 1, 1, "#4BE39A"); }
  } else if (t === "marketing"){
    R(96,y+9,64,13,"#FFD23F"); R(96,y+9,64,1,"#E0628F"); R(96,y+21,64,1,"#E0628F");
    R(100,y+12,5,5,"#9AA3B5"); R(100,y+11,5,2,"#E8452C"); R(105,y+14,2,1,"#FF9F1C"); R(103,y+13,1,1,"#111");
    T("Long lunch?", 134, y+18, 6, "#2B2D52", "center", 700);
    for (let k = 0; k < 6; k++) R(Math.round(36 + hash(k,1)*50), Math.round(y+10 + hash(k,2)*8), 1, 1, ["#FFD23F","#4BE39A","#7FD3F7","#FFFFFF"][k%4]);
  } else if (t === "legal"){
    R(92,y+9,80,13,"#6B4A2B"); R(92,y+15,80,1,"#4E3520"); R(92,y+21,80,1,"#4E3520");
    const pal = ["#8B2E2E","#2E4A8B","#2E7A4A","#C9A227","#5E2E7A","#E0E0D0"];
    for (let x = 94, k = 0; x < 170; x += 3, k++){
      const h1 = 4 + Math.floor(hash(k,1)*2), h2 = 4 + Math.floor(hash(k,2)*2);
      R(x, y+15-h1, 2, h1, pal[Math.floor(hash(k,3)*6)]); R(x, y+21-h2, 2, h2, pal[Math.floor(hash(k,4)*6)]);
    }
  } else if (t === "breakroom"){
    R(34,y+24,14,11,"#6B4A2B"); R(33,y+23,16,2,"#8A6A4A"); R(37,y+17,1,6,"#FFD23F"); R(43,y+17,1,6,"#FFD23F"); R(36,y+16,3,1,"#C9A227"); R(42,y+16,3,1,"#C9A227"); R(39,y+20,3,3,"#E8A33B"); R(39,y+20,3,1,"#FFFFFF");
    if (Math.floor(time*2)%2) R(40,y+21,1,1,"#FFF3C4");
    R(92,y+10,32,10,"#FFFFFF"); T("Mind the gap", 108, y+17, 4.5, "#2B3157", "center", 600);
    R(84,y+23,34,5,"#4A5BC0"); R(84,y+27,34,8,"#5A6FD6"); R(82,y+25,3,10,"#4A5BC0"); R(117,y+25,3,10,"#4A5BC0");
    R(132,y+29,6,6,"#C96A3A"); R(130,y+21,10,8,"#3FA05A"); R(133,y+18,4,4,"#56C46E");
    R(152,y+12,16,23,"#E8F0F7"); R(152,y+20,16,1,"#B8C4D0"); R(165,y+14,1,4,"#8A96A8"); R(165,y+22,1,6,"#8A96A8");
  } else if (t === "ir"){
    R(94,y+9,56,14,"#FFFFFF"); R(94,y+9,56,1,"#6E86E0");
    const pts = [0,1,1,3,2,5,6,6,9,11];
    for (let k = 0; k < pts.length-1; k++){
      const x0 = 97 + k*5, y0 = y+21-pts[k], y1 = y+21-pts[k+1];
      for (let s = 0; s <= 5; s++) R(x0+s, Math.round(y0 + (y1-y0)*s/5), 1, 1, "#2FB879");
    }
    R(143,y+10,3,1,"#2FB879"); R(144,y+9,1,3,"#2FB879");
    R(156,y+25,12,10,"#4A3C75"); R(155,y+24,14,2,"#FFD23F"); R(161,y+20,1,4,"#222"); R(160,y+19,3,2,"#444");
  }
}
function drawLobby(L){
  const y = L.lobbyY;
  R(28,y,146,40,"#F2EDE2"); for (let x = 30; x < 174; x += 6) R(x,y+3,1,23,"rgba(150,160,190,.16)");
  R(28,y,146,2,"#C9A54A"); R(28,y+2,146,1,"#2E3B5E");
  R(28,y+26,146,12,"#2E3B5E"); R(28,y+26,146,1.2,"#E8D08A"); R(28,y+27.2,146,0.6,"#283350");
  for (let x = 30; x < 172; x += 14){ R(x,y+29,11,7,"#34426A"); R(x,y+29,11,0.6,"#C9A54A"); R(x,y+35.4,11,0.6,"#283350"); }
  for (let x = 28, k = 0; x < 174; x += 6, k++){ R(x,y+40,6,4,k % 2 ? "#E9E4D8" : "#D3CDBF"); R(x+1+(k*3)%4,y+41+(k%2),3,0.4,"rgba(140,135,150,.45)"); }
  R(28,y+40,146,0.7,"#E8D08A");
  R(64,y+38.6,74,1.6,"#24305A"); R(64,y+38.6,74,0.5,"#C9A54A"); for (let x = 66; x < 138; x += 4) R(x,y+39.2,2,0.6,"#E3C064");
  R(28,y+9,15,31,"#B8923A"); R(30,y+11,11,29,"#BFE3F2"); R(35,y+11,1,29,"#B8923A"); R(31,y+13,2,10,"rgba(255,255,255,.65)"); R(39,y+25,1,3,"#E8D08A");
  R(29,y+3,13,6,"#D9443A"); R(29,y+3,13,0.6,"#F07A6A"); T("Open", 35.5, y+7.8, 4.2, "#FFF6E2", "center", 700);
  umbrella(100, y+5, true);
  R(58,y+4,14,1,"#6B4A2B"); R(64,y+5,1,2,"#6B4A2B");
  T("The Room", 100, y+23.5, 7.5, "#1F2A44", "center", 700);
  R(117,y+7,30,13,"#283350"); R(118,y+8,28,11,"#FFF4D6"); R(118,y+8,28,0.6,"#E6D2AE");
  T("Now serving", 132, y+12.6, 4, "#1F2A44", "center", 600);
  const ns = S.claims.length ? S.claims[0].id : S.claimId;
  T("#"+ns, 132, y+18, 5.5, "#C0392B", "center", 700);
  R(45,y+33,8,7,"#C86A3A"); R(45,y+33,8,1,"#E08A5A"); R(43,y+25,12,8,"#3E8A3A"); R(46,y+21,6,5,"#5DB04A"); R(47,y+22,2,2,"#8ED66A"); R(44,y+27,2,2,"#5DB04A");
  person(162, y+33, REC, -1, -1, Math.floor(time*1.5)%2);
  R(151,y+27,22,13,"#2E3B5E"); R(150,y+26,24,2,"#C9A54A"); R(150,y+26,24,0.6,"#F4F1EA"); R(153,y+30,18,8,"#46526E"); T("Claims", 162, y+35.8, 5.2, "#FFF1D0", "center", 700);
  roomLighting(y, null, 40);
  R(28, y+40, 146, 0.6, "rgba(255,240,200,.5)");
  if (S.claims.length > 6){ R(46,y+12,30,8,"#C0392B"); T(`+${S.claims.length-6} waiting`, 61, y+17.5, 4.5, "#FFF6E2", "center", 700); }
}
function drawShaftStatic(L){
  const top = L.ph ? TOP : L.floorsTop, bot = L.lobbyY + 40;
  R(174,top,18,bot-top,"#6E4428"); for (let yy = top; yy < bot; yy += 4) for (let xx = 174; xx < 192; xx += 6) R(xx + ((yy/4|0) % 2)*3, yy, 5.4, 3.4, "#2A3552");
  R(182,top,1,bot-top,"#1E2238"); R(185,top,1,bot-top,"#1E2238"); R(183,top,2,bot-top,"#141A2C");
  for (let i = 0; i < L.n; i++){ const y = floorY(L,i); R(174,y+14,1.4,24,"#C9A54A"); R(175.4,y+14,0.6,24,"#1F2A44"); }
  R(174,L.lobbyY+16,1.4,24,"#C9A54A");
  for (let i = 0; i < L.n; i++){ const y = floorY(L,i); R(24,y+38,172,2,"#1F2A44"); R(24,y+38,172,0.6,"#2E3B5E"); }
  R(24,top,4,L.groundY-top,"#4C6683"); R(192,top,4,L.groundY-top,"#4C6683");
  R(26,top,1,L.groundY-top,"#8FB3CC"); R(194,top,1,L.groundY-top,"#8FB3CC");
  R(24,top,172,1,"#2E3B55");
}

/* The penthouse: more luxuries appear at each level. */
function drawPenthouse(y){
  const f = S.floors.find(x => x.type === "penthouse"), lvl = f ? f.level : 1;
  for (const wx of [34, 76]){ R(wx, y+5, 36, 20, "#1F2A44"); R(wx+1, y+6, 34, 18, "#9CC9E6"); R(wx+1, y+6, 34, 6, "#BFE0F2");
    for (let k = 0; k < 6; k++){ const h = 4 + hash(k, wx)*9; R(wx + 2 + k*5.5, y + 24 - h, 4.5, h, "#7FA3C0"); }
    R(wx + 17, y+6, 1, 18, "#1F2A44"); R(wx+1, y+15, 34, 0.6, "rgba(31,42,68,.4)"); }
  R(118, y+31, 36, 2, "#8E2A3A"); R(118, y+31, 36, 0.6, "#E3C064");
  R(124, y+22, 26, 6, "#24305A"); R(122, y+20, 4, 10, "#24305A"); R(148, y+20, 4, 10, "#24305A"); R(124, y+22, 26, 1, "#3A4A7A"); R(126, y+28, 2, 3, "#1F2238"); R(146, y+28, 2, 3, "#1F2238");
  R(130, y+29, 14, 1.2, "#C9A54A"); R(134, y+26.6, 2, 2.4, "#F7F2E6"); R(138, y+27, 2, 2, "#3E9B4F");
  if (lvl >= 2){ R(157, y+22, 14, 5, "#141418"); R(157, y+20, 6, 2, "#141418"); R(158, y+27, 1, 8, "#141418"); R(169, y+27, 1, 8, "#141418"); for (let k = 0; k < 6; k++) R(158 + k*2, y+26, 1, 1, "#F7F2E6"); }
  if (lvl >= 3){ R(100, y+14, 14, 12, "#1F2A44"); R(101, y+15, 12, 10, "#3E8FBF"); const fx = 102 + (Math.sin(time*1.5)*0.5 + 0.5)*8; R(fx, y+19, 2, 1, "#E39A2C"); R(fx + 2, y+19, 1, 1, "#E39A2C"); R(108 - (Math.sin(time*1.1)*0.5 + 0.5)*5, y+22, 2, 1, "#F2C14E"); R(101, y+23, 12, 2, "#C9B07A"); R(103, y+21, 1, 2, "#3E9B4F"); R(101, y+26, 12, 8, "#2B3352"); }
  if (lvl >= 4){ R(120, y+6, 10, 8, "#C9A54A"); R(121, y+7, 8, 6, "#B23A3A"); R(123, y+9, 4, 2, "#F2C14E"); R(134, y+6, 12, 9, "#C9A54A"); R(135, y+7, 10, 7, "#2F6FE4"); R(137, y+10, 6, 3, "#F7F2E6"); R(150, y+7, 8, 8, "#C9A54A"); R(151, y+8, 6, 6, "#3E9B4F"); }
  if (lvl >= 5){ R(100, y+1, 1, 4, "#C9A54A"); R(96, y+5, 9, 2, "#E3C064"); for (let k = 0; k < 4; k++) R(96 + k*2.5, y+7, 1, 2, "#FFF6D0"); R(72, y+18, 1.5, 12, "#2B3352"); R(70, y+16, 6, 3, "#C9A54A"); R(75, y+15, 3, 1.4, "#C9A54A"); }
  T("PENTHOUSE", 103, y+35.4, 3.6, "rgba(31,42,68,.45)", "center", 700);
}

/* ---------- cities: New York and Hamilton, Bermuda (London uses the original art) ---------- */
function cityId(){ return (typeof S !== "undefined" && S && S.city) || "london"; }
function roofSign(base, x0, w, night){
  R(x0, base-9, w, 9, "#1F2A44"); R(x0, base-8, w, 7, "#2E3B5E"); R(x0, base-8, w, 0.6, "#C9A54A"); R(x0, base-9, w, 1, "#F2C14E");
  for (let i = 0; i < Math.floor(w/6); i++) R(x0 + 2 + i*6, base-1, 2, 1, (Math.floor(time*3) + i) % 2 ? "#FFE9A8" : "#7A5A28");
  const nm = companyName(); let fs = 7.2; ctx.font = `700 ${fs*1.08}px "Chakra Petch","Pixelify Sans","Trebuchet MS",sans-serif`;
  while (fs > 4.5 && ctx.measureText(nm).width > w - 14){ fs -= 0.2; ctx.font = `700 ${fs*1.08}px "Chakra Petch","Pixelify Sans","Trebuchet MS",sans-serif`; }
  T(nm, x0 + w/2, base-2, fs, "#FFE9A8", "center", 700);
}
/* the Metropolitan Life Insurance Company Tower: white marble campanile, four clock faces, pyramid roof, gold lantern */
function roofNYC(L){
  const base = TOP, night = isNight(), x0 = 10, x1 = 210, w = x1 - x0, marble = night ? "#B8B4AC" : "#EEEAE0", sh = night ? "#8E8A82" : "#D2CDC0";
  R(x0, base-31, w, 22, marble); for (let x = x0 + 4; x < x1; x += 10) R(x, base-31, 2, 22, sh); R(x0, base-31, w, 1.4, "#C9A54A");
  const cx = 110, cy = base-20, now = new Date(), hr = (now.getHours() % 12 + now.getMinutes()/60)/12*Math.PI*2, mn = now.getMinutes()/60*Math.PI*2;
  ctx.fillStyle = "#C9A54A"; ctx.beginPath(); ctx.arc(cx, cy, 9.5, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = night ? "#FFF2C8" : "#FBF8F0"; ctx.beginPath(); ctx.arc(cx, cy, 8.3, 0, Math.PI*2); ctx.fill();
  for (let k = 0; k < 12; k++){ const a = k/12*Math.PI*2; R(cx + Math.sin(a)*7 - 0.4, cy - Math.cos(a)*7 - 0.4, 0.8, 0.8, "#1F2A44"); }
  ctx.strokeStyle = "#1F2A44"; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(hr)*4.5, cy - Math.cos(hr)*4.5); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(mn)*6.5, cy - Math.cos(mn)*6.5); ctx.stroke();
  for (const ox of [40, 180]){ R(ox - 4, base-27, 8, 12, sh); R(ox - 3, base-26, 6, 10, night ? "#FFE18A" : "#9CC9E6"); ctx.fillStyle = sh; ctx.beginPath(); ctx.arc(ox, base-26, 3, Math.PI, 0); ctx.fill(); }
  ctx.fillStyle = night ? "#6E7A6E" : "#8FA89A"; ctx.beginPath(); ctx.moveTo(x0 + 6, base-31); ctx.lineTo(cx, base-40); ctx.lineTo(x1 - 6, base-31); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.18)"; ctx.beginPath(); ctx.moveTo(x0 + 6, base-31); ctx.lineTo(cx, base-40); ctx.lineTo(cx, base-31); ctx.closePath(); ctx.fill();
  R(cx - 3, base-42, 6, 3, "#E3C064"); R(cx - 1, base-44, 2, 2, night ? "#FFF2A8" : "#F2DC8E");
  if (night){ const g = ctx.createRadialGradient(cx, base-43, 0, cx, base-43, 10); g.addColorStop(0, "rgba(255,236,160,.6)"); g.addColorStop(1, "rgba(255,236,160,0)"); ctx.fillStyle = g; ctx.fillRect(cx - 10, base-44, 20, 12); }
  roofSign(base, x0, w, night);
}
/* a Front Street office in Hamilton: pastel stucco and the white stepped roof Bermuda is known for */
function roofBermuda(L){
  const base = TOP, night = isNight(), x0 = 10, x1 = 210, w = x1 - x0, white = night ? "#D8D8E0" : "#FBFBF6", step = night ? "#B8B8C4" : "#E2E2DA";
  for (let k = 0; k < 6; k++){ const inset = 6 + k*12, y = base - 12 - k*4.5; R(x0 + inset, y, w - inset*2, 4.5, white); R(x0 + inset, y + 3.6, w - inset*2, 0.9, step); }
  R(x0 + 84, base - 41, 32, 3, white);
  R(38, base - 34, 7, 14, white); R(37, base - 35, 9, 2, step); R(175, base - 34, 7, 14, white); R(174, base - 35, 9, 2, step);
  R(x0 + 2, base - 13, w - 4, 1.2, step);
  roofSign(base, x0, w, night);
}
function facadeAlt(L){
  const night = isNight(), top = TOP, bot = L.groundY, ny = cityId() === "nyc";
  const wall = ny ? (night ? "#B4B0A8" : "#ECE8DE") : (night ? "#C68C9C" : "#F4B8C4"), wallD = ny ? (night ? "#8E8A82" : "#CFC9BB") : (night ? "#A87080" : "#E49AAA");
  for (const [x0, x1] of [[10, 24], [196, 210]]){
    R(x0, top, x1 - x0, bot - top, wall);
    if (ny){ R(x0 + 2, top, 1.5, bot - top, wallD); R(x1 - 3.5, top, 1.5, bot - top, wallD); }
    else { for (let y = top; y < bot; y += 6){ R(x0, y, 3, 3, "#FBFBF6"); R(x1 - 3, y + 3, 3, 3, "#FBFBF6"); } }
    for (let i = 0; i < L.n; i++){ const y = floorY(L, i); const lit = night && hash(i, x0) > 0.35;
      if (ny){ R(x0 + 5, y + 10, 4, 12, wallD); R(x0 + 5.5, y + 11, 3, 10.5, lit ? "#FFE18A" : "#7FA3C0"); ctx.fillStyle = wallD; ctx.beginPath(); ctx.arc(x0 + 7, y + 11, 2, Math.PI, 0); ctx.fill(); if (i % 4 === 3) R(x0, y + 1, x1 - x0, 1.2, "#C9A54A"); }
      else { R(x0 + 4, y + 12, 6, 12, "#FBFBF6"); R(x0 + 5, y + 13, 4, 10, lit ? "#FFE18A" : "#7FB8D0"); R(x0 + 2.5, y + 12, 1.5, 12, "#3E9B6A"); R(x0 + 10, y + 12, 1.5, 12, "#3E9B6A"); } }
    R(x0, L.lobbyY, x1 - x0, bot - L.lobbyY, ny ? wallD : "#FBFBF6");
    if (ny) for (let y = L.lobbyY + 3; y < bot; y += 5) R(x0, y, x1 - x0, 0.6, "rgba(0,0,0,.12)");
  }
  for (let i = 0; i < L.n; i++){ const y = floorY(L, i); R(24, y + 38, 172, 2, ny ? "#D2CDC0" : "#FBFBF6"); }
}
function skylineNYC(L){
  const gy = L.groundY, night = isNight(), far = night ? "#272D52" : "#A9B6C8", mid = night ? "#1E2446" : "#8A9AB2", near = night ? "#161B38" : "#6E809A", lit = "#FFE88A";
  for (let x = 0, k = 0; x < 256; k++){ const w = 6 + Math.floor(hash(k, 41)*10), h = 18 + Math.floor(hash(k, 42)*44); R(x, gy - h, w, h, far); if (night && hash(k, 43) > .4) R(x + 2, gy - h + 4, 1, 1, lit); x += w; }
  // the Empire State Building
  const ex = 52; R(ex - 10, gy - 70, 20, 70, mid); R(ex - 7, gy - 86, 14, 16, mid); R(ex - 4, gy - 98, 8, 12, mid); R(ex - 2, gy - 106, 4, 8, mid); R(ex - 0.5, gy - 122, 1, 16, mid);
  for (let y = gy - 66; y < gy - 4; y += 4) for (let x = ex - 8; x < ex + 8; x += 3) if (night ? hash(x, y) > .5 : hash(x, y) > .85) R(x, y, 1, 2, night ? lit : "#C8D6E4");
  // the Chrysler Building's crown
  const cx = 196; R(cx - 8, gy - 74, 16, 74, mid); for (let k = 0; k < 5; k++){ const w = 7 - k*1.3, y = gy - 76 - k*5; ctx.fillStyle = night ? "#3A4470" : "#B8C4D4"; ctx.beginPath(); ctx.arc(cx, y, w, Math.PI, 0); ctx.fill(); for (let a = 0; a < 5; a++) R(cx - w + 1 + a*(w*2 - 2)/4, y - 1, 0.7, 1.6, night ? "#FFE88A" : "#E8EEF4"); }
  R(cx - 0.5, gy - 110, 1, 12, night ? "#B8C4D4" : "#D8E0EA");
  // One World Trade Center
  ctx.fillStyle = near; ctx.beginPath(); ctx.moveTo(228, gy); ctx.lineTo(232, gy - 96); ctx.lineTo(240, gy - 96); ctx.lineTo(244, gy); ctx.closePath(); ctx.fill(); R(235.5, gy - 116, 1, 20, near);
  // water towers on the low roofs
  for (const [wx, wh] of [[96, 34], [128, 30], [160, 38]]){ R(wx - 9, gy - wh, 18, wh, near); R(wx - 3, gy - wh - 7, 6, 6, night ? "#3A2E2A" : "#8A6A4A"); ctx.fillStyle = night ? "#3A2E2A" : "#8A6A4A"; ctx.beginPath(); ctx.moveTo(wx - 3.5, gy - wh - 7); ctx.lineTo(wx, gy - wh - 10); ctx.lineTo(wx + 3.5, gy - wh - 7); ctx.fill(); R(wx - 2, gy - wh - 1, 0.6, 1, near); R(wx + 1.4, gy - wh - 1, 0.6, 1, near); }
  // the Statue of Liberty, far off
  R(10, gy - 14, 8, 14, mid); R(12.5, gy - 26, 3, 12, night ? "#3E6A60" : "#7FB8A8"); R(13, gy - 29, 2, 3, night ? "#3E6A60" : "#7FB8A8"); R(15, gy - 33, 1, 6, night ? "#3E6A60" : "#7FB8A8"); R(14.5, gy - 35, 2, 2, night ? "#FFE88A" : "#F2C14E");
  ctx.globalCompositeOperation = "source-atop"; const hz = ctx.createLinearGradient(0, gy - 160, 0, gy); hz.addColorStop(0, "rgba(255,255,255,0)"); hz.addColorStop(1, night ? "rgba(30,36,80,.3)" : "rgba(226,233,241,.4)"); ctx.fillStyle = hz; ctx.fillRect(0, gy - 160, 256, 160); ctx.globalCompositeOperation = "source-over";
}
function skylineBermuda(L){
  const gy = L.groundY, night = isNight();
  // the harbour and the islands across it
  R(0, gy - 26, 256, 26, night ? "#1E3A5A" : "#3EC0C8"); R(0, gy - 26, 256, 1, night ? "#3A5A7A" : "#9FE8EC");
  for (let k = 0; k < 14; k++) R(hash(k, 3)*256, gy - 24 + hash(k, 4)*20, 6, 0.6, "rgba(255,255,255,.45)");
  ctx.fillStyle = night ? "#1E3A2E" : "#5DA85A"; ctx.beginPath(); ctx.moveTo(0, gy - 26); for (let x = 0; x <= 256; x += 4) ctx.lineTo(x, gy - 30 - Math.sin(x*0.035)*10 - Math.sin(x*0.09)*4); ctx.lineTo(256, gy - 26); ctx.closePath(); ctx.fill();
  const pastel = ["#F4B8C4","#F2D98A","#9CCFE6","#B8E0B0","#F7F2E6","#D8B8E8"];
  for (let k = 0; k < 22; k++){ const x = 4 + k*11.5, base = gy - 28 - Math.sin(x*0.035)*10 - Math.sin(x*0.09)*4;
    R(x, base - 6, 8, 6, night ? "#4A4A62" : pastel[k % 6]); for (let s = 0; s < 3; s++) R(x - 0.5 + s, base - 7.5 - s*1.2, 9 - s*2, 1.4, night ? "#9A9AB0" : "#FBFBF6");
    if (night && hash(k, 7) > .4) R(x + 3, base - 4, 1.5, 1.5, "#FFE18A"); }
  // Gibbs Hill lighthouse
  R(28, gy - 66, 6, 30, night ? "#C8C8D0" : "#F7F2E6"); R(27, gy - 70, 8, 4, "#1F2A44"); R(29, gy - 73, 4, 3, night ? "#FFF2A8" : "#E3C064");
  if (night){ ctx.fillStyle = "rgba(255,240,170,.18)"; ctx.beginPath(); ctx.moveTo(31, gy - 71); const a = time*1.2; ctx.lineTo(31 + Math.cos(a)*60, gy - 71 + Math.sin(a)*8 - 6); ctx.lineTo(31 + Math.cos(a)*60, gy - 71 + Math.sin(a)*8 + 6); ctx.fill(); }
  // the cathedral tower
  R(122, gy - 62, 12, 36, night ? "#6A6A7A" : "#C8C0AE"); for (let k = 0; k < 4; k++) R(121 + k*4, gy - 66, 2, 4, night ? "#6A6A7A" : "#C8C0AE"); R(126, gy - 54, 4, 8, night ? "#2A2A3A" : "#5A6E8A");
  // a cruise ship in the harbour
  R(170, gy - 18, 56, 8, "#FBFBF6"); R(174, gy - 24, 44, 6, "#FBFBF6"); R(180, gy - 28, 30, 4, "#FBFBF6"); R(170, gy - 11, 56, 1.4, "#1F2A44"); R(204, gy - 33, 4, 5, "#2F6FE4");
  for (let x = 176; x < 216; x += 4) R(x, gy - 21, 2, 1.4, night ? "#FFE18A" : "#7FA3C0");
}
function bermudaPalms(gy){ for (const x of [6, 54, 214]){ for (let i = 0; i < 22; i++) R(x + Math.sin(i*0.08)*3, gy - i, 1.6, 1, i % 3 ? "#A8824E" : "#8E6A3E"); for (let f = 0; f < 6; f++){ const a = f/6*Math.PI*2 + Math.sin(time*1.4 + x)*0.08; for (let k = 0; k < 9; k++) R(x + 2 + Math.cos(a)*k, gy - 22 + Math.sin(a)*k*0.5 + k*k*0.04, 1.4, 1.2, k < 5 ? "#3E8A3A" : "#5DB04A"); } } }
function nycStreet(gy, night){ R(30, gy - 6, 3, 6, "#B23A3A"); R(29.5, gy - 7, 4, 1.5, "#B23A3A"); R(204, gy - 10, 14, 7, "#C0C4CC"); R(203, gy - 13, 16, 3, "#E39A2C"); R(205, gy - 3, 2, 3, "#2B2D3A"); R(214, gy - 3, 2, 3, "#2B2D3A"); for (let k = 0; k < 3; k++) R(120 + k*0.6, gy + 6 - ((time*0.6 + k*0.3) % 1)*12, 4, 3, "rgba(240,240,245,.35)"); }
