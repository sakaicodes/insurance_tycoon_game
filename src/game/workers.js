/* game/workers.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
/* ---------- Runtime (not saved) ---------- */
let W = [], CUST = [], popT = [], curEvent = null;
let clouds = Array.from({length:9}, () => ({x:rand(0,256), y:rand(6,60), w:Math.round(rand(12,26)), s:rand(1.5,4)}));
let stars = Array.from({length:36}, () => ({x:Math.round(rand(0,256)), y:Math.round(rand(2,70)), b:Math.random()}));
let elev = {y:0, ty:0, wait:1, init:false};
let bell = {t:0};
let weather = {rain:true, t:22};
let drops = [];
let cars = [];

function makeLook(type){
  const t = TYPES[type];
  const alt = Math.random() < 0.5, skirt = alt && Math.random() < 0.55 ? t.pants : null;
  const tie = !alt && (type==="legal"||type==="ir"||type==="sales"||type==="compliance") ? pick(["#FF5A5F","#FFD23F","#4BE39A","#FF8FB1"]) : null;
  const hair = pick(HAIRS), style = alt ? pick([1,1,2,3,4,5,7]) : pick([0,0,0,4,1,6,8]), facial = !alt && style !== 6 || (!alt && Math.random() < 0.5) ? Math.random() : 1;
  return {skin:pick(SKINS), hair, shirt:t.shirt, pants:skirt ? "#3A3048" : t.pants, skirt, style, scarf:style === 7 ? pick(["#3E2E6A","#2B3352","#B23A3A","#3E9B4F","#2BB3B1"]) : null,
    beard:facial < 0.2 ? hair : null, mo:facial >= 0.2 && facial < 0.3 ? hair : null,
    tie, blouse:alt && !tie, earrings:alt && style !== 7 && Math.random() < 0.5,
    glasses: type==="actuary" || Math.random()<.15, hat: !alt && type==="sales" && Math.random()<.35};
}
function rebuildWorkers(i){
  const f = S.floors[i]; const n = f.type === "penthouse" ? 0 : Math.min(5, f.level + 1); const arr = [];
  const walk = f.type === "breakroom" || f.type === "ir";
  for (let k = 0; k < n; k++){
    const look = makeLook(f.type);
    if (walk){
      const lo = f.type === "ir" ? 36 : 52, hi = f.type === "ir" ? 148 : 146;
      arr.push({mode:"walk", x:rand(lo,hi), lo, hi, dir:Math.random()<.5?-1:1, sp:rand(6,12), pause:rand(0,3), look});
    } else arr.push({mode:"sit", slot:k, ph:Math.random()*10, look});
  }
  if (f.type === "marketing") arr.push({mode:"walk", percy:true, x:100, lo:36, hi:166, dir:1, sp:9, pause:0});
  W[i] = arr;
}
S.floors.forEach((f,i) => rebuildWorkers(i));

/* ---------- Layout ---------- */
const LW = 232, OX = 6, FH = 40, TOP = 82, LOBBY_H = 44, GROUND = 24;
function layout(){
  const n = S.floors.length, can = workFloors() < MAXF, ph = n > 0 && S.floors[n-1].type === "penthouse", nw = n - (ph ? 1 : 0);
  const slotY = TOP + (ph ? FH : 0);            // the penthouse sits directly under the roof, above the build slot
  const floorsTop = slotY + (can ? FH : 0);
  const lobbyY = floorsTop + nw*FH;
  const groundY = lobbyY + LOBBY_H;
  return {n, nw, ph, slotY, can, floorsTop, lobbyY, groundY, LH:groundY + GROUND};
}
function floorY(L, i){ return L.ph && i === L.n - 1 ? TOP : L.floorsTop + (L.nw-1-i)*FH; }
