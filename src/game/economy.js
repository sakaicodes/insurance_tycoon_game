/* game/economy.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
/* ---------- Economy ---------- */
function lv(t){ let s = 0; for (const f of S.floors) if (f.type === t) s += f.level; return s; }
function morale(){ return (1 + 0.08*lv("breakroom") + 0.05*lv("hr") + (S.buffs.morale > 0 ? 0.3 : 0) + (perk("espresso") ? 0.05 : 0))*(S.hrSlump > 0 ? 0.75 : 1); }
function happyMult(){ const base = clamp(1 + (S.happy - 65)*0.016, 0.25, 1.6); return 1 + (base - 1)*mixAvg("mood"); }
function salesFloorRate(level){ return 5.5*Math.pow(level,1.38); }
function exposureRate(level){ return 5.5*Math.pow(level,1.27); }
function exposure(){ let s = 0; for (const f of S.floors) if (f.type === "sales") s += exposureRate(f.level); return s*salesMult()*volume(); }
function salesMult(){ return (1 + 0.05*Math.min(4, S.tickets || 0)) * (1 + 0.35*lv("marketing") + 0.10*lv("it") + 0.05*lv("hr") + (perk("loyalty") ? 0.1 : 0)) * happyMult() * morale() * Math.max(0.5, 1 - 0.03*lv("risk") - 0.04*lv("compliance")); }
function cycleVal(){ return Math.sin(S.cyc || 0); }
function cycleName(){ const c = cycleVal(); return c > 0.35 ? "Hard market" : c < -0.35 ? "Soft market" : "Steady market"; }
function priceIdx(){ return S.price == null ? 1 : S.price; }
function marketRate(){ return PRICES[priceIdx()].p*(1 + 0.25*cycleVal()); }
function volume(){ const e = 1.0 - 0.4*cycleVal(); return Math.max(0.35, 1 - e*(PRICES[priceIdx()].p - 1)); }
function maturity(){ return Math.min(1, S.floors.reduce((a, f) => a + (f.type === "penthouse" ? 0 : f.level), 0)/70); }
function pricingBoost(){ return 1 + Math.min(0.4, 0.06*lvSpec("actuary", "pricing")); }
function baseIncome(){ let s = 0; for (const f of S.floors) if (f.type === "sales") s += salesFloorRate(f.level)*LINES[fSpec(f)].rate; return s*salesMult()*marketRate()*volume()*pricingBoost(); }
function income(){ return baseIncome() * (S.buffs.sales > 0 ? 2 : 1) * (S.outage > 0 ? 0.5 : 1); }
function salFactor(){ return 1 + 0.06*workFloors(); }
function upkeep(){ let s = 0; for (const f of S.floors) s += (TYPES[f.type].sal || 0.6)*f.level; return s*salFactor() + execCost(); }
function perk(id){ return !!(S.perks && S.perks[id]); }
function claimSizeMult(){ return (1 + 0.10*lv("marketing"))*(0.9 + 0.1*S.diff); }
function claimSpeed(){ return morale()*(1 + 0.15*lv("it")); }
function regCreep(){ return Math.floor((S.quarter - 1)/8); }
function compNeed(){ return Math.max(0, workFloors() - 3 + Math.max(0, lv("breakroom") - lv("hr")) + regCreep() + (lv("invest") && S.invRisk === 2 ? 1 : 0)); }
function isUnlocked(t){ return !UNLOCKS[t] || !!(S.unlocked && S.unlocked[t]) || S.floors.some(f => f.type === t) || UNLOCKS[t].test(); }
function checkUnlocks(){
  if (!S.unlocked) S.unlocked = {};
  for (const t of ORDER){
    const u = UNLOCKS[t]; if (!u || S.unlocked[t]) continue;
    if (S.floors.some(f => f.type === t) || u.test()){ S.unlocked[t] = true; if (S.seen){ toast(`New floor unlocked: ${TYPES[t].name}. ${u.why}`, "good"); sfx("chime"); } }
  }
}
function capReq(){
  if (S.quarter < 6) return 0;
  const ramp = Math.min(1, (S.quarter - 5)/8), annual = Math.max(0, baseIncome())*Q_LEN*4;
  const risk = (S.cover && S.cover.cat ? 0.8 : 1)*(1 - Math.min(0.4, 0.06*lvSpec("actuary", "capital")))*(lv("invest") && S.invRisk === 2 ? 1.15 : 1)*(1 + 0.1*Math.max(0, S.diff - 1));
  return Math.round(annual*(0.08 + 0.32*maturity())*risk*ramp/10)*10;
}
function capRatio(){ const r = capReq(); return r ? Math.max(0, S.cash)/r : Infinity; }
let curRival = null;
function lunchOdds(){ return Math.min(0.9, 0.4 + 0.15*lv("marketing")); }
function hrOdds(){ return Math.min(0.9, 0.5 + 0.1*lv("hr")); }
function rivalPoach(){
  const targets = S.floors.map((f, i) => ({f, i})).filter(x => (x.f.type === "sales" || x.f.type === "marketing") && x.f.level >= 2);
  if (!targets.length) return;
  const t = pick(targets), name = pick(RIVALS), cost = Math.round(B()*0.8*(1 + 0.2*Math.max(0, S.diff - 2))/10)*10;
  const who = t.f.type === "sales" ? "your best underwriters" : "your favourite brokers";
  curRival = {i:t.i, name, cost};
  sfx("warn");
  if (hasExec("cos")){ resolveRival(S.cash - cost > execBuffer() ? 0 : lv("marketing") ? 1 : 3, true); return; }
  openModal(`<h2>🦈 ${name} is poaching</h2><p>A rival syndicate is trying to hire ${who} away from your ${TYPES[t.f.type].name} (level ${t.f.level}). If they go, that floor drops a level.</p>
    <div class="choices">
      <button class="btn" data-act="rival:0" ${S.cash < cost ? "disabled" : ""}>Match their offer (${fmt(cost)})</button>
      <button class="btn ghost" data-act="rival:1" ${!lv("marketing") ? "disabled" : ""}>Take them to a long lunch (${lv("marketing") ? Math.round(lunchOdds()*100) + "% chance" : "needs Broker Lunches"})</button>
      <button class="btn ghost" data-act="rival:2" ${!lv("hr") || S.cash < cost/2 ? "disabled" : ""}>Ask HR for a retention deal (${fmt(Math.round(cost/2))}${lv("hr") ? ", " + Math.round(hrOdds()*100) + "% chance" : ", needs HR"})</button>
      <button class="btn ghost" data-act="rival:3">Let them go</button>
    </div>`, {locked:true});
}
function resolveRival(k, auto){
  const r = curRival; curRival = null; if (!r) return;
  const f = S.floors[r.i]; if (!f) return;
  let kept = false, msg;
  if (k === 0){ spend(r.cost, "other"); kept = true; msg = `You matched ${r.name}’s offer. Everyone stays, now slightly richer.`; }
  else if (k === 1){ kept = Math.random() < lunchOdds(); msg = kept ? `Four hours, three courses and a cheese trolley later, nobody remembers ${r.name}’s offer.` : `The lunch was lovely. They still left for ${r.name}.`; }
  else if (k === 2){ spend(Math.round(r.cost/2), "other"); kept = Math.random() < hrOdds(); msg = kept ? "HR found a retention bonus and a nicer chair. They’re staying." : `HR’s retention plan was a branded mug. They left for ${r.name}.`; }
  else msg = `They left for ${r.name}.`;
  if (kept) S.rivalsKept = (S.rivalsKept || 0) + 1;
  if (!kept){ f.level = Math.max(1, f.level - 1); rebuildWorkers(r.i); msg += ` Your ${TYPES[f.type].name} drops to level ${f.level}.`; }
  if (auto){ toast(`${r.name} tried to poach your staff. ${msg}`, kept ? "good" : "bad"); save(); return; }
  openModal(`<h2>🦈 ${r.name}</h2><p>${msg}</p><div class="closeRow"><button class="btn" data-act="close">Back to work</button></div>`, {locked:true, onClose:() => save()});
}
function demoRefund(f){ let c = 0; for (let l = 1; l < f.level; l++) c += TYPES[f.type].up*Math.pow(1.9, l); return Math.round((c*0.2 + buildCost()*0.05)/10)*10; }
function prDamp(){ return 1 - Math.min(0.5, 0.1*lv("pr")); }
function prCost(){ return Math.round(B()*0.6/10)*10; }
function invCap(){ return Math.round(lv("invest")*Math.max(300, income()*Q_LEN*0.3)); }
function invCapital(){ return Math.max(0, Math.min(S.cash, invCap())); }
function gauss(){ let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); }
function compHave(){ return 3*lv("compliance"); }
function compGap(){ return compNeed() - compHave(); }
function maxStrikes(){ return perk("lobbyist") ? 4 : 3; }
function growthRate(){ return Math.max(0.01, (0.06 + 0.04*S.diff + 0.02*lv("ir") - (perk("dinners") ? 0.03 : 0))*(1 - 0.85*maturity())); }
function mktName(){ return S.diff < 1.6 ? "Calm market" : S.diff < 2.3 ? "Choppy market" : S.diff < 3.1 ? "Stormy market" : S.diff < 4 ? "Brutal market" : S.diff < 5 ? "Cutthroat market" : "Feeding frenzy"; }
function actRed(){ return Math.min(0.4, 0.06*lvSpec("actuary", "reserving")); }
function buildCost(){ const n = workFloors() - 1; return Math.round(100*Math.pow(1.6, Math.min(n, 13))*Math.pow(1.25, Math.max(0, n - 13))); }
function upCost(f){ return Math.round(TYPES[f.type].up*Math.pow(1.9, f.level)); }
function claimInterval(){ return Math.max(3.5, 20/(1 + 0.12*lv("sales"))/(0.8 + 0.2*S.diff))/volume()/mixAvg("freq") * (S.buffs.surge > 0 ? 0.35 : 1); }
function B(){ return Math.max(120, Math.round(baseIncome()*25/10)*10); }
function canPay(a){ return S.cash - a >= -overdraft()*0.6; }
function overdraft(){ return Math.max(1500, baseIncome()*90); }
function buybackCost(){ return Math.round(S.stock*40); }
function bonusCost(){ return Math.round(S.stock*20 + 200); }
function goalMet(g){ return GOAL[g[0]].cur() >= g[1]; }
function goalsHtml(next){
  if (!next) return `<p>No titles left. You own the weather.</p>`;
  const rows = next.goals.map(g => { const d = GOAL[g[0]], ok = goalMet(g);
    return `<li class="${ok?"ok":""}"><i>${ok?"✓":""}</i><span>${d.label(g[1])}</span><b>${d.show(d.cur())}</b></li>`; }).join("");
  const done = next.goals.filter(goalMet).length;
  const unl = EXECS.filter(x => x.rank === RANKS.indexOf(next)).map(x => x.name);
  return `<h3>Next promotion: ${next.name} (${done} of ${next.goals.length})</h3><ul class="goals">${rows}</ul><p class="dim">Reward: +10 board confidence, +2 ★${unl.length ? `, and you can hire a ${unl.join(" and a ")}` : ""}.</p><p class="dim">All of these need to be true at the same time. The board is always watching.</p>`;
}
function pickFresh(arr, key, keep){
  if (!Array.isArray(S[key])) S[key] = [];
  let idx = arr.map((_,i) => i).filter(i => !S[key].includes(i));
  if (!idx.length) idx = arr.map((_,i) => i);
  const i = pick(idx); S[key].push(i); if (S[key].length > keep) S[key].shift();
  return arr[i];
}
function mood(d){ S.happy = clamp(S.happy + d, 0, 100); }
function spend(a, cat){ S.cash -= a; S.q[cat] += a; }
function gain(a){ S.cash += a; S.q.prem += a; S.earned = (S.earned || 0) + a; }

