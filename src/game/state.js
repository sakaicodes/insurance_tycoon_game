/* game/state.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
/* ---------- State ---------- */
function blankQ(){ return {prem:0, paid:0, sal:0, other:0}; }
function newGlobalId(){ return Date.now().toString(36) + Math.random().toString(36).slice(2, 12); }
function newState(){
  return {v:1, globalId:newGlobalId(), cash:250, happy:70, stock:10, hist:[10], quarter:1, qt:0,
    floors:[{type:"sales", level:1, mode:"pay"}], claims:[], q:blankQ(), lastProfit:null,
    buffs:{sales:0, morale:0, surge:0}, aiHype:false, nextClaim:6, nextEvent:38,
    lawsuits:[], returns:[], yachts:0, insured:0, rankIdx:0, won:false, over:false, seen:false,
    claimId:1, lastEvent:null, tipClaim:false, warnedNeg:false, served:0,
    sued:0, bestProfit:0, streak:0, bestStreak:0, recentEv:[], recentInc:[], recentNm:[],
    diff:1, conf:60, strikes:0, cleanQ:0, cleanRun:0, stars:0, favour:0, perks:{}, ach:{}, earned:0, repSum:0, repT:0, profHist:[], loan:null, lastCall:-9, tipAuto:false, price:1, cyc:0, cycName:null, execs:{}, savedAt:0, invRisk:0, invLast:0, prQ:0, runId:0, unlocked:{}, divQ:0,
    cover:{cat:false, cyber:false, dno:false, event:false}, swan:null, swansSurvived:0, best3:false};
}
function ensureState(){
  if (!S.globalId) S.globalId = newGlobalId();
  if (S.floors && S.floors.filter(f => f.type === "penthouse").length){
    const ph = S.floors.find(f => f.type === "penthouse"); S.floors = S.floors.filter(f => f.type !== "penthouse"); S.floors.push(ph); S.penthouseBought = true;
  }
  const d = newState();
  for (const k of ["diff","conf","strikes","cleanQ","cleanRun","stars","favour","perks","ach","cover","swansSurvived","best3","earned","repSum","repT","profHist","lastCall","tipAuto","price","cyc","divQ","execs","invRisk","invLast","prQ","unlocked"]) if (S[k] == null) S[k] = d[k];
  if (S.swan === undefined) S.swan = null;
  if (S.loan === undefined) S.loan = null;
  for (const f of S.floors) S.unlocked[f.type] = true;
}
function load(){ try{ const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v === 1) return s; }catch(e){} return null; }
const PENTHOUSE_COST = 20, PENTHOUSE_UP = 6;
function fSpec(f){ return f.spec || (f.type === "sales" ? "property" : f.type === "actuary" ? "capital" : null); }
function lvSpec(type, spec){ let n = 0; for (const f of S.floors) if (f.type === type && fSpec(f) === spec) n += f.level; return n; }
function floorName(f){ const sp = fSpec(f); if (f.type === "sales") return LINES[sp].name + " Underwriting"; if (f.type === "actuary") return ACT_SPECS[sp].name + " Actuaries"; return TYPES[f.type].name; }
function bookMix(){ const m = {}; let tot = 0; for (const f of S.floors) if (f.type === "sales"){ const k = fSpec(f), w = salesFloorRate(f.level)*LINES[k].rate; m[k] = (m[k] || 0) + w; tot += w; } for (const k in m) m[k] /= tot || 1; return m; }
function mixAvg(field){ const m = bookMix(); let v = 0, any = false; for (const k in m){ v += m[k]*LINES[k][field]; any = true; } return any ? v : 1; }
function bookExposure(kind){ const m = bookMix(); let v = 0, any = false; for (const k in m){ v += m[k]*(LINES[k].swans[kind] != null ? LINES[k].swans[kind] : 0.8); any = true; } return any ? Math.max(0.3, v) : 1; }
function swanExposure(kind){ return bookExposure(kind)*cityRisk(kind); }
function pickSwan(){ const w = {}; for (const k of SWAN_POOL) w[k] = (w[k] || 0) + 1; let tot = 0; for (const k in w){ w[k] *= cityRisk(k); tot += w[k]; }
  let r = Math.random()*tot; for (const k in w){ r -= w[k]; if (r <= 0) return k; } return SWAN_POOL[0]; }
function swanCulprit(kind){ const m = bookMix(); let best = null, bv = -1; for (const k in m){ const v = m[k]*(LINES[k].swans[kind] || 0.8); if (v > bv){ bv = v; best = k; } } return best; }
function lineUnlocked(k){ return !LINES[k].unlock || S.rankIdx >= LINES[k].unlock; }
function autoSpec(type){
  if (type === "sales"){ const own = k => S.floors.filter(f => f.type === "sales" && fSpec(f) === k).length; const opts = Object.keys(LINES).filter(lineUnlocked); return opts.sort((a, b) => own(a) - own(b) || Math.random() - 0.5)[0]; }
  if (type === "actuary"){ const own = k => S.floors.filter(f => f.type === "actuary" && fSpec(f) === k).length; return Object.keys(ACT_SPECS).sort((a, b) => own(a) - own(b))[0]; }
  return undefined;
}
function moodPct(){ return Math.round((happyMult() - 1)*100); }
function hasPenthouse(){ return S.floors.some(f => f.type === "penthouse"); }
function workFloors(){ return S.floors.length - (hasPenthouse() ? 1 : 0); }
let lastAddedFloor = -1;
function addFloor(f){ const ph = S.floors.findIndex(x => x.type === "penthouse"); const i = ph >= 0 ? ph : S.floors.length; S.floors.splice(i, 0, f);
  if (ph >= 0){ W.splice(i, 0, []); popT.splice(i, 0, 0); } lastAddedFloor = i; return i; }
function cityName(){ return (CITIES[cityId()] || CITIES.london).name; }
function companyName(){ return (S && S.companyName) || "Fine Print Syndicate"; }
function coName(){ return esc(companyName()); }
function ceoName(){ return (S && S.ceo && S.ceo.name) || "the CEO"; }
function ceoN(){ return esc(ceoName()); }
const HAIR_SPRITE = {short:0, pixie:0, cap:0, windswept:0, crew:0, sidepart:0, bob:1, long:1, ponytail:2, bun:3, manbun:3, curly:4, braids:5, bald:6, scarf:7, quiff:8};
function ceoLook(c){
  c = c || (S && S.ceo) || {}; const at = c.attire || "tie", outfit = c.outfit || OUTFITS[0];
  const skirt = at === "skirt" ? "#2B3352" : at === "dress" ? outfit : null;
  return {skin:c.skin || SKINS[2], hair:c.hair || HAIRS[0], shirt:outfit, pants:skirt ? "#3A3048" : "#2B3352", skirt, style:HAIR_SPRITE[c.hairStyle] || 0,
    tie:at === "tie" || at === "three" ? "#F2C14E" : null, blouse:["blouse","skirt","trouser","open"].includes(at), earrings:!!c.earrings, glasses:!!c.glasses, hat:c.hairStyle === "cap",
    scarf:c.hairStyle === "scarf" ? shade(outfit, -0.15) : null, beard:c.facial === "beard" ? (c.hair || HAIRS[0]) : null, mo:c.facial === "moustache" ? (c.hair || HAIRS[0]) : null};
}
function save(){ try{ S.savedAt = Date.now(); localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
let S = load() || newState();
ensureState();
