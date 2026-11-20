/* data/daily.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
/* Daily challenges: everything about a day's challenge comes from the UTC date, so every player gets the same one
   and nothing needs to be published. Add twists or objectives here and they join the rotation automatically. */
const DAILY_Q = 12, DAILY_KEY = "fineprint-daily-run", DAILY_BEST_KEY = "fineprint-daily-best";
const DAILY_FORMATS = {
  fixed:{name:"Fixed length", cls:"dc-fixed", goal:"Survive 12 quarters and finish with the highest score.", ranks:"Ranked by final score"},
  race:{name:"Race to a target", cls:"dc-race", goal:"Make {target} in total profit as fast as you can, within 12 quarters.", ranks:"Ranked by fewest quarters"},
  objective:{name:"Daily objective", cls:"dc-objective", goal:"12 quarters, highest score wins. Objective: {objective} for a 1.5× score bonus.", ranks:"Ranked by score, with bonus"},
};
const DAILY_TWISTS = {
  hurricanes:{name:"Hurricane season starts early", desc:"A hurricane is on its way in the first year."},
  litigation:{name:"Litigation boom", desc:"Claimants sue twice as often.", mods:{sue:2}},
  cheapre:{name:"Cheap reinsurance", desc:"Your own insurance costs half as much, but disasters hit 30% harder.", mods:{cover:0.5, swan:1.3}},
  softmarket:{name:"Soft market", desc:"Premiums are 15% lower all game.", mods:{prem:0.85}},
  tightboard:{name:"Tight-fisted board", desc:"The City expects 25% more profit every quarter.", mods:{expect:1.25}},
  richstart:{name:"Generous backers", desc:"You start with three times the cash."},
  happy:{name:"Customers love you", desc:"Customer mood starts at 90%."},
  treaty:{name:"Treaty only", desc:"Your underwriters may only write Treaty Reinsurance."},
};
const DAILY_OBJECTIVES = {
  mood:{name:"finish with customer mood above 70%", test:() => S.happy >= 70},
  lines:{name:"write at least three different lines of business", test:() => Object.keys(bookMix()).length >= 3},
  clean:{name:"finish without a single regulator warning", test:() => !(S.strikesEver > 0)},
  covers:{name:"hold at least two of your own covers at the end", test:() => Object.keys(COVERS).filter(k => S.cover && S.cover[k]).length >= 2},
  floors:{name:"end with at least six floors", test:() => workFloors() >= 6},
};
const DAILY_TARGETS = [40000, 55000, 70000];
function dailyDate(d){ return (d || new Date()).toISOString().slice(0, 10); }
function dailyRng(str){ let h = 2166136261; for (let i = 0; i < str.length; i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0)/4294967296; }; }
function dailySpec(day){
  const r = dailyRng("fine-print-daily:" + day), pickR = a => a[Math.floor(r()*a.length)];
  const format = pickR(Object.keys(DAILY_FORMATS)), city = pickR(Object.keys(CITIES)), twist = pickR(Object.keys(DAILY_TWISTS));
  let objective = pickR(Object.keys(DAILY_OBJECTIVES));
  if (twist === "treaty" && objective === "lines") objective = "mood";
  if (twist === "happy" && objective === "mood") objective = "clean";
  const target = pickR(DAILY_TARGETS);
  const pool = SWAN_POOL.concat(Object.keys(SWANS).filter(k => SWANS[k].city === city));
  const swans = [{q:twist === "hurricanes" ? 3 : 4 + Math.floor(r()*3), kind:twist === "hurricanes" ? "hurricane" : pickR(pool), t:12 + Math.round(r()*30)}];
  if (r() < 0.6) swans.push({q:8 + Math.floor(r()*3), kind:pickR(pool), t:12 + Math.round(r()*30)});
  return {day, format, city, twist, objective, target, swans};
}
function dailyMod(k){ const t = S.daily && DAILY_TWISTS[S.daily.twist]; return (t && t.mods && t.mods[k]) || 1; }
function dailyGoalText(spec){ return DAILY_FORMATS[spec.format].goal.replace("{target}", fmtCity(spec.target, spec.city)).replace("{objective}", DAILY_OBJECTIVES[spec.objective].name); }
function fmtCity(n, city){ const c = (CITIES[city] || CITIES.london).cur || "£", v = n >= 1e6 ? (n/1e6).toFixed(1) + "M" : n >= 1e3 ? Math.round(n/1e3) + "K" : n; return c + v; }