function addClaim(name, desc, amount, line){
  const nc = {id:S.claimId++, name, desc, line:line || "property", amount:Math.max(25, Math.round(amount/5)*5), pat:40, max:40, stalls:0};
  ensureIntel(nc); S.claims.push(nc);
  if (!S.tipClaim){ S.tipClaim = true; toast("A broker just walked into The Room with a claim. Tap them, or open Claims."); }
}
function typicalClaim(){ return Math.max(25, Math.max(3, exposure()/volume())*Math.max(3.5, 20/(1 + 0.12*lv("sales"))/(0.8 + 0.2*S.diff))*0.55*(1-actRed())*claimSizeMult()*mixAvg("size")); }
function ensureIntel(c){
  if (c.sev != null) return;
  const r = c.amount / (typicalClaim()*(c.line && LINES[c.line] ? LINES[c.line].size/Math.max(0.3, mixAvg("size")) : 1));
  c.sev = r < 0.8 ? 1 : r < 1.25 ? 2 : 3;
  c.lp = Math.random() < Math.max(0.45, 0.75 - 0.05*(S.diff - 1)) ? rand(0.68, 0.98) : rand(0.05, 0.45);
  c.legit = Math.random() < c.lp;
  c.lit = rand(-0.08, 0.12);
  c.nz1 = rand(-1,1); c.nz2 = rand(-1,1);
}
function estCenter(p, nz, sp){ return clamp(p*100 + nz*sp/2, 0, 100); }
function legitEst(c){ ensureIntel(c); return estCenter(c.lp, c.nz1, intelSpread(lv("risk"))); }
function legitFactor(lp){ return Math.pow(clamp((lp - 0.3)/0.65, 0, 1), 1.5); }
function baseSue(c){ return clamp((0.02 + SEV_SUE[c.sev-1]*legitFactor(c.lp)*(0.85 + (c.lit || 0)))*(c.line && LINES[c.line] ? LINES[c.line].sue : 1) + 0.08*(c.stalls || 0), 0.02, 0.92); }
function suePct(c){ return Math.min(0.92, baseSue(c)*Math.pow(0.85, lv("legal"))*(0.9 + 0.1*S.diff)); }
function courtWin(c){ return c.legit ? clamp(0.85 - 0.06*lv("legal"), 0.4, 0.9) : clamp(0.15 - 0.02*lv("legal"), 0.03, 0.15); }
function estText(p, nz, sp){
  if (sp === 0) return Math.round(p*100) + "%";
  const ctr = estCenter(p, nz, sp);
  return `${Math.round(clamp(ctr - sp/2, 0, 100))}–${Math.round(clamp(ctr + sp/2, 0, 100))}%`;
}
function intelHtml(c){
  ensureIntel(c);
  const n = lv("risk");
  if (n <= 0) return `<p class="intel-hint">Build a Risk Dept to see how serious this is, whether it’s legit, and whether they’ll sue.</p>`;
  const sp = intelSpread(n);
  const lock = need => `<b class="lock">🔒 Risk level ${need}</b>`;
  const lc = estCenter(c.lp, c.nz1, sp), sc = estCenter(suePct(c), c.nz2, sp);
  return `<div class="intel">
    <div><span>Seriousness</span><b class="sev${c.sev}">${["Minor","Moderate","Severe"][c.sev-1]}</b></div>
    <div><span>Legit</span>${n >= 2 ? `<b class="${lc < 50 ? "bad" : "good"}">${estText(c.lp, c.nz1, sp)}</b>` : lock(2)}</div>
    <div><span>Sues if denied</span>${n >= 3 ? `<b class="${sc >= 35 ? "bad" : "good"}">${estText(suePct(c), c.nz2, sp)}</b>` : lock(3)}</div>
  </div>`;
}
function spawnClaim(){
  const inc = Math.max(3, exposure()*marketRate());
  const amt = inc*claimInterval()*0.55*rand(0.5,1.5)*(1-actRed())*claimSizeMult() / (S.buffs.surge > 0 ? 0.35 : 1) / marketRate();
  const mix = bookMix(), keys = Object.keys(mix); let line = "property";
  if (keys.length){ let r = Math.random()*keys.reduce((t, k) => t + mix[k]*LINES[k].freq, 0); for (const k of keys){ r -= mix[k]*LINES[k].freq; if (r <= 0){ line = k; break; } line = k; } }
  const lineAmt = amt*LINES[line].size;
  if (Math.random() < 0.10){ const n = pickFresh(NAMED, "recentNamed", 6); addClaim(n[0], n[1], lineAmt, line); }
  else addClaim(pickFresh(NAMES.concat(MORE_NAMES), "recentNm", 40), lineIncident(line), lineAmt, line);
}
