/* game/executives.js - part of Fine Print Syndicate. Bundled into one HTML file by build.js. */
function hasExec(id){ return !!(S.idleMode || (S.execs && S.execs[id])); }
function execCount(){ return EXECS.filter(x => hasExec(x.id)).length; }
function execRate(x){ return x.sal*((S.idleMode ? 0 : 0.4) + Math.max(0, baseIncome())*0.03); }
function execCost(){ let c = 0; for (const x of EXECS) if (hasExec(x.id)) c += execRate(x); return c; }
function execBuffer(){ return typicalClaim()*6 + capReq() + Object.keys(COVERS).reduce((a, k) => a + (S.cover[k] ? coverCost(k, income()*Q_LEN) : 0), 0); }
let apT = 0;
function autopilot(dt){
  apT += dt; if (apT < 0.5) return; apT = 0;
  if (hasExec("claims")){
    for (const c of [...S.claims]){
      if (c.max - c.pat < 10) continue;
      let act = lv("risk") >= 2 && legitEst(c) < 50 ? "deny" : "pay";
      if (act === "pay" && lv("risk") < 2 && !c.stalls && c.amount > typicalClaim()*1.3 && S.cash < typicalClaim()*4) act = "stall";
      if (act === "pay" && !canPay(c.amount)) act = c.stalls ? "deny" : "stall";
      if (S.idleMode && S.quarter > 3 && act !== "stall" && Math.random() < 0.15*Math.min(1, (S.quarter - 3)/10)) act = act === "pay" ? "deny" : (canPay(c.amount) ? "pay" : "deny");
      resolve(c, act, "exec");
    }
  }
  if (hasExec("cro")){
    for (const k of Object.keys(COVERS)){ const cost = coverCost(k, income()*Q_LEN); if (!S.cover[k] && S.quarter >= (S.idleMode ? 4 : 3) && S.cash > cost*4 && (!S.idleMode || Math.random() < 0.015)){ S.cash -= cost; discSpent += cost; S.cover[k] = true; toast(`Your Chief Risk Officer bought ${COVERS[k].name.toLowerCase()}.`); } }
    for (let k = S.lawsuits.length - 1; k >= 0; k--){ const l = S.lawsuits[k], cost = settleCost(l); if ((l.win != null ? l.win : 0.85) >= 0.5 && S.cash > cost*2){ spend(cost, "other"); S.lawsuits.splice(k, 1); toast(`Your Chief Risk Officer settled with ${l.name || "a former customer"} for ${fmt(cost)}.`); } }
  }
  if (hasExec("cco") && compGap() >= 0 && S.floors.length >= 3){
    const cf = S.floors.filter(f => f.type === "compliance" && f.level < MAXL).sort((a, b) => a.level - b.level)[0];
    if (compGap() > 0 || S.qt > 35){
      if (cf && S.cash - execBuffer() > upCost(cf)){ S.cash -= upCost(cf); discSpent += upCost(cf); cf.level++; rebuildWorkers(S.floors.indexOf(cf)); toast("Your Chief Compliance Officer upgraded Compliance."); }
      else if (!cf && S.floors.length < MAXF && S.cash - execBuffer() > buildCost()){ const c = buildCost(); S.cash -= c; discSpent += c; S.floors.push({type:"compliance", level:1, mode:"pay"}); rebuildWorkers(S.floors.length-1); toast("Your Chief Compliance Officer built a Compliance floor."); }
    }
  }
  if (hasExec("cfo")){
    const cn = cycleName(); let want = cn === "Hard market" ? 2 : (cn === "Soft market" && S.happy < 50) ? 0 : 1;
    if (S.idleMode){ if (S.bpCycle !== cn){ S.bpCycle = cn; S.bpPick = S.quarter > 4 && Math.random() < 0.3 ? Math.floor(Math.random()*4) : want; } want = S.bpPick; }
    if (priceIdx() !== want && (S.idleMode || priceIdx() !== 3)){ S.price = want; toast(`${S.idleMode ? "The board" : "Your CFO"} switched pricing to ${PRICES[want].name.toLowerCase()} for the ${cn.toLowerCase()}.${S.idleMode && want === 3 ? " Bold." : ""}`, want === 3 ? "bad" : ""); }
    if (S.divQ !== S.quarter && S.conf < 70 && S.qt > 45 && S.cash > divAmt() + execBuffer()){ const a = divAmt(); S.cash -= a; discSpent += a; S.divQ = S.quarter; S.conf = clamp(S.conf + 8, 0, 100); S.stock *= 1.03; toast(`Your CFO paid a ${fmt(a)} dividend to calm the board.`, "good"); }
    const run = runway();
    if (run != null && run < 30 && !S.loan){ const a = loanAmt(), tot = Math.round(a*1.25); S.cash += a; discSpent -= a; S.loan = {left:tot, per:Math.ceil(tot/4), interest:Math.round((tot - a)/4)}; toast(`Your CFO took out a ${fmt(a)} loan to keep the lights on.`, "bad"); }
  }
  if (S.idleMode) idleAutopilot();
  if (hasExec("coo") && (!S.idleMode || (S.cooCd = (S.cooCd || 0) - 0.5) <= 0)){
    const buffer = S.floors.length < 5 ? typicalClaim()*2 + capReq() : execBuffer()*1.5;
    const want = {sales:5, claims:2, marketing:1, actuary:1, legal:1, risk:1, it:1, ir:1};
    const boxes = S.floors.filter(f => f.type === "sales"), boxAvg = boxes.length ? boxes.reduce((a, f) => a + f.level, 0)/boxes.length : 0;
    const avgLvl = S.floors.reduce((a, f) => a + f.level, 0)/Math.max(1, S.floors.length);
    if (S.floors.length < MAXF && (S.floors.length < 3 || (boxAvg >= 2 && avgLvl >= 2.2)) && S.cash - buffer > buildCost()*1.3){
      const need = (isUnlocked("compliance") && S.floors.length >= 3 && compNeed() + 1 > compHave() && !S.floors.some(f => f.type === "compliance" && f.level < MAXL)) ? "compliance" : S.floors.filter(f => f.type === "sales").length < 3 ? "sales" : Object.keys(want).filter(t => isUnlocked(t)).map(t => [t, S.floors.filter(f => f.type === t).length/want[t]]).sort((a, b) => a[1] - b[1])[0][0];
      if (S.floors.length >= 3 && compNeed() + 1 > compHave() && need !== "compliance") { /* a Compliance upgrade is cheaper: leave it to the Compliance Officer this time */ }
      else {
      const odd = S.idleMode && S.quarter > 4 && need !== "compliance" && Math.random() < 0.12;
      const kind = odd ? pick(ORDER.filter(t => isUnlocked(t) && t !== need)) || need : need;
      const c = buildCost(); S.cash -= c; discSpent += c; S.floors.push({type:kind, level:1, mode:"pay"}); rebuildWorkers(S.floors.length-1); if (S.idleMode) S.cooCd = 20;
      toast(odd ? `The board built a ${TYPES[kind].name} nobody asked for. Someone’s nephew runs it.` : `Your COO built a new ${TYPES[kind].name}.`, odd ? "bad" : "");
      }
    } else {
      const f = S.floors.filter(f => f.level < MAXL && f.type !== "compliance").sort((a, b) => a.level - b.level || (a.type === "sales" ? 0 : 1) - (b.type === "sales" ? 0 : 1) || upCost(a) - upCost(b))[0];
      if (f && S.cash - buffer > upCost(f)*1.5){ const c = upCost(f); S.cash -= c; discSpent += c; f.level++; rebuildWorkers(S.floors.indexOf(f)); if (S.idleMode){ S.cooCd = 8; toast(`The board upgraded ${TYPES[f.type].name} to level ${f.level}.`); } }
    }
  }
}
function idleAutopilot(){
  const pk = PERKS.filter(x => !perk(x.id) && S.favour >= x.cost).sort((a, b) => a.cost - b.cost)[0];
  if (pk){ S.favour -= pk.cost; S.perks[pk.id] = true; }
  if (S.cash < -overdraft()*0.4 && S.quarter - S.lastCall >= 2){ S.cash += cashCallAmt(); S.stock = Math.max(0.5, S.stock*0.85); S.conf = clamp(S.conf - 12, 0, 100); S.lastCall = S.quarter; toast("The board made a cash call to keep things afloat.", "bad"); }
  for (const f of S.floors) if (f.type === "claims"){ if (lv("risk") >= 2) f.mode = "smart"; if (!f.lim) f.lim = 1; }
}
function execsHtml(){
  return `<h3 style="margin-top:14px">Executive team</h3>
    <p class="dim">Promotions unlock executives who run parts of the business on autopilot. Their pay scales with revenue, so autopilot costs margin. Hire or let go at any time.</p>
    ${EXECS.map(x => { const locked = S.rankIdx < x.rank, on = hasExec(x.id);
      return `<div class="action"><div><h3>${on ? "🤖 " : ""}${x.name}</h3><p>${x.desc} <i>${x.joke}</i> ${locked ? "" : `Pay: about ${fmtR(execRate(x))}/s.`}</p></div>
        ${locked ? `<button class="btn ghost" disabled>🔒 ${RANKS[x.rank].name}</button>` : on ? `<button class="btn ghost" data-act="exec:${x.id}:off">Let go</button>` : `<button class="btn green" data-act="exec:${x.id}:on">Hire</button>`}</div>`; }).join("")}`;
}
function offlineCheck(){
  if (!S.savedAt || S.over || !S.seen) return;
  const away = (Date.now() - S.savedAt)/1000;
  if (away < 120) return;
  const h = (S.profHist || []).filter(x => x > 0);
  const qProfit = h.length ? h.reduce((a, b) => a + b, 0)/h.length : 0;
  if (qProfit <= 0) return;
  const eff = Math.min(0.75, 0.15 + 0.1*execCount() + (lv("claims") ? 0.05 : 0));
  const quarters = Math.min(12, away/Q_LEN);
  const amt = Math.round(qProfit*quarters*eff);
  if (amt < 10) return;
  S.cash += amt; S.earned = (S.earned || 0) + amt; save();
  const hrs = Math.floor(away/3600), mins = Math.floor(away % 3600/60);
  openModal(`<h2>While you were away</h2>
    <p>You were gone for ${hrs ? hrs + "h " : ""}${mins}m. Your syndicate kept writing business and earned <b class="pos">${fmt(amt)}</b>.</p>
    <p class="dim">Away earnings are ${Math.round(eff*100)}% of your normal quarterly profit, for up to 12 quarters. ${execCount() < 6 ? "Every executive you hire adds 10%, up to 75%." : "Your full executive team is running things at 75%."}</p>
    <div class="closeRow"><button class="btn" data-act="close">Back to work</button></div>`);
}
